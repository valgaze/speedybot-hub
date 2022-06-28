import { InitBot, BotConfig } from './bot'
import {
  checkers,
  placeholder,
  typeIdentifier,
  makeRequest,
  peekFile,
  actions,
} from './common'

import { LocationAwareBot } from './location'
// Types
import {
  AA_Details,
  BotHandler,
  DETAILS,
  ENVELOPES,
  MessageDetails,
  MessageEnvelope,
  RequestTypes,
  RequestOps,
  SelfData,
  ToMessage,
  Card,
  MESSAGE_TRIGGER,
} from './payloads.types'

/**
 *  This is the root configuration object for your hub. Most important is "token" and that value should never be put into source code
 * 
 * 
 * 
 * - token: string; // bot token, make one here: https://developer.webex.com/my-apps/new
 * - debug: boolean; // show debug logs & report errors to chat if possible
 * - fallbackText: // text that display if user's client can't display Adaptive Cards (otherwise default message)
 * - location: function; // After user authorizes location will run this function with access to roomId & messageId
 * - validation: function // to run for incoming requests see below
 *
 * ### Validation
 * For validation, you can run whatever validation checks you want but ultimately need to finish with ```{ proceed: boolean }```
- https://github.com/webex/SparkSecretValidationDemo
- https://developer.webex.com/blog/using-a-webhook-secret
- https://developer.webex.com/blog/building-a-more-secure-bot

```ts
* async validate(request: Request) {
*    const signature = request.headers.get('X-Spark-Signature')
*    const res = {
*        proceed: true
*    }
*
*    if (signature && signature.length) {
*        const json = await request.json()
*        const cryptoValidate = (body:any, signature:any) => {
*            // use WebCrypto
*            // Use your secret to hash body
*            // and compare to signature
*            return true
*        }
*        res.proceed = cryptoValidate(json, signature)
*    }
*    return res
* }
* ```
**/
export type SpeedyConfig = {
  token: string
  debug?: boolean
  fallbackText?: string
  features?: {
    chips?: {
      disappearOnTop: boolean
    }
    camera?: {
      validExtensions: string[]
    }
  }
  location?($bot: LocationAwareBot): Promise<any> | void
  validate?(
    request: Request
  ): { proceed: boolean } | Promise<{ proceed: boolean }>
  locales?: {
    [localeName: string]: {
      [key: string]: any
    }
  }
}

type Globals = {
  config?: SpeedyConfig
  fallbackText: string
  personId: string
  roomId: string
}

export class SpeedybotHub<T = any> {
  globals: Globals = {
    roomId: '',
    personId: '',
    fallbackText:
      'Sorry, it appears your client does not support rendering Adaptive Cards',
  }

  API = {
    getMessageDetails: 'https://webexapis.com/v1/messages',
    getAttachmentDetails: 'https://webexapis.com/v1/attachment/actions',
    getMembershipDetails: 'https://webexapis.com/v1/memberships',
    getPersonDetails: 'https://webexapis.com/v1/people',
    sendMessage: 'https://webexapis.com/v1/messages',
    createWebhook: 'https://webexapis.com/v1/webhooks',
    deleteWebhook: `https://webexapis.com/v1/webhooks`,
    getWebhooks: 'https://webexapis.com/v1/webhooks',
    getSelf: 'https://webexapis.com/v1/people/me',
    deleteMessage: 'https://webexapis.com/v1/messages',
  }

  constants = {
    camera: '<@camera>',
    catchall: '<@catchall>',
    submit: '<@submit>',
    file: '<@fileupload>',
    nomatch: '<@nomatch>',
    reqTypes: {
      TEXT: 'TEXT',
      AA: 'AA',
      FILE: 'FILE',
    },
    errors: {
      placeholder: `ERROR: Placeholder token detected, you need to set a valid Bot Access token. 
If you need a token, see here: https://developer.webex.com/my-apps/new/bot`,
    },
  }

  _apiHeaders = {
    headers: {
      Authorization: `Bearer ${this.config.token}`,
    },
  }

  constructor(
    private config: SpeedyConfig,
    private handlers: BotHandler[],
    private env: T = {} as T
  ) {
    if (config.token === placeholder) {
      const error = this.constants.errors.placeholder
      throw new Error(error)
    }
  }

  /**
   * Cheap way to get content-dispoition header & content-type and get extension
   * @param url
   * @returns
   */
  public async peekFile(
    url: string
  ): Promise<{ fileName: string; type: string; extension: string }> {
    return peekFile(this.config.token, url)
  }
  async processIncoming(envelope: ENVELOPES, request: Request) {
    // TODO: break into more coherent smaller pieces w/o using lotta memory+space
    this.debug('##', envelope)

    // 1) Run validation (ie webhook secret) if present
    if (request) {
      if (this.config.validate && typeof this.config.validate === 'function') {
        const { validate } = this.config
        const { proceed } = await validate(request)
        if (!proceed) {
          return new Response('Request did not pass user-supplied validation', {
            status: 400,
          })
        }
      }
    }

    // 2) Fetch secured message data
    let reqType = typeIdentifier(envelope)
    const additionalInfo = (await this.getEnhancedDetails(
      envelope,
      reqType
    )) as MessageDetails

    // 3) Fetch room info
    const AssertMessage = envelope as MessageEnvelope
    const { personId, roomId, roomType } = AssertMessage.data
    this.globals.roomId = roomId

    // 4) For group spaces user writes @bot command args, strip out mention if group space. AA's do not report room status
    let textFlag =
      roomType === 'group' && additionalInfo.text
        ? additionalInfo.text.split(' ').slice(1).join(' ')
        : (additionalInfo.text && additionalInfo.text.toLowerCase()) || null

    const isHuman = await this.isHuman(personId)
    let useNoMatch = false
    if (envelope.data && isHuman) {
      let targets = [this.constants.catchall, this.constants.nomatch]

      // 5) Handle attachment actions
      if (reqType === 'AA') {
        const assertAADetails = additionalInfo as unknown as AA_Details
        // 5a) Speedybot "chips" secret sauce
        const isChip =
          assertAADetails.inputs && assertAADetails.inputs.chip_action
            ? true
            : false
        if (!isChip) {
          const isAction =
            assertAADetails.inputs && assertAADetails.inputs.action
              ? true
              : false

          if (isAction) {
            this.actionHandler(assertAADetails)
          } else {
            // Fall-through to normal submit handler
            // Don't need catchall or nomatch, just submit
            targets = [this.constants.submit]
          }
        } else {
          // Delete on button tap
          const disappear = this.config.features?.chips?.disappearOnTop
          if (disappear) {
            await this.deleteMessage(assertAADetails.messageId)
          }

          // Two tricks to make chips "invocable" (will attempt to find a matching handler)

          // 1) set reqType to 'TEXT' from 'AA'
          reqType = this.constants.reqTypes.TEXT as RequestTypes

          // 2) Set the "textFlag"
          textFlag = assertAADetails.inputs.chip_action.toLowerCase() as string
          targets.push(textFlag)
        }
      }

      if (reqType === 'FILE') {
        // Do a peek operation here
        // Since someboy'll need some weird format, extensible in root config.features.camera.validExtensions
        if ('files' in envelope.data) {
          const { files } = envelope.data
          const [url] = files as string[]
          // Do a peek
          const formats = this.config.features?.camera?.validExtensions || []
          const photos = formats.length
            ? ['png', 'jpg', 'jpeg', ...formats]
            : ['png', 'jpg', 'jpeg']

          const res = await this.peekFile(url)
          const { extension } = res
          if (photos.includes(extension)) {
            // There's a file and it's a photo
            targets.push(this.constants.camera)
          } else {
            targets.push(this.constants.file)
          }
        }
      }

      if (reqType === 'TEXT') {
        if (targets.indexOf(textFlag as string) === -1) {
          targets.push(textFlag as string)
        }
      }

      this.debug('TARGETS', targets)

      // Generate map of handlers, handle string/regex/list of strings/regexes, snip bot name in group mentions, etc
      const handlerStash = await this.buildStash(
        targets,
        this.handlers,
        reqType as RequestTypes,
        textFlag as string
      )

      const checkHandler = (botHandler: BotHandler) =>
        botHandler && typeof botHandler.handler == 'function'

      // Invoke
      let noMatchRef: null | BotHandler = null
      targets.forEach(async (target) => {
        const botHandler = handlerStash[target]
        if (target === textFlag && !checkHandler(botHandler)) {
          useNoMatch = true
        }

        if (target === this.constants.nomatch && checkHandler(botHandler)) {
          noMatchRef = botHandler
          return
        }

        if (checkHandler(botHandler)) {
          this.invokeHandler(
            botHandler,
            envelope,
            additionalInfo,
            reqType as RequestTypes,
            request
          )
        }
      })
      if (noMatchRef && useNoMatch) {
        this.invokeHandler(
          noMatchRef,
          envelope,
          additionalInfo,
          reqType as RequestTypes,
          request
        )
      }
    }
  }

  private generateHelp(): { helpText: string; label: string }[] {
    const res = this.handlers
      .filter(
        ({ hideHelp, helpText = '', keyword }) =>
          hideHelp !== true && helpText.length > 0
      )
      .map(({ keyword, helpText = '' }) => {
        let candidate = Array.isArray(keyword) ? keyword[0] : keyword
        return {
          label: typeof candidate === 'string' ? candidate : '{regex}',
          helpText,
        }
      })
    return res
  }

  private async invokeHandler(
    botHandler: BotHandler,
    envelope: ENVELOPES,
    additionalInfo: MessageDetails,
    reqType: RequestTypes,
    request: Request
  ) {
    const trigger = await this.buildTrigger(
      envelope,
      additionalInfo,
      reqType as RequestTypes
    )
    const BotConfig: BotConfig = {
      token: this.config.token,
      roomId: this.globals.roomId,
      url: request.url,
      fallbackText: this.globals.fallbackText,
      locales: this.config.locales ? this.config.locales : {},
      helpContent: this.generateHelp(),
      env: this.env,
    }
    const Bot = InitBot<typeof this.env>(BotConfig)
    await botHandler.handler(Bot, trigger as MESSAGE_TRIGGER)
  }

  private async getPersonDetails(personId: string) {
    const url = `${this.API.getPersonDetails}/${personId}`
    const res = await this.makeRequest(
      url,
      {},
      {
        method: 'GET',
      }
    )
    const json = res ? await res.json() : {}
    return json
  }

  private async buildTrigger(
    baseEnvelope: ENVELOPES,
    messageDetails: DETAILS,
    type: RequestTypes
  ) {
    // get person data up front
    const { personId } = messageDetails
    const personData = await this.getPersonDetails(personId)
    if (type === 'AA') {
      const AATrigger = {
        id: messageDetails.id,
        attachmentAction: messageDetails,
        personId: personId,
        person: personData,
      }
      return AATrigger
    } else {
      const AssertMessage = baseEnvelope as MessageEnvelope
      const AssertMessageDetails = messageDetails as MessageDetails
      let textFlag =
        AssertMessage.data.roomType === 'group' && AssertMessageDetails.text
          ? AssertMessageDetails.text.split(' ').slice(1).join(' ')
          : (AssertMessageDetails.text &&
              AssertMessageDetails.text.toLowerCase()) ||
            null
      if (!AssertMessageDetails.text) {
        if ('inputs' in messageDetails) {
          const { chip_action } = messageDetails.inputs
          if (textFlag != chip_action) {
            textFlag = chip_action
          }
        }
      }
      const Trigger = {
        type: 'message',
        id: AssertMessageDetails.id,
        message: AssertMessageDetails,
        args: AssertMessageDetails.text
          ? AssertMessageDetails.text.split(' ')
          : [],
        personId: personId,
        person: personData,
        text: textFlag,
      }
      // Handle group room scenario
      if (AssertMessageDetails.roomType === 'group' && Trigger['args'].length) {
        // In group rooms, return text includes bot @mention
        // if a group, slice off 1st element
        // Ain't pretty or elegant, but resolving this "here" is a big win
        // Another approach: https://github.com/WebexSamples/webex-node-bot-framework/blob/master/lib/framework.js#L1193-L1194
        const args = Trigger['args'].slice(1)
        Trigger['args'] = args
        Trigger['text'] = args.join(' ')
        // Adjust original message too
        // triggerPayload.message.html still will contain the rich markup for a mention
        Trigger.message.text = Trigger.text
      }
      return Trigger
    }
  }

  private async buildStash(
    targets: string[],
    handlers: BotHandler[],
    reqType: RequestTypes,
    textFlag: string
  ): Promise<{ [key: string]: BotHandler }> {
    const handlerStash = targets.reduce(
      (ack: { [key: string]: any }, val: string) => ((ack[val] = null), ack),
      {}
    )
    if (Array.isArray(handlers)) {
      const checkKeyword = (keyword: string | RegExp, handler: BotHandler) => {
        const lowered = typeof keyword === 'string' ? keyword.toLowerCase() : ''
        if (lowered in handlerStash) {
          handlerStash[lowered] = handler
        } else if (keyword instanceof RegExp) {
          const pass = keyword.test(textFlag)
          if (pass) {
            handlerStash[textFlag] = handler
          }
        }
      }
      handlers.forEach((handler) => {
        const { keyword } = handler
        if (typeof keyword === 'string' || keyword instanceof RegExp) {
          checkKeyword(keyword, handler)
        } else if (Array.isArray(keyword)) {
          const assertKW = keyword as (string | RegExp)[]
          assertKW.forEach((kw) => {
            checkKeyword(kw, handler)
          })
        }
      })
    } else if (typeof handlers === 'object') {
      targets.forEach((target) => {
        if (handlers[target]) {
          handlerStash[target] = handlers[target]
        }
      })
    }
    return handlerStash
  }

  async send<T = any>(payload: string | ToMessage | Card): Promise<T> {
    // will take a sting, Speedycard, or object & send it
    // will use global roomId by default unless specified in payload
    let body: ToMessage = {
      roomId: this.globals.roomId,
    }

    if (typeof payload === 'object' && 'roomId' in payload) {
      body.roomId = payload.roomId
    }

    if (typeof payload === 'string') {
      body.markdown = payload
      body.text = payload
    } else if (typeof payload === 'object') {
      const isCard = checkers.isCard(payload)
      if (isCard) {
        // attach adaptive card
        body = {
          ...body,
          markdown: this.globals.fallbackText,
          text: this.globals.fallbackText, // if no text/file/meetinId will error out
          attachments: [
            {
              contentType: 'application/vnd.microsoft.card.adaptive',
              content:
                'render' in payload && typeof payload.render === 'function'
                  ? payload.render()
                  : payload,
            },
          ],
        }
      } else {
        body = {
          ...body,
          ...payload,
        }
      }
    }

    const res = (await makeRequest(this.API.sendMessage, body, {
      method: 'POST',
      'content-type': 'application/json',
      token: this.config.token,
    })) as Response
    const json = await res.json()
    return json as T
  }

  private async deleteMessage(messageId: string) {
    const url = `${this.API.deleteMessage}/${messageId}`
    const res = await this.makeRequest(
      url,
      {},
      {
        method: 'DELETE',
      }
    )
    return res
  }

  public async delay(duration = 100) {
    return new Promise((resolve) => setTimeout(resolve, duration))
  }

  private async isHuman(personId: string, fullPayload = false) {
    const data = await this.getSelf()
    const { id } = data
    if (fullPayload) {
      return data
    }
    return id !== personId
  }

  private async getSelf(): Promise<SelfData> {
    const url = this.API.getSelf
    const res = (await this.makeRequest(
      url,
      {},
      {
        method: 'GET',
      }
    )) as Response
    const json = (await res.json()) as SelfData
    return json
  }

  public async makeRequest(url: string, body: any, opts: RequestOps = {}) {
    const defaultConfig = {
      method: 'POST',
      'content-type': 'application/json;charset=UTF-8',
      raw: false,
    }
    const contentType = opts['content-type']
      ? opts['content-type']
      : defaultConfig['content-type']
    const additionalHeaders = opts.headers ? opts.headers : {}
    const init: {
      method: string
      headers: any
      body?: any
      [key: string]: any
    } = {
      method: opts.method ? opts.method : defaultConfig.method,
      headers: {
        'content-type': contentType,
        Authorization: `Bearer ${this.config.token}`,
        ...additionalHeaders,
      },
    }
    if (opts.method === 'POST') {
      init.body = opts.raw ? body : JSON.stringify(body)
    }

    try {
      const response = await fetch(url, init)
      return response
    } catch (e) {
      console.log('ERR#', e)
    }
  }

  async getEnhancedDetails(
    envelope: ENVELOPES,
    type: RequestTypes | null
  ): Promise<DETAILS> {
    let url = this.API.getMessageDetails
    if (type === 'AA') {
      url = this.API.getAttachmentDetails
    }

    // else if (type === 'text' || 'file') {
    //     // file is same as text, no opt
    // }
    const { data } = envelope
    const { id } = data
    url = `${url}/${id}`
    const init = {
      method: 'GET',
    }
    const res = (await this.makeRequest(url, {}, init)) as Response
    const json = await res.json()
    return json as DETAILS
  }

  private debug(...payload: any): void {
    if (this.config.debug) {
      console.log.apply(console, payload as [any?, ...any[]])
    }
  }

  public async actionHandler(details: AA_Details) {
    const root = details.inputs
    const { action = '' } = root
    if (action === actions.location_abort) {
      // 1) delete reply
      const { messageId } = details
      await this.deleteMessage(messageId)

      // 2) delete card
      const { messageId: cardId } = details.inputs
      await this.deleteMessage(cardId)
    }
    if (action === actions.delete_message) {
      const { messageId } = details.inputs
      await this.deleteMessage(messageId)
    }

    if (action === actions.delete_stash_card) {
      const { messageId } = details
      await this.deleteMessage(messageId)
    }

    // others...
  }
}

import { SpeedyCard } from './cards'
import {
  makeRequest as CoreMakerequest,
  checkers,
  API,
  pickRandom,
  fillTemplate,
} from './common'
import {
  ToMessage,
  Card,
  SelfData,
  MessageData,
  MESSAGE_TRIGGER,
  FILE_TRIGGER,
} from './payloads.types'
export type BotConfig = {
  roomId: string
  fallbackText?: string
  token: string
  locales?: {
    [localeName: string]: {
      [key: string]: any
    }
  }
  helpContent?: { helpText: string; label: string }[]
  url?: string
}
export interface AttachmentData {
  [key: string]: any
}
export type AbbreviatedSpeedyCard = {
  title: string
  subTitle: string
  image: string
  url: string
  urlLabel: string
  data: AttachmentData
  chips: (string | { label: string; keyword?: string })[]
  table: string[][] | { [key: string]: string }
  choices: (string | number)[]
}

export class BotRoot {
  private helpContent: { helpText: string; label: string }[] = []
  private roomId = ''
  private fallbackText =
    'Sorry, it appears your client does not support rendering Adaptive Cards, see here for more info: https://developer.webex.com/docs/api/guides/cards'
  private token = ''
  public meta = {
    url: '',
  }

  public locales = {}
  private API = API

  constructor(
    public config: BotConfig,
    private makeRequest: typeof CoreMakerequest = CoreMakerequest
  ) {
    this.roomId = config.roomId
    this.token = config.token

    if (config.locales) {
      this.locales = config.locales
    }
    if (config.url) {
      this.meta.url =
        config.url.slice(-1) === '/' ? config.url : `${config.url}/`
    }
    if (config.fallbackText) {
      this.fallbackText = config.fallbackText
    }
    if (config.helpContent && config.helpContent.length) {
      this.helpContent = config.helpContent
    }
  }

  /**
   * Grab a random element from a list
   * ```ts
      const list = [1, 2, 3];
      const $bot = { pickRandom(x: any[]) {} };
      $bot.pickRandom(list); // 2
   * ```  
   */
  public pickRandom(list: any[] = []) {
    return pickRandom(list)
  }

  /**
   * Grab a random element from a list
   * ```ts
      const list = ['hi, 'hello', 'yo'];
      $bot.sendRandom(list); // 'hello'
   * ```  
   */
  public sendRandom(list: any[] = []) {
    return this.send(this.pickRandom(list))
  }

  /**
   * Fill in a template (usually used by sendTemplate)
   * ```ts
   *   const utterances = ['Howdy $[name], here's $[flavor]', '$[name], here's your $[flavor] ice cream']
   *   const template = { name: 'Joe', flavor: 'strawberry' }
   *   const response = $bot.fillTemplate(utterances, template) // "Joe, here's your strawberry ice cream"
   *
   *
   *   const response2 = $bot.fillTemplate('Hi there the time is $[date]', {date: new Date().toString()})
   * ```
   */
  private fillTemplate(utterances: string[], template: any) {
    return fillTemplate(utterances, template)
  }

  /**
   * Send a template
   * ```ts
   *  const utterances = ['Howdy $[name], here's $[flavor]', '$[name], here's your $[flavor] ice cream']
   *  const template = { name: 'Joe', flavor: 'strawberry' }
   *  $bot.sendRandom(utterances, template) // "Joe, here's your strawberry ice cream"
   *
   * ```
   */
  public sendTemplate(utterances: string[], template: any = {}) {
    const res = this.fillTemplate(utterances, template)
    return this.send(res)
  }

  /**
   * Send a url wrapped in a card
   * If analytics are enabled, will append url
   * @param url
   *
   */
  public async sendURL(url: string, title?: string, buttonTitle = 'Go') {
    const card = new SpeedyCard()
    if (title) {
      card.setTitle(title).setUrl(url, buttonTitle)
    } else {
      card.setSubtitle(url).setUrl(url, buttonTitle)
    }
    this.send(card)
  }

  /**
   * Reach an api that returns JSON (get)
   *
   * ```ts
   * {
   *  keyword: 'bingo',
   *  async handler($bot) {
   *    const adviceResponse = await $bot.api('https://api.adviceslip.com/advice')
   *    const adviceText = $bot.lookUp(adviceResponse, 'slip.advice')
   *    $bot.send(`Here' some advice: ${adviceText}`)
   *  }
   * }
   * ```
   *
   *
   */
  public async api<T = any>(
    request: string | Request,
    requestInitr?: Request | RequestInit | undefined
  ): Promise<T> {
    const res = await fetch(request, requestInitr)
    try {
      const json = await res.json()
      return json as T
    } catch (e) {
      return {} as T
    }
  }

  /**
   *
   * Send a 1-1/DM message to a user based on their email or personId
   *
   *
   * ```ts
   * {
   *  keyword: 'biscotti',
   *  async handler($bot, trigger) {
   *
   *  $bot.dm('username@domain.com', 'Here is a secret message')
   *
   *  $bot.dm('aaa-bbb-ccc-ddd-eee', $bot.card({title:'biscotti', subTitle:'Is it biscotti or biscotto?', chips:['biscotti','biscotto']}))
   *
   *  }
   * }
   * ```
   *
   */
  public async dm(
    personIdOrEmail: string,
    message: string | SpeedyCard | string[],
    fallback?: string
  ): Promise<Response> {
    const payload: ToMessage = {
      text: this.fallbackText,
    }
    if (checkers.isEmail(personIdOrEmail)) {
      payload['toPersonEmail'] = personIdOrEmail
    } else {
      payload['toPersonId'] = personIdOrEmail
    }

    if (typeof message === 'string') {
      payload['markdown'] = message
      payload['text'] = message
    }

    const isCard = checkers.isCard(message)

    if (isCard) {
      if (fallback) {
        payload['text'] = fallback
      }
      const cardPayload = [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          content:
            typeof message !== 'string' &&
            'render' in message &&
            typeof message.render === 'function'
              ? message.render()
              : message,
        },
      ]
      payload['attachments'] = cardPayload
    }

    const res = await this.makeRequest(this.API.sendMessage, payload, {
      method: 'POST',
      'content-type': 'application/json',
      token: this.token,
    })
    return res
  }
  /**
   * $bot.send, core "workhorse" utility that can send whatever you throw at it
   * roomId by default is whatever is bound to bot instance
   *
   * ```ts
   * {
   *  keyword: 'bingo',
   *  async handler($bot, trigger) {
   *  // Send a simple string
   *  $bot.send('Send a string')
   *
   *  // Send a card: https://developer.webex.com/docs/api/guides/cards
   *  $bot.send($bot.card({title:'My special card', subTitle:'My great subtitle', chips:['ping','pong','hi']}))
   *  }
   * }
   * ```
   *
   */
  async send<T = any>(payload: string | ToMessage | Card): Promise<T> {
    let body: ToMessage = {}

    if (typeof payload !== 'string') {
      if ('toPersonId' in payload) {
        body['toPersonId'] = payload.toPersonId
      }

      if ('toPersonEmail' in payload) {
        body['toPersonEmail'] = payload.toPersonEmail
      }

      if ('roomId' in payload) {
        body['roomId'] = this.roomId
      }

      if (
        !('roomId' in payload) &&
        !('toPersonEmail' in payload) &&
        !('toPersonId' in payload)
      ) {
        body['roomId'] = this.roomId
      }
    }

    if (typeof payload === 'string') {
      body['roomId'] = this.roomId
      body.markdown = payload
      body.text = payload
    } else if (typeof payload === 'object') {
      const isCard = checkers.isCard(payload)
      if (isCard) {
        // attach adaptive card
        body = {
          ...body,
          markdown: this.fallbackText,
          text: this.fallbackText,
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
    const res = await this.makeRequest(this.API.sendMessage, body, {
      method: 'POST',
      'content-type': 'application/json',
      token: this.token,
    })
    const json = await res.json()
    return json as T
  }

  /**
   *
   * Convenience helper that creates a SpeedyCard
   *
   *
   * ```ts
   * {
   *  keyword: 'bingo',
   *  async handler($bot, trigger) {
   *   const cardData = $bot.card({
   *     title: "Speedybot Hub",
   *     subTitle: "Sign the paperwork",
   *     chips: ["ping", "pong", "hi", "files"],
   *     image: "https://i.imgur.com/LybLW7J.gif",
   *     url: "https://github.com/valgaze/speedybot-hub"
   *   });
   *   $bot.send(cardData);
   *
   *  }
   * }
   *
   * ```
   */
  card(config: Partial<AbbreviatedSpeedyCard> = {}): SpeedyCard {
    const card = new SpeedyCard()
    const {
      title = '',
      subTitle = '',
      image = '',
      url = '',
      urlLabel = '',
      data = {},
      chips = [],
      table = [],
      choices = [],
    } = config

    if (title) {
      card.setTitle(title)
    }

    if (subTitle) {
      card.setSubtitle(subTitle)
    }

    if (image) {
      card.setImage(image)
    }

    if (url) {
      card.setUrl(url)
    }

    if (urlLabel) {
      card.setUrlLabel(urlLabel)
    }

    if (Object.keys(data).length) {
      card.setData(data)
    }

    if (chips.length) {
      card.setChips(chips)
    }

    if (choices.length) {
      card.setChoices(choices)
    }

    if (table) {
      if (Array.isArray(table) && table.length) {
        card.setTable(table)
      } else {
        if (Object.entries(table).length) {
          card.setTable(table)
        }
      }
    }
    return card
  }

  /**
   *
   * Get bot's meta data
   *
   * ```ts
   * {
   *  keyword: 'bingo',
   *  async handler($bot) {
   *    const botData = await $bot.getSelf()
   *    $bot.send(`Hi I'm a bot & my name is ${botData.displayName}`)
   *  }
   * }
   *
   * ```
   *
   *
   */
  public async getSelf(): Promise<SelfData> {
    const url = this.API.getSelf
    const res = (await this.makeRequest(
      url,
      {},
      {
        token: this.token,
        method: 'GET',
      }
    )) as Response
    const json = (await res.json()) as SelfData
    return json
  }

  public async deleteMessage(messageId: string) {
    const url = `${this.API.deleteMessage}/${messageId}`
    const res = await this.makeRequest(
      url,
      {},
      {
        token: this.token,
        method: 'DELETE',
      }
    )
    return res
  }

  /**
   * Location Authorizer
   * Ask the user for access to their location, if they provide permission run location authorizer
   *
   * NOTE: This location data is deliberately imprecise-- the best you can expect is to know if
   * it is light/dark outside the user's location, timezone, country, etc
   *
   * NOTE: this may have compliance implications for your team/organization
   *
   * ```ts
   * {
   *  keyword: 'bingo',
   *  async handler(bot, trigger) {
   *    $bot.locationAuthorizer(trigger)
   *  }
   * }
   */
  public async locationAuthorizer(
    trigger: MESSAGE_TRIGGER | FILE_TRIGGER,
    message?: string,
    labels = { yes: '✅ Allow', no: '❌ Disallow' }
  ) {
    const { displayName } = await this.getSelf()

    // Sneak'ily using reply message as the "state", if doesn't exist don't allow
    const rootMessage: ToMessage = {
      text: `'${displayName}' is requesting access to limited location data (country, timezone, city, ) in order to perform that action`,
    }

    // if ('message' in trigger && 'id' in trigger.message) {
    //   rootMessage['parentId'] = trigger.message.id
    // }

    const { id } = await this.send(rootMessage)
    const url = `${this.meta.url}location?roomId=${trigger.message.roomId}&messageId=${id}`
    this.send(
      this.card({
        title: message
          ? message
          : `'${displayName}' wants to use your location, allow?`,
      })
        .setUrl(url, labels.yes)
        .setData({
          messageId: id,
          action: 'location_abort',
        })
        .setButtonLabel(labels.no)
    )
  }

  public async getFile(
    url: string,
    opts: {
      responseType?: 'arraybuffer' | 'json'
    } = {}
  ) {
    const res = await this.makeRequest(
      url,
      {},
      {
        method: 'GET',
        token: this.token,
      }
    )
    const type = res.headers.get('content-type') as string
    const contentDispo = res.headers.get('content-disposition') as string
    const fileName = contentDispo.split(';')[1].split('=')[1].replace(/\"/g, '')
    const extension = fileName.split('.').pop() || ''
    // data could be binary if user needs it
    const shouldProbablyBeArrayBuffer =
      (!type.includes('json') && !type.includes('txt')) ||
      type.includes('image')
    let data: ArrayBuffer | Response | {} = res
    if (opts.responseType === 'arraybuffer' || shouldProbablyBeArrayBuffer) {
      try {
        data = await res.arrayBuffer()
      } catch (e) {
        // failed, fallback
        data = {}
      }
    } else {
      // should we not presume json?
      data = await res.json()
    }

    let markdownSnippet = `***No markdown preview available for ${type}***`
    const payload = {
      fileName,
      extension,
      type,
      data,
      markdownSnippet:
        type === 'application/json' ||
        (typeof data === 'string' && data.length < 900)
          ? this.snippet(data)
          : markdownSnippet,
    }
    return payload
  }

  public generateHelp(): { helpText: string; label: string }[] {
    return this.helpContent
  }

  private generateFileName() {
    const rando = () => `${Math.random().toString(36).slice(2)}`
    return `${rando()}_${rando()}`
  }

  private handleExtension(input = '') {
    const hasDot = input.indexOf('.') > -1
    let fileName = ''
    const [prefix, ext] = input.split('.')
    if (hasDot) {
      if (!prefix || prefix === '*') {
        // '.json' case, generate prefix
        fileName = `${this.generateFileName()}.${ext}`
      } else {
        // 'a.json' case, pass through
        fileName = input
      }
    } else {
      // 'json' case, generate prefix, add .
      fileName = `${this.generateFileName()}.${prefix}`
    }
    return fileName
  }

  /**
   *
   *
   * Create a file and fill it with the data you provide
   *
   * At minimum, provide the file data & desired file extension
   *
   * `` `ts
   * {
   *  keyword: 'bingo',
   *  async handler($bot) {
   *    const myData = { a: 1, b: 2, c: [1,2,3,'hello', 'bonjour]}
   *    $bot.sendDataAsFile(myData, 'json')
   *  }
   * }
   *
   * ```
   */
  async sendDataAsFile(
    data: any,
    extensionOrFileName: string,
    contentType = null,
    textLabel?: string,
    overrides: {
      toPersonId?: string
      toPersonEmail?: string
      roomId?: string
    } = {}
  ) {
    if (!extensionOrFileName) {
      throw new Error(
        `$(bot).sendDataAsFile: Missing filename/extension parameter, ex "myfile.png" or "*.png"`
      )
    }
    let finalContentType: string | null = contentType
    if (!finalContentType) {
      finalContentType = this.guessContentType(extensionOrFileName)
      if (!finalContentType) {
        throw new Error(
          `$(bot).sendDataAsFile: Missing 'content-type' parameter, ex "image/png"`
        )
      }
    }
    const fullFileName = this.handleExtension(extensionOrFileName)
    const formData = new FormData()
    const { toPersonId = null, toPersonEmail = null, roomId = null } = overrides
    const label = toPersonId
      ? 'toPersonId'
      : toPersonEmail
      ? 'toPersonEmail'
      : 'roomId'
    const destinationValue = toPersonId
      ? toPersonId
      : toPersonEmail
      ? toPersonEmail
      : roomId || this.roomId

    const isJSON =
      data && typeof data === 'object' && finalContentType.includes('json')
    formData.append(
      'files',
      new Blob([isJSON ? JSON.stringify(data, null, 2) : data], {
        type: finalContentType,
      }),
      fullFileName
    )
    // formData.append('roomId', this.roomId) // handled w/ label/desintation
    formData.append(label, destinationValue)
    formData.append('text', textLabel || ' ')

    const myHeaders = new Headers()
    myHeaders.append('Authorization', `Bearer ${this.token}`)
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formData,
    }
    const res = await fetch(API.sendMessage, requestOptions)
    return res
  }

  private guessContentType(extensionOrFileName: string) {
    // Most users probably  won't know/care about content-types, attempt to guess it from
    // file-extension if explicit content-type isn't
    const hasDot = extensionOrFileName.indexOf('.') > -1
    let extension = ''
    const pieces = extensionOrFileName.split('.')
    const hasMultipleDots = pieces.length > 2 // Little trick: if only one dot, there should only be 2 elements
    const [prefix, ext] = pieces
    if (hasDot) {
      // ".png"
      // "a.png"
      // "*.png"
      if (!prefix || prefix === '*') {
        extension = ext
      }
      // a.b.c.png
      if (hasMultipleDots) {
        // last piece will be extension
        extension = pieces.pop() as string
      }
    } else {
      // "png"
      extension = prefix
    }

    // ~<3 17 May 20222 @ 7:30am: This nightmare chart was filled-in by GPT3 & saved a bunch of time
    // At minimum, support these file types (per https://developer.webex.com/docs/basics)
    // ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'jpg', 'jpeg', 'bmp', 'gif', 'png']
    // But also definitely also want: html, txt, csv,
    const mapping: { [key: string]: string } = {
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      bmp: 'image/bmp',
      gif: 'image/gif',
      png: 'image/png',
      txt: 'text/plain',
      csv: 'text/csv',
      html: 'text/html',
      json: 'application/json',
      '*': 'application/octet-stream', // #gbogh
      mp3: 'audio/mpeg',
      mp4: 'video/mp4',
      mpeg: 'video/mpeg',
      mpkg: 'application/vnd.apple.installer+xml',
      vf: 'application/json', // voiceflow
    }
    const res = mapping[extension] || null
    return res
  }

  /**
   * Send a message with a reply
   *
   * Restrictions :(
   * - Only 1st message can be a card
   * - Replies can only be strings
   * @param thread
   * ex
   * $bot.thread([$bot.card().setTitle('hello world!').setChips(['a','b','c']), 'Pick one of the above!'])
   *
   */
  public async thread(
    thread: [string | SpeedyCard, ...Array<string | ToMessage>]
  ) {
    let [root, ...messages] = thread

    const { id: parentId } = await this.send<MessageData>(root)
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]
      let msgObj: ToMessage = {
        parentId,
      }
      if (typeof msg === 'string') {
        msgObj['markdown'] = msg
        msgObj['text'] = msg
      }
      if (typeof msg === 'object') {
        msgObj = {
          ...msgObj,
          ...(msg as object),
        }
      }
      this.send<MessageData>(msgObj)
    }
  }

  /**
   * Translate a string based on provided locale config
   *
   * ```ts
   * // locale data (gets specified into Speedybot-hub config)
   * const locales = {
   *  en: {
   *    greetings: {
   *      welcome: 'Hello!!'
   *    }
   *  },
   *  es: {
   *    greetings: {
   *      welcome: 'hola!!'
   *    }
   *  },
   *  cn: {
   *    greetings: {
   *      welcome: '你好'
   *    }
   *  }
   * }
   *
   *
   *
   * {
   *  keyword: 'bingo',
   *  handler($bot) {
   *    const eng = $bot.translate('en', 'greetings.welcome')
   *    const esp = $bot.translate('es', 'greetings.welcome')
   *    const chn = $bot.translate('cn', 'greetings.welcome')
   *    $bot.send(`${eng}, ${esp}, ${chn}`k)
   *  }
   * }
   *
   * ```
   *
   */
  public translate(
    locale: string,
    lookup: string,
    template = {},
    fallback = ''
  ) {
    const selectedLocale =
      this.locales[locale as keyof typeof this.locales] || {}
    const content = this.lookUp(selectedLocale, lookup, fallback)
    if (Object.keys(template)) {
      return this.fillTemplate(content, template)
    } else {
      return content
    }
  }

  /**
   * Provide a URL but it gets returned as a file
   *
   * Filetypes: 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'jpg', 'jpeg', 'bmp', 'gif', 'png'
   * See more info here: https://developer.webex.com/docs/basics
   *
   */
  public sendDataFromUrl(url: string, fallbackText = ' ') {
    return this.send({
      files: [url],
      text: fallbackText,
    })
  }

  public log(...payload: any): void {
    console.log.apply(console, payload as [any?, ...any[]])
  }

  public snippet(data: any, dataType = 'json') {
    const msg = `
\`\`\`${dataType}
${dataType === 'json' ? JSON.stringify(data, null, 2) : data}
\`\`\``
    return msg
  }
  /**
   * Clear the screen on desktop clients (useful for demos)
   *
   * ```ts
   * {
   *  keyword: 'bingo',
   *  handler($bot) {
   *    $bot.say('Clearing screen...')
   *    $bot.clearScreen()
   *  }
   * }
   * ```
   */
  public async clearScreen(repeatCount = 50) {
    const newLine = '\n'
    const repeatClamp = repeatCount > 7000 ? 5000 : repeatCount // 7439 char limit
    const clearScreen = `${newLine.repeat(repeatClamp)}`
    const payload = {
      markdown: clearScreen,
      text: clearScreen,
    }
    this.send(payload)
  }

  /**
   * Display a snippet of nicely-formatted
   * JSON data or code-snippet to the user
   *
   * ```ts
   * {
   *  keyword: 'bingo',
   *  async handler($bot) {
   *    const specialData = {a:1, b:2, c: [1,2,3]}
   *    $bot.sendJSON(specialData)
   *  }
   * }
   * ```
   *
   */
  public sendJSON<T = any>(data: T, label?: string) {
    return this.sendSnippet(data as unknown as object, label, 'json')
  }

  /**
   * Display a snippet to the user
   *
   * ```ts
   * {
   *  keyword: 'bingo',
   *  async handler($bot) {
   *    const specialData = {a:1, b:2, c: [1,2,3]}
   *    $bot.sendSnippet(specialData)
   *  }
   * }
   * ```
   *
   *
   */
  async sendSnippet(
    data: string | object,
    label = '',
    dataType = 'json',
    fallbackText?: string
  ): Promise<void> {
    let markdown
    if (dataType === 'json') {
      markdown = this.snippet(data)
    } else {
      markdown = this.snippet(data, 'html')
    }
    if (label) {
      markdown = label + ' \n ' + markdown
    }
    return this.send({
      roomId: this.roomId,
      markdown,
      text: fallbackText ? fallbackText : this.fallbackText,
    })
  }

  /**
   *
   * Will return a URL which can be intercepted
   * and "tracked"
   *
   *
   */
  public makeLink(url: string): string {
    return `${this.meta.url}/${url}`
  }

  public buildHelp() {}

  /**
   * Traverse a property lookup path on a object
   * fallback to a value (if provided) whenever
   * path is invalid
   *
   *
   * ```ts
   * {
   *  keyword: 'bingo',
   *  async handler($bot) {
   *    const myData = {a:1,b:2,c:{d:3}}
   *    const res = $bot.lookUp(myData, 'a.b.c.d', 'fallback') // 3
   *    const fail = $bot.lookUp(myData, 'a.b.ce.e.f.g', 'fallback') // 'fallback'
   *  }
   * }
   *
   *
   */
  public lookUp(locale: any, lookup = '', fallback?: string) {
    let res = locale
    lookup.split('.').forEach((k) => {
      if (res) {
        res = res[k]
      } else {
        res = fallback
      }
    })
    return res ? res : fallback
  }

  //Aliases
  /**
   * Legacy alias for $bot.send
   *
   *
   */
  public async say<T = any>(
    payload:
      | string
      | ToMessage
      | Card
      | { roomId: string; [key: string]: string | number | any }
  ): Promise<T> {
    return this.send(payload)
  }

  /**
   * Legacy alias for $bot.sendCard
   *
   *
   */
  public async sendCard<T = any>(payload: Card): Promise<T> {
    return this.send(payload)
  }
}

export function InitBot(
  config: BotConfig,
  makeRequest: typeof CoreMakerequest = CoreMakerequest
) {
  return new BotRoot(config)
}

/**
 *
 * Bot instance to handle incoming webhooks. The basic is receive an incoming webhook, process the data and if necessary dispatch an alert to a person and/or a room (group of persons)
 *
 * Your Hub (under src/index.ts) can specify "hooks" which handle incoming webhooks and
 * WebhookBot will let you dispatch alert messages to spaces or DM's to people
 *
 * ```typescript
 *
 * export default {
 *  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
 *    const hooks: Hooks = {
 *     '/incoming_route': {
 *       async handler(request, env, ctx) {
 *         const BotConfig: Partial<BotConfig> = {
 *           token: config.token,
 *           url: request.url,
 *           helpContent: [],
 *         }
 *         const $bot = WebhookBot(BotConfig)
 *         // send a message to a room
 *         $bot.sendRoom('__PUT_ROOM_ID_HERE', 'Some great message or card')
 *
 *         //Send a card
 *         $bot.sendRoom('__PUT_ROOM_ID_HERE',$bot.card({title: 'hi there', subtitle: 'here is a subittle', chips: ['a','b','c']}))
 *
 *         const data = await request.data()
 *
 *         $bot.DM('username@email.com', `This was just posted to /incoming_route: ${JSON.stringify(data, null, 2)}`)
 *       },
 *     }
 *    }
 * }
 *
 * ```
 */
export function WebhookBot(
  config: Partial<BotConfig>,
  makeRequest: typeof CoreMakerequest = CoreMakerequest
) {
  const inst = new BotRoot(config as BotConfig) // skip roomId & friends
  // Restrict to smaller subset
  return {
    snippet(data: any, dataType: string) {
      return inst.snippet(data, dataType)
    },
    sendRoom(roomId: string, message: string | SpeedyCard | string[]) {},
    sendRoomDataAsFile(
      roomId: string,
      data: any,
      extensionOrFileName: string,
      contentType = null,
      textLabel?: string,
      overrides: {
        toPersonId?: string
        toPersonEmail?: string
      } = {}
    ) {
      let payload = { roomId }
      return inst.sendDataAsFile(
        data,
        extensionOrFileName,
        null,
        undefined,
        payload
      )
    },
    dmDataAsFile(
      personIdOrEmail: string,
      data: any,
      extensionOrFileName: string,
      contentType = null,
      textLabel?: string,
      overrides: {
        toPersonId?: string
        toPersonEmail?: string
      } = {}
    ) {
      let payload = {}
      const isEmail = checkers.isEmail(personIdOrEmail)
      if (isEmail) {
        payload = { toPersonEmail: personIdOrEmail }
      } else {
        payload = { toPersonId: personIdOrEmail }
      }
      return inst.sendDataAsFile(
        data,
        extensionOrFileName,
        null,
        undefined,
        payload
      )
    },
    dm(
      personIdOrEmail: string,
      message: string | SpeedyCard | string[],
      fallback?: string | undefined
    ): Promise<Response> {
      return inst.dm(personIdOrEmail, message)
    },
    card(config?: Partial<AbbreviatedSpeedyCard>) {
      return inst.card(config)
    },
  }
}

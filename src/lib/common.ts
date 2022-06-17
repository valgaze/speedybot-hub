export const API = {
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

import { SpeedyCard } from './cards'
export const placeholder = '__REPLACE__ME__'
import { ENVELOPES, RequestTypes } from './payloads.types'

/**
 * Ingest incoming webhook envelope, determine RequestType
 * @param payload
 *
 *
 * @returns
 */
export const typeIdentifier = (payload: ENVELOPES): RequestTypes | null => {
  let type = null
  if (payload.resource === 'messages') {
    if ('files' in payload.data && payload.data.files?.length) {
      const { files = [] } = payload.data
      if (files && files.length) {
        type = 'FILE'
      }
    } else {
      type = 'TEXT'
    }
  }
  if (payload.resource === 'attachmentActions') {
    type = 'AA'
  }

  if (payload.resource === 'memberships') {
    if (payload.event === 'deleted') {
      type = 'MEMBERSHIP:REMOVE'
    }
    if (payload.event === 'created') {
      type = 'MEMBERSHIP:ADD'
    }
  }
  return type as RequestTypes
}

export const checkers = {
  isSpeedyCard(input: SpeedyCard | object): boolean {
    return (
      typeof input === 'object' &&
      'render' in input &&
      typeof input.render === 'function'
    )
  },
  isCard(cardCandidate: any | SpeedyCard): boolean {
    if (this.isSpeedyCard(cardCandidate)) return true
    const stringifiedPayload = JSON.stringify(cardCandidate)
    const isCard =
      stringifiedPayload.includes('AdaptiveCard') &&
      stringifiedPayload.includes('$schema') &&
      stringifiedPayload.includes('version')
    return isCard
  },
  isEmail(candidate: string) {
    // Only really care about joe@joe.com joe@joe.joe.com joe@a.io
    // Should probably get a Regex @ some point... // https://fightingforalostcause.net/content/misc/2006/compare-email-regex.php
    const res = candidate.includes('@') && candidate.includes('.')
    return res
  },
}

export type RequestOps = {
  'content-type'?: string
  method?: string
  headers?: any
  raw?: boolean
  [key: string]: any
}

// Workhorse makeRequest w/ fetch, can be stubbed for testing
export const makeRequest = async (
  url: string,
  body: any,
  opts: RequestOps = {}
) => {
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
      Authorization: `Bearer ${opts.token}`,
      ...additionalHeaders,
    },
  }
  if (opts.method === 'POST') {
    init.body = opts.raw ? body : JSON.stringify(body)
  }
  const response = await fetch(url, init)
  return response
}

export const pickRandom = (list: any[] = []) => {
  return list[Math.floor(Math.random() * list.length)]
}

// Fill a string or list of strings with a template
export const fillTemplate = (utterances: string[], template: any) => {
  let payload
  if (typeof utterances !== 'string') {
    payload = pickRandom(utterances) || ''
  } else {
    payload = utterances
  }

  const replacer: any = (
    utterance: string,
    target: string,
    replacement: string
  ) => {
    if (!utterance.includes(`$[${target}]`)) {
      return utterance
    }

    return replacer(
      utterance.replace(`$[${target}]`, replacement),
      target,
      replacement
    )
  }

  for (const key in template) {
    const val = template[key]
    payload = replacer(payload, key, val)
  }

  return payload
}

// Webhook Handlers
export type HookHandler<T = any> = (
  request: Request,
  env: T,
  ctx: ExecutionContext
) => Response | Promise<Response> | void | Promise<void>

export type Hook<T = any> = {
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'
  handler: HookHandler
  validate?(
    request: Request,
    env?: T,
    ctx?: ExecutionContext
  ): { proceed: boolean } | Promise<{ proceed: boolean }>
}

export type Hooks = {
  [key: string]: Hook | HookHandler
}

/**
 * Guard to put as the front door to V8 isolate & route requests as needed
 *
 * /**
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
 *      return SpeedyGuard(hooks, request, env, ctx)
 * }
 *
 * ```
 */
export const SpeedyGuard = async <T = any>(
  hooks: Hooks,
  request: Request,
  env: T,
  ctx: ExecutionContext
): Promise<Response> => {
  const urlRef = new URL(request.url)
  const { pathname } = urlRef
  if (pathname in hooks) {
    const ref = hooks[pathname as keyof typeof hooks]
    if (typeof ref === 'function') {
      const res = ref(request, env, ctx)
      return (res ? res : finale()) as Response
    }
    if ('handler' in ref && typeof ref.handler === 'function') {
      if ('method' in ref) {
        const { method = '' } = ref
        if (method.toLowerCase() !== request.method.toLowerCase()) {
          return new Response(
            `Expected method '${method}' rather than '${request.method}'`,
            {
              status: 400,
            }
          )
        }
      }
      if ('validate' in ref && typeof ref.validate === 'function') {
        const { proceed } = await ref.validate(request, env, ctx)
        if (proceed) {
          return ref.handler(request, env, ctx) as Response
        } else {
          return new Response('Validation failed', {
            status: 400,
          })
        }
      }
      const res = ref.handler(request, env, ctx)
      return (res ? res : finale()) as Response
    }
  }

  return finale()
}

export const websiteResponse = (html: string) =>
  new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  })

export const finale = () =>
  new Response(
    `
Server(less) Time: ${new Date().toString()}
*
* ╔═╗ ╔═╗ ╔═╗ ╔═╗ ╔╦╗ ╦ ╦ ╔╗  ╔═╗ ╔╦╗
* ╚═╗ ╠═╝ ║╣  ║╣   ║║ ╚╦╝ ╠╩╗ ║ ║  ║
* ╚═╝ ╩   ╚═╝ ╚═╝ ═╩╝  ╩  ╚═╝ ╚═╝  ╩ HUB
*
* Setup Instructions (make your own bot): https://github.com/valgaze/speedybot-hub
* `,
    { status: 200 }
  )

export const ui_html = `
  <script src="https://code.s4d.io/widget-space/production/bundle.js"></script>
  <link rel="stylesheet" href="https://code.s4d.io/widget-space/production/main.css">
  
  <link rel="stylesheet" href="https://code.s4d.io/widget-recents/production/main.css">
  <script src="https://code.s4d.io/widget-recents/production/bundle.js"></script>
  
  <style>
      input {
          cursor: pointer;
          color: #34495e;
          font-size: 1rem;
          line-height: 1.4rem;
          width: 100%;
          font-family: 'Courier New';
          margin: 6px;
          background: #ecf0f1;
      }
  
      * {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          font-size: 14px;
          color: #34495e;
      }
      body {
          background-color:  #ecf0f1;
      }
      .launch-button {
          background: #2ecc71;
          padding: 1%;
          color: #fff;
          font-weight: 900;
          font-family: sans-serif;
          border: none;
          border-radius: 14px;
          cursor: pointer;
      }
  
      .launch-button:hover {
          background: #41d47f;
      }
  
      .launch-wrap {
          padding: 1%;
      }
  </style>
  <body>
      <div class="chat-wrap">
          <fieldset>
              <legend>WebEx in a Web Embed</legend>
              <div>
                       <label>👆 Stable Source available <b><a href="https://github.com/valgaze/speedybot/blob/master/docs/webex.html" target="_blank">here</a></b>) </label> <br/>
                  <label>Set access id (copy access token from <a href="https://developer.webex.com/my-apps" target="_blank">here</a>): </label>
                  <input type="text" id="access_id_input" value="" placeholder="access id here" />
              </div>
              <button id="launch" class="launch-button">LAUNCH</button>
          </fieldset>
          <div class="launch-wrap">
              <div style="display: flex; justify-content: center;">
                  <div id="webex-recent" style="width: 500px; height: 500px;"></div>
                  <div id="webex-space" style="width: 500px; height: 500px; background: radial-gradient(#e74c3c, transparent); display:flex; justify-content: center;">
                      <div>
                          <h3>Select a 1-1 conversation from the left </h3>
                          <div>Note: Bots can only request mentions, not whole conversations</div>
                      </div>
                  </div>
              </div>
          </div>
          <fieldset>
              <legend>Send Rich Card</legend>
              <div class="form-group">
                <label class="col-md-4 control-label" for="card_title">Title</label>
                <div class="col-md-4">
                <input id="card_title" name="card_title" type="text" />
                </div>
              </div>
  
              <div class="form-group">
                <label for="card_subtitle">Subtitle</label>
                <div>
                <input id="card_subtitle" name="card_subtitle" type="text" />
                </div>
              </div>
  
              <div class="form-group">
                <label class="control-label" for="image_url">Image URL</label>
                <div>
                <input id="image_url" name="image_url" type="text" />
                </div>
              </div>
  
              <button id="send_card" class="launch-button">Send Card</button>
  
          </fieldset>
  
      </div>
      <script>
          let targetRoom = null;
          const urlParams = new URLSearchParams(window.location.search);
          const access_id = urlParams.get('access_id')
          const $recent = document.querySelector('#webex-recent')
          const $space = document.querySelector('#webex-space')
          const $input = document.querySelector('#access_id_input')
          const setInputs = (selectors, vals) => {
              selectors.forEach((selector, idx) => {
                  document.querySelector(selector, idx).value = vals[idx]
              })
          }
          const mountRecent = ($, access_id, $space) => {
              try {
                  webex.widget($).remove()
              }catch(e) {}
              webex.widget($).recentsWidget({
                  accessToken: access_id,
              });
              $.addEventListener('rooms:selected', (e) => {
                  const {id} = e.detail.data
                  mountSpace($space, access_id, id)
                  targetRoom = id
                  console.log('#', targetRoom)
              })
          }
  
          const mountSpace = ($, access_id, roomId) => {
              try {
                  webex.widget($).remove()
              }catch(e) {}
              webex.widget($).spaceWidget({
                  accessToken: access_id,
                  destinationId: roomId,
                  destinationType: 'spaceId',
              });
          }
  
          document.querySelector('#launch').addEventListener('click', (e) => {
              const access_id = $input.value
              mountRecent($recent, access_id, $space)
          })
  
          document.querySelector('#send_card').addEventListener('click', (e) => {
              if (!targetRoom) {
                  alert('Select a room first')
                  return
              }
  
              const form = {
                  card_title: document.querySelector('#card_title'),
                  card_subtitle: document.querySelector('#card_subtitle'),
                  image_url: document.querySelector('#image_url'),
                  send_card: document.querySelector('#send_card')
              }
  
              const card = {
                  title: form.card_title.value,
                  subtitle: form.card_subtitle.value,
                  url: form.image_url.value
              }
  
              const cardData = generateCard(card)
              sendCard(targetRoom, cardData)
          })
  
  
          if (access_id) {
              mountRecent($recent, access_id, $space)
              setInputs(['#access_id_input'], [access_id])
          }
  
          async function sendCard(roomId, cardPayload, fallbackText="It appears your client cannot render adpative cards.") {
              const access_id = $input.value
              const endpoint = 'https://webexapis.com/v1/messages'
  
              const card = {
                  roomId,
                  markdown: fallbackText,
                  attachments: [{
                      contentType: "application/vnd.microsoft.card.adaptive",
                      content: cardPayload
                  }]
              }
  
              const response = await fetch(endpoint, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer ' + access_id
                  },
                  body: JSON.stringify(card)
              })
              const content = await response.json();
          }
  
          function generateCard({title, subtitle, url}) {
              const card = {
                  type: "AdaptiveCard",
                  version: "1.0",
                  body: []
              }
  
              if (title) {
                  card.body.push({
                          type: "TextBlock",
                          text: title,
                          size: "large",
                          weight: "bolder",
                          color: "dark"
                      })
              }
  
              if (subtitle) {
                  card.body.push({
                          type: "TextBlock",
                          text: subtitle,
                          size: "medium",
                          weight: "bolder",
                          color: "dark"
                      })
              }
  
              if (image_url) {
                  card.body.push({
                          type: "Image",
                          url: url
                      })
              }
              return card
          }
      </script>
  </body>`

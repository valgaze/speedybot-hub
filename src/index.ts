/**

 ╱╭━━━╮╱╭━━━╮╱╭━━━╮╱╭━━━╮╱╭━━━╮╱╭╮╱╱╭╮╱╭━━╮╱╱╭━━━╮╱╭━━━━╮╱
╱┃╭━╮┃╱┃╭━╮┃╱┃╭━━╯╱┃╭━━╯╱╰╮╭╮┃╱┃╰╮╭╯┃╱┃╭╮┃╱╱┃╭━╮┃╱┃╭╮╭╮┃╱
╱┃╰━━╮╱┃╰━╯┃╱┃╰━━╮╱┃╰━━╮╱╱┃┃┃┃╱╰╮╰╯╭╯╱┃╰╯╰╮╱┃┃╱┃┃╱╰╯┃┃╰╯╱
╱╰━━╮┃╱┃╭━━╯╱┃╭━━╯╱┃╭━━╯╱╱┃┃┃┃╱╱╰╮╭╯╱╱┃╭━╮┃╱┃┃╱┃┃╱╱╱┃┃╱╱╱
╱┃╰━╯┃╱┃┃╱╱╱╱┃╰━━╮╱┃╰━━╮╱╭╯╰╯┃╱╱╱┃┃╱╱╱┃╰━╯┃╱┃╰━╯┃╱╱╱┃┃╱╱╱
╱╰━━━╯╱╰╯╱╱╱╱╰━━━╯╱╰━━━╯╱╰━━━╯╱╱╱╰╯╱╱╱╰━━━╯╱╰━━━╯╱╱╱╰╯╱╱╱HUB
 */
import { SpeedyConfig, SpeedybotHub } from './lib/speedybot_hub'
import { handlers } from '../settings/handlers'
import { config as rootConfig } from '../settings/config'

import {
  SpeedyGuard,
  Hooks,
  websiteResponse,
  finale,
  ui_html,
} from './lib/common'
export { InitBot, WebhookBot } from './lib/bot'
import { LocationAwareBot } from './lib/location'
import { ENVELOPES } from './lib/payloads.types'
import { BotConfig, WebhookBot } from './lib/bot'

// Pass in BOT_TOKEN as secret, must NEVER touch source control, logs, etc
// ex. run from folder root: $ npx wrangler secret put BOT_TOKEN
export interface Env {
  BOT_TOKEN: string
}

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    // Project  as rootConfig to specifiy auth token, validation handler (ie webhook secrets), location handler, fallbackText, etc
    const config: SpeedyConfig = {
      ...rootConfig,
      token: env.BOT_TOKEN, // 🚨 Here passed in using secrets with wrangler cli
    }

    // Redirects, handle incoming webhooks, location, ui, etc
    const hooks: Hooks = {
      '/jira_webhook': {
        method: 'POST',
        async validate(request) {
          const check = request.headers.get('super_dooper_secret_token')
          if (check === 'THE_super_dooper_secret_token') {
            return { proceed: true }
          }
          return { proceed: false }
        },
        async handler(request, env, ctx) {
          /*
          // Ex. send a message to process incoming webhook
          const BotConfig: Partial<BotConfig> = {
            token: config.token,
            url: request.url,
            helpContent: [],
          }
          const inst = WebhookBot(BotConfig)
          inst.dm('user@email.com', 'Some great message or card')
          inst.dmDataAsFile('user@email.com', { a: 1, b: 2, c: 3 }, 'json')
          inst.dm(
            'user@email.com',
            inst.card({
              title: 'my title',
              subTitle: 'subtitle',
              chips: ['hi', 'ping', 'pong'],
            })
          )
          */

          return new Response('Ok', { status: 200 })
        },
      },
      '/whoami': {
        handler(request, env, ctx) {
          const { cf } = request
          const {
            city,
            colo,
            continent,
            country,
            latitude,
            longitude,
            postalCode,
            region,
            timezone,
          } = (cf as IncomingRequestCfProperties) || {}

          const rando = () => `${Math.random().toString(36).slice(2)}`

          return new Response(
            JSON.stringify({
              rando: `${rando()}_${rando()}`,
              city,
              colo,
              continent,
              country,
              latitude,
              longitude,
              postalCode,
              region,
              timezone,
            }),
            {
              status: 200,
              headers: {
                'content-type': 'application/json',
              },
            }
          )
        },
      },
      '/intercept': {
        method: 'GET',
        handler(request, env, ctx) {
          const urlRef = new URL(request.url)
          const { searchParams } = urlRef
          const target = searchParams.get('target') || null
          if (target) {
            ctx.waitUntil(
              new Promise((resolve) => {
                const { cf } = request
                const {
                  city,
                  colo,
                  continent,
                  country,
                  latitude,
                  longitude,
                  postalCode,
                  region,
                  timezone,
                } = (cf as IncomingRequestCfProperties) || {}

                // Any links would go through
                console.log(
                  '# Analytics-ize this somehow...',
                  city,
                  colo,
                  continent,
                  country,
                  latitude,
                  longitude,
                  postalCode,
                  region,
                  timezone
                )
              })
            )
            return Response.redirect(target)
          } else {
            return new Response('No target specified')
          }
        },
      },
      '/healthcheck': {
        method: 'GET',
        handler(req) {
          const pickRandom = (list: any[] = []) => {
            return list[Math.floor(Math.random() * list.length)]
          }
          const colors = [
            '#e74c3c',
            '#e67e22',
            '#16a085',
            '#2980b9',
            '#8e44ad',
            '#2c3e50',
          ]
          const page = `<html><h1 style="color:${pickRandom(colors)};">${
            req.url
          }</h1></html>`
          return websiteResponse(page)
        },
      },
      '/': {
        method: 'POST',
        async handler(request: Request, env: Env, ctx: ExecutionContext) {
          // main speedybot
          ctx.waitUntil(
            new Promise<void>(async (resolve, reject) => {
              const hub = new SpeedybotHub(config, handlers)
              try {
                const json = await request.json()
                await hub.processIncoming(json as ENVELOPES, request)
                // resolve()
                // HACK: don't resolve this promise, don't have good mechanism to
                // know for sure when handler is done since it's user-provided instructions
              } catch (e) {
                reject(e)
                return new Response(
                  `Something happened, but backend is up and running: ${e}`
                )
              }
            })
          )
          return finale()
        },
      },
      '/ui': (request: Request) => {
        return new Response(ui_html, {
          status: 200,
          headers: {
            'content-type': 'text/html;charset=UTF-8',
          },
        })
        // return Response.redirect('https://codepen.io/valgaze/full/PoEpxpb')
      },
      '/location': async (
        request: Request,
        env: Env,
        ctx: ExecutionContext
      ) => {
        // Location handler
        // RoomID + MessageID are not private values
        // MessageID can be used as a 1-time-link implementation
        const { cf } = request
        const {
          city,
          colo,
          continent,
          country,
          latitude,
          longitude,
          postalCode,
          region,
          timezone,
        } = (cf as IncomingRequestCfProperties) || {}

        const urlRef = new URL(request.url)
        const { searchParams } = urlRef

        const roomId = searchParams.get('roomId') || null
        const messageId = searchParams.get('messageId') || null
        if (!roomId || !messageId) {
          return new Response('Missing parameters', { status: 422 })
        }
        if (roomId && messageId) {
          const payload = {
            city,
            colo,
            continent,
            country,
            latitude,
            longitude,
            postalCode,
            region,
            timezone,
          }

          const BotConfig = {
            token: config.token,
            roomId: roomId as string,
            meta: {
              url: request.url,
            },
          }
          const Bot = new LocationAwareBot(BotConfig, payload)
          // Validate this is a request by checking messageId
          const check = await Bot.deleteMessage(messageId as string)
          if (check.status === 404) {
            return new Response('Sorry, that link is no longer valid', {
              status: 401,
            })
          } else {
            if ('location' in config && typeof config.location === 'function') {
              const assertFunc = config.location as Function
              ctx.waitUntil(
                new Promise(async (resolve) => {
                  if ('location' in config) {
                    assertFunc(Bot)
                  }
                })
              )
            }

            return websiteResponse(
              `You can close this window.<script>window.close();window.addEventListener("load", window.close);setTimeout(window.close, 301);</script>`
            )
            // return new Response('Ok')
          }
        } else {
          return finale()
        }
      },
      '/biscotti': (request: Request, env: Env, ctx: ExecutionContext) => {
        return Response.redirect(
          'https://www.youtube.com/watch?v=6A8W77m-ZTw&t=102s'
        )
      },
    }
    return SpeedyGuard(hooks, request, env, ctx)
  },
}

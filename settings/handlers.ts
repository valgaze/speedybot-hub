export const handlers: BotHandler<BotEnvs>[] = [
  {
    keyword: ['hi', 'hello', 'hey', 'yo', 'watsup', 'hola'],
    async handler($bot, trigger: any) {
      const utterances = [
        `Heya how's it going $[name]?`,
        `Hi there, $[name]!`,
        `Hiya $[name]!`,
        `What's new $[name]?`,
        `Helllooo $[name]!`,
      ]
      const template = {
        name: trigger.person.displayName,
      }
      $bot.sendTemplate(utterances, template)

      const card = $bot
        .card({
          title: '🏝 Speedybot-hub',
          subTitle:
            'speedybot-hub: zero fuss serverless conversational design infra',
          chips: [
            { keyword: 'alert', label: '📱 Show alert types' },
            { keyword: 'ping', label: 'ping 🏓' },
            { keyword: 'pong', label: '🏓 pong' },
            { keyword: 'yo', label: '🔆 hi' },
            { keyword: 'kitchensink', label: '💯 Everything (warning: fast)' },
            { keyword: 'help', label: '🚒 help' },
            { keyword: 'files', label: '🗂 files' },
            { keyword: 'location', label: '🗺 location' },
          ],
          image: 'https://i.imgur.com/LybLW7J.gif',
        })
        .setText(
          '**[\u{1F366} [new] Talk to "Treatbot" & order ice cream](webexteams://im?email=treatbot@webex.bot)**'
        )
        .setText('Pick one of the options below')
        .setDetail(
          $bot
            .card()
            .setText('Other Resources')
            .setText(
              '📚 Read **[The API Docs](https://github.com/valgaze/speedybot-hub/blob/deploy/api-docs/classes/BotRoot.md#methods)**'
            )
            .setText(
              '⌨️ See **[The source code for this agent](https://github.com/valgaze/speedybot-hub/blob/deploy/settings/handlers.ts)**'
            )
            .setText(
              '**[🍦 Talk to "Treatbot" & order ice cream](webexteams://im?email=treatbot@webex.bot)**'
            )
            .setText(
              '**[🗣 Get help](webexteams://im?space=6d124c80-f638-11ec-bc55-314549e772a9)**'
            ),
          'Get Help🚨'
        )

      $bot.send(card)
    },
  },
  {
    keyword: ['ping', 'pong'],
    async handler($bot, trigger) {
      const normalized = trigger.text.toLowerCase()
      if (normalized === 'ping') {
        $bot.say('pong')
      } else {
        $bot.say('ping')
      }
    },
    helpText: `A handler that says ping when the user says pong and vice versa`,
  },
  {
    keyword: /\b(\w*rabbit\w*)\b/g,
    handler($bot, trigger) {
      /**
       *
       * User says: "rabbit I want cheese"
       * Bot catures trigger.args as ["i","want","cheese"]
       *
       */
      $bot.send(JSON.stringify(trigger.args))
      $bot.send(`You asked for help and said: ${trigger.args.join(' ')}`)
    },
    helpText: `🐇 This is a regex-based handler that can match a variety of inputs based on the word rabbit-- start your command w/ the word "rabbit" like this: "rabbit i want a carrot"`,
  },
  {
    keyword: '<@catchall>',
    async handler($bot, trigger) {
      const { text } = trigger
      // Usually use this to connec to NLU, see https://github.com/valgaze/treatbot for an examplw
      $bot.log(
        `This fires on **EVERY** incoming text message, ex the user just entered '${text}'`
      )
    },
  },
  {
    keyword: '<@nomatch>',
    async handler($bot, trigger: any) {
      const utterances = [
        `Sorry, I don't know what '$[text]' means`,
        `Whoops, this agent doesn't support '$[text]'`,
        `'$[text]' is not a supported command`,
      ]
      const template = {
        text: trigger.message.text,
      }

      $bot.sendTemplate(utterances, template)
    },
  },
  {
    keyword: '<@fileupload>',
    hideHelp: true,
    async handler($bot, trigger: any) {
      $bot.say('You uploaded a file')
      const [fileUrl] = trigger.message.files || []
      const fileData = await $bot.getFile(fileUrl, {
        responseType: 'arraybuffer',
      })
      const { fileName, extension, type } = fileData
      $bot.say(
        `The file you uploaded (${fileName}), is a ${extension} file of type ${type}`
      )
    },
    helpText:
      'This is a special handler that fires whenever a file is uploaded',
  },
  {
    keyword: '<@submit>',
    hideHelp: true,
    handler($bot, trigger: any) {
      $bot.send(
        `Submission received! You sent us ${JSON.stringify(
          trigger.attachmentAction.inputs
        )}`
      )
      if (trigger.attachmentActions.inputs?.action === 'delete_card') {
        $bot.send(trigger.attachmentAction.messageId)
        $bot.deleteMessage(trigger.attachmentAction.messageId)
      }
    },
    helpText:
      'This is a special hander that fires whenever a button is pressed on an Adaptive Card',
  },
  {
    keyword: '<@camera>',
    async handler($bot, trigger: FILE_TRIGGER) {
      // Same as <@fileupload>, but triggers specifically for jpeg, jpg, png, etc
      const [fileUrl] = trigger.message.files || []
      const fileData = await $bot.getFile(fileUrl, {
        responseType: 'arraybuffer',
      })
      const { data } = fileData
      try {
        // Run image recognition
        const detector = $bot.imageDetector($bot.env.VISION_TOKEN)

        // 1) convert array buffer to base64
        const base64 = detector.toBase64(data)

        // 2) transmit data and retrieve labels
        const res = await detector.detect(base64)

        if ('error' in res && res.error.code === 401) {
          const err = new Error()
          err.message = 'VISION_TOKEN is invalid'
          throw err
        } else if ('responses' in res) {
          // 3) Create a single list of all detections
          const simplified = detector.simplify(res)

          await $bot.send(`Here are some detections...`)
          $bot.sendSnippet(simplified)
        }
      } catch (e: any) {
        await $bot.send('There was a catastrophic issue with the vision tool')
        $bot.send(
          $bot
            .dangerCard({
              title: 'Vision is not enabled for this agent',
              subTitle: e.message ? e.message : 'Vision service has issues',
            })
            .setDetail(
              $bot
                .card()
                .setText('Other Resources')
                .setText(
                  '📚 Read **[The API Docs](https://github.com/valgaze/speedybot-hub/blob/deploy/api-docs/classes/BotRoot.md#methods)**'
                )
                .setText(
                  '⌨️ See **[The source code for this agent](https://github.com/valgaze/treatbot/blob/deploy/settings/handlers.ts)**'
                )
                .setText(
                  '**[🍦 Talk to "Speedybot"](webexteams://im?email=speedybot@webex.bot)**'
                )
                .setText(
                  '**[🗣 Get help](webexteams://im?space=6d124c80-f638-11ec-bc55-314549e772a9)**'
                ),
              'Get Help🚨'
            )
        )
      }
    },
  },
  {
    keyword: 'advice',
    async handler($bot) {
      const API = [
        {
          url: 'https://api.adviceslip.com/advice',
          lookUpPath: 'slip.advice',
          label: `Here's some advice`,
        },
        {
          url: 'https://api.quotable.io/random',
          lookUpPath: 'content',
          label: `A quote for you`,
        },
      ]
      const api = $bot.pickRandom(API)
      if (api) {
        const { url, lookUpPath, label } = api
        const res = await $bot.api(url)
        $bot.send(
          $bot.card({
            title: label,
            subTitle: $bot.lookUp(
              res,
              lookUpPath,
              'The best laid plans can fail'
            ),
            chips: [
              {
                label: $bot.pickRandom([
                  'Give me more advice 💥',
                  `Let's do one more 🏝`,
                  `Let's do it again!🌙`,
                  'Do another one! 🌺',
                ]),
                keyword: 'advice',
              },
              {
                label: 'Restart 🔄',
                keyword: 'hi',
              },
            ],
          })
        )
      }
    },
  },
  {
    keyword: 'alert',
    async handler($bot, trigger) {
      const danger = $bot
        .dangerCard({
          title: '⛔️DANGER-- do not do that!⛔️',
          subTitle: 'There is a very important reason not to do that',
        })
        .setDetail(
          $bot.dangerCard({
            title: 'Timeline',
            table: [
              ['🌟', 'Incident details 1'],
              ['💫', 'Incident details 2'],
              ['🌴', 'Incident details 3'],
            ],
          }),
          'Incident Details'
        )
      await $bot.send(danger)

      const warning = $bot.warningCard({
        title:
          '⚠️Warning-- you should consider carefully if you want to do that!⚠️',
        subTitle:
          'There is a very important reason to slow down and consider if you want to do that...or not',
        chips: ['ping', 'pong'],
      })
      await $bot.send(warning)

      const success = $bot.successCard({
        title: '🌟You did it!🎉',
        subTitle: 'Whatever you did, good at job at doing it',
        chips: ['ping', 'pong'],
      })
      await $bot.send(success)

      const sky = $bot.skyCard({
        title: "☁️You're doing it☁️",
        subTitle: "Whatever you're doing, do it more",
        chips: ['ping', 'pong'],
      })
      await $bot.send(sky)

      const b = $bot.skyCard({ title: 'Speedybot-Hub' })
      const r = $bot.dangerCard({ title: 'Speedybot-Hub' })
      const g = $bot.successCard({ title: 'Speedybot-Hub' })
      const y = $bot.warningCard({ title: 'Speedybot-Hub' })
      await $bot.send(b)
      await $bot.send(r)
      await $bot.send(g)
      await $bot.send(y)
    },
  },
  {
    keyword: 'help',
    handler($bot) {
      const help = $bot.generateHelp()
      $bot.send(
        $bot.card({
          title: 'Help commands',
          table: help.map(({ label, helpText }, idx) => [
            String(idx),
            `${label}: ${helpText}`,
          ]),
          chips: help
            .filter(({ label }) => label !== '{regex}')
            .map(({ label }) => label),
        })
      )
    },
    helpText: 'Show the user help information',
  },
  {
    keyword: 'location',
    async handler($bot, trigger) {
      $bot.locationAuthorizer(trigger)
    },
    helpText: 'Prompt the user to ask for permission questions',
  },
  {
    keyword: '$clear',
    hideHelp: true,
    async handler($bot, trigger) {
      $bot.clearScreen()
    },
    helpText: '(helper) clear the screen',
  },
  {
    keyword: 'healthcheck',
    handler($bot) {
      // Adapative Card: https://developer.webex.com/docs/api/guides/cards
      const card = $bot
        .card({
          title: 'System is 👍',
          subTitle: 'If you see this card, everything is working',
          image:
            'https://raw.githubusercontent.com/valgaze/speedybot/master/docs/assets/chocolate_chip_cookies.png',
          url: 'https://www.youtube.com/watch?v=3GwjfUFyY6M',
          urlLabel: 'Take a moment to celebrate',
          table: [[`Bot's Date`, new Date().toDateString()]],
        })
        .setInput(`What's on your mind?`)
        .setData({ mySpecialData: { a: 1, b: 2 } })
        .setChoices(['option a', 'option b', 'option c'])

      $bot.send(card)
    },
    helpText: 'Sends an Adaptive Card with an input field to the user',
  },
  {
    keyword: 'kitchensink',
    async handler($bot, trigger) {
      const roomGuard = $bot.groupRoomGuard(trigger)
      if (roomGuard.violation === true) {
        return $bot.dm(trigger.personId, roomGuard.card as SpeedyCard)
      }
      // Clearscreen (only works desktop)
      await $bot.clearScreen()
      await $bot.send(`## Kitchen Sink`)

      // $bot.translate
      $bot.send($bot.translate('cn', 'greetings.welcome'))
      $bot.send($bot.translate('es', 'greetings.welcome'))
      $bot.send(
        $bot.translate('DOESNTEXIST', 'greetings.welcome', {}, 'hi (fallback!)')
      )

      // Files
      // 1) File op1: Send a file from publically addressable URL
      const pdfURL = 'https://speedybot.valgaze.com'
      $bot.sendDataFromUrl(pdfURL)

      // 2) Generate a json FILE from data
      await $bot.sendDataAsFile(trigger, 'json')

      // 3) Generate an HTML FILE from data
      const makeHTML = (prefix: string, trigger: any) => {
        return `
          <html>
          <head>
          <title>${prefix}</title>
          </head>
          <body>
          <fieldset>
          <label> 
          <h1>${prefix}</h1>
          </label>
          </fieldset>
          <hr>
          <pre>
      ${JSON.stringify(trigger, null, 2)}
          </pre>
          </body>
          </html>`
      }
      // Send HTML w/ dynamic data
      $bot.sendDataAsFile(
        makeHTML(
          `Here's your generated file, ${trigger.person.firstName}`,
          trigger
        ),
        'html'
      )

      // Thread
      await $bot.thread([
        $bot.card({
          title: `This is a 'thread'`,
          subTitle: 'You can have many entries after the 1st',
          chips: [
            {
              keyword: 'kitchensink',
              label: 'Go again!!',
            },
          ],
        }),
        'thread item 1',
        'thread item 2',
        'thread item 3',
        'thread item 4',
        'thread item 5',
      ])

      // DM (can DM a card or a message)
      $bot.dm(
        trigger.personId,
        $bot.card({
          title: 'biscotti v biscotto',
          subTitle: 'Learn the difference',
          url: 'https://www.youtube.com/watch?v=6A8W77m-ZTw&t=102s',
          urlLabel: 'Learn more 🍪',
        })
      )

      $bot.send(
        $bot.stashCard(
          `My super secret: *${$bot.rando()}*`,
          'Here is a special message'
        )
      )

      // Randomiation/response variation
      const utterances = [
        `Heya how's it going $[name]?`,
        `Hi there, $[name]!`,
        `Hiya $[name]`,
        `What's new $[name]`,
        `Helllooo $[name]`,
      ]
      const template = {
        name: trigger.person.displayName,
      }
      $bot.sendTemplate(utterances, template)

      // Send url
      $bot.sendURL('https://github.com/valgaze/speedybot-hub')

      $bot.sendJSON({ a: 1, b: 2, c: 3 }, 'Here is some snippet data')
      await $bot.sendRandom(['option a', 'option b', 'option c'])
      const b = $bot.skyCard({ title: 'Speedybot-Hub' })
      const r = $bot.dangerCard({ title: 'Speedybot-Hub' })
      const g = $bot.successCard({ title: 'Speedybot-Hub' })
      const y = $bot.warningCard({ title: 'Speedybot-Hub' })
      $bot.send(b)
      $bot.send(r)
      $bot.send(g)
      $bot.send(y)
    },
    helpText: 'A buncha stuff all at once',
  },
  {
    // keyword: ['file','files','sendfile'],
    keyword: 'files',
    async handler($bot, trigger) {
      // await $bot.say(`Here are 3 files`)
      // 1) File op1: Send a file from publically addressable URL
      const pdfURL = 'https://speedybot.valgaze.com'
      $bot.sendDataFromUrl(pdfURL)

      // 2) Generate a json FILE from data
      await $bot.sendDataAsFile(trigger, 'json')

      // 3) Generate an HTML FILE from data
      const makeHTML = (prefix: string, trigger: any) => {
        return `
    <html>
    <head>
    <title>${prefix}</title>
    </head>
    <body>
    <fieldset>
    <label> 
    <h1>${prefix}</h1>
    </label>
    </fieldset>
    <hr>
    <pre>
${JSON.stringify(trigger, null, 2)}
    </pre>
    </body>
    </html>`
      }
      // Send HTML w/ dynamic data
      $bot.sendDataAsFile(
        makeHTML(
          `Here's your generated file, ${trigger.person.firstName}`,
          trigger
        ),
        'html'
      )
    },
  },
]

// Imports
import { SpeedyCard } from '../src/docs'
import { BotHandler, FILE_TRIGGER } from '../src/lib/payloads.types'

// For nice typing, add secrets availble on $bot.env
export type BotEnvs = {
  BOT_TOKEN: string
  VISION_TOKEN: string
}

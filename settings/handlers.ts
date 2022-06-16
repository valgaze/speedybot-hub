import { BotHandler } from '../src/lib/payloads.types'

export const handlers: BotHandler[] = [
  {
    keyword: ['hi', 'hello', 'hey', 'yo', 'watsup', 'hola'],
    async handler($bot, trigger: any) {
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

      $bot.send(
        $bot.card({
          title: 'You can pick an option below or type "help" for more info',
          chips: [
            'ping',
            'pong',
            {
              label: 'Location Demo',
              keyword: 'location',
            },
            'kitchensink',
            'healthcheck',
            {
              label: 'Get advice',
              keyword: 'api',
            },
          ],
        })
      )
    },
    helpText: `A handler that greets the user`,
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
    async handler($bot: any, trigger: any) {
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
    hideHelp: true,
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
          chips: help.map(({ label }) => label),
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
    handler($bot) {
      $bot.clearScreen()
    },
    helpText: '(helper) clear the screen',
  },
  {
    keyword: 'healthcheck',
    handler($bot, trigger) {
      $bot.say('One card on the way...')
      // Adapative Card: https://developer.webex.com/docs/api/guides/cards
      const cardData = $bot
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

      $bot.send(cardData)
    },
    helpText: 'Sends an Adaptive Card with an input field to the user',
  },
  {
    keyword: '<@submit>',
    async handler($bot, trigger: any) {
      // Handle "api" button tap selections
      if ('instruction' in trigger.attachmentAction.inputs) {
        const { instruction, apis = {} } = trigger.attachmentAction.inputs
        if (instruction === 'fetch:advice') {
          let { apiChoice = '' } = trigger.attachmentAction.inputs
          if (apiChoice.toLowerCase() === 'random') {
            apiChoice = $bot.pickRandom(['advice', 'quotes'])
          }
          const api = apis[apiChoice.toLowerCase() as 'advice' | 'quotes']

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
                    keyword: 'api',
                  },
                ],
              })
            )
          }
        }
      } else {
        $bot.say(
          `Submission received! You sent us ${JSON.stringify(
            trigger.attachmentAction.inputs
          )}`
        )
      }
    },
    hideHelp: true,
  },
  {
    keyword: 'api',
    async handler($bot) {
      // api will provide a card, the user will pick an item
      // the <@submit> handler will get the values provided under
      // trigger.attachmentAction.inputs
      $bot.send(
        $bot
          .card({
            title: 'Which API do you wish to contact?',
            subTitle: 'Pick an API to reach from the list below',
          })
          .setChoices(['Advice', 'Quotes', 'Random'], { id: 'apiChoice' })
          .setData({
            instruction: 'fetch:advice',
            apis: {
              advice: {
                url: 'https://api.adviceslip.com/advice',
                lookUpPath: 'slip.advice',
                label: `Here's some advice`,
              },
              quotes: {
                url: 'https://api.quotable.io/random',
                lookUpPath: 'content',
                label: `A quote for you`,
              },
            },
          })
      )
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
    keyword: '<@catchall>',
    async handler($bot: any, trigger) {
      // Runs on every conversation "turn"
      // here you can fire off analytics/performance reports  , etc
      $bot.log('Catchall ran...')
    },
    helpText: 'Runs on every transmission',
    hideHelp: true,
  },
  {
    keyword: ['kitchensink', 'lab', 'kitchen'],
    async handler($bot, trigger) {
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
      $bot.sendRandom(['option a', 'option b', 'option c'])
    },
    helpText: 'A buncha stuff all at once',
  },
]

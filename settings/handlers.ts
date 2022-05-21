import { SpeedyHandlers, BOT_TEMPORARY, TRIGGER_TEMPORARY } from './../lib'

export const handlers: SpeedyHandlers = {
    '<@fileupload>': {
        handler($bot: BOT_TEMPORARY, trigger: TRIGGER_TEMPORARY) {
            $bot.say('yoo  ' + trigger)
        }
    }
}

// export default handlers


// export const handlers = [{
//     keyword: ['hi', 'hello', 'hey', 'yo', 'watsup', 'hola'],
//     async handler($bot, trigger) {
//         const translate = await $bot.i18n({

//         }, 'b.c', 'whoops')

//         $bot.say(`Translated ${translate}`)

//         const utterances = [`Heya how's it going $[name]?`,
//             `Hi there, $[name]!`,
//             `Hiya $[name]`,
//             `What's new $[name]`,
//             `Helllooo $[name]`
//         ]
//         const template = {
//             name: trigger.person.displayName
//         }
//         $bot.sendRandom(utterances, template)

//         $bot.sendCard(new SpeedyCard().setTitle(`Select a 'chip' below`).setChips(['Ping', {
//             keyword: 'Pong',
//             label: `Say 'Pong'`
//         }, 'files', {
//             keyword: 'sendcard',
//             label: 'card'
//         }, 'hi']))

//         $bot.dmCard('Y2lzY29zcGFyazovL3VzL1BFT1BMRS9lMTEyZTQ3MC01NjkzLTQyOWMtYjU5NC1lZmFjN2VmMDNiNGU', new SpeedyCard().setTitle('hello lets go').setChips(['file', 'ping']))

//     },
//     helpText: `A handler that greets the user`
// },
// {
//     keyword: ['ping', 'pong'],
//     handler(bot, trigger) {
//         const normalized = trigger.text.toLowerCase()
//         if (normalized === 'ping') {
//             bot.say('pong')
//         } else {
//             bot.say('ping')
//         }
//     },
//     helpText: `A handler that says ping when the user says pong and vice versa`
// },
// {
//     keyword: 'advice',
//     async handler($bot) {
//         const url = 'https://api.adviceslip.com/advice'
//         const res = await $bot.get(url)
//         $bot.say('#', res)
//     },
//     helpText: 'Will provide you some valuable advice'
// },
// {
//     keyword: 'sendcard',
//     handler(bot, trigger) {
//         bot.say('One card on the way...')
//         // Adapative Card: https://developer.webex.com/docs/api/guides/cards
//         const myCard = new SpeedyCard().setTitle('System is 👍')
//             .setSubtitle('If you see this card, everything is working')
//             .setImage('https://raw.githubusercontent.com/valgaze/speedybot/master/docs/assets/chocolate_chip_cookies.png')
//             .setInput(`What's on your mind?`)
//             .setUrl('https://www.youtube.com/watch?v=3GwjfUFyY6M', 'Take a moment to celebrate')
//             .setTable([
//                 [`Bot's Date`, new Date().toDateString()],
//                 ["✅ Bot Status"]
//             ])
//             .setData({
//                 mySpecialData: {
//                     a: 1,
//                     b: 2
//                 }
//             })
//         bot.sendCard(myCard.render(), 'Your client does not currently support Adaptive Cards')
//     },
//     helpText: 'Sends an Adaptive Card with an input field to the user'
// },
// {
//     keyword: '<@catchall>',
//     handler($bot) {
//         $bot.log('Catchall ran...')
//     },
//     helpText: 'Runs on every transmission',
//     hideHelp: true,
// },
// {
//     keyword: '<@botadded>',
//     async handler($bot, trigger) {
//         $bot.say(`Hi my name is "${trigger.person.displayName}" thanks for adding me here!`)
//     },
//     helpText: 'Fires whenever a bot is added to a space',
//     hideHelp: true,
// },
// {
//     keyword: ['file', 'files', 'sendfile'],
//     async handler($bot, trigger) {
//         await $bot.say(`Here are 3 files`)

//         // 1) File op1: Send a file from publically addressable URL
//         const pdfURL = 'https://speedybot.valgaze.com'
//         $bot.sendDataFromUrl(pdfURL)

//         // 2) Generate a json FILE from data
//         await $bot.sendDataAsFile(trigger, 'json')

//         // 3) Generate an HTML FILE from data
//         const makeHTML = (prefix, trigger) => {
//             return `
//     <html>
//     <head>
//     <title>${prefix}</title>
//     </head>
//     <body>
//     <fieldset>
//     <label> 
//     <h1>${prefix}</h1>
//     </label>
//     </fieldset>
//     <hr>
//     <pre>
// ${JSON.stringify(trigger, null, 2)}
//     </pre>
//     </body>
//     </html>`
//         }
//         $bot.sendDataAsFile(makeHTML(`Here's your custom generated file, ${trigger.person.firstName}`, trigger), 'html')
//     }
// },
// {
//     keyword: '<@nomatch>',
//     handler($bot, trigger) {
//         const utterances = [`Sorry, I don't know what '$[text]' means`,
//             `Whoops, this agent doesn't support '$[text]'`,
//             `'$[text]' is not a supported command`
//         ]
//         const template = {
//             text: trigger.message.text
//         }
//         $bot.sendRandom(utterances, template)

//     }
// },
// {
//     keyword: '<@fileupload>',
//     async handler($bot, trigger) {
//         $bot.say('You uploaded a file')
//         const [fileUrl] = trigger.message.files || []
//         const fileData = await $bot.getFile(fileUrl, {
//             responseType: 'arraybuffer'
//         })
//         const {
//             fileName,
//             extension,
//             type
//         } = fileData
//         $bot.say(`The file you uploaded (${fileName}), is a ${extension} file of type ${type}`)
//     },
//     hideHelp: true,

// },
// {
//     keyword: '<@submit>',
//     handler(bot, trigger) {
//         bot.say(`Submission received! You sent us ${JSON.stringify(trigger.attachmentAction.inputs)}`)
//     },
//     hideHelp: true,
// }
// ]


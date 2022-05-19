# 🏖 `speedybot hub` "cloud-native" conversation design infrastructure

_A super-fast, "no ops" way to host conversation design infrastructure_

```
╔═╗ ╔═╗ ╔═╗ ╔═╗ ╔╦╗ ╦ ╦ ╔╗  ╔═╗ ╔╦╗
╚═╗ ╠═╝ ║╣  ║╣   ║║ ╚╦╝ ╠╩╗ ║ ║  ║
╚═╝ ╩   ╚═╝ ╚═╝ ═╩╝  ╩  ╚═╝ ╚═╝  ╩ HUB
```


```
tl:dr; serverless chat that actually works
```

See **[quickstart.md](./quickstart.md)** on how to get up and running fast

## Motivation

Speedybot-hub is a zero-config and really fast central "hub" for all your conversation design needs-- especially rich components & 3rd-party integrations.

Think of these little "hubs" as central locations around which your conversation design infrastructure can gather-- webhooks & all.

It needs to fast in all respects-- fast to develop, fast to deploy, fast to make edits, fast response times, fast at handling incoming webhooks-- everything should be fast. What matters in a conversational agent is not writing glue code or managing but the content + rich integrations. In the future we will probably be writing less individual "keyword" handlers and instead integrate with 3rd-party conversation services like **[Voiceflow](https://www.voiceflow.com/)**, **[Amazon Lex](https://aws.amazon.com/lex/)**, **[DialogFlow](https://cloud.google.com/dialogflow/docs)**

## Features

- 🌟 Zero External Dependencies 🌟
- Suggestion "chips"
- SpeedyCard support (create rich Adpative Cards without wrangling JSON)
- Support multiple keywords for single handlers (without duplicating handlers)
- Milisecond response times (writtent to operate in **[V8 Isolates](https://developers.cloudflare.com/workers/learning/how-workers-works/)**, not containers)
- Can extend storage to reach any provider (ie dynamoDB, KV store, etc) with key namespaced `personId_roomId_yourKeyHere`
- Edit conversation content & functionality directly in a browser-based editor

### Special "magic" keywords

- <@submit> (get the result of an **[AdaptiveCard](https://developer.webex.com/docs/api/guides/cards)** form submission)
- <@fileupload> (triggers when files uploaded-- \$bot.getFile can retrieve the name + raw data)
- <@catchall> (runs on every received message, useful when "passing" chat to a
- <@botadded> (send a message to space whenever a bot is added)
- <@nomatch> (runs when no)


## Important

Wherever you host your Speedybot-hub, make sure to register its publically accessible URL with this command:

```
npm init speedybot webhook create -t __bot_token_here__ -w https://speedybot-hub.yourusername.workers.dev
```

## Usage

```js
const config = {
  token: 'vvv-www-xxx-yyy-zzz',
  debug: true, // Will log errors to chat agent as a message or log
  // valdiate: () => true, // [optional] pass in a function to validate incoming requests
  // storage: { async save(key, data) {}, async get(key) {}, async delete(key) {}} // [optional] pass in your own storage provided (ex dynamoDB, KV store, etc, keys are prefixed with personId_roomId_yourkeyname)
  // memberships: true, // Whether or not to acknowledge membership events
}

const handlers = {
  keyword: 'hi',
  handler($bot, trigger) {
    $bot.say(`Hi ${trigger.person.displayName}!!`)
  },
  keyword: '<@nomatch>',
  handler($bot) {
    $bot.say(`Sorry I don't know what to do with ${trigger.message.text}`)
  },
}

const inst = await SpeedybotMini(config.token, handlers)

// Incoming webhook
inst(webhookRequest)
```

## Configuration

If you want to go really hardcode, break up your handlers into an object

```js
{
    '<@catchall>': {
        async handler(bot, trigger) {},
        helpText:'n/a'
    },
      '<@submit>': {
        async handler(bot, trigger) {},
        helpText:'n/a'
    },
    '<@fileupload>': {
        async handler(bot, trigger) {},
        helpText:'n/a'
    },
       '<@nomatch>': {
        async handler(bot, trigger) {},
        helpText:'n/a'
    },
    'hi': {
        async handler($bot, trigger) {
            bot.sendRandom(['a','b','c'])
            bot.say(`Hi ${trigger.displayName}!`)
        },
        helpText:'n/a'
    },
}
```

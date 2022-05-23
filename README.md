# 🏖 `speedybot hub` super-fast "no-ops" conversation design infrastructure

```
╔═╗ ╔═╗ ╔═╗ ╔═╗ ╔╦╗ ╦ ╦ ╔╗  ╔═╗ ╔╦╗
╚═╗ ╠═╝ ║╣  ║╣   ║║ ╚╦╝ ╠╩╗ ║ ║  ║
╚═╝ ╩   ╚═╝ ╚═╝ ═╩╝  ╩  ╚═╝ ╚═╝  ╩ HUB
```

```
tl:dr; serverless chat that actually works
```

See **[quickstart.md](./quickstart.md)** on how to get up and running fast

Speedybot-hub is a zero-config and really fast central "hub" for all your conversation design needs-- especially rich 3rd-party integrations, incoming webhooks, handling files/photos, etc.

## Features

- 🌟 Zero External Dependencies 🌟
- Adds support tappable suggestion "chips"
- Optimized for **[V8 Isolates](https://developers.cloudflare.com/workers/learning/how-workers-works/)** for milisecond response times (🥶 no more cold start problems 🥶)
- Includes SpeedyCard card builder (create rich **[Adaptive Cards](https://developer.webex.com/docs/api/guides/cards)** without wrangling JSON)
- Locale & i18n support
- Supports multiple keywords for single handlers (without duplicating handlers)
- Auto-register webhooks using **[Github Actions](https://github.com/features/actions)** if you fork this repo, see **[here for details](./docs/fork_guide.md)**
- Edit conversation content & functionality directly in a browser-based editor
- "Magic" keywords to detect no match, run on every and many others (see **[below for details](#special-magic-keywords)**)

## Motivation

Think of these little "hubs" as central locations around which all your conversation design infrastructure + integrations can gather-- including incoming webhooks.

It needs to fast in all respects-- fast to develop, fast to deploy, fast to make edits, fast response times, fast at handling incoming webhooks-- everything should be fast. What matters in a conversational agent is not writing glue code or managing but the content + rich integrations.

You shouldn't have to think about anything but your (1) CONTENT + (2) rich integrations (files, location, sensors, etc)

Speedybot-hub takes care of virtually all of the "everything else" details so all you and your team need to think about is about a single file: **[settings/handlers.ts](https://github.com/valgaze/speedybot-hub/blob/deploy/settings/handlers.ts)**

### Special "magic" keywords

The era of manually writing "handlers" or matching text with RegEx's is largely over. These days in order to build a credible conversation experience with conversation designers and other experts you will probably need to separate your authorship from code. We will be writing less "keyword" handlers and instead integrate with 3rd-party conversation services like **[Voiceflow](https://www.voiceflow.com/)**, **[Amazon Lex](https://aws.amazon.com/lex/)**, **[DialogFlow](https://cloud.google.com/dialogflow/docs)** You can of course still write regex's or manually match keywords, but you really don't need to anymore.

- <@catchall> (runs on every received message, useful when "passing" chat messages an NLU service and getting a response)
- <@submit> (capture the result of an **[AdaptiveCard](https://developer.webex.com/docs/api/guides/cards)** form submission)
- <@fileupload> (triggers when files uploaded-- `$bot.getFile` name and lots of other data
- <@botadded> (send a message whenever a bot is added to a space
- <@nomatch> (runs when no handler, aside from <@catchall>, matches the input)

See the **[quickstart](./quickstart.md)** to get up and running

## SpeedyCard

ex. Tell the bot "sendcard" to get a card, type into the card & tap submit, catch submission using _<@submit>_ and echo back to user.

This card builder simplifies and standardizes cards

![sb](./docs/assets/demo_sendcard.gif)

```ts
export const handlers = [
  {
    keyword: '<@submit>',
    handler(bot, trigger) {
      bot.say(
        `Submission received! You sent us ${JSON.stringify(
          trigger.attachmentAction.inputs
        )}`
      )
    },
    helpText: 'Special handler that fires when data is submitted',
  },
  {
    keyword: 'sendcard',
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
          table: [
            [`Bot's Date`, new Date().toDateString()],
            ["Bot's Uptime", '135.327998958s'],
          ],
        })
        .setInput(`What's on your mind?`)
        .setData({ mySpecialData: { a: 1, b: 2 } })

      $bot.send(cardData)
    },
    helpText: 'Sends an Adaptive Card with an input field to the user',
  },
]
```

## Suggestion "chips"

ex. Tap a "suggestion" to chip to trigger same behavior as if you tapped it yourself

Chips are useful to expose conversation agent features--

![sb](./docs/assets/demo_chips.gif)

```ts
export const handlers = [
  {
    keyword: '<@submit>',
    handler(bot, trigger) {
      bot.say(
        `Submission received! You sent us ${JSON.stringify(
          trigger.attachmentAction.inputs
        )}`
      )
    },
    helpText: 'Special handler that fires when data is submitted',
  },
  {
    keyword: 'sendcard',
    handler($bot, trigger) {
      bot.say('One card on the way...')
      // Adapative Card: https://developer.webex.com/docs/api/guides/cards
      const cardData = $bot
        .card({
          title: 'System is 👍',
          subTitle: 'If you see this card, everything is working',
          image:
            'https://raw.githubusercontent.com/valgaze/speedybot/master/docs/assets/chocolate_chip_cookies.png',
          url: 'https://www.youtube.com/watch?v=3GwjfUFyY6M',
          urlLabel: 'Take a moment to celebrate',
          table: [
            [`Bot's Date`, new Date().toDateString()],
            ["Bot's Uptime", '135.327998958s'],
          ],
        })
        .setInput(`What's on your mind?`)
        .setData({ mySpecialData: { a: 1, b: 2 } })

      $bot.send(cardData)
    },
    helpText: 'Sends an Adaptive Card with an input field to the user',
  },
]
```

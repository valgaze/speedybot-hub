[speedybot-hub](../README.md) / [Exports](../modules.md) / SelectorPayload

# Interface: SelectorPayload

SpeedyCard
 Work in progress
- zero-knowledge, easy declarative way to construct
"rich" (ie interactive adpative cards)

- Chain methods together, kinda like SwiftUI's syntax: https://developer.apple.com/xcode/swiftui/

```ts 
import { SpeedyCard } from 'speedybot'

const cardPayload = new SpeedyCard().setTitle('System is 👍')
.setSubtitle('If you see this card, everything is working')
.setImage('https://i.imgur.com/SW78JRd.jpg')
.setInput(`What's on your mind?`)
.setUrl(pickRandom(['https://www.youtube.com/watch?v=3GwjfUFyY6M', 'https://www.youtube.com/watch?v=d-diB65scQU']), 'Take a moment to celebrate')
.setTable([[`Bot's Date`, new Date().toDateString()], ["Bot's Uptime", `${String(process.uptime()).substring(0, 25)}s`]])

bot.sendCard(cardPayload.render(), 'Your client doesnt appear to support adaptive cards')
```

## Table of contents

### Properties

- [id](SelectorPayload.md#id)
- [label](SelectorPayload.md#label)
- [type](SelectorPayload.md#type)

## Properties

### id

• **id**: `string`

#### Defined in

[lib/cards.ts:111](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L111)

___

### label

• `Optional` **label**: `string`

#### Defined in

[lib/cards.ts:113](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L113)

___

### type

• **type**: `string`

#### Defined in

[lib/cards.ts:112](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L112)

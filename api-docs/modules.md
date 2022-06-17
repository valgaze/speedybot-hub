[speedybot-hub](README.md) / Exports

# speedybot-hub

## Table of contents

### Classes

- [BotRoot](classes/BotRoot.md)
- [LocationAwareBot](classes/LocationAwareBot.md)
- [SpeedyCard](classes/SpeedyCard.md)

### Interfaces

- [AttachmentData](interfaces/AttachmentData.md)
- [BaseConfig](interfaces/BaseConfig.md)
- [BaseOpts](interfaces/BaseOpts.md)
- [ChoiceBlock](interfaces/ChoiceBlock.md)
- [ChoiceOption](interfaces/ChoiceOption.md)
- [EasyCardSpec](interfaces/EasyCardSpec.md)
- [Fact](interfaces/Fact.md)
- [FactSet](interfaces/FactSet.md)
- [ImageBlock](interfaces/ImageBlock.md)
- [LinkButton](interfaces/LinkButton.md)
- [SelectorPayload](interfaces/SelectorPayload.md)
- [TextBlock](interfaces/TextBlock.md)
- [inputConfig](interfaces/inputConfig.md)

### Type Aliases

- [AbbreviatedSpeedyCard](modules.md#abbreviatedspeedycard)
- [BotConfig](modules.md#botconfig)
- [SpeedyConfig](modules.md#speedyconfig)

### Functions

- [InitBot](modules.md#initbot)
- [WebhookBot](modules.md#webhookbot)

## Type Aliases

### AbbreviatedSpeedyCard

Ƭ **AbbreviatedSpeedyCard**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `backgroundImage` | `string` |
| `chips` | (`string` \| { `keyword?`: `string` ; `label`: `string`  })[] |
| `choices` | (`string` \| `number`)[] |
| `data` | [`AttachmentData`](interfaces/AttachmentData.md) |
| `image` | `string` |
| `subTitle` | `string` |
| `table` | `string`[][] \| { `[key: string]`: `string`;  } |
| `title` | `string` |
| `url` | `string` |
| `urlLabel` | `string` |

#### Defined in

[lib/cards.ts:3](https://github.com/valgaze/speedybot-hub/blob/c3263c6/src/lib/cards.ts#L3)

___

### BotConfig

Ƭ **BotConfig**<`T`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `env?` | `T` |
| `fallbackText?` | `string` |
| `helpContent?` | { `helpText`: `string` ; `label`: `string`  }[] |
| `locales?` | { `[localeName: string]`: { `[key: string]`: `any`;  };  } |
| `roomId` | `string` |
| `token` | `string` |
| `url?` | `string` |

#### Defined in

[lib/bot.ts:21](https://github.com/valgaze/speedybot-hub/blob/c3263c6/src/lib/bot.ts#L21)

___

### SpeedyConfig

Ƭ **SpeedyConfig**: `Object`

 This is the root configuration object for your hub. Most important is "token" and that value should never be put into source code

- token: string; // bot token, make one here: https://developer.webex.com/my-apps/new
- debug: boolean; // show debug logs & report errors to chat if possible
- fallbackText: // text that display if user's client can't display Adaptive Cards (otherwise default message)
- location: function; // After user authorizes location will run this function with access to roomId & messageId
- validation: function // to run for incoming requests see below

### Validation
For validation, you can run whatever validation checks you want but ultimately need to finish with ```{ proceed: boolean }```
- https://github.com/webex/SparkSecretValidationDemo
- https://developer.webex.com/blog/using-a-webhook-secret
- https://developer.webex.com/blog/building-a-more-secure-bot

```ts
async validate(request: Request) {
   const signature = request.headers.get('X-Spark-Signature')
   const res = {
       proceed: true
   }

   if (signature && signature.length) {
       const json = await request.json()
       const cryptoValidate = (body:any, signature:any) => {
           // use WebCrypto
           // Use your secret to hash body
           // and compare to signature
           return true
       }
       res.proceed = cryptoValidate(json, signature)
   }
   return res
}
```

#### Type declaration

| Name | Type |
| :------ | :------ |
| `debug?` | `boolean` |
| `fallbackText?` | `string` |
| `features?` | { `chips`: { `disappearOnTop`: `boolean`  }  } |
| `features.chips` | { `disappearOnTop`: `boolean`  } |
| `features.chips.disappearOnTop` | `boolean` |
| `locales?` | { `[localeName: string]`: { `[key: string]`: `any`;  };  } |
| `token` | `string` |
| `location?` | (`$bot`: [`LocationAwareBot`](classes/LocationAwareBot.md)) => `void` \| `Promise`<`any`\> |
| `validate?` | (`request`: `Request`) => { `proceed`: `boolean`  } \| `Promise`<{ `proceed`: `boolean`  }\> |

#### Defined in

[lib/speedybot_hub.ts:59](https://github.com/valgaze/speedybot-hub/blob/c3263c6/src/lib/speedybot_hub.ts#L59)

## Functions

### InitBot

▸ **InitBot**<`T`\>(`config`, `makeRequest?`): [`BotRoot`](classes/BotRoot.md)<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `config` | [`BotConfig`](modules.md#botconfig)<`any`\> | `undefined` |
| `makeRequest` | (`url`: `string`, `body`: `any`, `opts`: `RequestOps`) => `Promise`<`Response`\> | `CoreMakerequest` |

#### Returns

[`BotRoot`](classes/BotRoot.md)<`T`\>

#### Defined in

[lib/bot.ts:1192](https://github.com/valgaze/speedybot-hub/blob/c3263c6/src/lib/bot.ts#L1192)

___

### WebhookBot

▸ **WebhookBot**(`config`, `makeRequest?`): `Object`

Bot instance to handle incoming webhooks. The basic is receive an incoming webhook, process the data and if necessary dispatch an alert to a person and/or a room (group of persons)

Your Hub (under src/index.ts) can specify "hooks" which handle incoming webhooks and
WebhookBot will let you dispatch alert messages to spaces or DM's to people

```typescript

export default {
 async fetch(request: Request, env: any, ctx: any): Promise<Response> {
   const hooks: Hooks = {
    '/incoming_route': {
      async handler(request, env, ctx) {
        const BotConfig: Partial<BotConfig> = {
          token: config.token,
          url: request.url,
          helpContent: [],
        }
        const $bot = WebhookBot(BotConfig)
        // send a message to a room
        $bot.sendRoom('__PUT_ROOM_ID_HERE', 'Some great message or card')

        //Send a card
        $bot.sendRoom('__PUT_ROOM_ID_HERE',$bot.card({title: 'hi there', subtitle: 'here is a subittle', chips: ['a','b','c']}))

        const data = await request.data()

        $bot.DM('username@email.com', `This was just posted to /incoming_route: ${JSON.stringify(data, null, 2)}`)
      },
    }
   }
}

```

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `config` | `Partial`<[`BotConfig`](modules.md#botconfig)<`any`\>\> | `undefined` |
| `makeRequest` | (`url`: `string`, `body`: `any`, `opts`: `RequestOps`) => `Promise`<`Response`\> | `CoreMakerequest` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `card` | (`config?`: `Partial`<[`AbbreviatedSpeedyCard`](modules.md#abbreviatedspeedycard)\>) => [`SpeedyCard`](classes/SpeedyCard.md) |
| `dm` | (`personIdOrEmail`: `string`, `message`: `string` \| `string`[] \| [`SpeedyCard`](classes/SpeedyCard.md), `fallback?`: `string`) => `Promise`<`Response`\> |
| `dmDataAsFile` | (`personIdOrEmail`: `string`, `data`: `any`, `extensionOrFileName`: `string`, `contentType`: ``null``, `textLabel?`: `string`, `overrides`: { `toPersonEmail?`: `string` ; `toPersonId?`: `string`  }) => `Promise`<`Response`\> |
| `sendRoom` | (`roomId`: `string`, `message`: `string` \| `string`[] \| [`SpeedyCard`](classes/SpeedyCard.md)) => `void` |
| `sendRoomDataAsFile` | (`roomId`: `string`, `data`: `any`, `extensionOrFileName`: `string`, `contentType`: ``null``, `textLabel?`: `string`, `overrides`: { `toPersonEmail?`: `string` ; `toPersonId?`: `string`  }) => `Promise`<`Response`\> |
| `snippet` | (`data`: `any`, `dataType`: `string`) => `string` |

#### Defined in

[lib/bot.ts:1235](https://github.com/valgaze/speedybot-hub/blob/c3263c6/src/lib/bot.ts#L1235)

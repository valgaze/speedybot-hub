[speedybot-hub](../README.md) / [Exports](../modules.md) / SpeedyCard

# Class: SpeedyCard

## Table of contents

### Constructors

- [constructor](SpeedyCard.md#constructor)

### Properties

- [attachedData](SpeedyCard.md#attacheddata)
- [backgroundImage](SpeedyCard.md#backgroundimage)
- [buttonLabel](SpeedyCard.md#buttonlabel)
- [choiceConfig](SpeedyCard.md#choiceconfig)
- [choices](SpeedyCard.md#choices)
- [dateData](SpeedyCard.md#datedata)
- [details](SpeedyCard.md#details)
- [image](SpeedyCard.md#image)
- [imageConfig](SpeedyCard.md#imageconfig)
- [inputConfig](SpeedyCard.md#inputconfig)
- [inputPlaceholder](SpeedyCard.md#inputplaceholder)
- [json](SpeedyCard.md#json)
- [needsSubmit](SpeedyCard.md#needssubmit)
- [subTitleConfig](SpeedyCard.md#subtitleconfig)
- [subtitle](SpeedyCard.md#subtitle)
- [tableData](SpeedyCard.md#tabledata)
- [texts](SpeedyCard.md#texts)
- [timeData](SpeedyCard.md#timedata)
- [title](SpeedyCard.md#title)
- [titleConfig](SpeedyCard.md#titleconfig)
- [url](SpeedyCard.md#url)
- [urlLabel](SpeedyCard.md#urllabel)

### Methods

- [card](SpeedyCard.md#card)
- [render](SpeedyCard.md#render)
- [renderFull](SpeedyCard.md#renderfull)
- [setBackgroundImage](SpeedyCard.md#setbackgroundimage)
- [setButtonLabel](SpeedyCard.md#setbuttonlabel)
- [setChips](SpeedyCard.md#setchips)
- [setChoices](SpeedyCard.md#setchoices)
- [setData](SpeedyCard.md#setdata)
- [setDate](SpeedyCard.md#setdate)
- [setDetail](SpeedyCard.md#setdetail)
- [setImage](SpeedyCard.md#setimage)
- [setInput](SpeedyCard.md#setinput)
- [setSubtitle](SpeedyCard.md#setsubtitle)
- [setTable](SpeedyCard.md#settable)
- [setText](SpeedyCard.md#settext)
- [setTime](SpeedyCard.md#settime)
- [setTitle](SpeedyCard.md#settitle)
- [setUrl](SpeedyCard.md#seturl)
- [setUrlLabel](SpeedyCard.md#seturllabel)

## Constructors

### constructor

• **new SpeedyCard**()

#### Defined in

[lib/cards.ts:157](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L157)

## Properties

### attachedData

• **attachedData**: [`AttachmentData`](../interfaces/AttachmentData.md) = `{}`

#### Defined in

[lib/cards.ts:132](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L132)

___

### backgroundImage

• **backgroundImage**: `string` = `''`

#### Defined in

[lib/cards.ts:136](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L136)

___

### buttonLabel

• **buttonLabel**: `string` = `'Submit'`

#### Defined in

[lib/cards.ts:124](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L124)

___

### choiceConfig

• **choiceConfig**: `Partial`<[`ChoiceBlock`](../interfaces/ChoiceBlock.md)\> = `{}`

#### Defined in

[lib/cards.ts:121](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L121)

___

### choices

• **choices**: [`ChoiceOption`](../interfaces/ChoiceOption.md)[] = `[]`

#### Defined in

[lib/cards.ts:120](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L120)

___

### dateData

• **dateData**: `Partial`<[`SelectorPayload`](../interfaces/SelectorPayload.md)\> = `{}`

#### Defined in

[lib/cards.ts:134](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L134)

___

### details

• **details**: { `card`: `any` ; `title`: `string` ; `type`: `string`  }[] = `[]`

#### Defined in

[lib/cards.ts:143](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L143)

___

### image

• **image**: `string` = `''`

#### Defined in

[lib/cards.ts:122](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L122)

___

### imageConfig

• **imageConfig**: [`BaseOpts`](../interfaces/BaseOpts.md) = `{}`

#### Defined in

[lib/cards.ts:123](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L123)

___

### inputConfig

• **inputConfig**: [`inputConfig`](../interfaces/inputConfig.md)

#### Defined in

[lib/cards.ts:126](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L126)

___

### inputPlaceholder

• **inputPlaceholder**: `string` = `''`

#### Defined in

[lib/cards.ts:125](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L125)

___

### json

• **json**: [`EasyCardSpec`](../interfaces/EasyCardSpec.md)

#### Defined in

[lib/cards.ts:150](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L150)

___

### needsSubmit

• **needsSubmit**: `boolean` = `false`

#### Defined in

[lib/cards.ts:133](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L133)

___

### subTitleConfig

• **subTitleConfig**: `Partial`<[`TextBlock`](../interfaces/TextBlock.md)\> = `{}`

#### Defined in

[lib/cards.ts:119](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L119)

___

### subtitle

• **subtitle**: `string` = `''`

#### Defined in

[lib/cards.ts:117](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L117)

___

### tableData

• **tableData**: `string`[][] = `[]`

#### Defined in

[lib/cards.ts:131](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L131)

___

### texts

• **texts**: { `horizontalAlignment?`: `string` ; `size?`: `string` ; `text?`: `string` ; `type?`: `string`  }[] = `[]`

#### Defined in

[lib/cards.ts:137](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L137)

___

### timeData

• **timeData**: `Partial`<[`SelectorPayload`](../interfaces/SelectorPayload.md)\> = `{}`

#### Defined in

[lib/cards.ts:135](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L135)

___

### title

• **title**: `string` = `''`

#### Defined in

[lib/cards.ts:116](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L116)

___

### titleConfig

• **titleConfig**: `Partial`<[`TextBlock`](../interfaces/TextBlock.md)\> = `{}`

#### Defined in

[lib/cards.ts:118](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L118)

___

### url

• **url**: `string` = `''`

#### Defined in

[lib/cards.ts:129](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L129)

___

### urlLabel

• **urlLabel**: `string` = `'Go'`

#### Defined in

[lib/cards.ts:130](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L130)

## Methods

### card

▸ **card**(`config?`): [`SpeedyCard`](SpeedyCard.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `Partial`<[`AbbreviatedSpeedyCard`](../modules.md#abbreviatedspeedycard)\> |

#### Returns

[`SpeedyCard`](SpeedyCard.md)

#### Defined in

[lib/cards.ts:513](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L513)

___

### render

▸ **render**(): [`EasyCardSpec`](../interfaces/EasyCardSpec.md)

#### Returns

[`EasyCardSpec`](../interfaces/EasyCardSpec.md)

#### Defined in

[lib/cards.ts:344](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L344)

___

### renderFull

▸ **renderFull**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `attachments` | [`EasyCardSpec`](../interfaces/EasyCardSpec.md)[] |
| `markdown` | `string` |
| `roomId` | `string` |

#### Defined in

[lib/cards.ts:575](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L575)

___

### setBackgroundImage

▸ **setBackgroundImage**(`url`): [`SpeedyCard`](SpeedyCard.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |

#### Returns

[`SpeedyCard`](SpeedyCard.md)

#### Defined in

[lib/cards.ts:175](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L175)

___

### setButtonLabel

▸ **setButtonLabel**(`label`): [`SpeedyCard`](SpeedyCard.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `label` | `string` |

#### Returns

[`SpeedyCard`](SpeedyCard.md)

#### Defined in

[lib/cards.ts:216](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L216)

___

### setChips

▸ **setChips**(`chips`): [`SpeedyCard`](SpeedyCard.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `chips` | (`string` \| { `keyword?`: `string` ; `label`: `string`  })[] |

#### Returns

[`SpeedyCard`](SpeedyCard.md)

#### Defined in

[lib/cards.ts:312](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L312)

___

### setChoices

▸ **setChoices**(`choices`, `config?`): [`SpeedyCard`](SpeedyCard.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `choices` | (`string` \| `number`)[] |
| `config?` | [`ChoiceBlock`](../interfaces/ChoiceBlock.md) |

#### Returns

[`SpeedyCard`](SpeedyCard.md)

#### Defined in

[lib/cards.ts:195](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L195)

___

### setData

▸ **setData**(`payload`): [`SpeedyCard`](SpeedyCard.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | [`AttachmentData`](../interfaces/AttachmentData.md) |

#### Returns

[`SpeedyCard`](SpeedyCard.md)

#### Defined in

[lib/cards.ts:249](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L249)

___

### setDate

▸ **setDate**(`id?`): [`SpeedyCard`](SpeedyCard.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `id` | `string` | `'selectedDate'` |

#### Returns

[`SpeedyCard`](SpeedyCard.md)

#### Defined in

[lib/cards.ts:257](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L257)

___

### setDetail

▸ **setDetail**(`payload`, `label?`): [`SpeedyCard`](SpeedyCard.md)

Add a card into a card

Kinda like Action.Showcard: https://adaptivecards.io/explorer/Action.ShowCard.html

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `payload` | [`SpeedyCard`](SpeedyCard.md) \| `Partial`<[`AbbreviatedSpeedyCard`](../modules.md#abbreviatedspeedycard) & { `label?`: `string`  }\> | (another SpeedyCard) |
| `label?` | `string` |  |

#### Returns

[`SpeedyCard`](SpeedyCard.md)

#### Defined in

[lib/cards.ts:288](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L288)

___

### setImage

▸ **setImage**(`url`, `imageConfig?`): [`SpeedyCard`](SpeedyCard.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |
| `imageConfig?` | `any` |

#### Returns

[`SpeedyCard`](SpeedyCard.md)

#### Defined in

[lib/cards.ts:208](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L208)

___

### setInput

▸ **setInput**(`placeholder`, `config?`): [`SpeedyCard`](SpeedyCard.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `placeholder` | `string` |
| `config?` | [`inputConfig`](../interfaces/inputConfig.md) |

#### Returns

[`SpeedyCard`](SpeedyCard.md)

#### Defined in

[lib/cards.ts:221](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L221)

___

### setSubtitle

▸ **setSubtitle**(`subtitle`, `config?`): [`SpeedyCard`](SpeedyCard.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `subtitle` | `string` |
| `config?` | `Partial`<[`TextBlock`](../interfaces/TextBlock.md)\> |

#### Returns

[`SpeedyCard`](SpeedyCard.md)

#### Defined in

[lib/cards.ts:187](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L187)

___

### setTable

▸ **setTable**(`input`): [`SpeedyCard`](SpeedyCard.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | { `[key: string]`: `string`;  } \| (`string` \| `number`)[][] |

#### Returns

[`SpeedyCard`](SpeedyCard.md)

#### Defined in

[lib/cards.ts:240](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L240)

___

### setText

▸ **setText**(`text`): [`SpeedyCard`](SpeedyCard.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` \| `string`[] |

#### Returns

[`SpeedyCard`](SpeedyCard.md)

#### Defined in

[lib/cards.ts:159](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L159)

___

### setTime

▸ **setTime**(`id?`, `label?`): [`SpeedyCard`](SpeedyCard.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `id` | `string` | `'selectedTime'` |
| `label` | `string` | `'Select a time'` |

#### Returns

[`SpeedyCard`](SpeedyCard.md)

#### Defined in

[lib/cards.ts:267](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L267)

___

### setTitle

▸ **setTitle**(`title`, `config?`): [`SpeedyCard`](SpeedyCard.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `title` | `string` |
| `config?` | `Partial`<[`TextBlock`](../interfaces/TextBlock.md)\> |

#### Returns

[`SpeedyCard`](SpeedyCard.md)

#### Defined in

[lib/cards.ts:179](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L179)

___

### setUrl

▸ **setUrl**(`url`, `label?`): [`SpeedyCard`](SpeedyCard.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `url` | `string` | `undefined` |
| `label` | `string` | `'Go'` |

#### Returns

[`SpeedyCard`](SpeedyCard.md)

#### Defined in

[lib/cards.ts:229](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L229)

___

### setUrlLabel

▸ **setUrlLabel**(`label`): [`SpeedyCard`](SpeedyCard.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `label` | `string` |

#### Returns

[`SpeedyCard`](SpeedyCard.md)

#### Defined in

[lib/cards.ts:235](https://github.com/valgaze/speedybot-hub/blob/6ed96ba/src/lib/cards.ts#L235)

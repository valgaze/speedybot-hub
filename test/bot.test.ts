import 'isomorphic-fetch' // V8 isolate doesn't need to bootstrap language runtime, but sure do need fetch here...

import { BotRoot } from './../src/lib/bot'
import { RequestOps } from './../src/lib/payloads.types'

test('Kitchen sink SpeedyCard', () => {
  const mockMakeRequest = async (url: string, body: any, opts?: RequestOps) => {
    const expected = {}
    const actual = {}
    expect(actual).toEqual(expected)
    return new Response(JSON.stringify({ a: 'mock' }), { status: 200 })
  }

  const inst = new BotRoot({ roomId: 'x', token: 'x' }, mockMakeRequest)
  inst.send('yay')
})

test('dm text', () => {
  const mockMakeRequest = async (url: string, body: any, opts?: RequestOps) => {
    const expected = {
      text: 'My message here',
      toPersonEmail: 'fake_person@bingo.com',
      markdown: 'My message here',
    }
    const actual = body
    expect(actual).toEqual(expected)
    return new Response(JSON.stringify({ a: 'mock' }), { status: 200 })
  }

  const inst = new BotRoot({ roomId: 'x', token: 'x' }, mockMakeRequest)
  inst.dm('fake_person@bingo.com', 'My message here')
})

test('Translate', () => {
  const mockMakeRequest = async (url: string, body: any, opts?: RequestOps) => {
    return new Response(JSON.stringify({ a: 'mock' }), { status: 200 })
  }

  const locales = {
    en: {
      greetings: {
        welcome: `Hey, how's it going?`,
      },
    },
    de: {
      greetings: {
        welcome: 'Was ist los?',
      },
    },
  }

  const inst = new BotRoot(
    { roomId: 'x', token: 'x', locales },
    mockMakeRequest
  )

  const actual = inst.translate('de', 'greetings.welcome')
  const expected = 'Was ist los?'
  expect(actual).toEqual(expected)
})

test('Translate Several Locales', () => {
  const mockMakeRequest = async (url: string, body: any, opts?: RequestOps) => {
    const actual = body.text
    const expected = 'Hello!!, hola!!, 你好'
    expect(actual).toEqual(expected)
    return new Response(JSON.stringify({ a: 'mock' }), { status: 200 })
  }

  const locales = {
    en: {
      greetings: {
        welcome: 'Hello!!',
      },
    },
    es: {
      greetings: {
        welcome: 'hola!!',
      },
    },
    cn: {
      greetings: {
        welcome: '你好',
      },
    },
  }

  const $bot = new BotRoot(
    { roomId: 'x', token: 'x', locales },
    mockMakeRequest
  )

  const eng = $bot.translate('en', 'greetings.welcome')
  const esp = $bot.translate('es', 'greetings.welcome')
  const chn = $bot.translate('cn', 'greetings.welcome')
  $bot.send(`${eng}, ${esp}, ${chn}`)
})

test('lookUp looks up properly', () => {
  const mockMakeRequest = async (url: string, body: any, opts?: RequestOps) => {
    return new Response(JSON.stringify({ a: 'mock' }), { status: 200 })
  }

  const sample = {
    a: 1,
    b: {
      c: {
        d: 2,
      },
    },
  }
  const inst = new BotRoot(
    { roomId: 'x', token: 'x', url: 'https://speedybot-hub.host.com' },
    mockMakeRequest
  )
  const actual = inst.lookUp(sample, 'b.c.d', 'fallback!')
  const expected = 2
  expect(actual).toEqual(expected)
})

test('lookUp looks up properly', () => {
  const mockMakeRequest = async (url: string, body: any, opts?: RequestOps) => {
    return new Response(JSON.stringify({ a: 'mock' }), { status: 200 })
  }

  const sample = {
    a: 1,
    b: {
      c: {
        d: 2,
      },
    },
  }
  const inst = new BotRoot(
    { roomId: 'x', token: 'x', url: 'https://speedybot-hub.host.com' },
    mockMakeRequest
  )
  const actual = inst.lookUp(sample, 'b.c.XXXXX', 'fallback!')
  const expected = 'fallback!'
  expect(actual).toEqual(expected)
})

test('card generates a card', () => {
  const mockMakeRequest = async (url: string, body: any, opts?: RequestOps) => {
    return new Response(JSON.stringify({ a: 'mock' }), { status: 200 })
  }

  const inst = new BotRoot(
    { roomId: 'x', token: 'x', url: 'https://speedybot-hub.host.com' },
    mockMakeRequest
  )
  const actual = inst
    .card({
      title: 'Do you want a snack?',
      chips: ['no', { keyword: 'yes', label: 'Sure' }],
    })
    .setInput('I am a placeholder')
    .render()

  const expected = {
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    type: 'AdaptiveCard',
    version: '1.0',
    body: [
      {
        type: 'TextBlock',
        text: 'Do you want a snack?',
        weight: 'Bolder',
        size: 'Large',
        wrap: true,
      },
      {
        type: 'Input.Text',
        placeholder: 'I am a placeholder',
        id: 'inputData',
      },
    ],
    actions: [
      { type: 'Action.Submit', title: 'no', data: { chip_action: 'no' } },
      { type: 'Action.Submit', title: 'Sure', data: { chip_action: 'yes' } },
      { type: 'Action.Submit', title: 'Submit' },
    ],
  }

  expect(actual).toEqual(expected)
})

test('sanity-mock', () => {
  const mockMakeRequest = async (url: string, body: any, opts?: RequestOps) => {
    const expected = {}
    const actual = {}
    expect(actual).toEqual(expected)
    return new Response(JSON.stringify({ a: 'mock' }), { status: 200 })
  }

  const inst = new BotRoot({ roomId: 'x', token: 'x' }, mockMakeRequest)
  inst.send('yay')
})

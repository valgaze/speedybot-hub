import { ENVELOPES } from '../src/lib/payloads.types'
import { typeIdentifier } from './../src/lib/common'
import { direct } from './samples'

test('Text idenfifer, direct message', () => {
  const { envelope } = direct.text
  const expected = 'TEXT'
  const actual = typeIdentifier(envelope as ENVELOPES)
  expect(actual).toEqual(expected)
})

test('AA idenfifer, direct', () => {
  const { envelope } = direct.aa
  const expected = 'AA'
  const actual = typeIdentifier(envelope as ENVELOPES)
  expect(actual).toEqual(expected)
})

test('Fileupload idenfifer (no text), direct', () => {
  const { envelope } = direct.fileupload_no_text
  const expected = 'FILE'
  const actual = typeIdentifier(envelope as ENVELOPES)
  expect(actual).toEqual(expected)
})

test('Fileupload idenfifer (w/ text), direct', () => {
  const { envelope } = direct.fileupload_with_text
  const expected = 'FILE'
  const actual = typeIdentifier(envelope as ENVELOPES)
  expect(actual).toEqual(expected)
})

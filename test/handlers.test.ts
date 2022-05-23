import { handlers } from './../settings/handlers'

test('Sanity-check handlers (probably could be a good test to fail in an automated pipeline)', () => {
  expect(true).toEqual(Boolean(handlers))
})

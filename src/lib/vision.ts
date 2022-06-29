import { makeRequest } from './common'

/**
 * Google vision helper-- want to generalize this w/ generics & extensions
 * to pass in any provider but have simple auth + API
 *
 *  ```ts
 * {
 *   keyword: '<@camera>',
 *   async handler($bot, trigger: FILE_TRIGGER) {
 *     const [fileUrl] = trigger.message.files || []
 *     const fileData = await $bot.getFile(fileUrl, {
 *       responseType: 'arraybuffer',
 *     })
 *     const { data } = fileData
 *     try {
 *       // Run image recognition
 *       const detector = $bot.imageDetector($bot.env.VISION_TOKEN)
 *
 *       // 1) convert array buffer to base64
 *       const base64 = detector.toBase64(data)
 *
 *       // 2) transmit data and retrieve labels
 *       const res = await detector.detect(base64)
 *
 *       if ('error' in res && res.error.code === 401) {
 *         const err = new Error()
 *         err.message = 'VISION_TOKEN is invalid'
 *         throw err
 *       } else if ('responses' in res) {
 *         // 3) Create a single list of all detections
 *         const simplified = detector.simplify(res)
 *
 *         await $bot.send(`Here are some detections...`)
 *         $bot.sendSnippet(simplified)
 *       }
 *     } catch (e: any) {
 *       await $bot.send('There was a catastrophic issue with the vision tool')
 *       $bot.send(
 *         $bot
 *           .dangerCard({
 *             title: 'Vision is not enabled for this agent',
 *             subTitle: e.message ? e.message : 'Vision service has issues',
 *           })
 *       )
 *     }
 *   },
 * }
 * ```
 *
 **/
export type ErrorPayload = {
  error: { code: number; message: string; status: string }
}

export type DetectionResponse = {
  labelAnnotations: {
    mid: string
    description: string
    score: string
    topicality: string
  }[]
}
export type FullDetection = {
  responses: DetectionResponse[]
}
export class VisionHelper {
  private endpoint = 'https://vision.googleapis.com/v1/images:annotate'
  constructor(private token: string) {}

  toBase64(buffer: any) {
    return base64ArrayBuffer(buffer)
  }

  simplify(detections: FullDetection): string[] {
    const { responses } = detections
    const [detection] = responses
    const { labelAnnotations } = detection
    const simplified = labelAnnotations.map(({ description }) => description)
    return simplified
  }

  async detect(base64Image: string): Promise<FullDetection | ErrorPayload> {
    const body = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              maxResults: 10,
              type: 'LABEL_DETECTION',
            },
          ],
        },
      ],
    }
    const res = await makeRequest(this.endpoint, body, {
      token: this.token,
      method: 'POST',
    })
    const json = (await res.json()) as ErrorPayload | FullDetection
    if ('error' in json) {
      return json as ErrorPayload
    }
    return json as FullDetection
  }
}

export function vision(token: string) {
  return new VisionHelper(token)
}

/**
 * **REALLY FAST** arrayBuffer <> base64, without this approach
 * isolate could timeout
 * https://gist.github.com/jonleighton/958841
 * https://gist.github.com/jonleighton
 * Jon Leighton
 * https://jonleighton.name/
 * @param arrayBuffer
 *
 *
 * @returns string
 */
function base64ArrayBuffer(arrayBuffer: ArrayBuffer) {
  var base64 = ''
  var encodings =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

  var bytes = new Uint8Array(arrayBuffer)
  var byteLength = bytes.byteLength
  var byteRemainder = byteLength % 3
  var mainLength = byteLength - byteRemainder

  var a, b, c, d
  var chunk

  // Main loop deals with bytes in chunks of 3
  for (var i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048) >> 12 // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032) >> 6 // 4032     = (2^6 - 1) << 6
    d = chunk & 63 // 63       = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder == 1) {
    chunk = bytes[mainLength]

    a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3) << 4 // 3   = 2^2 - 1

    base64 += encodings[a] + encodings[b] + '=='
  } else if (byteRemainder == 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

    a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008) >> 4 // 1008  = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15) << 2 // 15    = 2^4 - 1

    base64 += encodings[a] + encodings[b] + encodings[c] + '='
  }

  return base64
}

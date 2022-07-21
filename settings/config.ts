// Root config-- locales, validation, location handler, etc
export const config: SpeedyConfig = {
  token: process.env.token as string, // Can use process, secrets/credentials manager, etc
  locales: {
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
  },
  async validate(body: any, event: APIGatewayProxyEventV2, ctx: Context) {
    // Here could check for secret, headers, etc
    /**
     *  Ex. Visual webhook editor: https://codepen.io/valgaze/full/MWVjEZV
     *  Ex. Register webhook with a secret: $ npm init speedybot webhook create -- -t bot_token_here -w https://abcder1234.execute-api.us-east-1.amazonaws.com -s secret_here
     *  https://github.com/webex/SparkSecretValidationDemo
     *  https://developer.webex.com/blog/using-a-webhook-secret
     *  https://developer.webex.com/blog/building-a-more-secure-bot
     *
     **/

    // Sample validation, uncomment & import crypto library
    //
    // import crypto from 'crypto'
    //
    // const validateSignature = <T = any>(
    //   signature: string,
    //   secret: string,
    //   requestBody: T
    // ): boolean => {
    //   const hmac = crypto.createHmac('sha1', secret)
    //   if (typeof requestBody === 'string') {
    //     hmac.update(requestBody)
    //   } else {
    //     hmac.update(JSON.stringify(requestBody))
    //   }
    //   const isValid = hmac.digest('hex') === signature
    //   return isValid
    // }
    // const signature = event.headers['x-spark-signature']
    // const secret = process.env.secret
    // if (secret) {
    //   const proceed = validateSignature(
    //     signature as string,
    //     secret as string,
    //     body
    //   )
    //   return { proceed: proceed as boolean }

    return { proceed: true }
  },
  debug: true,
  fallbackText:
    'Sorry, it does not appear your client supports rendering cards',
}
import { APIGatewayProxyEventV2, Context } from 'aws-lambda'
import { SpeedyConfig } from '../lib/'

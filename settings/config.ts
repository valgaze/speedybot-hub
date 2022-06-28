// Root config-- locales, validation, location handler, etc
export const config: SpeedyConfig = {
  token: 'placeholder', // 🚨 Given our infra, this will be replaced with BOT_TOKEN secret using with wrangler cli/github secrets
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
  async validate(request) {
    /*
     *  Here could run validation for webook secret, ex
     *  Ex. Register webhook with a secret: $ npm init speedybot webhook create -- -t bot_token_here -w https://speedybot-hub.username.workers.dev -s secret_here
     *  https://github.com/webex/SparkSecretValidationDemo
     *  https://developer.webex.com/blog/using-a-webhook-secret
     *  https://developer.webex.com/blog/building-a-more-secure-bot
     *  ex
     *  const signature = request.headers.get('X-Spark-Signature')
     *  const json = await request.json()
     *  // if valid return { proceeed: true}
     *
     **/
    return { proceed: true }
  },
  async location($bot: LocationAwareBot) {
    await $bot.send(
      $bot
        .card({
          title: `Good ${$bot.location.tod}`,
          subTitle: `Note: this timezone + location data is not stored/collected/sold and is not hyper-accurate. It's accurate enough to understand if its dark/light outside whenever a user is located`,
        })
        .setTable([
          ['Country', $bot.location.country as string],
          ['City', $bot.location.city as string],
          ['Region', $bot.location.region as string],
          ['Timezone', $bot.location.timezone as string],
        ])
        .setUrl(
          `https://maps.google.com/?q=${$bot.location.latitude},${$bot.location.longitude}`,
          'See map 🗺'
        )
    )

    await $bot.send(
      $bot.card({
        title: 'Restart?',
        chips: [{ keyword: 'announce_dm', label: '🔄 Restart' }],
      })
    )
  },
  debug: true,
  fallbackText:
    'Sorry, it does not appear your client supports rendering cards',
}

import { SpeedyConfig, LocationAwareBot } from '../src/lib/'

#!/usr/bin/env node
//@ts-nocheck

// npx speedybot-hub
// npx speedybot-hub help
// npx speedybot-hub setup
const { execSync, exec } = require('child_process')
const { createInterface } = require('readline')
const [, , command, ...args] = process.argv
function log(...payload) {
  console.log.apply(console, payload)
}
function bad(...payload) {
  log('\n\n# ---------------- 🚨 🚨 🚨 ------------------- #\n\n')
  log(...payload)
  log('\n\n# ---------------- 🚨 🚨 🚨 ------------------- #\n\n')
}

const runSync = (cmd) =>
  execSync(cmd, {
    cwd: process.cwd(),
    stdio: 'inherit',
  })

function ask(question) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve, reject) => {
    rl.question(question, function (res) {
      resolve(res)
      rl.close()
    })
  })
}

const getToken = async (msgOverride, required = true) => {
  const msg = msgOverride
    ? msgOverride
    : `What is your bot token? (Make one here: https://developer.webex.com/my-apps/new/bot):`
  const token = await ask(`${msg} 
`)
  if (!token && required) {
    getToken(msg)
  }
  return token
}

const { name, version } = require('./../package.json')
const globals = {
  currDir: process.cwd(),
  command,
  name,
  version,
  args,
}

const ascii = () => {
  console.log(`
███████╗██████╗ ███████╗███████╗██████╗ ██╗   ██╗██████╗  ██████╗ ████████╗
██╔════╝██╔══██╗██╔════╝██╔════╝██╔══██╗╚██╗ ██╔╝██╔══██╗██╔═══██╗╚══██╔══╝
███████╗██████╔╝█████╗  █████╗  ██║  ██║ ╚████╔╝ ██████╔╝██║   ██║   ██║   
╚════██║██╔═══╝ ██╔══╝  ██╔══╝  ██║  ██║  ╚██╔╝  ██╔══██╗██║   ██║   ██║   
███████║██║     ███████╗███████╗██████╔╝   ██║   ██████╔╝╚██████╔╝   ██║   
╚══════╝╚═╝     ╚══════╝╚══════╝╚═════╝    ╚═╝   ╚═════╝  ╚═════╝    ╚═╝
`)
}

const map = {
  fallback(cmd) {
    ascii()
    log(`Sorry didn't understand, try $ npx speedybot-hub help`)
  },
  quickstart() {
    log(`
For written quickstart instructions see here: https://github.com/valgaze/speedybot-hub/blob/deploy/quickstart.md

To setup your webhooks:

npm init speedybot webhook create -t __replace_with_webex_token_ -w https://speedybot-hub.username.workers.dev`)
  },
  async setup(cmd) {
    ascii()
    let name = 'speedybot-hub'
    const nameQuery = `What do you want name your project directory? (leave blank for 'speedybot-hub')`
    const newName = await ask(nameQuery, false)
    if (newName) {
      name = newName
    }
    const cloneCmd = `git clone https://github.com/valgaze/speedybot-hub ${name}`
    execSync(cloneCmd)
    log('Fetching project...')
    log(`
Project ready!

cd ${name}
npm i
npm run config
`)
    const proceed = await ask(
      'Do you want to setup your webhooks now? (you will need to know CloudFlare Worker address, ex https://helloworld.yourusername.workers.dev) [y/n]'
    )
    if (['y', 'yes', 'yah', 1].includes(proceed)) {
      const webhooks = `npm init speedybot webhook create`
      execSync(webhooks)
    } else {
      log(`Whenever you're ready to setup your webhooks, just run 
                
$ npm init speedybot webhook create
`)
    }
  },
  async webhook(cmd) {
    ascii()
    log(`Let's get you set up, you'll need to 2 things in order to register your webhooks:
        
1) WebEx token

2) Cloudflare Worker URL (where you deploy your code)


See here for details: https://github.com/valgaze/speedybot-hub/blob/master/quickstart.md
________________________________________________________________________________________
`)

    const token = await getToken(
      `[1/3] What is your bot token? (Make one here: https://developer.webex.com/my-apps/new/bot):`
    )
    const url = await getToken(
      '[2/3] What is the URL of your Cloudflare Worker? ex. https://helloworld.yourusername.workers.dev'
    )
    const secret = await getToken(
      '(optional) [3/3] (leave blank to skip) Enter a webhook secret',
      false
    )

    log('Creating your webhooks now...')

    let webhookCmd = `npm init speedybot webhook create -t ${token} -w ${url}`
    if (secret) {
      webhookCmd += ` -s ${secret}`
    }
    execSync(webhookCmd)

    const listWebhooksCmd = `npm init speedybot webhook list -t ${token}`
    log(`Listing your registered webhooks...`)
    execSync(listWebhooksCmd)
  },
  help(cmd, opts) {
    log(`
VERSION
  ${opts.name}@${opts.version}

USAGE
  $ npx speedybot-hub [COMMAND]
  $ npm install -g speedybot-hub && speedybot-hub [COMMAND]

COMMANDS
  help     Display help for speedybot-hub
  setup    Scaffold up your own speedybot-hub (cloud native conversation infra)
  webhook  Create, destroy, read, modify deployed webhook (esp useful for serverless/ephemeral compute)
`)
  },
}

async function cli(cmd, opts) {
  const handler = map[cmd] ? map[cmd] : map['fallback']

  handler(cmd, opts)
}

cli(command, globals)

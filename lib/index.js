/**
 * Welcome to your Speedybot-Hub!
 * ╔═╗ ╔═╗ ╔═╗ ╔═╗ ╔╦╗ ╦ ╦ ╔╗  ╔═╗ ╔╦╗
 * ╚═╗ ╠═╝ ║╣  ║╣   ║║ ╚╦╝ ╠╩╗ ║ ║  ║
 * ╚═╝ ╩   ╚═╝ ╚═╝ ═╩╝  ╩  ╚═╝ ╚═╝  ╩ HUB
 * 
 * 1. Add your WebEx bot token to the token field below 
 * 2. Sign up for a cloudflare account & note the URL
 * 3. Register your webhooks (it won't work without it)
 * 4. Copy and paste this WHOLE file into your Worker & press Save & Deploy
 * 5. Register your webhooks
 * $ npm init speedybot webhook create -t __replace_token_here -w https://speedybot-hub.yourusername.workers.dev
 * 
 * Instructions: https://github.com/valgaze/speedybot-hub/blob/master/quickstart.md 
 */

// 1) Root config
const config = {
  token: '__REPLACE__ME__', // webex bot token
}

// 2) Your handlers (add to this list)
const handlers = [{
    keyword: ['hi', 'hello', 'hey', 'yo', 'watsup', 'hola'],
    async handler($bot, trigger) {
        const translate = await $bot.i18n({a:1,b: {c:3, d: 4}}, 'b.c' , 'whoops')
        
        $bot.say(`Translated ${translate}`)
        
        
        const utterances = [`Heya how's it going $[name]?`,
            `Hi there, $[name]!`,
            `Hiya $[name]`,
            `What's new $[name]`,
            `Helllooo $[name]`
        ]
        const template = {
            name: trigger.person.displayName
        }
        $bot.sendRandom(utterances, template)

        $bot.sendCard(new SpeedyCard().setTitle(`Select a 'chip' below`).setChips(['Ping', {
            keyword: 'Pong',
            label: `Say 'Pong'`
        }, 'files', {
            keyword: 'sendcard',
            label: 'card'
        }, 'hi']))
    },
    helpText: `A handler that greets the user`
},
{
    keyword: ['ping', 'pong'],
    handler(bot, trigger) {
        const normalized = trigger.text.toLowerCase()
        if (normalized === 'ping') {
            bot.say('pong')
        } else {
            bot.say('ping')
        }
    },
    helpText: `A handler that says ping when the user says pong and vice versa`
},
{
    keyword: 'advice',
    async handler($bot) {
        const url = 'https://api.adviceslip.com/advice'
        const res = await $bot.get(url)
        $bot.say('#', res)
    },
    helpText: 'Will provide you some valuable advice'
},
{
    keyword: 'sendcard',
    handler(bot, trigger) {
        bot.say('One card on the way...')
        // Adapative Card: https://developer.webex.com/docs/api/guides/cards
        const myCard = new SpeedyCard().setTitle('System is 👍')
            .setSubtitle('If you see this card, everything is working')
            .setImage('https://raw.githubusercontent.com/valgaze/speedybot/master/docs/assets/chocolate_chip_cookies.png')
            .setInput(`What's on your mind?`)
            .setUrl('https://www.youtube.com/watch?v=3GwjfUFyY6M', 'Take a moment to celebrate')
            .setTable([
                [`Bot's Date`, new Date().toDateString()],
                ["✅ Bot Status"]
            ])
            .setData({
                mySpecialData: {
                    a: 1,
                    b: 2
                }
            })
        bot.sendCard(myCard.render(), 'Your client does not currently support Adaptive Cards')
    },
    helpText: 'Sends an Adaptive Card with an input field to the user'
},
{
    keyword: '<@catchall>',
    handler($bot) {
        $bot.log('Catchall ran...')
    },
    helpText: 'Runs on every transmission',
    hideHelp: true,
},
{
    keyword: '<@botadded>',
    async handler($bot, trigger) {
        $bot.say(`Hi my name is "${trigger.person.displayName}" thanks for adding me here!`)
        $bot.say('Here is a file...')
        const fileUrl = 'https://webexapis.com/v1/contents/Y2lzY29zcGFyazovL3VzL0NPTlRFTlQvOTAxYzgxNzAtZDQ2Ny0xMWVjLTg1MzUtYjUzNmM0MGMxMmM4LzA'
        const fileData = await $bot.getFile(fileUrl)
        const {
            data,
            fileName
        } = fileData
        const omg = await $bot.sendDataAsFile(trigger, 'json')
    },
    helpText: 'Fires whenever a bot is added to a space',
    hideHelp: true,
},
{
    keyword: ['file', 'files', 'sendfile'],
    async handler($bot, trigger) {
        await $bot.say(`Here are 3 files`)

        // 1) File op1: Send a file from publically addressable URL
        const pdfURL = 'https://speedybot.valgaze.com'
        $bot.sendDataFromUrl(pdfURL)

        // 2) Generate a json FILE from data
        await $bot.sendDataAsFile(trigger, 'json')

        // 3) Generate an HTML FILE from data
        const makeHTML = (prefix, trigger) => {
            return `
        <html>
        <head>
        <title>${prefix}</title>
        </head>
        <body>
        <fieldset>
        <label> 
        <h1>${prefix}</h1>
        </label>
        </fieldset>
        <hr>
        <pre>
${JSON.stringify(trigger, null, 2)}
        </pre>
        </body>
        </html>`
        }
        $bot.sendDataAsFile(makeHTML(`Here's your custom generated file, ${trigger.person.firstName}`, trigger), 'html')
    }
},
{
    keyword: '<@nomatch>',
    handler($bot, trigger) {
        const utterances = [`Sorry, I don't know what '$[text]' means`,
            `Whoops, this agent doesn't support '$[text]'`,
            `'$[text]' is not a supported command`
        ]
        const template = {
            text: trigger.message.text
        }
        $bot.sendRandom(utterances, template)

    }
},
{
    keyword: '<@fileupload>',
    async handler($bot, trigger) {
        $bot.say('You uploaded a file')
        const [fileUrl] = trigger.message.files || []
        const fileData = await $bot.getFile(fileUrl, {
            responseType: 'arraybuffer'
        })
        const {
            fileName,
            extension,
            type
        } = fileData
        $bot.say(`The file you uploaded (${fileName}), is a ${extension} file of type ${type}`)
    },
    hideHelp: true,

},
{
    keyword: '<@submit>',
    handler(bot, trigger) {
        bot.say(`Submission received! You sent us ${JSON.stringify(trigger.attachmentAction.inputs)}`)
    },
    hideHelp: true,
}
]

async function SpeedybotMini(token, handlers=[], config={}) {
  const API = {
    getMessageDetails: 'https://webexapis.com/v1/messages',
    getAttachmentDetails: 'https://webexapis.com/v1/attachment/actions',
    getMembershipDetails: 'https://webexapis.com/v1/memberships',
    getPersonDetails: 'https://webexapis.com/v1/people',
    sendMessage: 'https://webexapis.com/v1/messages', 
    createWebhook: 'https://webexapis.com/v1/webhooks',
    deleteWebhook: `https://webexapis.com/v1/webhooks`,
    getWebhooks: 'https://webexapis.com/v1/webhooks',
    getSelf: 'https://webexapis.com/v1/people/me',
    deleteMessage: 'https://webexapis.com/v1/messages'
  }
  
  const globals = {
        token,
        roomId: '',
        roomType: '', // group or direct
        botName: '',
        botEmail: '',
        $toragelookup: '',
        debug: true,
        config: {
            features: {
                shortcuts: true,
                memberships: config.memberships,
                chips: {
                    disappearOnTap: false,
                },
            },
            storage: {
            bongoStorage: {},
            async save(key, data) {
                const realKey = `${this.$toragelookup}_${key}`
                this.bongoStorage[realKey] = data
            },
            async get(key) {
                const realKey = `${this.$toragelookup}_${key}`
                this.bongoStorage[realKey] = data
            },
            async delete(key) {
                delete this.bongoStorage[realKey]
            }
            }
        },
    }
const debug = (...payload) => {
    if (globals.debug) {
        console.log.apply(console, payload)
    }
}
const constants = {
    catchall: '<@catchall>',
    submit: '<@submit>',
    file: '<@fileupload>',
    nomatch: '<@nomatch>',
    addbot: '<@botadded>',
    removebot:'<botremoved>',
    help: '<@help>',
    reqTypes: {
        TEXT: 'TEXT',
        AA: 'AA',
        FILE:'FILE',
        MEMBER_REMOVE: 'MEMBERSHIP:REMOVE',
        MEMBER_ADD: 'MEMBERSHIP:ADD'
    }
}

// Extend this with superpowers, no more imports
// handler($bot, trigger)
const bot = {
    async i18n(locale, lookup, fallback='', opts={}) {
    const { template={}, languageOverride=null, returnRaw=null } = opts
    const _get = (locale, lookup='', fallback) => {
        let res = locale
        lookup.split('.').forEach(k => {
        if (res) {
            res = res[k]
        } else {
            res = fallback
        }
        })
        return res ? res : fallback
    }
    const content = _get(locale, lookup, fallback)
    if (returnRaw) {
        return content
    }

    return this.fillTemplate(content,template)
    },
  async get(url, opts={}) {
    const defaultConfig = { 
        method:'GET', 
        'content-type': 'application/json;charset=UTF-8',
        raw: false,
        headers: {}
    }
    const contentType = opts['content-type'] ? opts['content-type'] : defaultConfig['content-type']
    const additionalHeaders = opts.headers ? opts.headers : {}
    const init = {
        method:opts.method ? opts.method : defaultConfig.method,
        headers: {
            'content-type': contentType,
            ...opts.headers
        },
    }
    if (opts.method === 'POST') {
        init.body = opts.raw ? body : JSON.stringify(body)
    }

    const response = await fetch(url, init);
    
    if (contentType.includes('json') || !opts.raw) {
        const res = await response.json()
        return res
    } else {
        return response
    }
  },
  async post(url, opts={}) {
    const defaultConfig = { 
        method:'POST', 
        'content-type': 'application/json;charset=UTF-8',
        raw: false,
        headers: {}
    }
    const contentType = opts['content-type'] ? opts['content-type'] : defaultConfig['content-type']
    const additionalHeaders = opts.headers ? opts.headers : {}
    const init = {
        method:opts.method ? opts.method : defaultConfig.method,
        headers: {
            'content-type': contentType,
            ...opts.headers
        },
    }
    if (opts.method === 'POST') {
        init.body = opts.raw ? body : JSON.stringify(body)
    }
    const response = await fetch(url, init);
    if (contentType.includes('json') || !opts.raw) {
        const res = await response.json()
        return res
    } else {
        return response
    }
  },
  sendRandom(utterances=[], template={}) {
    const res = helpers.pickRandom(utterances)
    const filled = this.fillTemplate(res, template)
    return this.send(filled)
  },
  async sendTemplate(utterances, template) {
    return helpers.sendTemplate(utterances, template)
  },    
  async sendDataFromUrl(url, fallbackText) {
    return helpers.sendDataFromUrl(url, fallbackText)
  },
  async sendDataAsFile(data, extensionOrFileName, contentType, fallbackText) {
    return helpers.sendDataAsFile(data, extensionOrFileName, contentType, fallbackText)
  },
  async getFile(url, opts) {
    return helpers.getFile(url, opts={})
  },
  fillTemplate(utterances, template) {
    return helpers.fillTemplate(utterances, template)
  },
  async send(payload) {
    return helpers.send(payload)
  },
  async say(utterance) {
      return helpers.send(utterance)
  },
  dm(personId, text) {
      const payload = {
          toPersonId: personId,
          text
      }
      return helpers.send(payload)
  },
  sendCard(card) {
      return helpers.send(card)
  },
  dmCard(personId, cardData, fallbackText='') {
    return helpers.send({      
        // Fallback text for clients that don't render cards is required
        toPersonId: personId,
        markdown: fallbackText ? fallbackText : "If you see this message your client cannot render buttons and cards.",
        text: fallbackText ? fallbackText : "If you see this message your client cannot render buttons and cards.",
        attachments: [{
            "contentType": "application/vnd.microsoft.card.adaptive",
            "content": cardData && cardData.render && typeof cardData.render === 'function' ? cardData.render() : cardData
        }]
    });
  },
  log(...payload) {
      return helpers.log(...payload)
  }
}

const makeRequest = async (url, body, opts={}) => {
    const defaultConfig = { method:'POST', 
                            'content-type': 'application/json;charset=UTF-8',
                            raw: false
                          }
    const contentType = opts['content-type'] ? opts['content-type'] : defaultConfig['content-type']
    const additionalHeaders = opts.headers ? opts.headers : {}
    const init = {
        method:opts.method ? opts.method : defaultConfig.method,
        headers: {
            'content-type': contentType,
            'Authorization': `Bearer ${globals.token}`,
            ...additionalHeaders,
        },
  }
  if (opts.method === 'POST') {
      init.body = opts.raw ? body : JSON.stringify(body)
  }
  const response = await fetch(url, init);
  return response
}

 // Internal helpers to setup
 const internalUtils = {
  typeIdentifier(payload) {},
  getEnhancedDetails(envelope, type) {},
  buildTrigger(baseTrigger, enhancedTrigger, type) {}
}
const typeIdentifier = (payload) => {
      let type = null
      if (payload.resource === 'messages') {
          if ('files' in payload.data && payload.data.files.length) {
              const { files =[]} = payload.data
              if (files && files.length) {
                  type = 'FILE'
              }
          } else {
              type = 'TEXT'
          }
      }
      if (payload.resource === 'attachmentActions') {
          type = 'AA'
      }

      if (payload.resource === 'memberships') {
        if (payload.event === 'deleted') {
            type = 'MEMBERSHIP:REMOVE'
        }
        if (payload.event === 'created') {
            type = 'MEMBERSHIP:ADD'
        }
      }
      return type
}

const getEnhancedDetails = async (envelope, type) => {
  let url = API.getMessageDetails
  if (type === 'AA') {
      url = API.getAttachmentDetails
  }

  if (type === 'MEMBERSHIP:REMOVE' || type === 'MEMBERSHIP:ADD') {
    if (type === 'MEMBERSHIP:REMOVE') {
        return {} // no membership data on remove
    } else {
        url = API.getMembershipDetails 

        // Note: actorId is the person who added the
    }
  }
  // else if (type === 'text' || 'file') {
  //     // file is same as text, no opt
  // }
  const { data } = envelope
  const { id } = data
  url = `${url}/${id}`
  const res = await makeRequest(url, {}, {method: 'GET'})
  const json = await res.json()
  return json
}

const buildTrigger = async (baseTrigger, enhancedTrigger={}, type) => {

  // get person data up front
  const { personId } = enhancedTrigger
  const personData = await helpers.getPersonDetails(personId)
  if (type === 'MEMBERSHIP:ADD' || type === 'MEMBERSHIP:REMOVE') {
    const payload = {
        type: 'membership',
        id: enhancedTrigger.id,
        message: enhancedTrigger,
        personId: personId,
        person: personData
    }
    return payload
  } else if (type === 'AA') {
      const AATrigger = {
          id: '',
          attachmentAction: enhancedTrigger,
          personId: personId,
          person: personData
      }
      return AATrigger
  } else {
    let textFlag = (baseTrigger.roomType === 'group' && enhancedTrigger.text) ? enhancedTrigger.text.split(' ').slice(1).join(' ') : (enhancedTrigger.text && enhancedTrigger.text.toLowerCase() || null) 
      
      
        if (!enhancedTrigger.text) {
            if (enhancedTrigger.inputs) {
                const { chip_action } = enhancedTrigger.inputs
                if (textFlag != chip_action) {
                    textFlag = chip_action
                }
            }
        }
      const Trigger = {
          type: 'message',
          id: enhancedTrigger.id,
          message: enhancedTrigger,
          args: (enhancedTrigger.text ? enhancedTrigger.text.split(' ') : []),
          personId: personId,
          person: personData,
          text: textFlag
      }


      // Handle group room scenario
      if (enhancedTrigger.roomType === 'group' && Trigger['args'].length) {
          // In group rooms, return text includes bot @mention
          // if a group, slice off 1st element
          // Ain't pretty or elegant, but resolving this "here" is a big win
          // Another approach: https://github.com/WebexSamples/webex-node-bot-framework/blob/master/lib/framework.js#L1193-L1194
          const args = Trigger['args'].slice(1)
          Trigger['args'] = args
          Trigger['text'] = args.join(' ')

          // Adjust original message too
          // triggerPayload.message.html still will contain the rich markup for a mention
          Trigger.message.text = Trigger.text
      }

      return Trigger
  }
}

 // helpers/$uperowers
  const helpers = {
    async send(payload) {
        // will take a sting, Speedycard, or object & send it
        // will use global roomId by default unless specified in payload
        let body = {
            roomId: typeof payload === 'object' && payload.roomId ? payload.roomId : globals.roomId,
        }
        if (typeof payload === 'string') {
            body.markdown = payload
            body.text = payload
        } else if (typeof payload === 'object') {
            // is it a SpeedyCard?
            const stringifiedPayload = JSON.stringify(payload)
            const isCard = stringifiedPayload.includes('AdaptiveCard') && stringifiedPayload.includes('$schema') && stringifiedPayload.includes('version')
            const isSpeedyCard = 'render' in payload && typeof payload.render === 'function'
            if (isCard || isSpeedyCard) {
                // attach adaptive card
                body = {
                    ...body,
                    markdown: payload.text ? payload.text : "If you see this message your client cannot render buttons and cards.",
                    attachments: [{
                        "contentType": "application/vnd.microsoft.card.adaptive",
                        "content": isSpeedyCard ? payload.render() : payload
                    }]
                }
            } else {
                body = {
                    ...body,
                    ...payload
                }
            }
        }
        const res = await makeRequest(API.sendMessage, body, { method: 'POST', 'content-type': 'application/json' })
        const json = await res.json()
        debug('[Send function, json]', json)
        return json
    },
    sendDataFromUrl(url, fallbackText=' ') {
        return this.send({files: [url], text:fallbackText})
    },
    pickRandom(list=[]) {
      return list[Math.floor(Math.random() * list.length)]
    },
    fillTemplate(utterances, template) {
      let payload
      if (typeof utterances !== 'string') {
        payload = this.pickRandom(utterances) || ''
      } else {
        payload = utterances
      }
  
      const replacer = (
        utterance,
        target,
        replacement,
      ) => {
        if (!utterance.includes(`$[${target}]`)) {
          return utterance
        }
  
        return replacer(
          utterance.replace(`$[${target}]`, replacement),
          target,
          replacement,
        )
      }
  
      for (const key in template) {
        const val = template[key]
        payload = replacer(payload, key, val)
      }
  
      return payload
    },
    sendTemplate(utterances, template) {
		const res = this.fillTemplate(utterances, template)
		return this.send(res)
	},
	log(...payload) {
		return console.log.apply(console, payload)
	},
    async saveData(key, data) {
      try {
        const client = globals.config.storage
        const res = await client.save(key, data)
        return res
      } catch(e) {
        throw '[ERROR] speedybot-hub was unable to save data'
      }
    },
    async getData(key, data) {
      try {
        const client = globals.config.storage
        const res = await client.get(key)
        return res
      }catch(e) {
        throw '[ERROR] speedybot-hub was unable to retrieve data'
      }
    },
    async deleteData(key, data) {
      const client = globals.config.storage
      const res = await client.delete(key, data)
    },
    async getFile(url, opts={}) {
            const res = await makeRequest(url, {}, {method:'GET'})
            const type = res.headers.get('content-type')
            const contentDispo = res.headers.get('content-disposition')
            const fileName = contentDispo.split(';')[1].split('=')[1].replace(/\"/g, '')
            const extension = fileName.split('.').pop() || ''
            // data could be binary if user needs it 
            const shouldProbablyBeArrayBuffer = (!type.includes('json') && !type.includes('txt')) ||  type.includes('image')
            let data = res
            if (opts.responseType === 'arraybuffer' || shouldProbablyBeArrayBuffer) {
                try {
                  data = await res.arrayBuffer()
                }catch(e) {
                    // failed, fallback
                    data = {}                    
                }
            } else {
                // should we not presume json?
                data = await res.json()
            }

            let markdownSnippet = '***No markdown preview available for ${contentType}***'
            if (typeof data === '') {

            }
            const payload = {
                fileName,
                extension,
                type,
                data,
                markdownSnippet: (type === 'application/json' || (typeof data === 'string' && data.length < 900)) ? this.snippet(data) : '' 
            }
            return payload
    },
    generateFileName() {
        const rando = () => `${Math.random().toString(36).slice(2)}`
        return `${rando()}_${rando()}`
    },
    handleExtension(input='') {
        const hasDot = input.indexOf('.') > -1
        let fileName = ''
        const [prefix, ext] = input.split('.')
        if (hasDot) {
            if (!prefix || prefix === '*') {
                // '.json' case, generate prefix
                fileName = `${this.generateFileName()}.${ext}`
            } else {
                // 'a.json' case, pass through
                fileName = input
            }
        } else {
            // 'json' case, generate prefix, add .
            fileName = `${this.generateFileName()}.${prefix}`
        }
        return fileName
    },
    guessContentType(extensionOrFileName) {
      // Most users probably  won't know/care about content-types, attempt to guess it from 
      // file-extension if explicit content-type isn't
      const hasDot = extensionOrFileName.indexOf('.') > -1
      let extension = ''
      const pieces = extensionOrFileName.split('.')
      const hasMultipleDots = pieces.length > 2 // Little trick: if only one dot, there should only be 2 elements
      const [prefix, ext] = pieces
      if (hasDot) {
        // ".png"
        // "a.png"
        // "*.png"
        if (!prefix || prefix === '*') {
          extension = ext
        }
        // a.b.c.png
        if (hasMultipleDots) {
          // last piece will be extension
          extension = pieces.pop()
        }
      } else {
        // "png"
        extension = prefix
      }

      // ~<3 17 May 20222 @ 7:30am: This nightmare chart was generated by GPT3 & saved a bunch of time
      // At minimum, support these file types (per ttps://developer.webex.com/docs/basics)
	    // ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'jpg', 'jpeg', 'bmp', 'gif', 'png']
      // But also definitely also want: html, txt, csv,
      const mapping = {
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        pdf: 'application/pdf',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        bmp: 'image/bmp',
        gif: 'image/gif',
        png: 'image/png',
        txt: 'text/plain',
        csv: 'text/csv',
        html: 'text/html',
        json: 'application/json',
        '*': 'application/octet-stream', // #gbogh
        mp3: 'audio/mpeg',
        mp4: 'video/mp4',
        mpeg: 'video/mpeg',
        mpkg	: 'application/vnd.apple.installer+xml',
        vf: 'application/json', // voiceflow
      }
      const res = mapping[extension] || null
      return res
    },
    async sendDataAsFile(data, extensionOrFileName, contentType, fallbackText = '', overrides={}) {
      if (!extensionOrFileName) {
        throw new Error(`$(bot).sendDataAsFile: Missing filename/extension parameter, ex "myfile.png" or "*.png"`)

      }
      finalContentType = contentType
      if (!finalContentType) {
        finalContentType = this.guessContentType(extensionOrFileName)
        if (!finalContentType) {
          throw new Error(`$(bot).sendDataAsFile: Missing 'content-type' parameter, ex "image/png"`)
        }
    }

        // References to work in V8 Isolate (ie speedybot-hub)
        // https://developer.webex.com/blog/uploading-local-files-to-spark
        // Working version w/ axios: https://github.com/valgaze/speedybot/blob/master/src/helpers.ts#L574-L582
        // https://github.com/TomasHubelbauer/workers-formdata
        // https://community.cloudflare.com/t/worker-formdata-get-file-instance/155009/2
        // https://muffinman.io/blog/uploading-files-using-fetch-multipart-form-data/
        // boundary trick: https://github.com/form-data/form-data/blob/7629e30d4175fa07965a59f70ba5022172f9494a/lib/form_data.js#L293
        // https://stackoverflow.com/a/30454313/3191929
        // https://stackoverflow.com/questions/35192841/how-do-i-post-with-multipart-form-data-using-fetch
        // https://muffinman.io/blog/uploading-files-using-fetch-multipart-form-data/
        // https://community.cloudflare.com/t/cannot-seem-to-send-multipart-form-data/163491

        const fullFileName = this.handleExtension(extensionOrFileName)
        const formData = new FormData();
        const { toPersonId = null, toPersonEmail= null} = overrides
        const label = toPersonId ? 'toPersonId' : (toPersonEmail ? 'toPersonEmail' : 'roomId')
        const destinationValue = toPersonId ? toPersonId : (toPersonEmail ? toPersonEmail : globals.roomId)

        const isJSON = data && typeof data === 'object' && finalContentType.includes('json')
        formData.append('files', new Blob([isJSON ? JSON.stringify(data, null, 2) : data], {type: finalContentType}), fullFileName)
        // formData.append('roomId', globals.roomId)
        formData.append(label , destinationValue)
        formData.append('text', fallbackText)

        const myHeaders = new Headers();
        myHeaders.append("Authorization",  `Bearer ${globals.token}`,);
        const requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: formData,
      };
      const res = await fetch(API.sendMessage, requestOptions)
      return res
    },
    async snippet(data, dataType='json') {
        const msg = `
        \`\`\`${dataType}
        ${dataType === 'json' ? JSON.stringify(data, null, 2) : data}
        \`\`\``
        return msg
    },
    clearScreen(repeatCount=50) {
        const newLine = '\n'
        const repeatClamp = repeatCount > 7000 ? 5000 : repeatCount// 7439 char limit
        const clearScreen = `${newLine.repeat(repeatClamp)}`	
        const payload = {markdown: clearScreen, text: clearScreen}
        this.send(payload)
    },
    async delay(ms=100) {
        return new Promise(resolve => setTimeout(() => resolve(), ms));
    },
    async getSelf () {
          const url = API.getSelf
          const res = await makeRequest(url, {}, {method: 'GET'})
          const json = await res.json()
          return json
    },
    async isHuman(personId, fullPayload=false) {
          const data = await this.getSelf()
          const { id } = data
          if (fullPayload) {
            return data
          }
          return id !== personId
    },
    async getPersonDetails(personId) {
      const url = `${API.getPersonDetails}/${personId}`
      const res = await makeRequest(url, {}, {method: 'GET'})
      const json = await res.json()
      return json    
    },
    async deleteMessage(messageId) {
         const url = `${API.deleteMessage}/${messageId}`
         const res = await makeRequest(url, {}, {method: 'DELETE'})
         return res
    },
    findHandler(target, handlers=[], trigger, each=null) {
        const matchedHandlers = this.handlerList.filter(handler => {
            if (handler.keyword instanceof RegExp && handler.keyword.test(target)) {
                return true;
            }
        
            if (typeof handler.keyword === 'string') {
                if (handler.keyword === target) {
                    return true
                } else if (typeof each === 'function') {
                    each(handler)
                }
            }
        })
        return matchedHandlers
    },
}


//// End helpers
    // No more: <@help>, <@spawn>, <@despawn>
    // setup tasks so we're ready
    return async (envelope) => {
        let reqType = typeIdentifier(envelope)
        const additionalInfo = await getEnhancedDetails(envelope, reqType)
        const { personId, roomId, roomType} = envelope.data

        // remove bot from group rooms, ex @botname command12345
        let textFlag = (roomType === 'group' && additionalInfo.text) ? additionalInfo.text.split(' ').slice(1).join(' ') : (additionalInfo.text && additionalInfo.text.toLowerCase() || null)
        // set some globals
        globals.roomId = roomId   
        globals.roomType = roomType
        globals.storagelookup = `${roomId}_${personId}`
        globals.token = token


        if (envelope.data) {     
            // Step 0: if it's from a bot, don't do any work
            const isHuman = await helpers.isHuman(personId)
            debug('-- message envelope --', textFlag, envelope)

            if (isHuman || reqType === constants.reqTypes.MEMBER_ADD) {
                // take care of special case right away, don't do anything else
                if (globals.config.features.shortcuts) {
                    if (textFlag === '$clear' ) {
                         return helpers.clearScreen()
                    } else if (textFlag === '$biscotti')  {
                        return helpers.send(new SpeedyCard().setUrl('https://www.youtube.com/watch?v=6A8W77m-ZTw&t=102s', 'Biscotti').setTitle('Biscotti').setImage('https://i3.ytimg.com/vi/6A8W77m-ZTw/maxresdefault.jpg'))
                    } else if (textFlag === '$kosmo') {
                        return helpers.send(new SpeedyCard().setUrl('https://www.youtube.com/watch?v=YKIjXoiubzc', 'Watch').setTitle('Jonny Kosmo Jessica Triangle').setImage('https://i3.ytimg.com/vi/YKIjXoiubzc/maxresdefault.jpg'))
                    }
                }

                // Going forward, people will need less "handlers" & more integrations
                // The key ones are probably <@submit>, <@fileupload>, <@catchall>
                let targets = [constants.catchall, constants.nomatch]
                if (reqType === 'AA') {
                    const isChip = (additionalInfo.inputs && additionalInfo.inputs.chip_action) ? true : false
                    if (!isChip) {
                        // Don't need catchall or nomatch just submit
                        targets = [constants.submit]
                    } else {
                        const { disappearOnTap } = globals.config.features.chips
                        if (disappearOnTap) {
                            await deleteMessage(additionalInfo.messageId)
                        }
                        // try to find a matching handler for the "chip"

                        // Two tricks to make chips invocable
                        // 1) set reqType to 'TEXT'
                        reqType = constants.reqTypes.TEXT
                        // 2) Set the "textFlag"
                        textFlag = additionalInfo.inputs.chip_action.toLowerCase()
                        targets.push(textFlag)
                    }
                }

                if (reqType === 'FILE') {
                    targets.push(constants.file)
                }

                if (reqType === 'MEMBERSHIP:REMOVE') {
                  targets = [constants.removebot] // May not to be allowed to bot.say?
                }

                if (reqType === 'MEMBERSHIP:ADD') {
                  targets = [constants.addbot] 
                }

                if (reqType === 'TEXT') {
                    if (targets.indexOf(textFlag) === -1) {
                        targets.push(textFlag)
                    }
                }

                // Retrieve list of targets
                const handlerStash = {}
                targets.forEach(target => handlerStash[target] = true)

                // Get a list of handlers
                if (Array.isArray(handlers)) {
                    const checkKeyword = (keyword, handler) => {
                        const lowered = keyword.toLowerCase()
                        if (handlerStash[lowered]) {
                            handlerStash[lowered] = handler
                        } else if (keyword instanceof RegExp) {
                            const target = (globals.roomType === 'group' && additionalInfo.text) ? 
                                                                            additionalInfo.text.split(' ').slice(1).join(' ') :
                                                                            additionalInfo.text
                            const pass = keyword.test(target)
                            if (pass) {
                                handlerStash[target] = handler
                            }
                        }
                    }
                    handlers.forEach(handler => {
                        const { keyword } = handler
                        if (typeof keyword === 'string') {
                            checkKeyword(keyword, handler)
                            } else if (Array.isArray(keyword)) {
                                keyword.forEach(kw => {
                                    checkKeyword(kw, handler)
                                })
                            }
                    })
                } else if (typeof handlers === 'object') {
                    targets.forEach(target => {
                        if (handlers[target]) {
                            handlerStash[target] = handlers[target]
                        }
                    })
                }
           
                // Util to make sure there's an invocable handler
                const getHandler = (name) => { 
                    const exists = handlerStash[name] && typeof handlerStash[name].handler === 'function'
                    if (exists) {
                        return handlerStash[name]
                    } else {
                        return null
                    }
                }

                debug('-- debug before matching --', {
                    reqType,
                    textFlag,
                    envelope,
                    additionalInfo,
                    targets,
                    handlerStash,
                    globals,
                })

                // Invoke handlers
                // If debug enabled, send errors to chat if possible

                try {
                    
                
                // get memberships out of th eway
                if (reqType === constants.reqTypes.MEMBER_REMOVE) {
                    // No op for now
                    // const removeHandler = getHandler(constants.removebot)
                    // const trigger = await buildTrigger(envelope, additionalInfo, reqType)
                    // // maybe give them a degraded bot?
                    // await removeHandler.handler(bot, trigger)
                }
                if (reqType === constants.reqTypes.MEMBER_ADD) {
                    const addHandler = getHandler(constants.addbot)
                    // This isn't what you think it is
                    const trigger = await buildTrigger(envelope, additionalInfo, reqType)
                    await addHandler.handler(bot, trigger)
                }

                if (reqType === constants.reqTypes.AA && getHandler(constants.submit)) {
                    const { handler } = handlerStash[constants.submit]
                    const trigger = await buildTrigger(envelope, additionalInfo, reqType)
                    await handler(bot, trigger)
                }

                if (reqType !== constants.reqTypes.AA) {
                    if (reqType === constants.reqTypes.FILE) {
                        const fileHandler = getHandler(constants.file)
                        const trigger = await buildTrigger(envelope, additionalInfo, reqType)
                        await fileHandler.handler(bot, trigger)
                    } else {
                        
                        // Match it on regex or string comparision
                        // also check for array case for matching
                        const catchall = getHandler(constants.catchall)
                        const nomatch = getHandler(constants.nomatch)
                        const candidateHandler = getHandler(textFlag)

                        if (catchall) {
                            const trigger = await buildTrigger(envelope, additionalInfo, reqType)
                            await catchall.handler(bot, trigger)
                        }

                        if (candidateHandler) {
                            const trigger = await buildTrigger(envelope, additionalInfo, reqType)
                            await candidateHandler.handler(bot, trigger)
                        } else if (getHandler(constants.nomatch)) {
                            const noMatch = getHandler(constants.nomatch)
                            const trigger = await buildTrigger(envelope, additionalInfo, reqType)
                            await noMatch.handler(bot, trigger)
                        }
                    }
                }

            } catch(e) {
                const debugHash = {
                    textFlag,
                    reqType,

                }
                console.log('Error', e, debugHash)
                if (globals.debug) {
                    helpers.send(`There was an error ${e}`)
                }
            }

                await helpers.delay() // v8 isolate can collapse before request is made

            } else {
                return {
                    status:200,
                    statusText: 'ok'
                }
            }
        }
    }
}



function SpeedyCard() {
// SpeedyCard per https://github.com/valgaze/speedybot/blob/master/src/cards.ts
class _SpeedyCard {
    constructor() {
        this.title = '';
        this.subtitle = '';
        this.titleConfig = {};
        this.subTitleConfig = {};
        this.choices = [];
        this.choiceConfig = {};
        this.image = '';
        this.imageConfig = {};
        this.buttonLabel = 'Submit';
        this.inputPlaceholder = '';
        this.inputConfig = {
            id: 'inputData',
        };
        this.url = '';
        this.urlLabel = 'Go';
        this.tableData = [];
        this.attachedData = {};
        this.needsSubmit = false;
        this.dateData = {};
        this.timeData = {};
        this.json = {
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "type": "AdaptiveCard",
            "version": "1.0",
            "body": []
        };
    }
    setTitle(title, config) {
        this.title = title;
        if (config) {
            this.titleConfig = config;
        }
        return this;
    }
    setSubtitle(subtitle, config) {
        this.subtitle = subtitle;
        if (config) {
            this.subTitleConfig = config;
        }
        return this;
    }
    setChoices(choices, config) {
        this.choices = choices.map((choice, idx) => {
            return {
                title: choice,
                value: choice
            };
        });
        if (config) {
            this.choiceConfig = config;
        }
        return this;
    }
    setImage(url, imageConfig) {
        this.image = url;
        if (imageConfig) {
            this.imageConfig = imageConfig;
        }
        return this;
    }
    setButtonLabel(label) {
        this.buttonLabel = label;
        return this;
    }
    setInput(placeholder, config) {
        this.inputPlaceholder = placeholder;
        if (config) {
            this.inputConfig = config;
        }
        return this;
    }
    setUrl(url, label = 'Go') {
        this.urlLabel = label;
        this.url = url;
        return this;
    }
    setTable(input) {
        let core = input;
        if (!Array.isArray(input) && typeof input === 'object') {
            core = Object.entries(input);
        }
        this.tableData = core;
        return this;
    }
    setData(payload) {
        if (payload) {
            this.attachedData = payload;
            this.needsSubmit = true;
        }
        return this;
    }
    setDate(id = "selectedDate", label = 'Select a date') {
        const payload = {
            "type": "Input.Date",
            id,
            label
        };
        this.dateData = payload;
        return this;
    }
    setTime(id = "selectedTime", label = 'Select a time') {
        const payload = {
            "type": "Input.Time",
            id,
            label
        };
        this.timeData = payload;
        return this;
    }
    setChips(chips) {
        const chipPayload = chips.map(chip => {
            let chipLabel = '';
            let chipAction = '';
            if (typeof chip === 'string') {
                chipLabel = chip;
                chipAction = chip;
            }
            else {
                const { label, keyword = '' } = chip;
                chipLabel = label;
                if (keyword) {
                    chipAction = keyword;
                }
                else {
                    chipAction = label;
                }
            }
            const payload = {
                "type": "Action.Submit",
                "title": chipLabel,
                "data": {
                    "chip_action": chipAction
                }
            };
            return payload;
        });
        this.json.actions = this.json.actions ? this.json.actions.push(chipPayload) : chipPayload;
        return this;
    }
    render() {
        var _a;
        if (this.title) {
            const payload = Object.assign({ type: 'TextBlock', text: this.title, weight: 'Bolder', size: 'Large', wrap: true }, this.titleConfig);
            this.json.body.push(payload);
        }
        if (this.subtitle) {
            const payload = Object.assign({ type: 'TextBlock', text: this.subtitle, size: "Medium", isSubtle: true, wrap: true, weight: 'Lighter' }, this.subTitleConfig);
            this.json.body.push(payload);
        }
        if (this.tableData && this.tableData.length) {
            const payload = {
                "type": "FactSet",
                "facts": []
            };
            this.tableData.forEach(([label, value], i) => {
                const fact = {
                    title: label,
                    value
                };
                payload.facts.push(fact);
            });
            this.json.body.push(payload);
        }
        if (this.image) {
            const payload = Object.assign({ type: "Image", url: this.image, horizontalAlignment: "Center", size: "Large" }, this.imageConfig);
            this.json.body.push(payload);
        }
        if (this.choices.length) {
            this.needsSubmit = true;
            const payload = Object.assign({ type: 'Input.ChoiceSet', id: 'choiceSelect', "value": "0", "isMultiSelect": false, "isVisible": true, choices: this.choices }, this.choiceConfig);
            this.json.body.push(payload);
        }
        if (this.inputPlaceholder) {
            this.needsSubmit = true;
            const payload = Object.assign({ "type": "Input.Text", placeholder: this.inputPlaceholder }, this.inputConfig);
            this.json.body.push(payload);
        }
        if (Object.keys(this.dateData).length) {
            const { id, type, label } = this.dateData;
            if (label) {
                this.json.body.push({
                    "type": "TextBlock",
                    "text": label,
                    "wrap": true
                });
            }
            if (id && type) {
                this.json.body.push({ id, type });
            }
            this.needsSubmit = true;
        }
        if (Object.keys(this.timeData).length) {
            const { id, type, label } = this.timeData;
            if (label) {
                this.json.body.push({
                    "type": "TextBlock",
                    "text": label,
                    "wrap": true
                });
            }
            if (id && type) {
                this.json.body.push({ id, type });
            }
            this.needsSubmit = true;
        }
        if (this.needsSubmit) {
            const payload = {
                type: "Action.Submit",
                title: this.buttonLabel,
            };
            if (this.attachedData) {
                payload.data = this.attachedData;
            }
            if ((_a = this.json.actions) === null || _a === void 0 ? void 0 : _a.length) {
                this.json.actions.push(payload);
            }
            else {
                this.json.actions = [payload];
            }
        }
        else {
            if (this.attachedData && Object.keys(this.attachedData).length) {
                console.log(`attachedData ignore, you must call at least either .setInput(), .setChoices, .setDate, .setTime, to pass through data with an adaptive card`);
            }
        }
        if (this.url) {
            const payload = {
                type: "Action.OpenUrl",
                title: this.urlLabel,
                url: this.url,
            };
            if (this.json.actions) {
                this.json.actions.push(payload);
            }
            else {
                this.json.actions = [payload];
            }
        }
        return this.json;
    }
    renderFull() {
        const cardData = this.render();
        const fullPayload = {
            "roomId": "__REPLACE__ME__",
            "markdown": "Fallback text **here**",
            "attachments": [cardData]
        };
        return fullPayload;
    }
  }
  return new _SpeedyCard()
}

// Intercept incoming requests
function SpeedybotInterceptor (request, webhookHandlers=[]) {
  const url = request.url || ''
  const isRoot = url.indexOf('/') === 1
  const route = isRoot ? '/' : url.split('/').pop()
  if (request.method === 'GET') {
    const url = request['url']
    const response =`[${new Date()}]
    
Don't forget to set up your webhooks in your terminal by entering:

$ npm init speedybot -t __replace_me__ -w ${url}


If you need more help see https://github.com/valgaze/speedybot-hub/blob/master/quickstart.md
or enter in your terminal: $ npx speedybot-hub help
`


    return {
      proceed: false,
      response: new Response(response, {status: 200, statusText: Response})
    }
  } else {

    if (request.method === 'POST') 
    return {
      proceed: true,
      response: null
    }
  }
}



// Secret checker
function speedybotSecurity (request, secret, opts={}) {
    if (opts.env === 'node') {
        // 
        const crypto = require('crypto');
        const validate = (signature, requestBody, secret) => {
            const hmac = crypto.createHmac('sha1', secret);
            if (typeof requestBody === 'string') {
                hmac.update(requestBody);
            } else {
                hmac.update(JSON.stringify(requestBody));
            }
            const isValid = hmac.digest('hex') == signature;
            return isValid
        }
    } else {
        // Use webcrypto in Isolate, other environments
        // https://jameshfisher.com/2017/10/31/web-cryptography-api-hmac/

        const isValid = true
        return isValid
    }

    const isValid = true
    return isValid
}


/* ***************** Ignore everything below ****/
async function handleRequest(request, event) {

   // 1) Check if we should do anything with this
   // optionally handle incoming webhooks to specific routes
   const res = await SpeedybotInterceptor(request)
   if (!res.proceed) {
     return res.response
   }
   const envelope = await request.json()

   let pass = true // default is no validation
   const secretSignature = request.headers.get('X-Spark-Signature')
   if ((secretSignature && config.validate) || config.validate) {
      if (typeof config.validate === 'string') {
        pass = await speedybotSecurity(envelope, config.validate)
       } else if (typeof config.validate === 'function') {
        pass = await speedybotSecurity(envelope, 'my_secret_abc')
       }
   }
   if (pass) {
    const inst = await SpeedybotMini(config.token, handlers)
    await inst(envelope)
    return new Response('ok', { status: 200})
   } else {
    return new Response('ok', { status: 200 , statusText: 'Request did not pass user-provided validation'})
   }
}

addEventListener('fetch', event => {
  return event.respondWith(handleRequest(event.request, event));
});

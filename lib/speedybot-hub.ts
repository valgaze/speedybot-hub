// todo: rejigger into a class, this mini-function 
// approach works but spiraled out of control
import { SpeedyConfig, SpeedyCard } from './index'
export const reqTypesEnum  = Object.freeze({
    AA: 'AA',
    FILE: 'FILE',
    TEXT: 'TET',
    'MEMBERSHIP_ADD': 'MEMBERSHIP:ADD',
})

// For serverless this is basically useless no-op storage...
class _defaultStorage {
    private _storage:{[key: string]: any} = {}
    
    constructor(private storagePrefix: string) {}

    public async save<T=any>(key: string, data:T) {
        this._storage[this.makeKey(key)] = data
    }
    
    public async get<T=any>(key: string): Promise<T> {
        const realKey = `${this.storagePrefix}_${key}`
        return this._storage[this.makeKey(key)]
    }

    async delete(key:string) {
        delete this._storage[this.makeKey(key)]
    }

    private makeKey(key: string) {
        return `${this.storagePrefix}_${key}`
    }
}

export async function SpeedybotMini(config:SpeedyConfig, handlers = []) {
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
        token:config.token,
        roomId: '',
        roomType: '', // group or direct
        botName: '',
        botEmail: '',
        $toragelookup: '',
        debug: Boolean(config.debug),
        config: {
            features: {
                shortcuts: true,
                chips: {
                    disappearOnTap: false,
                },
            },
            storage: null
        },
        i18n: config.locales || {}
    }
    const debug = (...payload: any) => {
        if (globals.debug) {
            console.log.apply(console, payload as [any?, ...any[]]); 
        }
    }
    const constants = {
        catchall: '<@catchall>',
        submit: '<@submit>',
        file: '<@fileupload>',
        nomatch: '<@nomatch>',
        addbot: '<@botadded>',
        removebot: '<botremoved>',
        help: '<@help>',
        reqTypes: {
            TEXT: 'TEXT',
            AA: 'AA',
            FILE: 'FILE',
            MEMBER_REMOVE: 'MEMBERSHIP:REMOVE',
            MEMBER_ADD: 'MEMBERSHIP:ADD'
        }
    }

    // Extend this with superpowers, no more imports
    // handler($bot, trigger)
    const bot = {
        i18n(locale: object, lookup: string, template = {}, fallback = '', ) {
            const _get = (locale, lookup = '', fallback) => {
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
            const selectedLocale = globals.i18n[locale] || {}
            const content = _get(selectedLocale, lookup, fallback)
            if (Object.keys(template)) {
                return this.fillTemplate(content, template)
            } else {
                return content
            }
        },
        async get(url, opts = {}) {
            const defaultConfig = {
                method: 'GET',
                'content-type': 'application/json;charset=UTF-8',
                raw: false,
                headers: {}
            }
            const contentType = opts['content-type'] ? opts['content-type'] : defaultConfig['content-type']
            const additionalHeaders = opts.headers ? opts.headers : {}
            const init = {
                method: opts.method ? opts.method : defaultConfig.method,
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
        async post(url, opts = {}) {
            const defaultConfig = {
                method: 'POST',
                'content-type': 'application/json;charset=UTF-8',
                raw: false,
                headers: {}
            }
            const contentType = opts['content-type'] ? opts['content-type'] : defaultConfig['content-type']
            const additionalHeaders = opts.headers ? opts.headers : {}
            const init = {
                method: opts.method ? opts.method : defaultConfig.method,
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
        sendRandom(utterances = [], template = {}) {
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
            return helpers.getFile(url, opts = {})
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
        dmCard(personId, cardData, fallbackText = '') {
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

    const makeRequest = async (url, body, opts = {}) => {
        const defaultConfig = {
            method: 'POST',
            'content-type': 'application/json;charset=UTF-8',
            raw: false
        }
        const contentType = opts['content-type'] ? opts['content-type'] : defaultConfig['content-type']
        const additionalHeaders = opts.headers ? opts.headers : {}
        const init = {
            method: opts.method ? opts.method : defaultConfig.method,
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
                const {
                    files = []
                } = payload.data
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
        const {
            data
        } = envelope
        const {
            id
        } = data
        url = `${url}/${id}`
        const res = await makeRequest(url, {}, {
            method: 'GET'
        })
        const json = await res.json()
        return json
    }

    const buildTrigger = async (baseTrigger, enhancedTrigger = {}, type) => {

        // get person data up front
        const {
            personId
        } = enhancedTrigger
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
                    const {
                        chip_action
                    } = enhancedTrigger.inputs
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
            const res = await makeRequest(API.sendMessage, body, {
                method: 'POST',
                'content-type': 'application/json'
            })
            const json = await res.json()
            debug('[Send function, json]', json)
            return json
        },
        sendDataFromUrl(url, fallbackText = ' ') {
            return this.send({
                files: [url],
                text: fallbackText
            })
        },
        pickRandom(list = []) {
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
            } catch (e) {
                throw '[ERROR] speedybot-hub was unable to save data'
            }
        },
        async getData(key, data) {
            try {
                const client = globals.config.storage
                const res = await client.get(key)
                return res
            } catch (e) {
                throw '[ERROR] speedybot-hub was unable to retrieve data'
            }
        },
        async deleteData(key, data) {
            const client = globals.config.storage
            const res = await client.delete(key, data)
        },
        async getFile(url, opts = {}) {
            const res = await makeRequest(url, {}, {
                method: 'GET'
            })
            const type = res.headers.get('content-type')
            const contentDispo = res.headers.get('content-disposition')
            const fileName = contentDispo.split(';')[1].split('=')[1].replace(/\"/g, '')
            const extension = fileName.split('.').pop() || ''
            // data could be binary if user needs it 
            const shouldProbablyBeArrayBuffer = (!type.includes('json') && !type.includes('txt')) || type.includes('image')
            let data = res
            if (opts.responseType === 'arraybuffer' || shouldProbablyBeArrayBuffer) {
                try {
                    data = await res.arrayBuffer()
                } catch (e) {
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
        handleExtension(input = '') {
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
                mpkg: 'application/vnd.apple.installer+xml',
                vf: 'application/json', // voiceflow
            }
            const res = mapping[extension] || null
            return res
        },
        async sendDataAsFile(data, extensionOrFileName, contentType, fallbackText = '', overrides = {}) {
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
            const {
                toPersonId = null, toPersonEmail = null
            } = overrides
            const label = toPersonId ? 'toPersonId' : (toPersonEmail ? 'toPersonEmail' : 'roomId')
            const destinationValue = toPersonId ? toPersonId : (toPersonEmail ? toPersonEmail : globals.roomId)

            const isJSON = data && typeof data === 'object' && finalContentType.includes('json')
            formData.append('files', new Blob([isJSON ? JSON.stringify(data, null, 2) : data], {
                type: finalContentType
            }), fullFileName)
            // formData.append('roomId', globals.roomId)
            formData.append(label, destinationValue)
            formData.append('text', fallbackText)

            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${globals.token}`, );
            const requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: formData,
            };
            const res = await fetch(API.sendMessage, requestOptions)
            return res
        },
        async snippet(data, dataType = 'json') {
            const msg = `
        \`\`\`${dataType}
        ${dataType === 'json' ? JSON.stringify(data, null, 2) : data}
        \`\`\``
            return msg
        },
        clearScreen(repeatCount = 50) {
            const newLine = '\n'
            const repeatClamp = repeatCount > 7000 ? 5000 : repeatCount // 7439 char limit
            const clearScreen = `${newLine.repeat(repeatClamp)}`
            const payload = {
                markdown: clearScreen,
                text: clearScreen
            }
            this.send(payload)
        },
        async delay(ms = 100) {
            return new Promise(resolve => setTimeout(() => resolve(), ms));
        },
        async getSelf() {
            const url = API.getSelf
            const res = await makeRequest(url, {}, {
                method: 'GET'
            })
            const json = await res.json()
            return json
        },
        async isHuman(personId, fullPayload = false) {
            const data = await this.getSelf()
            const {
                id
            } = data
            if (fullPayload) {
                return data
            }
            return id !== personId
        },
        async getPersonDetails(personId) {
            const url = `${API.getPersonDetails}/${personId}`
            const res = await makeRequest(url, {}, {
                method: 'GET'
            })
            const json = await res.json()
            return json
        },
        async deleteMessage(messageId) {
            const url = `${API.deleteMessage}/${messageId}`
            const res = await makeRequest(url, {}, {
                method: 'DELETE'
            })
            return res
        },
        findHandler(target, handlers = [], trigger, each = null) {
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
        const {
            personId,
            roomId,
            roomType
        } = envelope.data

        // remove bot from group rooms, ex @botname command12345
        let textFlag = (roomType === 'group' && additionalInfo.text) ? additionalInfo.text.split(' ').slice(1).join(' ') : (additionalInfo.text && additionalInfo.text.toLowerCase() || null)
        // set some globals
        globals.roomId = roomId
        globals.roomType = roomType
        globals.storage = new config.storage(`${roomId}_${personId}`)
        globals.token = token


        if (envelope.data) {
            // Step 0: if it's from a bot, don't do any work
            const isHuman = await helpers.isHuman(personId)
            debug('-- message envelope --', textFlag, envelope)

            if (isHuman || reqType && reqType === reqTypesEnum.MEMBERSHIP_ADD) {
                // take care of special case right away, don't do anything else
                if (globals.config.features.shortcuts) {
                    if (textFlag === '$clear') {
                        return helpers.clearScreen()
                    } else if (textFlag === '$biscotti') {
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
                        const {
                            disappearOnTap
                        } = globals.config.features.chips
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
                        const {
                            keyword
                        } = handler
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
                        const {
                            handler
                        } = handlerStash[constants.submit]
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

                } catch (e) {
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
                    status: 200,
                    statusText: 'ok'
                }
            }
        }
    }
}

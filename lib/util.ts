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

// RUH ROH...
const globals = {
    roomId: 'string',
}

export const helpers = {
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
    async sendDataAsFile(data:string | ArrayBuffer | Blob, extensionOrFileName:string, contentType:string, fallbackText = '', overrides:{toPersonId?:string, roomId?: string} = {}) {
        if (!extensionOrFileName) {
            throw new Error(`$(bot).sendDataAsFile: Missing filename/extension parameter, ex "myfile.png" or "*.png"`)

        }
        let finalContentType = contentType
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
        const formData = new FormData(); // for nodejs/non-isloate environments need to add form-data as dependency
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
    async snippet<T=any>(data:T, dataType = 'json') {
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
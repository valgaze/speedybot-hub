//@ts-nocheck
// This is LOOSE (no types), copy & paste and you're off 🚀
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
 * $ npm init speedybot webhook create -- -t __replace_token_here -w https://speedybot-hub.yourusername.workers.dev
 *
 * Instructions: https://github.com/valgaze/speedybot-hub/blob/deploy/quickstart.md
 */

// STEP 1: add your bot-token here, get one here if you don't have one: https://developer.webex.com/my-apps/new
const BOT_TOKEN = '__REPLACE__ME__'

// STEP 2: Add your handlers, a keyword can be any phrase a regex, or a list of phrases + regex
var handlers = [
  {
    keyword: ['hi', 'hello', 'hey', 'yo', 'watsup', 'hola'],
    async handler($bot, trigger) {
      const utterances = [
        `Heya how's it going $[name]?`,
        `Hi there, $[name]!`,
        `Hiya $[name]!`,
        `What's new $[name]?`,
        `Helllooo $[name]!`,
      ]
      const template = {
        name: trigger.person.displayName,
      }
      await $bot.sendTemplate(utterances, template)
      $bot.send(
        $bot.card({
          title: 'You can pick an option below or type "help" for more info',
          chips: [
            'ping',
            'pong',
            'alert',
            {
              label: 'Location Demo',
              keyword: 'location',
            },
            'kitchensink',
            'healthcheck',
            {
              label: 'Get advice',
              keyword: 'advice',
            },
          ],
        })
      )
    },
  },
  {
    keyword: '<@submit>',
    handler($bot, trigger) {
      $bot.say(
        `Submission received! You sent us ${JSON.stringify(
          trigger.attachmentAction.inputs
        )}`
      )
    },
  },
  {
    keyword: 'advice',
    async handler($bot) {
      const API = [
        {
          url: 'https://api.adviceslip.com/advice',
          lookUpPath: 'slip.advice',
          label: `Here's some advice`,
        },
        {
          url: 'https://api.quotable.io/random',
          lookUpPath: 'content',
          label: `A quote for you`,
        },
      ]
      const api = $bot.pickRandom(API)
      if (api) {
        const { url, lookUpPath, label } = api
        const res = await $bot.api(url)
        $bot.send(
          $bot.card({
            title: label,
            subTitle: $bot.lookUp(
              res,
              lookUpPath,
              'The best laid plans can fail'
            ),
            chips: [
              {
                label: $bot.pickRandom([
                  'Give me more advice 💥',
                  `Let's do one more 🏝`,
                  `Let's do it again!🌙`,
                  'Do another one! 🌺',
                ]),
                keyword: 'advice',
              },
              {
                label: 'Restart 🔄',
                keyword: 'hi',
              },
            ],
          })
        )
      }
    },
  },
  {
    keyword: 'alert',
    async handler($bot, trigger) {
      const danger = $bot
        .dangerCard({
          title: '⛔️DANGER-- do not do that!⛔️',
          subTitle: 'There is a very important reason not to do that',
        })
        .setDetail(
          $bot.dangerCard({
            title: 'Timeline',
            table: [
              ['🌟', 'Incident details 1'],
              ['💫', 'Incident details 2'],
              ['🌴', 'Incident details 3'],
            ],
          }),
          'Incident Details'
        )
      $bot.send(danger)
      const warning = $bot.warningCard({
        title:
          '⚠️Warning-- you should consider carefully if you want to do that!⚠️',
        subTitle:
          'There is a very important reason to slow down and consider if you want to do that...or not',
        chips: ['ping', 'pong'],
      })
      $bot.send(warning)
      const success = $bot.successCard({
        title: '🌟You did it!🎉',
        subTitle: 'Whatever you did, good at job at doing it',
        chips: ['ping', 'pong'],
      })
      $bot.send(success)
      const sky = $bot.skyCard({
        title: "☁️You're doing it☁️",
        subTitle: "Whatever you're doing, do it more",
        chips: ['ping', 'pong'],
      })
      $bot.send(sky)
      const $peedy = $bot.skyCard({
        title: 'Speedybot-- nice banner',
      })
      $bot.send($peedy)
    },
  },
  {
    keyword: 'help',
    handler($bot) {
      const help = $bot.generateHelp()
      $bot.send(
        $bot.card({
          title: 'Help commands',
          table: help.map(({ label, helpText }, idx) => [
            String(idx),
            `${label}: ${helpText}`,
          ]),
          chips: help.map(({ label }) => label),
        })
      )
    },
    helpText: 'Show the user help information',
  },
  {
    keyword: 'location',
    async handler($bot, trigger) {
      $bot.locationAuthorizer(trigger)
    },
    helpText: 'Prompt the user to ask for permission questions',
  },
  {
    keyword: '$clear',
    async handler($bot, trigger) {
      $bot.clearScreen()
    },
    helpText: '(helper) clear the screen',
  },
  {
    keyword: 'healthcheck',
    handler($bot) {
      // Adapative Card: https://developer.webex.com/docs/api/guides/cards
      const card = $bot
        .card({
          title: 'System is 👍',
          subTitle: 'If you see this card, everything is working',
          image:
            'https://raw.githubusercontent.com/valgaze/speedybot/master/docs/assets/chocolate_chip_cookies.png',
          url: 'https://www.youtube.com/watch?v=3GwjfUFyY6M',
          urlLabel: 'Take a moment to celebrate',
          table: [[`Bot's Date`, new Date().toDateString()]],
        })
        .setInput(`What's on your mind?`)
        .setData({ mySpecialData: { a: 1, b: 2 } })
        .setChoices(['option a', 'option b', 'option c'])

      $bot.send(card)
    },
    helpText: 'Sends an Adaptive Card with an input field to the user',
  },
  {
    keyword: 'kitchensink',
    async handler($bot, trigger) {
      // Clearscreen (only works desktop)
      await $bot.clearScreen()
      await $bot.send(`## Kitchen Sink`)
      // $bot.translate
      $bot.send($bot.translate('cn', 'greetings.welcome'))
      $bot.send($bot.translate('es', 'greetings.welcome'))
      $bot.send(
        $bot.translate('DOESNTEXIST', 'greetings.welcome', {}, 'hi (fallback!)')
      )
      // Files
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
      // Send HTML w/ dynamic data
      $bot.sendDataAsFile(
        makeHTML(
          `Here's your generated file, ${trigger.person.firstName}`,
          trigger
        ),
        'html'
      )
      // Thread
      await $bot.thread([
        $bot.card({
          title: `This is a 'thread'`,
          subTitle: 'You can have many entries after the 1st',
          chips: [
            {
              keyword: 'kitchensink',
              label: 'Go again!!',
            },
          ],
        }),
        'thread item 1',
        'thread item 2',
        'thread item 3',
        'thread item 4',
        'thread item 5',
      ])
      // DM (can DM a card or a message)
      $bot.dm(
        trigger.personId,
        $bot.card({
          title: 'biscotti v biscotto',
          subTitle: 'Learn the difference',
          url: 'https://www.youtube.com/watch?v=6A8W77m-ZTw&t=102s',
          urlLabel: 'Learn more 🍪',
        })
      )
      // Randomiation/response variation
      const utterances = [
        `Heya how's it going $[name]?`,
        `Hi there, $[name]!`,
        `Hiya $[name]`,
        `What's new $[name]`,
        `Helllooo $[name]`,
      ]
      const template = {
        name: trigger.person.displayName,
      }
      $bot.sendTemplate(utterances, template)
      // Send url
      $bot.sendURL('https://github.com/valgaze/speedybot-hub')
      $bot.sendJSON({ a: 1, b: 2, c: 3 }, 'Here is some snippet data')
      await $bot.sendRandom(['option a', 'option b', 'option c'])
      const b = $bot.skyCard({ title: 'Speedybot' })
      const r = $bot.dangerCard({ title: 'Speedybot' })
      const g = $bot.successCard({ title: 'Speedybot' })
      const y = $bot.warningCard({ title: 'Speedybot' })
      $bot.send(b)
      $bot.send(r)
      $bot.send(g)
      $bot.send(y)
    },
    helpText: 'A buncha stuff all at once',
  },
  {
    keyword: ['ping', 'pong'],
    async handler($bot, trigger) {
      const normalized = trigger.text.toLowerCase()
      if (normalized === 'ping') {
        $bot.say('pong')
      } else {
        $bot.say('ping')
      }
    },
    helpText: `A handler that says ping when the user says pong and vice versa`,
  },
  {
    // keyword: ['file','files','sendfile'],
    keyword: 'files',
    async handler($bot, trigger) {
      // await $bot.say(`Here are 3 files`)
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
      // Send HTML w/ dynamic data
      $bot.sendDataAsFile(
        makeHTML(
          `Here's your generated file, ${trigger.person.firstName}`,
          trigger
        ),
        'html'
      )
    },
  },
  {
    keyword: '<@nomatch>',
    async handler($bot, trigger) {
      const utterances = [
        `Sorry, I don't know what '$[text]' means`,
        `Whoops, this agent doesn't support '$[text]'`,
        `'$[text]' is not a supported command`,
      ]
      const template = {
        text: trigger.message.text,
      }
      $bot.sendTemplate(utterances, template)
    },
  },
  {
    keyword: '<@fileupload>',
    async handler($bot, trigger) {
      $bot.say('You uploaded a file')
      const [fileUrl] = trigger.message.files || []
      const fileData = await $bot.getFile(fileUrl, {
        responseType: 'arraybuffer',
      })
      const { fileName, extension, type } = fileData
      $bot.say(
        `The file you uploaded (${fileName}), is a ${extension} file of type ${type}`
      )
    },
    hideHelp: true,
  },
]

// step 3 (optional): adjust config below, add locales, validation function, etc
var config = {
  token: BOT_TOKEN,
  locales: {
    es: {
      greetings: {
        welcome: 'hola!!',
      },
    },
    cn: {
      greetings: {
        welcome: '\u4F60\u597D',
      },
    },
  },
  async validate(request) {
    // could check for x-spark-tok
   // const signature = request.headers.get('X-Spark-Signature')
   // const json = await request.json()
   // // if valid return { proceeed: true}

    return {
      proceed: true,
    }
  },
  async location($bot) {
    await $bot.send(
      $bot
        .card({
          title: `Good ${$bot.location.tod}`,
          subTitle: `Note: this timezone + location data is not stored/collected/sold and is not hyper-accurate. It's accurate enough to understand if its dark/light outside whenever a user is located`,
        })
        .setTable([
          ['Country', $bot.location.country],
          ['City', $bot.location.city],
          ['Region', $bot.location.region],
          ['Timezone', $bot.location.timezone],
        ])
        .setUrl(
          `https://maps.google.com/?q=${$bot.location.latitude},${$bot.location.longitude}`,
          'See map 🗺'
        )
    )
    await $bot.send(
      $bot.card({
        title: 'Restart?',
        chips: [{ keyword: 'hi', label: '🔄 Restart' }],
      })
    )
  },
  debug: true,
  fallbackText:
    'Sorry, it does not appear your client supports rendering cards',
}



// speedybot-hub @1.0.1, see here for setup details: https://github.com/valgaze/speedybot-hub/blob/deploy/quickstart.md
var j={getMessageDetails:"https://webexapis.com/v1/messages",getAttachmentDetails:"https://webexapis.com/v1/attachment/actions",getMembershipDetails:"https://webexapis.com/v1/memberships",getPersonDetails:"https://webexapis.com/v1/people",sendMessage:"https://webexapis.com/v1/messages",createWebhook:"https://webexapis.com/v1/webhooks",deleteWebhook:"https://webexapis.com/v1/webhooks",getWebhooks:"https://webexapis.com/v1/webhooks",getSelf:"https://webexapis.com/v1/people/me",deleteMessage:"https://webexapis.com/v1/messages"},G="__REPLACE__ME__",L=n=>{let e;if(n.resource==="messages")if("files"in n.data&&n.data.files?.length){let{files:t=[]}=n.data;t&&t.length&&(e="FILE")}else e="TEXT";return n.resource==="attachmentActions"&&(e="AA"),n.resource==="memberships"&&(n.event==="deleted"&&(e="MEMBERSHIP:REMOVE"),n.event==="created"&&(e="MEMBERSHIP:ADD")),e},y={isSpeedyCard(n){return typeof n=="object"&&"render"in n&&typeof n.render=="function"},isCard(n){if(this.isSpeedyCard(n))return!0;let e=JSON.stringify(n);return e.includes("AdaptiveCard")&&e.includes("$schema")&&e.includes("version")},isEmail(n){return n.includes("@")&&n.includes(".")}},T=async(n,e,t={})=>{let s={method:"POST","content-type":"application/json;charset=UTF-8",raw:!1},i=t["content-type"]?t["content-type"]:s["content-type"],a=t.headers?t.headers:{},o={method:t.method?t.method:s.method,headers:{"content-type":i,Authorization:`Bearer ${t.token}`,...a}};return t.method==="POST"&&(o.body=t.raw?e:JSON.stringify(e)),await fetch(n,o)},R=(n=[])=>n[Math.floor(Math.random()*n.length)],H=(n,e)=>{let t;typeof n!="string"?t=R(n)||"":t=n;let s=(i,a,o)=>i.includes(`$[${a}]`)?s(i.replace(`$[${a}]`,o),a,o):i;for(let i in e){let a=e[i];t=s(t,i,a)}return t},N=async(n,e,t,s)=>{let i=new URL(e.url),{pathname:a}=i;if(a in n){let o=n[a];if(typeof o=="function"){let r=o(e,t,s);return r||I()}if("handler"in o&&typeof o.handler=="function"){if("method"in o){let{method:l=""}=o;if(l.toLowerCase()!==e.method.toLowerCase())return new Response(`Expected method '${l}' rather than '${e.method}'`,{status:400})}if("validate"in o&&typeof o.validate=="function"){let{proceed:l}=await o.validate(e,t,s);return l?o.handler(e,t,s):new Response("Validation failed",{status:400})}let r=o.handler(e,t,s);return r||I()}}return I()},W=n=>new Response(n,{status:200,headers:{"content-type":"text/html;charset=UTF-8"}}),I=()=>new Response(`
  Server(less) Time: ${(new Date).toString()}
  *
  * \u2554\u2550\u2557 \u2554\u2550\u2557 \u2554\u2550\u2557 \u2554\u2550\u2557 \u2554\u2566\u2557 \u2566 \u2566 \u2554\u2557  \u2554\u2550\u2557 \u2554\u2566\u2557
  * \u255A\u2550\u2557 \u2560\u2550\u255D \u2551\u2563  \u2551\u2563   \u2551\u2551 \u255A\u2566\u255D \u2560\u2569\u2557 \u2551 \u2551  \u2551
  * \u255A\u2550\u255D \u2569   \u255A\u2550\u255D \u255A\u2550\u255D \u2550\u2569\u255D  \u2569  \u255A\u2550\u255D \u255A\u2550\u255D  \u2569 HUB
  *
  * Setup Instructions (make your own bot): https://github.com/valgaze/speedybot-hub
  * `,{status:200}),M=`<script src="https://code.s4d.io/widget-space/production/bundle.js"><\/script> <link rel="stylesheet" href="https://code.s4d.io/widget-space/production/main.css"> <link rel="stylesheet" href="https://code.s4d.io/widget-recents/production/main.css"> <script src="https://code.s4d.io/widget-recents/production/bundle.js"><\/script> <style>input{cursor: pointer; color: #34495e; font-size: 1rem; line-height: 1.4rem; width: 100%; font-family: 'Courier New'; margin: 6px; background: #ecf0f1;}*{font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; font-size: 14px; color: #34495e;}body{background-color: #ecf0f1;}.launch-button{background: #2ecc71; padding: 1%; color: #fff; font-weight: 900; font-family: sans-serif; border: none; border-radius: 14px; cursor: pointer;}.launch-button:hover{background: #41d47f;}.launch-wrap{padding: 1%;}</style> <body> <div class="chat-wrap"> <fieldset> <legend>WebEx in a Web Embed</legend> <div> <label>\u{1F446} Stable Source available <b><a href="https://github.com/valgaze/speedybot/blob/master/docs/webex.html" target="_blank">here</a></b>) </label> <br/> <label>Set access id (copy access token from <a href="https://developer.webex.com/my-apps" target="_blank">here</a>): </label> <input type="text" id="access_id_input" value="" placeholder="access id here"/> </div><button id="launch" class="launch-button">LAUNCH</button> </fieldset> <div class="launch-wrap"> <div style="display: flex; justify-content: center;"> <div id="webex-recent" style="width: 500px; height: 500px;"></div><div id="webex-space" style="width: 500px; height: 500px; background: radial-gradient(#e74c3c, transparent); display:flex; justify-content: center;"> <div> <h3>Select a 1-1 conversation from the left </h3> <div>Note: Bots can only request mentions, not whole conversations</div></div></div></div></div><fieldset> <legend>Send Rich Card</legend> <div class="form-group"> <label class="col-md-4 control-label" for="card_title">Title</label> <div class="col-md-4"> <input id="card_title" name="card_title" type="text"/> </div></div><div class="form-group"> <label for="card_subtitle">Subtitle</label> <div> <input id="card_subtitle" name="card_subtitle" type="text"/> </div></div><div class="form-group"> <label class="control-label" for="image_url">Image URL</label> <div> <input id="image_url" name="image_url" type="text"/> </div></div><button id="send_card" class="launch-button">Send Card</button> </fieldset> </div><script>let targetRoom=null; const urlParams=new URLSearchParams(window.location.search); const access_id=urlParams.get('access_id') const $recent=document.querySelector('#webex-recent') const $space=document.querySelector('#webex-space') const $input=document.querySelector('#access_id_input') const setInputs=(selectors, vals)=>{selectors.forEach((selector, idx)=>{document.querySelector(selector, idx).value=vals[idx]})}const mountRecent=($, access_id, $space)=>{try{webex.widget($).remove()}catch(e){}webex.widget($).recentsWidget({accessToken: access_id,}); $.addEventListener('rooms:selected', (e)=>{const{id}=e.detail.data mountSpace($space, access_id, id) targetRoom=id console.log('#', targetRoom)})}const mountSpace=($, access_id, roomId)=>{try{webex.widget($).remove()}catch(e){}webex.widget($).spaceWidget({accessToken: access_id, destinationId: roomId, destinationType: 'spaceId',});}document.querySelector('#launch').addEventListener('click', (e)=>{const access_id=$input.value mountRecent($recent, access_id, $space)}) document.querySelector('#send_card').addEventListener('click', (e)=>{if (!targetRoom){alert('Select a room first') return}const form={card_title: document.querySelector('#card_title'), card_subtitle: document.querySelector('#card_subtitle'), image_url: document.querySelector('#image_url'), send_card: document.querySelector('#send_card')}const card={title: form.card_title.value, subtitle: form.card_subtitle.value, url: form.image_url.value}const cardData=generateCard(card) sendCard(targetRoom, cardData)}) if (access_id){mountRecent($recent, access_id, $space) setInputs(['#access_id_input'], [access_id])}async function sendCard(roomId, cardPayload, fallbackText="It appears your client cannot render adpative cards."){const access_id=$input.value const endpoint='https://webexapis.com/v1/messages' const card={roomId, markdown: fallbackText, attachments: [{contentType: "application/vnd.microsoft.card.adaptive", content: cardPayload}]}const response=await fetch(endpoint,{method: 'POST', headers:{'Content-Type': 'application/json', 'Authorization': 'Bearer ' + access_id}, body: JSON.stringify(card)}) const content=await response.json();}function generateCard({title, subtitle, url}){const card={type: "AdaptiveCard", version: "1.0", body: []}if (title){card.body.push({type: "TextBlock", text: title, size: "large", weight: "bolder", color: "dark"})}if (subtitle){card.body.push({type: "TextBlock", text: subtitle, size: "medium", weight: "bolder", color: "dark"})}if (image_url){card.body.push({type: "Image", url: url})}return card}<\/script> </body>`,E=n=>{let e=t=>{let s=atob(t),i=s.length,a=new Uint8Array(i);for(var o=0;o<i;o++)a[o]=s.charCodeAt(o);return a.buffer};return new Response(e(n),{status:200,headers:{"content-type":"image/png"}})};var x=class{constructor(){this.title="";this.subtitle="";this.titleConfig={};this.subTitleConfig={};this.choices=[];this.choiceConfig={};this.image="";this.imageConfig={};this.buttonLabel="Submit";this.inputPlaceholder="";this.inputConfig={id:"inputData"};this.url="";this.urlLabel="Go";this.tableData=[];this.attachedData={};this.needsSubmit=!1;this.dateData={};this.timeData={};this.backgroundImage="";this.texts=[];this.details=[];this.json={$schema:"http://adaptivecards.io/schemas/adaptive-card.json",type:"AdaptiveCard",version:"1.0",body:[]}}setText(e){if(Array.isArray(e))e.forEach(t=>this.setText(t));else{let t={type:"TextBlock",text:e,horizontalAlignment:"Left",size:"Medium"};this.texts.push(t)}return this}setBackgroundImage(e){return this.backgroundImage=e,this}setTitle(e,t){return this.title=e,t&&(this.titleConfig=t),this}setSubtitle(e,t){return this.subtitle=e,t&&(this.subTitleConfig=t),this}setChoices(e,t){return this.choices=e.map((s,i)=>({title:String(s),value:String(s)})),t&&(this.choiceConfig=t),this}setImage(e,t){return this.image=e,t&&(this.imageConfig=t),this}setButtonLabel(e){return this.buttonLabel=e,this}setInput(e,t){return this.inputPlaceholder=e,t&&(this.inputConfig=t),this}setUrl(e,t="Go"){return this.urlLabel=t,this.url=e,this}setUrlLabel(e){return this.urlLabel=e,this}setTable(e){let t=e;return!Array.isArray(e)&&typeof e=="object"&&(t=Object.entries(e)),this.tableData=t,this}setData(e){return e&&(this.attachedData=e,this.needsSubmit=!0),this}setDate(e="selectedDate"){let t={type:"Input.Date",id:e};return this.dateData=t,this}setTime(e="selectedTime",t="Select a time"){let s={type:"Input.Time",id:e,label:t};return this.timeData=s,this}setDetail(e,t){let s=y.isCard(e),i=t||"Details";"label"in e&&(i=e.label);let a;return"render"in e?a=e.render():s||(a=this.card(e).render()),this.details.push({type:"Action.ShowCard",title:i,card:a}),this}setChips(e){let t=e.map(s=>{let i="",a="";if(typeof s=="string")i=s,a=s;else{let{label:r,keyword:l=""}=s;i=r,l?a=l:a=r}return{type:"Action.Submit",title:i,data:{chip_action:a}}});return this.json.actions=this.json.actions?this.json.actions.push(t):t,this}render(){if(this.backgroundImage&&(this.json.backgroundImage=this.backgroundImage),this.title){let e={type:"TextBlock",text:this.title,weight:"Bolder",size:"Large",wrap:!0,...this.titleConfig};this.json.body.push(e)}if(this.subtitle){let e={type:"TextBlock",text:this.subtitle,size:"Medium",isSubtle:!0,wrap:!0,weight:"Lighter",...this.subTitleConfig};this.json.body.push(e)}if(this.tableData&&this.tableData.length){let e={type:"FactSet",facts:[]};this.tableData.forEach(([t,s],i)=>{let a={title:t,value:s};e.facts.push(a)}),this.json.body.push(e)}if(this.image){let e={type:"Image",url:this.image,horizontalAlignment:"Center",size:"Large",...this.imageConfig};this.json.body.push(e)}if(this.choices.length){this.needsSubmit=!0;let e={type:"Input.ChoiceSet",id:"choiceSelect",value:"0",isMultiSelect:!1,isVisible:!0,choices:this.choices,...this.choiceConfig};this.json.body.push(e)}if(this.inputPlaceholder){this.needsSubmit=!0;let e={type:"Input.Text",placeholder:this.inputPlaceholder,...this.inputConfig};this.json.body.push(e)}if(Object.keys(this.dateData).length){let{id:e,type:t,label:s}=this.dateData;s&&this.json.body.push({type:"TextBlock",text:s,wrap:!0}),e&&t&&this.json.body.push({id:e,type:t}),this.needsSubmit=!0}if(Object.keys(this.timeData).length){let{id:e,type:t,label:s}=this.timeData;s&&this.json.body.push({type:"TextBlock",text:s,wrap:!0}),e&&t&&this.json.body.push({id:e,type:t}),this.needsSubmit=!0}if(this.texts.length&&this.texts.forEach(e=>{this.json.body.push(e)}),this.needsSubmit){let e={type:"Action.Submit",title:this.buttonLabel};this.attachedData&&Object.keys(this.attachedData).length&&(e.data=this.attachedData),this.json.actions?.length?this.json.actions.push(e):this.json.actions=[e]}else this.attachedData&&Object.keys(this.attachedData).length&&console.log("attachedData ignore, you must call at least either .setInput(), .setChoices, .setDate, .setTime, to pass through data with an adaptive card");if(this.url){let e={type:"Action.OpenUrl",title:this.urlLabel,url:this.url};this.json.actions?this.json.actions.push(e):this.json.actions=[e]}return this.details.length&&(this.json.actions||(this.json.actions=[]),this.details.forEach(e=>this.json.actions.push(e))),this.json}card(e={}){let t=new x,{title:s="",subTitle:i="",image:a="",url:o="",urlLabel:r="",data:l={},chips:c=[],table:A=[],choices:p=[],backgroundImage:d=""}=e;return d&&t.setBackgroundImage,s&&t.setTitle(s),i&&t.setSubtitle(i),a&&t.setImage(a),o&&t.setUrl(o),r&&t.setUrlLabel(r),Object.keys(l).length&&t.setData(l),c.length&&t.setChips(c),p.length&&t.setChoices(p),A&&(Array.isArray(A)&&A.length||Object.entries(A).length)&&t.setTable(A),t}renderFull(){let e=this.render();return{roomId:"__REPLACE__ME__",markdown:"Fallback text **here**",attachments:[e]}}};var P="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",v="iVBORw0KGgoAAAANSUhEUgAAACYAAAAmCAYAAACoPemuAAAMbWlDQ1BJQ0MgUHJvZmlsZQAASImVVwdYU8kWnluSkJDQAghICb0jUgNICaEFkF4EGyEJJJQYE4KKvSwquHYRxYquiii2lWYBsSuLYu+LBRVlXdTFhsqbkICu+8r3zvfNvX/OnPlPuTO59wCg+YErkeShWgDkiwukCeHBjDFp6QzSU4AAIiADZ+DF5ckkrLi4aABl8P53eXcDWkO56qzg+uf8fxUdvkDGAwAZB3EmX8bLh7gZAHwDTyItAICo0FtOKZAo8ByIdaUwQIhXK3C2Eu9S4EwlPjpgk5TAhvgyAGpULleaDYDGPahnFPKyIY/GZ4hdxXyRGABNJ4gDeEIuH2JF7E75+ZMUuBxiO2gvgRjGA5iZ33Fm/40/c4ify80ewsq8BkQtRCST5HGn/Z+l+d+Snycf9GEDB1UojUhQ5A9reCt3UpQCUyHuFmfGxCpqDfEHEV9ZdwBQilAekay0R415MjasH9CH2JXPDYmC2BjiMHFeTLRKn5klCuNADHcLOlVUwEmC2ADiRQJZaKLKZot0UoLKF1qbJWWzVPpzXOmAX4WvB/LcZJaK/41QwFHxYxpFwqRUiCkQWxWKUmIg1oDYRZabGKWyGVUkZMcM2kjlCYr4rSBOEIjDg5X8WGGWNCxBZV+SLxvMF9siFHFiVPhggTApQlkf7BSPOxA/zAW7LBCzkgd5BLIx0YO58AUhocrcsecCcXKiiueDpCA4QbkWp0jy4lT2uIUgL1yht4DYQ1aYqFqLpxTAzankx7MkBXFJyjjxohxuZJwyHnw5iAZsEAIYQA5HJpgEcoCorbuuG/5SzoQBLpCCbCCAJ1SpGVyROjAjhtdEUAT+gEgAZEPrggdmBaAQ6r8MaZVXZ5A1MFs4sCIXPIU4H0SBPPhbPrBKPOQtBTyBGtE/vHPh4MF48+BQzP97/aD2m4YFNdEqjXzQI0Nz0JIYSgwhRhDDiPa4ER6A++HR8BoEhxvOxH0G8/hmT3hKaCc8IlwndBBuTxTNk/4Q5WjQAfnDVLXI/L4WuA3k9MSDcX/IDplxfdwIOOMe0A8LD4SePaGWrYpbURXGD9x/y+C7p6GyI7uSUfIwchDZ7seVGg4ankMsilp/Xx9lrJlD9WYPzfzon/1d9fnwHvWjJbYIO4SdxU5g57GjWB1gYE1YPdaKHVPgod31ZGB3DXpLGIgnF/KI/uGPq/KpqKTMtdq1y/Wzcq5AMLVAcfDYkyTTpKJsYQGDBd8OAgZHzHNxYri5urkBoHjXKP++3sYPvEMQ/dZvuvm/A+Df1N/ff+SbLrIJgAPe8Pg3fNPZMQHQVgfgXANPLi1U6nDFhQD/JTThSTMEpsAS2MF83IAX8ANBIBREgliQBNLABFhlIdznUjAFzABzQTEoBcvBGrAebAbbwC6wFxwEdeAoOAHOgIvgMrgO7sLd0wlegh7wDvQhCEJCaAgdMUTMEGvEEXFDmEgAEopEIwlIGpKBZCNiRI7MQOYjpchKZD2yFalCDiANyAnkPNKO3EYeIl3IG+QTiqFUVBc1QW3QESgTZaFRaBI6Hs1GJ6NF6AJ0KVqOVqJ70Fr0BHoRvY52oC/RXgxg6pg+Zo45Y0yMjcVi6VgWJsVmYSVYGVaJ1WCN8DlfxTqwbuwjTsTpOAN3hjs4Ak/GefhkfBa+BF+P78Jr8VP4Vfwh3oN/JdAIxgRHgi+BQxhDyCZMIRQTygg7CIcJp+FZ6iS8IxKJ+kRbojc8i2nEHOJ04hLiRuI+YjOxnfiY2EsikQxJjiR/UiyJSyogFZPWkfaQmkhXSJ2kD2rqamZqbmphaulqYrV5amVqu9WOq11Re6bWR9YiW5N9ybFkPnkaeRl5O7mRfIncSe6jaFNsKf6UJEoOZS6lnFJDOU25R3mrrq5uoe6jHq8uUp+jXq6+X/2c+kP1j1QdqgOVTR1HlVOXUndSm6m3qW9pNJoNLYiWTiugLaVV0U7SHtA+aNA1XDQ4GnyN2RoVGrUaVzReaZI1rTVZmhM0izTLNA9pXtLs1iJr2Wixtbhas7QqtBq0bmr1atO1R2rHaudrL9HerX1e+7kOScdGJ1SHr7NAZ5vOSZ3HdIxuSWfTefT59O300/ROXaKurS5HN0e3VHevbptuj56Onodeit5UvQq9Y3od+pi+jT5HP09/mf5B/Rv6n4aZDGMNEwxbPKxm2JVh7w2GGwQZCAxKDPYZXDf4ZMgwDDXMNVxhWGd43wg3cjCKN5pitMnotFH3cN3hfsN5w0uGHxx+xxg1djBOMJ5uvM241bjXxNQk3ERiss7kpEm3qb5pkGmO6WrT46ZdZnSzADOR2WqzJrMXDD0Gi5HHKGecYvSYG5tHmMvNt5q3mfdZ2FokW8yz2Gdx35JiybTMslxt2WLZY2VmNdpqhlW11R1rsjXTWmi91vqs9XsbW5tUm4U2dTbPbQ1sObZFttW29+xodoF2k+0q7a7ZE+2Z9rn2G+0vO6AOng5ChwqHS46oo5ejyHGjY7sTwcnHSexU6XTTmerMci50rnZ+6KLvEu0yz6XO5dUIqxHpI1aMODviq6una57rdte7I3VGRo6cN7Jx5Bs3BzeeW4XbNXeae5j7bPd699cejh4Cj00etzzpnqM9F3q2eH7x8vaSetV4dXlbeWd4b/C+ydRlxjGXMM/5EHyCfWb7HPX56OvlW+B70PdPP2e/XL/dfs9H2Y4SjNo+6rG/hT/Xf6t/RwAjICNgS0BHoHkgN7Ay8FGQZRA/aEfQM5Y9K4e1h/Uq2DVYGnw4+D3blz2T3RyChYSHlIS0heqEJoeuD30QZhGWHVYd1hPuGT49vDmCEBEVsSLiJseEw+NUcXoivSNnRp6KokYlRq2PehTtEC2NbhyNjo4cvWr0vRjrGHFMXSyI5cSuir0fZxs3Oe5IPDE+Lr4i/mnCyIQZCWcT6YkTE3cnvksKTlqWdDfZLlme3JKimTIupSrlfWpI6srUjjEjxswcczHNKE2UVp9OSk9J35HeOzZ07JqxneM8xxWPuzHedvzU8ecnGE3Im3BsouZE7sRDGYSM1IzdGZ+5sdxKbm8mJ3NDZg+PzVvLe8kP4q/mdwn8BSsFz7L8s1ZmPc/2z16V3SUMFJYJu0Vs0XrR65yInM0573Njc3fm9uel5u3LV8vPyG8Q64hzxacmmU6aOqld4igplnRM9p28ZnKPNEq6Q4bIxsvqC3ThR32r3E7+k/xhYUBhReGHKSlTDk3Vniqe2jrNYdriac+Kwop+mY5P501vmWE+Y+6MhzNZM7fOQmZlzmqZbTl7wezOOeFzds2lzM2d+9s813kr5/01P3V+4wKTBXMWPP4p/KfqYo1iafHNhX4LNy/CF4kWtS12X7xu8dcSfsmFUtfSstLPS3hLLvw88ufyn/uXZi1tW+a1bNNy4nLx8hsrAlfsWqm9smjl41WjV9WuZqwuWf3Xmolrzpd5lG1eS1krX9tRHl1ev85q3fJ1n9cL11+vCK7Yt8F4w+IN7zfyN17ZFLSpZrPJ5tLNn7aIttzaGr61ttKmsmwbcVvhtqfbU7af/YX5S9UOox2lO77sFO/s2JWw61SVd1XVbuPdy6rRanl1155xey7vDdlbX+Ncs3Wf/r7S/WC/fP+LAxkHbhyMOthyiHmo5lfrXzccph8uqUVqp9X21AnrOurT6tsbIhtaGv0aDx9xObLzqPnRimN6x5YdpxxfcLy/qaipt1nS3H0i+8Tjloktd0+OOXntVPypttNRp8+dCTtz8izrbNM5/3NHz/ueb7jAvFB30etibatn6+HfPH873ObVVnvJ+1L9ZZ/Lje2j2o9fCbxy4mrI1TPXONcuXo+53n4j+catm+Nudtzi33p+O+/26zuFd/ruzrlHuFdyX+t+2QPjB5W/2/++r8Or49jDkIetjxIf3X3Me/zyiezJ584FT2lPy56ZPat67vb8aFdY1+UXY190vpS87Osu/kP7jw2v7F79+mfQn609Y3o6X0tf979Z8tbw7c6/PP5q6Y3rffAu/13f+5IPhh92fWR+PPsp9dOzvimfSZ/Lv9h/afwa9fVef35/v4Qr5Q58CmBwoFlZALzZCQAtDQA67NsoY5W94IAgyv51AIH/hJX94oB4AVADv9/ju+HXzU0A9m+H7Rfk14S9ahwNgCQfgLq7Dw2VyLLc3ZRcVNinEB7097+FPRtpFQBflvf391X293/ZBoOFvWOzWNmDKoQIe4YtnC+Z+Zng34iyP/0uxx/vQBGBB/jx/i/zoZDc6xYYDgAAAIplWElmTU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAIdpAAQAAAABAAAATgAAAAAAAACQAAAAAQAAAJAAAAABAAOShgAHAAAAEgAAAHigAgAEAAAAAQAAACagAwAEAAAAAQAAACYAAAAAQVNDSUkAAABTY3JlZW5zaG90YWJUtQAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAdRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDYuMC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+Mzg8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+Mzg8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpVc2VyQ29tbWVudD5TY3JlZW5zaG90PC9leGlmOlVzZXJDb21tZW50PgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4K2WZ6jwAAABxpRE9UAAAAAgAAAAAAAAATAAAAKAAAABMAAAATAAADk4/gdzcAAANfSURBVFgJbJYNepxADEOBs2YP0eaCbQ8FfU+2gSU732YYbEnW/ABZX3+/j2Xh99bW5TiOZV0raHaj27d1IRP4cTBeiwdy2dYdzp3AeCcPxnxnSpDYCrbYZmpUSXvwr7+/ZS5HirQA2APRDWeH7jD5bJKS/5kCanDjb+evLKW3zltYnPr8HvXX1x+MkdNSHKZ/GDQnf1ap9eK5a3coRcbTiomaU2nbj1GvWcvRetZ3xbLUOo6KpopUVeL6LWdcveq6FgF5O1ta/CrtjO4GVd6tOOckMmAe9bOVnqdsC5JZfi+OFSV31AHr5SZj3nlw2eiz5LHDOYuG/CjUfSasc4j+wlXfmJef9THG4RdgcYxk9SLUyikhf1YxWlBQbA4jThN8mmN16HKe+uh4e7YaphIxsB/qr1+csayAXQxJizzXUTPXGuA2cJORUk/nhQGZ1pRwPdxO7syg427s7orhR31W7JfSVfdUki46VfHLUndII59a0MOfK0Dj17PJPblsd5ZSpQKnv/M8/E9RA8ZslYORGSFz5pIZ3UGGE4xFaFUL7MFm+x7s+C3ZNYiMpDW+YqwjfSmSZhylG05SRu6rkKDdvWiCIOPETby2f+yKr4mq2PVaY339YyvN2k6gQ9/mnoGyVni3lOeQ/QzFXFNLoHrPnA+HnLf3advzrZ+E50LjH+pz+L85/CYfKnLg+1ZSfOYrzJayANbdd1dOTSXoxZyGQ0ik8hle928v7dss6pPkrMXyl9lStgJq9dhZZei1jGQ7M3uIriKAfowkloScW7NMJurABVE0ugy5nfr5JK28j458xMxY415A8qcaqs1JAxPjw6tbv7e+4TW7e40Ud9lC7iMB5lP9+iSVaR3bJNTWyaxca5ZDYmrzkIGjkCvIfV66fJI0maJhCwY4mJI8F0mI2gmnSNU/P+ICVHM2ztAFDwHBFGR1NjOZbX+IVGsxlWNOmQlnEBUibYDb+OT+kX6rX2csNIF1TnJ76vUglwuhaJ5YBk7Ft3g/JaUm3lb75aB+xDNRP2e2wTG81Bnn/7EgCtRHJQQ5Gph+VLIydkpxSW0NOr5IYRabJzf2M4V4Edaf2hNnYuq3sfGqDcljQY6r6CbW2alknSGONKY0N67EywarW+NWS5vxmIu1zv+s/x8AAP//YTDCxwAAAzJJREFUdZYLYtswDEMj3zW7w7oLLj2UPTwQlBQ3Y9JI/AEUxbgZz9fv6/EYjynSrA5trs2egHaj7nu0S4m87NmcAx9Yh3Zn2MC3bIHoUcfz9ZWI94CiORR5vhOGF4xVexnb9Y7ksh6FpNooUsXXIUINmCx7g1zYJdsYBJ85ccXJJFuXyBpYn15Jxs1awd2OEOETCL4K1lo7LC2f+LeOdRgrFdFzzklBWKrAAsweByEt0vt4zqxEQeAoLMCGWk3H/i8aiOfrj0KruSfJAjmwUJv+Dn1cLlIKb3x1REOzxchs6SgWhWVdh8GH3eHxrln4yT+e31/FQ5oJnVUfKQBlAs7NFucAlQZER85cEiS+0lt5uKoXPtjOv64yQD3Qze8VQm5Wq96ZxOoShay+pAix1dVTkYR8uRobjJJmkXbjX4URbdygZCQMAChmYvrQZpOiR0A5+jpZI2yM2Yassl2q8tCrOiz7jAVPGP0cY0a4U3c8+cP6ViEkYTVO68yh2yHAtNUNkN8HchwKnGIySbgIlOPOXx0j0BOfirRUeOmQAma82bEV2zsX24rXZandTW+SD/wurP1gVSrXwZQsqfnY4ZMl0DHqIUx0GpBLIr5s7pz2ZZFNGzCRj/xcJe31qBAkBK4QKZB6DPjZI/MEjr+OQHRY2ErQ6iuwtbhOZ/8qR1f6gX/8+tZzTIXwMq2X7F1F9uBTlrpDN3m7frnXHCWmiyQ/6Y+TnMliO107kjw9jtdx+wEL5JL6IpCDEMsInmqrL1h7D3Hugq4dXCdMiBO0P7VxMT5K+fiUzTNrCzkk7KJ4/xOHyCQBUOwlUE7D1VZr9kSg4r9jOgwj3+Z1jdDDf72ZiQNf7xv/eP7Vrwv5qhcEQnkrUDrNmF0KnmsOd0wm6ZryH87khTqjlq2x4KDC5qdjLoSKPTQUtYJ8Io67+SrZGPqQ2F+HOzODxQem0NQlpwf5hLHnROmf+OtxoUBfmxnUAoj4AFS+qwYs7ZYnhUDev69SlknIRioMHCL1RyJv6jU+Ntw/+Wv4ScxPCldvoCDDIFldNJbAhJgc7TRNwnCcPvBJZ54yOqhTamsm2VzZxGr+f1OdHzAEGGqzAAAAAElFTkSuQmCC",D="iVBORw0KGgoAAAANSUhEUgAAACQAAAAmCAYAAACsyDmTAAAMbWlDQ1BJQ0MgUHJvZmlsZQAASImVVwdYU8kWnluSkJDQAghICb0jUgNICaEFkF4EGyEJJJQYE4KKvSwquHYRxYquiii2lWYBsSuLYu+LBRVlXdTFhsqbkICu+8r3zvfNvX/OnPlPuTO59wCg+YErkeShWgDkiwukCeHBjDFp6QzSU4AAIiADZ+DF5ckkrLi4aABl8P53eXcDWkO56qzg+uf8fxUdvkDGAwAZB3EmX8bLh7gZAHwDTyItAICo0FtOKZAo8ByIdaUwQIhXK3C2Eu9S4EwlPjpgk5TAhvgyAGpULleaDYDGPahnFPKyIY/GZ4hdxXyRGABNJ4gDeEIuH2JF7E75+ZMUuBxiO2gvgRjGA5iZ33Fm/40/c4ify80ewsq8BkQtRCST5HGn/Z+l+d+Snycf9GEDB1UojUhQ5A9reCt3UpQCUyHuFmfGxCpqDfEHEV9ZdwBQilAekay0R415MjasH9CH2JXPDYmC2BjiMHFeTLRKn5klCuNADHcLOlVUwEmC2ADiRQJZaKLKZot0UoLKF1qbJWWzVPpzXOmAX4WvB/LcZJaK/41QwFHxYxpFwqRUiCkQWxWKUmIg1oDYRZabGKWyGVUkZMcM2kjlCYr4rSBOEIjDg5X8WGGWNCxBZV+SLxvMF9siFHFiVPhggTApQlkf7BSPOxA/zAW7LBCzkgd5BLIx0YO58AUhocrcsecCcXKiiueDpCA4QbkWp0jy4lT2uIUgL1yht4DYQ1aYqFqLpxTAzankx7MkBXFJyjjxohxuZJwyHnw5iAZsEAIYQA5HJpgEcoCorbuuG/5SzoQBLpCCbCCAJ1SpGVyROjAjhtdEUAT+gEgAZEPrggdmBaAQ6r8MaZVXZ5A1MFs4sCIXPIU4H0SBPPhbPrBKPOQtBTyBGtE/vHPh4MF48+BQzP97/aD2m4YFNdEqjXzQI0Nz0JIYSgwhRhDDiPa4ER6A++HR8BoEhxvOxH0G8/hmT3hKaCc8IlwndBBuTxTNk/4Q5WjQAfnDVLXI/L4WuA3k9MSDcX/IDplxfdwIOOMe0A8LD4SePaGWrYpbURXGD9x/y+C7p6GyI7uSUfIwchDZ7seVGg4ankMsilp/Xx9lrJlD9WYPzfzon/1d9fnwHvWjJbYIO4SdxU5g57GjWB1gYE1YPdaKHVPgod31ZGB3DXpLGIgnF/KI/uGPq/KpqKTMtdq1y/Wzcq5AMLVAcfDYkyTTpKJsYQGDBd8OAgZHzHNxYri5urkBoHjXKP++3sYPvEMQ/dZvuvm/A+Df1N/ff+SbLrIJgAPe8Pg3fNPZMQHQVgfgXANPLi1U6nDFhQD/JTThSTMEpsAS2MF83IAX8ANBIBREgliQBNLABFhlIdznUjAFzABzQTEoBcvBGrAebAbbwC6wFxwEdeAoOAHOgIvgMrgO7sLd0wlegh7wDvQhCEJCaAgdMUTMEGvEEXFDmEgAEopEIwlIGpKBZCNiRI7MQOYjpchKZD2yFalCDiANyAnkPNKO3EYeIl3IG+QTiqFUVBc1QW3QESgTZaFRaBI6Hs1GJ6NF6AJ0KVqOVqJ70Fr0BHoRvY52oC/RXgxg6pg+Zo45Y0yMjcVi6VgWJsVmYSVYGVaJ1WCN8DlfxTqwbuwjTsTpOAN3hjs4Ak/GefhkfBa+BF+P78Jr8VP4Vfwh3oN/JdAIxgRHgi+BQxhDyCZMIRQTygg7CIcJp+FZ6iS8IxKJ+kRbojc8i2nEHOJ04hLiRuI+YjOxnfiY2EsikQxJjiR/UiyJSyogFZPWkfaQmkhXSJ2kD2rqamZqbmphaulqYrV5amVqu9WOq11Re6bWR9YiW5N9ybFkPnkaeRl5O7mRfIncSe6jaFNsKf6UJEoOZS6lnFJDOU25R3mrrq5uoe6jHq8uUp+jXq6+X/2c+kP1j1QdqgOVTR1HlVOXUndSm6m3qW9pNJoNLYiWTiugLaVV0U7SHtA+aNA1XDQ4GnyN2RoVGrUaVzReaZI1rTVZmhM0izTLNA9pXtLs1iJr2Wixtbhas7QqtBq0bmr1atO1R2rHaudrL9HerX1e+7kOScdGJ1SHr7NAZ5vOSZ3HdIxuSWfTefT59O300/ROXaKurS5HN0e3VHevbptuj56Onodeit5UvQq9Y3od+pi+jT5HP09/mf5B/Rv6n4aZDGMNEwxbPKxm2JVh7w2GGwQZCAxKDPYZXDf4ZMgwDDXMNVxhWGd43wg3cjCKN5pitMnotFH3cN3hfsN5w0uGHxx+xxg1djBOMJ5uvM241bjXxNQk3ERiss7kpEm3qb5pkGmO6WrT46ZdZnSzADOR2WqzJrMXDD0Gi5HHKGecYvSYG5tHmMvNt5q3mfdZ2FokW8yz2Gdx35JiybTMslxt2WLZY2VmNdpqhlW11R1rsjXTWmi91vqs9XsbW5tUm4U2dTbPbQ1sObZFttW29+xodoF2k+0q7a7ZE+2Z9rn2G+0vO6AOng5ChwqHS46oo5ejyHGjY7sTwcnHSexU6XTTmerMci50rnZ+6KLvEu0yz6XO5dUIqxHpI1aMODviq6una57rdte7I3VGRo6cN7Jx5Bs3BzeeW4XbNXeae5j7bPd699cejh4Cj00etzzpnqM9F3q2eH7x8vaSetV4dXlbeWd4b/C+ydRlxjGXMM/5EHyCfWb7HPX56OvlW+B70PdPP2e/XL/dfs9H2Y4SjNo+6rG/hT/Xf6t/RwAjICNgS0BHoHkgN7Ay8FGQZRA/aEfQM5Y9K4e1h/Uq2DVYGnw4+D3blz2T3RyChYSHlIS0heqEJoeuD30QZhGWHVYd1hPuGT49vDmCEBEVsSLiJseEw+NUcXoivSNnRp6KokYlRq2PehTtEC2NbhyNjo4cvWr0vRjrGHFMXSyI5cSuir0fZxs3Oe5IPDE+Lr4i/mnCyIQZCWcT6YkTE3cnvksKTlqWdDfZLlme3JKimTIupSrlfWpI6srUjjEjxswcczHNKE2UVp9OSk9J35HeOzZ07JqxneM8xxWPuzHedvzU8ecnGE3Im3BsouZE7sRDGYSM1IzdGZ+5sdxKbm8mJ3NDZg+PzVvLe8kP4q/mdwn8BSsFz7L8s1ZmPc/2z16V3SUMFJYJu0Vs0XrR65yInM0573Njc3fm9uel5u3LV8vPyG8Q64hzxacmmU6aOqld4igplnRM9p28ZnKPNEq6Q4bIxsvqC3ThR32r3E7+k/xhYUBhReGHKSlTDk3Vniqe2jrNYdriac+Kwop+mY5P501vmWE+Y+6MhzNZM7fOQmZlzmqZbTl7wezOOeFzds2lzM2d+9s813kr5/01P3V+4wKTBXMWPP4p/KfqYo1iafHNhX4LNy/CF4kWtS12X7xu8dcSfsmFUtfSstLPS3hLLvw88ufyn/uXZi1tW+a1bNNy4nLx8hsrAlfsWqm9smjl41WjV9WuZqwuWf3Xmolrzpd5lG1eS1krX9tRHl1ev85q3fJ1n9cL11+vCK7Yt8F4w+IN7zfyN17ZFLSpZrPJ5tLNn7aIttzaGr61ttKmsmwbcVvhtqfbU7af/YX5S9UOox2lO77sFO/s2JWw61SVd1XVbuPdy6rRanl1155xey7vDdlbX+Ncs3Wf/r7S/WC/fP+LAxkHbhyMOthyiHmo5lfrXzccph8uqUVqp9X21AnrOurT6tsbIhtaGv0aDx9xObLzqPnRimN6x5YdpxxfcLy/qaipt1nS3H0i+8Tjloktd0+OOXntVPypttNRp8+dCTtz8izrbNM5/3NHz/ueb7jAvFB30etibatn6+HfPH873ObVVnvJ+1L9ZZ/Lje2j2o9fCbxy4mrI1TPXONcuXo+53n4j+catm+Nudtzi33p+O+/26zuFd/ruzrlHuFdyX+t+2QPjB5W/2/++r8Or49jDkIetjxIf3X3Me/zyiezJ584FT2lPy56ZPat67vb8aFdY1+UXY190vpS87Osu/kP7jw2v7F79+mfQn609Y3o6X0tf979Z8tbw7c6/PP5q6Y3rffAu/13f+5IPhh92fWR+PPsp9dOzvimfSZ/Lv9h/afwa9fVef35/v4Qr5Q58CmBwoFlZALzZCQAtDQA67NsoY5W94IAgyv51AIH/hJX94oB4AVADv9/ju+HXzU0A9m+H7Rfk14S9ahwNgCQfgLq7Dw2VyLLc3ZRcVNinEB7097+FPRtpFQBflvf391X293/ZBoOFvWOzWNmDKoQIe4YtnC+Z+Zng34iyP/0uxx/vQBGBB/jx/i/zoZDc6xYYDgAAAIplWElmTU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAIdpAAQAAAABAAAATgAAAAAAAACQAAAAAQAAAJAAAAABAAOShgAHAAAAEgAAAHigAgAEAAAAAQAAACSgAwAEAAAAAQAAACYAAAAAQVNDSUkAAABTY3JlZW5zaG90JS99ZAAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAdRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDYuMC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+Mzg8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+MzY8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpVc2VyQ29tbWVudD5TY3JlZW5zaG90PC9leGlmOlVzZXJDb21tZW50PgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KFcjjjAAAABxpRE9UAAAAAgAAAAAAAAATAAAAKAAAABMAAAATAAAAcerJp6AAAAA9SURBVFgJ7NKxFQAABANR9raicdSMcK3itGm8n+R0bTy69CFoQyEACoUUIgHK3ZBCJEC5G1KIBCh3QyR0AAAA//++LyCxAAAAOklEQVTt0rEVAAAEA1H2tqJx1IxwreK0abyf5HRtPLr0IWhDIQAKhRQiAcrdkEIkQLkbUogEKHdDJHT6I3s1kBzd4gAAAABJRU5ErkJggg==",U="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";var C=class{constructor(e,t=T){this.config=e;this.makeRequest=t;this.env={};this.helpContent=[];this.roomId="";this.fallbackText="Sorry, it appears your client does not support rendering Adaptive Cards, see here for more info: https://developer.webex.com/docs/api/guides/cards";this.token="";this.meta={url:""};this.locales={};this.API=j;this.roomId=e.roomId,this.token=e.token,e.env?this.env=e.env:this.env={},e.locales&&(this.locales=e.locales),e.url&&(this.meta.url=e.url.slice(-1)==="/"?e.url:`${e.url}/`),e.fallbackText&&(this.fallbackText=e.fallbackText),e.helpContent&&e.helpContent.length&&(this.helpContent=e.helpContent)}pickRandom(e=[]){return R(e)}sendRandom(e=[]){return this.send(this.pickRandom(e))}fillTemplate(e,t){return H(e,t)}sendTemplate(e,t={}){let s=this.fillTemplate(e,t);return this.send(s)}async sendURL(e,t,s="Go"){let i=new x;return t?i.setTitle(t).setUrl(e,s):i.setSubtitle(e).setUrl(e,s),this.send(i)}async api(e,t){let s=await fetch(e,t);try{return await s.json()}catch{return{}}}async dm(e,t,s){let i={text:this.fallbackText};if(y.isEmail(e)?i.toPersonEmail=e:i.toPersonId=e,typeof t=="string"&&(i.markdown=t,i.text=t),y.isCard(t)){s&&(i.text=s);let r=[{contentType:"application/vnd.microsoft.card.adaptive",content:typeof t!="string"&&"render"in t&&typeof t.render=="function"?t.render():t}];i.attachments=r}return await this.makeRequest(this.API.sendMessage,i,{method:"POST","content-type":"application/json",token:this.token})}async send(e){let t={};return e&&typeof e!="string"&&("toPersonId"in e&&(t.toPersonId=e.toPersonId),"toPersonEmail"in e&&(t.toPersonEmail=e.toPersonEmail),"roomId"in e&&(t.roomId=this.roomId),e&&!("roomId"in e)&&!("toPersonEmail"in e)&&!("toPersonId"in e)&&(t.roomId=this.roomId)),typeof e=="string"?(t.roomId=this.roomId,t.markdown=e,t.text=e):typeof e=="object"&&(y.isCard(e)?t={...t,markdown:this.fallbackText,text:this.fallbackText,attachments:[{contentType:"application/vnd.microsoft.card.adaptive",content:"render"in e&&typeof e.render=="function"?e.render():e}]}:t={...t,...e}),await(await this.makeRequest(this.API.sendMessage,t,{method:"POST","content-type":"application/json",token:this.token})).json()}card(e={}){let t=new x,{title:s="",subTitle:i="",image:a="",url:o="",urlLabel:r="",data:l={},chips:c=[],table:A=[],choices:p=[],backgroundImage:d=""}=e;return d&&t.setBackgroundImage,s&&t.setTitle(s),i&&t.setSubtitle(i),a&&t.setImage(a),o&&t.setUrl(o),r&&t.setUrlLabel(r),Object.keys(l).length&&t.setData(l),c.length&&t.setChips(c),p.length&&t.setChoices(p),A&&(Array.isArray(A)&&A.length||Object.entries(A).length)&&t.setTable(A),t}async getSelf(){let e=this.API.getSelf;return await(await this.makeRequest(e,{},{token:this.token,method:"GET"})).json()}async deleteMessage(e){let t=`${this.API.deleteMessage}/${e}`;return await this.makeRequest(t,{},{token:this.token,method:"DELETE"})}async locationAuthorizer(e,t,s={yes:"✅ Allow",no:"❌ Disallow"}){let{displayName:i}=await this.getSelf(),a={text:`'${i}' is requesting access to limited location data (country, timezone, city) in order to perform that action`},{id:o}=await this.send(a),r=`${this.meta.url}location?roomId=${e.message.roomId}&messageId=${o}`;this.send(this.warningCard({title:t||`'${i}' wants to use your location, allow?`}).setUrl(r,s.yes).setData({messageId:o,action:"location_abort"}).setButtonLabel(s.no))}async getFile(e,t={}){let s=await this.makeRequest(e,{},{method:"GET",token:this.token}),i=s.headers.get("content-type"),o=s.headers.get("content-disposition").split(";")[1].split("=")[1].replace(/\"/g,""),r=o.split(".").pop()||"",l=!i.includes("json")&&!i.includes("txt")||i.includes("image"),c=s;if(t.responseType==="arraybuffer"||l)try{c=await s.arrayBuffer()}catch{c={}}else c=await s.json();let A=`***No markdown preview available for ${i}***`;return{fileName:o,extension:r,type:i,data:c,markdownSnippet:i==="application/json"||typeof c=="string"&&c.length<900?this.snippet(c):A}}generateHelp(){return this.helpContent}generateFileName(){return`${this.rando()}_${this.rando()}`}rando(){return Math.random().toString(36).slice(2)}handleExtension(e=""){let t=e.indexOf(".")>-1,s="",[i,a]=e.split(".");return t?!i||i==="*"?s=`${this.generateFileName()}.${a}`:s=e:s=`${this.generateFileName()}.${i}`,s}async sendDataAsFile(e,t,s=null,i,a={}){if(!t)throw new Error('$(bot).sendDataAsFile: Missing filename/extension parameter, ex "myfile.png" or "*.png"');let o=s;if(!o&&(o=this.guessContentType(t),!o))throw new Error(`$(bot).sendDataAsFile: Missing 'content-type' parameter, ex "image/png"`);let r=this.handleExtension(t),l=new FormData,{toPersonId:c=null,toPersonEmail:A=null,roomId:p=null}=a,d=c?"toPersonId":A?"toPersonEmail":"roomId",h=c||A||p||this.roomId,f=e&&typeof e=="object"&&o.includes("json");l.append("files",new Blob([f?JSON.stringify(e,null,2):e],{type:o}),r),l.append(d,h),l.append("text",i||" ");let m=new Headers;m.append("Authorization",`Bearer ${this.token}`);let g={method:"POST",headers:m,body:l};return await fetch(j.sendMessage,g)}guessContentType(e){let t=e.indexOf(".")>-1,s="",i=e.split("."),a=i.length>2,[o,r]=i;return t?((!o||o==="*")&&(s=r),a&&(s=i.pop())):s=o,{doc:"application/msword",docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",xls:"application/vnd.ms-excel",xlsx:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",ppt:"application/vnd.ms-powerpoint",pptx:"application/vnd.openxmlformats-officedocument.presentationml.presentation",pdf:"application/pdf",jpg:"image/jpeg",jpeg:"image/jpeg",bmp:"image/bmp",gif:"image/gif",png:"image/png",txt:"text/plain",csv:"text/csv",html:"text/html",json:"application/json","*":"application/octet-stream",mp3:"audio/mpeg",mp4:"video/mp4",mpeg:"video/mpeg",mpkg:"application/vnd.apple.installer+xml",vf:"application/json"}[s]||null}async thread(e){let[t,...s]=e,{id:i}=await this.send(t);for(let a=0;a<s.length;a++){let o=s[a],r={parentId:i};typeof o=="string"&&(r.markdown=o,r.text=o),typeof o=="object"&&(r={...r,...o}),this.send(r)}}translate(e,t,s={},i=""){let a=this.locales[e]||{},o=this.lookUp(a,t,i);return Object.keys(s)?this.fillTemplate(o,s):o}sendDataFromUrl(e,t=" "){return this.send({files:[e],text:t})}log(...e){console.log.apply(console,e)}snippet(e,t="json"){return`
  \`\`\`${t}
  ${t==="json"?JSON.stringify(e,null,2):e}
  \`\`\``}async clearScreen(e=50){let t=`
  `,s=e>7e3?5e3:e,i=`${t.repeat(s)}`,a={markdown:i,text:i};this.send(a)}sendJSON(e,t){return this.sendSnippet(e,t,"json")}async sendSnippet(e,t="",s="json",i){let a;return s==="json"?a=this.snippet(e):a=this.snippet(e,"html"),t&&(a=t+` 
  `+a),this.send({roomId:this.roomId,markdown:a,text:i||this.fallbackText})}lookUp(e,t="",s){let i=e;return t.split(".").forEach(a=>{i?i=i[a]:i=s}),i||s}dangerCard(e){return this.card(e).setBackgroundImage(`data:image/png;base64,${P}`)}warningCard(e){return this.card(e).setBackgroundImage(`data:image/png;base64,${D}`)}successCard(e){return this.card(e).setBackgroundImage(`data:image/png;base64,${v}`)}skyCard(e){return this.card(e).setBackgroundImage(`data:image/gif;base64,${U}`)}async say(e){return this.send(e)}async sendCard(e){return this.send(e)}};function O(n,e=T){return new C(n)}function F(n,e=T){let t=new C(n);return{snippet(s,i){return t.snippet(s,i)},sendRoom(s,i){},sendRoomDataAsFile(s,i,a,o=null,r,l={}){let c={roomId:s};return t.sendDataAsFile(i,a,null,void 0,c)},dmDataAsFile(s,i,a,o=null,r,l={}){let c={};return y.isEmail(s)?c={toPersonEmail:s}:c={toPersonId:s},t.sendDataAsFile(i,a,null,void 0,c)},dm(s,i,a){return t.dm(s,i)},card(s){return t.card(s)}}}var Z=class{constructor(e,t,s={}){this.config=e;this.handlers=t;this.env=s;this.globals={roomId:"",personId:"",fallbackText:"Sorry, it appears your client does not support rendering Adaptive Cards"};this.API={getMessageDetails:"https://webexapis.com/v1/messages",getAttachmentDetails:"https://webexapis.com/v1/attachment/actions",getMembershipDetails:"https://webexapis.com/v1/memberships",getPersonDetails:"https://webexapis.com/v1/people",sendMessage:"https://webexapis.com/v1/messages",createWebhook:"https://webexapis.com/v1/webhooks",deleteWebhook:"https://webexapis.com/v1/webhooks",getWebhooks:"https://webexapis.com/v1/webhooks",getSelf:"https://webexapis.com/v1/people/me",deleteMessage:"https://webexapis.com/v1/messages"};this.constants={catchall:"<@catchall>",submit:"<@submit>",file:"<@fileupload>",nomatch:"<@nomatch>",reqTypes:{TEXT:"TEXT",AA:"AA",FILE:"FILE"},errors:{placeholder:`ERROR: Placeholder token detected, you need to set a valid Bot Access token. 
  If you need a token, see here: https://developer.webex.com/my-apps/new/bot`}};this._apiHeaders={headers:{Authorization:`Bearer ${this.config.token}`}};if(e.token===G){let i=this.constants.errors.placeholder;throw new Error(i)}}async processIncoming(e,t){if(this.debug("##",e),t&&this.config.validate&&typeof this.config.validate=="function"){let{validate:d}=this.config,{proceed:h}=await d(t);if(!h)return new Response("Request did not pass user-supplied validation",{status:400})}let s=L(e),i=await this.getEnhancedDetails(e,s),a=e,{personId:o,roomId:r,roomType:l}=a.data;this.globals.roomId=r;let c=l==="group"&&i.text?i.text.split(" ").slice(1).join(" "):i.text&&i.text.toLowerCase()||null,A=await this.isHuman(o),p=!1;if(e.data&&A){let d=[this.constants.catchall,this.constants.nomatch];if(s==="AA"){let g=i;!!(g.inputs&&g.inputs.chip_action)?(this.config.features?.chips?.disappearOnTop&&await this.deleteMessage(g.messageId),s=this.constants.reqTypes.TEXT,c=g.inputs.chip_action.toLowerCase(),d.push(c)):!!(g.inputs&&g.inputs.action)?this.actionHandler(g):d=[this.constants.submit]}s==="FILE"&&d.push(this.constants.file),s==="TEXT"&&d.indexOf(c)===-1&&d.push(c),this.debug("TARGETS",d);let h=await this.buildStash(d,this.handlers,s,c),f=g=>g&&typeof g.handler=="function",m=null;d.forEach(async g=>{let u=h[g];if(g===c&&!f(u)&&(p=!0),g===this.constants.nomatch&&f(u)){m=u;return}f(u)&&this.invokeHandler(u,e,i,s,t)}),m&&p&&this.invokeHandler(m,e,i,s,t)}}generateHelp(){return this.handlers.filter(({hideHelp:t,helpText:s="",keyword:i})=>t!==!0&&s.length>0).map(({keyword:t,helpText:s=""})=>({label:Array.isArray(t)?t[0]:t,helpText:s}))}async invokeHandler(e,t,s,i,a){let o=await this.buildTrigger(t,s,i),r={token:this.config.token,roomId:this.globals.roomId,url:a.url,fallbackText:this.globals.fallbackText,locales:this.config.locales?this.config.locales:{},helpContent:this.generateHelp(),env:this.env},l=O(r);await e.handler(l,o)}async getPersonDetails(e){let t=`${this.API.getPersonDetails}/${e}`,s=await this.makeRequest(t,{},{method:"GET"});return s?await s.json():{}}async buildTrigger(e,t,s){let{personId:i}=t,a=await this.getPersonDetails(i);if(s==="AA")return{id:t.id,attachmentAction:t,personId:i,person:a};{let o=e,r=t,l=o.data.roomType==="group"&&r.text?r.text.split(" ").slice(1).join(" "):r.text&&r.text.toLowerCase()||null;if(!r.text&&"inputs"in t){let{chip_action:A}=t.inputs;l!=A&&(l=A)}let c={type:"message",id:r.id,message:r,args:r.text?r.text.split(" "):[],personId:i,person:a,text:l};if(r.roomType==="group"&&c.args.length){let A=c.args.slice(1);c.args=A,c.text=A.join(" "),c.message.text=c.text}return c}}async buildStash(e,t,s,i){let a=e.reduce((o,r)=>(o[r]=null,o),{});if(Array.isArray(t)){let o=(r,l)=>{let c=typeof r=="string"?r.toLowerCase():"";c in a?a[c]=l:r instanceof RegExp&&r.test(i)&&(a[i]=l)};t.forEach(r=>{let{keyword:l}=r;typeof l=="string"||l instanceof RegExp?o(l,r):Array.isArray(l)&&l.forEach(A=>{o(A,r)})})}else typeof t=="object"&&e.forEach(o=>{t[o]&&(a[o]=t[o])});return a}async _send(e){return await(await(async(a,o,r={})=>{let l={method:"POST","content-type":"application/json;charset=UTF-8",raw:!1},c=r["content-type"]?r["content-type"]:l["content-type"],A=r.headers?r.headers:{},p={method:r.method?r.method:l.method,headers:{"content-type":c,Authorization:`Bearer ${this.globals?.config?.token}`,...A}};return r.method==="POST"&&(p.body=r.raw?o:JSON.stringify(o)),await fetch(a,p)})(this.API.sendMessage,e)).json()}async send(e){let t={roomId:this.globals.roomId};return typeof e=="object"&&"roomId"in e&&(t.roomId=e.roomId),typeof e=="string"?(t.markdown=e,t.text=e):typeof e=="object"&&(y.isCard(e)?t={...t,markdown:this.globals.fallbackText,text:this.globals.fallbackText,attachments:[{contentType:"application/vnd.microsoft.card.adaptive",content:"render"in e&&typeof e.render=="function"?e.render():e}]}:t={...t,...e}),await(await(async(o,r,l={})=>{let c={method:"POST","content-type":"application/json;charset=UTF-8",raw:!1},A=l["content-type"]?l["content-type"]:c["content-type"],p=l.headers?l.headers:{},d={method:l.method?l.method:c.method,headers:{"content-type":A,Authorization:`Bearer ${l.token}`,...p}};return l.method==="POST"&&(d.body=l.raw?r:JSON.stringify(r)),await fetch(o,d)})(this.API.sendMessage,t,{method:"POST","content-type":"application/json",token:this.config.token})).json()}async deleteMessage(e){let t=`${this.API.deleteMessage}/${e}`;return await this.makeRequest(t,{},{method:"DELETE"})}async delay(e=100){return new Promise(t=>setTimeout(t,e))}async isHuman(e,t=!1){let s=await this.getSelf(),{id:i}=s;return t?s:i!==e}async getSelf(){let e=this.API.getSelf;return await(await this.makeRequest(e,{},{method:"GET"})).json()}async makeRequest(e,t,s={}){let i={method:"POST","content-type":"application/json;charset=UTF-8",raw:!1},a=s["content-type"]?s["content-type"]:i["content-type"],o=s.headers?s.headers:{},r={method:s.method?s.method:i.method,headers:{"content-type":a,Authorization:`Bearer ${this.config.token}`,...o}};s.method==="POST"&&(r.body=s.raw?t:JSON.stringify(t));try{return await fetch(e,r)}catch(l){console.log("ERR#",l)}}async getEnhancedDetails(e,t){let s=this.API.getMessageDetails;t==="AA"&&(s=this.API.getAttachmentDetails);let{data:i}=e,{id:a}=i;s=`${s}/${a}`;let o={method:"GET"};return await(await this.makeRequest(s,{},o)).json()}debug(...e){this.config.debug&&console.log.apply(console,e)}async actionHandler(e){let t=e.inputs,{action:s=""}=t;if(s==="location_abort"){let{messageId:i}=e;await this.deleteMessage(i);let{messageId:a}=e.inputs;await this.deleteMessage(a)}if(s==="delete_message"){let{messageId:i}=e.inputs;await this.deleteMessage(i)}}};var K={city:"error",colo:"error",continent:"error",latitude:"error",longitude:"error",country:"error",postalCode:"error",region:"error",state:"error",tod:"error",timezone:"error"},_=n=>{let{city:e="error",colo:t="error",continent:s="error",country:i="error",latitude:a="error",longitude:o="error",postalCode:r="error",region:l="error",timezone:c="error"}=n,A="error";try{let d=(new Date).toLocaleString("en-US",{timeZone:c}),h=new Date(d).getHours();(20<=h||h<=3)&&(A="evening"),h<=11&&(A="morning"),12<=h&&h<=16&&(A="afternoon"),17<=h&&h<=19&&(A="evening")}catch{A="error"}return{city:e,colo:t,continent:s,country:i,latitude:a,longitude:o,postalCode:r,region:l,state:l,tod:A,timezone:c}},B=class extends C{constructor(t,s){super(t);this.location=K;this.location=_(s)}};var Te={async fetch(n,e,t){let s={...config,token:config.token};return N({"/green":{method:"GET",async handler(a,o){return E(v)}},"/red":{method:"GET",async handler(a,o){return E(P)}},"/yellow":{method:"GET",async handler(a,o){return E(D)}},"/jira_webhook":{method:"POST",async validate(a){return a.headers.get("super_dooper_secret_token")==="THE_super_dooper_secret_token"?{proceed:!0}:{proceed:!1}},async handler(a,o,r){return new Response("Ok",{status:200})}},"/whoami":{handler(a,o,r){let{cf:l}=a,{city:c,colo:A,continent:p,country:d,latitude:h,longitude:f,postalCode:m,region:g,timezone:u}=l||{},b=()=>`${Math.random().toString(36).slice(2)}`;return new Response(JSON.stringify({rando:`${b()}_${b()}`,city:c,colo:A,continent:p,country:d,latitude:h,longitude:f,postalCode:m,region:g,timezone:u}),{status:200,headers:{"content-type":"application/json"}})}},"/intercept":{method:"GET",handler(a,o,r){let l=new URL(a.url),{searchParams:c}=l,A=c.get("target")||null;return A?(r.waitUntil(new Promise(p=>{let{cf:d}=a,{city:h,colo:f,continent:m,country:g,latitude:u,longitude:b,postalCode:S,region:w,timezone:k}=d||{};console.log("# Analytics-ize this somehow...",h,f,m,g,u,b,S,w,k)})),Response.redirect(A)):new Response("No target specified")}},"/healthcheck":{method:"GET",handler(a){let l=`<html><h1 style="color:${((c=[])=>c[Math.floor(Math.random()*c.length)])(["#e74c3c","#e67e22","#16a085","#2980b9","#8e44ad","#2c3e50"])};">${a.url}</h1></html>`;return W(l)}},"/":{method:"POST",async handler(a,o,r){let l=await a.json();return r.waitUntil(new Promise(async(c,A)=>{let p=new Z(s,handlers,o);try{await p.processIncoming(l,a)}catch(d){return A(d),new Response(`Something happened, but backend is up and running: ${d}`)}})),I()}},"/ui":a=>new Response(M,{status:200,headers:{"content-type":"text/html;charset=UTF-8"}}),"/location":async(a,o,r)=>{let{cf:l}=a,{city:c,colo:A,continent:p,country:d,latitude:h,longitude:f,postalCode:m,region:g,timezone:u}=l||{},b=new URL(a.url),{searchParams:S}=b,w=S.get("roomId")||null,k=S.get("messageId")||null;if(!w||!k)return new Response("Missing parameters",{status:422});if(w&&k){let X={city:c,colo:A,continent:p,country:d,latitude:h,longitude:f,postalCode:m,region:g,timezone:u},Q={token:s.token,roomId:w,meta:{url:a.url},env:o},Y=new B(Q,X);if((await Y.deleteMessage(k)).status===404)return new Response("Sorry, that link is no longer valid",{status:401});if("location"in s&&typeof s.location=="function"){let V=s.location;r.waitUntil(new Promise(async ee=>{"location"in s&&V(Y)}))}return W('You can close this window.<script>window.close();window.addEventListener("load", window.close);setTimeout(window.close, 301);<\/script>')}else return I()},"/biscotti":(a,o,r)=>Response.redirect("https://www.youtube.com/watch?v=6A8W77m-ZTw&t=102s")},n,e,t)}};
export { O as InitBot, F as WebhookBot, Te as default }
//# sourceMappingURL=index.js.map

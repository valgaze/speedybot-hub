import { SpeedyCard } from './cards'

import { BotRoot } from './bot'
export type BotHandler<T = MESSAGE_TRIGGER> = {
  keyword: string | string[] | (string | RegExp)[]
  handler(bot: BotRoot, trigger: T): Promise<void> | void
  helpText?: string
  hideHelp?: boolean
}

export type SubmitHandler = {
  keyword: string // <@submit>
  handler(bot: typeof BotRoot, trigger: AA_TRIGGER): Promise<void>
  helpText?: string
}

// Speedybot-hub specific types
export type RequestTypes =
  | 'AA'
  | 'FILE'
  | 'TEXT'
  | 'MEMBERSHIP:ADD'
  | 'MEMBERSHIP:REMOVE' // AA, File trigger, Message trigger
export type ENVELOPES =
  | MembershipAdd_Envelope
  | MembershipRemove_Envelope
  | MessageEnvelope
  | AA_Envelope
  | FileEnvelope
export type DETAILS =
  | MessageDetails
  | AA_Details
  | FileMessageDetails
  | MembershipAdd_Details

// Get self data from token
export type SelfData = {
  id: string
  emails: string[]
  phoneNumbers: any[]
  displayName: string
  nickName: string
  userName: string
  avatar: string
  orgId: string
  created: Date
  status: string
  type: string
}

// Pass to create message
export type ToMessage = {
  roomId?: string
  parentId?: string
  toPersonId?: string
  toPersonEmail?: string
  text?: string
  markdown?: string
  files?: string[]
  attachments?: {
    contentType?: string
    content?: any // type this properly
  }[]
}

// Render card from designer or SpeedyCard
export type Card =
  | SpeedyCard
  | {
      contentType: 'application/vnd.microsoft.card.adaptive' | string
      content: {
        $schema: 'http://adaptivecards.io/schemas/adaptive-card.json'
        type: 'AdaptiveCard'
        version: '1.0' | string
        body: any[]
        actions: any[]
      }
    }

export type MessageDetails = {
  id: string
  roomId: string
  roomType: string
  text: string
  personId: string
  personEmail: string
  html?: string
  mentionedPeople?: string[]
  created: Date | string
}
// Combine these, make text optional on files
export type FileMessageDetails = {
  id: string
  roomId: string
  roomType: string
  text?: string
  personId: string
  personEmail: string
  html?: string
  mentionedPeople?: string[]
  created: Date | string
  files: string[]
}

// Messages

export type MessageEnvelope = {
  id: string
  name: string
  targetUrl: string
  resource: 'messages'
  event: string
  orgId: string
  createdBy: string
  appId: string
  ownedBy: string
  status: string
  created: Date | string
  actorId: string
  data: MessageData
}

export type FileEnvelope = {
  id: string
  name: string
  targetUrl: string
  resource: string
  event: string
  orgId: string
  createdBy: string
  appId: string
  ownedBy: string
  status: string
  created: Date | string
  actorId: string
  data: {
    id: string
    roomId: string
    roomType: string
    files: string[]
    personId: string
    personEmail: string
    created: string | Date
  }
}

export interface MessageData {
  id: string
  roomId: string
  roomType: string
  files?: string[]
  personId: string
  personEmail: string
  created: Date | string
}

export interface Message_Details {
  id: string
  roomId: string
  roomType: string
  text: string
  personId: string
  personEmail: string
  created: Date | string
}

export type File_Details = {
  id: string
  roomId: string
  roomType: string
  files: string[]
  personId: string
  personEmail: string
  created: Date | string
  text?: string
}

// Attachment Actions

// Incoming, could probably be combined w/ Message_Envelope differentiated by resource field
export type AA_Envelope = {
  id: string
  name: string
  targetUrl: string
  resource: 'attachmentActions'
  event: string
  orgId: string
  createdBy: string
  appId: string
  ownedBy: string
  status: string
  created: Date | string
  actorId: string
  data: {
    id: string
    type: string
    messageId: string
    personId: string
    roomId: string
    created: Date | string
  }
}

export type AA_Details = {
  id: string
  type: string
  messageId: string
  inputs: any
  personId: string
  roomId: string
  created: Date | string
}

// This is almost certainly not the AA details user wants,
// it's almost metadata about the request itself, original
// card JSON, etc

// - Attachment Actions message envelope:
// AAEnvelope.data.id: use this to retrieve input from Adaptive Card: https://developer.webex.com/docs/api/v1/attachment-actions/get-attachment-action-details
// AAEnvelope.data.messageId: this to get original card JSON & weirdness (AA_Details_WeirdOne): https://developer.webex.com/docs/api/v1/messages/get-message-details
export type AA_Details_WeirdOne = {
  id: string
  roomId: string
  roomType: string
  text?: string
  attachments: Attachment[]
  personId: string
  personEmail: string
  created: Date | string
}

export interface Attachment {
  contentType: string
  content: {
    $schema: string
    type: string
    version: string
    body: any[]
    actions: any[]
  }
}

// Triggers
// No difference between direct/group except for lopping off first nemtion
// in groups you need to mention agent, ex
// @agentname sendcard
export type TRIGGERS = AA_TRIGGER | MESSAGE_TRIGGER | FILE_TRIGGER

export type AA_TRIGGER = {
  type: string
  id: string
  attachmentAction: {
    id: string
    type: string
    messageId: string
    inputs: any
    personId: string
    roomId: string
    created: Date | string
  }
  person: {
    id: string
    emails: string[]
    displayName: string
    nickName: string
    firstName: string
    lastName: string
    userName: string
    avatar: string
    orgId: string
    created: Date | string
    lastModified: Date
    type: string
  }
  personId: string
}

export interface BaseMessage {
  id: string
  roomId: string
  roomType: string
  personId: string
  personEmail: string
  mentionedPeople?: string[] // optional
  created: Date | string
}

export interface TextMessage extends BaseMessage {
  text: string
  html: string
}
export interface FileMessage extends BaseMessage {
  text?: string // optional for file
  html?: string // optional for file
  files: string[]
}

export interface MESSAGE_TRIGGER {
  type: string
  id: string
  text: string
  args: string[]
  message: TextMessage
  person: {
    id: string
    emails: string[]
    displayName: string
    nickName: string
    firstName: string
    lastName: string
    userName: string
    avatar: string
    orgId: string
    created: Date | string
    lastModified: Date | string
    type: string
  }
  personId: string
  phrase: string
}

export interface FILE_TRIGGER {
  type: string
  id: string
  text?: string
  args: string[] // this will be empty [] if no text
  message: FileMessage
  person: {
    id: string
    emails: string[]
    displayName: string
    nickName: string
    firstName: string
    lastName: string
    userName: string
    avatar: string
    orgId: string
    created: Date | string
    lastModified: Date | string
    type: string
  }
  personId: string
  phrase?: string
}

// Any handler will be one of these
// <@fileupload> & <@camera> specifically will have FILE_TRIGGER
// <@submit> only will have AA_TRIGGER
// Default other handlers to MESSAGE_TRIGGER, if you upload a file/take photo
// that triggers <@fileupload> not the text handler (?)
export type Triggers = FILE_TRIGGER | MESSAGE_TRIGGER | AA_TRIGGER

// Memberships

// Bot added to a room
export type MembershipAdd_Envelope = {
  id: string
  name: string
  targetUrl: string
  resource: string
  event: string
  orgId: string
  createdBy: string
  appId: string
  ownedBy: string
  status: string
  created: Date | string
  actorId: string
  data: {
    id: string
    roomId: string
    roomType: string
    personId: string
    personEmail: string
    personDisplayName: string
    personOrgId: string
    isModerator: boolean
    isMonitor: boolean
    isRoomHidden: boolean
    created: Date | string
  }
}

export type MembershipAdd_Details = {
  id: string
  roomId: string
  roomType: string
  personId: string
  personEmail: string
  personDisplayName: string
  personOrgId: string
  isModerator: boolean
  isMonitor: boolean
  isRoomHidden: boolean
  created: Date | string
}

// Not really used, get an envelope that bot is removed from a space (no details since not a member)

export type MembershipRemove_Envelope = {
  id: string
  name: string
  targetUrl: string
  resource: string
  event: string
  orgId: string
  createdBy: string
  appId: string
  ownedBy: string
  status: string
  created: Date | string
  actorId: string
  data: {
    id: string
    roomId: string
    roomType: string
    personId: string
    personEmail: string
    personDisplayName: string
    personOrgId: string
    isModerator: boolean
    isMonitor: boolean
    isRoomHidden: boolean
    created: Date | string
  }
}

// ex. $bot.dm, $bot.say, etc
// todo...
export type MessageResponse = MessageDetails

export type RequestOps = {
  'content-type'?: string
  method?: string
  headers?: any
  raw?: boolean
  [key: string]: any
}

export const reqTypesEnum = Object.freeze({
  AA: 'AA',
  FILE: 'FILE',
  TEXT: 'TEXT',
  MEMBERSHIP_ADD: 'MEMBERSHIP:ADD',
})

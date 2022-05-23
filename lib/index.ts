import { SpeedyCard } from '../dist/lib';

export { SpeedyCard } from './cards'
export type SpeedyConfig = {
    debug?: boolean;
    token: string;
    locales?: {
        [localeName: string]: {
            [key: string]: string;
        }
     }
}







// util.dm('aaa-bbb-ccc', ['ping', {label: `send 'pong'`, keyword: 'pong'}, 'files'])
export type WebhookUtil = {
    dm(personId: string, message: string | SpeedyCard | string[] | ToMessage): Promise<MessageResponse>;
    sendRoom(roomId: string, message: string | SpeedyCard | string[] | ToMessage): Promise<MessageResponse>;
    send(payload:ToMessage): Promise<MessageResponse>;
}

export type Webhook<R=Request, C=any, T=any> = {
    route: string;
    handler(request: R, util: WebhookUtil): T
    config: C;
}
export type webhookConfig = {
    
}
export const Hub = (request:Request) => {
    // This'll be main interceptor
    // Speedybot/chat is just one interceptor
    /**
     * 
     * 
     * 
     * 
     * 
     * 
     * 
     */
}
export const placeholder = '__REPLACE__ME__'
export type BOT_TEMPORARY = {
    say(a: string): void
}
export type TRIGGER_TEMPORARY = {}

export type keywords = string | RegExp;
export type Allowedkeywords = keywords | keywords[];
export type handlerFunc = (bot: BOT_TEMPORARY, trigger?: TRIGGER_TEMPORARY) => void | Promise<void>;

export type SpeedybotHandler = {
    keyword: keywords;
    handler: handlerFunc;
    helpText?: string;
    hideHelp?: boolean;
}

// No more regex's supported in this optimized handler
// No aliases unless you manually specify ex
/**
 * const hiHandler = ($bot) =>
 * export const handlers = {
 * hi
 * 
 * }
 * 
 * 
 * 
 * 
 * 
 */
export type OptimzedSpeedybotHandler = {
    [key: string]: {
        alias?: string[]
        helpText?: string;
        hideHelp?: boolean;
        handler: handlerFunc;
    }
}
export type Handler = SpeedybotHandler | OptimzedSpeedybotHandler
export type Handlers = SpeedybotHandler[] | OptimzedSpeedybotHandler



const typeIngester = (req:reqTypes) => {
    if (reqTypes.AA) {

    }
    if (reqTypes.FILE) {
        vs
    }
}
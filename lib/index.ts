export type SpeedyConfig = {
    debug?: boolean;
    token: string;
    locales?: {
        [localeName: string]: {
            [key: string]: string;
        }
     }
}

export type BOT_TEMPORARY = {
    say(a: string): void
}
export type TRIGGER_TEMPORARY = {}


export type keywords = string | RegExp;
export type Allowedkeywords = keywords | keywords[];
export type handlerFunc = (bot: BOT_TEMPORARY, trigger: TRIGGER_TEMPORARY) => void | Promise<void>;

export type SpeedybotHandler = {
    keyword: keywords;
    handler: handlerFunc;
    helpText?: string;
    hideHelp?: boolean;
}

// No more regex's supported in this optimized handler
// 
export type OptimzedSpeedybotHandler = {
    [key: string]: {
        helpText?: string;
        handler: handlerFunc;
        hideHelp?: boolean;
    }
}

export type Handler = SpeedybotHandler | OptimzedSpeedybotHandler
export type Handlers = SpeedybotHandler[] | OptimzedSpeedybotHandler


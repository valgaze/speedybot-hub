import {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

import { handlers } from "./../settings/handlers";
import "isomorphic-fetch";
("use strict");
/**
 ╱╭━━━╮╱╭━━━╮╱╭━━━╮╱╭━━━╮╱╭━━━╮╱╭╮╱╱╭╮╱╭━━╮╱╱╭━━━╮╱╭━━━━╮╱
╱┃╭━╮┃╱┃╭━╮┃╱┃╭━━╯╱┃╭━━╯╱╰╮╭╮┃╱┃╰╮╭╯┃╱┃╭╮┃╱╱┃╭━╮┃╱┃╭╮╭╮┃╱
╱┃╰━━╮╱┃╰━╯┃╱┃╰━━╮╱┃╰━━╮╱╱┃┃┃┃╱╰╮╰╯╭╯╱┃╰╯╰╮╱┃┃╱┃┃╱╰╯┃┃╰╯╱
╱╰━━╮┃╱┃╭━━╯╱┃╭━━╯╱┃╭━━╯╱╱┃┃┃┃╱╱╰╮╭╯╱╱┃╭━╮┃╱┃┃╱┃┃╱╱╱┃┃╱╱╱
╱┃╰━╯┃╱┃┃╱╱╱╱┃╰━━╮╱┃╰━━╮╱╭╯╰╯┃╱╱╱┃┃╱╱╱┃╰━╯┃╱┃╰━╯┃╱╱╱┃┃╱╱╱
╱╰━━━╯╱╰╯╱╱╱╱╰━━━╯╱╰━━━╯╱╰━━━╯╱╱╱╰╯╱╱╱╰━━━╯╱╰━━━╯╱╱╱╰╯╱╱╱HUB (lambda edition)
 */

import { SpeedybotHub } from "./../lib/speedybot_hub";
import { SpeedyGuard, Hooks, finale } from "./../lib/common";
export { InitBot, WebhookBot } from "./../lib/bot";
import { ENVELOPES } from "./../lib/payloads.types";
import { config } from "./../settings/config";
export const handler: APIGatewayProxyHandlerV2 = async (
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyResult> => {
  // queryStrings & route
  // const { queryStringParameters = {} } = event;
  // const route = event.requestContext.http.path;

  let data = {};
  if ("body" in event && event.body) {
    try {
      data = JSON.parse(event.body);
    } catch (e) {
      console.log("#Error with body", e);
    }
  }

  // Redirects, handle incoming webhooks, location, ui, etc
  const hooks: Hooks = {
    "/jira_webhook": {
      method: "POST",
      async validate(event: APIGatewayProxyEventV2) {
        const check = event.headers["super_dooper_secret_token"];
        if (check === "THE_super_dooper_secret_token") {
          return { proceed: true };
        }
        return { proceed: false };
      },
      async handler(event: APIGatewayProxyEventV2, context: Context) {
        console.log("event.body", event.body);
        console.log("context", context);
        /*
        // Ex. send a message to process incoming webhook
        const BotConfig: Partial<BotConfig> = {
          token: config.token,
          url: request.url,
          helpContent: [],
        }
        const inst = WebhookBot(BotConfig)
        inst.dm('user@email.com', 'Some great message or card')
        inst.dmDataAsFile('user@email.com', { a: 1, b: 2, c: 3 }, 'json')
        inst.dm(
          'user@email.com',
          inst.card({
            title: 'my title',
            subTitle: 'subtitle',
            chips: ['hi', 'ping', 'pong'],
          })
        )
        */

        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: "ok",
        };
      },
    },
    "/": {
      method: "POST",
      async handler(event: APIGatewayProxyEventV2, context: Context) {
        const json = data; // lambda proxy integration
        // main speedybot
        const hub = new SpeedybotHub(config, handlers);
        try {
          await hub.processIncoming(json as ENVELOPES, event, context);
          // resolve()
          // HACK: don't resolve this promise, don't have good mechanism to
          // know for sure when handler is done since it's user-provided instructions
        } catch (e) {
          // reject(e);
          return {
            statusCode: 400,
            body: `Something happened, but backend is up and running: ${e}`,
          };
        }
        return finale();
      },
    },
  };

  return await SpeedyGuard(hooks, event, context);

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({
      msg: `ok`,
    }),
  };
};

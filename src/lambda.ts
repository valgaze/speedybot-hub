import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { finale } from "../lib/common";
export const handler: APIGatewayProxyHandlerV2 = async (event, ctx) => {
  // queryStrings
  const { queryStringParameters = {} } = event;

  // route
  const route = event.requestContext.http.path;

  return finale();
};

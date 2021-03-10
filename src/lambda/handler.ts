import { APIGatewayProxyResult } from "aws-lambda"

export async function handle (
): Promise<APIGatewayProxyResult> {
  return {
    body: "Hello from Lambda.",
    statusCode: 200,
  };
};

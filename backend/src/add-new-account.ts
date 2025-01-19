import { APIGatewayEvent, Context } from "aws-lambda";
import {
  DynamoDBClient,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

const ddbClient = new DynamoDBClient({ region: "us-west-2" });
const ACCOUNT_TABLE_NAME = "account-table";

export const handler = async (event: APIGatewayEvent, _: Context) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "No request body provided" }),
      };
    }

    const { email, displayName } = JSON.parse(event.body);
    if (!email || !displayName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "email and displayName required" }),
      };
    }

    const userId = uuidv4();

    await ddbClient.send(
      new PutItemCommand({
        TableName: ACCOUNT_TABLE_NAME,
        Item: {
          id: { S: userId },
          email: { S: email },
          displayName: { S: displayName },
          friends: { L: [] },
        },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ userId, message: "Account created" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to create account", error }),
    };
  }
};

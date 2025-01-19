import { APIGatewayEvent, Context } from "aws-lambda";
import {
  DynamoDBClient,
  ScanCommand,
  ScanCommandInput,
  ScanCommandOutput,
} from "@aws-sdk/client-dynamodb";

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

    const { email } = JSON.parse(event.body);
    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing 'email' field" }),
      };
    }

    // Scan the account-table for a matching email (naive approach).
    const params: ScanCommandInput = {
      TableName: ACCOUNT_TABLE_NAME,
      FilterExpression: "email = :emailVal",
      ExpressionAttributeValues: {
        ":emailVal": { S: email },
      },
    };

    const result: ScanCommandOutput = await ddbClient.send(
      new ScanCommand(params)
    );

    if (!result.Items || result.Count === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "User not found with the provided email",
        }),
      };
    }

    // Assuming only one user per email; take the first match
    const userItem = result.Items[0];
    const user = {
      id: userItem.id?.S,
      email: userItem.email?.S,
      displayName: userItem.displayName?.S,
      friends: userItem.friends?.L?.map((f) => f.S),
    };

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User found",
        user,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to retrieve user",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};

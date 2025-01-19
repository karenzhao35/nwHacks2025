import { APIGatewayEvent, Context } from "aws-lambda";
import {
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
} from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({ region: "us-west-2" });
const ACCOUNT_TABLE_NAME = "account-table";

export const handler = async (event: APIGatewayEvent, _: Context) => {
  try {

    const { accountId } = event.queryStringParameters || {};

    if (!accountId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "accountId is required" }),
      };
    }

    const params: GetItemCommandInput = {
      TableName: ACCOUNT_TABLE_NAME,
      Key: {
        id: { S: accountId },
      },
    };

    const result = await ddbClient.send(new GetItemCommand(params));

    const item = result.Item
      ? {
          id: result.Item.id.S,
          friends: result.Item.friends?.L?.map((f) => f.S) || [],
        }
      : null;

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Friends list fetched successfully",
        account: item,
      }),
    };
  } catch (err) {
    console.error("Error retrieving friend list:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to get friend list", error: err }),
    };
  }
};

import { APIGatewayEvent, Context } from "aws-lambda";
import {
  DynamoDBClient,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({ region: "us-west-2" });
const ACCOUNT_TABLE_NAME = "account-table";

export const handler = async (event: APIGatewayEvent, _: Context) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid request: no body provided" }),
      };
    }

    const { accountId, friendId } = JSON.parse(event.body);

    if (!accountId || !friendId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "accountId and friendId are required",
        }),
      };
    }

    const params: UpdateItemCommandInput = {
      TableName: ACCOUNT_TABLE_NAME,
      Key: {
        id: { S: accountId },
      },
      UpdateExpression: "SET #friends = list_append(if_not_exists(#friends, :emptyList), :friendVal)",
      ExpressionAttributeNames: {
        "#friends": "friends",
      },
      ExpressionAttributeValues: {
        ":friendVal": { L: [{ S: friendId }] },
        ":emptyList": { L: [] },
      },
      ReturnValues: "UPDATED_NEW",
    };

    const result = await ddbClient.send(new UpdateItemCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Friend added", result }),
    };
  } catch (err) {
    console.error("Error adding friend:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to add friend", error: err }),
    };
  }
};

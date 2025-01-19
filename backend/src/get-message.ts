import { APIGatewayEvent, Context } from "aws-lambda";
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

const ddb = new DynamoDBClient({ region: "us-west-2" });
const MESSAGE_TABLE_NAME = "message-table";

/**
 * This Lambda retrieves messages for a given 'recipient_id' from the 'message-table'.
 * Expects a query parameter: ?recipient_id=someRecipientID
 */
export const handler = async (event: APIGatewayEvent, _: Context) => {
  try {
    const recipient_id = event.queryStringParameters?.recipient_id;
    if (!recipient_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "recipient_id query parameter is required" }),
      };
    }

    // Query for all messages with the given recipient_id
    const queryParams = {
      TableName: MESSAGE_TABLE_NAME,
      KeyConditionExpression: "recipient_id = :rid",
      ExpressionAttributeValues: {
        ":rid": { S: recipient_id },
      },
    };

    const result = await ddb.send(new QueryCommand(queryParams));

    // Convert DynamoDB Items into a more friendly JSON shape
    const messages = (result.Items || []).map((item) => ({
      sender_id: item.sender_id?.S,
      recipient_id: item.recipient_id?.S,
      message: item.message?.S,
      s3_image: item.s3_image?.S,
      date: item.date?.S,
      category: item.category?.S,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ messages }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to retrieve messages", error }),
    };
  }
};

import { APIGatewayEvent, Context } from "aws-lambda";
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({ region: "us-west-2" });
const MESSAGE_TABLE_NAME = "message-table";

exports.handler = async (event: any) => {
    try {
        // Get the recipient_id from the query string parameters of the GET request
        const recipientId = event.queryStringParameters.recipient_id;
        const mood = event.queryStringParameters.mood;

        if (!recipientId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Recipient ID is required" }),
            };
        }

        if (!mood) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Mood is required" }),
            };
        }

        // Define the DynamoDB query parameters
        const params = {
            TableName: MESSAGE_TABLE_NAME,
            KeyConditionExpression: "recipient_id = :recipient_id",
            ExpressionAttributeValues: {
                ":recipient_id": { S: recipientId },
            },
            ScanIndexForward: false,
        };

        // Execute the query on DynamoDB
        const data = await ddbClient.send(new QueryCommand(params));

        // Check if there are any items returned
        if (data.Items && data.Items.length > 0) {
            let filteredItems = data.Items;
            // Filter the items where the category is "calming"
            if (mood === "anxious") {
                filteredItems = data.Items.filter(
                    (item: any) => item.category?.S === "encouraging"
                );
            } else if (mood === "annoyed") {
                filteredItems = data.Items.filter(
                    (item: any) => item.category?.S === "calming"
                );
            } else if (mood === "sad") {
                filteredItems = data.Items.filter(
                    (item: any) => item.category?.S === "empathetic"
                );
            }

            if (filteredItems.length > 0) {
                return {
                    statusCode: 200,
                    body: JSON.stringify(filteredItems),
                };
            } else {
                return {
                    statusCode: 404,
                    body: JSON.stringify({
                        message: "No matching messages found",
                    }),
                };
            }
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "This person has no friends",
                }),
            };
        }
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error" }),
        };
    }
};

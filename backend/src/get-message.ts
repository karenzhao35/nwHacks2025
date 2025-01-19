const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");

const ddbClient = new DynamoDBClient();

exports.handler = async (event: any) => {
    try {
        // Get the recipient_id from the query string parameters of the GET request
        const recipientId = event.queryStringParameters.recipient_id;

        if (!recipientId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Recipient ID is required" }),
            };
        }

        // Define the DynamoDB query parameters
        const params = {
            TableName: "message-table",
            KeyConditionExpression: "recipient_id = :recipient_id",
            ExpressionAttributeValues: {
                ":recipient_id": { S: recipientId },
            },
        };

        // Execute the query on DynamoDB
        const data = await ddbClient.send(new QueryCommand(params));

        // Check if there are any items returned
        if (data.Items && data.Items.length > 0) {
            return {
                statusCode: 200,
                body: JSON.stringify(data.Items),
            };
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

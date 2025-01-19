import {
    DynamoDBClient,
    PutItemCommand,
    ReturnConsumedCapacity,
} from "@aws-sdk/client-dynamodb";

import {
    BedrockRuntimeClient,
    InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

// Interface for the Message structure
interface Message {
    sender_id: string;
    recipient_id: string;
    message: string;
    s3_image?: string;
    date: string;
}

/**
 * Invokes Anthropic Claude 3 using the Messages API.
 *
 * To learn more about the Anthropic Messages API, go to:
 * https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-anthropic-claude-messages.html
 *
 * @param {string} prompt - The input text prompt for the model to complete.
 * @param {string} [modelId] - The ID of the model to use. Defaults to "anthropic.claude-3-haiku-20240307-v1:0".
 */
export const invokeModel = async (
    prompt: string,
    modelId = "anthropic.claude-3-5-sonnet-20241022-v2:0"
) => {
    // Create a new Bedrock Runtime client instance.
    const client = new BedrockRuntimeClient({ region: "us-west-2" });

    // Prepare the payload for the model.
    prompt = `"${prompt}"
Return a json in the form:
{
"category": "test-class"
}`;
    const payload = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1000,
        messages: [
            {
                role: "user",
                content: [{ type: "text", text: prompt }],
            },
        ],
    };

    // Invoke Claude with the payload and wait for the response.
    const command = new InvokeModelCommand({
        contentType: "application/json",
        body: JSON.stringify(payload),
        modelId,
    });
    const apiResponse = await client.send(command);

    // Decode and return the response(s)
    const decodedResponseBody = new TextDecoder().decode(apiResponse.body);
    /** @type {MessagesResponseBody} */
    const responseBody = JSON.parse(decodedResponseBody);
    console.log("BEDROCK_RESPONSE: ", responseBody.content[0].text);
    return responseBody.content[0].text;
};

/**
 *
 *
 *
 *
 *
 * Handler function for uploadMessage Lambda
 */

const dynamoDbClient = new DynamoDBClient();

export const handler = async (event: any) => {
    console.log("POST REQUEST: ", JSON.stringify(event));

    let messageData: Message = {
        sender_id: "",
        recipient_id: "",
        message: "",
        date: "",
    };

    try {
        messageData = JSON.parse(event.body);

        // Example usage
        console.log(`Sender ID: ${messageData.sender_id}`);
        console.log(`Recipient ID: ${messageData.recipient_id}`);
        console.log(`Message: ${messageData.message}`);
        console.log(
            `Image URL: ${messageData.s3_image ?? "No image provided"}`
        );
        console.log(`Date: ${new Date(messageData.date).toLocaleString()}`);
    } catch (error) {
        console.error("Failed to parse JSON:", error);
    }

    const modelResponseStr = await invokeModel(messageData.message);
    const modelResponseObj = JSON.parse(modelResponseStr);

    const tableName = "message-table"; // Replace with your table name
    const item = {
        recipient_id: {
            S: messageData.recipient_id,
        }, // Partition key
        sender_id: {
            S: messageData.sender_id,
        },
        message: {
            S: messageData.message,
        },
        s3_image: {
            S: messageData.s3_image ?? "",
        },
        date: {
            S: messageData.date,
        },
        category: {
            S: modelResponseObj.category,
        },
    };

    const params = {
        Item: item,
        ReturnConsumedCapacity: ReturnConsumedCapacity.NONE,
        TableName: tableName,
    };

    try {
        const result = await dynamoDbClient.send(new PutItemCommand(params));
        console.log("Item added successfully:", result);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Item added successfully",
                result,
            }),
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        console.error("Error adding item:", errorMessage);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Failed to add item",
                error: errorMessage,
            }),
        };
    }
};

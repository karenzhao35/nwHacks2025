import {
    DynamoDBClient,
    PutItemCommand,
    ReturnConsumedCapacity,
} from "@aws-sdk/client-dynamodb";

import {
    BedrockRuntimeClient,
    InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { v4 as uuidv4 } from "uuid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Interface for the Message structure
interface Message {
    sender_id: string;
    recipient_id: string;
    message: string;
    imageBase64?: string;
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
Categorize this message as "encouraging", "calming", "empathetic" Return this category as as a string in JSON format like this:
{
"category": <category>
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

const dynamoDbClient = new DynamoDBClient({ region: "us-west-2" });
const s3 = new S3Client({ region: "us-west-2" });

const BUCKET_NAME = "memories-images-495599764132";
const MESSAGE_TABLE_NAME = "message-table";

export const handler = async (event: any) => {
    console.log("POST REQUEST: ", JSON.stringify(event));

    let messageData: Message = {
        sender_id: "",
        recipient_id: "",
        message: "",
    };

    try {
        messageData = JSON.parse(event.body);

        if (
            !messageData.sender_id ||
            !messageData.recipient_id ||
            !messageData.message
        ) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message:
                        "Missing required fields (sender_id, recipient_id, or message)",
                }),
            };
        }

        // Example usage
        console.log(`Sender ID: ${messageData.sender_id}`);
        console.log(`Recipient ID: ${messageData.recipient_id}`);
        console.log(`Message: ${messageData.message}`);
        console.log(`Image: ${messageData.imageBase64 ?? "none"}`);
    } catch (error) {
        console.error("Failed to parse JSON:", error);
    }

    const modelResponseStr = await invokeModel(messageData.message);
    const modelResponseObj = JSON.parse(modelResponseStr);

    let imageURL = "none";

    if (messageData.imageBase64) {
        try {
            // Generate a unique S3 object key
            const imageKey = `images/${uuidv4()}.jpg`;
            const imageBuffer = Buffer.from(messageData.imageBase64, "base64");

            await s3.send(
                new PutObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: imageKey,
                    Body: imageBuffer,
                    ContentType: "image/jpeg",
                })
            );

            imageURL = `https://${BUCKET_NAME}.s3.amazonaws.com/${imageKey}`;
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            console.error("Error uploading image to S3", errorMessage);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: "Failed to upload image to S3",
                    error: errorMessage,
                }),
            };
        }
    }

    const currentDateISO = new Date().toISOString();

    try {
        // Store message metadata (including image URL) in DynamoDB
        await dynamoDbClient.send(
            new PutItemCommand({
                TableName: MESSAGE_TABLE_NAME,
                Item: {
                    sender_id: { S: messageData.sender_id },
                    recipient_id: { S: messageData.recipient_id },
                    message: { S: messageData.message },
                    s3_image: { S: imageURL },
                    date: { S: currentDateISO },
                    category: { S: modelResponseObj.category },
                },
            })
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Message and image stored successfully",
            }),
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        console.error("Error uploading to DynamoDB", errorMessage);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Failed to upload to DynamoDB",
                error: errorMessage,
            }),
        };
    }
};

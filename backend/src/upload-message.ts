import {
    DynamoDBClient,
    PutItemCommand,
    ReturnConsumedCapacity,
} from "@aws-sdk/client-dynamodb";

import {
    BedrockRuntimeClient,
    InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

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
    prompt = `"Remember, every great idea starts with a spark, and you're already igniting something amazing. The work you're doing—whether it's building solutions to help others or pushing your skills to new heights—matters deeply. Challenges may come, but they’re just stepping stones to something incredible. You’ve got the creativity, the skills, and the heart to make a real difference."
Classify this message as "Empathy", "Encouragement", "Compliment", "Negative"
Return a json in the form:
{
"mood": <class>
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
};

const dynamoDbClient = new DynamoDBClient();

export const handler = async (event: any) => {
    console.log("POST REQUEST: ", event);

    await invokeModel("");

    const tableName = "message-table"; // Replace with your table name
    const item = {
        recipient_id: {
            S: "test-id",
        }, // Partition key
        sender_id: {
            S: "test-id-2",
        },
        message: {
            S: "GOOD LUCK WITH YOUR STUFF!",
        },
        s3_image: {
            S: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Google_Images_2015_logo.svg/800px-Google_Images_2015_logo.svg.png",
        },
        date: {
            S: "Jul 12 2011",
        },
        mood: {
            S: "excited",
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

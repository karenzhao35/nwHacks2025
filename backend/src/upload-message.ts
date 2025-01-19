import { APIGatewayEvent, Context } from "aws-lambda";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({ region: "us-west-2" });
const ddb = new DynamoDBClient({ region: "us-west-2" });

const BUCKET_NAME = "memories-images-495599764132";
const MESSAGE_TABLE_NAME = "message-table";

export const handler = async (event: APIGatewayEvent, _: Context) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "No request body provided" }),
      };
    }

    const { sender_id, recipient_id, message, imageBase64, date, category } = JSON.parse(event.body);

    if (!sender_id || !recipient_id || !message || !imageBase64 || !date || !category) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    // Generate a unique S3 object key
    const imageKey = `images/${uuidv4()}.jpg`;
    const imageBuffer = Buffer.from(imageBase64, "base64");

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: imageKey,
        Body: imageBuffer,
        ContentType: "image/jpeg",
      })
    );

    const imageUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${imageKey}`;

    // Store message metadata (including image URL) in DynamoDB
    await ddb.send(
      new PutItemCommand({
        TableName: MESSAGE_TABLE_NAME,
        Item: {
          sender_id: { S: sender_id },
          recipient_id: { S: recipient_id },
          message: { S: message },
          s3_image: { S: imageUrl },
          date: { S: date },
          category: { S: category },
        },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Message and image stored successfully" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to store message", error }),
    };
  }
};

import { APIGatewayEvent, Context } from "aws-lambda";
import {
    DynamoDBClient,
    ScanCommand,
    ScanCommandOutput,
} from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({ region: "us-west-2" });
const ACCOUNT_TABLE_NAME = "account-table";

export const handler = async (event: APIGatewayEvent, _ctx: Context) => {
    try {
        console.log("Received event:", JSON.stringify(event, null, 2));

        const scanOutput: ScanCommandOutput = await ddbClient.send(
            new ScanCommand({
                TableName: ACCOUNT_TABLE_NAME,
            })
        );

        const users =
            scanOutput.Items?.map((item) => {
                return {
                    id: item.id?.S,
                    email: item.email?.S,
                    displayName: item.displayName?.S,
                    friends: item.friends?.L?.map((f) => f.S) || [],
                };
            }) || [];

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "All users retrieved successfully",
                users,
            }),
        };
    } catch (error) {
        console.error("Error retrieving all users:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Failed to retrieve users",
                error: error instanceof Error ? error.message : "Unknown error",
            }),
        };
    }
};

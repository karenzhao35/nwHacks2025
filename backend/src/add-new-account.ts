import { PostConfirmationTriggerEvent, Context } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({ region: "us-west-2" });

const ACCOUNT_TABLE_NAME = "account-table";

export const handler = async (event: PostConfirmationTriggerEvent, _: Context) => {
  try {
    const userId = event.request.userAttributes.sub;
    if (!userId) {
      console.warn("No 'sub' attribute found in the Cognito event.");
      return event; 
    }

    const email = event.request.userAttributes.email || "";
    const displayName = event.userName; 

    console.log("Cognito Post Confirmation Trigger:", {
      userId,
      email,
      displayName,
    });

    const putParams = {
      TableName: ACCOUNT_TABLE_NAME,
      Item: {
        id: { S: userId },
        email: { S: email },
        displayName: { S: displayName },
        friends: { L: [] }, 
      },
    };

    await ddbClient.send(new PutItemCommand(putParams));
    console.log("Successfully inserted user into DynamoDB:", ACCOUNT_TABLE_NAME);

 
    return event;
  } catch (error) {
    console.error("Error in add-new-account PostConfirmation trigger:", error);
    throw error; 
  }
};

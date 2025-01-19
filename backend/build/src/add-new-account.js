"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const ddbClient = new client_dynamodb_1.DynamoDBClient({ region: "us-west-2" });
const ACCOUNT_TABLE_NAME = "account-table";
exports.handler = async (event, _) => {
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
        await ddbClient.send(new client_dynamodb_1.PutItemCommand(putParams));
        console.log("Successfully inserted user into DynamoDB:", ACCOUNT_TABLE_NAME);
        return event;
    }
    catch (error) {
        console.error("Error in add-new-account PostConfirmation trigger:", error);
        throw error;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLW5ldy1hY2NvdW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FkZC1uZXctYWNjb3VudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSw4REFBMEU7QUFFMUUsTUFBTSxTQUFTLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7QUFFOUQsTUFBTSxrQkFBa0IsR0FBRyxlQUFlLENBQUM7QUFFOUIsUUFBQSxPQUFPLEdBQUcsS0FBSyxFQUFFLEtBQW1DLEVBQUUsQ0FBVSxFQUFFLEVBQUU7SUFDL0UsSUFBSTtRQUNGLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQztRQUNoRCxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1gsT0FBTyxDQUFDLElBQUksQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO1lBQy9ELE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO1FBQ3ZELE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7UUFFbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsRUFBRTtZQUNoRCxNQUFNO1lBQ04sS0FBSztZQUNMLFdBQVc7U0FDWixDQUFDLENBQUM7UUFFSCxNQUFNLFNBQVMsR0FBRztZQUNoQixTQUFTLEVBQUUsa0JBQWtCO1lBQzdCLElBQUksRUFBRTtnQkFDSixFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFO2dCQUNqQixLQUFLLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFO2dCQUNuQixXQUFXLEVBQUUsRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFO2dCQUMvQixPQUFPLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFO2FBQ25CO1NBQ0YsQ0FBQztRQUVGLE1BQU0sU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNwRCxPQUFPLENBQUMsR0FBRyxDQUFDLDJDQUEyQyxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFHN0UsT0FBTyxLQUFLLENBQUM7S0FDZDtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ2QsT0FBTyxDQUFDLEtBQUssQ0FBQyxvREFBb0QsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMzRSxNQUFNLEtBQUssQ0FBQztLQUNiO0FBQ0gsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUG9zdENvbmZpcm1hdGlvblRyaWdnZXJFdmVudCwgQ29udGV4dCB9IGZyb20gXCJhd3MtbGFtYmRhXCI7XHJcbmltcG9ydCB7IER5bmFtb0RCQ2xpZW50LCBQdXRJdGVtQ29tbWFuZCB9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcclxuXHJcbmNvbnN0IGRkYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7IHJlZ2lvbjogXCJ1cy13ZXN0LTJcIiB9KTtcclxuXHJcbmNvbnN0IEFDQ09VTlRfVEFCTEVfTkFNRSA9IFwiYWNjb3VudC10YWJsZVwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQ6IFBvc3RDb25maXJtYXRpb25UcmlnZ2VyRXZlbnQsIF86IENvbnRleHQpID0+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgdXNlcklkID0gZXZlbnQucmVxdWVzdC51c2VyQXR0cmlidXRlcy5zdWI7XHJcbiAgICBpZiAoIXVzZXJJZCkge1xyXG4gICAgICBjb25zb2xlLndhcm4oXCJObyAnc3ViJyBhdHRyaWJ1dGUgZm91bmQgaW4gdGhlIENvZ25pdG8gZXZlbnQuXCIpO1xyXG4gICAgICByZXR1cm4gZXZlbnQ7IFxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGVtYWlsID0gZXZlbnQucmVxdWVzdC51c2VyQXR0cmlidXRlcy5lbWFpbCB8fCBcIlwiO1xyXG4gICAgY29uc3QgZGlzcGxheU5hbWUgPSBldmVudC51c2VyTmFtZTsgXHJcblxyXG4gICAgY29uc29sZS5sb2coXCJDb2duaXRvIFBvc3QgQ29uZmlybWF0aW9uIFRyaWdnZXI6XCIsIHtcclxuICAgICAgdXNlcklkLFxyXG4gICAgICBlbWFpbCxcclxuICAgICAgZGlzcGxheU5hbWUsXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBwdXRQYXJhbXMgPSB7XHJcbiAgICAgIFRhYmxlTmFtZTogQUNDT1VOVF9UQUJMRV9OQU1FLFxyXG4gICAgICBJdGVtOiB7XHJcbiAgICAgICAgaWQ6IHsgUzogdXNlcklkIH0sXHJcbiAgICAgICAgZW1haWw6IHsgUzogZW1haWwgfSxcclxuICAgICAgICBkaXNwbGF5TmFtZTogeyBTOiBkaXNwbGF5TmFtZSB9LFxyXG4gICAgICAgIGZyaWVuZHM6IHsgTDogW10gfSwgXHJcbiAgICAgIH0sXHJcbiAgICB9O1xyXG5cclxuICAgIGF3YWl0IGRkYkNsaWVudC5zZW5kKG5ldyBQdXRJdGVtQ29tbWFuZChwdXRQYXJhbXMpKTtcclxuICAgIGNvbnNvbGUubG9nKFwiU3VjY2Vzc2Z1bGx5IGluc2VydGVkIHVzZXIgaW50byBEeW5hbW9EQjpcIiwgQUNDT1VOVF9UQUJMRV9OQU1FKTtcclxuXHJcbiBcclxuICAgIHJldHVybiBldmVudDtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIGluIGFkZC1uZXctYWNjb3VudCBQb3N0Q29uZmlybWF0aW9uIHRyaWdnZXI6XCIsIGVycm9yKTtcclxuICAgIHRocm93IGVycm9yOyBcclxuICB9XHJcbn07XHJcbiJdfQ==
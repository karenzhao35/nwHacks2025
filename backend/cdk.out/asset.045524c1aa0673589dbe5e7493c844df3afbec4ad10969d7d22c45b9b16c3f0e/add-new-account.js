"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const uuid_1 = require("uuid");
const ddbClient = new client_dynamodb_1.DynamoDBClient({ region: "us-west-2" });
const ACCOUNT_TABLE_NAME = "account-table";
exports.handler = async (event, _) => {
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "No request body provided" }),
            };
        }
        const { email, displayName } = JSON.parse(event.body);
        if (!email || !displayName) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "email and displayName required" }),
            };
        }
        const userId = uuid_1.v4();
        await ddbClient.send(new client_dynamodb_1.PutItemCommand({
            TableName: ACCOUNT_TABLE_NAME,
            Item: {
                id: { S: userId },
                email: { S: email },
                displayName: { S: displayName },
                friends: { L: [] },
            },
        }));
        return {
            statusCode: 200,
            body: JSON.stringify({ userId, message: "Account created" }),
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to create account", error }),
        };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkLW5ldy1hY2NvdW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FkZC1uZXctYWNjb3VudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSw4REFHa0M7QUFDbEMsK0JBQW9DO0FBRXBDLE1BQU0sU0FBUyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDO0FBQzlELE1BQU0sa0JBQWtCLEdBQUcsZUFBZSxDQUFDO0FBRTlCLFFBQUEsT0FBTyxHQUFHLEtBQUssRUFBRSxLQUFzQixFQUFFLENBQVUsRUFBRSxFQUFFO0lBQ2xFLElBQUk7UUFDRixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtZQUNmLE9BQU87Z0JBQ0wsVUFBVSxFQUFFLEdBQUc7Z0JBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsQ0FBQzthQUM5RCxDQUFDO1NBQ0g7UUFFRCxNQUFNLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDMUIsT0FBTztnQkFDTCxVQUFVLEVBQUUsR0FBRztnQkFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxnQ0FBZ0MsRUFBRSxDQUFDO2FBQ3BFLENBQUM7U0FDSDtRQUVELE1BQU0sTUFBTSxHQUFHLFNBQU0sRUFBRSxDQUFDO1FBRXhCLE1BQU0sU0FBUyxDQUFDLElBQUksQ0FDbEIsSUFBSSxnQ0FBYyxDQUFDO1lBQ2pCLFNBQVMsRUFBRSxrQkFBa0I7WUFDN0IsSUFBSSxFQUFFO2dCQUNKLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUU7Z0JBQ2pCLEtBQUssRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUU7Z0JBQ25CLFdBQVcsRUFBRSxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUU7Z0JBQy9CLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUU7YUFDbkI7U0FDRixDQUFDLENBQ0gsQ0FBQztRQUVGLE9BQU87WUFDTCxVQUFVLEVBQUUsR0FBRztZQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxDQUFDO1NBQzdELENBQUM7S0FDSDtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ2QsT0FBTztZQUNMLFVBQVUsRUFBRSxHQUFHO1lBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsS0FBSyxFQUFFLENBQUM7U0FDckUsQ0FBQztLQUNIO0FBQ0gsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheUV2ZW50LCBDb250ZXh0IH0gZnJvbSBcImF3cy1sYW1iZGFcIjtcclxuaW1wb3J0IHtcclxuICBEeW5hbW9EQkNsaWVudCxcclxuICBQdXRJdGVtQ29tbWFuZCxcclxufSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XHJcbmltcG9ydCB7IHY0IGFzIHV1aWR2NCB9IGZyb20gXCJ1dWlkXCI7XHJcblxyXG5jb25zdCBkZGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoeyByZWdpb246IFwidXMtd2VzdC0yXCIgfSk7XHJcbmNvbnN0IEFDQ09VTlRfVEFCTEVfTkFNRSA9IFwiYWNjb3VudC10YWJsZVwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQ6IEFQSUdhdGV3YXlFdmVudCwgXzogQ29udGV4dCkgPT4ge1xyXG4gIHRyeSB7XHJcbiAgICBpZiAoIWV2ZW50LmJvZHkpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdGF0dXNDb2RlOiA0MDAsXHJcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBtZXNzYWdlOiBcIk5vIHJlcXVlc3QgYm9keSBwcm92aWRlZFwiIH0pLFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgZW1haWwsIGRpc3BsYXlOYW1lIH0gPSBKU09OLnBhcnNlKGV2ZW50LmJvZHkpO1xyXG4gICAgaWYgKCFlbWFpbCB8fCAhZGlzcGxheU5hbWUpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzdGF0dXNDb2RlOiA0MDAsXHJcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBtZXNzYWdlOiBcImVtYWlsIGFuZCBkaXNwbGF5TmFtZSByZXF1aXJlZFwiIH0pLFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHVzZXJJZCA9IHV1aWR2NCgpO1xyXG5cclxuICAgIGF3YWl0IGRkYkNsaWVudC5zZW5kKFxyXG4gICAgICBuZXcgUHV0SXRlbUNvbW1hbmQoe1xyXG4gICAgICAgIFRhYmxlTmFtZTogQUNDT1VOVF9UQUJMRV9OQU1FLFxyXG4gICAgICAgIEl0ZW06IHtcclxuICAgICAgICAgIGlkOiB7IFM6IHVzZXJJZCB9LFxyXG4gICAgICAgICAgZW1haWw6IHsgUzogZW1haWwgfSxcclxuICAgICAgICAgIGRpc3BsYXlOYW1lOiB7IFM6IGRpc3BsYXlOYW1lIH0sXHJcbiAgICAgICAgICBmcmllbmRzOiB7IEw6IFtdIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSlcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3RhdHVzQ29kZTogMjAwLFxyXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHVzZXJJZCwgbWVzc2FnZTogXCJBY2NvdW50IGNyZWF0ZWRcIiB9KSxcclxuICAgIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN0YXR1c0NvZGU6IDUwMCxcclxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBtZXNzYWdlOiBcIkZhaWxlZCB0byBjcmVhdGUgYWNjb3VudFwiLCBlcnJvciB9KSxcclxuICAgIH07XHJcbiAgfVxyXG59O1xyXG4iXX0=
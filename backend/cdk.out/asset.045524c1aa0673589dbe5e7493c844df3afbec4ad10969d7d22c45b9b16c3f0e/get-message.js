"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const ddb = new client_dynamodb_1.DynamoDBClient({ region: "us-west-2" });
const MESSAGE_TABLE_NAME = "message-table";
/**
 * This Lambda retrieves messages for a given 'recipient_id' from the 'message-table'.
 * Expects a query parameter: ?recipient_id=someRecipientID
 */
exports.handler = async (event, _) => {
    var _a;
    try {
        const recipient_id = (_a = event.queryStringParameters) === null || _a === void 0 ? void 0 : _a.recipient_id;
        if (!recipient_id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "recipient_id query parameter is required" }),
            };
        }
        // Query for all messages with the given recipient_id
        const queryParams = {
            TableName: MESSAGE_TABLE_NAME,
            KeyConditionExpression: "recipient_id = :rid",
            ExpressionAttributeValues: {
                ":rid": { S: recipient_id },
            },
        };
        const result = await ddb.send(new client_dynamodb_1.QueryCommand(queryParams));
        // Convert DynamoDB Items into a more friendly JSON shape
        const messages = (result.Items || []).map((item) => {
            var _a, _b, _c, _d, _e, _f;
            return ({
                sender_id: (_a = item.sender_id) === null || _a === void 0 ? void 0 : _a.S,
                recipient_id: (_b = item.recipient_id) === null || _b === void 0 ? void 0 : _b.S,
                message: (_c = item.message) === null || _c === void 0 ? void 0 : _c.S,
                s3_image: (_d = item.s3_image) === null || _d === void 0 ? void 0 : _d.S,
                date: (_e = item.date) === null || _e === void 0 ? void 0 : _e.S,
                category: (_f = item.category) === null || _f === void 0 ? void 0 : _f.S,
            });
        });
        return {
            statusCode: 200,
            body: JSON.stringify({ messages }),
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to retrieve messages", error }),
        };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0LW1lc3NhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZ2V0LW1lc3NhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsOERBQXdFO0FBRXhFLE1BQU0sR0FBRyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDO0FBQ3hELE1BQU0sa0JBQWtCLEdBQUcsZUFBZSxDQUFDO0FBRTNDOzs7R0FHRztBQUNVLFFBQUEsT0FBTyxHQUFHLEtBQUssRUFBRSxLQUFzQixFQUFFLENBQVUsRUFBRSxFQUFFOztJQUNsRSxJQUFJO1FBQ0YsTUFBTSxZQUFZLFNBQUcsS0FBSyxDQUFDLHFCQUFxQiwwQ0FBRSxZQUFZLENBQUM7UUFDL0QsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNqQixPQUFPO2dCQUNMLFVBQVUsRUFBRSxHQUFHO2dCQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsT0FBTyxFQUFFLDBDQUEwQyxFQUFFLENBQUM7YUFDOUUsQ0FBQztTQUNIO1FBRUQscURBQXFEO1FBQ3JELE1BQU0sV0FBVyxHQUFHO1lBQ2xCLFNBQVMsRUFBRSxrQkFBa0I7WUFDN0Isc0JBQXNCLEVBQUUscUJBQXFCO1lBQzdDLHlCQUF5QixFQUFFO2dCQUN6QixNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUFFO2FBQzVCO1NBQ0YsQ0FBQztRQUVGLE1BQU0sTUFBTSxHQUFHLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFZLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUU3RCx5REFBeUQ7UUFDekQsTUFBTSxRQUFRLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFOztZQUFDLE9BQUEsQ0FBQztnQkFDbkQsU0FBUyxRQUFFLElBQUksQ0FBQyxTQUFTLDBDQUFFLENBQUM7Z0JBQzVCLFlBQVksUUFBRSxJQUFJLENBQUMsWUFBWSwwQ0FBRSxDQUFDO2dCQUNsQyxPQUFPLFFBQUUsSUFBSSxDQUFDLE9BQU8sMENBQUUsQ0FBQztnQkFDeEIsUUFBUSxRQUFFLElBQUksQ0FBQyxRQUFRLDBDQUFFLENBQUM7Z0JBQzFCLElBQUksUUFBRSxJQUFJLENBQUMsSUFBSSwwQ0FBRSxDQUFDO2dCQUNsQixRQUFRLFFBQUUsSUFBSSxDQUFDLFFBQVEsMENBQUUsQ0FBQzthQUMzQixDQUFDLENBQUE7U0FBQSxDQUFDLENBQUM7UUFFSixPQUFPO1lBQ0wsVUFBVSxFQUFFLEdBQUc7WUFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDO1NBQ25DLENBQUM7S0FDSDtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ2QsT0FBTztZQUNMLFVBQVUsRUFBRSxHQUFHO1lBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxPQUFPLEVBQUUsNkJBQTZCLEVBQUUsS0FBSyxFQUFFLENBQUM7U0FDeEUsQ0FBQztLQUNIO0FBQ0gsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheUV2ZW50LCBDb250ZXh0IH0gZnJvbSBcImF3cy1sYW1iZGFcIjtcclxuaW1wb3J0IHsgRHluYW1vREJDbGllbnQsIFF1ZXJ5Q29tbWFuZCB9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcclxuXHJcbmNvbnN0IGRkYiA9IG5ldyBEeW5hbW9EQkNsaWVudCh7IHJlZ2lvbjogXCJ1cy13ZXN0LTJcIiB9KTtcclxuY29uc3QgTUVTU0FHRV9UQUJMRV9OQU1FID0gXCJtZXNzYWdlLXRhYmxlXCI7XHJcblxyXG4vKipcclxuICogVGhpcyBMYW1iZGEgcmV0cmlldmVzIG1lc3NhZ2VzIGZvciBhIGdpdmVuICdyZWNpcGllbnRfaWQnIGZyb20gdGhlICdtZXNzYWdlLXRhYmxlJy5cclxuICogRXhwZWN0cyBhIHF1ZXJ5IHBhcmFtZXRlcjogP3JlY2lwaWVudF9pZD1zb21lUmVjaXBpZW50SURcclxuICovXHJcbmV4cG9ydCBjb25zdCBoYW5kbGVyID0gYXN5bmMgKGV2ZW50OiBBUElHYXRld2F5RXZlbnQsIF86IENvbnRleHQpID0+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVjaXBpZW50X2lkID0gZXZlbnQucXVlcnlTdHJpbmdQYXJhbWV0ZXJzPy5yZWNpcGllbnRfaWQ7XHJcbiAgICBpZiAoIXJlY2lwaWVudF9pZCkge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHN0YXR1c0NvZGU6IDQwMCxcclxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IG1lc3NhZ2U6IFwicmVjaXBpZW50X2lkIHF1ZXJ5IHBhcmFtZXRlciBpcyByZXF1aXJlZFwiIH0pLFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFF1ZXJ5IGZvciBhbGwgbWVzc2FnZXMgd2l0aCB0aGUgZ2l2ZW4gcmVjaXBpZW50X2lkXHJcbiAgICBjb25zdCBxdWVyeVBhcmFtcyA9IHtcclxuICAgICAgVGFibGVOYW1lOiBNRVNTQUdFX1RBQkxFX05BTUUsXHJcbiAgICAgIEtleUNvbmRpdGlvbkV4cHJlc3Npb246IFwicmVjaXBpZW50X2lkID0gOnJpZFwiLFxyXG4gICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7XHJcbiAgICAgICAgXCI6cmlkXCI6IHsgUzogcmVjaXBpZW50X2lkIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGRkYi5zZW5kKG5ldyBRdWVyeUNvbW1hbmQocXVlcnlQYXJhbXMpKTtcclxuXHJcbiAgICAvLyBDb252ZXJ0IER5bmFtb0RCIEl0ZW1zIGludG8gYSBtb3JlIGZyaWVuZGx5IEpTT04gc2hhcGVcclxuICAgIGNvbnN0IG1lc3NhZ2VzID0gKHJlc3VsdC5JdGVtcyB8fCBbXSkubWFwKChpdGVtKSA9PiAoe1xyXG4gICAgICBzZW5kZXJfaWQ6IGl0ZW0uc2VuZGVyX2lkPy5TLFxyXG4gICAgICByZWNpcGllbnRfaWQ6IGl0ZW0ucmVjaXBpZW50X2lkPy5TLFxyXG4gICAgICBtZXNzYWdlOiBpdGVtLm1lc3NhZ2U/LlMsXHJcbiAgICAgIHMzX2ltYWdlOiBpdGVtLnMzX2ltYWdlPy5TLFxyXG4gICAgICBkYXRlOiBpdGVtLmRhdGU/LlMsXHJcbiAgICAgIGNhdGVnb3J5OiBpdGVtLmNhdGVnb3J5Py5TLFxyXG4gICAgfSkpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN0YXR1c0NvZGU6IDIwMCxcclxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBtZXNzYWdlcyB9KSxcclxuICAgIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN0YXR1c0NvZGU6IDUwMCxcclxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBtZXNzYWdlOiBcIkZhaWxlZCB0byByZXRyaWV2ZSBtZXNzYWdlc1wiLCBlcnJvciB9KSxcclxuICAgIH07XHJcbiAgfVxyXG59O1xyXG4iXX0=
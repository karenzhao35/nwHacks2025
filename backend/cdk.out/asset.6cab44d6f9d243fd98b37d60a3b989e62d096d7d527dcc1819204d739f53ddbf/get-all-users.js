"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const ddbClient = new client_dynamodb_1.DynamoDBClient({ region: "us-west-2" });
const ACCOUNT_TABLE_NAME = "account-table";
exports.handler = async (event, _ctx) => {
    var _a;
    try {
        console.log("Received event:", JSON.stringify(event, null, 2));
        const scanOutput = await ddbClient.send(new client_dynamodb_1.ScanCommand({
            TableName: ACCOUNT_TABLE_NAME,
        }));
        const users = ((_a = scanOutput.Items) === null || _a === void 0 ? void 0 : _a.map((item) => {
            var _a, _b, _c, _d, _e;
            return {
                id: (_a = item.id) === null || _a === void 0 ? void 0 : _a.S,
                email: (_b = item.email) === null || _b === void 0 ? void 0 : _b.S,
                displayName: (_c = item.displayName) === null || _c === void 0 ? void 0 : _c.S,
                friends: ((_e = (_d = item.friends) === null || _d === void 0 ? void 0 : _d.L) === null || _e === void 0 ? void 0 : _e.map((f) => f.S)) || [],
            };
        })) || [];
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "All users retrieved successfully",
                users,
            }),
        };
    }
    catch (error) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0LWFsbC11c2Vycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9nZXQtYWxsLXVzZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLDhEQUlrQztBQUVsQyxNQUFNLFNBQVMsR0FBRyxJQUFJLGdDQUFjLENBQUMsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztBQUM5RCxNQUFNLGtCQUFrQixHQUFHLGVBQWUsQ0FBQztBQUU5QixRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBc0IsRUFBRSxJQUFhLEVBQUUsRUFBRTs7SUFDckUsSUFBSTtRQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFL0QsTUFBTSxVQUFVLEdBQXNCLE1BQU0sU0FBUyxDQUFDLElBQUksQ0FDeEQsSUFBSSw2QkFBVyxDQUFDO1lBQ2QsU0FBUyxFQUFFLGtCQUFrQjtTQUM5QixDQUFDLENBQ0gsQ0FBQztRQUVGLE1BQU0sS0FBSyxHQUFHLE9BQUEsVUFBVSxDQUFDLEtBQUssMENBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7O1lBQzNDLE9BQU87Z0JBQ0wsRUFBRSxRQUFFLElBQUksQ0FBQyxFQUFFLDBDQUFFLENBQUM7Z0JBQ2QsS0FBSyxRQUFFLElBQUksQ0FBQyxLQUFLLDBDQUFFLENBQUM7Z0JBQ3BCLFdBQVcsUUFBRSxJQUFJLENBQUMsV0FBVywwQ0FBRSxDQUFDO2dCQUNoQyxPQUFPLEVBQUUsYUFBQSxJQUFJLENBQUMsT0FBTywwQ0FBRSxDQUFDLDBDQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBSyxFQUFFO2FBQ2hELENBQUM7UUFDSixDQUFDLE1BQUssRUFBRSxDQUFDO1FBRVQsT0FBTztZQUNMLFVBQVUsRUFBRSxHQUFHO1lBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ25CLE9BQU8sRUFBRSxrQ0FBa0M7Z0JBQzNDLEtBQUs7YUFDTixDQUFDO1NBQ0gsQ0FBQztLQUNIO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLDZCQUE2QixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3BELE9BQU87WUFDTCxVQUFVLEVBQUUsR0FBRztZQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUNuQixPQUFPLEVBQUUsMEJBQTBCO2dCQUNuQyxLQUFLLEVBQUUsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsZUFBZTthQUNoRSxDQUFDO1NBQ0gsQ0FBQztLQUNIO0FBQ0gsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheUV2ZW50LCBDb250ZXh0IH0gZnJvbSBcImF3cy1sYW1iZGFcIjtcclxuaW1wb3J0IHtcclxuICBEeW5hbW9EQkNsaWVudCxcclxuICBTY2FuQ29tbWFuZCxcclxuICBTY2FuQ29tbWFuZE91dHB1dCxcclxufSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XHJcblxyXG5jb25zdCBkZGJDbGllbnQgPSBuZXcgRHluYW1vREJDbGllbnQoeyByZWdpb246IFwidXMtd2VzdC0yXCIgfSk7XHJcbmNvbnN0IEFDQ09VTlRfVEFCTEVfTkFNRSA9IFwiYWNjb3VudC10YWJsZVwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQ6IEFQSUdhdGV3YXlFdmVudCwgX2N0eDogQ29udGV4dCkgPT4ge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zb2xlLmxvZyhcIlJlY2VpdmVkIGV2ZW50OlwiLCBKU09OLnN0cmluZ2lmeShldmVudCwgbnVsbCwgMikpO1xyXG5cclxuICAgIGNvbnN0IHNjYW5PdXRwdXQ6IFNjYW5Db21tYW5kT3V0cHV0ID0gYXdhaXQgZGRiQ2xpZW50LnNlbmQoXHJcbiAgICAgIG5ldyBTY2FuQ29tbWFuZCh7XHJcbiAgICAgICAgVGFibGVOYW1lOiBBQ0NPVU5UX1RBQkxFX05BTUUsXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IHVzZXJzID0gc2Nhbk91dHB1dC5JdGVtcz8ubWFwKChpdGVtKSA9PiB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgaWQ6IGl0ZW0uaWQ/LlMsXHJcbiAgICAgICAgZW1haWw6IGl0ZW0uZW1haWw/LlMsXHJcbiAgICAgICAgZGlzcGxheU5hbWU6IGl0ZW0uZGlzcGxheU5hbWU/LlMsXHJcbiAgICAgICAgZnJpZW5kczogaXRlbS5mcmllbmRzPy5MPy5tYXAoKGYpID0+IGYuUykgfHwgW10sXHJcbiAgICAgIH07XHJcbiAgICB9KSB8fCBbXTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdGF0dXNDb2RlOiAyMDAsXHJcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICBtZXNzYWdlOiBcIkFsbCB1c2VycyByZXRyaWV2ZWQgc3VjY2Vzc2Z1bGx5XCIsXHJcbiAgICAgICAgdXNlcnMsXHJcbiAgICAgIH0pLFxyXG4gICAgfTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIHJldHJpZXZpbmcgYWxsIHVzZXJzOlwiLCBlcnJvcik7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdGF0dXNDb2RlOiA1MDAsXHJcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICBtZXNzYWdlOiBcIkZhaWxlZCB0byByZXRyaWV2ZSB1c2Vyc1wiLFxyXG4gICAgICAgIGVycm9yOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFwiVW5rbm93biBlcnJvclwiLFxyXG4gICAgICB9KSxcclxuICAgIH07XHJcbiAgfVxyXG59O1xyXG4iXX0=
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.invokeModel = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime");
/**
 * Invokes Anthropic Claude 3 using the Messages API.
 *
 * To learn more about the Anthropic Messages API, go to:
 * https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-anthropic-claude-messages.html
 *
 * @param {string} prompt - The input text prompt for the model to complete.
 * @param {string} [modelId] - The ID of the model to use. Defaults to "anthropic.claude-3-haiku-20240307-v1:0".
 */
exports.invokeModel = async (prompt, modelId = "anthropic.claude-3-5-sonnet-20241022-v2:0") => {
    // Create a new Bedrock Runtime client instance.
    const client = new client_bedrock_runtime_1.BedrockRuntimeClient({ region: "us-west-2" });
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
    const command = new client_bedrock_runtime_1.InvokeModelCommand({
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
const dynamoDbClient = new client_dynamodb_1.DynamoDBClient();
exports.handler = async (event) => {
    console.log("POST REQUEST: ", event);
    await exports.invokeModel("");
    const tableName = "message-table"; // Replace with your table name
    const item = {
        recipient_id: {
            S: "test-id",
        },
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
        ReturnConsumedCapacity: client_dynamodb_1.ReturnConsumedCapacity.NONE,
        TableName: tableName,
    };
    try {
        const result = await dynamoDbClient.send(new client_dynamodb_1.PutItemCommand(params));
        console.log("Item added successfully:", result);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Item added successfully",
                result,
            }),
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBsb2FkLW1lc3NhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXBsb2FkLW1lc3NhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBSWtDO0FBRWxDLDRFQUd5QztBQUV6Qzs7Ozs7Ozs7R0FRRztBQUNVLFFBQUEsV0FBVyxHQUFHLEtBQUssRUFDNUIsTUFBYyxFQUNkLE9BQU8sR0FBRywyQ0FBMkMsRUFDdkQsRUFBRTtJQUNBLGdEQUFnRDtJQUNoRCxNQUFNLE1BQU0sR0FBRyxJQUFJLDZDQUFvQixDQUFDLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFFakUscUNBQXFDO0lBQ3JDLE1BQU0sR0FBRzs7Ozs7RUFLWCxDQUFDO0lBQ0MsTUFBTSxPQUFPLEdBQUc7UUFDWixpQkFBaUIsRUFBRSxvQkFBb0I7UUFDdkMsVUFBVSxFQUFFLElBQUk7UUFDaEIsUUFBUSxFQUFFO1lBQ047Z0JBQ0ksSUFBSSxFQUFFLE1BQU07Z0JBQ1osT0FBTyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQzthQUM1QztTQUNKO0tBQ0osQ0FBQztJQUVGLDREQUE0RDtJQUM1RCxNQUFNLE9BQU8sR0FBRyxJQUFJLDJDQUFrQixDQUFDO1FBQ25DLFdBQVcsRUFBRSxrQkFBa0I7UUFDL0IsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDO1FBQzdCLE9BQU87S0FDVixDQUFDLENBQUM7SUFDSCxNQUFNLFdBQVcsR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFL0Msb0NBQW9DO0lBQ3BDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZFLG1DQUFtQztJQUNuQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDckQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BFLENBQUMsQ0FBQztBQUVGLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsRUFBRSxDQUFDO0FBRS9CLFFBQUEsT0FBTyxHQUFHLEtBQUssRUFBRSxLQUFVLEVBQUUsRUFBRTtJQUN4QyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRXJDLE1BQU0sbUJBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUV0QixNQUFNLFNBQVMsR0FBRyxlQUFlLENBQUMsQ0FBQywrQkFBK0I7SUFDbEUsTUFBTSxJQUFJLEdBQUc7UUFDVCxZQUFZLEVBQUU7WUFDVixDQUFDLEVBQUUsU0FBUztTQUNmO1FBQ0QsU0FBUyxFQUFFO1lBQ1AsQ0FBQyxFQUFFLFdBQVc7U0FDakI7UUFDRCxPQUFPLEVBQUU7WUFDTCxDQUFDLEVBQUUsNEJBQTRCO1NBQ2xDO1FBQ0QsUUFBUSxFQUFFO1lBQ04sQ0FBQyxFQUFFLDZIQUE2SDtTQUNuSTtRQUNELElBQUksRUFBRTtZQUNGLENBQUMsRUFBRSxhQUFhO1NBQ25CO1FBQ0QsSUFBSSxFQUFFO1lBQ0YsQ0FBQyxFQUFFLFNBQVM7U0FDZjtLQUNKLENBQUM7SUFFRixNQUFNLE1BQU0sR0FBRztRQUNYLElBQUksRUFBRSxJQUFJO1FBQ1Ysc0JBQXNCLEVBQUUsd0NBQXNCLENBQUMsSUFBSTtRQUNuRCxTQUFTLEVBQUUsU0FBUztLQUN2QixDQUFDO0lBRUYsSUFBSTtRQUNBLE1BQU0sTUFBTSxHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNyRSxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2hELE9BQU87WUFDSCxVQUFVLEVBQUUsR0FBRztZQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUNqQixPQUFPLEVBQUUseUJBQXlCO2dCQUNsQyxNQUFNO2FBQ1QsQ0FBQztTQUNMLENBQUM7S0FDTDtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osTUFBTSxZQUFZLEdBQ2QsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDO1FBQzdELE9BQU8sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDbEQsT0FBTztZQUNILFVBQVUsRUFBRSxHQUFHO1lBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ2pCLE9BQU8sRUFBRSxvQkFBb0I7Z0JBQzdCLEtBQUssRUFBRSxZQUFZO2FBQ3RCLENBQUM7U0FDTCxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xyXG4gICAgRHluYW1vREJDbGllbnQsXHJcbiAgICBQdXRJdGVtQ29tbWFuZCxcclxuICAgIFJldHVybkNvbnN1bWVkQ2FwYWNpdHksXHJcbn0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xyXG5cclxuaW1wb3J0IHtcclxuICAgIEJlZHJvY2tSdW50aW1lQ2xpZW50LFxyXG4gICAgSW52b2tlTW9kZWxDb21tYW5kLFxyXG59IGZyb20gXCJAYXdzLXNkay9jbGllbnQtYmVkcm9jay1ydW50aW1lXCI7XHJcblxyXG4vKipcclxuICogSW52b2tlcyBBbnRocm9waWMgQ2xhdWRlIDMgdXNpbmcgdGhlIE1lc3NhZ2VzIEFQSS5cclxuICpcclxuICogVG8gbGVhcm4gbW9yZSBhYm91dCB0aGUgQW50aHJvcGljIE1lc3NhZ2VzIEFQSSwgZ28gdG86XHJcbiAqIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9iZWRyb2NrL2xhdGVzdC91c2VyZ3VpZGUvbW9kZWwtcGFyYW1ldGVycy1hbnRocm9waWMtY2xhdWRlLW1lc3NhZ2VzLmh0bWxcclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IHByb21wdCAtIFRoZSBpbnB1dCB0ZXh0IHByb21wdCBmb3IgdGhlIG1vZGVsIHRvIGNvbXBsZXRlLlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gW21vZGVsSWRdIC0gVGhlIElEIG9mIHRoZSBtb2RlbCB0byB1c2UuIERlZmF1bHRzIHRvIFwiYW50aHJvcGljLmNsYXVkZS0zLWhhaWt1LTIwMjQwMzA3LXYxOjBcIi5cclxuICovXHJcbmV4cG9ydCBjb25zdCBpbnZva2VNb2RlbCA9IGFzeW5jIChcclxuICAgIHByb21wdDogc3RyaW5nLFxyXG4gICAgbW9kZWxJZCA9IFwiYW50aHJvcGljLmNsYXVkZS0zLTUtc29ubmV0LTIwMjQxMDIyLXYyOjBcIlxyXG4pID0+IHtcclxuICAgIC8vIENyZWF0ZSBhIG5ldyBCZWRyb2NrIFJ1bnRpbWUgY2xpZW50IGluc3RhbmNlLlxyXG4gICAgY29uc3QgY2xpZW50ID0gbmV3IEJlZHJvY2tSdW50aW1lQ2xpZW50KHsgcmVnaW9uOiBcInVzLXdlc3QtMlwiIH0pO1xyXG5cclxuICAgIC8vIFByZXBhcmUgdGhlIHBheWxvYWQgZm9yIHRoZSBtb2RlbC5cclxuICAgIHByb21wdCA9IGBcIlJlbWVtYmVyLCBldmVyeSBncmVhdCBpZGVhIHN0YXJ0cyB3aXRoIGEgc3BhcmssIGFuZCB5b3UncmUgYWxyZWFkeSBpZ25pdGluZyBzb21ldGhpbmcgYW1hemluZy4gVGhlIHdvcmsgeW91J3JlIGRvaW5n4oCUd2hldGhlciBpdCdzIGJ1aWxkaW5nIHNvbHV0aW9ucyB0byBoZWxwIG90aGVycyBvciBwdXNoaW5nIHlvdXIgc2tpbGxzIHRvIG5ldyBoZWlnaHRz4oCUbWF0dGVycyBkZWVwbHkuIENoYWxsZW5nZXMgbWF5IGNvbWUsIGJ1dCB0aGV54oCZcmUganVzdCBzdGVwcGluZyBzdG9uZXMgdG8gc29tZXRoaW5nIGluY3JlZGlibGUuIFlvdeKAmXZlIGdvdCB0aGUgY3JlYXRpdml0eSwgdGhlIHNraWxscywgYW5kIHRoZSBoZWFydCB0byBtYWtlIGEgcmVhbCBkaWZmZXJlbmNlLlwiXHJcbkNsYXNzaWZ5IHRoaXMgbWVzc2FnZSBhcyBcIkVtcGF0aHlcIiwgXCJFbmNvdXJhZ2VtZW50XCIsIFwiQ29tcGxpbWVudFwiLCBcIk5lZ2F0aXZlXCJcclxuUmV0dXJuIGEganNvbiBpbiB0aGUgZm9ybTpcclxue1xyXG5cIm1vb2RcIjogPGNsYXNzPlxyXG59YDtcclxuICAgIGNvbnN0IHBheWxvYWQgPSB7XHJcbiAgICAgICAgYW50aHJvcGljX3ZlcnNpb246IFwiYmVkcm9jay0yMDIzLTA1LTMxXCIsXHJcbiAgICAgICAgbWF4X3Rva2VuczogMTAwMCxcclxuICAgICAgICBtZXNzYWdlczogW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByb2xlOiBcInVzZXJcIixcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IFt7IHR5cGU6IFwidGV4dFwiLCB0ZXh0OiBwcm9tcHQgfV0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgXSxcclxuICAgIH07XHJcblxyXG4gICAgLy8gSW52b2tlIENsYXVkZSB3aXRoIHRoZSBwYXlsb2FkIGFuZCB3YWl0IGZvciB0aGUgcmVzcG9uc2UuXHJcbiAgICBjb25zdCBjb21tYW5kID0gbmV3IEludm9rZU1vZGVsQ29tbWFuZCh7XHJcbiAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHBheWxvYWQpLFxyXG4gICAgICAgIG1vZGVsSWQsXHJcbiAgICB9KTtcclxuICAgIGNvbnN0IGFwaVJlc3BvbnNlID0gYXdhaXQgY2xpZW50LnNlbmQoY29tbWFuZCk7XHJcblxyXG4gICAgLy8gRGVjb2RlIGFuZCByZXR1cm4gdGhlIHJlc3BvbnNlKHMpXHJcbiAgICBjb25zdCBkZWNvZGVkUmVzcG9uc2VCb2R5ID0gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKGFwaVJlc3BvbnNlLmJvZHkpO1xyXG4gICAgLyoqIEB0eXBlIHtNZXNzYWdlc1Jlc3BvbnNlQm9keX0gKi9cclxuICAgIGNvbnN0IHJlc3BvbnNlQm9keSA9IEpTT04ucGFyc2UoZGVjb2RlZFJlc3BvbnNlQm9keSk7XHJcbiAgICBjb25zb2xlLmxvZyhcIkJFRFJPQ0tfUkVTUE9OU0U6IFwiLCByZXNwb25zZUJvZHkuY29udGVudFswXS50ZXh0KTtcclxufTtcclxuXHJcbmNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KCk7XHJcblxyXG5leHBvcnQgY29uc3QgaGFuZGxlciA9IGFzeW5jIChldmVudDogYW55KSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZyhcIlBPU1QgUkVRVUVTVDogXCIsIGV2ZW50KTtcclxuXHJcbiAgICBhd2FpdCBpbnZva2VNb2RlbChcIlwiKTtcclxuXHJcbiAgICBjb25zdCB0YWJsZU5hbWUgPSBcIm1lc3NhZ2UtdGFibGVcIjsgLy8gUmVwbGFjZSB3aXRoIHlvdXIgdGFibGUgbmFtZVxyXG4gICAgY29uc3QgaXRlbSA9IHtcclxuICAgICAgICByZWNpcGllbnRfaWQ6IHtcclxuICAgICAgICAgICAgUzogXCJ0ZXN0LWlkXCIsXHJcbiAgICAgICAgfSwgLy8gUGFydGl0aW9uIGtleVxyXG4gICAgICAgIHNlbmRlcl9pZDoge1xyXG4gICAgICAgICAgICBTOiBcInRlc3QtaWQtMlwiLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWVzc2FnZToge1xyXG4gICAgICAgICAgICBTOiBcIkdPT0QgTFVDSyBXSVRIIFlPVVIgU1RVRkYhXCIsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzM19pbWFnZToge1xyXG4gICAgICAgICAgICBTOiBcImh0dHBzOi8vdXBsb2FkLndpa2ltZWRpYS5vcmcvd2lraXBlZGlhL2NvbW1vbnMvdGh1bWIvNy83Ny9Hb29nbGVfSW1hZ2VzXzIwMTVfbG9nby5zdmcvODAwcHgtR29vZ2xlX0ltYWdlc18yMDE1X2xvZ28uc3ZnLnBuZ1wiLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGF0ZToge1xyXG4gICAgICAgICAgICBTOiBcIkp1bCAxMiAyMDExXCIsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBtb29kOiB7XHJcbiAgICAgICAgICAgIFM6IFwiZXhjaXRlZFwiLFxyXG4gICAgICAgIH0sXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHBhcmFtcyA9IHtcclxuICAgICAgICBJdGVtOiBpdGVtLFxyXG4gICAgICAgIFJldHVybkNvbnN1bWVkQ2FwYWNpdHk6IFJldHVybkNvbnN1bWVkQ2FwYWNpdHkuTk9ORSxcclxuICAgICAgICBUYWJsZU5hbWU6IHRhYmxlTmFtZSxcclxuICAgIH07XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBQdXRJdGVtQ29tbWFuZChwYXJhbXMpKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIkl0ZW0gYWRkZWQgc3VjY2Vzc2Z1bGx5OlwiLCByZXN1bHQpO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IDIwMCxcclxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJJdGVtIGFkZGVkIHN1Y2Nlc3NmdWxseVwiLFxyXG4gICAgICAgICAgICAgICAgcmVzdWx0LFxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICB9O1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPVxyXG4gICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFwiVW5rbm93biBlcnJvclwiO1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBhZGRpbmcgaXRlbTpcIiwgZXJyb3JNZXNzYWdlKTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBzdGF0dXNDb2RlOiA1MDAsXHJcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiRmFpbGVkIHRvIGFkZCBpdGVtXCIsXHJcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JNZXNzYWdlLFxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59O1xyXG4iXX0=
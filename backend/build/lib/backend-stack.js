"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoriesBackendStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_apigateway_1 = require("aws-cdk-lib/aws-apigateway");
const aws_dynamodb_1 = require("aws-cdk-lib/aws-dynamodb");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
const aws_logs_1 = require("aws-cdk-lib/aws-logs");
const aws_s3_1 = require("aws-cdk-lib/aws-s3");
class MemoriesBackendStack extends aws_cdk_lib_1.Stack {
    constructor(app, id) {
        super(app, id, {
            env: {
                region: "us-west-2",
            },
        });
        // Create public upload bucket
        //
        const imagesBucket = new aws_s3_1.Bucket(this, "MemoriesImageBucket", {
            bucketName: `memories-images-${this.account}`,
            encryption: aws_s3_1.BucketEncryption.S3_MANAGED,
            publicReadAccess: true,
            blockPublicAccess: {
                blockPublicAcls: false,
                ignorePublicAcls: false,
                restrictPublicBuckets: false,
                blockPublicPolicy: false,
            },
        });
        imagesBucket.addCorsRule({
            allowedHeaders: ["*"],
            allowedMethods: [
                aws_s3_1.HttpMethods.GET,
                aws_s3_1.HttpMethods.HEAD,
                aws_s3_1.HttpMethods.PUT,
                aws_s3_1.HttpMethods.POST,
                aws_s3_1.HttpMethods.DELETE,
            ],
            allowedOrigins: ["*"],
            exposedHeaders: ["ETag"],
        });
        // DynamoDB
        this.accountTable = new aws_dynamodb_1.Table(this, "AccountTable", {
            tableName: MemoriesBackendStack.ACCOUNT_TABLE,
            partitionKey: {
                name: "id",
                type: aws_dynamodb_1.AttributeType.STRING,
            },
            billingMode: aws_dynamodb_1.BillingMode.PAY_PER_REQUEST,
        });
        this.messageTable = new aws_dynamodb_1.Table(this, "MessageTable", {
            tableName: MemoriesBackendStack.MESSAGE_TABLE,
            partitionKey: {
                name: "recipient_id",
                type: aws_dynamodb_1.AttributeType.STRING,
            },
            billingMode: aws_dynamodb_1.BillingMode.PAY_PER_REQUEST,
        });
        const identifierGsiProps = {
            indexName: "sender-index",
            partitionKey: {
                name: "sender_id",
                type: aws_dynamodb_1.AttributeType.STRING,
            },
            projectionType: aws_dynamodb_1.ProjectionType.ALL,
        };
        this.messageTable.addGlobalSecondaryIndex(identifierGsiProps);
        // Lambda function to execute inference.
        //
        const lambdaRole = new aws_iam_1.Role(this, "MemoriesLambdaRole", {
            roleName: "MemoriesLambdaRole",
            assumedBy: new aws_iam_1.ServicePrincipal("lambda.amazonaws.com"),
            inlinePolicies: {
                additional: new aws_iam_1.PolicyDocument({
                    statements: [
                        new aws_iam_1.PolicyStatement({
                            effect: aws_iam_1.Effect.ALLOW,
                            actions: [
                                // IAM
                                "ec2:CreateNetworkInterface",
                                "ec2:Describe*",
                                "ec2:DeleteNetworkInterface",
                                // IAM
                                "iam:GetRole",
                                "iam:PassRole",
                                // Lambda
                                "lambda:InvokeFunction",
                                // S3
                                "s3:*",
                                "kms:*",
                                // STS
                                "sts:AssumeRole",
                                // CloudWatch
                                "cloudwatch:*",
                                "logs:*",
                                // DynamodDB
                                "dynanodb:*",
                            ],
                            resources: ["*"],
                        }),
                    ],
                }),
            },
        });
        this.uploadMessageFunction = new aws_lambda_1.Function(this, "UploadMessageFunction", {
            functionName: "UploadMessage",
            code: new aws_lambda_1.AssetCode("build/src"),
            handler: "upload-message.handler",
            runtime: aws_lambda_1.Runtime.NODEJS_18_X,
            role: lambdaRole,
            memorySize: 1024,
            timeout: aws_cdk_lib_1.Duration.seconds(300),
            logRetention: aws_logs_1.RetentionDays.THREE_MONTHS,
        });
        this.getMessageFunction = new aws_lambda_1.Function(this, "GetMessageFunction", {
            functionName: "GetMessage",
            code: new aws_lambda_1.AssetCode("build/src"),
            handler: "get-message.handler",
            runtime: aws_lambda_1.Runtime.NODEJS_18_X,
            role: lambdaRole,
            memorySize: 1024,
            timeout: aws_cdk_lib_1.Duration.seconds(300),
            logRetention: aws_logs_1.RetentionDays.THREE_MONTHS,
        });
        // API Gateway
        //
        const api = new aws_apigateway_1.RestApi(this, "MemoriesApiGateway", {
            restApiName: "Memories API",
        });
        const messageAPI = api.root.addResource("message");
        const uploadIntegration = new aws_apigateway_1.LambdaIntegration(this.uploadMessageFunction, {
            proxy: true,
        });
        messageAPI.addMethod("POST", uploadIntegration);
        const getIntegration = new aws_apigateway_1.LambdaIntegration(this.getMessageFunction);
        messageAPI.addMethod("GET", getIntegration);
        messageAPI.addMethod("OPTIONS", uploadIntegration);
    }
}
exports.MemoriesBackendStack = MemoriesBackendStack;
MemoriesBackendStack.ACCOUNT_TABLE = "account-table";
MemoriesBackendStack.MESSAGE_TABLE = "message-table";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2VuZC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9iYWNrZW5kLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQUE4RDtBQUM5RCwrREFJb0M7QUFDcEMsMkRBTWtDO0FBQ2xDLGlEQU02QjtBQUM3Qix1REFBc0U7QUFDdEUsbURBQXFEO0FBQ3JELCtDQUs0QjtBQUU1QixNQUFhLG9CQUFxQixTQUFRLG1CQUFLO0lBUzNDLFlBQVksR0FBUSxFQUFFLEVBQVU7UUFDNUIsS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUU7WUFDWCxHQUFHLEVBQUU7Z0JBQ0QsTUFBTSxFQUFFLFdBQVc7YUFDdEI7U0FDSixDQUFDLENBQUM7UUFFSCw4QkFBOEI7UUFDOUIsRUFBRTtRQUNGLE1BQU0sWUFBWSxHQUFHLElBQUksZUFBTSxDQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRTtZQUN6RCxVQUFVLEVBQUUsbUJBQW1CLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDN0MsVUFBVSxFQUFFLHlCQUFnQixDQUFDLFVBQVU7WUFDdkMsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixpQkFBaUIsRUFBRTtnQkFDZixlQUFlLEVBQUUsS0FBSztnQkFDdEIsZ0JBQWdCLEVBQUUsS0FBSztnQkFDdkIscUJBQXFCLEVBQUUsS0FBSztnQkFDNUIsaUJBQWlCLEVBQUUsS0FBSzthQUMzQjtTQUNKLENBQUMsQ0FBQztRQUNILFlBQVksQ0FBQyxXQUFXLENBQUM7WUFDckIsY0FBYyxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQ3JCLGNBQWMsRUFBRTtnQkFDWixvQkFBVyxDQUFDLEdBQUc7Z0JBQ2Ysb0JBQVcsQ0FBQyxJQUFJO2dCQUNoQixvQkFBVyxDQUFDLEdBQUc7Z0JBQ2Ysb0JBQVcsQ0FBQyxJQUFJO2dCQUNoQixvQkFBVyxDQUFDLE1BQU07YUFDckI7WUFDRCxjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDckIsY0FB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SUFBSSxFQUFFLFVBQVU7WUFDaEIsVUFBVSxFQUFFLElBQUk7WUFDaEIsT0FBTyxFQUFFLHNCQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUM5QixZQUFZLEVBQUUsd0JBQWEsQ0FBQyxZQUFZO1NBQzNDLENBQUMsQ0FBQztRQUVILGNBQWM7UUFDZCxFQUFFO1FBQ0YsTUFBTSxHQUFHLEdBQUcsSUFBSSx3QkFBTyxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRTtZQUNoRCxXQUFXLEVBQUUsY0FBYztTQUM5QixDQUFDLENBQUM7UUFFSCxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVuRCxNQUFNLGlCQUFpQixHQUFHLElBQUksa0NBQWlCLENBQzNDLElBQUksQ0FBQyxxQkFBcUIsRUFDMUI7WUFDSSxLQUFLLEVBQUUsSUFBSTtTQUNkLENBQ0osQ0FBQztRQUNGLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFFaEQsTUFBTSxjQUFjLEdBQUcsSUFBSSxrQ0FBaUIsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUN0RSxVQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxjQUFjLENBQUMsQ0FBQztRQUU1QyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7O0FBM0pMLG9EQTRKQztBQTNKaUIsa0NBQWEsR0FBRyxlQUFlLENBQUM7QUFDaEMsa0NBQWEsR0FBRyxlQUFlLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHAsIER1cmF0aW9uLCBJUmVzb3VyY2UsIFN0YWNrIH0gZnJvbSBcImF3cy1jZGstbGliXCI7XG5pbXBvcnQge1xuICAgIExhbWJkYUludGVncmF0aW9uLFxuICAgIE1vY2tJbnRlZ3JhdGlvbixcbiAgICBSZXN0QXBpLFxufSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXlcIjtcbmltcG9ydCB7XG4gICAgQXR0cmlidXRlVHlwZSxcbiAgICBCaWxsaW5nTW9kZSxcbiAgICBHbG9iYWxTZWNvbmRhcnlJbmRleFByb3BzLFxuICAgIFRhYmxlLFxuICAgIFByb2plY3Rpb25UeXBlLFxufSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWR5bmFtb2RiXCI7XG5pbXBvcnQge1xuICAgIEVmZmVjdCxcbiAgICBQb2xpY3lEb2N1bWVudCxcbiAgICBQb2xpY3lTdGF0ZW1lbnQsXG4gICAgUm9sZSxcbiAgICBTZXJ2aWNlUHJpbmNpcGFsLFxufSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xuaW1wb3J0IHsgQXNzZXRDb2RlLCBGdW5jdGlvbiwgUnVudGltZSB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtbGFtYmRhXCI7XG5pbXBvcnQgeyBSZXRlbnRpb25EYXlzIH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1sb2dzXCI7XG5pbXBvcnQge1xuICAgIEJsb2NrUHVibGljQWNjZXNzLFxuICAgIEJ1Y2tldCxcbiAgICBCdWNrZXRFbmNyeXB0aW9uLFxuICAgIEh0dHBNZXRob2RzLFxufSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLXMzXCI7XG5cbmV4cG9ydCBjbGFzcyBNZW1vcmllc0JhY2tlbmRTdGFjayBleHRlbmRzIFN0YWNrIHtcbiAgICBwdWJsaWMgc3RhdGljIEFDQ09VTlRfVEFCTEUgPSBcImFjY291bnQtdGFibGVcIjtcbiAgICBwdWJsaWMgc3RhdGljIE1FU1NBR0VfVEFCTEUgPSBcIm1lc3NhZ2UtdGFibGVcIjtcblxuICAgIHB1YmxpYyByZWFkb25seSBhY2NvdW50VGFibGU6IFRhYmxlO1xuICAgIHB1YmxpYyByZWFkb25seSBtZXNzYWdlVGFibGU6IFRhYmxlO1xuICAgIHB1YmxpYyByZWFkb25seSB1cGxvYWRNZXNzYWdlRnVuY3Rpb246IEZ1bmN0aW9uO1xuICAgIHB1YmxpYyByZWFkb25seSBnZXRNZXNzYWdlRnVuY3Rpb246IEZ1bmN0aW9uO1xuXG4gICAgY29uc3RydWN0b3IoYXBwOiBBcHAsIGlkOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoYXBwLCBpZCwge1xuICAgICAgICAgICAgZW52OiB7XG4gICAgICAgICAgICAgICAgcmVnaW9uOiBcInVzLXdlc3QtMlwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHB1YmxpYyB1cGxvYWQgYnVja2V0XG4gICAgICAgIC8vXG4gICAgICAgIGNvbnN0IGltYWdlc0J1Y2tldCA9IG5ldyBCdWNrZXQodGhpcywgXCJNZW1vcmllc0ltYWdlQnVja2V0XCIsIHtcbiAgICAgICAgICAgIGJ1Y2tldE5hbWU6IGBtZW1vcmllcy1pbWFnZXMtJHt0aGlzLmFjY291bnR9YCxcbiAgICAgICAgICAgIGVuY3J5cHRpb246IEJ1Y2tldEVuY3J5cHRpb24uUzNfTUFOQUdFRCxcbiAgICAgICAgICAgIHB1YmxpY1JlYWRBY2Nlc3M6IHRydWUsXG4gICAgICAgICAgICBibG9ja1B1YmxpY0FjY2Vzczoge1xuICAgICAgICAgICAgICAgIGJsb2NrUHVibGljQWNsczogZmFsc2UsXG4gICAgICAgICAgICAgICAgaWdub3JlUHVibGljQWNsczogZmFsc2UsXG4gICAgICAgICAgICAgICAgcmVzdHJpY3RQdWJsaWNCdWNrZXRzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBibG9ja1B1YmxpY1BvbGljeTogZmFsc2UsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgaW1hZ2VzQnVja2V0LmFkZENvcnNSdWxlKHtcbiAgICAgICAgICAgIGFsbG93ZWRIZWFkZXJzOiBbXCIqXCJdLFxuICAgICAgICAgICAgYWxsb3dlZE1ldGhvZHM6IFtcbiAgICAgICAgICAgICAgICBIdHRwTWV0aG9kcy5HRVQsXG4gICAgICAgICAgICAgICAgSHR0cE1ldGhvZHMuSEVBRCxcbiAgICAgICAgICAgICAgICBIdHRwTWV0aG9kcy5QVVQsXG4gICAgICAgICAgICAgICAgSHR0cE1ldGhvZHMuUE9TVCxcbiAgICAgICAgICAgICAgICBIdHRwTWV0aG9kcy5ERUxFVEUsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgYWxsb3dlZE9yaWdpbnM6IFtcIipcIl0sXG4gICAgICAgICAgICBleHBvc2VkSGVhZGVyczogW1wiRVRhZ1wiXSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gRHluYW1vREJcbiAgICAgICAgdGhpcy5hY2NvdW50VGFibGUgPSBuZXcgVGFibGUodGhpcywgXCJBY2NvdW50VGFibGVcIiwge1xuICAgICAgICAgICAgdGFibGVOYW1lOiBNZW1vcmllc0JhY2tlbmRTdGFjay5BQ0NPVU5UX1RBQkxFLFxuICAgICAgICAgICAgcGFydGl0aW9uS2V5OiB7XG4gICAgICAgICAgICAgICAgbmFtZTogXCJpZFwiLFxuICAgICAgICAgICAgICAgIHR5cGU6IEF0dHJpYnV0ZVR5cGUuU1RSSU5HLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJpbGxpbmdNb2RlOiBCaWxsaW5nTW9kZS5QQVlfUEVSX1JFUVVFU1QsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMubWVzc2FnZVRhYmxlID0gbmV3IFRhYmxlKHRoaXMsIFwiTWVzc2FnZVRhYmxlXCIsIHtcbiAgICAgICAgICAgIHRhYmxlTmFtZTogTWVtb3JpZXNCYWNrZW5kU3RhY2suTUVTU0FHRV9UQUJMRSxcbiAgICAgICAgICAgIHBhcnRpdGlvbktleToge1xuICAgICAgICAgICAgICAgIG5hbWU6IFwicmVjaXBpZW50X2lkXCIsXG4gICAgICAgICAgICAgICAgdHlwZTogQXR0cmlidXRlVHlwZS5TVFJJTkcsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYmlsbGluZ01vZGU6IEJpbGxpbmdNb2RlLlBBWV9QRVJfUkVRVUVTVCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgaWRlbnRpZmllckdzaVByb3BzOiBHbG9iYWxTZWNvbmRhcnlJbmRleFByb3BzID0ge1xuICAgICAgICAgICAgaW5kZXhOYW1lOiBcInNlbmRlci1pbmRleFwiLFxuICAgICAgICAgICAgcGFydGl0aW9uS2V5OiB7XG4gICAgICAgICAgICAgICAgbmFtZTogXCJzZW5kZXJfaWRcIixcbiAgICAgICAgICAgICAgICB0eXBlOiBBdHRyaWJ1dGVUeXBlLlNUUklORyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwcm9qZWN0aW9uVHlwZTogUHJvamVjdGlvblR5cGUuQUxMLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLm1lc3NhZ2VUYWJsZS5hZGRHbG9iYWxTZWNvbmRhcnlJbmRleChpZGVudGlmaWVyR3NpUHJvcHMpO1xuXG4gICAgICAgIC8vIExhbWJkYSBmdW5jdGlvbiB0byBleGVjdXRlIGluZmVyZW5jZS5cbiAgICAgICAgLy9cbiAgICAgICAgY29uc3QgbGFtYmRhUm9sZSA9IG5ldyBSb2xlKHRoaXMsIFwiTWVtb3JpZXNMYW1iZGFSb2xlXCIsIHtcbiAgICAgICAgICAgIHJvbGVOYW1lOiBcIk1lbW9yaWVzTGFtYmRhUm9sZVwiLFxuICAgICAgICAgICAgYXNzdW1lZEJ5OiBuZXcgU2VydmljZVByaW5jaXBhbChcImxhbWJkYS5hbWF6b25hd3MuY29tXCIpLFxuICAgICAgICAgICAgaW5saW5lUG9saWNpZXM6IHtcbiAgICAgICAgICAgICAgICBhZGRpdGlvbmFsOiBuZXcgUG9saWN5RG9jdW1lbnQoe1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZW1lbnRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElBTVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImVjMjpDcmVhdGVOZXR3b3JrSW50ZXJmYWNlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZWMyOkRlc2NyaWJlKlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImVjMjpEZWxldGVOZXR3b3JrSW50ZXJmYWNlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElBTVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlhbTpHZXRSb2xlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaWFtOlBhc3NSb2xlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIExhbWJkYVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImxhbWJkYTpJbnZva2VGdW5jdGlvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTM1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInMzOipcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrbXM6KlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTVFNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHM6QXNzdW1lUm9sZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDbG91ZFdhdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY2xvdWR3YXRjaDoqXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibG9nczoqXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIER5bmFtb2REQlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImR5bmFub2RiOipcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlczogW1wiKlwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy51cGxvYWRNZXNzYWdlRnVuY3Rpb24gPSBuZXcgRnVuY3Rpb24oXG4gICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgXCJVcGxvYWRNZXNzYWdlRnVuY3Rpb25cIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6IFwiVXBsb2FkTWVzc2FnZVwiLFxuICAgICAgICAgICAgICAgIGNvZGU6IG5ldyBBc3NldENvZGUoXCJidWlsZC9zcmNcIiksXG4gICAgICAgICAgICAgICAgaGFuZGxlcjogXCJ1cGxvYWQtbWVzc2FnZS5oYW5kbGVyXCIsXG4gICAgICAgICAgICAgICAgcnVudGltZTogUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgICAgICAgICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgICAgICAgICAgIG1lbW9yeVNpemU6IDEwMjQsXG4gICAgICAgICAgICAgICAgdGltZW91dDogRHVyYXRpb24uc2Vjb25kcygzMDApLFxuICAgICAgICAgICAgICAgIGxvZ1JldGVudGlvbjogUmV0ZW50aW9uRGF5cy5USFJFRV9NT05USFMsXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5nZXRNZXNzYWdlRnVuY3Rpb24gPSBuZXcgRnVuY3Rpb24odGhpcywgXCJHZXRNZXNzYWdlRnVuY3Rpb25cIiwge1xuICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiBcIkdldE1lc3NhZ2VcIixcbiAgICAgICAgICAgIGNvZGU6IG5ldyBBc3NldENvZGUoXCJidWlsZC9zcmNcIiksXG4gICAgICAgICAgICBoYW5kbGVyOiBcImdldC1tZXNzYWdlLmhhbmRsZXJcIixcbiAgICAgICAgICAgIHJ1bnRpbWU6IFJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICAgICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgICAgICAgbWVtb3J5U2l6ZTogMTAyNCxcbiAgICAgICAgICAgIHRpbWVvdXQ6IER1cmF0aW9uLnNlY29uZHMoMzAwKSxcbiAgICAgICAgICAgIGxvZ1JldGVudGlvbjogUmV0ZW50aW9uRGF5cy5USFJFRV9NT05USFMsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFQSSBHYXRld2F5XG4gICAgICAgIC8vXG4gICAgICAgIGNvbnN0IGFwaSA9IG5ldyBSZXN0QXBpKHRoaXMsIFwiTWVtb3JpZXNBcGlHYXRld2F5XCIsIHtcbiAgICAgICAgICAgIHJlc3RBcGlOYW1lOiBcIk1lbW9yaWVzIEFQSVwiLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBtZXNzYWdlQVBJID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoXCJtZXNzYWdlXCIpO1xuXG4gICAgICAgIGNvbnN0IHVwbG9hZEludGVncmF0aW9uID0gbmV3IExhbWJkYUludGVncmF0aW9uKFxuICAgICAgICAgICAgdGhpcy51cGxvYWRNZXNzYWdlRnVuY3Rpb24sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcHJveHk6IHRydWUsXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIG1lc3NhZ2VBUEkuYWRkTWV0aG9kKFwiUE9TVFwiLCB1cGxvYWRJbnRlZ3JhdGlvbik7XG5cbiAgICAgICAgY29uc3QgZ2V0SW50ZWdyYXRpb24gPSBuZXcgTGFtYmRhSW50ZWdyYXRpb24odGhpcy5nZXRNZXNzYWdlRnVuY3Rpb24pO1xuICAgICAgICBtZXNzYWdlQVBJLmFkZE1ldGhvZChcIkdFVFwiLCBnZXRJbnRlZ3JhdGlvbik7XG5cbiAgICAgICAgbWVzc2FnZUFQSS5hZGRNZXRob2QoXCJPUFRJT05TXCIsIHVwbG9hZEludGVncmF0aW9uKTtcbiAgICB9XG59XG4iXX0=
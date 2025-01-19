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
const aws_cognito_1 = require("aws-cdk-lib/aws-cognito");
class MemoriesBackendStack extends aws_cdk_lib_1.Stack {
    constructor(app, id) {
        super(app, id, {
            env: { region: "us-west-2" },
        });
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
        this.accountTable = new aws_dynamodb_1.Table(this, "AccountTable", {
            tableName: MemoriesBackendStack.ACCOUNT_TABLE,
            partitionKey: { name: "id", type: aws_dynamodb_1.AttributeType.STRING },
            billingMode: aws_dynamodb_1.BillingMode.PAY_PER_REQUEST,
        });
        this.messageTable = new aws_dynamodb_1.Table(this, "MessageTable", {
            tableName: MemoriesBackendStack.MESSAGE_TABLE,
            partitionKey: { name: "recipient_id", type: aws_dynamodb_1.AttributeType.STRING },
            billingMode: aws_dynamodb_1.BillingMode.PAY_PER_REQUEST,
        });
        const identifierGsiProps = {
            indexName: "sender-index",
            partitionKey: { name: "sender_id", type: aws_dynamodb_1.AttributeType.STRING },
            projectionType: aws_dynamodb_1.ProjectionType.ALL,
        };
        this.messageTable.addGlobalSecondaryIndex(identifierGsiProps);
        const lambdaRole = new aws_iam_1.Role(this, "MemoriesLambdaRole", {
            roleName: "MemoriesLambdaRole",
            assumedBy: new aws_iam_1.ServicePrincipal("lambda.amazonaws.com"),
            inlinePolicies: {
                additional: new aws_iam_1.PolicyDocument({
                    statements: [
                        new aws_iam_1.PolicyStatement({
                            effect: aws_iam_1.Effect.ALLOW,
                            actions: [
                                "ec2:CreateNetworkInterface",
                                "ec2:Describe*",
                                "ec2:DeleteNetworkInterface",
                                "iam:GetRole",
                                "iam:PassRole",
                                "lambda:InvokeFunction",
                                "s3:*",
                                "kms:*",
                                "sts:AssumeRole",
                                "cloudwatch:*",
                                "logs:*",
                                "dynamodb:*",
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
            environment: {
                BUCKET_NAME: `memories-images-${this.account}`,
            },
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
        this.addFriendFunction = new aws_lambda_1.Function(this, "AddFriendFunction", {
            functionName: "AddFriend",
            code: new aws_lambda_1.AssetCode("build/src"),
            handler: "add-friend.handler",
            runtime: aws_lambda_1.Runtime.NODEJS_18_X,
            role: lambdaRole,
            memorySize: 1024,
            timeout: aws_cdk_lib_1.Duration.seconds(30),
            logRetention: aws_logs_1.RetentionDays.THREE_MONTHS,
        });
        this.getFriendListFunction = new aws_lambda_1.Function(this, "GetFriendListFunction", {
            functionName: "GetFriendList",
            code: new aws_lambda_1.AssetCode("build/src"),
            handler: "get-friends-list.handler",
            runtime: aws_lambda_1.Runtime.NODEJS_18_X,
            role: lambdaRole,
            memorySize: 1024,
            timeout: aws_cdk_lib_1.Duration.seconds(30),
            logRetention: aws_logs_1.RetentionDays.THREE_MONTHS,
        });
        this.getAllUsersFunction = new aws_lambda_1.Function(this, "GetAllUsersFunction", {
            functionName: "GetAllUsers",
            code: new aws_lambda_1.AssetCode("build/src"),
            handler: "get-all-users.handler",
            runtime: aws_lambda_1.Runtime.NODEJS_18_X,
            role: lambdaRole,
            memorySize: 1024,
            timeout: aws_cdk_lib_1.Duration.seconds(30),
            logRetention: aws_logs_1.RetentionDays.THREE_MONTHS,
        });
        this.addNewAccountFunction = new aws_lambda_1.Function(this, "AddNewAccountFunction", {
            functionName: "AddNewAccount",
            code: new aws_lambda_1.AssetCode("build/src"),
            handler: "add-new-account.handler",
            runtime: aws_lambda_1.Runtime.NODEJS_18_X,
            role: lambdaRole,
            memorySize: 1024,
            timeout: aws_cdk_lib_1.Duration.seconds(30),
            logRetention: aws_logs_1.RetentionDays.THREE_MONTHS,
        });
        const userPool = new aws_cognito_1.UserPool(this, "MemoriesUserPool", {
            userPoolName: "MemoriesUserPool",
        });
        new aws_cognito_1.UserPoolClient(this, "MemoriesUserPoolClient", {
            userPool,
        });
        userPool.addTrigger(aws_cognito_1.UserPoolOperation.POST_CONFIRMATION, this.addNewAccountFunction);
        const api = new aws_apigateway_1.RestApi(this, "MemoriesApiGateway", {
            restApiName: "Memories API",
        });
        const messageAPI = api.root.addResource("message");
        const uploadIntegration = new aws_apigateway_1.LambdaIntegration(this.uploadMessageFunction, { proxy: true });
        messageAPI.addMethod("POST", uploadIntegration);
        const getIntegration = new aws_apigateway_1.LambdaIntegration(this.getMessageFunction);
        messageAPI.addMethod("GET", getIntegration);
        messageAPI.addMethod("OPTIONS", uploadIntegration);
        const accountResource = api.root.addResource("account");
        const addFriendIntegration = new aws_apigateway_1.LambdaIntegration(this.addFriendFunction, { proxy: true });
        accountResource.addResource("friend").addMethod("POST", addFriendIntegration);
        const getFriendsIntegration = new aws_apigateway_1.LambdaIntegration(this.getFriendListFunction);
        accountResource.addResource("friends").addMethod("GET", getFriendsIntegration);
        const getAllUsersIntegration = new aws_apigateway_1.LambdaIntegration(this.getAllUsersFunction);
        accountResource.addResource("all").addMethod("GET", getAllUsersIntegration);
        const addAccountIntegration = new aws_apigateway_1.LambdaIntegration(this.addNewAccountFunction, { proxy: true });
        accountResource.addResource("create").addMethod("POST", addAccountIntegration);
    }
}
exports.MemoriesBackendStack = MemoriesBackendStack;
MemoriesBackendStack.ACCOUNT_TABLE = "account-table";
MemoriesBackendStack.MESSAGE_TABLE = "message-table";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2VuZC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9iYWNrZW5kLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQUFtRDtBQUNuRCwrREFBd0U7QUFDeEUsMkRBTWtDO0FBQ2xDLGlEQU02QjtBQUM3Qix1REFBc0U7QUFDdEUsbURBQXFEO0FBQ3JELCtDQUEyRTtBQUMzRSx5REFJaUM7QUFFakMsTUFBYSxvQkFBcUIsU0FBUSxtQkFBSztJQWE3QyxZQUFZLEdBQVEsRUFBRSxFQUFVO1FBQzlCLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFO1lBQ2IsR0FBRyxFQUFFLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRTtTQUM3QixDQUFDLENBQUM7UUFFSCxNQUFNLFlBQVksR0FBRyxJQUFJLGVBQU0sQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7WUFDM0QsVUFBVSxFQUFFLG1CQUFtQixJQUFJLENBQUMsT0FBTyxFQUFFO1lBQzdDLFVBQVUsRUFBRSx5QkFBZ0IsQ0FBQyxVQUFVO1lBQ3ZDLGdCQUFnQixFQUFFLElBQUk7WUFDdEIsaUJBQWlCLEVBQUU7Z0JBQ2pCLGVBQWUsRUFBRSxLQUFLO2dCQUN0QixnQkFBZ0IsRUFBRSxLQUFLO2dCQUN2QixxQkFBcUIsRUFBRSxLQUFLO2dCQUM1QixpQkFBaUIsRUFBRSxLQUFLO2FBQ3pCO1NBQ0YsQ0FBQyxDQUFDO1FBQ0gsWUFBWSxDQUFDLFdBQVcsQ0FBQztZQUN2QixjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDckIsY0FBYyxFQUFFO2dCQUNkLG9CQUFXLENBQUMsR0FBRztnQkFDZixvQkFBVyxDQUFDLElBQUk7Z0JBQ2hCLG9CQUFXLENBQUMsR0FBRztnQkFDZixvQkFBVyxDQUFDLElBQUk7Z0JBQ2hCLG9CQUFXLENBQUMsTUFBTTthQUNuQjtZQUNELGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNyQixjQUFjLEVBQUUsQ0FB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RyxlQUFlLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUscUJBQXFCLENBQUMsQ0FBQztJQUNqRixDQUFDOztBQWpNSCxvREFrTUM7QUFqTWUsa0NBQWEsR0FBRyxlQUFlLENBQUM7QUFDaEMsa0NBQWEsR0FBRyxlQUFlLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHAsIER1cmF0aW9uLCBTdGFjayB9IGZyb20gXCJhd3MtY2RrLWxpYlwiO1xyXG5pbXBvcnQgeyBSZXN0QXBpLCBMYW1iZGFJbnRlZ3JhdGlvbiB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheVwiO1xyXG5pbXBvcnQge1xyXG4gIFRhYmxlLFxyXG4gIEF0dHJpYnV0ZVR5cGUsXHJcbiAgQmlsbGluZ01vZGUsXHJcbiAgUHJvamVjdGlvblR5cGUsXHJcbiAgR2xvYmFsU2Vjb25kYXJ5SW5kZXhQcm9wcyxcclxufSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWR5bmFtb2RiXCI7XHJcbmltcG9ydCB7XHJcbiAgRWZmZWN0LFxyXG4gIFBvbGljeURvY3VtZW50LFxyXG4gIFBvbGljeVN0YXRlbWVudCxcclxuICBSb2xlLFxyXG4gIFNlcnZpY2VQcmluY2lwYWwsXHJcbn0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1pYW1cIjtcclxuaW1wb3J0IHsgRnVuY3Rpb24sIFJ1bnRpbWUsIEFzc2V0Q29kZSB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtbGFtYmRhXCI7XHJcbmltcG9ydCB7IFJldGVudGlvbkRheXMgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWxvZ3NcIjtcclxuaW1wb3J0IHsgQnVja2V0LCBCdWNrZXRFbmNyeXB0aW9uLCBIdHRwTWV0aG9kcyB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtczNcIjtcclxuaW1wb3J0IHtcclxuICBVc2VyUG9vbCxcclxuICBVc2VyUG9vbENsaWVudCxcclxuICBVc2VyUG9vbE9wZXJhdGlvbixcclxufSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWNvZ25pdG9cIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBNZW1vcmllc0JhY2tlbmRTdGFjayBleHRlbmRzIFN0YWNrIHtcclxuICBwdWJsaWMgc3RhdGljIEFDQ09VTlRfVEFCTEUgPSBcImFjY291bnQtdGFibGVcIjtcclxuICBwdWJsaWMgc3RhdGljIE1FU1NBR0VfVEFCTEUgPSBcIm1lc3NhZ2UtdGFibGVcIjtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IGFjY291bnRUYWJsZTogVGFibGU7XHJcbiAgcHVibGljIHJlYWRvbmx5IG1lc3NhZ2VUYWJsZTogVGFibGU7XHJcbiAgcHVibGljIHJlYWRvbmx5IHVwbG9hZE1lc3NhZ2VGdW5jdGlvbjogRnVuY3Rpb247XHJcbiAgcHVibGljIHJlYWRvbmx5IGdldE1lc3NhZ2VGdW5jdGlvbjogRnVuY3Rpb247XHJcbiAgcHVibGljIHJlYWRvbmx5IGFkZEZyaWVuZEZ1bmN0aW9uOiBGdW5jdGlvbjtcclxuICBwdWJsaWMgcmVhZG9ubHkgZ2V0RnJpZW5kTGlzdEZ1bmN0aW9uOiBGdW5jdGlvbjtcclxuICBwdWJsaWMgcmVhZG9ubHkgZ2V0QWxsVXNlcnNGdW5jdGlvbjogRnVuY3Rpb247XHJcbiAgcHVibGljIHJlYWRvbmx5IGFkZE5ld0FjY291bnRGdW5jdGlvbjogRnVuY3Rpb247XHJcblxyXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBpZDogc3RyaW5nKSB7XHJcbiAgICBzdXBlcihhcHAsIGlkLCB7XHJcbiAgICAgIGVudjogeyByZWdpb246IFwidXMtd2VzdC0yXCIgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGltYWdlc0J1Y2tldCA9IG5ldyBCdWNrZXQodGhpcywgXCJNZW1vcmllc0ltYWdlQnVja2V0XCIsIHtcclxuICAgICAgYnVja2V0TmFtZTogYG1lbW9yaWVzLWltYWdlcy0ke3RoaXMuYWNjb3VudH1gLFxyXG4gICAgICBlbmNyeXB0aW9uOiBCdWNrZXRFbmNyeXB0aW9uLlMzX01BTkFHRUQsXHJcbiAgICAgIHB1YmxpY1JlYWRBY2Nlc3M6IHRydWUsXHJcbiAgICAgIGJsb2NrUHVibGljQWNjZXNzOiB7XHJcbiAgICAgICAgYmxvY2tQdWJsaWNBY2xzOiBmYWxzZSxcclxuICAgICAgICBpZ25vcmVQdWJsaWNBY2xzOiBmYWxzZSxcclxuICAgICAgICByZXN0cmljdFB1YmxpY0J1Y2tldHM6IGZhbHNlLFxyXG4gICAgICAgIGJsb2NrUHVibGljUG9saWN5OiBmYWxzZSxcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG4gICAgaW1hZ2VzQnVja2V0LmFkZENvcnNSdWxlKHtcclxuICAgICAgYWxsb3dlZEhlYWRlcnM6IFtcIipcIl0sXHJcbiAgICAgIGFsbG93ZWRNZXRob2RzOiBbXHJcbiAgICAgICAgSHR0cE1ldGhvZHMuR0VULFxyXG4gICAgICAgIEh0dHBNZXRob2RzLkhFQUQsXHJcbiAgICAgICAgSHR0cE1ldGhvZHMuUFVULFxyXG4gICAgICAgIEh0dHBNZXRob2RzLlBPU1QsXHJcbiAgICAgICAgSHR0cE1ldGhvZHMuREVMRVRFLFxyXG4gICAgICBdLFxyXG4gICAgICBhbGxvd2VkT3JpZ2luczogW1wiKlwiXSxcclxuICAgICAgZXhwb3NlZEhlYWRlcnM6IFtcIkVUYWdcIl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFjY291bnRUYWJsZSA9IG5ldyBUYWJsZSh0aGlzLCBcIkFjY291bnRUYWJsZVwiLCB7XHJcbiAgICAgIHRhYmxlTmFtZTogTWVtb3JpZXNCYWNrZW5kU3RhY2suQUNDT1VOVF9UQUJMRSxcclxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6IFwiaWRcIiwgdHlwZTogQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcclxuICAgICAgYmlsbGluZ01vZGU6IEJpbGxpbmdNb2RlLlBBWV9QRVJfUkVRVUVTVCxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMubWVzc2FnZVRhYmxlID0gbmV3IFRhYmxlKHRoaXMsIFwiTWVzc2FnZVRhYmxlXCIsIHtcclxuICAgICAgdGFibGVOYW1lOiBNZW1vcmllc0JhY2tlbmRTdGFjay5NRVNTQUdFX1RBQkxFLFxyXG4gICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogXCJyZWNpcGllbnRfaWRcIiwgdHlwZTogQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcclxuICAgICAgYmlsbGluZ01vZGU6IEJpbGxpbmdNb2RlLlBBWV9QRVJfUkVRVUVTVCxcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGlkZW50aWZpZXJHc2lQcm9wczogR2xvYmFsU2Vjb25kYXJ5SW5kZXhQcm9wcyA9IHtcclxuICAgICAgaW5kZXhOYW1lOiBcInNlbmRlci1pbmRleFwiLFxyXG4gICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogXCJzZW5kZXJfaWRcIiwgdHlwZTogQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcclxuICAgICAgcHJvamVjdGlvblR5cGU6IFByb2plY3Rpb25UeXBlLkFMTCxcclxuICAgIH07XHJcbiAgICB0aGlzLm1lc3NhZ2VUYWJsZS5hZGRHbG9iYWxTZWNvbmRhcnlJbmRleChpZGVudGlmaWVyR3NpUHJvcHMpO1xyXG5cclxuICAgIGNvbnN0IGxhbWJkYVJvbGUgPSBuZXcgUm9sZSh0aGlzLCBcIk1lbW9yaWVzTGFtYmRhUm9sZVwiLCB7XHJcbiAgICAgIHJvbGVOYW1lOiBcIk1lbW9yaWVzTGFtYmRhUm9sZVwiLFxyXG4gICAgICBhc3N1bWVkQnk6IG5ldyBTZXJ2aWNlUHJpbmNpcGFsKFwibGFtYmRhLmFtYXpvbmF3cy5jb21cIiksXHJcbiAgICAgIGlubGluZVBvbGljaWVzOiB7XHJcbiAgICAgICAgYWRkaXRpb25hbDogbmV3IFBvbGljeURvY3VtZW50KHtcclxuICAgICAgICAgIHN0YXRlbWVudHM6IFtcclxuICAgICAgICAgICAgbmV3IFBvbGljeVN0YXRlbWVudCh7XHJcbiAgICAgICAgICAgICAgZWZmZWN0OiBFZmZlY3QuQUxMT1csXHJcbiAgICAgICAgICAgICAgYWN0aW9uczogW1xyXG4gICAgICAgICAgICAgICAgXCJlYzI6Q3JlYXRlTmV0d29ya0ludGVyZmFjZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJlYzI6RGVzY3JpYmUqXCIsXHJcbiAgICAgICAgICAgICAgICBcImVjMjpEZWxldGVOZXR3b3JrSW50ZXJmYWNlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlhbTpHZXRSb2xlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlhbTpQYXNzUm9sZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJsYW1iZGE6SW52b2tlRnVuY3Rpb25cIixcclxuICAgICAgICAgICAgICAgIFwiczM6KlwiLFxyXG4gICAgICAgICAgICAgICAgXCJrbXM6KlwiLFxyXG4gICAgICAgICAgICAgICAgXCJzdHM6QXNzdW1lUm9sZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJjbG91ZHdhdGNoOipcIixcclxuICAgICAgICAgICAgICAgIFwibG9nczoqXCIsXHJcbiAgICAgICAgICAgICAgICBcImR5bmFtb2RiOipcIixcclxuICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgIHJlc291cmNlczogW1wiKlwiXSxcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgIH0pLFxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy51cGxvYWRNZXNzYWdlRnVuY3Rpb24gPSBuZXcgRnVuY3Rpb24odGhpcywgXCJVcGxvYWRNZXNzYWdlRnVuY3Rpb25cIiwge1xyXG4gICAgICBmdW5jdGlvbk5hbWU6IFwiVXBsb2FkTWVzc2FnZVwiLFxyXG4gICAgICBjb2RlOiBuZXcgQXNzZXRDb2RlKFwiYnVpbGQvc3JjXCIpLFxyXG4gICAgICBoYW5kbGVyOiBcInVwbG9hZC1tZXNzYWdlLmhhbmRsZXJcIixcclxuICAgICAgcnVudGltZTogUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcclxuICAgICAgbWVtb3J5U2l6ZTogMTAyNCxcclxuICAgICAgdGltZW91dDogRHVyYXRpb24uc2Vjb25kcygzMDApLFxyXG4gICAgICBsb2dSZXRlbnRpb246IFJldGVudGlvbkRheXMuVEhSRUVfTU9OVEhTLFxyXG4gICAgICBlbnZpcm9ubWVudDoge1xyXG4gICAgICAgIEJVQ0tFVF9OQU1FOiBgbWVtb3JpZXMtaW1hZ2VzLSR7dGhpcy5hY2NvdW50fWAsXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmdldE1lc3NhZ2VGdW5jdGlvbiA9IG5ldyBGdW5jdGlvbih0aGlzLCBcIkdldE1lc3NhZ2VGdW5jdGlvblwiLCB7XHJcbiAgICAgIGZ1bmN0aW9uTmFtZTogXCJHZXRNZXNzYWdlXCIsXHJcbiAgICAgIGNvZGU6IG5ldyBBc3NldENvZGUoXCJidWlsZC9zcmNcIiksXHJcbiAgICAgIGhhbmRsZXI6IFwiZ2V0LW1lc3NhZ2UuaGFuZGxlclwiLFxyXG4gICAgICBydW50aW1lOiBSdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxyXG4gICAgICBtZW1vcnlTaXplOiAxMDI0LFxyXG4gICAgICB0aW1lb3V0OiBEdXJhdGlvbi5zZWNvbmRzKDMwMCksXHJcbiAgICAgIGxvZ1JldGVudGlvbjogUmV0ZW50aW9uRGF5cy5USFJFRV9NT05USFMsXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFkZEZyaWVuZEZ1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKHRoaXMsIFwiQWRkRnJpZW5kRnVuY3Rpb25cIiwge1xyXG4gICAgICBmdW5jdGlvbk5hbWU6IFwiQWRkRnJpZW5kXCIsXHJcbiAgICAgIGNvZGU6IG5ldyBBc3NldENvZGUoXCJidWlsZC9zcmNcIiksXHJcbiAgICAgIGhhbmRsZXI6IFwiYWRkLWZyaWVuZC5oYW5kbGVyXCIsXHJcbiAgICAgIHJ1bnRpbWU6IFJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXHJcbiAgICAgIG1lbW9yeVNpemU6IDEwMjQsXHJcbiAgICAgIHRpbWVvdXQ6IER1cmF0aW9uLnNlY29uZHMoMzApLFxyXG4gICAgICBsb2dSZXRlbnRpb246IFJldGVudGlvbkRheXMuVEhSRUVfTU9OVEhTLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5nZXRGcmllbmRMaXN0RnVuY3Rpb24gPSBuZXcgRnVuY3Rpb24odGhpcywgXCJHZXRGcmllbmRMaXN0RnVuY3Rpb25cIiwge1xyXG4gICAgICBmdW5jdGlvbk5hbWU6IFwiR2V0RnJpZW5kTGlzdFwiLFxyXG4gICAgICBjb2RlOiBuZXcgQXNzZXRDb2RlKFwiYnVpbGQvc3JjXCIpLFxyXG4gICAgICBoYW5kbGVyOiBcImdldC1mcmllbmRzLWxpc3QuaGFuZGxlclwiLFxyXG4gICAgICBydW50aW1lOiBSdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxyXG4gICAgICBtZW1vcnlTaXplOiAxMDI0LFxyXG4gICAgICB0aW1lb3V0OiBEdXJhdGlvbi5zZWNvbmRzKDMwKSxcclxuICAgICAgbG9nUmV0ZW50aW9uOiBSZXRlbnRpb25EYXlzLlRIUkVFX01PTlRIUyxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZ2V0QWxsVXNlcnNGdW5jdGlvbiA9IG5ldyBGdW5jdGlvbih0aGlzLCBcIkdldEFsbFVzZXJzRnVuY3Rpb25cIiwge1xyXG4gICAgICBmdW5jdGlvbk5hbWU6IFwiR2V0QWxsVXNlcnNcIixcclxuICAgICAgY29kZTogbmV3IEFzc2V0Q29kZShcImJ1aWxkL3NyY1wiKSxcclxuICAgICAgaGFuZGxlcjogXCJnZXQtYWxsLXVzZXJzLmhhbmRsZXJcIixcclxuICAgICAgcnVudGltZTogUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcclxuICAgICAgbWVtb3J5U2l6ZTogMTAyNCxcclxuICAgICAgdGltZW91dDogRHVyYXRpb24uc2Vjb25kcygzMCksXHJcbiAgICAgIGxvZ1JldGVudGlvbjogUmV0ZW50aW9uRGF5cy5USFJFRV9NT05USFMsXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFkZE5ld0FjY291bnRGdW5jdGlvbiA9IG5ldyBGdW5jdGlvbih0aGlzLCBcIkFkZE5ld0FjY291bnRGdW5jdGlvblwiLCB7XHJcbiAgICAgIGZ1bmN0aW9uTmFtZTogXCJBZGROZXdBY2NvdW50XCIsXHJcbiAgICAgIGNvZGU6IG5ldyBBc3NldENvZGUoXCJidWlsZC9zcmNcIiksXHJcbiAgICAgIGhhbmRsZXI6IFwiYWRkLW5ldy1hY2NvdW50LmhhbmRsZXJcIixcclxuICAgICAgcnVudGltZTogUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcclxuICAgICAgbWVtb3J5U2l6ZTogMTAyNCxcclxuICAgICAgdGltZW91dDogRHVyYXRpb24uc2Vjb25kcygzMCksXHJcbiAgICAgIGxvZ1JldGVudGlvbjogUmV0ZW50aW9uRGF5cy5USFJFRV9NT05USFMsXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCB1c2VyUG9vbCA9IG5ldyBVc2VyUG9vbCh0aGlzLCBcIk1lbW9yaWVzVXNlclBvb2xcIiwge1xyXG4gICAgICB1c2VyUG9vbE5hbWU6IFwiTWVtb3JpZXNVc2VyUG9vbFwiLFxyXG4gICAgfSk7XHJcblxyXG4gICAgbmV3IFVzZXJQb29sQ2xpZW50KHRoaXMsIFwiTWVtb3JpZXNVc2VyUG9vbENsaWVudFwiLCB7XHJcbiAgICAgIHVzZXJQb29sLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdXNlclBvb2wuYWRkVHJpZ2dlcihVc2VyUG9vbE9wZXJhdGlvbi5QT1NUX0NPTkZJUk1BVElPTiwgdGhpcy5hZGROZXdBY2NvdW50RnVuY3Rpb24pO1xyXG5cclxuICAgIGNvbnN0IGFwaSA9IG5ldyBSZXN0QXBpKHRoaXMsIFwiTWVtb3JpZXNBcGlHYXRld2F5XCIsIHtcclxuICAgICAgcmVzdEFwaU5hbWU6IFwiTWVtb3JpZXMgQVBJXCIsXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBtZXNzYWdlQVBJID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoXCJtZXNzYWdlXCIpO1xyXG4gICAgY29uc3QgdXBsb2FkSW50ZWdyYXRpb24gPSBuZXcgTGFtYmRhSW50ZWdyYXRpb24odGhpcy51cGxvYWRNZXNzYWdlRnVuY3Rpb24sIHsgcHJveHk6IHRydWUgfSk7XHJcbiAgICBtZXNzYWdlQVBJLmFkZE1ldGhvZChcIlBPU1RcIiwgdXBsb2FkSW50ZWdyYXRpb24pO1xyXG5cclxuICAgIGNvbnN0IGdldEludGVncmF0aW9uID0gbmV3IExhbWJkYUludGVncmF0aW9uKHRoaXMuZ2V0TWVzc2FnZUZ1bmN0aW9uKTtcclxuICAgIG1lc3NhZ2VBUEkuYWRkTWV0aG9kKFwiR0VUXCIsIGdldEludGVncmF0aW9uKTtcclxuICAgIG1lc3NhZ2VBUEkuYWRkTWV0aG9kKFwiT1BUSU9OU1wiLCB1cGxvYWRJbnRlZ3JhdGlvbik7XHJcblxyXG4gICAgY29uc3QgYWNjb3VudFJlc291cmNlID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoXCJhY2NvdW50XCIpO1xyXG4gICAgY29uc3QgYWRkRnJpZW5kSW50ZWdyYXRpb24gPSBuZXcgTGFtYmRhSW50ZWdyYXRpb24odGhpcy5hZGRGcmllbmRGdW5jdGlvbiwgeyBwcm94eTogdHJ1ZSB9KTtcclxuICAgIGFjY291bnRSZXNvdXJjZS5hZGRSZXNvdXJjZShcImZyaWVuZFwiKS5hZGRNZXRob2QoXCJQT1NUXCIsIGFkZEZyaWVuZEludGVncmF0aW9uKTtcclxuXHJcbiAgICBjb25zdCBnZXRGcmllbmRzSW50ZWdyYXRpb24gPSBuZXcgTGFtYmRhSW50ZWdyYXRpb24odGhpcy5nZXRGcmllbmRMaXN0RnVuY3Rpb24pO1xyXG4gICAgYWNjb3VudFJlc291cmNlLmFkZFJlc291cmNlKFwiZnJpZW5kc1wiKS5hZGRNZXRob2QoXCJHRVRcIiwgZ2V0RnJpZW5kc0ludGVncmF0aW9uKTtcclxuXHJcbiAgICBjb25zdCBnZXRBbGxVc2Vyc0ludGVncmF0aW9uID0gbmV3IExhbWJkYUludGVncmF0aW9uKHRoaXMuZ2V0QWxsVXNlcnNGdW5jdGlvbik7XHJcbiAgICBhY2NvdW50UmVzb3VyY2UuYWRkUmVzb3VyY2UoXCJhbGxcIikuYWRkTWV0aG9kKFwiR0VUXCIsIGdldEFsbFVzZXJzSW50ZWdyYXRpb24pO1xyXG5cclxuICAgIGNvbnN0IGFkZEFjY291bnRJbnRlZ3JhdGlvbiA9IG5ldyBMYW1iZGFJbnRlZ3JhdGlvbih0aGlzLmFkZE5ld0FjY291bnRGdW5jdGlvbiwgeyBwcm94eTogdHJ1ZSB9KTtcclxuICAgIGFjY291bnRSZXNvdXJjZS5hZGRSZXNvdXJjZShcImNyZWF0ZVwiKS5hZGRNZXRob2QoXCJQT1NUXCIsIGFkZEFjY291bnRJbnRlZ3JhdGlvbik7XHJcbiAgfVxyXG59Il19
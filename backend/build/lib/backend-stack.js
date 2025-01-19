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
        this.uploadMessageFunction = new aws_lambda_1.Function(
            this,
            "UploadMessageFunction",
            {
                functionName: "UploadMessage",
                code: new aws_lambda_1.AssetCode("build/src"),
                handler: "upload-message.handler",
                runtime: aws_lambda_1.Runtime.NODEJS_18_X,
                role: lambdaRole,
                memorySize: 1024,
                timeout: aws_cdk_lib_1.Duration.seconds(300),
                logRetention: aws_logs_1.RetentionDays.THREE_MONTHS,
            }
        );
        this.getMessageFunction = new aws_lambda_1.Function(
            this,
            "GetMessageFunction",
            {
                functionName: "GetMessage",
                code: new aws_lambda_1.AssetCode("build/src"),
                handler: "get-message.handler",
                runtime: aws_lambda_1.Runtime.NODEJS_18_X,
                role: lambdaRole,
                memorySize: 1024,
                timeout: aws_cdk_lib_1.Duration.seconds(300),
                logRetention: aws_logs_1.RetentionDays.THREE_MONTHS,
            }
        );
        this.addFriendFunction = new aws_lambda_1.Function(
            this,
            "AddFriendFunction",
            {
                functionName: "AddFriend",
                code: new aws_lambda_1.AssetCode("build/src"),
                handler: "friend-add.handler",
                runtime: aws_lambda_1.Runtime.NODEJS_18_X,
                role: lambdaRole,
                memorySize: 1024,
                timeout: aws_cdk_lib_1.Duration.seconds(30),
                logRetention: aws_logs_1.RetentionDays.THREE_MONTHS,
            }
        );
        this.getFriendListFunction = new aws_lambda_1.Function(
            this,
            "GetFriendListFunction",
            {
                functionName: "GetFriendList",
                code: new aws_lambda_1.AssetCode("build/src"),
                handler: "get-friends-list.handler",
                runtime: aws_lambda_1.Runtime.NODEJS_18_X,
                role: lambdaRole,
                memorySize: 1024,
                timeout: aws_cdk_lib_1.Duration.seconds(30),
                logRetention: aws_logs_1.RetentionDays.THREE_MONTHS,
            }
        );
        this.getAllUsersFunction = new aws_lambda_1.Function(
            this,
            "GetAllUsersFunction",
            {
                functionName: "GetAllUsers",
                code: new aws_lambda_1.AssetCode("build/src"),
                handler: "get-all-users.handler",
                runtime: aws_lambda_1.Runtime.NODEJS_18_X,
                role: lambdaRole,
                memorySize: 1024,
                timeout: aws_cdk_lib_1.Duration.seconds(30),
                logRetention: aws_logs_1.RetentionDays.THREE_MONTHS,
            }
        );
        this.addNewAccountFunction = new aws_lambda_1.Function(
            this,
            "AddNewAccountFunction",
            {
                functionName: "AddNewAccount",
                code: new aws_lambda_1.AssetCode("build/src"),
                handler: "add-new-account.handler",
                runtime: aws_lambda_1.Runtime.NODEJS_18_X,
                role: lambdaRole,
                memorySize: 1024,
                timeout: aws_cdk_lib_1.Duration.seconds(30),
                logRetention: aws_logs_1.RetentionDays.THREE_MONTHS,
            }
        );
        const userPool = new aws_cognito_1.UserPool(this, "MemoriesUserPool", {
            userPoolName: "MemoriesUserPool",
        });
        new aws_cognito_1.UserPoolClient(this, "MemoriesUserPoolClient", {
            userPool,
        });
        userPool.addTrigger(
            aws_cognito_1.UserPoolOperation.POST_CONFIRMATION,
            this.addNewAccountFunction
        );
        const api = new aws_apigateway_1.RestApi(this, "MemoriesApiGateway", {
            restApiName: "Memories API",
        });
        const messageAPI = api.root.addResource("message");
        const uploadIntegration = new aws_apigateway_1.LambdaIntegration(
            this.uploadMessageFunction,
            { proxy: true }
        );
        messageAPI.addMethod("POST", uploadIntegration);
        const getIntegration = new aws_apigateway_1.LambdaIntegration(
            this.getMessageFunction
        );
        messageAPI.addMethod("GET", getIntegration);
        messageAPI.addMethod("OPTIONS", uploadIntegration);
        const accountResource = api.root.addResource("account");
        const addFriendIntegration = new aws_apigateway_1.LambdaIntegration(
            this.addFriendFunction,
            { proxy: true }
        );
        accountResource
            .addResource("friend")
            .addMethod("POST", addFriendIntegration);
        const getFriendsIntegration = new aws_apigateway_1.LambdaIntegration(
            this.getFriendListFunction
        );
        accountResource
            .addResource("friends")
            .addMethod("GET", getFriendsIntegration);
        const getAllUsersIntegration = new aws_apigateway_1.LambdaIntegration(
            this.getAllUsersFunction
        );
        accountResource
            .addResource("all")
            .addMethod("GET", getAllUsersIntegration);
    }
}
exports.MemoriesBackendStack = MemoriesBackendStack;
MemoriesBackendStack.ACCOUNT_TABLE = "account-table";
MemoriesBackendStack.MESSAGE_TABLE = "message-table";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2VuZC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9iYWNrZW5kLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQUFtRDtBQUNuRCwrREFBd0U7QUFDeEUsMkRBTWtDO0FBQ2xDLGlEQU02QjtBQUM3Qix1REFBc0U7QUFDdEUsbURBQXFEO0FBQ3JELCtDQUEyRTtBQUMzRSx5REFJaUM7QUFFakMsTUFBYSxvQkFBcUIsU0FBUSxtQkFBSztJQWE3QyxZQUFZLEdBQVEsRUFBRSxFQUFVO1FBQzlCLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFO1lBQ2IsR0FBRyxFQUFFLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRTtTQUM3QixDQUFDLENBQUM7UUFFSCxNQUFNLFlBQVksR0FBRyxJQUFJLGVBQU0sQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7WUFDM0QsVUFBVSxFQUFFLG1CQUFtQixJQUFJLENBQUMsT0FBTyxFQUFFO1lBQzdDLFVBQVUsRUFBRSx5QkFBZ0IsQ0FBQyxVQUFVO1lBQ3ZDLGdCQUFnQixFQUFFLElBQUk7WUFDdEIsaUJBQWlCLEVBQUU7Z0JBQ2pCLGVBQWUsRUFBRSxLQUFLO2dCQUN0QixnQkFBZ0IsRUFBRSxLQUFLO2dCQUN2QixxQkFBcUIsRUFBRSxLQUFLO2dCQUM1QixpQkFBaUIsRUFBRSxLQUFLO2FBQ3pCO1NBQ0YsQ0FBQyxDQUFDO1FBQ0gsWUFBWSxDQUFDLFdBQVcsQ0FBQztZQUN2QixjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDckIsY0FBYyxFQUFFO2dCQUNkLG9CQUFXLENBQUMsR0FBRztnQkFDZixvQkFBVyxDQUFDLElBQUk7Z0JBQ2hCLG9CQUFXLENBQUMsR0FBRztnQkFDZixvQkFBVyxDQUFDLElBQUk7Z0JBQ2hCLG9CQUFXLENBQUMsTUFBTTthQUNuQjtZQUNELGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNyQixjQUFjLEVBQUUsQ0FB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QVMsQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUVoRCxNQUFNLGNBQWMsR0FBRyxJQUFJLGtDQUFpQixDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3RFLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQzVDLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFFbkQsTUFBTSxlQUFlLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDeEQsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLGtDQUFpQixDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzVGLGVBQWUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBRTlFLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxrQ0FBaUIsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUNoRixlQUFlLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUscUJBQXFCLENBQUMsQ0FBQztRQUUvRSxNQUFNLHNCQUFzQixHQUFHLElBQUksa0NBQWlCLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDL0UsZUFBZSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLHNCQUFzQixDQUFDLENBQUM7SUFDOUUsQ0FBQzs7QUEzTEgsb0RBNExDO0FBM0xlLGtDQUFhLEdBQUcsZUFBZSxDQUFDO0FBQ2hDLGtDQUFhLEdBQUcsZUFBZSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwLCBEdXJhdGlvbiwgU3RhY2sgfSBmcm9tIFwiYXdzLWNkay1saWJcIjtcclxuaW1wb3J0IHsgUmVzdEFwaSwgTGFtYmRhSW50ZWdyYXRpb24gfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXlcIjtcclxuaW1wb3J0IHtcclxuICBUYWJsZSxcclxuICBBdHRyaWJ1dGVUeXBlLFxyXG4gIEJpbGxpbmdNb2RlLFxyXG4gIFByb2plY3Rpb25UeXBlLFxyXG4gIEdsb2JhbFNlY29uZGFyeUluZGV4UHJvcHMsXHJcbn0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1keW5hbW9kYlwiO1xyXG5pbXBvcnQge1xyXG4gIEVmZmVjdCxcclxuICBQb2xpY3lEb2N1bWVudCxcclxuICBQb2xpY3lTdGF0ZW1lbnQsXHJcbiAgUm9sZSxcclxuICBTZXJ2aWNlUHJpbmNpcGFsLFxyXG59IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtaWFtXCI7XHJcbmltcG9ydCB7IEZ1bmN0aW9uLCBSdW50aW1lLCBBc3NldENvZGUgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWxhbWJkYVwiO1xyXG5pbXBvcnQgeyBSZXRlbnRpb25EYXlzIH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1sb2dzXCI7XHJcbmltcG9ydCB7IEJ1Y2tldCwgQnVja2V0RW5jcnlwdGlvbiwgSHR0cE1ldGhvZHMgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLXMzXCI7XHJcbmltcG9ydCB7XHJcbiAgVXNlclBvb2wsXHJcbiAgVXNlclBvb2xDbGllbnQsXHJcbiAgVXNlclBvb2xPcGVyYXRpb24sXHJcbn0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1jb2duaXRvXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgTWVtb3JpZXNCYWNrZW5kU3RhY2sgZXh0ZW5kcyBTdGFjayB7XHJcbiAgcHVibGljIHN0YXRpYyBBQ0NPVU5UX1RBQkxFID0gXCJhY2NvdW50LXRhYmxlXCI7XHJcbiAgcHVibGljIHN0YXRpYyBNRVNTQUdFX1RBQkxFID0gXCJtZXNzYWdlLXRhYmxlXCI7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBhY2NvdW50VGFibGU6IFRhYmxlO1xyXG4gIHB1YmxpYyByZWFkb25seSBtZXNzYWdlVGFibGU6IFRhYmxlO1xyXG4gIHB1YmxpYyByZWFkb25seSB1cGxvYWRNZXNzYWdlRnVuY3Rpb246IEZ1bmN0aW9uO1xyXG4gIHB1YmxpYyByZWFkb25seSBnZXRNZXNzYWdlRnVuY3Rpb246IEZ1bmN0aW9uO1xyXG4gIHB1YmxpYyByZWFkb25seSBhZGRGcmllbmRGdW5jdGlvbjogRnVuY3Rpb247XHJcbiAgcHVibGljIHJlYWRvbmx5IGdldEZyaWVuZExpc3RGdW5jdGlvbjogRnVuY3Rpb247XHJcbiAgcHVibGljIHJlYWRvbmx5IGdldEFsbFVzZXJzRnVuY3Rpb246IEZ1bmN0aW9uO1xyXG4gIHB1YmxpYyByZWFkb25seSBhZGROZXdBY2NvdW50RnVuY3Rpb246IEZ1bmN0aW9uO1xyXG5cclxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgaWQ6IHN0cmluZykge1xyXG4gICAgc3VwZXIoYXBwLCBpZCwge1xyXG4gICAgICBlbnY6IHsgcmVnaW9uOiBcInVzLXdlc3QtMlwiIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBpbWFnZXNCdWNrZXQgPSBuZXcgQnVja2V0KHRoaXMsIFwiTWVtb3JpZXNJbWFnZUJ1Y2tldFwiLCB7XHJcbiAgICAgIGJ1Y2tldE5hbWU6IGBtZW1vcmllcy1pbWFnZXMtJHt0aGlzLmFjY291bnR9YCxcclxuICAgICAgZW5jcnlwdGlvbjogQnVja2V0RW5jcnlwdGlvbi5TM19NQU5BR0VELFxyXG4gICAgICBwdWJsaWNSZWFkQWNjZXNzOiB0cnVlLFxyXG4gICAgICBibG9ja1B1YmxpY0FjY2Vzczoge1xyXG4gICAgICAgIGJsb2NrUHVibGljQWNsczogZmFsc2UsXHJcbiAgICAgICAgaWdub3JlUHVibGljQWNsczogZmFsc2UsXHJcbiAgICAgICAgcmVzdHJpY3RQdWJsaWNCdWNrZXRzOiBmYWxzZSxcclxuICAgICAgICBibG9ja1B1YmxpY1BvbGljeTogZmFsc2UsXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuICAgIGltYWdlc0J1Y2tldC5hZGRDb3JzUnVsZSh7XHJcbiAgICAgIGFsbG93ZWRIZWFkZXJzOiBbXCIqXCJdLFxyXG4gICAgICBhbGxvd2VkTWV0aG9kczogW1xyXG4gICAgICAgIEh0dHBNZXRob2RzLkdFVCxcclxuICAgICAgICBIdHRwTWV0aG9kcy5IRUFELFxyXG4gICAgICAgIEh0dHBNZXRob2RzLlBVVCxcclxuICAgICAgICBIdHRwTWV0aG9kcy5QT1NULFxyXG4gICAgICAgIEh0dHBNZXRob2RzLkRFTEVURSxcclxuICAgICAgXSxcclxuICAgICAgYWxsb3dlZE9yaWdpbnM6IFtcIipcIl0sXHJcbiAgICAgIGV4cG9zZWRIZWFkZXJzOiBbXCJFVGFnXCJdLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hY2NvdW50VGFibGUgPSBuZXcgVGFibGUodGhpcywgXCJBY2NvdW50VGFibGVcIiwge1xyXG4gICAgICB0YWJsZU5hbWU6IE1lbW9yaWVzQmFja2VuZFN0YWNrLkFDQ09VTlRfVEFCTEUsXHJcbiAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiBcImlkXCIsIHR5cGU6IEF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXHJcbiAgICAgIGJpbGxpbmdNb2RlOiBCaWxsaW5nTW9kZS5QQVlfUEVSX1JFUVVFU1QsXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLm1lc3NhZ2VUYWJsZSA9IG5ldyBUYWJsZSh0aGlzLCBcIk1lc3NhZ2VUYWJsZVwiLCB7XHJcbiAgICAgIHRhYmxlTmFtZTogTWVtb3JpZXNCYWNrZW5kU3RhY2suTUVTU0FHRV9UQUJMRSxcclxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6IFwicmVjaXBpZW50X2lkXCIsIHR5cGU6IEF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXHJcbiAgICAgIGJpbGxpbmdNb2RlOiBCaWxsaW5nTW9kZS5QQVlfUEVSX1JFUVVFU1QsXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBpZGVudGlmaWVyR3NpUHJvcHM6IEdsb2JhbFNlY29uZGFyeUluZGV4UHJvcHMgPSB7XHJcbiAgICAgIGluZGV4TmFtZTogXCJzZW5kZXItaW5kZXhcIixcclxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6IFwic2VuZGVyX2lkXCIsIHR5cGU6IEF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXHJcbiAgICAgIHByb2plY3Rpb25UeXBlOiBQcm9qZWN0aW9uVHlwZS5BTEwsXHJcbiAgICB9O1xyXG4gICAgdGhpcy5tZXNzYWdlVGFibGUuYWRkR2xvYmFsU2Vjb25kYXJ5SW5kZXgoaWRlbnRpZmllckdzaVByb3BzKTtcclxuXHJcbiAgICBjb25zdCBsYW1iZGFSb2xlID0gbmV3IFJvbGUodGhpcywgXCJNZW1vcmllc0xhbWJkYVJvbGVcIiwge1xyXG4gICAgICByb2xlTmFtZTogXCJNZW1vcmllc0xhbWJkYVJvbGVcIixcclxuICAgICAgYXNzdW1lZEJ5OiBuZXcgU2VydmljZVByaW5jaXBhbChcImxhbWJkYS5hbWF6b25hd3MuY29tXCIpLFxyXG4gICAgICBpbmxpbmVQb2xpY2llczoge1xyXG4gICAgICAgIGFkZGl0aW9uYWw6IG5ldyBQb2xpY3lEb2N1bWVudCh7XHJcbiAgICAgICAgICBzdGF0ZW1lbnRzOiBbXHJcbiAgICAgICAgICAgIG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xyXG4gICAgICAgICAgICAgIGVmZmVjdDogRWZmZWN0LkFMTE9XLFxyXG4gICAgICAgICAgICAgIGFjdGlvbnM6IFtcclxuICAgICAgICAgICAgICAgIFwiZWMyOkNyZWF0ZU5ldHdvcmtJbnRlcmZhY2VcIixcclxuICAgICAgICAgICAgICAgIFwiZWMyOkRlc2NyaWJlKlwiLFxyXG4gICAgICAgICAgICAgICAgXCJlYzI6RGVsZXRlTmV0d29ya0ludGVyZmFjZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpYW06R2V0Um9sZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpYW06UGFzc1JvbGVcIixcclxuICAgICAgICAgICAgICAgIFwibGFtYmRhOkludm9rZUZ1bmN0aW9uXCIsXHJcbiAgICAgICAgICAgICAgICBcInMzOipcIixcclxuICAgICAgICAgICAgICAgIFwia21zOipcIixcclxuICAgICAgICAgICAgICAgIFwic3RzOkFzc3VtZVJvbGVcIixcclxuICAgICAgICAgICAgICAgIFwiY2xvdWR3YXRjaDoqXCIsXHJcbiAgICAgICAgICAgICAgICBcImxvZ3M6KlwiLFxyXG4gICAgICAgICAgICAgICAgXCJkeW5hbW9kYjoqXCIsXHJcbiAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICByZXNvdXJjZXM6IFtcIipcIl0sXHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgXSxcclxuICAgICAgICB9KSxcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMudXBsb2FkTWVzc2FnZUZ1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKHRoaXMsIFwiVXBsb2FkTWVzc2FnZUZ1bmN0aW9uXCIsIHtcclxuICAgICAgZnVuY3Rpb25OYW1lOiBcIlVwbG9hZE1lc3NhZ2VcIixcclxuICAgICAgY29kZTogbmV3IEFzc2V0Q29kZShcImJ1aWxkL3NyY1wiKSxcclxuICAgICAgaGFuZGxlcjogXCJ1cGxvYWQtbWVzc2FnZS5oYW5kbGVyXCIsXHJcbiAgICAgIHJ1bnRpbWU6IFJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXHJcbiAgICAgIG1lbW9yeVNpemU6IDEwMjQsXHJcbiAgICAgIHRpbWVvdXQ6IER1cmF0aW9uLnNlY29uZHMoMzAwKSxcclxuICAgICAgbG9nUmV0ZW50aW9uOiBSZXRlbnRpb25EYXlzLlRIUkVFX01PTlRIUyxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZ2V0TWVzc2FnZUZ1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKHRoaXMsIFwiR2V0TWVzc2FnZUZ1bmN0aW9uXCIsIHtcclxuICAgICAgZnVuY3Rpb25OYW1lOiBcIkdldE1lc3NhZ2VcIixcclxuICAgICAgY29kZTogbmV3IEFzc2V0Q29kZShcImJ1aWxkL3NyY1wiKSxcclxuICAgICAgaGFuZGxlcjogXCJnZXQtbWVzc2FnZS5oYW5kbGVyXCIsXHJcbiAgICAgIHJ1bnRpbWU6IFJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXHJcbiAgICAgIG1lbW9yeVNpemU6IDEwMjQsXHJcbiAgICAgIHRpbWVvdXQ6IER1cmF0aW9uLnNlY29uZHMoMzAwKSxcclxuICAgICAgbG9nUmV0ZW50aW9uOiBSZXRlbnRpb25EYXlzLlRIUkVFX01PTlRIUyxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYWRkRnJpZW5kRnVuY3Rpb24gPSBuZXcgRnVuY3Rpb24odGhpcywgXCJBZGRGcmllbmRGdW5jdGlvblwiLCB7XHJcbiAgICAgIGZ1bmN0aW9uTmFtZTogXCJBZGRGcmllbmRcIixcclxuICAgICAgY29kZTogbmV3IEFzc2V0Q29kZShcImJ1aWxkL3NyY1wiKSxcclxuICAgICAgaGFuZGxlcjogXCJmcmllbmQtYWRkLmhhbmRsZXJcIixcclxuICAgICAgcnVudGltZTogUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcclxuICAgICAgbWVtb3J5U2l6ZTogMTAyNCxcclxuICAgICAgdGltZW91dDogRHVyYXRpb24uc2Vjb25kcygzMCksXHJcbiAgICAgIGxvZ1JldGVudGlvbjogUmV0ZW50aW9uRGF5cy5USFJFRV9NT05USFMsXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmdldEZyaWVuZExpc3RGdW5jdGlvbiA9IG5ldyBGdW5jdGlvbih0aGlzLCBcIkdldEZyaWVuZExpc3RGdW5jdGlvblwiLCB7XHJcbiAgICAgIGZ1bmN0aW9uTmFtZTogXCJHZXRGcmllbmRMaXN0XCIsXHJcbiAgICAgIGNvZGU6IG5ldyBBc3NldENvZGUoXCJidWlsZC9zcmNcIiksXHJcbiAgICAgIGhhbmRsZXI6IFwiZ2V0LWZyaWVuZHMtbGlzdC5oYW5kbGVyXCIsXHJcbiAgICAgIHJ1bnRpbWU6IFJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXHJcbiAgICAgIG1lbW9yeVNpemU6IDEwMjQsXHJcbiAgICAgIHRpbWVvdXQ6IER1cmF0aW9uLnNlY29uZHMoMzApLFxyXG4gICAgICBsb2dSZXRlbnRpb246IFJldGVudGlvbkRheXMuVEhSRUVfTU9OVEhTLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5nZXRBbGxVc2Vyc0Z1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKHRoaXMsIFwiR2V0QWxsVXNlcnNGdW5jdGlvblwiLCB7XHJcbiAgICAgIGZ1bmN0aW9uTmFtZTogXCJHZXRBbGxVc2Vyc1wiLFxyXG4gICAgICBjb2RlOiBuZXcgQXNzZXRDb2RlKFwiYnVpbGQvc3JjXCIpLFxyXG4gICAgICBoYW5kbGVyOiBcImdldC1hbGwtdXNlcnMuaGFuZGxlclwiLFxyXG4gICAgICBydW50aW1lOiBSdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxyXG4gICAgICBtZW1vcnlTaXplOiAxMDI0LFxyXG4gICAgICB0aW1lb3V0OiBEdXJhdGlvbi5zZWNvbmRzKDMwKSxcclxuICAgICAgbG9nUmV0ZW50aW9uOiBSZXRlbnRpb25EYXlzLlRIUkVFX01PTlRIUyxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYWRkTmV3QWNjb3VudEZ1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKHRoaXMsIFwiQWRkTmV3QWNjb3VudEZ1bmN0aW9uXCIsIHtcclxuICAgICAgZnVuY3Rpb25OYW1lOiBcIkFkZE5ld0FjY291bnRcIixcclxuICAgICAgY29kZTogbmV3IEFzc2V0Q29kZShcImJ1aWxkL3NyY1wiKSxcclxuICAgICAgaGFuZGxlcjogXCJhZGQtbmV3LWFjY291bnQuaGFuZGxlclwiLFxyXG4gICAgICBydW50aW1lOiBSdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxyXG4gICAgICBtZW1vcnlTaXplOiAxMDI0LFxyXG4gICAgICB0aW1lb3V0OiBEdXJhdGlvbi5zZWNvbmRzKDMwKSxcclxuICAgICAgbG9nUmV0ZW50aW9uOiBSZXRlbnRpb25EYXlzLlRIUkVFX01PTlRIUyxcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IHVzZXJQb29sID0gbmV3IFVzZXJQb29sKHRoaXMsIFwiTWVtb3JpZXNVc2VyUG9vbFwiLCB7XHJcbiAgICAgIHVzZXJQb29sTmFtZTogXCJNZW1vcmllc1VzZXJQb29sXCIsXHJcbiAgICB9KTtcclxuXHJcbiAgICBuZXcgVXNlclBvb2xDbGllbnQodGhpcywgXCJNZW1vcmllc1VzZXJQb29sQ2xpZW50XCIsIHtcclxuICAgICAgdXNlclBvb2wsXHJcbiAgICB9KTtcclxuXHJcbiAgICB1c2VyUG9vbC5hZGRUcmlnZ2VyKFVzZXJQb29sT3BlcmF0aW9uLlBPU1RfQ09ORklSTUFUSU9OLCB0aGlzLmFkZE5ld0FjY291bnRGdW5jdGlvbik7XHJcblxyXG4gICAgY29uc3QgYXBpID0gbmV3IFJlc3RBcGkodGhpcywgXCJNZW1vcmllc0FwaUdhdGV3YXlcIiwge1xyXG4gICAgICByZXN0QXBpTmFtZTogXCJNZW1vcmllcyBBUElcIixcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IG1lc3NhZ2VBUEkgPSBhcGkucm9vdC5hZGRSZXNvdXJjZShcIm1lc3NhZ2VcIik7XHJcbiAgICBjb25zdCB1cGxvYWRJbnRlZ3JhdGlvbiA9IG5ldyBMYW1iZGFJbnRlZ3JhdGlvbih0aGlzLnVwbG9hZE1lc3NhZ2VGdW5jdGlvbiwgeyBwcm94eTogdHJ1ZSB9KTtcclxuICAgIG1lc3NhZ2VBUEkuYWRkTWV0aG9kKFwiUE9TVFwiLCB1cGxvYWRJbnRlZ3JhdGlvbik7XHJcblxyXG4gICAgY29uc3QgZ2V0SW50ZWdyYXRpb24gPSBuZXcgTGFtYmRhSW50ZWdyYXRpb24odGhpcy5nZXRNZXNzYWdlRnVuY3Rpb24pO1xyXG4gICAgbWVzc2FnZUFQSS5hZGRNZXRob2QoXCJHRVRcIiwgZ2V0SW50ZWdyYXRpb24pO1xyXG4gICAgbWVzc2FnZUFQSS5hZGRNZXRob2QoXCJPUFRJT05TXCIsIHVwbG9hZEludGVncmF0aW9uKTtcclxuXHJcbiAgICBjb25zdCBhY2NvdW50UmVzb3VyY2UgPSBhcGkucm9vdC5hZGRSZXNvdXJjZShcImFjY291bnRcIik7XHJcbiAgICBjb25zdCBhZGRGcmllbmRJbnRlZ3JhdGlvbiA9IG5ldyBMYW1iZGFJbnRlZ3JhdGlvbih0aGlzLmFkZEZyaWVuZEZ1bmN0aW9uLCB7IHByb3h5OiB0cnVlIH0pO1xyXG4gICAgYWNjb3VudFJlc291cmNlLmFkZFJlc291cmNlKFwiZnJpZW5kXCIpLmFkZE1ldGhvZChcIlBPU1RcIiwgYWRkRnJpZW5kSW50ZWdyYXRpb24pO1xyXG5cclxuICAgIGNvbnN0IGdldEZyaWVuZHNJbnRlZ3JhdGlvbiA9IG5ldyBMYW1iZGFJbnRlZ3JhdGlvbih0aGlzLmdldEZyaWVuZExpc3RGdW5jdGlvbik7XHJcbiAgICBhY2NvdW50UmVzb3VyY2UuYWRkUmVzb3VyY2UoXCJmcmllbmRzXCIpLmFkZE1ldGhvZChcIkdFVFwiLCBnZXRGcmllbmRzSW50ZWdyYXRpb24pO1xyXG5cclxuICAgIGNvbnN0IGdldEFsbFVzZXJzSW50ZWdyYXRpb24gPSBuZXcgTGFtYmRhSW50ZWdyYXRpb24odGhpcy5nZXRBbGxVc2Vyc0Z1bmN0aW9uKTtcclxuICAgIGFjY291bnRSZXNvdXJjZS5hZGRSZXNvdXJjZShcImFsbFwiKS5hZGRNZXRob2QoXCJHRVRcIiwgZ2V0QWxsVXNlcnNJbnRlZ3JhdGlvbik7XHJcbiAgfVxyXG59XHJcbiJdfQ==

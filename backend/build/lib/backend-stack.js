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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2VuZC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9iYWNrZW5kLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQUFtRDtBQUNuRCwrREFBd0U7QUFDeEUsMkRBTWtDO0FBQ2xDLGlEQU02QjtBQUM3Qix1REFBc0U7QUFDdEUsbURBQXFEO0FBQ3JELCtDQUEyRTtBQUMzRSx5REFJaUM7QUFFakMsTUFBYSxvQkFBcUIsU0FBUSxtQkFBSztJQWE3QyxZQUFZLEdBQVEsRUFBRSxFQUFVO1FBQzlCLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFO1lBQ2IsR0FBRyxFQUFFLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRTtTQUM3QixDQUFDLENBQUM7UUFFSCxNQUFNLFlBQVksR0FBRyxJQUFJLGVBQU0sQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7WUFDM0QsVUFBVSxFQUFFLG1CQUFtQixJQUFJLENBQUMsT0FBTyxFQUFFO1lBQzdDLFVBQVUsRUFBRSx5QkFBZ0IsQ0FBQyxVQUFVO1lBQ3ZDLGdCQUFnQixFQUFFLElBQUk7WUFDdEIsaUJBQWlCLEVBQUU7Z0JBQ2pCLGVBQWUsRUFBRSxLQUFLO2dCQUN0QixnQkFBZ0IsRUFBRSxLQUFLO2dCQUN2QixxQkFBcUIsRUFBRSxLQUFLO2dCQUM1QixpQkFBaUIsRUFBRSxLQUFLO2FBQ3pCO1NBQ0YsQ0FBQyxDQUFDO1FBQ0gsWUFBWSxDQUFDLFdBQVcsQ0FBQztZQUN2QixjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDckIsY0FBYyxFQUFFO2dCQUNkLG9CQUFXLENBQUMsR0FBRztnQkFDZixvQkFBVyxDQUFDLElBQUk7Z0JBQ2hCLG9CQUFXLENBQUMsR0FBRztnQkFDZixvQkFBVyxDQUFDLElBQUk7Z0JBQ2hCLG9CQUFXLENBQUMsTUFBTTthQUNuQjtZQUNELGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNyQixjQUFjLEVBQUUsQ0FBQyxNQUFNLENBQUM7U0FDekIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLG9CQUFLLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUNsRCxTQUFTLEVBQUUsb0JBQW9CLENBQUMsYUFBYTtZQUM3QyxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSw0QkFBYSxDQUFDLE1BQU0sRUFBRTtZQUN4RCxXQUFXLEVBQUUsMEJBQVcsQ0FBQyxlQUFlO1NBQ3pDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxvQkFBSyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDbEQsU0FBUyxFQUFFLG9CQUFvQixDQUFDLGFBQWE7WUFDN0MsWUFBWSxFQUFFLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsNEJBQWEsQ0FBQyxNQUFNLEVBQUU7WUFDbEUsV0FBVyxFQUFFLDBCQUFXLENBQUMsZUFBZTtTQUN6QyxDQUFDLENBQUM7UUFFSCxNQUFNLGtCQUFrQixHQUE4QjtZQUNwRCxTQUFTLEVBQUUsY0FBYztZQUN6QixZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSw0QkFBYSxDQUFDLE1BQU0sRUFBRTtZQUMvRCxjQUFjLEVBQUUsNkJBQWMsQ0FBQyxHQUFHO1NBQ25DLENBQUM7UUFDRixJQUFJLENBQUMsWUFBWSxDQUFDLHVCQUF1QixDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFFOUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxjQUFJLENBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFO1lBQ3RELFFBQVEsRUFBRSxvQkFBb0I7WUFDOUIsU0FBUyxFQUFFLElBQUksMEJBQWdCLENBQUMsc0JBQXNCLENBQUM7WUFDdkQsY0FBYyxFQUFFO2dCQUNkLFVBQVUsRUFBRSxJQUFJLHdCQUFjLENBQUM7b0JBQzdCLFVBQVUsRUFBRTt3QkFDVixJQUFJLHlCQUFlLENBQUM7NEJBQ2xCLE1BQU0sRUFBRSxnQkFBTSxDQUFDLEtBQUs7NEJBQ3BCLE9BQU8sRUFBRTtnQ0FDUCw0QkFBNEI7Z0NBQzVCLGVBQWU7Z0NBQ2YsNEJBQTRCO2dDQUM1QixhQUFhO2dDQUNiLGNBQWM7Z0NBQ2QsdUJBQXVCO2dDQUN2QixNQUFNO2dDQUNOLE9BQU87Z0NBQ1AsZ0JBQWdCO2dDQUNoQixjQUFjO2dDQUNkLFFBQVE7Z0NBQ1IsWUFBWTs2QkFDYjs0QkFDRCxTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUM7eUJBQ2pCLENBQUM7cUJBQ0g7aUJBQ0YsQ0FBQzthQUNIO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUkscUJBQVEsQ0FBQyxJQUFJLEVBQUUsdUJBQXVCLEVBQUU7WUFDdkUsWUFBWSxFQUFFLGVBQWU7WUFDN0IsSUFBSSxFQUFFLElBQUksc0JBQVMsQ0FBQyxXQUFXLENBQUM7WUFDaEMsT0FBTyxFQUFFLHdCQUF3QjtZQUNqQyxPQUFPLEVBQUUsb0JBQU8sQ0FBQyxXQUFXO1lBQzVCLElBQUksRUFBRSxVQUFVO1lBQ2hCLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLE9BQU8sRUFBRSxzQkFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7WUFDOUIsWUFBWSxFQUFFLHdCQUFhLENBQUMsWUFBWTtTQUN6QyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxxQkFBUSxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRTtZQUNqRSxZQUFZLEVBQUUsWUFBWTtZQUMxQixJQUFJLEVBQUUsSUFBSSxzQkFBUyxDQUFDLFdBQVcsQ0FBQztZQUNoQyxPQUFPLEVBQUUscUJBQXFCO1lBQzlCLE9BQU8sRUFBRSxvQkFBTyxDQUFDLFdBQVc7WUFDNUIsSUFBSSxFQUFFLFVBQVU7WUFDaEIsVUFBVSxFQUFFLElBQUk7WUFDaEIsT0FBTyxFQUFFLHNCQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUM5QixZQUFZLEVBQUUsd0JBQWEsQ0FBQyxZQUFZO1NBQ3pDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLHFCQUFRLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQy9ELFlBQVksRUFBRSxXQUFXO1lBQ3pCLElBQUksRUFBRSxJQUFJLHNCQUFTLENBQUMsV0FBVyxDQUFDO1lBQ2hDLE9BQU8sRUFBRSxvQkFBb0I7WUFDN0IsT0FBTyxFQUFFLG9CQUFPLENBQUMsV0FBVztZQUM1QixJQUFJLEVBQUUsVUFBVTtZQUNoQixVQUFVLEVBQUUsSUFBSTtZQUNoQixPQUFPLEVBQUUsc0JBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQzdCLFlBQVksRUFBRSx3QkFBYSxDQUFDLFlBQVk7U0FDekMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUkscUJBQVEsQ0FBQyxJQUFJLEVBQUUsdUJBQXVCLEVBQUU7WUFDdkUsWUFBWSxFQUFFLGVBQWU7WUFDN0IsSUFBSSxFQUFFLElBQUksc0JBQVMsQ0FBQyxXQUFXLENBQUM7WUFDaEMsT0FBTyxFQUFFLDBCQUEwQjtZQUNuQyxPQUFPLEVBQUUsb0JBQU8sQ0FBQyxXQUFXO1lBQzVCLElBQUksRUFBRSxVQUFVO1lBQ2hCLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLE9BQU8sRUFBRSxzQkFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDN0IsWUFBWSxFQUFFLHdCQUFhLENBQUMsWUFBWTtTQUN6QyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxxQkFBUSxDQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRTtZQUNuRSxZQUFZLEVBQUUsYUFBYTtZQUMzQixJQUFJLEVBQUUsSUFBSSxzQkFBUyxDQUFDLFdBQVcsQ0FBQztZQUNoQyxPQUFPLEVBQUUsdUJBQXVCO1lBQ2hDLE9BQU8sRUFBRSxvQkFBTyxDQUFDLFdBQVc7WUFDNUIsSUFBSSxFQUFFLFVBQVU7WUFDaEIsVUFBVSxFQUFFLElBQUk7WUFDaEIsT0FBTyxFQUFFLHNCQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUM3QixZQUFZLEVBQUUsd0JBQWEsQ0FBQyxZQUFZO1NBQ3pDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLHFCQUFRLENBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFO1lBQ3ZFLFlBQVksRUFBRSxlQUFlO1lBQzdCLElBQUksRUFBRSxJQUFJLHNCQUFTLENBQUMsV0FBVyxDQUFDO1lBQ2hDLE9BQU8sRUFBRSx5QkFBeUI7WUFDbEMsT0FBTyxFQUFFLG9CQUFPLENBQUMsV0FBVztZQUM1QixJQUFJLEVBQUUsVUFBVTtZQUNoQixVQUFVLEVBQUUsSUFBSTtZQUNoQixPQUFPLEVBQUUsc0JBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQzdCLFlBQVksRUFBRSx3QkFBYSxDQUFDLFlBQVk7U0FDekMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxRQUFRLEdBQUcsSUFBSSxzQkFBUSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUN0RCxZQUFZLEVBQUUsa0JBQWtCO1NBQ2pDLENBQUMsQ0FBQztRQUVILElBQUksNEJBQWMsQ0FBQyxJQUFJLEVBQUUsd0JBQXdCLEVBQUU7WUFDakQsUUFBUTtTQUNULENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxVQUFVLENBQUMsK0JBQWlCLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFFckYsTUFBTSxHQUFHLEdBQUcsSUFBSSx3QkFBTyxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRTtZQUNsRCxXQUFXLEVBQUUsY0FBYztTQUM1QixDQUFDLENBQUM7UUFFSCxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuRCxNQUFNLGlCQUFpQixHQUFHLElBQUksa0NBQWlCLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDN0YsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUVoRCxNQUFNLGNBQWMsR0FBRyxJQUFJLGtDQUFpQixDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3RFLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQzVDLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFFbkQsTUFBTSxlQUFlLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDeEQsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLGtDQUFpQixDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzVGLGVBQWUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBRTlFLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxrQ0FBaUIsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUNoRixlQUFlLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUscUJBQXFCLENBQUMsQ0FBQztRQUUvRSxNQUFNLHNCQUFzQixHQUFHLElBQUksa0NBQWlCLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDL0UsZUFBZSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLHNCQUFzQixDQUFDLENBQUM7UUFFNUUsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLGtDQUFpQixDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2pHLGVBQWUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0lBQ2pGLENBQUM7O0FBOUxILG9EQStMQztBQTlMZSxrQ0FBYSxHQUFHLGVBQWUsQ0FBQztBQUNoQyxrQ0FBYSxHQUFHLGVBQWUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcCwgRHVyYXRpb24sIFN0YWNrIH0gZnJvbSBcImF3cy1jZGstbGliXCI7XHJcbmltcG9ydCB7IFJlc3RBcGksIExhbWJkYUludGVncmF0aW9uIH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5XCI7XHJcbmltcG9ydCB7XHJcbiAgVGFibGUsXHJcbiAgQXR0cmlidXRlVHlwZSxcclxuICBCaWxsaW5nTW9kZSxcclxuICBQcm9qZWN0aW9uVHlwZSxcclxuICBHbG9iYWxTZWNvbmRhcnlJbmRleFByb3BzLFxyXG59IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGJcIjtcclxuaW1wb3J0IHtcclxuICBFZmZlY3QsXHJcbiAgUG9saWN5RG9jdW1lbnQsXHJcbiAgUG9saWN5U3RhdGVtZW50LFxyXG4gIFJvbGUsXHJcbiAgU2VydmljZVByaW5jaXBhbCxcclxufSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xyXG5pbXBvcnQgeyBGdW5jdGlvbiwgUnVudGltZSwgQXNzZXRDb2RlIH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1sYW1iZGFcIjtcclxuaW1wb3J0IHsgUmV0ZW50aW9uRGF5cyB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtbG9nc1wiO1xyXG5pbXBvcnQgeyBCdWNrZXQsIEJ1Y2tldEVuY3J5cHRpb24sIEh0dHBNZXRob2RzIH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1zM1wiO1xyXG5pbXBvcnQge1xyXG4gIFVzZXJQb29sLFxyXG4gIFVzZXJQb29sQ2xpZW50LFxyXG4gIFVzZXJQb29sT3BlcmF0aW9uLFxyXG59IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY29nbml0b1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIE1lbW9yaWVzQmFja2VuZFN0YWNrIGV4dGVuZHMgU3RhY2sge1xyXG4gIHB1YmxpYyBzdGF0aWMgQUNDT1VOVF9UQUJMRSA9IFwiYWNjb3VudC10YWJsZVwiO1xyXG4gIHB1YmxpYyBzdGF0aWMgTUVTU0FHRV9UQUJMRSA9IFwibWVzc2FnZS10YWJsZVwiO1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgYWNjb3VudFRhYmxlOiBUYWJsZTtcclxuICBwdWJsaWMgcmVhZG9ubHkgbWVzc2FnZVRhYmxlOiBUYWJsZTtcclxuICBwdWJsaWMgcmVhZG9ubHkgdXBsb2FkTWVzc2FnZUZ1bmN0aW9uOiBGdW5jdGlvbjtcclxuICBwdWJsaWMgcmVhZG9ubHkgZ2V0TWVzc2FnZUZ1bmN0aW9uOiBGdW5jdGlvbjtcclxuICBwdWJsaWMgcmVhZG9ubHkgYWRkRnJpZW5kRnVuY3Rpb246IEZ1bmN0aW9uO1xyXG4gIHB1YmxpYyByZWFkb25seSBnZXRGcmllbmRMaXN0RnVuY3Rpb246IEZ1bmN0aW9uO1xyXG4gIHB1YmxpYyByZWFkb25seSBnZXRBbGxVc2Vyc0Z1bmN0aW9uOiBGdW5jdGlvbjtcclxuICBwdWJsaWMgcmVhZG9ubHkgYWRkTmV3QWNjb3VudEZ1bmN0aW9uOiBGdW5jdGlvbjtcclxuXHJcbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIGlkOiBzdHJpbmcpIHtcclxuICAgIHN1cGVyKGFwcCwgaWQsIHtcclxuICAgICAgZW52OiB7IHJlZ2lvbjogXCJ1cy13ZXN0LTJcIiB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgaW1hZ2VzQnVja2V0ID0gbmV3IEJ1Y2tldCh0aGlzLCBcIk1lbW9yaWVzSW1hZ2VCdWNrZXRcIiwge1xyXG4gICAgICBidWNrZXROYW1lOiBgbWVtb3JpZXMtaW1hZ2VzLSR7dGhpcy5hY2NvdW50fWAsXHJcbiAgICAgIGVuY3J5cHRpb246IEJ1Y2tldEVuY3J5cHRpb24uUzNfTUFOQUdFRCxcclxuICAgICAgcHVibGljUmVhZEFjY2VzczogdHJ1ZSxcclxuICAgICAgYmxvY2tQdWJsaWNBY2Nlc3M6IHtcclxuICAgICAgICBibG9ja1B1YmxpY0FjbHM6IGZhbHNlLFxyXG4gICAgICAgIGlnbm9yZVB1YmxpY0FjbHM6IGZhbHNlLFxyXG4gICAgICAgIHJlc3RyaWN0UHVibGljQnVja2V0czogZmFsc2UsXHJcbiAgICAgICAgYmxvY2tQdWJsaWNQb2xpY3k6IGZhbHNlLFxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcbiAgICBpbWFnZXNCdWNrZXQuYWRkQ29yc1J1bGUoe1xyXG4gICAgICBhbGxvd2VkSGVhZGVyczogW1wiKlwiXSxcclxuICAgICAgYWxsb3dlZE1ldGhvZHM6IFtcclxuICAgICAgICBIdHRwTWV0aG9kcy5HRVQsXHJcbiAgICAgICAgSHR0cE1ldGhvZHMuSEVBRCxcclxuICAgICAgICBIdHRwTWV0aG9kcy5QVVQsXHJcbiAgICAgICAgSHR0cE1ldGhvZHMuUE9TVCxcclxuICAgICAgICBIdHRwTWV0aG9kcy5ERUxFVEUsXHJcbiAgICAgIF0sXHJcbiAgICAgIGFsbG93ZWRPcmlnaW5zOiBbXCIqXCJdLFxyXG4gICAgICBleHBvc2VkSGVhZGVyczogW1wiRVRhZ1wiXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuYWNjb3VudFRhYmxlID0gbmV3IFRhYmxlKHRoaXMsIFwiQWNjb3VudFRhYmxlXCIsIHtcclxuICAgICAgdGFibGVOYW1lOiBNZW1vcmllc0JhY2tlbmRTdGFjay5BQ0NPVU5UX1RBQkxFLFxyXG4gICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogXCJpZFwiLCB0eXBlOiBBdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxyXG4gICAgICBiaWxsaW5nTW9kZTogQmlsbGluZ01vZGUuUEFZX1BFUl9SRVFVRVNULFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5tZXNzYWdlVGFibGUgPSBuZXcgVGFibGUodGhpcywgXCJNZXNzYWdlVGFibGVcIiwge1xyXG4gICAgICB0YWJsZU5hbWU6IE1lbW9yaWVzQmFja2VuZFN0YWNrLk1FU1NBR0VfVEFCTEUsXHJcbiAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiBcInJlY2lwaWVudF9pZFwiLCB0eXBlOiBBdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxyXG4gICAgICBiaWxsaW5nTW9kZTogQmlsbGluZ01vZGUuUEFZX1BFUl9SRVFVRVNULFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgaWRlbnRpZmllckdzaVByb3BzOiBHbG9iYWxTZWNvbmRhcnlJbmRleFByb3BzID0ge1xyXG4gICAgICBpbmRleE5hbWU6IFwic2VuZGVyLWluZGV4XCIsXHJcbiAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiBcInNlbmRlcl9pZFwiLCB0eXBlOiBBdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxyXG4gICAgICBwcm9qZWN0aW9uVHlwZTogUHJvamVjdGlvblR5cGUuQUxMLFxyXG4gICAgfTtcclxuICAgIHRoaXMubWVzc2FnZVRhYmxlLmFkZEdsb2JhbFNlY29uZGFyeUluZGV4KGlkZW50aWZpZXJHc2lQcm9wcyk7XHJcblxyXG4gICAgY29uc3QgbGFtYmRhUm9sZSA9IG5ldyBSb2xlKHRoaXMsIFwiTWVtb3JpZXNMYW1iZGFSb2xlXCIsIHtcclxuICAgICAgcm9sZU5hbWU6IFwiTWVtb3JpZXNMYW1iZGFSb2xlXCIsXHJcbiAgICAgIGFzc3VtZWRCeTogbmV3IFNlcnZpY2VQcmluY2lwYWwoXCJsYW1iZGEuYW1hem9uYXdzLmNvbVwiKSxcclxuICAgICAgaW5saW5lUG9saWNpZXM6IHtcclxuICAgICAgICBhZGRpdGlvbmFsOiBuZXcgUG9saWN5RG9jdW1lbnQoe1xyXG4gICAgICAgICAgc3RhdGVtZW50czogW1xyXG4gICAgICAgICAgICBuZXcgUG9saWN5U3RhdGVtZW50KHtcclxuICAgICAgICAgICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcclxuICAgICAgICAgICAgICBhY3Rpb25zOiBbXHJcbiAgICAgICAgICAgICAgICBcImVjMjpDcmVhdGVOZXR3b3JrSW50ZXJmYWNlXCIsXHJcbiAgICAgICAgICAgICAgICBcImVjMjpEZXNjcmliZSpcIixcclxuICAgICAgICAgICAgICAgIFwiZWMyOkRlbGV0ZU5ldHdvcmtJbnRlcmZhY2VcIixcclxuICAgICAgICAgICAgICAgIFwiaWFtOkdldFJvbGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWFtOlBhc3NSb2xlXCIsXHJcbiAgICAgICAgICAgICAgICBcImxhbWJkYTpJbnZva2VGdW5jdGlvblwiLFxyXG4gICAgICAgICAgICAgICAgXCJzMzoqXCIsXHJcbiAgICAgICAgICAgICAgICBcImttczoqXCIsXHJcbiAgICAgICAgICAgICAgICBcInN0czpBc3N1bWVSb2xlXCIsXHJcbiAgICAgICAgICAgICAgICBcImNsb3Vkd2F0Y2g6KlwiLFxyXG4gICAgICAgICAgICAgICAgXCJsb2dzOipcIixcclxuICAgICAgICAgICAgICAgIFwiZHluYW1vZGI6KlwiLFxyXG4gICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgcmVzb3VyY2VzOiBbXCIqXCJdLFxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgfSksXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnVwbG9hZE1lc3NhZ2VGdW5jdGlvbiA9IG5ldyBGdW5jdGlvbih0aGlzLCBcIlVwbG9hZE1lc3NhZ2VGdW5jdGlvblwiLCB7XHJcbiAgICAgIGZ1bmN0aW9uTmFtZTogXCJVcGxvYWRNZXNzYWdlXCIsXHJcbiAgICAgIGNvZGU6IG5ldyBBc3NldENvZGUoXCJidWlsZC9zcmNcIiksXHJcbiAgICAgIGhhbmRsZXI6IFwidXBsb2FkLW1lc3NhZ2UuaGFuZGxlclwiLFxyXG4gICAgICBydW50aW1lOiBSdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxyXG4gICAgICBtZW1vcnlTaXplOiAxMDI0LFxyXG4gICAgICB0aW1lb3V0OiBEdXJhdGlvbi5zZWNvbmRzKDMwMCksXHJcbiAgICAgIGxvZ1JldGVudGlvbjogUmV0ZW50aW9uRGF5cy5USFJFRV9NT05USFMsXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmdldE1lc3NhZ2VGdW5jdGlvbiA9IG5ldyBGdW5jdGlvbih0aGlzLCBcIkdldE1lc3NhZ2VGdW5jdGlvblwiLCB7XHJcbiAgICAgIGZ1bmN0aW9uTmFtZTogXCJHZXRNZXNzYWdlXCIsXHJcbiAgICAgIGNvZGU6IG5ldyBBc3NldENvZGUoXCJidWlsZC9zcmNcIiksXHJcbiAgICAgIGhhbmRsZXI6IFwiZ2V0LW1lc3NhZ2UuaGFuZGxlclwiLFxyXG4gICAgICBydW50aW1lOiBSdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxyXG4gICAgICBtZW1vcnlTaXplOiAxMDI0LFxyXG4gICAgICB0aW1lb3V0OiBEdXJhdGlvbi5zZWNvbmRzKDMwMCksXHJcbiAgICAgIGxvZ1JldGVudGlvbjogUmV0ZW50aW9uRGF5cy5USFJFRV9NT05USFMsXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFkZEZyaWVuZEZ1bmN0aW9uID0gbmV3IEZ1bmN0aW9uKHRoaXMsIFwiQWRkRnJpZW5kRnVuY3Rpb25cIiwge1xyXG4gICAgICBmdW5jdGlvbk5hbWU6IFwiQWRkRnJpZW5kXCIsXHJcbiAgICAgIGNvZGU6IG5ldyBBc3NldENvZGUoXCJidWlsZC9zcmNcIiksXHJcbiAgICAgIGhhbmRsZXI6IFwiYWRkLWZyaWVuZC5oYW5kbGVyXCIsXHJcbiAgICAgIHJ1bnRpbWU6IFJ1bnRpbWUuTk9ERUpTXzE4X1gsXHJcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXHJcbiAgICAgIG1lbW9yeVNpemU6IDEwMjQsXHJcbiAgICAgIHRpbWVvdXQ6IER1cmF0aW9uLnNlY29uZHMoMzApLFxyXG4gICAgICBsb2dSZXRlbnRpb246IFJldGVudGlvbkRheXMuVEhSRUVfTU9OVEhTLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5nZXRGcmllbmRMaXN0RnVuY3Rpb24gPSBuZXcgRnVuY3Rpb24odGhpcywgXCJHZXRGcmllbmRMaXN0RnVuY3Rpb25cIiwge1xyXG4gICAgICBmdW5jdGlvbk5hbWU6IFwiR2V0RnJpZW5kTGlzdFwiLFxyXG4gICAgICBjb2RlOiBuZXcgQXNzZXRDb2RlKFwiYnVpbGQvc3JjXCIpLFxyXG4gICAgICBoYW5kbGVyOiBcImdldC1mcmllbmRzLWxpc3QuaGFuZGxlclwiLFxyXG4gICAgICBydW50aW1lOiBSdW50aW1lLk5PREVKU18xOF9YLFxyXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxyXG4gICAgICBtZW1vcnlTaXplOiAxMDI0LFxyXG4gICAgICB0aW1lb3V0OiBEdXJhdGlvbi5zZWNvbmRzKDMwKSxcclxuICAgICAgbG9nUmV0ZW50aW9uOiBSZXRlbnRpb25EYXlzLlRIUkVFX01PTlRIUyxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZ2V0QWxsVXNlcnNGdW5jdGlvbiA9IG5ldyBGdW5jdGlvbih0aGlzLCBcIkdldEFsbFVzZXJzRnVuY3Rpb25cIiwge1xyXG4gICAgICBmdW5jdGlvbk5hbWU6IFwiR2V0QWxsVXNlcnNcIixcclxuICAgICAgY29kZTogbmV3IEFzc2V0Q29kZShcImJ1aWxkL3NyY1wiKSxcclxuICAgICAgaGFuZGxlcjogXCJnZXQtYWxsLXVzZXJzLmhhbmRsZXJcIixcclxuICAgICAgcnVudGltZTogUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcclxuICAgICAgbWVtb3J5U2l6ZTogMTAyNCxcclxuICAgICAgdGltZW91dDogRHVyYXRpb24uc2Vjb25kcygzMCksXHJcbiAgICAgIGxvZ1JldGVudGlvbjogUmV0ZW50aW9uRGF5cy5USFJFRV9NT05USFMsXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmFkZE5ld0FjY291bnRGdW5jdGlvbiA9IG5ldyBGdW5jdGlvbih0aGlzLCBcIkFkZE5ld0FjY291bnRGdW5jdGlvblwiLCB7XHJcbiAgICAgIGZ1bmN0aW9uTmFtZTogXCJBZGROZXdBY2NvdW50XCIsXHJcbiAgICAgIGNvZGU6IG5ldyBBc3NldENvZGUoXCJidWlsZC9zcmNcIiksXHJcbiAgICAgIGhhbmRsZXI6IFwiYWRkLW5ldy1hY2NvdW50LmhhbmRsZXJcIixcclxuICAgICAgcnVudGltZTogUnVudGltZS5OT0RFSlNfMThfWCxcclxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcclxuICAgICAgbWVtb3J5U2l6ZTogMTAyNCxcclxuICAgICAgdGltZW91dDogRHVyYXRpb24uc2Vjb25kcygzMCksXHJcbiAgICAgIGxvZ1JldGVudGlvbjogUmV0ZW50aW9uRGF5cy5USFJFRV9NT05USFMsXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCB1c2VyUG9vbCA9IG5ldyBVc2VyUG9vbCh0aGlzLCBcIk1lbW9yaWVzVXNlclBvb2xcIiwge1xyXG4gICAgICB1c2VyUG9vbE5hbWU6IFwiTWVtb3JpZXNVc2VyUG9vbFwiLFxyXG4gICAgfSk7XHJcblxyXG4gICAgbmV3IFVzZXJQb29sQ2xpZW50KHRoaXMsIFwiTWVtb3JpZXNVc2VyUG9vbENsaWVudFwiLCB7XHJcbiAgICAgIHVzZXJQb29sLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdXNlclBvb2wuYWRkVHJpZ2dlcihVc2VyUG9vbE9wZXJhdGlvbi5QT1NUX0NPTkZJUk1BVElPTiwgdGhpcy5hZGROZXdBY2NvdW50RnVuY3Rpb24pO1xyXG5cclxuICAgIGNvbnN0IGFwaSA9IG5ldyBSZXN0QXBpKHRoaXMsIFwiTWVtb3JpZXNBcGlHYXRld2F5XCIsIHtcclxuICAgICAgcmVzdEFwaU5hbWU6IFwiTWVtb3JpZXMgQVBJXCIsXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBtZXNzYWdlQVBJID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoXCJtZXNzYWdlXCIpO1xyXG4gICAgY29uc3QgdXBsb2FkSW50ZWdyYXRpb24gPSBuZXcgTGFtYmRhSW50ZWdyYXRpb24odGhpcy51cGxvYWRNZXNzYWdlRnVuY3Rpb24sIHsgcHJveHk6IHRydWUgfSk7XHJcbiAgICBtZXNzYWdlQVBJLmFkZE1ldGhvZChcIlBPU1RcIiwgdXBsb2FkSW50ZWdyYXRpb24pO1xyXG5cclxuICAgIGNvbnN0IGdldEludGVncmF0aW9uID0gbmV3IExhbWJkYUludGVncmF0aW9uKHRoaXMuZ2V0TWVzc2FnZUZ1bmN0aW9uKTtcclxuICAgIG1lc3NhZ2VBUEkuYWRkTWV0aG9kKFwiR0VUXCIsIGdldEludGVncmF0aW9uKTtcclxuICAgIG1lc3NhZ2VBUEkuYWRkTWV0aG9kKFwiT1BUSU9OU1wiLCB1cGxvYWRJbnRlZ3JhdGlvbik7XHJcblxyXG4gICAgY29uc3QgYWNjb3VudFJlc291cmNlID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoXCJhY2NvdW50XCIpO1xyXG4gICAgY29uc3QgYWRkRnJpZW5kSW50ZWdyYXRpb24gPSBuZXcgTGFtYmRhSW50ZWdyYXRpb24odGhpcy5hZGRGcmllbmRGdW5jdGlvbiwgeyBwcm94eTogdHJ1ZSB9KTtcclxuICAgIGFjY291bnRSZXNvdXJjZS5hZGRSZXNvdXJjZShcImZyaWVuZFwiKS5hZGRNZXRob2QoXCJQT1NUXCIsIGFkZEZyaWVuZEludGVncmF0aW9uKTtcclxuXHJcbiAgICBjb25zdCBnZXRGcmllbmRzSW50ZWdyYXRpb24gPSBuZXcgTGFtYmRhSW50ZWdyYXRpb24odGhpcy5nZXRGcmllbmRMaXN0RnVuY3Rpb24pO1xyXG4gICAgYWNjb3VudFJlc291cmNlLmFkZFJlc291cmNlKFwiZnJpZW5kc1wiKS5hZGRNZXRob2QoXCJHRVRcIiwgZ2V0RnJpZW5kc0ludGVncmF0aW9uKTtcclxuXHJcbiAgICBjb25zdCBnZXRBbGxVc2Vyc0ludGVncmF0aW9uID0gbmV3IExhbWJkYUludGVncmF0aW9uKHRoaXMuZ2V0QWxsVXNlcnNGdW5jdGlvbik7XHJcbiAgICBhY2NvdW50UmVzb3VyY2UuYWRkUmVzb3VyY2UoXCJhbGxcIikuYWRkTWV0aG9kKFwiR0VUXCIsIGdldEFsbFVzZXJzSW50ZWdyYXRpb24pO1xyXG5cclxuICAgIGNvbnN0IGFkZEFjY291bnRJbnRlZ3JhdGlvbiA9IG5ldyBMYW1iZGFJbnRlZ3JhdGlvbih0aGlzLmFkZE5ld0FjY291bnRGdW5jdGlvbiwgeyBwcm94eTogdHJ1ZSB9KTtcclxuICAgIGFjY291bnRSZXNvdXJjZS5hZGRSZXNvdXJjZShcImNyZWF0ZVwiKS5hZGRNZXRob2QoXCJQT1NUXCIsIGFkZEFjY291bnRJbnRlZ3JhdGlvbik7XHJcbiAgfVxyXG59XHJcbiJdfQ==
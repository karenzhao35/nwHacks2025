import { App, Duration, Stack } from "aws-cdk-lib";
import { RestApi, LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import {
    Table,
    AttributeType,
    BillingMode,
    ProjectionType,
    GlobalSecondaryIndexProps,
} from "aws-cdk-lib/aws-dynamodb";
import {
    Effect,
    PolicyDocument,
    PolicyStatement,
    Role,
    ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { Function, Runtime, AssetCode } from "aws-cdk-lib/aws-lambda";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Bucket, BucketEncryption, HttpMethods } from "aws-cdk-lib/aws-s3";
import {
    UserPool,
    UserPoolClient,
    UserPoolOperation,
} from "aws-cdk-lib/aws-cognito";

export class MemoriesBackendStack extends Stack {
    public static ACCOUNT_TABLE = "account-table";
    public static MESSAGE_TABLE = "message-table";

    public readonly accountTable: Table;
    public readonly messageTable: Table;
    public readonly uploadMessageFunction: Function;
    public readonly getMessageFunction: Function;
    public readonly addFriendFunction: Function;
    public readonly getFriendListFunction: Function;
    public readonly getAllUsersFunction: Function;
    public readonly addNewAccountFunction: Function;
    public readonly loginUserFunction: Function; // NEW

    constructor(app: App, id: string) {
        super(app, id, {
            env: { region: "us-west-2" },
        });

        const imagesBucket = new Bucket(this, "MemoriesImageBucket", {
            bucketName: `memories-images-${this.account}`,
            encryption: BucketEncryption.S3_MANAGED,
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
                HttpMethods.GET,
                HttpMethods.HEAD,
                HttpMethods.PUT,
                HttpMethods.POST,
                HttpMethods.DELETE,
            ],
            allowedOrigins: ["*"],
            exposedHeaders: ["ETag"],
        });

        this.accountTable = new Table(this, "AccountTable", {
            tableName: MemoriesBackendStack.ACCOUNT_TABLE,
            partitionKey: { name: "id", type: AttributeType.STRING },
            billingMode: BillingMode.PAY_PER_REQUEST,
        });

        this.messageTable = new Table(this, "MessageTable", {
            tableName: MemoriesBackendStack.MESSAGE_TABLE,
            partitionKey: { name: "recipient_id", type: AttributeType.STRING },
            sortKey: {
                name: "date",
                type: AttributeType.STRING,
            },
            billingMode: BillingMode.PAY_PER_REQUEST,
        });

        const identifierGsiProps: GlobalSecondaryIndexProps = {
            indexName: "sender-index",
            partitionKey: { name: "sender_id", type: AttributeType.STRING },
            projectionType: ProjectionType.ALL,
        };
        this.messageTable.addGlobalSecondaryIndex(identifierGsiProps);

        const lambdaRole = new Role(this, "MemoriesLambdaRole", {
            roleName: "MemoriesLambdaRole",
            assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
            inlinePolicies: {
                additional: new PolicyDocument({
                    statements: [
                        new PolicyStatement({
                            effect: Effect.ALLOW,
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
                                "bedrock:*",
                            ],
                            resources: ["*"],
                        }),
                    ],
                }),
            },
        });

        this.uploadMessageFunction = new Function(
            this,
            "UploadMessageFunction",
            {
                functionName: "UploadMessage",
                code: new AssetCode("build/src"),
                handler: "upload-message.handler",
                runtime: Runtime.NODEJS_18_X,
                role: lambdaRole,
                memorySize: 1024,
                timeout: Duration.seconds(300),
                logRetention: RetentionDays.THREE_MONTHS,
                environment: {
                    BUCKET_NAME: `memories-images-${this.account}`,
                },
            }
        );

        this.getMessageFunction = new Function(this, "GetMessageFunction", {
            functionName: "GetMessage",
            code: new AssetCode("build/src"),
            handler: "get-message.handler",
            runtime: Runtime.NODEJS_18_X,
            role: lambdaRole,
            memorySize: 1024,
            timeout: Duration.seconds(300),
            logRetention: RetentionDays.THREE_MONTHS,
        });

        this.addFriendFunction = new Function(this, "AddFriendFunction", {
            functionName: "AddFriend",
            code: new AssetCode("build/src"),
            handler: "add-friend.handler",
            runtime: Runtime.NODEJS_18_X,
            role: lambdaRole,
            memorySize: 1024,
            timeout: Duration.seconds(30),
            logRetention: RetentionDays.THREE_MONTHS,
        });

        this.getFriendListFunction = new Function(
            this,
            "GetFriendListFunction",
            {
                functionName: "GetFriendList",
                code: new AssetCode("build/src"),
                handler: "get-friends-list.handler",
                runtime: Runtime.NODEJS_18_X,
                role: lambdaRole,
                memorySize: 1024,
                timeout: Duration.seconds(30),
                logRetention: RetentionDays.THREE_MONTHS,
            }
        );

        this.getAllUsersFunction = new Function(this, "GetAllUsersFunction", {
            functionName: "GetAllUsers",
            code: new AssetCode("build/src"),
            handler: "get-all-users.handler",
            runtime: Runtime.NODEJS_18_X,
            role: lambdaRole,
            memorySize: 1024,
            timeout: Duration.seconds(30),
            logRetention: RetentionDays.THREE_MONTHS,
        });

        this.addNewAccountFunction = new Function(
            this,
            "AddNewAccountFunction",
            {
                functionName: "AddNewAccount",
                code: new AssetCode("build/src"),
                handler: "add-new-account.handler",
                runtime: Runtime.NODEJS_18_X,
                role: lambdaRole,
                memorySize: 1024,
                timeout: Duration.seconds(30),
                logRetention: RetentionDays.THREE_MONTHS,
            }
        );

        // NEW: LoginUserFunction
        this.loginUserFunction = new Function(this, "LoginUserFunction", {
            functionName: "LoginUser",
            code: new AssetCode("build/src"),
            handler: "login-user.handler",
            runtime: Runtime.NODEJS_18_X,
            role: lambdaRole,
            memorySize: 1024,
            timeout: Duration.seconds(30),
            logRetention: RetentionDays.THREE_MONTHS,
        });

        const userPool = new UserPool(this, "MemoriesUserPool", {
            userPoolName: "MemoriesUserPool",
        });

        new UserPoolClient(this, "MemoriesUserPoolClient", {
            userPool,
        });

        userPool.addTrigger(
            UserPoolOperation.POST_CONFIRMATION,
            this.addNewAccountFunction
        );

        const api = new RestApi(this, "MemoriesApiGateway", {
            restApiName: "Memories API",
        });

        const messageAPI = api.root.addResource("message");
        const uploadIntegration = new LambdaIntegration(
            this.uploadMessageFunction,
            {
                proxy: true,
            }
        );
        messageAPI.addMethod("POST", uploadIntegration);

        const getIntegration = new LambdaIntegration(this.getMessageFunction);
        messageAPI.addMethod("GET", getIntegration);
        messageAPI.addMethod("OPTIONS", uploadIntegration);

        const accountResource = api.root.addResource("account");

        const addFriendIntegration = new LambdaIntegration(
            this.addFriendFunction,
            {
                proxy: true,
            }
        );
        accountResource
            .addResource("friend")
            .addMethod("POST", addFriendIntegration);

        const getFriendsIntegration = new LambdaIntegration(
            this.getFriendListFunction
        );
        accountResource
            .addResource("friends")
            .addMethod("GET", getFriendsIntegration);

        const getAllUsersIntegration = new LambdaIntegration(
            this.getAllUsersFunction
        );
        accountResource
            .addResource("all")
            .addMethod("GET", getAllUsersIntegration);

        const addAccountIntegration = new LambdaIntegration(
            this.addNewAccountFunction,
            { proxy: true }
        );
        accountResource
            .addResource("create")
            .addMethod("POST", addAccountIntegration);

        const loginIntegration = new LambdaIntegration(this.loginUserFunction, {
            proxy: true,
        });
        accountResource
            .addResource("login")
            .addMethod("POST", loginIntegration);
    }
}

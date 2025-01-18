import { App, Duration, IResource, Stack } from "aws-cdk-lib";
import {
    LambdaIntegration,
    MockIntegration,
    RestApi,
} from "aws-cdk-lib/aws-apigateway";
import {
    AttributeType,
    BillingMode,
    GlobalSecondaryIndexProps,
    Table,
    ProjectionType,
} from "aws-cdk-lib/aws-dynamodb";
import {
    Effect,
    PolicyDocument,
    PolicyStatement,
    Role,
    ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { AssetCode, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import {
    BlockPublicAccess,
    Bucket,
    BucketEncryption,
    HttpMethods,
} from "aws-cdk-lib/aws-s3";

export class MemoriesBackendStack extends Stack {
    public static ACCOUNT_TABLE = "account-table";
    public static MESSAGE_TABLE = "message-table";

    public readonly accountTable: Table;
    public readonly messageTable: Table;
    public readonly uploadMessageFunction: Function;
    public readonly getMessageFunction: Function;

    constructor(app: App, id: string) {
        super(app, id, {
            env: {
                region: "us-west-2",
            },
        });

        // Create public upload bucket
        //
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

        // DynamoDB
        this.accountTable = new Table(this, "AccountTable", {
            tableName: MemoriesBackendStack.ACCOUNT_TABLE,
            partitionKey: {
                name: "id",
                type: AttributeType.STRING,
            },
            billingMode: BillingMode.PAY_PER_REQUEST,
        });

        this.messageTable = new Table(this, "MessageTable", {
            tableName: MemoriesBackendStack.MESSAGE_TABLE,
            partitionKey: {
                name: "recipient_id",
                type: AttributeType.STRING,
            },
            billingMode: BillingMode.PAY_PER_REQUEST,
        });

        const identifierGsiProps: GlobalSecondaryIndexProps = {
            indexName: "sender-index",
            partitionKey: {
                name: "sender_id",
                type: AttributeType.STRING,
            },
            projectionType: ProjectionType.ALL,
        };
        this.messageTable.addGlobalSecondaryIndex(identifierGsiProps);

        // Lambda function to execute inference.
        //
        const lambdaRole = new Role(this, "MemoriesLambdaRole", {
            roleName: "MemoriesLambdaRole",
            assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
            inlinePolicies: {
                additional: new PolicyDocument({
                    statements: [
                        new PolicyStatement({
                            effect: Effect.ALLOW,
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
                                "dynamodb:*",
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

        // API Gateway
        //
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
    }
}

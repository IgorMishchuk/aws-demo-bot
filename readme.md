Serverless Telegram bot
=======================

Intro
-----
This serverless telegram bot was written as a part of self education during AWS Solutions Architect Assoiciate and AWS Developer Associate training courses. 

It uses next AWS services:
1. [API Gateway](https://aws.amazon.com/api-gateway);
2. [Lambda](https://aws.amazon.com/lambda/) (node.js 8.10);
3. [S3](https://aws.amazon.com/s3/);
4. [Polly](https://aws.amazon.com/polly/);
5. [DynamoDB](https://aws.amazon.com/dynamodb/);
6. [Cloudwatch](https://aws.amazon.com/cloudwatch/).

At the moment, it has three functions:  
1. Send received text to Polly and have it converted to speech. [Speech function](https://github.com/IgorMishchuk/aws-demo-bot/tree/master/speech/);
2. Calculate time difference between specific message and latest entry in DB. [DynamoDB function](https://github.com/IgorMishchuk/aws-demo-bot/tree/master/dynamodb/);
3. Process text if none of the above features were requested. [Text function](https://github.com/IgorMishchuk/aws-demo-bot/tree/master/text/).

Prerequisites
-------------
What you need for this to work:
1. Telegram bot. Provided Bot API key will be used in BOT_API_KEY environmental variable. [How to create Telegram bot](https://core.telegram.org/bots#3-how-do-i-create-a-bot).
2. [AWS account](https://aws.amazon.com/). Free tier is OK, but make sure that your AWS usage stays in Free tier [limits](https://aws.amazon.com/free/).

General overview
------------------

![overview](https://s3.eu-west-3.amazonaws.com/awsdemobucket11/images/overview.jpg)
1. User sends message to Telegram chat;
2. JSON message is delivered through webhook to API gateway invoke URL;
3. Message is processed by [**Gatekeeper**](https://github.com/IgorMishchuk/aws-demo-bot/tree/master/gatekeeper/) Lambda function. Decision is made which Lambda function will be invoked next:
	- [**Speech**](https://github.com/IgorMishchuk/aws-demo-bot/tree/master/speech/) function if conversion from text to speech is requested;
	- [**DynamoDB**](https://github.com/IgorMishchuk/aws-demo-bot/tree/master/dynamodb/) function if time difference calculation is requested;
	- [**Text**](https://github.com/IgorMishchuk/aws-demo-bot/tree/master/text/) function if simple text reply is requested;
	- [**Send**](https://github.com/IgorMishchuk/aws-demo-bot/tree/master/send/) function if Speech or DynamoDB function were requeted by unauthorized user.
4. After message processing by any of specialized functions it is sent to **Send** function;
5. **Send** function creates URL post request to Telegram API and sends the message.

Deployment
-----------
1. Create S3 bucket which will be used by your **Speech** Lambda function. Bucket name will be specified as Value for BUCKET_NAME environmental variable.
2. Create DynamoDB table:
	- Table name will be specified as Value for DB environmental variable;
	- Primary key will contain name of person for whom we are calculating time difference. Key name will be used in Query and Put operations. In this example key name is "Dname". Set type to String;
	- Sort key will contain date of message from target person. In this example, key name is "Date". Set type to String.
	- Untick "Use default settings";
	- Untick Autoscaling for Read and Write capacity units;
	- Set provisioned capacity to 5 for Read and Write capacity units. If you need more, please, check this [guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ProvisionedThroughput.html) for provisioned throughput calculation. Remember that DynamoDB is subject to [free tier](https://aws.amazon.com/dynamodb/pricing/) for 25 RCU/WCU.
3. Create Lambda functions:
	- Runtime: Node.js 6.10;
	- Function **Gatekeeper**:
		- Role must include next AWS managed policies:
			- AWSLambdaBasicExecutionRole (Gives write permission to CloudWatch logs);
			- AWSLambdaRole (Gives invoke permissions to other Lambda function).
		- Import [/gatekeeper/index.js](https://github.com/IgorMishchuk/aws-demo-bot/tree/master/gatekeeper/);
		- (_Optional_) Add environmental variables for CHAT1 and USER1 parameters.
	- Function **Speech**:
		- Role must include next AWS managed policies:
			- AmazonS3FullAccess (Gives read/write permissions to S3);
			- AWSLambdaBasicExecutionRole (Gives write permissions to CloudWatch logs);
			- AWSLambdaRole (Gives invoke permissions to other Lambda function);
			- AmazonPollyFullAccess (Gives full permissions to Polly service).
		- Import [/speech/index.js](https://github.com/IgorMishchuk/aws-demo-bot/tree/master/speech/);
		- Add environmental variable for BUCKET_NAME pointing to your S3 bucket.
	- Function **DynamoDB**:
		- Role must include next AWS managed policies:
			- AWSLambdaBasicExecutionRole (Gives write permission to CloudWatch logs);
			- AWSLambdaRole (Gives invoke permissions to other Lambda function).
		- Role must include Managed policy with next permissions:
			- Allow dynamodb:Query;
			- Allow dynamodb:PutItem.
		- Import [/dynamodb/index.js](https://github.com/IgorMishchuk/aws-demo-bot/tree/master/dynamodb/);
		- Add environmental variable for DB pointing to your DynamoDB table.
	- Function **Text**:
		- Role must include next AWS managed policies:
			- AWSLambdaBasicExecutionRole (Gives write permission to CloudWatch logs);
			- AWSLambdaRole (Gives invoke permissions to other Lambda function).
		- Import [/text/index.js](https://github.com/IgorMishchuk/aws-demo-bot/tree/master/text/).
	- Function **Send**:
		- Role must include next AWS managed policies:
			- AWSLambdaBasicExecutionRole (Gives write permission to CloudWatch logs);
		- Import [/send/index.js](https://github.com/IgorMishchuk/aws-demo-bot/tree/master/send/);
		- Add environmental variable for BOT_API_KEY.
4. Create API Gateway:
	- Actions -> Create method POST;
	- Integration type "Lambda Function";
	- Specify Lambda name **Gatekeeper** in "Lambda fucntion" field;
	- Actions -> Deploy API:
		- Deployment stage [New stage];
		- Stage name "main", for example.
	- **Invoke URL** of the stage will be used for Webhook creation to Telegram bot API. It looks like https://<API_NUMBER>.execute-api.<AWS_REGION>.amazonaws.com/<STAGE_NAME>.
5. Create a webhook from Telegram URL to **Invoke URL** of API gateway. [Webhook how-to](https://core.telegram.org/bots/api#setwebhook). Command will look like this "curl --data url=https://<INVOKE_URL> https://api.telegram.org/bot<BOT_API_KEY>/setWebhook"
6. [Configure](https://core.telegram.org/bots/inline) Bot to inline mode.

That's it, you're ready.

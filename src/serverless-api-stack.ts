import path = require('path');
import {
  CfnOutput,
  Construct,
  Duration,
  Stack,
  StackProps,
} from "@aws-cdk/core";
import * as nodejsLambda from "@aws-cdk/aws-lambda-nodejs";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigw from "@aws-cdk/aws-apigateway";
import * as codedeploy from "@aws-cdk/aws-codedeploy";
import * as cloudwatch from "@aws-cdk/aws-cloudwatch";

export class ServerlessApiStack extends Stack {
  urlOutput: CfnOutput;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaHandler = new nodejsLambda.NodejsFunction(this, "Handler", {
      entry: path.join(__dirname, "lambda", "handler.ts"),
      handler: "handle",
      runtime: lambda.Runtime.NODEJS_12_X
    })

    const alias = new lambda.Alias(this, "Alias", {
      aliasName: "Current",
      version: lambdaHandler.currentVersion,
    });

    const api = new apigw.LambdaRestApi(this, "Gateway", {
      description: "Endpoint for a simple Lambda-powered web service",
      handler: alias,
    });

    const failureAlarm = this.createFailuresAlarm();

    new codedeploy.LambdaDeploymentGroup(this, "DeploymentGroup ", {
      alias,
      deploymentConfig:
        codedeploy.LambdaDeploymentConfig.CANARY_10PERCENT_5MINUTES,
      alarms: [failureAlarm],
    });

    this.urlOutput = new CfnOutput(this, "url", { value: api.url });
  }

  private createFailuresAlarm() {
    const apiGateway5xx = new cloudwatch.Metric({
      metricName: "5XXError",
      namespace: "AWS/ApiGateway",
      dimensions: {
        ApiName: "Gateway",
      },
      statistic: "Sum",
      period: Duration.minutes(1),
    });
    const failureAlarm = new cloudwatch.Alarm(this, "RollbackAlarm", {
      metric: apiGateway5xx,
      threshold: 1,
      evaluationPeriods: 1,
    });
    return failureAlarm;
  }
}

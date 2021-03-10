import { CfnOutput, Construct, StackProps, Stage } from "@aws-cdk/core";
import { ServerlessApiStack } from "./serverless-api-stack";

export interface ServerlessApiStageProps extends StackProps {
  envSufix: string;
}

export class ServerlessApiStage extends Stage {
  urlOutput: CfnOutput;

  constructor(scope: Construct, id: string, props: ServerlessApiStageProps) {
    super(scope, id, props);

    const service = new ServerlessApiStack(this, "ServerlessApiStack", {
      stackName: `ServerlessApiStack-${props.envSufix}`,
      tags: {
        Application: "ServerlessApiStack",
        Environment: props.envSufix,
      },
    });

    this.urlOutput = service.urlOutput;
  }
}

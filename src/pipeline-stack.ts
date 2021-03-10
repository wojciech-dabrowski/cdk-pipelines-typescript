import { Construct, SecretValue, Stack, StackProps } from "@aws-cdk/core";
import * as cp from "@aws-cdk/aws-codepipeline";
import * as cpa from "@aws-cdk/aws-codepipeline-actions";
import * as pipelines from "@aws-cdk/pipelines";
import { ServerlessApiStage } from "./serverless-api-stage";

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const sourceArtifact = new cp.Artifact();
    const cloudAssemblyArtifact = new cp.Artifact();

    const sourceAction = this.createSourceAction(sourceArtifact);
    const synthAction = this.createSynthAction(
      sourceArtifact,
      cloudAssemblyArtifact
    );

    const pipeline = new pipelines.CdkPipeline(this, "Pipeline", {
      cloudAssemblyArtifact,
      sourceAction,
      synthAction,
    });

    // Test
    const preProdApp = new ServerlessApiStage(this, "Test", {
      envSufix: "Test",
    });
    const preProdStage = pipeline.addApplicationStage(preProdApp);
    const serviceUrl = pipeline.stackOutput(preProdApp.urlOutput);

    preProdStage.addActions(
      new pipelines.ShellScriptAction({
        actionName: "IntegrationTests",
        runOrder: preProdStage.nextSequentialRunOrder(),
        additionalArtifacts: [sourceArtifact],
        commands: ["npm install", "npm run build", "npm run integration"],
        useOutputs: {
          SERVICE_URL: serviceUrl,
        },
      })
    );

    // Prod
    const prodApp = new ServerlessApiStage(this, "Prod", { envSufix: "Prod" });
    pipeline.addApplicationStage(prodApp);
  }

  private createSynthAction(
    sourceArtifact: cp.Artifact,
    cloudAssemblyArtifact: cp.Artifact
  ) {
    return pipelines.SimpleSynthAction.standardNpmSynth({
      sourceArtifact,
      cloudAssemblyArtifact,
      buildCommand: "npm run build",
    });
  }

  private createSourceAction(sourceArtifact: cp.Artifact) {
    return new cpa.GitHubSourceAction({
      actionName: "GitHub",
      output: sourceArtifact,
      oauthToken: SecretValue.secretsManager("github-token"),
      owner: "wojciech-dabrowski",
      repo: "cdk-pipelines-demo",
      branch: "07-cp-prod-stage",
    });
  }
}

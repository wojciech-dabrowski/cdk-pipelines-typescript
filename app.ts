#!/usr/bin/env node
import 'source-map-support/register';
import { App } from '@aws-cdk/core';
import { ServerlessApiStack } from './src/serverless-api-stack';
import { PipelineStack } from './src/pipeline-stack';

const app = new App();

new PipelineStack(app, 'PipelineStack');
// new ServerlessApiStack(app, 'ServerlessApiStack');

app.synth();

#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { MemoriesBackendStack } from "../lib/backend-stack";

const app = new App();
new MemoriesBackendStack(app, "MemoriesBackendStack");

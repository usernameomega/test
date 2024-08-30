#!/bin/bash

# ToDo: Migrate to CI pipeline

# Build documentation for Identity Service
npx @redocly/cli build-docs ./openapi-v1.0.1.yaml -o ./index.html

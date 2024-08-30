# Contributing to Identity Service

Bug reports and pull requests from users are what keep this project working.

## Branch Naming
We encourage developers to use descriptive branch names. Consider including the issue number and a brief descriptor. The format is as follows: {issue type}/{issue number}-{issue description}, e.g., `feature/IS-172-add-the-contributing`.

## Commit Messages
Commit messages provide a history of your work. Craft the messages to describe what changes the commit includes without having to look at the code. Consider using [The Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/) for example: `fix: response content type`.

## Pull Requests
Pull requests (PRs) help facilitate code review and discussions on proposed changes before they're merged into the develop branch. Include a detailed summary of changes and reference related issue numbers, if any. A PR should solve a single purpose; for multiple unrelated changes, create separate PRs. 

## Merge Strategy
Embrace 'Squash and Merge' strategy - this condenses all the file changes into a single commit when merging, keeping the target branch history linear and simplified. Avoid directly pushing your changes to the develop branch.

## Deleting Branches
To maintain a clean and clutter-free project, delete branches post-merge. GitHub provides a button to delete the branch once the PR is merged.

## Code Reviews
Code reviews ensure the code quality remains high and lets others in the team understand the changes. When reviewing, remain respectful, suggest changes don't demand, and focus on the code changes and not the person.
The branch needs to be approved by two reviewing persons in order to be merged.

## Continuous Integration (CI) and Deployment
We use GitHub Actions for CI/CD. Developers should ensure that they have tested the code before committing. The tool automatically checks each commit and runs all unit tests when a PR is submitted or updated.

## Repository Organization
Project repository should be kept well-structured with a clear division between source files, test files, build files, etc. Files should be kept in appropriate modules/directories.

## Versioning
We follow Semantic Versioning (`Major.Minor.Patch`). 'Major' versions make changes that are not backward-compatible. 'Minor' makes backward-compatible improvements. 'Patch' provides backward-compatible bug fixes.

## Security and Access Control
Use teams and permissions to manage who has write access to the project. Regularly review access rights and restrict to read-only access for everyone not actively developing.

---
Thanks for considering contributing to the project!

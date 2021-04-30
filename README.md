# Fancier Discord Webhook
This GitHub Action can produce fancy and more meaningful discord messages for your commits.
<br>It includes Test results and coverage.

## Requirements
This currently works only for Maven projects.
For Test Results and Coverage Reports you will need to use one of the following Maven plugins:
* `maven-surefire`
* `maven-failsafe`
* `jacoco`

## Inputs

### `id`
**Required** This is the id of your Discord webhook, if you copy the webhook url, this will be the first part of it.

### `token`
**Required** Now your Discord webhook token, it's the second part of the url.

## Example setup
To set up this Action, create a new workflow file under `.github/workflows/pc-webhook.yml`.

**Important:** Your project must have a `pom.xml` file, this Action only supports Maven at the moment.<br>
To report Unit Tests and coverage, you will need `maven-surefire` / `maven-failsafe` and/or `jacoco`.

This workflow is rather simple, it checks out your repository, sets up Java and the webhook will then run `mvn test` and report the results to your discord webhook.
You should configure the webhook id in advance.

```yaml
name: Discord Webhook

on: [push]

jobs:
  report-status:

    runs-on: ubuntu-latest

    steps:
    - name: Checkout repository
      uses: actions/checkout@v1
    - name: Set up JDK 1.8
      uses: actions/setup-java@master
      with:
        java-version: 1.8
    - name: Run Discord Webhook
      uses: Vladimir-Urik/pc-discord-webhook@master
      with:
        id: ${{ secrets.YOUR_DISCORD_WEBHOOK_ID }}
        token: ${{ secrets.YOUR_DISCORD_WEBHOOK_TOKEN }}
```

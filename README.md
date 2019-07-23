topcoder-cli
===

#### Build Status:
[![CircleCI](https://circleci.com/gh/topcoder-platform/topcoder-cli/tree/master.svg?style=svg)](https://circleci.com/gh/topcoder-platform/topcoder-cli/tree/master) ![npm (tag)](https://img.shields.io/npm/v/@topcoder/topcoder-cli/latest.svg?style=plastic) ![GitHub issues](https://img.shields.io/github/issues/topcoder-platform/topcoder-cli.svg?style=plastic)

# Dependencies
- nodejs https://nodejs.org/en/ (v10)
- npm https://www.npmjs.com/ (v6)

# Configuration
Configuration for the application is at `config/default.js`.
The following parameters can be set in config files or in env variables:

| Property               | Environment varible     | Default value                              | Description                            |
| ---                    | ---                     | ---                                        | ---                                    |
| LOG_LEVEL              | LOG_LEVEL               | info                                       | control log level                      |
| SUBMISSION_API_URL     | TEST_SUBMISSION_API_URL | https://api.topcoder.com/v5/submissions    | the TC submission API URL              |
| TC_AUTHN_URL           | TC_AUTHN_URL            | https://topcoder.auth0.com/oauth/ro        | API that is used to fetch JWT token v2 |
| TC_AUTHZ_URL           | TC_AUTHZ_URL            | https://api.topcoder.com/v3/authorizations | API that is used to fetch JWT token v3 |
| TC_CLIENT_ID           | TC_CLIENT_ID            | 6ZwZEUo2ZK4c50aLPpgupeg5v2Ffxp9P           | TC client ID                           |
| TC_CLIENT_V2CONNECTION | CLIENT_V2CONNECTION     | TC-User-Database                           | TC client connection protocol          |

# Publish the package to npm
- Create a npm account on https://www.npmjs.com/signup if you don't have one.
- Use the account to sign in via cli: `npm login`
- In the root directory of the project, run `npm publish --access=public` to publish the package to npm registry.

## Notes
- In rare cases the module name would have been used by others. You may need to change the value of the `name` field in `package.json`
  to a unique one.
- When you make changes to your code and want to update the package you'll need to update the version of the package.
  After that, run `npm publish` again to republish the package.
- If you want to remove the package from npm registry anyway, run `npm unpublish --force` under the root directory of the project.

# Installation

- After you published the package to npm registry you can then install the package via npm-cli:

``` node
npm install -g <your package name here>
```

# Usage

First, install the package, and then run `tc-submission-cli` command on the root directory of your project with `.topcoderrc` file.
It'll then automatically zip all files under the root directory recursively(except the .topcoderrc file itself) and finally upload the zip file to the TC challenge as a submission.

An example `.topcoderrc` file should conform to at least the following structure.

``` jsonr
{
  "challengeIds": [
    "30095545" // at least one item here
  ],
  "username": "TonyJ",
  "password": "appirio123"
}
```

# test

## Prepare
- Install dependencies `npm install`

## Unit test
To run unit tests alone

```bash
npm run test
```

To run unit tests with coverage report

```bash
npm run test:cov
```

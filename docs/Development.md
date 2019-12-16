topcoder-cli
===

# Dependencies
- nodejs https://nodejs.org/en/ (v10)
- npm https://www.npmjs.com/ (v6)

# Configuration
Configuration for the application is at `config/default.js`.
The following parameters can be set in config files or in env variables:

| Property               | Environment varible     | Default value                              | Description                            |
| ---                    | ---                     | ---                                        | ---                                    |
| LOG_LEVEL              | LOG_LEVEL               | info                                       | control log level                      |
| SUBMISSION_API_URL     | TEST_SUBMISSION_API_URL | https://api.topcoder.com/v5    | the TC submission API URL              |
| TC_AUTHN_URL           | TC_AUTHN_URL            | https://topcoder.auth0.com/oauth/ro        | API that is used to fetch JWT token v2 |
| TC_AUTHZ_URL           | TC_AUTHZ_URL            | https://api.topcoder.com/v3/authorizations | API that is used to fetch JWT token v3 |
| TC_CLIENT_ID           | TC_CLIENT_ID            | 6ZwZEUo2ZK4c50aLPpgupeg5v2Ffxp9P           | TC client ID                           |
| TC_CLIENT_V2CONNECTION | CLIENT_V2CONNECTION     | TC-User-Database                           | TC client connection protocol          |
| AUTH0_AUDIENCE         | AUTH0_AUDIENCE          | https://m2m.topcoder.com/                  | AUTH0 Audience (For M2M)               |

# Configuration for Test
Configuration for test is at `test/common/testConfig.js`.
The following parameters can be set in config files or in env variables:

| Property  | Environment varible | Default value | Description                                                                   |
| ---       | ---                 | ---           | ---                                                                           |
| WAIT_TIME | WAIT_TIME           | 500           | Waiting time for the CLI tool to process subcommands. Increase the value if needed |

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

## Installing globally

To install the tool globally so that you can test it's working, run the below command from project root directory.

```
npm install -g .
```

Later on you will be able to run `topcoder` command from any directory

## Unit test

- Install dependencies `npm install`

To run unit tests alone

```bash
npm run test
```

To run unit tests with coverage report

```bash
npm run test:cov
```

topcoder-cli
===

# Installation

- Install the package via npm-cli:

``` node
npm i -g @topcoder/topcoder-cli
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
  "password": "******"
}
```

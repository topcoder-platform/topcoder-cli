/*
 * Setup nock to mock API calls.
 */
const prepare = require('mocha-prepare')
const nock = require('nock')
const _ = require('lodash')
const { URL } = require('url')
const uuid = require('uuid')

const config = require('../src/config')()
const testHelper = require('./common/testHelper')
const testData = require('./common/testData')

const submissionAPIURL = new URL(config.SUBMISSION_API_URL + '/submissions')
const authnAPIURL = new URL(config.TC_AUTHN_URL)
const authzAPIURL = new URL(config.TC_AUTHZ_URL)
const membersAPIURL = new URL(config.TC_MEMBERS_API)
const m2mURL = new URL(config.AUTH0_URL)

const uuidExpr = '\\b[0-9a-f]{8}\\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\\b[0-9a-f]{12}\\b'

prepare(
  function (done) {
    testHelper.spyActions()
    nock(/.com/)
      .persist()
      .filteringPath(path => {
        if (path.includes(submissionAPIURL.pathname)) {
          if (path.includes('/artifacts')) {
            if (path.includes('/download')) {
              if (testData._variables.needErrorResponse) {
                return 'downloadArtifactError'
              }
              return 'downloadArtifact'
            }
            return 'artifacts'
          }
          if (path.includes('legacySubmissionId=')) {
            return 'submissionsWithLegacySubmissionId'
          }
          if (path.includes('memberId=')) {
            return 'submissionsForMember'
          }
          if (path.includes('/download')) {
            if (testData._variables.needErrorResponse) {
              return 'downloadSubmissionError'
            }
            return 'downloadSubmission'
          }
          if (path.match(new RegExp(`submissions/${uuidExpr}$`))) {
            return 'getSubmissionById'
          }
          return 'submissions'
        }
        if (path === authnAPIURL.pathname) {
          return 'authV2'
        }
        if (path === authzAPIURL.pathname) {
          return 'authV3'
        }
        if (_.includes(path, membersAPIURL.pathname)) {
          return 'members'
        }
        if (_.includes(path, m2mURL.pathname)) {
          return 'm2mAuth'
        }
        return path
      })
      .get('downloadSubmissionError')
      .reply(500)
      .get('downloadSubmission')
      .reply(200,
        (uri) => {
          const data = Buffer.from(`This file is the response for request: ${uri}`)
          testData._variables.submissionDownloadInfo.push({ data })
          return data
        }, {
          'Content-Disposition': () => {
            const filename = `test_submission_${uuid()}.txt` // generate unique filename
            _.last(testData._variables.submissionDownloadInfo).filename = filename
            return `attachment; filename=${filename}`
          }
        })
      .get('submissions')
      .reply(200, (uri) => {
        if (uri.includes(testData.challengeIdWithZeroSubmissions)) {
          return []
        }
        return testData.responses.submissionAPI.searchSubmissions
      })
      .get('submissionsWithLegacySubmissionId')
      .reply(200, [testData.responses.submissionAPI.searchSubmissions[1]])
      .get('submissionsForMember')
      .reply(200, [testData.responses.submissionAPI.searchSubmissions[0]])
      .get('getSubmissionById')
      .reply((uri) => {
        if (uri.includes(testData.submissionIdNotInChallenge)) {
          return [200, testData.responses.submissionAPI.searchSubmissions[0]]
        }
        return [200, testData.responses.submissionAPI.searchSubmissions[1]]
      })
      .post('submissions')
      .reply((uri, requestBody) => {
        if (testData._variables.needErrorResponse) {
          return [500, '']
        }
        const multipartData = testHelper.parseMultipart(requestBody)
        testData._variables.uploadedSubmissionInfo.push(multipartData)

        return [200, testData.responses.submissionAPI.OK]
      })
      .get('artifacts')
      .reply(200, (uri) => {
        if (uri.includes(testData.submissionIdWithZeroArtifacts)) {
          return []
        }
        return testData.responses.submissionAPI.searchArtifacts
      })
      .get('downloadArtifactError')
      .reply(500)
      .get('downloadArtifact')
      .reply(200,
        (uri) => {
          const data = Buffer.from(`This file is the response for request: ${uri}`)
          testData._variables.artifactDownloadInfo.push({ data })
          return data
        }, {
          'Content-Disposition': () => {
            const filename = `test_artifact_${uuid()}.txt` // generate unique filename
            _.last(testData._variables.artifactDownloadInfo).filename = filename
            return `attachment; filename=${filename}`
          }
        })
      .post('authV2', _.matches({ username: testData.userCredentials.username }))
      .reply(200, {
        id_token: testData.token.idToken
      })
      .post('authV2')
      .reply(401, {
        error: 'invalid_user_password',
        error_description: 'Wrong email or password.'
      })
      .post('authV3')
      .reply(200, {
        result: {
          content: {
            token: testData.token.admin
          }
        }
      })
      .get('members')
      .reply(200, testData.responses.membersAPI)
      .post('m2mAuth')
      .reply(200, {
        access_token: testData.token.m2m,
        expiry: 8400
      })
    done()
  },
  function (done) {
    done()
  }
)

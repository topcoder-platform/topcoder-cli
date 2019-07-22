/*
 * Setup nock to mock API.
 */
const prepare = require('mocha-prepare')
const nock = require('nock')
const config = require('config')
const _ = require('lodash')
const testData = require('./common/testData')
const { URL } = require('url')

const submissionAPIURL = new URL(config.SUBMISSION_API_URL)
const authnAPIURL = new URL(config.TC_AUTHN_URL)
const authzAPIURL = new URL(config.TC_AUTHZ_URL)
const membersAPIURL = new URL(config.TC_MEMBERS_API)

prepare(function (done) {
  nock(/.com/)
    .persist()
    .filteringPath(path => {
      if (path === submissionAPIURL.pathname) {
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
      return path
    })
    .post('submissions')
    .reply(200, testData.responses.submissionAPI.OK)
    .post('authV2', _.matches({ username: testData.sampleRCObject.username }))
    .reply(200, {
      'id_token': testData.token.idToken
    })
    .post('authV2')
    .reply(401, {
      'error': 'invalid_user_password',
      'error_description': 'Wrong email or password.'
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
  done()
}, function (done) {
  done()
})

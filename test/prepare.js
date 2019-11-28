/*
 * Setup nock to mock API calls.
 */
const prepare = require('mocha-prepare')
const nock = require('nock')
const config = require('config')
const _ = require('lodash')
const testData = require('./common/testData')
const { URL } = require('url')

const submissionAPIURL = new URL(config.SUBMISSION_API_URL + '/submissions')
const authnAPIURL = new URL(config.TC_AUTHN_URL)
const authzAPIURL = new URL(config.TC_AUTHZ_URL)
const membersAPIURL = new URL(config.TC_MEMBERS_API)
const m2mURL = new URL(config.AUTH0_URL)

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
      if (_.includes(path, m2mURL.pathname)) {
        return 'm2mAuth'
      }
      return path
    })
    .post('submissions')
    .reply(200, testData.responses.submissionAPI.OK)
    .post('authV2', _.matches({ username: testData.sampleRCObject.username }))
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
      access_token: 'smellycat',
      expiry: 8400
    })
  done()
}, function (done) {
  done()
})

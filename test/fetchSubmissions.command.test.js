/*
 * Test for the FetchSubmissions command.
 */
const chai = require('chai')
const path = require('path')
const _ = require('lodash')

const logger = require('../src/common/logger')
const testHelper = require('./common/testHelper')
const testData = require('./common/testData')
let { program } = require('../bin/topcoder-cli')

const challengeId = '30095545'
const memberId = 40687077
const latest = true
const submissionId = '4d38573f-404c-4c2f-90b1-a05ccd3fe860'

const localTestData = {
  argsBasic: testHelper.buildArgs('fetch-submissions'),
  argsWithChallengeId: testHelper.buildArgs('fetch-submissions', { ...testData.userCredentials, challengeId }),
  argsWithoutChallengeId: testHelper.buildArgs('fetch-submissions', { ...testData.userCredentials }),
  argsWithoutPassword: testHelper.buildArgs('fetch-submissions', { ..._.pick(testData.userCredentials, ['username']), challengeId }),
  argsWithDev: testHelper.buildArgs('fetch-submissions', { ...testData.userCredentials, challengeId, dev: true }),
  argsWithLatest: testHelper.buildArgs('fetch-submissions', { ...testData.userCredentials, challengeId, latest }),
  argsWithMemberId: testHelper.buildArgs('fetch-submissions', { ...testData.userCredentials, challengeId, memberId }),
  argsWithSubmissionId: testHelper.buildArgs('fetch-submissions', { ...testData.userCredentials, challengeId, submissionId }),
  argsWithSubmissionIdNotInChallenge: testHelper.buildArgs('fetch-submissions', { ...testData.userCredentials, challengeId, submissionId: testData.submissionIdNotInChallenge }),
  argsWithChallengeIdContainingZeroSubmissions: testHelper.buildArgs('fetch-submissions', { ...testData.userCredentials, challengeId: testData.challengeIdWithZeroSubmissions }),
  argsWithBothSubmissionIdAndMemberId: testHelper.buildArgs('fetch-submissions', { ...testData.userCredentials, challengeId, submissionId, memberId }),
  argsWithBothSubmissionIdAndLatest: testHelper.buildArgs('fetch-submissions', { ...testData.userCredentials, challengeId, submissionId, latest }),
  submissionsDownloadDirname: `${challengeId}-submissions`
}

describe('FetchSubmissions Command Test', async function () {
  const mocks = {}
  let messages = []
  let errorMessages = []
  let downloadInfo = []

  // check if submissions are properly downloaded
  const checkDownloadedSubmissions = () => {
    const actual = _.map(downloadInfo, info => ({ filename: path.basename(info.filename), data: info.data.toString() }))
    const expected = _.map(testData._variables.submissionDownloadInfo, info => ({ filename: info.filename, data: info.data.toString() }))
    chai.expect(actual).to.eql(expected)
  }

  beforeEach(async function () {
    const logInfo = logger.info
    mocks.interceptInfo = testHelper.mockFunction(
      logger, 'info', (message) => {
        messages.push(message)
        logInfo(message)
      }
    )
    const logError = logger.error
    mocks.interceptError = testHelper.mockFunction(
      logger, 'error', (message) => {
        errorMessages.push(message)
        logError(message)
      }
    )
    mocks.returnEmptyRC = testHelper.mockRCConfig({})
    mocks.returnEmptyGlobalConfig = testHelper.mockGlobalConfig({})
    mocks.mockDownload = testHelper.mockDownload(downloadInfo)
  })

  afterEach(async function () {
    // the commander instance caches arguments after it parses them, which may break tests.
    // we have to re-import the topcoder-cli module to clean the cache on every test case.
    const newCLI = require('mock-require').reRequire('../bin/topcoder-cli')
    program = newCLI.program
    // restore values
    messages = []
    errorMessages = []
    downloadInfo = []
    // restore to original functions
    for (const mock of Object.values(mocks)) {
      mock.restore()
    }
    // reset NODE_ENV to undefined
    _.unset(process.env, 'NODE_ENV')
    // empty the logs for the downloaded submissions on each test
    testData._variables.submissionDownloadInfo = []
    // restore network state
    testData._variables.needErrorResponse = false
  })

  it('success - fetch submissions to local', async function () {
    program.parse(localTestData.argsWithChallengeId)
    await testHelper.waitForCommandExit()
    chai.expect(testData._variables.submissionDownloadInfo.length).to.equal(
      testData.responses.submissionAPI.searchSubmissions.length
    )
    checkDownloadedSubmissions()
  })

  for (const [credentials, desc] of [
    [testData.m2mConfig, 'm2m'],
    [testData.userCredentials, 'user credentials']
  ]) {
    it(`success - fetch submissions to local with ${desc} from rc file`, async function () {
      mocks.returnEmptyRC.restore()
      mocks.mockRCConfig = testHelper.mockRCConfig({ challengeId, ...credentials })
      program.parse(localTestData.argsBasic)
      await testHelper.waitForCommandExit()
      chai.expect(testData._variables.submissionDownloadInfo.length).to.equal(
        testData.responses.submissionAPI.searchSubmissions.length
      )
      checkDownloadedSubmissions()
    })

    it(`success - fetch submissions to local with ${desc} from global config`, async function () {
      mocks.returnEmptyRC.restore()
      mocks.returnEmptyGlobalConfig.restore()
      mocks.mockRCConfig = testHelper.mockRCConfig({ challengeId })
      mocks.mockGlobalConfig = testHelper.mockGlobalConfig(credentials)
      program.parse(localTestData.argsBasic)
      await testHelper.waitForCommandExit()
      chai.expect(testData._variables.submissionDownloadInfo.length).to.equal(
        testData.responses.submissionAPI.searchSubmissions.length
      )
      checkDownloadedSubmissions()
    })
  }

  it('success - fetch submissions to local with argument dev', async function () {
    program.parse(localTestData.argsWithDev)
    await testHelper.waitForCommandExit()
    chai.expect(process.env.NODE_ENV).to.equal('dev')
    chai.expect(testData._variables.submissionDownloadInfo.length).to.equal(
      testData.responses.submissionAPI.searchSubmissions.length
    )
    checkDownloadedSubmissions()
  })

  it('success - fetch submissions to local with argument latest', async function () {
    program.parse(localTestData.argsWithLatest)
    await testHelper.waitForCommandExit()
    chai.expect(testData._variables.submissionDownloadInfo.length).to.equal(2)
    checkDownloadedSubmissions()
  })

  it('success - fetch submissions to local with argument memberId', async function () {
    program.parse(localTestData.argsWithMemberId)
    await testHelper.waitForCommandExit()
    chai.expect(testData._variables.submissionDownloadInfo.length).to.equal(1)
    checkDownloadedSubmissions()
  })

  it('success - fetch submissions to local with argument submissionId', async function () {
    program.parse(localTestData.argsWithSubmissionId)
    await testHelper.waitForCommandExit()
    chai.expect(testData._variables.submissionDownloadInfo.length).to.equal(1)
    checkDownloadedSubmissions()
  })

  it('success - show info if no submissions found', async function () {
    program.parse(localTestData.argsWithChallengeIdContainingZeroSubmissions)
    await testHelper.waitForCommandExit()
    chai.expect(_.nth(messages, -2)).to.equal(`No submissions exists with specified filters for challenge with ID: ${testData.challengeIdWithZeroSubmissions}.`)
    chai.expect(_.nth(messages, -1)).to.equal('All Done!')
  })

  it('failure - fetch submissions without challengeId', async function () {
    program.parse(localTestData.argsWithoutChallengeId)
    await testHelper.waitForCommandExit()
    chai.expect(_.last(errorMessages)).to.include('"challengeId" is required')
  })

  it('failure - fetch submissions with submissionId not belong to a challenge', async function () {
    program.parse(localTestData.argsWithSubmissionIdNotInChallenge)
    await testHelper.waitForCommandExit()
    chai.expect(_.last(errorMessages)).to.include('Submission doesn\'t belong to specified challenge.')
  })

  it('failure - it should handle possible request errors', async function () {
    testData._variables.needErrorResponse = true // instruct nock server to return 500
    program.parse(localTestData.argsWithSubmissionId)
    await testHelper.waitForCommandExit()
    chai.expect(_.nth(errorMessages, -2)).to.include(`Couldn't download submission with id: ${submissionId}`)
  })

  it('failure - fetch submissions missing password', async function () {
    program.parse(localTestData.argsWithoutPassword)
    await testHelper.waitForCommandExit()
    chai.expect(_.last(errorMessages)).to.include('"username" missing required peer "password"')
  })

  it('failure - fetch submissions missing m2m.client_id', async function () {
    mocks.returnEmptyRC.restore()
    mocks.returnEmptyGlobalConfig.restore()
    mocks.mockRCConfig = testHelper.mockRCConfig({ challengeId })
    mocks.mockGlobalConfig = testHelper.mockGlobalConfig(_.pick(testData.m2mConfig, ['m2m.client_secret']))
    program.parse(localTestData.argsBasic)
    await testHelper.waitForCommandExit()
    chai.expect(_.last(errorMessages)).to.include('m2m.client_id" is required')
  })

  it('failure - fetch submissions missing m2m.client_secret', async function () {
    mocks.returnEmptyRC.restore()
    mocks.returnEmptyGlobalConfig.restore()
    mocks.mockRCConfig = testHelper.mockRCConfig({ challengeId })
    mocks.mockGlobalConfig = testHelper.mockGlobalConfig(_.pick(testData.m2mConfig, ['m2m.client_id']))
    program.parse(localTestData.argsBasic)
    await testHelper.waitForCommandExit()
    chai.expect(_.last(errorMessages)).to.include('m2m.client_secret" is required')
  })

  it('failure - fetch submissions provided both m2m and userCredentials', async function () {
    mocks.returnEmptyRC.restore()
    mocks.mockRCConfig = testHelper.mockRCConfig({ challengeId, ...testData.m2mConfig })
    program.parse(localTestData.argsWithChallengeId)
    await testHelper.waitForCommandExit()
    chai.expect(_.last(errorMessages)).to.include('contains a conflict between exclusive peers [username, m2m]')
  })

  it('failure - fetch submissions provided both submissionId and memberId', async function () {
    program.parse(localTestData.argsWithBothSubmissionIdAndMemberId)
    await testHelper.waitForCommandExit()
    chai.expect(_.last(errorMessages)).to.include('Validation failed: "submissionId" conflict with forbidden peer "memberId"')
  })

  it('failure - fetch submissions provided both submissionId and latest', async function () {
    program.parse(localTestData.argsWithBothSubmissionIdAndLatest)
    await testHelper.waitForCommandExit()
    chai.expect(_.last(errorMessages)).to.include('Validation failed: "submissionId" conflict with forbidden peer "latest"')
  })
})

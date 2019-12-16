/*
 * Test for the Submit command.
 */
const chai = require('chai')
const _ = require('lodash')
const mock = require('mock-require')

const logger = require('../src/common/logger')
const testHelper = require('./common/testHelper')
const testData = require('./common/testData')
let { program } = require('../bin/topcoder-cli')

const challengeIds = '30095545'
const challengeIdNotExist = '123456789'
const memberId = '8547899'
const contentInSubmission = 'empty content'

const uploadedSubmissionInfo = {
  memberId: { headers: {}, body: memberId },
  challengeId: { headers: {}, body: challengeIds },
  type: { headers: {}, body: 'Contest Submission' },
  submission: { headers: { filename: `${memberId}.zip` }, body: contentInSubmission }
}

const localTestData = {
  argsBasic: testHelper.buildArgs('submit'),
  argsWithChallengeIds: testHelper.buildArgs('submit', { ...testData.userCredentials, challengeIds }),
  argsWithoutChallengeId: testHelper.buildArgs('submit', { ...testData.userCredentials }),
  argsWithoutPassword: testHelper.buildArgs('submit', { ..._.pick(testData.userCredentials, 'username'), challengeIds }),
  argsWithDev: testHelper.buildArgs('submit', { ...testData.userCredentials, challengeIds, dev: true }),
  argsWithChallengeIdsNotExist: testHelper.buildArgs('submit', { ...testData.userCredentials, challengeIds: challengeIdNotExist }),
  argsWithOnlyChallengeIds: testHelper.buildArgs('submit', { challengeIds }),
  challengeIdNotExist,
  memberId,
  contentInSubmission,
  uploadedSubmissionInfo
}

describe('Submit Command Test', async function () {
  const mocks = {}
  let messages = []
  let errorMessages = []

  before(async function () {
    // mock the adm-zip module used in UploadSubmission Service
    // so that we don't acutally create zip file from local file system.
    mock('adm-zip', class {
      addLocalFile () {}

      toBuffer () {
        return Buffer.from(localTestData.contentInSubmission)
      }
    })
    mock.reRequire('../src/services/uploadSubmissionService')
    mock.reRequire('../src/commands/submit')
    program = mock.reRequire('../bin/topcoder-cli').program
  })

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
  })

  afterEach(async function () {
    // the commander instance caches arguments after it parses them, which may break tests.
    // we have to re-import the topcoder-cli module to clean the cache on every test case.
    program = mock.reRequire('../bin/topcoder-cli').program
    // reset values
    messages = []
    errorMessages = []
    // restore to original functions
    for (const mock of Object.values(mocks)) {
      mock.restore()
    }
    _.unset(process.env, 'NODE_ENV')
    // restore network state on each test
    testData._variables.needErrorResponse = false
    // restore on each test
    testData._variables.uploadedSubmissionInfo = []
  })

  it('success - upload a submission', async function () {
    program.parse(localTestData.argsWithChallengeIds)
    await testHelper.waitForCommandExit()
    chai.expect(_.nth(messages, -2)).to.include('[1/1] Uploaded Submission:')
    chai.expect(_.last(messages)).to.include('All Done!')
    chai.expect(testData._variables.uploadedSubmissionInfo[0]).to.eql(localTestData.uploadedSubmissionInfo)
  })

  for (const [credentials, desc] of [
    [testData.m2mConfig, 'm2m'],
    [testData.userCredentials, 'user credentials']
  ]) {
    it(`success - upload a submission with ${desc} from rc file`, async function () {
      mocks.returnEmptyRC.restore()
      mocks.mockRCConfig = testHelper.mockRCConfig({ challengeIds: [challengeIds], memberId: localTestData.memberId, ...credentials })
      program.parse(localTestData.argsBasic)
      await testHelper.waitForCommandExit()
      chai.expect(_.nth(messages, -2)).to.include('[1/1] Uploaded Submission:')
      chai.expect(_.last(messages)).to.include('All Done!')
      chai.expect(testData._variables.uploadedSubmissionInfo[0]).to.eql(localTestData.uploadedSubmissionInfo)
    })

    it(`success - upload a submission with ${desc} from global config`, async function () {
      mocks.returnEmptyRC.restore()
      mocks.returnEmptyGlobalConfig.restore()
      mocks.mockRCConfig = testHelper.mockRCConfig({ challengeIds: [challengeIds], memberId: localTestData.memberId })
      mocks.mockGlobalConfig = testHelper.mockGlobalConfig(credentials)
      program.parse(localTestData.argsBasic)
      await testHelper.waitForCommandExit()
      chai.expect(_.nth(messages, -2)).to.include('[1/1] Uploaded Submission:')
      chai.expect(_.last(messages)).to.include('All Done!')
      chai.expect(testData._variables.uploadedSubmissionInfo[0]).to.eql(localTestData.uploadedSubmissionInfo)
    })
  }

  it('success - upload a submission with argument dev', async function () {
    program.parse(localTestData.argsWithDev)
    await testHelper.waitForCommandExit()
    chai.expect(process.env.NODE_ENV).to.equal('dev')
    chai.expect(_.nth(messages, -2)).to.include('[1/1] Uploaded Submission:')
    chai.expect(_.last(messages)).to.include('All Done!')
    chai.expect(testData._variables.uploadedSubmissionInfo[0]).to.eql(localTestData.uploadedSubmissionInfo)
  })

  it('failure - it should handle possible request errors', async function () {
    testData._variables.needErrorResponse = true // instruct nock server to return 500
    program.parse(localTestData.argsWithChallengeIdsNotExist)
    await testHelper.waitForCommandExit()
    chai.expect(_.last(errorMessages)).to.include(`Error while uploading submission to challenge ID ${localTestData.challengeIdNotExist}`)
  })

  it('failure - upload a submission without challengeId', async function () {
    program.parse(localTestData.argsWithoutChallengeId)
    await testHelper.waitForCommandExit()
    chai.expect(_.last(errorMessages)).to.include('"challengeIds" is required')
  })

  it('failure - upload a submission missing password', async function () {
    program.parse(localTestData.argsWithoutPassword)
    await testHelper.waitForCommandExit()
    chai.expect(_.last(errorMessages)).to.include('"username" missing required peer "password"')
  })

  it('failure - upload a submission missing m2m.client_id', async function () {
    mocks.returnEmptyGlobalConfig.restore()
    mocks.mockGlobalConfig = testHelper.mockGlobalConfig(_.pick(testData.m2mConfig, ['m2m.client_secret']))
    program.parse(localTestData.argsWithOnlyChallengeIds)
    await testHelper.waitForCommandExit()
    chai.expect(_.last(errorMessages)).to.include('m2m.client_id" is required')
  })

  it('failure - upload a submission missing m2m.client_secret', async function () {
    mocks.returnEmptyGlobalConfig.restore()
    mocks.mockGlobalConfig = testHelper.mockGlobalConfig(_.pick(testData.m2mConfig, ['m2m.client_id']))
    program.parse(localTestData.argsWithOnlyChallengeIds)
    await testHelper.waitForCommandExit()
    chai.expect(_.last(errorMessages)).to.include('m2m.client_secret" is required')
  })

  it('failure - upload a submission provided m2m config without memberId', async function () {
    mocks.returnEmptyGlobalConfig.restore()
    mocks.mockGlobalConfig = testHelper.mockGlobalConfig(testData.m2mConfig)
    program.parse(localTestData.argsWithOnlyChallengeIds)
    await testHelper.waitForCommandExit()
    chai.expect(_.last(errorMessages)).to.include('Validation failed: "m2m" missing required peer "memberId"')
  })

  it('failure - upload a submission provided both m2m and userCredentials', async function () {
    mocks.returnEmptyRC.restore()
    mocks.mockRCConfig = testHelper.mockRCConfig({ challengeIds: [challengeIds], memberId: localTestData.memberId, ...testData.m2mConfig })
    program.parse(localTestData.argsWithChallengeIds)
    await testHelper.waitForCommandExit()
    chai.expect(_.last(errorMessages)).to.include('contains a conflict between exclusive peers [username, m2m]')
  })
})

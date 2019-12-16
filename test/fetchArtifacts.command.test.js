/*
 * Test for the FetchArtifacts command.
 */
const chai = require('chai')
const delay = require('delay')
const path = require('path')
const _ = require('lodash')

const logger = require('../src/common/logger')
const testHelper = require('./common/testHelper')
const testData = require('./common/testData')
const testConfig = require('./common/testConfig')
let { program } = require('../bin/topcoder-cli')

const submissionId = '4d38573f-404c-4c2f-90b1-a05ccd3fe860'
const legacySubmissionId = '208870'

const localTestData = {
  argsBasic: testHelper.buildArgs('fetch-artifacts'),
  argsWithSubmissionId: testHelper.buildArgs('fetch-artifacts', { ...testData.userCredentials, submissionId }),
  argsWithoutId: testHelper.buildArgs('fetch-artifacts', { ...testData.userCredentials }),
  argsWithoutPassword: testHelper.buildArgs('fetch-artifacts', { ..._.pick(testData.userCredentials, ['username']), submissionId }),
  argsWithDev: testHelper.buildArgs('fetch-artifacts', { ...testData.userCredentials, submissionId, dev: true }),
  argsWithLegacySubmissionId: testHelper.buildArgs('fetch-artifacts', { ...testData.userCredentials, legacySubmissionId }),
  argsWithSubmissionIdContainingZeroArtifacts: testHelper.buildArgs('fetch-artifacts', { ...testData.userCredentials, submissionId: testData.submissionIdWithZeroArtifacts }),
  argsWithBothIds: testHelper.buildArgs('fetch-artifacts', { ...testData.userCredentials, submissionId, legacySubmissionId }),
  artifactsDownloadDirname: `submission-${submissionId}-artifacts`
}

describe('FetchArtifacts Command Test', async function () {
  const mocks = {}
  let messages = []
  let errorMessages = []
  let downloadInfo = []

  // check if submissions are properly downloaded
  const checkDownloadedArtifacts = () => {
    const actual = _.map(downloadInfo, info => ({ filename: path.basename(info.filename), data: info.data.toString() }))
    const expected = _.map(testData._variables.artifactDownloadInfo, info => ({ filename: info.filename, data: info.data.toString() }))
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
    // empty the logs for the filenames of downloaded artifacts on each test
    testData._variables.artifactDownloadInfo = []
    // restore network state
    testData._variables.needErrorResponse = false
    // reset NODE_ENV to undefined
    _.unset(process.env, 'NODE_ENV')
  })

  it('success - fetch artifacts to local', async function () {
    program.parse(localTestData.argsWithSubmissionId)
    await delay(testConfig.WAIT_TIME)
    chai.expect(testData._variables.artifactDownloadInfo.length).to.equal(
      testData.responses.submissionAPI.searchArtifacts.artifacts.length
    )
    checkDownloadedArtifacts()
  })

  for (const [credentials, desc] of [
    [testData.m2mConfig, 'm2m'],
    [testData.userCredentials, 'user credentials']
  ]) {
    it(`success - fetch artifacts to local with ${desc} from rc file`, async function () {
      mocks.returnEmptyRC.restore()
      mocks.mockRCConfig = testHelper.mockRCConfig({ submissionId, ...credentials })
      program.parse(localTestData.argsBasic)
      await delay(testConfig.WAIT_TIME)
      chai.expect(testData._variables.artifactDownloadInfo.length).to.equal(
        testData.responses.submissionAPI.searchArtifacts.artifacts.length
      )
      checkDownloadedArtifacts()
    })

    it(`success - fetch artifacts to local with ${desc} from global config`, async function () {
      mocks.returnEmptyRC.restore()
      mocks.returnEmptyGlobalConfig.restore()
      mocks.mockRCConfig = testHelper.mockRCConfig({ submissionId })
      mocks.mockGlobalConfig = testHelper.mockGlobalConfig(credentials)
      program.parse(localTestData.argsBasic)
      await delay(testConfig.WAIT_TIME)
      chai.expect(testData._variables.artifactDownloadInfo.length).to.equal(
        testData.responses.submissionAPI.searchArtifacts.artifacts.length
      )
      checkDownloadedArtifacts()
    })
  }

  it('success - fetch artifacts to local with argument dev', async function () {
    program.parse(localTestData.argsWithDev)
    await delay(testConfig.WAIT_TIME)
    chai.expect(process.env.NODE_ENV).to.equal('dev')
    chai.expect(testData._variables.artifactDownloadInfo.length).to.equal(
      testData.responses.submissionAPI.searchArtifacts.artifacts.length
    )
    checkDownloadedArtifacts()
  })

  it('success - fetch artifacts to local with argument legacySubmissionId', async function () {
    program.parse(localTestData.argsWithLegacySubmissionId)
    await delay(testConfig.WAIT_TIME)
    chai.expect(testData._variables.artifactDownloadInfo.length).to.equal(
      testData.responses.submissionAPI.searchArtifacts.artifacts.length
    )
    checkDownloadedArtifacts()
  })

  it('success - show info if no artifacts found', async function () {
    program.parse(localTestData.argsWithSubmissionIdContainingZeroArtifacts)
    await delay(testConfig.WAIT_TIME)
    chai.expect(_.nth(messages, -2)).to.equal(`No artifact exists for submission with ID: ${testData.submissionIdWithZeroArtifacts}.`)
    chai.expect(_.nth(messages, -1)).to.equal('All Done!')
  })

  it('failure - fetch artifacts missing password', async function () {
    program.parse(localTestData.argsWithoutPassword)
    await delay(testConfig.WAIT_TIME)
    chai.expect(_.last(errorMessages)).to.include('"username" missing required peer "password"')
  })

  it('failure - fetch artifacts missing m2m.client_id', async function () {
    mocks.returnEmptyRC.restore()
    mocks.returnEmptyGlobalConfig.restore()
    mocks.mockRCConfig = testHelper.mockRCConfig({ submissionId })
    mocks.mockGlobalConfig = testHelper.mockGlobalConfig(_.pick(testData.m2mConfig, ['m2m.client_secret']))
    program.parse(localTestData.argsBasic)
    await delay(testConfig.WAIT_TIME)
    chai.expect(_.last(errorMessages)).to.include('m2m.client_id" is required')
  })

  it('failure - fetch artifacts missing m2m.client_secret', async function () {
    mocks.returnEmptyRC.restore()
    mocks.returnEmptyGlobalConfig.restore()
    mocks.mockRCConfig = testHelper.mockRCConfig({ submissionId })
    mocks.mockGlobalConfig = testHelper.mockGlobalConfig(_.pick(testData.m2mConfig, ['m2m.client_id']))
    program.parse(localTestData.argsBasic)
    await delay(testConfig.WAIT_TIME)
    chai.expect(_.last(errorMessages)).to.include('m2m.client_secret" is required')
  })

  it('failure - fetch artifacts without submissionId or legacySubmissionId', async function () {
    program.parse(localTestData.argsWithoutId)
    await delay(testConfig.WAIT_TIME)
    chai.expect(_.last(errorMessages)).to.include('"value" must contain at least one of [submissionId, legacySubmissionId]')
  })

  it('failure - fetch artifacts provided both submissionId and legacySubmissionId', async function () {
    program.parse(localTestData.argsWithBothIds)
    await delay(testConfig.WAIT_TIME)
    chai.expect(_.last(errorMessages)).to.include('contains a conflict between exclusive peers [submissionId, legacySubmissionId]')
  })

  it('failure - it should handle possible request errors', async function () {
    testData._variables.needErrorResponse = true // instruct nock server to return 500
    program.parse(localTestData.argsWithSubmissionId)
    await delay(testConfig.WAIT_TIME)
    chai.expect(_.nth(errorMessages, 0)).to.include('Couldn\'t download artifact')
  })

  it('failure - fetch artifacts provided both m2m and userCredentials', async function () {
    mocks.returnEmptyRC.restore()
    mocks.mockRCConfig = testHelper.mockRCConfig({ submissionId, ...testData.m2mConfig })
    program.parse(localTestData.argsWithSubmissionId)
    await delay(testConfig.WAIT_TIME)
    chai.expect(_.last(errorMessages)).to.include('contains a conflict between exclusive peers [username, m2m]')
  })
})

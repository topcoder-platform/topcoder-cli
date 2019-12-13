/*
 * Test CLI functionalities.
 */
const delay = require('delay')
const chai = require('chai')
const _ = require('lodash')

const { program, docs } = require('../bin/topcoder-cli')
const testHelper = require('./common/testHelper')
const testConfig = require('./common/testConfig')

const localTestData = {
  argsWithHelp: testHelper.buildArgs(undefined, { help: true }),
  argsForCommandSubmit: testHelper.buildArgs('submit', { help: true }),
  argsForCommandFetchSubmissions: testHelper.buildArgs('fetch-submissions', { help: true }),
  argsForCommandFetchArtifacts: testHelper.buildArgs('fetch-artifacts', { help: true }),
  argsWithUnknownCommand: testHelper.buildArgs('unknown-command')
}

describe('CLI Test', async function () {
  const mocks = {}
  let messages = []
  let errorMessages = []

  before(async function () {
    const logInfo = console.log
    mocks.interceptInfo = testHelper.mockFunction(
      console, 'log', (message) => {
        messages.push(message)
        logInfo(message)
      }
    )
    const logErrorInfo = console.error
    mocks.interceptErrorInfo = testHelper.mockFunction(
      console, 'error', (message) => {
        errorMessages.push(message)
        logErrorInfo(message)
      }
    )
    // we need to stub the process.exit function otherwise the test will be
    // terminated after the program outputs help info.
    mocks.showDocsAndKeepAlive = testHelper.mockFunction(
      process, 'exit', () => {}
    )
  })

  afterEach(async function () {
    messages = []
    errorMessages = []
  })

  after(async function () {
    for (const mock of Object.values(mocks)) {
      mock.restore()
    }
  })

  it('It should show general help info', async function () {
    program.parse(localTestData.argsWithHelp)
    await delay(testConfig.WAIT_TIME)
    chai.expect(_.last(messages)).to.include('Topcoder CLI to interact with Topcoder systems')
  })

  it('It should show help documentation for command submit', async function () {
    program.parse(localTestData.argsForCommandSubmit)
    await delay(testConfig.WAIT_TIME)
    chai.expect(_.last(messages)).to.equal(docs.submit)
  })

  it('It should show help documentation for command fetch-submissions', async function () {
    program.parse(localTestData.argsForCommandFetchSubmissions)
    await delay(testConfig.WAIT_TIME)
    chai.expect(_.last(messages)).to.equal(docs['fetch-submissions'])
  })

  it('It should show help documentation for command fetch-artifacts', async function () {
    program.parse(localTestData.argsForCommandFetchArtifacts)
    await delay(testConfig.WAIT_TIME)
    chai.expect(_.last(messages)).to.equal(docs['fetch-artifacts'])
  })

  it('failure - It should handle unknown commands', async function () {
    program.parse(localTestData.argsWithUnknownCommand)
    await delay(testConfig.WAIT_TIME)
    chai.expect(_.last(errorMessages)).to.include('Invalid command:')
  })
})

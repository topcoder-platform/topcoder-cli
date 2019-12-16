/*
 * Test for the Config command.
 */
const chai = require('chai')
const fs = require('fs-extra')
const _ = require('lodash')
const ini = require('ini')

const testHelper = require('./common/testHelper')
const testData = require('./common/testData')
const logger = require('../src/common/logger')
let { program } = require('../bin/topcoder-cli')

const validConfig = ['username', 'aaron2017']
const invalidConfig = ['rank', 1]

const localTestData = {
  globalConfigWithUserCredentials: ini.stringify(testData.userCredentials),
  argsWithList: testHelper.buildArgs('config', { list: true }),
  argsWithAdd: testHelper.buildArgs('config', { add: validConfig }),
  argsWithAddInvalidKey: testHelper.buildArgs('config', { add: invalidConfig }),
  argsWithExtraValues: testHelper.buildArgs('config', { add: [...validConfig, 'extra arguments here'] }),
  argsWithUnset: testHelper.buildArgs('config', { unset: 'username' }),
  argsWithUnsetNotExistentKey: testHelper.buildArgs('config', { unset: invalidConfig[0] })
}

describe('Config Command Test', async function () {
  const mocks = {}
  let content = []
  let errorMessages = []

  beforeEach(async function () {
    mocks.readFile = testHelper.mockFunction(fs, 'readFile', () => localTestData.globalConfigWithUserCredentials)
    mocks.writeFile = testHelper.mockFunction(fs, 'writeFile', (path, text) => { content.push(text) })
    const logError = logger.error
    mocks.interceptError = testHelper.mockFunction(
      logger, 'error', (message) => {
        errorMessages.push(message)
        logError(message)
      }
    )
  })

  afterEach(async function () {
    // the commander instance caches arguments after it parses them, which may break tests.
    // we have to re-import the topcoder-cli module to clean the cache on every test case.
    const newCLI = require('mock-require').reRequire('../bin/topcoder-cli')
    program = newCLI.program
    // restore functions
    for (const mock of Object.values(mocks)) {
      mock.restore()
    }
    // reset values
    content = []
    errorMessages = []
  })

  it('success - list global config', async function () {
    const messages = []
    const logInfo = console.log
    mocks.interceptInfo = testHelper.mockFunction(
      console, 'log', (message) => {
        messages.push(message)
        logInfo(message)
      }
    )
    program.parse(localTestData.argsWithList)
    await testHelper.waitForCommandExit()
    chai.expect(_.last(messages)).to.equal(localTestData.globalConfigWithUserCredentials)
  })

  it('success - add global config', async function () {
    program.parse(localTestData.argsWithAdd)
    await testHelper.waitForCommandExit()
    chai.expect(content[0]).to.include('username=aaron2017')
  })

  it('success - add global config when config file not found', async function () {
    mocks.readFile.restore()
    mocks.readFile = testHelper.mockFunction(fs, 'readFile', () => { throw new Error() })
    program.parse(localTestData.argsWithAdd)
    await testHelper.waitForCommandExit()
    chai.expect(content[0]).to.include('username=aaron2017')
  })

  it('success - unset global config', async function () {
    program.parse(localTestData.argsWithUnset)
    await testHelper.waitForCommandExit()
    chai.expect(content[0]).to.include('password=xxx123')
    chai.expect(content[0]).to.not.include('username=TonyJ')
  })

  it('failure - add global config with invalid key', async function () {
    program.parse(localTestData.argsWithAddInvalidKey)
    await testHelper.waitForCommandExit()
    chai.expect(_.last(errorMessages)).to.include('Invalid key value.')
  })

  it('failure - add global config with extra values', async function () {
    program.parse(localTestData.argsWithExtraValues)
    await testHelper.waitForCommandExit()
    chai.expect(_.last(errorMessages)).to.include('Invalid number of values passed.')
  })

  it('failure - unset global config with non-existent key', async function () {
    program.parse(localTestData.argsWithUnsetNotExistentKey)
    await testHelper.waitForCommandExit()
    chai.expect(_.last(errorMessages)).to.include(`${invalidConfig[0]} is not found in the config file`)
  })
})

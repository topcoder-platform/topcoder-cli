/*
 * Test for the Pay command.
 */
const chai = require('chai')
const prompts = require('prompts')
const _ = require('lodash')

const logger = require('../src/common/logger')
const testHelper = require('./common/testHelper')
const { program } = require('../bin/topcoder-cli')

const localTestData = {
  injectedResponse: {
    title: 'Topcoder CLI Test Update',
    description: 'Create robust test cases for topcoder-cli',
    payeeUsername: 'aaron2017',
    nda: false,
    copilotPayment: 200
  },
  argsWithoutOption: testHelper.buildArgs('pay'),
  argsWithDev: testHelper.buildArgs('pay', { dev: true }),
  argsWithOptionCopilot: testHelper.buildArgs('pay', { copilot: 'denis' })
}

describe('Pay Command Test', async function () {
  const mocks = {}
  let messages = []

  before(async function () {
    const logInfo = logger.info
    mocks.interceptInfo = testHelper.mockFunction(
      logger, 'info', (message) => {
        messages.push(message)
        logInfo(message)
      }
    )
  })

  after(async function () {
    for (const mock of Object.values(mocks)) {
      mock.restore()
    }
  })

  afterEach(async function () {
    messages = []
    // reset NODE_ENV to undefined
    _.unset(process.env, 'NODE_ENV')
  })

  it('prompts - it should capture user response', async function () {
    prompts.inject(Object.values(localTestData.injectedResponse))
    program.parse(localTestData.argsWithoutOption)
    await testHelper.waitForCommandExit()
    chai.expect(messages[0]).to.eql(localTestData.injectedResponse)
  })

  it('prompts - it should capture user response with argument dev', async function () {
    prompts.inject(Object.values(localTestData.injectedResponse))
    program.parse(localTestData.argsWithDev)
    await testHelper.waitForCommandExit()
    chai.expect(process.env.NODE_ENV).to.equal('dev')
    chai.expect(messages[0]).to.eql(localTestData.injectedResponse)
  })

  it('prompts - it should not ask for copilotPayment if the copilot argument is provided', async function () {
    prompts.inject(Object.values(localTestData.injectedResponse))
    program.parse(localTestData.argsWithOptionCopilot)
    await testHelper.waitForCommandExit()
    chai.expect(messages[0]).to.eql(_.omit(localTestData.injectedResponse, 'copilotPayment'))
  })
})

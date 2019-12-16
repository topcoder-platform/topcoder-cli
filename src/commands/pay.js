const prompts = require('prompts')
const logger = require('../common/logger')

/**
 * Handles the "pay" command
 * @param {Array} args Arguments
 */
async function handleCommand (args) {
  const options = args[0].opts()
  const challengeDetails = [
    {
      type: 'text',
      name: 'title',
      message: 'Task title?'
    },
    {
      type: 'text',
      name: 'description',
      message: 'Task description?'
    },
    {
      type: 'text',
      name: 'payeeUsername',
      message: 'Payee username?'
    },
    {
      type: 'confirm',
      name: 'nda',
      message: 'NDA?'
    }
  ]
  if (!options.copilot) {
    challengeDetails.push({
      type: 'number',
      name: 'copilotPayment',
      message: 'copilot payment?',
      initial: 0.0,
      float: true
    })
  }
  const promptQuestions = async () => {
    const response = await prompts(challengeDetails)
    // respose + options.copilot (copilot payment money) contains total
    // information needed to send request to API.
    logger.info(response)
    // => response => { username, age, about }
  }
  await promptQuestions()
}

module.exports = {
  handleCommand
}

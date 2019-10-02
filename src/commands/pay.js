const prompts = require('prompts')

function handleCommand (args) {
  const options = args[args.length - 1].opts()
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
    console.log(response)
    // => response => { username, age, about }
  }
  promptQuestions()
}

module.exports = {
  handleCommand
}

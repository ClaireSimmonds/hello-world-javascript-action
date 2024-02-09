const core = require('@actions/core')
const github = require('@actions/github')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    // Set up Github client and context
    const client = github.getOctokit(
      core.getInput('repo-token', { required: true })
    )
    const context = github.context

    if (context.payload.pull_request && context.payload.action == 'opened') {
      event_body = getPRSubmittedEvent(context)

      // Output the payload for debugging
      core.info(`The event payload: ${JSON.stringify(event_body)}`)
    }
  } catch (error) {
    // Fail the workflow step if an error occurs
    core.setFailed(error.message)
  }
}

function unixTimestampFromDate(timestring) {
  return Math.floor(new Date(timestring) / 1000)
}

function getPRSubmittedEvent(context) {
  const repo = `${context.payload.organization}/${context.payload.repository}`
  const github_user = `${context.payload.sender.login}`

  const event = {
    alert_type: 'info',
    date_happened: unixTimestampFromDate(
      context.payload.pull_request.created_at
    ),
    priority: 'normal',
    text: `"${context.payload.changed_files} files changed by ${github_user} with ${context.payload.additions} additions and ${context.payload.deletions} deletions."`,
    title: `"%%%[Pull Request #${context.payload.number}](${context.payload.pull_request.url}) opened in ${repo}: ${context.payload.pull_request.title}%%%"`,
    tags: [
      'metric:contributor_activity',
      'event_type:pull_request',
      'action:opened',
      `"draft:${context.payload.pull_request.draft}"`,
      `"repo:${repo}"`,
      `"actor:${github_user}"`
    ]
  }

  return event
}

module.exports = {
  run
}

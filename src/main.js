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
    core.info(`Github context: ${JSON.stringify(context)}`)

    if (context.eventName === 'pull_request') {
      const dd_event = getPRSubmittedEvent(context)

      // Output the generated event for debugging
      core.info('This should print')
      core.info(`DD event: ${JSON.stringify(dd_event)}`)
    }
    else {
      core.info('Are we here then?')
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
  const github_user = context.payload.sender.login
  const repo = context.payload.repository.full_name
  const pull_request = context.payload.pull_request
  const event_body = `${pull_request.changed_files} files changed by ${github_user} with ${pull_request.additions} additions and ${pull_request.deletions} deletions.`
  const event_title = `%%%[Pull Request #${pull_request.number}](${pull_request.url}) opened in ${repo}: ${pull_request.title}%%%`

  return {
    alert_type: 'info',
    date_happened: unixTimestampFromDate(pull_request.created_at),
    priority: 'normal',
    text: event_body,
    title: event_title,
    tags: [
      'metric:contributor_activity',
      'event_type:pull_request',
      'action:opened',
      `draft:${pull_request.draft}`,
      `repo:${repo}`,
      `actor:${github_user}`
    ]
  }
}

module.exports = {
  run
}

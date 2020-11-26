module.exports = { getCommits, getCommitPulls };

async function getCommits(octokit, owner, repo, since) {
  return await octokit.paginate(octokit.repos.listCommits,{
    owner,
    repo,
    since,
    per_page: 100
  });
}

async function getCommitPulls(octokit, owner, repo, commit_sha) {
  return await octokit.repos.listPullRequestsAssociatedWithCommit({
    owner,
    repo,
    commit_sha
  });
}
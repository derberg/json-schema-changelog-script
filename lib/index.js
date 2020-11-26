#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');
const { paginateRest } = require('@octokit/plugin-paginate-rest');
const path = require('path');
const { writeFile } = require('fs').promises;

const { getCommits, getCommitPulls} = require('./api-calls');
const { getHtmlTable, sortResultsByPullNo } = require('./utils');

const OctokitWithPlugin = Octokit.plugin(paginateRest);
const octokit = new OctokitWithPlugin({ auth: process.env.GITHUB_TOKEN});

const org = 'json-schema-org';
const repo = 'json-schema-spec';
const since = '2019-09-01T00:00:01Z';
const milestoneTitle = 'draft-08-patch1 (draft 2020-NN)';
const indexFile = path.join(process.cwd(),'index.html');
const excludedFile = path.join(process.cwd(),'excluded.html');

async function run() {
  try {
    const commits = await getCommits(octokit, org, repo, since);
    const commitsAmount = commits.length;
    const commitsForReview = [];
    const excludedCommits = [];
    let counter = 1;

    /*
    Review of every commit
    */
    for (const commit of commits) {
      const {
        sha, 
        html_url: commitUrl, 
        commit: { 
          message, 
          author: { name: author},
          committer: { date } 
        } 
      } = commit;

      console.info(`Checking commit ${counter} out of ${commitsAmount}`);

      /*
      Getting PRs associated with the commit
      */
      const { data: pulls } = await getCommitPulls(octokit, org, repo, sha);
      const hasPulls = pulls.length;
      let title, pullUrl, pullNo;

      if (hasPulls) {
        pullNo = pulls[0].number;
        pullUrl = pulls[0].html_url;
        title = pulls[0].milestone && pulls[0].milestone.title;
      }

      const returnObject = {
        message,
        author,
        commitUrl,
        date,
        pullUrl,
        pullNo
      };

      /*
      Creating list of commits that need review or not.
      The ones that need review are the ones that:
      - do not have PR
      - have PR with specific milestone only
      */
      if (title === milestoneTitle || !hasPulls) {
        commitsForReview.push(returnObject);
      } else {
        excludedCommits.push(returnObject);
      }
      counter++;
    }

    console.info('\x1b[36m%s\x1b[0m', `${commitsForReview.length} out of ${commitsAmount} commits were written to ${indexFile} file as they require review. The rest of commits are available for review in ${excludedFile} file`);

    /*
    Handling HTML generation to get nice readable results
    */
    const htmlMain = getHtmlTable(sortResultsByPullNo(commitsForReview));
    const htmlDeclined = getHtmlTable(sortResultsByPullNo(excludedCommits));
    await writeFile(excludedFile, htmlDeclined, 'utf8');
    await writeFile(indexFile, htmlMain, 'utf8');
  } catch (error) {
    console.error(error);
  }
}

run();

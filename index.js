const INVALID_LAYOUT = 'Invalid Layout.';

const repoInput = document.getElementById('repo');
const issuesList = document.getElementById('issues');
const issueTemplate = document.getElementById('issue-template');
const contributorsList = document.getElementById('contributors');
const contributorTemplate = document.getElementById('contributor-template');

/**
 * @param {string} baseUrl
 * @returns {Promise<void>}
 */
async function loadIssues(baseUrl) {
  if (
    !(contributorTemplate instanceof HTMLTemplateElement) ||
    !(contributorsList instanceof Element)
  ) throw new Error(INVALID_LAYOUT);
  const contributorsRequest = await fetch(baseUrl + '/contributors');
  const contributors = await contributorsRequest.json();
  // eslint-disable-next-line require-atomic-updates
  contributorsList.textContent = '';
  for (const contributor of contributors) {
    const contributorView = contributorTemplate.content.cloneNode(true);
    if (
      !(contributorView instanceof DocumentFragment)
    ) throw new Error(INVALID_LAYOUT);
    const image = contributorView.querySelector('.contributor-image');
    const name = contributorView.querySelector('.contributor-name');
    const contributions = contributorView.querySelector(
      '.contributor-contributions'
    );
    if (
      !(image instanceof HTMLImageElement) ||
      !(name instanceof Node) ||
      !(contributions instanceof Node)
    ) throw new Error(INVALID_LAYOUT);
    image.src = contributor.avatar_url;
    name.textContent = contributor.login;
    contributions.textContent = contributor.contributions;
    contributorsList.append(contributorView);
  }
}

/**
 * @param {string} baseUrl
 * @returns {Promise<void>}
 */
async function loadContributors(baseUrl) {
  if (
    !(issueTemplate instanceof HTMLTemplateElement) ||
    !(issuesList instanceof Element)) throw new Error(INVALID_LAYOUT);
  const issuesRequest = await fetch(baseUrl + '/issues');
  const issues = await issuesRequest.json();
  // eslint-disable-next-line require-atomic-updates
  issuesList.textContent = '';
  for (const issue of issues) {
    const issueView = issueTemplate.content.cloneNode(true);
    if (
      !(issueView instanceof DocumentFragment)
    ) throw new Error(INVALID_LAYOUT);
    const title = issueView.querySelector('.issue-title');
    const labels = issueView.querySelector('.issue-labels');
    const assignees = issueView.querySelector('.issue-assignees');
    if (
      !(title instanceof Node) ||
      !(labels instanceof Node) ||
      !(assignees instanceof Node)
    ) throw new Error(INVALID_LAYOUT);
    title.textContent = issue.title;
    /** @type {(string | Node)[]} */
    const labelNodes = issue.labels.map(
      (/** @type {unknown} */ label) => {
        if (
          typeof label === 'object' &&
          label !== null &&
          'name' in label &&
          typeof label.name === 'string' &&
          'color' in label &&
          typeof label.color === 'string'
        ) {
          const color = '#' + label.color;
          const node = document.createElement('li');
          node.style.color = color;
          node.style.borderColor = color;
          node.append(label.name);
          return node;
        }
        return '';
      }
    );
    labels.append(...labelNodes);
    assignees.textContent = issue.assignees.map(
      (/** @type {unknown} */ assignee) => typeof assignee === 'object' &&
        assignee !== null &&
        'login' in assignee &&
        typeof assignee.login === 'string'
        ? assignee.login
        : ''
    ).join(', ');
    issuesList.append(issueView);
  }
}

/**
 * @param {string} repo
 * @returns {Promise<void>}
 */
async function loadInfo(repo) {
  const baseUrl = 'https://api.github.com/repos/' + repo;
  await Promise.all([loadIssues(baseUrl), loadContributors(baseUrl)]);
}

document.getElementById('load')?.addEventListener('click', async () => {
  if (repoInput instanceof HTMLInputElement) await loadInfo(repoInput.value);
});

export {};

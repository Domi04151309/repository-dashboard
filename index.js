const INVALID_LAYOUT = 'Invalid Layout.';

const repoInput = document.getElementById('repo');
const issuesList = document.getElementById('issues');
const issueTemplate = document.getElementById('issue-template');
const contributorsList = document.getElementById('contributors');
const contributorTemplate = document.getElementById('contributor-template');
const branchesList = document.getElementById('branches');
const branchTemplate = document.getElementById('branch-template');

/**
 * @param {string} baseUrl
 * @returns {Promise<void>}
 */
async function loadContributors(baseUrl) {
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
async function loadDetailedContributors(baseUrl) {
  if (
    !(contributorTemplate instanceof HTMLTemplateElement) ||
    !(contributorsList instanceof Element)
  ) throw new Error(INVALID_LAYOUT);
  const contributorsRequest = await fetch(baseUrl + '/stats/contributors');
  const contributors = await contributorsRequest.json();
  if (!Array.isArray(contributors)) {
    await loadContributors(baseUrl);
    return;
  }
  contributors.sort(
    (
      /** @type {any} */ first,
      /** @type {any} */ second
    ) => second.total - first.total
  );
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
    const additions = contributorView.querySelector('.contributor-additions');
    const deletions = contributorView.querySelector('.contributor-deletions');
    if (
      !(image instanceof HTMLImageElement) ||
      !(name instanceof Node) ||
      !(contributions instanceof Node) ||
      !(additions instanceof Node) ||
      !(deletions instanceof Node)
    ) throw new Error(INVALID_LAYOUT);
    image.src = contributor.author.avatar_url;
    name.textContent = contributor.author.login;
    contributions.textContent = contributor.weeks.reduce(
      (
        /** @type {number} */ previous,
        /** @type {any} */ current
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      ) => previous + current.c,
      0
    );
    additions.textContent = contributor.weeks.reduce(
      (
        /** @type {number} */ previous,
        /** @type {any} */ current
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      ) => previous + current.a,
      0
    );
    deletions.textContent = contributor.weeks.reduce(
      (
        /** @type {number} */ previous,
        /** @type {any} */ current
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      ) => previous + current.d,
      0
    );
    contributorsList.append(contributorView);
  }
}

/**
 * @param {string} baseUrl
 * @returns {Promise<void>}
 */
async function loadIssues(baseUrl) {
  if (
    !(issueTemplate instanceof HTMLTemplateElement) ||
    !(issuesList instanceof Element)
  ) throw new Error(INVALID_LAYOUT);
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
    const number = issueView.querySelector('.issue-number');
    const user = issueView.querySelector('.issue-user');
    const assignees = issueView.querySelector('.issue-assignees');
    if (
      !(title instanceof Node) ||
      !(labels instanceof Node) ||
      !(number instanceof Node) ||
      !(user instanceof Node) ||
      !(assignees instanceof Node)
    ) throw new Error(INVALID_LAYOUT);
    title.textContent = issue.title;
    /** @type {Node[]} */
    const labelNodes = issue.labels.map(
      (/** @type {any} */ label) => {
        const color = '#' + label.color;
        const node = document.createElement('li');
        node.style.color = color;
        node.style.borderColor = color;
        node.textContent = label.name;
        return node;
      }
    );
    labels.append(...labelNodes);
    number.textContent = issue.number;
    user.textContent = issue.user.login;
    assignees.textContent = issue.assignees.length > 0
      ? issue.assignees.map(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        (/** @type {any} */ assignee) => assignee.login
      ).join(', ')
      : 'nobody';
    issuesList.append(issueView);
  }
}

/**
 * @param {string} baseUrl
 * @param {string} sha
 * @returns {Promise<Node[]>}
 */
async function loadCommits(baseUrl, sha) {
  const commitsRequest = await fetch(
    baseUrl + '/commits?per_page=5&sha=' + sha
  );
  const commits = await commitsRequest.json();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return commits.map((/** @type {any} */ commit) => {
    const listItem = document.createElement('li');
    [listItem.textContent] = commit.commit.message.split('\n');
    return listItem;
  });
}

/**
 * @param {string} baseUrl
 * @returns {Promise<void>}
 */
async function loadBranches(baseUrl) {
  if (
    !(branchTemplate instanceof HTMLTemplateElement) ||
    !(branchesList instanceof Element)
  ) throw new Error(INVALID_LAYOUT);
  const branchesRequest = await fetch(baseUrl + '/branches');
  const branches = await branchesRequest.json();
  // eslint-disable-next-line require-atomic-updates
  branchesList.textContent = '';
  for (const branch of branches) {
    const branchView = branchTemplate.content.cloneNode(true);
    if (
      !(branchView instanceof DocumentFragment)
    ) throw new Error(INVALID_LAYOUT);
    const title = branchView.querySelector('.branch-title');
    const commits = branchView.querySelector('.branch-commits');
    if (
      !(title instanceof Node) ||
      !(commits instanceof Node)
    ) throw new Error(INVALID_LAYOUT);
    // eslint-disable-next-line no-await-in-loop, @typescript-eslint/no-unsafe-argument
    const commitElements = await loadCommits(baseUrl, branch.commit.sha);
    title.textContent = branch.name;
    commits.append(...commitElements);
    branchesList.append(branchView);
  }
}

/**
 * @param {string} repo
 * @returns {Promise<void>}
 */
async function loadInfo(repo) {
  const baseUrl = 'https://api.github.com/repos/' + repo;
  await Promise.all([
    loadIssues(baseUrl),
    loadDetailedContributors(baseUrl),
    loadBranches(baseUrl)
  ]);
}

document.getElementById('load')?.addEventListener('click', async () => {
  if (repoInput instanceof HTMLInputElement) await loadInfo(repoInput.value);
});

export {};

import { INVALID_LAYOUT } from './common.js';
import { getUserLink } from './user-link.js';

const pullsList = document.getElementById('pulls');
const issuesList = document.getElementById('issues');
const issueTemplate = document.getElementById('issue-template');

/**
 * @param {string} baseUrl
 * @param {string} endpoint
 * @param {Element | null} list
 * @param {(item: any) => boolean} filter
 * @returns {Promise<void>}
 */
export async function loadNumbered(baseUrl, endpoint, list, filter) {
  if (
    !(issueTemplate instanceof HTMLTemplateElement) ||
    !(list instanceof Node)
  ) throw new Error(INVALID_LAYOUT);
  const issuesRequest = await fetch(baseUrl + endpoint);
  const issues = await issuesRequest.json();
  // eslint-disable-next-line require-atomic-updates
  list.textContent = '';
  for (const issue of issues.filter(filter)) {
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
      !(title instanceof HTMLAnchorElement) ||
      !(labels instanceof Node) ||
      !(number instanceof Node) ||
      !(user instanceof Node) ||
      !(assignees instanceof Node)
    ) throw new Error(INVALID_LAYOUT);
    title.textContent = issue.title;
    title.href = issue.html_url;
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
    user.append(getUserLink(issue.user));
    if (issue.assignees.length === 0) assignees.textContent = 'nobody';
    else {
      const elements = [];
      for (
        const assignee of issue.assignees
      ) elements.push(getUserLink(assignee), ', ');
      elements.pop();
      assignees.append(...elements);
    }
    list.append(issueView);
  }
}

/**
 * @param {string} baseUrl
 * @returns {Promise<void>}
 */
export async function loadPulls(baseUrl) {
  await loadNumbered(baseUrl, '/pulls', pullsList, () => true);
}

/**
 * @param {string} baseUrl
 * @returns {Promise<void>}
 */
export async function loadIssues(baseUrl) {
  await loadNumbered(
    baseUrl,
    '/issues',
    issuesList,
    item => !('pull_request' in item)
  );
}

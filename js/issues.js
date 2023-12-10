import { INVALID_LAYOUT } from './common.js';

const issuesList = document.getElementById('issues');
const issueTemplate = document.getElementById('issue-template');

/**
 * @param {string} baseUrl
 * @returns {Promise<void>}
 */
export async function loadIssues(baseUrl) {
  if (
    !(issueTemplate instanceof HTMLTemplateElement) ||
    !(issuesList instanceof Node)
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
    const image = issueView.querySelector('.issue-image');
    const user = issueView.querySelector('.issue-user');
    const assignees = issueView.querySelector('.issue-assignees');
    if (
      !(title instanceof Node) ||
      !(labels instanceof Node) ||
      !(number instanceof Node) ||
      !(image instanceof HTMLImageElement) ||
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
    image.src = issue.user.avatar_url;
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

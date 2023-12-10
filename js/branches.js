import { INVALID_LAYOUT } from './common.js';
// @ts-expect-error
import mermaid from 'https://unpkg.com/mermaid@10.6.1/dist/mermaid.esm.min.mjs';

const gitGraph = document.getElementById('git-graph');
const branchesList = document.getElementById('branches');
const branchTemplate = document.getElementById('branch-template');
const commitTemplate = document.getElementById('commit-template');


/**
 * @param {string} baseUrl
 * @param {string} sha
 * @returns {Promise<{ graph: Set<string>, nodes: Node[] }>}
 */
async function loadCommits(baseUrl, sha) {
  if (
    !(commitTemplate instanceof HTMLTemplateElement)
  ) throw new Error(INVALID_LAYOUT);
  const commitsRequest = await fetch(
    baseUrl + '/commits?per_page=5&sha=' + sha
  );
  const commits = await commitsRequest.json();

  const nodes = commits.map((/** @type {any} */ commit) => {
    const commitView = commitTemplate.content.cloneNode(true);
    if (
      !(commitView instanceof DocumentFragment)
    ) throw new Error(INVALID_LAYOUT);
    const image = commitView.querySelector('.commit-image');
    const title = commitView.querySelector('.commit-title');
    const author = commitView.querySelector('.commit-author');
    const date = commitView.querySelector('.commit-date');
    if (
      !(image instanceof HTMLImageElement) ||
      !(title instanceof HTMLAnchorElement) ||
      !(author instanceof HTMLAnchorElement) ||
      !(date instanceof Node)
    ) throw new Error(INVALID_LAYOUT);
    image.src = commit.author.avatar_url;
    [title.textContent] = commit.commit.message.split('\n');
    title.href = commit.html_url;
    author.textContent = commit.author.login;
    author.href = commit.author.html_url;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    date.textContent = new Date(commit.commit.author.date).toLocaleDateString();
    return commitView;
  });

  const vertices = commits.map(
    (
      /** @type {any} */ commit
    ) => commit.sha + '(' + commit.commit.message.split('\n')[0] + ')'
  );
  commits.reverse();
  const edges = commits.map(
    (
      /** @type {any} */ commit,
      /** @type {number} */ index,
      /** @type {any[]} */ array
    ) => index === 0 ? '' :array[index - 1].sha + ' --> ' + commit.sha
  );

  return { graph: new Set([...vertices, ...edges]), nodes };
}

/**
 * @param {string} baseUrl
 * @returns {Promise<void>}
 */
export async function loadBranches(baseUrl) {
  if (
    !(gitGraph instanceof Node) ||
    !(branchTemplate instanceof HTMLTemplateElement) ||
    !(branchesList instanceof Node)
  ) throw new Error(INVALID_LAYOUT);
  const branchesRequest = await fetch(baseUrl + '/branches');
  const branches = await branchesRequest.json();
  // eslint-disable-next-line require-atomic-updates
  branchesList.textContent = '';
  const completeGraph = new Set();
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
    const { graph, nodes } = await loadCommits(baseUrl, branch.commit.sha);
    title.textContent = branch.name;
    commits.append(...nodes);
    branchesList.append(branchView);
    for (const entry of graph) completeGraph.add(entry);
  }
  const { svg } = await mermaid.render(
    'mermaid',
    [
      '%%{init: {\'theme\':\'dark\'}}%%',
      'flowchart LR',
      ...completeGraph
    ].join('\n')
  );
  // eslint-disable-next-line require-atomic-updates
  gitGraph.innerHTML = svg;
}

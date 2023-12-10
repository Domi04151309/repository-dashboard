import { loadBranches } from './js/branches.js';
import { loadContributors } from './js/contributors.js';
import { loadIssues } from './js/issues.js';

const repoInput = document.getElementById('repo');

/**
 * @param {string} repo
 * @returns {Promise<void>}
 */
async function loadInfo(repo) {
  const baseUrl = 'https://api.github.com/repos/' + repo;
  await Promise.all([
    loadIssues(baseUrl),
    loadContributors(baseUrl),
    loadBranches(baseUrl)
  ]);
}

document.getElementById('load')?.addEventListener('click', async () => {
  if (repoInput instanceof HTMLInputElement) await loadInfo(repoInput.value);
});

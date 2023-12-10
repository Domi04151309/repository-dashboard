import { loadBranches } from './branches.js';
import { loadContributors } from './contributors.js';
import { loadIssues } from './issues.js';

const URL_KEY = 'repository';

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

const url = new URL(location.href);
if (url.searchParams.has(URL_KEY)) {
  const value = url.searchParams.get(URL_KEY) ?? '';
  if (repoInput instanceof HTMLInputElement) repoInput.value = value;
  await loadInfo(value);
}

document.getElementById('load')?.addEventListener('click', async () => {
  if (repoInput instanceof HTMLInputElement) {
    const searchUrl = new URL(location.href);
    searchUrl.searchParams.set(URL_KEY, repoInput.value);
    history.pushState({}, '', searchUrl);
    await loadInfo(repoInput.value);
  }
});

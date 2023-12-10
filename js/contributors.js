import { INVALID_LAYOUT } from './common.js';

const contributorsList = document.getElementById('contributors');
const contributorTemplate = document.getElementById('contributor-template');

/**
 * @param {string} baseUrl
 * @returns {Promise<void>}
 */
async function loadSimpleContributors(baseUrl) {
  if (
    !(contributorTemplate instanceof HTMLTemplateElement) ||
    !(contributorsList instanceof Node)
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
export async function loadContributors(baseUrl) {
  if (
    !(contributorTemplate instanceof HTMLTemplateElement) ||
    !(contributorsList instanceof Node)
  ) throw new Error(INVALID_LAYOUT);
  const contributorsRequest = await fetch(baseUrl + '/stats/contributors');
  const contributors = await contributorsRequest.json();
  if (!Array.isArray(contributors)) {
    await loadSimpleContributors(baseUrl);
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

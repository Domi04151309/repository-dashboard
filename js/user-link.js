import { INVALID_LAYOUT } from './common.js';

const userTemplate = document.getElementById('user-template');

/**
 * @param {any} user
 * @returns {Node}
 * @throws {Error}
 */
export function getUserLink(user) {
  if (
    !(userTemplate instanceof HTMLTemplateElement)
  ) throw new Error(INVALID_LAYOUT);
  const userView = userTemplate.content.cloneNode(true);
  if (
    !(userView instanceof DocumentFragment)
  ) throw new Error(INVALID_LAYOUT);
  const image = userView.querySelector('.user-image');
  const name = userView.querySelector('.user-name');
  if (
    !(image instanceof HTMLImageElement) ||
    !(name instanceof HTMLAnchorElement)
  ) throw new Error(INVALID_LAYOUT);
  image.src = user.avatar_url;
  name.textContent = user.login;
  name.href = user.html_url;
  return userView;
}

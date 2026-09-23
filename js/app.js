import { icons } from './icons.js';
import { hydrateIcons } from './utils.js';
import { renderChrome } from './chrome.js';
import { initActions } from './features/actions.js';
import { initCompare } from './features/compare.js';
import { initPalette } from './features/palette.js';
import { initEffects } from './fx/effects.js';

// Inicializa tudo que é comum a todas as páginas
export function initApp() {
  hydrateIcons(document, icons);
  const chrome = renderChrome();
  initActions();
  initCompare();
  initPalette();
  initEffects();
  return chrome;
}

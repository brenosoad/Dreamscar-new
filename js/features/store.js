import { carros } from '../data/carros.js';

// Listas persistidas no navegador (favoritos, comparação, vistos recentemente).
// Cada alteração dispara o evento `dc:<nome>` na window.
const read = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? []; } catch { return []; }
};
const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* armazenamento indisponível */ }
};
const existe = (id) => carros.some((c) => c.id === id);

function createList(nome, { max = Infinity, recentFirst = false } = {}) {
  const key = `dreamcars:${nome}`;
  let ids = read(key).filter(existe);
  const salvar = () => {
    write(key, ids);
    window.dispatchEvent(new CustomEvent(`dc:${nome}`, { detail: [...ids] }));
  };
  return {
    all: () => [...ids],
    has: (id) => ids.includes(id),
    get size() { return ids.length; },
    get max() { return max; },
    add(id) {
      if (ids.includes(id) && !recentFirst) return true;
      ids = ids.filter((x) => x !== id);
      if (recentFirst) ids.unshift(id);
      else if (ids.length >= max) return false;
      else ids.push(id);
      ids = ids.slice(0, max);
      salvar();
      return true;
    },
    remove(id) { ids = ids.filter((x) => x !== id); salvar(); },
    toggle(id) {
      if (ids.includes(id)) { this.remove(id); return false; }
      return this.add(id) ? true : null; // null = limite atingido
    },
    clear() { ids = []; salvar(); },
  };
}

export const favoritos = createList('favoritos');
export const comparacao = createList('comparacao', { max: 3 });
export const recentes = createList('recentes', { max: 8, recentFirst: true });

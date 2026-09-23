import { $, $$, esc, norm, formatBRL } from '../utils.js';
import { icons } from '../icons.js';
import { carros, getCarro } from '../data/carros.js';
import { posts } from '../data/posts.js';
import { href } from '../components.js';
import { recentes } from './store.js';

// Busca global: Ctrl/⌘ + K ou "/" abre. Setas navegam, Enter abre, Esc fecha.
export function initPalette() {
  const paginas = [
    ['Início', 'home', 'venda'],
    ['Catálogo', 'catalogo', 'search'],
    ['Meus favoritos', 'favoritos', 'heart'],
    ['Simular financiamento', 'financiamento', 'financiamento'],
    ['Vender meu carro', 'vender', 'avaliacao'],
    ['Blog', 'blog', 'transito'],
    ['Sobre a Dream Cars', 'sobre', 'users'],
  ].map(([t, k, icon]) => ({ grupo: 'Páginas', t, s: '', url: href(k), icon, busca: norm(t) }));

  const itensCarros = carros.map((c) => ({
    grupo: 'Carros', id: c.id, t: c.nome, s: `${c.ano ?? ''} · ${formatBRL(c.preco)}`, url: href('carro', c.id), icon: 'venda',
    busca: norm(`${c.nome} ${c.marca} ${c.carroceria ?? ''} ${c.combustivel ?? ''} ${c.ano ?? ''}`),
  }));
  const itensPosts = posts.map((p) => ({
    grupo: 'Blog', t: p.titulo, s: p.categoria, url: href('post', p.slug), icon: 'transito', busca: norm(`${p.titulo} ${p.categoria} ${p.resumo}`),
  }));

  const dialog = document.createElement('dialog');
  dialog.className = 'modal palette';
  dialog.setAttribute('aria-label', 'Buscar no site');
  dialog.innerHTML = `
    <div class="palette-input">
      ${icons.search}
      <input type="search" placeholder="Buscar carros, posts e páginas…" aria-label="Buscar" role="combobox" aria-expanded="true" aria-controls="palette-list" autocomplete="off">
      <kbd>Esc</kbd>
    </div>
    <ul id="palette-list" class="palette-list" role="listbox"></ul>
    <p class="palette-foot"><span><kbd>↑</kbd><kbd>↓</kbd> navegar</span><span><kbd>Enter</kbd> abrir</span></p>`;
  document.body.append(dialog);
  const input = $('input', dialog);
  const lista = $('.palette-list', dialog);
  let resultados = [];
  let ativo = 0;

  function buscar(q) {
    const termos = norm(q).split(/\s+/).filter(Boolean);
    if (!termos.length) {
      const vistos = recentes.all().map(getCarro).slice(0, 4).map((c) => ({ ...itensCarros.find((i) => i.id === c.id), grupo: 'Vistos recentemente' }));
      return [...vistos, ...paginas];
    }
    const pontuar = (i) => {
      if (!termos.every((t) => i.busca.includes(t))) return -1;
      const titulo = norm(i.t);
      return titulo.startsWith(termos[0]) ? 0 : titulo.includes(termos[0]) ? 1 : 2;
    };
    return [...paginas, ...itensCarros, ...itensPosts]
      .map((i) => [pontuar(i), i])
      .filter(([s]) => s >= 0)
      .sort((a, b) => a[0] - b[0])
      .slice(0, 12)
      .map(([, i]) => i)
      .sort((a, b) => ['Páginas', 'Carros', 'Blog'].indexOf(a.grupo) - ['Páginas', 'Carros', 'Blog'].indexOf(b.grupo));
  }

  function render() {
    resultados = buscar(input.value);
    ativo = Math.min(ativo, Math.max(0, resultados.length - 1));
    let grupo = '';
    lista.innerHTML = resultados.length
      ? resultados.map((r, i) => {
          const cab = r.grupo !== grupo ? `<li class="palette-group" role="presentation">${esc((grupo = r.grupo))}</li>` : '';
          return `${cab}<li id="pal-${i}" role="option" class="palette-item" aria-selected="${i === ativo}" data-i="${i}">${icons[r.icon]}<span class="palette-text"><strong>${esc(r.t)}</strong>${r.s ? `<small>${esc(r.s)}</small>` : ''}</span>${icons.enter}</li>`;
        }).join('')
      : `<li class="palette-empty">Nada encontrado para “${esc(input.value)}”.</li>`;
    input.setAttribute('aria-activedescendant', resultados.length ? `pal-${ativo}` : '');
    $(`#pal-${ativo}`, lista)?.scrollIntoView({ block: 'nearest' });
  }

  function abrir() {
    if (dialog.open) return;
    input.value = '';
    ativo = 0;
    render();
    dialog.showModal();
    input.focus();
  }
  function ir(i) {
    const r = resultados[i];
    if (!r) return;
    dialog.close();
    location.href = r.url;
  }

  input.addEventListener('input', () => { ativo = 0; render(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); ativo = (ativo + 1) % resultados.length; render(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); ativo = (ativo - 1 + resultados.length) % resultados.length; render(); }
    if (e.key === 'Enter') { e.preventDefault(); ir(ativo); }
  });
  lista.addEventListener('click', (e) => { const li = e.target.closest('[data-i]'); if (li) ir(Number(li.dataset.i)); });
  lista.addEventListener('pointermove', (e) => {
    const li = e.target.closest('[data-i]');
    if (li && Number(li.dataset.i) !== ativo) {
      ativo = Number(li.dataset.i);
      $$('.palette-item', lista).forEach((el) => el.setAttribute('aria-selected', el === li));
    }
  });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

  document.addEventListener('keydown', (e) => {
    const digitando = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !digitando)) {
      e.preventDefault();
      abrir();
    }
  });
  document.addEventListener('click', (e) => { if (e.target.closest('[data-open-search]')) abrir(); });
}

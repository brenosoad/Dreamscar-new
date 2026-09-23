import { $, esc, formatBRL, formatKm } from '../utils.js';
import { icons } from '../icons.js';
import { getCarro } from '../data/carros.js';
import { media, links } from '../components.js';
import { comparacao } from './store.js';

const LINHAS = [
  ['Preço', (c) => c.preco, formatBRL, 'min'],
  ['Ano', (c) => c.ano, String, 'max'],
  ['Quilometragem', (c) => c.km, formatKm, 'min'],
  ['Potência', (c) => parseInt(c.potencia, 10), (v) => `${v} cv`, 'max'],
  ['Carroceria', (c) => c.carroceria],
  ['Combustível', (c) => c.combustivel],
  ['Câmbio', (c) => c.cambio],
  ['Cores', (c) => c.cores],
];

export function initCompare() {
  const dock = document.createElement('div');
  dock.className = 'compare-dock';
  dock.setAttribute('aria-label', 'Carros para comparar');
  document.body.append(dock);

  const dialog = document.createElement('dialog');
  dialog.className = 'modal compare-modal';
  dialog.setAttribute('aria-labelledby', 'compare-title');
  document.body.append(dialog);
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

  function renderDock() {
    const carros = comparacao.all().map(getCarro);
    dock.classList.toggle('is-open', carros.length > 0);
    document.body.classList.toggle('has-dock', carros.length > 0);
    dock.innerHTML = `
      <ul class="dock-items">
        ${carros.map((c) => `<li><span>${esc(c.nome)}</span><button type="button" data-remove="${c.id}" aria-label="Remover ${esc(c.nome)}">${icons.close}</button></li>`).join('')}
        ${Array.from({ length: comparacao.max - carros.length }, () => '<li class="is-empty">Adicione um carro</li>').join('')}
      </ul>
      <div class="dock-actions">
        <button type="button" class="btn btn-outline btn-sm" data-clear>Limpar</button>
        <button type="button" class="btn btn-sm" data-open-compare${carros.length < 2 ? ' disabled' : ''}>Comparar (${carros.length})</button>
      </div>`;
  }

  function renderModal() {
    const carros = comparacao.all().map(getCarro);
    const melhores = LINHAS.map(([, get, , regra]) => {
      if (!regra) return null;
      const vals = carros.map(get).filter((v) => typeof v === 'number' && !Number.isNaN(v));
      return vals.length > 1 ? (regra === 'min' ? Math.min(...vals) : Math.max(...vals)) : null;
    });
    dialog.innerHTML = `
      <div class="modal-head">
        <h2 id="compare-title">Comparar carros</h2>
        <button type="button" class="icon-btn" data-close aria-label="Fechar">${icons.close}</button>
      </div>
      <div class="compare-scroll">
        <table class="compare-table"><colgroup><col class="col-label">${carros.map(() => '<col>').join('')}</colgroup>
          <thead><tr><th scope="col"><span class="sr-only">Especificação</span></th>${carros.map((c) => `
            <th scope="col">
              ${media(c.imagem, c.nome, 'compare-media')}
              <a href="${links.carro(c.id)}">${esc(c.nome)}</a>
            </th>`).join('')}</tr></thead>
          <tbody>
            ${LINHAS.map(([label, get, fmt = String], i) => `
              <tr><th scope="row">${label}</th>${carros.map((c) => {
                const v = get(c);
                const vazio = v == null || Number.isNaN(v);
                const best = !vazio && v === melhores[i];
                return `<td${best ? ' class="is-best"' : ''}>${vazio ? '—' : esc(fmt(v))}${best ? ' <span class="best-tag">melhor</span>' : ''}</td>`;
              }).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  }

  dock.addEventListener('click', (e) => {
    const rm = e.target.closest('[data-remove]');
    if (rm) comparacao.remove(rm.dataset.remove);
    if (e.target.closest('[data-clear]')) comparacao.clear();
    if (e.target.closest('[data-open-compare]')) { renderModal(); dialog.showModal(); }
  });
  dialog.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) dialog.close();
    if (e.target.closest('a')) dialog.close();
  });

  window.addEventListener('dc:comparacao', () => {
    renderDock();
    if (dialog.open) {
      if (comparacao.size < 2) dialog.close();
      else renderModal();
    }
  });
  renderDock();
}

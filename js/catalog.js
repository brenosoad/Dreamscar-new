import { $, esc, formatBRL, norm } from './utils.js';
import { carros } from './data/carros.js';
import { carCard, links } from './components.js';
import { favoritos } from './features/store.js';

const POR_PAGINA = 12;

const FAIXAS = {
  preco: [['', 'Qualquer preço'], ...[100, 150, 200, 300, 500, 1000].map((v) => [v * 1000, `Até ${formatBRL(v * 1000)}`])],
  ano: [['', 'Qualquer ano'], ...[2024, 2022, 2020, 2018, 2015].map((v) => [v, `${v} ou mais novo`])],
  km: [['', 'Qualquer km'], ...[10, 30, 50, 80].map((v) => [v * 1000, `Até ${(v * 1000).toLocaleString('pt-BR')} km`])],
};

const ORDENS = {
  relevancia: ['Destaques', (a, b) => b.destaque - a.destaque],
  'menor-preco': ['Menor preço', (a, b) => a.preco - b.preco],
  'maior-preco': ['Maior preço', (a, b) => b.preco - a.preco],
  'mais-novo': ['Mais novo', (a, b) => (b.ano ?? 0) - (a.ano ?? 0)],
  'menor-km': ['Menor km', (a, b) => (a.km ?? Infinity) - (b.km ?? Infinity)],
};

const CAMPOS = ['q', 'fav', 'marca', 'tipo', 'comb', 'cambio', 'preco', 'ano', 'km'];
const unicos = (campo) => [...new Set(carros.map((c) => c[campo]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
const options = (pares) => pares.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('');

function filtrar(f) {
  const termo = norm(f.q ?? '');
  return carros.filter((c) =>
    (!termo || norm(`${c.nome} ${c.marca}`).includes(termo)) &&
    (!f.fav || favoritos.has(c.id)) &&
    (!f.marca || c.marca === f.marca) &&
    (!f.tipo || c.carroceria === f.tipo) &&
    (!f.comb || c.combustivel === f.comb) &&
    (!f.cambio || c.cambio === f.cambio) &&
    (!f.preco || c.preco <= Number(f.preco)) &&
    (!f.ano || (c.ano ?? 0) >= Number(f.ano)) &&
    (!f.km || (c.km != null && c.km <= Number(f.km))));
}

// getQuery(): URLSearchParams atual · setQuery(params): grava na URL sem recarregar
export function initCatalog(root, { getQuery, setQuery }) {
  const form = $('#filtros-form', root);
  const ordem = $('#ordem', root);
  const lista = $('#catalogo-lista', root);
  const status = $('#catalogo-status', root);
  const paginacao = $('#paginacao', root);
  const painel = $('#filtros', root);
  const contador = $('#filtros-count', root);

  const tudo = (label, campo) => options([['', label], ...unicos(campo).map((v) => [v, v])]);
  form.marca.innerHTML = tudo('Todas as marcas', 'marca');
  form.tipo.innerHTML = tudo('Todas as carrocerias', 'carroceria');
  form.comb.innerHTML = tudo('Qualquer combustível', 'combustivel');
  form.cambio.innerHTML = tudo('Qualquer câmbio', 'cambio');
  form.preco.innerHTML = options(FAIXAS.preco);
  form.ano.innerHTML = options(FAIXAS.ano);
  form.km.innerHTML = options(FAIXAS.km);
  ordem.innerHTML = options(Object.entries(ORDENS).map(([k, [l]]) => [k, l]));

  const q = getQuery();
  CAMPOS.forEach((k) => {
    if (!q.get(k)) return;
    if (k === 'fav') form.fav.checked = q.get(k) === '1';
    else form[k].value = q.get(k);
  });
  ordem.value = ORDENS[q.get('ordem')] ? q.get('ordem') : 'relevancia';
  let pagina = Math.max(1, Number(q.get('p')) || 1);

  // Painel sempre aberto no desktop
  const desktop = matchMedia('(min-width: 960px)');
  const syncPainel = () => { if (desktop.matches) painel.open = true; };
  desktop.addEventListener('change', syncPainel);
  syncPainel();

  function lerFiltros() {
    return Object.fromEntries(CAMPOS.map((k) => [k, k === 'fav' ? (form.fav.checked ? '1' : '') : form[k].value.trim()]).filter(([, v]) => v));
  }

  function render({ rolar = false } = {}) {
    const f = lerFiltros();
    const resultado = filtrar(f).sort(ORDENS[ordem.value][1]);
    const total = Math.max(1, Math.ceil(resultado.length / POR_PAGINA));
    pagina = Math.min(pagina, total);

    const params = new URLSearchParams(f);
    if (ordem.value !== 'relevancia') params.set('ordem', ordem.value);
    if (pagina > 1) params.set('p', pagina);
    setQuery(params);

    const ativos = Object.keys(f).length;
    contador.textContent = ativos ? `(${ativos})` : '';

    if (!resultado.length) {
      status.textContent = 'Nenhum veículo encontrado';
      const soFav = f.fav && Object.keys(f).length === 1;
      lista.innerHTML = soFav
        ? `<div class="catalog-empty"><p>Você ainda não salvou nenhum carro. Toque no coração de um carro para guardá-lo aqui.</p><a class="btn btn-outline btn-sm" href="${links.catalogo}" data-limpar>Ver todos os carros</a></div>`
        : `<div class="catalog-empty"><p>Nenhum carro corresponde aos filtros escolhidos.</p><button type="button" class="btn btn-outline btn-sm" data-limpar>Limpar filtros</button></div>`;
      paginacao.innerHTML = '';
      return;
    }

    const inicio = (pagina - 1) * POR_PAGINA;
    status.textContent = `${resultado.length} ${resultado.length === 1 ? 'veículo encontrado' : 'veículos encontrados'}`;
    lista.innerHTML = resultado.slice(inicio, inicio + POR_PAGINA).map(carCard).join('');
    paginacao.innerHTML = total > 1
      ? Array.from({ length: total }, (_, i) => i + 1)
          .map((n) => `<button type="button" class="page-btn" data-page="${n}"${n === pagina ? ' aria-current="page"' : ''}>${n}</button>`)
          .join('')
      : '';
    if (rolar) lista.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  let timer;
  form.addEventListener('input', (e) => {
    pagina = 1;
    clearTimeout(timer);
    timer = setTimeout(render, e.target.name === 'q' ? 200 : 0);
  });
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('reset', () => { pagina = 1; setTimeout(render); });
  ordem.addEventListener('change', () => { pagina = 1; render(); });
  paginacao.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-page]');
    if (btn) { pagina = Number(btn.dataset.page); render({ rolar: true }); }
  });
  lista.addEventListener('click', (e) => {
    if (e.target.closest('[data-limpar]')) { e.preventDefault(); form.reset(); }
  });
  const aoMudarFavoritos = () => { if (form.fav.checked) render(); };
  window.addEventListener('dc:favoritos', aoMudarFavoritos);

  render();
}

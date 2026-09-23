import { $, $$, esc, formatBRL, formatKm, formatData } from './utils.js';
import { favoritos, comparacao } from './features/store.js';
import { icons } from './icons.js';

// Imagens que falham exibem o ícone de fundo do .media
document.addEventListener('error', (e) => { if (e.target.tagName === 'IMG') e.target.classList.add('is-broken'); }, true);
document.querySelectorAll('img').forEach((img) => { if (img.complete && !img.naturalWidth) img.classList.add('is-broken'); });

export const media = (src, alt, cls = '') =>
  `<div class="media ${cls}">${icons.venda}${src ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy">` : ''}</div>`;

const carMeta = (c) => [c.ano, c.km != null ? formatKm(c.km) : null, c.combustivel, c.cambio].filter(Boolean).join(' · ') || c.marca;

// Links das páginas. O artefato de página única sobrescreve com rotas #/.
export const links = {
  home: 'index.html',
  catalogo: 'catalogo.html',
  favoritos: 'catalogo.html?fav=1',
  vender: 'vender.html',
  blog: 'blog.html',
  sobre: 'sobre.html',
  financiamento: (id) => (id ? `financiamento.html?carro=${id}` : 'financiamento.html'),
  carro: (id) => `carro.html?id=${id}`,
  comprar: (id) => `comprar.html?id=${id}`,
  post: (slug) => `post.html?slug=${slug}`,
};
export const href = (k, ...args) => (typeof links[k] === 'function' ? links[k](...args) : links[k]);

export const carActions = (c) => `
  <div class="card-actions">
    <button type="button" class="card-action" data-fav="${c.id}" aria-pressed="${favoritos.has(c.id)}" aria-label="Favoritar ${esc(c.nome)}">${icons.heart}</button>
    <button type="button" class="card-action" data-compare="${c.id}" aria-pressed="${comparacao.has(c.id)}" aria-label="Comparar ${esc(c.nome)}">${icons.compareIcon}</button>
  </div>`;

export const carCard = (c) => `
  <article class="car-card">
    <a href="${links.carro(c.id)}" class="car-card-link">
      ${media(c.imagem, c.nome, 'car-card-media')}
      <div class="car-card-body">
        <h3>${esc(c.nome)}</h3>
        <p class="car-card-meta">${esc(carMeta(c))}</p>
        <p class="price">${formatBRL(c.preco)}</p>
      </div>
    </a>
    ${carActions(c)}
  </article>`;

export const readingTime = (html) => Math.max(1, Math.ceil(html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length / 180));

export const postMeta = (p) =>
  `<p class="post-meta"><span class="tag">${esc(p.categoria)}</span>${p.data ? `<time datetime="${p.data}">${formatData(p.data)}</time>` : ''}<span>${readingTime(p.conteudo)} min de leitura</span></p>`;

export const postCard = (p, destaque = false) => `
  <article class="post-card${destaque ? ' post-card-featured' : ''}">
    <a href="${links.post(p.slug)}">
      ${media(p.imagem, '', 'post-card-media')}
      <div class="post-card-body">
        ${postMeta(p)}
        <h3>${esc(p.titulo)}</h3>
        <p>${esc(p.resumo)}</p>
      </div>
    </a>
  </article>`;

export const faqList = (itens) =>
  itens.map(({ p, r }) => `<details class="faq-item"><summary>${esc(p)}</summary><p>${esc(r)}</p></details>`).join('');

export const notFound = (titulo, voltarHref, voltarLabel) => `
  <section class="section container empty">
    <h1>${esc(titulo)}</h1>
    <p class="lead">O endereço pode ter mudado ou não existe mais.</p>
    <p><a class="btn" href="${voltarHref}">${esc(voltarLabel)}</a></p>
  </section>`;

// <div data-carousel> com .carousel-track e botões [data-prev]/[data-next].
// No desktop, dá para arrastar com o mouse.
export function initCarousels(root = document) {
  $$('[data-carousel]', root).forEach((el) => {
    const track = $('.carousel-track', el);
    const prev = $('[data-prev]', el);
    const next = $('[data-next]', el);
    const update = () => {
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    };
    prev.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: track.clientWidth, behavior: 'smooth' }));
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();

    let inicioX = 0;
    let inicioScroll = 0;
    let arrastou = false;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('button')) return;
      inicioX = e.clientX;
      inicioScroll = track.scrollLeft;
      arrastou = false;
      const mover = (ev) => {
        const dx = ev.clientX - inicioX;
        if (!arrastou && Math.abs(dx) > 6) {
          arrastou = true;
          track.classList.add('is-dragging');
        }
        if (arrastou) track.scrollLeft = inicioScroll - dx;
      };
      const soltar = () => {
        window.removeEventListener('pointermove', mover);
        track.classList.remove('is-dragging');
        if (arrastou) {
          const card = track.firstElementChild?.getBoundingClientRect().width ?? 1;
          const passo = card + (parseFloat(getComputedStyle(track).columnGap) || 0);
          track.scrollTo({ left: Math.round(track.scrollLeft / passo) * passo, behavior: 'smooth' });
        }
      };
      window.addEventListener('pointermove', mover);
      window.addEventListener('pointerup', soltar, { once: true });
    });
    // Evita abrir o card ao soltar o arraste
    track.addEventListener('click', (e) => {
      if (arrastou) { e.preventDefault(); e.stopPropagation(); arrastou = false; }
    }, true);
    track.addEventListener('dragstart', (e) => e.preventDefault());
  });
}

// Ajusta o font-size para o texto caber em uma linha na largura do elemento.
// Espera um <span> interno; roda de novo quando a fonte carrega e no resize.
export function fitText(el, maxRem = 10.5) {
  const span = el.firstElementChild;
  let ro;
  const fit = () => {
    if (!el.isConnected) { ro?.disconnect(); return; }
    const max = maxRem * parseFloat(getComputedStyle(document.documentElement).fontSize);
    el.style.fontSize = `${max}px`;
    const ratio = el.clientWidth / span.offsetWidth;
    el.style.fontSize = `${Math.min(max, max * ratio * 0.98)}px`;
  };
  fit();
  document.fonts?.ready.then(fit);
  document.fonts?.addEventListener('loadingdone', fit);
  ro = new ResizeObserver(fit);
  ro.observe(el);
  return ro;
}

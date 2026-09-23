import { $, $$ } from '../utils.js';
import { site } from '../config.js';
import { posts } from '../data/posts.js';
import { postCard } from '../components.js';

export function initBlog(root) {
  const [destaque, ...resto] = posts;
  $('#post-destaque', root).innerHTML = postCard(destaque, true);

  const lista = $('#posts-lista', root);
  const filtros = $('#blog-filtros', root);
  const categorias = ['Todos', ...new Set(resto.map((p) => p.categoria))];
  filtros.innerHTML = categorias
    .map((c, i) => `<button type="button" class="chip" aria-pressed="${i === 0}" data-cat="${c}">${c}</button>`)
    .join('');

  const render = (cat) => {
    lista.innerHTML = resto.filter((p) => cat === 'Todos' || p.categoria === cat).map((p) => postCard(p)).join('');
  };
  filtros.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    $$('[data-cat]', filtros).forEach((b) => b.setAttribute('aria-pressed', b === btn));
    render(btn.dataset.cat);
  });
  render('Todos');
  $('#grupo-link', root).href = site.grupoWhatsApp;
}

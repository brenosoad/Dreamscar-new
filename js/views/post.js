import { $, $$, esc, setMeta } from '../utils.js';
import { icons } from '../icons.js';
import { posts } from '../data/posts.js';
import { media, postCard, postMeta, notFound, links } from '../components.js';

const slugify = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Monta a página do post. Retorna uma função de limpeza (remove listeners globais).
export function renderPost(main, slug) {
  const i = posts.findIndex((p) => p.slug === slug);
  const post = posts[i];
  if (!post) {
    setMeta('Post não encontrado');
    main.innerHTML = notFound('Post não encontrado', links.blog, 'Ver todos os posts');
    return () => {};
  }
  setMeta(post.titulo, post.resumo);

  const relacionados = [
    ...posts.filter((p) => p !== post && p.categoria === post.categoria),
    ...posts.filter((p) => p !== post && p.categoria !== post.categoria),
  ].slice(0, 3);
  const shareUrl = location.href;
  const shareText = `${post.titulo} ${shareUrl}`;

  // conteudo é HTML próprio do site (confiável); nunca use com dados de usuário.
  main.innerHTML = `
    <div class="read-progress" aria-hidden="true"><span></span></div>
    <article class="post">
      <header class="post-hero container">
        <a class="back-link" href="${links.blog}">${icons.arrowLeft} Voltar ao blog</a>
        ${postMeta(post)}
        <h1>${esc(post.titulo)}</h1>
        <p class="lead">${esc(post.resumo)}</p>
        ${media(post.imagem, '', 'post-cover')}
      </header>

      <div class="container post-layout">
        <div class="post-body">
          ${post.destaques ? `<ul class="post-stats">${post.destaques.map(([v, l]) => `<li><strong>${esc(v)}</strong><span>${esc(l)}</span></li>`).join('')}</ul>` : ''}
          <div class="prose post-prose">${post.conteudo}</div>
          <div class="post-share">
            <span>Compartilhe</span>
            <a class="icon-btn" href="https://wa.me/?text=${encodeURIComponent(shareText)}" target="_blank" rel="noopener" aria-label="Compartilhar no WhatsApp">${icons.social_whatsapp}</a>
            <a class="icon-btn" href="https://x.com/intent/post?text=${encodeURIComponent(shareText)}" target="_blank" rel="noopener" aria-label="Compartilhar no X">${icons.social_x}</a>
            <button type="button" class="btn btn-outline btn-sm" data-copy>Copiar link</button>
          </div>
        </div>

        <aside class="post-aside">
          <nav class="toc" aria-label="Neste artigo"><p class="toc-title">Neste artigo</p><ol></ol></nav>
          <div class="aside-cta">
            <p class="eyebrow">Dream Cars</p>
            <h2>Procurando seu próximo carro?</h2>
            <p>Seminovos revisados, financiamento em até 60x e seu usado como entrada.</p>
            <a class="btn btn-block" href="${links.catalogo}">Ver o estoque ${icons.arrowRight}</a>
          </div>
        </aside>
      </div>
    </article>

    <section class="section container">
      <div class="section-head"><h2 class="title">Leia também</h2><div class="section-head-actions"><a href="${links.blog}">Ver todos os posts</a></div></div>
      <div class="grid-cards">${relacionados.map((p) => postCard(p)).join('')}</div>
    </section>`;

  // Sumário a partir dos h2
  const titulos = $$('.post-prose h2', main);
  const toc = $('.toc', main);
  if (titulos.length < 3) toc.remove();
  else {
    $('ol', toc).innerHTML = titulos.map((h) => {
      h.id = `sec-${slugify(h.textContent)}`;
      return `<li><a href="#${h.id}" data-target="${h.id}">${esc(h.textContent)}</a></li>`;
    }).join('');
    // Rolagem via JS: não altera a URL (o artefato usa o # para rotas)
    toc.addEventListener('click', (e) => {
      const a = e.target.closest('[data-target]');
      if (!a) return;
      e.preventDefault();
      document.getElementById(a.dataset.target).scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Imagens internas quebradas somem em vez de deixar buraco
  $$('.post-prose img', main).forEach((img) => img.addEventListener('error', () => img.remove()));

  // Copiar link
  const copy = $('[data-copy]', main);
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      copy.textContent = 'Link copiado';
    } catch {
      copy.textContent = 'Não foi possível copiar';
    }
    setTimeout(() => { copy.textContent = 'Copiar link'; }, 2000);
  });

  // Barra de progresso de leitura e seção ativa no sumário
  const barra = $('.read-progress span', main);
  const corpo = $('.post-body', main);
  const tocLinks = $$('.toc a', main);
  const onScroll = () => {
    const r = corpo.getBoundingClientRect();
    const total = r.height - window.innerHeight * 0.6;
    const p = Math.min(1, Math.max(0, -r.top / (total || 1)));
    barra.style.transform = `scaleX(${p})`;
    let ativo = null;
    titulos.forEach((h) => { if (h.getBoundingClientRect().top < 160) ativo = h.id; });
    tocLinks.forEach((a) => a.classList.toggle('is-active', a.dataset.target === ativo));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  return () => window.removeEventListener('scroll', onScroll);
}

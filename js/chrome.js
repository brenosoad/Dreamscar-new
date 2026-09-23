import { site } from './config.js';
import { icons } from './icons.js';
import { $, $$, whatsappLink } from './utils.js';
import { href } from './components.js';

const NAV = [
  ['home', 'Início'],
  ['catalogo', 'Catálogo'],
  ['financiamento', 'Financiamento'],
  ['vender', 'Venda seu carro'],
  ['blog', 'Blog'],
  ['sobre', 'Sobre'],
];
const LOGO = '<span class="logo-main">DREAM</span><span class="logo-sub">CARS</span>';
const telHref = () => `tel:+${site.whatsapp}`;

// Header, footer e botão "voltar ao topo", compartilhados pelo site e pelo artefato
export function renderChrome() {
  const header = $('#site-header');
  header.innerHTML = `
    <div class="container header-inner">
      <a class="logo" href="${href('home')}" aria-label="${site.nome}, início">${LOGO}</a>
      <nav id="menu" class="nav" aria-label="Principal">
        <ul>${NAV.map(([k, l]) => `<li><a href="${href(k)}" data-nav="${k}">${l}</a></li>`).join('')}</ul>
        <a class="header-phone" href="${telHref()}">${site.telefone}</a>
        <a class="btn btn-sm" href="${whatsappLink()}" target="_blank" rel="noopener">Fale conosco ${icons.arrowRight}</a>
      </nav>
      <div class="header-tools">
        <button type="button" class="icon-btn" data-open-search aria-label="Buscar (Ctrl + K)" title="Buscar (Ctrl + K)">${icons.search}</button>
        <a class="icon-btn fav-link" href="${href('favoritos')}" aria-label="Meus favoritos" title="Meus favoritos">${icons.heart}<span class="badge" data-fav-count hidden></span></a>
        <button class="nav-toggle" aria-expanded="false" aria-controls="menu" aria-label="Abrir menu">${icons.menu}</button>
      </div>
    </div>`;

  const toggle = $('.nav-toggle', header);
  const setMenu = (aberto) => {
    header.classList.toggle('is-open', aberto);
    toggle.setAttribute('aria-expanded', aberto);
    toggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    toggle.innerHTML = aberto ? icons.close : icons.menu;
  };
  toggle.addEventListener('click', () => setMenu(!header.classList.contains('is-open')));

  const col = (titulo, itens) => `
    <div>
      <h2 class="footer-title">${titulo}</h2>
      <ul class="footer-links">${itens.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join('')}</ul>
    </div>`;
  const redes = [
    ['instagram', 'Instagram', site.redes.instagram],
    ['facebook', 'Facebook', site.redes.facebook],
    ['x', 'X', site.redes.x],
    ['whatsapp', 'WhatsApp', whatsappLink()],
  ];
  $('#site-footer').innerHTML = `
    <div class="container footer-grid">
      <div>
        <a class="logo" href="${href('home')}" aria-label="${site.nome}, início">${LOGO}</a>
        <p class="footer-muted">Compra, venda e financiamento de veículos com transparência.</p>
      </div>
      ${col('Empresa', [[href('sobre'), 'Sobre nós'], [href('blog'), 'Blog']])}
      ${col('Serviços', [[href('catalogo'), 'Catálogo'], [href('financiamento'), 'Financiamento'], [href('vender'), 'Venda seu carro']])}
      ${col('Contato', [[telHref(), site.telefone], [`mailto:${site.email}`, site.email]])}
      <div>
        <h2 class="footer-title">Redes sociais</h2>
        <ul class="social">
          ${redes.map(([k, nome, url]) => `<li><a href="${url}" target="_blank" rel="noopener" aria-label="${nome}">${icons['social_' + k]}</a></li>`).join('')}
        </ul>
      </div>
    </div>
    <div class="container footer-bottom">
      <p>© ${new Date().getFullYear()} ${site.nome}. Todos os direitos reservados.</p>
      <p class="credit">Desenvolvido por <a href="https://www.creativecodex.com.br" target="_blank" rel="noopener">creativecodex.studio</a> <span aria-hidden="true">·</span> <a href="tel:+5516997837454">(16) 99783-7454</a> <span aria-hidden="true">·</span> <a href="https://www.creativecodex.com.br" target="_blank" rel="noopener">www.creativecodex.com.br</a></p>
    </div>`;

  const topo = document.createElement('button');
  topo.className = 'back-to-top';
  topo.setAttribute('aria-label', 'Voltar ao topo');
  topo.innerHTML = icons.arrowUp;
  topo.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.append(topo);
  const atualizarTopo = () => topo.classList.toggle('is-visible', window.scrollY > 400);
  window.addEventListener('scroll', atualizarTopo, { passive: true });

  return {
    setActive(key) {
      $$('[data-nav]', header).forEach((a) => (a.dataset.nav === key ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    },
    closeMenu: () => setMenu(false),
    refresh: atualizarTopo,
  };
}

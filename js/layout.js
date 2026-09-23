import { initApp } from './app.js';

const PAGINA = {
  'index.html': 'home', 'catalogo.html': 'catalogo', 'carro.html': 'catalogo', 'comprar.html': 'catalogo',
  'financiamento.html': 'financiamento', 'vender.html': 'vender', 'blog.html': 'blog', 'post.html': 'blog', 'sobre.html': 'sobre',
};

const chrome = initApp();
chrome.setActive(PAGINA[location.pathname.split('/').pop() || 'index.html']);

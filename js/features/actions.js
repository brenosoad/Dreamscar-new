import { $$ } from '../utils.js';
import { getCarro } from '../data/carros.js';
import { href } from '../components.js';
import { favoritos, comparacao } from './store.js';
import { toast } from './toast.js';

// Sincroniza o estado visual de todos os botões [data-fav] e [data-compare] da página
export function paintActions(root = document) {
  $$('[data-fav]', root).forEach((b) => b.setAttribute('aria-pressed', favoritos.has(b.dataset.fav)));
  $$('[data-compare]', root).forEach((b) => b.setAttribute('aria-pressed', comparacao.has(b.dataset.compare)));
  $$('[data-fav-count]').forEach((el) => {
    el.textContent = favoritos.size || '';
    el.hidden = !favoritos.size;
  });
}

export function initActions() {
  // Delegação: funciona para qualquer card renderizado depois
  document.addEventListener('click', (e) => {
    const fav = e.target.closest('[data-fav]');
    const cmp = e.target.closest('[data-compare]');
    if (!fav && !cmp) return;
    e.preventDefault();
    e.stopPropagation();

    if (fav) {
      const carro = getCarro(fav.dataset.fav);
      const ativo = favoritos.toggle(carro.id);
      fav.classList.remove('is-pop');
      void fav.offsetWidth; // reinicia a animação
      if (ativo) fav.classList.add('is-pop');
      toast(ativo ? `${carro.nome} salvo nos favoritos` : `${carro.nome} removido dos favoritos`, ativo ? { label: 'Ver favoritos', href: href('favoritos') } : null);
    }

    if (cmp) {
      const carro = getCarro(cmp.dataset.compare);
      const r = comparacao.toggle(carro.id);
      if (r === null) toast(`Você pode comparar até ${comparacao.max} carros`);
    }
  });

  window.addEventListener('dc:favoritos', () => paintActions());
  window.addEventListener('dc:comparacao', () => paintActions());
  paintActions();
}

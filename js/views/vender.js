import { $ } from '../utils.js';
import { carros } from '../data/carros.js';
import { faqList } from '../components.js';
import { initWhatsappForms } from '../forms.js';

const FAQ_VENDA = [
  { p: 'Quanto tempo leva a avaliação?', r: 'Cerca de 30 minutos. Você acompanha a vistoria e sai com a proposta por escrito.' },
  { p: 'Vocês compram carro financiado?', r: 'Sim. Quitamos o saldo com o banco, cuidamos da baixa do gravame e pagamos a diferença para você.' },
  { p: 'Como é definido o valor?', r: 'Partimos da Tabela Fipe e ajustamos pelo estado de conservação, quilometragem, histórico e procura pelo modelo.' },
  { p: 'Compram carro com multas ou IPVA atrasado?', r: 'Sim. Os débitos são descontados do valor da proposta e quitados por nós na transferência.' },
  { p: 'A avaliação tem algum custo?', r: 'Não. A avaliação é gratuita e sem compromisso de venda.' },
];

export function initVender(root) {
  $('#marcas', root).innerHTML = [...new Set(carros.map((c) => c.marca))].sort().map((m) => `<option value="${m}">`).join('');
  $('#v-ano', root).max = new Date().getFullYear() + 1;
  $('#vender-faq', root).innerHTML = faqList(FAQ_VENDA);
  root.querySelectorAll('[data-scroll]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const alvo = root.querySelector(`#${btn.dataset.scroll}`);
      alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
      alvo.querySelector('input')?.focus({ preventScroll: true });
    }));
  initWhatsappForms(root);
}

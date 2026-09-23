import { $ } from '../utils.js';
import { icons } from '../icons.js';
import { carros } from '../data/carros.js';
import { posts } from '../data/posts.js';
import { carCard, postCard, initCarousels, fitText } from '../components.js';
import { initWhatsappForms } from '../forms.js';

const MOTIVOS = [
  { icone: 'shield', titulo: 'Garantia de 1 ano', resumo: 'Proteção no motor em todos os carros vendidos.', texto: 'Cada veículo passa por inspeção rigorosa antes da venda. Se surgir algum problema mecânico no motor durante o primeiro ano, a gente resolve.' },
  { icone: 'history', titulo: 'Histórico completo', resumo: 'Procedência e manutenção documentadas.', texto: 'Você recebe o histórico do veículo com procedência, revisões e documentação regularizada: IPVA pago e sem multas.' },
  { icone: 'financiamento', titulo: 'Financiamento facilitado', resumo: 'Até 60x, com taxas a partir de 1,5% ao mês.', texto: 'Parcelamento com ou sem entrada, financiamento bancário ou consórcio. Simule online e receba uma proposta pelo WhatsApp.' },
  { icone: 'avaliacao', titulo: 'Avaliação gratuita', resumo: 'Use seu usado como parte do pagamento.', texto: 'Avaliamos seu carro sem compromisso, com uma estimativa justa e transparente para a troca ou a venda.' },
];

export function initHome(root) {
  $('#destaques-lista', root).innerHTML = carros.filter((c) => c.destaque).map(carCard).join('');
  $('#posts-lista', root).innerHTML = posts.map((p) => postCard(p)).join('');
  $('#porque-lista', root).innerHTML = MOTIVOS.map((m) => `
    <details class="why-item">
      <summary>
        <span class="why-icon">${icons[m.icone]}</span>
        <span class="why-text"><strong>${m.titulo}</strong><span>${m.resumo}</span></span>
        ${icons.plus}
      </summary>
      <p>${m.texto}</p>
    </details>`).join('');
  $('#c-ano', root).max = new Date().getFullYear() + 1;
  fitText($('.hero-wordmark', root));
  initCarousels(root);
  initWhatsappForms(root);
}

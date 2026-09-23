import { $, formatBRL } from '../utils.js';
import { site } from '../config.js';
import { carros, getCarro } from '../data/carros.js';
import { faqList } from '../components.js';
import { initWhatsappForms } from '../forms.js';
import { tween } from '../fx/counter.js';

const FAQ_FIN = [
  { p: 'Posso financiar sem entrada?', r: 'Sim, dependendo da análise de crédito. Com entrada, a taxa e a parcela costumam ser menores.' },
  { p: 'Quanto tempo leva a aprovação?', r: 'Enviamos a proposta a vários bancos e retornamos em até 24 horas úteis.' },
  { p: 'Posso usar meu carro como entrada?', r: 'Sim. Avaliamos seu usado na hora e o valor abate direto do financiamento, mesmo que ele ainda esteja financiado.' },
  { p: 'Vocês financiam carros usados?', r: 'Sim, todos os carros do nosso estoque podem ser financiados.' },
  { p: 'Posso quitar antes do prazo?', r: 'Sim. A antecipação de parcelas tem desconto proporcional dos juros, conforme o Código de Defesa do Consumidor.' },
];

// Tabela Price: PMT = PV · i / (1 − (1 + i)^−n)
const pmt = (pv, n, i) => (pv > 0 ? (pv * i) / (1 - (1 + i) ** -n) : 0);

export function initFinanciamento(root, carroId) {
  const { taxaMensal, prazos } = site.financiamento;
  const taxaTxt = `${(taxaMensal * 100).toLocaleString('pt-BR')}% ao mês`;
  const carroSel = $('#sim-carro', root);
  const valor = $('#sim-valor', root);
  const entrada = $('#sim-entrada', root);
  const entradaOut = $('#sim-entrada-out', root);
  const prazosEl = $('#sim-prazos', root);
  const bar = $('#sim-bar', root);
  let prazo = prazos.at(-1);

  carros
    .slice()
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    .forEach((c) => carroSel.add(new Option(`${c.nome} (${formatBRL(c.preco)})`, c.id)));
  prazosEl.innerHTML = prazos
    .map((p) => `<label><input type="radio" name="sim-prazo" value="${p}"${p === prazo ? ' checked' : ''}><span>${p}x</span></label>`)
    .join('');
  $('#sim-taxa', root).textContent = taxaTxt;

  const inicial = getCarro(carroId);
  if (inicial) { carroSel.value = inicial.id; valor.value = inicial.preco; }

  function calcular(n = prazo) {
    const preco = Math.max(Number(valor.value) || 0, 0);
    const ent = Math.round((preco * Number(entrada.value)) / 100);
    const fin = preco - ent;
    const parcela = pmt(fin, n, taxaMensal);
    return { preco, ent, fin, n, parcela, total: ent + parcela * n, juros: parcela * n - fin };
  }

  let atual;
  let parcelaAnterior = 0;
  function render() {
    atual = calcular();
    const { preco, ent, fin, n, parcela, total, juros } = atual;
    entradaOut.textContent = `${formatBRL(ent)} (${entrada.value}%)`;
    tween($('#sim-parcela', root), parcelaAnterior, parcela, (v) => `${n}x de ${formatBRL(v)}`, 450);
    parcelaAnterior = parcela;
    const soma = total || 1;
    bar.children[0].style.flexGrow = ent / soma;
    bar.children[1].style.flexGrow = fin / soma;
    bar.children[2].style.flexGrow = juros / soma;
    $('#sim-resumo', root).innerHTML = [
      ['Valor do carro', preco], ['Entrada', ent], ['Valor financiado', fin], ['Total de juros', juros], ['Total a prazo', total],
    ].map(([k, v]) => `<div><dt>${k}</dt><dd>${formatBRL(v)}</dd></div>`).join('');
    $('#sim-tabela', root).innerHTML = prazos.map((p) => {
      const s = calcular(p);
      return `<tr${p === n ? ' class="is-current"' : ''}><td>${p} meses</td><td>${formatBRL(s.parcela)}</td><td>${formatBRL(s.total)}</td></tr>`;
    }).join('');
  }

  carroSel.addEventListener('change', () => {
    const c = getCarro(carroSel.value);
    if (c) valor.value = c.preco;
    render();
  });
  valor.addEventListener('input', () => {
    const c = getCarro(carroSel.value);
    if (c && Number(valor.value) !== c.preco) carroSel.value = '';
    render();
  });
  entrada.addEventListener('input', render);
  prazosEl.addEventListener('change', (e) => { prazo = Number(e.target.value); render(); });
  render();

  initWhatsappForms(root, () => {
    const c = getCarro(carroSel.value);
    return [
      '',
      `Carro: ${c ? c.nome : 'outro valor'} (${formatBRL(atual.preco)})`,
      `Entrada: ${formatBRL(atual.ent)} (${entrada.value}%)`,
      `Simulação: ${atual.n}x de ${formatBRL(atual.parcela)} (taxa de ${taxaTxt})`,
    ];
  });

  $('#faq-lista', root).innerHTML = faqList(FAQ_FIN);
}

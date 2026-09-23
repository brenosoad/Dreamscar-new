import { prefersReducedMotion } from '../utils.js';

const ease = (t) => 1 - (1 - t) ** 3;

// Anima um número de `de` até `para`, escrevendo o texto formatado a cada quadro.
export function tween(el, de, para, formatar, dur = 600) {
  cancelAnimationFrame(el._tween);
  if (prefersReducedMotion() || de === para) { el.textContent = formatar(para); return; }
  const inicio = performance.now();
  const passo = (agora) => {
    const t = Math.min(1, (agora - inicio) / dur);
    el.textContent = formatar(de + (para - de) * ease(t));
    if (t < 1) el._tween = requestAnimationFrame(passo);
  };
  el._tween = requestAnimationFrame(passo);
}

// Lê textos como "+1.200", "1,5%", "até 8%", "12,5 mi" e faz a contagem a partir de zero.
// Anos (ex.: 2020) ficam como estão.
export function countUp(el) {
  const m = el.textContent.trim().match(/^(\D*?)(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d+))?(.*)$/);
  if (!m) return;
  const [, pre, inteiro, dec = '', pos] = m;
  const valor = parseFloat(`${inteiro.replace(/\./g, '')}.${dec || 0}`);
  if (!dec && valor >= 1900 && valor <= 2100 && !inteiro.includes('.')) return;
  const casas = dec.length;
  const fmt = (v) => `${pre}${v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })}${pos}`;
  el.style.minWidth = `${el.offsetWidth}px`;
  tween(el, 0, valor, fmt, 1400);
}

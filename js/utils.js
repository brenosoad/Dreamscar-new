import { site } from './config.js';

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
export const formatBRL = (valor) => brl.format(valor);
const dataFmt = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
export const formatData = (iso) => dataFmt.format(new Date(`${iso}T12:00:00`));
export const formatKm = (km) => `${km.toLocaleString('pt-BR')} km`;

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (str = '') => String(str).replace(/[&<>"']/g, (c) => ESC[c]);

export const param = (nome) => new URLSearchParams(location.search).get(nome);

export const whatsappLink = (texto = '') =>
  `https://wa.me/${site.whatsapp}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`;

export function setMeta(titulo, descricao) {
  document.title = titulo ? `${titulo} | ${site.nome}` : site.nome;
  if (descricao) $('meta[name="description"]')?.setAttribute('content', descricao);
}

export const norm = (s = '') => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

// <svg data-icon="nome"> no HTML vira o ícone correspondente
export function hydrateIcons(root, icons) {
  root.querySelectorAll('svg[data-icon]').forEach((el) => { el.outerHTML = icons[el.dataset.icon] ?? ''; });
}

import { $, whatsappLink } from '../utils.js';
import { icons } from '../icons.js';
import { site } from '../config.js';
import { servicos } from '../data/servicos.js';

export function initSobre(root) {
  $('#servicos-lista', root).innerHTML = servicos
    .map((s) => `<li class="service">${icons[s.icone]}<h3>${s.titulo}</h3><p>${s.texto}</p></li>`)
    .join('');
  root.querySelectorAll('[data-config]').forEach((el) => { el.textContent = site[el.dataset.config]; });
  root.querySelectorAll('[data-whatsapp-link]').forEach((a) => { a.href = whatsappLink('Olá! Gostaria de agendar uma visita ao showroom.'); });
}

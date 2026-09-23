import { $, esc, formatBRL, setMeta } from '../utils.js';
import { getCarro } from '../data/carros.js';
import { notFound, media, links } from '../components.js';
import { initWhatsappForms } from '../forms.js';

export function renderComprar(main, id, template) {
  const carro = getCarro(id);
  if (!carro) {
    setMeta('Veículo não encontrado');
    main.innerHTML = notFound('Veículo não encontrado', links.catalogo, 'Ver catálogo');
    return;
  }
  setMeta(`Comprar ${carro.nome}`);
  if (template) main.innerHTML = template;
  $('#resumo', main).innerHTML = `
    ${media(carro.imagem, carro.nome, 'buy-media')}
    <div>
      <p class="eyebrow">${esc(carro.marca)}</p>
      <h1>${esc(carro.nome)}</h1>
      <p class="price price-lg">${formatBRL(carro.preco)}</p>
      <a href="${links.carro(carro.id)}">Ver detalhes do veículo</a>
    </div>`;
  const cores = carro.cores?.split(/,\s*|\s+e\s+/) ?? ['Preto', 'Branco', 'Vermelho', 'Azul', 'Verde'];
  cores.forEach((c) => {
    const cor = c[0].toUpperCase() + c.slice(1);
    $('#cor', main).add(new Option(cor, cor));
  });
  $('#form-compra', main).dataset.whatsapp = `Interesse em comprar: ${carro.nome} (${formatBRL(carro.preco)})`;
  initWhatsappForms(main);
}

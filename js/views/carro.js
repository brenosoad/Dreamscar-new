import { $, esc, formatBRL, formatKm, setMeta } from '../utils.js';
import { icons } from '../icons.js';
import { getCarro } from '../data/carros.js';
import { faqList, notFound, media, carCard, links } from '../components.js';
import { favoritos, comparacao, recentes } from '../features/store.js';

// `embedVideo`: o site incorpora o YouTube; o artefato só mostra o link.
export function renderCarro(main, id, { embedVideo = true } = {}) {
  const carro = getCarro(id);
  if (!carro) {
    setMeta('Veículo não encontrado');
    main.innerHTML = notFound('Veículo não encontrado', links.catalogo, 'Ver catálogo');
    return;
  }
  setMeta(carro.nome, carro.descricao);
  const vistos = recentes.all().filter((x) => x !== carro.id).map(getCarro).slice(0, 4);
  recentes.add(carro.id);

  const specs = [
    ['Marca', carro.marca], ['Ano', carro.ano], ['Quilometragem', carro.km != null ? formatKm(carro.km) : null],
    ['Carroceria', carro.carroceria], ['Cores disponíveis', carro.cores], ['Combustível', carro.combustivel],
    ['Câmbio', carro.cambio], ['Potência', carro.potencia], ['Direção', carro.direcao], ['Documentação', carro.documentacao],
  ].filter(([, v]) => v != null);

  const yt = carro.video?.youtube;
  const videoUrl = yt ? `https://www.youtube.com/watch?v=${yt}` : carro.video?.link;
  const video = yt && embedVideo
    ? `<section class="container section"><h2 class="title">Vídeo</h2><div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${esc(yt)}" title="Vídeo do ${esc(carro.nome)}" loading="lazy" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe></div></section>`
    : '';

  main.innerHTML = `
    <section class="container car-hero">
      ${media(carro.imagem, carro.nome, 'car-hero-media')}
      <div class="car-hero-info">
        <p class="eyebrow">${esc(carro.marca)}${carro.ano ? ` · ${carro.ano}` : ''}${carro.carroceria ? ` · ${esc(carro.carroceria)}` : ''}</p>
        <h1>${esc(carro.nome)}</h1>
        ${carro.subtitulo ? `<p class="lead">${esc(carro.subtitulo)}</p>` : ''}
        <p class="price price-lg">${formatBRL(carro.preco)}</p>
        <div class="actions">
          <a class="btn" href="${links.comprar(carro.id)}">Tenho interesse</a>
          <a class="btn btn-outline" href="${links.financiamento(carro.id)}">Simular financiamento</a>
        </div>
        <div class="car-tools">
          <button type="button" class="tool-btn" data-fav="${carro.id}" aria-pressed="${favoritos.has(carro.id)}">${icons.heart}<span>Favoritar</span></button>
          <button type="button" class="tool-btn" data-compare="${carro.id}" aria-pressed="${comparacao.has(carro.id)}">${icons.compareIcon}<span>Comparar</span></button>
          ${videoUrl && !(yt && embedVideo) ? `<a class="tool-btn" href="${esc(videoUrl)}" target="_blank" rel="noopener">${icons.camera}<span>Ver vídeo</span></a>` : ''}
        </div>
      </div>
    </section>

    <section class="container section grid-2">
      <div class="prose">
        <h2>Descrição</h2>
        <p>${esc(carro.descricaoLonga ?? carro.descricao)}</p>
        ${carro.historia ? `<h2>História do ${esc(carro.nome)}</h2>${carro.historia.map((p) => `<p>${esc(p)}</p>`).join('')}` : ''}
      </div>
      <div>
        <h2>Ficha técnica</h2>
        <dl class="specs">${specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      </div>
    </section>

    ${video}

    ${carro.faq ? `
    <section class="container section narrow">
      <h2 class="title">Perguntas frequentes</h2>
      ${faqList(carro.faq)}
    </section>` : ''}

    ${vistos.length ? `
    <section class="container section">
      <div class="section-head"><h2 class="title">Vistos recentemente</h2></div>
      <div class="grid-cards">${vistos.map(carCard).join('')}</div>
    </section>` : ''}`;
}

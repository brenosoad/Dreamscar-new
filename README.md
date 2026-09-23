# Dream Cars

Site institucional de concessionária: catálogo, financiamento com simulador, venda de usados e blog.

HTML, CSS e JavaScript puros (ES Modules), sem build.

## Rodar localmente

Abra `index.html` direto no navegador. Os scripts já vêm empacotados em `js/bundle/`.

## Editar o código

O código-fonte fica em `js/` (ES Modules). Depois de editar, gere os bundles de novo:

```bash
npm install
npm run build   # gera js/bundle/
npm run dev     # recompila a cada alteração
```

## Estrutura

```
├── *.html                 # uma página por seção
├── css/style.css          # estilos globais
├── assets/img/            # imagens próprias (hero)
├── package.json           # build com esbuild
└── js/
    ├── config.js          # nome, contatos, endereço, taxa de juros
    ├── app.js             # inicializa tudo que é comum às páginas
    ├── chrome.js          # header, footer e "voltar ao topo"
    ├── components.js      # cards, links, carrossel, ajuste de texto
    ├── catalog.js         # filtros, ordenação e paginação
    ├── forms.js           # envio de formulários para o WhatsApp
    ├── features/          # favoritos, comparação, busca (Ctrl+K), toasts
    ├── fx/                # animações: reveal, contadores, tilt, parallax
    ├── views/             # lógica de cada página
    ├── pages/             # entrada de cada página (fonte dos bundles)
    ├── data/              # carros, posts e serviços
    └── bundle/            # gerado pelo esbuild, usado pelo HTML
```

## Recursos

- **Busca global:** `Ctrl + K` (ou `/`) busca carros, posts e páginas.
- **Favoritos:** coração nos cards, salvo no navegador, com filtro no catálogo.
- **Comparador:** até 3 carros lado a lado, com destaque para o melhor em cada item.
- **Vistos recentemente:** na página de cada carro.
- **Animações:** entrada ao rolar, contadores, inclinação 3D nos cards, parallax no hero, header que se esconde ao rolar e transição entre páginas. Todas respeitam a preferência de movimento reduzido do sistema.

## Como editar

- **Novo carro:** adicione um objeto em `js/data/carros.js`. A página fica em `carro.html?id=<id>`.
- **Novo post:** adicione um objeto em `js/data/posts.js`. A página fica em `post.html?slug=<slug>`.
- **Contatos e taxa de juros:** `js/config.js`.

Ícones: [Lucide](https://lucide.dev) (ISC) e [Simple Icons](https://simpleicons.org) (CC0).

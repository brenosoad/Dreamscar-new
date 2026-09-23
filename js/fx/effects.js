import { $, $$, prefersReducedMotion, finePointer } from '../utils.js';
import { countUp } from './counter.js';

const REVEAL = [
  '.section-head', '.page-head', '.title', '.car-card', '.post-card', '.service', '.features li', '.steps li',
  '.team li', '.quotes li', '.why-item', '.stats li', '.highlights li', '.timeline li', '.faq-item',
  '.post-stats li', '.checklist li', '.simulator', '.card-form', '.visit', '.cta', '.specs > div', '.aside-cta', '.toc',
].join(',');
const COUNTERS = '.stat-value, .post-stats strong';

let revealObs;
let counterObs;
const vistos = new WeakSet();

// Aplica efeitos em elementos novos (chamado no carregamento e a cada mudança do DOM)
export function enhance(root = document) {
  const reduz = prefersReducedMotion();
  const alvo = (sel) => [...(root.matches?.(sel) ? [root] : []), ...$$(sel, root)];

  if (!reduz) {
    alvo(REVEAL).forEach((el) => {
      if (vistos.has(el) || el.closest('dialog')) return;
      vistos.add(el);
      // atraso em cascata entre irmãos
      const irmaos = [...el.parentElement.children].filter((c) => c.matches(REVEAL));
      el.style.setProperty('--d', `${Math.min(irmaos.indexOf(el), 6) * 70}ms`);
      el.classList.add('reveal');
      revealObs.observe(el);
    });
  }
  alvo(COUNTERS).forEach((el) => {
    if (vistos.has(el)) return;
    vistos.add(el);
    if (!reduz) counterObs.observe(el);
  });
  if (finePointer() && !reduz) {
    alvo('.car-card').forEach(initTilt);
    alvo('.hero .btn, .aside-cta .btn, .dock-actions .btn').forEach(initMagnetic);
    alvo('.hero').forEach(initHero);
  }
}

export function initEffects() {
  revealObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-visible');
      revealObs.unobserve(e.target);
      // libera o elemento para outros efeitos (ex.: tilt) após a animação
      setTimeout(() => e.target.classList.remove('reveal', 'is-visible'), 1100);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

  counterObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      counterObs.unobserve(e.target);
      countUp(e.target);
    });
  }, { threshold: 0.6 });

  enhance(document);
  let fila = new Set();
  new MutationObserver((muts) => {
    muts.forEach((m) => m.addedNodes.forEach((n) => { if (n.nodeType === 1) fila.add(n); }));
    requestAnimationFrame(() => { fila.forEach((n) => n.isConnected && enhance(n)); fila = new Set(); });
  }).observe(document.body, { childList: true, subtree: true });

  initHeaderAutoHide();
}

// Inclinação 3D com reflexo seguindo o mouse
function initTilt(card) {
  if (card._tilt) return;
  card._tilt = true;
  let frame;
  card.addEventListener('pointermove', (e) => {
    if (card.classList.contains('reveal')) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 7}deg) rotateY(${(x - 0.5) * 9}deg) translateY(-4px)`;
      card.style.setProperty('--gx', `${x * 100}%`);
      card.style.setProperty('--gy', `${y * 100}%`);
    });
  });
  card.addEventListener('pointerleave', () => {
    cancelAnimationFrame(frame);
    card.style.transform = '';
  });
}

// Botões que "puxam" levemente em direção ao cursor
function initMagnetic(btn) {
  if (btn._mag) return;
  btn._mag = true;
  btn.addEventListener('pointermove', (e) => {
    const r = btn.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    btn.style.transform = `translate(${dx * 10}px, ${dy * 8}px)`;
  });
  btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
}

// Hero: parallax no scroll e brilho laranja que segue o mouse
function initHero(hero) {
  if (hero._fx) return;
  hero._fx = true;
  const bg = $('.hero-bg', hero);
  const wordmark = $('.hero-wordmark', hero);
  const glow = document.createElement('div');
  glow.className = 'hero-glow';
  glow.setAttribute('aria-hidden', 'true');
  hero.prepend(glow);

  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', `${e.clientX - r.left}px`);
    hero.style.setProperty('--my', `${e.clientY - r.top}px`);
    hero.classList.add('has-glow');
  });
  hero.addEventListener('pointerleave', () => hero.classList.remove('has-glow'));

  let frame;
  const onScroll = () => {
    if (!hero.isConnected) { window.removeEventListener('scroll', onScroll); return; }
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const y = Math.min(window.scrollY, hero.offsetHeight);
      if (bg) bg.style.transform = `translate3d(0, ${y * 0.3}px, 0) scale(1.06)`;
      if (wordmark) {
        wordmark.style.transform = `translate3d(0, ${y * 0.18}px, 0)`;
        wordmark.style.opacity = String(1 - Math.min(1, y / (hero.offsetHeight * 0.7)));
      }
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Esconde o header ao rolar para baixo e mostra ao rolar para cima
function initHeaderAutoHide() {
  const header = $('#site-header');
  if (!header) return;
  let ultimo = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const descendo = y > ultimo && y > 240;
    header.classList.toggle('is-hidden', descendo && !header.classList.contains('is-open') && !document.querySelector('dialog[open]'));
    header.classList.toggle('is-scrolled', y > 10);
    ultimo = y;
  }, { passive: true });
}

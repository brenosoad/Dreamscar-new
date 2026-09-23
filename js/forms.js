import { $$, whatsappLink } from './utils.js';

// Envia qualquer <form data-whatsapp="Assunto"> para o WhatsApp da loja.
export function initWhatsappForms(root = document, extra = () => []) {
  $$('form[data-whatsapp]', root).forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;

      const linhas = [form.dataset.whatsapp, ''];
      for (const campo of form.elements) {
        if (!campo.name || !campo.value.trim()) continue;
        const label = form.querySelector(`label[for="${campo.id}"]`)?.textContent.replace('*', '').trim() ?? campo.name;
        linhas.push(`${label}: ${campo.value.trim()}`);
      }
      linhas.push(...extra(form));

      window.open(whatsappLink(linhas.join('\n')), '_blank', 'noopener');
      form.reset();
    });
  });
}

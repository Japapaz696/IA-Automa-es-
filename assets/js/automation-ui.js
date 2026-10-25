(function() {
  'use strict';
  const A = window.LucasAutomation;
  const form = document.querySelector('#automation-form');
  if (!A || !form) return;
  const input = document.querySelector('#automation-message');
  const feedback = document.querySelector('#automation-feedback');
  const notice = document.querySelector('#storage-notice');
  const list = document.querySelector('#request-list');
  let requests = [];
  try { requests = A.load(window.localStorage); }
  catch { notice.textContent = 'Histórico indisponível ou inválido. A demonstração começa vazia; novas ações tentarão salvar um novo histórico. Não use dados pessoais.'; }
  function persist() {
    try { A.save(window.localStorage, requests); notice.textContent = 'Histórico salvo apenas neste navegador. Use mensagens fictícias, sem dados pessoais.'; }
    catch { notice.textContent = 'Não foi possível salvar. Os dados desta sessão continuam em memória e podem ser perdidos ao recarregar.'; }
  }
  function node(tag, text, className) {
    const el = document.createElement(tag);
    if (text) el.textContent = text;
    if (className) el.className = className;
    return el;
  }
  function render() {
    const stats = A.indicators(requests);
    for (const key of ['total','queued','active','completed']) document.querySelector(`#count-${key}`).textContent = stats[key];
    document.querySelector('#queue-counts').textContent = Object.entries(stats.queues).map(([q, n]) => `${A.QUEUES[q]}: ${n}`).join(' · ');
    list.replaceChildren();
    if (!requests.length) list.append(node('p', 'Nenhuma solicitação. Envie uma mensagem fictícia acima para testar o fluxo.'));
    for (const r of requests) {
      const card = node('article', '', 'request-card');
      card.append(node('h4', `${A.QUEUES[r.queue]} — ${A.STATUSES[r.status]}`), node('p', r.message, 'request-message'));
      const time = node('time', new Date(r.createdAt).toLocaleString('pt-BR'));
      time.dateTime = r.createdAt;
      card.append(time, node('p', r.reason));
      const details = node('details');
      details.append(node('summary', 'Histórico de eventos'));
      const events = node('ol');
      r.events.forEach(e => events.append(node('li', `${new Date(e.at).toLocaleTimeString('pt-BR')} — ${e.detail}`)));
      details.append(events);
      card.append(details);
      if (r.status !== 'completed') {
        const btn = node('button', r.status === 'queued' ? 'Iniciar atendimento' : 'Concluir atendimento', 'btn btn-ghost');
        btn.type = 'button';
        btn.setAttribute('aria-label', `${btn.textContent}: ${r.message.slice(0, 60)}`);
        btn.addEventListener('click', () => {
          requests = A.transition(requests, r.id, r.status === 'queued' ? 'active' : 'completed', new Date().toISOString());
          persist(); render();
          feedback.textContent = 'Estado atualizado no dashboard local.';
          document.querySelector('#dashboard-heading').focus({ preventScroll: true });
        });
        card.append(btn);
      }
      list.append(card);
    }
  }
  form.addEventListener('submit', e => {
    e.preventDefault();
    try {
      requests = A.receive(requests, input.value, crypto.randomUUID(), new Date().toISOString());
      input.removeAttribute('aria-invalid');
      persist(); render();
      feedback.textContent = `Solicitação registrada na fila interna de ${A.QUEUES[requests[0].queue]}. Sem envio externo.`;
      input.value = '';
    } catch (error) {
      input.setAttribute('aria-invalid', 'true');
      feedback.textContent = error.message;
      input.focus();
    }
  });
  document.querySelectorAll('[data-example]').forEach(btn => btn.addEventListener('click', () => {
    input.value = btn.dataset.example;
    input.focus();
  }));
  const confirmation = document.querySelector('#clear-confirmation');
  document.querySelector('#clear-requests').addEventListener('click', () => {
    confirmation.hidden = false;
    document.querySelector('#confirm-clear').focus();
  });
  document.querySelector('#cancel-clear').addEventListener('click', () => {
    confirmation.hidden = true;
    document.querySelector('#clear-requests').focus();
  });
  document.querySelector('#confirm-clear').addEventListener('click', () => {
    try { A.clear(window.localStorage); notice.textContent = 'Histórico removido deste navegador.'; }
    catch { notice.textContent = 'A memória foi limpa, mas não foi possível remover o histórico persistido. Ele pode reaparecer ao recarregar.'; }
    requests = [];
    confirmation.hidden = true;
    render();
    feedback.textContent = 'Dados demonstrativos desta sessão limpos.';
    document.querySelector('#clear-requests').focus();
  });
  render();
})();

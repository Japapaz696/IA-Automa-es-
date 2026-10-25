/* Deterministic local routing. No AI model and no external requests. */
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LucasAutomation = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const KEY = 'lucas-ai.requests.v1';
  const LIMIT = 100;
  const QUEUES = { suporte: 'Suporte', agendamento: 'Agendamento', vendas: 'Vendas', geral: 'Atendimento geral' };
  const STATUSES = { queued: 'Na fila', active: 'Em atendimento', completed: 'Concluída' };
  const RULES = [
    ['suporte', /\b(erro|falha|problema|suporte|bug|senha|nao consigo|nao funciona|travou)\b/],
    ['agendamento', /\b(agendar|agendamento|marcar|horario|reserva|reservar|consulta)\b/],
    ['vendas', /\b(preco|precos|orcamento|comprar|compra|venda|vendas|produto|plano|proposta)\b/]
  ];
  function validate(raw) {
    if (typeof raw !== 'string') throw new Error('Digite uma mensagem de atendimento.');
    const message = raw.trim();
    if (message.length < 5 || !/[\p{L}\p{N}]/u.test(message)) throw new Error('Escreva ao menos 5 caracteres com letras ou números.');
    if (message.length > 1000) throw new Error('Use no máximo 1.000 caracteres.');
    return message;
  }
  function classify(raw) {
    const message = validate(raw).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const matches = RULES.filter(([, rule]) => rule.test(message)).map(([queue]) => queue);
    return { queue: matches[0] || 'geral', reason: matches.length
      ? `Regra de ${QUEUES[matches[0]]}. Prioridade: suporte, agendamento, vendas; sem correspondência: geral.`
      : 'Sem palavra-chave reconhecida; revisão humana na fila geral.' };
  }
  function receive(requests, raw, id, at) {
    const message = validate(raw);
    if (requests.length >= LIMIT) throw new Error('Limite de 100 solicitações. Limpe os dados demonstrativos para continuar.');
    if (!id || requests.some(r => r.id === id) || !Number.isFinite(Date.parse(at))) throw new Error('Identificador ou data inválida.');
    const { queue, reason } = classify(message);
    const request = { id, message, queue, reason, status: 'queued', createdAt: at, events: [
      { at, status: 'received', detail: 'Mensagem recebida apenas neste navegador.' },
      { at, status: 'classified', detail: reason },
      { at, status: 'queued', detail: `Encaminhada à fila interna: ${QUEUES[queue]}. Nenhum envio externo.` }
    ] };
    return [request, ...requests];
  }
  function transition(requests, id, status, at) {
    const request = requests.find(r => r.id === id);
    const next = { queued: 'active', active: 'completed' };
    if (!request || next[request.status] !== status || !Number.isFinite(Date.parse(at))) throw new Error('Transição de estado inválida.');
    return requests.map(r => r.id === id ? { ...r, status, events: [...r.events, { at, status, detail: STATUSES[status] }] } : r);
  }
  function indicators(requests) {
    const result = { total: requests.length, queued: 0, active: 0, completed: 0, queues: Object.fromEntries(Object.keys(QUEUES).map(q => [q, 0])) };
    for (const r of requests) { result[r.status]++; result.queues[r.queue]++; }
    return result;
  }
  function decode(raw) {
    if (raw === null) return [];
    const data = JSON.parse(raw);
    if (data.version !== 1 || !Array.isArray(data.requests) || data.requests.length > LIMIT) throw new Error('Histórico inválido.');
    const ids = new Set();
    for (const r of data.requests) {
      if (!r || typeof r.id !== 'string' || ids.has(r.id) || !r.id || validate(r.message) !== r.message ||
          !Object.hasOwn(QUEUES, r.queue) || !Object.hasOwn(STATUSES, r.status) ||
          typeof r.reason !== 'string' || r.reason.length > 300 || !Number.isFinite(Date.parse(r.createdAt)) ||
          !Array.isArray(r.events) || r.events.length < 3 || r.events.length > 5 || r.events.some(e =>
            !e || !Number.isFinite(Date.parse(e.at)) || typeof e.detail !== 'string' || e.detail.length > 300 ||
            !['received','classified','queued','active','completed'].includes(e.status))) throw new Error('Histórico inválido.');
      const sequence = ['received','classified','queued','active','completed'];
      const eventCount = { queued: 3, active: 4, completed: 5 }[r.status];
      if (r.events.length !== eventCount || r.events.some((e, i) => e.status !== sequence[i])) throw new Error('Histórico inválido.');
      ids.add(r.id);
    }
    return data.requests;
  }
  function load(storage) { return decode(storage.getItem(KEY)); }
  function save(storage, requests) { storage.setItem(KEY, JSON.stringify({ version: 1, requests })); }
  function clear(storage) { storage.removeItem(KEY); }
  return { KEY, LIMIT, QUEUES, STATUSES, validate, classify, receive, transition, indicators, decode, load, save, clear };
});

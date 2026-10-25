const { test } = require('node:test');
const assert = require('node:assert/strict');
const A = require('../assets/js/automation.js');
const at = '2026-10-25T10:00:00.000Z';
const make = (message = 'Preciso de um orçamento', id = '1', requests = []) => A.receive(requests, message, id, at);

for (const [message, queue] of [
  ['Quero agendar uma consulta', 'agendamento'],
  ['Quero marcar um HORÁRIO', 'agendamento'],
  ['Qual o PREÇO do produto?', 'vendas'],
  ['Preciso de um orçamento', 'vendas'],
  ['Não consigo acessar o painel', 'suporte'],
  ['Meu agendamento apresenta erro', 'suporte'],
  ['Quero comprar e agendar', 'agendamento'],
  ['Olá, gostaria de conversar', 'geral'],
  ['A paisagem está bonita', 'geral']
]) test(`classificação: ${message}`, () => assert.equal(A.classify(message).queue, queue));

test('validação: vazio, espaços, curto, símbolos, tipo e limite', () => {
  for (const raw of ['', '    ', 'oi', '!!!!!', null, {}, 123, 'x'.repeat(1001)]) assert.throws(() => A.validate(raw));
  assert.equal(A.validate('  Olá equipe  '), 'Olá equipe');
  assert.equal(A.validate('x'.repeat(1000)).length, 1000);
});
test('recebe, classifica, encaminha e registra 3 eventos sem mutar entrada', () => {
  const input = [];
  const [r] = make('Quero agendar uma consulta', 'abc', input);
  assert.equal(input.length, 0);
  assert.equal(r.queue, 'agendamento');
  assert.equal(r.status, 'queued');
  assert.deepEqual(r.events.map(e=>e.status), ['received','classified','queued']);
  assert.match(r.events[2].detail, /Nenhum envio externo/);
});
test('estados e histórico: fila → atendimento → concluída', () => {
  const initial = make();
  const active = A.transition(initial, '1', 'active', at);
  const done = A.transition(active, '1', 'completed', at);
  assert.equal(initial[0].events.length, 3);
  assert.equal(active[0].events.length, 4);
  assert.equal(done[0].events.length, 5);
  assert.equal(done[0].status, 'completed');
  assert.throws(()=>A.transition(initial, '1', 'completed', at));
  assert.throws(()=>A.transition(done, '1', 'active', at));
  assert.throws(()=>A.transition(done, 'missing', 'active', at));
});
test('indicadores derivados, inclusive estados e filas vazias', () => {
  assert.deepEqual(A.indicators([]), {total:0,queued:0,active:0,completed:0,queues:{suporte:0,agendamento:0,vendas:0,geral:0}});
  let requests = make();
  requests = make('Quero agendar', '2', requests);
  requests = make('Preciso de suporte', '3', requests);
  requests = A.transition(requests,'1','active',at);
  requests = A.transition(requests,'1','completed',at);
  const stats = A.indicators(requests);
  assert.equal(stats.total, 3); assert.equal(stats.queued,2); assert.equal(stats.completed,1);
  assert.deepEqual(stats.queues,{suporte:1,agendamento:1,vendas:1,geral:0});
});
test('repetir mensagem cria solicitação independente; id duplicado é rejeitado', () => {
  const requests = make();
  assert.equal(make('Preciso de um orçamento','2',requests).length,2);
  assert.throws(()=>make('Preciso de um orçamento','1',requests));
});
test('limite de 100 sem apagar histórico silenciosamente', () => {
  let requests=[];
  for(let i=0;i<100;i++)requests=make('Olá equipe',String(i),requests);
  assert.throws(()=>make('Olá equipe','101',requests), /100/);
  assert.equal(requests.length,100);
});
test('persistência, recarga e limpeza apenas da chave da demonstração', () => {
  const map = new Map([['other','keep']]);
  const storage = {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
  assert.deepEqual(A.load(storage),[]);
  const requests = make(); A.save(storage,requests);
  assert.deepEqual(A.load(storage),requests);
  A.clear(storage); assert.deepEqual(A.load(storage),[]); assert.equal(map.get('other'),'keep');
});
test('histórico corrompido e schema inválido são rejeitados', () => {
  for(const raw of ['bad','null','{}','{"version":2,"requests":[]}','{"version":1,"requests":[{}]}'])assert.throws(()=>A.decode(raw));
  const r=make();r[0].queue='__proto__';assert.throws(()=>A.decode(JSON.stringify({version:1,requests:r})));
});
test('falhas de armazenamento não são silenciosas no domínio', () => {
  const storage={getItem(){throw Error('blocked');},setItem(){throw Error('quota');},removeItem(){throw Error('blocked');}};
  assert.throws(()=>A.load(storage));assert.throws(()=>A.save(storage,make()));assert.throws(()=>A.clear(storage));
});
test('recarga rejeita estado incompatível com a sequência de eventos', () => {
  const requests = make();
  requests[0].status = 'completed';
  assert.throws(() => A.decode(JSON.stringify({version:1,requests})), /Histórico inválido/);
  requests[0].status = 'queued';
  requests[0].events[1].status = 'queued';
  assert.throws(() => A.decode(JSON.stringify({version:1,requests})), /Histórico inválido/);
});
test('recarga preserva cada estado válido e seus indicadores', () => {
  let requests = make();
  for (const status of ['queued','active','completed']) {
    if (status !== 'queued') requests = A.transition(requests,'1',status,at);
    const restored = A.decode(JSON.stringify({version:1,requests}));
    assert.equal(restored[0].status,status);
    assert.equal(A.indicators(restored)[status],1);
  }
});

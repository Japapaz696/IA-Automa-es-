/* Lucas AI — Demostração local (todas simulações) */
(function(){
  'use strict';
  const dQ = s => document.querySelector(s), dQA = s => document.querySelectorAll(s);

  /* Menu mobile */
  const btnNav = dQ('.nav-toggle'), nav = dQ('.site-nav');
  if(btnNav && nav){
    function closeMenu(){ btnNav.setAttribute('aria-expanded','false'); nav.classList.remove('open'); }
    btnNav.addEventListener('click',()=>{ const open=btnNav.getAttribute('aria-expanded')!=='true'; btnNav.setAttribute('aria-expanded',String(open)); nav.classList.toggle('open',open); });
    dQA('.site-nav a').forEach(a=>a.addEventListener('click',closeMenu));
    document.addEventListener('keydown',e=>{ if(e.key==='Escape' && nav.classList.contains('open')){closeMenu();btnNav.focus();} });
    document.addEventListener('click',e=>{if(!nav.contains(e.target)&&!btnNav.contains(e.target))closeMenu();});
    document.addEventListener('focusin',e=>{if(!nav.contains(e.target)&&e.target!==btnNav)closeMenu();});
    window.matchMedia('(max-width:900px)').addEventListener('change',closeMenu);
  }

  /* Hero chat animation */
  (function heroChat(){
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const timers = [];
    function revealAll(){ timers.forEach(clearTimeout); dQA('[data-hero-msg]').forEach(m=>{m.classList.remove('is-hidden');m.classList.add('is-visible');}); }
    if(motion.matches){revealAll();return;}
    const msgs = dQA('[data-hero-msg]');
    msgs.forEach((m,i)=>timers.push(setTimeout(()=>{ m.classList.remove('is-hidden'); m.classList.add('is-visible'); }, 700 + i*900)));
    const checks = dQA('[data-hero-check]');
    motion.addEventListener('change',()=>{if(motion.matches)revealAll();});
  })();

  /* Demo tabs */
  const demoData = {
    atendimento: { client:'"Vocês trabalham aos sábados?"', ai:'"Sim. Nosso atendimento funciona aos sábados das 08h às 14h."', side:'<h3>Resultado</h3><ul><li>Informação encontrada</li><li>Resposta preparada</li><li>Atendimento registrado</li></ul><p class="sim-tag">SIMULAÇÃO</p>' },
    agendamento: { client:'"Quero marcar um horário."', ai:'"Claro. Tenho estes horários disponíveis: 10:00 · 14:00 · 16:00"', side:'<h3>Escolha um horário</h3><ul><li>10h</li><li>14h</li><li>16h</li></ul><button type="button" class="btn btn-primary" onclick="pickSlot(this)">Confirmar 14h</button><p class="sim-tag">SIMULAÇÃO</p>' },
    lead: { client:'"Tenho interesse no serviço."', ai:'"Perfeito. Posso fazer algumas perguntas rápidas para entender sua necessidade?"', side:'<h3>Lead qualificado</h3><p><strong>Empresa:</strong> Empresa Demo<br><strong>Interesse:</strong> Automação de atendimento<br><strong>Prioridade:</strong> Alta</p><button type="button" class="btn btn-primary" onclick="takeLead(this)">Assumir atendimento</button><p class="sim-tag">SIMULAÇÃO</p>' },
    vendas: { client:'"Quero saber o preço."', ai:'"Temos planos a partir de R$ 1.200/mês. Posso enviar uma proposta personalizada?"', side:'<h3>Proposta enviada</h3><ul><li>Plano selecionado</li><li>Proposta gerada</li><li>Cliente informado</li></ul><p class="sim-tag">SIMULAÇÃO</p>' },
    followup: { client:'"João — interesse em automação. Último contato: ontem.', ai:'"Olá, João! Tudo bem? Você comentou que tinha interesse em automatizar o atendimento da sua empresa. Posso te mostrar como isso funcionaria no seu caso?"', side:'<h3>Follow-up executado</h3><ul><li>Mensagem criada</li><li>Lead atualizado</li><li>Contato preparado</li></ul><p class="sim-tag">SIMULAÇÃO</p>' },
    suporte: { client:'"Não consigo acessar o painel."', ai:'"Entendi. Vou abrir uma solicitação. Você prefere contato por WhatsApp ou e-mail?"', side:'<h3>Solicitação aberta</h3><ul><li>Ticket criado</li><li>Cliente orientado</li><li>Tempo estimado: 2h</li></ul><p class="sim-tag">SIMULAÇÃO</p>' },
  };
  window.pickSlot = function(btn){ btn.textContent='✓ Horário confirmado (simulado)'; btn.disabled=true; };
  window.takeLead = function(btn){ btn.textContent='✓ Transferido para humano (simulado)'; btn.disabled=true; };

  const chipsDemo = dQA('[data-demo]');
  const chatDemo = dQ('#demo-chat'), sideDemo = dQ('#demo-side');
  function renderDemo(key){
    const d = demoData[key]; if(!d || !chatDemo || !sideDemo) return;
    chatDemo.innerHTML = '<article class="bubble client"><span>Cliente</span><p>'+d.client+'</p></article><article class="bubble ai"><span>IA</span><p>'+d.ai+'</p></article>';
    sideDemo.innerHTML = d.side;
  }
  chipsDemo.forEach(ch=>{ ch.addEventListener('click',()=>{ chipsDemo.forEach(c=>{ c.classList.remove('is-active'); c.setAttribute('aria-selected','false'); }); ch.classList.add('is-active'); ch.setAttribute('aria-selected','true'); renderDemo(ch.dataset.demo); }); });
  renderDemo('atendimento');

  /* Segment tabs */
  const segmentData = {
    clinica: { chat:'<article class="bubble client"><span>Cliente</span><p>"Queria marcar uma avaliação."</p></article><article class="bubble ai"><span>IA</span><p>"Claro. Você prefere atendimento presencial ou online?"</p></article>', side:'<h3>Fluxo — Clínica</h3><ul><li>Presencial / online</li><li>Horários disponíveis</li><li>Escolha confirmada</li><li>Confirmação simulada</li></ul><p class="sim-tag">SIMULAÇÃO</p>' },
    barbearia: { chat:'<article class="bubble client"><span>Cliente</span><p>"Queria cortar sábado."</p></article><article class="bubble ai"><span>IA</span><p>"Temos 10h, 13h e 15h."</p></article><article class="bubble client"><span>Cliente</span><p>"15h."</p></article><article class="bubble ai"><span>IA</span><p>"Perfeito. Seu agendamento foi realizado com sucesso."</p></article>', side:'<h3>Resultado — Barbearia</h3><ul><li>Horário reservado</li><li>Cliente cadastrado</li><li>Confirmação preparada</li></ul><p class="sim-tag">SIMULAÇÃO</p>' },
    imobiliaria: { chat:'<article class="bubble client"><span>Cliente</span><p>"Procuro apartamento até R$ 400 mil."</p></article><article class="bubble ai"><span>IA</span><p>"Quantos quartos você procura?"</p></article><article class="bubble client"><span>Cliente</span><p>"2."</p></article><article class="bubble ai"><span>IA</span><p>"Encontrei opções. Você quer agenda com o corretor?"</p></article>', side:'<h3>Resultado — Imobiliária</h3><ul><li>Preferência identificada</li><li>Lead qualificado</li><li>Corretor notificado</li></ul><p class="sim-tag">SIMULAÇÃO</p>' },
    loja: { chat:'<article class="bubble client"><span>Cliente</span><p>"Tem camiseta preta tamanho M?"</p></article><article class="bubble ai"><span>IA</span><p>"Sim. Temos 3 unidades."</p></article>', side:'<h3>Catálogo fictício</h3><table style="width:100%;font-size:.82rem"><tr><th>Produto</th><th>Preço</th><th>Estoque</th></tr><tr><td>Camiseta preta M</td><td>R$ 89</td><td>3</td></tr></table><button class="btn btn-primary" onclick="this.textContent=\'✓ Interesse enviado (simulado)\';this.disabled=true">Tenho interesse</button><p class="sim-tag">SIMULAÇÃO</p>' },
    restaurante: { chat:'<article class="bubble client"><span>Cliente</span><p>"Quero reservar mesa para 4 amanhã à noite."</p></article><article class="bubble ai"><span>IA</span><p>"Temos disponibilidade às 19h e 21h. Qual prefere?"</p></article>', side:'<h3>Reserva — Restaurante</h3><ul><li>Mesa confirmada</li><li>Horário reservado</li><li>Confirmação preparada</li></ul><p class="sim-tag">SIMULAÇÃO</p>' },
    servicos: { chat:'<article class="bubble client"><span>Cliente</span><p>"Preciso de um orçamento para automação."</p></article><article class="bubble ai"><span>IA</span><p>"Posso ajudar. Qual processo consome mais tempo da equipe?"</p></article>', side:'<h3>Orçamento — Serviços</h3><ul><li>Processo identificado</li><li>Orçamento estimado</li><li>Contato preparado</li></ul><p class="sim-tag">SIMULAÇÃO</p>' },
  };
  const chipsSeg = dQA('[data-segment]');
  const chatSeg = dQ('#segment-chat'), sideSeg = dQ('#segment-side');
  chipsSeg.forEach(ch=>{ ch.addEventListener('click',()=>{ chipsSeg.forEach(c=>{ c.classList.remove('is-active'); c.setAttribute('aria-selected','false'); }); ch.classList.add('is-active'); ch.setAttribute('aria-selected','true'); const s = segmentData[ch.dataset.segment]; if(s && chatSeg && sideSeg){ chatSeg.innerHTML = s.chat; sideSeg.innerHTML = s.side; } }); });
  if(chipsSeg[0]){ const s = segmentData[chipsSeg[0].dataset.segment]; if(s && chatSeg && sideSeg){ chatSeg.innerHTML = s.chat; sideSeg.innerHTML = s.side; } }

  /* Accessible keyboard navigation for both sets of demonstration tabs. */
  function setupTabs(selector, panelId){
    const tabs=[...dQA(selector)], panel=dQ('#'+panelId);
    if(!tabs.length||!panel)return;
    panel.setAttribute('role','tabpanel');
    tabs.forEach((tab,i)=>{
      tab.id=panelId+'-tab-'+i;
      tab.setAttribute('role','tab');tab.setAttribute('aria-controls',panelId);
      function sync(){ tabs.forEach(t=>{const on=t===tab;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;});panel.setAttribute('aria-labelledby',tab.id); }
      tab.addEventListener('click',sync);
      tab.addEventListener('keydown',e=>{
        const keys={ArrowRight:(i+1)%tabs.length,ArrowLeft:(i+tabs.length-1)%tabs.length,Home:0,End:tabs.length-1};
        if(Object.hasOwn(keys,e.key)){e.preventDefault();tabs[keys[e.key]].focus();tabs[keys[e.key]].click();}
      });
      tab.setAttribute('aria-selected',String(i===0));tab.tabIndex=i===0?0:-1;
    });
    panel.setAttribute('aria-labelledby',tabs[0].id);
  }
  setupTabs('[data-demo]','demo-chat');setupTabs('[data-segment]','segment-chat');
  dQ('#demo-side')?.setAttribute('role','region');
  dQ('#demo-side')?.setAttribute('aria-label','Resultado ilustrativo');

  /* Quiz simulator */
  const quizForm = dQ('#quiz-form'), quizResult = dQ('#quiz-result');
  let step = 1;
  const btnNext = dQ('#quiz-next'), btnPrev = dQ('#quiz-prev'), btnReset = dQ('#quiz-reset');
  function showStep(n){ dQA('#quiz-form fieldset').forEach(f=>f.classList.remove('is-active')); const s = dQ('#quiz-form fieldset[data-step="'+n+'"]'); if(s){s.classList.add('is-active');s.tabIndex=-1;s.focus();} btnPrev.hidden = n<=1; btnNext.textContent = n>=3 ? 'Ver análise' : 'Continuar'; step=n; }
  function validateStep(n){ const fs = dQ('#quiz-form fieldset[data-step="'+n+'"]'); if(!fs) return false; const radios = fs.querySelectorAll('input[type="radio"]'); if(radios.length===0) return true; return Array.from(radios).some(r=>r.checked); }
  if(btnNext && quizForm){ btnNext.addEventListener('click',()=>{ if(step<3){ if(!validateStep(step)){ alert('Por favor, selecione uma opção antes de continuar.'); return; } showStep(step+1); } else { if(!validateStep(step)){ alert('Por favor, selecione uma opção antes de ver a análise.'); return; } const f = quizForm; const tempo = dQ('input[name="tempo"]:checked'); const pessoas = dQ('input[name="pessoas"]:checked'); const freq = dQ('input[name="freq"]:checked'); if(tempo && pessoas && freq){ quizForm.hidden=true; quizResult.hidden=false; dQ('#quiz-copy').innerHTML = '<strong>Pelo processo informado, existe potencial para automatizar boa parte dessa operação.</strong><br><br>Processo atual: Cliente → Funcionário → Pesquisa → Responde → Registra → Atualiza. <br>Processo automatizado: Cliente → IA → Automação → Sistema → Equipe.'; } else { alert('Responda todas as perguntas.'); } } }); }
  if(btnPrev && quizForm){ btnPrev.addEventListener('click',()=>{ if(step>1) showStep(step-1); }); }
  if(btnReset && quizForm){ btnReset.addEventListener('click',()=>{ quizForm.hidden=false; quizResult.hidden=true; quizForm.reset(); showStep(1); }); }

  /* Contact form (no server, opens WA) */
  const cf = dQ('#contact-form');
  if(cf){ cf.addEventListener('submit',e=>{
    e.preventDefault();
    const fields=['name','phone','company','message'];
    const [n,p,c,m]=fields.map(key=>cf.elements.namedItem(key).value.trim());
    const invalid=!n?'name':!/^\+?[\d\s().-]{10,20}$/.test(p)||p.replace(/\D/g,'').length<10?'phone':!m?'message':null;
    if(invalid){dQ('#form-error').textContent='Informe nome, telefone válido (ao menos 10 dígitos) e mensagem.';dQ('#form-error').hidden=false;cf.elements.namedItem(invalid).focus();return;}
    dQ('#form-error').hidden=true;
    const text=encodeURIComponent(`Olá, sou ${n}${c?` da ${c}`:''}. Meu WhatsApp: ${p}. Quero entender como a Lucas AI pode automatizar: ${m}`);
    window.open(`https://wa.me/5531973403545?text=${text}`,'_blank','noopener,noreferrer');
  }); }

  /* Reveal on scroll */
  // Content stays visible: no opacity-zero sections that can hide focused controls.
})();

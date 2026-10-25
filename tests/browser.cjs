const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createServer } = require('../scripts/serve.cjs');
const A = require('../assets/js/automation.js');

(async () => {
  const server = createServer();
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base = `http://127.0.0.1:${server.address().port}/IA-Automa-es-/`;
  const browser = await chromium.launch();
  const results=[];
  fs.mkdirSync('evidence/after',{recursive:true});
  try {
    for (const width of [320,390,768,1440]) {
      const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
      await context.addInitScript(()=>{window.open=(url)=>{window.openedURL=url;return null;};});
      const page=await context.newPage();
      const errors=[],failed=[];
      const mutations=[];
      page.on('request',r=>{if(r.method()!=='GET')mutations.push(`${r.method()} ${r.url()}`);});
      page.on('pageerror',e=>errors.push(e.message));
      page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
      page.on('response',r=>{if(r.status()>=400)failed.push(`${r.status()} ${r.url()}`);});
      await page.goto(base,{waitUntil:'networkidle'});
      assert.equal(await page.locator('#count-total').textContent(),'0');
      const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
      assert.ok(dimensions.scroll<=width+1,JSON.stringify(dimensions));
      assert.equal(await page.locator('#quiz-form fieldset:visible').count(),1);
      if(width<900){
        const toggle=page.locator('.nav-toggle');
        await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'true');
        await page.keyboard.press('Escape');assert.equal(await toggle.getAttribute('aria-expanded'),'false');
        assert.equal(await page.locator('.nav-toggle:focus').count(),1);
        await toggle.click();await page.locator('.site-nav a[href="#demonstracao"]').click();
        assert.equal(await toggle.getAttribute('aria-expanded'),'false');
      }
      await page.locator('[data-demo="atendimento"]').focus();await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('[data-demo="agendamento"]').getAttribute('aria-selected'),'true');
      await page.locator('#demo-side button').click();
      assert.match(await page.locator('#demo-side button').textContent(),/simulado/);
      await page.locator('[data-segment="clinica"]').focus();await page.keyboard.press('End');
      assert.equal(await page.locator('[data-segment="servicos"]').getAttribute('aria-selected'),'true');

      await page.locator('#automation-form button[type=submit]').click();
      assert.equal(await page.locator('#automation-message').getAttribute('aria-invalid'),'true');
      assert.equal(await page.locator('#count-total').textContent(),'0');
      for (const label of ['agendamento','vendas','suporte','geral']){
        await page.locator(`[data-example]`).filter({hasText:`Exemplo: ${label}`}).click();
        await page.locator('#automation-form button[type=submit]').focus();
        await page.keyboard.press('Space');
      }
      assert.equal(await page.locator('#count-total').textContent(),'4');
      assert.equal(await page.locator('.request-card').count(),4);
      for(const queue of Object.values(A.QUEUES)) assert.ok((await page.locator('#queue-counts').textContent()).includes(`${queue}: 1`));
      const first=page.locator('.request-card').first();
      await first.locator('button').focus();await page.keyboard.press('Enter');
      assert.equal(await page.locator('#count-active').textContent(),'1');
      await page.locator('.request-card').first().locator('button').click();
      assert.equal(await page.locator('#count-completed').textContent(),'1');
      await page.locator('.request-card').first().locator('summary').click();
      assert.equal(await page.locator('.request-card').first().locator('li').count(),5);
      await page.reload();assert.equal(await page.locator('#count-total').textContent(),'4');
      assert.equal(await page.locator('#count-completed').textContent(),'1');
      assert.equal(await page.evaluate(()=>window.openedURL),undefined);
      assert.deepEqual(mutations,[]);
      const panelCaptureStyle=await page.addStyleTag({content:'.site-header{display:none!important}'});
      await page.locator('#dash-panel').screenshot({path:`evidence/after/panel-${width}.png`});
      await panelCaptureStyle.evaluate(el=>el.remove());

      // User text is rendered literally, never as executable markup.
      await page.locator('#automation-message').fill('<img src=x onerror="window.injected=1"> suporte');
      await page.locator('#automation-form button[type=submit]').click();
      assert.equal(await page.locator('#request-list img').count(),0);
      assert.equal(await page.evaluate(()=>window.injected),undefined);
      await page.locator('#automation-message').fill('z'.repeat(1000));
      await page.locator('#automation-form button[type=submit]').click();
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));

      // Diagnostic questionnaire: validation, forward/back and restart.
      page.once('dialog',d=>d.accept());await page.locator('#quiz-next').click();
      await page.locator('input[name=tempo]').first().check();await page.locator('#quiz-next').click();
      await page.locator('input[name=pessoas]').first().check();await page.locator('#quiz-prev').click();
      await page.locator('#quiz-next').click();await page.locator('#quiz-next').click();
      await page.locator('input[name=freq]').first().check();await page.locator('#quiz-next').click();
      assert.ok(await page.locator('#quiz-result').isVisible());
      await page.locator('#quiz-reset').click();assert.equal(await page.locator('#quiz-form fieldset:visible').count(),1);

      // Contact URL is captured rather than contacting WhatsApp.
      await page.evaluate(()=>{window.open=(url)=>{window.openedURL=url;return null;};});
      await page.locator('#contact-form button[type=submit]').click();
      assert.ok(await page.locator('#form-error').isVisible());
      await page.locator('[name=name]').fill('Pessoa Teste');await page.locator('[name=phone]').fill('abc');
      await page.locator('#contact-form [name=message]').fill('Teste comercial');
      await page.locator('#contact-form button[type=submit]').click();
      assert.equal(await page.evaluate(()=>window.openedURL),undefined);
      await page.locator('[name=phone]').fill('31999999999');await page.locator('#contact-form button[type=submit]').click();
      assert.ok((await page.evaluate(()=>window.openedURL)).startsWith('https://wa.me/5531973403545?text='));
      const anchors=await page.locator('a[href^="#"]').evaluateAll(els=>els.map(e=>e.getAttribute('href')).filter(h=>!document.getElementById(h.slice(1))));
      assert.deepEqual(anchors,[]);
      assert.ok(await page.locator('img').evaluateAll(els=>els.every(e=>e.complete&&e.naturalWidth>0)));
      // Exercise both motion preferences in this same browser session.
      await page.emulateMedia({reducedMotion:'no-preference'});await page.emulateMedia({reducedMotion:'reduce'});
      assert.equal(await page.locator('[data-hero-msg].is-hidden').count(),0);
      await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
      const axe=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}));});
      await page.locator('#white-label').scrollIntoViewIfNeeded();
      await page.screenshot({path:`evidence/after/dashboard-${width}.png`});
      const stressCaptureStyle=await page.addStyleTag({content:'.site-header{display:none!important}'});
      await page.locator('#dash-panel').screenshot({path:`evidence/after/stress-panel-${width}.png`});
      await stressCaptureStyle.evaluate(el=>el.remove());
      await page.screenshot({path:`evidence/after/full-${width}.png`,fullPage:true});
      await page.locator('#clear-requests').click();await page.locator('#cancel-clear').click();
      assert.equal(await page.locator('#count-total').textContent(),'6');
      await page.locator('#clear-requests').click();await page.locator('#confirm-clear').click();
      assert.equal(await page.locator('#count-total').textContent(),'0');
      await page.reload();assert.equal(await page.locator('#count-total').textContent(),'0');
      assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
      results.push({width,status:'PASS',errors,failed,axe});
      await context.close();
    }
    // Broken storage and disabled storage must leave a usable in-memory demo.
    const rootPage=await browser.newPage();
    await rootPage.goto(base.replace('/IA-Automa-es-/','/'));
    assert.equal(await rootPage.locator('#count-total').textContent(),'0');
    await rootPage.close();
    for(const mode of ['corrupt','blocked']){
      const context=await browser.newContext();
      await context.addInitScript(mode=>{
        if(mode==='corrupt')localStorage.setItem('lucas-ai.requests.v1','invalid-json');
        else Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}});
      },mode);
      const page=await context.newPage();await page.goto(base);
      assert.match(await page.locator('#storage-notice').textContent(),/indisponível ou inválido/);
      await page.locator('#automation-message').fill('Preciso de suporte');await page.locator('#automation-form button[type=submit]').click();
      assert.equal(await page.locator('#count-total').textContent(),'1');
      if(mode==='blocked')assert.match(await page.locator('#storage-notice').textContent(),/memória/);
      results.push({storage:mode,status:'PASS'});await context.close();
    }
    fs.writeFileSync('evidence/after/results.json',JSON.stringify(results,null,2));
    console.log(JSON.stringify(results,null,2));
    assert.ok(results.filter(r=>r.axe).every(r=>r.axe.length===0),'axe violations: see results.json');
  } finally { await browser.close();await new Promise(r=>server.close(r)); }
})().catch(e=>{console.error(e);process.exitCode=1;});

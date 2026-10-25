const { chromium } = require('playwright');
const { createServer } = require('../scripts/serve.cjs');
const fs = require('node:fs');
(async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch();
  const results = [];
  fs.mkdirSync('evidence/before', { recursive: true });
  try {
    for (const width of [320,390,768,1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(`http://127.0.0.1:${server.address().port}/IA-Automa-es-/`);
      await page.evaluate(async () => { for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo(0,y); await new Promise(r=>setTimeout(r,20));} scrollTo(0,0); });
      await page.screenshot({path:`evidence/before/${width}.png`,fullPage:true});
      const overflow = await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth, elements:[...document.querySelectorAll('main *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,8).map(e=>e.className)}));
      let menu = 'desktop';
      if(width<900){ await page.locator('.nav-toggle').click(); menu = await page.locator('.site-nav').getAttribute('class'); }
      await page.locator('#contact-form button[type=submit]').click({force:true});
      results.push({width,overflow,menu,errors,visibleQuizSteps:await page.locator('#quiz-form fieldset:visible').count()});
      await page.close();
    }
    fs.writeFileSync('evidence/before/results.json',JSON.stringify(results,null,2));
    console.log(JSON.stringify(results,null,2));
  } finally { await browser.close(); await new Promise(r=>server.close(r)); }
})().catch(e=>{console.error(e);process.exitCode=1;});

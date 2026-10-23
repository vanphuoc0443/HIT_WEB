const {chromium} = require('playwright');
const {pathToFileURL}=require('url');
const path=require('path');
const assert=require('assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const url=file=>pathToFileURL(path.join(process.cwd(),file)).href;
  await page.goto(url('Lesson1/README.html'));
  const bash=page.locator('.code-block').filter({has:page.getByText('bash',{exact:true})});
  assert((await bash.count())>0);
  assert.equal(await bash.locator('.try-button').count(),0);
  await page.goto(url('Lesson2/README.html'));
  await page.locator('.try-button').first().click();
  assert(await page.locator('dialog').isVisible());
  const frame=page.frameLocator('.try-preview iframe');
  await frame.getByRole('heading',{name:'Xin chào!',exact:true}).waitFor();
  await page.locator('#edit-html').fill('<h1 id="result">Hello HIT</h1><button onclick="document.querySelector(\'#result\').textContent=\'Đã bấm\'">Bấm thử</button>');
  await page.locator('.try-run').click();
  await frame.getByRole('button',{name:'Bấm thử'}).click();
  assert.equal(await frame.locator('#result').textContent(),'Đã bấm');
  await page.getByRole('tab',{name:'CSS',exact:true}).click();
  await page.locator('#edit-css').fill('h1 { color: rgb(255, 0, 0); }');
  await page.locator('.try-run').click();
  await frame.getByRole('heading',{name:'Hello HIT',exact:true}).waitFor();
  assert.equal(await frame.locator('h1').evaluate(el=>getComputedStyle(el).color),'rgb(255, 0, 0)');
  await page.getByRole('tab',{name:'JavaScript',exact:true}).click();
  await page.locator('#edit-js').fill("document.querySelector('#result').textContent='JavaScript chạy đúng';");
  await page.locator('#edit-js').press('Control+Enter');
  await frame.getByRole('heading',{name:'JavaScript chạy đúng'}).waitFor();
  await page.locator('#edit-js').fill("throw new Error('Lỗi thử nghiệm');");
  await page.locator('.try-run').click();
  await page.getByRole('alert').filter({hasText:'Lỗi thử nghiệm'}).waitFor();
  await page.locator('#edit-js').fill("parent.document.body.setAttribute('data-preview-leak','yes');");
  await page.locator('.try-run').click();
  await page.locator('.try-error:visible').waitFor();
  assert.equal(await page.locator('body').getAttribute('data-preview-leak'),null);
  assert.equal(await page.locator('.try-preview iframe').getAttribute('sandbox'),'allow-scripts');
  await page.locator('.try-reset').click();
  await frame.getByRole('heading',{name:'Xin chào!',exact:true}).waitFor();
  await page.getByRole('tab',{name:'HTML',exact:true}).click();
  await page.getByRole('tab',{name:'HTML',exact:true}).press('ArrowRight');
  assert.equal(await page.getByRole('tab',{name:'CSS',exact:true}).getAttribute('aria-selected'),'true');
  await page.keyboard.press('Escape');
  assert(!(await page.locator('dialog').isVisible()));
  assert.equal(await page.locator('.try-button').first().evaluate(el=>el===document.activeElement),true);
  const cssBlock=page.locator('.code-block').filter({has:page.getByText('css',{exact:true})}).first();
  await cssBlock.locator('.try-button').click();
  await frame.getByRole('paragraph').waitFor();
  assert.equal(await frame.locator('p').evaluate(el=>getComputedStyle(el).color),'rgb(0, 128, 0)');
  await page.locator('.try-close').click();
  await page.locator('.code-block').filter({hasText:'href="style.css"'}).first().locator('.try-button').click();
  await frame.getByRole('paragraph').waitFor();
  assert.equal(await frame.locator('p').evaluate(el=>getComputedStyle(el).color),'rgb(0, 128, 0)');
  await page.locator('.try-close').click();
  await page.locator('.code-block').filter({hasText:'<script src="script.js"></script>'}).first().locator('.try-button').click();
  await frame.getByRole('button',{name:'Nhấn vào đây'}).click();
  assert((await frame.locator('#message').textContent()).includes('Chào mừng'));
  await page.locator('.try-close').click();
  await page.locator('.try-button').first().click();
  if(process.env.HIT_QA_DIR) await page.screenshot({path:path.join(process.env.HIT_QA_DIR,'hit-try-desktop.png')});
  for(const width of [390,320]) {
   await page.setViewportSize({width,height:844});
   const sizes=await page.locator('dialog').evaluate(el=>({scroll:el.scrollWidth,client:el.clientWidth}));
   assert(sizes.scroll<=sizes.client,'Editor horizontal overflow at '+width);
   await page.getByRole('tab',{name:'CSS',exact:true}).click();
   assert(await page.locator('#edit-css').isVisible());
   await page.locator('.try-run').click();
   await frame.getByRole('heading',{name:'Xin chào!',exact:true}).waitFor();
  }
  if(process.env.HIT_QA_DIR) {
   await page.setViewportSize({width:390,height:844});
   await page.getByRole('tab',{name:'HTML',exact:true}).click();
   await page.screenshot({path:path.join(process.env.HIT_QA_DIR,'hit-try-mobile.png')});
  }
  console.log('PASS: HTML/CSS/JS execution, interaction, Ctrl+Enter, JS errors, sandbox isolation, reset, tabs/keyboard, Escape/focus restore, bash excluded, CSS example, 390/320 mobile.');
 } finally {await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
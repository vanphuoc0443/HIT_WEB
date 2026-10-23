const { chromium } = require('playwright');
const path = require('path');
const assert = require('assert/strict');
const { pathToFileURL } = require('url');
const root = process.cwd();
const out = process.env.HIT_QA_DIR;
let browser;
(async () => {
 browser = await chromium.launch({channel:'msedge',headless:true});
 const context = await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const page = await context.newPage();
 const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 const url = file => pathToFileURL(path.join(root,file)).href;
 async function noOverflow(label) {
  const sizes = await page.evaluate(()=>({doc:document.documentElement.scrollWidth,view:innerWidth}));
  assert(sizes.doc<=sizes.view, label+': horizontal overflow '+JSON.stringify(sizes));
 }
 function contrast(a,b) {
  function lum(value) {
   const rgb=value.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});
   return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
  }
  const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
 }
 const report=[];
 for(const width of [1440,390,320]) {
  await page.setViewportSize({width,height:1000});
  for(const theme of ['dark','light']) {
   await page.goto(url('Lesson3/README.html'));
   await page.evaluate(t=>localStorage.setItem('hit-theme',t),theme);
   await page.reload();
   await page.waitForLoadState();
   await noOverflow(`Week3 ${width}/${theme}`);
   const button=await page.locator('.prose .primary').evaluate(el=>({text:el.textContent.trim(),color:getComputedStyle(el).color,bg:getComputedStyle(el).backgroundColor,height:el.getBoundingClientRect().height}));
   assert(button.text.includes('Xem lộ trình'),'Missing button label');
   const ratio=contrast(button.color,button.bg);
   assert(ratio>=4.5, 'Button contrast '+ratio);
   assert(button.height>=44,'Button target too small');
   report.push(`Week3 ${width}/${theme}: button contrast ${ratio.toFixed(2)}, no overflow`);
  }
  await page.goto(url('index.html'));
  await noOverflow('Home '+width);
  await page.locator('#demo-gap').focus();await page.locator('#demo-gap').press('End');
  await noOverflow('Playground maximum gap '+width);
  await page.goto(url('Lesson2/README.html'));
  await noOverflow('Week2 '+width);
  if(width<768) {
   await page.locator('.mobile-nav summary').click();
   assert(await page.locator('.mobile-nav nav').isVisible());
   await page.locator('.mobile-nav summary').click();
   await page.locator('.mobile-toc summary').click();
   assert(await page.locator('.toc-inline').isVisible());
  }
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(url('index.html'));
 await page.getByRole('button',{name:'column',exact:true}).click();
 assert.equal(await page.locator('#code-direction').textContent(),'column');
 assert.equal(await page.locator('#flex-demo').evaluate(el=>getComputedStyle(el).flexDirection),'column');
 await page.getByRole('button',{name:'row',exact:true}).click();
 await page.locator('#demo-gap').focus();await page.locator('#demo-gap').press('End');
 assert.equal(await page.locator('#code-gap').textContent(),'32px');
 await page.locator('#lesson-search').fill('bien');
 assert.equal(await page.locator('.lesson-row:visible').count(),2);
 await page.locator('#lesson-search').fill('zzzzzz');
 assert(await page.locator('.search-empty').isVisible());
 await page.locator('#reset-search').click();
 assert.equal(await page.locator('.lesson-row:visible').count(),14);
 await page.locator('[data-filter=ready]').click();
 assert.equal(await page.locator('.lesson-row:visible').count(),2);
 await page.goto(url('Lesson2/README.html'));
 await page.locator('.copy').first().click();
 assert.match(await page.locator('.copy').first().textContent(), /Đã sao chép|Đã chọn mã/);
 await page.goto(url('index.html'));
 assert((await page.locator('.hero .primary').textContent()).includes('Đọc tiếp Tuần 2'));
 await page.locator('#theme').click();
 assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
 await page.reload();
 assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
 assert.deepEqual(errors,[]);
 if (out) {
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto(url('index.html'));await page.waitForTimeout(1100);
 await page.screenshot({path:path.join(out,'hit-web-desktop.png'),fullPage:false});
 await page.setViewportSize({width:390,height:844});
 await page.goto(url('index.html'));await page.waitForTimeout(1100);
 await page.screenshot({path:path.join(out,'hit-web-mobile.png'),fullPage:false});
 await page.goto(url('Lesson3/README.html'));await page.waitForTimeout(800);
 await page.screenshot({path:path.join(out,'hit-web-button.png'),fullPage:false});
 }
 console.log(report.join('\n'));
 console.log('PASS: responsive, both themes, visible CTA contrast, playground, gap slider, search, filter, empty/reset, copy, resume, theme persistence; no JS errors.');
 await browser.close();
})().catch(async e=>{console.error(e);await browser?.close();process.exitCode=1});
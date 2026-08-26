const { chromium } = require('playwright-core');
(async () => {
  const ctx = await chromium.launchPersistentContext('C:/Users/susecomp/projects/escuela-virtual-ia/.deploy-profile', {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = ctx.pages()[0] || (await ctx.newPage());
  page.setDefaultTimeout(15000);
  await page.goto('https://supabase.com/dashboard/org/ysvnvtkiwmhgrieakxch', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  const np = page.locator('a:has-text("New project"), button:has-text("New project")').first();
  await np.click();
  await page.waitForTimeout(4000);
  console.log('URL:', page.url().slice(0, 100));
  const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  console.log('TEXTO (700c):', body.slice(0, 700));
  const inputs = await page.$$eval('input', (els) => els.map((e) => ({ name: e.name, type: e.type, ph: e.placeholder })));
  console.log('INPUTS:', JSON.stringify(inputs));
  const buttons = await page.$$eval('button', (bs) => bs.map((b) => b.innerText.trim()).filter(Boolean).slice(0, 20));
  console.log('BOTONES:', JSON.stringify(buttons));
  await ctx.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

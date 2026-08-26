const { chromium } = require('playwright-core');
(async () => {
  const ctx = await chromium.launchPersistentContext('C:/Users/susecomp/projects/escuela-virtual-ia/.deploy-profile', {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = ctx.pages()[0] || (await ctx.newPage());
  page.setDefaultTimeout(20000);
  await page.goto('https://supabase.com/dashboard/organizations', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  console.log('URL:', page.url().slice(0, 100));
  const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  console.log('TEXTO (500c):', body.slice(0, 500));
  const buttons = await page.$$eval('button, a[role="button"]', (bs) => bs.map((b) => b.innerText.trim()).filter(Boolean).slice(0, 20));
  console.log('BOTONES:', JSON.stringify(buttons));
  await ctx.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

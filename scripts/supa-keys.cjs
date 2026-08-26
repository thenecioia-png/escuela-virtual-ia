const { chromium } = require('playwright-core');
(async () => {
  const ctx = await chromium.launchPersistentContext('C:/Users/susecomp/projects/escuela-virtual-ia/.deploy-profile', {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = ctx.pages()[0] || (await ctx.newPage());
  page.setDefaultTimeout(20000);
  await page.goto('https://supabase.com/dashboard/project/rdnrrdpodkntmdmwoujl/settings/api-keys', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  console.log('TEXTO (900c):', body.slice(0, 900));
  const html = await page.content();
  const keys = [...new Set([...html.matchAll(/(eyJ[A-Za-z0-9_\-.]{50,}|sb_publishable_[A-Za-z0-9_\-]+)/g)].map((m) => m[1]))];
  console.log('KEYS encontradas:', keys.map((k) => k.slice(0, 25) + '…(' + k.length + ')'));
  require('fs').writeFileSync('scripts/supa-keys.json', JSON.stringify(keys));
  await ctx.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

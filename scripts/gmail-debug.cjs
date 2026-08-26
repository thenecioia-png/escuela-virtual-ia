const { chromium } = require('playwright-core');
(async () => {
  const ctx = await chromium.launchPersistentContext('C:/Users/susecomp/projects/escuela-virtual-ia/.deploy-profile', {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = ctx.pages()[0] || (await ctx.newPage());
  await page.goto('https://mail.google.com/mail/u/0/#search/from%3Asupabase+newer_than%3A1d', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  const row = page.locator('tr.zA').first();
  if (await row.isVisible().catch(() => false)) {
    await row.click(); await page.waitForTimeout(5000);
    console.log('ASUNTO:', await page.locator('h2').first().innerText().catch(() => '?'));
    const links = await page.$$eval('a', (as) => as.map((a) => a.href).filter((h) => h.startsWith('http')));
    console.log('TODOS LOS LINKS:', JSON.stringify(links.slice(0, 8), null, 1));
  } else console.log('sin correos recientes');
  await ctx.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

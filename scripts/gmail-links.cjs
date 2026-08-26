const { chromium } = require('playwright-core');
(async () => {
  const ctx = await chromium.launchPersistentContext('C:/Users/susecomp/projects/escuela-virtual-ia/.deploy-profile', {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = ctx.pages()[0] || (await ctx.newPage());
  await page.goto('https://mail.google.com/mail/u/0/#search/' + encodeURIComponent('subject:"Reset your password" newer_than:2d'), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  await page.locator('tr.zA').first().click();
  await page.waitForTimeout(9000);
  const html = await page.content();
  const hrefs = [...new Set([...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]))]
    .filter((h) => h.startsWith('http') && !/google|gstatic/.test(h));
  console.log(JSON.stringify(hrefs, null, 1));
  await ctx.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

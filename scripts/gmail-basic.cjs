const { chromium } = require('playwright-core');
(async () => {
  const ctx = await chromium.launchPersistentContext('C:/Users/susecomp/projects/escuela-virtual-ia/.deploy-profile', {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = ctx.pages()[0] || (await ctx.newPage());
  await page.goto('https://mail.google.com/mail/h/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  // buscar
  await page.locator('input[name="q"]').fill('subject:"Reset your password"');
  await page.locator('input[type="submit"][value*="earch"], button:has-text("Search")').first().click();
  await page.waitForTimeout(5000);
  // abrir primer resultado
  await page.locator('table tr td a, .ts').first().click().catch(() => {});
  await page.waitForTimeout(5000);
  const html = await page.content();
  const hrefs = [...new Set([...html.matchAll(/href="?([^">\s]+)"?/g)].map((m) => m[1]))]
    .filter((h) => h.startsWith('http') && !/google|gstatic/.test(h));
  console.log(JSON.stringify(hrefs.slice(0, 10), null, 1));
  await ctx.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

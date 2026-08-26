// Copiar una API key existente de AI Studio al portapapeles y leerla
const { chromium } = require('playwright-core');
const PROFILE = 'C:/Users/susecomp/projects/escuela-virtual-ia/.deploy-profile';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const page = ctx.pages()[0] || (await ctx.newPage());
  await page.goto('https://aistudio.google.com/app/apikey', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const copyBtns = page.locator('button:has-text("content_copy")');
  console.log('keys visibles:', await copyBtns.count());
  await copyBtns.first().click();
  await page.waitForTimeout(1500);
  const key = await page.evaluate(() => navigator.clipboard.readText());
  console.log('KEY:', key && key.startsWith('AIza') ? key : '(no copiada): ' + key);
  await ctx.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

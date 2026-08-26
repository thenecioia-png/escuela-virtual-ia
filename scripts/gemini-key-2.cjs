// Con la sesión de Google del usuario: crear/obtener API key de Gemini en AI Studio
const { chromium } = require('playwright-core');
const PROFILE = 'C:/Users/susecomp/projects/escuela-virtual-ia/.deploy-profile';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });
  const page = ctx.pages()[0] || (await ctx.newPage());

  // 0. confirmar sesión
  await page.goto('https://myaccount.google.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  console.log('google sesión:', page.url().includes('signin') || page.url().includes('ServiceLogin') ? 'NO' : 'SÍ', page.url().slice(0, 60));

  await page.goto('https://aistudio.google.com/app/apikey', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  console.log('aistudio URL:', page.url().slice(0, 80));
  const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  console.log('TEXTO (500c):', body.slice(0, 500));
  const buttons = await page.$$eval('button', (bs) => bs.map((b) => b.innerText.trim()).filter(Boolean).slice(0, 25));
  console.log('BOTONES:', JSON.stringify(buttons));
  await ctx.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

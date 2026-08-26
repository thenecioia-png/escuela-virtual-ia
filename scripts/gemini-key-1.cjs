// Paso 1: obtener API key de Gemini en AI Studio con la sesión de Google
const { chromium } = require('playwright-core');
const PROFILE = 'C:/Users/susecomp/projects/escuela-virtual-ia/.chrome-profile';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--disable-blink-features=AutomationControlled'],
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });
  const page = await ctx.newPage();
  await page.goto('https://aistudio.google.com/app/apikey', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  console.log('URL:', page.url());
  const body = await page.locator('body').innerText();
  console.log('TEXTO (600c):', body.replace(/\s+/g, ' ').slice(0, 600));
  const buttons = await page.$$eval('button', (bs) => bs.map((b) => b.innerText.trim()).filter(Boolean).slice(0, 20));
  console.log('BOTONES:', JSON.stringify(buttons));
  await ctx.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

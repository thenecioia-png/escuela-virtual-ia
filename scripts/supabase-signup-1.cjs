// Explorar opciones de signup de Supabase con la sesión activa
const { chromium } = require('playwright-core');
const PROFILE = 'C:/Users/susecomp/projects/escuela-virtual-ia/.deploy-profile';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });
  const page = ctx.pages()[0] || (await ctx.newPage());
  await page.goto('https://supabase.com/dashboard/sign-up', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  console.log('URL:', page.url().slice(0, 80));
  const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  console.log('TEXTO (400c):', body.slice(0, 400));
  const buttons = await page.$$eval('button, a', (bs) => bs.map((b) => b.innerText.trim()).filter(Boolean).slice(0, 25));
  console.log('BOTONES:', JSON.stringify(buttons));
  await ctx.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

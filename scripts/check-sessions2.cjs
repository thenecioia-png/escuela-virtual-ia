// Chequeo preciso de sesiones usando marcadores conocidos
const { chromium } = require('playwright-core');
const PROFILE = 'C:/Users/susecomp/projects/escuela-virtual-ia/.chrome-profile';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });
  const page = await ctx.newPage();

  // GitHub: meta user-login solo existe logueado
  await page.goto('https://github.com', { waitUntil: 'domcontentloaded' });
  const ghUser = await page.getAttribute('meta[name="user-login"]', 'content').catch(() => null);
  console.log('github usuario:', ghUser || 'NO logueado');

  // OpenRouter: /settings/keys redirige a sign-in si no hay sesión
  await page.goto('https://openrouter.ai/settings/keys', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  console.log('openrouter:', page.url().includes('sign-in') ? 'NO logueado' : 'LOGUEADO', '|', page.url().slice(0, 60));

  // Google: accounts check
  await page.goto('https://myaccount.google.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  console.log('google:', page.url().includes('signin') || page.url().includes('ServiceLogin') ? 'NO logueado' : 'LOGUEADO', '|', page.url().slice(0, 60));

  // Cloudflare: esperar el challenge y ver URL final
  await page.goto('https://dash.cloudflare.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  console.log('cloudflare:', page.url(), '|', (await page.title()).slice(0, 50));

  await ctx.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

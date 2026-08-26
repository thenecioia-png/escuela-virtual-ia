// Detecta sesiones activas en el perfil real de Chrome del usuario
const { chromium } = require('playwright-core');

(async () => {
  const ctx = await chromium.launchPersistentContext(
    'C:/Users/susecomp/projects/escuela-virtual-ia/.chrome-profile',
    {
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      headless: true,
      args: ['--headless=new'],
    }
  );
  const page = await ctx.newPage();
  const checks = [
    ['github', 'https://github.com', 'meta[name="user-login"]'],
    ['supabase', 'https://supabase.com/dashboard', null],
    ['vercel', 'https://vercel.com/dashboard', null],
    ['openrouter', 'https://openrouter.ai/', null],
    ['cloudflare', 'https://dash.cloudflare.com/', null],
    ['google-ai-studio', 'https://aistudio.google.com/', null],
  ];
  for (const [name, url, sel] of checks) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(2500);
      const finalUrl = page.url();
      let logged = !/login|signin|sign-in|auth/.test(finalUrl);
      if (sel) logged = (await page.$(sel)) !== null;
      const title = await page.title();
      console.log(`${name}: ${logged ? 'SESIÓN?' : 'sin sesión'} | ${finalUrl.slice(0, 70)} | ${title.slice(0, 50)}`);
    } catch (e) {
      console.log(`${name}: ERROR ${e.message.slice(0, 60)}`);
    }
  }
  await ctx.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

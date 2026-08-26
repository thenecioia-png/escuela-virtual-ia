const { chromium } = require('playwright-core');
(async () => {
  const ctx = await chromium.launchPersistentContext('C:/Users/susecomp/projects/escuela-virtual-ia/.deploy-profile', {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = ctx.pages()[0] || (await ctx.newPage());
  page.setDefaultTimeout(15000);
  // Desactivar "Confirm email" para que el registro de padres no pida verificación
  await page.goto('https://supabase.com/dashboard/project/rdnrrdpodkntmdmwoujl/auth/providers?provider=Email', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  const i = body.search(/Confirm email/i);
  console.log('SECCIÓN:', body.slice(i - 50, i + 250));
  // toggle Confirm email off si está activo
  const toggle = page.locator('button[role="switch"][aria-checked="true"]').filter({ hasText: '' });
  const switches = await page.$$eval('button[role="switch"]', (els) => els.map((e) => ({ checked: e.getAttribute('aria-checked'), label: e.closest('div')?.parentElement?.innerText?.slice(0, 60) })));
  console.log('SWITCHES:', JSON.stringify(switches));
  await ctx.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

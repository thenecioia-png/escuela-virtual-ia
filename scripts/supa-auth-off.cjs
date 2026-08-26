const { chromium } = require('playwright-core');
(async () => {
  const ctx = await chromium.launchPersistentContext('C:/Users/susecomp/projects/escuela-virtual-ia/.deploy-profile', {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = ctx.pages()[0] || (await ctx.newPage());
  page.setDefaultTimeout(15000);
  await page.goto('https://supabase.com/dashboard/project/rdnrrdpodkntmdmwoujl/auth/providers?provider=Email', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  // click en el switch "Confirm email"
  const switches = page.locator('[role="dialog"] button[role="switch"]');
  const n = await switches.count();
  for (let i = 0; i < n; i++) {
    const sw = switches.nth(i);
    const label = await sw.evaluate((e) => e.closest('div')?.parentElement?.innerText || '');
    if (/Confirm email/i.test(label) && (await sw.getAttribute('aria-checked')) === 'true') {
      await sw.click();
      console.log('Confirm email → OFF');
      break;
    }
  }
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: /Save/i }).click();
  await page.waitForTimeout(4000);
  console.log('guardado:', (await page.locator('body').innerText()).match(/saved|Success|actualizado/i)?.[0] || 'verificar');
  await ctx.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

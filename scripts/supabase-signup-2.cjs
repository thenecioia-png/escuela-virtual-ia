// Signup Supabase con email + verificación vía Gmail (misma sesión de Google)
const { chromium } = require('playwright-core');
const PROFILE = 'C:/Users/susecomp/projects/escuela-virtual-ia/.deploy-profile';
const EMAIL = 'thenecioia@gmail.com';
const PASSWORD = process.env.SUPA_PW;

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });
  const page = ctx.pages()[0] || (await ctx.newPage());
  page.setDefaultTimeout(15000);

  await page.goto('https://supabase.com/dashboard/sign-up', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.locator('input[type="email"], input[name="email"]').first().fill(EMAIL);
  await page.locator('input[type="password"]').first().fill(PASSWORD);
  await page.getByRole('button', { name: /^Sign up$/i }).click();
  await page.waitForTimeout(6000);
  const body1 = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  console.log('TRAS SIGNUP (300c):', body1.slice(0, 300));
  console.log('URL:', page.url().slice(0, 80));

  // Verificar por Gmail
  await page.goto('https://mail.google.com/mail/u/0/#search/from%3Asupabase', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  const mails = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  console.log('GMAIL (300c):', mails.slice(0, 300));

  // abrir el primer correo de la búsqueda
  const row = page.locator('tr.zA').first();
  if (await row.isVisible().catch(() => false)) {
    await row.click();
    await page.waitForTimeout(5000);
    const links = await page.$$eval('a[href*="supabase"], a[href*="verify"], a[href*="confirm"]', (as) => as.map((a) => a.href).slice(0, 5));
    console.log('LINKS:', JSON.stringify(links));
  } else {
    console.log('No se encontró correo de Supabase todavía');
  }
  await ctx.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

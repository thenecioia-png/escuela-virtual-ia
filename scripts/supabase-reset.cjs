const { chromium } = require('playwright-core');
const PROFILE = 'C:/Users/susecomp/projects/escuela-virtual-ia/.deploy-profile';
(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });
  const page = ctx.pages()[0] || (await ctx.newPage());
  page.setDefaultTimeout(20000);

  // Buscar el correo más reciente de Supabase (recovery)
  await page.goto('https://mail.google.com/mail/u/0/#search/subject%3A%22Reset+your+password%22+newer_than%3A2d', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  const row = page.locator('tr.zA').first();
  if (!(await row.isVisible().catch(() => false))) { console.log('NO HAY CORREO reciente de Supabase'); await ctx.close(); return; }
  await row.click();
  await page.waitForTimeout(5000);
  const links = await page.$$eval('a', (as) => as.map((a) => a.href).filter((h) => h.startsWith('http') && !h.includes('google.com')));
  const recovery = links.find((l) => /supabase/i.test(l));
  console.log('RECOVERY LINK:', recovery ? recovery.slice(0, 120) : 'no encontrado', '| total links:', links.length);
  if (!recovery) { await ctx.close(); return; }

  // Abrir el enlace y poner contraseña nueva
  await page.goto(recovery, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  console.log('URL recovery:', page.url().slice(0, 100));
  console.log('TEXTO (300c):', (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 300));
  const pwInputs = page.locator('input[type="password"]');
  console.log('inputs password:', await pwInputs.count());
  if ((await pwInputs.count()) >= 1) {
    const NPW = process.env.NEW_PW;
    await pwInputs.nth(0).fill(NPW);
    if ((await pwInputs.count()) >= 2) await pwInputs.nth(1).fill(NPW);
    await page.locator('button[type="submit"], button:has-text("Update"), button:has-text("Save"), button:has-text("Confirm")').first().click();
    await page.waitForTimeout(8000);
    console.log('URL final:', page.url().slice(0, 100));
    console.log('TEXTO final (300c):', (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 300));
  }
  await ctx.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

const { chromium } = require('playwright-core');
(async () => {
  const ctx = await chromium.launchPersistentContext('C:/Users/susecomp/projects/escuela-virtual-ia/.deploy-profile', {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = ctx.pages()[0] || (await ctx.newPage());
  page.setDefaultTimeout(20000);
  await page.goto('https://supabase.com/dashboard/new/ysvnvtkiwmhgrieakxch', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  await page.locator('input[name="projectName"]').fill('escuela-virtual');
  await page.locator('input[name="dbPass"]').fill(process.env.DB_PW);
  // región: elegir el selector "Americas" → West/East US; dejar default recomendado
  await page.getByRole('button', { name: /Create new project/i }).click();
  console.log('creando proyecto…');
  // esperar redirección al proyecto (puede tardar 1-2 min)
  for (let i = 0; i < 24; i++) {
    await page.waitForTimeout(5000);
    const u = page.url();
    if (/dashboard\/project\/[a-z]+/.test(u) && !u.includes('/new')) { console.log('PROYECTO URL:', u); break; }
    if (i % 4 === 3) console.log('esperando…', u.slice(0, 80));
  }
  const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  console.log('TEXTO (400c):', body.slice(0, 400));
  await ctx.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

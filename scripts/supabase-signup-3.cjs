// Signup Supabase con email — versión detallada
const { chromium } = require('playwright-core');
const PROFILE = 'C:/Users/susecomp/projects/escuela-virtual-ia/.deploy-profile';
const EMAIL = 'thenecioia@gmail.com';
const PASSWORD = process.env.SUPA_PW;

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false,
  });
  const page = ctx.pages()[0] || (await ctx.newPage());
  page.setDefaultTimeout(15000);

  await page.goto('https://supabase.com/dashboard/sign-up', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const inputs = await page.$$eval('form input', (els) => els.map((e) => ({ name: e.name, type: e.type, id: e.id })));
  console.log('INPUTS:', JSON.stringify(inputs));

  await page.locator('form input').first().fill(EMAIL);
  await page.locator('form input[type="password"]').first().fill(PASSWORD);
  await page.waitForTimeout(1000);
  const formText = (await page.locator('form').innerText()).replace(/\s+/g, ' ');
  console.log('FORM TRAS LLENAR (300c):', formText.slice(0, 300));

  const btn = page.locator('form button[type="submit"], form button:has-text("Sign up")').first();
  console.log('botón disabled?', await btn.isDisabled());
  await btn.click();
  await page.waitForTimeout(8000);
  await page.screenshot({ path: 'supa-signup.png' });
  const alerts = await page.$$eval('[role="alert"], .text-destructive, .text-red-500, [class*="error"]', (els) => els.map((e) => e.innerText).filter(Boolean));
  console.log('ALERTAS:', JSON.stringify(alerts));
  console.log('URL tras submit:', page.url().slice(0, 100));
  console.log('TEXTO (300c):', (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 300));
  await ctx.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

const { chromium } = require('playwright-core');
const PROFILE = 'C:/Users/susecomp/projects/escuela-virtual-ia/.deploy-profile';
(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });
  const page = ctx.pages()[0] || (await ctx.newPage());
  page.setDefaultTimeout(15000);
  await page.goto('https://supabase.com/dashboard/sign-in', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.locator('input[name="email"], input[type="email"]').first().fill('thenecioia@gmail.com');
  await page.locator('input[type="password"]').first().fill(process.env.SUPA_PW);
  await page.locator('form button[type="submit"], form button:has-text("Sign in")').first().click();
  await page.waitForTimeout(9000);
  console.log('URL:', page.url().slice(0, 100));
  console.log('TEXTO (400c):', (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 400));
  await ctx.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

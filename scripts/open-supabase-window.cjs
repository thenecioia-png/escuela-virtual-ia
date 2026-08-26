const { chromium } = require('playwright-core');
const PROFILE = 'C:/Users/susecomp/projects/escuela-virtual-ia/.deploy-profile';
(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false,
    viewport: { width: 1100, height: 800 },
  });
  const page = ctx.pages()[0] || (await ctx.newPage());
  await page.goto('https://supabase.com/dashboard/sign-up', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.locator('input[name="email"], input[type="email"]').first().fill('thenecioia@gmail.com');
  await page.locator('input[type="password"]').first().fill(process.env.SUPA_PW);
  await new Promise(() => {}); // queda abierta
})();

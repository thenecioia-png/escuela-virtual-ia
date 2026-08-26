const { chromium } = require('playwright-core');
(async () => {
  const ctx = await chromium.launchPersistentContext('C:/Users/susecomp/projects/escuela-virtual-ia/.deploy-profile', {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false, viewport: { width: 1100, height: 800 } });
  const page = ctx.pages()[0] || (await ctx.newPage());
  await page.goto('https://mail.google.com/mail/u/0/#search/' + encodeURIComponent('from:supabase subject:"Reset your password"'));
  await new Promise(() => {});
})();

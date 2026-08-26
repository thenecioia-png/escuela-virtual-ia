const { chromium } = require('playwright-core');
(async () => {
  const ctx = await chromium.launchPersistentContext('C:/Users/susecomp/projects/escuela-virtual-ia/.deploy-profile', {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = ctx.pages()[0] || (await ctx.newPage());
  await page.goto('https://supabase.com/dashboard/org/the-necio', { waitUntil: 'domcontentloaded' }).catch(()=>{});
  await page.waitForTimeout(6000);
  if (!page.url().includes('the-necio')) {
    await page.goto('https://supabase.com/dashboard/organizations', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    await page.getByText('THE NECIO').first().click();
    await page.waitForTimeout(6000);
  }
  console.log('URL:', page.url().slice(0, 100));
  const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  console.log('TEXTO (800c):', body.slice(0, 800));
  await ctx.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

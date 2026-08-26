const { chromium } = require('playwright-core');
(async () => {
  const ctx = await chromium.launchPersistentContext('C:/Users/susecomp/projects/escuela-virtual-ia/.deploy-profile', {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = ctx.pages()[0] || (await ctx.newPage());
  page.setDefaultTimeout(15000);
  await page.goto('https://supabase.com/dashboard/account/tokens', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  await page.getByRole('button', { name: /Generate new token/i }).click();
  await page.waitForTimeout(2000);
  const dialog = page.locator('[role="dialog"]');
  await dialog.locator('input').first().fill('escuela-virtual-deploy');
  await dialog.getByRole('button', { name: /Generate/i }).click();
  await page.waitForTimeout(4000);
  // el token se muestra una vez; copiar
  const html = await page.content();
  const m = html.match(/sbp_[a-f0-9]{30,}/);
  if (m) { require('fs').writeFileSync('scripts/supa-pat.txt', m[0]); console.log('TOKEN OK:', m[0].slice(0, 12) + '…'); }
  else {
    const body = (await dialog.innerText()).replace(/\s+/g, ' ');
    console.log('DIALOG (400c):', body.slice(0, 400));
    // intentar botón copiar
    const copyBtn = dialog.locator('button:has-text("Copy")');
    if (await copyBtn.isVisible().catch(() => false)) {
      await ctx.grantPermissions(['clipboard-read'], 'https://supabase.com');
      await copyBtn.click();
      await page.waitForTimeout(1000);
      const tok = await page.evaluate(() => navigator.clipboard.readText());
      require('fs').writeFileSync('scripts/supa-pat.txt', tok);
      console.log('TOKEN (clipboard):', tok.slice(0, 12) + '…');
    }
  }
  await ctx.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

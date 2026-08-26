const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
  const schema = fs.readFileSync('supabase/schema.sql', 'utf-8');
  const ctx = await chromium.launchPersistentContext('C:/Users/susecomp/projects/escuela-virtual-ia/.deploy-profile', {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = ctx.pages()[0] || (await ctx.newPage());
  page.setDefaultTimeout(30000);
  await page.goto('https://supabase.com/dashboard/project/rdnrrdpodkntmdmwoujl/sql/new', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  // cerrar modal de aviso si aparece
  const modalBtn = page.locator('[data-state="open"] button:has-text("Got it"), [data-state="open"] button:has-text("Close"), [data-state="open"] button:has-text("Entendido")').first();
  if (await modalBtn.isVisible({ timeout: 5000 }).catch(() => false)) await modalBtn.click();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  // editor Monaco
  await page.locator('.view-lines').first().click();
  await page.keyboard.insertText(schema);
  await page.waitForTimeout(1000);
  // botón Run
  await page.getByRole('button', { name: /^Run$/i }).first().click();
  await page.waitForTimeout(12000);
  const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  const i = body.search(/success|error|Error|completed/i);
  console.log('RESULTADO:', body.slice(Math.max(0, i - 100), i + 300) || body.slice(-400));
  await ctx.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

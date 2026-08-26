const { chromium } = require('playwright-core');
(async () => {
  const ctx = await chromium.launchPersistentContext('C:/Users/susecomp/projects/escuela-virtual-ia/.deploy-profile', {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = ctx.pages()[0] || (await ctx.newPage());
  for (const q of ['from:supabase newer_than:2d', 'subject:(restablecer OR reset OR recover OR confirma) newer_than:2d', 'newer_than:1d']) {
    await page.goto('https://mail.google.com/mail/u/0/#search/' + encodeURIComponent(q), { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);
    const rows = await page.$$eval('tr.zA', (trs) => trs.map((t) => t.innerText.replace(/\n/g, ' | ').slice(0, 120)).slice(0, 5));
    console.log('Q:', q, '→', rows.length, 'correos');
    rows.forEach((r) => console.log('  -', r));
  }
  await ctx.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

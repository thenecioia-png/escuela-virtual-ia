const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => pageErrors.push(String(e)));
  await page.goto('https://escuela-virtual-ia.surge.sh/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2500);
  const body = (await page.locator('body').innerText()).slice(0, 700);
  console.log('=== BODY (primeros 700 chars) ===');
  console.log(body);
  console.log('=== ERRORES CONSOLA ===');
  console.log(JSON.stringify(consoleErrors, null, 2));
  console.log('=== PAGE ERRORS ===');
  console.log(JSON.stringify(pageErrors, null, 2));
  await browser.close();
})();

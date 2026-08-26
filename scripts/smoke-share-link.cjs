// Prueba del link compartido: abrir ?f=<familyId> sin sesión → picker → PIN remoto → dashboard
const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.setDefaultTimeout(15000);

  await page.goto('https://escuela-virtual-ia.surge.sh/?f=3174f69b-5e1e-4ece-8d01-9bfda021d816', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);
  const body1 = await page.locator('body').innerText();
  console.log('1 picker compartido con estudiante:', /Prueba Nube/.test(body1), '| sin botón agregar:', !/Agregar estudiante/.test(body1));

  // tocar el perfil → pide PIN
  await page.getByText('Prueba Nube').first().click();
  await page.waitForTimeout(600);
  console.log('2 pide PIN:', /PIN/.test(await page.locator('body').innerText()));

  // PIN incorrecto primero (a propósito)
  for (const d of '9999') await page.getByRole('button', { name: d, exact: true }).click();
  await page.waitForTimeout(2500);
  console.log('3 PIN incorrecto rechazado:', /incorrecto/i.test(await page.locator('body').innerText()));

  // PIN correcto
  for (const d of '4321') await page.getByRole('button', { name: d, exact: true }).click();
  await page.waitForTimeout(4000);
  console.log('4 entra al dashboard:', /¡Hola, Prueba Nube/.test(await page.locator('body').innerText()));

  console.log('ERRORES:', errors.length ? errors : 'ninguno');
  await browser.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

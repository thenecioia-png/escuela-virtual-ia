// Prueba de humo del flujo demo: welcome → auth demo → picker → crear estudiante
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push('CONSOLE: ' + m.text()));

  await page.goto('http://localhost:5199', { waitUntil: 'networkidle' });
  console.log('1 welcome:', await page.getByRole('button', { name: /Empezar/i }).isVisible());

  await page.getByRole('button', { name: /Empezar/i }).click();
  console.log('2 auth demo:', await page.getByRole('button', { name: /modo demo/i }).isVisible());

  await page.getByRole('button', { name: /modo demo/i }).click();
  await page.waitForTimeout(800);
  const addBtn = page.getByRole('button', { name: /Agregar estudiante/i });
  console.log('3 picker visible:', await addBtn.isVisible());

  await addBtn.click();
  await page.waitForTimeout(500);
  console.log('4 paso país:', await page.getByText(/qué país estudias/i).isVisible());

  // elegir República Dominicana
  await page.getByRole('button', { name: /República Dominicana/i }).click();
  await page.getByRole('button', { name: /Siguiente|Continuar|→/i }).first().click();
  await page.waitForTimeout(400);
  console.log('5 paso grado:', await page.getByText(/grado/i).first().isVisible());

  console.log('ERRORES:', errors.length ? errors : 'ninguno');
  await browser.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

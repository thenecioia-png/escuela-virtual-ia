// Reproducir el flujo de lección en vivo y capturar si la sesión llega a Supabase
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage();
  const netErrors = [];
  page.on('response', (r) => {
    if (r.url().includes('supabase') && r.status() >= 400) {
      netErrors.push(`${r.status()} ${r.url().slice(0, 90)}`);
    }
  });
  page.setDefaultTimeout(15000);

  // Login padre de prueba
  await page.goto('https://escuela-virtual-ia.surge.sh', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Empezar/i }).click();
  await page.waitForTimeout(800);
  await page.locator('input[type="email"]').fill('padre.prueba.1787780067900@gmail.com');
  await page.locator('input[type="password"]').fill('PruebaPadre-2026!');
  await page.getByRole('button', { name: /^Entrar$/i }).click();
  await page.waitForTimeout(5000);

  // Elegir estudiante Prueba Nube (PIN 4321)
  await page.getByText('Prueba Nube').first().click();
  await page.waitForTimeout(800);
  for (const d of '4321') await page.getByRole('button', { name: d, exact: true }).click();
  await page.waitForTimeout(4000);
  console.log('dashboard:', /¡Hola, Prueba Nube/.test(await page.locator('body').innerText()));

  // Si aparece check-in emocional al iniciar lección, completarlo después
  // Iniciar primera lección disponible
  const startBtn = page.locator('button:has-text("Empezar"), button:has-text("Comenzar"), button:has-text("Jugar"), [class*="lesson"] button').first();
  const dashText = await page.locator('body').innerText();
  console.log('botones dashboard:', dashText.match(/Empezar|Comenzar|Jugar|Aprender/g)?.slice(0, 3));
  await page.getByText('Aprender').first().click().catch(() => {});
  await page.waitForTimeout(1500);
  console.log('URL/texto learn:', (await page.locator('body').innerText()).slice(0, 200).replace(/\n+/g, ' | '));

  console.log('ERRORES RED SUPABASE:', netErrors.length ? netErrors : 'ninguno');
  await browser.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

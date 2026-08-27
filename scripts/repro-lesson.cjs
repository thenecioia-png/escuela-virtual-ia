// Jugar una lección completa y verificar que la sesión se inserta en Supabase
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage();
  const calls = [];
  page.on('response', async (r) => {
    if (r.url().includes('/rest/v1/sessions') || r.url().includes('/rest/v1/grades_record')) {
      let body = '';
      try { body = (await r.text()).slice(0, 200); } catch {}
      calls.push(`${r.request().method()} ${r.url().split('/rest/v1/')[1].split('?')[0]} → ${r.status()} ${body}`);
    }
  });
  page.setDefaultTimeout(12000);

  await page.goto('https://escuela-virtual-ia.surge.sh', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Empezar/i }).click();
  await page.waitForTimeout(800);
  await page.locator('input[type="email"]').fill('padre.prueba.1787780067900@gmail.com');
  await page.locator('input[type="password"]').fill('PruebaPadre-2026!');
  await page.getByRole('button', { name: /^Entrar$/i }).click();
  await page.waitForTimeout(5000);
  await page.getByText('Prueba Nube').first().click();
  await page.waitForTimeout(800);
  for (const d of '4321') await page.getByRole('button', { name: d, exact: true }).click();
  await page.waitForTimeout(3500);

  // Desactivar check-in emocional para esta prueba (aislar el flujo de lección)
  await page.evaluate(() => {
    const key = Object.keys(localStorage).find((k) => k.endsWith('students'));
    const arr = JSON.parse(localStorage.getItem(key));
    arr.forEach((st) => { st.accessibility = { ...st.accessibility, emotionalCheckFrequency: 'never' }; });
    localStorage.setItem(key, JSON.stringify(arr));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  // volver a entrar (puede ir directo al dashboard si la sesión sigue activa)
  await page.waitForTimeout(2000);
  const bodyR = await page.locator('body').innerText();
  if (!/¡Hola,/.test(bodyR)) {
    await page.getByText('Prueba Nube').first().click();
    await page.waitForTimeout(800);
    if (await page.getByRole('button', { name: '4', exact: true }).isVisible({ timeout: 2000 }).catch(() => false)) {
      for (const d of '4321') await page.getByRole('button', { name: d, exact: true }).click();
    }
    await page.waitForTimeout(3000);
  }

  // Iniciar la primera lección
  await page.locator('button:has-text("Empezar")').first().click();
  await page.waitForTimeout(2000);

  // Flujo completo: check-in emocional (varios pasos) + preguntas de la lección
  for (let i = 0; i < 30; i++) {
    const body = await page.locator('body').innerText();
    if (/Respondiste|Completaste|¡Lo lograste/i.test(body)) break;
    // botón de avance explícito
    const nav = page.getByRole('button', { name: /Siguiente|Continuar|Verificar|Comprobar|Empezar la lección|Estoy listo/i }).last();
    const opt = page.locator('.choice-btn').first();
    if (await opt.isVisible({ timeout: 1200 }).catch(() => false)) {
      await opt.click();
      await page.waitForTimeout(1300);
      const navBtn = page.getByRole('button', { name: /Siguiente|Continuar|Verificar|Comprobar/i }).first();
      if (await navBtn.isVisible({ timeout: 800 }).catch(() => false)) await navBtn.click().catch(() => {});
    } else if (await nav.isEnabled({ timeout: 1200 }).catch(() => false)) {
      await nav.click().catch(() => {});
    } else {
      // opción genérica de check-in (botones grandes con emoji)
      const big = page.locator('button').filter({ hasText: /🐢|🌿|⚡|😊|🙂|😢|😟|😄|😡|😴/ }).first();
      if (await big.isVisible({ timeout: 1000 }).catch(() => false)) await big.click().catch(() => {});
    }
    await page.waitForTimeout(900);
  }
  await page.waitForTimeout(2500);
  const end = await page.locator('body').innerText();
  console.log('lección terminada:', /Respondiste|Completaste|lograste/i.test(end), '|', end.slice(0, 150).replace(/\n+/g, ' | '));

  // Volver al inicio si hace falta
  await page.getByRole('button', { name: /Volver|Inicio|Continuar|Genial/i }).first().click({ timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(4000);

  console.log('LLAMADAS A LA NUBE:');
  calls.forEach((c) => console.log(' ', c));
  await browser.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

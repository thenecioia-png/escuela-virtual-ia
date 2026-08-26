// Prueba completa: crear estudiante nuevo (país→grado→...→PIN) + needs assessment + dashboard
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

  await page.goto('http://localhost:5199', { waitUntil: 'networkidle' });
  // Entrar: si hay portada, welcome → auth → demo; si ya hay sesión, cae en picker
  if (await page.getByRole('button', { name: /Empezar/i }).isVisible({timeout:1500}).catch(() => false)) {
    await page.getByRole('button', { name: /Empezar/i }).click();
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: /modo demo/i }).click();
    await page.waitForTimeout(600);
  }
  await page.getByRole('button', { name: /Agregar estudiante/i }).click();
  await page.waitForTimeout(400);

  const next = async () => {
    await page.getByRole('button', { name: /Siguiente|Continuar/i }).first().click();
    await page.waitForTimeout(350);
  };

  // paso 0: país
  await page.getByRole('button', { name: /República Dominicana/i }).click(); await next();
  // paso 1: grado (el primero disponible)
  const gradeBtns = page.locator('button:has-text("°"), button:has-text("grado"), button:has-text("Grado")');
  console.log('grados ofrecidos:', await gradeBtns.count());
  await gradeBtns.first().click(); await next();
  // paso 2: nombre (con ñ y acento a propósito)
  await page.locator('input').first().fill('Ñoño Pérez'); await next();
  // paso 3: edad
  await page.locator('input').first().fill('8'); await next();
  // paso 4: avatar (primero)
  await page.locator('button:has-text("🦉"), button:has-text("🦊")').first().click().catch(() => {});
  await next();
  // paso 5: intereses (primero)
  await page.getByRole('button', { name: /Animales/i }).click(); await next();
  // paso 6: PIN
  await page.locator('input').first().fill('1234');
  await page.getByRole('button', { name: /Siguiente|Continuar|Crear|Finalizar/i }).first().click();
  await page.waitForTimeout(600);
  console.log('needs assessment visible:', await page.getByText(/necesidades|aprende|conocer/i).first().isVisible({timeout:1500}).catch(() => false));

  // Recorrer el assessment: welcome → 4 preguntas estilo → 6 necesidades → modelo → completar
  const footerNext = page.getByRole('button', { name: /Continuar|Siguiente|Completar|Finalizar|¡?Empezar/i }).last();
  await footerNext.click().catch(() => {}); // welcome
  await page.waitForTimeout(400);
  for (let i = 0; i < 40; i++) {
    const body = await page.locator('body').innerText();
    if (/Hola,|Dashboard|Tu progreso|Explorar/i.test(body) && !/Conociéndonos/i.test(body)) break;
    const next = page.getByRole('button', { name: /Completar|Finalizar|Continuar|Siguiente|Crear mi aventura/i }).last();
    if (await next.isEnabled({timeout:1500}).catch(() => false)) {
      await next.click().catch(() => {});
      await page.waitForTimeout(450);
      continue;
    }
    const opt = page.locator('.glass-card button').first();
    if (await opt.isVisible({timeout:1500}).catch(() => false)) {
      await opt.click({timeout:2000}).catch(()=>{});
      await page.waitForTimeout(400);
    }
  }
  await page.waitForTimeout(1000);

  console.log('URL/body snippet:', (await page.locator('body').innerText()).slice(0, 300).replace(/\n+/g, ' | '));
  console.log('ERRORES:', errors.length ? errors : 'ninguno');
  await browser.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

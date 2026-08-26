// Verificación FINAL en vivo con nube real: registrar padre, crear estudiante,
// completar lección y confirmar que TODO aterrizó en Supabase.
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.setDefaultTimeout(20000);
  const BASE = 'https://escuela-virtual-ia.surge.sh';
  const EMAIL = `padre.prueba.${Date.now()}@gmail.com`;
  const PASS = 'PruebaPadre-2026!';

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Empezar/i }).click();
  await page.waitForTimeout(800);

  // Registro real de padre (Supabase Auth, autoconfirm activo)
  await page.getByRole('button', { name: /Regístrate/i }).click();
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASS);
  await page.getByRole('button', { name: /Crear cuenta/i }).click();
  await page.waitForTimeout(5000);
  console.log('1 registro padre → picker:', await page.getByRole('button', { name: /Agregar estudiante/i }).isVisible({ timeout: 15000 }));

  // Crear estudiante
  await page.getByRole('button', { name: /Agregar estudiante/i }).click();
  await page.waitForTimeout(500);
  const next = async () => { await page.getByRole('button', { name: /Siguiente|Continuar/i }).first().click(); await page.waitForTimeout(350); };
  await page.getByRole('button', { name: /República Dominicana/i }).click(); await next();
  await page.locator('button:has-text("°"), button:has-text("grado"), button:has-text("Grado")').first().click(); await next();
  await page.locator('input').first().fill('Prueba Nube'); await next();
  await page.locator('input').first().fill('9'); await next();
  await next(); // avatar default
  await page.getByRole('button', { name: /Animales/i }).click(); await next();
  await page.locator('input').first().fill('4321');
  await page.getByRole('button', { name: /Crear|Finalizar|Siguiente|Continuar/i }).first().click();
  await page.waitForTimeout(1000);

  // Assessment
  for (let i = 0; i < 40; i++) {
    const body = await page.locator('body').innerText();
    if (/¡Hola,|Mi Espacio/i.test(body)) break;
    const nextBtn = page.getByRole('button', { name: /Completar|Finalizar|Continuar|Siguiente|Crear mi aventura|Empezar/i }).last();
    if (await nextBtn.isEnabled({ timeout: 1200 }).catch(() => false)) { await nextBtn.click().catch(() => {}); await page.waitForTimeout(400); continue; }
    const opt = page.locator('.glass-card button').first();
    if (await opt.isVisible({ timeout: 1200 }).catch(() => false)) { await opt.click({ timeout: 1500 }).catch(() => {}); await page.waitForTimeout(350); }
  }
  const dash = await page.locator('body').innerText();
  console.log('2 dashboard nube:', /¡Hola, Prueba Nube/i.test(dash));

  // Confirmar datos en Supabase con el JWT del usuario registrado (RLS)
  const check = await page.evaluate(async () => {
    const raw = Object.keys(localStorage).find((k) => k.includes('auth-token'));
    if (!raw) return 'sin token';
    const sess = JSON.parse(localStorage.getItem(raw));
    const token = sess.access_token;
    const url = 'https://rdnrrdpodkntmdmwoujl.supabase.co';
    const key = 'sb_publishable_efldI4UZUgDQaNn6ElwWAA_RJj5Kgaj';
    const h = { Authorization: `Bearer ${token}`, apikey: key };
    const st = await fetch(`${url}/rest/v1/students?select=nombre,country_code,grade_id`, { headers: h }).then((r) => r.json());
    const fam = await fetch(`${url}/rest/v1/families?select=email`, { headers: h }).then((r) => r.json());
    return { familias: fam, estudiantes: st };
  });
  console.log('3 datos en Supabase:', JSON.stringify(check));

  // IA en vivo desde la app: recomendación del panel padre
  await page.getByText('Papá/Mamá').first().click();
  await page.waitForTimeout(3000);
  const parent = await page.locator('body').innerText();
  console.log('4 panel padre con boleta/actividad:', /Boleta|Actividad de hoy/i.test(parent));

  console.log('ERRORES:', errors.length ? errors : 'ninguno');
  console.log('EMAIL de prueba usado:', EMAIL);
  await browser.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

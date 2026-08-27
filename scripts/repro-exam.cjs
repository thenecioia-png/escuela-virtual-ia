// Prueba end-to-end del sistema de exámenes de repaso.
// Usa un estudiante LOCAL (local-test) con 5 sesiones → examDue = true.
// Verifica: buildExam no falla, ExamPlayer renderiza, se responde y termina,
// vuelve al dashboard y guarda la sesión con isExam:true + levelId:'repaso'.
const { chromium } = require('playwright-core');

const URL = 'https://escuela-virtual-ia.surge.sh/';

// Perfil mínimo completo para no romper Dashboard/useAdaptiveEngine
const student = {
  id: 'local-test',
  name: 'Test',
  age: 7,
  avatar: '🦉',
  countryCode: 'do',
  gradeId: '1',
  pin: null,
  learningStyle: 'visual',
  interests: [],
  strengths: [],
  weaknesses: [],
  createdAt: Date.now(),
  onboardingComplete: true,
  needsAssessment: {
    completed: true,
    readingDifficulty: 'none', mathDifficulty: 'none', attentionType: 'typical',
    autismTraits: 'none', sensorySensitivity: [], processingSpeed: 'average',
    memoryType: 'average', emotionalRegulation: 'typical',
  },
  pedagogicalModel: 'adaptive',
  accessibility: {
    highContrast: false, largeText: false, dyslexicFont: false,
    reduceMotion: false, reduceSound: false, showPictograms: false,
    sessionDuration: 15, breakFrequency: 'medium', pacing: 'self',
    positiveReinforcement: 'badges',
  },
  emotionalHistory: [],
};

const SESSION = { date: Date.now(), subjectId: 'math', levelId: 'sumas_restas', score: 80, stars: 4, timeMinutes: 5, answers: [], isExam: false };
const progress = {
  subjectProgress: { math: { sumas_restas: 2 } },
  totalStars: 20,
  streakDays: 2,
  lastStudyDate: Date.now(),
  sessionHistory: [SESSION, SESSION, SESSION, SESSION, SESSION],
  achievements: [],
  timeSpentMinutes: 25,
  answers: { correct: 20, incorrect: 5 },
};

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });
  const page = await browser.newPage();

  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  // Inyectar localStorage ANTES de que cargue la app
  await page.addInitScript(({ student, progress }) => {
    localStorage.setItem('auth_session', JSON.stringify({ email: 'demo@local', familyId: 'demo-family-local', demo: true }));
    localStorage.setItem('students', JSON.stringify([student]));
    localStorage.setItem('active_student', 'local-test');
    localStorage.setItem('progress', JSON.stringify(progress));
  }, { student, progress });

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  const body0 = await page.locator('body').innerText();
  console.log('=== DASHBOARD INICIAL ===');
  console.log(body0.slice(0, 500));
  console.log('');

  // ¿Aparece el botón "Hacer examen"?
  const examBtn = page.getByText('Hacer examen', { exact: true });
  const examDueVisible = (await examBtn.count()) > 0;
  console.log('examDue visible (botón "Hacer examen"):', examDueVisible);

  if (!examDueVisible) {
    console.log('NO apareció el examen. Abortando.');
    console.log('consoleErrors:', JSON.stringify(consoleErrors));
    console.log('pageErrors:', JSON.stringify(pageErrors));
    await browser.close();
    process.exit(1);
  }

  // Entrar al examen
  await examBtn.first().click();
  await page.waitForTimeout(1200);

  const examBody = await page.locator('body').innerText();
  console.log('=== EXAMEN ABIERTO ===');
  console.log(examBody.slice(0, 400));
  console.log('');

  // Responder hasta llegar a la pantalla final
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(500);
    const txt = await page.locator('body').innerText();

    if (txt.includes('Guardar resultado')) {
      console.log(`Terminó el examen (iteración ${i}).`);
      await page.getByText('Guardar resultado', { exact: true }).click();
      await page.waitForTimeout(2000);
      break;
    }

    // Botón de opción sin responder (clase choice-btn solo en estado !showResult)
    const opt = page.locator('button.choice-btn');
    if ((await opt.count()) > 0) {
      await opt.first().click();
      await page.waitForTimeout(400);
      continue;
    }

    // Ya respondida → avanzar
    const next = page.getByText('Siguiente', { exact: true });
    const ver = page.getByText('Ver resultado', { exact: true });
    if ((await next.count()) > 0) { await next.first().click(); continue; }
    if ((await ver.count()) > 0) { await ver.first().click(); continue; }
  }

  // Estado final: volver al dashboard y leer el progreso guardado
  const finalBody = await page.locator('body').innerText();
  console.log('=== DESPUÉS DE GUARDAR (dashboard) ===');
  console.log(finalBody.slice(0, 400));
  console.log('');

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('progress') || '{}'));
  const last = (saved.sessionHistory || []).slice(-1)[0];
  console.log('=== SESIÓN GUARDADA (última) ===');
  console.log(JSON.stringify(last, null, 2));
  console.log('total sesiones:', (saved.sessionHistory || []).length);
  console.log('');

  const okIsExam = last && last.isExam === true;
  const okLevel = last && last.levelId === 'repaso';

  console.log('=== RESULTADO ===');
  console.log('consoleErrors:', JSON.stringify(consoleErrors));
  console.log('pageErrors:', JSON.stringify(pageErrors));
  console.log('isExam correcto:', okIsExam, '| levelId repaso correcto:', okLevel);

  await browser.close();

  const pass = examDueVisible && okIsExam && okLevel && consoleErrors.length === 0 && pageErrors.length === 0;
  console.log(pass ? 'PASS' : 'FAIL');
  process.exit(pass ? 0 : 1);
})();

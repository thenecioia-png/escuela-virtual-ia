// Prueba extendida: sesión sembrada → dashboard (Hoy: X min) → lección completa
// → registro de sesión → panel del padre (boleta, actividad de hoy, alertas).
const { chromium } = require('playwright-core');

const STUDENT = {
  id: 'local-test-1', name: 'María José', age: 7, avatar: '🦊', countryCode: 'do', gradeId: '1',
  pin: null, learningStyle: 'visual', interests: [], strengths: [], weaknesses: [],
  createdAt: Date.now(), onboardingComplete: true,
  needsAssessment: { completed: true, readingDifficulty: 'none', mathDifficulty: 'none', attentionType: 'typical', autismTraits: 'none', sensorySensitivity: [], processingSpeed: 'average', memoryType: 'average', emotionalRegulation: 'typical' },
  pedagogicalModel: 'adaptive',
  accessibility: { highContrast: false, largeText: false, dyslexicFont: false, reduceMotion: false, reduceSound: false, showPictograms: false, sessionDuration: 15, breakFrequency: 'rarely', pacing: 'self', positiveReinforcement: 'badges' },
  emotionalHistory: [{ date: Date.now(), mood: 'happy', energy: 4, frustration: 0 }],
};
const PROGRESS = {
  subjectProgress: { math: { sumas_restas: 1 } }, totalStars: 3, streakDays: 1,
  lastStudyDate: Date.now() - 4 * 86400000,
  sessionHistory: [
    { date: Date.now() - 4 * 86400000, subjectId: 'reading', levelId: 'silabas', score: 80, stars: 4, timeMinutes: 5, answers: [] },
    { date: Date.now(), subjectId: 'math', levelId: 'sumas_restas', score: 90, stars: 4, timeMinutes: 6, answers: [] },
  ],
  achievements: [], timeSpentMinutes: 11, answers: { correct: 8, incorrect: 2 },
};

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push('CONSOLE: ' + m.text()));

  await page.addInitScript(([student, progress]) => {
    localStorage.setItem('evi_auth_session', JSON.stringify({ email: 'demo@local', familyId: 'demo-family-local', demo: true }));
    localStorage.setItem('evi_students', JSON.stringify([student]));
    localStorage.setItem('evi_active_student', student.id);
    localStorage.setItem('evi_progress', JSON.stringify(progress));
  }, [STUDENT, PROGRESS]);

  await page.goto((process.env.APP_URL || 'http://localhost:5199'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // 0. Elegir el perfil en el picker (sin PIN)
  await page.getByText('María José').click();
  await page.waitForTimeout(1200);

  // 1. Dashboard con "Hoy: 6 min" (sembrado) y sección de currículo del grado
  console.log('1 dashboard hoy:', await page.getByText('Hoy: 6 min').isVisible());
  console.log('2 seccion curriculo:', await page.getByText(/Materias de tu grado/).isVisible());
  console.log('3 proximamente (sin IA):', await page.getByText(/próximamente/i).first().isVisible());

  // 2. Jugar una lección hardcodeada completa (Recomendado para ti → primera tarjeta)
  await page.getByText(/Recomendado para ti/i).waitFor();
  await page.locator('button:has-text("Empezar")').first().click();
  await page.waitForTimeout(800);
  // Responder todas las preguntas (elegir siempre la primera opción)
  for (let i = 0; i < 8; i++) {
    const option = page.locator('button.choice-btn').first();
    if (!(await option.isVisible().catch(() => false))) break;
    await option.click();
    await page.waitForTimeout(700);
    const next = page.getByRole('button', { name: /Siguiente|Ver resultado/i });
    if (await next.isVisible().catch(() => false)) await next.click();
    await page.waitForTimeout(500);
    if (await page.getByRole('button', { name: /Guardar progreso/i }).isVisible().catch(() => false)) break;
  }
  await page.getByRole('button', { name: /Guardar progreso/i }).click();
  await page.waitForTimeout(1200);
  console.log('4 volvio al dashboard:', await page.getByText(/Materias de tu grado/).isVisible());

  // 3. Progreso guardado en localStorage (recordSession con extras no rompió)
  const prog = await page.evaluate(() => JSON.parse(localStorage.getItem('evi_progress')));
  console.log('5 sesion registrada:', prog.sessionHistory.length === 3 && prog.sessionHistory[2].answers.length >= 0, '| tiempo hoy acumulado:', prog.sessionHistory.filter((s) => new Date(s.date).toDateString() === new Date().toDateString()).reduce((a, s) => a + s.timeMinutes, 0), 'min');

  // 4. Panel del padre: boleta + actividad de hoy + alertas
  await page.getByRole('button', { name: /Progreso|Papá|Panel/i }).first().click().catch(() => {});
  await page.evaluate(() => {
    const navs = [...document.querySelectorAll('button, a')];
    const n = navs.find((x) => /progreso|panel|pap/i.test(x.textContent));
    if (n) n.click();
  });
  await page.waitForTimeout(1200);
  console.log('6 boleta visible:', await page.getByText(/Boleta de calificaciones/i).isVisible());
  console.log('7 nota matematicas 90:', await page.getByText('90').first().isVisible());
  console.log('8 actividad hoy:', await page.getByText(/Actividad de hoy/i).isVisible());
  console.log('9 alertas materias:', await page.getByText(/necesitan atención/i).isVisible());
  console.log('10 resumen semanal oculto (sin IA):', !(await page.getByText(/Resumen de la semana/i).isVisible().catch(() => false)));

  console.log('ERRORES:', errors.length ? errors : 'ninguno');
  await browser.close();
})().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

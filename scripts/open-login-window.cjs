// Abre una ventana VISIBLE con perfil dedicado para que el usuario inicie sesión.
// Queda corriendo en segundo plano; yo la controlo luego por el mismo perfil.
const { chromium } = require('playwright-core');

(async () => {
  const ctx = await chromium.launchPersistentContext(
    'C:/Users/susecomp/projects/escuela-virtual-ia/.deploy-profile',
    {
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      headless: false,
      viewport: { width: 1100, height: 800 },
    }
  );
  const page = ctx.pages()[0] || (await ctx.newPage());
  await page.goto('https://accounts.google.com/');
  // Mantener viva la ventana
  await new Promise(() => {});
})();

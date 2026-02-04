// Test simple de Playwright
const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Iniciando navegador Chromium...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('📱 Navegando a Google...');
  await page.goto('https://www.google.com');
  
  console.log('✅ Navegación exitosa!');
  console.log('📸 Título de la página:', await page.title());
  
  await page.screenshot({ path: 'test-screenshot.png' });
  console.log('📷 Screenshot guardado como test-screenshot.png');
  
  await browser.close();
  console.log('🎭 Playwright MCP está funcionando correctamente!');
})();

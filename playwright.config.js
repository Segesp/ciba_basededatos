// Configuración de Playwright para usar Chromium
module.exports = {
  use: {
    channel: 'chromium',
    headless: false,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
};

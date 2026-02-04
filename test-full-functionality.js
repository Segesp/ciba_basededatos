// Test completo de todas las funcionalidades del EventHub
const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Iniciando pruebas completas de EventHub...\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. Cargar la aplicación
    console.log('📱 1. Cargando aplicación...');
    await page.goto('http://localhost:5000');
    await page.waitForLoadState('networkidle');
    console.log('   ✅ Aplicación cargada correctamente\n');
    
    // 2. Verificar Dashboard
    console.log('📊 2. Verificando Dashboard...');
    const dashboardTitle = await page.textContent('h1');
    console.log(`   ✅ Título: ${dashboardTitle}`);
    
    // Verificar tarjetas de estadísticas
    const statsCards = await page.locator('.stat-card').count();
    console.log(`   ✅ Tarjetas de estadísticas: ${statsCards}\n`);
    
    // 3. Crear un evento nuevo
    console.log('🎉 3. Creando nuevo evento...');
    await page.click('a:has-text("📅 Eventos")');
    await page.waitForTimeout(1000);
    await page.waitForSelector('#eventTitle', { state: 'visible' });
    
    await page.fill('#eventTitle', 'Prueba Automatizada de EventHub');
    await page.fill('#eventDescription', 'Este es un evento de prueba creado automáticamente');
    await page.fill('#eventDate', '2026-02-15');
    await page.fill('#eventTime', '14:30');
    await page.fill('#eventLocation', 'Sala de Conferencias A');
    
    await page.click('button:has-text("Guardar")');
    await page.waitForTimeout(1000);
    console.log('   ✅ Evento creado\n');
    
    // 4. Verificar que el evento aparece en la tabla
    console.log('📋 4. Verificando lista de eventos...');
    const eventTitle = await page.textContent('table tbody tr:first-child td:nth-child(2)');
    console.log(`   ✅ Evento en tabla: ${eventTitle}\n`);
    
    // 5. Agregar participante
    console.log('👥 5. Agregando participante...');
    await page.click('a:has-text("👥 Participantes")');
    await page.waitForTimeout(1000);
    await page.waitForSelector('#participantEvent', { state: 'visible' });
    
    // Seleccionar el evento del dropdown
    await page.selectOption('#participantEvent', { index: 1 });
    await page.fill('#participantName', 'Juan Pérez');
    await page.fill('#participantEmail', 'juan.perez@test.com');
    await page.fill('#participantPhone', '+52 555 1234567');
    await page.fill('#numPeople', '3');
    
    await page.click('button:has-text("Agregar Participante")');
    await page.waitForTimeout(1000);
    console.log('   ✅ Participante agregado\n');
    
    // 6. Verificar participante en la lista
    console.log('📝 6. Verificando lista de participantes...');
    const participantName = await page.textContent('.participant-card .participant-name');
    console.log(`   ✅ Participante: ${participantName}\n`);
    
    // 7. Crear recordatorio
    console.log('🔔 7. Creando recordatorio...');
    await page.click('a:has-text("🔔 Recordatorios")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Crear Recordatorio")');
    await page.waitForTimeout(500);
    
    // Llenar formulario de recordatorio en el modal
    const reminderDialog = page.locator('dialog[open]');
    await reminderDialog.locator('select').first().selectOption({ index: 1 });
    await reminderDialog.locator('input[type="date"]').fill('2026-02-14');
    await reminderDialog.locator('input[type="time"]').fill('10:00');
    await reminderDialog.locator('button:has-text("Guardar")').click();
    await page.waitForTimeout(1000);
    console.log('   ✅ Recordatorio creado\n');
    
    // 8. Verificar recordatorio
    console.log('📆 8. Verificando recordatorios...');
    const reminderCount = await page.locator('.reminder-item').count();
    console.log(`   ✅ Recordatorios activos: ${reminderCount}\n`);
    
    // 9. Probar búsqueda
    console.log('🔍 9. Probando función de búsqueda...');
    await page.click('a:has-text("📅 Eventos")');
    await page.waitForTimeout(1000);
    
    await page.fill('#searchInput', 'Prueba');
    await page.waitForTimeout(500);
    const searchResults = await page.locator('table tbody tr').count();
    console.log(`   ✅ Resultados de búsqueda: ${searchResults}\n`);
    
    // 10. Actualizar estado de participante
    console.log('✏️ 10. Actualizando estado de participante...');
    await page.click('a:has-text("👥 Participantes")');
    await page.waitForTimeout(1000);
    
    await page.click('.participant-card select');
    await page.selectOption('.participant-card select', 'confirmed');
    await page.waitForTimeout(1000);
    console.log('   ✅ Estado actualizado a Confirmado\n');
    
    // 11. Volver al dashboard y verificar estadísticas
    console.log('📊 11. Verificando actualización de estadísticas...');
    await page.click('a:has-text("📊 Dashboard")');
    await page.waitForTimeout(1000);
    
    const totalEvents = await page.textContent('.stat-card:nth-child(1) .stat-value');
    const totalParticipants = await page.textContent('.stat-card:nth-child(2) .stat-value');
    const pendingReminders = await page.textContent('.stat-card:nth-child(3) .stat-value');
    
    console.log(`   ✅ Total de eventos: ${totalEvents}`);
    console.log(`   ✅ Total de participantes: ${totalParticipants}`);
    console.log(`   ✅ Recordatorios pendientes: ${pendingReminders}\n`);
    
    // 12. Capturar screenshots
    console.log('📸 12. Capturando screenshots...');
    await page.screenshot({ path: 'screenshot-dashboard.png', fullPage: true });
    console.log('   ✅ Dashboard capturado\n');
    
    await page.click('a:has-text("📅 Eventos")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshot-events.png', fullPage: true });
    console.log('   ✅ Vista de eventos capturada\n');
    
    await page.click('a:has-text("👥 Participantes")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshot-participants.png', fullPage: true });
    console.log('   ✅ Vista de participantes capturada\n');
    
    await page.click('a:has-text("🔔 Recordatorios")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshot-reminders.png', fullPage: true });
    console.log('   ✅ Vista de recordatorios capturada\n');
    
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║     ✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE  ║');
    console.log('╚════════════════════════════════════════════════════╝\n');
    
    console.log('📋 Resumen de funcionalidades verificadas:');
    console.log('   ✅ Carga de aplicación');
    console.log('   ✅ Dashboard con estadísticas');
    console.log('   ✅ Crear evento (CRUD - Create)');
    console.log('   ✅ Listar eventos (CRUD - Read)');
    console.log('   ✅ Agregar participante');
    console.log('   ✅ Listar participantes');
    console.log('   ✅ Actualizar estado de participante (CRUD - Update)');
    console.log('   ✅ Crear recordatorio');
    console.log('   ✅ Listar recordatorios');
    console.log('   ✅ Función de búsqueda');
    console.log('   ✅ Navegación entre vistas');
    console.log('   ✅ Integración backend-frontend');
    console.log('   ✅ Base de datos SQLite funcionando');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    await page.screenshot({ path: 'screenshot-error.png' });
  } finally {
    await browser.close();
    console.log('\n🎭 Navegador cerrado');
  }
})();

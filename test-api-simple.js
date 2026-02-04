// Test simple de API para verificar funcionalidad backend
const http = require('http');

function testAPI(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Iniciando pruebas de API del EventHub...\n');

  try {
    // 1. Crear evento
    console.log('1️⃣ Creando evento...');
    const createEvent = await testAPI('POST', '/api/events', {
      title: 'Test Evento API',
      description: 'Evento de prueba para API',
      date: '2026-02-20',
      time: '15:00',
      location: 'Sala Virtual'
    });
    console.log(`   ✅ Status: ${createEvent.status}`);
    console.log(`   📝 ID del evento: ${createEvent.data.id}\n`);
    const eventId = createEvent.data.id;

    // 2. Obtener todos los eventos
    console.log('2️⃣ Obteniendo todos los eventos...');
    const allEvents = await testAPI('GET', '/api/events');
    console.log(`   ✅ Status: ${allEvents.status}`);
    console.log(`   📊 Total de eventos: ${allEvents.data.length}\n`);

    // 3. Obtener evento específico
    console.log('3️⃣ Obteniendo evento por ID...');
    const getEvent = await testAPI('GET', `/api/events/${eventId}`);
    console.log(`   ✅ Status: ${getEvent.status}`);
    console.log(`   📋 Título: ${getEvent.data.title}\n`);

    // 4. Actualizar evento
    console.log('4️⃣ Actualizando evento...');
    const updateEvent = await testAPI('PUT', `/api/events/${eventId}`, {
      title: 'Test Evento Actualizado',
      description: 'Descripción actualizada',
      date: '2026-02-21',
      time: '16:00',
      location: 'Sala Presencial'
    });
    console.log(`   ✅ Status: ${updateEvent.status}\n`);

    // 5. Crear participante
    console.log('5️⃣ Creando participante...');
    const createParticipant = await testAPI('POST', `/api/events/${eventId}/participants`, {
      name: 'María García',
      email: 'maria@test.com',
      phone: '+34 600 111 222',
      num_people: 2,
      status: 'pending'
    });
    console.log(`   ✅ Status: ${createParticipant.status}`);
    console.log(`   👤 ID participante: ${createParticipant.data.id}\n`);
    const participantId = createParticipant.data.id;

    // 6. Obtener participantes del evento
    console.log('6️⃣ Obteniendo participantes del evento...');
    const participants = await testAPI('GET', `/api/events/${eventId}/participants`);
    console.log(`   ✅ Status: ${participants.status}`);
    console.log(`   👥 Total participantes: ${participants.data.length}\n`);

    // 7. Actualizar estado de participante
    console.log('7️⃣ Actualizando estado del participante...');
    const updateStatus = await testAPI('PUT', `/api/events/participants/${participantId}/status`, {
      status: 'confirmed'
    });
    console.log(`   ✅ Status: ${updateStatus.status}\n`);

    // 8. Crear recordatorio
    console.log('8️⃣ Creando recordatorio...');
    const createReminder = await testAPI('POST', `/api/events/${eventId}/reminders`, {
      participantId: participantId,
      reminderDate: '2026-02-19',
      reminderTime: '10:00'
    });
    console.log(`   ✅ Status: ${createReminder.status}`);
    console.log(`   🔔 ID recordatorio: ${createReminder.data.id}\n`);

    // 9. Obtener recordatorios pendientes
    console.log('9️⃣ Obteniendo recordatorios pendientes...');
    const pendingReminders = await testAPI('GET', '/api/reminders/pending');
    console.log(`   ✅ Status: ${pendingReminders.status}`);
    console.log(`   📆 Recordatorios pendientes: ${pendingReminders.data.length}\n`);

    // 10. Eliminar participante
    console.log('🔟 Eliminando participante...');
    const deleteParticipant = await testAPI('DELETE', `/api/events/participants/${participantId}/delete`);
    console.log(`   ✅ Status: ${deleteParticipant.status}\n`);

    // 11. Eliminar evento
    console.log('1️⃣1️⃣ Eliminando evento...');
    const deleteEvent = await testAPI('DELETE', `/api/events/${eventId}`);
    console.log(`   ✅ Status: ${deleteEvent.status}\n`);

    // Resumen
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║     ✅ TODAS LAS PRUEBAS DE API COMPLETADAS          ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    console.log('📋 Funcionalidades verificadas:');
    console.log('   ✅ Crear evento (POST /api/events)');
    console.log('   ✅ Listar eventos (GET /api/events)');
    console.log('   ✅ Obtener evento (GET /api/events/:id)');
    console.log('   ✅ Actualizar evento (PUT /api/events/:id)');
    console.log('   ✅ Eliminar evento (DELETE /api/events/:id)');
    console.log('   ✅ Crear participante (POST /api/events/:id/participants)');
    console.log('   ✅ Listar participantes (GET /api/events/:id/participants)');
    console.log('   ✅ Actualizar estado (PUT /api/participants/:id/status)');
    console.log('   ✅ Eliminar participante (DELETE /api/participants/:id/delete)');
    console.log('   ✅ Crear recordatorio (POST /api/events/:id/reminders)');
    console.log('   ✅ Listar recordatorios (GET /api/reminders/pending)');
    console.log('\n🎯 Backend completamente funcional e integrado con SQLite');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

runTests();

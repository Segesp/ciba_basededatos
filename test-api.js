#!/usr/bin/env node

/**
 * Script de prueba para validar todos los endpoints de la API
 * Ejecutar: node test-api.js
 */

const API_BASE = 'http://localhost:5000/api';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let testsPassed = 0;
let testsFailed = 0;
let lastEventId = null;
let lastParticipantId = null;
let lastReminderId = null;

// Función para hacer requests
async function apiCall(method, endpoint, body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error(`${colors.red}Error en ${method} ${endpoint}: ${error.message}${colors.reset}`);
    return { status: 500, data: { error: error.message } };
  }
}

// Función para pruebas
async function test(name, fn) {
  try {
    await fn();
    console.log(`${colors.green}✓${colors.reset} ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    console.log(`  ${colors.red}Error: ${error.message}${colors.reset}`);
    testsFailed++;
  }
}

// Función para aserciones
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// ===== PRUEBAS =====

async function runTests() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}  EventHub API Test Suite${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  // ===== EVENTOS =====
  console.log(`${colors.blue}📅 Testing Eventos${colors.reset}\n`);

  // POST - Crear evento
  await test('POST /api/events - Crear evento', async () => {
    const response = await apiCall('POST', '/events', {
      title: 'Reunión de Equipo',
      description: 'Reunión semanal del equipo',
      date: '2026-02-10',
      time: '14:00',
      location: 'Sala de Conferencias'
    });

    assert(response.status === 201, `Status es ${response.status}, esperaba 201`);
    assert(response.data.id, 'Response debe incluir ID del evento');
    lastEventId = response.data.id;
  });

  // GET - Obtener todos los eventos
  await test('GET /api/events - Obtener todos', async () => {
    const response = await apiCall('GET', '/events');

    assert(response.status === 200, `Status es ${response.status}, esperaba 200`);
    assert(Array.isArray(response.data), 'Response debe ser un array');
    assert(response.data.length > 0, 'Debe haber al menos un evento');
  });

  // GET - Obtener evento específico
  await test('GET /api/events/:id - Obtener evento específico', async () => {
    const response = await apiCall('GET', `/events/${lastEventId}`);

    assert(response.status === 200, `Status es ${response.status}, esperaba 200`);
    assert(response.data.id === lastEventId, 'El ID debe coincidir');
    assert(response.data.title === 'Reunión de Equipo', 'El título debe coincidir');
  });

  // PUT - Actualizar evento
  await test('PUT /api/events/:id - Actualizar evento', async () => {
    const response = await apiCall('PUT', `/events/${lastEventId}`, {
      title: 'Reunión de Equipo Actualizada',
      description: 'Reunión semanal del equipo (ACTUALIZADA)',
      date: '2026-02-11',
      time: '15:00',
      location: 'Sala de Conferencias B'
    });

    assert(response.status === 200, `Status es ${response.status}, esperaba 200`);
  });

  // ===== PARTICIPANTES =====
  console.log(`\n${colors.blue}👥 Testing Participantes${colors.reset}\n`);

  // POST - Agregar participante
  await test('POST /api/events/:id/participants - Agregar participante', async () => {
    const response = await apiCall('POST', `/events/${lastEventId}/participants`, {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '600123456',
      plannedParticipation: 1
    });

    assert(response.status === 201, `Status es ${response.status}, esperaba 201`);
    assert(response.data.id, 'Response debe incluir ID del participante');
    lastParticipantId = response.data.id;
  });

  // GET - Obtener participantes del evento
  await test('GET /api/events/:id/participants - Obtener participantes', async () => {
    const response = await apiCall('GET', `/events/${lastEventId}/participants`);

    assert(response.status === 200, `Status es ${response.status}, esperaba 200`);
    assert(Array.isArray(response.data), 'Response debe ser un array');
    assert(response.data.length > 0, 'Debe haber al menos un participante');
  });

  // PUT - Actualizar estado de participante
  await test('PUT /api/participants/:id/status - Actualizar estado', async () => {
    const response = await apiCall('PUT', `/participants/${lastParticipantId}/status`, {
      status: 'confirmed'
    });

    assert(response.status === 200, `Status es ${response.status}, esperaba 200`);
  });

  // ===== RECORDATORIOS =====
  console.log(`\n${colors.blue}🔔 Testing Recordatorios${colors.reset}\n`);

  // POST - Crear recordatorio
  await test('POST /api/events/:id/reminders - Crear recordatorio', async () => {
    const response = await apiCall('POST', `/events/${lastEventId}/reminders`, {
      participantId: lastParticipantId,
      reminderDate: '2026-02-09',
      reminderTime: '10:00'
    });

    assert(response.status === 201, `Status es ${response.status}, esperaba 201`);
    assert(response.data.id, 'Response debe incluir ID del recordatorio');
    lastReminderId = response.data.id;
  });

  // GET - Obtener recordatorios pendientes
  await test('GET /api/reminders/pending - Obtener recordatorios pendientes', async () => {
    const response = await apiCall('GET', '/reminders/pending');

    assert(response.status === 200, `Status es ${response.status}, esperaba 200`);
    assert(Array.isArray(response.data), 'Response debe ser un array');
  });

  // GET - Obtener recordatorios del evento
  await test('GET /api/events/:id/reminders - Obtener recordatorios del evento', async () => {
    const response = await apiCall('GET', `/events/${lastEventId}/reminders`);

    assert(response.status === 200, `Status es ${response.status}, esperaba 200`);
    assert(Array.isArray(response.data), 'Response debe ser un array');
  });

  // PUT - Marcar recordatorio como notificado
  await test('PUT /api/reminders/:id/notified - Marcar notificado', async () => {
    const response = await apiCall('PUT', `/reminders/${lastReminderId}/notified`, {});

    assert(response.status === 200, `Status es ${response.status}, esperaba 200`);
  });

  // ===== LIMPIEZA =====
  console.log(`\n${colors.blue}🧹 Testing Limpieza${colors.reset}\n`);

  // DELETE - Eliminar participante
  await test('DELETE /api/participants/:id/delete - Eliminar participante', async () => {
    const response = await apiCall('DELETE', `/participants/${lastParticipantId}/delete`);

    assert(response.status === 200, `Status es ${response.status}, esperaba 200`);
  });

  // DELETE - Eliminar evento
  await test('DELETE /api/events/:id - Eliminar evento', async () => {
    const response = await apiCall('DELETE', `/events/${lastEventId}`);

    assert(response.status === 200, `Status es ${response.status}, esperaba 200`);
  });

  // ===== RESUMEN =====
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}  Resultados${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  console.log(`${colors.green}✓ Pruebas pasadas: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}✗ Pruebas fallidas: ${testsFailed}${colors.reset}`);

  const total = testsPassed + testsFailed;
  const percentage = total > 0 ? Math.round((testsPassed / total) * 100) : 0;
  console.log(`\n${colors.blue}Tasa de éxito: ${percentage}%${colors.reset}\n`);

  if (testsFailed === 0) {
    console.log(`${colors.green}✓ Todos los tests pasaron correctamente!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}✗ Algunos tests fallaron, revisa los errores arriba${colors.reset}\n`);
    process.exit(1);
  }
}

// Ejecutar pruebas
runTests().catch(error => {
  console.error(`${colors.red}Error fatal: ${error.message}${colors.reset}`);
  process.exit(1);
});

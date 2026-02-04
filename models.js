const db = require('./database');

// ===== EVENTOS =====

// Obtener todos los eventos
const getAllEvents = (callback) => {
  db.all('SELECT * FROM events ORDER BY date ASC, time ASC', (err, rows) => {
    callback(err, rows);
  });
};

// Obtener un evento por ID con sus participantes
const getEventById = (eventId, callback) => {
  db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, event) => {
    if (err) {
      callback(err, null);
      return;
    }
    
    db.all(
      'SELECT * FROM participants WHERE eventId = ?',
      [eventId],
      (err, participants) => {
        if (err) {
          callback(err, null);
          return;
        }
        
        db.all(
          'SELECT * FROM reminders WHERE eventId = ?',
          [eventId],
          (err, reminders) => {
            callback(err, {
              ...event,
              participants,
              reminders
            });
          }
        );
      }
    );
  });
};

// Crear evento
const createEvent = (event, callback) => {
  const { title, description, date, time, location } = event;
  db.run(
    `INSERT INTO events (title, description, date, time, location)
     VALUES (?, ?, ?, ?, ?)`,
    [title, description, date, time, location],
    function(err) {
      callback(err, this.lastID);
    }
  );
};

// Actualizar evento
const updateEvent = (eventId, event, callback) => {
  const { title, description, date, time, location } = event;
  db.run(
    `UPDATE events
     SET title = ?, description = ?, date = ?, time = ?, location = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [title, description, date, time, location, eventId],
    (err) => {
      callback(err);
    }
  );
};

// Eliminar evento
const deleteEvent = (eventId, callback) => {
  db.run('DELETE FROM events WHERE id = ?', [eventId], (err) => {
    callback(err);
  });
};

// ===== PARTICIPANTES =====

// Crear participante
const createParticipant = (participant, callback) => {
  const { eventId, name, email, phone, plannedParticipation } = participant;
  db.run(
    `INSERT INTO participants (eventId, name, email, phone, plannedParticipation)
     VALUES (?, ?, ?, ?, ?)`,
    [eventId, name, email, phone, plannedParticipation],
    function(err) {
      callback(err, this.lastID);
    }
  );
};

// Actualizar estado de participante
const updateParticipantStatus = (participantId, status, callback) => {
  db.run(
    'UPDATE participants SET status = ? WHERE id = ?',
    [status, participantId],
    (err) => {
      callback(err);
    }
  );
};

// Obtener participantes de un evento
const getParticipantsByEvent = (eventId, callback) => {
  db.all(
    'SELECT * FROM participants WHERE eventId = ? ORDER BY name ASC',
    [eventId],
    (err, rows) => {
      callback(err, rows);
    }
  );
};

// Eliminar participante
const deleteParticipant = (participantId, callback) => {
  db.run('DELETE FROM participants WHERE id = ?', [participantId], (err) => {
    callback(err);
  });
};

// ===== RECORDATORIOS =====

// Crear recordatorio
const createReminder = (reminder, callback) => {
  const { eventId, participantId, reminderTime, reminderDate } = reminder;
  db.run(
    `INSERT INTO reminders (eventId, participantId, reminderTime, reminderDate)
     VALUES (?, ?, ?, ?)`,
    [eventId, participantId, reminderTime, reminderDate],
    function(err) {
      callback(err, this.lastID);
    }
  );
};

// Obtener recordatorios pendientes
const getPendingReminders = (callback) => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toTimeString().slice(0, 5);
  
  db.all(
    `SELECT r.*, e.title as eventTitle, e.date, e.time, p.email, p.phone
     FROM reminders r
     JOIN events e ON r.eventId = e.id
     LEFT JOIN participants p ON r.participantId = p.id
     WHERE r.notified = 0 AND r.reminderDate = ? AND r.reminderTime <= ?
     ORDER BY r.reminderTime ASC`,
    [today, now],
    (err, rows) => {
      callback(err, rows);
    }
  );
};

// Marcar recordatorio como notificado
const markReminderAsNotified = (reminderId, callback) => {
  db.run(
    'UPDATE reminders SET notified = 1 WHERE id = ?',
    [reminderId],
    (err) => {
      callback(err);
    }
  );
};

// Obtener recordatorios de un evento
const getRemindersByEvent = (eventId, callback) => {
  db.all(
    'SELECT * FROM reminders WHERE eventId = ? ORDER BY reminderDate ASC, reminderTime ASC',
    [eventId],
    (err, rows) => {
      callback(err, rows);
    }
  );
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  createParticipant,
  updateParticipantStatus,
  getParticipantsByEvent,
  deleteParticipant,
  createReminder,
  getPendingReminders,
  markReminderAsNotified,
  getRemindersByEvent
};

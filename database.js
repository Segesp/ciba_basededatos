const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'events.db');
const db = new sqlite3.Database(dbPath);

// Inicializar base de datos
function initializeDatabase() {
  db.serialize(() => {
    // Tabla de eventos
    db.run(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        location TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de participantes
    db.run(`
      CREATE TABLE IF NOT EXISTS participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        eventId INTEGER NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        status TEXT DEFAULT 'pending',
        plannedParticipation INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(eventId) REFERENCES events(id) ON DELETE CASCADE
      )
    `);

    // Tabla de recordatorios
    db.run(`
      CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        eventId INTEGER NOT NULL,
        participantId INTEGER,
        reminderTime TEXT NOT NULL,
        reminderDate TEXT NOT NULL,
        notified INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(eventId) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY(participantId) REFERENCES participants(id) ON DELETE CASCADE
      )
    `);

    console.log('Base de datos inicializada correctamente');
  });
}

// Ejecutar inicialización
initializeDatabase();

module.exports = db;

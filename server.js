require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas API
const eventsRouter = require('./routes/events');
const remindersRouter = require('./routes/reminders');

app.use('/api/events', eventsRouter);
app.use('/api/reminders', remindersRouter);

// Ruta para página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

// Sistema de notificaciones de recordatorios (cada minuto)
const { getPendingReminders, markReminderAsNotified } = require('./models');

setInterval(() => {
  getPendingReminders((err, reminders) => {
    if (err) {
      console.error('Error al obtener recordatorios:', err);
      return;
    }

    if (reminders && reminders.length > 0) {
      reminders.forEach((reminder) => {
        console.log(`🔔 RECORDATORIO: ${reminder.eventTitle} en ${reminder.date} a las ${reminder.time}`);
        
        if (reminder.email) {
          console.log(`   📧 Email: ${reminder.email}`);
        }
        if (reminder.phone) {
          console.log(`   📱 Teléfono: ${reminder.phone}`);
        }

        // Marcar como notificado
        markReminderAsNotified(reminder.id, (err) => {
          if (err) {
            console.error('Error al marcar como notificado:', err);
          }
        });
      });
    }
  });
}, 60000); // Cada minuto

console.log('Sistema de recordatorios activado');

const express = require('express');
const router = express.Router();
const { getPendingReminders, markReminderAsNotified } = require('../models');

// GET /api/reminders/pending - Obtener recordatorios pendientes
router.get('/pending', (req, res) => {
  getPendingReminders((err, reminders) => {
    if (err) {
      res.status(500).json({ error: 'Error al obtener recordatorios' });
      return;
    }
    res.json(reminders);
  });
});

// POST /api/reminders/:id/notify - Marcar como notificado
router.post('/:id/notify', (req, res) => {
  markReminderAsNotified(req.params.id, (err) => {
    if (err) {
      res.status(500).json({ error: 'Error al marcar como notificado' });
      return;
    }
    res.json({ message: 'Recordatorio marcado como notificado' });
  });
});

module.exports = router;

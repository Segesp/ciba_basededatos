const express = require('express');
const router = express.Router();
const {
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
  getRemindersByEvent
} = require('../models');

// ===== RUTAS DE EVENTOS =====

// GET /api/events - Obtener todos los eventos
router.get('/', (req, res) => {
  getAllEvents((err, events) => {
    if (err) {
      res.status(500).json({ error: 'Error al obtener eventos' });
      return;
    }
    res.json(events);
  });
});

// GET /api/events/:id - Obtener un evento específico con participantes
router.get('/:id', (req, res) => {
  getEventById(req.params.id, (err, event) => {
    if (err) {
      res.status(500).json({ error: 'Error al obtener evento' });
      return;
    }
    if (!event) {
      res.status(404).json({ error: 'Evento no encontrado' });
      return;
    }
    res.json(event);
  });
});

// POST /api/events - Crear evento
router.post('/', (req, res) => {
  const { title, description, date, time, location } = req.body;

  if (!title || !date || !time) {
    res.status(400).json({ error: 'Faltan campos requeridos' });
    return;
  }

  createEvent({ title, description, date, time, location }, (err, eventId) => {
    if (err) {
      res.status(500).json({ error: 'Error al crear evento' });
      return;
    }
    res.status(201).json({ id: eventId, title, description, date, time, location });
  });
});

// PUT /api/events/:id - Actualizar evento
router.put('/:id', (req, res) => {
  const { title, description, date, time, location } = req.body;

  if (!title || !date || !time) {
    res.status(400).json({ error: 'Faltan campos requeridos' });
    return;
  }

  updateEvent(req.params.id, { title, description, date, time, location }, (err) => {
    if (err) {
      res.status(500).json({ error: 'Error al actualizar evento' });
      return;
    }
    res.json({ message: 'Evento actualizado correctamente' });
  });
});

// DELETE /api/events/:id - Eliminar evento
router.delete('/:id', (req, res) => {
  deleteEvent(req.params.id, (err) => {
    if (err) {
      res.status(500).json({ error: 'Error al eliminar evento' });
      return;
    }
    res.json({ message: 'Evento eliminado correctamente' });
  });
});

// ===== RUTAS DE PARTICIPANTES =====

// GET /api/events/:eventId/participants - Obtener participantes de un evento
router.get('/:eventId/participants', (req, res) => {
  getParticipantsByEvent(req.params.eventId, (err, participants) => {
    if (err) {
      res.status(500).json({ error: 'Error al obtener participantes' });
      return;
    }
    res.json(participants);
  });
});

// POST /api/events/:eventId/participants - Agregar participante
router.post('/:eventId/participants', (req, res) => {
  const { name, email, phone, plannedParticipation } = req.body;

  if (!name) {
    res.status(400).json({ error: 'El nombre es requerido' });
    return;
  }

  createParticipant(
    {
      eventId: req.params.eventId,
      name,
      email,
      phone,
      plannedParticipation: plannedParticipation || 0
    },
    (err, participantId) => {
      if (err) {
        res.status(500).json({ error: 'Error al crear participante' });
        return;
      }
      res.status(201).json({
        id: participantId,
        eventId: req.params.eventId,
        name,
        email,
        phone,
        plannedParticipation
      });
    }
  );
});

// PUT /api/participants/:id/status - Actualizar estado de participante
router.put('/participants/:participantId/status', (req, res) => {
  const { status } = req.body;

  if (!status) {
    res.status(400).json({ error: 'El estado es requerido' });
    return;
  }

  updateParticipantStatus(req.params.participantId, status, (err) => {
    if (err) {
      res.status(500).json({ error: 'Error al actualizar estado' });
      return;
    }
    res.json({ message: 'Estado actualizado correctamente' });
  });
});

// DELETE /api/participants/:id - Eliminar participante
router.delete('/participants/:participantId/delete', (req, res) => {
  deleteParticipant(req.params.participantId, (err) => {
    if (err) {
      res.status(500).json({ error: 'Error al eliminar participante' });
      return;
    }
    res.json({ message: 'Participante eliminado correctamente' });
  });
});

// ===== RUTAS DE RECORDATORIOS =====

// GET /api/events/:eventId/reminders - Obtener recordatorios de un evento
router.get('/:eventId/reminders', (req, res) => {
  getRemindersByEvent(req.params.eventId, (err, reminders) => {
    if (err) {
      res.status(500).json({ error: 'Error al obtener recordatorios' });
      return;
    }
    res.json(reminders);
  });
});

// POST /api/events/:eventId/reminders - Crear recordatorio
router.post('/:eventId/reminders', (req, res) => {
  const { participantId, reminderTime, reminderDate } = req.body;

  if (!reminderTime || !reminderDate) {
    res.status(400).json({ error: 'Faltan campos requeridos' });
    return;
  }

  createReminder(
    {
      eventId: req.params.eventId,
      participantId,
      reminderTime,
      reminderDate
    },
    (err, reminderId) => {
      if (err) {
        res.status(500).json({ error: 'Error al crear recordatorio' });
        return;
      }
      res.status(201).json({
        id: reminderId,
        eventId: req.params.eventId,
        participantId,
        reminderTime,
        reminderDate
      });
    }
  );
});

module.exports = router;

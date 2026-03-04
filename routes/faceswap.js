const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');
const { createJob, getJob } = require('../services/faceswapService');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'storage', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 250 * 1024 * 1024
  }
});

router.post('/jobs/faceswap', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), (req, res) => {
  const photo = req.files?.photo?.[0];
  const video = req.files?.video?.[0];

  if (!photo || !video) {
    res.status(400).json({ error: 'Debes adjuntar photo (imagen) y video (video guía)' });
    return;
  }

  const options = {
    identityStrength: Number(req.body.identityStrength || 0.8),
    temporalSmoothing: req.body.temporalSmoothing || 'medium',
    restoration: req.body.restoration || 'low',
    targetPerson: req.body.targetPerson || 'auto'
  };

  const job = createJob({
    inputPhotoPath: photo.path,
    inputVideoPath: video.path,
    options
  });

  res.status(202).json({
    id: job.id,
    status: job.status,
    stage: job.stage,
    progress: job.progress,
    message: 'Job de faceswap creado'
  });
});

router.get('/jobs/:id', (req, res) => {
  const job = getJob(req.params.id);

  if (!job) {
    res.status(404).json({ error: 'Job no encontrado' });
    return;
  }

  res.json({
    id: job.id,
    status: job.status,
    stage: job.stage,
    progress: job.progress,
    error: job.error,
    metadata: job.metadata,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt
  });
});

router.get('/jobs/:id/result', (req, res) => {
  const job = getJob(req.params.id);

  if (!job) {
    res.status(404).json({ error: 'Job no encontrado' });
    return;
  }

  if (job.status !== 'completed' || !job.outputPath) {
    res.status(409).json({ error: 'El resultado aún no está disponible', status: job.status });
    return;
  }

  res.sendFile(path.resolve(job.outputPath));
});

module.exports = router;

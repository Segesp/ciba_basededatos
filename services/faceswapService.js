const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const STORAGE_DIR = path.join(ROOT, 'storage');
const JOBS_DIR = path.join(STORAGE_DIR, 'jobs');

fs.mkdirSync(JOBS_DIR, { recursive: true });

const jobs = new Map();

function nowIso() {
  return new Date().toISOString();
}

function buildPaths(jobId) {
  const jobDir = path.join(JOBS_DIR, jobId);
  const framesDir = path.join(jobDir, 'frames');
  const outputPath = path.join(jobDir, 'output.mp4');
  const metadataPath = path.join(jobDir, 'metadata.json');

  return { jobDir, framesDir, outputPath, metadataPath };
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', chunk => {
      stdout += chunk.toString();
    });

    proc.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });

    proc.on('error', reject);
    proc.on('close', code => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`${command} terminó con código ${code}: ${stderr || stdout}`));
      }
    });
  });
}

function updateJob(jobId, patch) {
  const current = jobs.get(jobId);
  if (!current) {
    return;
  }

  jobs.set(jobId, {
    ...current,
    ...patch,
    updatedAt: nowIso()
  });
}

async function runDefaultPipeline(job) {
  const { inputVideoPath, options } = job;
  const { jobDir, framesDir, outputPath, metadataPath } = buildPaths(job.id);

  fs.mkdirSync(jobDir, { recursive: true });
  fs.mkdirSync(framesDir, { recursive: true });

  updateJob(job.id, { stage: 'ingesta', progress: 10 });
  await runCommand('ffmpeg', ['-i', inputVideoPath, '-qscale:v', '2', path.join(framesDir, '%06d.jpg'), '-vn', '-y']);

  updateJob(job.id, { stage: 'composición', progress: 70 });
  await runCommand('ffmpeg', [
    '-i', inputVideoPath,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-y',
    outputPath
  ]);

  const metadata = {
    mode: 'default-pass-through',
    warning: 'No se configuró un worker de IA real. Se procesó el video guía sin swap facial.',
    requestedOptions: options,
    createdAt: nowIso()
  };

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');

  return { outputPath, metadata };
}

async function runExternalWorker(job, workerCommand) {
  const { jobDir, outputPath } = buildPaths(job.id);
  fs.mkdirSync(jobDir, { recursive: true });

  updateJob(job.id, { stage: 'worker-ai', progress: 25 });

  const payloadPath = path.join(jobDir, 'worker-input.json');
  const payload = {
    jobId: job.id,
    inputPhotoPath: job.inputPhotoPath,
    inputVideoPath: job.inputVideoPath,
    outputPath,
    options: job.options
  };

  fs.writeFileSync(payloadPath, JSON.stringify(payload, null, 2), 'utf8');

  const [command, ...baseArgs] = workerCommand.split(' ');
  await runCommand(command, [...baseArgs, payloadPath]);

  if (!fs.existsSync(outputPath)) {
    throw new Error('El worker externo no generó output.mp4');
  }

  return {
    outputPath,
    metadata: {
      mode: 'external-worker',
      workerCommand,
      createdAt: nowIso()
    }
  };
}

async function processJob(jobId) {
  const job = jobs.get(jobId);
  if (!job) {
    return;
  }

  try {
    updateJob(jobId, { status: 'processing', stage: 'iniciando', progress: 1 });

    const workerCommand = process.env.FACESWAP_WORKER_CMD;
    const result = workerCommand
      ? await runExternalWorker(job, workerCommand)
      : await runDefaultPipeline(job);

    updateJob(jobId, {
      status: 'completed',
      stage: 'finalizado',
      progress: 100,
      outputPath: result.outputPath,
      metadata: result.metadata
    });
  } catch (error) {
    updateJob(jobId, {
      status: 'failed',
      stage: 'error',
      error: error.message,
      progress: 100
    });
  }
}

function createJob({ inputPhotoPath, inputVideoPath, options = {} }) {
  const jobId = crypto.randomUUID();

  const job = {
    id: jobId,
    status: 'queued',
    stage: 'encolado',
    progress: 0,
    inputPhotoPath,
    inputVideoPath,
    options,
    createdAt: nowIso(),
    updatedAt: nowIso()
  };

  jobs.set(jobId, job);
  setImmediate(() => processJob(jobId));

  return job;
}

function getJob(jobId) {
  return jobs.get(jobId) || null;
}

module.exports = {
  createJob,
  getJob
};

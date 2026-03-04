#!/usr/bin/env python3
"""
Worker experimental para probar Wan-AI/Wan2.2-TI2V-5B.

IMPORTANTE:
- Este modelo es text+image -> video (TI2V), no un faceswap clásico.
- Se incluye como rama experimental para evaluar calidad y factibilidad.

Uso:
  python workers/faceswap_worker_wan22.py <payload.json>

Variables opcionales:
  WAN_MODEL_ID=Wan-AI/Wan2.2-TI2V-5B-Diffusers
  WAN_PROMPT="cinematic portrait video, natural face motion"
  WAN_NEGATIVE_PROMPT="blurry, low quality, artifacts, deformed face"
  WAN_NUM_STEPS=30
  WAN_GUIDANCE=5.0
  WAN_FPS=24
  WAN_STRICT=1   # si 1, falla en lugar de hacer fallback
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import cv2


def mux_audio(temp_video: str, input_video: str, output_video: str) -> None:
    os.makedirs(os.path.dirname(output_video), exist_ok=True)
    cmd = [
        "ffmpeg", "-y",
        "-i", temp_video,
        "-i", input_video,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-map", "0:v:0",
        "-map", "1:a?",
        "-shortest",
        output_video,
    ]
    try:
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except FileNotFoundError:
        shutil.copyfile(temp_video, output_video)


def video_duration_seconds(video_path: str) -> float:
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return 4.0
    fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
    frames = cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0
    cap.release()
    if fps <= 0:
        return 4.0
    d = frames / fps
    return max(2.0, min(12.0, d if d > 0 else 4.0))


def extract_reference_image(input_photo: str, input_video: str) -> str:
    """
    Usa photo como referencia principal; si falla, toma primer frame del video.
    """
    img = cv2.imread(input_photo)
    if img is not None:
        tmp = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
        cv2.imwrite(tmp.name, img)
        return tmp.name

    cap = cv2.VideoCapture(input_video)
    ok, frame = cap.read()
    cap.release()
    if not ok:
        raise RuntimeError("No se pudo obtener imagen de referencia")

    tmp = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
    cv2.imwrite(tmp.name, frame)
    return tmp.name


def run_wan_ti2v(input_photo: str, input_video: str, output_video: str) -> None:
    model_id = os.getenv("WAN_MODEL_ID", "Wan-AI/Wan2.2-TI2V-5B-Diffusers")
    prompt = os.getenv("WAN_PROMPT", "close-up portrait video, realistic skin, natural facial motion, high quality")
    negative_prompt = os.getenv("WAN_NEGATIVE_PROMPT", "blurry, low quality, bad anatomy, artifacts, deformed")
    num_steps = int(os.getenv("WAN_NUM_STEPS", "30"))
    guidance = float(os.getenv("WAN_GUIDANCE", "5.0"))
    fps = int(os.getenv("WAN_FPS", "24"))

    try:
        import torch
        from PIL import Image
        from diffusers.utils import export_to_video
        from diffusers import WanImageToVideoPipeline as PipelineClass
    except Exception as exc:
        raise RuntimeError(
            "Faltan dependencias para Wan2.2 TI2V (torch/diffusers/Pillow). "
            "Instala: pip install torch diffusers transformers accelerate Pillow"
        ) from exc

    device = "cuda" if torch.cuda.is_available() else "cpu"
    dtype = torch.float16 if device == "cuda" else torch.float32

    pipe = PipelineClass.from_pretrained(model_id, torch_dtype=dtype)
    pipe = pipe.to(device)

    if hasattr(pipe, "enable_model_cpu_offload") and device == "cuda":
        pipe.enable_model_cpu_offload()

    ref_image_path = extract_reference_image(input_photo, input_video)
    ref_image = Image.open(ref_image_path).convert("RGB")

    duration = video_duration_seconds(input_video)
    num_frames = max(16, int(duration * fps))

    result = pipe(
        image=ref_image,
        prompt=prompt,
        negative_prompt=negative_prompt,
        num_inference_steps=num_steps,
        guidance_scale=guidance,
        num_frames=num_frames,
    )

    frames = getattr(result, "frames", None)
    if not frames:
        raise RuntimeError("El pipeline WAN no devolvió frames")

    raw_video = output_video + ".wan_raw.mp4"
    export_to_video(frames[0] if isinstance(frames, list) else frames, raw_video, fps=fps)
    mux_audio(raw_video, input_video, output_video)

    backend_marker = output_video + ".backend.txt"
    __FIX__

    if os.path.exists(raw_video):
        os.remove(raw_video)
    if os.path.exists(ref_image_path):
        os.remove(ref_image_path)




def fallback_to_existing_faceswap_worker(payload_path: str) -> None:
    worker_path = Path(__file__).with_name("faceswap_worker.py")
    if not worker_path.exists():
        raise RuntimeError("No existe worker fallback faceswap_worker.py")
    subprocess.run([sys.executable, str(worker_path), payload_path], check=True)


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("Falta payload.json")

    payload_path = Path(sys.argv[1])
    payload = json.loads(payload_path.read_text(encoding="utf-8"))

    strict_mode = os.getenv("WAN_STRICT", "0") == "1"

    try:
        run_wan_ti2v(
            payload["inputPhotoPath"],
            payload["inputVideoPath"],
            payload["outputPath"],
        )
    except Exception as exc:
        if strict_mode:
            raise
        # Fallback experimental: permite completar la prueba aunque WAN no esté disponible en el entorno
        print(f"[wan22-worker] WAN pipeline unavailable, using fallback worker: {exc}", file=sys.stderr)
        fallback_to_existing_faceswap_worker(str(payload_path))


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Worker de FaceSwap con mejor calidad:
1) Intenta usar InsightFace + inswapper_128_fp16.onnx (swap neuronal real)
2) Si no está disponible, cae a fallback OpenCV DNN + seamlessClone

Uso:
  python workers/faceswap_worker.py <payload.json>
"""

import json
import os
import shutil
import subprocess
import sys
import urllib.request

import cv2
import numpy as np

# ---------- Fallback OpenCV model ----------
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
PROTOTXT = os.path.join(MODEL_DIR, 'deploy.prototxt')
CAFFEMODEL = os.path.join(MODEL_DIR, 'res10_300x300_ssd_iter_140000.caffemodel')
PROTOTXT_URL = 'https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/deploy.prototxt'
CAFFEMODEL_URL = 'https://raw.githubusercontent.com/opencv/opencv_3rdparty/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel'

# ---------- InsightFace model ----------
INSWAPPER_PATH = os.path.join(MODEL_DIR, 'inswapper_128_fp16.onnx')
INSWAPPER_URL = 'https://huggingface.co/hacksider/deep-live-cam/resolve/main/inswapper_128_fp16.onnx'


def ensure_file(path: str, url: str):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if not os.path.exists(path):
        urllib.request.urlretrieve(url, path)


def mux_audio(temp_video: str, input_video: str, output_video: str):
    os.makedirs(os.path.dirname(output_video), exist_ok=True)
    cmd = [
        'ffmpeg', '-y',
        '-i', temp_video,
        '-i', input_video,
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-map', '0:v:0',
        '-map', '1:a?',
        '-shortest',
        output_video
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)


def try_insightface_swap(input_photo: str, input_video: str, output_video: str) -> bool:
    try:
        from insightface.app import FaceAnalysis
        from insightface.model_zoo import get_model
    except Exception:
        return False

    try:
        ensure_file(INSWAPPER_PATH, INSWAPPER_URL)

        app = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
        app.prepare(ctx_id=0, det_size=(640, 640))
        swapper = get_model(INSWAPPER_PATH, providers=['CPUExecutionProvider'])

        src_img = cv2.imread(input_photo)
        if src_img is None:
            raise RuntimeError(f'No se pudo abrir foto: {input_photo}')

        src_faces = app.get(src_img)
        if not src_faces:
            raise RuntimeError('No se detectó rostro en la foto de identidad')
        src_face = max(src_faces, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]))

        cap = cv2.VideoCapture(input_video)
        if not cap.isOpened():
            raise RuntimeError(f'No se pudo abrir video: {input_video}')

        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        temp_video = output_video + '.tmp_video.mp4'
        writer = cv2.VideoWriter(temp_video, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))

        max_side = 720
        frame_idx = 0
        while True:
            ok, frame = cap.read()
            if not ok:
                break

            h, w = frame.shape[:2]
            scale = min(1.0, float(max_side) / float(max(h, w)))
            proc = frame
            if scale < 1.0:
                proc = cv2.resize(frame, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

            # acelerar en CPU: swap cada 2 frames para mantener tiempo razonable
            if frame_idx % 2 == 0:
                tgt_faces = app.get(proc)
                if tgt_faces:
                    tgt_face = max(tgt_faces, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]))
                    proc = swapper.get(proc, tgt_face, src_face, paste_back=True)

            if scale < 1.0:
                frame = cv2.resize(proc, (w, h), interpolation=cv2.INTER_LINEAR)
            else:
                frame = proc

            writer.write(frame)
            frame_idx += 1

        cap.release()
        writer.release()
        mux_audio(temp_video, input_video, output_video)
        if os.path.exists(temp_video):
            os.remove(temp_video)
        return True
    except Exception:
        return False


def ensure_fallback_models():
    ensure_file(PROTOTXT, PROTOTXT_URL)
    ensure_file(CAFFEMODEL, CAFFEMODEL_URL)


def detect_face_box(net, frame, threshold=0.55):
    h, w = frame.shape[:2]
    blob = cv2.dnn.blobFromImage(cv2.resize(frame, (300, 300)), 1.0, (300, 300), (104, 177, 123))
    net.setInput(blob)
    detections = net.forward()

    best = None
    best_conf = threshold
    for i in range(detections.shape[2]):
        conf = float(detections[0, 0, i, 2])
        if conf < best_conf:
            continue
        box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
        x1, y1, x2, y2 = box.astype(int)
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w - 1, x2), min(h - 1, y2)
        if x2 <= x1 or y2 <= y1:
            continue
        best = (x1, y1, x2, y2)
        best_conf = conf
    return best


def fallback_swap(input_photo: str, input_video: str, output_video: str):
    ensure_fallback_models()
    net = cv2.dnn.readNetFromCaffe(PROTOTXT, CAFFEMODEL)

    model_img = cv2.imread(input_photo)
    if model_img is None:
        raise RuntimeError(f'No se pudo abrir foto: {input_photo}')
    src_box = detect_face_box(net, model_img, threshold=0.45)
    if src_box is None:
        raise RuntimeError('No se detectó rostro en la foto de identidad')
    x1, y1, x2, y2 = src_box
    source_face = model_img[y1:y2, x1:x2].copy()

    cap = cv2.VideoCapture(input_video)
    if not cap.isOpened():
        raise RuntimeError(f'No se pudo abrir video: {input_video}')

    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    temp_video = output_video + '.tmp_video.mp4'
    writer = cv2.VideoWriter(temp_video, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))

    while True:
        ok, frame = cap.read()
        if not ok:
            break

        box = detect_face_box(net, frame, threshold=0.50)
        if box is not None:
            tx1, ty1, tx2, ty2 = box
            tw = tx2 - tx1
            th = ty2 - ty1
            if tw > 20 and th > 20:
                resized = cv2.resize(source_face, (tw, th), interpolation=cv2.INTER_LINEAR)
                mask = np.zeros((th, tw), dtype=np.uint8)
                cv2.ellipse(mask, (tw // 2, th // 2), (max(10, tw // 2 - 4), max(10, th // 2 - 6)), 0, 0, 360, 255, -1)
                center = (tx1 + tw // 2, ty1 + th // 2)
                try:
                    frame = cv2.seamlessClone(resized, frame, mask, center, cv2.NORMAL_CLONE)
                except cv2.error:
                    frame[ty1:ty2, tx1:tx2] = resized

        writer.write(frame)

    cap.release()
    writer.release()
    mux_audio(temp_video, input_video, output_video)
    if os.path.exists(temp_video):
        os.remove(temp_video)


def process_video(input_photo: str, input_video: str, output_video: str):
    if try_insightface_swap(input_photo, input_video, output_video):
        return
    fallback_swap(input_photo, input_video, output_video)


def main():
    if len(sys.argv) < 2:
        raise SystemExit('Falta payload.json')

    payload_path = sys.argv[1]
    with open(payload_path, 'r', encoding='utf-8') as f:
        payload = json.load(f)

    process_video(payload['inputPhotoPath'], payload['inputVideoPath'], payload['outputPath'])


if __name__ == '__main__':
    main()

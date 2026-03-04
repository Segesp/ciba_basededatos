#!/usr/bin/env python3
"""
Worker de faceswap simplificado usando detección facial por DNN + mezcla por seamlessClone.
Uso:
  python workers/faceswap_worker.py <payload.json>

Payload:
- inputPhotoPath
- inputVideoPath
- outputPath
- options
"""

import json
import os
import sys
import urllib.request

import cv2
import numpy as np

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
PROTOTXT = os.path.join(MODEL_DIR, 'deploy.prototxt')
CAFFEMODEL = os.path.join(MODEL_DIR, 'res10_300x300_ssd_iter_140000.caffemodel')

PROTOTXT_URL = 'https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/deploy.prototxt'
CAFFEMODEL_URL = 'https://raw.githubusercontent.com/opencv/opencv_3rdparty/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel'


def ensure_models():
    os.makedirs(MODEL_DIR, exist_ok=True)
    if not os.path.exists(PROTOTXT):
        urllib.request.urlretrieve(PROTOTXT_URL, PROTOTXT)
    if not os.path.exists(CAFFEMODEL):
        urllib.request.urlretrieve(CAFFEMODEL_URL, CAFFEMODEL)


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


def extract_model_face(model_img, net):
    box = detect_face_box(net, model_img, threshold=0.45)
    if box is None:
        raise RuntimeError('No se detectó rostro en inputPhotoPath')
    x1, y1, x2, y2 = box
    face = model_img[y1:y2, x1:x2].copy()
    return face


def blend_face(frame, target_box, source_face):
    x1, y1, x2, y2 = target_box
    tw = x2 - x1
    th = y2 - y1
    if tw < 20 or th < 20:
        return frame

    resized = cv2.resize(source_face, (tw, th), interpolation=cv2.INTER_LINEAR)

    mask = np.zeros((th, tw), dtype=np.uint8)
    cv2.ellipse(mask, (tw // 2, th // 2), (max(10, tw // 2 - 4), max(10, th // 2 - 6)), 0, 0, 360, 255, -1)

    center = (x1 + tw // 2, y1 + th // 2)
    try:
        blended = cv2.seamlessClone(resized, frame, mask, center, cv2.NORMAL_CLONE)
        return blended
    except cv2.error:
        frame[y1:y2, x1:x2] = resized
        return frame


def process_video(input_photo, input_video, output_video):
    ensure_models()
    net = cv2.dnn.readNetFromCaffe(PROTOTXT, CAFFEMODEL)

    model_img = cv2.imread(input_photo)
    if model_img is None:
        raise RuntimeError(f'No se pudo abrir la foto: {input_photo}')
    source_face = extract_model_face(model_img, net)

    cap = cv2.VideoCapture(input_video)
    if not cap.isOpened():
        raise RuntimeError(f'No se pudo abrir el video: {input_video}')

    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    temp_video = output_video + '.tmp_video.mp4'
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    writer = cv2.VideoWriter(temp_video, fourcc, fps, (width, height))

    while True:
        ok, frame = cap.read()
        if not ok:
            break

        box = detect_face_box(net, frame, threshold=0.50)
        if box is not None:
            frame = blend_face(frame, box, source_face)

        writer.write(frame)

    cap.release()
    writer.release()

    os.makedirs(os.path.dirname(output_video), exist_ok=True)
    cmd = (
        f'ffmpeg -y -i "{temp_video}" -i "{input_video}" '
        f'-c:v libx264 -pix_fmt yuv420p -c:a aac -map 0:v:0 -map 1:a? -shortest "{output_video}"'
    )
    code = os.system(cmd)
    if code != 0:
        raise RuntimeError('Falló ffmpeg al muxear audio/video')

    if os.path.exists(temp_video):
        os.remove(temp_video)


def main():
    if len(sys.argv) < 2:
        raise SystemExit('Falta payload.json')

    payload_path = sys.argv[1]
    with open(payload_path, 'r', encoding='utf-8') as f:
        payload = json.load(f)

    process_video(
        payload['inputPhotoPath'],
        payload['inputVideoPath'],
        payload['outputPath']
    )


if __name__ == '__main__':
    main()

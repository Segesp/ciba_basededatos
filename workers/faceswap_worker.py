#!/usr/bin/env python3
"""
Worker de ejemplo para integrar un pipeline real de faceswap.
Uso:
  python workers/faceswap_worker.py <payload.json>

El payload contiene:
- inputPhotoPath
- inputVideoPath
- outputPath
- options
"""

import json
import os
import shutil
import sys


def main():
    if len(sys.argv) < 2:
        raise SystemExit('Falta payload.json')

    payload_path = sys.argv[1]
    with open(payload_path, 'r', encoding='utf-8') as f:
        payload = json.load(f)

    input_video = payload['inputVideoPath']
    output_video = payload['outputPath']

    # TODO: reemplazar esta copia por un pipeline real (insightface/simswap/etc.).
    os.makedirs(os.path.dirname(output_video), exist_ok=True)
    shutil.copyfile(input_video, output_video)


if __name__ == '__main__':
    main()

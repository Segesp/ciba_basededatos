# Guía práctica: FaceSwap con foto + video guía (estilo “motion control”)

## Objetivo
Tomar:
1. **Una foto de referencia** (identidad)
2. **Un video guía** (movimiento, cámara, iluminación, escena)

Y producir:
- Un video donde **el personaje del video guía se reemplaza por la persona de la foto**, manteniendo fondo, timing y movimiento lo más fiel posible.

---

## Enfoque recomendado (2 etapas)

### Etapa A — Reemplazo de cara robusto (base)
Para un resultado estable y rápido de prototipar:
- Detectar y alinear rostro por frame.
- Hacer swap con un modelo tipo **inswapper / SimSwap / ReActor**.
- Restaurar detalles con **GFPGAN / CodeFormer**.
- Reinsertar el rostro al frame original con máscara suave + corrección de color local.

**Stack sugerido (práctico):**
- `Python`
- `ONNX Runtime` (si usas modelos onnx)
- `insightface`
- `opencv-python`
- `ffmpeg`

Resultado: MVP funcional para foto + video.

### Etapa B — “Motion control” más cinematográfico
Para parecerse a Higgsfield en consistencia visual:
- **Face parsing** para máscara más precisa (piel, pelo, borde facial).
- **Temporal consistency** entre frames (filtro por landmarks/embedding o flujo óptico).
- **Color transfer** y matching de grano/ruido del material original.
- Si hay perfil extremo u oclusiones, apoyo con **diffusion inpainting** condicionado (ComfyUI).

Resultado: menos flicker, mejor integración con iluminación y perspectiva.

---

## Pipeline técnico (paso a paso)

1. **Ingesta**
   - Extraer frames y audio:
   ```bash
   ffmpeg -i input.mp4 -qscale:v 2 frames/%06d.jpg -vn -y
   ffmpeg -i input.mp4 -vn -acodec copy audio.aac -y
   ```

2. **Detección y tracking facial**
   - Detectar cara por frame.
   - Trackear ID del sujeto objetivo para no intercambiar con extras.
   - Guardar landmarks (ojos, nariz, boca, contorno).

3. **FaceSwap por frame**
   - Usar la foto de referencia para obtener embedding de identidad.
   - Ejecutar swap sobre la cara del sujeto trackeado.
   - Aplicar restauración facial ligera para evitar aspecto plástico.

4. **Composición**
   - Ajustar tono/iluminación local del rostro swap al frame original.
   - Aplicar feather en bordes de máscara.
   - Preservar detalles fuera de la cara (cabello, orejas si aplica).

5. **Suavizado temporal**
   - Reducir flicker con:
     - promedio exponencial de parámetros de color,
     - estabilización de landmarks,
     - filtro temporal del resultado (suave, sin ghosting).

6. **Render final**
   - Reensamblar video + audio:
   ```bash
   ffmpeg -framerate 30 -i output_frames/%06d.jpg -i audio.aac \
     -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest output_faceswap.mp4 -y
   ```

---

## Calidad esperada y límites reales

### Funciona muy bien cuando:
- Rostro visible la mayor parte del tiempo.
- Resolución mínima 720p.
- Iluminación relativamente estable.

### Costará más cuando:
- Hay giros de cabeza muy extremos (perfil total).
- Oclusiones fuertes (mano, cabello, objetos).
- Escenas oscuras o muy comprimidas.

En esos casos, combinar swap clásico + inpainting por diffusion mejora mucho.

---

## Diseño de producto (si quieres convertirlo en app)

### Backend recomendado
- **FastAPI** con cola de trabajos (RQ/Celery).
- Flujo:
  1. Subida de foto + video.
  2. Job asíncrono (preproceso → swap → postproceso).
  3. Entrega de URL del resultado.

### API mínima
- `POST /jobs/faceswap` (foto + video)
- `GET /jobs/{id}` (estado)
- `GET /jobs/{id}/result` (video final)

### Controles útiles de usuario
- Intensidad de parecido (identity strength).
- Suavizado temporal (anti-flicker).
- Restauración facial (off/low/high).
- Selección manual del sujeto en el video (si hay varias personas).

---

## Plan de implementación en 3 fases

### Fase 1 (MVP, 3–5 días)
- Swap funcional foto→video sobre un solo sujeto.
- Export MP4 con audio original.

### Fase 2 (calidad, 1–2 semanas)
- Tracking robusto multi-frame.
- Mejor máscara + color matching + anti-flicker.

### Fase 3 (pro, 2–4 semanas)
- Manejo de oclusiones/perfiles difíciles con diffusion assist.
- UI con presets tipo “cinematic / natural / strong identity”.

---

## Consideraciones legales y éticas
- Obtener consentimiento de uso de imagen y video.
- Informar explícitamente que el contenido es sintético.
- Evitar usos engañosos o dañinos.
- Revisar normativa local sobre deepfakes y derechos de imagen.

---

## Recomendación concreta para empezar hoy
1. Prototipa con pipeline clásico (insightface + ffmpeg).
2. Mide calidad en 10 videos reales distintos.
3. Luego incorpora módulos de temporal consistency.
4. Finalmente agrega diffusion solo para casos difíciles.

Así consigues resultados útiles rápido y te acercas al “look” tipo motion-control con iteraciones controladas.

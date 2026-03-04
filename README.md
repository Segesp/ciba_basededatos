# 📅 Gestor de Eventos y Recordatorios

Una aplicación web completa para gestionar eventos, participantes y recordatorios automáticos. Perfecto para organizar reuniones, conferencias, cumpleaños y cualquier tipo de evento.

## ✨ Características

- **Gestión de Eventos**: Crear, editar y eliminar eventos con detalles completos
- **Gestión de Participantes**: Agregar participantes con información de contacto y cantidad de asistentes planeados
- **Sistema de Recordatorios**: Configurar recordatorios automáticos para eventos
- **Notificaciones Automáticas**: El sistema notifica periódicamente sobre eventos próximos
- **Interfaz Intuitiva**: Interfaz web moderna y fácil de usar
- **Base de Datos SQLite**: Almacenamiento persistente de datos
- **API REST**: Endpoints completos para todas las operaciones

## 🚀 Cómo Empezar

### Requisitos Previos
- Node.js v14 o superior
- npm (incluido con Node.js)

### Instalación

1. **Clonar o descargar el proyecto**
```bash
cd e:\Proyectos\ciba_basededatos
```

2. **Instalar dependencias** (si no lo has hecho)
```bash
npm install
```

3. **Iniciar el servidor**
```bash
npm start
```

El servidor se ejecutará en `http://localhost:5000`

### Desarrollo
Para desarrollo con recarga automática:
```bash
npm run dev
```

## 📁 Estructura del Proyecto

```
ciba_basededatos/
├── server.js              # Servidor Express principal
├── database.js            # Configuración de SQLite
├── models.js              # Funciones de base de datos
├── package.json           # Dependencias del proyecto
├── .env                   # Variables de entorno
├── routes/
│   ├── events.js          # Rutas para eventos y participantes
│   └── reminders.js       # Rutas para recordatorios
├── public/
│   └── index.html         # Interfaz web
└── events.db              # Base de datos SQLite (se crea automáticamente)
```

## 🗄️ Base de Datos

La aplicación usa SQLite con tres tablas principales:

### Tabla `events`
Almacena información de los eventos:
- `id` - ID único
- `title` - Título del evento
- `description` - Descripción
- `date` - Fecha (YYYY-MM-DD)
- `time` - Hora (HH:MM)
- `location` - Ubicación
- `createdAt`, `updatedAt` - Marcas de tiempo

### Tabla `participants`
Almacena participantes de eventos:
- `id` - ID único
- `eventId` - Referencia al evento
- `name` - Nombre del participante
- `email` - Email
- `phone` - Teléfono
- `status` - Estado (pending, confirmed, declined)
- `plannedParticipation` - Cantidad de personas que asistirán

### Tabla `reminders`
Almacena recordatorios configurados:
- `id` - ID único
- `eventId` - Referencia al evento
- `participantId` - Referencia al participante (opcional)
- `reminderDate` - Fecha del recordatorio (YYYY-MM-DD)
- `reminderTime` - Hora del recordatorio (HH:MM)
- `notified` - Si ya ha sido notificado

## 🔌 API REST

### Eventos

**GET /api/events** - Obtener todos los eventos
```json
{
  "id": 1,
  "title": "Reunión de Equipo",
  "description": "Reunión mensual",
  "date": "2026-02-10",
  "time": "14:30",
  "location": "Sala 1"
}
```

**POST /api/events** - Crear evento
```json
{
  "title": "Reunión de Equipo",
  "description": "Reunión mensual",
  "date": "2026-02-10",
  "time": "14:30",
  "location": "Sala 1"
}
```

**GET /api/events/:id** - Obtener evento con participantes y recordatorios

**PUT /api/events/:id** - Actualizar evento

**DELETE /api/events/:id** - Eliminar evento

### Participantes

**GET /api/events/:eventId/participants** - Obtener participantes

**POST /api/events/:eventId/participants** - Agregar participante
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "phone": "+34 666 123 456",
  "plannedParticipation": 2
}
```

**PUT /api/events/:participantId/status** - Actualizar estado
```json
{
  "status": "confirmed"
}
```

**DELETE /api/events/:participantId/delete** - Eliminar participante

### Recordatorios

**GET /api/events/:eventId/reminders** - Obtener recordatorios del evento

**POST /api/events/:eventId/reminders** - Crear recordatorio
```json
{
  "participantId": 1,
  "reminderDate": "2026-02-10",
  "reminderTime": "14:00"
}
```

**GET /api/reminders/pending** - Obtener recordatorios pendientes

**POST /api/reminders/:id/notify** - Marcar como notificado

## 📱 Interfaz de Usuario

### Panel Izquierdo
- **Formulario de Creación**: Crear nuevos eventos
- **Lista de Eventos**: Selecciona un evento para ver detalles

### Panel Derecho
- **Detalles del Evento**: Información completa
- **Agregar Participantes**: Formulario para agregar asistentes
- **Gestión de Participantes**: Ver, actualizar y eliminar participantes
- **Gestión de Recordatorios**: Crear y ver recordatorios

## 🔔 Sistema de Recordatorios

El servidor verifica cada minuto si hay recordatorios pendientes. Cuando se activa un recordatorio:
- Se muestra en la consola del servidor
- Se marca como notificado en la base de datos
- En una aplicación completa se podría enviar:
  - Emails
  - SMS
  - Notificaciones push

## 🛠️ Tecnologías Utilizadas

- **Backend**: Node.js + Express.js
- **Base de Datos**: SQLite3
- **Frontend**: HTML5 + CSS3 + JavaScript Vanilla
- **Middleware**: CORS, Body Parser

## 🔒 Consideraciones de Seguridad

Para producción, considera:
- Agregar autenticación y autorización
- Validar y sanitizar todas las entradas
- Usar HTTPS
- Implementar rate limiting
- Agregar CSRF protection
- Validar permisos para acceso a datos

## 📝 Licencia

MIT

## 👨‍💻 Soporte

Para reportar problemas o sugerencias, por favor abre un issue en el repositorio.

---

**Desarrollado con ❤️ para gestionar tus eventos de forma fácil y eficiente**

## 🤖 Guía de IA (FaceSwap + video guía)

Si quieres implementar un flujo de reemplazo facial con una foto de identidad y un video guía (estilo motion control), revisa: **`GUIA_FACESWAP_MOTION_CONTROL.md`**.

## 🎬 API FaceSwap (foto + video guía)

Se implementó una API base para ejecutar jobs asíncronos:

- `POST /api/jobs/faceswap` (multipart/form-data)
  - `photo`: imagen de referencia
  - `video`: video guía
  - opcionales: `identityStrength`, `temporalSmoothing`, `restoration`, `targetPerson`
- `GET /api/jobs/:id` estado del job
- `GET /api/jobs/:id/result` descarga el video resultante

### Worker real de IA (opcional)
Por defecto, el pipeline hace ingesta/transcodificación de video guía para dejar la integración lista.

Para ejecutar un worker de IA real, configura la variable:

```bash
FACESWAP_WORKER_CMD="python workers/faceswap_worker.py"
```

El servidor le pasa un JSON con `inputPhotoPath`, `inputVideoPath` y `outputPath`.

El worker incluido (`workers/faceswap_worker.py`) ahora aplica un faceswap simplificado con detección facial DNN (OpenCV) y blending por frame.

Dependencias del worker IA:
```bash
pip install opencv-python-headless numpy
```


### Prueba runtime de FaceSwap API

Para validar arranque API, uploads reales y flujo end-to-end con `ffmpeg`:

```bash
./scripts/test-faceswap-runtime.sh
```

Para guardar evidencias (JSON, logs y MP4) en una carpeta:

```bash
RESULTS_DIR=test-results/faceswap-runtime ./scripts/test-faceswap-runtime.sh
```

La prueba ejecuta 2 escenarios:
1. Sin worker IA (`default-pass-through`)
2. Con worker externo de ejemplo (`external-worker`)

# EventHub - Sistema de Gestión de Eventos Completo

## 📋 Descripción General

EventHub es una aplicación web profesional de gestión de eventos construida con **Node.js**, **Express.js**, **SQLite3** y **diseño Swiss Clean**. Permite crear, gestionar y organizar eventos con participantes y recordatorios automáticos.

---

## ✨ Características Principales

### 🎯 Dashboard Inteligente
- Vista general con estadísticas en tiempo real
- Próximos eventos destacados
- Total de participantes y recordatorios activos
- Búsqueda y filtrado instantáneo de eventos
- Estados visuales (completado, en progreso, próximo)

### 📅 Gestión Completa de Eventos
- **CRUD completo**: Crear, leer, actualizar, eliminar eventos
- Información detallada: título, descripción, fecha, hora, ubicación
- Tabla editable con acciones rápidas
- Validación automática de datos
- Estados de evento automáticos

### 👥 Administración de Participantes
- Agregar participantes a eventos
- Campos: nombre, correo, teléfono
- Actualizar estado de participación
- Eliminar participantes
- Tracking automático de totales

### 🔔 Sistema de Recordatorios
- Crear recordatorios para eventos
- Recordatorios automáticos cada 60 segundos
- Estadísticas: pendientes, hoy, esta semana
- Historial de recordatorios enviados
- Interfaz de gestión completa

### 🎨 Diseño Profesional
- **Sistema de Diseño Swiss Clean** (Pencil MCP)
- Paleta de colores coherente
- Tipografía Inter optimizada
- Responsive design (móvil, tablet, desktop)
- Transiciones suaves y microinteracciones
- Toast notifications para feedback

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

```
┌─────────────────────────────────────────────┐
│           Frontend (HTML/CSS/JS)            │
│  - Swiss Design System                      │
│  - Responsive Layout                        │
│  - Real-time Updates                        │
└────────────────────┬────────────────────────┘
                     │
                     ↓
        ┌────────────────────────┐
        │   Express.js Server    │
        │  - RESTful API         │
        │  - CORS Enabled        │
        │  - Error Handling      │
        └────────────┬───────────┘
                     │
                     ↓
        ┌────────────────────────┐
        │   SQLite Database      │
        │  - 3 Tables            │
        │  - Relationships       │
        │  - Queries Optimized   │
        └────────────────────────┘
```

### Componentes

#### **Backend (Node.js + Express)**
- `server.js` - Punto de entrada, middleware, recordatorios automáticos
- `database.js` - Conexión SQLite, esquema, inicialización
- `models.js` - Funciones CRUD para todas las entidades
- `routes/events.js` - 12 endpoints para eventos, participantes, recordatorios
- `routes/reminders.js` - 2 endpoints para recordatorios pendientes

#### **Frontend (SPA HTML/CSS/JS)**
- `public/index.html` - Aplicación de página única completa
  - Dashboard view
  - Events view (tabla completa)
  - Participants view (formulario + lista)
  - Reminders view (estadísticas + lista)

#### **Base de Datos (SQLite3)**
- `events` - Información de eventos
- `participants` - Participantes y estado
- `reminders` - Recordatorios programados

---

## 📊 Schema de Base de Datos

### Tabla: events
```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: participants
```sql
CREATE TABLE participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  eventId INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  num_people INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
);
```

### Tabla: reminders
```sql
CREATE TABLE reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  eventId INTEGER NOT NULL,
  participantId INTEGER,
  reminder_date TEXT NOT NULL,
  reminder_time TEXT NOT NULL,
  notified BOOLEAN DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
);
```

---

## 🔌 API REST Endpoints

### Eventos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/events` | Obtener todos los eventos |
| GET | `/api/events/:id` | Obtener evento con participantes y recordatorios |
| POST | `/api/events` | Crear nuevo evento |
| PUT | `/api/events/:id` | Actualizar evento |
| DELETE | `/api/events/:id` | Eliminar evento |

### Participantes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/events/:eventId/participants` | Obtener participantes del evento |
| POST | `/api/events/:eventId/participants` | Agregar participante |
| PUT | `/api/participants/:id/status` | Actualizar estado |
| DELETE | `/api/participants/:id/delete` | Eliminar participante |

### Recordatorios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/reminders/pending` | Obtener recordatorios pendientes |
| PUT | `/api/reminders/:id/notified` | Marcar como notificado |
| GET | `/api/events/:eventId/reminders` | Recordatorios del evento |
| POST | `/api/events/:eventId/reminders` | Crear recordatorio |

---

## 🎨 Diseño y Estilo

### Sistema de Diseño
- **Nombre**: Swiss Clean Design
- **Origen**: Pencil MCP
- **Principios**: Minimalismo, tipografía clara, espaciado coherente

### Paleta de Colores
```css
--primary: #2563EB (Azul)
--background: #F8F9FA (Gris muy claro)
--surface: #FFFFFF (Blanco)
--text-primary: #18181B (Casi negro)
--text-secondary: #71717A (Gris)
--border: #E4E4E7 (Gris muy claro)
--success: #00d2a0 (Verde)
--warning: #EAB308 (Amarillo)
--danger: #991B1B (Rojo)
```

### Tipografía
- **Font**: Inter (Google Fonts)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Scales**: 
  - Heading 1: 28px / 600 weight
  - Heading 2: 20px / 600 weight
  - Body: 15px / 400 weight
  - Small: 13px / 400 weight
  - Label: 14px / 500 weight

### Espaciado
- **xs**: 4px
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 20px
- **2xl**: 24px
- **3xl**: 32px

### Radios de Esquina
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 20px

### Bordes
- **Thickness**: 1.5px (visible pero elegante)
- **Estilo**: Stroke (no sombras)
- **Divider**: 1px para separadores

---

## 🚀 Instalación y Ejecución

### Requisitos del Sistema
- **Node.js**: v14 o superior
- **npm**: v6 o superior
- **Navegador**: Chrome, Firefox, Safari, Edge
- **Conexión**: Red local para el servidor

### Pasos de Instalación

1. **Navegar al directorio del proyecto**
```bash
cd e:\Proyectos\ciba_basededatos
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Crear archivo .env (opcional)**
```bash
echo PORT=5000 > .env
echo NODE_ENV=development >> .env
```

4. **Iniciar el servidor**
```bash
npm start
# O en modo desarrollo con auto-reload:
npm run dev
```

5. **Abrir en navegador**
```
http://localhost:5000
```

---

## 📝 Uso de la Aplicación

### Dashboard
1. Ver estadísticas en tiempo real
2. Buscar eventos por título, descripción, ubicación
3. Crear nuevo evento desde botón flotante
4. Ver próximos eventos

### Crear Evento
1. Click en "Nuevo Evento"
2. Rellenar título, fecha, hora (requeridos)
3. Agregar descripción y ubicación (opcionales)
4. Click "Guardar Evento"
5. Ver confirmación y actualización en dashboard

### Gestionar Eventos
1. Ir a "Eventos"
2. Ver tabla con todos los eventos
3. Editar: click "Editar" para modificar
4. Eliminar: click "Eliminar" con confirmación
5. Buscar en la tabla

### Agregar Participantes
1. Ir a "Participantes"
2. Rellenar nombre, correo, teléfono
3. Seleccionar evento
4. Click "Agregar"
5. Ver participantes por evento

### Crear Recordatorios
1. Ir a "Recordatorios"
2. Seleccionar evento
3. Definir fecha y hora del recordatorio
4. Click "Crear Recordatorio"
5. Ver en lista de recordatorios programados

---

## 🔧 Funciones JavaScript Disponibles

### Eventos
- `loadEvents()` - Carga todos los eventos
- `saveEvent()` - Guarda nuevo evento
- `editEvent(eventId)` - Abre evento para editar
- `deleteEvent(eventId)` - Elimina evento

### Participantes
- `loadParticipants(eventId)` - Carga participantes
- `addParticipant(eventId)` - Agrega participante
- `updateParticipantStatus(participantId, status)` - Actualiza estado
- `deleteParticipant(participantId)` - Elimina participante

### Recordatorios
- `loadReminders()` - Carga recordatorios pendientes
- `createReminder(eventId)` - Crea recordatorio
- `loadRemindersView()` - Carga vista de recordatorios

### Navegación
- `showDashboard()` - Muestra dashboard
- `showEvents()` - Muestra lista de eventos
- `showParticipants()` - Muestra participantes
- `showReminders()` - Muestra recordatorios

### Utilidades
- `formatDate(dateStr)` - Formatea fecha
- `formatDateTime(date, time)` - Formatea fecha y hora
- `getEventStatus(date, time)` - Obtiene estado del evento
- `showToast(message, type)` - Muestra notificación
- `filterEvents(searchTerm)` - Filtra eventos en búsqueda

---

## 🛠️ Desarrollo

### Scripts NPM
```bash
npm start        # Iniciar servidor en producción
npm run dev      # Iniciar servidor con nodemon (auto-reload)
npm audit        # Revisar vulnerabilidades
npm audit fix    # Corregir vulnerabilidades automáticamente
```

### Dependencias
```json
{
  "express": "^4.21.2",
  "sqlite3": "^5.1.7",
  "cors": "^2.8.5",
  "body-parser": "^1.20.3",
  "dotenv": "^16.4.5"
}
```

### Variables de Entorno
```env
PORT=5000
NODE_ENV=development
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'express'"
**Solución**: Ejecutar `npm install`

### Error: "EADDRINUSE: address already in use :::5000"
**Solución**: 
- Cambiar puerto en `.env`
- O matar proceso: `lsof -ti:5000 | xargs kill -9`

### Error: "CORS policy error"
**Solución**:
- Verificar que frontend y backend están en mismo dominio
- Revisar headers CORS en `server.js`

### Base de datos corrupta
**Solución**:
- Eliminar `events.db`
- Reiniciar servidor (se recreará la BD)

### Recordatorios no funcionan
**Solución**:
- Revisar navegador (abierto en http://localhost:5000)
- Revisar console del servidor para errores

---

## 📱 Compatibilidad

### Navegadores
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

### Dispositivos
- ✅ Desktop (Windows, macOS, Linux)
- ✅ Tablet (iPad, Android tablets)
- ✅ Mobile (iPhone, Android phones)

### Sistemas Operativos
- ✅ Windows 7+
- ✅ macOS 10.12+
- ✅ Linux (Ubuntu 18.04+, Debian 9+)

---

## 📊 Estadísticas

| Métrica | Valor |
|---------|-------|
| Líneas de código (total) | 2000+ |
| Líneas Backend | 400+ |
| Líneas Frontend | 1000+ |
| Componentes CSS | 30+ |
| Funciones JS | 30+ |
| Endpoints API | 12 |
| Tablas BD | 3 |
| Soporta usuarios | Sí (global) |

---

## 🔒 Seguridad

- ✅ Validación de entrada en frontend y backend
- ✅ Sanitización de datos
- ✅ Manejo de errores robusto
- ✅ CORS configurado correctamente
- ✅ SQLite con prepared statements
- ✅ Try-catch en todas las operaciones async

---

## ⚡ Rendimiento

- ✅ Recordatorios automáticos cada 60 segundos
- ✅ Actualización de datos cada 30 segundos
- ✅ Búsqueda en tiempo real sin lag
- ✅ Caché de eventos en memoria
- ✅ Bundle size optimizado
- ✅ Sin librerías externas pesadas

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [Express.js Documentation](https://expressjs.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [MDN Web Docs](https://developer.mozilla.org/)

### Diseño
- [Pencil MCP Guidelines](https://pencildb.github.io/)
- [Swiss Design Principles](https://en.wikipedia.org/wiki/International_Typographic_Style)

### Testing
Se recomienda usar:
- Thunder Client o Postman para testing API
- DevTools del navegador para debugging
- SQLite Browser para inspeccionar BD

---

## 🤝 Contribuciones

Para mejoras futuras:
1. Agregar autenticación de usuarios
2. Implementar notificaciones por email
3. Agregar exportación a PDF/Excel
4. Multi-idioma (i18n)
5. Temas de color (light/dark)
6. Sincronización en tiempo real (WebSockets)

---

## 📄 Licencia

Proyecto educativo - Libre para uso personal y educativo.

---

**Versión**: 1.0.0  
**Última actualización**: Febrero 3, 2026  
**Estado**: ✅ Completamente funcional  
**Autor**: Desarrollo educativo completo

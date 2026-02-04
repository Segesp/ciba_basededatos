# 🚀 EventHub - Guía Rápida de Uso

## ⚡ Inicio Rápido en 3 Pasos

### 1️⃣ Instalar dependencias
```bash
cd e:\Proyectos\ciba_basededatos
npm install
```

### 2️⃣ Iniciar servidor
```bash
npm start
```

Verás esto en consola:
```
Base de datos inicializada correctamente
Sistema de recordatorios activado
Servidor ejecutándose en http://localhost:5000
```

### 3️⃣ Abrir en navegador
```
http://localhost:5000
```

---

## 📊 Interfaz Visual

### Dashboard (Inicio)
```
┌─────────────────────────────────────────────┐
│ EventHub                           Dashboard │
├─────────────────────────────────────────────┤
│                                             │
│  📊 Estadísticas en tiempo real:            │
│  - 0 Eventos Activos                        │
│  - 0 Participantes                          │
│  - 0 Recordatorios Activos                  │
│                                             │
│  🔍 Búsqueda: [Buscar eventos...]          │
│  ➕ Nuevo Evento                            │
│                                             │
│  📋 Próximos Eventos:                       │
│  (Sin eventos aún - ¡Crea uno!)            │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎯 Funcionalidades Principales

### 📅 Crear Evento
1. Haz click en botón **"Nuevo Evento"** (azul, arriba a la derecha)
2. Rellena los campos:
   - **Título** ✓ (Requerido) - Ej: "Reunión de Equipo"
   - **Descripción** (Opcional) - Ej: "Seguimiento semanal"
   - **Fecha** ✓ (Requerido) - Selecciona del calendario
   - **Hora** ✓ (Requerido) - Ej: 14:00
   - **Ubicación** (Opcional) - Ej: "Sala 201"
3. Haz click en **"Guardar Evento"**
4. Verás confirmación ✓ y el evento aparecerá en el dashboard

### 📋 Ver Todos los Eventos
1. Haz click en **"Eventos"** en la barra lateral izquierda
2. Verás tabla con:
   - Nombre del evento
   - Fecha y hora
   - Ubicación
   - Botones de acciones: Editar y Eliminar

### ✏️ Editar Evento
1. Ve a "Eventos"
2. Busca el evento
3. Haz click en **"Editar"**
4. Se abrirá el modal con los datos
5. Modifica lo que necesites
6. Haz click en **"Guardar Evento"**

### 🗑️ Eliminar Evento
1. Ve a "Eventos"
2. Haz click en **"Eliminar"** del evento
3. Confirma en el diálogo
4. El evento se eliminará (junto con participantes y recordatorios)

---

### 👥 Agregar Participantes
1. Haz click en **"Participantes"** en la barra lateral
2. En el formulario de la izquierda, rellena:
   - **Nombre** ✓ (Requerido)
   - **Correo** (Opcional)
   - **Teléfono** (Opcional)
3. Haz click en **"Agregar"**
4. El participante aparecerá en la lista

### 👤 Ver Participantes de Evento
1. Mira la sección "Participantes por Evento" a la derecha
2. Se actualizará automáticamente al agregar participantes
3. Cada participante muestra su estado

---

### 🔔 Crear Recordatorios
1. Haz click en **"Recordatorios"** en la barra lateral
2. Selecciona el evento para el que quieres recordatorio
3. Rellena:
   - **Fecha del recordatorio** - Cuándo te quieres acordar
   - **Hora del recordatorio** - A qué hora
4. Haz click en **"Crear Recordatorio"**
5. Verás el recordatorio en la lista programada

### 📅 Ver Recordatorios
1. En la vista "Recordatorios" verás:
   - **Recordatorios Pendientes** - Total
   - **Hoy** - Cuántos hoy
   - **Esta Semana** - Cuántos esta semana
   - **Lista de recordatorios** - Detalles de cada uno

---

## 🔍 Funciones Útiles

### Buscar Eventos
1. En el dashboard, usa la barra de búsqueda
2. Escribe cualquier palabra del evento
3. Filtra por:
   - Título del evento
   - Descripción
   - Ubicación

### Actualizar Datos
- Los datos se actualizan automáticamente cada 30 segundos
- También se actualizan cuando:
  - Creas un evento
  - Modificas un evento
  - Agregas un participante
  - Creas un recordatorio

---

## ⚠️ Mensajes Comunes

| Mensaje | Significado | Solución |
|---------|------------|----------|
| ✓ Evento creado correctamente | Éxito | N/A |
| ✗ Error al cargar eventos | API desconectada | Reinicia servidor (npm start) |
| ⚠ Por favor completa los campos obligatorios | Faltan datos | Rellena todos los campos con * |
| ✓ Participante agregado correctamente | Éxito | N/A |
| ✗ Error al guardar el evento | Problema en servidor | Revisa consola del servidor |

---

## 🐛 Troubleshooting

### El servidor no inicia
```bash
# Intenta esto:
npm install
npm start
```

### Puerto 5000 en uso
```bash
# Si te dice "Port already in use":
# Cambia puerto en .env:
echo PORT=3000 > .env

# O mata el proceso:
# En Windows (PowerShell como admin):
Get-Process node | Stop-Process
npm start
```

### No veo eventos en el dashboard
1. ¿Está el servidor corriendo? Debe decir: "Servidor ejecutándose en http://localhost:5000"
2. Abre DevTools (F12) → Console → ¿hay errores rojos?
3. Intenta recargar (F5)
4. Crea un evento nuevo

### Datos no se guardan
1. Verifica que el servidor está corriendo
2. Abre DevTools (F12) → Network → ¿hay requests rojos?
3. Intenta F12 → Application → Clear All Site Data
4. Recarga (F5)

### "API desconectado" en consola
El servidor no está respondiendo. Solución:
```bash
# Terminal 1:
npm start

# Terminal 2 (una vez que ves "Servidor ejecutándose..."):
# Abre navegador en http://localhost:5000
```

---

## 📱 Atajos Útiles

| Atajo | Acción |
|-------|--------|
| F5 | Recargar página |
| F12 | Abrir DevTools |
| Ctrl+Shift+Del | Limpiar datos navegador |
| Ctrl+K | Buscar (cuando esté en focus) |
| Esc | Cerrar modal |

---

## 💡 Tips Profesionales

1. **Copia URLs de participantes**: Usa email/teléfono para contactarlos
2. **Recordatorios estratégicos**: Crea un recordatorio 1 día antes del evento
3. **Descripciones claras**: Facilita búsqueda después
4. **Organización**: Usa ubicaciones consistentes (Ej: Sala A, Sala B)
5. **Limpieza**: Elimina eventos pasados para mantener BD limpia

---

## 🎨 Diseño del Sistema

### Colores
- **Azul (#2563EB)**: Botones principales y acciones
- **Verde**: Elementos completados
- **Amarillo**: Advertencias (recordatorios)
- **Rojo**: Acciones peligrosas (eliminar)
- **Gris**: Texto secundario

### Layout
- **Barra Lateral Izquierda** (280px): Navegación
- **Contenido Principal** (responsive): Información
- **Modales**: Formularios y confirmaciones
- **Notificaciones**: Abajo a la derecha

---

## 📊 Estadísticas

| Métrica | Valor |
|---------|-------|
| Máximo eventos | Ilimitado |
| Máximo participantes por evento | Ilimitado |
| Recordatorios simultáneos | Ilimitado |
| Usuarios simultáneos | 1 (local) |
| Almacenamiento | SQLite local |

---

## 🔐 Notas de Seguridad

- ✅ Los datos se guardan localmente en `events.db`
- ✅ No se envían datos a internet
- ✅ Compatible solo en red local
- ✅ Sin autenticación requerida

---

## 📞 Soporte

### Contactos API
```
GET /api/events                         - Listar eventos
POST /api/events                        - Crear evento
PUT /api/events/:id                     - Actualizar evento
DELETE /api/events/:id                  - Eliminar evento
POST /api/events/:id/participants       - Agregar participante
POST /api/events/:id/reminders          - Crear recordatorio
```

### Archivo de Logs
El servidor muestra logs en consola:
```
Base de datos inicializada correctamente
Sistema de recordatorios activado
Servidor ejecutándose en http://localhost:5000
```

---

## 🚀 Siguiente Paso

1. ✅ Servidor iniciado
2. ✅ Navegador abierto
3. ✅ Crea tu primer evento
4. ✅ Agrega participantes
5. ✅ Crea recordatorios

**¡Listo! Ahora gesitona tus eventos profesionalmente con EventHub** 🎉

---

**Versión**: 1.0.0  
**Última actualización**: Febrero 3, 2026  
**Estado**: ✅ Completamente funcional

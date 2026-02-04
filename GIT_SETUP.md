# 📦 Configuración de Repositorio Privado en GitHub

## ✅ Estado Actual

El repositorio Git local ha sido inicializado exitosamente:

- ✅ Repositorio Git creado
- ✅ `.gitignore` configurado correctamente
- ✅ Commit inicial realizado (23 archivos, 8,309+ líneas)
- ✅ Archivos innecesarios excluidos (node_modules, .env, screenshots)

## 📋 Archivos Versionados (23 archivos)

```
.gitignore
DOCUMENTATION.md
GUIA_RAPIDA.md
IMPLEMENTACION_COMPLETA.md
INICIO.md
README.md
RESUMEN.md
VERIFICACION_COMPLETA.md
START.bat
database.js
events.db
models.js
package-lock.json
package.json
playwright.config.js
server.js
test-api-simple.js
test-api.js
test-full-functionality.js
test-playwright.js
public/index.html
routes/events.js
routes/reminders.js
```

## 🚫 Archivos Excluidos (.gitignore)

Los siguientes archivos/carpetas NO se versionan:

- `node_modules/` - Dependencias de Node.js (se instalan con npm install)
- `.venv/` - Entorno virtual de Python
- `.env` - Variables de entorno sensibles
- `screenshot-*.png` - Capturas de pantalla de pruebas
- `*.log` - Archivos de log
- Archivos del sistema (.DS_Store, Thumbs.db, etc.)
- Configuraciones de IDE (.vscode/, .idea/)

## 🌐 Crear Repositorio Remoto PRIVADO en GitHub

### Paso 1: Crear el Repositorio en GitHub

1. **Ir a GitHub**: https://github.com/new
2. **Configuración del repositorio**:
   - **Repository name**: `ciba-eventhub` (o el nombre que prefieras)
   - **Description**: `Sistema de gestión de eventos y recordatorios con Node.js, Express y SQLite`
   - **Visibility**: ⚠️ **PRIVATE** ← ¡Muy importante!
   - **Initialize repository**:
     - ❌ NO marcar "Add a README file"
     - ❌ NO agregar ".gitignore"
     - ❌ NO elegir licencia
   
   (Ya tenemos estos archivos en nuestro repositorio local)

3. **Click en** `Create repository`

### Paso 2: Conectar Repositorio Local con GitHub

Después de crear el repositorio, GitHub te mostrará comandos. Usa estos (reemplaza `TU_USUARIO`):

```bash
# Agregar el repositorio remoto
git remote add origin https://github.com/TU_USUARIO/ciba-eventhub.git

# Asegurar que estamos en la rama main
git branch -M main

# Subir el código al repositorio remoto
git push -u origin main
```

### Paso 3: Verificar que se Subió Correctamente

1. Ve a tu repositorio en GitHub: `https://github.com/TU_USUARIO/ciba-eventhub`
2. Verifica que aparezcan los 23 archivos
3. Verifica que dice "**Private**" en la esquina superior
4. Verifica que aparezca el README.md con la información del proyecto

## 🔐 Verificar que es Privado

En la página de tu repositorio en GitHub, deberías ver:

```
🔒 Private
```

Si dice **Public**, ve a:
1. Settings (en el repositorio)
2. Scroll hasta abajo → "Danger Zone"
3. "Change repository visibility"
4. Seleccionar "Make private"

## 👥 Agregar Colaboradores (Opcional)

Si quieres dar acceso a otras personas:

1. Ve a tu repositorio en GitHub
2. Click en **Settings**
3. Click en **Collaborators** (menú izquierdo)
4. Click en **Add people**
5. Busca por username, nombre completo o email
6. Selecciona el nivel de acceso:
   - **Read**: Solo lectura
   - **Write**: Puede hacer push/pull
   - **Admin**: Control total

## 📥 Clonar el Repositorio en Otra Máquina

Para trabajar en el proyecto desde otra computadora:

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/ciba-eventhub.git

# Entrar al directorio
cd ciba-eventhub

# Instalar dependencias
npm install

# Crear archivo .env (necesario para el servidor)
echo PORT=5000 > .env

# Iniciar el servidor
npm start
```

## 🔄 Workflow de Git Básico

### Para hacer cambios:

```bash
# Ver estado de los archivos
git status

# Agregar archivos modificados
git add .

# Hacer commit con mensaje descriptivo
git commit -m "Descripción del cambio"

# Subir cambios a GitHub
git push
```

### Para obtener cambios de otros:

```bash
# Descargar cambios del repositorio remoto
git pull
```

## 📊 Comandos Útiles de Git

```bash
# Ver historial de commits
git log --oneline

# Ver archivos rastreados por Git
git ls-files

# Ver diferencias antes de commit
git diff

# Ver estado del repositorio
git status

# Ver remotos configurados
git remote -v

# Crear una nueva rama
git checkout -b nombre-rama

# Cambiar de rama
git checkout main

# Ver todas las ramas
git branch -a
```

## 🛡️ Mejores Prácticas

### ✅ DO (Hacer):
- ✅ Mantener el `.gitignore` actualizado
- ✅ Hacer commits frecuentes con mensajes descriptivos
- ✅ Usar branches para nuevas características
- ✅ Hacer pull antes de push para evitar conflictos
- ✅ Revisar cambios con `git diff` antes de commit
- ✅ Mantener el README actualizado

### ❌ DON'T (No hacer):
- ❌ Nunca hacer commit de `node_modules/`
- ❌ Nunca hacer commit de `.env` con credenciales
- ❌ Nunca hacer commit de archivos de log grandes
- ❌ No hacer push de cambios sin probar localmente
- ❌ No hacer commits con mensajes genéricos ("update", "fix")

## 🔒 Proteger Información Sensible

Si accidentalmente hiciste commit de información sensible (`.env`, credenciales):

```bash
# Remover archivo del historial (ejemplo con .env)
git rm --cached .env

# Agregar al .gitignore
echo ".env" >> .gitignore

# Hacer commit
git add .gitignore
git commit -m "Remover archivo sensible del repositorio"
git push
```

⚠️ **IMPORTANTE**: Esto solo remueve el archivo de commits futuros. El historial antiguo todavía lo contiene. Si expusiste credenciales, **cámbialas inmediatamente**.

## 📱 Aplicaciones de Git

Para una interfaz gráfica, puedes usar:

- **GitHub Desktop**: https://desktop.github.com/ (recomendado para principiantes)
- **GitKraken**: https://www.gitkraken.com/
- **SourceTree**: https://www.sourcetreeapp.com/
- **VS Code**: Integración Git nativa

## 🆘 Solución de Problemas

### Error: "fatal: remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/TU_USUARIO/ciba-eventhub.git
```

### Error: "Updates were rejected because the remote contains work"

```bash
git pull origin main --rebase
git push -u origin main
```

### Error: "Permission denied (publickey)"

Necesitas configurar SSH keys o usar HTTPS con token:
- Guía SSH: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
- O usar HTTPS con token personal

### Conflictos al hacer merge

```bash
# Abrir archivos con conflictos y resolverlos manualmente
# Buscar marcadores: <<<<<<, =======, >>>>>>>
# Después:
git add .
git commit -m "Resolver conflictos"
git push
```

## ✨ Estado Final

```
✅ Repositorio local: Inicializado
✅ Commit inicial: Completado (8,309+ líneas)
✅ .gitignore: Configurado
✅ Listo para: Subir a GitHub como repositorio privado
```

## 📞 Comandos de Verificación Rápida

```bash
# Verificar estado del repositorio
git status

# Ver commit más reciente
git log -1

# Ver archivos rastreados
git ls-files | wc -l

# Ver tamaño del repositorio
git count-objects -vH

# Ver remotos configurados
git remote -v
```

---

**Proyecto**: EventHub - Sistema de Gestión de Eventos y Recordatorios  
**Fecha de inicialización**: 3 de Febrero, 2026  
**Estado**: ✅ Listo para GitHub Privado

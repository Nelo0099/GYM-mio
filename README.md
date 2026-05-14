# GYM-mio

Aplicación de gimnasio SaaS con sistema de asistencia QR, gestión de usuarios y rutinas de ejercicio.

## 🖥️ Desarrollo Local

### Opción 1: Base de Datos Local (Recomendado si hay proxy)

Si tu red local tiene proxy que bloquea conexiones a bases de datos externas, usa PostgreSQL en Docker:

#### 1. Instalar Docker

- Descarga e instala Docker Desktop desde [docker.com](https://www.docker.com/products/docker-desktop/)

#### 2. Ejecutar PostgreSQL en Docker

```bash
# Ejecutar contenedor PostgreSQL
docker run --name gym-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=gym_db -p 5432:5432 -d postgres:15

# Verificar que está corriendo
docker ps
```

#### 3. Variables de Entorno

```bash
# .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/gym_db"
NEXTAUTH_SECRET="tu-secreto-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

#### 3. Variables de Entorno

Crea `.env.local`:

```bash
# Base de datos local
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/gym_db"

# NextAuth Secret
NEXTAUTH_SECRET="genera-un-secreto-nuevo"

# URL local
NEXTAUTH_URL="http://localhost:3000"
```

### Opción 2: Base de Datos Neon (si no hay proxy)

Usa Neon para desarrollo local y producción:

1. Ve a [Neon Console](https://console.neon.tech) y crea una base de datos
2. Copia la connection string

```bash
# .env.local
DATABASE_URL="postgresql://username:password@hostname:5432/database?sslmode=require"
NEXTAUTH_SECRET="tu-secreto-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Generar cliente Prisma
npx prisma generate

# Aplicar esquema a la base de datos
npx prisma db push

# Crear usuario admin
npx tsx create-admin.js

# Ejecutar el proyecto
npm run dev
```

### 4. Acceso

- **Aplicación:** http://localhost:3000
- **Admin:** rojonelov@gmail.com / User*123

**Nota:** El desarrollo local usa la misma base de datos de Neon que producción, por lo que los cambios afectan ambos entornos.

## 🚀 Despliegue en Vercel

### 1. Preparación del Repositorio

1. Asegúrate de que tu código esté subido a GitHub
2. Conecta tu repositorio con Vercel

### 2. Configuración de Base de Datos

Usa tu base de datos **Neon** para producción:

1. Ve a [Neon Console](https://console.neon.tech)
2. Crea o usa tu base de datos existente
3. Copia la connection string

**Nota:** Producción usa Neon. Desarrollo local usa base de datos local (Docker) para evitar problemas con proxy.

### 3. Variables de Entorno en Vercel

En tu dashboard de Vercel, ve a **Project Settings** → **Environment Variables** y agrega:

```bash
# Base de datos (OBLIGATORIO)
DATABASE_URL="postgresql://username:password@hostname:5432/database?sslmode=require"

# NextAuth Secret (OBLIGATORIO - genera uno nuevo para producción)
NEXTAUTH_SECRET="8788abd86033f8371c228330278ec81c2c6d88db0e1070d571046dfce6d0e631"

# URL de tu dominio en Vercel (OBLIGATORIO)
NEXTAUTH_URL="https://tu-dominio.vercel.app"
```

**⚠️ IMPORTANTE:** Genera un nuevo `NEXTAUTH_SECRET` para producción usando:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

No uses el mismo secret que en desarrollo.

### 4. Configuración del Build

El proyecto ya está configurado automáticamente con:
- `vercel.json` para configuración específica
- Script de build que incluye `prisma generate`
- Variables de entorno necesarias

### 5. Despliegue

1. **Importa tu repositorio** en Vercel
2. **Configura las variables de entorno** (paso 3)
3. **Haz deploy** - Vercel ejecutará automáticamente:
   ```bash
   prisma generate && next build
   ```

### 6. Usuario Administrador

Después del despliegue exitoso:

**Opción A: Automática**
```bash
# Conecta a tu base de datos de producción y ejecuta:
npx tsx create-admin.js
```

**Opción B: Manual**
1. Ve a `https://tu-dominio.vercel.app/login`
2. Regístrate con:
   - **Email:** `rojonelov@gmail.com`
   - **Contraseña:** `User*123`
   - **Nombre:** Admin User
3. El sistema automáticamente te hará admin

### 7. Configuración Post-Despliegue

Después del despliegue exitoso, configura la base de datos:

```bash
# Configura tu DATABASE_URL de producción
export DATABASE_URL="tu-url-de-postgresql-aqui"

# Ejecuta el script de configuración
chmod +x setup-production.sh
./setup-production.sh
```

O manualmente:
```bash
npx prisma generate
npx prisma db push
npx tsx create-admin.js
```

### 8. Verificación

Después del despliegue, verifica:
- ✅ La aplicación carga correctamente
- ✅ Puedes registrarte como usuario
- ✅ El admin puede acceder al panel (`rojonelov@gmail.com` / `User*123`)
- ✅ Las funcionalidades de QR y calendario funcionan
- ✅ La base de datos responde correctamente

### 9. Solución de Problemas

#### Error: "Prisma client outdated"
- ✅ Ya solucionado con `prisma generate` en el build

#### Error: "Database connection failed"
- Verifica que `DATABASE_URL` esté configurada correctamente en Vercel
- Asegúrate de que la base de datos PostgreSQL esté activa

#### Error: "Admin user not found"
- Ejecuta el script `setup-production.sh` después del despliegue

### 10. URLs Importantes

- **Aplicación:** `https://tu-dominio.vercel.app`
- **Login:** `https://tu-dominio.vercel.app/login`
- **Dashboard Usuario:** `https://tu-dominio.vercel.app/dashboard`
- **Panel Admin:** `https://tu-dominio.vercel.app/admin/dashboard`

## 🎯 Funcionalidades

- ✅ Autenticación completa (registro/login)
- ✅ Sistema de roles (Admin/User)
- ✅ Gestión de usuarios (CRUD)
- ✅ Sistema de asistencia con QR
- ✅ Calendario de asistencias
- ✅ Gestión de rutinas de ejercicio
- ✅ Dashboard personalizado por rol

## 🛠️ Tecnologías

- **Frontend:** Next.js 15, React 19, TypeScript
- **Backend:** Next.js API Routes
- **Base de Datos:** PostgreSQL con Prisma ORM
- **Autenticación:** NextAuth.js
- **UI:** Tailwind CSS, shadcn/ui
- **QR:** QRCode.js, html5-qrcode

## 🔐 Sistema Face ID

### Cómo Funciona
1. **Configuración**: Ve a `/dashboard/faceid` y sube 3-6 fotos de tu rostro
2. **Login**: Presiona "Face ID" en la pantalla de login
3. **Reconocimiento**: La app detecta y reconoce tu rostro automáticamente

### Tecnologías Usadas
- **face-api.js**: Librería de reconocimiento facial para navegador
- **Modelos CDN**: Carga automática desde JSDelivr
- **Almacenamiento**: Descriptores faciales en localStorage
- **Seguridad**: Validación server-side de resultados

### Configuración para Producción
Para un sistema Face ID completo en producción:

1. **Hospedar modelos localmente** en lugar de usar CDN
2. **Implementar comparación real** de descriptores faciales
3. **Base de datos dedicada** para descriptores
4. **Validación biométrica** adicional (liveness detection)

### Limitaciones Actuales
- **Modo demo**: Usa reconocimiento simulado para fiabilidad
- **Almacenamiento local**: Descriptores en browser localStorage
- **Sin persistencia server**: No guarda descriptores en base de datos

## 🔧 Solución de Problemas

### Error 500 en APIs de Rutinas

Si ves errores 500 al crear rutinas, significa que faltan las nuevas tablas en la base de datos.

**Solución:**

1. **Verificar estado de la base de datos:**
   ```javascript
   // Ejecuta en la consola del navegador en /dashboard
   fetch('/api/admin/status').then(r => r.json()).then(d => console.log(d))
   ```

2. **Si faltan tablas, ejecutar migración:**
   ```javascript
   // Ejecuta en la consola del navegador
   fetch('/api/admin/migrate', { method: 'POST' })
     .then(r => r.json())
     .then(d => console.log('Migración completada:', d))
   ```

3. **Probar todas las APIs:**
   ```javascript
   // Copia y pega todo el contenido de test-apis.js en la consola
   ```

### Tablas Requeridas

Las siguientes tablas deben existir:
- `UserProfile` - Perfiles de usuario
- `WeeklyRoutine` - Rutinas semanales
- `DailyRoutine` - Rutinas diarias
- `DailyExercise` - Ejercicios diarios

### Comando de Migración Local

Si tienes acceso local a la base de datos:
```bash
npx prisma generate
npx prisma db push
```

## 📱 Demo

- **URL:** [https://tu-dominio.vercel.app](https://tu-dominio.vercel.app)
- **Admin:** rojonelov@gmail.com / User*123
- **Usuario:** Cualquier usuario registrado
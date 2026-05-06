# GYM-mio

Aplicación de gimnasio SaaS con sistema de asistencia QR, gestión de usuarios y rutinas de ejercicio.

## 🚀 Despliegue en Vercel

### 1. Preparación del Repositorio

1. Asegúrate de que tu código esté subido a GitHub
2. Conecta tu repositorio con Vercel

### 2. Configuración de Base de Datos

1. Crea una base de datos PostgreSQL:
   - **[Neon](https://neon.com)** (Recomendado - Free tier disponible)
   - **[Supabase](https://supabase.com)** (Alternativa gratuita)
   - **Railway** o **PlanetScale**

2. Copia la URL de conexión de PostgreSQL (debe incluir `sslmode=require`)

### 3. Variables de Entorno en Vercel

En tu dashboard de Vercel, ve a **Project Settings** → **Environment Variables** y agrega:

```bash
# Base de datos (OBLIGATORIO)
DATABASE_URL="postgresql://username:password@hostname:5432/database?sslmode=require"

# NextAuth (OBLIGATORIO)
NEXTAUTH_SECRET="tu-secreto-muy-seguro-aqui-minimo-32-caracteres"
NEXTAUTH_URL="https://tu-dominio.vercel.app"

# Opcional: Características de IA (Firebase)
NEXT_PUBLIC_FIREBASE_API_KEY=""
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
NEXT_PUBLIC_FIREBASE_APP_ID=""
```

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

## 📱 Demo

- **URL:** [https://tu-dominio.vercel.app](https://tu-dominio.vercel.app)
- **Admin:** rojonelov@gmail.com / User*123
- **Usuario:** Cualquier usuario registrado
# Script para configurar la base de datos después del despliegue en Vercel
# Ejecuta este script desde tu terminal local con la DATABASE_URL de producción

echo "🚀 Configurando base de datos para GYM-mio..."
echo "Asegúrate de tener configurada la variable DATABASE_URL de producción"
echo ""

# Verificar que tenemos la variable de entorno
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL no está configurada"
    echo "Configura tu DATABASE_URL de producción antes de ejecutar este script"
    exit 1
fi

echo "📦 Generando cliente Prisma..."
npx prisma generate

echo "🗄️ Aplicando esquema a la base de datos..."
npx prisma db push

echo "👑 Creando usuario administrador..."
npx tsx create-admin.js

echo ""
echo "✅ ¡Configuración completada!"
echo ""
echo "🎯 Tu aplicación está lista para usar en:"
echo "   https://tu-dominio.vercel.app"
echo ""
echo "🔐 Credenciales del administrador:"
echo "   Email: rojonelov@gmail.com"
echo "   Contraseña: User*123"
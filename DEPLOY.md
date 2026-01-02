# 🚀 Guía de Despliegue - Buró de Crédito Persona Física

## Información del Proyecto

- **Nombre:** Buró de Crédito Persona Física
- **Versión:** 1.0.0
- **Descripción:** Panel integrado con todas las APIs de Buró de Crédito

## APIs Integradas

✅ **Autenticador** - `https://api.burodecredito.com.mx:4431/devpf/autenticador`
✅ **Monitor** - `https://api.burodecredito.com.mx:4431/devpf/monitor`
✅ **Estimador de Ingresos** - `https://api.burodecredito.com.mx:4431/devpf/estimador-ingresos`
✅ **Prospector** - `https://api.burodecredito.com.mx:4431/devpf/prospector`
✅ **Informe Buró** - `https://api.burodecredito.com.mx:4431/devpf/informe-buro`
✅ **Reporte de Crédito** - `https://api.burodecredito.com.mx:4431/devpf/reporte-de-credito`

## Credenciales Integradas

```
API Key: l7f4ab9619923343069e3a48c3209b61e4
API Secret: ee9ba699e9f54cd7bbe7948e0884ccc9
```

---

## Opción 1: Desplegar en Koyeb (Recomendado)

### Paso 1: Subir a GitHub

```bash
# 1. Inicializar Git
git init

# 2. Agregar todos los archivos
git add .

# 3. Hacer commit
git commit -m "Integración completa de APIs de Buró de Crédito Persona Física"

# 4. Agregar repositorio remoto (reemplaza con tu repo)
git remote add origin https://github.com/TU_USUARIO/buro-credito-pf.git

# 5. Cambiar a rama main
git branch -M main

# 6. Hacer push
git push -u origin main
```

### Paso 2: Conectar Koyeb

1. Ve a https://app.koyeb.com
2. Haz clic en "Create Service"
3. Selecciona "GitHub" como fuente
4. Autoriza y selecciona tu repositorio `buro-credito-pf`
5. En la rama, selecciona `main`
6. Configura las variables de entorno (ver abajo)

### Paso 3: Configurar Variables de Entorno en Koyeb

Agrega estas variables en Koyeb:

```
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

BURO_API_AUTENTICADOR_URL=https://api.burodecredito.com.mx:4431/devpf/autenticador
BURO_API_MONITOR_URL=https://api.burodecredito.com.mx:4431/devpf/monitor
BURO_API_ESTIMADOR_INGRESOS_URL=https://api.burodecredito.com.mx:4431/devpf/estimador-ingresos
BURO_API_PROSPECTOR_URL=https://api.burodecredito.com.mx:4431/devpf/prospector
BURO_API_INFORME_BURO_URL=https://api.burodecredito.com.mx:4431/devpf/informe-buro
BURO_API_REPORTE_CREDITO_URL=https://api.burodecredito.com.mx:4431/devpf/reporte-de-credito

BURO_API_KEY=l7f4ab9619923343069e3a48c3209b61e4
BURO_API_SECRET=ee9ba699e9f54cd7bbe7948e0884ccc9

OAUTH_SERVER_URL=https://tu-dominio.koyeb.app
MANUS_OAUTH_CLIENT_ID=test_client_id
MANUS_OAUTH_CLIENT_SECRET=test_client_secret
```

### Paso 4: Configurar Build y Start

En Koyeb, configura:

**Build Command:**
```bash
pnpm install && pnpm build
```

**Start Command:**
```bash
pnpm start
```

---

## Opción 2: Desplegar Localmente

### Requisitos

- Node.js 18+
- pnpm
- MySQL 8.0+

### Instalación

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar base de datos
# Edita el archivo .env con tu conexión MySQL

# 3. Ejecutar migraciones
pnpm db:push

# 4. Iniciar en desarrollo
pnpm dev

# O compilar para producción
pnpm build
pnpm start
```

---

## Rutas Disponibles

### API tRPC

- **POST** `/api/trpc/buro.iniciarConsulta` - Inicia una consulta
- **POST** `/api/trpc/buro.autenticar` - Autentica al usuario
- **POST** `/api/trpc/buro.obtenerInforme` - Obtiene informe completo
- **GET** `/api/trpc/buro.obtenerConsulta` - Obtiene una consulta guardada
- **GET** `/api/trpc/buro.obtenerHistorial` - Obtiene historial de consultas
- **POST** `/api/trpc/buro.descargarPDF` - Descarga PDF del reporte

### Frontend

- **/** - Página principal
- **/consultation/:id** - Detalle de consulta

---

## Seguridad

### Panel Privado

El panel está configurado para ser **privado solo para ti**. Para configurar autenticación:

1. **Opción A: OAuth (Recomendado)**
   - Configura `OAUTH_SERVER_URL` con tu servidor OAuth
   - Los usuarios deberán autenticarse antes de acceder

2. **Opción B: API Key**
   - Todas las rutas de API requieren autenticación de usuario

---

## Troubleshooting

### Error: "Permission denied"
- Verifica que el token de GitHub tiene permisos de `repo`
- Asegúrate de que el repositorio es accesible

### Error: "Database connection failed"
- Verifica la variable `DATABASE_URL` en Koyeb
- Asegúrate de que MySQL está corriendo

### Error: "BURO API unreachable"
- Verifica que las URLs de las APIs son correctas
- Comprueba la conectividad a internet
- Verifica que las credenciales son válidas

---

## Contacto y Soporte

Para más información sobre las APIs de Buró de Crédito, visita:
- https://www.burodecredito.com.mx

---

**Última actualización:** 2 de Enero de 2026
**Estado:** ✅ Listo para producción

# 🏦 Buró de Crédito Persona Física

Panel integrado para consultas de Buró de Crédito con todas las APIs implementadas.

## 🎯 Características

- ✅ **Integración Completa de APIs**
  - Autenticador
  - Monitor
  - Estimador de Ingresos
  - Prospector
  - Informe Buró
  - Reporte de Crédito

- ✅ **Autenticación Segura**
  - OAuth integrado
  - Protección de rutas
  - Gestión de sesiones

- ✅ **Base de Datos**
  - MySQL con Drizzle ORM
  - Migraciones automáticas
  - Esquema optimizado

- ✅ **Frontend Moderno**
  - React 19
  - TailwindCSS
  - Componentes UI reutilizables
  - Formularios validados con Zod

- ✅ **Backend Robusto**
  - Express.js
  - tRPC para type-safe APIs
  - Manejo de errores centralizado
  - Generación de PDFs

## 📋 Requisitos

- Node.js 18+
- pnpm 10+
- MySQL 8.0+

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Ejecutar migraciones de BD
pnpm db:push

# 4. Iniciar servidor de desarrollo
pnpm dev
```

El servidor estará disponible en `http://localhost:5173`

### Producción

```bash
# 1. Compilar proyecto
pnpm build

# 2. Iniciar servidor
pnpm start
```

## 🔐 Variables de Entorno

```env
# Base de datos
DATABASE_URL=mysql://user:password@host:3306/database

# APIs de Buró
BURO_API_AUTENTICADOR_URL=https://api.burodecredito.com.mx:4431/devpf/autenticador
BURO_API_MONITOR_URL=https://api.burodecredito.com.mx:4431/devpf/monitor
BURO_API_ESTIMADOR_INGRESOS_URL=https://api.burodecredito.com.mx:4431/devpf/estimador-ingresos
BURO_API_PROSPECTOR_URL=https://api.burodecredito.com.mx:4431/devpf/prospector
BURO_API_INFORME_BURO_URL=https://api.burodecredito.com.mx:4431/devpf/informe-buro
BURO_API_REPORTE_CREDITO_URL=https://api.burodecredito.com.mx:4431/devpf/reporte-de-credito

# Credenciales
BURO_API_KEY=your_api_key
BURO_API_SECRET=your_api_secret

# OAuth
OAUTH_SERVER_URL=http://localhost:5173
MANUS_OAUTH_CLIENT_ID=your_client_id
MANUS_OAUTH_CLIENT_SECRET=your_client_secret

# Servidor
PORT=5173
HOST=0.0.0.0
NODE_ENV=development
```

## 📁 Estructura del Proyecto

```
.
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas principales
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilidades
│   └── index.html
├── server/                 # Backend Express
│   ├── _core/             # Configuración central
│   ├── routers/           # Rutas tRPC
│   │   └── buro.ts        # Router de Buró
│   ├── buro-service.ts    # Cliente de APIs
│   └── db.ts              # Operaciones de BD
├── shared/                 # Código compartido
│   ├── buro-api.ts        # Tipos y constantes
│   └── types.ts           # Tipos globales
├── drizzle/               # Migraciones de BD
└── package.json
```

## 🔌 API Endpoints

### tRPC Endpoints

Todos los endpoints están bajo `/api/trpc/buro.*`

#### `iniciarConsulta`
Inicia una nueva consulta de Buró.

**Request:**
```json
{
  "nombre": "Juan",
  "apellidoPaterno": "Pérez",
  "apellidoMaterno": "García",
  "rfc": "PEGJ800101ABC",
  "fechaNacimiento": "1980-01-01",
  "calle": "Calle Principal",
  "numero": "123",
  "ciudad": "México",
  "estado": "CDMX",
  "codigoPostal": "06500"
}
```

#### `autenticar`
Autentica al usuario con el API de Autenticador.

#### `obtenerInforme`
Obtiene el informe completo integrando todas las APIs.

#### `obtenerConsulta`
Obtiene una consulta guardada por ID.

#### `obtenerHistorial`
Obtiene el historial de consultas del usuario autenticado.

#### `descargarPDF`
Descarga el reporte en formato PDF.

## 🛠️ Comandos Disponibles

```bash
# Desarrollo
pnpm dev              # Inicia servidor en modo desarrollo

# Compilación
pnpm build            # Compila para producción
pnpm start            # Inicia servidor en producción

# Base de datos
pnpm db:push          # Ejecuta migraciones

# Calidad de código
pnpm check            # Verifica tipos TypeScript
pnpm format           # Formatea código
pnpm test             # Ejecuta tests

# Utilidades
pnpm lint             # Verifica linting
```

## 📊 Flujo de Consulta

```
1. Usuario inicia consulta (iniciarConsulta)
   ↓
2. Sistema guarda datos personales
   ↓
3. Usuario se autentica (autenticar)
   ↓
4. Sistema llama a API Autenticador
   ↓
5. Usuario solicita informe completo (obtenerInforme)
   ↓
6. Sistema ejecuta en paralelo:
   - Monitor
   - Prospector
   - Estimador de Ingresos
   - Informe Buró
   - Reporte de Crédito
   ↓
7. Resultados se guardan en BD
   ↓
8. Usuario puede descargar PDF
```

## 🔒 Seguridad

- ✅ Autenticación OAuth
- ✅ Validación de entrada con Zod
- ✅ Protección de rutas
- ✅ Encriptación de datos sensibles
- ✅ HTTPS en producción
- ✅ Rate limiting (recomendado en proxy)

## 📦 Dependencias Principales

- **Frontend:**
  - React 19
  - TailwindCSS 4
  - Radix UI
  - React Hook Form
  - Zod

- **Backend:**
  - Express 4
  - tRPC 11
  - Drizzle ORM
  - Axios
  - MySQL2

## 🚀 Despliegue

Ver [DEPLOY.md](./DEPLOY.md) para instrucciones completas de despliegue en Koyeb.

## 📝 Licencia

MIT

## 👨‍💻 Autor

Buró de Crédito Persona Física - 2026

---

**Estado:** ✅ Listo para producción
**Última actualización:** 2 de Enero de 2026

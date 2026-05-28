# 💻 Nexa - Frontend del Ecosistema Broker

Interfaz de usuario moderna, reactiva e interactiva construida con **Next.js 16**, **React 19** y **Tailwind CSS 4**. Ofrece una experiencia premium con dashboards avanzados, simulación de inversiones, analíticas visuales en tiempo real y paneles de control financiero.

> [!NOTE]
> Documentación del cliente web actualizada a **Mayo de 2026**, incorporando las últimas pantallas, integraciones y flujos de usuario implementados.

---

## 🎨 Características Destacadas e Interfaz de Usuario

### 📈 1. Pantalla Invertir (`/invertir`)
Un panel premium de trading simulado que permite operar con total realismo:
* **Carrusel de Tendencias**: Muestra un carrusel dinámico de los activos más negociados y destacados del mercado.
* **Buscador Reactivo**: Filtra acciones en cartera por nombre o símbolo en tiempo real.
* **Gráficas Comparativas**: Gráficos semanales e históricos renderizados con `Chart.js` comparando el activo seleccionado frente al comportamiento de la cartera general del usuario.
* **Ficha de Operaciones Avanzada**: Soporte nativo para transacciones de Compra/Venta bajo tipos de ejecución de `mercado` (inmediato), `limite` (con precio condicional de disparo) y `stop` (con precio gatillo).
* **Indicador de Estado de Mercado**: Un banner dinámico al tope de la página conectado a `/api/market/status` del backend que informa si el mercado de Nueva York está abierto o cerrado, la zona horaria, la fuente activa de los datos (Alpha Vantage o respaldo local) y cómo serán procesadas sus órdenes.
* **Modal de Análisis Fundamental**: Integración asíncrona de [ModalAnalisisFundamental](file:///c:/Users/Alejandro/Documents/Broker/nexa/src/pages/invertir/index.tsx). Muestra al usuario más de 30 indicadores clave (ratios de valoración como P/E y PEG, dividendos, crecimiento, múltiplos EV/EBITDA, ROA/ROE, márgenes y medias móviles de 50/200 días) cargados de forma dinámica al abrir el modal para optimizar el rendimiento.

### 💼 2. Pantalla Portafolio (`/portafolio`)
Muestra el resumen consolidado de la riqueza simulada del usuario:
* **Tarjetas de Métricas**: Paneles visuales para Saldo Disponible, Valor Actual de la Cartera, Rendimiento Acumulado Porcentual y Variación Diaria Promedio (con colores condicionales según pérdidas/ganancias).
* **Consola de Órdenes Pendientes**: Integración de [ModalGestionOrden](file:///c:/Users/Alejandro/Documents/Broker/nexa/src/components/organismos/modalGestionOrden/index.tsx), permitiendo editar la cantidad o el precio límite, así como cancelar cualquier orden en estado `pendiente` directamente desde la tabla de historial de operaciones.
* **Reinicio Demo**: Un control de reinicio de simulación protegido que permite, mediante confirmación interactiva, borrar el historial de órdenes, limpiar posiciones abiertas y restablecer el saldo broker disponible a **30,000,000 COP**.

### 💸 3. Pantalla de Control de Dinero (`/controlador`)
* Módulo CRUD completo de ingresos y egresos personales que ayuda a los usuarios a visualizar balances acumulativos mensuales, listados detallados de movimientos e históricos integrados a través de gráficas interactivas.

### 📰 4. Portal de Noticias Financieras (`/noticias`)
* Tablero visual de noticias de actualidad del mercado clasificadas en filtros rápidos (`Todas`, `Acciones`, `Cripto`, `Mundiales`).
* **Optimización en Paralelo y Caching**: Conectado a la API route interna `/api/news/noticias`. Para sortear el límite de la suscripción gratuita de la API de MarketAux (máximo 3 artículos por página), el backend local de Next.js ejecuta **6 llamadas paralelas** para compilar hasta 18 noticias en una ráfaga.
* Clasifica de forma autónoma basándose en análisis textual de palabras clave e incorpora un mecanismo de caché en memoria de 15 minutos en el servidor, además de tolerar fallas de red sirviendo datos cacheados previos si la API externa falla.

---

## ⚙️ Variables de Entorno y Configuración (`.env.local`)

Cree un archivo `.env.local` en la raíz de la carpeta `nexa/` con las siguientes propiedades:

```env
# URL de Conexión del Backend Spring Boot (Peticiones del Cliente en Navegador)
NEXT_PUBLIC_BACKEND_API_BASE_URL=http://localhost:8080/api

# URL de Conexión del Backend Spring Boot (Peticiones del Lado Servidor en API Routes/NextAuth)
BACKEND_API_BASE_URL=http://localhost:8080/api

# URL Base del Frontend Next.js
NEXTAUTH_URL=http://localhost:3000

# Secreto Robusto para Firmar Sesiones de NextAuth
NEXTAUTH_SECRET=tu_secreto_super_complejo_generado_con_openssl

# Google OAuth 2.0 Client IDs & Secrets para Producción (Railway)
GOOGLE_CLIENT_ID=tu_google_client_id_despliegue
GOOGLE_CLIENT_SECRET=tu_google_client_secret_despliegue

# Google OAuth 2.0 Client IDs & Secrets para Desarrollo Local (localhost)
GOOGLE_CLIENT_ID_LOCAL=tu_google_client_id_desarrollo_local
GOOGLE_CLIENT_SECRET_LOCAL=tu_google_client_secret_desarrollo_local

# API Key de MarketAux para Sección de Noticias
MARKETAUX_API_KEY=tu_api_key_de_marketaux
```

---

## 🚀 Desarrollo y Ejecución Local

### Pasos iniciales
1. Asegúrese de haber instalado **Node.js v20+** y **npm v10+**.
2. Asegúrese de que el backend de Spring Boot ya se encuentre activo en `http://localhost:8080`.

### Iniciar servidor
Desde la carpeta raíz del frontend `nexa/`:
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Iniciar en Windows con PowerShell restrictivo
Si al intentar ejecutar `npm run dev` visualiza un error de políticas de ejecución por la firma del script `npm.ps1`, ejecute el wrapper provisto en la carpeta raíz:
```powershell
.\dev-local.cmd
```
Este wrapper invocará el comando nativo `npm.cmd` evitando el bloqueo de seguridad. La interfaz estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 🔗 Rutas de la API Interna de Next.js
* **`GET /api/news/noticias`**: Utilizada por la interfaz de noticias. Consume MarketAux en el servidor, realiza llamadas concurrentes en paralelo para consolidar feeds de múltiples páginas, categoriza dinámicamente y expone los datos normalizados en un caché local seguro de 15 minutos.
* **`GET /api/auth/[...nextauth]`**: Enrutador de sesión NextAuth.js. Coordina el flujo de inicio de Google OAuth, extrae el token de Google y lo intercambia con el backend Spring Boot para almacenar el JWT de sesión.

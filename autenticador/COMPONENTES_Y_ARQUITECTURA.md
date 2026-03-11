# Mapa de componentes y arquitectura (Caso 1)

Este documento explica los componentes y archivos del proyecto, conectandolos con los casos de uso y la arquitectura elegida.

**Casos de uso principales**
1. UC-01 Iniciar sesion: ingreso con correo y contrasena.
2. UC-02 Registrar cuenta: alta de usuario con validaciones.
3. UC-03 Recuperar contrasena: envio de enlace por correo.
4. UC-04 Restablecer contrasena: cambio de clave desde enlace.
5. UC-05 Cerrar sesion: finaliza la sesion local.
6. UC-06 Ver panel personal: acceso a cuenta y estado.
7. UC-07 Gestionar usuarios (admin): crear y eliminar perfiles.
8. UC-08 Gestionar datos (admin): crear, editar y eliminar registros.
9. UC-09 Ver salud del sistema (admin): ping a base de datos.

**Arquitectura elegida y por que**
Se adopto una arquitectura en 3 capas: Presentacion, Negocio y Datos. La razon es separar responsabilidades, reducir acoplamiento y facilitar mantenimiento y pruebas. La UI no accede a la base de datos directamente; en su lugar, usa servicios de negocio que encapsulan validaciones y reglas. Los repositorios concentran la persistencia en Supabase, lo que permite cambiar la fuente de datos sin reescribir la UI.

**Capa de Presentacion**
Incluye paginas, componentes y estilos. Implementa los flujos de UI de los casos de uso, consume el contexto de autenticacion y muestra feedback al usuario.

**Capa de Negocio**
Implementa reglas y validaciones (por ejemplo, formatos de correo, manejo de errores y mensajes). Orquesta operaciones de usuarios, datos y salud del sistema.

**Capa de Datos**
Centraliza las consultas a Supabase y mapea los registros a objetos de la aplicacion.

**Mapa de archivos**

**Raiz del proyecto**
- `autenticador/README.md` explica el caso de estudio, requerimientos, alcance y decisiones.
- `autenticador/package.json` define scripts y dependencias que habilitan los casos de uso (React, router, Supabase, Tailwind, sonner).
- `autenticador/package-lock.json` fija versiones de dependencias para reproducibilidad.
- `autenticador/vite.config.js` configura Vite y el `base` para despliegue en GitHub Pages.
- `autenticador/eslint.config.js` establece reglas de calidad para el codigo.
- `autenticador/index.html` plantilla inicial que carga `src/main.jsx`.
- `autenticador/.env` variables de entorno de Supabase para desarrollo.
- `autenticador/.env.production` variables de entorno para build y despliegue.
- `autenticador/.gitignore` excluye artefactos y archivos temporales del versionado.

**Artefactos generados**
- `autenticador/node_modules` dependencias instaladas, no se versiona.
- `autenticador/dist` salida del build para despliegue.
- `autenticador/supabase/.temp` metadata temporal de Supabase CLI.

**Public y assets**
- `autenticador/public/vite.svg` icono base del sitio.
- `autenticador/src/assets/react.svg` recurso grafico incluido por plantilla.

**Entrada de aplicacion**
- `autenticador/src/main.jsx` punto de entrada; monta la app React.
- `autenticador/src/index.css` estilos globales y configuracion base de tipografia.
- `autenticador/src/app/App.jsx` integra `AuthProvider`, enrutador y toasts.
- `autenticador/src/app/routes.jsx` define rutas de UC-01 a UC-09 y protege `/dashboard`.

**Contexto**
- `autenticador/src/app/contexts/AuthContext.jsx` estado global de sesion, usuarios y datos; conecta UI con servicios de negocio para UC-01 a UC-09.

**Paginas (Presentacion)**
- `autenticador/src/app/pages/LoginPage.jsx` UI de UC-01, valida campos y ejecuta `login`.
- `autenticador/src/app/pages/RegisterPage.jsx` UI de UC-02, valida y ejecuta `register`.
- `autenticador/src/app/pages/ForgotPasswordPage.jsx` UI de UC-03, solicita enlace.
- `autenticador/src/app/pages/ResetPasswordPage.jsx` UI de UC-04, actualiza contrasena.
- `autenticador/src/app/pages/DashboardPage.jsx` UI de UC-05 a UC-09, muestra secciones y orquesta acciones de admin.

**Componentes de autenticacion (Presentacion)**
- `autenticador/src/app/components/auth/AuthCard.jsx` layout comun para formularios de autenticacion.
- `autenticador/src/app/components/auth/AuthField.jsx` input reutilizable con manejo de errores.

**Componentes de dashboard (Presentacion)**
- `autenticador/src/app/components/dashboard/DashboardSidebar.jsx` navegacion entre secciones del dashboard.
- `autenticador/src/app/components/dashboard/AccountSection.jsx` panel de cuenta y explicacion de arquitectura (RF-08).
- `autenticador/src/app/components/dashboard/UsersSection.jsx` UI para UC-07 (solo admin).
- `autenticador/src/app/components/dashboard/DataSection.jsx` UI para UC-08 (solo admin).
- `autenticador/src/app/components/dashboard/HealthSection.jsx` UI para UC-09 (solo admin).
- `autenticador/src/app/components/dashboard/dashboardStyles.js` clases compartidas para formularios y tarjetas.

**Rutas protegidas (Presentacion)**
- `autenticador/src/app/components/ProtectedRoute.jsx` restringe `/dashboard` a usuarios autenticados.

**Servicios de negocio (Negocio)**
- `autenticador/src/app/business/services/authService.js` reglas de UC-01 a UC-05; valida credenciales, registro y recuperacion.
- `autenticador/src/app/business/services/userService.js` reglas de UC-07; crea y elimina perfiles.
- `autenticador/src/app/business/services/dataService.js` reglas de UC-08; gestiona registros.
- `autenticador/src/app/business/services/internetService.js` regla de UC-09; ping y metricas.

**Repositorios (Datos)**
- `autenticador/src/app/data/repositories/userRepository.js` CRUD de usuarios en Supabase.
- `autenticador/src/app/data/repositories/dataRepository.js` CRUD de registros en Supabase.
- `autenticador/src/app/data/repositories/healthRepository.js` ping a tablas para salud del sistema.

**Utilidades (Datos/infra)**
- `autenticador/src/app/utils/supabase.js` crea el cliente Supabase con variables de entorno.

**SQL y configuracion de base de datos (Datos)**
- `autenticador/supabase/schema.sql` define tablas `users` y `data_records`, RLS y datos demo.
- `autenticador/supabase/reset_total.sql` reinicia esquema y datos del prototipo.
- `autenticador/supabase/roles_migration.sql` migra roles y ajustes de usuarios existentes.
- `autenticador/supabase/fix_legacy_users_password.sql` corrige bases legacy sin columna de password.

**Relacion directa entre casos de uso y capas**
1. UC-01: `LoginPage.jsx` -> `AuthContext.jsx` -> `authService.js` -> `userRepository.js`.
2. UC-02: `RegisterPage.jsx` -> `AuthContext.jsx` -> `authService.js` -> `userRepository.js` y `supabase.js`.
3. UC-03: `ForgotPasswordPage.jsx` -> `AuthContext.jsx` -> `authService.js` -> `supabase.js`.
4. UC-04: `ResetPasswordPage.jsx` -> `AuthContext.jsx` -> `authService.js` -> `userRepository.js`.
5. UC-05: `DashboardPage.jsx` (logout) -> `AuthContext.jsx` -> `authService.js`.
6. UC-06: `DashboardPage.jsx` + `AccountSection.jsx` -> `AuthContext.jsx`.
7. UC-07: `UsersSection.jsx` -> `AuthContext.jsx` -> `userService.js` -> `userRepository.js`.
8. UC-08: `DataSection.jsx` -> `AuthContext.jsx` -> `dataService.js` -> `dataRepository.js`.
9. UC-09: `HealthSection.jsx` -> `internetService.js` -> `healthRepository.js`.

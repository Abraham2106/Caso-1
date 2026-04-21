# Autenticador (Vainilla por Componentes)

Esta es la versión Balanceada del proyecto original, utilizando la arquitectura pura en HTML/CSS/JS (Vainilla) de MS. Cumple la premisa de mantener código modularizado (la lógica estricta de componentes reusables) pero sin la masiva verbosidad del proyecto enterprise. El código ha sido limpiado de todos los comentarios internos para facilitar una lectura directa y profesional.
Las capas han sido re-estructuradas en HTML Components:
- `js/data/`: `store.js` manipula Promesas contra el LocalStorage para simular bases de datos.
- `js/business/`: Reglas de negocio separadas por dominios (`authService`, `adminService`).
- `js/pages/`: Integradores de las vistas HTML.
- `js/ui/`: Helpers y Validadores abstraídos para no re-escribir lógica en Múltiples páginas.

## Ejecución Local

1. Instala en VSCode la extensión "Live Server" o un simulador estático moderno.
2. Abre la raíz del folder `simple` utilizando Live Server (Clic derecho a `index.html` → Open with Live Server).

#### Cuentas Defecto Generadas:
- Admin: `demo@example.com` / `123`
- User: `user@example.com` / `123`

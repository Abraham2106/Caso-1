# Caso 1 - Prototipo de Sistema Autentificador

## 1. Descripcion del caso de estudio
Este primer caso de estudio aborda el desarrollo de un **prototipo de interfaz para un sistema autentificador**.
Durante la primera semana se repasaron fundamentos de ingenieria de software (incluyendo ciclo de vida), y se aplico la teoria mediante el modelo de desarrollo **"Codifique y corrija"** para construir una solucion funcional y demostrable.

> Importante: este proyecto es un **prototipo**, no un sistema productivo completo.

## 2. Alcance del prototipo
El prototipo cubre:
- Autenticacion de usuarios (login, registro, recuperacion de acceso).
- Control de acceso por rol (`admin` y `user`).
- Gestion de usuarios (solo `admin`).
- Gestion de datos (solo `admin`).
- Vista de dashboard de solo lectura para `user`.
- Interfaz corporativa estilo Microsoft (Microsoft-like).
- Arquitectura en 3 capas (Presentacion, Negocio, Datos).
- Verificacion de salud del sistema mediante ping a base de datos (tecnologia de internet aplicada a monitoreo operativo).

## 3. Objetivos
### Objetivo general
Construir un prototipo web autentificador aplicando principios base de ingenieria de software con enfoque practico, usando el modelo "Codifique y corrija".

### Objetivos especificos
- Implementar autenticacion y autorizacion por roles.
- Diseñar modulos de gestion de usuarios y datos.
- Aplicar una arquitectura en 3 capas para separar responsabilidades.
- Incorporar una validacion de salud del sistema basada en conectividad real con la base de datos.
- Publicar el ejecutable en un entorno en la nube.

## 4. Requerimientos funcionales
- RF-01: El sistema debe permitir iniciar sesion con correo y contrasena.
- RF-02: El sistema debe permitir registrar nuevas cuentas.
- RF-03: El sistema debe permitir recuperar acceso desde la pantalla de "olvido de contrasena" (flujo prototipo).
- RF-04: El sistema debe distinguir roles `admin` y `user`.
- RF-05: El `admin` debe poder gestionar usuarios.
- RF-06: El `admin` debe poder gestionar datos.
- RF-07: El `user` debe ver solo su dashboard en modo lectura.
- RF-08: El dashboard `admin` debe mostrar una descripcion breve de la arquitectura en 3 capas (proposito y eleccion).
- RF-09: El dashboard `admin` debe permitir verificar salud del sistema mediante ping a la base de datos.
- RF-10: El sistema debe notificar estados y errores relevantes al usuario (toasts y mensajes inline).

## 5. Requerimientos no funcionales
- RNF-01 (Usabilidad): Interfaz limpia, corporativa y consistente con estilo Microsoft-like.
- RNF-02 (Mantenibilidad): Separacion por capas (Presentacion, Negocio, Datos) para facilitar cambios.
- RNF-03 (Rendimiento): Respuesta interactiva en operaciones de UI y formularios.
- RNF-04 (Seguridad basica):
  - Rutas protegidas para areas privadas.
  - Control de acceso por rol.
  - Validacion de entradas en cliente y servicios.
- RNF-05 (Disponibilidad): Aplicacion desplegada en nube (GitHub Pages para frontend).
- RNF-06 (Portabilidad): Ejecucion en navegadores modernos compatibles con React + Vite.

## 6. Arquitectura de 3 capas
### Capa de Presentacion
- React + React Router.
- Vistas, componentes y contexto de autenticacion.

### Capa de Negocio
- Servicios de autenticacion, usuarios, datos y salud del sistema.
- Reglas funcionales y validaciones.

### Capa de Datos
- Repositorios para acceso a Supabase.
- Persistencia de usuarios y datos.

## 7. Tecnologia y herramientas
- React 18
- React Router (createBrowserRouter)
- Tailwind CSS v4
- Sonner (toasts)
- Lucide React (iconos)
- Supabase (persistencia)
- Vite
- GitHub Pages (deploy)


## 8. Entregable
Este repositorio contempla:
- **Ejecutable** del prototipo web.
- **Documentacion** del caso (descripcion, alcance, objetivos, requerimientos funcionales y no funcionales).

Repositorio:
- https://github.com/Abraham2106/Caso-1

Ejecutable en la nube:
- https://abraham2106.github.io/Caso-1/

## 9. Equipo de desarrollo (2 desarrolladores)
- Desarrollador 1: Abraham Gerardo Solano Parrales
- Desarrollador 2: 

---

## 10. Ejecucion local
```bash
npm install
npm run dev
```

## 11. Build y deploy
```bash
npm run build
npm run deploy
```

# Training 4 You

Aplicación web de **Training 4 You (T4U)** para la captación de alumnado y la gestión interna de cursos y solicitudes.

Desarrollada para **T4A BY EVG S.L.**

---

## Descripción

Training 4 You ofrece formación práctica en aula virtual. Esta aplicación centraliza la presencia digital del servicio: catálogo de áreas formativas, canal de contacto y panel de administración.

Las personas interesadas pueden consultar los cursos y solicitar información o plaza. El equipo recibe las solicitudes por correo y las gestiona desde el panel admin, junto con el contenido publicado en la web.

---

## Funcionalidades

### Sitio público

- Página de inicio y presentación del servicio
- Catálogo de áreas / cursos con fichas detalladas
- Formulario de solicitud de información o plaza
- Página «Acerca de mí»
- Aviso legal, política de privacidad y política de cookies

### Administración (`/admin`)

- Acceso protegido por contraseña
- Gestión de solicitudes (consulta, estados de seguimiento, eliminación)
- Gestión de áreas / cursos (alta, edición, publicación y fotografías)

### Integraciones

| Servicio   | Uso                                      |
|------------|------------------------------------------|
| Supabase   | Base de datos PostgreSQL y almacenamiento de imágenes |
| Brevo      | Envío de correos al recibir una solicitud |
| Netlify    | Alojamiento y despliegue continuo         |

---

## Stack tecnológico

- [Astro](https://astro.build) (SSR)
- [@astrojs/netlify](https://docs.astro.build/en/guides/integrations-guide/netlify/)
- [PostgreSQL](https://www.postgresql.org/) mediante [`pg`](https://node-postgres.com/)
- [Supabase Storage](https://supabase.com/docs/guides/storage) (`@supabase/supabase-js`)
- [Brevo API](https://developers.brevo.com/)

---

## Requisitos

- Node.js **22.12** o superior
- [pnpm](https://pnpm.io/)
- Proyecto Supabase configurado (base de datos y, si aplica, Storage)
- Cuenta Brevo con API key

---

## Instalación

```bash
pnpm install
cp .env.example .env
```

Completa `.env` con las credenciales del entorno. A continuación:

```bash
pnpm dev
```

La aplicación quedará disponible en el puerto indicado por Astro (por defecto `http://localhost:4321`).

---

## Variables de entorno

Las variables se definen en `.env` en local y en la configuración del hosting en producción. El archivo `.env` **no** forma parte del repositorio.

| Variable                     | Descripción                                      |
|-----------------------------|--------------------------------------------------|
| `DATABASE_URL`              | URI de conexión a PostgreSQL (Supabase)          |
| `BREVO_API_KEY`             | Clave de la API de Brevo                         |
| `BREVO_REMITENTE`           | Dirección de correo remitente                    |
| `BREVO_DESTINO`             | Dirección que recibe los avisos de solicitud     |
| `ADMIN_PASSWORD`            | Contraseña de acceso al panel de administración  |
| `ADMIN_SECRET`              | Secreto para firmar la cookie de sesión          |
| `SUPABASE_URL`              | URL del proyecto Supabase                        |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave *service role* (solo servidor)             |

Plantilla de referencia: [`.env.example`](./.env.example).

---

## Scripts

| Comando        | Descripción                |
|----------------|----------------------------|
| `pnpm dev`     | Servidor de desarrollo     |
| `pnpm build`   | Build de producción        |
| `pnpm preview` | Vista previa del build     |

---

## Despliegue

El proyecto está preparado para **Netlify** (salida en modo servidor).

1. Conectar este repositorio al sitio de Netlify.
2. Configurar el comando de build: `pnpm build`.
3. Definir las variables de entorno en el panel de Netlify (mismas claves que en `.env`).

---

## Estructura del proyecto

```
src/
  pages/          # Rutas públicas y admin
  components/     # Componentes reutilizables
  layouts/        # Layouts de página
  lib/            # Base de datos, auth, Brevo, Storage
  styles/         # Estilos globales
public/           # Assets estáticos
sql/              # Esquema y migraciones SQL
docs/             # Documentación auxiliar
```

---

## Contacto del servicio

- Web: [training4you.es](https://training4you.es)
- Email: [info@training4you.es](mailto:info@training4you.es)

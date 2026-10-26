# Revisión de seguridad — 26 de octubre de 2026

## Resumen

Portafolio estático sin servidor de aplicación, autenticación, formularios ni secretos necesarios para funcionar. No se detectaron vulnerabilidades críticas o altas en el código actual inspeccionado. Se añadió defensa en profundidad y se probaron sus controles, sin publicar a producción ni realizar pruebas intrusivas.

## S01 — Política de contenido · BAJO · corregido

Evidencia original: `index.html:8` cargaba recursos sin política CSP; la respuesta HTTPS pública consultada tampoco declaró CSP. No constituye por sí sola prueba de XSS explotable.

Solución: `index.html:5`, CSP con recursos y conexiones al mismo origen, scripts propios y hash del bloque JSON-LD. No permite `unsafe-inline` ni `unsafe-eval`; prohíbe objetos, frames, cambios de base y formularios. Se verificaron el bloqueo de script inline inyectado y de una conexión a un dominio externo. `qa/check-site.mjs` verifica la correspondencia del hash.

Límite: CSP por meta no protege el sitio contra ser embebido mediante `frame-ancestors`; esa directiva requiere encabezados del hosting. No se declara un control que no exista.

## S02 — Renderización traducida · INFORMATIVO · revisado

`app.js:393` conserva los contenidos originales y `app.js:592` escribe traducciones mediante `innerHTML`. Solo reciben diccionarios locales del código, con saltos de línea y etiquetas conocidas. No reciben parámetros URL, mensajes, HTML remoto ni contenido introducido por visitantes. No se probó una ruta de explotación. Se documentó que estos diccionarios no deben utilizarse para contenido externo; si se añade un CMS deberá revisarse este límite antes de integrar HTML.

El parámetro `category` solo selecciona valores de una lista permitida (`app.js:495`); un valor desconocido muestra todos los proyectos. El idioma solo admite `en` o `es`. El almacenamiento contiene una preferencia, no sesiones ni credenciales.

## S03 — Secretos y terceros · INFORMATIVO · revisado

Búsqueda de patrones comunes de claves privadas, tokens de GitHub, AWS y OpenAI en los archivos de texto actuales: sin coincidencias. No se revisaron todos los commits históricos ni la configuración privada de la cuenta. No se exportó `.git`, credenciales ni archivos internos de Sites. El email, retrato y CV son contenido público autorizado para el portafolio.

No hay librerías de ejecución, scripts de terceros, analítica ni fuentes externas. Los enlaces con `target="_blank"` conservan `noopener noreferrer`. Las herramientas de QA no se cargan desde la página.

## S04 — Hosting · INFORMATIVO · verificación parcial

El dominio actual respondió con HTTPS 200 y HSTS. No se alteraron DNS ni ajustes del repositorio. La nueva versión se validó localmente; sigue pendiente comprobar sus encabezados, caché y rutas después de una publicación autorizada.

No aplican pruebas de SQL, CSRF con sesión, roles, autenticación ni pagos al código actual. Esta revisión no sustituye una auditoría de las apps externas de Render y Streamlit.

# Auditoría y optimización del portafolio

Fecha: 26 de octubre de 2026 · Enrique Olvera Monroy

Repositorio: https://github.com/EnriqueOlveraMonroy/enriqueolveramonroy.github.io
Versión de partida: `ebd0c60` (descargada desde la rama `main`).
Alcance: copia local del sitio público; no se publicaron cambios ni se alteraron los proyectos externos.

## A. Resumen ejecutivo

Se preservaron composición, paleta, tipografía, contenido y distribución responsive. La eliminación de `[ eo ]` y el texto «PROGRESS / PROGRESO» presentes en GitHub permanecen intactos. Se corrigieron navegación, recuperación ante fallos de imagen, persistencia de filtros y acceso básico sin JavaScript. Se añadieron metadatos, protección CSP y recursos de publicación estática.

La validación final obtuvo **139 comprobaciones de navegador aprobadas y 205 comprobaciones estáticas aprobadas**. No aparecieron errores de consola, excepciones JavaScript, recursos fallidos ni respuestas HTTP de error durante los flujos normales evaluados. Los fallos de imagen y las violaciones CSP provocados deliberadamente se probaron en páginas aisladas.

La medición móvil de laboratorio pasó de **75 a 100 en rendimiento Lighthouse** y el LCP de **8.55 s a 1.66 s**. Son muestras de laboratorio, no resultados reales de usuarios ni una garantía para cualquier conexión.

Persisten observaciones de contraste del diseño original y límites de verificación de sitios externos. No se declara conformidad completa con WCAG 2.2 AA.

## Arquitectura y requisitos aplicables

- HTML, CSS y JavaScript nativos, sin framework, compilador ni dependencias de ejecución.
- SPA de navegación por anclas; 11 proyectos, 6 filtros, 13 vistas previas y dos idiomas.
- Preferencia de idioma en `localStorage`; filtro en el parámetro validado `category`.
- CV PDF y recursos visuales locales. Los proyectos y redes se abren mediante enlaces reales.
- Sin cuentas, sesiones, autenticación, formularios, base de datos, pagos, inventario ni panel administrativo. Pruebas de autorización, SQL/CSRF, transacciones y ecommerce: **no aplican** a esta aplicación.
- No se añadieron analítica, cookies de rastreo, servicios de terceros ni integraciones simuladas.
- El dominio público respondió por HTTPS (HTTP 200), con HSTS y caché del hosting. No se accedió a la configuración privada de GitHub, DNS ni facturación.

## B. Resultados de auditoría

| ID | Área / severidad | Evidencia y componente | Solución / estado |
|---|---|---|---|
| F01 | Navegación · MEDIO | Al abrir el menú a 390 px y pasar a 1440 px, `#mobile-nav` seguía visible. Evidencia: `baseline.json`, `mobileNavVisibleAfterResize: true`. | `app.js` cierra el menú al cambiar de breakpoint; `styles.css` evita mostrarlo en escritorio. **Corregido**. |
| F02 | Resiliencia · MEDIO | Bloquear la imagen del restaurante dejaba una imagen rota y un texto de vista previa normal, sin recuperación. | `app.js` / `index.html`: estados reales de carga/error, mensaje accesible, botón de reintento y zoom deshabilitado mientras no existe imagen. Fallo y recuperación comprobados. **Corregido**. |
| F03 | Rendimiento · MEDIO | Capturas PNG pesadas y recursos cargados antes de necesitarlos; LCP móvil original 8.55 s. | Siete WebP sin pérdida con originales PNG como respaldo; carga diferida y decodificación asíncrona. 1,069,630 bytes menos en esas siete imágenes. **Corregido dentro del alcance de laboratorio**. |
| F04 | Navegación · BAJO | El filtro solo vivía en memoria y se perdía al recargar. | `app.js`: parámetro `category`, lista permitida, navegación Atrás y recuperación segura ante valores desconocidos. **Corregido**. |
| F05 | Mejora progresiva · MEDIO | Sin JavaScript, menú y filtros no funcionaban y los botones de imagen no abrían el recurso. | `index.html`, `noscript.css`: enlaces reales a imágenes, navegación móvil disponible y controles dependientes de JS ocultos, con explicación. **Corregido**. |
| F06 | Accesibilidad · MEDIO | Cerrar el menú tras navegar podía dejar el foco en un enlace oculto; región ampliada sin acceso directo de teclado. | `app.js`, `index.html`, `styles.css`: foco al destino, región desplazable por teclado, estado de carga y etiquetas EN/ES. **Corregido y verificado**. |
| F07 | Defensa en profundidad · BAJO | No existía una CSP declarada en el documento ni en los encabezados públicos observados. No se demostró una vulnerabilidad explotable. | `index.html`: política de origen propio, sin scripts inline arbitrarios ni eval; bloqueo de objetos, frames y envío de formularios. Inyección inline y conexión externa bloqueadas en prueba. **Mejorado**. |
| F08 | SEO / publicación · BAJO | Faltaban canonical, sitemap, robots, imagen social, datos estructurados y página 404 propia. | `index.html`, `robots.txt`, `sitemap.xml`, `404.html`. URL y persona basadas en datos confirmados. **Implementado**; ruta 404 del hosting pendiente de publicar y comprobar. |
| F09 | Mantenimiento · BAJO | Diccionario con traducciones antiguas, múltiples sobrescrituras y código comprimido difícil de editar. | `app.js`: eliminadas 35 claves no utilizadas, diccionarios consolidados y formato legible; CSS formateado; comprobaciones reutilizables en `qa/`. **Corregido**. |
| F10 | Contraste · MEDIO | axe detecta la regla `color-contrast`: 51 elementos a 1440 px y 50 a 390 px, tanto antes como después. Ejemplos: `introEyebrow` 4.29:1, `project-count` 4.02:1. | **Pendiente por la instrucción de conservar el diseño**. No se cambiaron colores ni tamaños para ocultar el problema. Requiere un ajuste visual autorizado para alcanzar AA. |
| F11 | Dependencias externas · MEDIO | 12 destinos de GitHub respondieron 200. Northwestern agotó el tiempo de espera; Tu Lado B entró en redirecciones de acceso; LinkedIn devolvió 999 al cliente automatizado. | **No confirmado** para esas tres plataformas; estos resultados no prueban que estén permanentemente caídas. Enlaces conservados. Las aplicaciones externas y sus datos no forman parte de esta auditoría. |

No se detectaron hallazgos críticos o altos en el código del portafolio dentro del alcance inspeccionado. La revisión no incluye el historial completo de Git, credenciales de cuenta ni infraestructura privada.

## C. Cambios implementados

- `index.html`: imágenes alternativas sin pérdida, metadatos, CSP, semántica y enlaces de vista previa con mejora progresiva.
- `app.js`: navegación responsive, estados y reintentos de imagen, historial de filtros, etiquetas accesibles y limpieza de traducciones.
- `styles.css`: formato legible y reglas concretas para interacción, foco, navegación y página 404. Sin cambios de paleta ni rediseño de componentes.
- `assets/*.webp`: siete recursos optimizados. Se conservan los PNG y el retrato JPEG originales; el retrato no se convirtió porque el archivo resultante era mayor.
- `noscript.css`: comportamiento alternativo sin JavaScript.
- `404.html`, `robots.txt`, `sitemap.xml`: soporte de publicación.
- `qa/check-site.mjs`, `qa/browser-flows.cjs`, `qa/serve.py`: comprobaciones y vista previa opcionales; no son dependencias de la web.
- `README.md`, `GUIA_GITHUB_PAGES.md` y documentos de auditoría: actualización y mantenimiento.

### Conservación visual

Se compararon capturas completas con los mismos tamaños de ventana y todas las imágenes decodificadas. Alturas idénticas: **1440 × 6267 px** y **390 × 9482 px**. Las imágenes convertidas mantienen exactamente sus píxeles decodificados según Sharp. La comparación del navegador presenta aproximadamente 1.7 % / 2.0 % de píxeles distintos, casi todos dentro de imágenes optimizadas por diferencias de representación al escalar PNG/WebP; no se presenta como identidad píxel a píxel de toda la página. Fuera de imágenes hubo 10 píxeles distintos en escritorio y 0 en móvil. Se revisó visualmente la composición.

## D. Pruebas ejecutadas

| Prueba | Resultado / alcance |
|---|---|
| ESLint (no-undef, no-unused-vars, no-dupe-keys, no-unreachable, no-eval, no-implied-eval, no-new-func, valid-typeof) | Aprobado. |
| Sintaxis JavaScript / `node --check` | Aprobado. |
| Comprobaciones estáticas | 205/205: recursos, anclas, traducciones, IDs, metadatos, hash CSP, PDF, once proyectos y configuración estática. |
| Navegador / Chromium | 139/139: filtros en EN/ES, 13 imágenes × ambos idiomas, zoom, Escape y foco; persistencia, historial, teclado, CV, almacenamiento bloqueado, no-JS, error y reintento, CSP. |
| Responsive | Sin desbordamiento horizontal a 320, 390, 520, 700, 768, 1024, 1280 y 1440 px, en ambos idiomas. |
| Navegación por teclado y movimiento reducido | Skip link, menú, Escape, acordeones y retorno de foco comprobados; reducción de movimiento respetada. |
| axe / WCAG 2 A-AA, 2.1 AA, 2.2 AA | **No aprobado globalmente**: permanece `color-contrast` (51/50 nodos). No aparecieron nuevas reglas incumplidas en los estados principales auditados. |
| Consola y red de los flujos normales | Sin excepciones, errores de consola, solicitudes fallidas ni respuestas HTTP de error. |
| Seguridad estática | No se encontraron patrones comunes de secretos en archivos de texto actuales. Sin dependencias de ejecución que auditar. No equivale a pentest ni revisión de historial completo. |
| Disponibilidad de enlaces | 12 URLs GitHub con 200; tres destinos externos sin validación concluyente. |
| Compilación / tipado | No aplican: sitio buildless en JavaScript. |
| Backend, pagos, autenticación, DB | No aplican. |
| Safari, Firefox, dispositivos físicos y lector de pantalla real | No ejecutados. El tamaño móvil se emuló en Chromium. |
| INP de campo / datos reales de usuarios | No disponibles; no se inventaron. |
| Despliegue y respuesta 404 final de GitHub Pages | No ejecutados: la autorización actual excluye publicar sin confirmación explícita. |

Se detectaron reinicios de conexión del servidor de prueba inicial al concurrir varias herramientas. Se repitió la comparación final de ambas versiones con el mismo servidor local, una cola de conexiones mayor y sin ejecutar otros tests de navegador durante las mediciones Lighthouse. Los resultados de la tabla siguiente corresponden a esa ejecución final.

## E. Métricas de rendimiento

Lighthouse **13.5.0**, Chrome headless 155, modo móvil, red simulada de aproximadamente 1.6 Mbps y CPU ×4. Una ejecución comparable por versión, mismo equipo y servidor local. No se presentan como mediciones de producción ni como percentiles de usuarios reales.

| Métrica | Antes | Después |
|---|---:|---:|
| Rendimiento | 75/100 | 100/100 |
| Accesibilidad (Lighthouse) | 96/100 | 96/100 |
| Buenas prácticas (Lighthouse) | 100/100 | 100/100 |
| SEO (Lighthouse) | 100/100 | 100/100 |
| LCP | 8.55 s | 1.66 s |
| CLS | 0 | 0 |
| TBT | 0 ms | 0 ms |
| Bytes de recursos medidos | 1,703,577 | 700,880 |

Reducción de recursos medidos: **58.9 %**. El TBT no sustituye al INP. El resultado 96 de accesibilidad no acredita cumplimiento AA. Véanse las definiciones y la distinción entre laboratorio y campo en [Web Vitals](https://web.dev/articles/vitals).

## F. Pendientes y límites

1. **Contraste:** ajustar algunos tonos secundarios exige una modificación visual que no está autorizada. [WCAG 2.2: contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
2. **Aplicaciones externas:** confirmar manualmente disponibilidad y permisos de Northwestern/Render y Tu Lado B/Streamlit. No se cambiaron sus enlaces ni se afirmó que sus análisis estén validados.
3. **Producción:** subir la versión revisada cuando se autorice y comprobar Pages, el 404, caché, redes sociales y recursos bajo el dominio real. No se modificaron DNS, HTTPS ni configuraciones de cuenta.
4. **CSP y hosting:** la política en HTML no puede imponer `frame-ancestors` ni todos los encabezados HTTP. No se simularon encabezados mediante etiquetas meta. Un control adicional requeriría infraestructura compatible. [MDN: CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP).
5. **Pruebas adicionales:** lectores de pantalla, navegadores distintos de Chromium y dispositivos físicos; medir INP real cuando existan datos de usuarios.
6. **Privacidad / legal:** no hay comercio ni captación mediante formularios en el código actual, y solo se guarda una preferencia de idioma local. El hosting recibe solicitudes de los visitantes. No se han inventado políticas comerciales ni se ha certificado cumplimiento jurídico; cualquier obligación legal específica requiere revisar el tratamiento real y el hosting.

## G. Veredicto final

**APTO CON OBSERVACIONES dentro del alcance funcional local evaluado.** No se detectaron bloqueantes críticos o altos en el portafolio y se completaron los flujos críticos. Quedan documentados el contraste original, la disponibilidad de aplicaciones externas y las verificaciones posteriores al despliegue. Este veredicto no significa conformidad WCAG completa, garantía de seguridad absoluta ni aprobación de un despliegue que no se ha realizado.

## Evidencias

El paquete de evidencias separado contiene `baseline.json`, `verification.json`, `static-checks.json`, ambos informes Lighthouse, `performance-summary.json`, `image-optimization.json`, `visual-comparison.json`, `external-links.json`, `security-scan.json` y capturas originales/optimizadas. Los destinos de redirecciones se registran sin parámetros de sesión.

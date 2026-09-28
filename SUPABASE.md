# Configuración de Supabase

1. En tu proyecto Supabase, abre SQL Editor y ejecuta `supabase-schema.sql`.
2. Copia la URL del proyecto y su clave pública (publishable o anon) desde el panel Connect a `supabase-config.js`.
3. Abre `web.html` con un servidor local (por ejemplo, Live Server) y envía una dedicatoria. Comprueba que aparece también al abrir la página en otro navegador.

Publica también `supabase-config.js` y `guestbook.js` junto con el HTML. Esta página estática no lee archivos `.env`.

La tabla permite leer y enviar dedicatorias sin iniciar sesión; son públicas. Los visitantes no pueden editar ni eliminar registros. No uses claves secret ni service_role en estos archivos. El formulario muestra las 100 dedicatorias más recientes. Los mensajes anteriores de localStorage no se migran automáticamente.

Referencia: https://supabase.com/docs/reference/javascript/initializing

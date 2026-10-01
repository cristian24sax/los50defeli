# Configuración de Supabase

1. En tu proyecto Supabase, abre SQL Editor y ejecuta `supabase-schema.sql`.
2. Copia la URL del proyecto y su clave pública (publishable o anon) desde el panel Connect a `supabase-config.js`.
3. Abre `index.html` con un servidor local (por ejemplo, Live Server) y envía una dedicatoria. Comprueba que aparece también al abrir la página en otro navegador.

Publica también `supabase-config.js` y `guestbook.js` junto con el HTML. Esta página estática no lee archivos `.env`.

La tabla permite leer y enviar dedicatorias sin iniciar sesión; son públicas. Los visitantes no pueden editar ni eliminar registros. No uses claves secret ni service_role en estos archivos. El formulario muestra las 100 dedicatorias más recientes. Los mensajes anteriores de localStorage no se migran automáticamente.

Referencia: https://supabase.com/docs/reference/javascript/initializing

## Fotos compartidas

Ejecuta de nuevo `supabase-schema.sql` en SQL Editor para activar las fotos, incluso si ya creaste la tabla antes. Conserva las dedicatorias existentes y añade `photo_path`, el bucket público `recuerdos` y su política de subida. Este cambio local no ejecuta la migración en tu proyecto remoto.

Cada dedicatoria admite hasta 10 fotos opcionales JPG, PNG o WebP de hasta 5 MB cada una. Los archivos se guardan en Supabase Storage y sus rutas en `photo_paths`. Ejecuta de nuevo todo `supabase-schema.sql` para añadir esta columna y la vista `recuerdos_publicos`. La vista incluye también las fotos antiguas de `photo_path`, sin duplicarlas. Las fotos aparecen en «Recuerdos compartidos» de seis en seis; al tocarlas se abre la imagen completa. Las 24 fotos originales siguen en `img`.

Las fotos son públicas y se publican sin revisión previa, igual que los mensajes. No se otorgan permisos públicos para reemplazar ni borrar archivos. Puedes retirar fotos desde Storage en el panel de Supabase y poner su `photo_path` en NULL desde Table Editor. No agregues una clave service_role al navegador.

Si una subida termina pero falla el guardado del mensaje, el formulario reutiliza el archivo al reintentar sin cambiar la selección. Si se abandona o recarga la página, puede quedar un archivo sin dedicatoria; esos archivos se pueden limpiar desde el panel de Storage. La subida anónima no incluye límite por visitante; controla el uso de almacenamiento desde Supabase.

Verificación tras ejecutar el SQL: envía un mensaje sin foto, otro con una foto válida y comprueba el álbum desde otro navegador. Prueba también un archivo de más de 5 MB; el formulario debe rechazarlo. El bucket aplica asimismo límites de tamaño y tipo.

Documentación: https://supabase.com/docs/guides/storage/uploads/standard-uploads

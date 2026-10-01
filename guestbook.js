(() => {
    const form = document.getElementById('message-form');
    const button = form.querySelector('button[type="submit"]');
    const list = document.getElementById('messages-list');
    const status = document.getElementById('message-status');
    const nameInput = document.getElementById('guest-name');
    const textInput = document.getElementById('guest-message');
    const photoInput = document.getElementById('guest-photo');
    const preview = document.getElementById('photo-preview');
    const removePhoto = document.getElementById('remove-photo');
    const photoStatus = document.getElementById('photo-status');
    const shared = document.getElementById('shared-photos');
    const sharedSection = shared.closest('.shared-memories');
    const sharedStatus = document.getElementById('shared-status');
    const morePhotos = document.getElementById('shared-more');
    const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
    let previewUrls = [];
    const uploadedPhotos = new Map();
    let sharedOffset = 0;
    let loadingPhotos = false;
    nameInput.maxLength = 100;
    textInput.maxLength = 2000;
    let client;
    let sending = false;

    function validatePhoto(file) {
        if (!file) return;
        if (!extensions[file.type]) throw new Error('Elige una foto JPG, PNG o WebP.');
        if (file.size > 5 * 1024 * 1024 || !file.size) throw new Error('La foto debe pesar entre 1 byte y 5 MB.');
    }

    function clearPhoto() {
        clearPhotoPreview();
        photoInput.value = '';
    }
    photoInput.addEventListener('change', () => {
        const files = [...photoInput.files];
        clearPhotoPreview();
        try {
            if (files.length > 10) throw new Error('Puedes seleccionar hasta 10 fotos por dedicatoria.');
            files.forEach(validatePhoto);
            if (!files.length) return;
            files.forEach(file => {
                const url = URL.createObjectURL(file);
                previewUrls.push(url);
                const image = document.createElement('img');
                image.src = url;
                image.alt = `Vista previa: ${file.name}`;
                preview.append(image);
            });
            photoStatus.textContent = `${files.length} fotos seleccionadas`;
            preview.hidden = removePhoto.hidden = false;
        } catch (error) {
            photoInput.value = '';
            photoStatus.textContent = error.message;
        }
    });
    function clearPhotoPreview() {
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        previewUrls = [];
        uploadedPhotos.clear();
        preview.replaceChildren();
        preview.hidden = removePhoto.hidden = true;
        photoStatus.textContent = '';
    }
    removePhoto.addEventListener('click', clearPhoto);

    async function loadPhotos(reset = false) {
        if (loadingPhotos) return;
        loadingPhotos = true;
        morePhotos.disabled = true;
        const offset = reset ? 0 : sharedOffset;
        try {
            const { data, error } = await client.from('recuerdos_publicos')
                .select('id, name, photo_path, created_at, photo_index')
                .order('created_at', { ascending: false }).order('id', { ascending: false })
                .order('photo_index', { ascending: true })
                .range(offset, offset + 6);
            if (error) throw error;
            if (reset) shared.replaceChildren();
            for (const item of data.slice(0, 6)) {
                if (!/^recuerdos\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(item.photo_path)) continue;
                const figure = document.createElement('figure');
                figure.className = 'gallery-item';
                const link = document.createElement('a');
                link.className = 'gallery-link';
                link.href = client.storage.from('recuerdos').getPublicUrl(item.photo_path).data.publicUrl;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.setAttribute('aria-label', `Ver foto compartida por ${item.name} (abre otra pestaña)`);
                const image = document.createElement('img');
                image.src = link.href;
                image.alt = `Recuerdo compartido por ${item.name}`;
                image.loading = 'lazy';
                const caption = document.createElement('figcaption');
                caption.textContent = `Compartida por ${item.name}`;
                link.append(image);
                figure.append(link, caption);
                shared.append(figure);
            }
            sharedOffset = offset + Math.min(data.length, 6);
            morePhotos.hidden = data.length <= 6;
            sharedStatus.textContent = shared.children.length ? 'Toca una foto para verla completa.' : '¿Tienes una foto con Feli? Compártela en las dedicatorias.';
        } catch {
            sharedStatus.textContent = 'No se pudieron cargar las fotos. Puedes volver a intentarlo.';
            morePhotos.hidden = false;
        } finally {
            sharedSection.hidden = shared.children.length === 0;
            loadingPhotos = false;
            morePhotos.disabled = false;
        }
    }
    morePhotos.addEventListener('click', () => { if (client) void loadPhotos(); });

    function renderMessage(message) {
        const card = document.createElement('div');
        card.className = 'message-card fade-in visible';
        const name = document.createElement('h4');
        const text = document.createElement('p');
        name.textContent = message.name;
        text.textContent = `“${message.text}”`;
        card.append(name, text);
        return card;
    }

    async function loadMessages() {
        const { data, error } = await client.from('dedicatorias')
            .select('id, name, text, created_at')
            .order('created_at', { ascending: false }).limit(100);
        if (error) throw error;
        list.replaceChildren(...data.map(renderMessage));
        if (!data.length) list.textContent = 'Sé la primera persona en dejar una dedicatoria.';
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!client || sending) return;
        const name = nameInput.value.trim();
        const text = textInput.value.trim();
        if (!name || !text) {
            status.textContent = 'Escribe tu nombre y un mensaje.';
            return;
        }
        const files = [...photoInput.files];
        try {
            if (files.length > 10) throw new Error('Puedes seleccionar hasta 10 fotos por dedicatoria.');
            files.forEach(validatePhoto);
        } catch (error) { photoStatus.textContent = error.message; return; }
        sending = true;
        photoInput.disabled = removePhoto.disabled = true;
        button.disabled = true;
        button.textContent = 'Enviando…';
        status.textContent = '';
        try {
            const photoPaths = [];
            for (const [index, file] of files.entries()) {
                button.textContent = `Subiendo foto ${index + 1} de ${files.length}…`;
                let photoPath = uploadedPhotos.get(file);
                if (photoPath) photoPaths.push(photoPath);
                else {
                    photoPath = `recuerdos/${crypto.randomUUID()}.${extensions[file.type]}`;
                    const { error } = await client.storage.from('recuerdos').upload(photoPath, file, { contentType: file.type, upsert: false });
                    if (error) throw new Error('No se pudo subir la foto. Revisa tu conexión e inténtalo nuevamente.');
                    uploadedPhotos.set(file, photoPath);
                    photoPaths.push(photoPath);
                }
            }
            button.textContent = 'Guardando dedicatoria…';
            const { error } = await client.from('dedicatorias').insert({ name, text, ...(photoPaths.length ? { photo_paths: photoPaths } : {}) });
            if (error) throw error;
            form.reset();
            clearPhoto();
            status.textContent = files.length ? '¡Gracias! Tu mensaje y tus fotos ya forman parte de los recuerdos de Feli.' : '¡Gracias por tu mensaje para Feli!';
            if (files.length) await loadPhotos(true);
            try {
                await loadMessages();
            } catch {
                status.textContent = 'Tu mensaje se guardó. Recarga la página para actualizar las dedicatorias.';
            }
        } catch {
            status.textContent = files.length ? 'No se pudo completar el envío. Conservamos tu mensaje y tus fotos para que vuelvas a intentarlo sin recargar la página.' : 'No se pudo guardar el mensaje. Inténtalo nuevamente.';
        } finally {
            sending = false;
            photoInput.disabled = removePhoto.disabled = false;
            button.disabled = false;
            button.textContent = 'Enviar Mensaje';
        }
    });

    async function initialize() {
        button.disabled = true;
        const config = window.SUPABASE_CONFIG;
        if (!config?.url || !config?.publicKey) {
            status.textContent = 'Las dedicatorias estarán disponibles pronto.';
            return;
        }
        try {
            client = window.supabase.createClient(config.url, config.publicKey, {
                auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
            });
            status.textContent = 'Cargando dedicatorias…';
            await loadMessages();
            await loadPhotos(true);
            status.textContent = '';
        } catch {
            status.textContent = 'No se pudieron cargar las dedicatorias. Recarga la página para intentar nuevamente.';
        } finally {
            button.disabled = !client;
        }
    }

    initialize();
})();

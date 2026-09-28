(() => {
    const form = document.getElementById('message-form');
    const button = form.querySelector('button[type="submit"]');
    const list = document.getElementById('messages-list');
    const status = document.getElementById('message-status');
    const nameInput = document.getElementById('guest-name');
    const textInput = document.getElementById('guest-message');
    nameInput.maxLength = 100;
    textInput.maxLength = 2000;
    let client;
    let sending = false;

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
        sending = true;
        button.disabled = true;
        button.textContent = 'Enviando…';
        status.textContent = '';
        try {
            const { error } = await client.from('dedicatorias').insert({ name, text });
            if (error) throw error;
            form.reset();
            status.textContent = '¡Gracias por tu mensaje para Feli!';
            try {
                await loadMessages();
            } catch {
                status.textContent = 'Tu mensaje se guardó. Recarga la página para actualizar las dedicatorias.';
            }
        } catch {
            status.textContent = 'No se pudo guardar el mensaje. Inténtalo nuevamente.';
        } finally {
            sending = false;
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
            status.textContent = '';
        } catch {
            status.textContent = 'No se pudieron cargar las dedicatorias. Recarga la página para intentar nuevamente.';
        } finally {
            button.disabled = !client;
        }
    }

    initialize();
})();

(() => {
    const audio = document.getElementById('bg-music');
    const button = document.getElementById('music-btn');
    if (!audio || !button) return;
    let autoStart = true;
    let playPending = false;
    let lastScrollAttempt = -Infinity;

    function updateButton() {
        const playing = !audio.paused && !audio.ended;
        button.classList.toggle('playing', playing);
        button.textContent = playing ? '⏸' : '🎵';
        button.setAttribute('aria-pressed', String(playing));
        button.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
        button.title = button.getAttribute('aria-label');
    }

    function stopAutoStart() {
        autoStart = false;
        document.removeEventListener('click', startOnInteraction);
        document.removeEventListener('keydown', startOnInteraction);
        document.removeEventListener('scroll', startOnScroll);
        document.removeEventListener('wheel', startOnScroll);
        document.removeEventListener('touchend', startOnInteraction);
    }

    async function play() {
        if (playPending) return;
        playPending = true;
        try {
            await audio.play();
        } catch {
            // Autoplay may be blocked; keep the manual play button available.
            updateButton();
        } finally {
            playPending = false;
        }
    }

    function startOnScroll() {
        if (!autoStart || playPending) return;
        const now = performance.now();
        if (now - lastScrollAttempt < 1500) return;
        lastScrollAttempt = now;
        void play();
    }

    function startOnInteraction(event) {
        if (!autoStart || button.contains(event.target)) return;
        if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
        void play();
    }

    audio.addEventListener('play', () => {
        stopAutoStart();
        updateButton();
    });
    audio.addEventListener('pause', updateButton);
    audio.addEventListener('ended', updateButton);
    audio.addEventListener('error', updateButton);
    button.addEventListener('click', () => {
        stopAutoStart();
        if (audio.paused) void play();
        else audio.pause();
    });
    document.addEventListener('click', startOnInteraction);
    document.addEventListener('keydown', startOnInteraction);
    document.addEventListener('scroll', startOnScroll, { passive: true });
    document.addEventListener('wheel', startOnScroll, { passive: true });
    document.addEventListener('touchend', startOnInteraction, { passive: true });
    updateButton();
    void play();
})();

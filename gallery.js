(() => {
    const links = [...document.querySelectorAll('.gallery-link')];
    const cards = links.map(link => link.closest('.gallery-item'));
    const pagination = document.querySelector('.gallery-pagination');
    const mobile = window.matchMedia('(max-width: 650px)');
    let visibleCount = 6;
    if (pagination) {
        const more = pagination.querySelector('.gallery-more');
        const progress = pagination.querySelector('.gallery-progress');
        function updatePagination() {
            cards.forEach((card, index) => { card.hidden = mobile.matches && index >= visibleCount; });
            pagination.hidden = !mobile.matches || cards.length <= 6;
            const shown = Math.min(visibleCount, cards.length);
            progress.textContent = `${shown} de ${cards.length} fotos`;
            more.hidden = shown === cards.length;
            more.textContent = `Ver más fotos (+${Math.min(6, cards.length - shown)})`;
        }
        more.addEventListener('click', () => {
            const firstNew = visibleCount;
            visibleCount = Math.min(visibleCount + 6, cards.length);
            updatePagination();
            links[firstNew]?.focus({ preventScroll: true });
        });
        mobile.addEventListener('change', updatePagination);
        updatePagination();
    }
    // Animate only on entry; photos stay visible if observers are unavailable.
    if ('IntersectionObserver' in window) {
        const reveal = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('gallery-revealed');
                reveal.unobserve(entry.target);
            });
        }, { threshold: 0.08 });
        [...cards, document.querySelector('.gallery-heading')].filter(Boolean).forEach(item => {
            item.addEventListener('animationend', () => item.classList.remove('gallery-revealed'), { once: true });
            reveal.observe(item);
        });
    }
    const viewer = document.getElementById('photo-viewer');
    if (!viewer || typeof viewer.showModal !== 'function') return;
    const image = viewer.querySelector('.viewer-image');
    const caption = viewer.querySelector('.viewer-caption');
    let current = 0;
    let opener;

    function show(index) {
        current = (index + links.length) % links.length;
        const thumbnail = links[current].querySelector('img');
        image.src = links[current].href;
        image.alt = thumbnail.alt;
        caption.textContent = `${current + 1} de ${links.length} · ${links[current].querySelector('.photo-title').textContent}`;
    }
    links.forEach((link, index) => {
        link.addEventListener('click', event => {
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            opener = link;
            show(index);
            viewer.showModal();
            document.body.classList.add('photo-open');
        });
    });
    viewer.querySelector('[data-close]').addEventListener('click', () => viewer.close());
    viewer.querySelector('[data-prev]').addEventListener('click', () => show(current - 1));
    viewer.querySelector('[data-next]').addEventListener('click', () => show(current + 1));
    viewer.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            show(current + (event.key === 'ArrowRight' ? 1 : -1));
        }
    });
    viewer.addEventListener('click', event => {
        const box = viewer.getBoundingClientRect();
        if (event.target === viewer && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) viewer.close();
    });
    viewer.addEventListener('close', () => {
        document.body.classList.remove('photo-open');
        image.removeAttribute('src');
        opener?.focus({ preventScroll: true });
    });
})();

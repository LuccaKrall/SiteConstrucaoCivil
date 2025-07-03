document.addEventListener('DOMContentLoaded', function() {
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // --- LÓGICA "VER MAIS" / "VER MENOS" PARA AS DESCRIÇÕES DOS CARDS (COM ACESSIBILIDADE) ---
    const listingCardsForDesc = document.querySelectorAll('.listing-card');
    
    listingCardsForDesc.forEach((card, index) => {
        const desc = card.querySelector('.details .description');
        if (!desc) return;

        const maxLines = 3;
        const lineHeight = 1.6; // line-height from CSS
        const maxHeight = (parseFloat(getComputedStyle(desc).fontSize) * lineHeight) * maxLines;

        if (desc.scrollHeight > maxHeight) {
            desc.classList.add('description-collapsed');
            
            const toggleButton = document.createElement('button');
            toggleButton.innerText = 'Ver mais';
            toggleButton.className = 'read-more-btn';

            const descId = desc.id || `desc-${index}`;
            desc.id = descId;
            toggleButton.setAttribute('aria-expanded', 'false');
            toggleButton.setAttribute('aria-controls', descId);
            
            desc.after(toggleButton);
            
            toggleButton.addEventListener('click', function() {
                const isCollapsed = desc.classList.contains('description-collapsed');
                
                if (isCollapsed) {
                    desc.style.maxHeight = desc.scrollHeight + 'px'; 
                    desc.classList.remove('description-collapsed');
                    this.innerText = 'Ver menos';
                    this.setAttribute('aria-expanded', 'true');
                } else {
                    desc.style.maxHeight = null; 
                    desc.classList.add('description-collapsed');
                    this.innerText = 'Ver mais';
                    this.setAttribute('aria-expanded', 'false');
                }
            });
        }
    });

    // --- LÓGICA DE FILTRAGEM E PESQUISA (COM ACESSIBILIDADE) ---
    const regionFilter = document.getElementById('region-filter-input');
    const searchInput = document.getElementById('search-filter-input');
    const listingCards = document.querySelectorAll('.listing-card');
    const filterStatus = document.getElementById('filter-status');

    function populateRegions() {
        const regions = new Set();
        listingCards.forEach(card => {
            if (card.dataset.region) {
                regions.add(card.dataset.region);
            }
        });

        const allRegionsOption = document.createElement('option');
        allRegionsOption.value = 'all';
        allRegionsOption.textContent = 'Todas as Regiões';
        regionFilter.appendChild(allRegionsOption);

        regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            regionFilter.appendChild(option);
        });
    }

    function applyFilters() {
        const selectedRegion = regionFilter.value;
        const searchTerm = searchInput.value.toLowerCase().trim();
        let visibleCount = 0;

        listingCards.forEach(card => {
            const cardRegion = card.dataset.region || '';
            const cardTitle = card.querySelector('h2').textContent.toLowerCase();

            const regionMatch = (selectedRegion === 'all' || cardRegion === selectedRegion);
            const searchMatch = cardTitle.includes(searchTerm);

            if (regionMatch && searchMatch) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });

        if (filterStatus) {
            filterStatus.textContent = `${visibleCount} terreno(s) encontrado(s).`;
        }
    }

    if (regionFilter && searchInput && listingCards.length > 0) {
        populateRegions();
        
        regionFilter.addEventListener('change', applyFilters);
        searchInput.addEventListener('input', applyFilters);
    }

    // --- LÓGICA PARA O MENU HAMBÚRGUER (COM ACESSIBILIDADE) ---
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    if (menuToggle && mainNav) {
        const navLinks = mainNav.querySelectorAll('a');

        menuToggle.addEventListener('click', function() {
            const isActive = mainNav.classList.toggle('active');
            this.classList.toggle('active');
            this.setAttribute('aria-expanded', isActive);
            this.setAttribute('aria-label', isActive ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    menuToggle.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    menuToggle.setAttribute('aria-label', 'Abrir menu de navegação');
                    menuToggle.focus();
                }
            });
        });
    }

    // --- LÓGICA UNIFICADA PARA TODOS OS CARROSSÉIS (COM ACESSIBILIDADE) ---
    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach(carousel => {
        const images = carousel.querySelectorAll('.carousel-images img');
        if (images.length <= 1) {
             const prevButton = carousel.querySelector('.carousel-button.prev');
             const nextButton = carousel.querySelector('.carousel-button.next');
             if(prevButton) prevButton.style.display = 'none';
             if(nextButton) nextButton.style.display = 'none';
             return; 
        }

        const prevButton = carousel.querySelector('.carousel-button.prev');
        const nextButton = carousel.querySelector('.carousel-button.next');
        let currentIndex = 0;
        let autoSlideInterval = null;

        function showImage(index) {
            images.forEach((img, i) => {
                img.classList.toggle('active', i === index);
                img.setAttribute('aria-hidden', i !== index);
            });
        }

        function next() {
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
        }

        function prev() {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            showImage(currentIndex);
        }

        function startAutoSlide() {
            stopAutoSlide();
            autoSlideInterval = setInterval(next, 3000);
        }

        function stopAutoSlide() {
            clearInterval(autoSlideInterval);
        }

        if (prevButton && nextButton) {
            prevButton.addEventListener('click', () => {
                prev();
                stopAutoSlide();
            });
            nextButton.addEventListener('click', () => {
                next();
                stopAutoSlide();
            });
        }

        if (carousel.classList.contains('mini-carousel')) {
            carousel.addEventListener('mouseenter', stopAutoSlide);
            carousel.addEventListener('focusin', stopAutoSlide);
            carousel.addEventListener('mouseleave', startAutoSlide);
            carousel.addEventListener('focusout', startAutoSlide);
            startAutoSlide();
        }
        
        showImage(currentIndex);
    });

    // --- LÓGICA PARA O BOTÃO "TENHO INTERESSE" (WHATSAPP) ---
    const interesseButtons = document.querySelectorAll('.cta-button');
    interesseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const nomeTerreno = this.dataset.nome;
            const numeroWhatsApp = '5514998001303';
            const mensagem = encodeURIComponent(`Olá! Tenho interesse no terreno: "${nomeTerreno}". Poderia me dar mais informações?`);
            const whatsappURL = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;
            window.open(whatsappURL, '_blank', 'noopener,noreferrer');
        });
    });
});
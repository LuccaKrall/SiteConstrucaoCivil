document.addEventListener('DOMContentLoaded', function() {
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // --- LÓGICA "VER MAIS" / "VER MENOS" PARA AS DESCRIÇÕES ---
    const listingCardsForDesc = document.querySelectorAll('.listing-card');
    listingCardsForDesc.forEach((card, index) => {
        const desc = card.querySelector('.details .description');
        if (!desc) return;
        const maxLines = 3;
        const lineHeight = 1.6;
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

    // --- LÓGICA DE FILTRAGEM UNIFICADA ---
    const searchInput = document.getElementById('unified-search-input');
    const regionFilterBtn = document.getElementById('region-filter-btn');
    const regionDropdown = document.getElementById('region-dropdown');
    const listingCards = document.querySelectorAll('.listing-card');
    const filterStatus = document.getElementById('filter-status');
    let currentRegion = 'all';

    function populateRegionDropdown() {
        const regions = new Set();
        listingCards.forEach(card => {
            if (card.dataset.region) {
                regions.add(card.dataset.region);
            }
        });

        regionDropdown.innerHTML = ''; // Limpa opções existentes

        const allRegionsBtn = document.createElement('button');
        allRegionsBtn.textContent = 'Todas as Regiões';
        allRegionsBtn.dataset.region = 'all';
        regionDropdown.appendChild(allRegionsBtn);

        regions.forEach(region => {
            const regionBtn = document.createElement('button');
            regionBtn.textContent = region;
            regionBtn.dataset.region = region;
            regionDropdown.appendChild(regionBtn);
        });
    }

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let visibleCount = 0;

        listingCards.forEach(card => {
            const cardRegion = card.dataset.region || '';
            const cardDescription = card.querySelector('.description').textContent.toLowerCase(); 

            const regionMatch = (currentRegion === 'all' || cardRegion === currentRegion);
            const searchMatch = cardDescription.includes(searchTerm);

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

    if (searchInput && regionFilterBtn && regionDropdown && listingCards.length > 0) {
        populateRegionDropdown();

        regionFilterBtn.addEventListener('click', () => {
            const isExpanded = regionFilterBtn.getAttribute('aria-expanded') === 'true';
            regionFilterBtn.setAttribute('aria-expanded', !isExpanded);
            regionDropdown.classList.toggle('show');
        });

        regionDropdown.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                currentRegion = e.target.dataset.region;
                applyFilters();
                regionDropdown.classList.remove('show');
                regionFilterBtn.setAttribute('aria-expanded', 'false');
            }
        });
        
        searchInput.addEventListener('input', applyFilters);

        window.addEventListener('click', (e) => {
            if (!regionFilterBtn.contains(e.target) && !regionDropdown.contains(e.target)) {
                if (regionDropdown.classList.contains('show')) {
                    regionDropdown.classList.remove('show');
                    regionFilterBtn.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }
    
    // --- LÓGICA PARA O MENU HAMBÚRGUER ---
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

    // --- LÓGICA UNIFICADA PARA TODOS OS CARROSSÉIS ---
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
        if (prevButton && nextButton) {
            prevButton.addEventListener('click', () => { prev(); });
            nextButton.addEventListener('click', () => { next(); });
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

    // --- CÓDIGO CORRIGIDO PARA ADICIONAR BOTÃO DE OCULTAR AO VLIBRAS ---
    function setupVlirasHider() {
        const vlibrasWidgetContainer = document.querySelector('div[vw]');
        const vlibrasAccessButton = document.querySelector('div[vw-access-button]');

        // Verifica se os elementos do VLibras já foram carregados na página
        if (vlibrasWidgetContainer && vlibrasAccessButton) {
            
            // 1. Cria o botão de ocultar
            const hideButton = document.createElement('button');
            hideButton.id = 'vlibras-hide-btn';
            hideButton.innerHTML = '&times;'; // Adiciona o caractere "X"
            hideButton.title = 'Ocultar atalho de acessibilidade';
            hideButton.setAttribute('aria-label', 'Ocultar atalho de acessibilidade');
            document.body.appendChild(hideButton);

            // 2. Função para posicionar o botão
            const positionButton = () => {
                // Pega a localização e tamanho do ícone VLibras
                const rect = vlibrasAccessButton.getBoundingClientRect();
                // Posiciona nosso botão "X" no canto superior direito do ícone
                hideButton.style.top = `${rect.top - 4}px`;
                hideButton.style.left = `${rect.left + rect.width - 20}px`;
            };
            
            positionButton(); // Posiciona o botão pela primeira vez

            // 3. Adiciona o evento de clique para ocultar tudo
            hideButton.addEventListener('click', () => {
                vlibrasWidgetContainer.style.display = 'none';
                hideButton.style.display = 'none';
            });
            
            // Reposiciona o botão caso a janela seja redimensionada
            window.addEventListener('resize', positionButton);

        } else {
            // Se o widget ainda não carregou, tenta novamente em meio segundo
            setTimeout(setupVlirasHider, 500);
        }
    }

    // Inicia a função para configurar o botão de ocultar
    setupVlirasHider();
    
}); // <-- FIM DO ÚNICO 'DOMContentLoaded'
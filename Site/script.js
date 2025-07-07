document.addEventListener('DOMContentLoaded', function() {
    // Restaurar a posição do scroll para o topo ao carregar a página
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // --- LÓGICA "VER MAIS" / "VER MENOS" PARA AS DESCRIÇÕES ---
    const listingCardsForDesc = document.querySelectorAll('.listing-card');
    listingCardsForDesc.forEach((card, index) => {
        const desc = card.querySelector('.details .description');
        if (!desc) return;

        if (desc.scrollHeight > parseFloat(getComputedStyle(desc).fontSize) * 1.6 * 3) {
            desc.classList.add('description-collapsed');
            
            const toggleButton = document.createElement('button');
            toggleButton.innerText = 'Ver mais';
            toggleButton.className = 'read-more-btn';
            const descId = `desc-${index}`;
            desc.id = descId;
            toggleButton.setAttribute('aria-expanded', 'false');
            toggleButton.setAttribute('aria-controls', descId);
            desc.after(toggleButton);
            
            toggleButton.addEventListener('click', function() {
                const isCollapsed = desc.classList.contains('description-collapsed');
                
                if (isCollapsed) {
                    desc.classList.remove('description-collapsed');
                    desc.style.maxHeight = desc.scrollHeight + 'px';
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
    const logoLink = document.getElementById('logo-link');
    let currentRegion = 'all';

    const originalPlaceholder = "Pesquise por descrição ou filtre por região";
    const shortPlaceholder = "Pesquisar ou filtrar por região";

    function adjustPlaceholder() {
        if (window.innerWidth <= 500) {
            searchInput.placeholder = shortPlaceholder;
        } else {
            searchInput.placeholder = originalPlaceholder;
        }
    }
    
    function populateRegionDropdown() {
        const regions = new Set();
        listingCards.forEach(card => {
            if (card.dataset.region) {
                regions.add(card.dataset.region);
            }
        });

        regionDropdown.innerHTML = '';

        const allRegionsBtn = document.createElement('button');
        allRegionsBtn.textContent = 'Todas as Regiões';
        allRegionsBtn.dataset.region = 'all';
        allRegionsBtn.classList.add('active-region');
        regionDropdown.appendChild(allRegionsBtn);

        regions.forEach(region => {
            const regionBtn = document.createElement('button');
            regionBtn.textContent = region;
            regionBtn.dataset.region = region.toLowerCase();
            regionDropdown.appendChild(regionBtn);
        });
    }

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let visibleCount = 0;

        listingCards.forEach(card => {
            const cardRegion = card.dataset.region ? card.dataset.region.toLowerCase() : '';
            const regionMatch = (currentRegion === 'all' || cardRegion === currentRegion);

            const cardDescription = card.querySelector('.description').textContent.toLowerCase();
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

    function resetFiltersAndSearch(event) {
        if(event) event.preventDefault();
        searchInput.value = '';
        currentRegion = 'all';
        applyFilters();
        
        regionDropdown.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('active-region');
        });
        const allRegionsBtn = regionDropdown.querySelector('button[data-region="all"]');
        if (allRegionsBtn) {
            allRegionsBtn.classList.add('active-region');
        }

        if (regionDropdown.classList.contains('show')) {
            regionDropdown.classList.remove('show');
            regionFilterBtn.setAttribute('aria-expanded', 'false');
        }
    }

    if (searchInput && regionFilterBtn && regionDropdown && listingCards.length > 0) {
        populateRegionDropdown();
        adjustPlaceholder();
        window.addEventListener('resize', adjustPlaceholder);

        regionFilterBtn.addEventListener('click', () => {
            const isExpanded = regionFilterBtn.getAttribute('aria-expanded') === 'true';
            regionFilterBtn.setAttribute('aria-expanded', !isExpanded);
            regionDropdown.classList.toggle('show');
        });
        
        regionDropdown.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                regionDropdown.querySelectorAll('button').forEach(btn => {
                    btn.classList.remove('active-region');
                });
                e.target.classList.add('active-region');

                currentRegion = e.target.dataset.region; 
                applyFilters();
                regionDropdown.classList.remove('show');
                regionFilterBtn.setAttribute('aria-expanded', 'false');
            }
        });
        
        searchInput.addEventListener('input', applyFilters);

        if(logoLink) {
            logoLink.addEventListener('click', resetFiltersAndSearch);
        }

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
        const header = document.querySelector('header');
        const navLinks = mainNav.querySelectorAll('a');

        const setNavTop = () => {
            const headerHeight = header.offsetHeight;
            mainNav.style.top = `${headerHeight}px`;
            mainNav.style.height = `calc(100vh - ${headerHeight}px)`;
        };

        menuToggle.addEventListener('click', function() {
            setNavTop();
            const isActive = mainNav.classList.toggle('active');
            this.classList.toggle('active');
            this.setAttribute('aria-expanded', isActive);
            document.body.style.overflow = isActive ? 'hidden' : '';
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    menuToggle.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
            });
        });
    }

    // --- LÓGICA UNIFICADA PARA TODOS OS CARROSSÉIS ---
    document.querySelectorAll('.carousel').forEach(carousel => {
        const images = carousel.querySelectorAll('.carousel-images img');
        const prevButton = carousel.querySelector('.carousel-button.prev');
        const nextButton = carousel.querySelector('.carousel-button.next');
        let currentIndex = 0;

        if (images.length <= 1) {
             if(prevButton) prevButton.style.display = 'none';
             if(nextButton) nextButton.style.display = 'none';
             return; 
        }

        function showImage(index) {
            images.forEach((img, i) => {
                img.classList.toggle('active', i === index);
                img.setAttribute('aria-hidden', i !== index);
            });
        }
        
        prevButton.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            showImage(currentIndex);
        });

        nextButton.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
        });
        
        showImage(currentIndex);
    });
    
    // --- FUNÇÃO CENTRALIZADA PARA ABRIR WHATSAPP (VERSÃO ATUALIZADA) ---
    function openWhatsAppSimulation(nomeTerreno) {
        const urlParams = new URLSearchParams(window.location.search);
        const numeroDoVendedor = urlParams.get('vendedor');
        const numeroPadrao = '5514997456960';
        const numeroWhatsApp = numeroDoVendedor || numeroPadrao;
        const mensagem = encodeURIComponent(`Olá! Gostaria de fazer uma simulação para o terreno: "${nomeTerreno}". Poderia me dar mais informações?`);
        const whatsappURL = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;
        window.open(whatsappURL, '_blank', 'noopener,noreferrer');
    }

    // --- LÓGICA PARA O BOTÃO "Faça Simulação" (WHATSAPP) NOS CARDS ---
    document.querySelectorAll('.cta-button').forEach(button => {
        button.addEventListener('click', function() {
            const nomeTerreno = this.dataset.nome;
            openWhatsAppSimulation(nomeTerreno);
        });
    });

    // ==============================================================
    // ===  LÓGICA ATUALIZADA PARA O MODAL "SABER MAIS" ===
    // ==============================================================
    const modal = document.getElementById('saber-mais-modal');
    if (modal) {
        const modalTitle = document.getElementById('modal-title');
        const modalCtaButton = document.getElementById('modal-cta-button');
        const closeModalBtn = document.getElementById('modal-close-btn');

        document.querySelectorAll('.details-button').forEach(button => {
            button.addEventListener('click', function() {
                const nomeTerreno = this.dataset.nome;
                
                modalTitle.textContent = nomeTerreno;
                
                // As linhas que adicionavam a imagem foram removidas.
                // A nova estrutura HTML será exibida automaticamente.
                
                modalCtaButton.dataset.nome = nomeTerreno;

                modal.removeAttribute('hidden');
                modal.classList.add('show');
                document.body.style.overflow = 'hidden';
            });
        });

        function closeModal() {
            modal.classList.remove('show');
            document.body.style.overflow = '';
            setTimeout(() => {
                modal.setAttribute('hidden', 'true');
            }, 300);
        }

        closeModalBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
        window.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                closeModal();
            }
        });

        // Ação do botão de simulação DENTRO do modal
        modalCtaButton.addEventListener('click', function() {
            const nomeTerreno = this.dataset.nome;
            openWhatsAppSimulation(nomeTerreno);
        });
    }

    // --- CÓDIGO PARA ADICIONAR BOTÃO DE OCULTAR AO VLIBRAS ---
    function setupVlirasHider() {
        const vlibrasWidgetContainer = document.querySelector('div[vw]');
        const vlibrasAccessButton = document.querySelector('div[vw-access-button]');

        if (!vlibrasWidgetContainer || !vlibrasAccessButton) {
            setTimeout(setupVlirasHider, 500);
            return;
        }
        
        if (document.getElementById('vlibras-hide-btn')) return;

        const hideButton = document.createElement('button');
        hideButton.id = 'vlibras-hide-btn';
        hideButton.innerHTML = '&times;';
        hideButton.title = 'Ocultar atalho de acessibilidade';
        hideButton.setAttribute('aria-label', 'Ocultar atalho de acessibilidade');
        document.body.appendChild(hideButton);

        const positionButton = () => {
            const rect = vlibrasAccessButton.getBoundingClientRect();
            hideButton.style.top = `${rect.top - 6}px`;
            hideButton.style.left = `${rect.left + rect.width - 18}px`;
        };
        
        positionButton();

        hideButton.addEventListener('click', (e) => {
            e.stopPropagation();
            vlibrasWidgetContainer.style.display = 'none';
            hideButton.style.display = 'none';
        });
        
        const observer = new MutationObserver(positionButton);
        observer.observe(vlibrasAccessButton, { attributes: true, attributeFilter: ['style'] });

        window.addEventListener('resize', positionButton);
        window.addEventListener('scroll', positionButton);
    }
    
    setupVlirasHider();
});
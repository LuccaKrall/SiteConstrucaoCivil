document.addEventListener('DOMContentLoaded', function() {
    
    // --- LÓGICA "VER MAIS" / "VER MENOS" PARA AS DESCRIÇÕES DOS CARDS ---
    const descriptions = document.querySelectorAll('.listing-card .details .description');
    
    descriptions.forEach(desc => {
        const maxLines = 3;
        const lineHeight = parseFloat(getComputedStyle(desc).lineHeight);
        const maxHeight = lineHeight * maxLines;

        if (desc.scrollHeight > maxHeight) {
            desc.classList.add('description-collapsed');
            
            const toggleButton = document.createElement('button');
            toggleButton.innerText = 'Ver mais';
            toggleButton.className = 'read-more-btn';
            
            desc.after(toggleButton);
            
            toggleButton.addEventListener('click', function() {
                const isCollapsed = desc.classList.contains('description-collapsed');
                
                if (isCollapsed) {
                    desc.style.maxHeight = desc.scrollHeight + 'px'; 
                    desc.classList.remove('description-collapsed');
                    this.innerText = 'Ver menos';
                } else {
                    desc.style.maxHeight = null; 
                    desc.classList.add('description-collapsed');
                    this.innerText = 'Ver mais';
                }
            });
        }
    });

    // --- LÓGICA DE FILTRAGEM E PESQUISA DE TERRENOS ---
    const regionFilter = document.getElementById('region-filter');
    const searchInput = document.getElementById('search-input');
    const showAllBtn = document.getElementById('show-all-btn');
    const listingCards = document.querySelectorAll('.listing-card');

    // 1. Função para povoar o filtro de regiões dinamicamente
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

    // 2. Função unificada para filtrar e pesquisar
    function applyFilters() {
        const selectedRegion = regionFilter.value;
        const searchTerm = searchInput.value.toLowerCase().trim();

        listingCards.forEach(card => {
            const cardRegion = card.dataset.region || '';
            const cardTitle = card.querySelector('h2').textContent.toLowerCase();

            // Condições de visibilidade
            const regionMatch = (selectedRegion === 'all' || cardRegion === selectedRegion);
            const searchMatch = cardTitle.includes(searchTerm);

            // O card só será visível se corresponder a AMBAS as condições
            if (regionMatch && searchMatch) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    }

    // 3. Adicionar "ouvintes" de eventos e executar a configuração inicial
    if (regionFilter && searchInput && showAllBtn && listingCards.length > 0) {
        populateRegions(); // Povoa as regiões ao carregar a página
        
        regionFilter.addEventListener('change', applyFilters);
        searchInput.addEventListener('input', applyFilters);

        showAllBtn.addEventListener('click', () => {
            regionFilter.value = 'all'; // Reseta o seletor
            searchInput.value = '';     // Limpa o campo de pesquisa
            applyFilters();             // Aplica os filtros limpos, mostrando todos
        });
    }

    // --- LÓGICA PARA O MENU HAMBÚRGUER ---
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    if (menuToggle && mainNav) {
        const navLinks = mainNav.querySelectorAll('a');
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            this.classList.toggle('active');
        });
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    menuToggle.classList.remove('active');
                }
            });
        });
    }

    // --- LÓGICA PARA O CARROSSEL DE IMAGENS ---
    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach(carousel => {
        const imagesContainer = carousel.querySelector('.carousel-images');
        const images = imagesContainer.querySelectorAll('img');
        if (images.length <= 1) return; // Não inicializa o carrossel se tiver 1 ou 0 imagens

        const prevButton = carousel.querySelector('.carousel-button.prev');
        const nextButton = carousel.querySelector('.carousel-button.next');
        let currentIndex = 0;

        function showImage(index) {
            images.forEach((img, i) => {
                img.classList.toggle('active', i === index);
            });
        }

        if (prevButton && nextButton) {
            prevButton.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + images.length) % images.length;
                showImage(currentIndex);
            });
            nextButton.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % images.length;
                showImage(currentIndex);
            });
            showImage(currentIndex); // Mostra a primeira imagem
        }
    });

    // --- LÓGICA PARA O BOTÃO "TENHO INTERESSE" (WHATSAPP) ---
    const interesseButtons = document.querySelectorAll('.cta-button');
    interesseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const nomeTerreno = this.dataset.nome;
            const numeroWhatsApp = '5514998001303';
            const mensagem = encodeURIComponent(`Olá! Tenho interesse no terreno: "${nomeTerreno}". Poderia me dar mais informações?`);
            const whatsappURL = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;
            window.open(whatsappURL, '_blank');
        });
    });
});
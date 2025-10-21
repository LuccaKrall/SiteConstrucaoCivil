document.addEventListener('DOMContentLoaded', function() {
    // =================================================================
// === FUNÇÃO PARA CALCULAR VALORES DAS CASAS AUTOMATICAMENTE ===
// =================================================================
function calcularValoresCasas() {
    const listingCards = document.querySelectorAll('.listing-card');
    
    listingCards.forEach(card => {
        // Encontrar a descrição extra dentro do card
        const descricaoExtra = card.querySelector('.descricao-extra');
        if (!descricaoExtra) return;
        
        // Encontrar o valor de venda na descrição extra
        const valorVendaText = descricaoExtra.querySelector('p:nth-child(3)')?.textContent || ''; // Terceiro parágrafo é "Valor Venda"
        const valorVendaMatch = valorVendaText.match(/R\$\s*([\d.,]+)/);
        
        if (valorVendaMatch) {
            const valorVenda = parseFloat(valorVendaMatch[1].replace('.', '').replace(',', '.'));
            
            if (!isNaN(valorVenda)) {
                // Calcular novos valores conforme as fórmulas
                const casa1Quarto = valorVenda + (2400 * 23);
                const casa2Quartos = valorVenda + (2400 * 38);
                
                // Formatando para moeda brasileira
                const formatarMoeda = (valor) => {
                    return 'R$ ' + valor.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                };
                
                const casa1Formatado = formatarMoeda(casa1Quarto);
                const casa2Formatado = formatarMoeda(casa2Quartos);
                
                // Atualizar os valores na descrição extra
                const casa1Element = descricaoExtra.querySelector('p:nth-child(5)'); // Quinto parágrafo é "Casa 1 Quarto"
                const casa2Element = descricaoExtra.querySelector('p:nth-child(6)'); // Sexto parágrafo é "Casa 2 Quartos"
                
                if (casa1Element) {
                    casa1Element.innerHTML = `<strong>Casa 1 Quarto:</strong> ${casa1Formatado}`;
                }
                if (casa2Element) {
                    casa2Element.innerHTML = `<strong>Casa 2 Quartos:</strong> ${casa2Formatado}`;
                }
                
                // Atualizar os valores na seção info (visível)
                const infoSection = card.querySelector('.info');
                if (infoSection) {
                    const infoSpans = infoSection.querySelectorAll('span');
                    infoSpans.forEach(span => {
                        if (span.textContent.includes('Casa 1 Quarto:')) {
                            span.innerHTML = `<i class="fa-solid fa-bed" aria-hidden="true"></i> Casa 1 Quarto: <strong>${casa1Formatado}</strong>`;
                        }
                        if (span.textContent.includes('Casa 2 Quartos:')) {
                            span.innerHTML = `<i class="fa-solid fa-bed" aria-hidden="true"></i> Casa 2 Quartos: <strong>${casa2Formatado}</strong>`;
                        }
                    });
                }
            }
        }
    });
}
    
    
    
    
    
    
    // Restaurar a posição do scroll para o topo ao carregar a página
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

// Adicione esta lista no início do arquivo, após o DOMContentLoaded
const vendedoresAutorizados = [
    '5514998001303', //Lucca Krall
    '5514996097357', //Roberto
    '5514998110015', //Ana
    '5514997313826', //Gabriel
    '5514998133326', //Miliane
    '5514997456960', //Vanessa
    '554891832051'//Luiza

    // Adicione outros números autorizados aqui
];





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
        if (searchInput && window.innerWidth <= 500) {
            searchInput.placeholder = shortPlaceholder;
        } else if (searchInput) {
            searchInput.placeholder = originalPlaceholder;
        }
    }
    
    function populateRegionDropdown() {
        if (!regionDropdown) return;
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
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        let visibleCount = 0;

        listingCards.forEach(card => {
            const cardRegion = card.dataset.region ? card.dataset.region.toLowerCase() : '';
            const regionMatch = (currentRegion === 'all' || cardRegion === currentRegion);
            const cardDescription = card.querySelector('.description')?.textContent.toLowerCase() || '';
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
        if (searchInput) searchInput.value = '';
        currentRegion = 'all';
        applyFilters();
        
        if (regionDropdown) {
            regionDropdown.querySelectorAll('button').forEach(btn => {
                btn.classList.remove('active-region');
            });
            const allRegionsBtn = regionDropdown.querySelector('button[data-region="all"]');
            if (allRegionsBtn) {
                allRegionsBtn.classList.add('active-region');
            }

            if (regionDropdown.classList.contains('show')) {
                regionDropdown.classList.remove('show');
                if (regionFilterBtn) regionFilterBtn.setAttribute('aria-expanded', 'false');
            }
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
            if (regionFilterBtn && !regionFilterBtn.contains(e.target) && !regionDropdown.contains(e.target)) {
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

    // --- LÓGICA UNIFICADA PARA TODOS OS CARROSSEIS ---
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
        
        prevButton?.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            showImage(currentIndex);
        });

        nextButton?.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
        });
        
        showImage(currentIndex);
    });
    
    // --- FUNÇÃO CENTRALIZADA PARA ABRIR WHATSAPP ---
function openWhatsAppSimulation(nomeTerreno) {
    const urlParams = new URLSearchParams(window.location.search);
    const numeroDoVendedor = urlParams.get('vendedor');
    const numeroPadrao = '5514997456960';
    
    // Verificar se o número está na lista de autorizados
    const numeroWhatsApp = (numeroDoVendedor && vendedoresAutorizados.includes(numeroDoVendedor)) 
        ? numeroDoVendedor 
        : numeroPadrao;
        
    const mensagem = encodeURIComponent(`Olá! Gostaria de fazer uma simulação para o terreno: "${nomeTerreno}". Poderia me dar mais informações?`);
    const whatsappURL = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;
    window.open(whatsappURL, '_blank', 'noopener,noreferrer');
}

    // --- LÓGICA PARA O BOTÃO "Faça Simulação" (WHATSAPP) NOS CARDS ---
    document.querySelectorAll('.card-actions .cta-button').forEach(button => {
        button.addEventListener('click', function() {
            const nomeTerreno = this.dataset.nome;
            openWhatsAppSimulation(nomeTerreno);
        });
    });

    // ==============================================================
    // ===  LÓGICA DO MODAL "SABER MAIS" (VERSÃO COMPLETA RESTAURADA) ===
    // ==============================================================
    const saberMaisModal = document.getElementById('saber-mais-modal');
    if (saberMaisModal) {
        const modalTitle = document.getElementById('modal-title');
        const modalCtaButton = document.getElementById('modal-cta-button');
        const closeModalBtn = document.getElementById('modal-close-btn');
        const infoBoxes = saberMaisModal.querySelectorAll('.modal-info-container .info-box');

        document.querySelectorAll('.details-button').forEach(button => {
            button.addEventListener('click', function() {
                const nomeTerreno = this.dataset.nome;
                
                modalTitle.textContent = "Três Passos para realizar o Sonho Da Casa Própria";
                
                infoBoxes[0].querySelector('p').innerHTML = `Parabéns! Você selecionou o <strong>"${nomeTerreno}"</strong>. Agora é só seguir os próximos passos para realizar seu sonho.`;
                
                modalCtaButton.dataset.nome = nomeTerreno;

                // Reseta o estado do modal ao abrir
                infoBoxes.forEach(box => box.classList.remove('clicked'));
                modalCtaButton.classList.remove('pulse-animation');
                document.documentElement.style.setProperty('--line-fill-percentage', '0%');

                saberMaisModal.removeAttribute('hidden');
                saberMaisModal.classList.add('show');
                document.body.style.overflow = 'hidden';
            });
        });

        infoBoxes.forEach((box, index) => {
            box.addEventListener('click', () => {
                box.classList.add('clicked');

                let fillPercentage = 0;
                if (index === 1) fillPercentage = 50;
                else if (index === 2) fillPercentage = 100;

                document.documentElement.style.setProperty('--line-fill-percentage', `${fillPercentage}%`);

                if (index === 2) {
                    modalCtaButton.classList.add('pulse-animation');
                } else {
                    modalCtaButton.classList.remove('pulse-animation');
                }
            });
        });

        function closeModal() {
            saberMaisModal.classList.remove('show');
            document.body.style.overflow = '';
            setTimeout(() => {
                saberMaisModal.setAttribute('hidden', 'true');
            }, 300);
        }

        closeModalBtn.addEventListener('click', closeModal);
        saberMaisModal.addEventListener('click', function(e) {
            if (e.target === saberMaisModal) {
                closeModal();
            }
        });
        window.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && saberMaisModal.classList.contains('show')) {
                closeModal();
            }
        });

        // Ação do botão de simulação DENTRO do modal "Saber Mais"
        modalCtaButton.addEventListener('click', function() {
            const nomeTerreno = this.dataset.nome;
            openWhatsAppSimulation(nomeTerreno);
        });
    }
    
    // ========================================================================
    // === LÓGICA PARA O MODAL DO MAPA (COM CORREÇÃO DE CORS) ===============
    // ========================================================================
    const mapModal = document.getElementById('map-modal');
    const mapModalContainer = document.getElementById('map-modal-container');
    const mapModalTitle = document.getElementById('map-modal-title');
    const closeMapBtn = document.getElementById('map-modal-close-btn');
    let mapInstance = null;

    const closeMapModal = () => {
        if (!mapModal) return;
        mapModal.classList.remove('show');
        document.body.style.overflow = '';
        setTimeout(() => {
            mapModal.setAttribute('hidden', 'true');
            if (mapInstance) {
                mapInstance.remove();
                mapInstance = null;
            }
            if (mapModalContainer) mapModalContainer.innerHTML = '';
        }, 300);
    };

    if (mapModal && mapModalContainer && mapModalTitle && closeMapBtn) {
        document.querySelectorAll('.open-map-btn').forEach(button => {
            button.addEventListener('click', () => {
                const card = button.closest('.listing-card');
                if (!card) return;

                const address = card.dataset.address;
                const title = card.querySelector('h2').textContent;

                if (!address) {
                    alert('Endereço não disponível para este terreno.');
                    return;
                }

                mapModalTitle.textContent = title;
                mapModalContainer.innerHTML = '<p style="text-align:center; padding-top: 45vh; font-size: 1.2rem; color: #666;">Buscando localização...</p>';
                mapModal.removeAttribute('hidden');
                mapModal.classList.add('show');
                document.body.style.overflow = 'hidden';
                
                const userEmail = "luccasiniciati@gmail.com"; 
                const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&email=${userEmail}`;

                setTimeout(() => {
                    fetch(apiUrl)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`Erro de rede: ${response.statusText} (Status: ${response.status})`);
                            }
                            return response.json();
                        })
                        .then(data => {
                            if (data && data.length > 0) {
                                const lat = data[0].lat;
                                const lon = data[0].lon;
                                const location = [lat, lon];
                                
                                mapModalContainer.innerHTML = '';

                                mapInstance = L.map('map-modal-container', {
                                    scrollWheelZoom: true
                                }).setView(location, 16);

                                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                }).addTo(mapInstance);

                                L.marker(location).addTo(mapInstance)
                                    .bindPopup(title)
                                    .openPopup();
                            } else {
                                mapModalContainer.innerHTML = '<p style="text-align:center; padding-top: 45vh; font-size: 1.2rem; color: #d9534f;">Endereço não encontrado no mapa.</p>';
                            }
                        })
                        .catch(error => {
                            console.error('Falha na requisição fetch:', error);
                            mapModalContainer.innerHTML = '<p style="text-align:center; padding-top: 45vh; font-size: 1.2rem; color: #d9534f;">Erro ao carregar o mapa. Verifique o console para detalhes.</p>';
                        });
                }, 150);
            });
        });

        closeMapBtn.addEventListener('click', closeMapModal);
        mapModal.addEventListener('click', e => e.target === mapModal && closeMapModal());
        window.addEventListener('keydown', e => e.key === 'Escape' && mapModal.classList.contains('show') && closeMapModal());
    }

    // --- CÓDIGO PARA ADICIONAR BOTÃO DE OCULTAR AO VLIBRAS ---
    function setupVlirasHider() {
        const vlibrasWidgetContainer = document.querySelector('div[vw]');
        const vlibrasAccessButton = document.querySelector('div[vw-access-button]');
        if (!vlibrasWidgetContainer || !vlibrasAccessButton) { setTimeout(setupVlirasHider, 500); return; }
        if (document.getElementById('vlibras-hide-btn')) return;
        const hideButton = document.createElement('button');
        hideButton.id = 'vlibras-hide-btn';
        hideButton.innerHTML = '&times;';
        hideButton.title = 'Ocultar atalho de acessibilidade';
        hideButton.setAttribute('aria-label', 'Ocultar atalho de acessibilidade');
        document.body.appendChild(hideButton);
        const positionButton = () => { if (!vlibrasAccessButton.getBoundingClientRect) return; const rect = vlibrasAccessButton.getBoundingClientRect(); hideButton.style.top = `${rect.top - 6}px`; hideButton.style.left = `${rect.left + rect.width - 18}px`; };
        positionButton();
        hideButton.addEventListener('click', (e) => { e.stopPropagation(); vlibrasWidgetContainer.style.display = 'none'; hideButton.style.display = 'none'; });
        new MutationObserver(positionButton).observe(vlibrasAccessButton, { attributes: true, attributeFilter: ['style'] });
        window.addEventListener('resize', positionButton);
        window.addEventListener('scroll', positionButton);
    }
    setupVlirasHider();


    // ==============================================================
    // ===  NOVO: LÓGICA PARA ANIMAR ELEMENTOS AO ROLAR A PÁGINA   ====
    // ==============================================================
    const animatedElements = document.querySelectorAll('.listing-card');

    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                // Se o elemento está intersectando (visível na tela)
                if (entry.isIntersecting) {
                    // Adiciona as classes de animação
                    entry.target.classList.add('animate__animated', 'animate__fadeInUp');
                    // Para de observar o elemento para a animação não repetir
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1 // A animação começa quando 10% do elemento estiver visível
        });

        // Inicia a observação para cada card
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }


    // ==============================================================
    // ===  NOVO: LÓGICA PARA O BOTÃO FLUTUANTE DO WHATSAPP      ====
    // ==============================================================
    const floatingContainer = document.getElementById('floating-whatsapp-container');
    const floatingBtn = document.getElementById('floating-whatsapp-btn');
    const closeFloatingBtn = document.getElementById('close-floating-btn');

    if (floatingContainer && floatingBtn && closeFloatingBtn) {
        // Ação para o botão flutuante principal
        floatingBtn.addEventListener('click', function() {
            // Reutiliza a função já existente, mas com uma mensagem genérica
            const numeroPadrao = '5514997456960';
            const mensagem = encodeURIComponent('Olá! Visitei o site e gostaria de mais informações sobre os terrenos.');
            const whatsappURL = `https://wa.me/${numeroPadrao}?text=${mensagem}`;
            window.open(whatsappURL, '_blank', 'noopener,noreferrer');
        });

        // Ação para o botão de fechar
        closeFloatingBtn.addEventListener('click', function(event) {
            event.stopPropagation(); // Impede que o clique no 'x' acione o botão principal
            floatingContainer.classList.add('hidden');
        });
    }
// =================================================================
    // === NOVO: LÓGICA PARA ATIVAR DESCRIÇÃO EXTRA VIA URL (?desc)  ===
    // =================================================================
    
    // Função para pedir a senha e mostrar as descrições
    function ativarModoAdmin() {
        // =================================================
        // ===   TROQUE 'SENHA123' PELA SUA SENHA REAL   ====
        // =================================================
        const senhaCorreta = 'SENHA123'; 

        const senhaDigitada = prompt('Por favor, digite a senha de administrador:');

        if (senhaDigitada === senhaCorreta) {
            const descricoesExtras = document.querySelectorAll('.descricao-extra');
            let reveladas = 0;
            descricoesExtras.forEach(function(descricao) {
                descricao.style.display = 'block';
                reveladas++;
            });
            
            if (reveladas > 0) {
                alert('Senha correta! ' + reveladas + ' descrições extras foram reveladas.');
            } else {
                alert('Senha correta, mas nenhuma descrição extra foi encontrada para exibir.');
            }
        } else if (senhaDigitada !== null) {
            alert('Senha incorreta. Acesso negado.');
        }
    }

    // Verifica se a URL contém o parâmetro '?desc' assim que a página carrega
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('desc')) {
        ativarModoAdmin();
    }
     calcularValoresCasas();
});
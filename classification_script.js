// Classification par Culture - Script principal
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    loadSpeciesData();
});

// Variables globales
let currentTab = 'maraicheres';
let allSpecies = {};
let searchIndex = [];

// Initialisation de la page
function initializePage() {
    // Animation d'entrée
    animatePageLoad();
    
    // Initialiser les onglets
    showTab('maraicheres');
    
    // Créer l'index de recherche
    createSearchIndex();
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Onglets
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            showTab(tabId);
            updateActiveTab(this);
        });
    });

    // Recherche
    const searchInput = document.getElementById('cultureSearch');
    const searchBtn = document.getElementById('searchBtn');
    
    searchInput.addEventListener('input', debounce(performSearch, 300));
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    searchBtn.addEventListener('click', performSearch);

    // Modal
    setupModal();// Affichage d'un onglet
function showTab(tabId) {
    console.log('Switching to tab:', tabId);
    currentTab = tabId;
    
    // Cacher tous les contenus
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
    });
    
    // Afficher le contenu sélectionné
    const activeContent = document.getElementById(tabId);
    if (activeContent) {
        activeContent.style.display = 'block';
        activeContent.classList.add('active');
        console.log('Tab content shown:', tabId);
    } else {
        console.error('Tab content not found:', tabId);
    }
}tabId;
    }
}

function updateActiveTab(activeButton) {
    // Retirer la classe active de tous les boutons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Ajouter la classe active au bouton cliqué
    activeButton.classList.add('active');
}

// Chargement des données d'espèces
function loadSpeciesData() {
    // Charger les données pour chaque catégorie
    loadCategoryData('cruciferes', speciesData.cruciferes);
    loadCategoryData('solanacees', speciesData.solanacees);
    loadCategoryData('cucurbitacees', speciesData.cucurbitacees);
    loadCategoryData('legumineuses', speciesData.legumineuses);
    loadCategoryData('betterave', speciesData.betterave);
    
    loadCategoryData('rosacees-noyaux', speciesData.rosacees_noyaux);
    loadCategoryData('rosacees-pepins', speciesData.rosacees_pepins);
    loadCategoryData('agrumes', speciesData.agrumes);
    loadCategoryData('vigne', speciesData.vigne);
    loadCategoryData('fruits-rouges', speciesData.fruits_rouges);
    
    loadCategoryData('olivier', speciesData.olivier);
    loadCategoryData('ornementaux', speciesData.ornementaux);
    loadCategoryData('palmiers', speciesData.palmiers);
    
    loadCategoryData('cereales', speciesData.cereales);
    loadCategoryData('cotonnier', speciesData.cotonnier);
    loadCategoryData('luzerne', speciesData.luzerne);
    
    // Charger les auxiliaires
    if (typeof beneficialInsects !== 'undefined') {
        loadCategoryData('auxiliaires', beneficialInsects);
    }

    // Stocker toutes les espèces pour la recherche
    allSpecies = { ...speciesData };
}

// Chargement des données d'une catégorie
function loadCategoryData(gridId, data) {
    const grid = document.getElementById(`${gridId}-grid`);
    console.log(`Loading grid: ${gridId}-grid`, grid ? 'Found' : 'Not Found', 'Data length:', data ? data.length : 0);
    
    if (!grid || !data) return;

    grid.innerHTML = '';
    data.forEach(specie => {
        const card = createSpeciesCard(specie);
        grid.appendChild(card);
    });
}
// Création des cartes d'espèces
function createSpeciesCard(specie) {
    const card = document.createElement('div');
    card.className = 'species-card';
    card.setAttribute('data-species', specie.name.toLowerCase().replace(/\s+/g, '-'));
    
    card.innerHTML = `
        <div class="species-header">
            <div class="species-icon">${specie.icon}</div>
            <div class="species-name">
                <span class="scientific-name">${specie.name}</span>
                <span class="author">${specie.author}</span>
            </div>
        </div>
        <div class="species-order">${specie.order} - ${specie.family}</div>
        <div class="species-cultures">
            <strong>Cultures :</strong> ${specie.cultures}
        </div>
    `;

    // Ajouter l'événement de clic pour ouvrir la modal
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
        console.log('Click on card:', specie.name);
        openSpeciesModal(specie);
    });
    
    // Animation d'apparition
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        card.style.transition = 'all 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, Math.random() * 300);

    return card;
}

// Gestion de la modal
function setupModal() {
    const modal = document.getElementById('speciesModal');
    const closeBtn = modal.querySelector('.close');
    
    closeBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function openSpeciesModal(specie) {
    const modal = document.getElementById('speciesModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const modalImage = document.getElementById('modalImage');
    const modalClassification = document.getElementById('modalClassification');
    const modalCultures = document.getElementById('modalCultures');
    const modalDescription = document.getElementById('modalDescription');
    
    // Remplir les données
    modalTitle.innerHTML = `<strong>${specie.name}</strong> <small>${specie.author}</small>`;
    modalSubtitle.textContent = `${specie.order} - ${specie.family}`;
    modalImage.src = specie.image;
    modalImage.alt = specie.name;
    modalClassification.textContent = `Ordre: ${specie.order}, Famille: ${specie.family}`;
    modalCultures.textContent = specie.cultures;
    modalDescription.textContent = specie.description;

    // Ajouter les nouvelles sections (IPM et Auxiliaires)
    const modalInfo = modal.querySelector('.modal-info');
    
    // Nettoyer les anciennes sections dynamiques
    const dynamicSections = modalInfo.querySelectorAll('.dynamic-section');
    dynamicSections.forEach(s => s.remove());

    if (specie.management) {
        const mgmtSection = document.createElement('div');
        mgmtSection.className = 'info-section dynamic-section';
        mgmtSection.innerHTML = `<h3>🛡️ Conseils de Lutte (IPM)</h3><p>${specie.management}</p>`;
        modalInfo.appendChild(mgmtSection);
    }

    if (specie.beneficials) {
        const benSection = document.createElement('div');
        benSection.className = 'info-section dynamic-section';
        benSection.innerHTML = `<h3>🐞 Auxiliaires Naturels</h3><p>${specie.beneficials}</p>`;
        modalInfo.appendChild(benSection);
    }
    
    // Afficher la modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Animation d'ouverture
    setTimeout(() => {
        modal.querySelector('.modal-content').style.transform = 'scale(1)';
        modal.querySelector('.modal-content').style.opacity = '1';
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('speciesModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Système de recherche
function createSearchIndex() {
    searchIndex = [];
    
    // Indexer toutes les espèces
    Object.keys(allSpecies).forEach(category => {
        if (Array.isArray(allSpecies[category])) {
            allSpecies[category].forEach(specie => {
                searchIndex.push({
                    ...specie,
                    category: category,
                    searchText: `${specie.name} ${specie.author} ${specie.order} ${specie.family} ${specie.cultures} ${specie.description}`.toLowerCase()
                });
            });
        }
    });
    
    // Ajouter les espèces polyphages
    polyphageSpecies.forEach(specie => {
        searchIndex.push({
            ...specie,
            category: 'polyphages',
            searchText: `${specie.name} ${specie.author} ${specie.order} ${specie.family} ${specie.cultures} ${specie.description}`.toLowerCase()
        });
    });
}

function performSearch() {
    const searchTerm = document.getElementById('cultureSearch').value.toLowerCase().trim();
    
    if (searchTerm === '') {
        clearSearchResults();
        return;
    }
    
    const results = searchIndex.filter(specie => 
        specie.searchText.includes(searchTerm)
    );
    
    displaySearchResults(results, searchTerm);
}

function displaySearchResults(results, searchTerm) {
    // Masquer tous les groupes de cultures
    const cultureGroups = document.querySelectorAll('.culture-group');
    cultureGroups.forEach(group => {
        group.style.display = 'none';
    });
    
    // Créer une section de résultats de recherche
    let searchResultsSection = document.getElementById('search-results');
    if (!searchResultsSection) {
        searchResultsSection = document.createElement('div');
        searchResultsSection.id = 'search-results';
        searchResultsSection.className = 'culture-group';
        
        const activeTabContent = document.querySelector('.tab-content.active');
        if (activeTabContent) {
            activeTabContent.querySelector('.culture-category').appendChild(searchResultsSection);
        }
    }
    
    searchResultsSection.innerHTML = `
        <h3 class="culture-title">
            <i class="fas fa-search"></i>
            Résultats de recherche pour "${searchTerm}" (${results.length} résultat${results.length > 1 ? 's' : ''})
        </h3>
        <div class="species-grid" id="search-results-grid"></div>
    `;
    
    const searchGrid = document.getElementById('search-results-grid');
    
    if (results.length === 0) {
        searchGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #c0c0c0;">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>Aucun résultat trouvé pour "${searchTerm}"</p>
                <p>Essayez avec d'autres mots-clés comme le nom d'une culture, d'un ordre ou d'une famille.</p>
            </div>
        `;
    } else {
        results.forEach(specie => {
            const card = createSpeciesCard(specie);
            // Surligner les termes de recherche
            highlightSearchTerms(card, searchTerm);
            searchGrid.appendChild(card);
        });
    }
    
    searchResultsSection.style.display = 'block';
}

function highlightSearchTerms(card, searchTerm) {
    const textElements = card.querySelectorAll('.species-name, .species-order, .species-cultures');
    
    textElements.forEach(element => {
        const text = element.innerHTML;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        element.innerHTML = text.replace(regex, '<span class="highlight">$1</span>');
    });
}

function clearSearchResults() {
    // Afficher tous les groupes de cultures
    const cultureGroups = document.querySelectorAll('.culture-group');
    cultureGroups.forEach(group => {
        if (group.id !== 'search-results') {
            group.style.display = 'block';
        }
    });
    
    // Masquer les résultats de recherche
    const searchResults = document.getElementById('search-results');
    if (searchResults) {
        searchResults.style.display = 'none';
    }
}

// Animations
function animatePageLoad() {
    // Animation du titre
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        heroTitle.style.opacity = '0';
        heroTitle.style.transform = 'translateY(-30px)';
        
        setTimeout(() => {
            heroTitle.style.transition = 'all 1s ease';
            heroTitle.style.opacity = '1';
            heroTitle.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Animation des onglets
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach((btn, index) => {
        btn.style.opacity = '0';
        btn.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            btn.style.transition = 'all 0.5s ease';
            btn.style.opacity = '1';
            btn.style.transform = 'translateY(0)';
        }, 200 + (index * 100));
    });
}

// Utilitaires
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Gestion du scroll fluide
function smoothScrollTo(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Fonctions d'export pour les tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createSpeciesCard,
        performSearch,
        showTab,
        openSpeciesModal,
        closeModal
    };
}


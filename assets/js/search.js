// Global Search Functionality
class GlobalSearch {
    constructor() {
        this.searchInput = document.getElementById('globalSearch');
        this.resultsContainer = document.getElementById('searchResults');
        this.services = this.loadServices();
        this.init();
    }

    init() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 250));
            this.searchInput.addEventListener('focus', this.showDefaultResults.bind(this));
            // close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.resultsContainer) return;
                const isInside = e.target === this.searchInput || this.resultsContainer.contains(e.target) || this.searchInput.contains(e.target);
                if (!isInside) this.hideDropdown();
            });
        }
    }

    loadServices() {
        return [
            {
                title: 'Find Donors',
                description: 'Search for blood donors by location and blood type',
                url: 'pages/donors.html',
                icon: 'fas fa-users',
                category: 'donor',
                keywords: ['find donor', 'search donor', 'blood donor', 'locate donor']
            },
            {
                title: 'Emergency Request',
                description: 'Request blood urgently for emergency situations',
                url: 'pages/emergency.html',
                icon: 'fas fa-ambulance',
                category: 'emergency',
                keywords: ['emergency', 'urgent', 'critical', 'blood request']
            },
            {
                title: 'Blood Testing',
                description: 'Schedule blood tests and health screenings',
                url: 'pages/services.html#blood-test',
                icon: 'fas fa-vial',
                category: 'service',
                keywords: ['test', 'screening', 'blood test', 'health check']
            },
            {
                title: 'Donation Camp',
                description: 'Find and join blood donation camps',
                url: 'pages/campaigns.html',
                icon: 'fas fa-hand-holding-heart',
                category: 'campaign',
                keywords: ['camp', 'donation', 'drive', 'campaign']
            },
            {
                title: 'Hospital Locator',
                description: 'Find nearest blood banks and hospitals',
                url: 'pages/hospitals.html',
                icon: 'fas fa-hospital',
                category: 'hospital',
                keywords: ['hospital', 'clinic', 'blood bank', 'location']
            },
            {
                title: 'Inventory Check',
                description: 'Check blood stock availability',
                url: 'blood-inventory.html',
                icon: 'fas fa-boxes',
                category: 'inventory',
                keywords: ['stock', 'inventory', 'availability', 'blood stock']











                
            },
            {
                title: 'Register as Donor',
                description: 'Become a blood donor in 5 minutes',
                url: 'register.html',
                icon: 'fas fa-user-plus',
                category: 'registration',
                keywords: ['register', 'signup', 'become donor', 'join']
            },
            {
                title: 'Health Blog',
                description: 'Read articles about blood donation and health',
                url: 'pages/blog.html',
                icon: 'fas fa-blog',
                category: 'blog',
                keywords: ['blog', 'article', 'news', 'health']
            }
        ];
    }

    handleSearch(event) {
        const query = event.target.value.toLowerCase().trim();
        
        if (query.length < 2) {
            this.showDefaultResults();
            return;
        }

        const results = this.searchServices(query);
        this.displayResults(results);
    }

    searchServices(query) {
        return this.services.filter(service => {
            return service.keywords.some(keyword => keyword.includes(query)) ||
                   service.title.toLowerCase().includes(query) ||
                   service.description.toLowerCase().includes(query);
        });
    }

    showDefaultResults() {
        const defaultResults = [
            this.services[0], // Find Donors
            this.services[1], // Emergency Request
            this.services[6], // Register as Donor
            this.services[4], // Hospital Locator
        ];
        
        this.displayResults(defaultResults, 'Quick Actions');
    }

    displayResults(results, category = 'Search Results') {
        if (!this.resultsContainer) return;

        let html = `
            <li><h6 class="dropdown-header">${category}</h6></li>
        `;

        if (results.length === 0) {
            html += `
                <li><a class="dropdown-item disabled" href="#">
                    <i class="fas fa-search me-2"></i>No results found
                </a></li>
            `;
        } else {
            results.forEach(service => {
                html += `
                    <li>
                        <a class="dropdown-item" href="${service.url}">
                            <div class="d-flex align-items-center">
                                <div class="search-result-icon me-3">
                                    <i class="${service.icon}"></i>
                                </div>
                                <div>
                                    <div class="fw-bold">${service.title}</div>
                                    <small class="text-muted">${service.description}</small>
                                </div>
                            </div>
                        </a>
                    </li>
                `;
            });
        }

        // Add quick categories
        html += `
            <li><hr class="dropdown-divider"></li>
            <li><h6 class="dropdown-header">Browse Categories</h6></li>
            <li>
                <a class="dropdown-item" href="pages/services.html">
                    <i class="fas fa-hand-holding-medical me-2"></i>All Services
                </a>
            </li>
            <li>
                <a class="dropdown-item" href="pages/donors.html">
                    <i class="fas fa-users me-2"></i>Donor Directory
                </a>
            </li>
            <li>
                <a class="dropdown-item" href="pages/hospitals.html">
                    <i class="fas fa-hospital me-2"></i>Hospital Network
                </a>
            </li>
        `;

        this.resultsContainer.innerHTML = html;

        // Ensure the results are positioned below the input and visible.
        // Move the container to body to avoid overflow:hidden parents.
        if (this.resultsContainer.parentElement !== document.body) {
            document.body.appendChild(this.resultsContainer);
        }

        this.positionDropdown();
        this.showDropdown();

        // Close on ESC
        const escHandler = (e) => { if (e.key === 'Escape') this.hideDropdown(); };
        document.addEventListener('keydown', escHandler, { once: true });

        // Reposition when scrolling/resizing
        window.addEventListener('scroll', this.positionDropdownBound || (this.positionDropdownBound = this.positionDropdown.bind(this)));
        window.addEventListener('resize', this.positionDropdownBound);
    }

    showDropdown(){
        if(!this.resultsContainer) return;
        this.resultsContainer.classList.add('show');
        this.resultsContainer.style.display = 'block';
        if(this.searchInput) this.searchInput.setAttribute('aria-expanded','true');
    }

    hideDropdown(){
        if(!this.resultsContainer) return;
        this.resultsContainer.classList.remove('show');
        this.resultsContainer.style.display = 'none';
        if(this.searchInput) this.searchInput.setAttribute('aria-expanded','false');
    }

    debounce(fn, wait){
        let timeout;
        return function(...args){
            clearTimeout(timeout);
            timeout = setTimeout(()=> fn.apply(this, args), wait);
        };
    }

    positionDropdown(){
        if(!this.resultsContainer || !this.searchInput) return;
        const rect = this.searchInput.getBoundingClientRect();
        const scrollY = window.scrollY || window.pageYOffset;
        const scrollX = window.scrollX || window.pageXOffset;

        // match width and place right under the input
        this.resultsContainer.style.position = 'absolute';
        this.resultsContainer.style.minWidth = rect.width + 'px';
        this.resultsContainer.style.left = (rect.left + scrollX) + 'px';
        this.resultsContainer.style.top = (rect.bottom + scrollY) + 'px';
        this.resultsContainer.style.zIndex = 2000;
    }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const search = new GlobalSearch();
    
    // Add search to mobile menu if exists
    const mobileSearch = document.getElementById('mobileSearch');
    if (mobileSearch) {
        mobileSearch.addEventListener('input', (e) => {
            const query = e.target.value;
            // Implement mobile search functionality
            console.log('Mobile search:', query);
        });
    }
});

// Service filtering
class ServiceFilter {
    constructor() {
        this.filterButtons = document.querySelectorAll('.service-filter-btn');
        this.serviceCards = document.querySelectorAll('.service-category-card');
        this.init();
    }

    init() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterServices(filter);
                this.updateActiveButton(e.target);
            });
        });
    }

    filterServices(filter) {
        this.serviceCards.forEach(card => {
            if (filter === 'all' || card.dataset.category === filter) {
                card.style.display = 'block';
                card.classList.add('animate__animated', 'animate__fadeIn');
            } else {
                card.style.display = 'none';
            }
        });
    }

    updateActiveButton(activeButton) {
        this.filterButtons.forEach(button => {
            button.classList.remove('active');
        });
        activeButton.classList.add('active');
    }
}

// Initialize service filter if on services page
if (window.location.pathname.includes('services.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        new ServiceFilter();
    });
}
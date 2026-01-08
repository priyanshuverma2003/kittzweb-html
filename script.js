document.addEventListener('DOMContentLoaded', () => {
    // Scroll Reveal Animation
    const reveals = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 150;

        reveals.forEach((reveal) => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger once on load

    // Gallery Search Functionality (Enhanced)
    const searchInput = document.getElementById('search-input');
    const searchDropdown = document.getElementById('search-results-dropdown');
    const clearSearchBtn = document.getElementById('clear-search');
    let selectedIndex = -1;

    // Initial hardcoded data as fallback
    let artworkData = [
        { title: 'Moonlit Dreams', desc: 'Gouache on Canvas', link: 'moonlit-dreams.html', imgSrc: 'art1.png' },
        { title: 'Silent Gaze', desc: 'Charcoal Sketch', link: 'silent-gaze.html', imgSrc: 'Screenshot 2026-01-06 031341.png' },
        { title: 'Ethereal', desc: 'Mixed Media', link: 'ethereal.html', imgSrc: 'WhatsApp Image 2024-02-06 at 16.23.25_75bbb31d.jpg' },
        { title: 'Cosmic Dream', desc: 'Oil on Canvas', link: 'cosmic-dream.html', imgSrc: 'Screenshot 2026-01-06 031606.png' },
        { title: 'Moon Boy', desc: 'Original Print', link: 'moon-boy.html', imgSrc: 'Screenshot 2026-01-06 030828.png' },
        { title: 'Golden Forest', desc: 'Oil on Canvas', link: 'golden-forest.html', imgSrc: 'Screenshot 2026-01-06 032057.png' }
    ];

    // Fetch artwork data from backend
    const fetchArtworks = async () => {
        try {
            const response = await fetch('/api/products');
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    // Map database fields to frontend expected format
                    artworkData = data.map(art => ({
                        ...art,
                        desc: art.medium,
                        link: `${art.id}.html`,
                        imgSrc: art.image
                    }));
                }
            }
        } catch (error) {
            console.warn('Backend unavailable, using local fallback data:', error);
        }
    };

    // Call fetch on load
    fetchArtworks();

    const suggestions = ['Charcoal', 'Gouache', 'Canvas', 'Portrait', 'Dream', 'Moon'];

    const getRecentSearches = () => JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const saveRecentSearch = (item) => {
        let recent = getRecentSearches();
        recent = [item, ...recent.filter(r => r.title !== item.title)].slice(0, 5);
        localStorage.setItem('recentSearches', JSON.stringify(recent));
    };

    const highlightText = (text, query) => {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    };

    const removeRecentSearch = (title) => {
        let recent = getRecentSearches();
        recent = recent.filter(r => r.title !== title);
        localStorage.setItem('recentSearches', JSON.stringify(recent));
        showSuggestions();
    };

    const clearAllRecent = () => {
        localStorage.removeItem('recentSearches');
        showSuggestions();
    };

    const showSuggestions = () => {
        const recent = getRecentSearches();
        let html = '';

        if (recent.length > 0) {
            html += `
                <div class="suggestions-header">
                    <div class="suggestions-title">Recent Searches</div>
                    <button class="clear-all-recent" onclick="event.stopPropagation();">Clear All</button>
                </div>
                <div class="recent-list">`;
            recent.forEach(item => {
                html += `
                    <div class="search-result-item recent-search-item" data-link="${item.link}">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <i class="fas fa-history" style="font-size: 0.8rem; color: #777;"></i>
                            <span>${item.title}</span>
                        </div>
                        <button class="remove-recent" data-title="${item.title}" onclick="event.stopPropagation();">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>`;
            });
            html += `</div>`;
        }

        html += '<div class="suggestions-title">Quick Search</div><div class="suggestions-grid"></div>';
        searchDropdown.innerHTML = html;
        const grid = searchDropdown.querySelector('.suggestions-grid');
        suggestions.forEach(text => {
            const tag = document.createElement('span');
            tag.className = 'suggestion-tag';
            tag.textContent = text;
            tag.onclick = () => {
                const query = text.toLowerCase();
                const matches = artworkData.filter(art =>
                    art.title.toLowerCase().includes(query) ||
                    art.desc.toLowerCase().includes(query)
                );

                if (matches.length === 1) {
                    saveRecentSearch(matches[0]);
                    window.location.href = matches[0].link;
                } else {
                    searchInput.value = text;
                    performSearch(text);
                }
            };
            grid.appendChild(tag);
        });

        // Add listeners to recent items
        searchDropdown.querySelectorAll('.recent-search-item').forEach(item => {
            item.onclick = () => window.location.href = item.getAttribute('data-link');
        });

        // Add listeners to delete buttons
        searchDropdown.querySelectorAll('.remove-recent').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                removeRecentSearch(btn.getAttribute('data-title'));
            };
        });

        // Add listener to clear all
        const clearBtn = searchDropdown.querySelector('.clear-all-recent');
        if (clearBtn) {
            clearBtn.onclick = (e) => {
                e.stopPropagation();
                clearAllRecent();
            };
        }

        searchDropdown.classList.add('active');
        selectedIndex = -1;
    };

    const performSearch = (query) => {
        query = query.toLowerCase().trim();
        if (clearSearchBtn) clearSearchBtn.style.display = query ? 'block' : 'none';

        if (query === '') {
            showSuggestions();
            return;
        }

        const matches = artworkData.filter(art =>
            art.title.toLowerCase().includes(query) ||
            art.desc.toLowerCase().includes(query)
        );

        searchDropdown.innerHTML = '';
        if (matches.length > 0) {
            const header = document.createElement('div');
            header.className = 'results-header';
            header.innerHTML = `<span>${matches.length} results found</span>`;
            searchDropdown.appendChild(header);

            matches.forEach((match, index) => {
                const resultItem = document.createElement('a');
                resultItem.href = match.link;
                resultItem.className = 'search-result-item';
                resultItem.dataset.index = index;
                resultItem.innerHTML = `
                    <img src="${match.imgSrc}" alt="${match.title}">
                    <div class="search-result-info">
                        <span>${highlightText(match.title, query)}</span>
                        <small>${highlightText(match.desc, query)}</small>
                    </div>
                `;
                resultItem.addEventListener('click', () => saveRecentSearch(match));
                searchDropdown.appendChild(resultItem);
            });
            searchDropdown.classList.add('active');
        } else {
            searchDropdown.innerHTML = `
                <div class="no-results-message">
                    <i class="fas fa-search"></i>
                    No artworks found for "${query}"
                </div>`;
            searchDropdown.classList.add('active');
        }
        selectedIndex = -1;
    };

    if (searchInput && searchDropdown) {
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim() === '') showSuggestions();
        });

        searchInput.addEventListener('input', (e) => performSearch(e.target.value));

        searchInput.addEventListener('keydown', (e) => {
            const items = searchDropdown.querySelectorAll('.search-result-item');
            if (items.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = (selectedIndex + 1) % items.length;
                updateSelection(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                updateSelection(items);
            } else if (e.key === 'Enter') {
                if (selectedIndex > -1) {
                    e.preventDefault();
                    items[selectedIndex].click();
                    window.location.href = items[selectedIndex].href;
                }
            }
        });

        const updateSelection = (items) => {
            items.forEach((item, i) => {
                item.classList.toggle('selected', i === selectedIndex);
                if (i === selectedIndex) item.scrollIntoView({ block: 'nearest' });
            });
        };

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                searchInput.value = '';
                performSearch('');
                searchInput.focus();
            });
        }

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target) && !clearSearchBtn?.contains(e.target)) {
                searchDropdown.classList.remove('active');
            }
        });
    }

    // Lightbox Functionality
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        const lightboxImg = lightbox.querySelector('img');
        const closeBtn = document.getElementById('lightbox-close');
        const galleryImages = document.querySelectorAll('.gallery-item img');

        galleryImages.forEach(item => {
            item.addEventListener('click', () => {
                const src = item.getAttribute('src');
                lightboxImg.setAttribute('src', src);
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto'; // Re-enable scrolling
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', closeLightbox);
        }

        // Close on background click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }
    // Instagram Popup Toggle & Dynamic Injection
    const instagramWidgetHtml = `
    <div id="instagram-widget">
        <div id="instagram-popup" class="glass">
            <div class="popup-header">
                <i class="fab fa-instagram"></i>
                <span>Follow Kirti</span>
                <button id="close-instagram">&times;</button>
            </div>
            <div class="popup-body">
                <p>Stay updated with my latest art and sketches on Instagram!</p>
                <a href="https://www.instagram.com/kirti4arts" target="_blank" class="instagram-btn">
                    <i class="fab fa-instagram"></i> Follow on Instagram
                </a>
            </div>
        </div>
        <button id="instagram-fab" title="Follow on Instagram">
            <i class="fab fa-instagram"></i>
        </button>
    </div>`;

    if (!document.getElementById('instagram-widget')) {
        document.body.insertAdjacentHTML('beforeend', instagramWidgetHtml);
    }

    const instagramFab = document.getElementById('instagram-fab');
    const instagramPopup = document.getElementById('instagram-popup');
    const closeInstagram = document.getElementById('close-instagram');

    if (instagramFab && instagramPopup) {
        instagramFab.addEventListener('click', () => {
            instagramPopup.classList.toggle('active');
        });

        if (closeInstagram) {
            closeInstagram.addEventListener('click', () => {
                instagramPopup.classList.remove('active');
            });
        }

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!instagramFab.contains(e.target) && !instagramPopup.contains(e.target)) {
                instagramPopup.classList.remove('active');
            }
        });
    }

    // Contact Form to WhatsApp Redirection
    const contactForm = document.getElementById('contact-form-main');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('form-name').value;
            const email = document.getElementById('form-email').value;
            const phone = document.getElementById('form-phone').value;
            const message = document.getElementById('form-message').value;

            const whatsappMessage = `Hi Kirti! I have a new inquiry from your website:%0A%0A` +
                `*Name:* ${name}%0A` +
                `*Email:* ${email}%0A` +
                `*Phone:* ${phone}%0A` +
                `*Message:* ${message}`;

            const whatsappUrl = `https://wa.me/918810426680?text=${whatsappMessage}`;

            window.open(whatsappUrl, '_blank');
        });
    }

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    // Create overlay if it doesn't exist
    let menuOverlay = document.querySelector('.menu-overlay');
    if (!menuOverlay) {
        menuOverlay = document.createElement('div');
        menuOverlay.className = 'menu-overlay';
        document.body.appendChild(menuOverlay);
    }

    const toggleMenu = (force = null) => {
        const isActive = force !== null ? force : !navLinks.classList.contains('active');

        navLinks.classList.toggle('active', isActive);
        menuOverlay.classList.toggle('active', isActive);
        mobileMenuBtn.classList.toggle('active', isActive);

        mobileMenuBtn.innerHTML = isActive ?
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';

        // Accessibility
        mobileMenuBtn.setAttribute('aria-expanded', isActive);
        navLinks.setAttribute('aria-hidden', !isActive);

        // Prevent body scroll
        document.body.style.overflow = isActive ? 'hidden' : 'auto';
    };

    // Detect current page and highlight active link
    const highlightActivePage = () => {
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;

        navLinks.querySelectorAll('a').forEach(link => {
            link.classList.remove('active');

            // Check if link matches current page or hash
            const linkHref = link.getAttribute('href');
            if (linkHref === currentHash ||
                (linkHref.startsWith('#') && currentHash === linkHref) ||
                (currentPath.includes('profile.html') && linkHref === '#hero') ||
                (currentPath.includes('me.html') && linkHref.includes('me.html'))) {
                link.classList.add('active');
            }
        });
    };

    if (mobileMenuBtn && navLinks) {
        // Initial accessibility state
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.setAttribute('aria-label', 'Toggle navigation menu');
        navLinks.setAttribute('aria-hidden', 'true');

        // Highlight active page on load
        highlightActivePage();

        // Update active link on hash change
        window.addEventListener('hashchange', highlightActivePage);

        mobileMenuBtn.addEventListener('click', () => toggleMenu());

        // Close menu when clicking overlay
        menuOverlay.addEventListener('click', () => toggleMenu(false));

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => toggleMenu(false));
        });

        // Close menu when clicking outside (fallback)
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target) && navLinks.classList.contains('active')) {
                toggleMenu(false);
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                toggleMenu(false);
            }
        });
    }
});

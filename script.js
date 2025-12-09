// ===== DOM Elements =====
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const galleryGrid = document.getElementById('galleryGrid');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrev = document.querySelector('.lightbox-prev');
const lightboxNext = document.querySelector('.lightbox-next');

// ===== Gallery State =====
let galleryImages = [];
let currentImageIndex = 0;

// ===== Gallery Slider State =====
let currentSlide = 0;
const ITEMS_PER_PAGE = 6;
let totalSlides = 0;

// ===== Initialize =====
// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    loadContent();
    loadPeopleImages();
    loadGalleryFromJSON();
    checkAndShowPopup();
    loadHeroBackground();
    document.getElementById('currentYear').textContent = new Date().getFullYear();
});

// ===== Load Content from API =====
async function loadContent() {
    try {
        const response = await fetch('/api/content');
        if (!response.ok) return;

        const data = await response.json();

        // Header
        setText('headerTitle', data['헤더 제목']);

        // Main
        setText('mainTitle', data['메인 제목']);

        // Split main content into subtitle and tagline if newline exists
        const mainContent = data['메인 내용'] || '';
        const mainParts = mainContent.split('\n');
        setText('mainContent', mainParts[0]);
        if (mainParts.length > 1) {
            setText('mainTagline', mainParts.slice(1).join('\n'));
        }

        // About
        setText('aboutTitle', data['소개 제목']);
        setText('aboutContent', data['소개 내용']);

        // Contact
        setText('contactTitle', data['연락처 제목']);
        setText('contactEmail', data['연락처 이메일']);
        setText('contactPhone', data['연락처 전화']);
        setText('contactLocation', data['연락처 위치']);

        // Apply Links
        applyContactLinks(data);

        // Gallery
        setText('galleryTitle', data['갤러리 제목']);

        // Footer
        setText('footerText', data['푸터 내용']);

    } catch (error) {
        console.log('콘텐츠 로드 실패:', error);
    }
}

function setText(id, text) {
    const element = document.getElementById(id);
    if (element && text) {
        element.textContent = text; // innerText uses style-aware formatting, textContent is raw
        // Handle newlines for specific elements if needed
        if (id === 'aboutContent' || id === 'mainTagline') {
            element.innerHTML = text.replace(/\n/g, '<br>');
        }
    }
}

function applyContactLinks(data) {
    const email = data['연락처 이메일'];
    const phone = data['연락처 전화'];
    const location = data['연락처 위치'];

    // Email Link
    const emailElem = document.getElementById('contactEmail');
    if (emailElem && email) {
        const item = emailElem.closest('.contact-item');
        if (item) {
            item.onclick = () => {
                window.location.href = `mailto:${email}`;
            };
        }
    }

    // Phone Link
    const phoneElem = document.getElementById('contactPhone');
    if (phoneElem && phone) {
        const item = phoneElem.closest('.contact-item');
        if (item) {
            item.onclick = () => {
                window.location.href = `tel:${phone}`;
            };
        }
    }

    // Location Link (Kakao Map)
    const locationElem = document.getElementById('contactLocation');
    if (locationElem && location) {
        const item = locationElem.closest('.contact-item');
        if (item) {
            item.onclick = () => {
                const mapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(location)}`;
                window.open(mapUrl, '_blank');
            };
        }
    }
}

// ===== Load People Images =====
async function loadPeopleImages() {
    try {
        const response = await fetch('/api/people');
        if (!response.ok) return;

        const images = await response.json();
        const container = document.getElementById('aboutImageContainer');

        if (container && images.length > 0) {
            // Use the first image for profile
            const img = images[0];
            container.innerHTML = `<img src="${img.path}" alt="${img.filename}">`;
        } else if (container) {
            // Keep default if no images found? Or clear?
            // Since we removed default in HTML, we should show nothing or placeholder.
            // If nothing, maybe placeholder?
            // HTML modification removed the img tag. 
            // If no image, maybe show placeholder
            container.innerHTML = `<img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop" alt="기본 프로필">`;
        }
    } catch (error) {
        console.log('인물 이미지 로드 실패:', error);
    }
}

// ===== Popup Functions =====
async function checkAndShowPopup() {
    // 일주일동안 열지 않기 체크 확인
    const dontShowUntil = localStorage.getItem('popupDontShowUntil');
    if (dontShowUntil && new Date().getTime() < parseInt(dontShowUntil)) {
        return; // 아직 기간이 안 지남
    }

    try {
        const response = await fetch('/api/popup');
        if (!response.ok) return;

        const popups = await response.json();
        if (popups.length === 0) return; // 팝업 이미지 없음

        // 팝업 이미지 표시
        const container = document.getElementById('popupImageContainer');
        container.innerHTML = popups.map(p =>
            `<img src="${p.path}" alt="${p.filename}">`
        ).join('');

        // 팝업 모달 표시
        document.getElementById('popupModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.log('팝업 로드 실패:', error);
    }
}

function closePopup() {
    const dontShow = document.getElementById('popupDontShow').checked;

    if (dontShow) {
        // 일주일(7일) 후 시간 저장
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem('popupDontShowUntil', new Date().getTime() + oneWeek);
    }

    document.getElementById('popupModal').classList.remove('active');
    document.body.style.overflow = '';
}

// 팝업 닫기 이벤트
document.getElementById('popupClose').addEventListener('click', closePopup);
document.getElementById('popupCloseBtn').addEventListener('click', closePopup);
document.getElementById('popupModal').addEventListener('click', (e) => {
    if (e.target.id === 'popupModal') closePopup();
});

// ===== Hero Background =====
async function loadHeroBackground() {
    try {
        const response = await fetch('/api/background');
        if (!response.ok) return;

        const data = await response.json();
        if (data.path) {
            const hero = document.querySelector('.hero');
            hero.style.background = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${data.path}') center/cover no-repeat`;
        }
    } catch (error) {
        console.log('배경 로드 실패:', error);
    }
}

// ===== Load Gallery from API =====
async function loadGalleryFromJSON() {
    try {
        const response = await fetch('/api/images');
        if (!response.ok) throw new Error('API not available');

        const data = await response.json();

        // data.json의 이미지가 이미 최신순으로 정렬되어 있음
        galleryImages = data.map(img => img.path);

        renderGallery(data);
    } catch (error) {
        console.log('data.json 로드 실패, 기본 이미지 사용:', error);
        // Fallback to default images if data.json doesn't exist
        galleryImages = [
            'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=800&fit=crop',
            'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=800&fit=crop'
        ];
        renderGalleryFallback();
    }
}

// ===== Render Gallery from data.json =====
function renderGallery(data) {
    if (data.length === 0) {
        galleryGrid.innerHTML = '<p class="gallery-empty">아직 등록된 사진이 없습니다.</p>';
        return;
    }

    // Group items into pages of 6
    const pages = [];
    for (let i = 0; i < data.length; i += ITEMS_PER_PAGE) {
        pages.push(data.slice(i, i + ITEMS_PER_PAGE));
    }

    galleryGrid.innerHTML = pages.map((page, pageIndex) => `
        <div class="gallery-page">
            ${page.map((img, index) => `
                <div class="gallery-item fade-in" data-index="${pageIndex * ITEMS_PER_PAGE + index}">
                    <img src="${img.path}" alt="${img.filename}" loading="lazy">
                    <div class="gallery-overlay">
                        <span class="gallery-icon">🔍</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `).join('');

    attachGalleryEvents();
    initGallerySlider(data.length);
    observeFadeIn();
}

// ===== Render Fallback Gallery =====
function renderGalleryFallback() {
    // Group items into pages of 6
    const pages = [];
    for (let i = 0; i < galleryImages.length; i += ITEMS_PER_PAGE) {
        pages.push(galleryImages.slice(i, i + ITEMS_PER_PAGE));
    }

    galleryGrid.innerHTML = pages.map((page, pageIndex) => `
        <div class="gallery-page">
            ${page.map((src, index) => `
                <div class="gallery-item fade-in" data-index="${pageIndex * ITEMS_PER_PAGE + index}">
                    <img src="${src}" alt="갤러리 이미지 ${pageIndex * ITEMS_PER_PAGE + index + 1}" loading="lazy">
                    <div class="gallery-overlay">
                        <span class="gallery-icon">🔍</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `).join('');

    attachGalleryEvents();
    initGallerySlider(galleryImages.length);
    observeFadeIn();
}

// ===== Gallery Slider Functions =====
function initGallerySlider(totalImages) {
    totalSlides = Math.ceil(totalImages / ITEMS_PER_PAGE);
    currentSlide = 0;

    // Create dots
    const dotsContainer = document.getElementById('galleryDots');
    if (dotsContainer && totalSlides > 1) {
        dotsContainer.innerHTML = Array.from({ length: totalSlides }, (_, i) =>
            `<span class="gallery-dot ${i === 0 ? 'active' : ''}" data-slide="${i}"></span>`
        ).join('');

        // Add click events to dots
        dotsContainer.querySelectorAll('.gallery-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                goToSlide(parseInt(dot.dataset.slide));
            });
        });
    }

    // Setup navigation buttons
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentSlide > 0) {
                goToSlide(currentSlide - 1);
            }
        });

        nextBtn.addEventListener('click', () => {
            if (currentSlide < totalSlides - 1) {
                goToSlide(currentSlide + 1);
            }
        });
    }

    updateSlider();
}

function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateSlider();
}

function updateSlider() {
    // Get viewport width for slide calculation
    const viewport = document.querySelector('.gallery-viewport');
    const viewportWidth = viewport?.offsetWidth || 0;
    const gap = 20;
    const offset = currentSlide * (viewportWidth + gap);

    galleryGrid.style.transform = `translateX(-${offset}px)`;

    // Update dots
    const dots = document.querySelectorAll('.gallery-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });

    // Update button states
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');

    if (prevBtn) prevBtn.disabled = currentSlide === 0;
    if (nextBtn) nextBtn.disabled = currentSlide >= totalSlides - 1;
}

// ===== Attach Gallery Click Events =====
function attachGalleryEvents() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            openLightbox(index);
        });
    });
}

// ===== Navbar Scroll Effect =====
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ===== Mobile Menu Toggle =====
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ===== Lightbox Functions =====
function openLightbox(index) {
    currentImageIndex = index;
    lightboxImg.src = galleryImages[index];
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function showPrevImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    lightboxImg.src = galleryImages[currentImageIndex];
}

function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    lightboxImg.src = galleryImages[currentImageIndex];
}

// Lightbox Controls
lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', showPrevImage);
lightboxNext.addEventListener('click', showNextImage);

// Close lightbox on background click
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrevImage();
    if (e.key === 'ArrowRight') showNextImage();
});

// ===== Scroll Animation =====
function observeFadeIn() {
    const fadeElements = document.querySelectorAll('.section-title, .about-content, .gallery-item, .contact-item');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    fadeElements.forEach(element => {
        element.classList.add('fade-in');
        observer.observe(element);
    });
}

// Initial fade-in for non-gallery elements
observeFadeIn();

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Active Nav Link on Scroll =====
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

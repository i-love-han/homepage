const CACHE_BUSTER = Date.now();
const NO_IMAGE_PATH = 'images/no-image.svg';

// ===== GitHub 설정 =====
const GITHUB_USER = 'i-love-han';
const GITHUB_REPO = 'homepage';
const GITHUB_BRANCH = 'master';
const GITHUB_API = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents`;
const GITHUB_RAW = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;

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
let galleryScrollTime = 3000; // default 3 seconds

// ===== Fetch Helpers =====
async function fetchContent(path) {
    const response = await fetch(`${path}?t=${CACHE_BUSTER}`);
    if (!response.ok) throw new Error(`Failed to fetch ${path}`);
    return await response.text();
}

async function fetchGitHubDir(folder) {
    const response = await fetch(`${GITHUB_API}/images/${folder}`);
    if (!response.ok) throw new Error(`Failed to fetch ${folder}`);
    const files = await response.json();
    return files
        .filter(f => f.type === 'file' && /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name))
        .map(f => f.name);
}

function getImageUrl(folder, filename) {
    return `${GITHUB_RAW}/images/${folder}/${filename}?t=${CACHE_BUSTER}`;
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', async () => {
    loadContent();
    loadPeopleImages();
    loadGallery();
    checkAndShowPopup();
    loadHeroBackground();
    const yearElem = document.getElementById('currentYear');
    if (yearElem) yearElem.textContent = new Date().getFullYear();
});

// ===== Load Content =====
async function loadContent() {
    try {
        const text = await fetchContent('content.txt');
        const lines = text.split('\n');
        const data = {};

        lines.forEach(line => {
            if (line.includes('=')) {
                const [key, ...valueParts] = line.split('=');
                const value = valueParts.join('=').trim().replace(/\\n/g, '\n');
                data[key.trim()] = value;
            }
        });

        // Header
        if (data['브라우저 타이틀']) {
            document.title = data['브라우저 타이틀'];
        }
        setText('headerTitle', data['헤더 제목']);

        // Navigation Labels
        setText('navHome', data['홈 라벨']);
        setText('navAbout', data['소개 라벨']);
        setText('navGallery', data['갤러리 라벨']);
        setText('navContact', data['연락처 라벨']);

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
        setText('aboutLabel', data['소개 라벨']);
        setText('aboutTitle', data['소개 제목']);
        setText('aboutContent', data['소개 내용']);

        // Gallery
        setText('galleryLabel', data['갤러리 라벨']);
        setText('galleryTitle', data['갤러리 제목']);
        if (data['갤러리 스크롤시간']) {
            galleryScrollTime = parseInt(data['갤러리 스크롤시간']) * 1000;
        }

        // Contact
        setText('contactLabel', data['연락처 라벨']);
        setText('contactTitle', data['연락처 제목']);
        setText('contactEmail', data['연락처 이메일']);
        setText('contactPhone', data['연락처 전화']);
        setText('contactLocation', data['연락처 위치']);

        // Apply Links
        applyContactLinks(data);

        // Footer
        setText('footerText', data['푸터 내용']);

    } catch (error) {
        console.log('콘텐츠 로드 실패:', error);
    }
}

function setText(id, text) {
    const element = document.getElementById(id);
    if (element && text) {
        element.textContent = text;
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
    const container = document.getElementById('aboutImageContainer');
    if (!container) return;

    try {
        const files = await fetchGitHubDir('people');
        if (files.length > 0) {
            files.sort();
            const imgPath = getImageUrl('people', files[0]);
            container.innerHTML = `<img src="${imgPath}" alt="${files[0]}">`;
        } else {
            container.innerHTML = `<img src="${NO_IMAGE_PATH}" alt="이미지 없음">`;
        }
    } catch (error) {
        console.log('인물 이미지 로드 실패:', error);
        container.innerHTML = `<img src="${NO_IMAGE_PATH}" alt="이미지 없음">`;
    }
}

// ===== Popup Functions =====
async function checkAndShowPopup() {
    const dontShowUntil = localStorage.getItem('popupDontShowUntil');
    if (dontShowUntil && new Date().getTime() < parseInt(dontShowUntil)) {
        return;
    }

    try {
        const files = await fetchGitHubDir('popup');
        if (files.length === 0) return;

        files.sort();
        const container = document.getElementById('popupImageContainer');
        container.innerHTML = files.map(file =>
            `<img src="${getImageUrl('popup', file)}" alt="${file}">`
        ).join('');

        document.getElementById('popupModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.log('팝업 로드 실패:', error);
    }
}

function closePopup() {
    const dontShow = document.getElementById('popupDontShow').checked;

    if (dontShow) {
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem('popupDontShowUntil', new Date().getTime() + oneWeek);
    }

    document.getElementById('popupModal').classList.remove('active');
    document.body.style.overflow = '';
}

document.getElementById('popupClose').addEventListener('click', closePopup);
document.getElementById('popupCloseBtn').addEventListener('click', closePopup);
document.getElementById('popupModal').addEventListener('click', (e) => {
    if (e.target.id === 'popupModal') closePopup();
});

// ===== Hero Background =====
async function loadHeroBackground() {
    try {
        const files = await fetchGitHubDir('main');
        if (files.length > 0) {
            const bgPath = getImageUrl('main', files[0]);
            const hero = document.querySelector('.hero');
            if (hero) {
                hero.style.background = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${bgPath}') center/cover no-repeat`;
            }
        }
    } catch (error) {
        console.log('배경 로드 실패:', error);
    }
}

// ===== Load Gallery =====
function naturalSortKey(filename) {
    const match = filename.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
}

async function loadGallery() {
    try {
        const files = await fetchGitHubDir('gallery');

        if (files.length === 0) {
            galleryGrid.innerHTML = '<p class="gallery-empty">아직 등록된 사진이 없습니다.</p>';
            return;
        }

        // Sort descending by number in filename
        files.sort((a, b) => naturalSortKey(b) - naturalSortKey(a));

        const data = files.map(filename => ({
            filename: filename,
            path: getImageUrl('gallery', filename)
        }));

        galleryImages = data.map(img => img.path);
        renderGallery(data);
    } catch (error) {
        console.log('갤러리 로드 실패:', error);
        galleryGrid.innerHTML = '<p class="gallery-empty">갤러리를 로드할 수 없습니다.</p>';
    }
}

// ===== Render Gallery =====
function renderGallery(data) {
    if (data.length === 0) {
        galleryGrid.innerHTML = '<p class="gallery-empty">아직 등록된 사진이 없습니다.</p>';
        return;
    }

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

// ===== Gallery Slider Functions =====
let autoSlideInterval = null;

function initGallerySlider(totalImages) {
    totalSlides = Math.ceil(totalImages / ITEMS_PER_PAGE);
    currentSlide = 0;

    const dotsContainer = document.getElementById('galleryDots');
    if (dotsContainer && totalSlides > 1) {
        dotsContainer.innerHTML = Array.from({ length: totalSlides }, (_, i) =>
            `<span class="gallery-dot ${i === 0 ? 'active' : ''}" data-slide="${i}"></span>`
        ).join('');

        dotsContainer.querySelectorAll('.gallery-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                goToSlide(parseInt(dot.dataset.slide));
                resetAutoSlide();
            });
        });
    }

    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');

    if (prevBtn && nextBtn) {
        // Remove old event listeners by cloning (simple trick)
        const newPrev = prevBtn.cloneNode(true);
        const newNext = nextBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrev, prevBtn);
        nextBtn.parentNode.replaceChild(newNext, nextBtn);

        newPrev.addEventListener('click', () => {
            if (currentSlide > 0) {
                goToSlide(currentSlide - 1);
            } else {
                goToSlide(totalSlides - 1);
            }
            resetAutoSlide();
        });

        newNext.addEventListener('click', () => {
            if (currentSlide < totalSlides - 1) {
                goToSlide(currentSlide + 1);
            } else {
                goToSlide(0);
            }
            resetAutoSlide();
        });
    }

    updateSlider();
    startAutoSlide();
}

function startAutoSlide() {
    if (totalSlides <= 1) return;

    autoSlideInterval = setInterval(() => {
        if (currentSlide < totalSlides - 1) {
            goToSlide(currentSlide + 1);
        } else {
            goToSlide(0);
        }
    }, galleryScrollTime);
}

function resetAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
    }
    startAutoSlide();
}

function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateSlider();
}

function updateSlider() {
    const viewport = document.querySelector('.gallery-viewport');
    const viewportWidth = viewport?.offsetWidth || 0;
    const gap = 20; // Needs to match CSS
    const offset = currentSlide * (viewportWidth + gap);

    galleryGrid.style.transform = `translateX(-${offset}px)`;

    const dots = document.querySelectorAll('.gallery-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });

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

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', showPrevImage);
lightboxNext.addEventListener('click', showNextImage);

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

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

// ===== Scroll to Top Button =====
const scrollTopBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

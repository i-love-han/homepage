document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
if (e.key === 'F12' ||
(e.ctrlKey && e.shiftKey && e.key === 'I') ||
(e.ctrlKey && e.shiftKey && e.key === 'J') ||
(e.ctrlKey && e.key === 'U')) {
e.preventDefault();
}
});
const CACHE_BUSTER = Date.now();
const NO_IMAGE_PATH = 'images/no-image.svg';
let IMAGE_FILES = {
gallery: [],
people: [],
main: [],
popup: []
};
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const galleryGrid = document.getElementById('galleryGrid');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxVideo = document.getElementById('lightbox-video');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrev = document.querySelector('.lightbox-prev');
const lightboxNext = document.querySelector('.lightbox-next');
function isVideo(filename) {
return /\.(mp4|webm)$/i.test(filename);
}
let galleryImages = [];
let currentImageIndex = 0;
let currentSlide = 0;
const ITEMS_PER_PAGE = 6;
let totalSlides = 0;
let galleryScrollTime = 3000; // default 3 seconds
async function fetchContent(path) {
const response = await fetch(`${path}?t=${CACHE_BUSTER}`);
if (!response.ok) throw new Error(`Failed to fetch ${path}`);
return await response.text();
}
async function loadImageList() {
try {
const response = await fetch(`images.json?t=${CACHE_BUSTER}`);
if (!response.ok) throw new Error('Failed to load images.json');
IMAGE_FILES = await response.json();
} catch (error) {
console.log('이미지 목록 로드 실패:', error);
}
}
function getImagePath(folder, filename) {
return `images/${folder}/${filename}?t=${CACHE_BUSTER}`;
}
document.addEventListener('DOMContentLoaded', async () => {
await loadImageList();
loadContent();
loadPeopleImages();
loadGallery();
checkAndShowPopup();
loadHeroBackground();
const yearElem = document.getElementById('currentYear');
if (yearElem) yearElem.textContent = new Date().getFullYear();
});
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
if (data['브라우저 타이틀']) {
document.title = data['브라우저 타이틀'];
}
setText('headerTitle', data['헤더 제목']);
setText('navHome', data['홈 라벨']);
setText('navAbout', data['소개 라벨']);
setText('navGallery', data['갤러리 라벨']);
setText('navContact', data['연락처 라벨']);
setText('mainTitle', data['메인 제목']);
const mainContent = data['메인 내용'] || '';
const mainParts = mainContent.split('\n');
setText('mainContent', mainParts[0]);
if (mainParts.length > 1) {
setText('mainTagline', mainParts.slice(1).join('\n'));
}
setText('aboutLabel', data['소개 라벨']);
setText('aboutTitle', data['소개 제목']);
setText('aboutContent', data['소개 내용']);
setText('galleryLabel', data['갤러리 라벨']);
setText('galleryTitle', data['갤러리 제목']);
if (data['갤러리 스크롤시간']) {
galleryScrollTime = parseInt(data['갤러리 스크롤시간']) * 1000;
}
setText('contactLabel', data['연락처 라벨']);
setText('contactTitle', data['연락처 제목']);
setText('contactEmail', data['연락처 이메일']);
setText('contactPhone', data['연락처 전화']);
setText('contactLocation', data['연락처 위치']);
applyContactLinks(data);
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
const emailElem = document.getElementById('contactEmail');
if (emailElem && email) {
const item = emailElem.closest('.contact-item');
if (item) {
item.onclick = () => {
window.location.href = `mailto:${email}`;
};
}
}
const phoneElem = document.getElementById('contactPhone');
if (phoneElem && phone) {
const item = phoneElem.closest('.contact-item');
if (item) {
item.onclick = () => {
window.location.href = `tel:${phone}`;
};
}
}
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
function loadPeopleImages() {
const container = document.getElementById('aboutImageContainer');
if (!container) return;
const files = IMAGE_FILES.people || [];
if (files.length > 0) {
const imgPath = getImagePath('people', files[0]);
container.innerHTML = `<img src="${imgPath}" alt="${files[0]}">`;
} else {
container.innerHTML = `<img src="${NO_IMAGE_PATH}" alt="이미지 없음">`;
}
}
let currentPopupSlide = 0;
let popupImages = [];
function checkAndShowPopup() {
popupImages = IMAGE_FILES.popup || [];
if (popupImages.length === 0) return;
const popupHash = popupImages.join(',');
const savedHash = localStorage.getItem('popupImageHash');
const dontShowUntil = localStorage.getItem('popupDontShowUntil');
if (popupHash !== savedHash) {
localStorage.removeItem('popupDontShowUntil');
localStorage.setItem('popupImageHash', popupHash);
} else if (dontShowUntil && new Date().getTime() < parseInt(dontShowUntil)) {
return;
}
const container = document.getElementById('popupImageContainer');
container.innerHTML = popupImages.map((file, index) =>
`<img src="${getImagePath('popup', file)}" alt="${file}" class="${index === 0 ? 'active' : ''}">`
).join('');
const dotsContainer = document.getElementById('popupDots');
if (popupImages.length > 1) {
dotsContainer.innerHTML = popupImages.map((_, index) =>
`<span class="popup-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>`
).join('');
dotsContainer.querySelectorAll('.popup-dot').forEach(dot => {
dot.addEventListener('click', () => {
goToPopupSlide(parseInt(dot.dataset.index));
});
});
} else {
dotsContainer.innerHTML = '';
}
currentPopupSlide = 0;
updatePopupNav();
document.getElementById('popupModal').classList.add('active');
document.body.style.overflow = 'hidden';
}
function goToPopupSlide(index) {
const container = document.getElementById('popupImageContainer');
const images = container.querySelectorAll('img');
const dots = document.querySelectorAll('.popup-dot');
images.forEach((img, i) => {
img.classList.toggle('active', i === index);
});
dots.forEach((dot, i) => {
dot.classList.toggle('active', i === index);
});
currentPopupSlide = index;
updatePopupNav();
}
function updatePopupNav() {
const prevBtn = document.getElementById('popupPrev');
const nextBtn = document.getElementById('popupNext');
if (popupImages.length <= 1) {
prevBtn.style.display = 'none';
nextBtn.style.display = 'none';
} else {
prevBtn.style.display = 'flex';
nextBtn.style.display = 'flex';
}
}
document.getElementById('popupPrev').addEventListener('click', () => {
if (currentPopupSlide > 0) {
goToPopupSlide(currentPopupSlide - 1);
} else {
goToPopupSlide(popupImages.length - 1);
}
});
document.getElementById('popupNext').addEventListener('click', () => {
if (currentPopupSlide < popupImages.length - 1) {
goToPopupSlide(currentPopupSlide + 1);
} else {
goToPopupSlide(0);
}
});
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
function loadHeroBackground() {
const files = IMAGE_FILES.main || [];
if (files.length > 0) {
const bgPath = getImagePath('main', files[0]);
const hero = document.querySelector('.hero');
if (hero) {
hero.style.background = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${bgPath}') center/cover no-repeat`;
}
}
}
function loadGallery() {
const files = IMAGE_FILES.gallery || [];
if (files.length === 0) {
galleryGrid.innerHTML = '<p class="gallery-empty">아직 등록된 사진이 없습니다.</p>';
return;
}
const data = files.map(filename => ({
filename: filename,
path: getImagePath('gallery', filename)
}));
galleryImages = data.map(img => img.path);
renderGallery(data);
}
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
${isVideo(img.filename) ? `
<div class="gallery-video-wrapper">
<video src="${img.path}#t=0.5" preload="metadata"></video>
<div class="video-overlay">▶</div>
</div>
` : `
<img src="${img.path}" alt="${img.filename}" loading="lazy">
`}
<div class="gallery-overlay">
<span class="gallery-icon">${isVideo(img.filename) ? '▶' : '🔍'}</span>
</div>
</div>
`).join('')}
</div>
`).join('');
attachGalleryEvents();
initGallerySlider(data.length);
observeFadeIn();
}
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
function attachGalleryEvents() {
const galleryItems = document.querySelectorAll('.gallery-item');
galleryItems.forEach((item, index) => {
item.addEventListener('click', () => {
openLightbox(index);
});
});
}
window.addEventListener('scroll', () => {
if (window.scrollY > 50) {
navbar.classList.add('scrolled');
} else {
navbar.classList.remove('scrolled');
}
});
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
function openLightbox(index) {
currentImageIndex = index;
const path = galleryImages[index];
const filename = path.split('/').pop().split('?')[0];
lightboxImg.style.display = 'none';
lightboxVideo.style.display = 'none';
lightboxVideo.pause();
if (isVideo(filename)) {
lightboxVideo.src = path;
lightboxVideo.style.display = 'block';
lightboxVideo.play().catch(e => console.log('Autoplay failed:', e));
} else {
lightboxImg.src = path;
lightboxImg.style.display = 'block';
}
lightbox.classList.add('active');
document.body.style.overflow = 'hidden';
}
function closeLightbox() {
lightbox.classList.remove('active');
lightboxVideo.pause();
lightboxVideo.src = ""; // Stop buffering
document.body.style.overflow = '';
}
function updateLightboxContent() {
const path = galleryImages[currentImageIndex];
const filename = path.split('/').pop().split('?')[0];
lightboxVideo.pause(); // Pause previous if was video
lightboxImg.style.display = 'none';
lightboxVideo.style.display = 'none';
if (isVideo(filename)) {
lightboxVideo.src = path;
lightboxVideo.style.display = 'block';
lightboxVideo.play().catch(e => console.log('Autoplay failed:', e));
} else {
lightboxImg.src = path;
lightboxImg.style.display = 'block';
}
}
function showPrevImage() {
currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
updateLightboxContent();
}
function showNextImage() {
currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
updateLightboxContent();
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
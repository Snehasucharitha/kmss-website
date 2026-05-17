'use strict';

/* ══ PAGE LOADER ══════════════════════════════ */
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  setTimeout(() => {
    loader.classList.add('loaded');
    triggerHeroEntrance();
  }, 1750);
});

/* ══ HERO ENTRANCE — fires once, GPU-only transform+opacity ══ */
function triggerHeroEntrance() {
  const heroEls = ['.hero-badge','.hero-title','.hero-sub','.hero-actions','.hero-stats'];
  heroEls.forEach(sel => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.classList.add('hero-in');
    el.addEventListener('animationend', () => {
      el.classList.remove('hero-in');
      el.classList.add('hero-live');
    }, { once: true });
  });
}

/* ══ SIDEBAR TOGGLE ═══════════════════════════ */
const sidebar = document.getElementById('sidebar');
const toggle  = document.getElementById('sidebar-toggle');
if (toggle && sidebar) {
  toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && sidebar.classList.contains('open'))
      sidebar.classList.remove('open');
  });
}

/* ══ ACTIVE NAV ON SCROLL ══════════════════════ */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link =>
        link.classList.toggle('active', link.getAttribute('data-section') === id)
      );
    }
  });
}, { threshold: 0.25 });
sections.forEach(s => sectionObserver.observe(s));

/* ══ SMOOTH SCROLL ════════════════════════════ */
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    if (window.innerWidth < 900 && sidebar) sidebar.classList.remove('open');
  });
});

/* ══ SCROLL REVEAL ════════════════════════════ */
const revealEls = document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    } else {
      entry.target.classList.remove('visible');
    }
  });
}, { threshold: 0.07, rootMargin: '0px 0px -20px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ══ TECH BAR ANIMATION ═══════════════════════ */
const techFills = document.querySelectorAll('.tech-fill');
const techObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animated');
    } else {
      entry.target.classList.remove('animated');
      entry.target.style.width = '0';
      requestAnimationFrame(() => { entry.target.style.width = ''; });
    }
  });
}, { threshold: 0.35 });
techFills.forEach(f => techObserver.observe(f));

/* ══ COUNTER ANIMATION ════════════════════════ */
function animateCounter(el, target, suffix) {
  if (el._animating) return;
  el._animating = true;
  el.textContent = '0' + suffix;
  let current = 0;
  const step = Math.max(1, Math.ceil(target / 60));
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current + suffix;
    if (current >= target) { clearInterval(timer); el._animating = false; }
  }, 20);
}

const statProjects = document.getElementById('stat-projects');
const statYears    = document.getElementById('stat-years');

const heroStatsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      if (statProjects) animateCounter(statProjects, 150, '+');
      if (statYears)    animateCounter(statYears,    25,  '+');
    } else {
      if (statProjects && !statProjects._animating) statProjects.textContent = '0+';
      if (statYears    && !statYears._animating)    statYears.textContent    = '0+';
    }
  });
}, { threshold: 0.4 });

const heroSection = document.getElementById('hero');
if (heroSection) heroStatsObserver.observe(heroSection);

/* ══ HERO SLIDESHOW ═══════════════════════════ */
(function heroSlideshow() {
  const slides = document.querySelectorAll('.hero-slide');
  if (!slides.length) return;
  let current = 0, timer;

  function goTo(index) {
    slides[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
  }
  function startTimer() { clearInterval(timer); timer = setInterval(() => goTo(current + 1), 5500); }
  startTimer();
})();

/* ══ MOUSE PARALLAX — paused when hero off screen ══ */
(function setupParallax() {
  const heroContent = document.getElementById('hero-content');
  const ambientLeft = document.querySelector('.hero-ambient-left');
  if (!heroContent) return;

  let mouseX = 0, mouseY = 0, curX = 0, curY = 0;
  let heroVisible = true, rafId = null;

  // Track mouse only
  document.addEventListener('mousemove', (e) => {
    if (!heroVisible) return;
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    mouseX = (e.clientX - cx) / cx;
    mouseY = (e.clientY - cy) / cy;
  }, { passive: true });

  // Pause RAF when hero is not in view
  const heroObs = new IntersectionObserver((entries) => {
    heroVisible = entries[0].isIntersecting;
    if (heroVisible && !rafId) rafId = requestAnimationFrame(parallaxLoop);
    if (!heroVisible && rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }, { threshold: 0.01 });
  if (heroSection) heroObs.observe(heroSection);

  function parallaxLoop() {
    curX += (mouseX - curX) * 0.05;
    curY += (mouseY - curY) * 0.05;
    // Only update if movement is significant
    if (Math.abs(mouseX - curX) > 0.001 || Math.abs(mouseY - curY) > 0.001) {
      heroContent.style.transform = `translate(${curX * 8}px, ${curY * 6}px)`;
      if (ambientLeft) {
        ambientLeft.style.left = (50 + mouseX * 6) - 15 + '%';
        ambientLeft.style.top  = (40 + mouseY * 6) - 15 + '%';
      }
    }
    if (heroVisible) rafId = requestAnimationFrame(parallaxLoop);
    else rafId = null;
  }

  // Start if hero initially visible
  rafId = requestAnimationFrame(parallaxLoop);
})();

/* ══ GLASS CARD HOVER 3D TILT ════════════════ */
document.querySelectorAll('.glass-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `perspective(700px) rotateY(${x * 5}deg) rotateX(${-y * 4}deg) translateY(-5px) scale(1.01)`;
  }, { passive: true });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
  });
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform 0.12s ease';
  });
});

/* ══ PORTFOLIO ITEM 3D TILT ══════════════════ */
document.querySelectorAll('.portfolio-item').forEach(item => {
  item.addEventListener('mousemove', (e) => {
    const rect = item.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    item.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 5}deg) scale(1.02)`;
    item.style.transition = 'transform 0.12s ease';
    item.style.zIndex = '2';
  }, { passive: true });
  item.addEventListener('mouseleave', () => {
    item.style.transform = '';
    item.style.zIndex = '';
    item.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
  });
});

/* ══ PORTFOLIO LIGHTBOX ══════════════════════ */
document.querySelectorAll('.portfolio-item').forEach(item => {
  item.addEventListener('click', () => {
    const img   = item.querySelector('img');
    const title = item.querySelector('.portfolio-item-title');
    if (!img) return;
    const ov = document.createElement('div');
    ov.id = 'lightbox';
    ov.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(4,9,18,0.97);display:flex;align-items:center;justify-content:center;cursor:zoom-out;padding:24px;animation:heroIn 0.3s ease both';
    const imgEl = document.createElement('img');
    imgEl.src = img.src; imgEl.alt = img.alt;
    imgEl.style.cssText = 'max-width:90vw;max-height:85vh;border-radius:16px;object-fit:contain;box-shadow:0 40px 120px rgba(0,0,0,0.9);border:1px solid rgba(245,166,35,0.2)';
    const cap = document.createElement('div');
    cap.textContent = title ? title.textContent : '';
    cap.style.cssText = 'position:absolute;bottom:32px;color:#fff;font-size:1rem;font-weight:600;letter-spacing:0.05em;text-align:center;width:100%';
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = 'position:absolute;top:24px;right:32px;background:rgba(245,166,35,0.15);border:1px solid rgba(245,166,35,0.3);color:#f5a623;width:40px;height:40px;border-radius:50%;font-size:1rem;cursor:pointer';
    ov.append(imgEl, cap, closeBtn);
    document.body.appendChild(ov);
    ov.addEventListener('click', () => ov.remove());
    closeBtn.addEventListener('click', e => { e.stopPropagation(); ov.remove(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') ov.remove(); }, { once: true });
  });
});

/* ══ CONTACT FORM ════════════════════════════ */
function handleFormSubmit(e) {
  e.preventDefault();
  const name    = document.getElementById('form-name').value.trim();
  const phone   = document.getElementById('form-phone').value.trim();
  const service = document.getElementById('form-service').value;
  const message = document.getElementById('form-message').value.trim();
  const text = `Hello KMSS Constructions!%0A%0AName: ${encodeURIComponent(name)}%0APhone: ${encodeURIComponent(phone)}%0AService: ${encodeURIComponent(service)}%0A%0AProject Details:%0A${encodeURIComponent(message)}`;
  window.open(`https://wa.me/919176078485?text=${text}`, '_blank');
  const succ = document.getElementById('form-success');
  succ.style.display = 'block';
  e.target.reset();
  setTimeout(() => { succ.style.display = 'none'; }, 5000);
}

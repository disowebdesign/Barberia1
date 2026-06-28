(function() {
'use strict';

/* ── CURSOR ── */
const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mx=0, my=0, rx=0, ry=0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  dot.style.left = mx + 'px'; dot.style.top = my + 'px';
});

(function animRing() {
  rx += (mx - rx) * 0.1;
  ry += (my - ry) * 0.1;
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
  requestAnimationFrame(animRing);
})();

document.querySelectorAll('a, button, .bento-cell, .maestro-img-wrap, input, select').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('is-hovering'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('is-hovering'));
});
document.addEventListener('mousedown', () => document.body.classList.add('is-clicking'));
document.addEventListener('mouseup',   () => document.body.classList.remove('is-clicking'));

/* ── BOOK FLOAT VISIBILITY ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  // Show/hide float button
  const bookFloat = document.getElementById('bookFloat');
  if (bookFloat) bookFloat.style.opacity = window.scrollY > 200 ? '1' : '0';
}, { passive: true });
// Start hidden
const bookFloat = document.getElementById('bookFloat');
if (bookFloat) bookFloat.style.opacity = '0';
bookFloat.style.transition = 'opacity .5s, transform .4s, box-shadow .4s, background .3s';

/* ── MOBILE MENU ── */
const burger = document.getElementById('navBurger');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;

if (burger) {
  burger.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mobileMenu.classList.toggle('open', menuOpen);
    const spans = burger.querySelectorAll('span');
    if (menuOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(4px,4px)';
      spans[1].style.transform = 'rotate(-45deg) translate(4px,-4px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.transform = '';
    }
  });
  document.querySelectorAll('.mm-link').forEach(link => {
    link.addEventListener('click', () => {
      menuOpen = false;
      mobileMenu.classList.remove('open');
      burger.querySelectorAll('span').forEach(s => s.style.transform = '');
    });
  });
}

/* ── HERO PARALLAX ── */
const heroBgImg = document.getElementById('heroBgImg');
window.addEventListener('scroll', () => {
  if (heroBgImg) {
    const y = window.scrollY * 0.3;
    heroBgImg.style.transform = `translateY(${y}px) scale(1.05)`;
  }
}, { passive: true });

/* ── MARQUEE ── */
const track = document.getElementById('marqueeTrack');
if (track) {
  let x = 0;
  const speed = 0.5;
  const totalW = track.scrollWidth / 2;
  (function animMarquee() {
    x -= speed;
    if (Math.abs(x) >= totalW) x = 0;
    track.style.transform = `translateX(${x}px)`;
    requestAnimationFrame(animMarquee);
  })();
}

/* ── SCROLL REVEAL ── */
const revealEls = document.querySelectorAll('.reveal-el, .card-reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('revealed');
      }, (i % 4) * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => observer.observe(el));

/* ── BENTO TILT ── */
document.querySelectorAll('.bento-cell[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `translateY(-6px) scale(1.01) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
    card.style.transformStyle = 'preserve-3d';
    const glow = card.querySelector('.bento-glow');
    if (glow) {
      glow.style.background = `radial-gradient(circle at ${(x+.5)*100}% ${(y+.5)*100}%, rgba(197,160,89,0.1), transparent 60%)`;
    }
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transformStyle = '';
  });
});

/* ── FORM SUBMIT ── */
const form = document.getElementById('reservarForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit span:first-child');
    const orig = btn.textContent;
    btn.textContent = 'Reservación confirmada ✓';
    form.querySelector('.btn-submit').style.background = '#4ade80';
    setTimeout(() => {
      btn.textContent = orig;
      form.querySelector('.btn-submit').style.background = '';
      form.reset();
    }, 3500);
  });

  form.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('focus', () => {
      input.parentElement.querySelector('label').style.color = 'rgba(197,160,89,.8)';
    });
    input.addEventListener('blur', () => {
      input.parentElement.querySelector('label').style.color = '';
    });
  });
}

/* ── SMOOTH ANCHORS ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

})();

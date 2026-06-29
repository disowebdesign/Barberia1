(function() {
'use strict';

/* ── SLIDESHOW (cambio de secciones tipo tarjetas) ── */
const slides = Array.from(document.querySelectorAll('.slide'));
const slidesMain = document.getElementById('slidesMain');
const progressWrap = document.getElementById('slideProgress');
let currentSlide = 0;
let isAnimating = false;
const ANIM_LOCK_MS = 950;

if (slides.length && slidesMain) {
  document.body.classList.add('slides-mode');

  // Crear puntos de navegación
  slides.forEach((s, i) => {
    const dot = document.createElement('div');
    dot.className = 'slide-dot' + (i === 0 ? ' is-on' : '');
    dot.addEventListener('click', () => goToSlide(i));
    progressWrap.appendChild(dot);
  });
  const dots = Array.from(progressWrap.children);

  function setSlideStates() {
    slides.forEach((s, i) => {
      s.classList.remove('is-current', 'is-prev');
      if (i === currentSlide) {
        s.classList.add('is-current');
      } else if (i < currentSlide) {
        s.classList.add('is-prev');
      }
    });
    dots.forEach((d, i) => d.classList.toggle('is-on', i === currentSlide));
    // Actualizar el hash de la URL sin saltar
    const id = slides[currentSlide].id;
    if (id) history.replaceState(null, '', '#' + id);
  }

  function triggerRevealsIn(slide) {
    slide.querySelectorAll('.reveal-el, .card-reveal').forEach(el => {
      el.classList.add('revealed');
    });
  }

  function goToSlide(index) {
    if (isAnimating) return;
    const clamped = Math.max(0, Math.min(slides.length - 1, index));
    if (clamped === currentSlide) return;
    isAnimating = true;
    currentSlide = clamped;
    setSlideStates();
    triggerRevealsIn(slides[currentSlide]);
    setTimeout(() => { isAnimating = false; }, ANIM_LOCK_MS);
  }

  // Inicializar estado
  setSlideStates();
  triggerRevealsIn(slides[0]);

  // Helper: obtener el elemento scrolleable de la slide actual
  function getScrollable() {
    return slides[currentSlide].querySelector('[style*="overflow-y"]');
  }

  // Wheel (desktop)
  let wheelCooldown = false;

  window.addEventListener('wheel', (e) => {
    const scrollable = getScrollable();

    if (scrollable) {
      const atBottom = scrollable.scrollHeight - scrollable.scrollTop - scrollable.clientHeight < 10;
      const atTop    = scrollable.scrollTop < 10;
      const goingDown = e.deltaY > 0;
      const goingUp   = e.deltaY < 0;

      // Si el elemento scrolleable aún tiene recorrido, no intervenir
      if (goingDown && !atBottom) return;
      if (goingUp   && !atTop)    return;
    }

    // Solo llegamos aquí si no hay scroll pendiente
    e.preventDefault();
    if (wheelCooldown || isAnimating) return;
    wheelCooldown = true;
    setTimeout(() => { wheelCooldown = false; }, 1000);
    if (e.deltaY > 0) goToSlide(currentSlide + 1);
    else              goToSlide(currentSlide - 1);
  }, { passive: false });

  // Touch (mobile)
  let touchStartY = 0;
  let touchStartScrollTop = 0;

  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
    const scrollable = getScrollable();
    touchStartScrollTop = scrollable ? scrollable.scrollTop : 0;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    const diff = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(diff) < 80) return;

    const scrollable = getScrollable();
    if (scrollable) {
      const atBottom = scrollable.scrollHeight - scrollable.scrollTop - scrollable.clientHeight < 12;
      const atTop    = scrollable.scrollTop < 12;
      // Si iba hacia abajo y no está al fondo, o iba hacia arriba y no está al tope → no cambiar
      if (diff > 0 && !atBottom) return;
      if (diff < 0 && !atTop)    return;
    }

    if (diff > 0) goToSlide(currentSlide + 1);
    else          goToSlide(currentSlide - 1);
  }, { passive: true });

  // Teclado
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goToSlide(currentSlide + 1); }
    if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); goToSlide(currentSlide - 1); }
  });

  // Links internos (#servicios, #maestro, etc) saltan al slide correcto
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      const targetIndex = slides.findIndex(s => '#' + s.id === href);
      if (targetIndex !== -1) {
        e.preventDefault();
        goToSlide(targetIndex);
      }
    });
  });
}

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

document.querySelectorAll('a, button, .serv-item, .maestro-img-wrap, input, select').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('is-hovering'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('is-hovering'));
});
document.addEventListener('mousedown', () => document.body.classList.add('is-clicking'));
document.addEventListener('mouseup',   () => document.body.classList.remove('is-clicking'));

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

/* ── SERVICIOS: imagen dinámica al hacer hover ── */
const servItems = document.querySelectorAll('.serv-item');
const servVisualImg = document.getElementById('servVisualImg');
servItems.forEach(item => {
  item.addEventListener('mouseenter', () => {
    servItems.forEach(i => i.classList.remove('is-active'));
    item.classList.add('is-active');
    const newSrc = item.getAttribute('data-img');
    if (servVisualImg && newSrc) {
      servVisualImg.style.opacity = '0';
      setTimeout(() => {
        servVisualImg.src = newSrc;
        servVisualImg.style.opacity = '1';
      }, 220);
    }
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

})();

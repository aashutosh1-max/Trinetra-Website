'use strict';

/* NAVBAR */
(function () {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
})();

/* SCROLL REVEALS */
(function () {
  const els = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => observer.observe(el));
})();

/* TILT CARDS */
(function () {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      card.style.transform = `perspective(800px) rotateX(${-dy * 6}deg) rotateY(${dx * 6}deg) translateZ(8px) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

/* IMAGE MODAL */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.img-modal.active').forEach(m => m.classList.remove('active'));
  }
});

/* SELECT PRODUCT FROM GALLERY */
function selectProduct(name) {
  const select = document.getElementById('variantSelect') || document.getElementById('styleSelect');
  if (select) {
    for (let opt of select.options) {
      if (opt.value === name) { select.value = name; break; }
    }
  }
  const orderSection = document.getElementById('order-section');
  if (orderSection) {
    const navH = document.getElementById('navbar')?.offsetHeight || 80;
    window.scrollTo({ top: orderSection.offsetTop - navH, behavior: 'smooth' });
  }
}

/* ORDER FORM — PLASTIC PIECES — EmailJS */
(function () {
  emailjs.init('cfVhhCDmmGnSUcV-F');

  const form = document.getElementById('piecesOrderForm');
  const msgEl = document.getElementById('piecesMsg');
  const btn = document.getElementById('piecesSubmitBtn');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const d = new FormData(form);
    const business = d.get('business_name');
    const person = d.get('contact_person');
    const phone = d.get('phone');
    const variant = d.get('variant');
    const quantity = d.get('quantity');
    const location = d.get('location');

    if (!business || !person || !phone || !variant || !quantity || !location) {
      showMsg(msgEl, 'error', '⚠ Please fill all required fields marked with *');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    const params = {
      business_name:   d.get('business_name'),
      contact_person:  d.get('contact_person'),
      phone:           d.get('phone'),
      email:           d.get('email') || 'Not provided',
      variant:         d.get('variant'),
      quantity:        d.get('quantity'),
      grade:           d.get('grade') || 'Not specified',
      location:        d.get('location'),
      message:         d.get('message') || 'None',
    };

    emailjs.send('service_5qtpqp9', 'template_gsbdv7t', params)
      .then(() => {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Order Request';
        showMsg(msgEl, 'success', '✅ Order submitted successfully! We will call you personally to confirm.');
        form.reset();
      })
      .catch((err) => {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Order Request';
        showMsg(msgEl, 'error', '❌ Failed to send. Please call us directly at +977 9857039041');
        console.error('EmailJS error:', err);
      });
  });
})();

/* ORDER FORM — PLASTIC MATTE — EmailJS */
(function () {
  const form = document.getElementById('matteOrderForm');
  const msgEl = document.getElementById('matteMsg');
  const btn = document.getElementById('matteSubmitBtn');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const d = new FormData(form);
    const business = d.get('business_name');
    const person = d.get('contact_person');
    const phone = d.get('phone');
    const style = d.get('style');
    const size = d.get('size');
    const quantity = d.get('quantity');
    const location = d.get('location');

    if (!business || !person || !phone || !style || !size || !quantity || !location) {
      showMsg(msgEl, 'error', '⚠ Please fill all required fields marked with *');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    const params = {
      business_name:   d.get('business_name'),
      contact_person:  d.get('contact_person'),
      phone:           d.get('phone'),
      email:           d.get('email') || 'Not provided',
      style:           d.get('style'),
      size:            d.get('size'),
      quantity:        d.get('quantity'),
      color:           d.get('color') || 'Not specified',
      location:        d.get('location'),
      message:         d.get('message') || 'None',
    };

    emailjs.send('service_5qtpqp9', 'template_lnhmy4s', params)
      .then(() => {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Order Request';
        showMsg(msgEl, 'success', '✅ Order submitted successfully! We will call you personally to confirm.');
        form.reset();
      })
      .catch((err) => {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Order Request';
        showMsg(msgEl, 'error', '❌ Failed to send. Please call us directly at +977 9857039041');
        console.error('EmailJS error:', err);
      });
  });
})();

/* HELPER */
function showMsg(el, type, text) {
  if (!el) return;
  el.className = 'form-msg ' + type;
  el.textContent = text;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 8000);
}

/* FOOTER YEAR */
document.querySelectorAll('.year').forEach(el => el.textContent = new Date().getFullYear());

/* WHATSAPP FLOAT ENTRANCE */
(function () {
  const wa = document.querySelector('.wa-float');
  if (!wa) return;
  wa.style.cssText = 'opacity:0;transform:scale(0.5) translateY(20px);transition:all 0.5s cubic-bezier(0.23,1,0.32,1);';
  setTimeout(() => { wa.style.opacity = '1'; wa.style.transform = 'scale(1) translateY(0)'; }, 1500);
})();

console.log('%cTrinetra Plastic Udhyog 🌿', 'color:#2d7a3a;font-size:16px;font-weight:700;');
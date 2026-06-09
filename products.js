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
  // Derive checkbox value from gallery button name
  let checkVal = null;
  if (name.startsWith('Plastic Gundri - ')) {
    checkVal = name.replace('Plastic Gundri - ', ''); // "Style 3"
  } else if (name.startsWith('Plastic Pieces - Variant ')) {
    const num = name.replace('Plastic Pieces - Variant ', '');
    const map = {'1':'Black - Variant 1','2':'Red - Variant 2','3':'Green - Variant 3','4':'Brown - Variant 4','5':'Yellow - Variant 5','6':'Blue - Variant 6'};
    checkVal = map[num] || null;
  }
  if (checkVal) {
    const picker = document.getElementById('stylePicker') || document.getElementById('variantPicker');
    if (picker) {
      picker.querySelectorAll('.sp-check').forEach(cb => {
        if (cb.value === checkVal) {
          cb.checked = true;
          cb.closest('.sp-row').classList.add('sp-row-active');
          const qty = cb.closest('.sp-row').querySelector('.sp-qty');
          if (qty && !qty.value) setTimeout(() => qty.focus(), 400);
        }
      });
    }
  }
  const orderSection = document.getElementById('order-section');
  if (orderSection) {
    const navH = document.getElementById('navbar')?.offsetHeight || 80;
    window.scrollTo({ top: orderSection.offsetTop - navH, behavior: 'smooth' });
  }
}

/* EMAILJS INIT — runs once when DOM is ready, works for both pages */
document.addEventListener('DOMContentLoaded', function () {
  emailjs.init('cfVhhCDmmGnSUcV-F');

  /* ORDER FORM — PLASTIC PIECES */
  (function () {
    const form = document.getElementById('piecesOrderForm');
    const msgEl = document.getElementById('piecesMsg');
    const btn = document.getElementById('piecesSubmitBtn');
    if (!form) return;

    // Highlight row when checkbox toggled
    document.querySelectorAll('#variantPicker .sp-check').forEach(cb => {
      cb.addEventListener('change', () => {
        cb.closest('.sp-row').classList.toggle('sp-row-active', cb.checked);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const d = new FormData(form);
      const business = d.get('business_name');
      const person   = d.get('contact_person');
      const phone    = d.get('phone');
      const location = d.get('location');

      if (!business || !person || !phone || !location) {
        showMsg(msgEl, 'error', '⚠ Please fill all required fields marked with *');
        return;
      }

      // Collect checked variants
      const rows = document.querySelectorAll('#variantPicker .sp-row');
      const selectedVariants = [];
      rows.forEach(row => {
        const cb    = row.querySelector('.sp-check');
        const qty   = row.querySelector('.sp-qty');
        const grade = row.querySelector('.sp-size');
        if (cb.checked) {
          const qtyVal = qty.value.trim();
          if (!qtyVal) {
            qty.style.borderColor = '#e53935';
            qty.focus();
          } else {
            qty.style.borderColor = '';
            selectedVariants.push(`${cb.value} | Grade: ${grade.value} | Qty: ${qtyVal}`);
          }
        }
      });

      if (selectedVariants.length === 0) {
        document.getElementById('variantPickerError').style.display = 'block';
        return;
      }
      document.getElementById('variantPickerError').style.display = 'none';

      const missingQty = [...document.querySelectorAll('#variantPicker .sp-check:checked')].some(cb => {
        const qty = cb.closest('.sp-row').querySelector('.sp-qty');
        return !qty.value.trim();
      });
      if (missingQty) {
        showMsg(msgEl, 'error', '⚠ Please enter quantity for all selected variants.');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

      const orderSummary = selectedVariants.join('\n');

      const params = {
        business_name:  business,
        contact_person: person,
        phone:          phone,
        email:          d.get('email') || 'Not provided',
        variant:        orderSummary,
        quantity:       `${selectedVariants.length} variant(s) — see details above`,
        grade:          '(per variant above)',
        location:       location,
        message:        d.get('message') || 'None',
      };

      emailjs.send('service_5qtpqp9', 'template_gsbdv7t', params)
        .then(() => {
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Order Request';
          showMsg(msgEl, 'success', '✅ Order submitted successfully! We will call you personally to confirm.');
          form.reset();
          document.querySelectorAll('#variantPicker .sp-row').forEach(r => r.classList.remove('sp-row-active'));
        })
        .catch((err) => {
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Order Request';
          showMsg(msgEl, 'error', '❌ Failed to send. Please call us directly at +977 9857039041');
          console.error('EmailJS error:', err);
        });
    });
  })();

  /* ORDER FORM — PLASTIC MATTE */
  (function () {
    const form = document.getElementById('matteOrderForm');
    const msgEl = document.getElementById('matteMsg');
    const btn = document.getElementById('matteSubmitBtn');
    if (!form) return;

    // Highlight row when checkbox toggled
    document.querySelectorAll('#stylePicker .sp-check').forEach(cb => {
      cb.addEventListener('change', () => {
        cb.closest('.sp-row').classList.toggle('sp-row-active', cb.checked);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const d = new FormData(form);
      const business  = d.get('business_name');
      const person    = d.get('contact_person');
      const phone     = d.get('phone');
      const location  = d.get('location');

      if (!business || !person || !phone || !location) {
        showMsg(msgEl, 'error', '⚠ Please fill all required fields marked with *');
        return;
      }

      // Collect checked styles
      const rows = document.querySelectorAll('#stylePicker .sp-row');
      const selectedStyles = [];
      rows.forEach(row => {
        const cb  = row.querySelector('.sp-check');
        const qty = row.querySelector('.sp-qty');
        const sz  = row.querySelector('.sp-size');
        if (cb.checked) {
          const qtyVal = qty.value.trim();
          if (!qtyVal) {
            qty.style.borderColor = '#e53935';
            qty.focus();
          } else {
            qty.style.borderColor = '';
            selectedStyles.push(`${cb.value} | Size: ${sz.value} | Qty: ${qtyVal} pcs`);
          }
        }
      });

      if (selectedStyles.length === 0) {
        document.getElementById('stylePickerError').style.display = 'block';
        return;
      }
      document.getElementById('stylePickerError').style.display = 'none';

      // Check all checked rows have qty filled
      const missingQty = [...document.querySelectorAll('#stylePicker .sp-check:checked')].some(cb => {
        const qty = cb.closest('.sp-row').querySelector('.sp-qty');
        return !qty.value.trim();
      });
      if (missingQty) {
        showMsg(msgEl, 'error', '⚠ Please enter quantity for all selected styles.');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

      const orderSummary = selectedStyles.join('\n');

      const params = {
        business_name:  business,
        contact_person: person,
        phone:          phone,
        email:          d.get('email') || 'Not provided',
        style:          orderSummary,
        size:           '(per style above)',
        quantity:       `${selectedStyles.length} style(s) — see details above`,
        color:          d.get('color') || 'Not specified',
        location:       location,
        message:        d.get('message') || 'None',
      };

      emailjs.send('service_5qtpqp9', 'template_lnhmy4s', params)
        .then(() => {
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Order Request';
          showMsg(msgEl, 'success', '✅ Order submitted successfully! We will call you personally to confirm.');
          form.reset();
          document.querySelectorAll('#stylePicker .sp-row').forEach(r => r.classList.remove('sp-row-active'));
        })
        .catch((err) => {
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Order Request';
          showMsg(msgEl, 'error', '❌ Failed to send. Please call us directly at +977 9857039041');
          console.error('EmailJS error:', err);
        });
    });
  })();
});

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

/* =============================================
   TRINETRA PLASTIC UDHYOG — script.js
   All interactions, animations, 3D effects
   ============================================= */

   'use strict';



  (function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;
  
    document.body.style.overflow = 'hidden';
  
    // Hide preloader after all animations finish
    // Last animation: tagline at 4.8s + 0.55s = 5.35s
    setTimeout(() => {
      preloader.classList.add('done');
      document.body.style.overflow = '';
      initRevealObserver();
      initCounters();
    }, 3200);
  })();
   
   /* ══════════════════════════════════════════════
      2. NAVBAR — scroll state + active link + mobile
      ══════════════════════════════════════════════ */
   (function initNavbar() {
     const navbar = document.getElementById('navbar');
     const hamburger = document.getElementById('hamburger');
     const navLinks = document.getElementById('navLinks');
     const links = document.querySelectorAll('.nav-link');
   
     // Scroll state
     window.addEventListener('scroll', () => {
       navbar.classList.toggle('scrolled', window.scrollY > 30);
       updateActiveLink();
       toggleScrollTopBtn();
     }, { passive: true });
   
     // Mobile menu
     hamburger.addEventListener('click', () => {
       hamburger.classList.toggle('open');
       navLinks.classList.toggle('open');
     });
   
     // Close on link click
     links.forEach(link => {
       link.addEventListener('click', () => {
         hamburger.classList.remove('open');
         navLinks.classList.remove('open');
       });
     });
   
     // Active link based on scroll position
     function updateActiveLink() {
       const sections = document.querySelectorAll('section[id]');
       let current = '';
       sections.forEach(sec => {
         const top = sec.offsetTop - 100;
         if (window.scrollY >= top) current = sec.getAttribute('id');
       });
       links.forEach(link => {
         link.classList.remove('active');
         if (link.getAttribute('href') === '#' + current) link.classList.add('active');
       });
     }
   
     updateActiveLink();
   })();
   
   
   /* ══════════════════════════════════════════════
      3. SCROLL-TO-TOP BUTTON
      ══════════════════════════════════════════════ */
   const scrollTopBtn = document.getElementById('scrollTopBtn');
   
   function toggleScrollTopBtn() {
     if (!scrollTopBtn) return;
     scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
   }
   
   if (scrollTopBtn) {
     scrollTopBtn.addEventListener('click', () => {
       window.scrollTo({ top: 0, behavior: 'smooth' });
     });
   }
   
   
   /* ══════════════════════════════════════════════
      4. SCROLL REVEAL OBSERVER
      ══════════════════════════════════════════════ */
   function initRevealObserver() {
     const els = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
     if (!els.length) return;
   
     const observer = new IntersectionObserver((entries) => {
       entries.forEach((entry, i) => {
         if (entry.isIntersecting) {
           // Stagger siblings inside same parent
           const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal-up, .reveal-left, .reveal-right'));
           const idx = siblings.indexOf(entry.target);
           setTimeout(() => {
             entry.target.classList.add('revealed');
           }, idx * 100);
           observer.unobserve(entry.target);
         }
       });
     }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
   
     els.forEach(el => observer.observe(el));
   }
   
   
   /* ══════════════════════════════════════════════
      5. ANIMATED COUNTERS
      ══════════════════════════════════════════════ */
   function initCounters() {
     const counters = document.querySelectorAll('.counter');
     if (!counters.length) return;
   
     const observer = new IntersectionObserver((entries) => {
       entries.forEach(entry => {
         if (entry.isIntersecting) {
           const el = entry.target;
           const target = parseInt(el.dataset.target, 10);
           const duration = 1800;
           const start = performance.now();
   
           function update(now) {
             const elapsed = now - start;
             const progress = Math.min(elapsed / duration, 1);
             // Ease out cubic
             const eased = 1 - Math.pow(1 - progress, 3);
             el.textContent = Math.floor(eased * target);
             if (progress < 1) requestAnimationFrame(update);
             else el.textContent = target;
           }
   
           requestAnimationFrame(update);
           observer.unobserve(el);
         }
       });
     }, { threshold: 0.5 });
   
     counters.forEach(c => observer.observe(c));
   }
   
   
   /* ══════════════════════════════════════════════
      6. PARTICLE CANVAS (Hero Background)
      ══════════════════════════════════════════════ */
   (function initParticles() {
     const canvas = document.getElementById('particleCanvas');
     if (!canvas) return;
   
     const ctx = canvas.getContext('2d');
     let particles = [];
     let animId;
     let W, H;
   
     function resize() {
       W = canvas.width = canvas.offsetWidth;
       H = canvas.height = canvas.offsetHeight;
     }
   
     window.addEventListener('resize', resize, { passive: true });
     resize();
   
     function createParticle() {
       return {
         x: Math.random() * W,
         y: Math.random() * H,
         r: Math.random() * 2.5 + 0.5,
         opacity: Math.random() * 0.5 + 0.1,
         vx: (Math.random() - 0.5) * 0.3,
         vy: -Math.random() * 0.4 - 0.1,
         life: 0,
         maxLife: Math.random() * 300 + 200
       };
     }
   
     for (let i = 0; i < 80; i++) particles.push(createParticle());
   
     function draw() {
       ctx.clearRect(0, 0, W, H);
       particles.forEach((p, i) => {
         p.x += p.vx;
         p.y += p.vy;
         p.life++;
   
         const lifeFrac = p.life / p.maxLife;
         const alpha = lifeFrac < 0.1
           ? (lifeFrac / 0.1) * p.opacity
           : lifeFrac > 0.8
             ? ((1 - lifeFrac) / 0.2) * p.opacity
             : p.opacity;
   
         ctx.beginPath();
         ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
         ctx.fillStyle = `rgba(76,175,80,${alpha})`;
         ctx.fill();
   
         if (p.life >= p.maxLife || p.y < -10 || p.x < -10 || p.x > W + 10) {
           particles[i] = createParticle();
           particles[i].y = H + 5;
         }
       });
   
       // Draw faint connection lines
       for (let a = 0; a < particles.length; a++) {
         for (let b = a + 1; b < particles.length; b++) {
           const dx = particles[a].x - particles[b].x;
           const dy = particles[a].y - particles[b].y;
           const dist = Math.sqrt(dx * dx + dy * dy);
           if (dist < 80) {
             ctx.beginPath();
             ctx.moveTo(particles[a].x, particles[a].y);
             ctx.lineTo(particles[b].x, particles[b].y);
             ctx.strokeStyle = `rgba(45,122,58,${(1 - dist / 80) * 0.12})`;
             ctx.lineWidth = 0.5;
             ctx.stroke();
           }
         }
       }
   
       animId = requestAnimationFrame(draw);
     }
   
     draw();
   })();
   
   
   /* ══════════════════════════════════════════════
      7. MOUSE PARALLAX on Hero Logo Scene
      ══════════════════════════════════════════════ */
   (function initLogoParallax() {
     const scene = document.querySelector('.logo-3d-scene');
     const logoFloat = document.querySelector('.logo-float');
     if (!scene || !logoFloat) return;
   
     let targetX = 0, targetY = 0;
     let currentX = 0, currentY = 0;
   
     document.addEventListener('mousemove', (e) => {
       const cx = window.innerWidth / 2;
       const cy = window.innerHeight / 2;
       targetX = (e.clientX - cx) / cx;
       targetY = (e.clientY - cy) / cy;
     }, { passive: true });
   
     function animate() {
       currentX += (targetX - currentX) * 0.05;
       currentY += (targetY - currentY) * 0.05;
   
       if (scene) {
         scene.style.transform = `
           rotateY(${currentX * 12}deg)
           rotateX(${-currentY * 8}deg)
         `;
       }
       requestAnimationFrame(animate);
     }
   
     animate();
   })();
   
   
   /* ══════════════════════════════════════════════
      8. 3D TILT CARDS
      ══════════════════════════════════════════════ */
   (function initTiltCards() {
     const cards = document.querySelectorAll('.tilt-card');
     if (!cards.length) return;
   
     cards.forEach(card => {
       card.addEventListener('mousemove', (e) => {
         const rect = card.getBoundingClientRect();
         const cx = rect.left + rect.width / 2;
         const cy = rect.top + rect.height / 2;
         const dx = (e.clientX - cx) / (rect.width / 2);
         const dy = (e.clientY - cy) / (rect.height / 2);
   
         card.style.transform = `
           perspective(800px)
           rotateX(${-dy * 8}deg)
           rotateY(${dx * 8}deg)
           translateZ(10px)
           translateY(-6px)
         `;
         card.style.boxShadow = `
           ${-dx * 15}px ${-dy * 15}px 40px rgba(26,77,46,0.2),
           0 30px 60px rgba(26,77,46,0.12)
         `;
   
         // Move glow with mouse
         const glow = card.querySelector('.pc-glow');
         if (glow) {
           const x = ((e.clientX - rect.left) / rect.width) * 100;
           const y = ((e.clientY - rect.top) / rect.height) * 100;
           glow.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(76,175,80,0.22) 0%, transparent 65%)`;
         }
       });
   
       card.addEventListener('mouseleave', () => {
         card.style.transform = '';
         card.style.boxShadow = '';
         const glow = card.querySelector('.pc-glow');
         if (glow) glow.style.background = '';
       });
     });
   })();
   
   
   /* ══════════════════════════════════════════════
      9. 3D PHONE VIDEO — Play Gate
      ══════════════════════════════════════════════ */
   (function initPhoneVideo() {
     const playBtn = document.getElementById('playBtn3d');
     const playGate = document.getElementById('playGate');
     const video = document.getElementById('processVideo');
     if (!playBtn || !playGate || !video) return;
   
     playBtn.addEventListener('click', () => {
  video.style.display = 'block';
  playGate.style.opacity = '0';
  playGate.style.pointerEvents = 'none';
  setTimeout(() => { playGate.style.display = 'none'; }, 400);
});
   })();
   
   
   /* ══════════════════════════════════════════════
      10. ABOUT CYCLE — Animated Progress Ring
      ══════════════════════════════════════════════ */
   (function initCycleRing() {
     const progress = document.getElementById('cycleProgress');
     if (!progress) return;
   
     const observer = new IntersectionObserver((entries) => {
       entries.forEach(entry => {
         if (entry.isIntersecting) {
           progress.style.strokeDasharray = '816 0';
           observer.unobserve(entry.target);
         }
       });
     }, { threshold: 0.5 });
   
     observer.observe(progress);
   })();
   
   
   /* ══════════════════════════════════════════════
      11. CYCLE ITEMS — Rotating animation
      ══════════════════════════════════════════════ */
   (function initCycleItemsAnimation() {
     const items = document.querySelectorAll('.cycle-item');
     if (!items.length) return;
   
     items.forEach((item, i) => {
       item.style.animation = `none`;
       item.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
     });
   
     // Pulse each icon in sequence
     let current = 0;
     setInterval(() => {
       items.forEach(item => item.querySelector('.ci-icon').style.transform = '');
       const icon = items[current].querySelector('.ci-icon');
       if (icon) {
         icon.style.transform = 'scale(1.2)';
         icon.style.boxShadow = '0 0 30px rgba(76,175,80,0.6)';
         setTimeout(() => {
           icon.style.transform = '';
           icon.style.boxShadow = '';
         }, 600);
       }
       current = (current + 1) % items.length;
     }, 1500);
   })();
   
   
   /* ══════════════════════════════════════════════
      12. ORDER FORM — EmailJS / Mailto Fallback
      ══════════════════════════════════════════════ */
   (function initOrderForm() {
     const form = document.getElementById('orderForm');
     const msgEl = document.getElementById('orderMsg');
     const submitBtn = document.getElementById('orderSubmitBtn');
     if (!form) return;
   
     form.addEventListener('submit', (e) => {
       e.preventDefault();
   
       const data = new FormData(form);
       const business = data.get('business_name') || '';
       const person = data.get('contact_person') || '';
       const phone = data.get('phone') || '';
       const email = data.get('email') || '';
       const product = data.get('product') || '';
       const quantity = data.get('quantity') || '';
       const location = data.get('location') || '';
       const message = data.get('message') || '';
   
       // Basic validation
       if (!business || !person || !phone || !product || !quantity || !location) {
         showMsg(msgEl, 'error', '⚠ Please fill all required fields marked with *');
         return;
       }
   
       if (!/^[0-9]{7,15}$/.test(phone.replace(/[\s\-\+]/g, ''))) {
         showMsg(msgEl, 'error', '⚠ Please enter a valid phone number.');
         return;
       }
   
       // Loading state
       submitBtn.disabled = true;
       submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
   
       // Build mailto body
       const body = `ORDER REQUEST — Trinetra Plastic Udhyog
   
   Business Name: ${business}
   Contact Person: ${person}
   Phone: ${phone}
   Email: ${email || 'Not provided'}
   
   Product Required: ${product}
   Quantity: ${quantity}
   Delivery Location: ${location}
   
   Additional Notes:
   ${message || 'None'}
   
   ---
   Sent via Trinetra Plastic Udhyog Website`;
   
       const mailtoLink = `mailto:info.trinetraplastic@gmail.com`
         + `?subject=${encodeURIComponent('Order Request - ' + business)}`
         + `&body=${encodeURIComponent(body)}`;
   
       // Open mail client
       window.location.href = mailtoLink;
   
       setTimeout(() => {
         submitBtn.disabled = false;
         submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Order Request';
         showMsg(msgEl, 'success', '✅ Your email client has opened! Please send the email to complete your order. We\'ll call you to confirm.');
         form.reset();
       }, 1000);
     });
   })();
   
   
   /* ══════════════════════════════════════════════
      13. CONTACT FORM
      ══════════════════════════════════════════════ */
   (function initContactForm() {
     const form = document.getElementById('contactForm');
     const msgEl = document.getElementById('contactMsg');
     if (!form) return;
   
     form.addEventListener('submit', (e) => {
       e.preventDefault();
   
       const data = new FormData(form);
       const name = data.get('name') || '';
       const contact = data.get('contact') || '';
       const message = data.get('message') || '';
   
       if (!name || !contact || !message) {
         showMsg(msgEl, 'error', '⚠ Please fill all required fields.');
         return;
       }
   
       const body = `Message from: ${name}
   Contact: ${contact}
   
   Message:
   ${message}
   
   ---
   Sent via Trinetra Plastic Udhyog Website`;
   
       const mailtoLink = `mailto:info.trinetraplastic@gmail.com`
         + `?subject=${encodeURIComponent('Contact Message from ' + name)}`
         + `&body=${encodeURIComponent(body)}`;
   
       window.location.href = mailtoLink;
   
       setTimeout(() => {
         showMsg(msgEl, 'success', '✅ Your email client has opened! Please send the message. We\'ll get back to you soon.');
         form.reset();
       }, 800);
     });
   })();
   
   
   /* ══════════════════════════════════════════════
      HELPER: Show form message
      ══════════════════════════════════════════════ */
   function showMsg(el, type, text) {
     if (!el) return;
     el.className = 'form-msg ' + type;
     el.textContent = text;
     el.style.display = 'block';
     setTimeout(() => {
       el.style.display = 'none';
       el.className = 'form-msg';
     }, 7000);
   }
   
   
   /* ══════════════════════════════════════════════
      14. FOOTER YEAR
      ══════════════════════════════════════════════ */
   const yearEl = document.getElementById('year');
   if (yearEl) yearEl.textContent = new Date().getFullYear();
   
   
   /* ══════════════════════════════════════════════
      15. SMOOTH ANCHOR SCROLL (offset for fixed nav)
      ══════════════════════════════════════════════ */
   document.querySelectorAll('a[href^="#"]').forEach(anchor => {
     anchor.addEventListener('click', (e) => {
       const href = anchor.getAttribute('href');
       if (href === '#') return;
       const target = document.querySelector(href);
       if (!target) return;
       e.preventDefault();
   
       const navH = document.getElementById('navbar')?.offsetHeight || 80;
       const top = target.getBoundingClientRect().top + window.scrollY - navH;
       window.scrollTo({ top, behavior: 'smooth' });
     });
   });
   
   
   /* ══════════════════════════════════════════════
      16. HERO SCROLL INDICATOR — auto-hide
      ══════════════════════════════════════════════ */
   (function initScrollIndicator() {
     const indicator = document.querySelector('.scroll-indicator');
     if (!indicator) return;
   
     window.addEventListener('scroll', () => {
       indicator.style.opacity = window.scrollY > 100 ? '0' : '1';
     }, { passive: true });
   })();
   
   
   /* ══════════════════════════════════════════════
      17. WHATSAPP FLOAT — entrance animation
      ══════════════════════════════════════════════ */
   (function initWAFloat() {
     const wa = document.querySelector('.wa-float');
     if (!wa) return;
   
     // Show after 2 seconds
     wa.style.opacity = '0';
     wa.style.transform = 'scale(0.5) translateY(20px)';
     wa.style.transition = 'all 0.5s cubic-bezier(0.23,1,0.32,1)';
   
     setTimeout(() => {
       wa.style.opacity = '1';
       wa.style.transform = 'scale(1) translateY(0)';
     }, 2000);
   })();
   
   
   /* ══════════════════════════════════════════════
      18. PRODUCT CARDS — 3D hover glow follow
      ══════════════════════════════════════════════ */
   (function initProductGlow() {
     const cards = document.querySelectorAll('.product-card');
     cards.forEach(card => {
       card.addEventListener('mousemove', (e) => {
         const rect = card.getBoundingClientRect();
         const x = ((e.clientX - rect.left) / rect.width) * 100;
         const y = ((e.clientY - rect.top) / rect.height) * 100;
         card.style.setProperty('--gx', x + '%');
         card.style.setProperty('--gy', y + '%');
       });
     });
   })();
   
   
   /* ══════════════════════════════════════════════
      19. TEAM CARDS — entrance sequenced reveal
      ══════════════════════════════════════════════ */
   (function initTeamCards() {
     const cards = document.querySelectorAll('.team-card');
     if (!cards.length) return;
   
     const observer = new IntersectionObserver((entries) => {
       entries.forEach((entry) => {
         if (entry.isIntersecting) {
           const cards = entry.target.parentElement.querySelectorAll('.team-card');
           cards.forEach((card, i) => {
             setTimeout(() => {
               card.style.opacity = '1';
               card.style.transform = 'translateY(0)';
             }, i * 150);
           });
           observer.unobserve(entry.target);
         }
       });
     }, { threshold: 0.2 });
   
     cards.forEach(card => {
       card.style.opacity = '0';
       card.style.transform = 'translateY(30px)';
       card.style.transition = 'all 0.7s cubic-bezier(0.23,1,0.32,1)';
       observer.observe(card);
     });
   })();
   
   
   /* ══════════════════════════════════════════════
      20. 3D FLOATING PHONE — enhanced tilt on hover
      ══════════════════════════════════════════════ */
   (function initPhoneTilt() {
     const phoneScene = document.querySelector('.phone-scene');
     if (!phoneScene) return;
   
     phoneScene.addEventListener('mousemove', (e) => {
       const rect = phoneScene.getBoundingClientRect();
       const cx = rect.left + rect.width / 2;
       const cy = rect.top + rect.height / 2;
       const dx = (e.clientX - cx) / (rect.width / 2);
       const dy = (e.clientY - cy) / (rect.height / 2);
   
       phoneScene.style.animation = 'none';
       phoneScene.style.transform = `
         translateY(${-dy * 15}px)
         rotateY(${dx * 15}deg)
         rotateX(${-dy * 8}deg)
       `;
     });
   
     phoneScene.addEventListener('mouseleave', () => {
       phoneScene.style.animation = '';
       phoneScene.style.transform = '';
     });
   })();
   
   
   /* ══════════════════════════════════════════════
      21. STAT CHIPS — number pop on hover
      ══════════════════════════════════════════════ */
   (function initStatChips() {
     const chips = document.querySelectorAll('.stat-chip');
     chips.forEach(chip => {
       chip.addEventListener('mouseenter', () => {
         const strong = chip.querySelector('strong');
         if (strong) {
           strong.style.transform = 'scale(1.15)';
           strong.style.transition = 'transform 0.3s ease';
           strong.style.display = 'block';
         }
       });
       chip.addEventListener('mouseleave', () => {
         const strong = chip.querySelector('strong');
         if (strong) strong.style.transform = '';
       });
     });
   })();
   
   
   /* ══════════════════════════════════════════════
      22. SECTION TAG — slide-in on view
      ══════════════════════════════════════════════ */
   (function initSectionTags() {
     const tags = document.querySelectorAll('.section-tag');
     tags.forEach(tag => {
       tag.style.opacity = '0';
       tag.style.transform = 'translateX(-20px)';
       tag.style.transition = 'all 0.6s ease 0.1s';
     });
   
     const observer = new IntersectionObserver((entries) => {
       entries.forEach(entry => {
         if (entry.isIntersecting) {
           entry.target.style.opacity = '1';
           entry.target.style.transform = 'translateX(0)';
           observer.unobserve(entry.target);
         }
       });
     }, { threshold: 0.5 });
   
     tags.forEach(tag => observer.observe(tag));
   })();
   
   
   /* ══════════════════════════════════════════════
      23. FOOTER LINKS — staggered reveal
      ══════════════════════════════════════════════ */
   (function initFooterReveal() {
     const footer = document.querySelector('.footer');
     if (!footer) return;
   
     const cols = footer.querySelectorAll('.footer-col');
     cols.forEach((col, i) => {
       col.style.opacity = '0';
       col.style.transform = 'translateY(20px)';
       col.style.transition = `all 0.6s ease ${i * 0.12}s`;
     });
   
     const observer = new IntersectionObserver((entries) => {
       entries.forEach(entry => {
         if (entry.isIntersecting) {
           cols.forEach(col => {
             col.style.opacity = '1';
             col.style.transform = 'translateY(0)';
           });
           observer.unobserve(entry.target);
         }
       });
     }, { threshold: 0.1 });
   
     observer.observe(footer);
   })();
   
   
   /* ══════════════════════════════════════════════
      24. HERO TITLE — letter-by-letter reveal
      ══════════════════════════════════════════════ */
   (function initHeroTypeReveal() {
     const badge = document.querySelector('.hero-badge');
     if (!badge) return;
   
     // Just add a shimmer pulse to hero badge
     badge.style.animation = 'badgeShimmer 3s ease-in-out infinite 2s';
   
     const style = document.createElement('style');
     style.textContent = `
       @keyframes badgeShimmer {
         0%, 100% { box-shadow: 0 0 0 0 rgba(45,122,58,0); }
         50% { box-shadow: 0 0 20px 4px rgba(45,122,58,0.25); }
       }
       @keyframes heroLineReveal {
         from { opacity: 0; transform: translateY(20px); }
         to { opacity: 1; transform: translateY(0); }
       }
     `;
     document.head.appendChild(style);
   })();
   
   
   /* ══════════════════════════════════════════════
      25. MOBILE: Prevent body scroll when menu open
      ══════════════════════════════════════════════ */
   (function initMobileMenuLock() {
     const hamburger = document.getElementById('hamburger');
     if (!hamburger) return;
   
     const observer = new MutationObserver(() => {
       const isOpen = hamburger.classList.contains('open');
       document.body.style.overflow = isOpen ? 'hidden' : '';
     });
   
     observer.observe(hamburger, { attributes: true, attributeFilter: ['class'] });
   })();
   
   
   /* ══════════════════════════════════════════════
      26. VALUE CARDS — rotate icon on hover
      ══════════════════════════════════════════════ */
   (function initValueCardIcons() {
     const cards = document.querySelectorAll('.value-card');
     cards.forEach(card => {
       const icon = card.querySelector('i');
       if (!icon) return;
       card.addEventListener('mouseenter', () => {
         icon.style.transform = 'rotateY(360deg)';
         icon.style.transition = 'transform 0.6s ease';
       });
       card.addEventListener('mouseleave', () => {
         icon.style.transform = '';
       });
     });
   })();
   
   
   /* ══════════════════════════════════════════════
      27. OS STEPS — highlight on scroll
      ══════════════════════════════════════════════ */
   (function initOrderSteps() {
     const steps = document.querySelectorAll('.os-item');
     if (!steps.length) return;
   
     steps.forEach((step, i) => {
       step.style.opacity = '0';
       step.style.transform = 'translateX(-20px)';
       step.style.transition = `all 0.5s ease ${i * 0.15}s`;
     });
   
     const observer = new IntersectionObserver((entries) => {
       entries.forEach(entry => {
         if (entry.isIntersecting) {
           steps.forEach(step => {
             step.style.opacity = '1';
             step.style.transform = 'translateX(0)';
           });
           observer.unobserve(entry.target);
         }
       });
     }, { threshold: 0.3 });
   
     if (steps[0]) observer.observe(steps[0]);
   })();
   
   
   /* ══════════════════════════════════════════════
      28. PERFORMANCE: Pause particle canvas
          when hero not visible
      ══════════════════════════════════════════════ */
   (function initCanvasPause() {
     const hero = document.getElementById('home');
     const canvas = document.getElementById('particleCanvas');
     if (!hero || !canvas) return;
   
     const observer = new IntersectionObserver((entries) => {
       entries.forEach(entry => {
         canvas.style.opacity = entry.isIntersecting ? '1' : '0';
       });
     }, { threshold: 0 });
   
     observer.observe(hero);
   })();
   
   
   /* ══════════════════════════════════════════════
      29. LOCATION MAP — lazy load iframe
      ══════════════════════════════════════════════ */
   (function initLazyMap() {
     const mapFrame = document.querySelector('.map-frame iframe');
     if (!mapFrame) return;
   
     // Store src and remove until visible
     const src = mapFrame.getAttribute('src');
     mapFrame.removeAttribute('src');
   
     const observer = new IntersectionObserver((entries) => {
       entries.forEach(entry => {
         if (entry.isIntersecting) {
           mapFrame.setAttribute('src', src);
           observer.unobserve(mapFrame);
         }
       });
     }, { threshold: 0.1 });
   
     observer.observe(mapFrame);
   })();
   
   
   /* ══════════════════════════════════════════════
      30. LOGO FLOAT — Enhanced 3D on Hero
      ══════════════════════════════════════════════ */
   (function initLogoFloat3DEnhanced() {
     const logoWrap = document.querySelector('.logo-float');
     if (!logoWrap) return;
   
     // Add shimmer layer
     const shimmer = document.createElement('div');
     shimmer.style.cssText = `
       position: absolute;
       inset: 0;
       border-radius: 24px;
       background: linear-gradient(
         135deg,
         rgba(255,255,255,0) 0%,
         rgba(255,255,255,0.15) 50%,
         rgba(255,255,255,0) 100%
       );
       background-size: 200% 200%;
       animation: logoShimmer 4s ease-in-out infinite;
       pointer-events: none;
       z-index: 6;
     `;
     logoWrap.appendChild(shimmer);
   
     const shimmerStyle = document.createElement('style');
     shimmerStyle.textContent = `
       @keyframes logoShimmer {
         0% { background-position: 200% 200%; }
         50% { background-position: 0% 0%; }
         100% { background-position: 200% 200%; }
       }
     `;
     document.head.appendChild(shimmerStyle);
   })();
   
   /* ══════════════════════════════════════════════
      INIT COMPLETE — Log
      ══════════════════════════════════════════════ */
   console.log('%cTrinetra Plastic Udhyog 🌿', 'color:#2d7a3a;font-size:18px;font-weight:700;');
   console.log('%cRecycling Today for a Better Tomorrow', 'color:#4caf50;font-size:12px;');

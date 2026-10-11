// Script Interaktivitas Portofolio & Interactive Canvas Background
// Inspirasi: LamonganDev (https://www.lamongandev.com/)

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Drawer Toggle
  const toggleBtn = document.getElementById('mobile-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-item, .btn-mobile-cta');

  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', !isExpanded);
      drawer.classList.toggle('open');
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 2. Active Link Highlighter on Scroll
  const sections = document.querySelectorAll('section[id], div[id="education"]');
  const navLinks = document.querySelectorAll('.nav-item');

  window.addEventListener('scroll', () => {
    const scrollPos = window.pageYOffset + 120;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  });

  // 3. Scroll Reveal Animation (Intersection Observer)
  initScrollReveal();

  // 4. Interactive Constellation Canvas (Ported & Optimized from LamonganDev)
  initHeroCanvas();
});

function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  if (!revealElements.length) return;

  if (!('IntersectionObserver' in window)) {
    // Fallback jika browser lawas
    revealElements.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        // Unobserve setelah muncul agar animasi tidak berulang mengganggu
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const parent = canvas.parentElement;
  if (!parent) return;

  let width = 0;
  let height = 0;
  let animFrameId = null;

  // Palet partikel khas LamonganDev: Sky Blue & Emerald Green
  const colors = [
    { r: 46, g: 180, b: 231 },   // #2eb4e7
    { r: 27, g: 153, b: 213 },   // #1b99d5
    { r: 135, g: 195, b: 71 },   // #87c347
    { r: 103, g: 167, b: 92 }    // #67a75c
  ];

  const solidColors = colors.map(c => `rgba(${c.r}, ${c.g}, ${c.b}, 0.85)`);
  const haloColors = colors.map(c => `rgba(${c.r}, ${c.g}, ${c.b}, 0.18)`);

  const mouse = {
    x: null,
    y: null,
    targetX: null,
    targetY: null,
    radius: 160,
    radiusSq: 25600,
    isActive: false
  };

  let particles = [];

  const getParticleCount = (w, h) => {
    const area = w * h;
    return Math.min(55, Math.max(22, Math.floor(area / 20000)));
  };

  const createParticle = () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.25 + Math.random() * 0.4;
    const baseRadius = 1.4 + Math.random() * 1.8;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      baseVx: Math.cos(angle) * speed,
      baseVy: Math.sin(angle) * speed,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: baseRadius,
      baseRadius: baseRadius,
      colorIdx: Math.floor(Math.random() * colors.length),
      pulseSpeed: 0.02 + Math.random() * 0.02,
      pulseOffset: Math.random() * Math.PI * 2
    };
  };

  const resize = () => {
    const rect = parent.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const count = getParticleCount(width, height);
    if (particles.length === 0) {
      for (let i = 0; i < count; i++) {
        particles.push(createParticle());
      }
    } else {
      particles.forEach(p => {
        if (p.x > width) p.x = Math.random() * width;
        if (p.y > height) p.y = Math.random() * height;
      });
      while (particles.length < count) particles.push(createParticle());
      if (particles.length > count) particles.length = count;
    }
  };

  window.addEventListener('resize', resize);
  resize();

  // Mouse / Touch Event Listeners
  const onMouseMove = (e) => {
    const rect = parent.getBoundingClientRect();
    mouse.targetX = e.clientX - rect.left;
    mouse.targetY = e.clientY - rect.top;
    mouse.isActive = true;
  };

  const onMouseLeave = () => {
    mouse.isActive = false;
    mouse.targetX = null;
    mouse.targetY = null;
  };

  parent.addEventListener('mousemove', onMouseMove, { passive: true });
  parent.addEventListener('mouseleave', onMouseLeave, { passive: true });

  const maxDist = 120;
  const maxDistSq = maxDist * maxDist;
  let tick = 0;

  const render = () => {
    if (width > 0 && height > 0) {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse coordinate tracking
      if (mouse.isActive && mouse.targetX !== null) {
        if (mouse.x === null) {
          mouse.x = mouse.targetX;
          mouse.y = mouse.targetY;
        } else {
          mouse.x += (mouse.targetX - mouse.x) * 0.2;
          mouse.y += (mouse.targetY - mouse.y) * 0.2;
        }
      } else {
        mouse.x = null;
        mouse.y = null;
      }

      tick += 1;
      const count = particles.length;

      // Update Partikel
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        const pulse = Math.sin(tick * p.pulseSpeed + p.pulseOffset);
        p.radius = Math.max(1, p.baseRadius + pulse * 0.35);

        // Interaksi gravitasi pointer
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < mouse.radiusSq && distSq > 0.5) {
            const dist = Math.sqrt(distSq);
            const force = (mouse.radius - dist) / mouse.radius;
            const invDist = 1 / dist;
            p.vx += dx * invDist * force * 0.4;
            p.vy += dy * invDist * force * 0.4;
          }
        }

        p.vx = p.vx * 0.95 + p.baseVx * 0.05;
        p.vy = p.vy * 0.95 + p.baseVy * 0.05;
        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
      }

      // Draw connection lines between nearby particles
      for (let i = 0; i < count; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < count; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistSq) {
            const alpha = (1 - Math.sqrt(distSq) / maxDist) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(46, 180, 231, ${alpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }

        // Connect to mouse pointer
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p1.x - mouse.x;
          const dy = p1.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < mouse.radiusSq) {
            const alpha = (1 - Math.sqrt(distSq) / mouse.radius) * 0.35;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(135, 195, 71, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw particle halo & core
      for (let i = 0; i < count; i++) {
        const p = particles[i];

        // Outer halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = haloColors[p.colorIdx];
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = solidColors[p.colorIdx];
        ctx.fill();
      }
    }

    animFrameId = requestAnimationFrame(render);
  };

  animFrameId = requestAnimationFrame(render);
}

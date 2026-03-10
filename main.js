// ── Nav scroll effect ─────────────────────────────────────────────
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// ── Mobile menu toggle ────────────────────────────────────────────
const toggle = document.querySelector('.nav-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

if (toggle && mobileMenu) {
  toggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      toggle.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ── Scroll reveal ─────────────────────────────────────────────────
const revealElements = () => {
  const candidates = document.querySelectorAll(
    '.section-header, .project-card, .service-item, .about-inner > *, .testimonial, .contact-inner > *, .hero-content > *'
  );

  candidates.forEach((el, i) => {
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
      // stagger siblings inside the same parent
      const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
      const idx = siblings.indexOf(el);
      if (idx === 1) el.classList.add('reveal-delay-1');
      if (idx === 2) el.classList.add('reveal-delay-2');
      if (idx === 3) el.classList.add('reveal-delay-3');
    }
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
};

// Run after fonts / DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', revealElements);
} else {
  revealElements();
}

// ── Microsoft Journey Story Viewer ────────────────────────────────
const STORY_DATA = [
  {
    year: '2018', num: '01',
    title: 'The Beginning',
    desc: 'Joined Microsoft as a Product Designer. Shipped first features to 200M+ users — and fell in love with designing at scale.',
    gradient: 'linear-gradient(160deg, #0a0520 0%, #200a50 55%, #0e0a30 100%)',
    accent: '#a78bfa',
  },
  {
    year: '2019', num: '02',
    title: 'Human Connection',
    desc: 'Redesigned core collaboration flows in Microsoft Teams — just as remote work became the world\'s new normal.',
    gradient: 'linear-gradient(160deg, #0f0a35 0%, #1e1060 55%, #0a1040 100%)',
    accent: '#818cf8',
  },
  {
    year: '2020', num: '03',
    title: 'Work, Redefined',
    desc: 'Shaped the Office experience for the WFH era. The world changed overnight — and so did how we design for it.',
    gradient: 'linear-gradient(160deg, #061830 0%, #0a2a5a 55%, #061828 100%)',
    accent: '#60a5fa',
  },
  {
    year: '2021', num: '04',
    title: 'One Design Language',
    desc: 'Led M365 Design System work — creating a unified visual and interaction language across the entire product suite.',
    gradient: 'linear-gradient(160deg, #041820 0%, #063040 55%, #041820 100%)',
    accent: '#34d399',
  },
  {
    year: '2022', num: '05',
    title: 'A Billion Touchpoints',
    desc: 'Scaled design thinking to M365 Platform features. Every pixel decision touched over a billion people worldwide.',
    gradient: 'linear-gradient(160deg, #060a20 0%, #0a1850 55%, #060818 100%)',
    accent: '#38bdf8',
  },
  {
    year: '2023', num: '06',
    title: 'The AI Revolution',
    desc: 'Part of the core team that launched Microsoft Copilot — the most significant product shift of a generation.',
    gradient: 'linear-gradient(160deg, #180830 0%, #3a0a60 55%, #160830 100%)',
    accent: '#e879f9',
  },
  {
    year: '2024–25', num: '07',
    title: 'Intelligence, Native',
    desc: 'Designing Copilot Mobile onboarding, the AI Previewer & Proactive Assistance — making AI feel like it was always there.',
    gradient: 'linear-gradient(160deg, #100830 0%, #2a0a60 45%, #0e1050 100%)',
    accent: '#a78bfa',
  },
];

class StoryViewer {
  constructor(data) {
    this.data    = data;
    this.current = 0;
    this.raf     = null;
    this.startTime = null;
    this.elapsed   = 0;
    this.duration  = 5000;

    this.el          = document.getElementById('storyViewer');
    this.progressRow = document.getElementById('svProgressRow');
    this.slideArea   = document.getElementById('svSlideArea');
    this.fills       = [];
    this.slides      = [];

    this._buildDOM();
    this._bindEvents();
  }

  _buildDOM() {
    this.progressRow.innerHTML = this.data.map((_, i) =>
      `<div class="sv-bar"><div class="sv-fill" id="svf${i}"></div></div>`
    ).join('');

    this.slideArea.innerHTML = this.data.map((s, i) =>
      `<div class="sv-slide${i === 0 ? ' is-active' : ''}" data-idx="${i}" style="background:${s.gradient}">
        <div class="sv-bg-year">${s.year}</div>
        <div class="sv-slide-inner">
          <div class="sv-slide-num">
            <span class="sv-dot" style="background:${s.accent}"></span>
            ${s.num} / 07
          </div>
          <div class="sv-slide-year">${s.year}</div>
          <h2 class="sv-slide-title">${s.title}</h2>
          <p class="sv-slide-desc">${s.desc}</p>
        </div>
      </div>`
    ).join('');

    this.fills  = this.data.map((_, i) => document.getElementById(`svf${i}`));
    this.slides = [...this.slideArea.querySelectorAll('.sv-slide')];
  }

  open() {
    this.el.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    this.goTo(0);
  }

  close() {
    cancelAnimationFrame(this.raf);
    this.el.classList.remove('is-open');
    document.body.style.overflow = '';
    this.elapsed = 0;
    this.fills.forEach(f => { f.style.width = '0%'; });
  }

  _showPasswordGate() {
    var existing = document.getElementById('storyPwGate');
    if (existing) existing.remove();
    var overlay = document.createElement('div');
    overlay.id = 'storyPwGate';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;font-family:DM Sans,sans-serif;backdrop-filter:blur(8px);';
    overlay.innerHTML = '<div style="text-align:center;max-width:360px;padding:2rem;background:#111;border-radius:16px;border:1px solid #222;">'
      + '<div style="font-size:.85rem;color:#888;margin-bottom:.75rem;letter-spacing:.06em;text-transform:uppercase;">Protected Content</div>'
      + '<h2 style="color:#fff;font-size:1.5rem;margin:0 0 .5rem;">Enter Password</h2>'
      + '<p style="color:#777;font-size:.9rem;margin:0 0 1.5rem;">This story is password-protected.</p>'
      + '<input id="storyPwInput" type="password" placeholder="Password" autocomplete="off" style="width:100%;padding:.75rem 1rem;border:1px solid #333;border-radius:10px;background:#161616;color:#fff;font-size:1rem;outline:none;box-sizing:border-box;font-family:inherit;" />'
      + '<div id="storyPwError" style="color:#f87171;font-size:.8rem;margin-top:.5rem;display:none;">Incorrect password. Try again.</div>'
      + '<button id="storyPwSubmit" style="margin-top:1rem;padding:.75rem 2rem;background:#fff;color:#000;border:none;border-radius:10px;font-size:.95rem;cursor:pointer;font-family:inherit;font-weight:500;width:100%;">Unlock</button>'
      + '</div>';
    document.body.appendChild(overlay);
    var self = this;
    var inp = document.getElementById('storyPwInput');
    var btn = document.getElementById('storyPwSubmit');
    var err = document.getElementById('storyPwError');
    function tryUnlock() {
      if (inp.value === 'project123') { sessionStorage.setItem('pf_unlocked','true'); overlay.remove(); self.open(); }
      else { err.style.display = 'block'; inp.value = ''; }
    }
    btn.addEventListener('click', tryUnlock);
    inp.addEventListener('keydown', function(e) { if (e.key === 'Enter') tryUnlock(); });
    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    inp.focus();
  }

  goTo(idx) {
    cancelAnimationFrame(this.raf);
    this.elapsed = 0;
    this.current = Math.max(0, Math.min(idx, this.data.length - 1));

    this.slides.forEach((s, i) => s.classList.toggle('is-active', i === this.current));

    this.fills.forEach((f, i) => {
      f.style.transition = 'none';
      f.style.width = i < this.current ? '100%' : '0%';
    });

    requestAnimationFrame(() => { this._startProgress(); });
  }

  _startProgress() {
    const fill = this.fills[this.current];
    this.startTime = performance.now() - this.elapsed;

    const tick = (now) => {
      const t = Math.min((now - this.startTime) / this.duration, 1);
      fill.style.width = (t * 100) + '%';
      if (t < 1) {
        this.raf = requestAnimationFrame(tick);
      } else {
        this.current < this.data.length - 1 ? this.goTo(this.current + 1) : this.close();
      }
    };
    this.raf = requestAnimationFrame(tick);
  }

  next() { this.goTo(this.current + 1); }
  prev() { this.goTo(this.current - 1); }

  _bindEvents() {
    document.getElementById('openStories').addEventListener('click', () => {
      if (sessionStorage.getItem('pf_unlocked') === 'true') { this.open(); return; }
      this._showPasswordGate();
    });
    document.getElementById('svClose').addEventListener('click',  () => this.close());
    document.getElementById('svNext').addEventListener('click',   (e) => { e.stopPropagation(); this.next(); });
    document.getElementById('svPrev').addEventListener('click',   (e) => { e.stopPropagation(); this.prev(); });

    document.addEventListener('keydown', e => {
      if (!this.el.classList.contains('is-open')) return;
      if (e.key === 'ArrowRight') this.next();
      if (e.key === 'ArrowLeft')  this.prev();
      if (e.key === 'Escape')     this.close();
    });

    // Swipe on touch
    let touchX = 0;
    const wrap = document.getElementById('svWrap');
    wrap.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    wrap.addEventListener('touchend', e => {
      const dx = touchX - e.changedTouches[0].clientX;
      if (Math.abs(dx) > 60) dx > 0 ? this.next() : this.prev();
    });

    // Tap backdrop to close
    this.el.addEventListener('click', e => { if (e.target === this.el) this.close(); });
  }
}

const storyViewer = new StoryViewer(STORY_DATA);

// ── Smooth hover tilt on project cards (desktop only) ─────────────
if (window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = (e.clientX - left) / width  - 0.5;
      const y = (e.clientY - top)  / height - 0.5;
      card.style.transform = `translateY(-6px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

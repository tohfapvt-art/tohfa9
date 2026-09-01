const form = document.querySelector('#enquiry-form');
const { url: supabaseUrl, publishableKey: supabasePublishableKey } = window.__SUPABASE_CONFIG__ || {};

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = String(data.get('name') || '').trim();
  const phone = String(data.get('phone') || '').trim();
  const button = form.querySelector('.button-submit');

  if (!name || !phone) {
    form.querySelector('.form-note').textContent = 'Please add your name and phone number so we can get back to you.';
    return;
  }

  button.classList.add('is-sending');
  button.disabled = true;
  button.querySelector('b').textContent = '…';

  const enquiry = {
    name,
    phone,
    email: String(data.get('email') || '').trim() || null,
    occasion: String(data.get('occasion') || '').trim() || null,
    callback_time: String(data.get('call-time') || '').trim() || null,
    details: String(data.get('details') || '').trim() || null,
  };

  try {
    if (!supabaseUrl || !supabasePublishableKey) {
      throw new Error('Supabase is not configured');
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/enquiries`, {
      method: 'POST',
      headers: {
        apikey: supabasePublishableKey,
        Authorization: `Bearer ${supabasePublishableKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(enquiry),
    });

    if (!response.ok) throw new Error('Unable to save enquiry');

    button.classList.remove('is-sending');
    button.innerHTML = 'Thank you — we’ll be in touch soon <b>✓</b>';
    button.style.background = '#456e4d';
    form.querySelector('.form-note').textContent = `Thank you, ${name}. Your gifting enquiry has been received.`;
    form.reset();
  } catch (error) {
    button.classList.remove('is-sending');
    button.disabled = false;
    button.innerHTML = '<span class="enquiry-seal">✦</span> Send my enquiry <b>→</b>';
    form.querySelector('.form-note').textContent = 'We could not save your enquiry right now. Please try WhatsApp instead.';
  }
});

const whatsappButton = document.querySelector('#whatsapp-link');
const whatsappUrl = 'https://wa.me/916296750660?text=Hello%20Tohfa!%20I%20would%20love%20some%20help%20with%20a%20gift.';
document.querySelectorAll('a[href^="https://wa.me/"]').forEach((link) => {
  if (!link.search || link.search.trim() === '') {
    link.href = whatsappUrl;
  }
});

if (whatsappButton) {
  whatsappButton.addEventListener('click', (event) => {
    event.preventDefault();
    whatsappButton.classList.add('is-opening');
    setTimeout(() => window.open(whatsappButton.href, '_blank', 'noopener'), 360);
  });
}

// --- Day & Night (Light / Dark) Theme Management ---
const themeToggleBtn = document.querySelector('#theme-toggle');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('tohfa-theme', theme);
  if (themeToggleBtn) {
    const isDark = theme === 'dark';
    themeToggleBtn.setAttribute('aria-label', isDark ? 'Switch to Day mode' : 'Switch to Night mode');
    themeToggleBtn.setAttribute('title', isDark ? 'Switch to Day mode' : 'Switch to Night mode');
    const labelSpan = themeToggleBtn.querySelector('.theme-toggle-text');
    if (labelSpan) {
      labelSpan.textContent = isDark ? 'Day' : 'Night';
    }
  }
}

if (themeToggleBtn) {
  // Sync initial state with current active data-theme
  const initialTheme = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(initialTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  });
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('tohfa-theme')) {
    applyTheme(e.matches ? 'dark' : 'light');
  }
});

// --- Interactive 3D Gift Box Unboxing Process ---
const unboxCards = document.querySelectorAll('.unbox-box-wrap');
unboxCards.forEach((card) => {
  card.addEventListener('click', () => {
    const isCurrentlyOpen = card.classList.contains('is-open');

    // Collapse any other open box
    unboxCards.forEach((otherCard) => {
      if (otherCard !== card) {
        otherCard.classList.remove('is-open');
        otherCard.setAttribute('aria-expanded', 'false');
      }
    });

    // Toggle current box
    if (isCurrentlyOpen) {
      card.classList.remove('is-open');
      card.setAttribute('aria-expanded', 'false');
    } else {
      card.classList.add('is-open');
      card.setAttribute('aria-expanded', 'true');
    }
  });

  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});

// Auto-open first box initially when scrolled into view so user discovers the interaction immediately
if (unboxCards.length > 0) {
  let hasInteracted = false;
  const processSection = document.querySelector('#how-it-works') || unboxCards[0];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasInteracted) {
        hasInteracted = true;
        setTimeout(() => {
          if (!unboxCards[0].classList.contains('is-open')) {
            unboxCards[0].classList.add('is-open');
            unboxCards[0].setAttribute('aria-expanded', 'true');
          }
        }, 600);
      }
    });
  }, { threshold: 0.25 });
  observer.observe(processSection);
}

// ==========================================================================
// 3D HERO INTERACTIVE PARALLAX & TILT PHYSICS
// ==========================================================================
const heroArt = document.querySelector('#hero3DArt');
const heroStage = document.querySelector('#hero3DStage');
const heroCard = document.querySelector('#hero3DCard');
const glareEffect = document.querySelector('.hero-glare-effect');

if (heroArt && heroStage) {
  let bounds = heroArt.getBoundingClientRect();
  let targetRotateX = 0;
  let targetRotateY = 0;
  let currentRotateX = 0;
  let currentRotateY = 0;
  let isHovered = false;

  window.addEventListener('resize', () => {
    bounds = heroArt.getBoundingClientRect();
  });

  heroArt.addEventListener('mouseenter', () => {
    isHovered = true;
    heroStage.style.animation = 'none';
  });

  heroArt.addEventListener('mousemove', (e) => {
    bounds = heroArt.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    
    // Normalize coordinates (-1 to 1)
    const normX = (x / bounds.width) * 2 - 1;
    const normY = (y / bounds.height) * 2 - 1;

    targetRotateY = normX * 16; // Max 16 deg yaw
    targetRotateX = -normY * 16; // Max 16 deg pitch

    if (glareEffect) {
      const glareX = (x / bounds.width) * 100;
      const glareY = (y / bounds.height) * 100;
      glareEffect.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.05) 50%, transparent 75%)`;
    }
  });

  heroArt.addEventListener('mouseleave', () => {
    isHovered = false;
    targetRotateX = 0;
    targetRotateY = 0;
    setTimeout(() => {
      if (!isHovered) {
        heroStage.style.animation = 'heroStageFloat 6s ease-in-out infinite alternate';
      }
    }, 400);
  });

  // Smooth Lerp loop
  function update3D() {
    if (isHovered) {
      currentRotateX += (targetRotateX - currentRotateX) * 0.12;
      currentRotateY += (targetRotateY - currentRotateY) * 0.12;
      heroStage.style.transform = `rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg)`;
    }
    requestAnimationFrame(update3D);
  }
  requestAnimationFrame(update3D);
}




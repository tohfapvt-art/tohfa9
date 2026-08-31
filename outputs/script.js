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
  link.href = whatsappUrl;
});

whatsappButton.addEventListener('click', (event) => {
  event.preventDefault();
  whatsappButton.classList.add('is-opening');
  setTimeout(() => window.open(whatsappButton.href, '_blank', 'noopener'), 360);
});

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




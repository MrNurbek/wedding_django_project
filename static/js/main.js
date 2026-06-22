/* ===== PETALS ANIMATION ===== */
(function () {
  const canvas = document.getElementById('petals-canvas');
  const ctx = canvas.getContext('2d');
  let petals = [];
  const PETAL_COUNT = 30;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const colors = ['#f5c6c6', '#f9d9d9', '#e8b4b4', '#fde8e8', '#f7c9c9', '#fce4ec'];

  function createPetal() {
    return {
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      size: 6 + Math.random() * 10,
      speedY: 0.8 + Math.random() * 1.5,
      speedX: -0.5 + Math.random() * 1,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      opacity: 0.5 + Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      swing: Math.random() * Math.PI * 2,
      swingSpeed: 0.02 + Math.random() * 0.02,
    };
  }

  for (let i = 0; i < PETAL_COUNT; i++) {
    const p = createPetal();
    p.y = Math.random() * window.innerHeight;
    petals.push(p);
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    petals.forEach((p, i) => {
      p.swing += p.swingSpeed;
      p.x += p.speedX + Math.sin(p.swing) * 0.6;
      p.y += p.speedY;
      p.rotation += p.rotSpeed;
      drawPetal(p);
      if (p.y > canvas.height + 30) {
        petals[i] = createPetal();
      }
    });
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ===== NAV SCROLL ===== */
(function () {
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });
})();

/* ===== COUNTDOWN ===== */
(function () {
  const wedding = new Date('2026-09-09T18:00:00+05:00');

  function update() {
    const now = new Date();
    const diff = wedding - now;

    if (diff <= 0) {
      ['days', 'hours', 'minutes', 'seconds'].forEach(id => {
        const el = document.getElementById('cd-' + id);
        if (el) el.textContent = '00';
      });
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    const pad = n => String(n).padStart(2, '0');
    document.getElementById('cd-days').textContent = pad(days);
    document.getElementById('cd-hours').textContent = pad(hours);
    document.getElementById('cd-minutes').textContent = pad(minutes);
    document.getElementById('cd-seconds').textContent = pad(seconds);
  }

  update();
  setInterval(update, 1000);
})();

/* ===== SCROLL REVEAL ===== */
(function () {
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    }),
    { threshold: 0.15 }
  );

  document.querySelectorAll('.reveal, .timeline-item').forEach(el => observer.observe(el));
})();

/* ===== MUSIC PLAYER ===== */
(function () {
  const btn = document.getElementById('music-btn');
  const audio = document.getElementById('bg-music');
  if (!btn || !audio) return;

  let playing = false;

  btn.addEventListener('click', () => {
    if (playing) {
      audio.pause();
      btn.innerHTML = '&#9654;';
      btn.classList.remove('playing');
    } else {
      audio.play().catch(() => {});
      btn.innerHTML = '&#9646;&#9646;';
      btn.classList.add('playing');
    }
    playing = !playing;
  });

  audio.addEventListener('ended', () => {
    audio.currentTime = 0;
    audio.play();
  });
})();

/* ===== RSVP FORM ===== */
(function () {
  let guestCount = 1;
  let selectedStatus = 'yes';

  const countDisplay = document.getElementById('count-display');
  const minusBtn = document.getElementById('count-minus');
  const plusBtn = document.getElementById('count-plus');

  if (minusBtn) {
    minusBtn.addEventListener('click', () => {
      if (guestCount > 1) { guestCount--; countDisplay.textContent = guestCount; }
    });
  }
  if (plusBtn) {
    plusBtn.addEventListener('click', () => {
      if (guestCount < 10) { guestCount++; countDisplay.textContent = guestCount; }
    });
  }

  document.querySelectorAll('.status-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedStatus = btn.dataset.status;
    });
  });

  const form = document.getElementById('rsvp-form');
  const successDiv = document.getElementById('rsvp-success');
  const submitBtn = document.getElementById('rsvp-submit');

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const name = document.getElementById('rsvp-name').value.trim();
      const message = document.getElementById('rsvp-message').value.trim();

      if (!name) {
        document.getElementById('rsvp-name').focus();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Yuborilmoqda...';

      try {
        const csrf = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const res = await fetch('/rsvp/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
          body: JSON.stringify({ name, guest_count: guestCount, status: selectedStatus, message }),
        });
        const data = await res.json();

        if (data.success) {
          form.style.display = 'none';
          successDiv.style.display = 'block';
          updateGuestTable(data);
          setTimeout(() => {
            document.getElementById('guests').scrollIntoView({ behavior: 'smooth' });
          }, 1200);
        }
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Tasdiqlash";
      }
    });
  }

  function updateGuestTable(data) {
    document.getElementById('stat-total').textContent = data.total;
    document.getElementById('stat-yes').textContent = data.yes_count;
    document.getElementById('stat-no').textContent = data.no_count;

    const tbody = document.getElementById('guests-tbody');
    if (!tbody) return;

    if (!data.guests || data.guests.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="guests-empty">Hali mehmonlar yo\'q</td></tr>';
      return;
    }

    tbody.innerHTML = data.guests.map(g => `
      <tr>
        <td>${escapeHtml(g.name)}</td>
        <td style="text-align:center">${g.guest_count}</td>
        <td><span class="status-badge status-${g.status_code}">${escapeHtml(g.status)}</span></td>
        <td style="color:var(--text-light);font-style:italic">${escapeHtml(g.message || '—')}</td>
      </tr>
    `).join('');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
})();

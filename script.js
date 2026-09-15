const intro = document.getElementById('intro');
const page = document.getElementById('page');
const enterBtn = document.getElementById('enterBtn');
const soundBtn = document.getElementById('soundBtn');
const soundIcon = document.getElementById('soundIcon');
const gritoBtn = document.getElementById('gritoBtn');
const finalVivaBtn = document.getElementById('finalVivaBtn');
const toast = document.getElementById('toast');
const avocadoBtn = document.getElementById('avocadoBtn');
const avocadoText = document.getElementById('avocadoText');

let soundEnabled = true;
let audioCtx;
let toastTimer;

document.body.classList.add('intro-open');

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function bellSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.12, now + 0.015);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
  master.connect(ctx.destination);

  [523.25, 659.25, 783.99, 1046.5].forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = index < 2 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.7 / (index + 1), now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.7 + index * .12);
    osc.connect(gain);
    gain.connect(master);
    osc.start(now + index * .018);
    osc.stop(now + 2.3);
  });
}

function tinyChime() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  [659.25, 783.99, 987.77].forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now + index * .09);
    gain.gain.exponentialRampToValueAtTime(.055, now + index * .09 + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, now + index * .09 + .5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + index * .09);
    osc.stop(now + index * .09 + .55);
  });
}

enterBtn.addEventListener('click', () => {
  bellSound();
  intro.classList.add('is-hidden');
  page.classList.add('is-ready');
  page.setAttribute('aria-hidden', 'false');
  document.body.classList.remove('intro-open');
  burst(window.innerWidth * .25, window.innerHeight * .28, 'green', 34);
  setTimeout(() => burst(window.innerWidth * .76, window.innerHeight * .24, 'red', 34), 260);
  setTimeout(() => document.querySelectorAll('.hero .reveal').forEach((el, i) => setTimeout(() => el.classList.add('is-visible'), i * 120)), 350);
});

soundBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundIcon.textContent = soundEnabled ? '♪' : '×';
  soundBtn.setAttribute('aria-label', soundEnabled ? 'Desactivar sonido' : 'Activar sonido');
  if (!soundEnabled && activeAudio && !activeAudio.paused) {
    activeAudio.pause();
    activeAudio = null;
  }
  if (soundEnabled) tinyChime();
});

function showViva() {
  bellSound();
  clearTimeout(toastTimer);
  toast.classList.add('show');
  const y = window.innerHeight * .3;
  burst(window.innerWidth * .22, y, 'green', 45);
  setTimeout(() => burst(window.innerWidth * .5, y * .78, 'white', 40), 180);
  setTimeout(() => burst(window.innerWidth * .78, y, 'red', 45), 360);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 5200);
}

gritoBtn.addEventListener('click', showViva);
finalVivaBtn.addEventListener('click', showViva);

const avocadoStates = [
  'Yo digo <strong>palta</strong>, tú dices <strong>aguacate</strong>. La diplomacia Perú–México sigue negociando.',
  'Por ser 15 y 16 de septiembre, concedo una victoria temporal a <strong>aguacate</strong> 🇲🇽. Temporal.',
  'Tras una revisión extraordinaria del caso, Perú presenta apelación: <strong>palta</strong> 🇵🇪.',
  'Veredicto final: no importa cómo se llame si podemos discutirlo juntos toda la vida. ♥'
];
let avocadoIndex = 0;
avocadoBtn.addEventListener('click', () => {
  avocadoIndex = (avocadoIndex + 1) % avocadoStates.length;
  avocadoText.innerHTML = avocadoStates[avocadoIndex];
  avocadoBtn.textContent = avocadoIndex === 3 ? 'Firmar tratado de paz' : 'Reabrir negociaciones';
  tinyChime();
});

// Reproductores de las canciones de Anna
const trackCards = [...document.querySelectorAll('[data-track-card]')];
let activeAudio = null;

function formatTrackTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${secs}`;
}

function setTrackPlaying(card, playing) {
  const icon = card.querySelector('.track-play__icon');
  const status = card.querySelector('.track-status');
  const button = card.querySelector('.track-play');
  card.classList.toggle('is-playing', playing);
  icon.textContent = playing ? '❚❚' : '▶';
  status.textContent = playing ? 'Reproduciendo' : 'Reproducir aquí';
  button.setAttribute('aria-label', playing ? 'Pausar canción' : 'Reproducir canción');
}

trackCards.forEach((card) => {
  const audio = card.querySelector('.track-audio');
  const playButton = card.querySelector('.track-play');
  const seek = card.querySelector('.track-seek');
  const time = card.querySelector('.track-time');

  const updateTimeline = () => {
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const percent = duration ? (current / duration) * 100 : 0;
    seek.value = percent;
    seek.style.setProperty('--seek', `${percent}%`);
    time.textContent = `${formatTrackTime(current)} / ${formatTrackTime(duration)}`;
  };

  audio.addEventListener('loadedmetadata', updateTimeline);
  audio.addEventListener('timeupdate', updateTimeline);
  audio.addEventListener('ended', () => {
    setTrackPlaying(card, false);
    audio.currentTime = 0;
    updateTimeline();
    if (activeAudio === audio) activeAudio = null;
  });
  audio.addEventListener('pause', () => setTrackPlaying(card, false));
  audio.addEventListener('play', () => setTrackPlaying(card, true));

  playButton.addEventListener('click', async () => {
    if (activeAudio && activeAudio !== audio) {
      activeAudio.pause();
    }

    if (!audio.paused) {
      audio.pause();
      activeAudio = null;
      return;
    }

    try {
      audio.muted = false;
      await audio.play();
      activeAudio = audio;
    } catch (error) {
      console.warn('No se pudo iniciar la reproducción:', error);
    }
  });

  seek.addEventListener('input', () => {
    if (!Number.isFinite(audio.duration) || !audio.duration) return;
    audio.currentTime = (Number(seek.value) / 100) * audio.duration;
    updateTimeline();
  });
});

// Scroll reveals
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12, rootMargin: '0px 0px -45px' });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// Fireworks: deliberately light so it stays smooth on mobile.
const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
let particles = [];
const palette = {
  green: ['#006847', '#13a875', '#72c4a5'],
  white: ['#fffaf0', '#f2eadb', '#ffffff'],
  red: ['#ce1126', '#ef3340', '#ff7b85']
};

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function burst(x, y, colorName = 'white', amount = 36) {
  const colors = palette[colorName] || palette.white;
  for (let i = 0; i < amount; i++) {
    const angle = (Math.PI * 2 * i) / amount + Math.random() * .12;
    const speed = 1.3 + Math.random() * 4.2;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: .035 + Math.random() * .018,
      drag: .985,
      alpha: 1,
      life: 55 + Math.random() * 38,
      age: 0,
      size: 1 + Math.random() * 1.8,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
}

function animateFireworks() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles = particles.filter(p => p.age < p.life && p.alpha > .01);
  particles.forEach(p => {
    p.age++;
    p.vx *= p.drag;
    p.vy = p.vy * p.drag + p.gravity;
    p.x += p.vx;
    p.y += p.vy;
    p.alpha = 1 - (p.age / p.life);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  requestAnimationFrame(animateFireworks);
}
animateFireworks();

// Occasional subtle celebratory spark while the finale is visible.
const finale = document.querySelector('.finale');
const finaleObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setTimeout(() => burst(window.innerWidth * .18, window.innerHeight * .32, 'green', 22), 450);
      setTimeout(() => burst(window.innerWidth * .82, window.innerHeight * .28, 'red', 22), 800);
    }
  });
}, { threshold: .35 });
finaleObserver.observe(finale);

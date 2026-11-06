/**
 * Invitación Día de Muertos - El Libro de la Vida (2014)
 * Lógica interactiva, efectos de partículas, contador y audio sintético.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. CONTROL DE NAVEGACIÓN Y APERTURA DE INVITACIÓN
     ========================================================================== */
  const welcomeScreen = document.getElementById('welcome-screen');
  const invitationContent = document.getElementById('invitation-content');
  const btnOpen = document.getElementById('btn-open-invitation');

  btnOpen.addEventListener('click', () => {
    // Animación de salida suave
    welcomeScreen.style.opacity = '0';
    welcomeScreen.style.transform = 'scale(0.95)';

    setTimeout(() => {
      welcomeScreen.classList.add('hidden');
      invitationContent.classList.remove('hidden');
      
      // Transición de entrada
      requestAnimationFrame(() => {
        invitationContent.style.opacity = '1';
      });

      // Iniciar reproductor de audio al interactuar
      toggleAudio(true);
    }, 700);
  });

  /* ==========================================================================
     2. REPRODUCTOR DE MÚSICA CON FALLBACK DE SINTETIZADOR WEB AUDIO API
     ========================================================================== */
  const btnAudio = document.getElementById('btn-audio');
  const audioIcon = document.getElementById('audio-icon');
  const bgMusic = document.getElementById('bg-music');
  
  let isPlaying = false;
  let audioCtx = null;
  let synthInterval = null;

  function toggleAudio(forcePlay = false) {
    if (forcePlay) isPlaying = false;

    if (!isPlaying) {
      bgMusic.play().then(() => {
        isPlaying = true;
        audioIcon.textContent = '🔊';
      }).catch(() => {
        // Fallback a melodía sintética tradicional si no existe archivo de audio local
        startSyntheticMusic();
        isPlaying = true;
        audioIcon.textContent = '🪕';
      });
    } else {
      bgMusic.pause();
      stopSyntheticMusic();
      isPlaying = false;
      audioIcon.textContent = '🎵';
    }
  }

  btnAudio.addEventListener('click', () => toggleAudio());

  // Sintetizador Web Audio API para asegurar música si no hay MP3
  function startSyntheticMusic() {
    if (synthInterval) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    audioCtx = new AudioContext();

    // Notas estilo escala mexicana/mariachi (Frecuencias Hz)
    const notes = [293.66, 329.63, 370.00, 392.00, 440.00, 493.88, 554.37];
    let noteIdx = 0;

    synthInterval = setInterval(() => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(notes[noteIdx % notes.length], audioCtx.currentTime);

      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);

      noteIdx = (noteIdx + 1) % notes.length;
    }, 350);
  }

  function stopSyntheticMusic() {
    if (synthInterval) {
      clearInterval(synthInterval);
      synthInterval = null;
    }
    if (audioCtx) {
      audioCtx.close();
      audioCtx = null;
    }
  }

  /* ==========================================================================
     3. CONTADOR REGRESIVO AL EVENTO
     ========================================================================== */
  const eventDate = new Date('November 1, 2026 20:00:00').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = eventDate - now;

    if (distance < 0) {
      document.getElementById('countdown-timer').innerHTML = '<p class="final-quote">¡El portal está abierto!</p>';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = String(days).padStart(2, '0');
    document.getElementById('hours').innerText = String(hours).padStart(2, '0');
    document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
    document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  /* ==========================================================================
     4. MODAL Y FORMULARIO DE CONFIRMACIÓN (RSVP)
     ========================================================================== */
  const btnRsvp = document.getElementById('btn-rsvp');
  const rsvpModal = document.getElementById('rsvp-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const rsvpForm = document.getElementById('rsvp-form');
  const formSuccess = document.getElementById('form-success');

  btnRsvp.addEventListener('click', () => {
    rsvpModal.classList.remove('hidden');
    rsvpModal.setAttribute('aria-hidden', 'false');
  });

  btnCloseModal.addEventListener('click', closeModal);

  rsvpModal.addEventListener('click', (e) => {
    if (e.target === rsvpModal) closeModal();
  });

  function closeModal() {
    rsvpModal.classList.add('hidden');
    rsvpModal.setAttribute('aria-hidden', 'true');
  }

  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('guest-name').value;

    if (name.trim()) {
      rsvpForm.classList.add('hidden');
      formSuccess.classList.remove('hidden');

      setTimeout(() => {
        closeModal();
        // Restaurar formulario para posteriores usos
        setTimeout(() => {
          rsvpForm.reset();
          rsvpForm.classList.remove('hidden');
          formSuccess.classList.add('hidden');
        }, 500);
      }, 2500);
    }
  });

  /* ==========================================================================
     5. BOTONES DE UBICACIÓN Y COMPARTIR
     ========================================================================== */
  const btnLocation = document.getElementById('btn-location');
  const btnShare = document.getElementById('btn-share');

  btnLocation.addEventListener('click', () => {
    // Abre enlace directo a Google Maps con dirección de ejemplo
    const mapUrl = 'https://www.google.com/maps/search/?api=1&query=Av.+de+los+Recuerdos+11';
    window.open(mapUrl, '_blank');
  });

  btnShare.addEventListener('click', async () => {
    const shareData = {
      title: 'Noche de Día de Muertos',
      text: '¡Te invito a una noche mágica inspirada en El Libro de la Vida!',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error al compartir:', err);
      }
    } else {
      // Fallback: Copiar al portapapeles
      navigator.clipboard.writeText(window.location.href);
      alert('¡Enlace de invitación copiado al portapapeles!');
    }
  });

  /* ==========================================================================
     6. CANVASES DE ANIMACIÓN: FLORES DE CEMPASÚCHIL Y PARTÍCULAS
     ========================================================================== */
  const canvas = document.getElementById('canvas-particles');
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  class Petal {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * -height;
      this.size = Math.random() * 8 + 4;
      this.speedY = Math.random() * 1.5 + 0.8;
      this.speedX = Math.random() * 1 - 0.5;
      this.angle = Math.random() * 360;
      this.spin = Math.random() * 2 - 1;
      // Colores de Cempasúchil y destellos mágicos
      const colors = ['#ff7700', '#ffd700', '#ff4500', '#00e5ff', '#e6005c'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.opacity = Math.random() * 0.7 + 0.3;
    }

    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.y * 0.01) + this.speedX;
      this.angle += this.spin;

      if (this.y > height + 20) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.angle * Math.PI) / 180);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;

      // Dibujar forma de pétalo orgánico
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const petals = Array.from({ length: 45 }, () => new Petal());

  function animateCanvas() {
    ctx.clearRect(0, 0, width, height);
    petals.forEach(petal => {
      petal.update();
      petal.draw();
    });
    requestAnimationFrame(animateCanvas);
  }

  animateCanvas();
});

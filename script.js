/**
 * ===================================================================
 * LUXURY WEDDING INVITATION — JAVASCRIPT ENGINE
 * Mobile-First, Cinematic Transitions, Scratch Reveal & Audio
 * ===================================================================
 */

(function () {
  'use strict';

  // State Management
  let isInvitationOpened = false;
  let isMusicPlaying = false;
  let isCardScratched = false;
  let audioContext = null;
  let proceduralMusicInterval = null;
  let customAudioElement = null;

  // DOM Elements
  const body = document.body;
  const coverHero = document.getElementById('coverHero');
  const openInvitationBtn = document.getElementById('openInvitationBtn');
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const invitationContent = document.getElementById('invitationContent');
  const scratchCanvas = document.getElementById('scratchCanvas');
  const scratchInstruction = document.getElementById('scratchInstruction');
  const stardustCanvas = document.getElementById('stardustCanvas');
  const petalCanvas = document.getElementById('petalCanvas');
  const btnAddToCalendar = document.getElementById('btnAddToCalendar');
  const btnShareInvite = document.getElementById('btnShareInvite');
  const btnScrollTop = document.getElementById('btnScrollTop');

  // =================================================================
  // 1. HYDRATE DOM FROM WEDDING_CONFIG
  // =================================================================
  function applyWeddingConfig() {
    if (typeof WEDDING_CONFIG === 'undefined') return;

    const { groom, bride, dateFormatted, dateNumeric, dayOfWeek, timeFormatted, venue, texts, contact } = WEDDING_CONFIG;

    // Cover Screen (Arabic Typography)
    safeSetText('coverBismillah', texts.bismillahArabic || texts.bismillahEnglish);
    safeSetText('heroGroomName', groom.name);
    safeSetText('heroBrideName', bride.name);
    safeSetText('heroDateNumeric', dateNumeric);

    // Panel 1: Blessing & Gratitude
    safeSetText('textOpeningGratitude', `“${texts.openingGratitude.replace(/^“|”$/g, '')}”`);
    safeSetText('textSaveTheDate', texts.saveTheDate);

    // Panel 2: Couple Section
    safeSetText('textTogetherFamilies', texts.togetherFamilies);
    safeSetText('sectionGroomName', groom.name);
    safeSetText('sectionBrideName', bride.name);
    safeSetText('textRequestHonour', texts.requestHonour);

    // Panel 3: Scratch Section
    safeSetText('revealedDateText', dateFormatted);
    safeSetText('revealedTimeText', `${dayOfWeek.toUpperCase()} • ${timeFormatted}`);
    safeSetText('revealedVenueText', `${venue.name}, ${venue.city}`);
    safeSetText('scratchSuccessMsg', `✨ ${texts.scratchSuccess} ✨`);

    // Panel 4: Countdown
    safeSetText('textCountdownHeading', texts.countdownHeading);

    // Panel 5: Event Date & Holy Verse
    safeSetText('eventDateBig', dateFormatted);
    safeSetText('eventDayTime', `${dayOfWeek} • ${timeFormatted}`);
    safeSetText('textHolyQuote', texts.holyQuote);
    safeSetText('textHolyQuoteSource', texts.holyQuoteSource);

    // Panel 6: Venue & Location
    safeSetText('venueNameText', venue.name);
    safeSetText('venueCityText', `${venue.city}, ${venue.district || ''}`);
    const mapLinkBtn = document.getElementById('btnMapDirections');
    if (mapLinkBtn && venue.mapLink) {
      mapLinkBtn.href = venue.mapLink;
    }

    // Panel 7: Will You Join & RSVP
    safeSetText('textWillYouJoin', texts.willYouJoin);
    safeSetText('textWillYouJoinSub', texts.willYouJoinSub);
    const rsvpBtn = document.getElementById('btnWhatsAppRsvp');
    if (rsvpBtn && contact.whatsappNumber) {
      const cleanPhone = contact.whatsappNumber.replace(/[^0-9]/g, '');
      const encodedMsg = encodeURIComponent(contact.rsvpMessage || 'Assalamu Alaikum! Confirming our presence for the wedding celebration.');
      rsvpBtn.href = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
    }

    // Panel 8: Footer
    safeSetText('poemLine1', texts.closingPoemLine1);
    safeSetText('poemLine2', texts.closingPoemLine2);
    safeSetText('poemLine3', texts.closingPoemLine3);
    safeSetText('footerCoupleName', `${groom.name} & ${bride.name}`);
    safeSetText('footerDateNumeric', dateNumeric);
    safeSetText('textClosingGratitude', texts.closingGratitude);
    safeSetText('footerVenueTag', `${venue.name.toUpperCase()} • ${venue.city.toUpperCase()}`);
  }

  function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el && text !== undefined) {
      el.textContent = text;
    }
  }

  // =================================================================
  // 2. LIVE COUNTDOWN TIMER
  // =================================================================
  function initCountdown() {
    const targetISO = WEDDING_CONFIG.weddingDateISO || '2026-12-20T11:00:00+05:30';
    const targetDate = new Date(targetISO).getTime();

    const daysEl = document.getElementById('timerDays');
    const hoursEl = document.getElementById('timerHours');
    const minsEl = document.getElementById('timerMinutes');
    const secsEl = document.getElementById('timerSeconds');

    function update() {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        if (daysEl) daysEl.textContent = '00';
        if (hoursEl) hoursEl.textContent = '00';
        if (minsEl) minsEl.textContent = '00';
        if (secsEl) secsEl.textContent = '00';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
      if (minsEl) minsEl.textContent = String(minutes).padStart(2, '0');
      if (secsEl) secsEl.textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  // =================================================================
  // 3. CINEMATIC AUDIO ENGINE (Procedural Wedding Melody + MP3 support)
  // =================================================================
  function initAudioEngine() {
    const customSrc = WEDDING_CONFIG.audio && WEDDING_CONFIG.audio.customAudioSrc;
    if (customSrc && customSrc.trim() !== '') {
      customAudioElement = new Audio();
      customAudioElement.loop = true;
      customAudioElement.volume = 0.75;
      customAudioElement.preload = 'auto';

      // Support multi-format sources (.mp3 & .m4a)
      const sourceMp3 = document.createElement('source');
      sourceMp3.src = customSrc;
      sourceMp3.type = 'audio/mpeg';

      const sourceM4a = document.createElement('source');
      sourceM4a.src = 'assets/audio/wedding_nasheed.m4a';
      sourceM4a.type = 'audio/mp4';

      customAudioElement.appendChild(sourceMp3);
      customAudioElement.appendChild(sourceM4a);
    }
  }

  function startMusic() {
    if (isMusicPlaying) return;

    if (customAudioElement) {
      const playPromise = customAudioElement.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          isMusicPlaying = true;
          updateAudioButtonUI(true);
        }).catch(err => {
          console.warn('Custom audio playback postponed until user interaction:', err);
          startProceduralHarpSynth();
        });
      }
      return;
    }

    startProceduralHarpSynth();
  }

  function toggleMusic() {
    if (isMusicPlaying) {
      pauseMusic();
    } else {
      startMusic();
    }
  }

  function pauseMusic() {
    if (customAudioElement) {
      customAudioElement.pause();
    }
    if (proceduralMusicInterval) {
      clearInterval(proceduralMusicInterval);
      proceduralMusicInterval = null;
    }
    isMusicPlaying = false;
    updateAudioButtonUI(false);
  }

  function updateAudioButtonUI(playing) {
    if (playing) {
      audioToggleBtn.classList.add('playing');
    } else {
      audioToggleBtn.classList.remove('playing');
    }
  }

  /**
   * High-end procedural romantic wedding harp & piano melody
   * Synthesizes emotional arpeggiated chords in D Major with soft reverb & chime overtones
   */
  function startProceduralHarpSynth() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!audioContext) {
        audioContext = new AudioContext();
      }
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      isMusicPlaying = true;
      updateAudioButtonUI(true);

      // Emotional chord sequence in D Major (D -> F#m -> G -> A)
      const chordNotes = [
        [293.66, 369.99, 440.00, 587.33], // D maj (D4, F#4, A4, D5)
        [246.94, 293.66, 369.99, 493.88], // Bm / F#m flavor (B3, D4, F#4, B4)
        [196.00, 246.94, 293.66, 392.00], // G maj (G3, B3, D4, G4)
        [220.00, 277.18, 329.63, 440.00]  // A maj (A3, C#4, E4, A4)
      ];

      let chordIndex = 0;
      let noteStep = 0;

      function playHarpNote(freq, delaySec = 0) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        osc.type = 'triangle'; // Warm acoustic tone
        osc.frequency.setValueAtTime(freq, audioContext.currentTime + delaySec);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, audioContext.currentTime + delaySec);

        const now = audioContext.currentTime + delaySec;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.12, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);

        osc.start(now);
        osc.stop(now + 2.5);
      }

      // Play soft arpeggios continuously
      proceduralMusicInterval = setInterval(() => {
        if (!isMusicPlaying) return;
        const currentChord = chordNotes[chordIndex];
        const freq = currentChord[noteStep % currentChord.length];
        playHarpNote(freq);

        noteStep++;
        if (noteStep % 4 === 0) {
          chordIndex = (chordIndex + 1) % chordNotes.length;
        }
      }, 480);

    } catch (e) {
      console.warn('Web Audio error:', e);
    }
  }

  // =================================================================
  // 4. OPEN INVITATION TRANSITION
  // =================================================================
  function openInvitation() {
    if (isInvitationOpened) return;
    isInvitationOpened = true;

    // Start background music smoothly
    startMusic();

    // Trigger visual opening effects
    coverHero.classList.add('opened');
    body.classList.remove('is-locked');

    // Trigger a petal & confetti burst
    burstPetals(window.innerWidth / 2, window.innerHeight * 0.4, 40);

    // Smoothly scroll down to first invitation card
    setTimeout(() => {
      const firstSection = document.querySelector('.card-ivory');
      if (firstSection) {
        firstSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 600);
  }

  // =================================================================
  // 5. SCRATCH-TO-REVEAL CANVAS LOGIC
  // =================================================================
  function initScratchCard() {
    if (!scratchCanvas) return;
    const ctx = scratchCanvas.getContext('2d');
    const width = 330;
    const height = 220;

    // Set canvas dimensions
    scratchCanvas.width = width;
    scratchCanvas.height = height;

    // Draw luxury metallic gold foil cover
    drawScratchCover(ctx, width, height);

    let isDrawing = false;
    let lastPos = null;
    let scratchedPixels = 0;
    const totalPixels = width * height;

    function getPosition(e) {
      const rect = scratchCanvas.getBoundingClientRect();
      const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (width / rect.width),
        y: (clientY - rect.top) * (height / rect.height)
      };
    }

    function scratch(pos) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      if (lastPos) {
        ctx.lineWidth = 46;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
      ctx.arc(pos.x, pos.y, 23, 0, Math.PI * 2, false);
      ctx.fill();
      lastPos = pos;
    }

    function checkScratchProgress() {
      if (isCardScratched) return;
      try {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        let transparentCount = 0;
        // Sample every 16th pixel for high performance
        for (let i = 3; i < data.length; i += 16) {
          if (data[i] === 0) transparentCount++;
        }
        const scratchedRatio = transparentCount / (data.length / 16);

        if (scratchedRatio > 0.40) {
          completeScratchReveal();
        }
      } catch (err) {
        console.warn('Scratch sample check error', err);
      }
    }

    function completeScratchReveal() {
      if (isCardScratched) return;
      isCardScratched = true;

      // Smooth fade away of remaining canvas
      scratchCanvas.style.opacity = '0';
      scratchCanvas.style.pointerEvents = 'none';

      // Update instruction text
      if (scratchInstruction) {
        scratchInstruction.innerHTML = '<span>✨ Auspicious Date Revealed! ✨</span>';
        scratchInstruction.style.background = 'rgba(212, 175, 55, 0.35)';
      }

      // Pop petals & confetti right from the card!
      const rect = scratchCanvas.getBoundingClientRect();
      burstPetals(rect.left + rect.width / 2, rect.top + rect.height / 2, 60);
    }

    // Touch & Mouse Handlers
    function startScratching(e) {
      if (isCardScratched) return;
      isDrawing = true;
      scratch(getPosition(e));
      e.preventDefault();
    }

    function handleMove(e) {
      if (!isDrawing || isCardScratched) return;
      scratch(getPosition(e));
      checkScratchProgress();
      e.preventDefault();
    }

    function endScratching() {
      isDrawing = false;
      lastPos = null;
      checkScratchProgress();
    }

    scratchCanvas.addEventListener('mousedown', startScratching);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', endScratching);

    scratchCanvas.addEventListener('touchstart', startScratching, { passive: false });
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', endScratching);
  }

  function drawScratchCover(ctx, w, h) {
    // Rich Gold Foil Gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#c79c3b');
    grad.addColorStop(0.3, '#fbe39d');
    grad.addColorStop(0.5, '#deb452');
    grad.addColorStop(0.8, '#ecd490');
    grad.addColorStop(1, '#9b711e');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Decorative hairline border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    // Diamond motif in corners
    ctx.fillStyle = '#ffffff';
    drawDiamond(ctx, 10, 10, 5);
    drawDiamond(ctx, w - 10, 10, 5);
    drawDiamond(ctx, 10, h - 10, 5);
    drawDiamond(ctx, w - 10, h - 10, 5);

    // Cover Text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#09172e';

    ctx.font = 'bold 11px Montserrat, sans-serif';
    ctx.fillText('✨ SPECIAL REVEAL ✨', w / 2, h / 2 - 28);

    ctx.font = 'bold 20px "Cinzel", serif';
    ctx.fillText('SCRATCH HERE', w / 2, h / 2 + 4);

    ctx.font = '12px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('Touch & scratch to reveal wedding date', w / 2, h / 2 + 28);
  }

  function drawDiamond(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size, y);
    ctx.closePath();
    ctx.fill();
  }

  // =================================================================
  // 6. STARDUST & PETALS PARTICLES ENGINE
  // =================================================================
  let stardustParticles = [];
  let petals = [];

  function initCanvases() {
    function resize() {
      if (stardustCanvas) {
        stardustCanvas.width = window.innerWidth;
        stardustCanvas.height = window.innerHeight;
      }
      if (petalCanvas) {
        petalCanvas.width = window.innerWidth;
        petalCanvas.height = window.innerHeight;
      }
    }
    resize();
    window.addEventListener('resize', resize);

    // Generate initial ambient stardust particles
    const count = 35;
    for (let i = 0; i < count; i++) {
      stardustParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.7 + 0.2,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: (Math.random() - 0.5) * 0.35,
        pulseSpeed: Math.random() * 0.02 + 0.01
      });
    }

    animateFX();
  }

  function animateFX() {
    // 1. Draw Stardust
    if (stardustCanvas) {
      const ctx = stardustCanvas.getContext('2d');
      ctx.clearRect(0, 0, stardustCanvas.width, stardustCanvas.height);

      for (let p of stardustParticles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.008;

        if (p.x < 0) p.x = stardustCanvas.width;
        if (p.x > stardustCanvas.width) p.x = 0;
        if (p.y < 0) p.y = stardustCanvas.height;
        if (p.y > stardustCanvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 230, 200, ${Math.max(0.1, Math.min(0.9, p.alpha))})`;
        ctx.shadowColor = '#d4af37';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // 2. Draw Petals & Confetti
    if (petalCanvas && petals.length > 0) {
      const pCtx = petalCanvas.getContext('2d');
      pCtx.clearRect(0, 0, petalCanvas.width, petalCanvas.height);

      for (let i = petals.length - 1; i >= 0; i--) {
        const pt = petals[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += pt.gravity;
        pt.angle += pt.rotSpeed;
        pt.life--;

        // Draw rotated petal
        pCtx.save();
        pCtx.translate(pt.x, pt.y);
        pCtx.rotate(pt.angle);

        if (pt.isGold) {
          // Golden sparkle square/confetti
          pCtx.fillStyle = `rgba(240, 200, 80, ${pt.life / 100})`;
          pCtx.fillRect(-pt.size / 2, -pt.size / 2, pt.size, pt.size * 0.7);
        } else {
          // Rose petal ellipse
          pCtx.beginPath();
          pCtx.ellipse(0, 0, pt.size, pt.size * 0.6, 0, 0, Math.PI * 2);
          pCtx.fillStyle = `rgba(${pt.color}, ${Math.min(1, pt.life / 60)})`;
          pCtx.fill();
        }

        pCtx.restore();

        if (pt.life <= 0 || pt.y > petalCanvas.height + 20) {
          petals.splice(i, 1);
        }
      }
    }

    requestAnimationFrame(animateFX);
  }

  function burstPetals(originX, originY, count = 50) {
    const colors = [
      '14, 43, 92',    // Deep royal sapphire blue
      '25, 70, 145',   // Rich royal blue
      '65, 125, 210',  // Soft celestial blue
      '255, 245, 235', // Warm ivory
      '212, 175, 55'   // Gold
    ];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
      const speed = Math.random() * 8 + 3;
      const isGold = Math.random() > 0.6;

      petals.push({
        x: originX + (Math.random() - 0.5) * 20,
        y: originY + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        gravity: 0.15,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.12,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        isGold: isGold,
        life: Math.random() * 60 + 80
      });
    }
  }

  // =================================================================
  // 7. CALENDAR (.ICS & GOOGLE CALENDAR) EXPORT
  // =================================================================
  function initCalendarActions() {
    if (!btnAddToCalendar) return;

    btnAddToCalendar.addEventListener('click', () => {
      const { groom, bride, venue, weddingDateISO, dateFormatted, timeFormatted } = WEDDING_CONFIG;
      const title = `Wedding: ${groom.name} & ${bride.name}`;
      const location = `${venue.name}, ${venue.city}, ${venue.district || ''}`;
      const description = `Wedding ceremony of ${groom.name} & ${bride.name} on ${dateFormatted} (${timeFormatted}) at ${venue.name}. Directions: ${venue.mapLink}`;

      // Start: 20261220T110000 / End: 20261220T150000 (IST UTC+5:30 -> UTC 05:30 to 09:30)
      const startDateUTC = '20261220T053000Z';
      const endDateUTC = '20261220T093000Z';

      // 1. Offer Google Calendar link or .ics download
      const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDateUTC}/${endDateUTC}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;

      // Generate iCal (.ics) string for iOS/Mac/Outlook
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Wedding Invitation//EN',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        `DTSTART:${startDateUTC}`,
        `DTEND:${endDateUTC}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      // Create downloadable blob
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', `Wedding_${groom.shortName}_${bride.shortName}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Also alert options
      setTimeout(() => {
        if (confirm('iCalendar event downloaded! Would you also like to open Google Calendar?')) {
          window.open(googleCalUrl, '_blank');
        }
      }, 500);
    });
  }

  // =================================================================
  // 8. SHARE INVITATION (Native Web Share & WhatsApp)
  // =================================================================
  function initShareAction() {
    if (!btnShareInvite) return;

    btnShareInvite.addEventListener('click', () => {
      const { groom, bride, contact } = WEDDING_CONFIG;
      const shareData = {
        title: `Wedding Invitation: ${groom.name} & ${bride.name}`,
        text: contact.shareMessage || `You're warmly invited to the wedding celebration of ${groom.name} & ${bride.name}!`,
        url: window.location.href
      };

      if (navigator.share) {
        navigator.share(shareData).catch(() => {
          fallbackWhatsAppShare();
        });
      } else {
        fallbackWhatsAppShare();
      }
    });

    function fallbackWhatsAppShare() {
      const { contact } = WEDDING_CONFIG;
      const text = `${contact.shareMessage}\n${window.location.href}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  }

  // =================================================================
  // 9. SCROLL REVEAL OBSERVER & BACK TO TOP
  // =================================================================
  function initScrollObservers() {
    const revealCards = document.querySelectorAll('[data-reveal]');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      }, {
        threshold: 0.15
      });

      revealCards.forEach(card => observer.observe(card));
    } else {
      revealCards.forEach(card => card.classList.add('is-visible'));
    }

    if (btnScrollTop) {
      btnScrollTop.addEventListener('click', () => {
        const firstCard = document.querySelector('.card-ivory');
        if (firstCard) {
          firstCard.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
  }

  // =================================================================
  // 10. EDIT HELPER PANEL (Interactive live live-editing)
  // =================================================================
  function initCustomizerPanel() {
    const panel = document.getElementById('customizerPanel');
    const toggleBtn = document.getElementById('toggleCustomizerBtn');
    const form = document.getElementById('customizerForm');
    const resetBtn = document.getElementById('btnResetDefaults');

    if (!panel || !toggleBtn || !form) return;

    toggleBtn.addEventListener('click', () => {
      panel.classList.toggle('collapsed');
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      WEDDING_CONFIG.groom.name = document.getElementById('inputGroom').value;
      WEDDING_CONFIG.bride.name = document.getElementById('inputBride').value;
      WEDDING_CONFIG.dateFormatted = document.getElementById('inputDate').value;
      WEDDING_CONFIG.timeFormatted = document.getElementById('inputTime').value;
      WEDDING_CONFIG.venue.name = document.getElementById('inputVenue').value;
      WEDDING_CONFIG.venue.city = document.getElementById('inputLocation').value;
      WEDDING_CONFIG.venue.mapLink = document.getElementById('inputMapLink').value;
      WEDDING_CONFIG.contact.whatsappNumber = document.getElementById('inputWhatsapp').value;

      applyWeddingConfig();
      panel.classList.add('collapsed');
      alert('Wedding details updated live!');
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        document.getElementById('inputGroom').value = 'ASSAN A';
        document.getElementById('inputBride').value = 'SUMAYYA J';
        document.getElementById('inputDate').value = '20 DECEMBER 2026';
        document.getElementById('inputTime').value = '11:00 AM TO 3:00 PM';
        document.getElementById('inputVenue').value = 'Pankaja Auditorium';
        document.getElementById('inputLocation').value = 'Mudappaloor';
        document.getElementById('inputMapLink').value = 'https://maps.app.goo.gl/8tPDfiJvE3bpFy9u6?g_st=aw';
        document.getElementById('inputWhatsapp').value = '919876543210';
      });
    }
  }

  // =================================================================
  // INITIALIZATION ON DOM READY
  // =================================================================
  document.addEventListener('DOMContentLoaded', () => {
    applyWeddingConfig();
    initCountdown();
    initAudioEngine();
    initCanvases();
    initScratchCard();
    initCalendarActions();
    initShareAction();
    initScrollObservers();
    initCustomizerPanel();

    // Event Listeners for Opening & Audio
    if (openInvitationBtn) {
      openInvitationBtn.addEventListener('click', openInvitation);
    }

    if (audioToggleBtn) {
      audioToggleBtn.addEventListener('click', toggleMusic);
    }
  });

})();

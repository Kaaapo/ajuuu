/* ============================================
   ME VALE V - TITO DOUBLE P
   Landing Page · JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // === ELEMENTS ===
    const introScreen    = document.getElementById('intro-screen');
    const enterBtn       = document.getElementById('enter-btn');
    const mainContent    = document.getElementById('main-content');
    const audio          = document.getElementById('audio-player');
    const playPauseBtn   = document.getElementById('play-pause-btn');
    const playIcon       = document.getElementById('play-icon');
    const pauseIcon      = document.getElementById('pause-icon');
    const progressContainer = document.getElementById('progress-container');
    const progressBar    = document.getElementById('progress-bar');
    const timeDisplay    = document.getElementById('time-display');
    const volumeSlider   = document.getElementById('volume-slider');
    const visualizer     = document.getElementById('visualizer');

    // === INTRO → MAIN ===
    enterBtn.addEventListener('click', () => {
        // Fade out intro
        introScreen.style.opacity = '0';
        introScreen.style.transform = 'scale(1.1)';
        
        setTimeout(() => {
            introScreen.classList.add('hidden');
            mainContent.classList.remove('hidden');

            // Reproducir
            audio.volume = parseFloat(volumeSlider.value);
            audio.muted = false;

            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('Audio reproduciendo correctamente');
                    updatePlayState(true);
                    // Visualizador decorativo (no toca el audio)
                    drawFakeVisualizer();
                }).catch((error) => {
                    console.error('Error al reproducir:', error);
                    updatePlayState(false);
                });
            }

            // Iniciar animaciones de scroll
            initScrollAnimations();
        }, 800);
    });

    // === PLAY / PAUSE ===
    playPauseBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play().then(() => {
                updatePlayState(true);
            }).catch((error) => {
                console.error('Error al reproducir:', error);
            });
        } else {
            audio.pause();
            updatePlayState(false);
        }
    });

    function updatePlayState(isPlaying) {
        if (isPlaying) {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
        } else {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
        }
    }

    // === DEBUG: eventos del audio ===
    audio.addEventListener('canplay', () => console.log('Audio listo para reproducir'));
    audio.addEventListener('playing', () => console.log('Audio está sonando'));
    audio.addEventListener('error', (e) => console.error('Error de audio:', e.target.error));
    audio.addEventListener('stalled', () => console.warn('Audio se atoró al cargar'));
    audio.addEventListener('waiting', () => console.log('Audio esperando datos...'));

    // === PROGRESS BAR ===
    audio.addEventListener('timeupdate', () => {
        if (audio.duration && !isNaN(audio.duration)) {
            const pct = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = pct + '%';
            timeDisplay.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration);
        }
    });

    progressContainer.addEventListener('click', (e) => {
        if (audio.duration && !isNaN(audio.duration)) {
            const rect = progressContainer.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            audio.currentTime = pct * audio.duration;
        }
    });

    // === VOLUME ===
    volumeSlider.addEventListener('input', () => {
        audio.volume = parseFloat(volumeSlider.value);
    });

    // === TIME FORMAT ===
    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return min + ':' + (sec < 10 ? '0' : '') + sec;
    }

    // === AUDIO VISUALIZER (opcional, no rompe el audio) ===
    let visualizerSetup = false;

    function trySetupVisualizer() {
        if (visualizerSetup) return;
        visualizerSetup = true;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            drawVisualizer(analyser, dataArray, bufferLength);
        } catch (err) {
            console.warn('Visualizador no disponible (el audio sigue sonando):', err);
            // Dibujar barras estáticas decorativas
            drawFakeVisualizer();
        }
    }

    function drawVisualizer(analyser, dataArray, bufferLength) {
        const ctx = visualizer.getContext('2d');

        function resize() {
            visualizer.width = visualizer.offsetWidth * window.devicePixelRatio;
            visualizer.height = visualizer.offsetHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
        resize();
        window.addEventListener('resize', resize);

        function render() {
            requestAnimationFrame(render);
            analyser.getByteFrequencyData(dataArray);

            const w = visualizer.offsetWidth;
            const h = visualizer.offsetHeight;
            ctx.clearRect(0, 0, w, h);

            const barCount = 80;
            const barWidth = w / barCount;
            const step = Math.floor(bufferLength / barCount);

            for (let i = 0; i < barCount; i++) {
                const value = dataArray[i * step] / 255;
                const barHeight = value * h * 0.9;
                const hue = 45 + value * 80;
                const lightness = 40 + value * 20;
                ctx.fillStyle = `hsla(${hue}, 80%, ${lightness}%, ${0.6 + value * 0.4})`;
                const x = i * barWidth;
                ctx.fillRect(x, h - barHeight, barWidth - 1, barHeight);
            }
        }
        render();
    }

    function drawFakeVisualizer() {
        const ctx = visualizer.getContext('2d');
        visualizer.width = visualizer.offsetWidth * window.devicePixelRatio;
        visualizer.height = visualizer.offsetHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const w = visualizer.offsetWidth;
        const h = visualizer.offsetHeight;
        const barCount = 80;
        const barWidth = w / barCount;

        function render() {
            requestAnimationFrame(render);
            ctx.clearRect(0, 0, w, h);
            for (let i = 0; i < barCount; i++) {
                const value = (Math.sin(Date.now() / 300 + i * 0.3) + 1) / 2 * 0.4;
                const barHeight = value * h;
                ctx.fillStyle = `hsla(45, 80%, 50%, ${0.3 + value * 0.4})`;
                ctx.fillRect(i * barWidth, h - barHeight, barWidth - 1, barHeight);
            }
        }
        render();
    }

    // === SCROLL ANIMATIONS ===
    function initScrollAnimations() {
        const lyricBlocks = document.querySelectorAll('.lyric-block');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = parseInt(entry.target.dataset.delay) || 0;
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, delay);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        lyricBlocks.forEach(block => observer.observe(block));
    }

    // === PARALLAX SUTIL EN HERO ===
    window.addEventListener('scroll', () => {
        const hero = document.getElementById('hero');
        if (!hero) return;
        const scrollY = window.scrollY;
        const heroContent = hero.querySelector('.hero-content');
        if (heroContent && scrollY < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
            heroContent.style.opacity = 1 - (scrollY / window.innerHeight) * 0.8;
        }
    });

    // === LOOP: cuando termina, reinicia ===
    audio.addEventListener('ended', () => {
        audio.currentTime = 0;
        audio.play();
    });

    // === KEYBOARD: espacio para play/pause ===
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && introScreen.classList.contains('hidden')) {
            e.preventDefault();
            playPauseBtn.click();
        }
    });
});

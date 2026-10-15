/* ==============================================================
   PORTAFOLIO CINEMÁTICO — ANIMACIONES GSAP
   Luis Vidal • Productor de TV + Marketing Digital
   
   Reescrito desde cero — Bloque 3 completo: Sonido
   ============================================================== */

gsap.registerPlugin(ScrollTrigger, Flip, ScrollToPlugin);

// ============================================================
//  APP STATE — Estado interno del módulo (no window global)
// ============================================================
const AppState = {
    introCompleted: false,
    isReducedMotion: false,
    isMobile: false,
    isMuted: true,
    soundToggle: null,
    scrollSafetyTimer: null,
};

// ============================================================
//  SOUND DESIGN — SFX hook (local assets, mute por defecto)
//  Bloque 3: mute por defecto + toggle + localStorage soundEnabled
// ============================================================
const sfx = {
    countdown: new Howl({
        src: ['assets/sfx/countdown-beep.mp3'],
        volume: 0.3,
        mute: true,  // Bloque 3 lo activa
        onloaderror: () => console.debug('SFX load error - countdown'),
    }),
    clap: new Howl({
        src: ['assets/sfx/film-clapperboard.mp3'],
        volume: 0.4,
        onloaderror: () => console.debug('SFX load error - clap'),
    }),
    whoosh: new Howl({
        src: ['assets/sfx/camera-shutter.mp3'],
        volume: 0.3,
        onloaderror: () => console.debug('SFX load error - whoosh'),
    }),
    tick: new Howl({
        src: ['assets/sfx/digital-clock.mp3'],
        volume: 0.2,
        onloaderror: () => console.debug('SFX load error - tick'),
    }),
    typeClick: new Howl({
        src: ['assets/sfx/keyboard-typing.mp3'],
        volume: 0.2,
        onloaderror: () => console.debug('SFX load error - typeClick'),
    })
};

// ============================================================
//  HELPER: prefers-reduced-motion
// ============================================================
function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ============================================================
//  CONTENT LOAD — data/site.json (Bloque 8.2)
//  Renderiza el contenido ANTES de inicializar GSAP/ScrollTrigger.
//  Fallback: si el fetch falla o supera 1500ms, se conserva el HTML
//  hardcodeado (contenido semilla). El sitio nunca queda en blanco.
// ============================================================
const CONTENT_TIMEOUT_MS = 1500;
let contentPromise = null;

async function loadContent() {
    try {
        const res = await fetch('data/site.json', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data || typeof data !== 'object') throw new Error('JSON inválido');
        return data;
    } catch (err) {
        console.error('[site.json] No se pudo cargar el contenido; se usa el HTML estático.', err);
        return null;
    }
}

// Arranca la carga una sola vez (se solapa con el load de recursos).
function startContentLoad() {
    if (!contentPromise) {
        contentPromise = Promise.race([
            loadContent(),
            new Promise((resolve) => setTimeout(() => resolve(null), CONTENT_TIMEOUT_MS))
        ]);
    }
    return contentPromise;
}

function setText(selector, value) {
    if (value === undefined || value === null) return;
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
}

function renderContent(data) {
    renderHero(data.hero);
    renderAbout(data.about);
    renderGallery(data.gallery);
    renderSocial(data.social);
    renderContact(data.contact);
}

function renderHero(hero) {
    if (!hero) return;
    setText('.hero-title', hero.name);
    setText('.hero-subtitle', hero.subtitle);
    setText('.hero-subtitle-2', hero.subtitle2);
    setText('.cta-text', hero.ctaText);

    // Glitch: se sincroniza con el nombre (decorativo, no editable)
    const glitch = document.querySelector('.hero-photo-glitch');
    if (glitch && hero.name) glitch.setAttribute('data-text', hero.name);

    // Foto del hero: solo se aplica si hay ruta definida
    const photo = document.getElementById('heroPhoto');
    if (photo) {
        if (hero.photo) photo.setAttribute('src', hero.photo);
        if (hero.photoAlt) photo.setAttribute('alt', hero.photoAlt);
    }
}

function renderAbout(about) {
    if (!about) return;
    setText('.about-title', about.title);

    // Párrafos
    const body = document.querySelector('.about-body');
    if (body && Array.isArray(about.paragraphs) && about.paragraphs.length) {
        body.innerHTML = '';
        about.paragraphs.forEach((text) => {
            const p = document.createElement('p');
            p.className = 'about-paragraph';
            p.textContent = text;
            body.appendChild(p);
        });
    }

    // Timeline (se conserva .timeline-track y se reemplazan los items)
    const timeline = document.querySelector('.timeline');
    if (timeline && Array.isArray(about.timeline) && about.timeline.length) {
        timeline.querySelectorAll('.timeline-item').forEach((el) => el.remove());
        about.timeline.forEach((item) => {
            const wrap = document.createElement('div');
            wrap.className = 'timeline-item';

            const dot = document.createElement('div');
            dot.className = 'timeline-dot';

            const content = document.createElement('div');
            content.className = 'timeline-content';

            const year = document.createElement('span');
            year.className = 'timeline-year';
            year.textContent = item.year;

            const p = document.createElement('p');
            p.textContent = `${item.role}, ${item.company}`;

            content.appendChild(year);
            content.appendChild(p);
            wrap.appendChild(dot);
            wrap.appendChild(content);
            timeline.appendChild(wrap);
        });
    }
}

function renderGallery(gallery) {
    const track = document.querySelector('.gallery-track');
    if (!track || !Array.isArray(gallery) || !gallery.length) return;

    track.innerHTML = '';
    gallery.forEach((item, i) => {
        const n = i + 1;

        const el = document.createElement('div');
        el.className = 'gallery-item';
        el.setAttribute('data-project', String(n));

        const media = document.createElement('div');
        media.className = 'gallery-media';

        if (item.image) {
            const img = document.createElement('img');
            img.className = 'gallery-image';
            img.setAttribute('src', item.image);
            img.setAttribute('alt', item.alt || item.title || '');
            media.appendChild(img);
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'gallery-placeholder';
            const label = document.createElement('span');
            label.className = 'gallery-label';
            label.textContent = `PROYECTO ${n}`;
            placeholder.appendChild(label);
            media.appendChild(placeholder);
        }

        const info = document.createElement('div');
        info.className = 'gallery-info';
        const title = document.createElement('h3');
        title.className = 'gallery-title';
        title.textContent = item.title;
        const desc = document.createElement('p');
        desc.className = 'gallery-desc';
        desc.textContent = item.description;
        info.appendChild(title);
        info.appendChild(desc);

        el.appendChild(media);
        el.appendChild(info);
        track.appendChild(el);
    });
}

function renderSocial(social) {
    if (!Array.isArray(social) || !social.length) return;
    const byPlatform = {};
    social.forEach((s) => { if (s && s.platform) byPlatform[s.platform] = s; });

    document.querySelectorAll('.social-link').forEach((link) => {
        const item = byPlatform[link.getAttribute('data-platform')];
        if (!item) return;
        if (item.url) link.setAttribute('href', item.url);
        const span = link.querySelector('span');
        if (span && item.label) span.textContent = item.label;
    });
}

function renderContact(contact) {
    if (!contact) return;
    setText('.contact-title', contact.title);
    setText('.contact-subtitle', contact.subtitle);
    setText('.submit-text', contact.buttonText);
}

// ============================================================
//  SOUND CONTROL — Bloque 3: mute por defecto + toggle + localStorage
// ============================================================
function setupSFX_preIntro() {
    // Restaurar estado desde localStorage soundEnabled (clave acordada)
    const saved = localStorage.getItem('soundEnabled');
    const svg = document.querySelector('.sound-icon');
    
    if (saved === 'true') {
        // Sonido ACTIVADO (guardado por el usuario)
        AppState.isMuted = false;
        Howler.mute(false);
        if (svg) svg.setAttribute('data-state', 'active');
    } else {
        // Sonido MUTEADO (por defecto o no guardado)
        AppState.isMuted = true;
        Howler.mute(true);
        if (svg) svg.setAttribute('data-state', 'muted');
    }
    
    // Guardar referencia para actualización del UI
    AppState.soundToggle = document.getElementById('soundToggle');
}

function toggleSound() {
    // Alternar estado
    AppState.isMuted = !AppState.isMuted;
    Howler.mute(AppState.isMuted);
    
    // Actualizar UI del botón usando data-state
    if (AppState.soundToggle) {
        const svg = AppState.soundToggle.querySelector('.sound-icon');
        if (svg) {
            svg.setAttribute('data-state', AppState.isMuted ? 'muted' : 'active');
        }

        if (AppState.isMuted) {
            // Sonido MUTEADO → aria-pressed="false", aria-label="Activar sonido"
            AppState.soundToggle.setAttribute('aria-pressed', 'false');
            AppState.soundToggle.setAttribute('aria-label', 'Activar sonido');
        } else {
            // Sonido ACTIVADO → aria-pressed="true", aria-label="Desactivar sonido"
            AppState.soundToggle.setAttribute('aria-pressed', 'true');
            AppState.soundToggle.setAttribute('aria-label', 'Desactivar sonido');
        }
    }
    
    // Persisitir en localStorage soundEnabled
    localStorage.setItem('soundEnabled', String(!AppState.isMuted));
}

// ============================================================
//  INIT INTRO — Nueva spec del Bloque 2
//  Duración: ≤2.5s desktop, ≤1.5s mobile
// ============================================================
function initIntro() {
    const introContainer = document.getElementById('introContainer');
    const skipBtn = document.getElementById('skipIntro');
    const countdownEl = introContainer.querySelector('.countdown');
    const countdownNumbers = {
        3: introContainer.querySelector('#countdown3'),
        2: introContainer.querySelector('#countdown2'),
        1: introContainer.querySelector('#countdown1'),
    };
    const filmGate = introContainer.querySelector('.film-gate');

    // Si ya se vio en esta sesión, saltar completamente
    if (sessionStorage.getItem('introSeen') === 'true') {
        AppState.introCompleted = true;
        introContainer.style.display = 'none';
        skipBtn.style.display = 'none';
        
        // Deshabilitar botón de sonido durante intro
        if (AppState.soundToggle) {
            AppState.soundToggle.setAttribute('aria-disabled', 'true');
            AppState.soundToggle.setAttribute('disabled', '');
            AppState.soundToggle.style.opacity = '0.5';
            AppState.soundToggle.style.pointerEvents = 'none';
        }
        
        initPostIntro();
        
        // HABILITAR botón de sonido después de intro (skip)
        if (AppState.soundToggle) {
            AppState.soundToggle.removeAttribute('aria-disabled');
            AppState.soundToggle.removeAttribute('disabled');
            AppState.soundToggle.setAttribute('aria-disabled', 'false');
            // Actualizar data-state para reflejar el estado actual de sonido
            const svg = AppState.soundToggle.querySelector('.sound-icon');
            if (svg) {
                svg.setAttribute('data-state', AppState.isMuted ? 'muted' : 'active');
            }
            AppState.soundToggle.style.opacity = '1';
            AppState.soundToggle.style.pointerEvents = 'auto';
        }
        
        return;
    }

    // Detectar mobile
    AppState.isMobile = window.innerWidth <= 767;

    // Reduced motion: skip directo con fade 0.3s
    if (AppState.isReducedMotion) {
        skipBtn.style.display = 'none';
        introContainer.style.display = 'none';
        AppState.introCompleted = true;
        sessionStorage.setItem('introSeen', 'true');
        
        // Deshabilitar botón de sonido durante intro
        if (AppState.soundToggle) {
            AppState.soundToggle.setAttribute('aria-disabled', 'true');
            AppState.soundToggle.setAttribute('disabled', '');
            AppState.soundToggle.style.opacity = '0.5';
            AppState.soundToggle.style.pointerEvents = 'none';
        }
        
        initPostIntro();
        return;
    }

    let introTl;

    // Función de cleanup y onComplete
    const onIntroComplete = () => {
        if (AppState.introCompleted) return;
        AppState.introCompleted = true;
        sessionStorage.setItem('introSeen', 'true');

        // Fade out intro container
        gsap.to(introContainer, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                introContainer.style.display = 'none';
                
                // HABILITAR botón de sonido después de intro/skip
                if (AppState.soundToggle) {
                    AppState.soundToggle.removeAttribute('aria-disabled');
                    AppState.soundToggle.removeAttribute('disabled');
                    AppState.soundToggle.setAttribute('aria-disabled', 'false');
                    // Actualizar data-state para reflejar el estado actual de sonido
                    const svg = AppState.soundToggle.querySelector('.sound-icon');
                    if (svg) {
                        svg.setAttribute('data-state', AppState.isMuted ? 'muted' : 'active');
                    }
                    AppState.soundToggle.style.opacity = '1';
                    AppState.soundToggle.style.pointerEvents = 'auto';
                }
                
                initPostIntro();
            }
        });
    };

    // Construir timeline
    introTl = gsap.timeline({
        onComplete: onIntroComplete
    });

    // SKIP handler — visible desde frame 0
    if (skipBtn) {
        skipBtn.style.display = 'block';
        skipBtn.addEventListener('click', () => {
            if (AppState.introCompleted) return;
            skipBtn.style.display = 'none';
            if (introTl) {
                introTl.progress(1).kill();
            }
        });
    }

    // === DESKTOP vs MOBILE ===
    // Countdown "Movie Countdown": 3 números × 0.4s (zoom-in 0.25s + zoom-out 0.15s)
    // Desktop: countdown 0.0-1.2s, claqueta 1.2-1.9s (total 1.9s)
    // Mobile:  countdown 0.0-1.2s, claqueta 1.2-1.5s (total 1.5s)
    const countdownStarts = [0, 0.4, 0.8]; // nº 3, nº 2, nº 1
    const countdownOrder = [countdownNumbers[3], countdownNumbers[2], countdownNumbers[1]];

    if (!AppState.isMobile) {
        // Countdown (3-2-1) desde 0.0s hasta 1.2s
        if (countdownEl && countdownNumbers[3]) {
            countdownOrder.forEach((num, i) => {
                const at = countdownStarts[i];
                gsap.set(num, { opacity: 0, scale: 1.4 });
                introTl.to(num, {
                    opacity: 1, scale: 1,
                    duration: 0.25,
                    ease: 'power2.out'
                }, at);
                introTl.to(num, {
                    opacity: 0, scale: 0.8,
                    duration: 0.15,
                    ease: 'power2.in'
                }, at + 0.25);
            });
        }

        // Film-gate fade — 1.2s hasta 1.9s
        if (filmGate) {
            introTl.to(filmGate, {
                opacity: 0,
                duration: 0.7,
                ease: 'power2.inOut'
            }, 1.2);
        }

    } else {
        // Countdown (3-2-1) desde 0.0s hasta 1.2s (mismo timing)
        if (countdownEl && countdownNumbers[3]) {
            countdownOrder.forEach((num, i) => {
                const at = countdownStarts[i];
                gsap.set(num, { opacity: 0, scale: 1.4 });
                introTl.to(num, {
                    opacity: 1, scale: 1,
                    duration: 0.25,
                    ease: 'power2.out'
                }, at);
                introTl.to(num, {
                    opacity: 0, scale: 0.8,
                    duration: 0.15,
                    ease: 'power2.in'
                }, at + 0.25);
            });
        }

        // Film-gate fade — 1.2s hasta 1.5s
        if (filmGate) {
            introTl.to(filmGate, {
                opacity: 0,
                duration: 0.3,
                ease: 'power2.inOut'
            }, 1.2);
        }
    }
}

// ============================================================
//  POST-INTRO INITIALIZATION
//  Todo lo que depende de la intro se inicia aquí
// ============================================================
function initPostIntro() {
    // Unlock scroll
    document.body.style.overflow = '';

    // Cancelar el timeout de seguridad del scroll (arranque normal)
    if (AppState.scrollSafetyTimer !== null) {
        clearTimeout(AppState.scrollSafetyTimer);
        AppState.scrollSafetyTimer = null;
    }

    // Iniciar animaciones del hero
    initHeroAnimations();

    // Iniciar parallax
    initParallax();

    // Iniciar scroll progress (con gradiente ámbar)
    initScrollProgress();

    // Iniciar header behavior
    initHeaderBehavior();

    // Iniciar section transitions (ScrollTriggers)
    initSectionTransitions();

    // Iniciar gallery
    new GalleryController();

    // Iniciar contact form
    initContactForm();

    // Iniciar navegación
    initSmoothNavigation();

    // Refresh ScrollTriggers para recalcular posiciones
    ScrollTrigger.refresh();
}

// ============================================================
//  HERO ANIMATIONS — Typewriter + Reveals + Glow
// ============================================================
function initHeroAnimations() {
    if (prefersReducedMotion()) return;

    const heroTl = gsap.timeline({
        onComplete: () => {
            startHeroGlitch();
        }
    });

    // Texto principal (Typewriter)
    heroTl.from(".hero-title-wrap", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out"
    }, 0);

    // Subtítulos con stagger
    heroTl.from([".hero-subtitle", ".hero-subtitle-2"], {
        opacity: 0,
        y: 30,
        stagger: {
            amount: 0.4,
            ease: "power2.out"
        },
        duration: 0.6
    }, "-=0.3");

    // CTA Button bounce-in
    heroTl.from(".cta-button", {
        opacity: 0,
        scale: 0,
        rotation: -15,
        duration: 1,
        ease: "elastic.out(1, 0.4)"
    }, "-=0.3");

    // Foto hero con reveal radial
    heroTl.from(".hero-photo-frame", {
        clipPath: "circle(0% at 50% 50%)",
        scale: 0.8,
        opacity: 0,
        duration: 1.5,
        ease: "power4.inOut"
    }, 0);

    // Glow pulso ambiente
    heroTl.to(".cta-glow", {
        opacity: 0.3,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
    }, "-=0.5");
}

// ============================================================
//  HERO GLITCH — Con cleanup de intervalo + reduced-motion check
// ============================================================
// Referencia interna al módulo para cleanup de glitch
let heroGlitchInterval = null;

function startHeroGlitch() {
    // Respeta prefers-reduced-motion inline
    if (prefersReducedMotion()) return;

    const photo = document.querySelector(".hero-photo");
    if (!photo) return;

    const runGlitch = () => {
        // Verificar reduced motion en cada tick
        if (prefersReducedMotion()) {
            if (heroGlitchInterval) clearInterval(heroGlitchInterval);
            return;
        }

        // Glitch transform
        gsap.to(photo, {
            duration: 0.3,
            ease: "power2.inOut",
            x: gsap.utils.random([-5, 0, 5]),
            y: gsap.utils.random([-3, 0, 3]),
            scale: 1.02,
            repeat: 3,
            yoyo: true,
            onRepeat: () => {
                if (sfx.whoosh) sfx.whoosh.play();
            }
        });

        // Glitch text overlay
        gsap.to(".hero-photo-glitch", {
            opacity: 0.1,
            duration: 0.05,
            repeat: 5,
            yoyo: true
        });
    };

    // Limpiar cualquier intervalo previo (módulo interno)
    if (heroGlitchInterval) clearInterval(heroGlitchInterval);

    // Iniciar nuevo intervalo
    heroGlitchInterval = setInterval(runGlitch, 5000);
}

// ============================================================
//  SCROLL PROGRESS BAR — Gradiente ámbar (fix aplicado)
// ============================================================
function initScrollProgress() {
    const progressBar = document.querySelector(".scroll-progress-bar");
    if (!progressBar) return;

    const totalHeight = document.body.scrollHeight - window.innerHeight;

    window.addEventListener("scroll", () => {
        const scrollPercent = (window.scrollY / totalHeight) * 100;
        progressBar.style.width = `${scrollPercent}%`;
    });
}

// ============================================================
//  HEADER SCROLL BEHAVIOR — Transparente → Sólido
// ============================================================
function initHeaderBehavior() {
    const header = document.querySelector(".header");
    if (!header) return;

    ScrollTrigger.create({
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => {
            if (self.scrollY > 80) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        }
    });
}

// ============================================================
//  SECTION TRANSITIONS — Cinematic Entrance
//  Inicializados DESPUÉS de la intro
// ============================================================
function initSectionTransitions() {
    // About section entrance
    const aboutTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".about-section",
            start: "top 85%",
            toggleActions: "play none none reverse"
        }
    });

    aboutTl.from([".about-title", ".about-paragraph"], {
        opacity: 0,
        y: 40,
        stagger: 0.2,
        duration: 0.8,
        ease: "power3.out"
    });

    aboutTl.from(".timeline-item", {
        opacity: 0,
        x: -30,
        stagger: 0.15,
        duration: 0.6,
        ease: "power2.out"
    }, "-=0.5");

    // Timeline dots pulsating
    gsap.utils.toArray(".timeline-dot").forEach((dot) => {
        gsap.to(dot, {
            boxShadow: "0 0 20px var(--accent-glow)",
            repeat: -1,
            yoyo: true,
            duration: 1.5,
            ease: "sine.inOut"
        });
    });

    // Gallery entrance
    const galleryTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".gallery-section",
            start: "top 90%",
            toggleActions: "play none none reverse"
        }
    });

    galleryTl.from(".gallery-section .film-sprocket", {
        scaleX: 0,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });

    galleryTl.from(".gallery-item", {
        opacity: 0,
        y: 50,
        rotationX: -15,
        stagger: {
            amount: 0.8,
            grid: [3, 2]
        },
        duration: 0.8,
        ease: "power3.out"
    }, "-=0.3");

    galleryTl.from(".gallery-controls", {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power2.out"
    }, "-=0.2");

    // Contact entrance
    const contactTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".contact-section",
            start: "top 90%",
            toggleActions: "play none none reverse"
        }
    });

    contactTl.from([".contact-title", ".contact-subtitle"], {
        opacity: 0,
        y: 30,
        stagger: 0.2,
        duration: 0.6,
        ease: "power2.out"
    });

    contactTl.from(".contact-card, .social-links", {
        opacity: 0,
        y: 30,
        stagger: 0.3,
        duration: 0.6,
        ease: "power2.out"
    }, "-=0.3");

    // Footer entrance
    ScrollTrigger.create({
        trigger: ".footer",
        start: "top 90%",
        onEnter: () => {
            gsap.from(".footer .footer-brand", {
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: "power3.out"
            });
            gsap.from(".footer .footer-meta, .footer .footer-copy", {
                opacity: 0,
                y: 20,
                stagger: 0.2,
                duration: 0.6,
                delay: 0.2
            });
        }
    });
}

// ============================================================
//  INTERACTIVE GALLERY — Film Strip Navigation
// ============================================================
class GalleryController {
    constructor() {
        this.items = gsap.utils.toArray(".gallery-item");
        this.dotsContainer = document.querySelector(".gallery-dots");
        this.prevBtn = document.querySelector(".gallery-nav.prev");
        this.nextBtn = document.querySelector(".gallery-nav.next");
        this.currentIndex = 0;

        this.initDots();
        this.initControls();
        this.initLightbox();
        this.initHoverEffects();
    }

    initDots() {
        this.items.forEach((_, i) => {
            const dot = document.createElement("div");
            dot.classList.add("gallery-dot");
            if (i === 0) dot.classList.add("active");
            dot.addEventListener("click", () => this.goToSlide(i));
            this.dotsContainer.appendChild(dot);
        });
    }

    initControls() {
        this.prevBtn?.addEventListener("click", () => this.prevSlide());
        this.nextBtn?.addEventListener("click", () => this.nextSlide());
    }

    prevSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
        this.updateActive();
    }

    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.items.length;
        this.updateActive();
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.updateActive();
    }

    updateActive() {
        // Update dots
        document.querySelectorAll(".gallery-dot").forEach((dot, i) => {
            dot.classList.toggle("active", i === this.currentIndex);
        });

        // Scroll to item
        this.items[this.currentIndex].scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center"
        });

        // Animate active item
        gsap.to(this.items[this.currentIndex], {
            scale: 1.03,
            duration: 0.3,
            ease: "power2.out"
        });
    }

    initLightbox() {
        this.items.forEach((item) => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                this.openLightbox(item);
            });
        });
    }

    openLightbox(item) {
        // Guardar el elemento previamente enfocado
        const previouslyFocused = document.activeElement;
        
        // Crear overlay con atributos ARIA
        const overlay = document.createElement("div");
        overlay.classList.add("lightbox-overlay");
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.setAttribute("aria-labelledby", "lightbox-title");
        overlay.innerHTML = `
            <div class="lightbox-content">
                <div class="lightbox-media">
                    <div class="lightbox-placeholder">${item.querySelector(".gallery-label").textContent}</div>
                </div>
                <div class="lightbox-info">
                    <h3 id="lightbox-title" class="lightbox-title">${item.querySelector(".gallery-title").textContent}</h3>
                    <p class="lightbox-desc">${item.querySelector(".gallery-desc").textContent}</p>
                </div>
                <button class="lightbox-close" aria-label="Cerrar (Esc)">✕</button>
            </div>
        `;
        document.body.appendChild(overlay);

        // Enfocar el botón close al abrir
        const closeBtn = overlay.querySelector(".lightbox-close");
        
        // Animate open (iris reveal)
        gsap.from(overlay, {
            clipPath: "circle(0% at 50% 50%)",
            duration: 0.8,
            ease: "power4.inOut",
            onComplete: () => {
                closeBtn.focus();
            }
        });

        // Focus trap - capturar teclas Tab
        const focusableElements = overlay.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        
        if (focusableElements.length > 0) {
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            // Prevent focus leaving the lightbox
            overlay.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        // Shift + Tab
                        if (document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        // Tab
                        if (document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
            });
        }

        // Close handler
        const close = overlay.querySelector(".lightbox-close");
        close.addEventListener("click", () => {
            gsap.to(overlay, {
                clipPath: "circle(0% at 50% 50%)",
                duration: 0.6,
                ease: "power4.inOut",
                onComplete: () => {
                    overlay.remove();
                    // Devolver foco al elemento previamente enfocado
                    previouslyFocused.focus();
                    document.removeEventListener('keydown', escHandler);
                }
            });
        });

        // ESC key para cerrar
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                gsap.to(overlay, {
                    clipPath: "circle(0% at 50% 50%)",
                    duration: 0.6,
                    ease: "power4.inOut",
                    onComplete: () => {
                        overlay.remove();
                        // Devolver foco al elemento previamente enfocado
                        previouslyFocused.focus();
                        document.removeEventListener('keydown', escHandler);
                    }
                });
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    initHoverEffects() {
        this.items.forEach((item) => {
            item.addEventListener("mouseenter", (e) => {
                const rect = item.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                gsap.to(item, {
                    rotationY: (x - 0.5) * 10,
                    rotationX: (0.5 - y) * 10,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            item.addEventListener("mouseleave", () => {
                gsap.to(item, {
                    rotationY: 0,
                    rotationX: 0,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        });
    }
}

// ============================================================
//  CONTACT FORM — Micro-interacciones
// ============================================================
function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    // Form field focus effects
    const inputs = form.querySelectorAll(".form-input, .form-textarea");
    inputs.forEach((input) => {
        input.addEventListener("focus", () => {
            const label = input.previousElementSibling;
            gsap.to(label, {
                color: "rgba(255, 255, 255, 0.8)",
                y: -2,
                duration: 0.2
            });
        });

        input.addEventListener("blur", () => {
            const label = input.previousElementSibling;
            if (!input.value) {
                gsap.to(label, {
                    color: "rgba(255, 255, 255, 0.4)",
                    y: 0,
                    duration: 0.2
                });
            }
        });
    });

    // Submit animation
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector(".submit-button");
        const originalText = submitBtn.querySelector(".submit-text").textContent;

        gsap.to(submitBtn, {
            scale: 0.95,
            duration: 0.1
        });

        setTimeout(() => {
            submitBtn.querySelector(".submit-text").textContent = "¡Enviado!";
            gsap.to(submitBtn, {
                backgroundColor: "rgba(0, 255, 0, 0.1)",
                borderColor: "rgba(0, 255, 0, 0.5)",
                boxShadow: "0 0 30px rgba(0, 255, 0, 0.3)",
                duration: 0.3
            });

            setTimeout(() => {
                submitBtn.querySelector(".submit-text").textContent = originalText;
                gsap.to(submitBtn, {
                    backgroundColor: "transparent",
                    borderColor: "rgba(255, 255, 255, 0.2)",
                    boxShadow: "none",
                    duration: 0.3
                });
                form.reset();
            }, 2000);
        }, 300);
    });
}

// ============================================================
//  PARALLAX BACKGROUND — Hero
//  Fix: ScrollTrigger con trigger definido
// ============================================================
function initParallax() {
    // Respeta prefers-reduced-motion
    if (prefersReducedMotion()) return;

    ScrollTrigger.create({
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
            const offset = self.progress * 100;
            if (gsap.isTweening(".hero-text")) return;
            gsap.set(".hero-text", {
                y: offset,
            });
        }
    });

    // Reset parallax when scrolling back up to hero
    ScrollTrigger.create({
        trigger: ".hero-section",
        start: "bottom top",
        onEnterBack: () => {
            gsap.to(".hero-text", { y: 0, duration: 0.6, ease: "power3.out" });
        }
    });
}

// ============================================================
//  NAVIGATION — Active links on scroll + smooth scroll
// ============================================================
function initSmoothNavigation() {
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = ["hero", "gallery", "contact"];

    // Update active nav link on scroll
    sections.forEach((id) => {
        ScrollTrigger.create({
            trigger: `#${id}`,
            start: "top center",
            end: "bottom center",
            onEnter: () => {
                navLinks.forEach((link) => link.classList.remove("active"));
                const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
                if (activeLink) activeLink.classList.add("active");
            },
            onEnterBack: () => {
                navLinks.forEach((link) => link.classList.remove("active"));
                const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
                if (activeLink) activeLink.classList.add("active");
            }
        });
    });

    // Smooth scroll for nav clicks
    navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute("href"));
            if (target) {
                gsap.to(window, {
                    scrollTo: { y: target, offsetY: 80, autoKill: false },
                    duration: 1.2,
                    ease: "power2.inOut"
                });
            }
        });
    });
}

// ============================================================
//  INIT — Main initialization orchestrator
// ============================================================
function init() {
    // Configurar estado inicial
    AppState.isReducedMotion = prefersReducedMotion();

    // Lock scroll hasta que termine la intro
    document.body.style.overflow = "hidden";

    // Timeout de seguridad: garantiza desbloqueo del scroll si la intro falla
    AppState.scrollSafetyTimer = setTimeout(() => {
        if (!AppState.introCompleted) {
            document.body.style.overflow = '';
        }
    }, 4000);

    // Iniciar intro (verifica sessionStorage y reduced-motion internamente)
    initIntro();
}

// ============================================================
//  EVENT LISTENERS
// ============================================================
window.addEventListener("load", async () => {
    // Cargar y renderizar contenido ANTES de inicializar animaciones.
    // Promise.race garantiza que la intro no se retrase más de 1500ms.
    const content = await startContentLoad();
    if (content) renderContent(content);

    if (prefersReducedMotion()) {
        AppState.isReducedMotion = true;
        // Reduced motion fallback — fade in everything
        document.body.style.overflow = "";
        gsap.set("#introContainer", { display: "none" });
        sessionStorage.setItem('introSeen', 'true');
        AppState.introCompleted = true;
        
        // Deshabilitar botón de sonido durante intro
        if (AppState.soundToggle) {
            AppState.soundToggle.setAttribute('aria-disabled', 'true');
            AppState.soundToggle.setAttribute('disabled', '');
            AppState.soundToggle.style.opacity = '0.5';
            AppState.soundToggle.style.pointerEvents = 'none';
        }
        
        initPostIntro();
        
        // HABILITAR botón de sonido después de intro (reduced motion)
        if (AppState.soundToggle) {
            AppState.soundToggle.removeAttribute('aria-disabled');
            AppState.soundToggle.removeAttribute('disabled');
            AppState.soundToggle.setAttribute('aria-disabled', 'false');
            // Actualizar data-state para reflejar el estado actual de sonido
            const svg = AppState.soundToggle.querySelector('.sound-icon');
            if (svg) {
                svg.setAttribute('data-state', AppState.isMuted ? 'muted' : 'active');
            }
            AppState.soundToggle.style.opacity = '1';
            AppState.soundToggle.style.pointerEvents = 'auto';
        }
    } else {
        // ESCUCHADOR DE CLICK DEL BOTON DE SONIDO EN POST-INTRO
        if (AppState.soundToggle) {
            AppState.soundToggle.addEventListener('click', (e) => {
                e.preventDefault();
                toggleSound();
            });
        }
        
        init();
    }
});

// Resize handler — refresh ScrollTriggers
window.addEventListener("resize", () => {
    ScrollTrigger.refresh();
});

// INICIALIZAR EN CARGA DE LA PÁGINA
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Configurar estado inicial del sonido (bloque 3)
        setupSFX_preIntro();

        // Arrancar la carga del contenido (se prepara el fetch en paralelo)
        startContentLoad();

        // NOTA: initPostIntro() se llama desde initIntro() o initPostIntro() directo si reduced motion
    });
} else {
    // Páginacarga completada
    setupSFX_preIntro();
    startContentLoad();
}
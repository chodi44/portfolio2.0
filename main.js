gsap.registerPlugin(ScrollTrigger);

// --- 1. SITE INITIALIZATION ---
window.addEventListener('load', () => {
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
    
    initSite();
    initThree();

    // AUDIO AUTOPLAY LOGIC
    const soundBtn = document.getElementById('sound-btn');
    const audio = document.getElementById('bg-music');
    let isPlaying = false;

    if(audio && soundBtn) {
        audio.volume = 0.2; 
        
        const updateSoundButton = (playing) => {
            if(playing) {
                soundBtn.querySelector('span').innerText = "SOUND ON";
                soundBtn.classList.remove('paused');
                isPlaying = true;
            } else {
                soundBtn.querySelector('span').innerText = "SOUND OFF";
                soundBtn.classList.add('paused');
                isPlaying = false;
            }
        };

        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.then(_ => {
                updateSoundButton(true);
            })
            .catch(error => {
                const playOnInteraction = () => {
                    audio.play();
                    updateSoundButton(true);
                    document.removeEventListener('click', playOnInteraction);
                };
                document.addEventListener('click', playOnInteraction);
            });
        }

        soundBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isPlaying) {
                audio.pause();
                updateSoundButton(false);
            } else {
                audio.play();
                updateSoundButton(true);
            }
        });
    }
});

// --- MOBILE MENU LOGIC ---
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const closeMenuBtn = document.getElementById('close-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

if(mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.style.opacity = '1';
        mobileMenu.style.pointerEvents = 'auto';
    });
    closeMenuBtn.addEventListener('click', () => {
        mobileMenu.style.opacity = '0';
        mobileMenu.style.pointerEvents = 'none';
    });
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.style.opacity = '0';
            mobileMenu.style.pointerEvents = 'none';
        });
    });
}

// --- 2. SITE ANIMATIONS & NAV SCROLL ---
function initSite() {
    // Nav Scroll Logic
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            // Scrolled down: Opaque background, remove blend mode
            nav.classList.remove('mix-blend-difference', 'bg-black/20', 'border-white/5', 'md:bg-transparent');
            nav.classList.add('bg-black/90', 'backdrop-blur-md', 'shadow-lg', 'border-b', 'border-white/10');
        } else {
            // Top: Transparent with blend mode
            nav.classList.add('mix-blend-difference', 'bg-black/20', 'border-white/5', 'md:bg-transparent');
            nav.classList.remove('bg-black/90', 'backdrop-blur-md', 'shadow-lg', 'border-b', 'border-white/10');
        }
    });

    gsap.to('.hero-text', { y: 0, duration: 1.5, stagger: 0.2, ease: "power4.out" });
    gsap.to('.hero-sub', { opacity: 1, duration: 1, delay: 1 });
    gsap.to('.hero-tagline', { opacity: 1, duration: 1, delay: 1.1 });
    gsap.to('.hero-btn', { opacity: 1, duration: 1, delay: 1.2 });

    gsap.utils.toArray('.reveal-text').forEach(text => {
        gsap.from(text, { scrollTrigger: { trigger: text, start: "top 80%" }, y: 50, opacity: 0, duration: 1, ease: "power3.out" });
    });
    gsap.utils.toArray('.glass-card').forEach(card => {
        gsap.from(card, { scrollTrigger: { trigger: card, start: "top 85%" }, y: 30, opacity: 0, duration: 0.8 });
    });
    gsap.utils.toArray('.project-line-card').forEach(card => {
        gsap.from(card, { scrollTrigger: { trigger: card, start: "top 80%", toggleActions: "play none none reverse" }, y: 50, opacity: 0, duration: 1, ease: "power3.out" });
    });
    gsap.utils.toArray('.reveal-p').forEach(p => {
        gsap.from(p, { scrollTrigger: { trigger: p, start: "top 90%" }, y: 20, opacity: 0, duration: 1 });
    });
}

// --- 3. BACKGROUND SCROLL EFFECT ---
const bgContainer = document.getElementById('bg-container');
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const blurAmount = Math.min(10, scrollY / 50);
    const opacityAmount = Math.max(0.4, 1 - (scrollY / 800));
    requestAnimationFrame(() => {
        bgContainer.style.filter = `blur(${blurAmount}px)`;
        bgContainer.style.opacity = opacityAmount;
    });
});

// --- 4. THREE.JS PARTICLES (OPTIMIZED) ---
function initThree() {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    const geometry = new THREE.BufferGeometry();
    
    // Optimization: Fewer particles on mobile devices
    const particlesCount = window.innerWidth < 768 ? 800 : 2000;
    
    const posArray = new Float32Array(particlesCount * 3);
    for(let i = 0; i < particlesCount * 3; i++) { posArray[i] = (Math.random() - 0.5) * 15; }
    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const material = new THREE.PointsMaterial({ size: 0.02, color: 0x22d3ee, transparent: true, opacity: 0.8 });
    const particlesMesh = new THREE.Points(geometry, material);
    scene.add(particlesMesh);
    camera.position.z = 5;
    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (event) => {
        mouseX = event.clientX / window.innerWidth - 0.5;
        mouseY = event.clientY / window.innerHeight - 0.5;
    });
    const clock = new THREE.Clock();
    function animate() {
        const elapsedTime = clock.getElapsedTime();
        particlesMesh.rotation.y = elapsedTime * 0.05;
        particlesMesh.rotation.x = mouseY * 0.5;
        particlesMesh.rotation.y += mouseX * 0.5;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// --- 5. INTERACTIONS ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');
window.addEventListener('mousemove', (e) => {
    cursorDot.style.left = `${e.clientX}px`; cursorDot.style.top = `${e.clientY}px`;
    gsap.to(cursorOutline, { x: e.clientX, y: e.clientY, duration: 0.15 });
});
document.querySelectorAll('a, button, input, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => cursorOutline.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursorOutline.classList.remove('hovered'));
});

// IMPORTANT: Only enable tilt effect on desktop (prevents mobile shaking)
if (window.matchMedia("(min-width: 768px)").matches) {
    VanillaTilt.init(document.querySelectorAll(".tilt-element"), { max: 10, speed: 400, glare: true, "max-glare": 0.2 });
}

// --- 6. CONTACT FORM (GOOGLE SHEETS) ---
const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const scriptURL = 'https://script.google.com/macros/s/AKfycbwmgnCGxKph8KVeyrj8b0f1b26Lf3Xsgf5Mf9nGQTsqWHqKmMAN8u8PBeo5mhvVNW0FNQ/exec';

if(contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const btnText = submitBtn.querySelector('span');
        const originalText = btnText.innerText;
        
        btnText.innerText = 'SENDING...';
        submitBtn.disabled = true;

        const formData = new FormData(contactForm);

        fetch(scriptURL, { method: 'POST', body: formData})
            .then(response => {
                btnText.innerText = 'MESSAGE SENT!';
                submitBtn.classList.add('bg-green-500', 'text-black');
                contactForm.reset();
                setTimeout(() => {
                    btnText.innerText = originalText;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('bg-green-500', 'text-black');
                }, 3000);
            })
            .catch(error => {
                btnText.innerText = 'FAILED. TRY AGAIN.';
                submitBtn.classList.add('bg-red-500', 'text-white');
                console.error('Error!', error.message);
                setTimeout(() => {
                    btnText.innerText = originalText;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('bg-red-500', 'text-white');
                }, 3000);
            });
    });
}
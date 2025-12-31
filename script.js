// ====== Simple reveal on scroll ======
const reveals = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries, obs)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('show');
        obs.unobserve(entry.target);
      }
    });
  },{threshold:0.12});

  reveals.forEach(r=>io.observe(r));
} else {
  // fallback
  reveals.forEach(r=>r.classList.add('show'));
}

// ====== Counter animation when visible ======
const counters = document.querySelectorAll('.num');

if ('IntersectionObserver' in window) {
  const counterIo = new IntersectionObserver((entries, obs)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const el = entry.target;
        const target = +el.getAttribute('data-target');
        let cur = 0;
        const step = Math.max(1, Math.floor(target / 80));

        const t = setInterval(()=>{
          cur += step;
          if(cur >= target){
            el.textContent = target;
            clearInterval(t);
          } else {
            el.textContent = cur;
          }
        }, 16);

        obs.unobserve(el);
      }
    });
  },{threshold:0.6});

  counters.forEach(c=>counterIo.observe(c));
}

// ====== Mobile menu (dropdown) ======
const menuBtn = document.querySelector('.menu-btn');
const navContainer = document.querySelector('.nav');

if (menuBtn && navContainer) {
  menuBtn.addEventListener('click', () => {
    navContainer.classList.toggle('open');
  });

  // Close menu when a nav link is clicked (for single-page smooth scrolling)
  navContainer.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
      navContainer.classList.remove('open');
    });
  });
}


// ====== Smooth scroll for internal links ======
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    const id = a.getAttribute('href');
    if(id && id.length > 1){
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth',block:'start'});
      }
    }
  });
});

// ====== Back to top button ======
const backToTop = document.querySelector('.back-to-top');
if (backToTop) {
  backToTop.addEventListener('click', ()=>{
    window.scrollTo({top:0,behavior:'smooth'});
  });
}

// ====== Contact form + Formspree integration ======
const form = document.getElementById('contact-form');
const alertBar = document.getElementById('contact-alert');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // we’ll submit with fetch instead

    // Build form data
    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        // show success bar
        if (alertBar) {
          alertBar.classList.add('show');   // we’ll control this with CSS
        }
        form.reset();
      } else {
        alert('Something went wrong sending your message. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please check your connection and try again.');
    }
  });
}


// ====== Hero interactive pattern background ======
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return; // don't run on pages without hero (e.g., about.html)

  const canvas = document.getElementById('hero-pattern');
  const ctx = canvas.getContext('2d');

  let width, height, points = [];
  const POINT_COUNT = 55;

  function resizeCanvas() {
    const rect = hero.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    initPoints();
  }

  function initPoints() {
    points = [];
    for (let i = 0; i < POINT_COUNT; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25
      });
    }
  }

  let mouse = { x: width / 2, y: height / 2, active: false };

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });

  hero.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // update positions
    for (const p of points) {
      p.x += p.vx;
      p.y += p.vy;

      // soft bounce at edges
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
    }

    // draw connections and dots
    for (let i = 0; i < points.length; i++) {
      const p = points[i];

      // lines to nearby points
      for (let j = i + 1; j < points.length; j++) {
        const q = points[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist2 = dx * dx + dy * dy;
        const maxDist = 160;
        if (dist2 < maxDist * maxDist) {
          const alpha = 1 - Math.sqrt(dist2) / maxDist;
          ctx.strokeStyle = `rgba(160, 200, 255, ${alpha * 0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }

      // dot glow
      let radius = 2.2;
      let alphaDot = 0.55;

      if (mouse.active) {
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const md2 = mdx * mdx + mdy * mdy;
        const maxHover = 220;
        if (md2 < maxHover * maxHover) {
          const boost = 1 - Math.sqrt(md2) / maxHover;
          radius += boost * 1.8;
          alphaDot += boost * 0.4;
        }
      }

      ctx.fillStyle = `rgba(200, 230, 255, ${alphaDot})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  requestAnimationFrame(draw);
})();

// ====== Testimonials slider (simple) ======
const track = document.getElementById('testimonial-track');
const prevBtn = document.getElementById('prev-test');
const nextBtn = document.getElementById('next-test');
if(track){
  const slides = Array.from(track.children);
  let index = 0;
  const update = ()=> {
    const width = slides[0].offsetWidth + 18; // card width + gap
    track.style.transform = `translateX(-${index * width}px)`;
  };
  window.addEventListener('resize', update);
  nextBtn && nextBtn.addEventListener('click', ()=>{ index = Math.min(index + 1, slides.length - 1); update(); });
  prevBtn && prevBtn.addEventListener('click', ()=>{ index = Math.max(index - 1, 0); update(); });

  // autoplay small
  let auto = setInterval(()=>{ index = (index + 1) % slides.length; update(); }, 4500);
  // pause on hover
  track.addEventListener('mouseenter', ()=>clearInterval(auto));
  track.addEventListener('mouseleave', ()=> auto = setInterval(()=>{ index = (index + 1) % slides.length; update(); }, 4500));
  // initial
  setTimeout(update, 100);
}


(function () {
  const $menu = $('#menu');
  const $navbar = $('.navbar');
  const scrollTopBtn = document.querySelector('#scroll-top');
  const modalCloseSelector = '[data-modal-close]';
  const focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
  const EMAILJS_CONFIG = {
    serviceId: 'service_2et16yb',
    templateId: 'template_jdhnyhl',
    publicKey: 'qpnoUBcEpERbnzZaH',
  };
  let activeModal = null;
  let lastFocusedElement = null;
  let emailJsInitialised = false;

  const getFocusable = (modal) => {
    if (!modal) return [];
    return Array.from(modal.querySelectorAll(focusableSelectors)).filter(
      (el) => el.offsetParent !== null || el === modal,
    );
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove('is-visible');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    activeModal = null;
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
    lastFocusedElement = null;
  };

  const openModal = (modal) => {
    if (!modal) return;
    if (activeModal && activeModal !== modal) {
      closeModal(activeModal);
    }
    activeModal = modal;
    lastFocusedElement = document.activeElement;
    modal.classList.add('is-visible');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    const [firstFocusable] = getFocusable(modal);
    (firstFocusable || modal).focus();
  };

  const handleKeydown = (event) => {
    if (!activeModal) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal(activeModal);
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = getFocusable(activeModal);
    if (!focusable.length) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const isShift = event.shiftKey;
    const isForwardTab = !isShift && document.activeElement === last;
    const isBackwardTab = isShift && document.activeElement === first;

    if (isForwardTab) {
      event.preventDefault();
      first.focus();
    } else if (isBackwardTab) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-modal-target]');
    if (trigger) {
      event.preventDefault();
      const selector = trigger.getAttribute('data-modal-target');
      const modal = document.querySelector(selector);
      if (modal) {
        openModal(modal);
      }
      return;
    }

    const closeControl = event.target.closest(modalCloseSelector);
    if (closeControl) {
      const modal = closeControl.closest('.resume-modal');
      closeModal(modal);
    }
  });

  $(document).ready(function () {
    $menu.on('click', function () {
      $(this).toggleClass('fa-times');
      $navbar.toggleClass('nav-toggle');
    });

    $(window).on('scroll load', function () {
      $menu.removeClass('fa-times');
      $navbar.removeClass('nav-toggle');

      if (window.scrollY > 60) {
        scrollTopBtn?.classList.add('active');
      } else {
        scrollTopBtn?.classList.remove('active');
      }

      $('section').each(function () {
        const height = $(this).height();
        const offset = $(this).offset().top - 200;
        const top = $(window).scrollTop();
        const id = $(this).attr('id');

        if (top > offset && top < offset + height) {
          $('.navbar ul li a').removeClass('active');
          $('.navbar').find(`[href="#${id}"]`).addClass('active');
        }
      });
    });

    $('a[href*="#"]').on('click', function (e) {
      const target = $(this).attr('href');
      if (target.startsWith('#') && $(target).length) {
        e.preventDefault();
        $('html, body').animate({
          scrollTop: $(target).offset().top,
        }, 500, 'linear');
      }
    });

  });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      document.title = 'Portfolio | Ahrorbek Amanov';
      $('#favicon').attr('href', 'assets/images/favicon.jpg');
    } else {
      document.title = 'Yana qayting! :)';
      $('#favicon').attr('href', 'assets/images/favhand.png');
    }
  });

  new Typed('.typing-text', {
    strings: [
      'Node.js backend development',
      'REST API dizayni',
      'Microservice arxitekturasi',
      'Cloud deploy jarayonlari',
    ],
    loop: true,
    typeSpeed: 55,
    backSpeed: 28,
    backDelay: 600,
  });

  const fetchJson = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(response.statusText);
      return await response.json();
    } catch (error) {
      console.error(`Failed to load ${url}`, error);
      return [];
    }
  };

  const renderSkills = (skills) => {
    const container = document.getElementById('skills-grid');
    if (!container) return;
    if (!Array.isArray(skills) || !skills.length) {
      container.innerHTML = '<p class="empty-state">Tez orada yangilanadi.</p>';
      return;
    }

    container.innerHTML = skills
      .map(
        (skill) => `
        <div class="skill-card">
          <img src="${skill.icon}" alt="${skill.name}">
          <span>${skill.name}</span>
        </div>
      `,
      )
      .join('');
  };

  const renderProjects = (projects) => {
    const container = document.getElementById('projects-grid');
    if (!container) return;
    if (!Array.isArray(projects) || !projects.length) {
      container.innerHTML = '<p class="empty-state">Loyihalar tez orada qo&#39;shiladi.</p>';
      return;
    }

    container.innerHTML = projects
      .map((project) => {
        const viewBtn = project.links?.view
          ? `<a href="${project.links.view}" class="btn" target="_blank" rel="noopener">View <i class="fas fa-eye"></i></a>`
          : '';
        const codeBtn = project.links?.code
          ? `<a href="${project.links.code}" class="btn" target="_blank" rel="noopener">Code <i class="fas fa-code"></i></a>`
          : '';

        return `
        <article class="project-card tilt">
          <img draggable="false" src="${project.image}" alt="${project.name} preview">
          <div class="project-content">
            <h3>${project.name}</h3>
            ${project.stack ? `<p class="project-stack">${project.stack}</p>` : ''}
            <p class="project-desc">${project.desc}</p>
            <div class="project-links">
              ${viewBtn}
              ${codeBtn}
            </div>
          </div>
          ${project.year ? `<span class="project-year">${project.year}</span>` : ''}
        </article>
      `;
      })
      .join('');

    VanillaTilt.init(document.querySelectorAll('.project-card.tilt'), {
      max: 15,
    });
  };

  const initialiseData = async () => {
    const [skills, projects] = await Promise.all([
      fetchJson('./skills.json'),
      fetchJson('./projects/projects.json'),
    ]);

    renderSkills(skills);
    renderProjects(projects);
  };

  initialiseData();

  VanillaTilt.init(document.querySelectorAll('.tilt'), {
    max: 15,
  });

  const sr = ScrollReveal({
    origin: 'top',
    distance: '80px',
    duration: 1000,
    reset: true,
  });

  sr.reveal('.home .content h2', { delay: 150 });
  sr.reveal('.home .lead-line', { delay: 200 });
  sr.reveal('.home .typing-wrapper', { delay: 250 });
  sr.reveal('.home .social-icons li', { interval: 100 });
  sr.reveal('.home .image', { delay: 200 });

  sr.reveal('.about .image', { delay: 200 });
  sr.reveal('.about .content', { delay: 200 });

  sr.reveal('.skills .skills-grid > div', { interval: 120 });
  sr.reveal('.education .education-card', { interval: 160 });
  sr.reveal('.projects .project-card', { interval: 180 });
  sr.reveal('.experience .timeline-card', { interval: 180 });

  const createStars = (containerId, numStars) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    for (let i = 0; i < numStars; i += 1) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.width = `${Math.random() * 3 + 2}px`;
      star.style.height = star.style.width;
      star.style.top = `${Math.random() * 100}%`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 2}s`;
      container.appendChild(star);
    }
  };

  const createCosmicStars = (containerId, numStars) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    for (let i = 0; i < numStars; i += 1) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 6}s`;
      container.appendChild(star);
    }
  };

  const setFormStatus = (element, type, message) => {
    if (!element) return;
    element.textContent = message;
    element.classList.remove('form-status--success', 'form-status--error');
    if (type) {
      element.classList.add(`form-status--${type}`);
    }
  };

  const ensureEmailJsReady = () => {
    if (emailJsInitialised) return true;
    if (typeof emailjs === 'undefined') {
      console.warn('EmailJS SDK is not available on window.emailjs');
      return false;
    }
    emailjs.init(EMAILJS_CONFIG.publicKey);
    emailJsInitialised = true;
    return true;
  };

  const initialiseContactForm = () => {
    const form = document.querySelector('#contact-form');
    if (!form) return;

    const statusEl = form.querySelector('.form-status');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const emailInput = form.elements.user_email;
      const replyToInput = form.elements.reply_to;
      const toEmailInput = form.elements.to_email;
      if (emailInput && replyToInput) {
        replyToInput.value = emailInput.value.trim();
      }
      if (toEmailInput && !toEmailInput.value) {
        toEmailInput.value = 'omonovaxroracc@gmail.com';
      }

      if (!ensureEmailJsReady()) {
        setFormStatus(
          statusEl,
          'error',
          "Xabar yuborilmadi. Iltimos, sahifani qayta yuklab yana urinib ko'ring.",
        );
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('is-loading');
      }

      setFormStatus(statusEl, null, 'Xabar yuborilmoqda...');

      try {
        const debugPayload = Object.fromEntries(new FormData(form).entries());
        console.debug('EmailJS form data payload:', debugPayload);
        await emailjs.sendForm(
          EMAILJS_CONFIG.serviceId,
          EMAILJS_CONFIG.templateId,
          form,
          EMAILJS_CONFIG.publicKey,
        );
        setFormStatus(statusEl, 'success', 'Rahmat! Xabaringiz muvaffaqiyatli yuborildi.');
        form.reset();
        if (replyToInput) {
          replyToInput.value = '';
        }
      } catch (error) {
        console.error('EmailJS contact form error:', error);
        const errorMessage = error?.text || error?.message || "Uzr, xabar yuborilmadi. Iltimos, keyinroq yana urinib ko'ring.";
        setFormStatus(
          statusEl,
          'error',
          errorMessage,
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('is-loading');
        }
        setTimeout(() => {
          if (statusEl) {
            statusEl.textContent = '';
            statusEl.classList.remove('form-status--success', 'form-status--error');
          }
        }, 6000);
      }
    });
  };

  const initStars = () => {
    createStars('education-stars', 80);
    createStars('projects-stars', 80);
    createStars('experience-stars', 80);
    createStars('contact-stars', 70);
    createCosmicStars('skills-cosmic-bg', 45);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStars);
  } else {
    initStars();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiseContactForm);
  } else {
    initialiseContactForm();
  }
})();

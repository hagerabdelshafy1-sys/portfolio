/**
 * HAGAR MOHAMED ABDELSHAFI — GRAPHIC DESIGNER PORTFOLIO
 * Vanilla JavaScript Architecture
 *
 * Modules:
 * 1. Theme Toggle (Dark / Light with localStorage & system preference)
 * 2. Mobile Navigation & Keyboard Accessibility
 * 3. Sticky Navbar & Active Section Observer
 * 4. Scroll Reveal Animations (IntersectionObserver)
 * 5. Parallax Engine (Scroll & Mouse Parallax with requestAnimationFrame)
 * 6. Testimonials Carousel (Accessible, Auto-play, Touch swipe, Keyboard)
 * 7. Contact Form Client-side Validation & Accessible Feedback
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     01. THEME TOGGLE (DARK / LIGHT)
     ========================================================================== */
  const initTheme = () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const rootElement = document.documentElement;
    const STORAGE_KEY = 'hm_portfolio_theme';

    // Default is dark as required
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme ? savedTheme : (systemPrefersDark ? 'dark' : 'dark');

    const applyTheme = (theme) => {
      rootElement.setAttribute('data-theme', theme);
      if (themeToggleBtn) {
        const isDark = theme === 'dark';
        themeToggleBtn.setAttribute('aria-label', isDark ? 'التبديل إلى الوضع النهاري (Light mode)' : 'التبديل إلى الوضع الليلي (Dark mode)');
        themeToggleBtn.setAttribute('title', isDark ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي');
      }
    };

    applyTheme(initialTheme);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const currentTheme = rootElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem(STORAGE_KEY, newTheme);
      });
    }

    // Listen for OS system theme changes if user hasn't set an explicit preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  };

  /* ==========================================================================
     02. MOBILE NAVIGATION & KEYBOARD ACCESSIBILITY
     ========================================================================== */
  const initMobileNav = () => {
    const menuToggleBtn = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!menuToggleBtn || !navMenu) return;

    const toggleMenu = (open) => {
      const isOpen = open !== undefined ? open : menuToggleBtn.getAttribute('aria-expanded') === 'true';
      const newState = !isOpen;
      menuToggleBtn.setAttribute('aria-expanded', String(newState));
      navMenu.classList.toggle('is-open', newState);
      document.body.style.overflow = newState && window.innerWidth <= 860 ? 'hidden' : '';
    };

    menuToggleBtn.addEventListener('click', () => toggleMenu());

    // Close when clicking any nav link
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('is-open')) {
          toggleMenu(false);
        }
      });
    });

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        toggleMenu(false);
        menuToggleBtn.focus();
      }
    });

    // Close when clicking outside menu
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('is-open') && !navMenu.contains(e.target) && !menuToggleBtn.contains(e.target)) {
        toggleMenu(false);
      }
    });
  };

  /* ==========================================================================
     03. STICKY NAVBAR & ACTIVE SECTION OBSERVER
     ========================================================================== */
  const initNavScroll = () => {
    const headerNav = document.getElementById('header-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    // Sticky shadow on scroll
    const handleScroll = () => {
      if (window.scrollY > 40) {
        headerNav?.classList.add('scrolled');
      } else {
        headerNav?.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // IntersectionObserver to highlight active navigation link
    if ('IntersectionObserver' in window) {
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const currentId = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              if (link.getAttribute('href') === `#${currentId}`) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
              } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
              }
            });
          }
        });
      }, {
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
      });

      sections.forEach((section) => sectionObserver.observe(section));
    }
  };

  /* ==========================================================================
     04. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
     ========================================================================== */
  const initScrollReveal = () => {
    if (prefersReducedMotion) {
      document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('is-revealed'));
      return;
    }

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if (!revealElements.length || !('IntersectionObserver' in window)) {
      revealElements.forEach(el => el.classList.add('is-revealed'));
      return;
    }

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.12
    });

    revealElements.forEach(el => revealObserver.observe(el));
  };

  /* ==========================================================================
     05. PARALLAX ENGINE (SCROLL & MOUSE PARALLAX WITH requestAnimationFrame)
     ========================================================================== */
  const initParallax = () => {
    if (prefersReducedMotion) return;

    const shapes = document.querySelectorAll('.ambient-shape');
    if (!shapes.length) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let scrollY = window.scrollY;
    let ticking = false;

    // Track mouse coordinates relative to window center
    window.addEventListener('mousemove', (e) => {
      const halfWidth = window.innerWidth / 2;
      const halfHeight = window.innerHeight / 2;
      mouseX = (e.clientX - halfWidth) / halfWidth;
      mouseY = (e.clientY - halfHeight) / halfHeight;

      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });

    // Track scroll
    window.addEventListener('scroll', () => {
      scrollY = window.scrollY;
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });

    const updateParallax = () => {
      // Smooth lerp
      currentX += (mouseX - currentX) * 0.08;
      currentY += (mouseY - currentY) * 0.08;

      shapes.forEach((shape, index) => {
        const factor = (index + 1) * 18;
        const scrollOffset = scrollY * (0.04 * (index + 1));
        const moveX = currentX * factor;
        const moveY = currentY * factor - scrollOffset;

        shape.style.transform = `translate3d(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px, 0)`;
      });

      if (Math.abs(mouseX - currentX) > 0.001 || Math.abs(mouseY - currentY) > 0.001) {
        requestAnimationFrame(updateParallax);
      } else {
        ticking = false;
      }
    };
  };

  /* ==========================================================================
     06. TESTIMONIALS CAROUSEL (5 ARABIC TESTIMONIALS)
     ========================================================================== */
  const initTestimonialsCarousel = () => {
    const track = document.getElementById('testimonials-track');
    const slides = document.querySelectorAll('.testimonial-slide');
    const prevBtn = document.getElementById('prev-testimonial');
    const nextBtn = document.getElementById('next-testimonial');
    const dotsContainer = document.getElementById('testimonials-dots');
    const container = document.querySelector('.testimonials-carousel-container');

    if (!track || !slides.length) return;

    let currentIndex = 0;
    const totalSlides = slides.length;
    let autoPlayTimer = null;
    let isHovered = false;

    // Generate pagination dots
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.classList.add('slider-dot');
      if (idx === 0) dot.classList.add('active');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
      dot.setAttribute('aria-label', `الانتقال إلى الرأي رقم ${idx + 1}`);
      dot.addEventListener('click', () => {
        goToSlide(idx);
        restartAutoPlay();
      });
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.slider-dot');

    const updateSlidePosition = () => {
      // In LTR coordinate math for reliable CSS translate
      track.style.transform = `translateX(-${currentIndex * 100}%)`;

      // Update active states
      dots.forEach((dot, idx) => {
        const isActive = idx === currentIndex;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-selected', String(isActive));
      });

      slides.forEach((slide, idx) => {
        slide.setAttribute('aria-hidden', idx === currentIndex ? 'false' : 'true');
      });
    };

    const goToSlide = (index) => {
      currentIndex = (index + totalSlides) % totalSlides;
      updateSlidePosition();
    };

    const nextSlide = () => goToSlide(currentIndex + 1);
    const prevSlide = () => goToSlide(currentIndex - 1);

    // Button event listeners
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        restartAutoPlay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        restartAutoPlay();
      });
    }

    // Keyboard navigation
    container?.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        // Since RTL: ArrowRight goes previous in visual Arabic reading order, or explicit direction
        if (e.key === 'ArrowLeft') {
          nextSlide();
        } else {
          prevSlide();
        }
        restartAutoPlay();
      }
    });

    // Touch swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoPlay();
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
      restartAutoPlay();
    }, { passive: true });

    const handleSwipe = () => {
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    };

    // Auto-play feature (pauses on hover/focus)
    const startAutoPlay = () => {
      if (prefersReducedMotion) return;
      stopAutoPlay();
      autoPlayTimer = setInterval(() => {
        if (!isHovered) {
          nextSlide();
        }
      }, 6500);
    };

    const stopAutoPlay = () => {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    };

    const restartAutoPlay = () => {
      stopAutoPlay();
      startAutoPlay();
    };

    container?.addEventListener('mouseenter', () => {
      isHovered = true;
      stopAutoPlay();
    });

    container?.addEventListener('mouseleave', () => {
      isHovered = false;
      startAutoPlay();
    });

    container?.addEventListener('focusin', () => {
      isHovered = true;
      stopAutoPlay();
    });

    container?.addEventListener('focusout', () => {
      isHovered = false;
      startAutoPlay();
    });

    // Initialize slide state
    updateSlidePosition();
    startAutoPlay();
  };

  /* ==========================================================================
     07. CONTACT FORM VALIDATION & ACCESSIBLE FEEDBACK
     ========================================================================== */
  const initContactForm = () => {
    const contactForm = document.getElementById('contact-form');
    const statusMessage = document.getElementById('form-status-message');

    if (!contactForm) return;

    const fields = {
      name: {
        input: document.getElementById('form-name'),
        group: document.getElementById('group-name'),
        error: document.getElementById('error-name'),
        validate: (val) => val.trim().length >= 2,
        errorMessage: 'يرجى إدخال اسمك الكريم (حرفان على الأقل).'
      },
      email: {
        input: document.getElementById('form-email'),
        group: document.getElementById('group-email'),
        error: document.getElementById('error-email'),
        validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
        errorMessage: 'يرجى إدخال بريد إلكتروني صالح للمتابعة.'
      },
      projectType: {
        input: document.getElementById('form-project-type'),
        group: document.getElementById('group-project-type'),
        error: document.getElementById('error-project-type'),
        validate: (val) => val.trim() !== '',
        errorMessage: 'يرجى اختيار نوع المشروع المطلوب.'
      },
      message: {
        input: document.getElementById('form-message'),
        group: document.getElementById('group-message'),
        error: document.getElementById('error-message'),
        validate: (val) => val.trim().length >= 10,
        errorMessage: 'يرجى كتابة تفاصيل مشروعك (10 أحرف على الأقل).'
      }
    };

    // Live validation on blur & input
    Object.keys(fields).forEach((key) => {
      const field = fields[key];
      if (!field.input) return;

      field.input.addEventListener('blur', () => {
        validateField(field);
      });

      field.input.addEventListener('input', () => {
        if (field.group?.classList.contains('has-error')) {
          validateField(field);
        }
      });
    });

    const validateField = (field) => {
      const isValid = field.validate(field.input.value);
      if (!isValid) {
        field.group?.classList.add('has-error');
        if (field.error) {
          field.error.textContent = field.errorMessage;
          field.error.style.display = 'block';
        }
        field.input.setAttribute('aria-invalid', 'true');
      } else {
        field.group?.classList.remove('has-error');
        if (field.error) {
          field.error.textContent = '';
          field.error.style.display = 'none';
        }
        field.input.removeAttribute('aria-invalid');
      }
      return isValid;
    };

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let formIsValid = true;
      let firstInvalidInput = null;

      Object.keys(fields).forEach((key) => {
        const field = fields[key];
        const valid = validateField(field);
        if (!valid) {
          formIsValid = false;
          if (!firstInvalidInput) {
            firstInvalidInput = field.input;
          }
        }
      });

      if (!formIsValid) {
        if (firstInvalidInput) {
          firstInvalidInput.focus();
        }
        if (statusMessage) {
          statusMessage.className = 'form-status-message error';
          statusMessage.textContent = 'يرجى تصحيح الحقول المميزة أعلاه قبل الإرسال.';
          statusMessage.style.display = 'block';
        }
        return;
      }

      // Simulate successful submission
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = 'جاري الإرسال...';

      setTimeout(() => {
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;

        if (statusMessage) {
          statusMessage.className = 'form-status-message success';
          statusMessage.textContent = 'شكرًا لتواصلك! تم استلام رسالتك بنجاح، وسأقوم بالرد عليك في أقرب وقت.';
          statusMessage.style.display = 'block';
          statusMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Auto-hide success message after 7 seconds
        setTimeout(() => {
          if (statusMessage) statusMessage.style.display = 'none';
        }, 7000);
      }, 800);
    });
  };

  /* ==========================================================================
     INITIALIZE ALL MODULES
     ========================================================================== */
  initTheme();
  initMobileNav();
  initNavScroll();
  initScrollReveal();
  initParallax();
  initTestimonialsCarousel();
  initContactForm();
});

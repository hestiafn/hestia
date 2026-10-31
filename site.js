(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const config = window.HESTIA_CONFIG || {};
  const header = $('#site-header');
  const hero = $('.hero');
  const heroContent = $('.hero-content');
  const heroBackground = $('.hero-background');
  const memory = $('.memory-section');
  const atmosphere = $('.winter-atmosphere');
  const progress = $('.scroll-progress');
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  // Content stays visible if animation support is unavailable.
  if ('IntersectionObserver' in window && !motionQuery.matches) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.09, rootMargin: '0px 0px -20px 0px' });
    $$('.reveal').forEach(element => revealObserver.observe(element));
    document.documentElement.classList.add('motion-ready');
    motionQuery.addEventListener('change', () => {
      if (motionQuery.matches) {
        document.documentElement.classList.remove('motion-ready');
        revealObserver.disconnect();
      }
    });
  }

  let framePending = false;
  const navLinks = $$('.desktop-nav a');
  const navSections = navLinks.map(link => $(link.getAttribute('href')));
  const updateScroll = () => {
    framePending = false;
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const maxScroll = document.documentElement.scrollHeight - viewportHeight;
    progress.style.transform = `scaleX(${maxScroll > 0 ? scrollY / maxScroll : 0})`;
    atmosphere.style.setProperty('--ambient-scroll', `${(clamp(scrollY / (maxScroll || 1)) - 0.5) * 48}px`);
    header.classList.toggle('is-sticky', scrollY > hero.offsetHeight - 120);

    if (!motionQuery.matches) {
      const heroProgress = clamp(scrollY / hero.offsetHeight);
      if (heroProgress < 1) {
        heroBackground.style.transform = `translate3d(0,${scrollY * 0.24}px,0)`;
        heroContent.style.transform = `translate3d(0,${scrollY * 0.14}px,0)`;
        heroContent.style.opacity = String(1 - clamp(heroProgress * 1.55));
      }
      const memoryRect = memory.getBoundingClientRect();
      const memoryProgress = clamp((viewportHeight * 0.4 - memoryRect.top) / (memoryRect.height - viewportHeight * 0.3));
      memory.style.setProperty('--memory-progress', memoryProgress.toFixed(4));
    } else {
      heroBackground.style.removeProperty('transform');
      heroContent.style.removeProperty('transform');
      heroContent.style.removeProperty('opacity');
      memory.style.setProperty('--memory-progress', '1');
    }

    let activeIndex = -1;
    navSections.forEach((section, index) => {
      if (section.getBoundingClientRect().top < viewportHeight * 0.45) activeIndex = index;
    });
    navLinks.forEach((link, index) => {
      link.classList.toggle('is-active', index === activeIndex);
      if (index === activeIndex) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const requestScroll = () => {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(updateScroll);
  };
  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', requestScroll, { passive: true });
  window.addEventListener('load', requestScroll, { once: true });
  motionQuery.addEventListener('change', requestScroll);
  updateScroll();

  // Native navigation remains usable without JavaScript.
  const menuToggle = $('.menu-toggle');
  const mobileNav = $('#mobile-nav');
  const setMenu = open => {
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    mobileNav.classList.toggle('is-open', open);
    mobileNav.inert = !open;
  };
  menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', mobileNav).forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuToggle.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!mobileNav.contains(event.target) && !menuToggle.contains(event.target)) setMenu(false);
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', event => {
    if (event.matches) setMenu(false);
  });

  // Keep real destinations in config.js; never silently send visitors to another project.
  const usableUrl = value => {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value.trim(), window.location.href);
      if (['https:', 'http:'].includes(url.protocol)) return url.href;
      if (url.protocol === 'file:' && window.location.protocol === 'file:') return url.href;
    } catch (_) { /* A missing or malformed destination opens the notice below. */ }
    return null;
  };
  const linkDialog = $('#link-dialog');
  const showNotice = type => {
    const platform = { youtube: 'YouTube', tiktok: 'TikTok' }[type];
    $('#link-dialog-title').textContent = platform ? `Hestia on ${platform}.` : 'Your squad is on its way.';
    $('#link-dialog-copy').textContent = platform
      ? `The official Hestia ${platform} link hasn’t been added yet. Check back for more from the island.`
      : 'The official Hestia community invite hasn’t been linked on this site yet. Check back soon for the place to meet your squad.';
    linkDialog.showModal();
    document.body.classList.add('modal-open');
  };
  const visit = (url, newTab) => {
    const link = document.createElement('a');
    link.href = url;
    if (newTab) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    document.body.append(link);
    link.click();
    link.remove();
  };
  $$('[data-community]').forEach(button => button.addEventListener('click', () => {
    const url = usableUrl(config.discordUrl);
    if (url) visit(url, true);
    else showNotice('community');
  }));

  $$('[data-social]').forEach(button => button.addEventListener('click', () => {
    const channel = button.dataset.social;
    const url = usableUrl(config[`${channel}Url`]);
    if (url) visit(url, true);
    else showNotice(channel === 'discord' ? 'community' : channel);
  }));
  $$('dialog').forEach(dialog => {
    $$('[data-close-dialog]', dialog).forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (!$('dialog[open]')) document.body.classList.remove('modal-open');
    });
  });
  $('[data-year]').textContent = String(new Date().getFullYear());

  // A small tilt follows the pointer, and resets when the card is left.
  const launcherWindow = $('[data-tilt]');
  let tiltFrame = 0;
  launcherWindow.addEventListener('pointermove', event => {
    if (!finePointer.matches || motionQuery.matches || tiltFrame) return;
    const rect = launcherWindow.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    tiltFrame = requestAnimationFrame(() => {
      launcherWindow.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 8}deg) rotateZ(2deg)`;
      tiltFrame = 0;
    });
  });
  launcherWindow.addEventListener('pointerleave', () => {
    cancelAnimationFrame(tiltFrame);
    tiltFrame = 0;
    launcherWindow.style.removeProperty('transform');
  });

  // Fine, center-out edge paths echo Neo's glass controls without heavy shadows.
  const glassSurfaces = $$('.archive-card:not(.archive-map) .archive-image, .archive-map, .faq-list details');
  const edgeDrawers = new Map();
  const svgNamespace = 'http://www.w3.org/2000/svg';
  glassSurfaces.forEach(surface => {
    surface.classList.add('premium-surface');
    const edge = document.createElementNS(svgNamespace, 'svg');
    edge.classList.add('glass-edge');
    edge.setAttribute('aria-hidden', 'true');
    edge.setAttribute('preserveAspectRatio', 'none');
    const paths = Array.from({ length: 4 }, () => {
      const path = document.createElementNS(svgNamespace, 'path');
      path.setAttribute('pathLength', '100');
      edge.append(path);
      return path;
    });
    (surface.matches('details') ? $('summary', surface) : surface).append(edge);
    const drawEdge = () => {
      const width = surface.clientWidth;
      const height = surface.clientHeight;
      if (!width || !height) return;
      const radius = Math.min(parseFloat(getComputedStyle(surface).borderTopLeftRadius) || 14, width / 2, height / 2);
      const left = 0.6;
      const right = width - 0.6;
      const top = 0.6;
      const bottom = height - 0.6;
      edge.setAttribute('viewBox', `0 0 ${width} ${height}`);
      [
        `M ${width / 2} ${top} H ${radius} Q ${left} ${top} ${left} ${radius} V ${height / 2}`,
        `M ${width / 2} ${top} H ${width - radius} Q ${right} ${top} ${right} ${radius} V ${height / 2}`,
        `M ${width / 2} ${bottom} H ${width - radius} Q ${right} ${bottom} ${right} ${height - radius} V ${height / 2}`,
        `M ${width / 2} ${bottom} H ${radius} Q ${left} ${bottom} ${left} ${height - radius} V ${height / 2}`
      ].forEach((data, index) => paths[index].setAttribute('d', data));
    };
    edgeDrawers.set(surface, drawEdge);
    drawEdge();
  });
  if ('ResizeObserver' in window) {
    const edgeObserver = new ResizeObserver(entries => entries.forEach(entry => edgeDrawers.get(entry.target)?.()));
    glassSurfaces.forEach(surface => edgeObserver.observe(surface));
  } else {
    window.addEventListener('resize', () => edgeDrawers.forEach(draw => draw()), { passive: true });
  }
  document.fonts.ready.then(() => edgeDrawers.forEach(draw => draw()));

  let surfaceFrame = 0;
  const surfacePoints = new Map();
  glassSurfaces.forEach(surface => surface.addEventListener('pointermove', event => {
    if (!finePointer.matches || motionQuery.matches) return;
    const rect = surface.getBoundingClientRect();
    surfacePoints.set(surface, {
      x: clamp((event.clientX - rect.left) / rect.width) * 100,
      y: clamp((event.clientY - rect.top) / rect.height) * 100
    });
    if (surfaceFrame) return;
    surfaceFrame = requestAnimationFrame(() => {
      surfacePoints.forEach((point, target) => {
        target.style.setProperty('--pointer-x', `${point.x.toFixed(2)}%`);
        target.style.setProperty('--pointer-y', `${point.y.toFixed(2)}%`);
      });
      surfacePoints.clear();
      surfaceFrame = 0;
    });
  }, { passive: true }));

  // The backdrop drifts continuously in CSS; pointer motion adds a slower parallax.
  let ambientFrame = 0;
  let ambientPoint = { x: 0, y: 0 };
  document.addEventListener('pointermove', event => {
    if (!finePointer.matches || motionQuery.matches) return;
    ambientPoint = {
      x: (event.clientX / window.innerWidth - 0.5) * -28,
      y: (event.clientY / window.innerHeight - 0.5) * -20
    };
    if (ambientFrame) return;
    ambientFrame = requestAnimationFrame(() => {
      atmosphere.style.setProperty('--ambient-x', `${ambientPoint.x.toFixed(2)}px`);
      atmosphere.style.setProperty('--ambient-y', `${ambientPoint.y.toFixed(2)}px`);
      ambientFrame = 0;
    });
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    document.documentElement.classList.toggle('is-page-hidden', document.hidden);
  });

  // Native details remain the fallback; the enhanced accordion animates both ways.
  const faqItems = $$('.faq-list details');
  const faqAnimations = new WeakMap();
  const setFaqOpen = (item, open) => {
    const startHeight = item.getBoundingClientRect().height;
    const previous = faqAnimations.get(item);
    if (previous) previous.animation.cancel();
    item.style.removeProperty('height');
    if (motionQuery.matches || typeof item.animate !== 'function') {
      item.open = open;
      faqAnimations.delete(item);
      return;
    }
    item.open = true;
    const style = getComputedStyle(item);
    const borders = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const endHeight = open ? item.getBoundingClientRect().height : $('summary', item).getBoundingClientRect().height + borders;
    item.style.height = `${startHeight}px`;
    const animation = item.animate([
      { height: `${startHeight}px` },
      { height: `${endHeight}px` }
    ], { duration: 390, easing: 'cubic-bezier(.22,1,.36,1)' });
    faqAnimations.set(item, { animation, targetOpen: open });
    animation.onfinish = () => {
      if (faqAnimations.get(item)?.animation !== animation) return;
      item.open = open;
      item.style.removeProperty('height');
      faqAnimations.delete(item);
    };
  };
  faqItems.forEach(item => $('summary', item).addEventListener('click', event => {
    event.preventDefault();
    const open = !(faqAnimations.get(item)?.targetOpen ?? item.open);
    if (open) faqItems.forEach(other => {
      if (other !== item && (faqAnimations.get(other)?.targetOpen ?? other.open)) setFaqOpen(other, false);
    });
    setFaqOpen(item, open);
  }));
  motionQuery.addEventListener('change', () => {
    if (!motionQuery.matches) return;
    faqItems.forEach(item => {
      const state = faqAnimations.get(item);
      if (!state) return;
      state.animation.cancel();
      item.open = state.targetOpen;
      item.style.removeProperty('height');
      faqAnimations.delete(item);
    });
  });

  // Snow is confined to the hero, pauses out of view, and respects reduced motion.
  const canvas = $('.snow-canvas');
  const context = canvas.getContext('2d');
  let heroInView = true;
  let snowFrame = 0;
  let width = 0;
  let height = 0;
  let particles = [];
  let lastTime = 0;
  let pointerX = 0;
  let wind = 0;
  const snowAllowed = () => Boolean(context) && !motionQuery.matches && heroInView && !document.hidden;
  const resizeSnow = () => {
    width = hero.clientWidth;
    height = hero.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    if (!context) return;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = width < 761 ? 38 : 76;
    particles = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: index % 13 === 0 ? 3.5 + Math.random() * 2 : 0.6 + Math.random() * 1.8,
      speed: 10 + Math.random() * 27,
      alpha: 0.12 + Math.random() * 0.46,
      phase: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI,
      flake: index % 13 === 0
    }));
  };
  const drawFlake = particle => {
    context.save();
    context.translate(particle.x, particle.y);
    context.rotate(particle.rotation);
    context.strokeStyle = `rgba(222,243,255,${particle.alpha})`;
    context.lineWidth = 0.8;
    context.beginPath();
    const r = particle.radius;
    for (let arm = 0; arm < 6; arm++) {
      const angle = arm * Math.PI / 3;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      context.moveTo(0, 0);
      context.lineTo(cos * r, sin * r);
      for (const side of [-1, 1]) {
        context.moveTo(cos * r * 0.58, sin * r * 0.58);
        const tipAngle = angle + side * Math.PI / 3;
        context.lineTo(cos * r * 0.58 + Math.cos(tipAngle) * r * 0.32, sin * r * 0.58 + Math.sin(tipAngle) * r * 0.32);
      }
    }
    context.stroke();
    context.restore();
  };
  const drawSnow = time => {
    snowFrame = 0;
    if (!snowAllowed()) {
      syncSnow();
      return;
    }
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0.016;
    lastTime = time;
    wind += (pointerX * 10 - wind) * Math.min(dt * 2, 1);
    context.clearRect(0, 0, width, height);
    particles.forEach(particle => {
      particle.y += particle.speed * dt;
      particle.x += (Math.sin(time * 0.00035 + particle.phase) * 8 + wind - 3) * dt;
      particle.rotation += dt * 0.07;
      if (particle.y > height + 12) { particle.y = -12; particle.x = Math.random() * width; }
      if (particle.x < -12) particle.x = width + 12;
      if (particle.x > width + 12) particle.x = -12;
      if (particle.flake) drawFlake(particle);
      else {
        context.fillStyle = `rgba(232,246,255,${particle.alpha})`;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      }
    });
    snowFrame = requestAnimationFrame(drawSnow);
  };
  const syncSnow = () => {
    canvas.dataset.animating = String(snowAllowed());
    if (snowAllowed() && !snowFrame) {
      lastTime = 0;
      snowFrame = requestAnimationFrame(drawSnow);
    } else if (!snowAllowed()) {
      cancelAnimationFrame(snowFrame);
      snowFrame = 0;
      if (context && motionQuery.matches) context.clearRect(0, 0, width, height);
    }
  };
  hero.addEventListener('pointermove', event => {
    if (finePointer.matches) pointerX = (event.clientX / width - 0.5) * 2;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { pointerX = 0; });
  if ('IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(entries => {
      heroInView = entries[0].isIntersecting;
      syncSnow();
    });
    heroObserver.observe(hero);
  }
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resizeSnow(); syncSnow(); }, 150);
  }, { passive: true });
  document.addEventListener('visibilitychange', syncSnow);
  motionQuery.addEventListener('change', syncSnow);
  resizeSnow();
  syncSnow();
})();

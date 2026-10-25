(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const root = document.documentElement;
  const body = document.body;
  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let storedMotion = null;
  try { storedMotion = localStorage.getItem('comodoro-reduce-motion'); } catch (_) { /* Storage may be unavailable in private sessions. */ }
  let reduced = storedMotion === null ? reduceQuery.matches : storedMotion === 'true';
  let motionContext = null;
  let pointerCleanup = null;
  let filmTrigger = null;
  let filmVisible = false;
  let scrollProgress = 0;
  let filmTarget = 0;
  let filmSmooth = 0;
  let seekFrame = 0;
  let filmLoading = false;
  const video = $('#eye-film');
  const rail = $('.portrait-rail');
  const motionButton = $('.motion-toggle');
  const canAnimate = Boolean(window.gsap && window.ScrollTrigger);
  if (canAnimate) gsap.registerPlugin(ScrollTrigger);

  $('#year').textContent = new Date().getFullYear();
  function openMenu(open) {
    const menu = $('#mobile-menu');
    const toggle = $('.menu-toggle');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.hidden = !open;
    body.classList.toggle('menu-open', open);
    if (open) $('a', menu).focus();
  }
  $('.menu-toggle').addEventListener('click', () => openMenu($('#mobile-menu').hidden));
  $$('#mobile-menu a').forEach(link => link.addEventListener('click', () => openMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !$('#mobile-menu').hidden) { openMenu(false); $('.menu-toggle').focus(); }
    if (event.key === 'Tab' && !$('#mobile-menu').hidden) {
      const focusable = [$('.menu-toggle'), ...$$('#mobile-menu a')];
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { last.focus(); event.preventDefault(); }
      else if (!event.shiftKey && document.activeElement === last) { first.focus(); event.preventDefault(); }
    }
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) openMenu(false); });

  // Local, real destination links; no form submissions or simulated inventory.
  $$('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    const target = $(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    history.replaceState(null, '', link.getAttribute('href'));
    // Keep keyboard navigation in the section that was explicitly selected.
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    if (target.id === 'olhar' && filmTrigger && !reduced) {
      window.scrollTo({ top: filmTrigger.start + (filmTrigger.end - filmTrigger.start) * .43, behavior: 'smooth' });
    } else target.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
  }));

  // Filter and browse the editorial gallery using native scrolling.
  function updateRail() {
    const max = rail.scrollWidth - rail.clientWidth;
    $('.rail-prev').disabled = rail.scrollLeft <= 4;
    $('.rail-next').disabled = rail.scrollLeft >= max - 4;
  }
  $$('.filter').forEach(button => button.addEventListener('click', () => {
    $$('.filter').forEach(filter => { const selected = filter === button; filter.classList.toggle('active', selected); filter.setAttribute('aria-pressed', String(selected)); });
    const visible = $$('.style-card').filter(card => {
      const show = button.dataset.filter === 'all' || card.dataset.category === button.dataset.filter;
      card.hidden = !show;
      return show;
    });
    rail.scrollTo({ left: 0, behavior: 'instant' });
    $('#filter-status').textContent = `${visible.length} inspirações de ${button.dataset.filter === 'all' ? 'todos os estilos' : button.textContent.trim()} disponíveis`;
    if (canAnimate && !reduced) gsap.fromTo(visible, { y: 20, clipPath: 'inset(8% 0 0 0)' }, { y: 0, clipPath: 'inset(0% 0 0 0)', stagger: .06, duration: .55, ease: 'power3.out', clearProps: 'transform,clipPath' });
    updateRail();
  }));
  function moveRail(direction) {
    const card = $('.style-card:not([hidden])');
    if (card) rail.scrollBy({ left: direction * (card.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).gap)), behavior: reduced ? 'instant' : 'smooth' });
  }
  $('.rail-prev').addEventListener('click', () => moveRail(-1));
  $('.rail-next').addEventListener('click', () => moveRail(1));
  rail.addEventListener('scroll', updateRail, { passive: true });
  rail.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); moveRail(event.key === 'ArrowRight' ? 1 : -1); }
  });
  new ResizeObserver(updateRail).observe(rail);
  updateRail();

  let dialogOpener = null;
  function showDialog(dialog, opener) {
    dialogOpener = opener;
    dialog.showModal();
    body.classList.add('dialog-open');
    $('.dialog-close', dialog).focus();
  }
  $$('dialog').forEach(dialog => {
    $('.dialog-close', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) { const b = dialog.getBoundingClientRect(); if (event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom) dialog.close(); } });
    dialog.addEventListener('close', () => { body.classList.remove('dialog-open'); dialogOpener?.focus({ preventScroll: true }); });
  });
  $$('.style-open').forEach(button => button.addEventListener('click', () => {
    const dialog = $('#style-dialog');
    $('.dialog-image img', dialog).src = `assets/${button.dataset.image}`;
    $('.dialog-image img', dialog).alt = $('img', button).alt;
    $('#style-dialog-title').textContent = button.dataset.title;
    $('#style-dialog-category').textContent = button.dataset.categoryLabel;
    $('#style-dialog-contact').href = `https://wa.me/5565992870019?text=${encodeURIComponent(`Olá! Vi a inspiração “${button.dataset.title}” no site da Comodoro. Gostaria de conhecer as opções de ${button.dataset.categoryLabel.toLowerCase()}.`)}`;
    showDialog(dialog, button);
  }));
  $$('[data-gallery]').forEach(button => button.addEventListener('click', () => {
    const dialog = $('#gallery-dialog');
    $('img', dialog).src = `assets/${button.dataset.gallery}`;
    $('img', dialog).alt = $('img', button).alt;
    $('p', dialog).textContent = button.dataset.caption;
    showDialog(dialog, button);
  }));

  // Only fetch the small-device movie near the story. Both encodes use all-I frames
  // so seeking backward is as cheap as forward; no animation wheel interception.
  function loadFilm() {
    if (filmLoading) return;
    filmLoading = true;
    const source = $('source', video);
    source.src = window.matchMedia('(max-width:760px)').matches ? 'assets/scroll-video-mobile.mp4' : source.dataset.src;
    video.preload = 'auto';
    video.load();
  }
  const filmLoader = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { loadFilm(); filmLoader.disconnect(); }
  }, { rootMargin: '800px' });
  filmLoader.observe($('.cinema'));
  new IntersectionObserver(entries => {
    filmVisible = entries[0].isIntersecting;
    if (!filmVisible && !reduced) video.pause();
    if (filmVisible) startSeek();
  }).observe($('.cinema-stage'));
  function seekTick() {
    seekFrame = 0;
    if (reduced || !filmVisible || document.hidden || !Number.isFinite(video.duration) || video.readyState < 2) return;
    filmTarget = Math.min(video.duration - .035, Math.max(0, scrollProgress) * video.duration);
    const difference = filmTarget - filmSmooth;
    filmSmooth = Math.abs(difference) < .012 ? filmTarget : filmSmooth + difference * .19;
    if (!video.seeking && Math.abs(video.currentTime - filmSmooth) > .025) video.currentTime = filmSmooth;
    if (Math.abs(filmTarget - video.currentTime) > .035 || Math.abs(difference) > .012) seekFrame = requestAnimationFrame(seekTick);
  }
  function startSeek() { if (!seekFrame && !reduced) seekFrame = requestAnimationFrame(seekTick); }
  video.addEventListener('loadeddata', startSeek);
  video.addEventListener('seeked', startSeek);
  video.addEventListener('error', () => { video.classList.add('film-unavailable'); $('.film-instruction').textContent = 'UM NOVO OLHAR COMEÇA AQUI'; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); else startSeek(); });

  // Original blur/highlight treatment: keep the sentence readable by assistive
  // technology while independently animating its words and phrase backgrounds.
  function prepareBlurParagraph() {
    const paragraph = $('.blur-paragraph');
    if ($('.blur-word', paragraph)) return;
    const sentence = paragraph.textContent;
    paragraph.setAttribute('aria-label', sentence);
    const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(word => {
        if (!word) return;
        if (/^\s+$/.test(word)) fragment.append(document.createTextNode(word));
        else {
          const span = document.createElement('span');
          span.className = 'blur-word';
          span.setAttribute('aria-hidden', 'true');
          span.textContent = word;
          fragment.append(span);
        }
      });
      node.replaceWith(fragment);
    });
  }
  prepareBlurParagraph();

  function initPointer() {
    if (!canAnimate) return;
    const hero = $('.hero');
    const head = $('.hero-head');
    const back = $('.haze-back');
    const front = $('.haze-front');
    const xHead = gsap.quickTo(head, 'x', { duration: 1.2, ease: 'power3.out' });
    const yHead = gsap.quickTo(head, 'y', { duration: 1.2, ease: 'power3.out' });
    const xBack = gsap.quickTo(back, 'x', { duration: 1.6, ease: 'power3.out' });
    const yBack = gsap.quickTo(back, 'y', { duration: 1.6, ease: 'power3.out' });
    const yFront = gsap.quickTo(front, 'y', { duration: 1.25, ease: 'power3.out' });
    const xFront = gsap.quickTo(front, 'x', { duration: 1.25, ease: 'power3.out' });
    gsap.set(head, { xPercent: -50, x: 0 });
    const move = event => {
      const bounds = hero.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      xHead(x * 18); yHead(y * 12);
      xBack(x * 210); yBack(y * 85); xFront(x * -270); yFront(y * -130);
      gsap.to(front, { filter: `blur(${22 + Math.abs(x) * 25}px)`, opacity: .95, scale: 1.04, duration: .9, overwrite: 'auto' });
      gsap.to(head, { filter: `blur(${Math.abs(x) * .45}px)`, duration: .9, overwrite: 'auto' });
    };
    const leave = () => { xHead(0); yHead(0); xBack(0); yBack(0); xFront(0); yFront(0); gsap.to(head, { filter: 'blur(0px)', duration: 1 }); gsap.to(front, { filter: 'blur(30px)', opacity: .85, scale: 1, duration: 1.4, overwrite: 'auto' }); };
    const touchEnd = event => { if (event.pointerType !== 'mouse') leave(); };
    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerdown', move, { passive: true });
    hero.addEventListener('pointerup', touchEnd, { passive: true });
    hero.addEventListener('pointercancel', leave, { passive: true });
    hero.addEventListener('pointerleave', leave);
    pointerCleanup = () => {
      hero.removeEventListener('pointermove', move); hero.removeEventListener('pointerdown', move);
      hero.removeEventListener('pointerup', touchEnd); hero.removeEventListener('pointercancel', leave);
      hero.removeEventListener('pointerleave', leave);
      gsap.killTweensOf([head, front, back]); [head, front, back].forEach(el => el.removeAttribute('style'));
    };
  }

  function buildMotion() {
    if (!canAnimate || reduced) return;
    motionContext = gsap.context(() => {
      const stage = $('.opening-stage');
      const circleOrigin = () => {
        const copy = $('.hero-copy');
        const first = $('.title-line');
        return `circle(0px at ${stage.clientWidth / 2}px ${copy.offsetTop + first.offsetTop + first.offsetHeight}px)`;
      };
      const circleFull = () => `circle(${Math.hypot(stage.clientWidth, stage.clientHeight) * .55}px at ${stage.clientWidth / 2}px ${stage.clientHeight / 2}px)`;
      gsap.set('.blur-word', { filter: 'blur(8px)', opacity: .16, y: 9 });
      gsap.set('.film-mission, .film-cta', { opacity: 0, y: 14 });
      // A short stationary scroll interval gives the opening gentle resistance.
      // Native wheel/touch scrolling remains intact; the entire scene reverses.
      const movie = gsap.timeline({ defaults: { ease: 'none' }, onUpdate: () => {
        const progress = movie.progress();
        scrollProgress = Math.max(0, Math.min(1, (progress - .12) / .88));
        $('.cinema-skip').classList.toggle('is-visible', progress > .3);
        $('.cinema-skip').tabIndex = progress > .3 ? 0 : -1;
        $('.cinema-copy').inert = progress < .34;
        $('.film-cta').inert = progress < .85;
        $('.hero').inert = progress > .3;
        startSeek();
      }, scrollTrigger: { trigger: '.opening-story', start: 'top top', end: 'bottom bottom', scrub: .6, invalidateOnRefresh: true, onRefresh: self => {
        $('.opening-story').dataset.scrollStart = self.start;
        $('.opening-story').dataset.scrollEnd = self.end;
      } } });
      filmTrigger = movie.scrollTrigger;
      movie.fromTo('.film-portal', { clipPath: circleOrigin }, { clipPath: circleFull, duration: .285, ease: 'power2.inOut' }, .075)
        .to('.title-line:first-child', { y: () => -stage.clientHeight * .55, duration: .3, ease: 'power2.out' }, .075)
        .to('.title-line:last-child', { y: () => stage.clientHeight * .45, duration: .3, ease: 'power2.out' }, .075)
        .to('.hero-copy>p, .hero-actions, .hero-bottom, .hero-corner, .hero-edition, .focus-label', { opacity: 0, duration: .12 }, .09)
        .to('.portrait-stage', { scale: .95, opacity: .3, duration: .24 }, .1)
        .to('.film-shade', { opacity: 1, duration: .2 }, .26)
        .to('.cinema-copy', { opacity: 1, duration: .12 }, .32)
        .to('.blur-word', { filter: 'blur(0px)', opacity: 1, y: 0, stagger: { amount: .34 }, duration: .1 }, .37)
        .to('.blur-highlight', { '--highlight-progress': '100%', stagger: .18, duration: .17 }, .47)
        .to('.film-mission, .film-cta', { opacity: 1, y: 0, stagger: .06, duration: .12 }, .78)
        .to('.film-caption, .cinema-skip, .film-progress', { opacity: 1, duration: .09 }, .32)
        .to('.film-progress span', { scaleX: 1, duration: .64 }, .36)
        .to({}, { duration: .04 }, .96);
      $$('.reveal-lines').forEach(title => {
        gsap.from(title, { y: 45, clipPath: 'inset(0 0 100% 0)', duration: 1.3, ease: 'power3.out', scrollTrigger: { trigger: title, start: 'top 88%', once: true } });
      });
      $$('.image-reveal').forEach(figure => {
        gsap.from(figure, { clipPath: 'inset(10% 0 15% 0)', duration: 1.3, ease: 'power3.inOut', scrollTrigger: { trigger: figure, start: 'top 90%', once: true } });
        gsap.fromTo($('img', figure), { scale: 1.1, yPercent: -3 }, { scale: 1, yPercent: 0, ease: 'none', scrollTrigger: { trigger: figure, start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
      });
      gsap.fromTo('.glasses-entry', { x: () => innerWidth * .6, y: 60, rotation: 18 }, { x: 0, y: -15, rotation: 0, ease: 'power2.out', scrollTrigger: { trigger: '.editorial-composition', start: 'top 92%', end: 'center 45%', scrub: 1.1 } });
      gsap.fromTo('.sport-product', { xPercent: 75, rotation: 12 }, { xPercent: 0, rotation: 0, ease: 'power2.out', scrollTrigger: { trigger: '.sport-section', start: 'top 85%', end: 'center 50%', scrub: 1 } });
      gsap.to('.sport-orbit', { rotation: 30, scale: 1.15, ease: 'none', scrollTrigger: { trigger: '.sport-section', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.from('.contact-main h2', { y: 55, clipPath: 'inset(0 0 100% 0)', ease: 'power3.out', duration: 1.2, scrollTrigger: { trigger: '.contact-section', start: 'top 80%', once: true } });
      initPointer();
    });
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  function applyMotion() {
    cancelAnimationFrame(seekFrame); seekFrame = 0;
    pointerCleanup?.(); pointerCleanup = null;
    motionContext?.revert(); motionContext = null;
    filmTrigger = null;
    $('.hero').inert = false;
    body.classList.toggle('reduced-motion', reduced || !canAnimate);
    motionButton.setAttribute('aria-pressed', String(reduced));
    motionButton.setAttribute('aria-label', reduced ? 'Ativar animações' : 'Reduzir animações');
    $('span', motionButton).textContent = reduced ? 'Ativar movimento' : 'Reduzir movimento';
    $('use', motionButton).setAttribute('href', reduced ? '#i-play' : '#i-pause');
    video.controls = reduced || !canAnimate;
    $('.cinema-copy').inert = !reduced && canAnimate;
    $('.film-cta').inert = !reduced && canAnimate;
    $('.cinema-skip').tabIndex = reduced || !canAnimate ? 0 : -1;
    video.pause();
    if (reduced) loadFilm();
    else buildMotion();
    if (canAnimate) ScrollTrigger.refresh();
  }
  motionButton.addEventListener('click', () => {
    const currentSection = $$('main > section, footer').find(el => { const r = el.getBoundingClientRect(); return r.top <= innerHeight * .4 && r.bottom > innerHeight * .4; });
    const previousTop = currentSection?.getBoundingClientRect().top;
    reduced = !reduced;
    try { localStorage.setItem('comodoro-reduce-motion', String(reduced)); storedMotion = String(reduced); } catch (_) { /* Preference is session-local if storage is blocked. */ }
    applyMotion();
    if (currentSection?.classList.contains('opening-story')) {
      // Restart the opening when switching its layout between cinematic and linear.
      window.scrollTo({top:currentSection.offsetTop,behavior:'instant'});
    } else if (currentSection) {
      const difference = currentSection.getBoundingClientRect().top - previousTop;
      if (Math.abs(difference) > 1) window.scrollBy({top:difference,behavior:'instant'});
    }
  });
  reduceQuery.addEventListener('change', event => { if (storedMotion === null) { reduced = event.matches; applyMotion(); } });
  applyMotion();
  if (!canAnimate) motionButton.hidden = true;
  window.addEventListener('load', () => {
    if (canAnimate) ScrollTrigger.refresh();
    if (location.hash === '#olhar' && filmTrigger && !reduced) window.scrollTo({top:filmTrigger.start + (filmTrigger.end - filmTrigger.start) * .43,behavior:'instant'});
    updateRail();
  });
})();

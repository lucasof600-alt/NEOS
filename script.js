/* ==========================================================================
   NEOS — script.js
   JavaScript puro, sem bibliotecas. Organizado por blocos numerados.
   Para iniciantes: procure a seção "CONFIGURAÇÃO" logo abaixo e troque o número do WhatsApp.
   --------------------------------------------------------------------------
   00 Config e utilitários · 01 Abertura · 02 Botão glitch · 03 Tema · 04 Header/scroll
   05 Menu mobile · 06 Animações de entrada · 07 Cursor, parallax, magnético
   08 Hero (malha + terminal) · 09 Números · 10 Método · 11 Projetos + modal
   12 Player de vídeo · 13 Briefing vivo · 14 Galeria/lightbox · 15 Carrossel
   16 FAQ · 17 Contato · 18 Extras
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 00 · CONFIGURAÇÃO E UTILITÁRIOS ---------- */
  var WHATSAPP = '5583999999999'; // EXEMPLO: DDI + DDD + número, só dígitos. TROQUE pelo número real da NEOS.

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var html = document.documentElement;
  var body = document.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // localStorage pode falhar (aba anônima, bloqueio). Sempre dentro de try/catch.
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignora */ } }
  };
  function waLink(text) { return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function slug(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 24); }
  function maskPhone(v) {
    var d = String(v).replace(/\D/g, '').slice(0, 11);
    if (d.length > 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
    if (d.length > 2) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    return d;
  }

  /* ---------- 01 · TELA DE ABERTURA (só na 1ª visita, máx. 1,5 s) ---------- */
  var boot = $('#boot');
  var bootDelay = 0;
  if (boot) {
    if (store.get('neos_seen') || reduce) {
      boot.remove();
    } else {
      bootDelay = 1300;
      store.set('neos_seen', '1');
      setTimeout(function () { boot.classList.add('is-out'); }, bootDelay);
      setTimeout(function () { boot.remove(); }, bootDelay + 900);
    }
  }

  /* ---------- 02 · BOTÃO GLITCH (portado do componente React "Spider-Verse") ---------- */
  // O CSS cuida do efeito. Aqui só montamos as camadas (texto duplicado, ruído e faixa de varredura).
  function glitchHTML(t) {
    return '<span class="bg-t">' + t + '</span>' +
      '<span class="gl gl1" aria-hidden="true">' + t + '</span>' +
      '<span class="gl gl2" aria-hidden="true">' + t + '</span>' +
      '<span class="fx" aria-hidden="true"><i class="noise"></i><i class="slice"></i></span>';
  }
  function setGlitchText(btn, t) { btn.setAttribute('data-text', t); btn.innerHTML = glitchHTML(t); }
  $$('.btn-glitch').forEach(function (b) { setGlitchText(b, b.getAttribute('data-text') || b.textContent.trim()); });

  /* ---------- 03 · TEMA CLARO / ESCURO ---------- */
  var themeBtn = $('#themeBtn');
  function applyTheme(t) {
    html.setAttribute('data-theme', t);
    var m = $('meta[name="theme-color"]');
    if (m) m.setAttribute('content', t === 'light' ? '#F7F7F7' : '#070907');
  }
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next); store.set('neos_theme', next);
  });

  /* ---------- 04 · HEADER, PROGRESSO DE LEITURA, MENU ATIVO ---------- */
  var header = $('#header'), progress = $('#progress'), toTop = $('#toTop'), pipe = $('#pipe');
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (header) header.classList.toggle('is-scrolled', y > 30);
    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max, 0, 1) : 0) + ')';
    if (toTop) toTop.classList.toggle('is-on', y > 700);
    // Método: a linha de energia acompanha a rolagem
    if (pipe) {
      var r = pipe.getBoundingClientRect();
      pipe.style.setProperty('--p', clamp((window.innerHeight * 0.65 - r.top) / r.height, 0, 1).toFixed(3));
    }
    // Parallax suave (usa a propriedade "translate" para não brigar com o transform do CSS)
    if (!reduce) $$('[data-parallax]').forEach(function (el) {
      el.style.translate = '0 ' + (y * parseFloat(el.getAttribute('data-parallax'))).toFixed(1) + 'px';
    });
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  // Destaca o item do menu da seção visível
  var spyLinks = $$('[data-spy]');
  if ('IntersectionObserver' in window && spyLinks.length) {
    var spyIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        spyLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spyLinks.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) spyIO.observe(s); });
  }

  /* ---------- 05 · MENU MOBILE ---------- */
  var burger = $('#burger'), nav = $('#nav');
  function setMenu(open) {
    if (!burger || !nav) return;
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    body.style.overflow = open ? 'hidden' : '';
  }
  if (burger) {
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 900) setMenu(false); });
  }

  /* ---------- 06 · ANIMAÇÕES DE ENTRADA (cada tipo com a sua) ---------- */
  // rise = sobe com leve inclinação · wipe = corte diagonal · slab = entra deslizando inclinado
  function startReveal() {
    var els = $$('[data-reveal]');
    els.forEach(function (el) {
      var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.hasAttribute('data-reveal'); });
      el.style.transitionDelay = Math.min(sibs.indexOf(el), 6) * 70 + 'ms';
    });
    function show(el) {
      el.classList.add('is-in');
      // depois da entrada, remove o atributo para não atrapalhar os efeitos de hover do próprio elemento
      setTimeout(function () { el.removeAttribute('data-reveal'); el.style.transitionDelay = ''; }, 1500);
    }
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(show); return; }
    // Elementos "wipe" têm o próprio recorte (clip-path) zerado no início, e o navegador os
    // trata como invisíveis. Por isso observamos o elemento-pai deles.
    var groups = new Map();
    els.forEach(function (el) {
      var key = el.getAttribute('data-reveal') === 'wipe' ? el.parentElement : el;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(el);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        groups.get(en.target).forEach(show);
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    groups.forEach(function (_, key) { io.observe(key); });
  }

  /* ---------- 07 · CURSOR PERSONALIZADO E BOTÕES MAGNÉTICOS (só desktop) ---------- */
  var cursor = $('#cursor');
  if (cursor && finePointer && !reduce) {
    html.classList.add('has-cursor');
    var cx = -100, cy = -100, tx = -100, ty = -100;
    document.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; });
    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest ? e.target.closest('a, button, input, textarea, select, label, [role="slider"], .svc__row') : null;
      cursor.classList.toggle('is-link', !!t);
    });
    (function loop() {
      cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22;
      cursor.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      requestAnimationFrame(loop);
    })();

    $$('.magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.35;
        el.style.translate = dx.toFixed(1) + 'px ' + dy.toFixed(1) + 'px';
      });
      el.addEventListener('pointerleave', function () { el.style.translate = ''; });
    });
  }

  /* ---------- 08 · HERO: MALHA QUE ACENDE + TERMINAL "COMPILADOR" ---------- */
  var hero = $('#inicio'), cv = $('#grid');
  if (cv && hero && cv.getContext) {
    var ctx = cv.getContext('2d');
    var W = 0, H = 0, GAP = 34, mx = 0, my = 0, lastMove = -9999, heroVisible = true;
    var sizeCanvas = function () {
      var r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    var draw = function (t) {
      ctx.clearRect(0, 0, W, H);
      var light = html.getAttribute('data-theme') === 'light';
      var usePointer = t - lastMove < 2200;
      var px = usePointer ? mx : W * (0.5 + 0.34 * Math.sin(t * 0.0004));
      var py = usePointer ? my : H * (0.5 + 0.3 * Math.sin(t * 0.00031 + 1));
      for (var y = GAP / 2; y < H; y += GAP) {
        for (var x = GAP / 2; x < W; x += GAP) {
          var d = Math.hypot(x - px, y - py);
          var k = Math.max(0, 1 - d / 200);
          var wave = 0.5 + 0.5 * Math.sin(x * 0.012 + y * 0.01 + t * 0.0007);
          var s = 2 + k * 3;
          if (k > 0.02) ctx.fillStyle = light ? 'rgba(90,104,0,' + (0.25 + k * 0.75).toFixed(2) + ')' : 'rgba(195,214,0,' + (0.2 + k * 0.8).toFixed(2) + ')';
          else ctx.fillStyle = light ? 'rgba(11,15,10,' + (0.1 + wave * 0.05).toFixed(2) + ')' : 'rgba(155,165,150,' + (0.1 + wave * 0.07).toFixed(2) + ')';
          ctx.fillRect(x - s / 2, y - s / 2, s, s);
        }
      }
    };
    sizeCanvas();
    window.addEventListener('resize', function () { sizeCanvas(); draw(performance.now()); });
    hero.addEventListener('pointermove', function (e) {
      var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; lastMove = performance.now();
    });
    if (reduce) { draw(0); }
    else {
      if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; }).observe(hero);
      (function loop(t) { if (heroVisible) draw(t); requestAnimationFrame(loop); })(0);
    }
  }

  // Terminal: reage ao nome digitado
  var termBody = $('#term'), termName = $('#termName'), termPct = $('#termPct'), compileForm = $('#compileForm');
  var termTimers = [];
  function runTerm(name) {
    if (!termBody) return;
    termTimers.forEach(clearTimeout); termTimers = [];
    if (termName) termName.textContent = '"' + (name || 'sua-empresa') + '"';
    var old = $('.term__go', termBody); if (old) old.remove();
    $$('.l, .term__bar2 i', termBody).forEach(function (el) {
      el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    });
    if (termPct) {
      termPct.textContent = reduce ? '100%' : '0%';
      if (!reduce) for (var i = 1; i <= 12; i++) (function (k) {
        termTimers.push(setTimeout(function () { termPct.textContent = Math.round(k / 12 * 100) + '%'; }, 3200 + k * 100));
      })(i);
    }
    termTimers.push(setTimeout(function () {
      if ($('.term__go', termBody)) return;
      var a = document.createElement('a');
      a.className = 'term__go'; a.href = '#briefing'; a.textContent = '→ continuar no briefing';
      termBody.appendChild(document.createTextNode('\n'));
      termBody.appendChild(a);
    }, reduce ? 0 : 5200));
  }
  if (compileForm) {
    compileForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = $('#compileName').value.trim();
      runTerm(v);
      var f = $('#f_nome');
      if (f && v) { f.value = v; f.dispatchEvent(new Event('input', { bubbles: true })); }
    });
  }

  /* ---------- 09 · NÚMEROS ANIMADOS ---------- */
  function startCounters() {
    var els = $$('.count');
    function run(el) {
      var to = parseFloat(el.getAttribute('data-to')) || 0, suf = el.getAttribute('data-suffix') || '';
      if (reduce) { el.textContent = to + suf; return; }
      var t0 = performance.now(), dur = 1500;
      (function step(now) {
        var p = clamp((now - t0) / dur, 0, 1), e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = Math.round(to * e) + suf;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }
    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { run(x.target); io.unobserve(x.target); } });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 10/11 · CAMADAS (modal e lightbox) COM FOCO CONTROLADO ---------- */
  var lastFocus = null, openLayer = null;
  function showLayer(el, focusEl) {
    lastFocus = document.activeElement; openLayer = el;
    el.hidden = false; body.style.overflow = 'hidden';
    if (focusEl) focusEl.focus();
  }
  function hideLayer() {
    if (!openLayer) return;
    openLayer.hidden = true; openLayer = null; body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (openLayer) hideLayer(); else setMenu(false); return; }
    if (openLayer && e.key === 'Tab') {
      var f = $$('a[href], button:not([disabled]), input, textarea, select', openLayer).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    if (openLayer && openLayer.id === 'lb') {
      if (e.key === 'ArrowLeft') lbMove(-1);
      if (e.key === 'ArrowRight') lbMove(1);
    }
  });

  // Projetos: filtro + modal
  var modal = $('#modal');
  $$('.filters .chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      $$('.filters .chip').forEach(function (c) { var on = c === chip; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', String(on)); });
      $$('.proj').forEach(function (p) { p.classList.toggle('is-hide', f !== 'all' && p.getAttribute('data-cat') !== f); });
    });
  });
  $$('.proj').forEach(function (p) {
    p.addEventListener('click', function () {
      var art = $('.proj__art', p), title = p.getAttribute('data-title');
      $('#mTitle').textContent = title;
      $('#mDesc').textContent = p.getAttribute('data-desc');
      $('#mTags').textContent = p.getAttribute('data-tags');
      var mArt = $('#mArt');
      mArt.style.setProperty('--p1', art.style.getPropertyValue('--p1'));
      mArt.style.setProperty('--p2', art.style.getPropertyValue('--p2'));
      mArt.textContent = $('b', art).textContent;
      $('#mWa').href = waLink('Oi, NEOS! Vi o projeto "' + title + '" no site e quero algo parecido para a minha empresa.');
      showLayer(modal, $('#mClose'));
    });
  });
  if (modal) {
    $('#mClose').addEventListener('click', hideLayer);
    modal.addEventListener('click', function (e) { if (e.target === modal) hideLayer(); });
  }

  /* ---------- 12 · PLAYER DE VÍDEO PERSONALIZADO ---------- */
  var vid = $('#vid');
  if (vid) {
    var phone = vid.closest('.phone'), vplay = $('#vplay'), vtoggle = $('#vtoggle'), vmute = $('#vmute'),
        vtrack = $('#vtrack'), vfill = $('#vfill');
    var setPlaying = function (on) {
      phone.classList.toggle('is-playing', on);
      vtoggle.textContent = on ? '❚❚' : '▶';
      vtoggle.setAttribute('aria-label', on ? 'Pausar' : 'Reproduzir');
    };
    var play = function () { var p = vid.play(); if (p && p.catch) p.catch(function () { setPlaying(false); }); };
    vplay.addEventListener('click', play);
    vtoggle.addEventListener('click', function () { vid.paused ? play() : vid.pause(); });
    vid.addEventListener('click', function () { vid.paused ? play() : vid.pause(); });
    vid.addEventListener('play', function () { setPlaying(true); });
    vid.addEventListener('pause', function () { setPlaying(false); });
    vid.addEventListener('ended', function () { vid.currentTime = 0; setPlaying(false); });
    vid.addEventListener('timeupdate', function () {
      var p = vid.duration ? vid.currentTime / vid.duration * 100 : 0;
      vfill.style.width = p.toFixed(1) + '%';
      vtrack.setAttribute('aria-valuenow', String(Math.round(p)));
    });
    vmute.addEventListener('click', function () {
      vid.muted = !vid.muted;
      vmute.textContent = vid.muted ? 'MUDO' : 'SOM';
      vmute.setAttribute('aria-pressed', String(vid.muted));
    });
    vtrack.addEventListener('click', function (e) {
      var r = vtrack.getBoundingClientRect();
      if (vid.duration) vid.currentTime = clamp((e.clientX - r.left) / r.width, 0, 1) * vid.duration;
    });
    vtrack.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') vid.currentTime = Math.min(vid.duration || 0, vid.currentTime + 2);
      if (e.key === 'ArrowLeft') vid.currentTime = Math.max(0, vid.currentTime - 2);
    });
    // pausa quando o vídeo sai da tela
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { if (!en[0].isIntersecting && !vid.paused) vid.pause(); }, { threshold: 0.2 }).observe(vid);
  }

  /* ---------- 13 · BRIEFING VIVO (O QUESTIONÁRIO DO NEOS-CODE, DENTRO DO SITE) ---------- */
  var bf = $('#bf');
  if (bf) {
    var TOTAL = 6, step = 1, KEY = 'neos_briefing_v1';
    var steps = $$('.bf__step', bf);
    var prev = $('#bfPrev'), next = $('#bfNext'), done = $('#bfDone'), navBox = $('.bf__nav', bf), topBox = $('.bf__top', bf);
    var live = $('#live'), els = bf.elements;
    var interest = '';

    var V = function (n) { var e = els[n]; return e ? String(e.value || '').trim() : ''; };
    var checked = function (id) { return $$('input:checked', $('#' + id)).map(function (i) { return i.value; }); };

    /* Salvar e restaurar rascunho */
    function save() {
      var o = {};
      ['nome', 'segmento', 'cidade', 'tempo', 'historia', 'publico', 'cor1', 'cor2', 'ref', 'slogan', 'servicos', 'dif', 'obs', 'resp', 'zap', 'insta', 'end', 'prazo'].forEach(function (k) { o[k] = els[k].value; });
      o.estilos = checked('estilos'); o.materiais = checked('materiais'); o.interest = interest;
      store.set(KEY, JSON.stringify(o));
    }
    function restore() {
      var raw = store.get(KEY); if (!raw) return;
      try {
        var o = JSON.parse(raw);
        Object.keys(o).forEach(function (k) { if (els[k] && typeof o[k] === 'string') els[k].value = o[k]; });
        $$('#estilos input').forEach(function (i) { i.checked = (o.estilos || []).indexOf(i.value) > -1; });
        $$('#materiais input').forEach(function (i) { i.checked = (o.materiais || []).indexOf(i.value) > -1; });
        if (o.interest) setInterest(o.interest);
      } catch (e) { /* rascunho inválido: ignora */ }
    }

    /* Interesse vindo da lista de serviços */
    function setInterest(t) {
      interest = t;
      var p = $('#bfInterest');
      if (p) { p.hidden = !t; p.textContent = t ? '↳ interesse: ' + t : ''; }
    }

    /* Mini-site ao vivo */
    function updateLive() {
      var nome = V('nome'), seg = V('segmento'), slogan = V('slogan'), cidade = V('cidade'), tempo = V('tempo');
      $('#liveName').textContent = nome || 'Sua empresa';
      $('#liveUrl').textContent = (slug(nome) || 'suaempresa') + '.com.br';
      $('#liveSeg').textContent = seg || 'segmento';
      $('#liveSlogan').textContent = slogan || 'Seu slogan aparece aqui';
      $('#liveCity').textContent = cidade ? cidade + (tempo ? ' · ' + tempo : '') : (tempo || 'Cidade · UF');
      var ul = $('#liveChips'), list = V('servicos').split(',').map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 6);
      var sig = list.join('|');
      if (ul.getAttribute('data-sig') !== sig) {
        ul.setAttribute('data-sig', sig);
        ul.innerHTML = '';
        list.forEach(function (s) { var li = document.createElement('li'); li.textContent = s; ul.appendChild(li); });
      }
      var c1 = els.cor1.value, c2 = els.cor2.value;
      live.style.setProperty('--c1', c1); live.style.setProperty('--c2', c2);
      $('#sw1').style.background = c1; $('#sw2').style.background = c2;
      var st = checked('estilos');
      live.setAttribute('data-style', st.join(' '));
      $('#liveStyle').textContent = st.length ? st.join(' · ') : 'estilo';
      var filled = [nome, seg, cidade, V('historia'), V('publico'), slogan, V('servicos'), V('dif'), V('resp'), V('zap')].filter(Boolean).length
        + (st.length ? 1 : 0) + (checked('materiais').length ? 1 : 0);
      $('#livePct').textContent = Math.round(filled / 12 * 100) + '%';
    }

    /* Navegação entre passos */
    function show(n, focus) {
      step = n;
      steps.forEach(function (s) { s.classList.toggle('is-on', Number(s.getAttribute('data-step')) === n); });
      $('#bfStepLabel').textContent = 'passo ' + n + ' de ' + TOTAL;
      var bar = $('#bfBar'); bar.setAttribute('aria-valuenow', String(n)); $('i', bar).style.width = (n / TOTAL * 100) + '%';
      prev.disabled = n === 1;
      setGlitchText(next, n === TOTAL ? 'Finalizar' : 'Próximo →');
      if (focus) {
        var f = $('.bf__step.is-on input:not([type="checkbox"]):not([type="color"]), .bf__step.is-on textarea', bf);
        if (f) f.focus({ preventScroll: true });
        var r = bf.getBoundingClientRect();
        if (r.top < 70 || r.top > window.innerHeight * 0.5) window.scrollTo({ top: window.pageYOffset + r.top - 100, behavior: reduce ? 'auto' : 'smooth' });
      }
    }

    /* Validação */
    function fieldBox(input) { return input.closest('.field.two > div') || input.closest('.field'); }
    function setError(input, msg) {
      var box = fieldBox(input);
      box.classList.toggle('is-bad', !!msg);
      var small = $('.err', box); if (small) small.textContent = msg || '';
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    }
    function validate(n) {
      var sec = steps[n - 1], firstBad = null;
      $$('[required]', sec).forEach(function (inp) {
        var v = inp.value.trim(), msg = '';
        if (!v) msg = 'Preencha este campo.';
        else if (inp.name === 'zap' && v.replace(/\D/g, '').length < 10) msg = 'Digite o WhatsApp com DDD.';
        setError(inp, msg);
        if (msg && !firstBad) firstBad = inp;
      });
      if (firstBad) {
        firstBad.focus();
        bf.classList.remove('shake'); void bf.offsetWidth; bf.classList.add('shake');
        return false;
      }
      return true;
    }

    /* Montagem dos textos finais */
    function buildTexts() {
      var cores = els.cor1.value + ' (principal) e ' + els.cor2.value + ' (secundária)';
      var rows = [
        ['Nome da empresa', V('nome')], ['Segmento', V('segmento')], ['Cidade/UF', V('cidade')], ['Tempo de mercado', V('tempo')],
        ['História', V('historia')], ['Público', V('publico')], ['Cores', cores], ['Estilo', checked('estilos').join(', ')],
        ['Referências', V('ref')], ['Slogan', V('slogan')], ['Serviços/produtos', V('servicos')], ['Diferenciais', V('dif')],
        ['Materiais que já tem', checked('materiais').join(', ')], ['Não pode faltar', V('obs')],
        ['Responsável', V('resp')], ['WhatsApp', V('zap')], ['Instagram', V('insta')], ['Endereço/horário', V('end')], ['Prazo desejado', V('prazo')]
      ].filter(function (r) { return r[1]; });
      if (interest) rows.push(['Serviço de interesse', interest]);
      var wa = '*Novo briefing pelo site da NEOS*\n\n' + rows.map(function (r) { return '*' + r[0] + ':* ' + r[1]; }).join('\n');
      var copy = '[RESPOSTAS DO FORMULÁRIO]\n' + rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n');
      return { wa: wa, copy: copy };
    }

    function finish() {
      steps.forEach(function (s) { s.classList.remove('is-on'); });
      navBox.hidden = true; done.hidden = false; topBox.hidden = true;
      var t = buildTexts();
      $('#bfSend').href = waLink(t.wa);
      var r = bf.getBoundingClientRect();
      if (r.top < 0) window.scrollTo({ top: window.pageYOffset + r.top - 100, behavior: reduce ? 'auto' : 'smooth' });
      $('h3', done).setAttribute('tabindex', '-1'); $('h3', done).focus({ preventScroll: true });
    }

    next.addEventListener('click', function () {
      if (!validate(step)) return;
      if (step < TOTAL) show(step + 1, true); else finish();
    });
    prev.addEventListener('click', function () { if (step > 1) show(step - 1, true); });
    bf.addEventListener('submit', function (e) { e.preventDefault(); });
    bf.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') { e.preventDefault(); next.click(); }
    });

    $('#bfEdit').addEventListener('click', function () {
      done.hidden = true; navBox.hidden = false; topBox.hidden = false; show(1, true);
    });
    $('#bfCopy').addEventListener('click', function () {
      var txt = buildTexts().copy, msg = $('#bfCopied');
      var ok = function () { msg.textContent = 'Copiado! Pode colar no prompt neos-code.'; setTimeout(function () { msg.textContent = ''; }, 3500); };
      var fallback = function () {
        var ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
        body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); ok(); } catch (e) { msg.textContent = 'Não consegui copiar. Selecione e copie manualmente.'; }
        ta.remove();
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, fallback); else fallback();
    });

    /* Eventos de digitação */
    bf.addEventListener('input', function (e) {
      var t = e.target;
      if (t.name === 'zap') t.value = maskPhone(t.value);
      if (t.hasAttribute('required') && t.value.trim()) setError(t, '');
      updateLive(); save();
    });
    bf.addEventListener('change', function (e) {
      var t = e.target;
      // máximo de 3 estilos
      if (t.type === 'checkbox' && t.closest('#estilos') && checked('estilos').length > 3) {
        t.checked = false;
        var h = $('#estilos'); h.classList.remove('shake'); void h.offsetWidth; h.classList.add('shake');
      }
      updateLive(); save();
    });

    // Clique nos serviços leva ao briefing já com o interesse marcado
    $$('.svc__row').forEach(function (row) {
      var go = function () {
        setInterest($('h3', row).textContent); save();
        var sec = $('#briefing'); if (sec) sec.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      };
      row.addEventListener('click', go);
      row.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });

    restore();
    els.zap.value = maskPhone(els.zap.value);
    updateLive();
    show(1, false);
  }

  /* ---------- 14 · GALERIA COM LIGHTBOX (setas, ESC e swipe) ---------- */
  var lb = $('#lb'), lbFig = $('#lbFig'), galItems = $$('.gal__i'), lbIndex = 0;
  function lbRender() {
    var it = galItems[lbIndex], media = $('img', it) || $('.gal__art', it);
    var clone = media.cloneNode(true);
    if (clone.removeAttribute) clone.removeAttribute('loading');
    lbFig.innerHTML = '';
    lbFig.appendChild(clone);
    var cap = document.createElement('figcaption');
    cap.textContent = (lbIndex + 1) + ' / ' + galItems.length + ' · ' + (it.getAttribute('data-cap') || '');
    lbFig.appendChild(cap);
  }
  function lbMove(d) { lbIndex = (lbIndex + d + galItems.length) % galItems.length; lbRender(); }
  if (lb) {
    galItems.forEach(function (it, i) { it.addEventListener('click', function () { lbIndex = i; lbRender(); showLayer(lb, $('#lbClose')); }); });
    $('#lbClose').addEventListener('click', hideLayer);
    $('#lbPrev').addEventListener('click', function () { lbMove(-1); });
    $('#lbNext').addEventListener('click', function () { lbMove(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) hideLayer(); });
    var sx = 0;
    lb.addEventListener('touchstart', function (e) { sx = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) lbMove(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  /* ---------- 15 · CARROSSEL DE DEPOIMENTOS ---------- */
  var track = $('#carTrack');
  if (track) {
    var slides = $$('.slide', track), dotsBox = $('#carDots'), ci = 0, auto = null, view = $('.car__view');
    slides.forEach(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-label', 'Depoimento ' + (i + 1));
      b.addEventListener('click', function () { go(i, true); });
      dotsBox.appendChild(b);
    });
    var dots = $$('button', dotsBox);
    var go = function (i, user) {
      ci = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-ci * 100) + '%)';
      dots.forEach(function (d, k) { d.classList.toggle('is-on', k === ci); d.setAttribute('aria-selected', String(k === ci)); });
      slides.forEach(function (s, k) { s.setAttribute('aria-hidden', String(k !== ci)); });
      if (user) stop();
    };
    var stop = function () { if (auto) { clearInterval(auto); auto = null; } };
    $('#carPrev').addEventListener('click', function () { go(ci - 1, true); });
    $('#carNext').addEventListener('click', function () { go(ci + 1, true); });
    var px0 = null;
    view.addEventListener('pointerdown', function (e) { px0 = e.clientX; });
    view.addEventListener('pointerup', function (e) {
      if (px0 === null) return;
      var dx = e.clientX - px0; px0 = null;
      if (Math.abs(dx) > 45) go(ci + (dx < 0 ? 1 : -1), true);
    });
    view.addEventListener('pointercancel', function () { px0 = null; });
    go(0);
    if (!reduce) auto = setInterval(function () { go(ci + 1); }, 7000);
  }

  /* ---------- 16 · FAQ (ACCORDION) ---------- */
  $$('#acc .acc__i button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      $$('#acc .acc__i button').forEach(function (b) {
        b.setAttribute('aria-expanded', 'false'); $('#' + b.getAttribute('aria-controls')).classList.remove('is-open');
      });
      if (!open) { btn.setAttribute('aria-expanded', 'true'); $('#' + btn.getAttribute('aria-controls')).classList.add('is-open'); }
    });
  });

  /* ---------- 17 · CONTATO RÁPIDO → WHATSAPP ---------- */
  var cf = $('#cf');
  if (cf) {
    var cTel = $('#c_tel');
    cTel.addEventListener('input', function () { cTel.value = maskPhone(cTel.value); });
    $$('input, textarea', cf).forEach(function (i) {
      i.addEventListener('input', function () {
        var box = i.closest('.field'); box.classList.remove('is-bad'); $('.err', box).textContent = '';
      });
    });
    cf.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      $$('[required]', cf).forEach(function (i) {
        var v = i.value.trim(), msg = '';
        if (!v) msg = 'Preencha este campo.';
        else if (i.id === 'c_tel' && v.replace(/\D/g, '').length < 10) msg = 'Digite o WhatsApp com DDD.';
        var box = i.closest('.field'); box.classList.toggle('is-bad', !!msg); $('.err', box).textContent = msg;
        if (msg && !bad) bad = i;
      });
      if (bad) { bad.focus(); return; }
      var text = 'Oi, NEOS! Aqui é ' + $('#c_nome').value.trim() + ' (' + cTel.value + ').\n\n' + $('#c_msg').value.trim();
      window.open(waLink(text), '_blank', 'noopener');
    });
  }

  /* ---------- 18 · EXTRAS ---------- */
  var fab = $('#waFab'); if (fab) fab.href = waLink('Oi, NEOS! Vim pelo site e quero saber mais.');
  var yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- PARTIDA ---------- */
  setTimeout(function () { startReveal(); startCounters(); runTerm(''); }, bootDelay);
})();

/* =====================================================
   ATRI AI — 介護シフトAI ランディングページ
   script.js
   ===================================================== */

/* ---- ① ページロード表示 ---- */
window.addEventListener('load', function () {
  document.body.style.transition = 'opacity 0.5s ease';
  document.body.style.opacity = '1';
});


/* =====================================================
   ② ヒーロー背景：パーティクルネットワーク（Canvas）
   ===================================================== */
(function initCanvas() {
  var canvas  = document.getElementById('heroCanvas');
  if (!canvas) return;   /* canvas なし（SVGイラスト版）は終了 */
  var ctx     = canvas.getContext('2d');
  var particles = [];

  /* キャンバスをウィンドウサイズに合わせる */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  /* パーティクル1粒 */
  function Particle() {
    this.reset();
  }
  Particle.prototype.reset = function () {
    this.x      = Math.random() * canvas.width;
    this.y      = Math.random() * canvas.height;
    this.size   = Math.random() * 1.8 + 0.4;
    this.vx     = (Math.random() - 0.5) * 0.45;
    this.vy     = (Math.random() - 0.5) * 0.45;
    this.base   = Math.random() * 0.18 + 0.04;  /* 基本透明度 */
    this.phase  = Math.random() * Math.PI * 2;
    this.speed  = Math.random() * 0.018 + 0.006;
  };
  Particle.prototype.update = function () {
    this.x     += this.vx;
    this.y     += this.vy;
    this.phase += this.speed;
    this.alpha  = this.base * (0.65 + 0.35 * Math.sin(this.phase));
    /* 画面外に出たらランダム位置に再配置 */
    if (this.x < -5 || this.x > canvas.width + 5 ||
        this.y < -5 || this.y > canvas.height + 5) {
      this.reset();
    }
  };
  Particle.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(56, 152, 200, ' + this.alpha + ')';
    ctx.fill();
  };

  /* パーティクルを生成（画面サイズに応じた数） */
  function createParticles() {
    var count = Math.min(90, Math.floor(canvas.width * canvas.height / 12000));
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  /* 近いパーティクル同士を線で結ぶ */
  var MAX_DIST = 130;
  function drawLines() {
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx   = particles[i].x - particles[j].x;
        var dy   = particles[i].y - particles[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          var op = (1 - dist / MAX_DIST) * 0.07;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(56, 152, 200, ' + op + ')';
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  /* メインループ */
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(function (p) { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animate);
  }

  /* リサイズ時にパーティクルを再生成 */
  window.addEventListener('resize', createParticles);

  createParticles();
  animate();
})();


/* =====================================================
   ③ ナビバー：スクロールで背景を付ける
   ===================================================== */
(function initNavbar() {
  var navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 60) {
          navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
})();


/* =====================================================
   ④ ハンバーガーメニュー（モバイル）
   ===================================================== */
(function initHamburger() {
  var hamburger  = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');

  function toggle() {
    var isOpen = mobileMenu.classList.toggle('active');
    hamburger.classList.toggle('active', isOpen);
    /* スクロールを止める */
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', toggle);

  /* メニュー内のリンクをクリックしたら閉じる */
  mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      mobileMenu.classList.remove('active');
      hamburger.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
})();


/* =====================================================
   ⑤ スクロールアニメーション（Intersection Observer）
   ===================================================== */
(function initScrollAnimations() {
  /* CSS で定義したクラスを要素に付与してアニメーション */
  var ANIMATE_MAP = {
    /* セレクタ: 付けるアニメーションクラス */
    '.shift-stress-text':   'anim-fade-left',
    '.stress-photo-wrap':   'anim-fade-right',
    '.stress-alone-wrap':   'anim-fade-up',
    '.ba-card':         'anim-fade-up',
    '.ba-cta':          'anim-fade-up',
    '.problem-card':    'anim-fade-up',
    '.service-card':    'anim-fade-up',
    '.feature-item':    'anim-fade-left',
    '.features-visual': 'anim-fade-right',
    '.demo-card':       'anim-fade-up',
    '.trust-item':      'anim-fade-up',
    '.faq-item':        'anim-fade-up',
    '.flow-step':       'anim-fade-up',
    '.pricing-card':    'anim-fade-up',
    '.pricing-info':    'anim-fade-up',
    '.info-item':       'anim-fade-up',
    '.contact-card':    'anim-fade-up',
    '.contact-cta':     'anim-fade-up',
    '.developer-card':  'anim-fade-up',
  };

  /* まず全対象要素にアニメーション用クラスを付けて非表示にする */
  Object.keys(ANIMATE_MAP).forEach(function (selector) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.classList.add(ANIMATE_MAP[selector]);
    });
  });

  /* IntersectionObserver で画面内に入ったら .visible を付ける */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      var el    = entry.target;
      var delay = parseInt(el.getAttribute('data-delay') || '0', 10);

      setTimeout(function () {
        el.classList.add('visible');
      }, delay);

      observer.unobserve(el); /* 一度表示したら監視を外す */
    });
  }, {
    threshold:   0.1,
    rootMargin: '0px 0px -48px 0px',
  });

  /* 全対象要素を監視対象に登録 */
  Object.keys(ANIMATE_MAP).forEach(function (selector) {
    document.querySelectorAll(selector).forEach(function (el) {
      observer.observe(el);
    });
  });
})();


/* =====================================================
   ⑥ AIカードのプログレスバーをカードが見えたら伸ばす
   ===================================================== */
(function initAiCard() {
  var progressBar = document.getElementById('aiProgressBar');
  if (!progressBar) return;

  var aiCard = document.querySelector('.ai-card');
  if (!aiCard) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      /* 少し間を置いてからバーを伸ばす */
      setTimeout(function () {
        progressBar.style.width = '78%';
      }, 400);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  observer.observe(aiCard);
})();


/* =====================================================
   ⑦ ヒーローのマウス追従グロウ
   ===================================================== */
(function initHeroGlow() {
  var hero    = document.querySelector('.hero');
  var overlay = document.getElementById('heroOverlay');
  if (!hero || !overlay) return;

  hero.addEventListener('mousemove', function (e) {
    var rect = hero.getBoundingClientRect();
    var x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
    var y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
    overlay.style.background =
      'radial-gradient(ellipse at ' + x + '% ' + y + '%, rgba(56,152,200,0.07) 0%, transparent 60%)';
  });

  hero.addEventListener('mouseleave', function () {
    overlay.style.background =
      'radial-gradient(ellipse at 50% 40%, rgba(56,152,200,0.07) 0%, transparent 65%)';
  });
})();


/* =====================================================
   ⑧ FAQアコーディオン
   ===================================================== */
(function initFaq() {
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item   = this.closest('.faq-item');
      var answer = item.querySelector('.faq-answer');
      var isOpen = this.getAttribute('aria-expanded') === 'true';

      /* 他を閉じる */
      document.querySelectorAll('.faq-item').forEach(function (other) {
        if (other !== item) {
          other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-answer').hidden = true;
          other.classList.remove('faq-open');
        }
      });

      /* トグル */
      this.setAttribute('aria-expanded', String(!isOpen));
      answer.hidden = isOpen;
      item.classList.toggle('faq-open', !isOpen);
    });
  });
})();


/* =====================================================
   ⑨ お問い合わせフォーム
   ===================================================== */
(function initContactForm() {
  /* 送信先: Cloudflare Pages Function（同一ドメイン）
     → Render API (/api/contact-public) へ中継
     → Gmail SMTP でメール送信                    */
  var ENDPOINT = '/api/contact';

  var toggleBtn  = document.getElementById('formToggleBtn');
  var formWrap   = document.getElementById('contactFormWrap');
  var formEl     = document.getElementById('contactFormEl');
  var submitBtn  = document.getElementById('formSubmitBtn');
  var successBox = document.getElementById('formSuccessBox');
  var failBox    = document.getElementById('formFailBox');

  if (!toggleBtn || !formWrap || !formEl) return;

  /* ---- フォーム 開閉 ---- */
  toggleBtn.addEventListener('click', function () {
    var isOpen = formWrap.classList.toggle('form-open');
    this.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      setTimeout(function () {
        formWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 80);
    }
  });

  /* ---- バリデーション ---- */
  function setError(fieldId, msg) {
    var el = document.getElementById('err-' + fieldId);
    var input = document.getElementById('cf-' + fieldId);
    if (el)    el.textContent = msg;
    if (input) input.classList.add('input-error');
  }
  function clearError(fieldId) {
    var el = document.getElementById('err-' + fieldId);
    var input = document.getElementById('cf-' + fieldId);
    if (el)    el.textContent = '';
    if (input) input.classList.remove('input-error');
  }

  /* リアルタイムエラークリア */
  ['name', 'facility', 'email', 'tel', 'message'].forEach(function (id) {
    var input = document.getElementById('cf-' + id);
    if (input) input.addEventListener('input', function () { clearError(id); });
  });

  function validate() {
    var ok       = true;
    var name     = document.getElementById('cf-name').value.trim();
    var facility = document.getElementById('cf-facility').value.trim();
    var email    = document.getElementById('cf-email').value.trim();
    var tel      = document.getElementById('cf-tel').value.trim();
    var message  = document.getElementById('cf-message').value.trim();

    clearError('name'); clearError('facility'); clearError('email');
    clearError('tel');  clearError('message');

    if (!name)     { setError('name',     '担当者名を入力してください'); ok = false; }
    if (!facility) { setError('facility', '施設名を入力してください');   ok = false; }
    if (!email) {
      setError('email', 'メールアドレスを入力してください'); ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('email', '正しいメールアドレス形式で入力してください'); ok = false;
    }
    if (!tel) {
      setError('tel', '電話番号を入力してください'); ok = false;
    } else if (!/^[\d\-\+\(\)\s]{7,20}$/.test(tel)) {
      setError('tel', '正しい電話番号を入力してください（例：090-1234-5678）'); ok = false;
    }
    if (!message) { setError('message', '質問事項・相談内容を入力してください'); ok = false; }

    return ok;
  }

  /* ---- 送信 ---- */
  formEl.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;

    /* ローディング状態 */
    submitBtn.disabled = true;
    submitBtn.querySelector('.form-submit-label').hidden = true;
    submitBtn.querySelector('.form-submit-arrow').hidden = true;
    submitBtn.querySelector('.form-submit-loading').hidden = false;

    var payload = {
      name:     document.getElementById('cf-name').value.trim(),
      facility: document.getElementById('cf-facility').value.trim(),
      email:    document.getElementById('cf-email').value.trim(),
      tel:      document.getElementById('cf-tel').value.trim(),
      message:  document.getElementById('cf-message').value.trim()
    };

    fetch(ENDPOINT, {
      method:  'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    })
    .then(function (res) {
      if (res.ok) {
        formEl.hidden = true;
        successBox.hidden = false;
        successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        throw new Error('HTTP ' + res.status);
      }
    })
    .catch(function () {
      submitBtn.disabled = false;
      submitBtn.querySelector('.form-submit-label').hidden = false;
      submitBtn.querySelector('.form-submit-arrow').hidden = false;
      submitBtn.querySelector('.form-submit-loading').hidden = true;
      failBox.hidden = false;
    });
  });
})();


/* =====================================================
   ⑩ スムーズスクロール（アンカーリンク共通処理）
   ===================================================== */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href   = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      var navH      = document.getElementById('navbar').offsetHeight;
      var targetTop = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
})();

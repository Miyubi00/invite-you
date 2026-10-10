// public/remotion-driver.js
// Dipasang di index.html khusus agar video Remotion bisa mengendalikan
// website asli di dalam <iframe> lintas-origin via postMessage.
// Inert tanpa perintah "tick"/"cmd": tidak mengubah perilaku situs
// kecuali yang eksplisit diminta (fake turnstile token, fake supabase edge,
// fake window.snap).

(function () {
  try {
    localStorage.removeItem('loverse-order-draft');
    localStorage.setItem('app_language', 'id');
  } catch (e) {}

  var originalFetch = window.fetch ? window.fetch.bind(window) : null;

  // Data template deterministik (sama dg MASTER_TEMPLATES).
  var TEMPLATES = [
    { id: 1, slug: 'rustic-floral', name: 'Rustic Floral', category: 'Basic', price: 10000, is_active: true },
    { id: 2, slug: 'modern-dark', name: 'Modern Dark', category: 'Basic', price: 10000, is_active: true },
    { id: 3, slug: 'botanical-gold', name: 'Botanical Gold', category: 'Basic', price: 10000, is_active: true },
    { id: 4, slug: 'monochrome', name: 'Monochrome', category: 'Basic', price: 10000, is_active: true },
    { id: 5, slug: 'navy-gold', name: 'Navy Gold', category: 'Basic', price: 10000, is_active: true },
    { id: 6, slug: 'bohaemin', name: 'Bohaemin', category: 'Basic', price: 10000, is_active: true },
    { id: 7, slug: 'rustic-boho', name: 'Rustic Boho', category: 'Basic', price: 10000, is_active: true },
    { id: 8, slug: 'elegant-pastel', name: 'Elegant Pastel', category: 'Basic', price: 10000, is_active: true },
    { id: 9, slug: 'japanese', name: 'Japanese', category: 'Basic', price: 10000, is_active: true },
    { id: 10, slug: 'javanese', name: 'Javanese', category: 'Basic', price: 10000, is_active: true },
    { id: 11, slug: 'lilac', name: 'Lilac', category: 'Basic', price: 10000, is_active: true },
    { id: 20, slug: 'cinamon', name: 'Cinnamon Blue', category: 'RSVP', price: 15000, is_active: true },
    { id: 12, slug: 'playful-pop', name: 'Playful Pop', category: 'RSVP', price: 15000, is_active: true },
    { id: 19, slug: 'cyberpunk', name: 'Cyberpunk Neon', category: 'Basic', price: 10000, is_active: true },
    { id: 21, slug: 'insta', name: 'Instagram Feed', category: 'Basic', price: 10000, is_active: true },
  ];

  function jsonResponse(body) {
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (originalFetch) {
    window.fetch = function (url, opts) {
      try {
        var u = String(url);
        if (u.indexOf('/rest/v1/templates') !== -1) {
          return Promise.resolve(jsonResponse(TEMPLATES));
        }
        if (u.indexOf('/functions/v1/create-order') !== -1) {
          return Promise.resolve(
            jsonResponse({
              success: true,
              order_id: 'LV-20261008-RZAN01',
              order_token: 'tok-fake-RZAN01',
              token: 'snap-token-fake',
            }),
          );
        }
        if (u.indexOf('/functions/v1/payment-status') !== -1) {
          return Promise.resolve(
            jsonResponse({
              found: true,
              payment_status: 'success',
              order_id: 'LV-20261008-RZAN01',
              groom_name: 'Rizky',
              bride_name: 'Anisa',
              template_name: 'Cinnamon Blue',
              payment_method: 'QRIS',
              price: 15117,
              snap_token: null,
              pin_code: '482913',
              created_at: '2026-10-08T10:00:00Z',
            }),
          );
        }
      } catch (e) {
        console.warn('[remotion-driver] fetch mock error', e);
      }
      return originalFetch(url, opts);
    };
  }

  // Fake Turnstile: widget dipasang di /order step 3.
  window.turnstile = {
    render: function (container, params) {
      try {
        if (container && typeof container !== 'string') {
          container.innerHTML =
            '<div style="font-family:sans-serif;font-size:13px;color:#3f6212;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;padding:10px 14px;">✓ Terverifikasi</div>';
        }
        if (params && typeof params.callback === 'function') {
          params.callback('fake-turnstile-token');
        }
      } catch (e) {}
      return 'w-1';
    },
    reset: function () {},
    remove: function () {},
  };
  try {
    var fakeTag = document.createElement('script');
    fakeTag.id = 'cf-turnstile-script';
    document.head.appendChild(fakeTag);
  } catch (e) {}

  // Fake Midtrans Snap: simpan callback, jangan buka popup asli.
  var __snapHandler = {
    pay: function (token, cb) {
      window.__snapCallbacks = cb || {};
      console.log('[remotion-driver] snap.pay intercepted');
    },
  };
  try {
    Object.defineProperty(window, 'snap', {
      get: function () {
        return __snapHandler;
      },
      set: function () {
        /* cegah snap.js timpa fake */
      },
      configurable: true,
    });
  } catch (e) {
    window.snap = __snapHandler;
  }

  // ---- Driver API via postMessage ----
  var parent = window.parent;

  function postResult(payload) {
    payload = payload || {};
    payload.app = 'remotion-result';
    try {
      parent.postMessage(payload, '*');
    } catch (e) {}
  }

  function findEl(sel) {
    try {
      if (sel.indexOf('text:') === 0) {
        var wanted = sel.slice(5).trim().toLowerCase();
        var els = document.querySelectorAll('button, a, div[onclick], span[onclick]');
        for (var i = 0; i < els.length; i++) {
          var t = (els[i].textContent || '').trim().toLowerCase();
          if (t === wanted || t.indexOf(wanted) === 0) {
            return els[i];
          }
        }
        return null;
      }
      return document.querySelector(sel);
    } catch (e) {
      return null;
    }
  }

  function rectOf(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
  }

  function nativeSet(el, value) {
    try {
      var proto =
        el.tagName === 'TEXTAREA'
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype;
      var setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
      setter.call(el, value);
    } catch (e) {
      el.value = value;
    }
  }

  function fire(el, type) {
    el.dispatchEvent(new Event(type, { bubbles: true }));
  }

  function tap(sel) {
    var el = findEl(sel);
    if (!el) {
      postResult({ type: 'error', what: 'notfound', sel: sel });
      return;
    }
    try {
      el.scrollIntoView({ block: 'center', behavior: 'instant' });
    } catch (e) {}
    var rect = rectOf(el);
    var events = ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'];
    events.forEach(function (type) {
      try {
        el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
      } catch (e) {}
    });
    if (typeof el.click === 'function') {
      try {
        el.click();
      } catch (e) {}
    }
    postResult({ type: 'tapped', rect: rect, sel: sel });
  }

  function typeInto(sel, text) {
    var el = findEl(sel);
    if (!el) {
      postResult({ type: 'error', what: 'notfound', sel: sel });
      return;
    }
    el.focus();
    var i = 0;
    function step() {
      if (i > text.length) {
        fire(el, 'input');
        fire(el, 'change');
        postResult({ type: 'typed', sel: sel });
        return;
      }
      nativeSet(el, text.slice(0, i));
      fire(el, 'input');
      i++;
      window.setTimeout(step, 65);
    }
    step();
  }

  function setValue(sel, value) {
    var el = findEl(sel);
    if (!el) {
      postResult({ type: 'error', what: 'notfound', sel: sel });
      return;
    }
    el.focus();
    nativeSet(el, value);
    fire(el, 'input');
    fire(el, 'change');
    postResult({ type: 'set', sel: sel });
  }

  function evalCode(code) {
    try {
      // eslint-disable-next-line no-eval
      var r = eval(code);
      postResult({ type: 'evaled', result: String(r) });
    } catch (e) {
      postResult({ type: 'error', what: 'eval', message: String(e) });
    }
  }

  var orderComplete = function () {
    var cbs = window.__snapCallbacks;
    if (cbs && typeof cbs.onSuccess === 'function') {
      cbs.onSuccess({ order_id: 'LV-20261008-RZAN01' });
      postResult({ type: 'paysuccess' });
    } else {
      postResult({ type: 'error', what: 'nosnapcb' });
    }
  };

  window.addEventListener('message', function (ev) {
    var d = ev.data;
    if (!d || typeof d !== 'object' || d.app !== 'remotion') return;
    switch (d.type) {
      case 'tap':
        tap(d.sel);
        break;
      case 'type':
        typeInto(d.sel, d.text);
        break;
      case 'set':
        setValue(d.sel, d.value);
        break;
      case 'eval':
        evalCode(d.code);
        break;
      case 'paysuccess':
        orderComplete();
        break;
      case 'ping':
        postResult({ type: 'pong' });
        break;
    }
  });

  postResult({ type: 'driver-ready' });
})();

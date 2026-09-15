document.documentElement.classList.add('js');
var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// lightbox: the image lifts off its place on the page, and is put back on close
var lb = document.getElementById('lb');
if (lb) {
  var lbImg = lb.querySelector('img'), current = null, busy = false;

  // transform that places the lightbox image exactly over the source image, tilt included
  function onTable(src) {
    var f = src.getBoundingClientRect(), to = lbImg.getBoundingClientRect(), cs = getComputedStyle(src.parentNode);
    var s = (parseFloat(cs.getPropertyValue('--s')) || 1) * (parseFloat(cs.getPropertyValue('--g')) || 1);
    return 'translate(' + (f.left + f.width / 2 - to.left - to.width / 2) + 'px,' + (f.top + f.height / 2 - to.top - to.height / 2) + 'px)' +
      ' rotate(' + (cs.getPropertyValue('--r').trim() || '0deg') + ') scale(' + (s * src.offsetWidth / to.width) + ')';
  }

  function openLb(src) {
    if (busy) return;
    var k = Math.min(1, innerWidth / src.naturalWidth, innerHeight / src.naturalHeight);
    lbImg.src = src.src; lbImg.alt = src.alt;
    lbImg.width = Math.round(src.naturalWidth * k); lbImg.height = Math.round(src.naturalHeight * k);
    lb.showModal();
    lb.classList.remove('closing');
    lbImg.style.transition = 'none';
    lbImg.style.transform = onTable(src);
    lbImg.getBoundingClientRect();
    lbImg.style.transition = '';
    lbImg.style.transform = '';
    src.style.visibility = 'hidden';
    current = src;
  }

  function closeLb() {
    if (!current || busy) return;
    busy = true;
    lbImg.style.transform = onTable(current);
    lb.classList.add('closing');
    setTimeout(function () {
      lb.close();
      current.style.visibility = '';
      current = null; busy = false;
      lbImg.style.transform = '';
    }, reduced ? 0 : 500);
  }

  document.querySelectorAll('.grid button:not(.gift)').forEach(function (btn) {
    btn.addEventListener('click', function () { openLb(btn.querySelector('img')); });
  });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  lb.addEventListener('cancel', function (e) { e.preventDefault(); closeLb(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.open) { e.preventDefault(); closeLb(); } });
  document.getElementById('lb-close').addEventListener('click', closeLb);
}

// home: her name arrives letter by letter, the ü last
var h1 = document.querySelector('.home h1');
if (h1) {
  var letters = Array.from(h1.textContent), order = letters.map(function (_, i) { return i; });
  order.sort(function (a, b) { return (letters[a] === 'ü') - (letters[b] === 'ü') || a - b; });
  h1.setAttribute('aria-label', h1.textContent);
  h1.innerHTML = letters.map(function (ch, i) {
    return '<span aria-hidden="true" style="--i:' + (order.indexOf(i) + (ch === 'ü' ? 2 : 0)) + '">' + ch + '</span>';
  }).join('');
}

// the gift drawing: a double-tap grows it, the third double-tap turns it over
var gift = document.querySelector('.grid .gift'), stage = document.getElementById('stage');
if (gift && stage) {
  var card = document.getElementById('card'), lastTap = 0, grown = 0;

  gift.addEventListener('click', function () {
    var now = Date.now();
    if (now - lastTap > 400) { lastTap = now; return; }
    lastTap = 0;
    if (++grown < 3) gift.style.setProperty('--g', Math.pow(1.4, grown));
    else reveal();
  });

  function wait(ms) { return new Promise(function (r) { setTimeout(r, reduced ? 0 : ms); }); }
  function after(ms, fn) { setTimeout(fn, reduced ? 0 : ms); }

  function reveal() {
    var others = Array.prototype.filter.call(document.querySelectorAll('.grid button'), function (b) { return b !== gift; });
    var img = gift.querySelector('img'), f = img.getBoundingClientRect(), cs = getComputedStyle(gift);
    document.body.classList.add('revealing');

    // the card takes the drawing's exact place and tilt, then the drawing itself steps aside
    card.style.setProperty('--cx', f.left + f.width / 2 + 'px');
    card.style.setProperty('--cy', f.top + f.height / 2 + 'px');
    card.style.setProperty('--w', img.offsetWidth * (parseFloat(cs.getPropertyValue('--s')) || 1) * (parseFloat(cs.getPropertyValue('--g')) || 1) + 'px');
    card.style.setProperty('--r', cs.getPropertyValue('--r').trim() || '0deg');
    stage.hidden = false;
    gift.style.visibility = 'hidden';

    // the others go raggedly; a few carry one letter each, spread across the spread
    var name = stage.dataset.name || '', lettered = {};
    for (var i = 0; i < name.length; i++) lettered[Math.round(i * (others.length - 1) / Math.max(1, name.length - 1))] = name[i];
    others.forEach(function (b, i) {
      var delay = (i * 7919) % 11 * 60;   // ponytail: fixed pseudo-random stagger, 0-600ms
      after(delay, function () { b.classList.add('gone'); });
      if (lettered[i] === undefined) return;
      var span = document.createElement('span');
      span.className = 'letter'; span.textContent = lettered[i]; span.setAttribute('aria-hidden', 'true');
      b.appendChild(span);
      after(delay + 150, function () { span.classList.add('on'); });
    });

    wait(500).then(function () {
      // drift to the centre, upright, at reading size
      var nw = img.naturalWidth || 519, nh = img.naturalHeight || 739;
      var w = Math.min(innerWidth * 0.9, 480, innerHeight * 0.82 * nw / nh);
      card.style.setProperty('--cx', innerWidth / 2 + 'px');
      card.style.setProperty('--cy', innerHeight / 2 + 'px');
      card.style.setProperty('--w', w + 'px');
      card.style.setProperty('--r', '0deg');
      return wait(1400);   // the fade ends, then a beat of stillness
    }).then(function () {
      card.classList.add('flipped');
      return wait(700);
    }).then(function () {
      card.classList.add('done');
      card.querySelector('.back').focus({ preventScroll: true });
    });
  }
}

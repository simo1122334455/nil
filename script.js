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

// the note fades in once it is scrolled to
var note = document.querySelector('.note');
if (note) {
  if (!('IntersectionObserver' in window)) note.classList.add('is-visible');
  else new IntersectionObserver(function (entries, io) {
    if (entries[0].isIntersecting) { note.classList.add('is-visible'); io.disconnect(); }
  }, { threshold: 0.15 }).observe(note);
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

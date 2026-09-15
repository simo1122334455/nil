document.documentElement.classList.add('js');

// lightbox: native <dialog>; image opens at its own pixel size, never larger
var lb = document.getElementById('lb');
if (lb) {
  var lbImg = lb.querySelector('img');
  document.querySelectorAll('.grid button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var src = btn.querySelector('img');
      lbImg.src = src.src;
      lbImg.alt = src.alt;
      lbImg.style.maxWidth = Math.min(src.naturalWidth || 9999, innerWidth) + 'px';
      lb.showModal();
    });
  });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
}

// the note fades in once it is scrolled to
var note = document.querySelector('.note');
if (note) {
  if (!('IntersectionObserver' in window)) note.classList.add('is-visible');
  else new IntersectionObserver(function (entries, io) {
    if (entries[0].isIntersecting) { note.classList.add('is-visible'); io.disconnect(); }
  }, { threshold: 0.15 }).observe(note);
}

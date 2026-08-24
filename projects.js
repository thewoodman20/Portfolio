/* Progressive enhancement: the page is complete without JS.
   These behaviours are additive only. */

/* Don't autoplay looping clips for viewers who asked for reduced motion. */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('video[autoplay]').forEach(v => {
    v.autoplay = false;
    v.pause();
  });
}

/* ---- swap the main image from a thumbnail ---- */
document.addEventListener('click', e => {
  const t = e.target.closest('.thumbs button');
  if (!t) return;
  const media = t.closest('.media');
  const main = media.querySelector('.main');

  // Rebuild the main slot so it can hold either an image or a video.
  // Replacing the node also stops whatever was playing.
  main.replaceChildren();
  let el;
  if (t.dataset.type === 'video') {
    el = document.createElement('video');
    el.controls = true;
    el.loop = true;
    el.playsInline = true;
    el.preload = 'metadata';
    // Loop silently like a GIF, unless the viewer asked for reduced motion.
    el.muted = true;
    el.autoplay = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } else {
    el = document.createElement('img');
    el.alt = t.dataset.cap || '';
  }
  el.src = t.dataset.src;          // set via property, so spaces need no escaping
  main.appendChild(el);

  media.querySelector('.cap').textContent = t.dataset.cap || '';
  media.querySelectorAll('.thumbs button').forEach(b =>
    b.setAttribute('aria-selected', String(b === t)));
});

/* ---- capability filter ---- */
const projects = [...document.querySelectorAll('.proj')];
const dropdown = document.getElementById('filterDropdown');
const toggle   = document.getElementById('filterToggle');
const menu     = document.getElementById('filterMenu');
const label    = toggle.querySelector('.dropdown-label');
const buttons  = [...menu.querySelectorAll('button')];
const tally    = document.getElementById('tally');
const empty    = document.getElementById('empty');

function applyFilter(cap) {
  let shown = 0;
  let name  = 'All';
  projects.forEach(p => {
    const match = cap === 'all' || p.dataset.cap.split(' ').includes(cap);
    p.hidden = !match;
    if (match) shown++;
  });
  buttons.forEach(b => {
    const pressed = b.dataset.cap === cap;
    b.setAttribute('aria-pressed', String(pressed));
    if (pressed) name = b.textContent.trim();
  });
  label.textContent = `Filter: ${name}`;
  tally.textContent = `${shown} of ${projects.length} shown`;
  empty.hidden = shown > 0;
}

function openMenu()  { dropdown.classList.add('open');    toggle.setAttribute('aria-expanded', 'true'); }
function closeMenu() { dropdown.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }

toggle.addEventListener('click', () => {
  dropdown.classList.contains('open') ? closeMenu() : openMenu();
});
document.addEventListener('click', e => {
  if (!dropdown.contains(e.target)) closeMenu();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});
buttons.forEach(b => b.addEventListener('click', () => { applyFilter(b.dataset.cap); closeMenu(); }));
applyFilter('all');

/* If someone deep-links to a hidden project, reveal everything first. */
if (location.hash) {
  const target = document.querySelector(location.hash);
  if (target && target.classList.contains('proj')) applyFilter('all');
}

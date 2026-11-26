import { qs, qsa } from '../core/dom.js';

const SECTIONS = ['home', 'discover', 'library', 'wishlist'];
const MOBILE_QUERY = '(max-width: 860px)';

/** Header: scroll state, mobile menu, and active-section highlighting. */
export function initNav() {
  const header = qs('[data-site-header]');
  const toggle = qs('[data-nav-toggle]');
  const links = qsa('[data-nav-link]');

  /* ----- Mobile menu ----- */
  function setOpen(open) {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  toggle.addEventListener('click', () => setOpen(!header.classList.contains('is-open')));
  links.forEach((link) => link.addEventListener('click', () => setOpen(false)));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  window.matchMedia(MOBILE_QUERY).addEventListener('change', (event) => {
    if (!event.matches) setOpen(false);
  });

  /* ----- Active link ----- */
  function setActive(id) {
    links.forEach((link) => {
      if (link.dataset.navLink === id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  SECTIONS.forEach((id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });

  links.forEach((link) =>
    link.addEventListener('click', () => setActive(link.dataset.navLink)),
  );

  /* ----- Header background + bottom-of-page edge case ----- */
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atBottom) setActive(SECTIONS[SECTIONS.length - 1]);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

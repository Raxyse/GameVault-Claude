import { esc, qs } from '../core/dom.js';
import { icon } from './icons.js';

const VISIBLE_MS = 2600;
let region;

// The region is a manual popover so toasts render above an open <dialog>.
function openRegion() {
  region.classList.add('is-open');
  try {
    if (region.matches(':popover-open')) region.hidePopover();
    region.showPopover();
  } catch {
    /* Popover API unavailable: the .is-open class still shows the region. */
  }
}

function closeRegion() {
  region.classList.remove('is-open');
  try {
    region.hidePopover();
  } catch {
    /* ignore */
  }
}

function dismiss(toast) {
  toast.classList.add('is-leaving');
  setTimeout(() => {
    toast.remove();
    if (!region.children.length) closeRegion();
  }, 300);
}

export function showToast(message) {
  region ??= qs('[data-toast-region]');
  if (!region) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `${icon('check', 18)}<span>${esc(message)}</span>`;
  region.append(toast);
  while (region.children.length > 3) region.firstElementChild.remove();

  openRegion();
  setTimeout(() => dismiss(toast), VISIBLE_MS);
}

import { useEffect, useId, useRef } from 'react';
import type React from 'react';

/**
 * Shared behaviour for every BhashaSetu modal / pop-up:
 *  - only one modal is open at a time (opening one asks the others to close)
 *  - Escape closes the modal
 *  - page scroll is locked while a modal is open
 *
 * Pair it with `backdropDismiss(onClose)` on the overlay element so a click on
 * the blurred backdrop (outside the dialog panel) closes it.
 */
export const MODAL_OPEN_EVENT = 'bhashasetu:modal-open';

/** Tailwind classes for the shared blurred espresso backdrop. */
export const MODAL_BACKDROP_CLASS = 'bg-[#1C1917]/45 backdrop-blur-[6px]';

let openModalCount = 0;

export function useModalBehavior(isOpen: boolean, onClose: () => void) {
  const id = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;

    // Tell any other open modal (and popovers in the shell) to close first.
    window.dispatchEvent(new CustomEvent(MODAL_OPEN_EVENT, { detail: id }));

    const handleOtherModalOpened = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== id) closeRef.current();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
    };

    window.addEventListener(MODAL_OPEN_EVENT, handleOtherModalOpened);
    document.addEventListener('keydown', handleKeyDown);

    openModalCount += 1;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener(MODAL_OPEN_EVENT, handleOtherModalOpened);
      document.removeEventListener('keydown', handleKeyDown);
      openModalCount = Math.max(0, openModalCount - 1);
      if (openModalCount === 0) {
        document.body.style.overflow = previousOverflow === 'hidden' ? '' : previousOverflow;
      }
    };
  }, [isOpen, id]);
}

/** Close when the press starts on the backdrop itself, not inside the dialog panel. */
export function backdropDismiss(onClose: () => void) {
  return (e: React.MouseEvent<HTMLElement>) => {
    if (e.target === e.currentTarget) onClose();
  };
}

/** 'auto' when the user prefers reduced motion, otherwise 'smooth'. */
export function scrollBehavior(): ScrollBehavior {
  if (typeof window === 'undefined' || !window.matchMedia) return 'smooth';
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

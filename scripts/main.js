/* ============================================================
   Artificial Intelligence — Landing Page
   Vanilla JS controller:
     - Mobile menu (open/close, ARIA, ESC, focus trap basics)
     - Mouse parallax for background blobs and AI visual
     - Canvas-based animated neural network sphere (the "brain")
     - Honors prefers-reduced-motion
   ============================================================ */

(() => {
  "use strict";

  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Mobile menu ---------------- */
  const hamburger   = document.getElementById("hamburger");
  const menuClose   = document.getElementById("menu-close");
  const mobileMenu  = document.getElementById("mobile-menu");
  const backdrop    = document.getElementById("menu-backdrop");

  const openMenu = () => {
    mobileMenu.setAttribute("aria-hidden", "false");
    hamburger.setAttribute("aria-expanded", "true");
    backdrop.hidden = false;
    requestAnimationFrame(() => backdrop.classList.add("is-visible"));
    document.body.style.overflow = "hidden";
    // Move focus to first link
    const firstLink = mobileMenu.querySelector("a");
    if (firstLink) firstLink.focus({ preventScroll: true });
  };

  const closeMenu = () => {
    mobileMenu.setAttribute("aria-hidden", "true");
    hamburger.setAttribute("aria-expanded", "false");
    backdrop.classList.remove("is-visible");
    document.body.style.overflow = "";
    setTimeout(() => { backdrop.hidden = true; }, 350);
    hamburger.focus({ preventScroll: true });
  };

  if (hamburger) hamburger.addEventListener("click", openMenu);
  if (menuClose) menuClose.addEventListener("click", closeMenu);
  if (backdrop)  backdrop.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileMenu.getAttribute("aria-hidden") === "false") {
      closeMenu();
    }
  });

  // Auto-close on link click (mobile)
  mobileMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", closeMenu)
  );

  /* ---------------- Mouse parallax ----------------
     The bokeh dots are CSS-animated via `transform`, so to add parallax
     without fighting that animation we move the *containers* — `.bokeh`
     and the page-level circuit/streak — and the hero visual.
  */
  if (!prefersReducedMotion) {
    const layers = [
      { el: document.querySelector(".bokeh"),       depth: 18 },
      { el: document.querySelector(".lens-streak"), depth: 26 },
      { el: document.querySelector(".bg__gradient"),depth: 6  },
    ].filter((l) => l.el);
    const visual = document.querySelector(".hero__visual");

    let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

    window.addEventListener("mousemove", (e) => {
      // -1 .. +1
      targetX = (e.clientX / window.innerWidth  - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    const tick = () => {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      layers.forEach(({ el, depth }) => {
        el.style.transform =
          `translate3d(${(-currentX * depth).toFixed(2)}px, ${(-currentY * depth).toFixed(2)}px, 0)`;
      });

      if (visual) {
        const d = 14;
        visual.style.transform =
          `translate3d(${(currentX * d).toFixed(2)}px, ${(currentY * d).toFixed(2)}px, 0)`;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------------- Scroll-triggered fade-in ---------------- */
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      )
    : null;

  if (io) document.querySelectorAll("[data-scroll]").forEach((el) => io.observe(el));

  /* The 3D brain is now rendered by Three.js — see scripts/brain.js */
})();

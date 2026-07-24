/* =============================================================================
   NijatMessenger — interactions
   Vanilla JS, no dependencies. Each behaviour is a small self-contained module
   initialised at the bottom. Everything degrades gracefully and respects
   prefers-reduced-motion and coarse (touch) pointers.
   ========================================================================== */
(function () {
  "use strict";

  // Global capability flags ---------------------------------------------------
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ------------------------------------------------------------------ */
  /* Footer year                                                         */
  /* ------------------------------------------------------------------ */
  function initYear() {
    const el = $("#year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------------ */
  /* Navigation: scrolled state + mobile menu                            */
  /* ------------------------------------------------------------------ */
  function initNav() {
    const nav = $("#nav");
    const toggle = $("#navToggle");
    const menu = $("#mobileMenu");

    // Add a frosted background once the page is scrolled a little.
    if (nav) {
      const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 12);
      onScroll();
      on(window, "scroll", onScroll, { passive: true });
    }

    // Mobile dropdown open/close.
    if (toggle && menu) {
      const setOpen = (open) => {
        toggle.setAttribute("aria-expanded", String(open));
        menu.hidden = !open;
      };
      on(toggle, "click", () => setOpen(menu.hidden));
      // Close after tapping a link.
      $$("a", menu).forEach((a) => on(a, "click", () => setOpen(false)));
      // Close when resizing up to desktop.
      on(window, "resize", () => { if (window.innerWidth > 780) setOpen(false); });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Scroll reveal via IntersectionObserver                              */
  /* ------------------------------------------------------------------ */
  function initReveal() {
    const items = $$(".reveal");
    if (!items.length) return;

    // No IO support (or reduced motion): just show everything.
    if (!("IntersectionObserver" in window) || prefersReducedMotion) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          // Stagger siblings that share a parent for a nicer cascade.
          const el = entry.target;
          const siblings = Array.from(el.parentElement.children).filter((c) => c.classList.contains("reveal"));
          const index = siblings.indexOf(el);
          el.style.transitionDelay = Math.min(index * 70, 350) + "ms";
          el.classList.add("is-visible");
          io.unobserve(el);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------ */
  /* Cursor glow (desktop, fine pointer only)                            */
  /* ------------------------------------------------------------------ */
  function initCursorGlow() {
    const glow = $(".cursor-glow");
    if (!glow || !finePointer || prefersReducedMotion) return;

    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let tx = x, ty = y, raf = null;

    const render = () => {
      // Ease toward the target for a smooth trailing feel.
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = Math.abs(tx - x) > 0.5 || Math.abs(ty - y) > 0.5 ? requestAnimationFrame(render) : null;
    };

    on(window, "pointermove", (e) => {
      tx = e.clientX; ty = e.clientY;
      glow.classList.add("is-active");
      if (!raf) raf = requestAnimationFrame(render);
    });
    on(document, "pointerleave", () => glow.classList.remove("is-active"));
  }

  /* ------------------------------------------------------------------ */
  /* Magnetic buttons                                                    */
  /* ------------------------------------------------------------------ */
  function initMagnetic() {
    if (!finePointer || prefersReducedMotion) return;
    const strength = 0.4;

    $$("[data-magnetic]").forEach((el) => {
      on(el, "pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${mx * strength}px, ${my * strength}px)`;
      });
      on(el, "pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Ripple click effect                                                 */
  /* ------------------------------------------------------------------ */
  function initRipple() {
    $$("[data-ripple]").forEach((el) => {
      on(el, "pointerdown", (e) => {
        const r = el.getBoundingClientRect();
        const size = Math.max(r.width, r.height);
        const span = document.createElement("span");
        span.className = "ripple";
        span.style.width = span.style.height = size + "px";
        span.style.left = e.clientX - r.left - size / 2 + "px";
        span.style.top = e.clientY - r.top - size / 2 + "px";
        el.appendChild(span);
        on(span, "animationend", () => span.remove());
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Tilt + pointer-follow glow on cards                                 */
  /* ------------------------------------------------------------------ */
  function initTilt() {
    if (!finePointer || prefersReducedMotion) return;
    const max = 7; // degrees

    $$("[data-tilt]").forEach((card) => {
      const glow = $(".feature-card__glow", card);
      on(card, "pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateY(-4px)`;
        if (glow) {
          glow.style.setProperty("--mx", px * 100 + "%");
          glow.style.setProperty("--my", py * 100 + "%");
        }
      });
      on(card, "pointerleave", () => { card.style.transform = ""; });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Mouse parallax on hero elements                                     */
  /* ------------------------------------------------------------------ */
  function initParallax() {
    if (!finePointer || prefersReducedMotion) return;
    const items = $$("[data-parallax]");
    const blobs = $$(".bg__blob");
    if (!items.length && !blobs.length) return;

    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

    const render = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      items.forEach((el) => {
        const depth = parseFloat(el.dataset.parallax) || 6;
        el.style.transform = `translate(${cx * depth}px, ${cy * depth}px)`;
      });
      blobs.forEach((el, i) => {
        const depth = (i + 1) * 6;
        el.style.marginLeft = cx * depth + "px";
        el.style.marginTop = cy * depth + "px";
      });
      raf = Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(render) : null;
    };

    on(window, "pointermove", (e) => {
      // Normalise to -0.5..0.5 around the viewport centre.
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
      if (!raf) raf = requestAnimationFrame(render);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Smooth anchor scrolling (accounts for the sticky nav)               */
  /* CSS handles smooth-scroll; this also closes the mobile menu and     */
  /* keeps focus correct for accessibility.                              */
  /* ------------------------------------------------------------------ */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach((a) => {
      on(a, "click", (e) => {
        const id = a.getAttribute("href");
        if (id === "#" || id.length < 2) return;
        const target = document.getElementById(id.slice(1));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
        // Move focus for keyboard users without an extra scroll jump.
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Boot                                                                */
  /* ------------------------------------------------------------------ */
  function init() {
    initYear();
    initNav();
    initReveal();
    initCursorGlow();
    initMagnetic();
    initRipple();
    initTilt();
    initParallax();
    initSmoothScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

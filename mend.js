/* ============================================================
   MEND — shared behaviour (every page)
   - contact address from config.js
   - mobile navigation
   - scroll reveal (one IntersectionObserver)
   - ambient light that cools as you scroll
   Motion durations are read from the CSS tokens in mend.css.
   ============================================================ */
(function(){
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");

  var cfg = window.MEND_CONFIG = window.MEND_CONFIG || {};
  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* Shared helpers for home.js. */
  window.Mend = {
    config: cfg,
    reduced: function(){ return motionQuery.matches; },
    /* Read a duration token (e.g. "--t-panel") from CSS, in milliseconds. */
    token: function(name, fallback){
      var raw = getComputedStyle(root).getPropertyValue(name).trim();
      var n = parseFloat(raw);
      if(isNaN(n)) return fallback;
      return /ms$/.test(raw) ? n : (/s$/.test(raw) ? n * 1000 : n);
    },
    contactLink: function(){
      if(!isEmail(cfg.contactEmail)) return null;
      var a = document.createElement("a");
      a.href = "mailto:" + cfg.contactEmail;
      a.textContent = cfg.contactEmail;
      return a;
    }
  };

  function isEmail(v){
    return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  /* ---------- contact address (never invented) ---------- */
  document.querySelectorAll("[data-contact]").forEach(function(el){
    var link = window.Mend.contactLink();
    if(link) el.replaceChildren(link);
  });

  /* ---------- mobile navigation ---------- */
  var nav = document.getElementById("nav");
  if(nav){
    var toggle = nav.querySelector(".nav-toggle");
    var links = nav.querySelector(".navlinks");
    var mobile = window.matchMedia("(max-width:860px)");

    var setOpen = function(open, restoreFocus){
      links.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if(open){ var first = links.querySelector("a"); if(first) first.focus(); }
      else if(restoreFocus){ toggle.focus(); }
    };
    var isOpen = function(){ return links.classList.contains("open"); };

    if(toggle && links){
      toggle.addEventListener("click", function(){ setOpen(!isOpen(), true); });

      document.addEventListener("keydown", function(e){
        if(!isOpen()) return;
        if(e.key === "Escape"){ e.preventDefault(); setOpen(false, true); return; }
        if(e.key !== "Tab" || !mobile.matches) return;
        var items = [toggle].concat(Array.prototype.slice.call(links.querySelectorAll("a")));
        var first = items[0], last = items[items.length - 1];
        if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      });
      document.addEventListener("pointerdown", function(e){
        if(isOpen() && !nav.contains(e.target)) setOpen(false, false);
      });
      links.addEventListener("click", function(e){
        if(e.target.closest("a")) setOpen(false, false);
      });
      var onBreakpoint = function(){ if(isOpen()) setOpen(false, false); };
      if(mobile.addEventListener) mobile.addEventListener("change", onBreakpoint);
      else mobile.addListener(onBreakpoint);
    }
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if(!("IntersectionObserver" in window)){
    revealEls.forEach(function(el){ el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting) return;
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      });
    }, {threshold:.15, rootMargin:"0px 0px -6% 0px"});
    revealEls.forEach(function(el){ io.observe(el); });
  }

  /* ---------- ambient light: hot -> cool as you scroll ----------
     Two fixed layers; only their opacity changes (compositor-only),
     in one requestAnimationFrame per scroll burst. */
  var hot = document.querySelector(".glow-hot");
  var cool = document.querySelector(".glow-cool");
  var maxScroll = 0, queued = false;

  function measure(){ maxScroll = Math.max(0, root.scrollHeight - window.innerHeight); }
  function paint(){
    queued = false;
    var p = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
    if(hot) hot.style.opacity = (1 - p * .85).toFixed(3);
    if(cool) cool.style.opacity = p.toFixed(3);
    if(nav) nav.classList.toggle("stuck", window.scrollY > 24);
  }
  function onScroll(){ if(!queued){ queued = true; window.requestAnimationFrame(paint); } }
  function onResize(){ measure(); onScroll(); }

  function applyMotionPreference(){
    if(motionQuery.matches){
      /* Reduced motion: a still, mid-way light and no scroll work at all. */
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if(hot) hot.style.opacity = ".7";
      if(cool) cool.style.opacity = ".3";
      if(nav) window.addEventListener("scroll", navOnly, {passive:true});
    } else {
      window.removeEventListener("scroll", navOnly);
      measure();
      window.addEventListener("scroll", onScroll, {passive:true});
      window.addEventListener("resize", onResize);
      paint();
    }
  }
  function navOnly(){ nav.classList.toggle("stuck", window.scrollY > 24); }

  applyMotionPreference();
  window.addEventListener("load", measure);
  if(motionQuery.addEventListener) motionQuery.addEventListener("change", applyMotionPreference);
})();

/* ============================================================
   MEND — homepage behaviour
   preview tabs · illustrative dial · FAQ · waitlist forms
   Needs config.js and mend.js (window.Mend) loaded first.
   ============================================================ */
(function(){
  "use strict";
  var Mend = window.Mend;
  if(!Mend) return;
  var $ = function(sel, ctx){ return (ctx || document).querySelector(sel); };
  var $$ = function(sel, ctx){ return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ============================================================
     PREVIEW — explicit selection only, never autoplays
     ============================================================ */
  (function(){
    var root = $("#preview");
    if(!root) return;
    var tabs = $$(".ptab", root), panels = $$(".screen-panel", root);
    if(!tabs.length || tabs.length !== panels.length) return;

    function select(i, focus){
      tabs.forEach(function(t, k){
        t.setAttribute("aria-selected", k === i ? "true" : "false");
        t.tabIndex = k === i ? 0 : -1;
      });
      panels.forEach(function(p, k){ p.classList.toggle("on", k === i); });
      if(focus) tabs[i].focus();
    }
    tabs.forEach(function(t, i){
      t.addEventListener("click", function(){ select(i, false); });
      t.addEventListener("keydown", function(e){
        var n = tabs.length, to = -1;
        if(e.key === "ArrowRight" || e.key === "ArrowDown") to = (i + 1) % n;
        else if(e.key === "ArrowLeft" || e.key === "ArrowUp") to = (i - 1 + n) % n;
        else if(e.key === "Home") to = 0;
        else if(e.key === "End") to = n - 1;
        if(to > -1){ e.preventDefault(); select(to, true); }
      });
    });
    select(0, false);
    root.classList.add("tabs-ready");
  })();

  /* ============================================================
     DIAL — an illustrative sample, not a schedule
     ============================================================ */
  (function(){
    var dial = $("#dial");
    if(!dial) return;

    var STAGES = [
      {m:0,  st:"Right after",       h:"Sit down. Nothing to decide yet.",
       t:"Mend would start by asking nothing of you. A quiet moment, and permission to wait before going back in.",
       s:"“You don’t have to fix it this second.”"},
      {m:3,  st:"Settling",          h:"One slow breath, if you want one",
       t:"A short, optional breathing prompt you can follow or skip. It’s there to give you something to do with your hands, not to make you feel a certain way.",
       s:"“Breathe out slowly. I’ll keep count.”"},
      {m:6,  st:"Looking back",      h:"What happened, in two lines",
       t:"A couple of taps: what set it off, and how big it felt. Meant to be quick, and you can skip it.",
       s:"“Third ask · big · a tired day”"},
      {m:10, st:"The question under it", h:"A question, not a verdict",
       t:"One gentle question based on what you chose, something like what you were worried would happen. Nothing is scored or graded.",
       s:"“What were you most worried about at 8:47?”"},
      {m:14, st:"Finding words",     h:"Words for going back in",
       t:"Suggested ways to say it, written for your child’s age, that you can change until they sound like you. Short and concrete is the starting point.",
       s:"“I yelled, and that was too big. You didn’t do anything wrong. I’m here.”"},
      {m:18, st:"Closing it",        h:"Close it, and leave it",
       t:"Mend would ask whether you went back in, offer one small thing to try tomorrow if you’d like, and then stop. No streak to protect.",
       s:"“Bath fifteen minutes earlier tomorrow? That’s the whole plan.”"}
    ];
    var MAX = 20, CIRC = 553;

    var ring = $("#dial-ring"), prog = $("#prog"), knob = $("#knob"), dm = $("#dm"),
        panel = $("#panel"), pph = $("#pph"), pth = $("#pth"), ptx = $("#ptx"), psd = $("#psd"),
        prev = $("#dial-prev"), next = $("#dial-next");
    var val = 0, cur = -1, size = dial.clientWidth, dragging = false;

    /* minute ticks */
    (function(){
      var g = $("#ticks"), ns = "http://www.w3.org/2000/svg";
      for(var i = 0; i < MAX; i++){
        var a = (i / MAX) * Math.PI * 2, r1 = 79, r2 = i % 5 === 0 ? 70 : 75;
        var l = document.createElementNS(ns, "line");
        l.setAttribute("class", "tick");
        l.setAttribute("x1", (100 + Math.cos(a) * r1).toFixed(2));
        l.setAttribute("y1", (100 + Math.sin(a) * r1).toFixed(2));
        l.setAttribute("x2", (100 + Math.cos(a) * r2).toFixed(2));
        l.setAttribute("y2", (100 + Math.sin(a) * r2).toFixed(2));
        l.setAttribute("opacity", i % 5 === 0 ? ".6" : ".28");
        g.appendChild(l);
      }
    })();

    function stageFor(m){
      for(var i = STAGES.length - 1; i >= 0; i--) if(m >= STAGES[i].m) return i;
      return 0;
    }

    function render(v){
      val = Math.max(0, Math.min(MAX, v));
      var minute = Math.round(val), p = val / MAX;
      prog.setAttribute("stroke-dashoffset", (CIRC - CIRC * p).toFixed(1));
      prog.style.stroke = p < .35 ? "#FFF6E6" : (p < .75 ? "#E9A94F" : "#7C9C8B");

      var a = p * Math.PI * 2 - Math.PI / 2, r = (size / 2) * .88;
      knob.style.transform = "translate(-50%,-50%) translate(" +
        (Math.cos(a) * r).toFixed(1) + "px," + (Math.sin(a) * r).toFixed(1) + "px)";

      dm.textContent = minute;
      var i = stageFor(val), d = STAGES[i];
      dial.setAttribute("aria-valuenow", minute);
      dial.setAttribute("aria-valuetext", "Minute " + minute + " of 20: " + d.st);
      prev.disabled = i === 0 && val === 0;
      next.disabled = i === STAGES.length - 1 && val === MAX;

      if(i !== cur){
        var first = cur === -1;
        cur = i;
        var end = i + 1 < STAGES.length ? STAGES[i + 1].m - 1 : MAX;
        pph.textContent = d.st + " · around minute " + d.m + (end > d.m ? "–" + end : "");
        pth.textContent = d.h; ptx.textContent = d.t; psd.textContent = d.s;
        if(!first && !Mend.reduced()){
          panel.classList.remove("swap");
          void panel.offsetWidth;            /* restart the one-shot swap animation */
          panel.classList.add("swap");
        }
      }
    }

    function fromPoint(e){
      var r = dial.getBoundingClientRect();
      var x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
      var ang = Math.atan2(y, x) + Math.PI / 2;
      if(ang < 0) ang += Math.PI * 2;
      var m = (ang / (Math.PI * 2)) * MAX;
      /* don't wrap from the end straight back to the start (or the reverse) mid-drag */
      if(val > MAX * .75 && m < MAX * .25) m = MAX;
      else if(val < MAX * .25 && m > MAX * .75) m = 0;
      render(m);
    }

    ring.addEventListener("pointerdown", function(e){
      if(e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      try{ ring.setPointerCapture(e.pointerId); }catch(_){}
      dial.focus({preventScroll:true});
      fromPoint(e);
      e.preventDefault();
    });
    ring.addEventListener("pointermove", function(e){ if(dragging) fromPoint(e); });
    function stop(){ dragging = false; }
    ring.addEventListener("pointerup", stop);
    ring.addEventListener("pointercancel", stop);
    ring.addEventListener("lostpointercapture", stop);

    dial.addEventListener("keydown", function(e){
      var handled = true;
      switch(e.key){
        case "ArrowRight": case "ArrowUp":   render(Math.round(val) + 1); break;
        case "ArrowLeft":  case "ArrowDown": render(Math.round(val) - 1); break;
        case "PageUp":   render(Math.round(val) + 5); break;
        case "PageDown": render(Math.round(val) - 5); break;
        case "Home": render(0); break;
        case "End":  render(MAX); break;
        default: handled = false;
      }
      if(handled) e.preventDefault();
    });

    /* step buttons: jump between stages (a touch-friendly alternative to dragging) */
    prev.addEventListener("click", function(){
      var i = stageFor(val);
      render(val > STAGES[i].m ? STAGES[i].m : STAGES[Math.max(0, i - 1)].m);
    });
    next.addEventListener("click", function(){
      var i = stageFor(val);
      render(i + 1 < STAGES.length ? STAGES[i + 1].m : MAX);
    });

    window.addEventListener("resize", function(){ size = dial.clientWidth; render(val); });
    render(0);
  })();

  /* ============================================================
     FAQ — native <details>, animated height via the Web Animations API
     ============================================================ */
  (function(){
    $$(".faq .q").forEach(function(q){
      var summary = $("summary", q), body = $(".a", q);
      if(!summary || !body || !body.animate) return;
      q.setAttribute("data-js", "");
      if(q.open) q.classList.add("is-open");
      var running = null;

      function run(from, to, done){
        if(running) running.cancel();
        body.style.overflow = "hidden";
        var anim = body.animate(
          [{height: from + "px"}, {height: to + "px"}],
          {duration: Mend.token("--t-panel", 220), easing: "cubic-bezier(.22,.61,.36,1)"}
        );
        running = anim;
        var finish = function(){
          if(running !== anim) return;
          running = null; body.style.overflow = "";
          if(done) done();
        };
        anim.onfinish = finish;
        anim.oncancel = function(){ if(running === anim){ running = null; body.style.overflow = ""; } };
      }

      summary.addEventListener("click", function(e){
        e.preventDefault();
        var opening = !q.classList.contains("is-open");
        if(opening){
          q.open = true;
          q.classList.add("is-open");
          if(!Mend.reduced()) run(0, body.scrollHeight);
        } else {
          q.classList.remove("is-open");
          if(Mend.reduced()){ q.open = false; return; }
          run(body.offsetHeight, 0, function(){ q.open = false; });
        }
      });
    });
  })();

  /* ============================================================
     WAITLIST FORMS — idle · submitting · success · error
     ============================================================ */
  function looksLikeEmail(v){
    v = (v || "").trim();
    var at = v.indexOf("@");
    return at > 0 && at < v.length - 1;      /* lenient: the server decides the rest */
  }

  function initForm(form){
    var input = $('input[type="email"]', form);
    var btn = $("button[type=submit]", form);
    var status = $(".formstatus", form);
    var trap = $('input[name="_gotcha"]', form);
    var submitting = false, finished = false;

    function setState(s){
      form.setAttribute("data-state", s);
      form.setAttribute("aria-busy", s === "submitting" ? "true" : "false");
    }
    function say(kind, text, withContact){
      status.setAttribute("data-state", kind);
      status.textContent = text;
      if(withContact){
        var link = Mend.contactLink();
        if(link){
          status.appendChild(document.createTextNode(" You can also write to "));
          status.appendChild(link);
          status.appendChild(document.createTextNode("."));
        }
      }
    }
    function lock(on){ input.disabled = on; btn.disabled = on; }

    setState("idle");

    form.addEventListener("submit", function(e){
      e.preventDefault();
      if(submitting || finished) return;      /* no duplicate submissions */
      if(trap && trap.value) return;          /* honeypot tripped: ignore silently */

      input.removeAttribute("aria-invalid");
      if(!looksLikeEmail(input.value)){
        input.setAttribute("aria-invalid", "true");
        setState("error");
        say("error", "Please enter an email address, like name@example.com.");
        input.focus();
        return;
      }

      var endpoint = Mend.config.formEndpoint;
      if(typeof endpoint !== "string" || endpoint.indexOf("https://") !== 0){
        setState("error");
        say("error", "The waitlist isn’t open yet, so your email wasn’t saved. Please check back soon.", true);
        return;
      }

      submitting = true;
      lock(true);
      setState("submitting");
      say("pending", "Joining the waitlist…");

      var controller = ("AbortController" in window) ? new AbortController() : null;
      var timer = controller ? setTimeout(function(){ controller.abort(); }, 15000) : null;

      fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: {"Accept": "application/json"},
        signal: controller ? controller.signal : undefined
      }).then(function(res){
        if(!res.ok) throw new Error("status " + res.status);
        finished = true;
        setState("success");
        say("success", "Thank you. You’re on the list for updates about Mend’s development and availability.");
      }).catch(function(){
        lock(false);
        setState("error");
        say("error", "That didn’t go through, and your email wasn’t saved. Please try again in a moment.", true);
        input.focus();
      }).then(function(){
        if(timer) clearTimeout(timer);
        submitting = false;
        if(finished){ input.disabled = true; btn.disabled = true; }
      });
    });
  }
  $$("form[data-waitlist]").forEach(initForm);
})();

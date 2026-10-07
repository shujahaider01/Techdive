// Configure before publishing
// Contact form: messages are delivered to the owner's inbox through the free FormSubmit service.
// The address is assembled at run time so it never appears as plain text in the page source.
// After the first form submission is activated, FormSubmit issues a hidden alias; put it in CONTACT_ALIAS to stop using the address at all.
var CONTACT_ALIAS = "";
var CONTACT_TO = CONTACT_ALIAS || ["01shujahaider", ["gmail", "com"].join(".")].join("@");
var FORM_ENDPOINT = "https://formsubmit.co/ajax/" + CONTACT_TO;
var TRIANGLE_URL = "triangle/";   // Triangle marketing page, served at https://techdive.app/triangle/

(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll('[data-link="triangle"]').forEach(function (t) { t.href = TRIANGLE_URL; });
  var yr = document.getElementById("yr"); if (yr) yr.textContent = new Date().getFullYear();

  // header state + mobile menu
  var nav = document.getElementById("nav"), btn = document.getElementById("navToggle"), menu = document.getElementById("navMenu");
  function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  function setMenu(open) {
    nav.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  btn.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  document.addEventListener("click", function (e) { if (!nav.contains(e.target)) setMenu(false); });
  window.addEventListener("resize", function () { if (window.innerWidth > 760) setMenu(false); });

  // Products dropdown (click / tap, and keyboard)
  var dd = document.querySelector(".dd"), ddb = document.querySelector(".dd-btn");
  if (dd && ddb) {
    ddb.addEventListener("click", function (e) { e.stopPropagation(); var o = !dd.classList.contains("open"); dd.classList.toggle("open", o); ddb.setAttribute("aria-expanded", o ? "true" : "false"); });
    dd.addEventListener("click", function (e) { if (e.target.closest(".dd-menu a")) { dd.classList.remove("open"); ddb.setAttribute("aria-expanded", "false"); } });
    document.addEventListener("click", function () { dd.classList.remove("open"); ddb.setAttribute("aria-expanded", "false"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { dd.classList.remove("open"); ddb.setAttribute("aria-expanded", "false"); } });
  }

  // scroll reveal, with a small stagger for siblings
  var items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  items.forEach(function (el) {
    var sibs = el.parentNode.querySelectorAll(":scope > .reveal"), i = Array.prototype.indexOf.call(sibs, el);
    el.style.setProperty("--d", Math.min(i, 4) * 0.08 + "s");
  });
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { io.observe(el); });
  } else items.forEach(function (el) { el.classList.add("in"); });

  // card spotlight follows the pointer
  document.querySelectorAll("[data-spot]").forEach(function (c) {
    c.addEventListener("pointermove", function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px");
      c.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  // hero sparks: a few glowing dots that rise like bubbles ("dive")
  var cv = document.getElementById("sparks");
  if (cv && !reduce) {
    var ctx = cv.getContext("2d"), W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), dots = [], run = true;
    var cols = ["255,138,61", "255,106,0", "255,176,103", "255,255,255", "170,175,188"];
    function size() {
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(46, W / 28)); dots = [];
      for (var i = 0; i < n; i++) dots.push(make(true));
    }
    function make(init) {
      return { x: Math.random() * W, y: init ? Math.random() * H : H + 10, r: Math.random() * 1.8 + 0.6, v: Math.random() * 0.35 + 0.12,
        a: Math.random() * 0.5 + 0.25, c: cols[(Math.random() * cols.length) | 0], s: Math.random() * 6.28, w: Math.random() * 0.6 + 0.2 };
    }
    function frame(t) {
      if (run) {
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < dots.length; i++) {
          var d = dots[i]; d.y -= d.v; d.x += Math.sin(t / 1800 + d.s) * 0.18 * d.w;
          if (d.y < -10) dots[i] = make(false);
          var g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 5);
          g.addColorStop(0, "rgba(" + d.c + "," + d.a + ")"); g.addColorStop(1, "rgba(" + d.c + ",0)");
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.x, d.y, d.r * 5, 0, 6.2832); ctx.fill();
        }
      }
      requestAnimationFrame(frame);
    }
    size(); requestAnimationFrame(frame);
    window.addEventListener("resize", size);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { run = e[0].isIntersecting; }).observe(cv);
  }

  // scale the portfolio preview (a 1280px-wide page) to fit its window
  var pf = document.querySelector(".pw-screen iframe");
  if (pf) {
    var box = pf.parentNode;
    var fit = function () { if (box.clientWidth) pf.style.setProperty("--s", (box.clientWidth / 1280).toFixed(4)); };
    fit(); window.addEventListener("resize", fit);
    if ("ResizeObserver" in window) new ResizeObserver(fit).observe(box);
  }

  // ---------- contact form ----------
  var form = document.getElementById("contactForm");
  if (form) {
    var status = document.getElementById("cfStatus"), done = document.getElementById("cfDone"), btn2 = document.getElementById("cfSubmit");
    var opened = Date.now(), sending = false;
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? "" : "Please enter your name."; },
      email: function (v) { v = v.trim(); return !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "That email address does not look right, or leave it empty."; },
      message: function (v) { return v.trim().length >= 10 ? "" : "Please write a little more (at least 10 characters)."; }
    };
    function check(name) {
      var el = form.elements[name], err = form.querySelector('.f-err[data-for="' + name + '"]'), msg = rules[name](el.value);
      err.textContent = msg; el.classList.toggle("bad", !!msg); el.setAttribute("aria-invalid", msg ? "true" : "false");
      return !msg;
    }
    Object.keys(rules).forEach(function (n) {
      form.elements[n].addEventListener("blur", function () { check(n); });
      form.elements[n].addEventListener("input", function () { if (form.elements[n].classList.contains("bad")) check(n); });
    });
    function setStatus(t, bad) { status.textContent = t; status.classList.toggle("bad", !!bad); }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sending) return;
      var ok = true; Object.keys(rules).forEach(function (n) { if (!check(n)) ok = false; });
      if (!ok) { setStatus("Please fix the highlighted fields.", true); var first = form.querySelector(".bad"); if (first) first.focus(); return; }
      if (form.elements._honey.value || Date.now() - opened < 2500) { setStatus(""); return; }   // bots
      sending = true; btn2.disabled = true; btn2.classList.add("busy");
      btn2.querySelector(".lbl-t").textContent = "Sending..."; setStatus("");
      var payload = {
        name: form.elements.name.value.trim(),
        topic: form.elements.topic.value,
        message: form.elements.message.value.trim(),
        _subject: "TechDive contact: " + form.elements.topic.value + " (" + form.elements.name.value.trim() + ")",
        _template: "table",
        _captcha: "false"
      };
      var em = form.elements.email.value.trim();
      if (em) payload.email = em;               // optional: only sent (and used as reply-to) when given
      fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (!res.ok || !(res.d && (res.d.success === true || res.d.success === "true"))) throw new Error((res.d && res.d.message) || "failed");
          form.hidden = true; done.hidden = false; form.reset(); done.querySelector("h2").focus && done.querySelector("h2").setAttribute("tabindex", "-1");
          done.querySelector("h2").focus();
        })
        .catch(function () { setStatus("Sorry, your message could not be sent. Please check your connection and try again in a moment.", true); })
        .then(function () { sending = false; btn2.disabled = false; btn2.classList.remove("busy"); btn2.querySelector(".lbl-t").textContent = "Send message"; });
    });
    document.getElementById("cfAgain").addEventListener("click", function () {
      done.hidden = true; form.hidden = false; opened = Date.now(); setStatus(""); form.elements.name.focus();
    });
  }
})();

// Configure these before publishing.
var APK_URL = "https://github.com/shujahaider01/Triangle_apk/releases/latest"; // latest release APK
var CONTACT_EMAIL = ""; // e.g. "hello@yourdomain.com"; the footer contact link stays hidden while empty

document.documentElement.classList.add("js");

document.querySelectorAll("[data-download]").forEach(function (a) { a.href = APK_URL; });

var year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

var contact = document.getElementById("contact");
var contactCol = document.getElementById("contact-col");
if (contact && contactCol && CONTACT_EMAIL) {
  contact.href = "mailto:" + CONTACT_EMAIL;
  contactCol.hidden = false;
}

var nav = document.getElementById("nav");
function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 8); }
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Gentle reveal for section content
var targets = document.querySelectorAll(".head, .steps li, .card, .stats-grid div, .gallery figure, details, .cta-band .wrap");
targets.forEach(function (el) { el.classList.add("reveal"); });
if ("IntersectionObserver" in window) {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  targets.forEach(function (el) { io.observe(el); });
} else {
  targets.forEach(function (el) { el.classList.add("in"); });
}

// Screenshot gallery arrows
(function () {
  var g = document.getElementById("gallery");
  if (!g) return;
  var prev = document.querySelector(".g-prev"), next = document.querySelector(".g-next");
  function step() { var f = g.querySelector("figure"); return f ? f.getBoundingClientRect().width + 40 : 300; }
  function sync() {
    prev.disabled = g.scrollLeft < 8;
    next.disabled = g.scrollLeft + g.clientWidth >= g.scrollWidth - 8;
  }
  prev.addEventListener("click", function () { g.scrollBy({ left: -step() * 2, behavior: "smooth" }); });
  next.addEventListener("click", function () { g.scrollBy({ left: step() * 2, behavior: "smooth" }); });
  g.addEventListener("scroll", sync, { passive: true });
  window.addEventListener("resize", sync);
  sync();
})();

// Store badges: show a short message when tapped
(function () {
  var toast = document.getElementById("toast"), timer;
  document.querySelectorAll("[data-soon]").forEach(function (b) {
    b.addEventListener("click", function () {
      toast.textContent = "Coming soon";
      toast.classList.add("show");
      clearTimeout(timer);
      timer = setTimeout(function () { toast.classList.remove("show"); }, 2000);
    });
  });
})();

// FAQ accordion: smooth open/close, one open at a time
(function () {
  var items = document.querySelectorAll("#faq details");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  items.forEach(function (d) {
    var body = document.createElement("div");
    body.className = "faq-body";
    while (d.children.length > 1) body.appendChild(d.children[1]);
    d.appendChild(body);
  });
  function animate(d, open) {
    var body = d.querySelector(".faq-body");
    if (reduce || !body.animate) { d.open = open; return; }
    if (open) {
      d.open = true;
      var to = body.scrollHeight;
      body.animate([{ height: "0px" }, { height: to + "px" }], { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" });
    } else {
      var from = body.offsetHeight;
      var a = body.animate([{ height: from + "px" }, { height: "0px" }], { duration: 260, easing: "ease" });
      var closeNow = function () { d.open = false; };
      a.onfinish = closeNow;
      setTimeout(closeNow, 300);
    }
  }
  items.forEach(function (d) {
    d.querySelector("summary").addEventListener("click", function (e) {
      e.preventDefault();
      var willOpen = !d.open;
      if (willOpen) items.forEach(function (o) { if (o !== d && o.open) animate(o, false); });
      animate(d, willOpen);
    });
  });
})();

// Gallery: every screen glides left to right in one continuous loop; hover or the pause button stops it
(function () {
  var g = document.getElementById("gallery");
  if (!g) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var btn = document.querySelector(".g-play"), wrap = g.parentNode, ctrl = document.querySelector(".gallery-ctrl");
  if (reduce) { if (btn) btn.style.display = "none"; var d0 = document.getElementById("gDots"); if (d0) d0.style.display = "none"; return; }  // stays a swipeable row
  var figs = Array.prototype.slice.call(g.querySelectorAll("figure"));
  var track = document.createElement("div"); track.className = "g-track";
  function makeSet(clone) {
    var s = document.createElement("div"); s.className = "g-set";
    figs.forEach(function (f) {
      var n = clone ? f.cloneNode(true) : f;
      n.querySelectorAll("img").forEach(function (im) { im.loading = "eager"; });
      s.appendChild(n);
    });
    if (clone) s.setAttribute("aria-hidden", "true");
    return s;
  }
  var first = makeSet(false), second = makeSet(true);
  g.innerHTML = ""; track.appendChild(first); track.appendChild(second); g.appendChild(track);
  g.classList.add("marquee"); wrap.classList.add("is-marquee");
  var dots = document.getElementById("gDots"); if (dots) dots.style.display = "none";
  function setSpeed() { track.style.animationDuration = Math.max(40, figs.length * 6.5) + "s"; }
  setSpeed();
  // Auto / Manual: the button hands the strip over to the visitor (swipe, scroll or arrows) and back again
  var manual = false;
  function toManual() {
    var x = -new DOMMatrix(getComputedStyle(track).transform).m41;
    g.style.scrollBehavior = "auto";                          // jump, never glide, so nothing appears to move
    g.classList.add("manual"); wrap.classList.add("manual");
    g.scrollLeft = x;
    g.style.scrollBehavior = "";
    g.dispatchEvent(new Event("scroll"));
  }
  function toAuto() {
    var setW = first.offsetWidth || 1, dur = parseFloat(track.style.animationDuration) || 90;
    var x = g.scrollLeft % setW;
    track.style.animationDelay = (-(x / setW) * dur) + "s";   // carry on from where the visitor left it
    g.style.scrollBehavior = "auto"; g.classList.remove("manual"); wrap.classList.remove("manual"); g.scrollLeft = 0; g.style.scrollBehavior = "";
  }
  if (btn) btn.addEventListener("click", function () {
    manual = !manual; if (manual) toManual(); else toAuto();
    btn.setAttribute("aria-pressed", manual ? "true" : "false");
    btn.setAttribute("aria-label", manual ? "Play slideshow" : "Pause slideshow");
  });
  // waits at the first screen (Home) until the section is actually on screen, then starts; pauses again when scrolled away
  g.classList.add("offscreen");
  if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { g.classList.toggle("offscreen", !e[0].isIntersecting); }, { threshold: 0, rootMargin: "0px 0px -20% 0px" }).observe(g);
  else g.classList.remove("offscreen");
})();

// FAQ: show 4 questions, reveal the rest on demand
(function () {
  var more = document.getElementById("faqMore"), btn = document.getElementById("faqToggle");
  if (!more || !btn) return;
  var label = btn.querySelector(".faq-toggle-text");
  var count = more.querySelectorAll("details").length;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  more.hidden = true;                       // collapsed by default (stays visible without JS)
  label.textContent = "Show " + count + " more questions";

  function setOpen(open) {
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    label.textContent = open ? "Show fewer questions" : "Show " + count + " more questions";
  }
  btn.addEventListener("click", function () {
    var willOpen = more.hidden;
    if (willOpen) {
      more.hidden = false;
      more.querySelectorAll("details").forEach(function (d) { d.classList.add("in"); });
      setOpen(true);
      if (!reduce && more.animate) more.animate([{ height: "0px" }, { height: more.scrollHeight + "px" }], { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" });
    } else {
      setOpen(false);
      more.querySelectorAll("details[open]").forEach(function (d) { d.open = false; });
      if (!reduce && more.animate) {
        var a = more.animate([{ height: more.offsetHeight + "px" }, { height: "0px" }], { duration: 320, easing: "ease" });
        var hideNow = function () { more.hidden = true; };
        a.onfinish = hideNow;
        setTimeout(hideNow, 360);
      } else { more.hidden = true; }
    }
  });
})();

// Hero phone: screens change automatically (crossfade)
(function () {
  var box = document.getElementById("heroSlides");
  if (!box) return;
  var imgs = box.querySelectorAll("img");
  if (imgs.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var i = 0, visible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.2 }).observe(box);
  }
  setInterval(function () {
    if (!visible || document.hidden) return;
    imgs[i].classList.remove("on");
    i = (i + 1) % imgs.length;
    imgs[i].classList.add("on");
  }, 3000);
})();

// "Try it yourself": a faithful, self-contained copy of the Triangle Habits / Tasks screens
(function () {
  var root = document.getElementById("tScreen");
  if (!root) return;
  var BRAND = "#6D5EF5";
  var I = { // the app's real HABIT_ICONS paths (fill = currentColor)
    runner: '<path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>',
    book: '<path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>',
    water: '<path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"/>',
    moon: '<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>',
    music: '<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>',
    camera: '<circle cx="12" cy="12" r="3.2"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>',
    sun: '<path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/>',
    coffee: '<path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z"/>',
    star: '<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>',
    heart: '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>',
    lightning: '<path d="M7 2v11h3v9l7-12h-4l4-8z"/>',
    flag: '<path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>'
  };
  var ICON_KEYS = Object.keys(I);
  var COLORS = ["#F44336", "#FF9800", "#FFC107", "#8BC34A", "#4CAF50", "#009688", "#00BCD4", "#2196F3", "#3F51B5", "#9C27B0", "#E91E63", "#795548"];
  var U = { // material icons used by the chrome
    chart: '<path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/>',
    check: '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>',
    plus: '<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/>',
    back: '<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>',
    tune: '<path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>',
    home: '<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>',
    repeat: '<path d="M7 7h10v3l4-4-4-4v3H5v6h2zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2z"/>',
    task: '<path d="M16.59 7.58L10 14.17l-3.59-3.58L5 12l5 5 8-8zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>',
    person: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2a7.2 7.2 0 0 1-6-3.22c.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08a7.2 7.2 0 0 1-6 3.22z"/>',
    share: '<path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>',
    grid: '<path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>',
    work: '<path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>',
    school: '<path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>',
    house: '<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>'
  };
  var CATS = { office: ["Office", "o", "work"], academic: ["Academic", "a", "school"], personal: ["Personal", "p", "house"] };
  var DOW = ["M", "T", "W", "T", "F", "S", "S"];

  function ic(path, cls) { return '<svg viewBox="0 0 24 24" aria-hidden="true"' + (cls ? ' class="' + cls + '"' : "") + ">" + path + "</svg>"; }
  function el(html) { var t = document.createElement("div"); t.innerHTML = html.trim(); return t.firstChild; }
  function iso(d) { return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function wk(d) { return (d.getDay() + 6) % 7; } // Mon = 0
  function ord(n) { var s = ["th", "st", "nd", "rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { return function () { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }

  var today = new Date();
  var S; // state

  function due(h, d) { return h.days === null || h.days.indexOf(wk(d)) >= 0; }
  function mkHabit(name, icon, color, cat, days, fixedRun) {
    var r = rng(hash(name + String(days))), done = {}, run = fixedRun || (3 + Math.floor(r() * 3)), got = 0, h = { id: S.next++, kind: "habit", name: name, icon: icon, color: color, cat: cat, days: days, done: done };
    for (var o = 1; o < 200 && got < run; o++) { if (due(h, addDays(today, -o))) { done[iso(addDays(today, -o))] = 1; got++; } }
    for (var p = run + 3; p < 150; p++) { var d = addDays(today, -p); if (due(h, d) && r() < 0.5) done[iso(d)] = 1; }
    return h;
  }
  function streak(h) {
    var n = 0, d = h.done[iso(today)] ? today : addDays(today, -1);
    for (var i = 0; i < 400; i++, d = addDays(d, -1)) { if (!due(h, d)) continue; if (h.done[iso(d)]) n++; else break; }
    return n;
  }
  function reset() {
    S = { next: 1, tab: "habits", cat: "all", view: "list", items: [], form: null, snack: null, dlg: null, timer: null, sel: new Date(today), m: {}, stat: null, vis: {}, log: [], focus: null };
    S.items.push(mkHabit("Drink water", "water", "#3F51B5", "personal", null, 5));
    S.items.push(mkHabit("Meditate", "moon", "#2196F3", "personal", null, 2));
    S.items.push({ id: S.next++, kind: "task", name: "Plan the week", icon: "target", color: "#F7A600", cat: "office", pts: 10, done: true });
    S.items.push({ id: S.next++, kind: "task", name: "Study for exam", icon: "book", color: "#4CAF50", cat: "academic", pts: 10, done: false });
    S.items.push({ id: S.next++, kind: "task", name: "Call mom", icon: "heart", color: "#E91E63", cat: "personal", pts: 5, done: false });
    S.race = {}; render(); paintGuide();
  }

  // ---------- completion ----------
  function pct(d) {
    var list = S.items.filter(function (i) { return i.kind === (S.tab === "habits" ? "habit" : "task"); });
    if (S.tab === "habits") {
      var dueN = list.filter(function (h) { return due(h, d); });
      if (!dueN.length) return 0;
      return Math.round(100 * dueN.filter(function (h) { return h.done[iso(d)]; }).length / dueN.length);
    }
    if (!list.length) return 0;
    if (iso(d) === iso(today)) return Math.round(100 * list.filter(function (t) { return t.done; }).length / list.length);
    return d < today ? [100, 66, 100, 33, 100, 66, 100][Math.abs(d.getDate()) % 7] : 0;
  }

  function complete(it) {
    var k = iso(today);
    if (it.kind === "habit") { if (it.done[k]) return; it.done[k] = 1; } else { if (it.done) return; it.done = true; }
    S.undo = it; if (it.kind === "habit") { mission("tick"); S.focus = it; }
    addLog("done", "Completed " + it.name, it.kind === "habit" ? "+10" : "+" + it.pts); showSnack(it.kind === "habit" ? "Habit completed" : "Task completed", true);
    render(); popToday(it); celebrate(it);
    clearTimeout(S.dlgT);
    if (it.kind === "habit") S.dlgT = setTimeout(function () { if (S.undo === it && it.done[k]) { S.undo = null; hideSnack(); S.dlg = { name: it.name, n: streak(it) }; render(); } }, 3600);
  }
  function undo() {
    var it = S.undo; if (!it) return;
    if (it.kind === "habit") delete it.done[iso(today)]; else it.done = false;
    S.log.shift();
    clearTimeout(S.dlgT); S.undo = null; hideSnack(); render();
  }
  function showSnack(text, withUndo) {
    clearTimeout(S.snackT); S.snack = { text: text, undo: withUndo }; paintSnack();
    S.snackT = setTimeout(function () { S.snack = null; paintSnack(); }, 3600);
  }
  function hideSnack() { clearTimeout(S.snackT); S.snack = null; paintSnack(); }
  function paintSnack() {
    var old = root.querySelector(".ta-snack"); if (old) old.remove();
    if (!S.snack) return;
    var s = el('<div class="ta-snack" role="status"><span></span>' + (S.snack.undo ? '<button type="button">Undo</button>' : "") + "</div>");
    s.querySelector("span").textContent = S.snack.text;
    var b = s.querySelector("button"); if (b) b.addEventListener("click", undo);
    root.appendChild(s);
  }
  function popToday(it) {
    var c = root.querySelector('[data-id="' + it.id + '"] .hmap s.t'); if (c) c.classList.add("pop");
  }

  // ---------- drawing ----------
  function heat(h) {
    var wd = wk(today), start = addDays(today, -(147 + wd)), out = "";
    for (var r = 0; r < 7; r++) for (var c = 0; c < 22; c++) {
      if (c === 21 && r > wd) { out += '<s class="n"></s>'; continue; }
      var d = addDays(start, c * 7 + r), on = h.done[iso(d)];
      out += '<s class="' + (on ? "on" : "") + (iso(d) === iso(today) ? " t" : "") + '"></s>';
    }
    return '<div class="hmap">' + out + "</div>";
  }
  function ring(d) {
    var isT = iso(d) === iso(today), isS = iso(d) === iso(S.sel), past = d < today && !isT, p = pct(d), r = 20.4, c = 2 * Math.PI * r;
    var track = isS ? "rgba(109,94,245,.25)" : (isT || past ? "rgba(109,94,245,.15)" : "rgba(0,0,0,.16)");
    return '<button type="button" class="ta-day' + (isT ? " today" : "") + (isS ? " sel" : "") + '" data-d="' + iso(d) + '" aria-label="' + d.toDateString() + '"><em>' + d.toLocaleDateString("en-US", { weekday: "short" }) + '</em><div class="ta-ring">' +
      '<svg viewBox="0 0 45 45"><circle cx="22.5" cy="22.5" r="' + r + '" fill="none" stroke="' + track + '" stroke-width="4.2"/>' +
      '<circle class="fill" cx="22.5" cy="22.5" r="' + r + '" fill="none" stroke="' + BRAND + '" stroke-width="4.2" stroke-linecap="round" transform="rotate(-90 22.5 22.5)" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + (c * (1 - p / 100)).toFixed(1) + '"' + (p === 0 ? ' opacity="0"' : "") + "/></svg>" +
      "<i>" + d.getDate() + "</i></div></button>";
  }
  function render() {
    root.innerHTML = "";
    if (S.view === "form") { renderForm(); } else if (S.view === "stats") { renderStats(); } else { renderList(); }
    if (S.dlg) renderDlg();
    paintSnack();
    statusBar();
    hint();
  }
  function statusBar() {
    var old = root.querySelector(".ta-status"); if (old) old.remove();
    var now = new Date(), t = now.getHours() % 12 || 12, m = ("0" + now.getMinutes()).slice(-2);
    var gb = root.querySelector(".ta-gest"); if (!gb) root.appendChild(el('<div class="ta-gest" aria-hidden="true"></div>'));
    root.appendChild(el('<div class="ta-status" aria-hidden="true"><span>' + t + ":" + m + '</span><span class="ic">' +
      '<svg viewBox="0 0 24 24"><path d="M12 21 .6 8.3C3.7 5.6 7.7 4 12 4s8.3 1.6 11.4 4.3L12 21z"/></svg>' +
      '<svg viewBox="0 0 24 24"><path d="M2 22h20V2L2 22z"/></svg>' +
      '<svg viewBox="0 0 24 24"><path d="M17 4h-3V2h-4v2H7v18h10V4z"/></svg></span></div>'));
  }
  function renderList() {
    if (S.tab === "home") { renderHome(); return; }
    if (S.tab === "profile") { renderProfile(); return; }
    var kind = S.tab === "habits" ? "habit" : "task";
    var items = S.items.filter(function (i) { return i.kind === kind; });
    var shown = items.filter(function (i) { return S.cat === "all" || i.cat === S.cat; });
    var days = ""; for (var k = -3; k <= 3; k++) days += ring(addDays(today, k));
    var dt = today.toLocaleDateString("en-US", { month: "short" });
    var chips = [["all", "All", "grid"], ["office", "Office", "work"], ["academic", "Academic", "school"], ["personal", "Personal", "house"]].map(function (c) {
      return '<button type="button" class="ta-chip' + (S.cat === c[0] ? " on" : "") + '" data-cat="' + c[0] + '">' + ic(U[c[2]]) + c[1] + "</button>";
    }).join("");
    root.appendChild(el('<div><div class="ta-top"><div><b>' + (iso(S.sel) === iso(today) ? "Today" : S.sel.toLocaleDateString("en-US", { weekday: "long" })) + '</b><span>, ' + ord(S.sel.getDate()) + " " + S.sel.toLocaleDateString("en-US", { month: "short" }) + '</span></div><button type="button" aria-label="Filters">' + ic(U.tune) + '</button></div>' +
      '<div class="ta-strip">' + days + '</div>' +
      '<div class="ta-filters"><div class="ta-seg"><button type="button" class="on">Solo (' + items.length + ')</button><button type="button" data-shared>Shared (0)</button></div>' + chips + "</div></div>"));
    var list = el('<div class="ta-list"></div>');
    if (!shown.length) list.innerHTML = '<div class="ta-empty">Nothing here yet. Tap + to add one.</div>';
    shown.forEach(function (it) { list.appendChild(card(it)); });
    root.appendChild(list);
    root.appendChild(navEl());
    root.querySelectorAll("[data-d]").forEach(function (b) {
      b.addEventListener("click", function () { var p = b.dataset.d.split("-"); S.sel = new Date(+p[0], +p[1] - 1, +p[2]); render(); });
    });
    root.querySelectorAll("[data-cat]").forEach(function (b) { b.addEventListener("click", function () { S.cat = b.dataset.cat; render(); }); });
    root.querySelector("[data-shared]").addEventListener("click", function () { showSnack("Shared items appear here in the full app", false); });
  }
  function card(it) {
    var isT = iso(S.sel) === iso(today), done = it.kind === "habit" ? !!it.done[iso(S.sel)] : (isT ? it.done : false), n;
    if (it.kind === "habit") {
      n = streak(it);
      var c = el('<div class="hcard' + (done ? " done" : "") + '" data-id="' + it.id + '" style="--c:' + it.color + '"><div class="hrow"><span class="hicon">' + ic(I[it.icon]) + '</span>' +
        '<div class="hname"><b></b><span>Streak: ' + n + " day" + (n === 1 ? "" : "s") + '</span></div>' +
        '<button type="button" class="hbtn hstat" aria-label="Analytics">' + ic(U.chart) + '</button>' +
        '<button type="button" class="hbtn hchk' + (isT ? "" : " ro") + '" aria-label="' + (done ? "Completed" : isT ? "Mark complete" : "Only today can be marked complete") + '">' + ic(U.check) + "</button></div>" + heat(it) + "</div>");
      c.querySelector("b").textContent = it.name;
      c.querySelector(".hstat").addEventListener("click", function () { S.stat = it; S.focus = it; S.view = "stats"; mission("stats"); addLog("info", "Opened analytics for " + it.name, ""); render(); });
      c.querySelector(".hchk").addEventListener("click", function () { if (isT) complete(it); else showSnack("Only today can be marked complete", false); });
      return c;
    }
    var t = el('<div class="trow' + (done ? " done" : "") + '" data-id="' + it.id + '" style="--c:' + it.color + '"><span class="hicon">' + ic(I[it.icon]) + '</span>' +
      '<div class="hname"><b></b></div><span class="tpts">+' + it.pts + '</span><button type="button" class="hbtn hchk' + (isT ? "" : " ro") + '" aria-label="' + (done ? "Done" : "Mark complete") + '">' + ic(U.check) + "</button></div>");
    t.querySelector("b").textContent = it.name;
    t.querySelector(".hchk").addEventListener("click", function () { if (isT) { complete(it); if (S.tab === "tasks") mission("task"); } else showSnack("Only today can be marked complete", false); });
    return t;
  }
  function renderDlg() {
    var d = S.dlg, ds = today.getDate() + " " + today.toLocaleDateString("en-US", { month: "short" }) + " " + today.getFullYear();
    var o = el('<div class="ta-scrim" role="dialog" aria-label="Streak unlocked"><div class="ta-dlg"><h4>Well done!</h4><hr><img src="img/streak-badge.webp" alt="" width="190" height="200"><div class="nm"></div>' +
      '<div class="un">Streak unlocked</div><div class="dn">' + d.n + " day" + (d.n === 1 ? "" : "s") + '</div><hr><div class="ond">Unlocked on: ' + ds + '</div><hr>' +
      '<button type="button" class="sh">' + ic(U.share) + "SHARE</button></div></div>");
    o.querySelector(".nm").textContent = d.name;
    function close() { S.dlg = null; render(); }
    o.addEventListener("click", function (e) { if (e.target === o) close(); });
    o.querySelector(".sh").addEventListener("click", close);
    root.appendChild(o);
  }

  // ---------- add form ----------
  function openForm() {
    S.form = { kind: S.tab === "tasks" ? "task" : "habit", title: "", desc: "", color: COLORS[5], icon: "runner", cat: "personal", freq: "every", days: [0, 1, 2, 3, 4], dueIdx: 0, open: null, err: false };
    S.view = "form"; render();
  }
  function renderForm() {
    var f = S.form, isH = f.kind === "habit";
    var sw = f.open === "color" ? '<div class="tf-card"><div class="tf-palette">' + COLORS.map(function (c) { return '<button type="button" data-color="' + c + '" class="' + (f.color === c ? "on" : "") + '" style="--c:' + c + '" aria-label="Colour ' + c + '"></button>'; }).join("") + "</div></div>" : "";
    var ip = f.open === "icon" ? '<div class="tf-card"><div class="tf-palette icons">' + ICON_KEYS.map(function (k) { return '<button type="button" data-icon="' + k + '" class="' + (f.icon === k ? "on" : "") + '" aria-label="' + k + ' icon">' + ic(I[k]) + "</button>"; }).join("") + "</div></div>" : "";
    var cats = Object.keys(CATS).map(function (k) { return '<button type="button" class="' + CATS[k][1] + (f.cat === k ? " on" : "") + '" data-fcat="' + k + '">' + ic(U[CATS[k][2]]) + CATS[k][0] + "</button>"; }).join("");
    var freq;
    if (isH) {
      freq = '<div class="tf-card"><h5>Frequency</h5><div class="tf-radio"><button type="button" data-freq="every" class="' + (f.freq === "every" ? "on" : "") + '"><i></i>Everyday</button>' +
        '<button type="button" data-freq="days" class="' + (f.freq === "days" ? "on" : "") + '"><i></i>Specific Days of Week</button></div>' +
        (f.freq === "days" ? '<div class="tf-days">' + DOW.map(function (d, i) { return '<button type="button" data-day="' + i + '" class="' + (f.days.indexOf(i) >= 0 ? "on" : "") + '">' + d + "</button>"; }).join("") + "</div>" : "") + "</div>";
    } else {
      freq = '<div class="tf-card"><h5>Due Date</h5><div class="tf-due">' + ["No due date", "Today", "Tomorrow"].map(function (d, i) { return '<button type="button" data-due="' + i + '" class="' + (f.dueIdx === i ? "on" : "") + '">' + d + "</button>"; }).join("") + "</div></div>";
    }
    var form = el('<div class="tf"><div class="tf-bar"><button type="button" class="bk" aria-label="Back">' + ic(U.back) + "</button><h3>" + (isH ? "New Habit" : "Add Task") + '</h3><button type="button" class="tf-save">Save</button></div>' +
      '<div class="tf-body"><input class="tf-in" type="text" maxlength="30" placeholder="' + (isH ? "Enter Habit Title" : "Enter Task Title") + '" aria-label="Title">' +
      (f.err ? '<div class="tf-err">Please enter a title</div>' : "") +
      '<textarea class="tf-ta" placeholder="Enter Description (optional)" aria-label="Description"></textarea>' +
      '<div class="tf-pick"><button type="button" data-open="color"><span class="sw" style="--c:' + f.color + '"><i></i></span>Color</button><button type="button" data-open="icon"><span class="sw">' + ic(I[f.icon]) + "</span>Icon</button></div>" +
      sw + ip + '<div class="tf-card"><h5>Select Category</h5><div class="tf-cats">' + cats + "</div></div>" + freq + "</div></div>");
    var ti = form.querySelector(".tf-in"), ta = form.querySelector(".tf-ta");
    ti.value = f.title; ta.value = f.desc;
    ti.addEventListener("input", function () { f.title = ti.value; hint(); });
    ti.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); form.querySelector(".tf-save").click(); } });
    ta.addEventListener("input", function () { f.desc = ta.value; hint(); });
    function again() { f.title = ti.value; f.desc = ta.value; render(); }
    form.querySelector(".bk").addEventListener("click", function () { S.view = "list"; render(); });
    form.querySelectorAll("[data-open]").forEach(function (b) { b.addEventListener("click", function () { f.open = f.open === b.dataset.open ? null : b.dataset.open; again(); }); });
    form.querySelectorAll("[data-color]").forEach(function (b) { b.addEventListener("click", function () { f.color = b.dataset.color; f.open = null; again(); }); });
    form.querySelectorAll("[data-icon]").forEach(function (b) { b.addEventListener("click", function () { f.icon = b.dataset.icon; f.open = null; again(); }); });
    form.querySelectorAll("[data-fcat]").forEach(function (b) { b.addEventListener("click", function () { f.cat = b.dataset.fcat; again(); }); });
    form.querySelectorAll("[data-freq]").forEach(function (b) { b.addEventListener("click", function () { f.freq = b.dataset.freq; again(); }); });
    form.querySelectorAll("[data-day]").forEach(function (b) { b.addEventListener("click", function () { var i = +b.dataset.day, p = f.days.indexOf(i); if (p >= 0) { if (f.days.length > 1) f.days.splice(p, 1); } else f.days.push(i); again(); }); });
    form.querySelectorAll("[data-due]").forEach(function (b) { b.addEventListener("click", function () { f.dueIdx = +b.dataset.due; again(); }); });
    form.querySelector(".tf-save").addEventListener("click", function () {
      var name = ti.value.trim(); f.title = ti.value;
      if (!name) { f.err = true; f.desc = ta.value; render(); root.querySelector(".tf-in").focus(); return; }
      var it = isH ? mkHabit(name, f.icon, f.color, f.cat, f.freq === "days" ? f.days.slice().sort() : null)
        : { id: S.next++, kind: "task", name: name, icon: f.icon, color: f.color, cat: f.cat, pts: 10, done: false };
      S.items.splice(S.items.findIndex(function (x) { return x.kind === f.kind; }) < 0 ? S.items.length : S.items.findIndex(function (x) { return x.kind === f.kind; }), 0, it);
      S.tab = isH ? "habits" : "tasks"; S.cat = "all"; S.view = "list"; if (isH) { mission("add"); S.focus = it; } addLog("add", "Added " + name, ""); render();
      var list = root.querySelector(".ta-list"); if (list) list.scrollTop = 0;
    });
    root.appendChild(form);
  }



  // ---------- Home + Profile (all values are temporary sample data) ----------
  var NAVI = {
    homeO: '<path d="M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/>',
    homeF: '<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>',
    taskO: '<path d="M22 5.18L10.59 16.6l-4.24-4.24 1.41-1.41 2.83 2.83 10-10L22 5.18zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8c1.57 0 3.04.46 4.28 1.25l1.45-1.45A10.043 10.043 0 0 0 12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10h-2c0 4.41-3.59 8-8 8z"/>',
    perO: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM7.07 18.28c.43-.9 3.05-1.78 4.93-1.78s4.51.88 4.93 1.78C15.57 19.36 13.86 20 12 20s-3.57-.64-4.93-1.72zm11.29-1.45c-1.43-1.74-4.9-2.33-6.36-2.33s-4.93.59-6.36 2.33C4.62 15.49 4 13.82 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8c0 1.82-.62 3.49-1.64 4.83zM12 6c-1.94 0-3.5 1.56-3.5 3.5S10.06 13 12 13s3.5-1.56 3.5-3.5S13.94 6 12 6zm0 5c-.83 0-1.5-.67-1.5-1.5S11.17 8 12 8s1.5.67 1.5 1.5S12.83 11 12 11z"/>',
    perF: U.person
  };
  function navEl() {
    var t = S.tab, b = function (k, label, icon) { return '<button type="button" data-nav="' + k + '" aria-label="' + label + '" class="' + (t === k ? "on" : "") + '">' + ic(icon) + "</button>"; };
    var n = el('<div class="ta-nav"><div class="ta-pill">' +
      b("home", "Home", t === "home" ? NAVI.homeF : NAVI.homeO) + b("habits", "Habits", U.repeat) + b("tasks", "Tasks", NAVI.taskO) + b("profile", "Profile", t === "profile" ? NAVI.perF : NAVI.perO) +
      '</div><button type="button" class="ta-fab" aria-label="Add">' + ic(U.plus) + "</button></div>");
    n.querySelectorAll("[data-nav]").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.dataset.nav; S.tab = k; S.cat = "all"; S.sel = new Date(today);
        if (k === "home" || k === "profile") { S.vis[k] = 1; if (S.vis.home && S.vis.profile) mission("peek"); }
        render();
      });
    });
    n.querySelector(".ta-fab").addEventListener("click", function () { openForm(); });
    return n;
  }
  function stats() {
    var tasks = S.items.filter(function (i) { return i.kind === "task"; }), habits = S.items.filter(function (i) { return i.kind === "habit"; });
    var tDone = tasks.filter(function (t) { return t.done; }), hDone = habits.filter(function (x) { return x.done[iso(today)]; }).length;
    var pts = 340 + tDone.reduce(function (s, t) { return s + t.pts; }, 0) + hDone * 10;
    var all = tasks.length + habits.length, perf = all ? Math.round(100 * (tDone.length + hDone) / all) : 0;
    return { tasks: tasks, habits: habits, tDone: tDone.length, hDone: hDone, pts: pts, week: 60 + (pts - 340), perf: perf, streak: mine() };
  }
  function mine() { var b = 0; S.items.forEach(function (i) { if (i.kind === "habit") b = Math.max(b, streak(i)); }); return b; }
  function renderHome() {
    var s = stats();
    var tile = function (l, v, bg) { return '<div style="background:' + bg + '"><span>' + l + "</span><b>" + v + "</b></div>"; };
    var sc = function (l, bg, col, p) { return '<div><i style="background:' + bg + '"><svg viewBox="0 0 24 24" fill="none" stroke="' + col + '" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="fill:none">' + p + "</svg></i>" + l + "</div>"; };
    var page = el('<div class="tpg"><div class="hm-top"><div class="ib">' + ic('<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>') + '</div><div class="rt"><div class="ib">' +
      ic('<path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>') + '</div><div class="ib">' +
      ic('<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>') + '</div></div></div>' +
      '<div class="hm-hi"><b>Hello, there \uD83D\uDC4B</b><span>Let\'s make today productive.</span></div>' +
      '<div class="hm-pts"><small>TOTAL POINTS</small><strong>' + s.pts + '</strong><div class="pf">Performance &nbsp;' + s.perf + '%</div><div class="pb"><i style="width:' + s.perf + '%"></i></div><svg class="tr" viewBox="0 0 64 72" width="58" height="66" aria-hidden="true"><defs><linearGradient id="trg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE99A"/><stop offset=".45" stop-color="#F8BE3A"/><stop offset="1" stop-color="#E08A12"/></linearGradient><linearGradient id="trb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C46A55"/><stop offset="1" stop-color="#8A3A2E"/></linearGradient><linearGradient id="trs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E9A21F"/><stop offset=".5" stop-color="#FFD769"/><stop offset="1" stop-color="#E09212"/></linearGradient></defs><path d="M15 12C3 12 1 31 19 37" fill="none" stroke="#E39A18" stroke-width="4.2" stroke-linecap="round"/><path d="M49 12c12 0 14 19-4 25" fill="none" stroke="#E39A18" stroke-width="4.2" stroke-linecap="round"/><path d="M15 5h34v20c0 12-8 19-17 19S15 37 15 25z" fill="url(#trg)"/><path d="M20 9h5v16c0 7 3 11 6 13-7-2-11-8-11-14z" fill="#fff" opacity=".42"/><rect x="27.5" y="43" width="9" height="11" fill="url(#trs)"/><rect x="19" y="53" width="26" height="5" rx="1.5" fill="url(#trs)"/><path d="M14 58h36l3 12H11z" fill="url(#trb)"/><rect x="25" y="61.5" width="14" height="4.5" rx="1" fill="#F8C24A"/></svg></div>' +
      '<div class="hm-sc">' + sc("Leaderboard", "#FCEFC8", "#C97A0A", '<rect x="3.5" y="10" width="5" height="10.5" rx="1"/><rect x="9.5" y="3.5" width="5" height="17" rx="1"/><rect x="15.5" y="13" width="5" height="7.5" rx="1"/>') + sc("Reviews", "#FCEFC8", "#E0A100", '<path d="m12 3.2 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6-4.5-4.2 6.1-.8z"/>') +
      sc("Inbox", "#DCE8FB", "#2563C9", '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>') + sc("Backlog", "#E7E3FA", "#5B3FD6", '<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M8 9h8M8 12.5h8M8 16h5"/>') + "</div>" +
      '<div class="hm-h">Analytics</div><div class="hm-tiles">' +
      tile("Total Tasks", s.tasks.length, "linear-gradient(135deg,#F1EDFB,#F8F6FF)") + tile("Tasks Completed", s.tDone, "linear-gradient(135deg,#E3F6FA,#F2FBFD)") +
      tile("Pending Tasks", s.tasks.length - s.tDone, "linear-gradient(135deg,#FFF3DC,#FFF9EC)") + tile("Points This Week", s.week, "linear-gradient(135deg,#FDECEE,#FFF6F7)") +
      tile("Current Streak", s.streak, "linear-gradient(135deg,#FFEFE2,#FFF7F0)") + tile("Current Rank", "#3", "linear-gradient(135deg,#E8EFFC,#F5F8FE)") + "</div></div>");
    root.appendChild(page); root.appendChild(navEl());
  }
  function statusCard(s) {
    var total = s.tasks.length + s.habits.length, done = s.tDone + s.hDone, over = total ? 1 : 0, prog = Math.max(0, total - done - over);
    var max = Math.max(1, done, prog, over);
    var row = function (l, v, c) { return '<div class="st-row"><span>' + l + '</span><div class="st-bar"><i style="width:' + Math.round(v / max * 100) + '%;background:' + c + '"></i></div><b>' + v + "</b></div>"; };
    return '<h6>Task Status Distribution</h6><div class="pr-card">' + row("Completed", done, "#22C55E") + row("In progress", prog, "#3B82F6") + row("Overdue", over, "#F43F5E") + "</div>";
  }
  function renderProfile() {
    var s = stats(), lvl = 12 + Math.floor((s.pts - 340) / 400), into = (s.pts - 340) % 400, away = 400 - into;
    var pts = [], w = 288, hh = 96, k, v, x, y;
    for (k = 0; k < 7; k++) { var d = addDays(today, k - 6); v = k === 6 ? s.perf : [58, 72, 64, 80, 70, 86][k]; x = 8 + k * (w - 16) / 6; y = 10 + (100 - v) / 100 * (hh - 20); pts.push([x, y]); }
    var line = pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ");
    var chart = '<svg viewBox="0 0 ' + w + " " + hh + '" width="100%" style="display:block"><defs><linearGradient id="pg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7C3AED" stop-opacity=".35"/><stop offset="1" stop-color="#7C3AED" stop-opacity="0"/></linearGradient></defs>' +
      '<polygon points="8,' + hh + " " + line + " " + (w - 8) + "," + hh + '" fill="url(#pg1)"/><polyline points="' + line + '" fill="none" stroke="#7C3AED" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>' +
      pts.map(function (p) { return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.6" fill="#fff" stroke="#7C3AED" stroke-width="2"/>'; }).join("") + "</svg>";
    var cats = { office: 0, academic: 0, personal: 0 }; S.items.forEach(function (i) { cats[i.cat] = (cats[i.cat] || 0) + 1; });
    var tot = Math.max(1, cats.office + cats.academic + cats.personal), R = 38, C = 2 * Math.PI * R, off = 0, segs = "", cl = { office: "#6D5EF5", academic: "#22C55E", personal: "#F5B942" }, nm = { office: "Office", academic: "Academic", personal: "Personal" }, lg = "";
    Object.keys(cats).forEach(function (kk) { var ln = C * cats[kk] / tot; segs += '<circle cx="50" cy="50" r="38" fill="none" stroke="' + cl[kk] + '" stroke-width="14" stroke-dasharray="' + ln.toFixed(2) + " " + (C - ln).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" transform="rotate(-90 50 50)"/>'; off += ln; lg += '<div><i style="background:' + cl[kk] + '"></i>' + nm[kk] + " \u00B7 " + Math.round(100 * cats[kk] / tot) + "%</div>"; });
    var page = el('<div class="tpg"><div class="pr-top"><div class="pr-id"><img src="img/people/jordan.jpg" alt="" width="86" height="86"><div><h4>Jordan Blake</h4>' +
      '<div class="pr-st"><div><b>' + s.perf + '%</b><span>performance</span></div><div><b>' + s.pts + '</b><span>points</span></div><div><b>4.6</b><span>rating</span></div></div></div></div>' +
      '<div class="pr-lv"><div class="tk"><i style="width:' + Math.round(into / 4) + '%"></i><em style="left:' + Math.round(into / 4) + '%"></em></div><div class="bd">' + ic('<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>') + '</div></div>' +
      '<div class="pr-pt"><b>' + away + "</b> points away from Level " + (lvl + 1) + "</div></div>" +
      '<div class="pr-sec"><h6>Weekly Productivity</h6><div class="pr-card">' + chart + '<div class="mo"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div><small>This month: ' + s.perf + "%</small></div>" +
      '<h6>Tasks by Category</h6><div class="pr-card"><div class="pr-don"><div style="position:relative;width:100px;height:100px;flex:none"><svg viewBox="0 0 100 100" width="100" height="100">' + segs + '</svg><div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center"><div><div style="font-size:18px;font-weight:900;line-height:1">' + S.items.length + '</div><div style="font-size:10px;color:#9CA3AF">items</div></div></div></div><div class="lg">' + lg + "</div></div></div>" + statusCard(s) + "</div></div>");
    root.appendChild(page); root.appendChild(navEl());
  }


  // ---------- step spotlight (right of the phone): a half-phone view of what to do now ----------
  function addLog() {}
  function preview() {
    var box = document.getElementById("tPrev"); if (!box) return;
    if (!box.firstChild) {
      box.innerHTML = '<div class="sp-h"><b id="spStep"></b></div>' +
        '<h4 class="sp-t" id="spTitle"></h4>' +
        '<div class="mir" aria-hidden="true"><div class="mir-in" id="mirIn"></div></div>' +
        '';
    }
    var m = nowMission(), idx = m ? MISSIONS.indexOf(m) + 1 : MISSIONS.length;
    document.getElementById("spStep").textContent = m ? "Step " + idx + " of " + MISSIONS.length : "All steps complete";
    document.getElementById("spTitle").textContent = m ? m.t : "You're all set";
  }
  function updateMirror() {
    var host = document.getElementById("mirIn"), mir = host && host.parentNode; if (!host) return;
    var clone = root.cloneNode(true);
    clone.removeAttribute("id"); clone.removeAttribute("aria-label"); clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("[id]").forEach(function (n) { n.removeAttribute("id"); });
    clone.querySelectorAll("button,input,textarea,a").forEach(function (n) { n.setAttribute("tabindex", "-1"); });
    clone.querySelectorAll(".ta-confetti,.ta-plus").forEach(function (n) { n.remove(); });
    var srcF = root.querySelectorAll("input,textarea"), dstF = clone.querySelectorAll("input,textarea");
    srcF.forEach(function (n, i) { if (dstF[i]) { dstF[i].value = n.value; dstF[i].setAttribute("value", n.value); if (dstF[i].tagName === "TEXTAREA") dstF[i].textContent = n.value; } });
    var SH = root.offsetHeight || 850; clone.style.width = "374px"; clone.style.height = SH + "px";
    host.innerHTML = ""; host.appendChild(clone);
    // keep the copy's scroll positions identical to the live phone
    [".ta-list", ".tpg", ".tf", ".ts", ".ta-filters"].forEach(function (sel) {
      var src = root.querySelector(sel), dst = clone.querySelector(sel);
      if (src && dst) { dst.style.scrollBehavior = "auto"; dst.scrollTop = src.scrollTop; dst.scrollLeft = src.scrollLeft; }
    });
    var w = mir.clientWidth, h = mir.clientHeight, s = w / 374, cy = 150;
    host.style.transform = "scale(" + s.toFixed(4) + ")";
    var ct = clone.querySelector("[data-hint]");
    if (ct && S.hintText) {
      ct.removeAttribute("data-hint"); ct.classList.add("ta-hint");
      var cr = clone.getBoundingClientRect(), cs = cr.width / 374, tr = ct.getBoundingClientRect();
      var L = (tr.left - cr.left) / cs, T = (tr.top - cr.top) / cs, W = tr.width / cs, H = tr.height / cs, pad = 5;
      var rad = parseFloat(getComputedStyle(ct).borderTopLeftRadius) || 12;
      var spot = el('<div class="ta-spot" aria-hidden="true"></div>');
      spot.style.left = (L - pad) + "px"; spot.style.top = (T - pad) + "px"; spot.style.width = (W + pad * 2) + "px"; spot.style.height = (H + pad * 2) + "px";
      spot.style.borderRadius = (Math.min(rad, 999) + pad) + "px";
      clone.appendChild(spot);
      var tip = el('<div class="ta-tip" role="note"></div>'); tip.textContent = S.hintText; clone.appendChild(tip);
      var tw = tip.offsetWidth, th = tip.offsetHeight, cx = L + W / 2, up = T > th + 22, left = Math.max(10, Math.min(374 - tw - 10, cx - tw / 2));
      tip.classList.add(up ? "up" : "down"); tip.style.left = left + "px";
      tip.style.setProperty("--ax", Math.max(14, Math.min(tw - 14, cx - left)) + "px");
      tip.style.top = (up ? T - th - 12 : T + H + 12) + "px";
      cy = T + H / 2;
    }
    var y = Math.max(0, Math.min(SH - h / s, cy - h / s / 2));
    host.style.transform = "translateY(" + (-y * s).toFixed(1) + "px) scale(" + s.toFixed(4) + ")";
    // the guide box can change width after this ran (layout, fonts, resize): redo the fit
    if (!updateMirror.ro && window.ResizeObserver) {
      var lastW = mir.clientWidth, tmr;
      updateMirror.ro = new ResizeObserver(function () {
        var m2 = document.querySelector(".mir"); if (!m2 || m2.clientWidth === lastW) return;
        lastW = m2.clientWidth; clearTimeout(tmr); tmr = setTimeout(hint, 60);   // full pass, so the target is marked again
      });
      updateMirror.ro.observe(mir);
      var wt; window.addEventListener("resize", function () { clearTimeout(wt); wt = setTimeout(hint, 120); });
    }
  }


  // ---------- celebration: confetti, floating points and sound ----------
  var soundOn = true, actx = null, REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function tone(freq, t0, dur, vol, type) {
    var o = actx.createOscillator(), g = actx.createGain();
    o.type = type || "sine"; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, actx.currentTime + t0);
    g.gain.exponentialRampToValueAtTime(vol, actx.currentTime + t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + t0 + dur);
    o.connect(g); g.connect(actx.destination); o.start(actx.currentTime + t0); o.stop(actx.currentTime + t0 + dur + 0.05);
  }
  function chime(big) {
    if (!soundOn) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
      var seq = big ? [523.25, 659.25, 783.99, 1046.5, 1318.5] : [659.25, 880];
      seq.forEach(function (f, i) { tone(f, i * (big ? 0.11 : 0.08), big ? 0.45 : 0.22, big ? 0.13 : 0.11, "triangle"); });
      if (big) tone(2093, 0.55, 0.5, 0.05, "sine");
    } catch (e) {}
  }
  function burst(x, y, n, spread, label) {
    if (REDUCE) return;
    var box = el('<div class="ta-confetti" aria-hidden="true"></div>'), cols = ["#6D5EF5", "#F5B942", "#E85D26", "#22A06B", "#E85D8A", "#3B82F6", "#8B7CF6"];
    root.appendChild(box);
    for (var i = 0; i < n; i++) {
      var p = document.createElement("i"), w = 5 + Math.random() * 6, a = Math.random() * Math.PI * 2, d = (0.35 + Math.random() * 0.65) * spread;
      p.style.cssText = "left:" + x + "px;top:" + y + "px;width:" + w + "px;height:" + (w * (0.5 + Math.random())) + "px;background:" + cols[i % cols.length] + ";border-radius:" + (Math.random() < 0.4 ? "50%" : "2px");
      box.appendChild(p);
      var dx = Math.cos(a) * d, dy = Math.sin(a) * d - spread * 0.35;
      if (p.animate) p.animate([
        { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
        { transform: "translate(" + dx + "px," + dy + "px) rotate(" + (Math.random() * 360) + "deg)", opacity: 1, offset: 0.55 },
        { transform: "translate(" + dx * 1.12 + "px," + (dy + spread * 0.9) + "px) rotate(" + (Math.random() * 720) + "deg)", opacity: 0 }
      ], { duration: 950 + Math.random() * 650, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" });
    }
    if (label) {
      var t = el('<div class="ta-plus"></div>'); t.textContent = label; t.style.left = x + "px"; t.style.top = (y - 14) + "px"; root.appendChild(t);
      if (t.animate) t.animate([{ transform: "translate(-50%,0) scale(.6)", opacity: 0 }, { transform: "translate(-50%,-14px) scale(1.15)", opacity: 1, offset: 0.25 }, { transform: "translate(-50%,-52px) scale(1)", opacity: 0 }], { duration: 1200, easing: "ease-out", fill: "forwards" });
      setTimeout(function () { t.remove(); }, 1300);
    }
    setTimeout(function () { box.remove(); }, 1700);
  }
  function celebrate(it) {
    var b = root.querySelector('[data-id="' + it.id + '"] .hchk'); if (!b) return;
    var rr = root.getBoundingClientRect(), br = b.getBoundingClientRect(), k = rr.width / 374;
    burst((br.left + br.width / 2 - rr.left) / k, (br.top + br.height / 2 - rr.top) / k, 30, 120, it.kind === "habit" ? "+10 pts" : "+" + it.pts + " pts");
    chime(false);
  }
  function bigCelebrate() {
    burst(187, 330, 90, 260); setTimeout(function () { burst(90, 420, 40, 170); burst(285, 420, 40, 170); }, 260);
    chime(true);
  }

  // ---------- habit analytics (the app's real stat screen) ----------
  function renderStats() {
    var h = S.stat, ks = Object.keys(h.done), toD = function (k) { var p = k.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); };
    var comp = ks.length, first = today;
    ks.forEach(function (k) { var d = toD(k); if (d < first) first = d; });
    var total = 0, best = 0, run = 0;
    for (var d = new Date(first); d <= today; d = addDays(d, 1)) {
      if (!due(h, d)) continue; total++;
      if (h.done[iso(d)]) { run++; best = Math.max(best, run); } else run = 0;
    }
    var cur = streak(h), rate = total ? Math.round(100 * comp / total) : 0;
    var cards = [[cur + " day" + (cur === 1 ? "" : "s"), "Current Streak"], [best + " day" + (best === 1 ? "" : "s"), "Best Streak"], [comp, "Completions"], [rate + "%", "Completion Rate"], [total, "Total Days"], [Math.min(100, rate) + "%", "Score"]];
    var months = [], i;
    for (i = 5; i >= 0; i--) { var m = new Date(today.getFullYear(), today.getMonth() - i, 1); months.push({ y: m.getFullYear(), m: m.getMonth(), n: 0, l: m.toLocaleDateString("en-US", { month: "short" }) }); }
    ks.forEach(function (k) { var p = k.split("-"); months.forEach(function (mm) { if (mm.y === +p[0] && mm.m === +p[1] - 1) mm.n++; }); });
    var bars = months.map(function (mm) { return '<div><i style="height:' + Math.min(100, Math.round(mm.n / 30 * 100)) + '%"></i></div>'; }).join("");
    var mo = months.map(function (mm) { return "<span>" + mm.l + "</span>"; }).join("");
    var v = el('<div class="ts" style="--c:' + h.color + '"><div class="tf-bar"><button type="button" class="bk" aria-label="Back">' + ic(U.back) + '</button><h3>Analytics</h3></div>' +
      '<div class="ts-grid">' + cards.map(function (c) { return '<div class="ts-c"><b>' + c[0] + "</b><span>" + c[1] + "</span></div>"; }).join("") + "</div>" +
      '<div class="ts-box"><h5>Completion</h5><div class="ts-chart">' + bars + '</div><div class="ts-mo">' + mo + "</div></div>" +
      '<div class="ts-box"><h5>Last 30 Days</h5>' + heat(h) + "</div></div>");
    v.querySelector(".bk").addEventListener("click", function () { S.view = "list"; render(); });
    root.appendChild(v);
  }

  // ---------- guided missions ----------
  var MISSIONS = [
    { k: "add", t: "Add your first habit", d: "Tap + and save a habit with your own name, colour and icon.", tip: "Tap + to add a habit" },
    { k: "tick", t: "Tick it off", d: "Complete a habit to fill today's square in its heatmap.", tip: "Tap the circle to complete it" },
    { k: "stats", t: "Open a habit's analytics", d: "Tap the little chart button on any habit.", tip: "Tap the chart for streak stats" },
    { k: "task", t: "Switch to Tasks and tick one", d: "Use the bottom bar, then complete a task.", tip: "Open Tasks, then tick one" },
    { k: "peek", t: "Peek at Home and Profile", d: "Open both from the bottom bar to see your points, level and charts.", tip: "Open Home, then Profile" }
  ];
  function mission(k) { if (S.m[k]) return; S.m[k] = 1; paintGuide(); }
  function nowMission() { for (var i = 0; i < MISSIONS.length; i++) if (!S.m[MISSIONS[i].k]) return MISSIONS[i]; return null; }
  function paintGuide() {
    var list = document.getElementById("tgList"), done = 0, now = nowMission();
    list.innerHTML = "";
    MISSIONS.forEach(function (m) {
      var ok = !!S.m[m.k]; if (ok) done++;
      var li = el('<li data-n="' + (MISSIONS.indexOf(m) + 1) + '" class="' + (ok ? "ok" : (now && now.k === m.k ? "now" : "")) + '"><span class="dot"><svg viewBox="0 0 20 20"><path d="M5 10.5l3.2 3.2L15 7"/></svg></span><div><strong></strong><span class="d"></span></div></li>');
      li.querySelector("strong").textContent = m.t; li.querySelector(".d").textContent = m.d; list.appendChild(li);
    });
    var cnt = document.getElementById("tgCount"); if (cnt) cnt.textContent = done + " of " + MISSIONS.length;
    document.getElementById("tgDone").hidden = done < MISSIONS.length;
    if (done === MISSIONS.length && !S.celebrated) { S.celebrated = true; setTimeout(bigCelebrate, 250); }
    hint();
  }
  function target(m) {
    if (S.view === "stats") return root.querySelector(".bk");
    if (S.view === "form") return S.form && !S.form.title.trim() ? root.querySelector(".tf-in") : root.querySelector(".tf-save");
    var h;
    switch (m.k) {
      case "add": return S.tab === "habits" ? root.querySelector(".ta-fab") : root.querySelector('[data-nav="habits"]');
      case "tick":
        if (S.tab !== "habits") return root.querySelector('[data-nav="habits"]');
        h = root.querySelector(".hcard:not(.done) .hchk"); return h || null;
      case "stats": return S.tab === "habits" ? root.querySelector(".hstat") : root.querySelector('[data-nav="habits"]');
      case "peek": return root.querySelector('[data-nav="' + (S.vis.home ? "profile" : "home") + '"]');
      case "task": return S.tab === "tasks" ? (root.querySelector(".trow:not(.done) .hchk") || null) : root.querySelector('[data-nav="tasks"]');
    }
    return null;
  }
  var mObs = new MutationObserver(function () { if (!S.raf) S.raf = requestAnimationFrame(function () { S.raf = 0; hint(); }); });
  function hint() {
    mObs.disconnect();
    hintCore(); preview(); updateMirror();
    // the live phone stays clean: the spotlight exists only inside the half-phone guide
    root.querySelectorAll("[data-hint]").forEach(function (n) { n.removeAttribute("data-hint"); });
    mObs.observe(root, { childList: true, subtree: true, attributes: true, characterData: true });
  }
  function hintCore() {
    S.hintText = null;
    root.querySelectorAll(".ta-hint").forEach(function (x) { x.classList.remove("ta-hint"); });
    var old = root.querySelector(".ta-tip"); if (old) old.remove();
    var oldSpot = root.querySelector(".ta-spot"); if (oldSpot) oldSpot.remove();
    if (S.dlg) return;
    var m = nowMission(); if (!m) return;
    var t = target(m); if (!t) return;
    t.setAttribute("data-hint", "1");
    var text = m.tip;
    if (S.view === "form") text = S.form.title.trim() ? "Tap Save" : "Type a name for it";
    if (S.view === "stats") text = "Streaks, rates and charts. Tap back.";
    else if (S.view === "list" && m.k === "task" && S.tab === "tasks") text = "Tap the circle to tick it";
    if (S.view === "list" && t.dataset && t.dataset.nav) text = { habits: "Back to Habits", tasks: "Open Tasks", home: "Open Home", profile: "Open Profile" }[t.dataset.nav];
    S.hintText = text;
  }

  var sBtn = document.getElementById("tSound");
  var SPK_ON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>';
  var SPK_OFF = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="m22 9-6 6M16 9l6 6"/></svg>';
  if (sBtn) sBtn.addEventListener("click", function () {
    soundOn = !soundOn; sBtn.innerHTML = (soundOn ? SPK_ON : SPK_OFF) + "<span>" + (soundOn ? "Sound on" : "Sound off") + "</span>";
    sBtn.setAttribute("aria-pressed", soundOn ? "true" : "false");
    if (soundOn) chime(false);
  });
  root.addEventListener("scroll", function () { hint(); }, true);
  document.getElementById("tReset").addEventListener("click", reset);
  reset();
})();

// Feature pictures: still by default, play only while hovered / focused / tapped
(function () {
  var cards = document.querySelectorAll("#features .bcard");
  if (!cards.length) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var touch = window.matchMedia("(hover: none)").matches;
  var current = null;
  function img(c) { return c.querySelector(".anim img[data-anim]"); }
  function play(c) {
    var im = img(c); if (!im || reduce) return;
    c.classList.add("playing");
    var src = im.getAttribute("data-anim");
    if (c._loaded) { im.src = src + "?p=" + (c._n = (c._n || 0) + 1); return; }  // new URL restarts the animation from its first frame
    var pre = new Image();
    pre.onload = function () { c._loaded = true; if (c.classList.contains("playing")) im.src = src + "?p=" + (c._n = (c._n || 0) + 1); };
    pre.src = src;
  }
  function stop(c) {
    var im = img(c); if (!im) return;
    c.classList.remove("playing");
    im.src = im.getAttribute("data-still");
  }
  cards.forEach(function (c) {
    var im = img(c); if (im) im.setAttribute("data-still", im.getAttribute("src"));
    if (!touch) {
      c.addEventListener("pointerenter", function () { play(c); });
      c.addEventListener("pointerleave", function () { stop(c); });
    }
    c.addEventListener("focusin", function () { if (!touch) play(c); });
    c.addEventListener("focusout", function () { stop(c); });
    if (touch) c.addEventListener("click", function () {
      if (current && current !== c) stop(current);
      if (c.classList.contains("playing")) { stop(c); current = null; } else { play(c); current = c; }
    });
  });
})();

// Mobile menu
(function () {
  var nav = document.getElementById("nav"), btn = document.getElementById("navToggle"), menu = document.getElementById("navMenu");
  if (!nav || !btn || !menu) return;
  function set(open) {
    nav.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  btn.addEventListener("click", function () { set(!nav.classList.contains("open")); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
  document.addEventListener("click", function (e) { if (!nav.contains(e.target)) set(false); });
  window.addEventListener("resize", function () { if (window.innerWidth > 620) set(false); });
})();

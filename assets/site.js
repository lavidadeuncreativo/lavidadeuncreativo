(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Reloj de la barra */
  var clock = $(".clock");
  function tick() {
    if (!clock) return;
    var d = new Date();
    var day = d.toLocaleDateString("es-MX", { weekday: "short" }).replace(".", "");
    clock.textContent = day + " " + d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  }
  tick(); setInterval(tick, 20000);

  var desk = $(".desk");
  if (desk) {
    var mobile = function () { return window.matchMedia("(max-width:760px)").matches; };
    var KEY = "ldc-desk-pos";
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { saved = {}; }
    var z = 30;

    $$(".icon").forEach(function (el) {
      var id = el.getAttribute("data-id");
      if (saved[id] && !mobile()) { el.style.left = saved[id][0] + "%"; el.style.top = saved[id][1] + "%"; }
      var sx = 0, sy = 0, ox = 0, oy = 0, moved = false, down = false;
      el.addEventListener("pointerdown", function (e) {
        if (mobile()) return;
        down = true; moved = false; sx = e.clientX; sy = e.clientY;
        var r = el.getBoundingClientRect(); ox = sx - r.left; oy = sy - r.top;
        el.setPointerCapture(e.pointerId);
        $$(".icon.sel").forEach(function (x) { x.classList.remove("sel"); }); el.classList.add("sel");
        el.style.zIndex = ++z;
      });
      el.addEventListener("pointermove", function (e) {
        if (!down) return;
        if (!moved && Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) < 5) return;
        moved = true;
        var W = desk.clientWidth, H = desk.clientHeight;
        var x = Math.max(0, Math.min(W - el.offsetWidth, e.clientX - ox)), y = Math.max(34, Math.min(H - el.offsetHeight - 10, e.clientY - oy));
        el.style.left = (x / W * 100) + "%"; el.style.top = (y / H * 100) + "%";
      });
      el.addEventListener("pointerup", function () {
        if (!down) return; down = false;
        if (moved) { saved[id] = [parseFloat(el.style.left), parseFloat(el.style.top)]; try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {} return; }
        open(el);
      });
      el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(el); } });
      el.addEventListener("click", function (e) { if (mobile()) open(el); });
    });

    desk.addEventListener("pointerdown", function (e) { if (!e.target.closest(".icon,.win,.dock,.menubar,.note")) $$(".icon.sel").forEach(function (x) { x.classList.remove("sel"); }); });

    function open(el) {
      var kind = el.getAttribute("data-kind"), id = el.getAttribute("data-id"), url = el.getAttribute("data-url");
      if (kind === "link") { if (url) window.open(url, /^mailto:/.test(url) ? "_self" : "_blank", "noopener"); return; }
      if (kind === "page") { if (url) location.href = url; return; }
      var tpl = document.getElementById("tpl-" + id); if (!tpl) return;
      var existing = document.getElementById("win-" + id);
      if (existing) { existing.style.zIndex = ++z; return; }
      var w = document.createElement("div");
      w.className = "win"; w.id = "win-" + id; w.setAttribute("role", "dialog"); w.setAttribute("aria-label", el.getAttribute("data-label") || "Ventana");
      w.innerHTML = '<div class="bar"><div class="dots"><button aria-label="Cerrar"></button><button tabindex="-1" aria-hidden="true"></button><button tabindex="-1" aria-hidden="true"></button></div><span></span></div><div class="body"></div>';
      w.querySelector(".bar span").textContent = el.getAttribute("data-label") || "";
      w.querySelector(".body").appendChild(tpl.content.cloneNode(true));
      var n = $$(".win").length;
      if (!mobile()) { w.style.left = Math.min(desk.clientWidth - 480, desk.clientWidth * 0.3 + n * 28) + "px"; w.style.top = (90 + n * 26) + "px"; }
      w.style.zIndex = ++z;
      desk.appendChild(w);
      w.querySelector(".dots button").addEventListener("click", function () { w.remove(); });
      w.addEventListener("pointerdown", function () { w.style.zIndex = ++z; });
      var bar = w.querySelector(".bar"), bx = 0, by = 0, dragging = false;
      bar.addEventListener("pointerdown", function (e) { if (mobile() || e.target.closest("button")) return; dragging = true; bx = e.clientX - w.offsetLeft; by = e.clientY - w.offsetTop; bar.setPointerCapture(e.pointerId); });
      bar.addEventListener("pointermove", function (e) { if (!dragging) return; w.style.left = Math.max(-200, Math.min(desk.clientWidth - 120, e.clientX - bx)) + "px"; w.style.top = Math.max(32, Math.min(desk.clientHeight - 60, e.clientY - by)) + "px"; });
      bar.addEventListener("pointerup", function () { dragging = false; });
      var first = w.querySelector(".dots button"); if (first) first.focus({ preventScroll: true });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var ws = $$(".win"); if (!ws.length) return;
      ws.sort(function (a, b) { return (+b.style.zIndex || 0) - (+a.style.zIndex || 0); })[0].remove();
    });
  }

  /* Filtros del blog */
  var filters = $(".filters");
  if (filters) {
    filters.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-tag]"); if (!b) return;
      var tag = b.getAttribute("data-tag");
      $$(".filters button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      $$(".cards .card").forEach(function (c) { var tags = (c.getAttribute("data-tags") || "").split("|"); c.style.display = !tag || tags.indexOf(tag) >= 0 ? "" : "none"; });
    });
  }

  /* Copiar enlace del artículo */
  var copy = $("[data-copy]");
  if (copy) copy.addEventListener("click", function () {
    var done = function () { copy.textContent = "¡Enlace copiado!"; setTimeout(function () { copy.textContent = "Copiar enlace"; }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, function () {}); else done();
  });
  /* Foto de fondo: el cursor la enfoca */
  var pf = $(".portrait .frame");
  if (pf) {
    var tx = 0.5, ty = 0.45, cx = tx, cy = ty, raf = 0;
    var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var paint = function () { pf.style.setProperty("--mx", (cx * 100).toFixed(2) + "%"); pf.style.setProperty("--my", (cy * 100).toFixed(2) + "%"); };
    var step = function () { cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18; paint(); raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(step) : 0; };
    document.addEventListener("pointermove", function (e) {
      var r = pf.getBoundingClientRect(); if (!r.width) return;
      tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height;
      if (still) { cx = tx; cy = ty; paint(); } else if (!raf) raf = requestAnimationFrame(step);
    }, { passive: true });
  }
  /* Degradado animado */
  function startWave(cv, win) {
    var gl = null;
    try { gl = cv.getContext("webgl", { antialias: false, alpha: false, preserveDrawingBuffer: false }); } catch (e) { gl = null; }
    if (!gl) return false;
    var vs = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
    var fs = "precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;" +
      "vec3 hsv(float h,float s,float v){vec3 k=clamp(abs(mod(h*6.+vec3(0.,4.,2.),6.)-3.)-1.,0.,1.);return v*mix(vec3(1.),k,s);}" +
      "void main(){vec2 uv=gl_FragCoord.xy/r;vec2 q=uv;q.x*=r.x/r.y;q+=(m-.5)*.12;float a=t*.1;" +
      "float y=q.y+.2*sin(q.x*1.9+a)+.1*sin(q.x*3.7-a*1.3+q.y*1.7);" +
      "float w=sin(y*5.2-a*1.4+sin(q.x*1.3+a*.6)*1.4);" +
      "float w2=sin(y*9.-a*2.1+q.x*.8)*.5+.5;" +
      "float band=smoothstep(-.35,1.,w);float glow=pow(max(0.,w),7.)*(.6+.4*w2);" +
      "float h=fract(t*.018+uv.x*.05-uv.y*.03);" +
      "vec3 deep=hsv(h+.05,.9,.09);vec3 mid=hsv(h,.8,.62);vec3 hi=hsv(h-.04,.28,1.);" +
      "vec3 c=mix(deep,mid,band*.9);c=mix(c,hi,glow*.7);c*=.82+.18*uv.y;" +
      "float n=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);c+=(n-.5)*.03;" +
      "gl_FragColor=vec4(c,1.);}";
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; }
    var v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return false;
    var pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return false;
    gl.useProgram(pr);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var ur = gl.getUniformLocation(pr, "r"), ut = gl.getUniformLocation(pr, "t"), um = gl.getUniformLocation(pr, "m");
    var still = win.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5, t0 = win.performance.now(), queued = false;
    function size() {
      var k = 0.5, w = Math.max(1, Math.round(cv.clientWidth * k)), h = Math.max(1, Math.round(cv.clientHeight * k));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
    }
    function frame(now) {
      queued = false;
      if (!cv.isConnected) return;
      size(); mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
      gl.uniform2f(ur, cv.width, cv.height); gl.uniform1f(ut, still ? 8 : (now - t0) / 1000); gl.uniform2f(um, mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!still) { queued = true; win.requestAnimationFrame(frame); }
    }
    function kick() { if (!queued) { queued = true; win.requestAnimationFrame(frame); } }
    win.document.addEventListener("pointermove", function (e) { tmx = e.clientX / win.innerWidth; tmy = 1 - e.clientY / win.innerHeight; if (still) { mx = tmx; my = tmy; kick(); } }, { passive: true });
    win.addEventListener("resize", kick);
    kick();
    cv.classList.add("on");
    return true;
  }
  
  var wv = $(".wave-bg"); if (wv) startWave(wv, window);
})();

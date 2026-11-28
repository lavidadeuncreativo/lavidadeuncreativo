/* Guía Kindle: botón "Copiar" en cada bloque de comandos */
(function () {
  "use strict";
  var blocks = document.querySelectorAll(".prose pre");
  Array.prototype.forEach.call(blocks, function (pre) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pill copy-code";
    btn.textContent = "Copiar";
    btn.addEventListener("click", function () {
      var code = pre.querySelector("code");
      var text = code ? code.textContent : pre.textContent;
      var done = function () { btn.textContent = "¡Copiado!"; setTimeout(function () { btn.textContent = "Copiar"; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {});
      } else {
        var ta = document.createElement("textarea");
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
    pre.appendChild(btn);
  });
})();

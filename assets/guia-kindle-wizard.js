/* Asistente: tu paso a paso para hacerle jailbreak a tu Kindle.
   Lógica de compatibilidad basada en el asistente de KindleModding (kindlemodding.org). */
(function () {
  "use strict";
  var root = document.getElementById("kw");
  var D = window.KW_DATA;
  if (!root || !D) return;

  var KM = "https://kindlemodding.org";
  var MTP = ["PW5", "KT5", "KS", "KT6", "PW6", "KS2", "CS", "KS3", "KSC", "KT7"];
  var FILLER_SH = "https://raw.githubusercontent.com/bastianmarin/Kindle-Filler-Disk/main/Scripts/Filler.sh";
  var FILLER_PS = "https://raw.githubusercontent.com/bastianmarin/Kindle-Filler-Disk/main/Scripts/Filler.ps1";

  var esN = function (n) { return String(n).replace(/\((\d+)(?:st|nd|rd|th) Generation\)/, "($1a generación)").replace(/(\d+)(?:st|nd|rd|th) Generation/, "$1a generación").replace(/ - (\d{4}) Release/, " ($1)").replace(/\(2026 release\)/, "(2026)"); };
  D.models.forEach(function (m) { m.name = esN(m.name); });
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]; }); };
  var code = function (t) { return '<pre class="kw-pre"><code>' + esc(t) + "</code></pre>"; };
  var a = function (url, text) { return '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(text) + "</a>"; };

  /* ---------- Formulario ---------- */
  var modelOpts = D.models.filter(function (m) { return m.sv === 1; }).map(function (m) { return '<option value="' + esc(m.n) + '">' + esc(m.name) + "</option>"; }).join("");
  root.innerHTML =
    '<form class="kw-form" novalidate>' +
    '<fieldset><legend>1. ¿Qué computadora vas a usar?</legend><div class="kw-row">' +
    '<label class="kw-opt"><input type="radio" name="os" value="mac"> Mac</label>' +
    '<label class="kw-opt"><input type="radio" name="os" value="win"> Windows</label>' +
    '<label class="kw-opt"><input type="radio" name="os" value="linux"> Linux</label></div></fieldset>' +
    '<fieldset><legend>2. Número de serie de tu Kindle</legend>' +
    '<p class="kw-help">En el Kindle: Ajustes &gt; Opciones del dispositivo &gt; Información del dispositivo. Basta con los primeros 6 caracteres (ejemplo: G090VB).</p>' +
    '<input class="kw-in" id="kw-serial" autocomplete="off" spellcheck="false" placeholder="G090VB" maxlength="20">' +
    '<p class="kw-status" id="kw-serial-st" aria-live="polite"></p>' +
    '<details class="kw-alt"><summary>No encuentro el número, prefiero elegir mi modelo</summary>' +
    '<select class="kw-in" id="kw-model"><option value="">Elige tu modelo</option>' + modelOpts + "</select></details></fieldset>" +
    '<fieldset><legend>3. Versión de software</legend>' +
    '<p class="kw-help">En la misma pantalla de Información del dispositivo. Escríbela completa, con todos los puntos.</p>' +
    '<input class="kw-in" id="kw-fw" inputmode="decimal" autocomplete="off" placeholder="5.18.1.1.1" maxlength="20">' +
    '<p class="kw-status" id="kw-fw-st" aria-live="polite"></p></fieldset>' +
    '<fieldset><legend>4. ¿Tu Kindle se puede registrar en una cuenta de Amazon?</legend><div class="kw-row">' +
    '<label class="kw-opt"><input type="radio" name="reg" value="1"> Sí</label>' +
    '<label class="kw-opt"><input type="radio" name="reg" value="0"> No (Amazon no lo deja)</label></div></fieldset>' +
    '<fieldset><legend>5. ¿Muestra anuncios en la pantalla de bloqueo?</legend><div class="kw-row">' +
    '<label class="kw-opt"><input type="radio" name="ads" value="1"> Sí</label>' +
    '<label class="kw-opt"><input type="radio" name="ads" value="0"> No</label>' +
    '<label class="kw-opt"><input type="radio" name="ads" value="0"> No sé</label></div></fieldset>' +
    '<button type="submit" class="pill dark kw-go">Armar mi paso a paso</button>' +
    '<p class="kw-status" id="kw-form-st" aria-live="polite"></p></form>' +
    '<div class="kw-out" id="kw-out" tabindex="-1"></div>';

  var $ = function (s) { return root.querySelector(s); };
  var serialIn = $("#kw-serial"), serialSt = $("#kw-serial-st"), modelSel = $("#kw-model"), fwIn = $("#kw-fw"), fwSt = $("#kw-fw-st");
  var state = {model: null};

  function serialInfo(s) {
    if (s.length === 2 || s.length === 3) return {sv: s.length === 2 ? 0 : 1, code: s};
    if (s[0] === "G") { if (s.length < 6) return -1; return {sv: 1, code: s.substring(3, 6)}; }
    if (/^[0-9A-F]/.test(s)) { if (s.length < 4) return -1; return {sv: 0, code: s.substring(2, 4)}; }
    return -2;
  }
  function findModel(serial) {
    var info = serialInfo(serial);
    if (typeof info === "number") return info;
    for (var i = 0; i < D.models.length; i++) {
      var m = D.models[i];
      if (m.sv < info.sv) continue;
      if (m.codes.indexOf(info.code) !== -1) return m;
    }
    return null;
  }
  function setSt(el, ok, text) { el.className = "kw-status " + (ok ? "ok" : "bad"); el.textContent = text; }

  serialIn.addEventListener("input", function () {
    var s = serialIn.value.toUpperCase().replace(/\s/g, "");
    if (!s) { serialSt.textContent = ""; state.model = modelSel.value ? byNick(modelSel.value) : null; return; }
    var m = findModel(s);
    if (m === -1) { state.model = null; setSt(serialSt, false, "Escribe al menos 6 caracteres."); }
    else if (m === -2 || m === null) { state.model = null; setSt(serialSt, false, "No reconozco ese número. Revísalo o elige tu modelo abajo."); }
    else { state.model = m; modelSel.value = ""; setSt(serialSt, true, "Encontrado: " + m.name); }
  });
  function byNick(n) { for (var i = 0; i < D.models.length; i++) if (D.models[i].n === n) return D.models[i]; return null; }
  modelSel.addEventListener("change", function () {
    if (modelSel.value) { state.model = byNick(modelSel.value); serialIn.value = ""; setSt(serialSt, true, "Elegiste: " + state.model.name); }
  });
  fwIn.addEventListener("input", function () {
    fwIn.value = fwIn.value.replace(/[^0-9.]/g, "");
    if (!fwIn.value) { fwSt.textContent = ""; return; }
    if (validFw(fwIn.value)) setSt(fwSt, true, "Formato correcto. Revisa que no tenga errores.");
    else setSt(fwSt, false, "Formato incorrecto. Debe verse como 5.18.1.1.1");
  });
  function validFw(v) { return /^\d{1,2}(\.\d{1,2}){1,5}$/.test(v) && parseInt(v.split(".")[0], 10) <= 5; }
  function cmp(v1, v2) {
    var x = v1.split(".").map(Number), y = String(v2).split(".").map(Number), n = Math.max(x.length, y.length);
    for (var i = 0; i < n; i++) { var p = x[i] || 0, q = y[i] || 0; if (p > q) return 1; if (p < q) return -1; }
    return 0;
  }
  function radio(name) { var r = root.querySelector('input[name="' + name + '"]:checked'); return r ? r.value : null; }

  function findJbs(model, fw, blacklisted, ads) {
    return D.jbs.filter(function (jb) {
      if (jb.models.indexOf(model) === -1) return false;
      if (jb.reg && blacklisted) return false;
      if (jb.ads && !ads) return false;
      return jb.fw.some(function (r) {
        if (r.m.indexOf("all") === -1 && r.m.indexOf(model) === -1) return false;
        if (r.no.indexOf(fw) !== -1) return false;
        if (r.ok.indexOf(fw) !== -1) return true;
        return cmp(fw, r.min) >= 0 && cmp(fw, r.max) <= 0;
      });
    });
  }

  root.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();
    var os = radio("os"), reg = radio("reg"), ads = radio("ads"), fw = fwIn.value, st = $("#kw-form-st");
    var missing = [];
    if (!os) missing.push("tu computadora");
    if (!state.model) missing.push("tu modelo");
    if (!validFw(fw)) missing.push("la versión de software");
    if (reg === null) missing.push("si se puede registrar");
    if (ads === null) missing.push("si tiene anuncios");
    if (missing.length) { setSt(st, false, "Me falta: " + missing.join(", ") + "."); return; }
    st.textContent = "";
    render(os, state.model, fw, reg === "0", ads === "1");
  });

  /* ---------- Resultado ---------- */
  function openKindle(os, mtp) {
    if (os === "mac" && mtp) return "Tu modelo no aparece en Finder (usa otro tipo de conexión llamado MTP). Instala " + a("https://openmtp.ganeshrvel.com", "OpenMTP") + " (gratis), ábrelo con el Kindle conectado y desde ahí ves y arrastras archivos.";
    if (os === "mac") return "Conéctalo con el cable: aparece en Finder como <strong>Kindle</strong>.";
    if (os === "win") return "Conéctalo con el cable: aparece en el Explorador de archivos, en <strong>Este equipo</strong>, como Kindle.";
    return "Conéctalo con el cable: aparece en tu gestor de archivos (Archivos, Dolphin, etc.).";
  }
  function trash(os) { return os === "mac" ? "Arrástralos a la papelera y <strong>vacíala</strong>; si no, el espacio no se libera." : os === "win" ? "Bórralos con Suprimir." : "Bórralos y vacía la papelera."; }

  function fillerStep(os, mtp) {
    var s = "<p>Así el Kindle no tiene espacio para bajar una actualización mientras usas WiFi.</p>";
    if (os === "win") {
      s += "<p>Abre <strong>PowerShell</strong> (menú Inicio, escribe PowerShell), pega esto y dale Enter:</p>" + code("irm " + FILLER_PS + " | iex");
      s += "<p>Si te pide elegir dispositivo, escoge el de tu Kindle. Luego contesta <code>1</code> (llenar), <code>2</code> (dejar 50 MB) y <code>y</code> (confirmar).</p>";
    } else if (os === "mac" && mtp) {
      s += "<p>En Mac, el script no funciona con tu modelo. Usa " + a("https://github.com/jannikac/mtp-filler", "mtp-filler") + ", una app con botones que hace lo mismo: elige tu Kindle y deja unos 50 MB libres.</p>";
    } else if (os === "mac") {
      s += "<p>Abre Terminal, pega esto y dale Enter (ojo: la última línea a veces se queda esperando, dale Enter otra vez):</p>" + code("cd /Volumes/Kindle\ncurl -fsSLO " + FILLER_SH + "\nchmod +x Filler.sh\n./Filler.sh");
      s += "<p>Contesta <code>1</code> (llenar), <code>2</code> (dejar 50 MB) y <code>y</code> (confirmar).</p>";
    } else {
      s += "<p>Abre la terminal, pega esto y dale Enter:</p>" + code("curl -fsSL " + FILLER_SH + " | bash");
      s += "<p>Contesta <code>1</code> (llenar), <code>2</code> (dejar 50 MB) y <code>y</code> (confirmar).</p>";
    }
    s += "<p>Al final, en Información del dispositivo deben quedar entre 50 y 90 MB libres.</p>";
    return s;
  }

  var unzip = function (os) { return os === "mac" ? "doble clic en el .zip" : os === "win" ? "clic derecho en el .zip &gt; Extraer todo" : "descomprímelo"; };

  function jbSteps(name, os, mtp) {
    var L = [];
    switch (name) {
      case "SpiderCat":
        L = ["Descarga " + a(KM + "/spidercat/spidercat.azw3", "spidercat.azw3") + " y cópialo a la carpeta <code>documents</code> del Kindle. (O desde el navegador del Kindle entra a <code>kindlemodding.org/spidercat</code> y descárgalo ahí.)",
             "Expulsa el Kindle, quita el modo avión y conéctate a WiFi.",
             "Abre el libro SpiderCat. Primero se queda en blanco unos segundos y luego empieza a bajar texto. Si sale \"application error\", ignóralo.",
             "No toques nada hasta que diga \"Restarting Kindle\" y se reinicie solo."];
        break;
      case "Véra":
        L = ["Quita el modo avión y conéctate a WiFi.",
             "En el Kindle abre el navegador (menú de 3 puntos &gt; Navegador web) y entra a <code>https://kindlemodding.org/vera</code>.",
             "Elige tu modelo y tu versión de software. Descarga los dos libros: <strong>Font Calibration</strong> y el libro <strong>Véra</strong> de tu modelo. Cierra el navegador.",
             "Abre Font Calibration, toca arriba y entra a <strong>Aa</strong>. En Fuente: Bookerly, negrita en 0 y tamaño al máximo. En Espaciado: interlineado 2.",
             "En Temas: Guardar ajustes actuales &gt; Guardar. Sal del libro.",
             "Abre el libro Véra y espera a que corra el texto y se reinicie. No apagues el WiFi."];
        break;
      case "Nosebleed":
        L = ["Descarga Nosebleed desde " + a(KM + "/jailbreaking/Nosebleed/", "su guía") + " y " + unzip(os) + ".",
             "Copia los dos archivos que trae a la raíz del Kindle (la carpeta principal, no dentro de documents).",
             "Expulsa el Kindle, quita el modo avión y conéctate a WiFi.",
             "En el navegador del Kindle entra a <code>https://kindlemodding.org/nosb</code> y toca la \"L\" de la imagen. Los \"application error\" son normales."];
        break;
      case "Sanctuary":
        L = ["Quita el modo avión y conéctate a WiFi.",
             "En el navegador del Kindle entra a <code>http://sanctuary.skyvincent.com/scroll</code> (con http, no https) y compara tu barra de desplazamiento con las imágenes de " + a(KM + "/jailbreaking/Sanctuary/", "la guía oficial") + ".",
             "Entra a <code>http://sanctuary.skyvincent.com/</code> y espera: el escaneo puede tardar hasta 20 minutos. Cuando salga un ID, escríbelo exacto en la caja de abajo y toca Connect.",
             "Cuando diga \"Downloads Done\", cierra el navegador.",
             "Ve a Ajustes &gt; Ayuda &gt; Primeros pasos (Getting Started). Debe aparecer texto: ese es el jailbreak."];
        break;
      case "Shadow":
        L = ["Descarga la última versión de Shadow desde " + a(KM + "/jailbreaking/Shadow/", "su guía") + ".",
             "Anota el número de compilación del Kindle: el número de 10 dígitos entre paréntesis en Información del dispositivo.",
             os === "win" ? "Cierra el Explorador de archivos, desconecta y vuelve a conectar el Kindle. Luego clic derecho en <code>shadow-windows.exe</code> &gt; Ejecutar como administrador."
             : os === "mac" ? "Cierra Finder y en Terminal, dentro de la carpeta de Shadow, corre:" + code("killall ptpcamerad\nchmod +x shadow-darwin && sudo ./shadow-darwin")
             : "Cierra tu gestor de archivos y en la terminal, dentro de la carpeta de Shadow, corre:" + code("killall kiod6 kiod5 gvfsd-mtp\nchmod +x shadow-linux && sudo ./shadow-linux"),
             "Escribe tu número de compilación exacto y dale Enter.",
             "Cuando te lo pida, desconecta y vuelve a conectar el Kindle (" + (os === "win" ? "dos veces en Windows" : "una vez") + "). Debe correr texto arriba a la izquierda del Kindle."];
        break;
      case "SpringBreak":
        L = ["Pon el modo avión y reinicia el Kindle.",
             "Conéctalo a la compu.",
             os === "win" ? "Descarga SpringBreak desde " + a(KM + "/jailbreaking/SpringBreak/", "su guía") + ", " + unzip(os) + " y haz doble clic en <code>springbreak.exe</code>."
             : os === "mac" ? "Abre Terminal y pega esto completo:" + code("curl -L https://github.com/KindleModding/SpringBreak/releases/latest/download/springbreak.zip -o springbreak.zip && unzip springbreak.zip && cd springbreak && chmod +x ./springbreak-darwin && ./springbreak-darwin")
             : "Descarga SpringBreak desde " + a(KM + "/jailbreaking/SpringBreak/", "su guía") + ", descomprímelo y corre:" + code("chmod +x ./springbreak-linux && ./springbreak-linux"),
             "Elige tu Kindle de la lista con su número. Espera: el programa llena la memoria él solo (en Windows tarda más).",
             "Desconecta, toca el ícono de la Tienda y cuando te lo pida quita el modo avión. Espera a que salga el texto de éxito.",
             "<strong>Importante:</strong> vuelve a conectar el Kindle y corre el programa otra vez para limpiar. Si no, el Kindle tarda hasta 15 minutos en prender."];
        break;
      case "AdBreak":
        L = ["Deja el Kindle conectado a internet un rato hasta que descargue anuncios (presiona el botón de encendido y debe verse uno).",
             "Pon el modo avión. Menú de arriba a la derecha &gt; Ver todos los anuncios.",
             "Descarga AdBreak desde " + a(KM + "/jailbreaking/AdBreak/", "su guía") + " y " + unzip(os) + ".",
             "Conecta el Kindle y copia su carpeta oculta <code>.assets</code> a tu compu" + (os === "mac" ? " (en Finder presiona Cmd + Shift + . para ver ocultos)" : os === "win" ? " (en el Explorador: Vista &gt; Mostrar &gt; Elementos ocultos)" : "") + ". Pon dentro el contenido de AdBreak.",
             os === "win" ? "Dentro de esa carpeta, doble clic en <code>replace.bat</code>." : "En la terminal, dentro de esa carpeta, corre:" + code("find . -name 'details.html' -exec cp adbreak.html {} \\;"),
             "Borra la <code>.assets</code> original del Kindle y pon tu copia modificada.",
             "Desconecta, toca un anuncio y sigue los avisos. Al cerrar \"Bang!\" corre el jailbreak."];
        break;
      case "WinterBreak":
        L = ["Pon el modo avión y reinicia el Kindle.",
             "Descarga WinterBreak desde " + a(KM + "/jailbreaking/WinterBreak/", "su guía") + " y descomprímelo en tu compu (no directo en el Kindle).",
             "Copia los archivos a la raíz del Kindle y reemplaza si te pregunta." + (os !== "win" ? " Asegúrate de copiar también la carpeta oculta <code>.active_content_sandbox</code>" + (os === "mac" ? " (Cmd + Shift + . para verla)." : ".") : ""),
             "Expulsa el Kindle, abre la Tienda (ícono del carrito) y acepta quitar el modo avión.",
             "Cuando cargue Mesquito, toca el ícono de WinterBreak y espera unos 30 segundos."];
        break;
      case "WinterBreak2":
        L = ["Descarga WinterBreak2 desde " + a(KM + "/jailbreaking/WinterBreak2/", "su guía") + " y extrae <code>wb2.zip</code> en la raíz del Kindle. Debe quedar una carpeta <code>winterbreak2</code>.",
             "Expulsa el Kindle y conéctalo a WiFi.",
             "Abre el Navegador experimental y entra a <code>https://penguins184.xyz/wb2</code>.",
             "Toca el botón Jailbreak y espera a que termine."];
        break;
      default:
        L = ["Tu modelo usa un método antiguo. Sigue paso a paso la guía oficial de " + a(KM + "/jailbreaking/", "kindlemodding.org") + "."];
    }
    return L;
  }

  function libraryStep(os, mtp) {
    var s = "<p>Tus compras de Amazon no salen en KOReader (traen DRM); esas se leen en el Kindle normal. Para tus PDF y EPUB, juntamos todo en una carpeta <code>Libros</code>.</p>";
    if (!mtp && os === "mac") {
      s += "<p>Con KOReader cerrado y el Kindle conectado, pega en Terminal:</p>" + code('cd /Volumes/Kindle/documents && mkdir -p Libros\nfind . -path ./Libros -prune -o -type f \\( -iname "*.pdf" -o -iname "*.epub" \\) ! -name "._*" -print | while IFS= read -r f; do\n  b=$(basename "$f"); n="${b%%-cdeKey_*}"; [ "$n" != "$b" ] && n="$n.${b##*.}"\n  mv -n "$f" "Libros/$n"\ndone\nls Libros\ncd ~ && diskutil eject /Volumes/Kindle');
    } else if (!mtp && os === "win") {
      s += "<p>Con KOReader cerrado y el Kindle conectado, pega en PowerShell:</p>" + code("$k = (Get-Volume | Where-Object FileSystemLabel -eq 'Kindle').DriveLetter\nSet-Location \"$($k):\\documents\"\nNew-Item -ItemType Directory -Force -Path Libros | Out-Null\nGet-ChildItem -Recurse -File | Where-Object { $_.Extension -match '^\\.(pdf|epub)$' -and $_.FullName -notmatch '\\\\Libros\\\\' -and $_.Name -notlike '._*' } | ForEach-Object {\n  $n = $_.Name -replace '-cdeKey_.*(\\.[^.]+)$', '$1'\n  $d = Join-Path \"$($k):\\documents\\Libros\" $n\n  if (-not (Test-Path -LiteralPath $d)) { Move-Item -LiteralPath $_.FullName -Destination $d }\n}\nGet-ChildItem Libros");
    } else {
      s += "<p>Abre el Kindle desde la compu, crea la carpeta <code>Libros</code> dentro de <code>documents</code> y arrastra ahí tus PDF y EPUB (los que mandaste con Send to Kindle suelen estar en <code>documents/Downloads</code>).</p>";
    }
    s += "<p>Luego en KOReader: Biblioteca &gt; sube de carpeta hasta ver <code>Libros</code> &gt; mantenla presionada &gt; Establecer como carpeta de inicio. Y en Ajustes (barra de abajo) &gt; Biblioteca, activa Bloquear carpeta de inicio.</p>";
    return s;
  }

  function render(os, model, fw, blacklisted, ads) {
    var out = $("#kw-out"), mtp = MTP.indexOf(model.n) !== -1;
    var jbs = findJbs(model.n, fw, blacklisted, ads);
    var osName = {mac: "Mac", win: "Windows", linux: "Linux"}[os];
    if (!jbs.length) {
      out.innerHTML = '<div class="kw-card bad"><h3>Por ahora no hay jailbreak para tu Kindle</h3>' +
        "<p><strong>" + esc(model.name) + "</strong> con versión <strong>" + esc(fw) + "</strong> no tiene método disponible todavía.</p>" +
        "<ul><li>Deja el Kindle en modo avión para que no se actualice.</li><li>Revisa de vez en cuando el " + a(KM + "/jailbreak-wizard.html", "asistente oficial") + ": salen métodos nuevos cada cierto tiempo.</li></ul></div>";
      out.focus(); return;
    }
    var jb = jbs[0], others = jbs.slice(1).map(function (x) { return x.name; });
    var guide = KM + "/" + String(jb.url).replace(/^\/+/, "");
    var steps = [];
    steps.push(["Antes de empezar", "<ul class=\"check\"><li>Pon el Kindle en <strong>modo avión</strong> ya.</li><li>Batería arriba del 50% y un cable USB que pase datos.</li><li>" + openKindle(os, mtp) + "</li><li>Respaldo: copia la carpeta <code>documents</code> del Kindle a tu compu.</li></ul>"]);
    if (jb.name === "SpringBreak") steps.push(["Bloquear actualizaciones", "<p>Con SpringBreak <strong>no</strong> llenes la memoria tú: el programa lo hace solo y si ya está llena puede fallar.</p>"]);
    else steps.push(["Bloquear actualizaciones llenando la memoria", fillerStep(os, mtp)]);
    steps.push(["El jailbreak con " + esc(jb.name), "<ol>" + jbSteps(jb.name, os, mtp).map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ol><p>Guía oficial con imágenes: " + a(guide, jb.name + " en kindlemodding.org") + ". Si algo no coincide, manda la oficial.</p>"]);
    steps.push(["Limpieza", jb.name === "SpringBreak" ? "<p>Ya lo hiciste al correr SpringBreak por segunda vez. Si quedó algún archivo <code>update...bin</code> en la raíz del Kindle, bórralo.</p>"
      : "<p>Conecta el Kindle y borra la carpeta <code>fill_disk</code> (o los archivos de relleno) y cualquier archivo <code>update...bin</code> de la raíz. " + trash(os) + "</p><p>Si ves <code>libkh</code> o <code>privesc_marker.txt</code>, déjalos: son del jailbreak.</p>"]);
    steps.push(["Instalar KOReader", "<ol><li>Con WiFi, en la barra de búsqueda del inicio del Kindle escribe <code>;kpm update</code> y Enter.</li><li>Luego <code>;kpm install koreader</code> y Enter.</li><li>Abre el nuevo \"libro\" KOReader. Para ponerlo en español: toca arriba &gt; engrane &gt; Language &gt; Español.</li></ol>"]);
    steps.push(["Inicio con rachas y metas (SimpleUI)", "<ol><li>Cierra KOReader (arriba &gt; ☰ &gt; Salir).</li><li>Descarga " + a("https://github.com/doctorhetfield-cmd/simpleui.koplugin/releases/latest", "simpleui.koplugin.zip") + " (en Assets) y " + unzip(os) + ".</li><li>Conecta el Kindle y copia la carpeta <code>simpleui.koplugin</code> dentro de <code>koreader/plugins</code>. Adentro debe estar <code>main.lua</code> directo, sin otra carpeta en medio.</li><li>Abre KOReader, elige un diseño y en Ajustes (abajo) activa Leyendo actualmente, Objetivos y Racha. Pon la meta en minutos, no en horas.</li></ol>"]);
    steps.push(["Biblioteca ordenada", libraryStep(os, mtp)]);
    steps.push(["Lo opcional", "<p>Tu propio protector de pantalla: " + '<a href="#paso-7">paso 7</a>' + ". IA dentro del libro con Gemini gratis: " + '<a href="#paso-8">paso 8</a>' + ". Los plugins se instalan igual que SimpleUI: copiando su carpeta a <code>koreader/plugins</code>.</p>"]);

    out.innerHTML = '<div class="kw-card"><p class="kw-kicker">Tu guía personalizada</p>' +
      "<h3>" + esc(model.name) + " · " + esc(fw) + " · " + osName + "</h3>" +
      "<p>Tu método: <strong>" + esc(jb.name) + "</strong>." + (others.length ? " Alternativas si algo falla: " + others.map(esc).join(", ") + "." : " Es el único disponible para tu combinación, así que sigue los pasos con calma.") + "</p>" +
      (mtp ? '<p class="kw-note">Tu Kindle es de 2021 en adelante: se conecta por MTP. ' + (os === "mac" ? "En Mac no aparece en Finder; usa OpenMTP para ver sus archivos." : "En la compu no aparece como memoria USB, sino como dispositivo; igual puedes arrastrar archivos.") + "</p>" : "") +
      "</div>" +
      steps.map(function (s, i) { return '<section class="kw-step"><h4><span>' + (i + 1) + "</span>" + s[0] + "</h4>" + s[1] + "</section>"; }).join("") +
      '<p class="kw-src">Datos de compatibilidad: ' + a(KM, "KindleModding") + " (CC BY-NC 4.0), copia del 20 de noviembre de 2026. Confírmalo siempre en su " + a(KM + "/jailbreak-wizard.html", "asistente oficial") + ".</p>";
    addCopy(out);
    out.focus();
    out.scrollIntoView({behavior: "smooth", block: "start"});
  }

  function addCopy(scope) {
    Array.prototype.forEach.call(scope.querySelectorAll("pre"), function (pre) {
      var btn = document.createElement("button");
      btn.type = "button"; btn.className = "pill copy-code"; btn.textContent = "Copiar";
      btn.addEventListener("click", function () {
        var t = pre.querySelector("code").textContent;
        var done = function () { btn.textContent = "¡Copiado!"; setTimeout(function () { btn.textContent = "Copiar"; }, 1600); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, function () {});
      });
      pre.appendChild(btn);
    });
  }
})();

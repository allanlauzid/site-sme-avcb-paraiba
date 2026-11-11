/* =====================================================================
   AVCB Paraíba — interface do chatbot (Sara)
   Conversa guiada, revisão de respostas, resultado único em tela, PDF,
   código de consulta (PB2), QR Code e WhatsApp.
   ===================================================================== */
(function (W, D) {
  "use strict";
  var PB = W.PB;
  var $ = function (s, r) { return (r || D).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  var REDUZ = W.matchMedia && W.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MOBILE = W.matchMedia && W.matchMedia("(max-width: 720px)").matches;
  var EMBED = /[?&]embed=1/.test(location.search) && W.parent !== W;
  var K_TERMOS = "avcbpb.termos", K_ESTADO = "avcbpb.estado";
  var TERMOS_VERSAO = "2026-10-30";

  /* ---------------- Utilidades ---------------- */
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function semTags(h) { var d = D.createElement("div"); d.innerHTML = h; return d.textContent || ""; }
  function norm(t) { return String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function lsGet(k) { try { return W.localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { W.localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function lsDel(k) { try { W.localStorage.removeItem(k); } catch (e) { } }
  function el(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function espera(ms) { return new Promise(function (r) { setTimeout(r, REDUZ ? 0 : ms); }); }
  function agora() { var d = new Date(); return d.toLocaleDateString("pt-BR") + " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); }
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.hidden = false; t.classList.add("on");
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("on"); t.hidden = true; }, 4200);
  }

  /* ---------------- Código de consulta (protocolo PB2) ---------------- */
  var CRC_T = (function () { var t = [], c, n, k; for (n = 0; n < 256; n++) { c = n; for (k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(str) { var b = new TextEncoder().encode(str), c = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) c = CRC_T[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return ((c ^ 0xFFFFFFFF) >>> 0).toString(16).padStart(8, "0"); }
  function b64u(s) { var b = new TextEncoder().encode(s), bin = ""; b.forEach(function (x) { bin += String.fromCharCode(x); }); return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function unb64u(s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; var bin = atob(s); return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(bin, function (c) { return c.charCodeAt(0); })); }
  PB.codificar = function (S) {
    var ordem = PB.PERGUNTAS.map(function (p) { return p.id; }).filter(function (k) { return Object.prototype.hasOwnProperty.call(S.a, k); });
    var a = {}; ordem.forEach(function (k) { a[k] = S.a[k]; });
    var json = JSON.stringify({ v: PB.VERSAO.esquema, r: PB.VERSAO.regras, a: a });
    return "PB2-" + b64u(json) + "-" + crc32(json);
  };
  /* Retorna {ok, S} ou {ok:false, erro}. Nunca fabrica respostas. */
  PB.decodificar = function (raw) {
    var c = String(raw || "").trim();
    var m = c.match(/[?&]codigo=([^&#\s]+)/); if (m) { try { c = decodeURIComponent(m[1]); } catch (e) { c = m[1]; } }
    if (!c) return { ok: false, erro: "Cole o código do questionário." };
    if (/^PB1-/.test(c)) return { ok: false, erro: "Este código é de uma versão anterior do chatbot e não pode ser reaberto. Refaça a simulação." };
    if (/^[0-9A-F\s]{8,}$/i.test(c) && !/^PB2-/.test(c)) return { ok: false, erro: "Este código é do chatbot de Pernambuco e não vale para a Paraíba." };
    var p = c.match(/^PB2-([A-Za-z0-9_-]{8,6000})-([0-9a-f]{8})$/);
    if (!p) return { ok: false, erro: "Código inválido. Confira se copiou o código inteiro, começando por PB2-." };
    var json; try { json = unb64u(p[1]); } catch (e) { return { ok: false, erro: "Código inválido ou corrompido." }; }
    if (crc32(json) !== p[2]) return { ok: false, erro: "Código corrompido: a verificação não confere. Copie o código novamente." };
    var o; try { o = JSON.parse(json); } catch (e) { return { ok: false, erro: "Código inválido ou corrompido." }; }
    if (!o || typeof o !== "object" || o.v !== PB.VERSAO.esquema || typeof o.a !== "object" || !o.a || Array.isArray(o.a)) return { ok: false, erro: "Código de formato desconhecido." };
    if (PB.VERSAO.regrasConhecidas.indexOf(o.r) < 0) return { ok: false, erro: "Este código foi gerado com regras que não estão mais disponíveis. Refaça a simulação para ver a orientação atual." };
    var keys = Object.keys(o.a);
    if (!keys.length || !o.a.obj) return { ok: false, erro: "Código vazio ou incompleto." };
    for (var i = 0; i < keys.length; i++) if (!PB.P[keys[i]] || !PB.validaResposta(keys[i], o.a[keys[i]])) return { ok: false, erro: "Código inválido: contém respostas não reconhecidas." };
    var S = { a: JSON.parse(JSON.stringify(o.a)), nome: "" };
    var antes = Object.keys(S.a).length; PB.limparDependentes(S);
    if (Object.keys(S.a).length !== antes) return { ok: false, erro: "Código inválido: respostas incoerentes entre si." };
    if (PB.caminhoPerguntas(S).proxima) return { ok: false, erro: "Código incompleto: o questionário não foi terminado." };
    return { ok: true, S: S, regras: o.r };
  };

  /* ---------------- Estado ---------------- */
  var S = { a: {}, nome: "", nomeOk: false, fim: false };
  function salvar() { lsSet(K_ESTADO, JSON.stringify({ a: S.a, nome: S.nome, nomeOk: S.nomeOk, fim: S.fim, ts: Date.now() })); }
  function carregar() { try { var o = JSON.parse(lsGet(K_ESTADO) || "null"); if (o && o.a && typeof o.a === "object") return o; } catch (e) { } return null; }
  function termosOk() { return lsGet(K_TERMOS) === TERMOS_VERSAO || S._termosSessao === TERMOS_VERSAO; }

  /* ---------------- Painel do chat ---------------- */
  var msgs, opts, form, inp, epoca = 0;
  function abrirChat() {
    var p = $("#chatPanel"); p.hidden = false; D.body.classList.add("chat-aberto");
    requestAnimationFrame(function () { p.classList.add("on"); });
    if (!abrirChat._iniciado) { abrirChat._iniciado = true; iniciar(); }
    setTimeout(function () { var b = $("#chatPanel .chat-head button"); if (b) b.focus(); }, 60);
  }
  function fecharChat() {
    if (EMBED) { try { W.parent.postMessage({ avcbChat: "close" }, "*"); } catch (e) { } return; }
    if (MOBILE) { location.href = "index.html"; return; }
    var p = $("#chatPanel"); p.classList.remove("on"); D.body.classList.remove("chat-aberto");
    setTimeout(function () { p.hidden = true; var b = $("#chatLaunchBtn"); if (b) b.focus(); }, 220);
  }

  function rolar() { msgs.scrollTop = msgs.scrollHeight; }
  var semAnim = false;
  function balao(html, quem, extra) {
    var b = el("div", "bubble " + (quem || "bot") + (extra ? " " + extra : "") + (semAnim ? " no-anim" : ""), html);
    msgs.appendChild(b); rolar(); return b;
  }
  async function falar(html, extra) {
    var ep = epoca;
    var t = el("div", "bubble bot typing", "<span></span><span></span><span></span>"); t.setAttribute("aria-hidden", "true");
    msgs.appendChild(t); rolar();
    await espera(Math.min(900, 280 + semTags(html).length * 6));
    if (t.parentNode) t.parentNode.removeChild(t);
    if (ep !== epoca) return null;
    return balao(html, "bot", extra);
  }
  function limparEntrada() { opts.innerHTML = ""; form.hidden = true; inp.value = ""; inp.oninput = null; $("#sugestoes").innerHTML = ""; }

  function progresso() {
    var r = PB.caminhoPerguntas(S), et = r.proxima ? PB.P[r.proxima].etapa : (S.fim ? 4 : 3);
    $$(".prog-step").forEach(function (s, i) { s.classList.toggle("done", i < et); s.classList.toggle("cur", i === et); s.setAttribute("aria-current", i === et ? "step" : "false"); });
    $("#btnVoltar").disabled = !r.feitas.length;
  }

  var INTRO = [
    "Olá! Sou a <strong>Sara</strong>, assistente virtual da Sá Moraes Engenharia.",
    "Vou te ajudar a entender o caminho para regularizar seu imóvel, empresa ou evento no <strong>Corpo de Bombeiros Militar da Paraíba (CBMPB)</strong> e quais documentos separar.",
    "<span class='muted'><strong>Importante:</strong> sou uma ferramenta de orientação. Não emito certificado, não aprovo projeto e não substituo o responsável técnico nem a análise do CBMPB. As normas foram conferidas até " + PB.VERSAO.corte + ".</span>"
  ];

  async function iniciar() {
    var salvo = carregar();
    epoca++; msgs.innerHTML = ""; limparEntrada();
    for (var i = 0; i < INTRO.length; i++) { if (!(await falar(INTRO[i]))) return; }
    if (salvo && Object.keys(salvo.a).length && !salvo.fim) {
      await falar("Encontrei uma simulação em andamento neste navegador. Quer continuar de onde parou?");
      botoes([["Continuar de onde parei", function () { S.a = salvo.a; S.nome = salvo.nome || ""; S.nomeOk = !!salvo.nomeOk; S._termosSessao = TERMOS_VERSAO; render(true); }], ["Começar de novo", function () { lsDel(K_ESTADO); perguntarNome(); }]]);
      return;
    }
    perguntarNome();
  }

  function botoes(lista, cls) {
    limparEntrada();
    lista.forEach(function (b) {
      var x = el("button", "opt" + (cls ? " " + cls : "") + (b[2] ? " " + b[2] : ""), esc(b[0])); x.type = "button";
      x.addEventListener("click", function () { if (x.disabled) return; $$("button", opts).forEach(function (y) { y.disabled = true; }); b[1](); });
      opts.appendChild(x);
    });
    var f = $("button", opts); if (f && !MOBILE) f.focus({ preventScroll: true });
  }

  async function perguntarNome() {
    if (!(await falar("Como posso te chamar? <span class='muted'>(opcional — o nome não entra no código nem no link)</span>"))) return;
    limparEntrada(); form.hidden = false; inp.placeholder = "Digite o seu nome"; inp.setAttribute("inputmode", "text"); inp.setAttribute("aria-label", "Seu nome");
    var pular = el("button", "opt ghost", "Prefiro não informar"); pular.type = "button"; opts.appendChild(pular);
    pular.addEventListener("click", function () { S.nome = ""; S.nomeOk = true; balao("Prefiro não informar", "user"); depoisNome(); });
    form.onsubmit = function (e) {
      e.preventDefault(); var v = inp.value.trim().replace(/\s+/g, " ").slice(0, 40);
      if (!v) { pular.click(); return; }
      if (!/^[\p{L}][\p{L}' .-]*$/u.test(v)) { toast("Use apenas letras no nome."); return; }
      S.nome = v.split(" ")[0]; S.nomeOk = true; balao(esc(v), "user"); depoisNome();
    };
    if (!MOBILE) inp.focus();
  }
  async function depoisNome() {
    limparEntrada(); salvar();
    if (!(await falar((S.nome ? "Prazer, " + esc(S.nome) + "! " : "Tudo bem! ") + "Antes de começar, preciso que você leia e aceite os termos de uso."))) return;
    termos();
  }
  async function termos() {
    if (termosOk()) { await falar("Os termos de uso já foram aceitos neste navegador."); return render(false); }
    if (!(await falar("Resumo: as respostas ficam só neste navegador; o resultado é uma <strong>orientação inicial</strong>, que deve ser confirmada por um responsável técnico; o atendimento não substitui o Corpo de Bombeiros. <a href='#' data-abre='termos'>Ler os termos completos</a>."))) return;
    botoes([["Li e aceito os termos", function () { lsSet(K_TERMOS, TERMOS_VERSAO); S._termosSessao = TERMOS_VERSAO; balao("Li e aceito os termos", "user"); render(false); }], ["Ler os termos", function () { abrirModal("termsModal"); termos(); }, "ghost"], ["Não aceito", async function () { balao("Não aceito", "user"); await falar("Sem o aceite não consigo continuar. Você pode ler os termos, aceitar depois ou voltar ao site."); botoes([["Ler os termos", function () { abrirModal("termsModal"); termos(); }], ["Voltar ao site", function () { if (EMBED || MOBILE) fecharChat(); else location.href = "index.html"; }, "ghost"]]); }, "ghost"]]);
  }

  /* Re-renderiza a conversa a partir das respostas e pergunta a próxima. */
  async function render(semAnimacao) {
    epoca++; var ep = epoca;
    PB.limparDependentes(S); salvar();
    msgs.innerHTML = ""; limparEntrada(); semAnim = true;
    INTRO.forEach(function (h) { balao(h); });
    if (S.nomeOk) balao(S.nome ? esc(S.nome) : "Prefiro não informar", "user");
    var r = PB.caminhoPerguntas(S);
    r.feitas.forEach(function (id) {
      var p = PB.P[id];
      balao(p.textFn ? p.textFn(S) : p.text, "bot");
      var u = balao(esc(PB.rotuloResposta(id, S.a[id])), "user"); u.title = "Clique para alterar";
      u.tabIndex = 0; u.setAttribute("role", "button"); u.setAttribute("aria-label", "Alterar resposta: " + p.q);
      u.addEventListener("click", function () { alterar(id); });
      u.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); alterar(id); } });
    });
    semAnim = false; progresso();
    if (!r.proxima) { S.fim = true; salvar(); progresso(); return concluir(ep); }
    S.fim = false;
    perguntar(r.proxima, ep);
  }

  function alterar(id) {
    fecharModais();
    delete S.a[id]; S.fim = false;
    render(true);
  }

  function responder(id, valor) {
    S.a[id] = valor; S.fim = false;
    render(true);
  }

  async function perguntar(id, ep) {
    var p = PB.P[id];
    var txt = p.textFn ? p.textFn(S) : p.text;
    if (!(await falar(txt))) return; if (ep !== epoca) return;
    if (p.note) balao(p.note, "bot", "note");
    progresso();
    if (p.type === "choice") return botoes(p.opts.map(function (o) { return [o[0], function () { responder(id, o[1]); }, o[1] === "?" ? "ghost" : ""]; }));
    if (p.type === "multi") return multi(p);
    if (p.type === "number") return numero(p);
    if (p.type === "mun") return busca(p, PB.MUNICIPIOS.map(function (m) { return [m, m, ""]; }), "Digite o município", false);
    if (p.type === "search") return busca(p, PB.ATIVIDADES.map(function (a) { return [a[0], a[1], a[3] + " " + a[2]]; }), "Digite a atividade", true);
  }

  function multi(p) {
    limparEntrada();
    var sel = [];
    var wrap = el("div", "multi"); wrap.setAttribute("role", "group"); wrap.setAttribute("aria-label", p.q);
    function atual() { $$(".chip", wrap).forEach(function (c) { var on = sel.indexOf(c.dataset.v) >= 0; c.setAttribute("aria-pressed", on); c.classList.toggle("on", on); }); ok.disabled = !sel.length; }
    p.opts.concat([p.none, ["Não sei", "?"]]).forEach(function (o) {
      var c = el("button", "chip" + (o[1] === p.none[1] || o[1] === "?" ? " excl" : ""), esc(o[0])); c.type = "button"; c.dataset.v = o[1]; c.setAttribute("aria-pressed", "false");
      c.addEventListener("click", function () {
        var v = o[1], i = sel.indexOf(v);
        if (v === p.none[1] || v === "?") sel = i >= 0 ? [] : [v];
        else { sel = sel.filter(function (x) { return x !== p.none[1] && x !== "?"; }); i = sel.indexOf(v); if (i >= 0) sel.splice(i, 1); else sel.push(v); }
        atual();
      });
      wrap.appendChild(c);
    });
    var ok = el("button", "opt confirm", "Confirmar"); ok.type = "button"; ok.disabled = true;
    ok.addEventListener("click", function () {
      if (!sel.length) return;
      var v = sel[0] === "?" ? "?" : sel[0] === p.none[1] ? [p.none[1]] : p.opts.map(function (o) { return o[1]; }).filter(function (x) { return sel.indexOf(x) >= 0; });
      responder(p.id, v);
    });
    opts.appendChild(wrap); opts.appendChild(ok); rolar();
  }

  function numero(p) {
    limparEntrada(); form.hidden = false;
    inp.placeholder = "Ex.: " + (p.unit === "m²" ? "250" : p.unit === "m" ? "7,5" : "2") + " " + p.unit;
    inp.setAttribute("inputmode", p.dec ? "decimal" : "numeric"); inp.setAttribute("aria-label", p.q + " (" + p.unit + ")");
    var ns = el("button", "opt ghost", "Não sei"); ns.type = "button"; ns.addEventListener("click", function () { responder(p.id, "?"); }); opts.appendChild(ns);
    form.onsubmit = function (e) {
      e.preventDefault();
      var t = inp.value.trim().toLowerCase().replace(/m²|m2|metros?|pavimentos?|andares?|\s/g, "");
      if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) t = t.replace(/\./g, "");
      t = t.replace(",", ".");
      if (!/^\d+(\.\d+)?$/.test(t)) { toast("Digite só o número (ex.: " + (p.dec ? "120,5" : "3") + ")."); return; }
      var n = Number(t); if (!p.dec && n % 1) { toast("Use um número inteiro."); return; }
      n = Math.round(n * 100) / 100;
      if (n < p.min || n > p.max) { toast("Confira o valor: deve estar entre " + p.min + " e " + p.max.toLocaleString("pt-BR") + " " + p.unit + "."); return; }
      if (p.id === "area" && S.a.unid === "sim" && typeof S.a.area_pred === "number" && n > S.a.area_pred) { toast("A área da unidade não pode ser maior que a do prédio."); return; }
      if (p.id === "area_pred" && typeof S.a.area === "number" && n < S.a.area) { toast("A área do prédio não pode ser menor que a da sua unidade."); return; }
      responder(p.id, n);
    };
    if (!MOBILE) inp.focus();
  }

  function busca(p, lista, ph, outra) {
    limparEntrada(); form.hidden = false; inp.placeholder = ph; inp.setAttribute("inputmode", "search"); inp.setAttribute("aria-label", p.q);
    var sug = $("#sugestoes");
    function filtra() {
      var q = norm(inp.value).trim(); sug.innerHTML = "";
      if (q.length < 2) return;
      var palavras = q.split(/\s+/);
      var achados = lista.filter(function (x) { var h = norm(x[1] + " " + x[2]); return palavras.every(function (w) { return h.indexOf(w) >= 0; }); }).slice(0, 8);
      achados.forEach(function (x) { var b = el("button", "sug", esc(x[1])); b.type = "button"; b.setAttribute("role", "option"); b.addEventListener("click", function () { responder(p.id, x[0]); }); sug.appendChild(b); });
      if (!achados.length) sug.appendChild(el("div", "sug-vazio", outra ? "Nada encontrado. Escolha “Outra atividade”." : "Nenhum município encontrado com esse nome."));
    }
    inp.oninput = filtra;
    form.onsubmit = function (e) { e.preventDefault(); var b = $(".sug", sug); if (b) b.click(); else toast(outra ? "Escolha uma opção da lista ou “Outra atividade”." : "Escolha um município da lista."); };
    if (outra) { var o = el("button", "opt ghost", "Outra atividade"); o.type = "button"; o.addEventListener("click", function () { responder(p.id, "outra"); }); opts.appendChild(o); }
    var ns = el("button", "opt ghost", "Não sei"); ns.type = "button"; ns.addEventListener("click", function () { responder(p.id, "?"); }); opts.appendChild(ns);
    if (!MOBILE) inp.focus();
  }

  async function concluir(ep) {
    if (!(await falar("Pronto" + (S.nome ? ", " + esc(S.nome) : "") + "! Reuni as informações. Veja o resultado da simulação."))) return;
    if (ep !== epoca) return;
    botoes([["Ver o resultado", function () { abrirResultado(S); botoesFim(); }], ["Revisar respostas", function () { abrirRespostas(S, true); botoesFim(); }, "ghost"], ["Recomeçar", function () { recomecar(); }, "ghost"]]);
    abrirResultado(S);
    botoesFim();
  }
  function botoesFim() {
    botoes([["Ver o resultado", function () { abrirResultado(S); botoesFim(); }], ["Revisar respostas", function () { abrirRespostas(S, true); botoesFim(); }, "ghost"], ["Falar com a equipe técnica", function () { W.open(linkWhats(S), "_blank", "noopener"); botoesFim(); }, "ghost"], ["Recomeçar", function () { recomecar(); }, "ghost"]]);
  }

  function voltar() {
    var r = PB.caminhoPerguntas(S); if (!r.feitas.length) return;
    delete S.a[r.feitas[r.feitas.length - 1]]; S.fim = false; render(true);
  }
  function recomecar() {
    abrirModal("confirmModal");
  }
  function recomecarConfirmado() {
    fecharModais(); S.a = {}; S.fim = false; lsDel(K_ESTADO); abrirChat._iniciado = true; epoca++;
    msgs.innerHTML = ""; INTRO.forEach(function (h) { balao(h); });
    if (S.nomeOk) balao(S.nome ? esc(S.nome) : "Prefiro não informar", "user");
    render(false);
  }

  /* ---------------- Resultado (HTML único para tela e PDF) ---------------- */
  function fonteLinks(f) {
    return (f || []).filter(function (k) { return PB.FONTES[k]; }).map(function (k) { var x = PB.FONTES[k]; return "<a href='" + esc(x.u) + "' target='_blank' rel='noopener noreferrer'>" + esc(x.t) + "</a>"; }).join("; ");
  }
  function base(f, disp) { var l = fonteLinks(f); return (disp || l) ? "<div class='base'><strong>Base:</strong> " + esc(disp || "") + (l ? (disp ? " — " : "") + l : "") + "</div>" : ""; }
  function contarDocs(R) { return R.docs.length; }

  function htmlResultado(S, R, codigo) {
    var E = PB.ESTADOS[R.estado] || { t: "", c: "info" };
    var h = "<div class='res-head est-" + E.c + "'><div class='res-badge'>" + esc(E.t) + "</div><h4>" + esc(R.titulo) + "</h4><p>" + esc(R.resumo) + "</p></div>";
    if (R.classif.length) h += "<dl class='classif'>" + R.classif.map(function (c) { return "<div><dt>" + esc(c.rot) + "</dt><dd>" + esc(c.v) + "</dd></div>"; }).join("") + "</dl>";
    if (R.checks.length) h += "<section><h5>Verificação dos caminhos</h5><ul class='checks'>" + R.checks.map(function (c) { var e = PB.ESTADOS[c.estado] || {}; return "<li class='est-" + (e.c || "info") + "'><span class='ck-badge'>" + esc(c.rot) + "</span><strong>" + esc(c.nome) + "</strong><span class='ck-t'>" + esc(c.t) + "</span></li>"; }).join("") + "</ul></section>";
    if (R.faltam.length) h += "<section class='box wait'><h5>O que ainda falta saber (pode mudar o resultado)</h5><ul>" + R.faltam.map(function (t) { return "<li>" + esc(t.charAt(0).toUpperCase() + t.slice(1)) + "</li>"; }).join("") + "</ul></section>";
    if (R.pend.length) h += "<section class='box wait'><h5>Pontos que dependem de esclarecimento oficial</h5><ul>" + R.pend.map(function (p) { return "<li>" + esc(PB.PENDENCIAS[p] || p) + "</li>"; }).join("") + "</ul></section>";
    if (R.afirm.length) h += "<section><h5>O que dizem as normas</h5><ul class='afirm'>" + R.afirm.map(function (a) { return "<li>" + esc(a.t) + base(a.f, a.disp) + "</li>"; }).join("") + "</ul></section>";
    if (R.alertas.length) h += "<section><h5>Atenção</h5><ul class='alertas'>" + R.alertas.map(function (a) { return "<li class='al-" + a.nivel + "'>" + esc(a.t) + base(a.f, a.disp) + "</li>"; }).join("") + "</ul></section>";
    if (R.docs.length) {
      var grupos = []; R.docs.forEach(function (d) { if (grupos.indexOf(d.grupo) < 0) grupos.push(d.grupo); });
      var ORD = { exigido: 1, condicionado: 2, a_confirmar: 3, recomendado: 4 };
      h += "<section><h5>Documentos (" + R.docs.length + ")</h5><p class='hint'>Cada item mostra por que entrou na lista. “Exigido neste caminho” vale para o caminho indicado no título do grupo.</p>";
      grupos.forEach(function (g) {
        var it = R.docs.filter(function (d) { return d.grupo === g; }).sort(function (a, b) { return ORD[a.classe] - ORD[b.classe]; });
        h += "<div class='doc-grupo'><h6>" + esc(g) + "</h6>" + it.map(function (d) {
          var x = PB.DOCS[d.id] || { t: d.id, d: "" }; var cl = PB.CLASSES[d.classe] || { t: d.classe };
          var mods = (x.m || []).map(function (k) { var mm = PB.MODELOS[k]; return mm ? "<a class='modelo' href='" + esc(mm.u) + "' target='_blank' rel='noopener noreferrer'>Modelo oficial: " + esc(mm.t) + "</a>" : ""; }).join("");
          return "<article class='doc c-" + d.classe + "'><div class='doc-top'><strong>" + esc(x.t) + "</strong><span class='doc-cl'>" + esc(cl.t) + "</span></div><p>" + esc(x.d) + "</p>" + (d.motivos.length ? "<p class='motivo'><strong>Motivo:</strong> " + esc(d.motivos.join("; ")) + "</p>" : "") + base(x.f, x.disp) + mods + "</article>";
        }).join("") + "</div>";
      });
      h += "</section>";
    }
    if (R.prazos.length) h += "<section><h5>Prazos</h5><ul class='prazos'>" + R.prazos.map(function (p) { return "<li><strong>" + esc(p.rot) + ":</strong> " + esc(p.t) + base(p.f, p.disp) + "</li>"; }).join("") + "</ul></section>";
    var mods = R.modelos.filter(function (k) { return !R.docs.some(function (d) { return ((PB.DOCS[d.id] || {}).m || []).indexOf(k) >= 0; }); });
    if (mods.length) h += "<section><h5>Modelos oficiais do CBMPB</h5><ul>" + mods.map(function (k) { var m = PB.MODELOS[k]; return "<li><a href='" + esc(m.u) + "' target='_blank' rel='noopener noreferrer'>" + esc(m.t) + "</a></li>"; }).join("") + "</ul></section>";
    if (R.proximo.length) h += "<section class='box ok'><h5>Próximo passo</h5><ol>" + R.proximo.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ol></section>";
    h += "<footer class='res-foot'><p><strong>Orientação inicial.</strong> Não é certificado, não é aprovação e não substitui a análise do Corpo de Bombeiros Militar da Paraíba nem do responsável técnico. Os documentos exigidos podem variar conforme as características do imóvel e a análise do CBMPB.</p>" +
      "<p>Regras " + esc(R.versao) + " · normas conferidas até " + esc(PB.VERSAO.corte) + (PB.CONTATO.validacaoTecnica !== "validada" ? " · conteúdo em validação técnica" : "") + " · gerado em " + esc(agora()) + "</p>" +
      (codigo ? "<p class='codigo'>Código do questionário: <code>" + esc(codigo) + "</code></p>" : "") + "</footer>";
    return h;
  }

  var ultimo = null;
  function abrirResultado(St, viaCodigo) {
    var R = PB.avaliar(St), cod = PB.codificar(St);
    ultimo = { S: St, R: R, cod: cod };
    $("#resultTitle").textContent = "Resultado da simulação (" + contarDocs(R) + " documento" + (contarDocs(R) === 1 ? "" : "s") + ")";
    $("#resultBody").innerHTML = (viaCodigo ? "<p class='hint'>Resultado reaberto pelo código do questionário, com as regras de " + esc(R.versao) + ".</p>" : "") + htmlResultado(St, R, cod);
    $("#resultEdit").hidden = !!viaCodigo && !abrirChat._iniciado;
    abrirModal("resultModal");
  }

  function abrirRespostas(St, editavel) {
    var r = PB.caminhoPerguntas(St), b = $("#answersBody");
    b.innerHTML = "";
    if (St.nome) b.appendChild(el("div", "ans", "<span class='ans-q'>Nome</span><span class='ans-v'>" + esc(St.nome) + "</span>"));
    r.feitas.forEach(function (id) {
      var p = PB.P[id], v = St.a[id];
      var row = el("div", "ans" + (v === "?" ? " ans-ns" : ""), "<span class='ans-q'>" + esc(p.q) + "</span><span class='ans-v'>" + esc(PB.rotuloResposta(id, v)) + "</span>");
      if (editavel) { var bt = el("button", "btn-link", "Alterar"); bt.type = "button"; bt.addEventListener("click", function () { if (!abrirChat._iniciado) { abrirChat._iniciado = true; } S.a = JSON.parse(JSON.stringify(St.a)); S._termosSessao = TERMOS_VERSAO; S.nomeOk = true; abrirChat(); alterar(id); }); row.appendChild(bt); }
      b.appendChild(row);
    });
    var nao = PB.PERGUNTAS.filter(function (p) { return r.feitas.indexOf(p.id) < 0 && p.when(St); });
    if (nao.length) b.appendChild(el("p", "hint", "Perguntas ainda não respondidas: " + nao.map(function (p) { return esc(p.q); }).join(", ") + "."));
    b.appendChild(el("p", "hint", "Perguntas que não aparecem aqui não se aplicaram às suas respostas. Ao alterar uma resposta, as perguntas que dependiam dela são refeitas."));
    abrirModal("answersModal");
  }

  /* ---------------- WhatsApp, QR, PDF ---------------- */
  function linkResultado(cod) { return PB.CONTATO.chatbot + "?codigo=" + encodeURIComponent(cod); }
  function linkWhats(St) {
    var R = PB.avaliar(St), cod = PB.codificar(St);
    var obj = PB.rotuloResposta("obj", St.a.obj);
    var ativ = St.a.ativ && St.a.ativ !== "?" ? PB.rotuloResposta("ativ", St.a.ativ) : "";
    var t = "Olá! " + (St.nome ? "Sou " + St.nome + ". " : "") + "Fiz a simulação de AVCB da Paraíba no site avcbparaiba.com.br.\n" +
      "Objetivo: " + obj + "\n" + (St.a.mun && St.a.mun !== "?" ? "Município: " + St.a.mun + "\n" : "") + (ativ ? "Atividade: " + ativ + "\n" : "") +
      "Resultado: " + R.titulo + "\n" + (R.faltam.length ? "Falta saber: " + R.faltam.join(", ") + "\n" : "") + "Resultado completo: " + linkResultado(cod);
    return "https://wa.me/" + PB.CONTATO.whatsapp + "?text=" + encodeURIComponent(t);
  }
  function qrSvg(texto, cel) {
    try { var q = W.qrcode(0, "M"); q.addData(texto, "Byte"); q.make(); return q.createSvgTag({ cellSize: cel || 3, margin: 2, scalable: true }); } catch (e) { return "<p class='hint'>Não foi possível gerar o QR Code.</p>"; }
  }
  function abrirQR() {
    if (!ultimo) return;
    $("#qrRes").innerHTML = qrSvg(linkResultado(ultimo.cod), 3);
    $("#qrWpp").innerHTML = qrSvg("https://wa.me/" + PB.CONTATO.whatsapp, 4);
    abrirModal("qrModal");
  }
  function gerarPDF() {
    if (!ultimo) return;
    var R = ultimo.R, St = ultimo.S, cod = ultimo.cod;
    var css = $("#printCss").textContent;
    var resp = PB.caminhoPerguntas(St).feitas.map(function (id) { return "<tr><td>" + esc(PB.P[id].q) + "</td><td>" + esc(PB.rotuloResposta(id, St.a[id])) + "</td></tr>"; }).join("");
    var html = "<!doctype html><html lang='pt-BR'><head><meta charset='utf-8'><title>AVCB Paraíba — orientação " + esc(cod.slice(0, 14)) + "</title><style>" + css + "</style></head><body>" +
      "<header class='p-head'><img src='" + new URL("assets/logo-sme-print.png", location.href).href + "' alt='Sá Moraes Engenharia'><div><h1>Orientação para regularização no Corpo de Bombeiros da Paraíba</h1><p>Simulação gerada em " + esc(agora()) + (St.nome ? " para " + esc(St.nome) : "") + "</p></div></header>" +
      "<div class='p-aviso'>Documento de orientação da Sá Moraes Engenharia. <strong>Não é certificado nem documento do CBMPB.</strong></div>" +
      htmlResultado(St, R, cod) +
      "<section class='p-resp'><h5>Respostas informadas</h5><table>" + resp + "</table></section>" +
      "<section class='p-qr'><div>" + qrSvg(linkResultado(cod), 2) + "<span>Abrir este resultado</span></div><div>" + qrSvg("https://wa.me/" + PB.CONTATO.whatsapp, 2) + "<span>Falar com a equipe técnica — WhatsApp " + esc(PB.CONTATO.whatsappTexto) + "</span></div></section>" +
      "</body></html>";
    var f = el("iframe"); f.setAttribute("aria-hidden", "true"); f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
    D.body.appendChild(f);
    var d = f.contentWindow.document; d.open(); d.write(html); d.close();
    setTimeout(function () { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) { toast("Não foi possível abrir a impressão. Use Ctrl+P."); } setTimeout(function () { if (f.parentNode) f.parentNode.removeChild(f); }, 60000); }, 450);
  }
  function copiar(t) {
    if (navigator.clipboard && W.isSecureContext) return navigator.clipboard.writeText(t).then(function () { return true; }, function () { return copiaVelha(t); });
    return Promise.resolve(copiaVelha(t));
  }
  function copiaVelha(t) { try { var a = el("textarea"); a.value = t; a.style.cssText = "position:fixed;opacity:0"; D.body.appendChild(a); a.select(); var ok = D.execCommand("copy"); D.body.removeChild(a); return ok; } catch (e) { return false; } }

  /* ---------------- Fontes e termos ---------------- */
  function montarFontes() {
    var b = $("#sourcesBody"); if (!b || b.dataset.ok) return; b.dataset.ok = 1;
    var lst = Object.keys(PB.FONTES).map(function (k) { var f = PB.FONTES[k]; return "<li><a href='" + esc(f.u) + "' target='_blank' rel='noopener noreferrer'>" + esc(f.t) + "</a>" + (f.conf === "P" ? " <span class='tag'>conferida no PDF em " + esc(PB.VERSAO.corte) + "</span>" : "") + "</li>"; }).join("");
    var mod = Object.keys(PB.MODELOS).map(function (k) { var f = PB.MODELOS[k]; return "<li><a href='" + esc(f.u) + "' target='_blank' rel='noopener noreferrer'>" + esc(f.t) + "</a></li>"; }).join("");
    b.innerHTML = "<p>O chatbot segue a Lei Estadual nº 9.625/2011 e as normas técnicas, resoluções e portarias do Corpo de Bombeiros Militar da Paraíba. Normas conferidas até " + esc(PB.VERSAO.corte) + ". Confira sempre a versão vigente no portal do CBMPB.</p><h5>Normas e atos</h5><ul class='fontes'>" + lst + "</ul><h5>Modelos oficiais</h5><ul class='fontes'>" + mod + "</ul>";
  }

  /* ---------------- Modais ---------------- */
  var pilha = [];
  function abrirModal(id) {
    if (id === "sourcesModal") montarFontes();
    var m = $("#" + id); if (!m) return;
    pilha.push({ id: id, foco: D.activeElement });
    m.hidden = false; requestAnimationFrame(function () { m.classList.add("on"); });
    var f = $(".modal-close", m) || $("button", m); if (f) setTimeout(function () { f.focus(); }, 30);
  }
  function fecharModal() {
    var t = pilha.pop(); if (!t) return;
    var m = $("#" + t.id); m.classList.remove("on"); m.hidden = true;
    if (t.foco && t.foco.focus) t.foco.focus();
  }
  function fecharModais() { while (pilha.length) fecharModal(); }

  /* ---------------- Inicialização ---------------- */
  D.addEventListener("DOMContentLoaded", function () {
    msgs = $("#chatMessages"); opts = $("#chatOptions"); form = $("#chatForm"); inp = $("#chatInput");
    if (EMBED) D.documentElement.classList.add("chat-embed");
    if (EMBED || MOBILE) D.documentElement.classList.add("chat-full");
    $("#chatLaunchBtn").addEventListener("click", abrirChat);
    D.addEventListener("click", function (e) { var a = e.target.closest && e.target.closest("[data-abre]"); if (a) { e.preventDefault(); abrirModal(a.dataset.abre + "Modal"); } });
    $("#btnFechar").addEventListener("click", fecharChat);
    $("#btnVoltar").addEventListener("click", voltar);
    $("#btnRecomecar").addEventListener("click", recomecar);
    $("#btnFontes").addEventListener("click", function () { abrirModal("sourcesModal"); });
    $("#confirmSim").addEventListener("click", recomecarConfirmado);
    $("#confirmNao").addEventListener("click", fecharModal);
    $$(".modal-close").forEach(function (b) { b.addEventListener("click", fecharModal); });
    $$(".modal").forEach(function (m) { m.addEventListener("click", function (e) { if (e.target === m) fecharModal(); }); });
    D.addEventListener("keydown", function (e) { if (e.key === "Escape") { if (pilha.length) fecharModal(); else if (!$("#chatPanel").hidden && !MOBILE && !EMBED) fecharChat(); } });
    $("#resultPdf").addEventListener("click", gerarPDF);
    $("#resultCopy").addEventListener("click", function () { if (!ultimo) return; copiar(ultimo.cod).then(function (ok) { toast(ok ? "Código copiado." : "Não foi possível copiar. Selecione o código no fim do resultado."); }); });
    $("#resultAnswers").addEventListener("click", function () { if (ultimo) abrirRespostas(ultimo.S, true); });
    $("#resultQr").addEventListener("click", abrirQR);
    $("#resultWpp").addEventListener("click", function () { if (ultimo) W.open(linkWhats(ultimo.S), "_blank", "noopener"); });
    $("#resultEdit").addEventListener("click", function () { fecharModais(); if (!abrirChat._iniciado || $("#chatPanel").hidden) abrirChat(); });
    $("#limparDados").addEventListener("click", function () { lsDel(K_ESTADO); lsDel(K_TERMOS); S.a = {}; S.nome = ""; S.nomeOk = false; S._termosSessao = null; toast("Dados apagados deste navegador."); fecharModais(); abrirChat._iniciado = false; if (!$("#chatPanel").hidden) { abrirChat._iniciado = true; iniciar(); } });
    $("#docCodeBtn").addEventListener("click", function () {
      var r = PB.decodificar($("#docCodeInput").value);
      if (!r.ok) { toast(r.erro); $("#docCodeInput").setAttribute("aria-invalid", "true"); return; }
      $("#docCodeInput").removeAttribute("aria-invalid"); abrirResultado(r.S, true);
    });
    $("#docCodeInput").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); $("#docCodeBtn").click(); } });
    var qs = new URLSearchParams(location.search).get("codigo");
    if (qs) { var r = PB.decodificar(qs); if (r.ok) abrirResultado(r.S, true); else toast(r.erro); }
    else if (EMBED || MOBILE || /[?&#](iniciar|chat)\b/.test(location.search + location.hash)) abrirChat();
  });

  PB._teste = { S: S, render: render, responder: responder, abrirResultado: abrirResultado };
})(window, document);

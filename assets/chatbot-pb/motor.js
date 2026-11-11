/* =====================================================================
   AVCB Paraíba — motor de avaliação (função pura: respostas → avaliação)
   Regras REG-01…REG-14 da especificação "teste 2". Princípios:
   - "não sei" ou "não respondido" nunca vira "não";
   - divergência entre fontes não é resolvida escolhendo uma versão:
     o resultado fica "a confirmar", com o motivo;
   - referência: NT 07/2024 (com as alterações da Portaria 042/2024); a versão de 2023 não é considerada.
   ===================================================================== */
(function (W) {
  "use strict";
  var PB = W.PB = W.PB || {};

  function has(S, k) { return Object.prototype.hasOwnProperty.call(S.a, k); }
  function val(S, k) { return S.a[k]; }
  function known(S, k) { return has(S, k) && S.a[k] !== "?"; }
  function num(S, k) { var x = S.a[k]; return typeof x === "number" ? x : null; }
  function inArr(S, k, x) { var a = S.a[k]; return Array.isArray(a) && a.indexOf(x) >= 0; }
  function fmt(n) { return String(n).replace(".", ","); }

  function novoR(S) {
    return { obj: S.a.obj, titulo: "", estado: "", resumo: "", checks: [], classif: [], afirm: [], faltam: [], pend: [], alertas: [], docs: [], prazos: [], modelos: [], proximo: [], cam: "" };
  }
  function pend(R, id) { if (R.pend.indexOf(id) < 0) R.pend.push(id); }
  function falta(R, t) { if (R.faltam.indexOf(t) < 0) R.faltam.push(t); }
  function afirm(R, t, f, disp) { R.afirm.push({ t: t, f: f || [], disp: disp || "" }); }
  function alerta(R, t, f, disp, nivel) { R.alertas.push({ t: t, f: f || [], disp: disp || "", nivel: nivel || "info" }); }
  function prazo(R, rot, t, f, disp) { R.prazos.push({ rot: rot, t: t, f: f || [], disp: disp || "" }); }
  function modelo(R, k) { if (R.modelos.indexOf(k) < 0) R.modelos.push(k); }
  var ORD = { exigido: 1, condicionado: 2, a_confirmar: 3, recomendado: 4 };
  function doc(R, id, classe, motivo, grupo) {
    for (var i = 0; i < R.docs.length; i++) if (R.docs[i].id === id) {
      var d = R.docs[i];
      if (ORD[classe] < ORD[d.classe]) d.classe = classe;
      if (motivo && d.motivos.indexOf(motivo) < 0) d.motivos.push(motivo);
      return;
    }
    R.docs.push({ id: id, classe: classe, motivos: motivo ? [motivo] : [], grupo: grupo || "Documentos gerais" });
    var m = (PB.DOCS[id] || {}).m; if (m) m.forEach(function (k) { modelo(R, k); });
  }

  /* ---------------- Pavimentos efetivos ---------------- */
  function pavEfetivo(S) {
    var p = num(S, "pav");
    if (p === null) return { v: null, falta: "número de pavimentos" };
    var extra = 0, incerto = null;
    var mez = val(S, "mez");
    if (mez === "sim") extra++; else if ((mez === "?" || !has(S, "mez")) && p <= 3) incerto = "mezanino maior que 1/3 do andar";
    var sub = val(S, "sub");
    if (sub === "outro") extra++; else if ((sub === "?" || !has(S, "sub")) && p + extra === 3) incerto = incerto || "uso do subsolo";
    var v = p + extra;
    if (incerto && v === 3) return { v: null, falta: incerto };
    return { v: v };
  }

  function produtos(S) {
    var p = val(S, "prod");
    if (!has(S, "prod") || p === "?") return null;
    if (Array.isArray(p) && p[0] === "nenhum") return [];
    return p;
  }

  function nomeProduto(S, x) {
    if (x === "glp") { var kg = { ate13: "até 13 kg", "14a190": "de 14 a 190 kg", mais190: "mais de 190 kg" }[val(S, "glp_kg")]; return "GLP" + (kg ? " (" + kg + ")" : ""); }
    if (x === "liq") { var l = { ate1000: "até 1.000 L", mais1000: "mais de 1.000 L" }[val(S, "liq_l")]; return "líquidos inflamáveis ou combustíveis" + (l ? " (" + l + ")" : ""); }
    return { gn: "gás natural encanado", gnv: "GNV", fogos: "fogos de artifício", perig: "outros produtos perigosos" }[x] || x;
  }

  /* ---------------- REG-05 / REG-06: PTS ---------------- */
  function avaliaPTS(S, div) {
    var r = { estado: "", excl: [], divg: [], falta: [], rt02: false };
    var area = num(S, "area");
    var pe = pavEfetivo(S);
    if (area !== null && area > 930) r.excl.push("área construída acima de 930 m² (NT 07, item 8.1.1 — sem contar banheiros, vestiários, piscinas, reservatórios, escadas enclausuradas, beirais e telheiros ou passagens abertas)");
    if (pe.v !== null && pe.v > 3) r.excl.push("mais de 3 pavimentos (NT 07, item 8.1.2)");
    if (val(S, "pub") === "mais100") r.excl.push("local de reunião de público com mais de 100 pessoas (NT 07, itens 8.1.4 e 8.1.8)");
    if (div === "H-2") r.excl.push("asilo ou local de cuidados especiais: ocupantes com mobilidade reduzida (NT 07, item 8.1.5; interpretação do responsável técnico)");
    else if (div === "E-5") r.excl.push("creche ou pré-escola: crianças pequenas, com mobilidade dependente de adultos (NT 07, item 8.1.5; interpretação do responsável técnico)");
    else if (PB.vulnDerivado(S) || val(S, "vuln") === "sim") r.excl.push("público com predominância de idosos, crianças ou pessoas com dificuldade de locomoção (NT 07, itens 8.1.5 e 8.1.9)");
    if (val(S, "abert") === "sim") r.excl.push("abertura para o interior de edificação vizinha (NT 07, itens 8.1.6 e 8.1.10)");

    if (area === null) r.falta.push("área construída");
    if (pe.v === null) r.falta.push(pe.falta);
    if (!["A-1", "A-2"].includes(div)) {
      if (!known(S, "pub")) r.falta.push("lotação de público");
      if (!PB.vulnDerivado(S) && !known(S, "vuln")) r.falta.push("tipo de público");
    }
    if (!known(S, "abert")) r.falta.push("aberturas para edificação vizinha");
    if (div === "?") r.falta.push("atividade do local");
    var prods = produtos(S);
    if (prods === null) r.falta.push("gás, combustíveis e produtos no local");
    else prods.forEach(function (x) {
      /* NT 07/2024, item 8.1.3: produtos admitidos até os limites dos subitens. */
      if (x === "gn") return; /* gás natural encanado: não impede o PTS (interpretação do responsável técnico, 06/11/2026) */
      if (x === "glp") { var g = val(S, "glp_kg"); if (g === "mais190") r.excl.push("GLP acima de 190 kg (NT 07, item 8.1.3.1)"); else if (!known(S, "glp_kg")) r.falta.push("quantidade de GLP"); return; }
      if (x === "liq") { var l = val(S, "liq_l"); if (l === "mais1000") r.excl.push("líquidos combustíveis acima de 1.000 L (NT 07, item 8.1.3.2)"); else if (!known(S, "liq_l")) r.falta.push("quantidade de líquidos"); return; }
      if (x === "fogos") { var f = val(S, "fogos_kg"); if (f === "mais4") r.excl.push("fogos de artifício acima de 4 kg ou fora das classes A e B (NT 07, item 8.1.3.3)"); else if (!known(S, "fogos_kg")) r.falta.push("quantidade de fogos"); return; }
      if (x === "perig") { r.excl.push("produtos radioativos, explosivos ou outros produtos perigosos (NT 07, item 8.1.3)"); return; }
      r.divg.push({ p: "P-04", t: "há " + nomeProduto(S, x) + " — a NT 07 não traz limite para esse produto no PTS" });
    });
    /* Abaixo de 200 m² e fora do Baixo Risco A: segue o PTS (interpretação do responsável técnico, 06/11/2026). */
    if (area !== null && area < 200) r.menor200 = true;
    if (val(S, "unid") === "sim") {
      var pt = val(S, "pred_tipo"), pc = val(S, "pred_cert");
      /* RT 02, II: certificação da unidade vinculada à do prédio. Vale também para prédio residencial ou misto,
         e sem AVCB válido do prédio o processo da unidade fica travado (interpretação do responsável técnico, 06/11/2026). */
      var predOk = ["comercial", "shopping", "residencial", "misto"].indexOf(pt) >= 0;
      if (predOk && pc === "valido") r.rt02 = true;
      else if (predOk && (pc === "vencido" || pc === "nao_tem")) { r.rt02 = true; r.travado = true; }
      else if (!known(S, "pred_tipo") || !known(S, "pred_cert")) r.falta.push("situação do prédio principal");
      else r.divg.push({ p: "P-05", t: "unidade em prédio " + ({ residencial: "residencial", misto: "misto", comercial: "comercial", shopping: "comercial" }[pt] || "") + (pc === "valido" ? "" : " sem certificado válido") + " — o tratamento depende da situação do prédio principal" });
    }
    if (r.excl.length) r.estado = "nao_se_aplica";
    else if (r.falta.length) r.estado = "a_confirmar_dado";
    else if (r.divg.length) r.estado = "a_confirmar_conflito";
    else r.estado = "provavel";
    return r;
  }

  /* ---------------- Baixo Risco A (nunca conclusivo) ---------------- */
  function avaliaBRA(S, div) {
    var r = { estado: "", excl: [], falta: [] };
    var area = num(S, "area");
    var pe = pavEfetivo(S);
    if (area !== null && area > 200) r.excl.push("área da atividade acima de 200 m² (NT 07, item 6.1.2)");
    if (pe.v !== null && pe.v > 3) r.excl.push("mais de 3 pavimentos (NT 07, item 6.1.2.1)");
    if (val(S, "pub") === "mais100") r.excl.push("lotação acima de 100 pessoas (NT 07, item 6.1.2.2)");
    if (PB.vulnDerivado(S) || val(S, "vuln") === "sim") r.excl.push("público de idosos, crianças ou pessoas com dificuldade de locomoção (NT 07, item 6.1.2.2)");
    if (val(S, "glp_kg") === "mais190") r.excl.push("GLP acima de 190 kg (NT 07, item 6.1.2.5)");
    if (val(S, "liq_l") === "mais1000") r.excl.push("líquidos acima de 1.000 L (NT 07, item 6.1.2.4)");
    if (val(S, "fogos_kg") === "mais4") r.excl.push("fogos acima de 4 kg ou fora das classes A e B (NT 07, item 6.1.2.6)");
    if (val(S, "sub") === "outro") r.excl.push("subsolo com uso diferente de estacionamento (NT 07, item 6.1.2.3; Resolução CGSIM 51, art. 4º, II, c)");
    if (area === null) r.falta.push("área construída");
    r.estado = r.excl.length ? "nao_se_aplica" : (r.falta.length ? "a_confirmar_dado" : "a_confirmar_conflito");
    return r;
  }

  /* ---------------- REG-07: PCIS ---------------- */
  var SIST_BLOQ = { hidr: "hidrantes ou mangotinhos", alarme: "alarme de incêndio", detec: "detecção de incêndio", sprk: "chuveiros automáticos", spda: "para-raios (SPDA)", pressur: "escada pressurizada ou sistema especial" };
  function avaliaPCIS(S, div) {
    var r = { estado: "", excl: [], falta: [] };
    var areaT = val(S, "unid") === "sim" ? num(S, "area_pred") : num(S, "area");
    var p = num(S, "pav");
    var alt = p === 1 ? 0 : num(S, "alt");
    if (areaT !== null && areaT > 930) r.excl.push("área total acima de 930 m² (NT 11, item 5.1.5.1.1)");
    if (alt !== null && alt > 12) r.excl.push("altura acima de 12 m (NT 11, item 5.1.5.1.2)");
    if (["2est", "outro"].includes(val(S, "sub"))) r.excl.push("mais de um subsolo ou subsolo com outro uso (NT 11, item 5.1.5.1.7)");
    if (div !== "?" && PB.PCIS_DIVS.indexOf(div) < 0) r.excl.push("a ocupação " + div + " não está na lista do PCIS (NT 11, item 5.1.5.1.4)");
    var s = val(S, "sist");
    if (Array.isArray(s)) Object.keys(SIST_BLOQ).forEach(function (k) { if (s.indexOf(k) >= 0) r.excl.push("possui " + SIST_BLOQ[k] + " (NT 11, item 5.1.5.1.5)"); });
    if (val(S, "glp_tipo") === "central") r.excl.push("possui central de GLP (NT 11, item 5.1.5.1.5)");
    if (val(S, "glp_uso") === "revenda" || S.a.ativ === "revenda_glp") r.excl.push("revenda de GLP (NT 11, item 5.1.5.2.8)");
    var prods = produtos(S);
    if (prods && (prods.indexOf("liq") >= 0 || prods.indexOf("fogos") >= 0 || prods.indexOf("perig") >= 0)) r.excl.push("combustíveis, inflamáveis ou explosivos (NT 11, item 5.1.5.2.8)");
    if (areaT === null) r.falta.push(val(S, "unid") === "sim" ? "área total do prédio" : "área construída");
    if (alt === null) r.falta.push("altura da edificação");
    if (!known(S, "sub")) r.falta.push("subsolo");
    if (div === "?") r.falta.push("atividade do local");
    if (!Array.isArray(s)) r.falta.push("sistemas existentes");
    r.estado = r.excl.length ? "nao_se_aplica" : (r.falta.length ? "a_confirmar_dado" : "possivel");
    return r;
  }

  /* ---------------- Classificação informativa ---------------- */
  function classificacao(S, R, div) {
    if (div && div !== "?") R.classif.push({ rot: "Ocupação provável (NT 04, Tabela 1)", v: "Grupo " + div.charAt(0) + ", divisão " + div + " — " + (PB.DIVISOES[div] || "") });
    else R.classif.push({ rot: "Ocupação", v: "não informada — a classificação é feita no projeto (NT 04, Tabela 1)" });
    var p = num(S, "pav"), a = num(S, "alt");
    var tipo = null;
    if (p === 1) tipo = "Tipo I — edificação térrea";
    else if (a !== null) tipo = a <= 6 ? "Tipo II — edificação baixa (até 6 m)" : a <= 12 ? "Tipo III — baixa-média altura (6 a 12 m)" : a <= 23 ? "Tipo IV — média altura (12 a 23 m)" : a <= 30 ? "Tipo V — medianamente alta (23 a 30 m)" : "Tipo VI — alta (acima de 30 m)";
    if (tipo) R.classif.push({ rot: "Altura (NT 04, Tabela 2)", v: tipo });
    var ar = num(S, "area"); if (ar !== null) R.classif.push({ rot: val(S, "unid") === "sim" ? "Área da unidade" : "Área construída", v: fmt(ar) + " m²" });
    var ap = num(S, "area_pred"); if (ap !== null) R.classif.push({ rot: "Área do prédio principal", v: fmt(ap) + " m²" });
    if (S.a.mun && S.a.mun !== "?") R.classif.push({ rot: "Município", v: S.a.mun });
  }

  /* ---------------- Módulos de risco e interfaces ---------------- */
  function modulos(S, R, div) {
    var prods = produtos(S) || [];
    var s = Array.isArray(val(S, "sist")) ? val(S, "sist") : [];
    if (PB.DIVS_ESPECIAIS.indexOf(div) >= 0) alerta(R, "A ocupação " + div + " (" + PB.DIVISOES[div] + ") tem regras específicas e exige avaliação técnica própria.", ["nt04"], "NT 04, Tabela 1", "atencao");
    if (prods.indexOf("glp") >= 0) alerta(R, "Com GLP no local: use botijões com válvula de segurança, em local ventilado, com mangueira e registro certificados pelo INMETRO dentro da validade." + (val(S, "glp_tipo") === "central" ? " Central de GLP exige projeto e ART de instalação/manutenção e estanqueidade." : ""), ["nt07e"], "NT 07 (18 p.), itens 7.3.1–7.3.2");
    if (prods.indexOf("gn") >= 0) alerta(R, "Gás natural encanado não impede, por si só, o processo simplificado (PTS), desde que os demais requisitos do item 8.1 da NT 07 sejam atendidos. A instalação deve seguir a NT 35/2024 e as normas ABNT aplicáveis, com ART da rede e teste de estanqueidade.", ["nt35", "nt07e"], "NT 07, item 8.1; NT 35 (interpretação do responsável técnico)", "atencao");
    if (prods.indexOf("gnv") >= 0) alerta(R, "GNV: a instalação segue a NT 35, com ART da rede e teste de estanqueidade na vistoria. O efeito sobre o processo simplificado depende de confirmação.", ["nt35"], "NT 35", "atencao");
    if (prods.indexOf("liq") >= 0) alerta(R, "Líquidos inflamáveis/combustíveis: aplica-se a IT 25 do Corpo de Bombeiros de São Paulo, adotada pela RT 21, sempre na edição mais recente.", ["rt21"], "RT 21 (edição da IT 25: interpretação do responsável técnico)", "atencao");
    if (prods.indexOf("fogos") >= 0) alerta(R, "Fogos de artifício têm documentos próprios (inventário, prefeitura, Polícia Civil/Exército) e exigem avaliação técnica.", ["nt01f", "nt11"], "NT 11, itens 5.1.4.1.5.3 e 6.2.6–6.2.7", "atencao");
    if (prods.indexOf("perig") >= 0) alerta(R, "Produtos perigosos seguem a NT 31 e podem exigir licenças específicas (ex.: CNEN, Exército).", ["nt31"], "NT 31", "atencao");
    if (s.indexOf("fv") >= 0) alerta(R, "Placas solares: a RT 23 adota o Parecer Técnico CCB-003/800/24 (Corpo de Bombeiros de SP) para usinas fotovoltaicas. Em telhado de casa, loja ou galpão, a aplicação depende da quantidade de placas instaladas e de parecer técnico. Informe ao responsável técnico a quantidade e a potência do sistema.", ["rt23"], "RT 23, inciso I (aplicação a telhados: interpretação do responsável técnico)", "atencao");
    if (s.indexOf("save") >= 0) alerta(R, "Recarga de veículos elétricos: a NT 40/2025 tem regras próprias (desligamento, proteção elétrica, sinalização) e ART de conformidade do SAVE na vistoria.", ["nt40", "rt29"], "NT 40", "atencao");
    if (s.indexOf("subest") >= 0) alerta(R, "Subestação elétrica: a NT 25 define a proteção específica, que não depende só da área do imóvel.", ["nt25"], "NT 25", "atencao");
    if (s.indexOf("coifa") >= 0) alerta(R, "Cozinha profissional: a NT 32 trata de exaustão e, em alguns casos, sistema fixo de extinção.", ["nt32"], "NT 32");
    if (val(S, "exist") === "antes") alerta(R, "Edificação anterior a 24/06/2012: aplica-se também a NT 16 (adaptação de edificações existentes). Antiguidade não dispensa as medidas.", ["nt16", "nt04"], "NT 04, item 6.9; NT 16");
    var pt = val(S, "patr");
    if (pt && pt !== "nao" && pt !== "?") {
      var org = { federal: "IPHAN", estadual: "IPHAEP", municipal: "órgão municipal de patrimônio", entorno: "órgão de patrimônio responsável pela área" }[pt];
      alerta(R, "Imóvel protegido: aplica-se a NT 24, e intervenções dependem também do " + org + ". A aprovação do Corpo de Bombeiros não substitui essa anuência.", ["nt24"], "NT 24", "atencao");
      doc(R, "DOC-EXT-01", "exigido", "imóvel protegido (" + org + ")", "Outros órgãos");
    } else if (pt === "?") falta(R, "se o imóvel é tombado ou protegido");
    if (val(S, "lote") === "sim") alerta(R, "Mais de uma edificação no terreno: certificações separadas só são possíveis com isolamento de risco comprovado (RT 02, inciso I; RT 28; NT 20).", ["rt02", "rt28", "nt20"], "RT 02, I; RT 28; NT 20");
    if (val(S, "unid") === "sim" && val(S, "pred_cert") !== "valido" && !(["comercial", "shopping", "residencial", "misto"].indexOf(val(S, "pred_tipo")) >= 0 && ["vencido", "nao_tem"].indexOf(val(S, "pred_cert")) >= 0)) alerta(R, "Sua unidade depende da situação do prédio principal. Peça ao síndico ou à administração a situação do certificado do prédio.", ["rt02"], "RT 02", "atencao");
    if (val(S, "req") === "publico") afirm(R, "Órgãos e empresas públicas federais, estaduais e municipais estão entre as hipóteses de isenção de taxa (Lei 9.625, art. 41). Isenção de taxa não dispensa as medidas de segurança.", ["lei9625"], "Lei 9.625, art. 41");
    if (val(S, "req") === "mei") afirm(R, "Ser MEI não dispensa o cumprimento das medidas de segurança contra incêndio, e o local pode ser fiscalizado.", ["nt07e"], "NT 07, cap. 7");
    if (S.a.mun && S.a.mun !== "?") { alerta(R, "O alvará de funcionamento é emitido pela Prefeitura de " + S.a.mun + ", com regras próprias. Este atendimento cobre o Corpo de Bombeiros.", [], ""); doc(R, "DOC-EXT-03", "condicionado", "alvará da Prefeitura de " + S.a.mun, "Outros órgãos"); }
  }

  function docsVistoria(S, R, grupo, renov) {
    doc(R, "DOC-VIS-01", "exigido", renov ? "ART de manutenção na renovação (NT 11, 6.2.2.3)" : "ART de instalação na vistoria final (NT 11, 6.2.2.2)", grupo);
    doc(R, "DOC-VIS-02", "exigido", "mínimo para protocolar a vistoria (NT 11, 6.2.8)", grupo);
    if (!renov) doc(R, "DOC-VIS-03", "exigido", "projeto aprovado", grupo);
    var s = Array.isArray(val(S, "sist")) ? val(S, "sist") : [];
    var nomes = { hidr: "hidrantes", alarme: "alarme", detec: "detecção", sprk: "chuveiros automáticos", spda: "SPDA", pressur: "pressurização/controle de fumaça", gerador: "gerador", subest: "subestação", elev: "elevador", save: "recarga de veículos" };
    var lst = s.filter(function (x) { return nomes[x]; }).map(function (x) { return nomes[x]; });
    var prods = produtos(S) || [];
    if (prods.indexOf("glp") >= 0 || prods.indexOf("gn") >= 0 || prods.indexOf("gnv") >= 0) lst.push("instalação de gás (com teste de estanqueidade)");
    if (lst.length) doc(R, "DOC-VIS-04", "exigido", "sistemas informados: " + lst.join(", "), grupo);
    doc(R, "DOC-VIS-04", "condicionado", "instalações elétricas (NT 11, 6.2.2 d)", grupo);
    doc(R, "DOC-VIS-05", "condicionado", "se a NT 17 exigir brigada para a ocupação", grupo);
    doc(R, "DOC-VIS-09", "condicionado", "na hipótese da NT 23, item 8.3", grupo);
    if (prods.indexOf("fogos") >= 0 && ["comercio", "deposito"].includes(val(S, "fogos_at"))) doc(R, "DOC-VIS-07", "exigido", "comércio ou depósito de fogos", grupo);
    if (prods.indexOf("fogos") >= 0 && val(S, "fogos_at") === "uso") doc(R, "DOC-VIS-08", "exigido", "uso de fogos", grupo);
  }

  function docsPCI(S, R, classe, grupo, div) {
    ["DOC-PCI-01", "DOC-PCI-02", "DOC-PCI-03", "DOC-PCI-04", "DOC-PCI-05"].forEach(function (id) { doc(R, id, classe, "núcleo do projeto completo", grupo); });
    var s = Array.isArray(val(S, "sist")) ? val(S, "sist") : [];
    var prods = produtos(S) || [];
    if (val(S, "exist") === "antes") doc(R, "DOC-PCI-06", "exigido", "edificação anterior a 24/06/2012", grupo);
    else if (!known(S, "exist")) doc(R, "DOC-PCI-06", "condicionado", "se a edificação for anterior a 24/06/2012", grupo);
    if (s.indexOf("hidr") >= 0 || s.indexOf("sprk") >= 0) doc(R, "DOC-PCI-07", "exigido", "há hidrantes ou chuveiros automáticos", grupo);
    if (div.charAt(0) === "J") doc(R, "DOC-PCI-08", "exigido", "ocupação de depósito", grupo);
    if (div.charAt(0) === "F" || ["ate100", "mais100"].includes(val(S, "pub"))) doc(R, "DOC-PCI-09", "exigido", "local de reunião de público", grupo);
    if (val(S, "lote") === "sim") doc(R, "DOC-PCI-10", "condicionado", "se o projeto adotar isolamento de risco entre as edificações", grupo);
    if (s.indexOf("pressur") >= 0) doc(R, "DOC-PCI-11", "exigido", "há escada pressurizada ou controle de fumaça", grupo);
    if (prods.indexOf("fogos") >= 0 || prods.indexOf("perig") >= 0) doc(R, "DOC-PCI-12", "exigido", "fogos ou produtos controlados", grupo);
    if (prods.indexOf("perig") >= 0) doc(R, "DOC-PCI-13", "condicionado", "se houver fonte radioativa", grupo);
    doc(R, "DOC-PCI-14", "condicionado", "quando pedidas pelo setor de análise", grupo);
  }

  function docsPCIS(S, R, classe, grupo, div) {
    doc(R, "DOC-PCIS-01", classe, "projeto simplificado", grupo);
    if (["I-1", "I-2", "J-1", "J-2", "J-3"].includes(div)) doc(R, "DOC-PCIS-02", "exigido", "ocupação industrial ou de depósito no PCIS", grupo);
    doc(R, "DOC-PCIS-03", "condicionado", "se a análise de risco dispensar o SPDA", grupo);
  }

  /* Validade da inspeção pela NT 02/2023, Anexo B. */
  function anosTxt(rk) { var n = PB.RISCO_ANOS[rk]; return "até " + n + (n === 1 ? " ano" : " anos"); }
  function textoValidade(S) {
    var rn = PB.riscoNT02(S), d = rn.div, g = rn.grupo || (d ? d.charAt(0) : "");
    if (rn.risco) return anosTxt(rn.risco) + " — " + PB.RISCO_NOME[rn.risco] + " risco" + (d ? " (divisão " + d + ")" : "") + (rn.carga ? ", carga de incêndio " + PB.CARGA_NIVEIS[rn.carga] : "") + ", mantidas as manutenções";
    if (rn.falta === "nível de carga de incêndio") {
      if (g === "C") return "depende da carga de incêndio: até 5 anos (nível I) ou até 2 anos (níveis II e III)";
      return "depende da carga de incêndio: até 5 anos (nível I), até 2 anos (nível II) ou até 1 ano (nível III)";
    }
    if (d === "F-3") return "até 1 ano para estádio de futebol; até 2 anos para os demais centros esportivos";
    return "até 5 anos (baixo risco), 2 anos (médio) ou 1 ano (alto), conforme a ocupação, mantidas as manutenções";
  }

  function prazosPadrao(R) {
    prazo(R, "Análise do projeto", "até 30 dias da distribuição eletrônica, após o reconhecimento do pagamento, prorrogável uma vez; até 3 retornos para correção", ["lei9625", "nt11"], "Lei 9.625, art. 12; NT 11, item 5.2");
    prazo(R, "Realização da vistoria", "até 15 dias do protocolo, prorrogável uma única vez por igual período", ["nt11"], "NT 11, item 6.7.1");
    prazo(R, "Emissão após vistoria aprovada", "até 5 dias úteis da inspeção (LTV aprovado e AVCB)", ["lei9625"], "Lei 9.625, art. 15-A");
    prazo(R, "Validade do AVCB e do ACPS", "1 ano a partir da emissão", ["lei9625"], "Lei 9.625, art. 3º-A, § 1º");
  }

  /* ---------------- Regularização (reg/info) e alteração ---------------- */
  function avaliaImovel(S, R) {
    if (val(S, "res") === "so_casa") {
      R.cam = "CAM-02"; R.estado = "provavel";
      R.titulo = "Residência unifamiliar: fora das exigências do Código Estadual";
      R.resumo = "Residências exclusivamente unifamiliares estão excluídas das exigências do Código Estadual de Proteção contra Incêndio. Se funcionar alguma atividade de trabalho no imóvel, refaça a simulação informando a atividade.";
      afirm(R, "Estão excluídas das exigências do Código as residências exclusivamente unifamiliares.", ["lei9625"], "Lei 9.625, art. 7º, parágrafo único, I");
      R.proximo.push("Nenhum processo no Corpo de Bombeiros é necessário para a moradia de uma família. Mantenha boas condições de segurança (gás, instalações elétricas).");
      return;
    }
    var div = PB.divDe(S);
    classificacao(S, R, div);
    if (val(S, "res") === "mista") {
      if (val(S, "res_mista") === "sim") afirm(R, "A moradia unifamiliar no pavimento superior de edificação mista com até 2 pavimentos, com acesso independente e sem interligação, está fora das exigências do Código. A parte com atividade segue a análise abaixo.", ["lei9625"], "Lei 9.625, art. 7º, parágrafo único, II");
      else alerta(R, "Como a moradia não atende a todas as condições do art. 7º, parágrafo único, II, da Lei 9.625, a edificação tende a ser analisada como um todo — confirme com o responsável técnico.", ["lei9625"], "Lei 9.625, art. 7º, p.u., II", "atencao");
    }
    var pts = avaliaPTS(S, div), bra = avaliaBRA(S, div), pcis = avaliaPCIS(S, div);
    if (pts.menor200 && pts.estado !== "nao_se_aplica") alerta(R, "Área abaixo de 200 m²: se o imóvel não for Baixo Risco A, segue o processo simplificado (PTS). A NT 11 admite, nesses casos, dispensa de vistoria prévia pelo CBMPB.", ["nt11", "nt07e"], "NT 11, item 6.8.7 (interpretação do responsável técnico)", "info");

    /* Linhas de verificação */
    var EST = { provavel: "Provável", nao_se_aplica: "Não se aplica", a_confirmar_dado: "Faltam dados", a_confirmar_conflito: "A confirmar", possivel: "Possível" };
    var braTxt = bra.estado === "nao_se_aplica" ? bra.excl.join("; ") : bra.estado === "a_confirmar_dado" ? "falta: " + bra.falta.join(", ") : "pode ser Baixo Risco A: confirme se a atividade (CNAE) está classificada como baixo risco A na REDESIM; o CBMPB não emite documento para esse caso";
    R.checks.push({ nome: "Baixo Risco A (dispensa)", estado: bra.estado, rot: EST[bra.estado], t: braTxt });
    var ptsTxt = pts.estado === "nao_se_aplica" ? pts.excl.join("; ") : pts.estado === "a_confirmar_dado" ? "falta: " + pts.falta.join(", ") : pts.estado === "a_confirmar_conflito" ? pts.divg.map(function (d) { return d.t; }).join("; ") : "atende aos critérios do item 8.1 da NT 07/2024" + (pts.rt02 ? "; unidade dentro de prédio (RT 02)" : "");
    R.checks.push({ nome: "Processo Técnico Simplificado (PTS/ACPS)", estado: pts.estado, rot: EST[pts.estado], t: ptsTxt });
    var pcisTxt = pcis.estado === "nao_se_aplica" ? pcis.excl.join("; ") : pcis.estado === "a_confirmar_dado" ? "falta: " + pcis.falta.join(", ") : "atende aos limites de área, altura, subsolo e ocupação; depende dos sistemas exigidos pela NT 04, definidos no projeto";
    R.checks.push({ nome: "Projeto simplificado (PCIS)", estado: pcis.estado, rot: EST[pcis.estado], t: pcisTxt });
    pts.divg.forEach(function (d) { pend(R, d.p); });
    if (bra.estado === "a_confirmar_conflito") pend(R, "P-02");
    if (pcis.estado === "possivel") pend(R, "P-12");
    pts.falta.concat(pcis.falta).forEach(function (f) { falta(R, f); });

    /* Caminho principal */
    var ep = val(S, "etapa_proc");
    if (pts.estado === "provavel") {
      R.cam = "CAM-05"; R.estado = "provavel";
      R.titulo = pts.travado ? "Caminho provável: PTS da sala, que só anda depois do AVCB do prédio" : "Caminho provável: Processo Técnico Simplificado (PTS), com emissão do ACPS";
      R.resumo = "Pelos dados informados, o caso atende aos critérios do PTS da NT 07/2024 (item 8.1). O pedido é feito por formulário no sistema do CBMPB, sem projeto e sem vistoria prévia" + (pts.rt02 ? ", mas, por ser unidade dentro de um prédio, a RT 02 prevê vistoria e certificação vinculada à do prédio" : "") + ". As medidas de segurança da NT 04 continuam obrigatórias.";
      afirm(R, "As edificações enquadradas no PTS são dispensadas de vistoria prévia e de apresentação de projeto para obter o Auto de Conformidade de Processo Simplificado (ACPS), mas devem instalar e manter as medidas de segurança.", ["nt07e"], "NT 07, itens 8.2–8.3 e 9.1");
      afirm(R, "Para o ACPS não são mais exigidos PCI aprovado nem ART/RRT de execução (itens 8.4, 8.5 e 10.2 revogados pela Portaria 042/2024).", ["nt07e", "an0124"], "NT 07, itens 8.4, 8.5 e 10.2");
      doc(R, "DOC-PTS-01", "exigido", "enquadramento provável em PTS", "Processo Técnico Simplificado (PTS)");
      afirm(R, "Taxa de emissão do ACPS: 1,0 UFR-PB para área até 930 m²" + (val(S, "req") === "mei" ? "; o MEI é isento de taxas (NT 07, item 7.1)." : "."), ["lei9625", "nt07e"], "Lei 9.625, art. 38, I (redação da Lei 12.678/2023)");
      if (pts.rt02) { afirm(R, "Salas enquadradas no PTS dentro de edificação comercial/empresarial ficam sujeitas a vistoria, com certificação vinculada à do prédio. O mesmo vale para loja ou sala em prédio residencial ou misto.", ["rt02"], "RT 02, inciso II (extensão a prédio residencial/misto: interpretação do responsável técnico)"); docsVistoria(S, R, "Vistoria da unidade (RT 02)", false); }
      if (pts.travado) {
        alerta(R, "O prédio está " + (val(S, "pred_cert") === "vencido" ? "com o AVCB vencido" : "sem AVCB") + ". A certificação da sala é vinculada à do prédio: o processo da sala fica travado até o condomínio obter o AVCB.", ["rt02"], "RT 02, inciso II (interpretação do responsável técnico)", "atencao");
        R.proximo.push("Peça ao síndico ou à administração a regularização do AVCB do prédio. O ACPS da sala só sai depois disso.");
      }
      R.proximo.push("Confirme o enquadramento com o responsável técnico e faça o pedido do PTS no sistema do CBMPB.");
      R.proximo.push("Instale e mantenha as medidas de segurança (extintores, sinalização, iluminação, saídas) conforme a NT 04.");
    } else if (pts.estado === "nao_se_aplica") {
      if (pcis.estado === "nao_se_aplica") {
        R.cam = "CAM-09"; R.estado = "provavel";
        R.titulo = "Caminho provável: projeto completo (PCI), vistoria e AVCB";
        R.resumo = "O PTS não se aplica (" + pts.excl[0] + ") e o projeto simplificado (PCIS) também não (" + pcis.excl[0] + "). O caminho é o projeto completo (PCI), seguido da instalação das medidas, vistoria e emissão do AVCB.";
        docsPCI(S, R, "exigido", "Projeto completo (PCI)", div);
      } else {
        R.cam = "CAM-08"; R.estado = pcis.estado === "possivel" ? "provavel" : "a_confirmar_dado";
        R.titulo = "Caminho provável: projeto (PCIS ou PCI), vistoria e AVCB";
        R.resumo = "O PTS não se aplica (" + pts.excl[0] + "). " + (pcis.estado === "possivel" ? "O projeto simplificado (PCIS) pode ser possível; a escolha entre PCIS e PCI depende dos sistemas exigidos pela NT 04, definidos pelo responsável técnico." : "Faltam dados para saber se cabe o projeto simplificado (PCIS) ou o completo (PCI).");
        docsPCIS(S, R, "exigido", "Se for projeto simplificado (PCIS)", div);
        docsPCI(S, R, "exigido", "Se for projeto completo (PCI)", div);
      }
      afirm(R, "Os processos de análise de projeto são PCI, PCIS, PTIOT e PTOTEP; o PCIS tem limites de área (930 m²), altura (12 m), subsolo e ocupação.", ["nt11"], "NT 11, itens 5.1.1 e 5.1.5");
      docsVistoria(S, R, "Depois do projeto aprovado: vistoria", false);
      R.proximo.push("Contrate um responsável técnico para elaborar o projeto e protocolar no sistema do CBMPB.");
      R.proximo.push("Depois da aprovação, instale as medidas e peça a vistoria para emissão do AVCB.");
    } else {
      R.cam = "CAM-05"; R.estado = pts.estado;
      if (pts.estado === "a_confirmar_conflito") {
        R.titulo = "Enquadramento a confirmar: PTS ou projeto (PCIS/PCI)";
        R.resumo = "Não é possível concluir por aqui se o caso cabe no processo simplificado: " + pts.divg.map(function (d) { return d.t; }).join("; ") + ". Mostramos os documentos dos caminhos possíveis.";
      } else {
        R.titulo = "Faltam dados para indicar o caminho";
        R.resumo = "Para indicar o caminho, falta saber: " + pts.falta.join(", ") + ". Você pode voltar e responder, ou levar estas perguntas ao responsável técnico.";
      }
      afirm(R, "Pela NT 07/2024, o PTS exige: área construída até 930 m² (com os descontos do item 8.1.1); até 3 pavimentos (sem contar subsolo exclusivo de estacionamento); GLP até 190 kg, líquidos combustíveis até 1.000 L e fogos até 4 kg (classes A e B); local de reunião de público com até 100 pessoas; sem público de idosos, crianças ou pessoas com dificuldade de locomoção; sem aberturas para edificação vizinha.", ["nt07e"], "NT 07, item 8.1");
      afirm(R, "Os processos de análise de projeto são PCI, PCIS, PTIOT e PTOTEP; o PCIS tem limites de área (930 m²), altura (12 m), subsolo e ocupação.", ["nt11"], "NT 11, itens 5.1.1 e 5.1.5");
      doc(R, "DOC-PTS-01", "exigido", "pedido do ACPS", "Se for Processo Técnico Simplificado (PTS)");
      if (pcis.estado !== "nao_se_aplica") docsPCIS(S, R, "exigido", "Se for projeto simplificado (PCIS)", div);
      docsPCI(S, R, "exigido", "Se for projeto completo (PCI)", div);
      docsVistoria(S, R, "Se houver projeto: vistoria", false);
      R.proximo.push("Leve este resultado ao responsável técnico para confirmar o enquadramento com o CBMPB.");
    }
    if (bra.estado === "a_confirmar_conflito") {
      alerta(R, "O caso pode ser Baixo Risco A, que dispensa certificação, licenciamento e vistoria do CBMPB (NT 07, item 6.2). Não há documento do CBMPB para comprovar: a autodeclaração foi revogada pela Portaria 042/2024, e a dispensa decorre da classificação de risco da atividade (CNAE) na REDESIM. Se quiser um documento, pode pedir o ACPS pelo PTS (item 6.6), e a RT 04 isenta PCI e ART/RRT de execução. Mesmo dispensado, o local deve cumprir as medidas de segurança e pode ser fiscalizado (itens 6.3 e 6.4).", ["nt07e", "an0124", "rt04"], "NT 07, itens 6.2–6.6; Portaria 042/2024; RT 04", "atencao");
    }
    if (ep === "proj") { R.proximo.unshift("Com o projeto aprovado: instale as medidas previstas e peça a vistoria."); docsVistoria(S, R, "Próxima etapa: vistoria", false); }
    if (ep === "instalado") { R.proximo.unshift("Com as medidas instaladas: peça a vistoria no sistema do CBMPB."); docsVistoria(S, R, "Próxima etapa: vistoria", false); }
    doc(R, "DOC-GER-01", "recomendado", "pedidos feitos pelo sistema do CBMPB", "Documentos gerais");
    if (R.cam !== "CAM-05" || R.estado !== "provavel" || pts.rt02) doc(R, "DOC-GER-03", "exigido", val(S, "req") === "publico" ? "taxa ou prova de isenção (órgão público)" : "taxa de análise e de vistoria", "Documentos gerais");
    if (val(S, "proc") === "sim") doc(R, "DOC-GER-02", "exigido", "pedido feito por procurador", "Documentos gerais");
    modulos(S, R, div);
    prazosPadrao(R);
    prazo(R, "Validade da inspeção (renovações seguintes)", textoValidade(S), ["lei9625", "nt02"], "Lei 9.625, art. 15-A, I; NT 02, Anexo B");
  }

  function avaliaAlteracao(S, R) {
    avaliaImovel(S, R);
    if (val(S, "res") === "so_casa") return;
    var antes = { t: R.titulo, e: R.estado };
    R.cam = "CAM-14"; R.estado = "a_confirmar_dado";
    R.titulo = "Mudança no imóvel: avaliar atualização, substituição ou recarimbo do projeto";
    R.resumo = "Mudanças técnicas exigem avaliação do responsável técnico para definir se o projeto aprovado será atualizado, substituído ou recarimbado. Com os dados da nova situação, a indicação é: " + antes.t.replace("Caminho provável: ", "").toLowerCase() + ".";
    afirm(R, "A atualização complementa ou altera tecnicamente o projeto aprovado; ampliações com redimensionamento, novas medidas ou mudança de uso que afete as medidas podem exigir substituição do projeto; o recarimbo tem requisitos próprios e cumulativos.", ["nt11"], "NT 11, itens 5.3–5.5");
    doc(R, "DOC-ALT-01", "exigido", "avaliação da mudança", "Mudança no projeto");
    var div = PB.divDe(S);
    if (div === "A-2" || (val(S, "unid") === "sim" && ["residencial", "misto"].includes(val(S, "pred_tipo")))) doc(R, "DOC-ALT-02", "exigido", "reforma em unidade de edificação multifamiliar", "Mudança no projeto");
    doc(R, "DOC-ALT-03", "condicionado", "se a modificação alterar ou comprometer a segurança", "Mudança no projeto");
    if (val(S, "alt_tipo") === "ampliacao") alerta(R, "Ampliação: o recarimbo só cabe se forem atendidos todos os requisitos do item 5.5 da NT 11; no PCIS, se a área passar de 930 m² ou a altura de 12 m, o processo passa a PCI.", ["nt11"], "NT 11, item 5.5");
    if (val(S, "alt_tipo") === "uso") alerta(R, "Mudança de uso pode mudar a classificação da ocupação e as medidas exigidas.", ["nt04", "nt11"], "NT 04, Tabela 1; NT 11, item 5.4");
    R.proximo.unshift("Peça ao responsável técnico a avaliação da mudança (atualização, substituição ou recarimbo).");
  }

  /* ---------------- Renovação ---------------- */
  function avaliaRenovacao(S, R) {
    var d = val(S, "doc_ren");
    afirm(R, "AVCB e ACPS valem 1 ano a partir da emissão. A validade da inspeção é outra: até 5 anos (baixo risco), 2 anos (médio) ou 1 ano (alto), desde que as manutenções sejam feitas. O risco de cada ocupação está na tabela do Anexo B da NT 02.", ["lei9625", "nt02"], "Lei 9.625, arts. 3º-A, § 1º, e 15-A, I–II; NT 02, item 5.2");
    if (d === "acps") {
      R.cam = "CAM-12"; R.estado = "a_confirmar_conflito"; pend(R, "P-06");
      R.titulo = "Renovação do ACPS: passo a passo a confirmar com o CBMPB";
      R.resumo = "O ACPS vale 1 ano e o próprio modelo recomenda pedir a renovação 30 dias antes do vencimento. O rito e os anexos da renovação do ACPS não foram localizados nas fontes oficiais — não use a lista de primeira emissão nem a Renovação Anual Simplificada (RAS), que é do AVCB.";
      afirm(R, "Solicitar a renovação do ACPS 30 dias antes do vencimento.", ["nt07e"], "NT 07, Anexo A");
      afirm(R, "A lei fixa a taxa de emissão de certificado nos processos simplificados em 1,0 UFR-PB para área até 930 m². Confirme com o CBMPB se a renovação segue o mesmo valor.", ["lei9625"], "Lei 9.625, art. 38, I (redação da Lei 12.678/2023)");
      doc(R, "DOC-REN-03", "a_confirmar", "rito não localizado", "Renovação do ACPS");
      if (val(S, "ren_alt") === "sim") alerta(R, "Se o imóvel mudou (área, pavimentos, uso, produtos), ele pode não caber mais no processo simplificado. Avalie o enquadramento antes de renovar.", ["nt07e"], "NT 07, item 8.1", "atencao");
      R.proximo.push("Confirme com o CBMPB o procedimento atual de renovação do ACPS, com 30 dias de antecedência.");
    } else if (d === "avet") {
      R.cam = "CAM-18"; R.estado = "explicado";
      R.titulo = "O AVET não é renovado: cada evento tem o seu";
      R.resumo = "O AVET vale pelo período do evento (no máximo 1 ano) e não serve para outro evento. Para um novo evento, faça uma nova simulação escolhendo “Evento temporário”.";
      afirm(R, "A validade do AVET é a do período do evento, até 1 ano, e não vale para evento distinto.", ["lei9625"], "Lei 9.625, art. 3º-A, § 2º");
    } else if (d === "avcb") {
      var alt = val(S, "ren_alt"), ins = val(S, "ren_insp"), rn = PB.riscoNT02(S);
      var rk = rn.risco || val(S, "ren_risco"), rkOk = !!rn.risco || known(S, "ren_risco");
      if (rn.risco) afirm(R, "Pela NT 02/2023 (Anexo B), " + (rn.div ? "a divisão " + rn.div + " (" + PB.DIVISOES[rn.div] + ")" : "esse grupo de ocupação") + (rn.carga ? ", com carga de incêndio " + PB.CARGA_NIVEIS[rn.carga] + "," : "") + " é de " + PB.RISCO_NOME[rn.risco] + " risco: a inspeção vale " + anosTxt(rn.risco) + ".", ["nt02", "nt04"], "NT 02, item 5.2 e Anexos A–B");
      else if (known(S, "ren_risco")) afirm(R, "Risco considerado: " + PB.RISCO_NOME[rk] + ", conforme informado por você a partir do último processo. Confira com o processo ou o laudo de vistoria.", ["nt02"], "NT 02, Anexo B");
      if (alt === "sim") {
        R.cam = "CAM-14"; R.estado = "a_confirmar_dado";
        R.titulo = "Houve mudança no imóvel: avaliar o projeto antes de renovar";
        R.resumo = "A renovação simplificada não serve para omitir mudanças de uso, área ou sistemas. O responsável técnico deve avaliar se o projeto precisa de atualização ou substituição; depois, a renovação segue com vistoria.";
        doc(R, "DOC-ALT-01", "exigido", "avaliação da mudança", "Mudança no projeto");
        docsVistoria(S, R, "Renovação com vistoria", true);
        R.proximo.push("Peça ao responsável técnico a avaliação da mudança antes de pedir a renovação.");
      } else if (alt === "?" || !rkOk || !known(S, "ren_insp")) {
        R.cam = "CAM-11"; R.estado = "a_confirmar_dado";
        R.titulo = "Renovação do AVCB: faltam dados para indicar RAS ou vistoria";
        if (alt === "?") falta(R, "se houve mudança no imóvel");
        if (!rkOk) falta(R, "classificação de risco da edificação" + (rn.falta && rn.falta !== "atividade" && rn.falta !== "grupo de uso" ? " (" + rn.falta + ")" : ""));
        if (!known(S, "ren_insp")) falta(R, "data da última vistoria");
        R.resumo = "A Renovação Anual Simplificada (RAS) depende do risco, do tempo desde a última vistoria e de não haver mudanças. Falta saber: " + R.faltam.join(", ") + ".";
        doc(R, "DOC-REN-01", "exigido", "declaração da RAS", "Se for Renovação Anual Simplificada (RAS)");
        docsVistoria(S, R, "Se for renovação com vistoria", true);
      } else {
        var ras = (rk === "baixo" && (ins === "m2" || ins === "2a5")) || (rk === "medio" && ins === "m2");
        R.cam = "CAM-11"; R.estado = "provavel";
        if (ras) {
          R.titulo = "Caminho provável: Renovação Anual Simplificada (RAS) do AVCB";
          R.resumo = "Para AVCB de " + (rk === "baixo" ? "baixo" : "médio") + " risco, dentro da validade da inspeção e sem mudanças, a renovação é feita pela RAS: o proprietário ou procurador declara, com firma reconhecida em cartório, que as manutenções dos sistemas aprovados foram feitas.";
          afirm(R, "Findo o prazo do primeiro AVCB e dentro da validade da inspeção, a regularização de edificações de baixo e médio risco está condicionada à RAS.", ["lei9625"], "Lei 9.625, art. 15-A, III e parágrafo único");
          doc(R, "DOC-REN-01", "exigido", "renovação pela RAS", "Renovação Anual Simplificada (RAS)");
          afirm(R, "Na RAS, o proprietário ou procurador assume a responsabilidade pelas manutenções em declaração autenticada em cartório. A ART de manutenção (NT 11, item 6.2.2.3) é pedida na renovação com vistoria.", ["lei9625", "nt11"], "Lei 9.625, art. 15-A, parágrafo único; NT 11, item 6.2.2.3");
          alerta(R, "A RAS vale para a renovação seguinte ao primeiro AVCB. Se este é o primeiro AVCB do imóvel e ele está vencendo, confirme o procedimento com o responsável técnico.", ["lei9625"], "Lei 9.625, art. 15-A, III");
          R.proximo.push("Reúna a declaração de manutenção (com firma reconhecida) e faça o pedido de RAS no sistema do CBMPB antes do vencimento.");
        } else {
          R.titulo = "Caminho provável: renovação do AVCB com nova vistoria";
          R.resumo = rk === "alto" ? "Para alto risco, a inspeção vale até 1 ano: a renovação é feita com nova vistoria." : "A validade da inspeção para o seu risco já passou (" + (rk === "baixo" ? "até 5 anos" : "até 2 anos") + "): a renovação é feita com nova vistoria.";
          docsVistoria(S, R, "Renovação com vistoria", true);
          R.proximo.push("Peça a vistoria de renovação no sistema do CBMPB com a ART de manutenção.");
        }
      }
      doc(R, "DOC-GER-03", "exigido", val(S, "req") === "publico" ? "taxa ou prova de isenção (órgão público)" : "taxa do serviço", "Documentos gerais");
    } else {
      R.cam = "CAM-11"; R.estado = "a_confirmar_dado";
      R.titulo = "Identifique o certificado para indicar a renovação";
      R.resumo = "AVCB (vistoria), ACPS (processo simplificado) e AVET (evento) têm regras diferentes de renovação. Veja o tipo no próprio documento ou na consulta de certificado do CBMPB.";
      falta(R, "tipo de certificado");
      afirm(R, "Certificado de Aprovação compreende AVCB, ACPS e AVET.", ["lei9625"], "Lei 9.625, art. 3º-A");
    }
    if (val(S, "proc") === "sim") doc(R, "DOC-GER-02", "exigido", "pedido feito por procurador", "Documentos gerais");
    var s = Array.isArray(val(S, "sist")) ? val(S, "sist") : [];
    if (s.indexOf("save") >= 0) alerta(R, "Com recarga de veículos elétricos, a NT 40 prevê ART de conformidade do SAVE para vistoria, emissão e renovação.", ["nt40"], "NT 40", "atencao");
    prazo(R, "Validade do AVCB e do ACPS", "1 ano a partir da emissão", ["lei9625"], "Lei 9.625, art. 3º-A, § 1º");
    prazo(R, "Validade da inspeção", d === "avcb" ? textoValidade(S) : "até 5 anos (baixo risco), 2 anos (médio) ou 1 ano (alto), conforme a ocupação, mantidas as manutenções", ["lei9625", "nt02"], "Lei 9.625, art. 15-A, I–II; NT 02, Anexo B");
  }

  /* ---------------- Retificação ---------------- */
  function avaliaRetificacao(S, R) {
    var c = val(S, "ret_campo");
    if (c === "tecnico") {
      R.cam = "CAM-14"; R.estado = "a_confirmar_dado";
      R.titulo = "Dado técnico não é simples retificação";
      R.resumo = "Área, uso, pavimentos e demais dados técnicos dependem do projeto aprovado. Se o imóvel mudou, é caso de atualização ou substituição do projeto; se o erro foi só de digitação, o responsável técnico deve confirmar com o CBMPB.";
      doc(R, "DOC-ALT-01", "exigido", "avaliação do dado técnico", "Mudança no projeto");
      doc(R, "DOC-RET-01", "condicionado", "se for apenas erro de digitação no certificado", "Retificação");
      R.proximo.push("Leve o certificado e o projeto aprovado ao responsável técnico para avaliar o caso.");
    } else {
      R.cam = "CAM-13"; R.estado = "provavel";
      R.titulo = "Caminho provável: retificação de dados do certificado";
      R.resumo = "O certificado com erro é cancelado e outro é emitido com o dado correto, mantendo o mesmo prazo de validade do anterior, mediante devolução do original.";
      afirm(R, "Na retificação de dados, o novo Certificado de Aprovação mantém o período de validade do cancelado, mediante devolução do original.", ["nt11"], "NT 11, item 6.6.3");
      doc(R, "DOC-RET-01", "exigido", "cancelamento para retificação", "Retificação");
      doc(R, "DOC-RET-02", "recomendado", "comprovar o dado correto", "Retificação");
      alerta(R, "A forma digital de devolver o certificado original deve ser confirmada no sistema do CBMPB.", ["nt11"], "NT 11, item 6.6.3");
      R.proximo.push("Faça o pedido de retificação no sistema do CBMPB, com o documento que comprova o dado correto.");
    }
    if (val(S, "proc") === "sim") doc(R, "DOC-GER-02", "exigido", "pedido feito por procurador", "Documentos gerais");
  }

  /* ---------------- Evento ---------------- */
  function avaliaEvento(S, R) {
    var l = val(S, "ev_local");
    R.cam = "CAM-18";
    if (S.a.mun && S.a.mun !== "?") R.classif.push({ rot: "Município", v: S.a.mun });
    if (l === "perm_reg") { R.estado = "provavel"; R.titulo = "Caminho provável: PTOTEP (evento em edificação permanente) e AVET"; R.resumo = "Evento temporário dentro de edificação permanente regularizada segue o PTOTEP: projeto do evento, vistoria e emissão do AVET."; doc(R, "DOC-EVT-02", "exigido", "PTOTEP exige a edificação regularizada", "Evento (PTOTEP)"); }
    else if (l === "aberta") { R.estado = "provavel"; R.titulo = "Caminho provável: PTIOT (instalação temporária) e AVET"; R.resumo = "Evento com estruturas montadas em área aberta segue o PTIOT: projeto das instalações temporárias, vistoria e emissão do AVET."; }
    else if (l === "perm_sem") { R.estado = "a_confirmar_dado"; R.titulo = "Evento em edificação sem certificado: regularização do local a confirmar"; R.resumo = "O PTOTEP é para evento em edificação permanente regularizada. Sem certificado válido do local, é preciso regularizar a edificação ou avaliar outra solução com o responsável técnico."; doc(R, "DOC-EVT-02", "exigido", "PTOTEP exige a edificação regularizada", "Evento"); falta(R, "certificado válido do local"); }
    else { R.estado = "a_confirmar_dado"; R.titulo = "Evento temporário: falta saber onde será"; R.resumo = "PTIOT (estruturas temporárias) e PTOTEP (dentro de edificação regularizada) têm exigências diferentes."; falta(R, "local do evento"); }
    var g = l === "perm_reg" ? "Evento (PTOTEP)" : l === "aberta" ? "Evento (PTIOT)" : "Evento";
    afirm(R, "PTIOT trata de instalações e ocupações temporárias (circos, parques, feiras, shows); PTOTEP é o evento temporário em edificação permanente, que deve estar regularizada. O evento temporário tem prazo máximo de 6 meses.", ["nt11"], "NT 11, itens 5.1.7–5.1.8 e 5.1.8.1.1");
    doc(R, "DOC-EVT-01", "exigido", "projeto do evento", g);
    var e = Array.isArray(val(S, "ev_estr")) ? val(S, "ev_estr") : [];
    var est = { palco: "palco", arquib: "arquibancada/camarote", lona: "tenda/lona", brinq: "brinquedos", gerador: "gerador" };
    var le = e.filter(function (x) { return est[x]; }).map(function (x) { return est[x]; });
    if (le.length) doc(R, "DOC-EVT-05", "exigido", "estruturas informadas: " + le.join(", "), g);
    if (e.indexOf("lona") >= 0 && ["101a1000", "mais1000"].includes(val(S, "ev_pub"))) alerta(R, "Lonas/tendas com lotação acima de 100 pessoas têm comprovação técnica específica.", ["nt11"], "NT 11, item 5.1.7.2");
    if (e.indexOf("trio") >= 0) alerta(R, "Trio elétrico ou palco móvel segue a NT 05 e depende também de autorização de circulação no município.", ["nt05"], "NT 05", "atencao");
    if (e.indexOf("gas") >= 0) doc(R, "DOC-VIS-04", "exigido", "instalação de gás no evento", "Vistoria do evento");
    doc(R, "DOC-EVT-03", "condicionado", "conforme a hipótese de cada termo (regularização, fiscalização, controle de público)", g);
    doc(R, "DOC-VIS-01", "exigido", "ART de instalação das medidas (mínimo para a vistoria)", "Vistoria do evento");
    doc(R, "DOC-VIS-02", "exigido", "mínimo para protocolar a vistoria", "Vistoria do evento");
    doc(R, "DOC-VIS-06", "exigido", "portas de saída abertas durante o evento", "Vistoria do evento");
    doc(R, "DOC-VIS-05", "condicionado", "se a NT 17 exigir brigada para o evento", "Vistoria do evento");
    var f = val(S, "ev_fogos");
    if (f === "fogos" || f === "ambos") { doc(R, "DOC-VIS-08", "exigido", "uso de fogos no evento", "Fogos e efeitos"); modelo(R, "termoFogos"); }
    if (f === "chama" || f === "ambos") { doc(R, "DOC-EVT-04", "exigido", "uso de máquinas de chama", "Fogos e efeitos"); alerta(R, "Máquinas de chama são vedadas em ambiente fechado e exigem distância mínima de 7,5 m do público, entre outras condições. A RT 27 foi revogada pela RT 30.", ["rt30", "port006"], "RT 30", "atencao"); }
    if (f === "?") falta(R, "se haverá fogos ou máquinas de chama");
    pend(R, "P-09");
    prazo(R, "Protocolo do projeto e pedido de vistoria", "a NT 11 traz 10 dias de antecedência (itens 5.1.7.4.7–5.1.7.4.8) e, para a vistoria, 48 h em dias úteis ou 72 h em fins de semana e feriados (item 6.1.20). Planeje com a maior antecedência possível", ["nt11"], "NT 11, pp. 14 e 21");
    prazo(R, "Validade do AVET", "o período do evento, até 1 ano; não vale para outro evento", ["lei9625"], "Lei 9.625, art. 3º-A, § 2º");
    prazo(R, "Duração máxima do evento temporário", "6 meses", ["nt11"], "NT 11, item 5.1.8.1.1");
    var pz = val(S, "ev_prazo");
    if (pz === "menos3") alerta(R, "Faltam menos de 3 dias: pode não haver tempo para a vistoria (mínimo de 48 h/72 h). Procure o CBMPB imediatamente.", ["nt11"], "NT 11, item 6.1.20", "atencao");
    if (pz === "3a10") alerta(R, "Faltam menos de 10 dias, prazo indicado nos itens 5.1.7.4.7–5.1.7.4.8 da NT 11. Confirme com o CBMPB se ainda há tempo hábil.", ["nt11"], "NT 11, itens 5.1.7.4.7–8", "atencao");
    var pt = val(S, "patr");
    if (pt === "federal") alerta(R, "Evento em bem tombado pelo IPHAN (ou no entorno) depende também de autorização do IPHAN, com antecedência própria.", ["nt24"], "NT 24; Portaria IPHAN 289/2025", "atencao");
    else if (pt && pt !== "nao" && pt !== "?") alerta(R, "Evento em imóvel protegido depende também do órgão de patrimônio.", ["nt24"], "NT 24", "atencao");
    if (S.a.mun && S.a.mun !== "?") doc(R, "DOC-EXT-03", "condicionado", "licença de evento da Prefeitura de " + S.a.mun, "Outros órgãos");
    if (val(S, "proc") === "sim") doc(R, "DOC-GER-02", "exigido", "pedido feito por procurador", "Documentos gerais");
    doc(R, "DOC-GER-03", "exigido", "taxa do serviço ou prova de isenção", "Documentos gerais");
    R.proximo.push("Contrate o responsável técnico pelo projeto do evento e protocole com antecedência.");
  }

  /* ---------------- LTV, prorrogação e TAAP ---------------- */
  function avaliaLTV(S, R) {
    var s = val(S, "ltv_sit"), pub = val(S, "req") === "publico";
    alerta(R, "Se o estabelecimento tem ACPS (processo simplificado) válido, ele fica suspenso automaticamente com o LTV, até que nova vistoria confirme a correção.", ["nt07e", "an0124"], "NT 07, item 10.4.1 (Portaria 042/2024)", "info");
    afirm(R, "Na vistoria com exigências, o LTV reprovado fixa prazo de até 30 dias, contado da emissão do laudo, conforme risco e exequibilidade.", ["lei9625"], "Lei 9.625, art. 15-B");
    if (s === "no_prazo") {
      R.cam = "CAM-15"; R.estado = "explicado";
      R.titulo = "LTV com exigências: cumpra dentro do prazo do laudo";
      R.resumo = "Corrija as pendências dentro do prazo fixado no seu LTV (até 30 dias da emissão). Ao fim do prazo, o vistoriador retorna para verificar (LTV de retorno). Se não for possível cumprir no prazo, peça prorrogação antes do vencimento.";
      afirm(R, "Findos os prazos, o vistoriador retorna para verificar o cumprimento das exigências; cumpridas, são emitidos o LTV de retorno aprovado e o AVCB ou AVET.", ["lei9625"], "Lei 9.625, art. 16");
      R.proximo.push("Execute as correções e guarde as ARTs/comprovantes dos serviços.");
    } else if (s === "prorrog1" || s === "prorrog2") {
      R.cam = "CAM-15"; R.estado = "provavel";
      R.titulo = s === "prorrog1" ? "Caminho provável: 1ª prorrogação de prazo (AFP)" : "Caminho provável: 2ª prorrogação de prazo (concedida uma única vez)";
      R.resumo = "A prorrogação pode ser de até " + (pub ? "1 ano (administração pública)" : "180 dias (demais casos)") + ", contada do fim do prazo do LTV, mediante requerimento com cronograma e prova de inviabilidade. Se deferida, é emitida a Autorização de Funcionamento Provisório (AFP). O pedido não garante o deferimento.";
      afirm(R, "Prorrogação: até 1 ano para órgãos públicos e até 180 dias para os demais, contados do fim do prazo do LTV; nova concessão uma única vez, por igual período, com andamento comprovado; deferida, é emitida AFP com a mesma validade.", ["lei9625"], "Lei 9.625, art. 15-B, §§ 1º–6º");
      if (!known(S, "req")) falta(R, "se o requerente é órgão público ou privado");
      doc(R, "DOC-PRZ-01", "exigido", "pedido de prorrogação", "Prorrogação de prazo");
      doc(R, "DOC-PRZ-02", "exigido", "exigência da lei", "Prorrogação de prazo");
      if (s === "prorrog2") doc(R, "DOC-PRZ-03", "exigido", "segunda prorrogação", "Prorrogação de prazo");
      doc(R, "DOC-PRZ-04", "condicionado", "conforme a Portaria 046/2024 e o caso", "Prorrogação de prazo");
      modelo(R, s === "prorrog1" ? (pub ? "prorrog1Pub" : "prorrog1Priv") : (pub ? "prorrog2Pub" : "prorrog2Priv"));
      R.proximo.push("Anexe o requerimento e o cronograma no sistema do CBMPB antes do fim do prazo do LTV.");
    } else if (s === "taap" || s === "taap_reval") {
      R.cam = "CAM-16"; R.estado = "explicado"; pend(R, "P-08");
      R.titulo = s === "taap" ? "TAAP — Termo de Autorização para Adequação de Pendências" : "Revalidação do TAAP";
      R.resumo = "O TAAP é excepcional: depois dos prazos do LTV e das prorrogações, o Comandante-Geral pode autorizar a adequação das pendências, com medidas compensatórias e cronograma. Vale até 12 meses, contados da assinatura do termo, e pode ser revalidado até 3 vezes (máximo de 48 meses).";
      prazo(R, "Vigência do TAAP", "até 12 meses a partir da assinatura do termo; revalidável até 3 vezes, no máximo 48 meses", ["lei9625", "mp366"], "Lei 9.625, art. 15-C, § 2º (redação da MP 366/2026)");
      alerta(R, "A Portaria 163/2026 (art. 7º, § 3º) e a cartilha do TAAP falam em contar o prazo a partir do fim do LTV. Prevalece a lei: o prazo conta da assinatura do termo. Confira a data de início escrita no próprio TAAP.", ["lei9625", "port163", "cartTaap"], "Lei 9.625, art. 15-C, § 2º × Portaria 163/2026, art. 7º, § 3º (interpretação do responsável técnico)", "info");
      afirm(R, "O TAAP depende de requerimento do proprietário ou representante em conjunto com o responsável técnico; vigência de até 12 meses, revalidável até 3 vezes por até 12 meses cada, no máximo 48 meses; cada revalidação depende de vistoria antes do término.", ["lei9625", "mp366"], "Lei 9.625, art. 15-C (redação da MP 366/2026)");
      afirm(R, "Taxa: 1/12 da taxa de vistoria de regularização por mês de vigência, limitada a 12/12 por período de até 12 meses.", ["lei9625"], "Lei 9.625, art. 15-C, § 5º");
      if (s === "taap") { doc(R, "DOC-TAAP-01", "exigido", "pedido de TAAP", "TAAP"); doc(R, "DOC-TAAP-02", "exigido", "fundamentação técnica", "TAAP"); doc(R, "DOC-TAAP-03", "exigido", "gerenciamento de riscos", "TAAP"); }
      else { doc(R, "DOC-TAAP-02", "condicionado", "se as condições de risco mudaram", "Revalidação do TAAP"); modelo(R, "taapReval"); alerta(R, "Peça a revalidação antes do fim da vigência: ela depende de vistoria que verifique o andamento do cronograma.", ["lei9625"], "Lei 9.625, art. 15-C, § 3º", "atencao"); }
      doc(R, "DOC-TAAP-04", "exigido", "cronograma físico-financeiro", s === "taap" ? "TAAP" : "Revalidação do TAAP");
      doc(R, "DOC-TAAP-05", "exigido", "taxa proporcional", s === "taap" ? "TAAP" : "Revalidação do TAAP");
      alerta(R, "A redação atual do TAAP foi dada pela Medida Provisória 366/2026, em tramitação na Assembleia (consulta em 30/10/2026). Use os modelos de 2026; a Portaria 22/2025 foi revogada.", ["mp366", "port163"], "Portaria 163/2026, art. 20", "atencao");
      R.proximo.push("Prepare o pedido com o responsável técnico; o TAAP não é concedido em caso de risco iminente.");
    } else {
      R.cam = "CAM-15"; R.estado = "a_confirmar_dado";
      R.titulo = "Exigências do Corpo de Bombeiros: identifique a fase";
      R.resumo = "Há três momentos: cumprir no prazo do LTV (até 30 dias), pedir prorrogação (com cronograma) ou, esgotados os prazos, pedir o TAAP. O LTV informa o prazo concreto.";
      falta(R, "situação das exigências");
    }
    if (val(S, "proc") === "sim") doc(R, "DOC-GER-02", "exigido", "pedido feito por procurador", "Documentos gerais");
  }

  /* ---------------- Sanções e recursos ---------------- */
  function avaliaRecurso(S, R) {
    var t = val(S, "rec_tipo");
    R.cam = "CAM-17"; R.estado = "explicado";
    if (t === "multa") {
      R.titulo = "Multa: defesa prévia, reconsideração e recurso especial";
      R.resumo = "No processo de multa, a lei prevê 15 dias úteis para a defesa prévia (do recebimento da notificação), 15 dias úteis para o pedido de reconsideração e 15 dias úteis para o recurso especial. Conte os prazos a partir da ciência comprovada e confira o calendário.";
      afirm(R, "Prazos de 15 dias úteis para defesa prévia, reconsideração e recurso especial.", ["lei9625"], "Lei 9.625, arts. 19, 21, 24 e 24-A");
    } else if (t === "lta") {
      R.titulo = "Projeto reprovado (LTA): correção ou recurso técnico";
      R.resumo = "A análise admite até 3 retornos para correção. Esgotada a argumentação com a análise, a discordância técnica pode ser levada à Comissão (CIAT). Esgotados os retornos sem aprovação, o reinício exige nova taxa.";
      afirm(R, "Discordância técnica de LTA pode ir à CIAT após esgotar a argumentação na análise; há até 3 retornos.", ["nt11", "lei9625"], "NT 11, itens 5.7.4–5.7.8; Lei 9.625, art. 12");
    } else if (t === "interd" || t === "embargo" || t === "apreensao") {
      R.titulo = { interd: "Interdição", embargo: "Embargo", apreensao: "Apreensão" }[t] + ": siga o rito próprio";
      R.resumo = "Interdição, embargo e apreensão têm procedimentos próprios. Pedir prazo ou regularizar não desfaz a sanção automaticamente, e o local não deve funcionar sem autorização.";
      afirm(R, "Embargo, interdição/desinterdição e apreensão têm portarias próprias.", ["port060", "port061", "port003"], "Portarias 060/2025, 061/2025 e 003/2026");
    } else {
      R.titulo = "Sanções e recursos: identifique o ato";
      R.resumo = "Cada ato (multa, interdição, embargo, apreensão, reprovação de projeto) tem rito e prazo próprios. Leia o documento recebido para identificar o tipo e a data de ciência.";
    }
    doc(R, "DOC-REC-01", "exigido", "defesa ou recurso", "Defesa ou recurso");
    doc(R, "DOC-GER-02", "condicionado", "se houver representante", "Defesa ou recurso");
    R.proximo.push("Guarde a prova da data em que recebeu o documento e procure apoio técnico ou jurídico.");
  }

  PB.avaliar = function (S) {
    var R = novoR(S);
    var o = S.a.obj;
    if (o === "reg" || o === "info") avaliaImovel(S, R);
    else if (o === "alt") avaliaAlteracao(S, R);
    else if (o === "ren") avaliaRenovacao(S, R);
    else if (o === "ret") avaliaRetificacao(S, R);
    else if (o === "evt") avaliaEvento(S, R);
    else if (o === "ltv") avaliaLTV(S, R);
    else if (o === "rec") avaliaRecurso(S, R);
    if (!S.a.mun || S.a.mun === "?") falta(R, "município");
    R.versao = PB.VERSAO.regras;
    return R;
  };

  PB.ESTADOS = {
    provavel: { t: "Provável — a confirmar com o responsável técnico", c: "ok" },
    nao_se_aplica: { t: "Não se aplica", c: "no" },
    a_confirmar_dado: { t: "Faltam dados", c: "wait" },
    a_confirmar_conflito: { t: "Depende de esclarecimento oficial", c: "wait" },
    explicado: { t: "Orientação", c: "info" },
    possivel: { t: "Possível", c: "ok" }
  };
})(window);

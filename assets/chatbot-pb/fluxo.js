/* =====================================================================
   AVCB Paraíba — roteiro de perguntas (ordem e condições de exibição)
   Estados de resposta: valor | "?" (não sei) | ausente (não respondido).
   ===================================================================== */
(function (W) {
  "use strict";
  var PB = W.PB = W.PB || {};
  var NS = ["Não sei", "?"];

  function v(S, k) { return S.a[k]; }
  function has(S, k) { return Object.prototype.hasOwnProperty.call(S.a, k); }
  function inArr(S, k, x) { var a = S.a[k]; return Array.isArray(a) && a.indexOf(x) >= 0; }
  function obj(S) { return S.a.obj; }
  function imovel(S) { var o = obj(S); return o === "reg" || o === "alt" || o === "info"; }
  function naoCasa(S) { return imovel(S) && has(S, "res") && v(S, "res") !== "so_casa"; }
  PB.divDe = function (S) {
    var a = S.a.ativ;
    if (!a || a === "?") return "?";
    if (a === "outra") { var g = S.a.grupo; return (!g || g === "?") ? "?" : PB.GRUPO_DIV_PADRAO[g]; }
    for (var i = 0; i < PB.ATIVIDADES.length; i++) if (PB.ATIVIDADES[i][0] === a) return PB.ATIVIDADES[i][2];
    return "?";
  };
  PB.vulnDerivado = function (S) { var d = PB.divDe(S); return ["E-5", "E-6", "H-2"].indexOf(d) >= 0; };
  function grupoRes(S) { var d = PB.divDe(S); return d === "A-1" || d === "A-2"; }
  function renAvcb(S) { return obj(S) === "ren" && v(S, "doc_ren") === "avcb" && v(S, "ren_alt") !== "sim"; }
  function grupoDe(S) { var a = S.a.ativ; if (!a || a === "?") return "?"; if (a === "outra") { var g = S.a.grupo; return (!g || g === "?") ? "?" : g; } return PB.divDe(S).charAt(0); }
  /* Ocupações cujo risco (NT 02, Anexo B) depende do nível de carga de incêndio. */
  function precisaCarga(S) {
    var g = grupoDe(S), d = PB.divDe(S);
    return (g === "C" && d !== "C-3") || g === "I" || (g === "J" && d !== "J-1" && d !== "J-4");
  }
  /* Risco da edificação pela NT 02/2023, Anexo B. Retorna { risco|null, div, falta }. */
  PB.riscoNT02 = function (S) {
    var a = S.a.ativ;
    if (!a || a === "?") return { risco: null, falta: "atividade" };
    var g = grupoDe(S);
    if (g === "?") return { risco: null, falta: "grupo de uso" };
    var d = a === "outra" ? null : PB.divDe(S);
    if (precisaCarga(S)) {
      var c = S.a.carga;
      if (!c || c === "?") return { risco: null, div: d, falta: "nível de carga de incêndio" };
      var mapa = g === "C" ? { "1": "baixo", "2": "medio", "3": "medio" } : { "1": "baixo", "2": "medio", "3": "alto" };
      return { risco: mapa[c], div: d, grupo: g, carga: c };
    }
    if (d === "F-3") return { risco: null, div: d, falta: "se é estádio de futebol (alto risco) ou outro centro esportivo (médio)" };
    if (!d) {
      var uni = { A: "baixo", B: "medio", D: "medio", E: "medio", G: "medio", K: "medio", M: "medio" };
      return uni[g] ? { risco: uni[g], grupo: g } : { risco: null, grupo: g, falta: "divisão exata da ocupação" };
    }
    return PB.RISCO_NT02[d] ? { risco: PB.RISCO_NT02[d], div: d } : { risco: null, div: d, falta: "divisão da ocupação" };
  };
  PB.precisaCarga = precisaCarga;

  var ETAPAS = ["Objetivo", "Imóvel", "Uso e riscos", "Situação", "Resultado"];
  PB.ETAPAS = ETAPAS;

  PB.PERGUNTAS = [
    { id: "obj", etapa: 0, q: "Objetivo", type: "choice",
      text: "Para começar: <strong>o que você precisa resolver</strong> no Corpo de Bombeiros?",
      opts: [["Regularizar um imóvel ou estabelecimento", "reg"], ["Renovar um certificado (AVCB, ACPS)", "ren"], ["Corrigir dados de um certificado", "ret"], ["Reforma, ampliação ou mudança de uso", "alt"], ["Evento temporário (festa, show, feira)", "evt"], ["Recebi exigências (LTV) ou preciso de mais prazo", "ltv"], ["Multa, interdição, embargo ou recurso", "rec"], ["Ainda não sei, quero entender", "info"]],
      when: function () { return true; } },
    { id: "mun", etapa: 0, q: "Município", type: "mun",
      text: "Em qual <strong>município da Paraíba</strong> fica o imóvel ou o evento?",
      note: "As regras do Corpo de Bombeiros valem para todo o estado. A prefeitura tem regras próprias para alvarás.",
      when: function () { return true; } },

    /* ---------- Alteração ---------- */
    { id: "alt_tipo", etapa: 0, q: "Tipo de mudança", type: "choice",
      text: "Que tipo de mudança é?",
      opts: [["Ampliação (aumento de área)", "ampliacao"], ["Mudança de uso ou de atividade", "uso"], ["Instalação de novo sistema ou equipamento", "sistema"], ["Reforma interna (layout, paredes, acabamento)", "reforma"], ["Outra", "outra"]],
      when: function (S) { return obj(S) === "alt"; } },

    /* ---------- Imóvel ---------- */
    { id: "res", etapa: 1, q: "Tipo de imóvel", type: "choice",
      text: "O imóvel é <strong>só a moradia de uma família</strong>?",
      opts: [["Sim, só moradia de uma família, sem atividade de trabalho", "so_casa"], ["É moradia, mas também funciona uma atividade (uso misto)", "mista"], ["Não, é um estabelecimento, empresa ou condomínio", "nao"], NS],
      when: function (S) { return imovel(S); } },
    { id: "res_mista", etapa: 1, q: "Moradia em edificação mista", type: "choice",
      text: "A moradia fica no <strong>andar de cima</strong> de uma edificação de até 2 pavimentos, com <strong>entrada própria para a rua</strong> e <strong>sem ligação interna</strong> com a parte da atividade?",
      opts: [["Sim, atende a tudo isso", "sim"], ["Não", "nao"], NS],
      when: function (S) { return imovel(S) && v(S, "res") === "mista"; } },
    { id: "ativ", etapa: 1, q: "Atividade", type: "search",
      text: "Qual é a <strong>atividade</strong> do local? Digite para buscar (ex.: restaurante, loja, escritório, academia).",
      note: "A classificação definitiva é feita no projeto, pela Tabela 1 da NT 04.",
      when: function (S) { return naoCasa(S) || renAvcb(S); } },
    { id: "grupo", etapa: 1, q: "Grupo de uso", type: "choice",
      text: "Qual destes grupos descreve melhor o uso do local?",
      opts: PB.GRUPOS.map(function (g) { return [g[1], g[0]]; }).concat([NS]),
      when: function (S) { return (naoCasa(S) || renAvcb(S)) && v(S, "ativ") === "outra"; } },
    { id: "unid", etapa: 1, q: "Unidade em prédio maior", type: "choice",
      text: "O local é uma <strong>unidade dentro de um prédio, galeria, shopping ou condomínio</strong> maior (sala, loja, apartamento)?",
      opts: [["Sim", "sim"], ["Não, ocupa a edificação inteira", "nao"], NS],
      when: function (S) { return naoCasa(S); } },
    { id: "pred_tipo", etapa: 1, q: "Tipo do prédio principal", type: "choice",
      text: "Como é o <strong>prédio principal</strong>?",
      opts: [["Comercial / empresarial (salas, lojas)", "comercial"], ["Shopping ou galeria", "shopping"], ["Residencial (condomínio de apartamentos)", "residencial"], ["Misto (residencial e comercial)", "misto"], NS],
      when: function (S) { return naoCasa(S) && v(S, "unid") === "sim"; } },
    { id: "pred_cert", etapa: 1, q: "Certificado do prédio principal", type: "choice",
      text: "O <strong>prédio principal</strong> tem certificado do Corpo de Bombeiros (AVCB) válido?",
      note: "O síndico ou a administração do prédio costuma ter essa informação.",
      opts: [["Sim, válido", "valido"], ["Tem, mas está vencido", "vencido"], ["Não tem", "nao_tem"], NS],
      when: function (S) { return naoCasa(S) && v(S, "unid") === "sim"; } },
    { id: "area", etapa: 1, q: "Área construída", type: "number", unit: "m²", min: 1, max: 1000000, dec: 2,
      textFn: function (S) { return v(S, "unid") === "sim" ? "Qual é a <strong>área construída da sua unidade</strong>, em m²?" : "Qual é a <strong>área construída total</strong> da edificação, em m²?"; },
      note: "Some todos os pavimentos. Você encontra na planta, no IPTU ou no habite-se.",
      when: function (S) { return naoCasa(S); } },
    { id: "area_pred", etapa: 1, q: "Área total do prédio principal", type: "number", unit: "m²", min: 1, max: 1000000, dec: 2,
      text: "E a <strong>área construída total do prédio</strong> onde a unidade fica, em m²?",
      when: function (S) { return naoCasa(S) && v(S, "unid") === "sim"; } },
    { id: "pav", etapa: 1, q: "Pavimentos", type: "number", unit: "pavimento(s)", min: 1, max: 200, dec: 0,
      textFn: function (S) { return "Quantos <strong>pavimentos</strong> tem " + (v(S, "unid") === "sim" ? "o prédio" : "a edificação") + ", contando o térreo? <em>Não conte subsolo nem mezanino.</em>"; },
      when: function (S) { return naoCasa(S); } },
    { id: "mez", etapa: 1, q: "Mezanino maior que 1/3 do andar", type: "choice",
      text: "Existe <strong>mezanino</strong> com área maior que 1/3 do andar onde ele está?",
      note: "Mezanino maior que 1/3 do andar conta como pavimento (NT 07, definições).",
      opts: [["Não há mezanino (ou é menor que 1/3)", "nao"], ["Sim", "sim"], NS],
      when: function (S) { var p = v(S, "pav"); return naoCasa(S) && has(S, "pav") && (p === "?" || p <= 3); } },
    { id: "alt", etapa: 1, q: "Altura", type: "number", unit: "m", min: 0, max: 500, dec: 2,
      text: "Qual é a <strong>altura</strong> da edificação, em metros?",
      note: "Para o Corpo de Bombeiros, altura é a medida do piso mais baixo ocupado até o piso do último pavimento — não é a altura do telhado (NT 04, item 4.1).",
      when: function (S) { var p = v(S, "pav"); return naoCasa(S) && has(S, "pav") && (p === "?" || p > 1); } },
    { id: "sub", etapa: 1, q: "Subsolo", type: "choice",
      text: "A edificação tem <strong>subsolo</strong>?",
      opts: [["Não tem subsolo", "nenhum"], ["1 subsolo, só estacionamento (sem abastecimento ou oficina)", "1est"], ["2 ou mais subsolos, só estacionamento", "2est"], ["Subsolo com outro uso (loja, depósito, salão...)", "outro"], NS],
      when: function (S) { return naoCasa(S); } },

    /* ---------- Uso e riscos ---------- */
    { id: "pub", etapa: 2, q: "Público reunido (lotação)", type: "choice",
      text: "O local recebe <strong>público reunido</strong> ao mesmo tempo (plateia, salão, restaurante, culto, academia, sala de aula)? Qual a lotação máxima?",
      opts: [["Não é local de reunião de público", "nao_reuniao"], ["Sim, até 100 pessoas", "ate100"], ["Sim, mais de 100 pessoas", "mais100"], NS],
      when: function (S) { return naoCasa(S) && !grupoRes(S); } },
    { id: "vuln", etapa: 2, q: "Público vulnerável", type: "choice",
      text: "O público é formado <strong>principalmente</strong> por idosos, crianças ou pessoas com dificuldade de locomoção?",
      opts: [["Não", "nao"], ["Sim", "sim"], NS],
      when: function (S) { return naoCasa(S) && !grupoRes(S) && !PB.vulnDerivado(S); } },
    { id: "prod", etapa: 2, q: "Gás, combustíveis e produtos", type: "multi",
      text: "Marque o que existe no local. Se não houver nada, escolha <strong>Nenhum</strong>.",
      opts: [["Gás de cozinha (GLP — botijão ou central)", "glp"], ["Gás natural encanado (GN)", "gn"], ["GNV (gás natural veicular)", "gnv"], ["Líquidos inflamáveis ou combustíveis (gasolina, diesel, álcool, solventes, tintas)", "liq"], ["Fogos de artifício", "fogos"], ["Outros produtos perigosos (químicos, explosivos, radioativos)", "perig"]],
      none: ["Nenhum", "nenhum"],
      when: function (S) { return naoCasa(S); } },
    { id: "glp_kg", etapa: 2, q: "Quantidade de GLP", type: "choice",
      text: "Quanto de <strong>GLP</strong> fica no local, somando todos os botijões ou cilindros?",
      note: "Botijão comum = 13 kg; cilindro P45 = 45 kg.",
      opts: [["Até 13 kg (1 botijão)", "ate13"], ["De 14 a 190 kg", "14a190"], ["Mais de 190 kg", "mais190"], NS],
      when: function (S) { return naoCasa(S) && inArr(S, "prod", "glp"); } },
    { id: "glp_tipo", etapa: 2, q: "Forma do GLP", type: "choice",
      text: "O GLP fica em botijões avulsos ou em uma <strong>central de GLP</strong> (cilindros ligados por tubulação)?",
      opts: [["Botijões avulsos", "botijao"], ["Central de GLP", "central"], NS],
      when: function (S) { return naoCasa(S) && inArr(S, "prod", "glp"); } },
    { id: "glp_uso", etapa: 2, q: "Uso do GLP", type: "choice",
      text: "O GLP é para <strong>consumo</strong> do próprio local ou para <strong>revenda</strong>?",
      opts: [["Consumo próprio", "consumo"], ["Revenda", "revenda"], NS],
      when: function (S) { return naoCasa(S) && inArr(S, "prod", "glp") && S.a.ativ !== "revenda_glp"; } },
    { id: "liq_l", etapa: 2, q: "Quantidade de líquidos", type: "choice",
      text: "Quanto de <strong>líquido inflamável ou combustível</strong> fica armazenado?",
      opts: [["Até 1.000 litros", "ate1000"], ["Mais de 1.000 litros", "mais1000"], NS],
      when: function (S) { return naoCasa(S) && inArr(S, "prod", "liq"); } },
    { id: "fogos_at", etapa: 2, q: "Atividade com fogos", type: "choice",
      text: "Qual a atividade com <strong>fogos de artifício</strong>?",
      opts: [["Comércio (venda)", "comercio"], ["Depósito / armazenamento", "deposito"], ["Uso em espetáculo", "uso"], NS],
      when: function (S) { return naoCasa(S) && inArr(S, "prod", "fogos"); } },
    { id: "fogos_kg", etapa: 2, q: "Quantidade de fogos", type: "choice",
      text: "Quanto de <strong>fogos de artifício</strong> fica no local?",
      note: "A NT 07 admite no PTS até 4 kg, só de fogos classes A e B (revenda tipo 1).",
      opts: [["Até 4 kg, só classes A e B", "ate4"], ["Mais de 4 kg ou outras classes", "mais4"], NS],
      when: function (S) { return naoCasa(S) && inArr(S, "prod", "fogos"); } },
    { id: "abert", etapa: 2, q: "Aberturas para edificação vizinha", type: "choice",
      text: "Alguma <strong>porta, janela ou abertura no telhado</strong> dá para dentro de uma edificação vizinha?",
      opts: [["Não", "nao"], ["Sim", "sim"], NS],
      when: function (S) { return naoCasa(S); } },
    { id: "lote", etapa: 2, q: "Mais de uma edificação no terreno", type: "choice",
      text: "Existe <strong>mais de uma edificação</strong> no mesmo terreno?",
      opts: [["Não", "nao"], ["Sim", "sim"], NS],
      when: function (S) { return naoCasa(S) && v(S, "unid") !== "sim"; } },
    { id: "sist", etapa: 2, q: "Sistemas e equipamentos existentes", type: "multi",
      textFn: function (S) { return obj(S) === "ren" ? "Quais <strong>sistemas</strong> existem no imóvel? Eles definem as ARTs de manutenção." : "Quais destes <strong>sistemas ou equipamentos</strong> já existem no local?"; },
      opts: [["Extintores", "ext"], ["Iluminação de emergência", "ilum"], ["Sinalização de emergência", "sinal"], ["Hidrantes ou mangotinhos", "hidr"], ["Alarme de incêndio", "alarme"], ["Detecção de fumaça", "detec"], ["Chuveiros automáticos (sprinklers)", "sprk"], ["Para-raios (SPDA)", "spda"], ["Escada pressurizada ou controle de fumaça", "pressur"], ["Gerador de energia", "gerador"], ["Subestação elétrica", "subest"], ["Elevador", "elev"], ["Placas solares (fotovoltaico)", "fv"], ["Recarga de veículo elétrico", "save"], ["Cozinha profissional com coifa", "coifa"]],
      none: ["Nenhum destes", "nenhum"],
      when: function (S) { return naoCasa(S) || (obj(S) === "ren" && v(S, "doc_ren") === "avcb"); } },
    { id: "exist", etapa: 3, q: "Edificação anterior a 24/06/2012", type: "choice",
      text: "A edificação foi construída <strong>antes de 24/06/2012</strong> (início da vigência da Lei 9.625/2011)?",
      opts: [["Sim, é anterior", "antes"], ["Não, é posterior", "depois"], NS],
      when: function (S) { return naoCasa(S); } },
    { id: "patr", etapa: 3, q: "Proteção patrimonial", type: "choice",
      text: "O imóvel (ou o local do evento) é <strong>tombado</strong> ou fica em área de proteção do patrimônio histórico?",
      opts: [["Não", "nao"], ["Tombado — federal (IPHAN)", "federal"], ["Tombado — estadual (IPHAEP)", "estadual"], ["Tombado — municipal", "municipal"], ["Fica no entorno de um bem protegido", "entorno"], NS],
      when: function (S) { return naoCasa(S) || obj(S) === "evt"; } },
    { id: "etapa_proc", etapa: 3, q: "Situação do processo", type: "choice",
      text: "Em que ponto está a regularização?",
      opts: [["Ainda não comecei", "inicio"], ["Já tenho projeto aprovado no Corpo de Bombeiros", "proj"], ["Projeto aprovado e medidas instaladas — falta a vistoria", "instalado"], NS],
      when: function (S) { return (obj(S) === "reg" || obj(S) === "info") && naoCasa(S); } },

    /* ---------- Renovação ---------- */
    { id: "doc_ren", etapa: 1, q: "Certificado a renovar", type: "choice",
      text: "Qual certificado você quer renovar?",
      opts: [["AVCB (Auto de Vistoria do Corpo de Bombeiros)", "avcb"], ["ACPS (Auto de Conformidade — processo simplificado)", "acps"], ["AVET (evento temporário)", "avet"], NS],
      when: function (S) { return obj(S) === "ren"; } },
    { id: "ren_alt", etapa: 1, q: "Mudanças desde o último certificado", type: "choice",
      text: "Desde o último certificado, mudou o <strong>uso, a área, os pavimentos ou os sistemas</strong> do imóvel?",
      opts: [["Não mudou nada", "nao"], ["Sim, houve mudança", "sim"], NS],
      when: function (S) { return obj(S) === "ren" && (v(S, "doc_ren") === "avcb" || v(S, "doc_ren") === "acps"); } },
    { id: "carga", etapa: 1, q: "Nível de carga de incêndio", type: "choice",
      text: "Qual é o <strong>nível de carga de incêndio</strong> do imóvel, conforme o projeto aprovado?",
      note: "Consta no projeto ou no memorial. Pela NT 02 (Anexo B), ele define o risco e a validade da inspeção para comércio, indústria e depósito.",
      opts: [["Nível I — até 300 MJ/m²", "1"], ["Nível II — acima de 300 até 1.200 MJ/m²", "2"], ["Nível III — acima de 1.200 MJ/m²", "3"], NS],
      when: function (S) { return renAvcb(S) && precisaCarga(S); } },
    { id: "ren_risco", etapa: 1, q: "Risco no último processo", type: "choice",
      text: "No último processo, a edificação foi classificada como de <strong>baixo, médio ou alto risco</strong>?",
      note: "Não foi possível definir o risco só pela atividade (NT 02, Anexo B). Essa informação costuma constar do processo ou do laudo de vistoria.",
      opts: [["Baixo risco", "baixo"], ["Médio risco", "medio"], ["Alto risco", "alto"], NS],
      when: function (S) { return renAvcb(S) && PB.riscoNT02(S).risco === null; } },
    { id: "ren_insp", etapa: 1, q: "Última vistoria", type: "choice",
      text: "Há quanto tempo foi a <strong>última vistoria</strong> do Corpo de Bombeiros no imóvel?",
      opts: [["Menos de 2 anos", "m2"], ["Entre 2 e 5 anos", "2a5"], ["Mais de 5 anos", "m5"], NS],
      when: function (S) { return obj(S) === "ren" && v(S, "doc_ren") === "avcb" && v(S, "ren_alt") !== "sim"; } },

    /* ---------- Retificação ---------- */
    { id: "ret_campo", etapa: 1, q: "Dado a corrigir", type: "choice",
      text: "O que está errado no certificado?",
      opts: [["Nome ou razão social", "nome"], ["CNPJ ou CPF", "cnpj"], ["Endereço", "endereco"], ["Área, uso, pavimentos ou dados técnicos", "tecnico"], ["Outro dado", "outro"]],
      when: function (S) { return obj(S) === "ret"; } },

    /* ---------- Evento ---------- */
    { id: "ev_local", etapa: 1, q: "Local do evento", type: "choice",
      text: "Onde será o evento?",
      opts: [["Dentro de edificação permanente com certificado válido", "perm_reg"], ["Dentro de edificação permanente sem certificado (ou não sei se tem)", "perm_sem"], ["Em área aberta, com estruturas montadas (palco, tendas, arquibancadas)", "aberta"], NS],
      when: function (S) { return obj(S) === "evt"; } },
    { id: "ev_pub", etapa: 2, q: "Público do evento", type: "choice",
      text: "Qual o <strong>público máximo</strong> esperado ao mesmo tempo?",
      opts: [["Até 100 pessoas", "ate100"], ["De 101 a 1.000 pessoas", "101a1000"], ["Mais de 1.000 pessoas", "mais1000"], NS],
      when: function (S) { return obj(S) === "evt"; } },
    { id: "ev_estr", etapa: 2, q: "Estruturas do evento", type: "multi",
      text: "Quais <strong>estruturas ou equipamentos</strong> o evento terá?",
      opts: [["Palco", "palco"], ["Arquibancada ou camarote", "arquib"], ["Tenda ou lona (cobertura)", "lona"], ["Brinquedos (parque)", "brinq"], ["Gerador de energia", "gerador"], ["Trio elétrico ou palco móvel", "trio"], ["Cozinha ou uso de gás", "gas"]],
      none: ["Nenhuma destas", "nenhum"],
      when: function (S) { return obj(S) === "evt"; } },
    { id: "ev_fogos", etapa: 2, q: "Fogos ou chama", type: "choice",
      text: "Haverá <strong>fogos de artifício</strong> ou <strong>máquinas de chama</strong> (fire machine)?",
      opts: [["Não", "nao"], ["Fogos de artifício", "fogos"], ["Máquinas de chama", "chama"], ["Os dois", "ambos"], NS],
      when: function (S) { return obj(S) === "evt"; } },
    { id: "ev_prazo", etapa: 3, q: "Antecedência do evento", type: "choice",
      text: "Quanto tempo falta para o evento?",
      opts: [["Mais de 10 dias", "mais10"], ["Entre 3 e 10 dias", "3a10"], ["Menos de 3 dias", "menos3"], NS],
      when: function (S) { return obj(S) === "evt"; } },

    /* ---------- LTV / prazo / TAAP ---------- */
    { id: "ltv_sit", etapa: 1, q: "Situação das exigências", type: "choice",
      text: "Qual é a sua situação?",
      opts: [["Recebi o LTV com exigências e ainda estou no prazo", "no_prazo"], ["Preciso de mais prazo (1ª prorrogação)", "prorrog1"], ["Já tive prorrogação e preciso de outra", "prorrog2"], ["Os prazos acabaram e não consegui cumprir (TAAP)", "taap"], ["Já tenho TAAP e preciso revalidar", "taap_reval"], NS],
      when: function (S) { return obj(S) === "ltv"; } },

    /* ---------- Sanções ---------- */
    { id: "rec_tipo", etapa: 1, q: "Documento recebido", type: "choice",
      text: "O que você recebeu?",
      opts: [["Auto de infração / multa", "multa"], ["Termo de interdição", "interd"], ["Embargo", "embargo"], ["Apreensão", "apreensao"], ["Projeto reprovado (LTA) — quero contestar", "lta"], ["Outro", "outro"]],
      when: function (S) { return obj(S) === "rec"; } },

    /* ---------- Comum ---------- */
    { id: "req", etapa: 3, q: "Quem é o requerente", type: "choice",
      text: "Quem é o responsável pelo pedido?",
      opts: [["Empresa ou pessoa privada", "privado"], ["Órgão ou entidade pública", "publico"], ["Microempreendedor individual (MEI)", "mei"], NS],
      when: function (S) { var o = obj(S); return (o === "reg" || o === "alt" || o === "ren" || o === "evt" || o === "ltv" || o === "info") && (o !== "reg" && o !== "alt" && o !== "info" || naoCasa(S)); } },
    { id: "proc", etapa: 3, q: "Pedido feito por procurador", type: "choice",
      text: "O pedido será feito por um <strong>procurador</strong> (alguém representando o proprietário ou a empresa)?",
      opts: [["Não", "nao"], ["Sim", "sim"], NS],
      when: function (S) { var o = obj(S); return o !== "info" && o !== "rec" && (o !== "reg" && o !== "alt" || naoCasa(S)); } }
  ];

  var IDX = {}; PB.PERGUNTAS.forEach(function (p, i) { IDX[p.id] = p; p.ord = i; });
  PB.P = IDX;

  /* Perguntas aplicáveis em ordem; para na primeira não respondida. */
  PB.caminhoPerguntas = function (S) {
    var out = [];
    for (var i = 0; i < PB.PERGUNTAS.length; i++) {
      var p = PB.PERGUNTAS[i];
      if (!p.when(S)) continue;
      out.push(p.id);
      if (!has(S, p.id)) return { feitas: out.slice(0, -1), proxima: p.id };
    }
    return { feitas: out, proxima: null };
  };

  /* Remove respostas que deixaram de ser alcançáveis (após edição). */
  PB.limparDependentes = function (S) {
    var mudou = true;
    while (mudou) {
      mudou = false;
      var ok = {};
      PB.PERGUNTAS.forEach(function (p) { if (p.when(S)) ok[p.id] = 1; });
      Object.keys(S.a).forEach(function (k) { if (!ok[k]) { delete S.a[k]; mudou = true; } });
    }
  };

  PB.rotuloResposta = function (id, val) {
    var p = IDX[id]; if (!p) return String(val);
    if (val === "?") return "Não sei";
    if (p.type === "number") return String(val).replace(".", ",") + " " + (p.unit || "");
    if (p.type === "mun") return val;
    if (p.type === "search") {
      if (val === "outra") return "Outra atividade";
      for (var i = 0; i < PB.ATIVIDADES.length; i++) if (PB.ATIVIDADES[i][0] === val) return PB.ATIVIDADES[i][1];
      return val;
    }
    if (p.type === "multi") {
      if (!Array.isArray(val)) return String(val);
      if (val[0] === "nenhum") return p.none[0];
      return val.map(function (x) { for (var i = 0; i < p.opts.length; i++) if (p.opts[i][1] === x) return p.opts[i][0]; return x; }).join("; ");
    }
    for (var j = 0; j < p.opts.length; j++) if (p.opts[j][1] === val) return p.opts[j][0];
    return String(val);
  };

  /* Validação de uma resposta (usada também ao importar códigos). */
  PB.validaResposta = function (id, val) {
    var p = IDX[id]; if (!p) return false;
    if (val === "?") return p.type === "choice" ? p.opts.some(function (o) { return o[1] === "?"; }) : true;
    switch (p.type) {
      case "number": return typeof val === "number" && isFinite(val) && val >= p.min && val <= p.max;
      case "mun": return PB.MUNICIPIOS.indexOf(val) >= 0;
      case "search": return val === "outra" || PB.ATIVIDADES.some(function (a) { return a[0] === val; });
      case "choice": return p.opts.some(function (o) { return o[1] === val; });
      case "multi":
        if (!Array.isArray(val) || !val.length) return false;
        if (val.length === 1 && val[0] === p.none[1]) return true;
        var vals = p.opts.map(function (o) { return o[1]; });
        return val.every(function (x) { return vals.indexOf(x) >= 0; }) && new Set(val).size === val.length;
    }
    return false;
  };
})(window);

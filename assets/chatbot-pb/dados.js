/* =====================================================================
   AVCB Paraíba — base de dados do chatbot (fontes, perguntas, documentos)
   Origem: especificação "testes/teste 2" (30/10/2026).
   Estado: interpretação proposta — aguarda validação do responsável técnico.
   Nada aqui é regra de Pernambuco.
   ===================================================================== */
(function (W) {
  "use strict";
  var PB = W.PB = W.PB || {};

  PB.VERSAO = {
    esquema: 1,
    regras: "2026.11.10",
    conteudo: "2026.11.10",
    corte: "10/11/2026",
    regrasConhecidas: ["2026.10.30", "2026.11.06", "2026.11.10"]
  };

  PB.CONTATO = {
    empresa: "Sá Moraes Engenharia",
    whatsapp: "5581997460029",
    whatsappTexto: "(81) 99746-0029",
    site: "https://avcbparaiba.com.br/",
    chatbot: "https://avcbparaiba.com.br/chatbot.html",
    oficial: "https://samoraesengenharia.com.br/",
    responsavelTecnico: "Victor Moraes",
    validacaoTecnica: "pendente" /* mudar para "validada" só após a revisão do RT */
  };

  PB.MUNICIPIOS = ["Água Branca", "Aguiar", "Alagoa Grande", "Alagoa Nova", "Alagoinha", "Alcantil", "Algodão de Jandaíra", "Alhandra", "Amparo", "Aparecida", "Araçagi", "Arara", "Araruna", "Areia", "Areia de Baraúnas", "Areial", "Aroeiras", "Assunção", "Baía da Traição", "Bananeiras", "Baraúna", "Barra de Santa Rosa", "Barra de Santana", "Barra de São Miguel", "Bayeux", "Belém", "Belém do Brejo do Cruz", "Bernardino Batista", "Boa Ventura", "Boa Vista", "Bom Jesus", "Bom Sucesso", "Bonito de Santa Fé", "Boqueirão", "Borborema", "Brejo do Cruz", "Brejo dos Santos", "Caaporã", "Cabaceiras", "Cabedelo", "Cachoeira dos Índios", "Cacimba de Areia", "Cacimba de Dentro", "Cacimbas", "Caiçara", "Cajazeiras", "Cajazeirinhas", "Caldas Brandão", "Camalaú", "Campina Grande", "Capim", "Caraúbas", "Carrapateira", "Casserengue", "Catingueira", "Catolé do Rocha", "Caturité", "Conceição", "Condado", "Conde", "Congo", "Coremas", "Coxixola", "Cruz do Espírito Santo", "Cubati", "Cuité", "Cuité de Mamanguape", "Cuitegi", "Curral de Cima", "Curral Velho", "Damião", "Desterro", "Diamante", "Dona Inês", "Duas Estradas", "Emas", "Esperança", "Fagundes", "Frei Martinho", "Gado Bravo", "Guarabira", "Gurinhém", "Gurjão", "Ibiara", "Igaracy", "Imaculada", "Ingá", "Itabaiana", "Itaporanga", "Itapororoca", "Itatuba", "Jacaraú", "Jericó", "João Pessoa", "Joca Claudino", "Juarez Távora", "Juazeirinho", "Junco do Seridó", "Juripiranga", "Juru", "Lagoa", "Lagoa de Dentro", "Lagoa Seca", "Lastro", "Livramento", "Logradouro", "Lucena", "Mãe d'Água", "Malta", "Mamanguape", "Manaíra", "Marcação", "Mari", "Marizópolis", "Massaranduba", "Mataraca", "Matinhas", "Mato Grosso", "Maturéia", "Mogeiro", "Montadas", "Monte Horebe", "Monteiro", "Mulungu", "Natuba", "Nazarezinho", "Nova Floresta", "Nova Olinda", "Nova Palmeira", "Olho d'Água", "Olivedos", "Ouro Velho", "Parari", "Passagem", "Patos", "Paulista", "Pedra Branca", "Pedra Lavrada", "Pedras de Fogo", "Pedro Régis", "Piancó", "Picuí", "Pilar", "Pilões", "Pilõezinhos", "Pirpirituba", "Pitimbu", "Pocinhos", "Poço Dantas", "Poço de José de Moura", "Pombal", "Prata", "Princesa Isabel", "Puxinanã", "Queimadas", "Quixabá", "Remígio", "Riachão", "Riachão do Bacamarte", "Riachão do Poço", "Riacho de Santo Antônio", "Riacho dos Cavalos", "Rio Tinto", "Salgadinho", "Salgado de São Félix", "Santa Cecília", "Santa Cruz", "Santa Helena", "Santa Inês", "Santa Luzia", "Santa Rita", "Santa Teresinha", "Santana de Mangueira", "Santana dos Garrotes", "Santo André", "São Bentinho", "São Bento", "São Domingos", "São Domingos do Cariri", "São Francisco", "São João do Cariri", "São João do Rio do Peixe", "São João do Tigre", "São José da Lagoa Tapada", "São José de Caiana", "São José de Espinharas", "São José de Piranhas", "São José de Princesa", "São José do Bonfim", "São José do Brejo do Cruz", "São José do Sabugi", "São José dos Cordeiros", "São José dos Ramos", "São Mamede", "São Miguel de Taipu", "São Sebastião de Lagoa de Roça", "São Sebastião do Umbuzeiro", "São Vicente do Seridó", "Sapé", "Serra Branca", "Serra da Raiz", "Serra Grande", "Serra Redonda", "Serraria", "Sertãozinho", "Sobrado", "Solânea", "Soledade", "Sossêgo", "Sousa", "Sumé", "Tacima", "Taperoá", "Tavares", "Teixeira", "Tenório", "Triunfo", "Uiraúna", "Umbuzeiro", "Várzea", "Vieirópolis", "Vista Serrana", "Zabelê"];

  var U = "https://bravo.bombeiros.pb.gov.br/portal/wp-content/uploads/";
  /* conf: "P" = conferido no PDF na análise de 30/10/2026; "L" = lido na base, conferir antes de validar */
  PB.FONTES = {
    lei9625: { t: "Lei Estadual nº 9.625/2011 — compilada (redação da MP nº 366/2026)", u: U + "2026/10/Lei-Estadual-9.625-2011-Compilada-Redacao-dada-pela-Medida-Provisoria-n-366-de-13-de-Outubro-de-2026.pdf", conf: "P" },
    mp366: { t: "Medida Provisória nº 366/2026 (TAAP) — em tramitação na ALPB", u: U + "2026/10/Medida-Provisoria-366.2026.pdf", conf: "P" },
    nt07e: { t: "Norma Técnica nº 07/2024 — Integração do CBMPB à REDESIM (com alterações da Portaria 042/2024)", u: U + "2024/11/NT-07-Diretrizes-de-Integracao-do-CBMPB-a-REDESIM.pdf", conf: "P" },
    an0124: { t: "Atualização Normativa nº 001/2024 (Portaria 042/2024) — altera a NT 07", u: U + "2024/10/Atualizacao-Normativa-no-001.2024.pdf", conf: "P" },
    nt11: { t: "Norma Técnica nº 11/2014 — Procedimentos administrativos (consolidada, AN 001/2026)", u: U + "2026/06/NT-11-2014-Atualizacao-Normativa-no-001-2026.pdf", conf: "P" },
    an0126: { t: "Atualização Normativa nº 001/2026 — NT 11 (cessão de projetos)", u: U + "2026/04/Atualizacao-Normativa-001.2026-1.pdf", conf: "L" },
    nt04: { t: "Norma Técnica nº 04/2023 — Medidas de segurança e classificação das edificações", u: U + "2023/07/NT-04-2023-CBMPB.pdf", conf: "P" },
    nt02: { t: "Norma Técnica nº 02/2023 — Classificação quanto ao risco e à carga de incêndio (validade das inspeções)", u: U + "2023/09/NT-02-2023-CBMPB.pdf", conf: "P" },
    port08: { t: "Portaria nº 008/2026-DSPCI — Centralização da análise de projetos", u: U + "2026/07/Portaria-08-assinada.pdf", conf: "P" },
    port046: { t: "Portaria nº 046/2024 — Prorrogação de prazo e AFP", u: U + "2024/05/Portaria-n-046-2024-GCG-QCG.pdf", conf: "L" },
    cartTaap: { t: "Cartilha informativa do TAAP (MP 366/2026) — CBMPB", u: U + "2026/10/CARTILHA-TAAP-Medida-Provisoria-no-366.2026.pdf", conf: "P" },
    port163: { t: "Portaria nº 163/2026 — TAAP (revoga a Portaria 22/2025)", u: U + "2026/10/Portaria-no-163-2026-TAAP.pdf", conf: "P" },
    port005: { t: "Portaria nº 005/2026 — Memorial descritivo e anexos", u: U + "2026/05/Portaria-no-005-2026.pdf", conf: "L" },
    port009: { t: "Portaria nº 009/2026 — Termo do profissional blaster", u: U + "2026/07/portaria-09-assinada.pdf", conf: "L" },
    port006: { t: "Portaria nº 006/2026 — Fiscalização de máquinas de chama", u: U + "2026/05/PORTARIA-No-006-2026.pdf", conf: "L" },
    port010: { t: "Portaria nº 010/2026 — Termo de controle de público", u: U + "2026/07/PORTARIA-No10.2026.pdf", conf: "L" },
    port060: { t: "Portaria nº 060/2025 — Embargo", u: U + "2025/09/PORTARIA-060_2025.docx-1.pdf", conf: "L" },
    port061: { t: "Portaria nº 061/2025 — Interdição e desinterdição", u: U + "2025/09/PORTARIA-061_2025.docx.pdf", conf: "L" },
    port003: { t: "Portaria nº 003/2026 — Apreensão", u: U + "2026/07/Portaria-no-03.2026-Apreensao.pdf", conf: "L" },
    an005: { t: "Atualização Normativa nº 005/2024 — Eventos temporários", u: U + "2024/11/ATUALIZACAO-NORMATIVA-005-2024-CBMPB.pdf", conf: "L" },
    rt02: { t: "Resolução Técnica nº 02 — Salas PTS em prédio comercial; G-3", u: U + "2024/10/RESOLUCAO-TECNICA-02.pdf", conf: "P" },
    rt04: { t: "Resolução Técnica nº 04 — Isenção de PCI e ART para Baixo Risco A", u: U + "2024/10/RESOLUCAO-TECNICA-04_.pdf", conf: "P" },
    rt05: { t: "Resolução Técnica nº 05 — Substituição do PTS por Vistoria Comum", u: U + "2024/11/RESOLUCAO-TECNICA-05_assinada.pdf", conf: "P" },
    rt19: { t: "Resolução Técnica nº 19 — Termos de eventos", u: U + "2025/01/RESOLUCAO-TECNICA-19_assinada.pdf", conf: "L" },
    rt21: { t: "Resolução Técnica nº 21 — Líquidos inflamáveis (adoção da IT 25)", u: U + "2025/05/Resolucao-Tecnica-No-21.pdf", conf: "L" },
    rt23: { t: "Resolução Técnica nº 23 — Usinas fotovoltaicas", u: U + "2025/05/Resolucao-Tecnica-No-23.pdf", conf: "P" },
    rt24: { t: "Resolução Técnica nº 24 — ART/RRT de outro estado", u: U + "2025/08/RESOLUCAO-TECNICA-24-1.pdf", conf: "L" },
    rt28: { t: "Resolução Técnica nº 28 — Edificações isoladas com hidrantes compartilhados", u: U + "2025/12/RESOLUCAO-TECNICA-28.pdf", conf: "L" },
    rt29: { t: "Resolução Técnica nº 29 — Notas de SAVE em certificados", u: U + "2026/01/RESOLUCAO-TECNICA-29.pdf", conf: "L" },
    rt30: { t: "Resolução Técnica nº 30 — Máquinas de chama (revoga a RT 27)", u: U + "2026/05/RESOLUCAO-TECNICA-30.docx.pdf", conf: "L" },
    nt05: { t: "Norma Técnica nº 05 — Trios elétricos e palcos móveis", u: U + "2020/12/NT-DAT-005-Trios-eletricos.pdf", conf: "L" },
    nt01f: { t: "Norma Técnica nº 01/2018 — Comércio de fogos e espetáculos pirotécnicos", u: U + "2021/12/NT-No-0012018-Comercio-de-Fogos-de-Artificio-e-Espetaculos-Pirotecnicos.pdf", conf: "L" },
    nt13: { t: "Norma Técnica nº 13 — Gerenciamento de riscos de incêndio", u: U + "2023/12/NT-13-CBMPB-Gerenciamento-de-Riscos-de-Incendios.pdf", conf: "L" },
    nt16: { t: "Norma Técnica nº 16 — Adaptação de edificações existentes", u: U + "2020/12/NT-16-2018-Adaptacao-as-Normas-de-Seguranca-Contra-Incendio-e-Panico_Atualizada-2019-1.pdf", conf: "L" },
    nt17: { t: "Norma Técnica nº 17 — Brigada de incêndio", u: U + "2024/11/NT-17-Brigada-de-Incendio.pdf", conf: "L" },
    nt20: { t: "Norma Técnica nº 20 — Separação entre edificações (isolamento de risco)", u: U + "2023/10/NT-20-CBMPB-Separacao-entre-Edificacoes-Isolamento-de-Risco-1.pdf", conf: "L" },
    nt23: { t: "Norma Técnica nº 23 — Inspeção visual das instalações elétricas", u: U + "2024/01/NT-23-2024-CBMPB-Inspecao-Visual-em-Instalacoes-Eletricas-de-Baixa-Tensao.pdf", conf: "L" },
    nt24: { t: "Norma Técnica nº 24 — Patrimônio histórico e cultural", u: U + "2024/03/NT-24-2024-CBMPB-Seguranca-contra-Incendio-em-Edificacoes-que-compoem-Patrimonio-Historico-e-Cul.pdf", conf: "L" },
    nt25: { t: "Norma Técnica nº 25 — Subestação elétrica", u: U + "2024/11/NT-25-2024-Substacao-Eletrica.pdf", conf: "L" },
    nt31: { t: "Norma Técnica nº 31 — Produtos perigosos", u: U + "2024/12/NT-31-2024-Produtos-perigosos-em-edificacoes-e-areas-de-risco.pdf", conf: "L" },
    nt32: { t: "Norma Técnica nº 32 — Cozinha profissional", u: U + "2024/12/NT-32-2024-Seguranca-contra-incendio-em-cozinha-profissional.pdf", conf: "L" },
    nt35: { t: "Norma Técnica nº 35 — Gás natural", u: U + "2024/12/NT-35-Comercializacao-distribuicao-e-utilizacao-de-gas-natural.pdf", conf: "L" },
    nt40: { t: "Norma Técnica nº 40/2025 — Garagens e recarga de veículos elétricos (SAVE)", u: U + "2025/12/NT-40-2025-Ocupacoes-Destinadas-a-Garagens-e-Locais-com-Sistemas-de-Alimentacao-de-Veiculos-Eletricos-SAVE.pdf", conf: "L" },
    modelos: { t: "CBMPB — Modelos de requerimentos e termos", u: "https://bravo.bombeiros.pb.gov.br/portal/modelos-de-requerimentos/", conf: "L" },
    memorial: { t: "CBMPB — Memorial descritivo", u: "https://bravo.bombeiros.pb.gov.br/portal/memorial-descritivo/", conf: "L" },
    procedimentos: { t: "CBMPB — Procedimentos administrativos", u: "https://bravo.bombeiros.pb.gov.br/portal/procedimentos-administrativos/", conf: "L" },
    normas: { t: "CBMPB — Leis e normas técnicas (catálogo oficial)", u: "https://bravo.bombeiros.pb.gov.br/portal/normas-tecnicas/", conf: "P" },
    resolucoes: { t: "CBMPB — Resoluções técnicas", u: "https://bravo.bombeiros.pb.gov.br/portal/resolucoes-tecnicas/", conf: "L" },
    consultaCert: { t: "CBMPB — Consulta de certificado", u: "https://bravo.bombeiros.pb.gov.br/portal/consulta-de-certificado-edificacoes-eventos/", conf: "L" },
    bravo: { t: "Sistema BRAVO do CBMPB (acesso do usuário)", u: "https://bravo.bombeiros.pb.gov.br/bravoDat/acessoUsuario/", conf: "L" },
    faqEV: { t: "CBMPB — FAQ veículos eletrificados", u: "https://bravo.bombeiros.pb.gov.br/portal/faq-veiculos-eletrificados/", conf: "L" }
  };

  /* Modelos oficiais (catálogo de modelos do CBMPB consultado em 29/10/2026) */
  PB.MODELOS = {
    prorrog1Pub: { t: "1ª prorrogação de prazo — órgãos públicos", u: U + "2026/08/1a-PRORROGACAO-DE-PRAZO-ORGAO-PUBLICO.pdf" },
    prorrog1Priv: { t: "1ª prorrogação de prazo — estabelecimentos privados", u: U + "2026/08/1a-PRORROGACAO-DE-PRAZO-ESTABELECIMENTO-PRIVADO.pdf" },
    prorrog2Pub: { t: "2ª prorrogação de prazo — órgãos públicos", u: U + "2026/08/2a-PRORROGACAO-DE-PRAZO-ORGAOS-PUBLICOS.pdf" },
    prorrog2Priv: { t: "2ª prorrogação de prazo — estabelecimentos privados", u: U + "2026/08/2a-PRORROGACAO-DE-PRAZO-ESTABELECIMENTO-PRIVADO.pdf" },
    taapReq: { t: "Requerimento de TAAP", u: U + "2026/10/REQUERIMENTO-TAAP.docx" },
    taapReval: { t: "Requerimento de revalidação do TAAP", u: U + "2026/10/REQUERIMENTO-DE-REVALIDACAO-TAAP.docx" },
    taapLaudo: { t: "Laudo técnico de inviabilidade, avaliação de riscos e medidas compensatórias", u: U + "2025/02/LAUDO-TECNICO-DE-INVIABILIDADE-AVALIACAO-DE-RISCOS-E-MEDIDAS-COMPENSATORIAS.docx" },
    cronograma: { t: "Cronograma de execução", u: U + "2025/02/CRONOGRAMA-DE-EXECUCAO-1.docx" },
    termoEvtReg: { t: "Termo de responsabilidade de evento temporário — regularização", u: U + "2024/11/Termo-de-responsabilidade-Processo-de-Regularizacao.pdf" },
    termoEvtFisc: { t: "Termo de responsabilidade de evento temporário — fiscalização", u: U + "2026/08/TERMO-DE-RESPONSABILIDADE-PARA-EVENTOS-E-INSTALACOES-TEMPORARIAS.pdf" },
    termoPublico: { t: "Termo de responsabilidade para controle de público", u: U + "2026/07/TERMO-DE-RESPONSABILIDADE-CONTROLE-DE-PUBLICO.docx.pdf" },
    termoBlaster: { t: "Termo de responsabilidade do profissional blaster", u: U + "2026/07/TERMO-DE-RESPONSABILIDADE-BLASTER.docx.pdf" },
    termoFogos: { t: "Termo de responsabilidade para fogos de artifício e espetáculos pirotécnicos", u: U + "2025/06/TERMO-DE-RESPONSABILIDADE-PARA-FOGOS-DE-ARTIFICIO-E-ESPETACULOS-PIROTECNICOS-2-1-1.docx.pdf" },
    atestadoEletrico: { t: "Atestado de Conformidade das Instalações Elétricas (Anexo A da NT 23)", u: U + "2024/01/Anexo-A-Atestado-de-Conformidade-das-Instalacoes-Eletricas.pdf" },
    termoCompromisso: { t: "Atesto e termo de compromisso", u: U + "2024/06/MODELO-TERMO-DE-RESPONSABILIDADE-E-COMPROMISSO.pdf" },
    atendimentoTecnico: { t: "Formulário para atendimento técnico", u: U + "2026/08/FORMULARIO-PARA-ATENDIMENTO-TECNICO.pdf" },
    consultaTecnica: { t: "Formulário de consulta técnica", u: U + "2026/07/Formulario-consulta-atualizado.pdf" }
  };

  /* NT 04/2023, Tabela 1 (conferida no PDF, pp. 7–9) */
  PB.DIVISOES = {
    "A-1": "Habitação unifamiliar", "A-2": "Habitação multifamiliar", "A-3": "Habitação coletiva (até 16 leitos)",
    "B-1": "Hotel e assemelhado", "B-2": "Hotel residencial",
    "C-1": "Comércio com carga de incêndio nível I", "C-2": "Comércio com carga de incêndio níveis II e III (até 1.500 m²)", "C-3": "Centro de compras (acima de 1.500 m²)",
    "D-1": "Serviço profissional / condução de negócios", "D-2": "Agência bancária", "D-3": "Serviço de reparação", "D-4": "Laboratório",
    "E-1": "Escola em geral", "E-2": "Escola especial", "E-3": "Espaço para cultura física", "E-4": "Centro de treinamento profissional", "E-5": "Pré-escola", "E-6": "Escola para pessoas com deficiência",
    "F-1": "Local com objeto de valor inestimável", "F-2": "Local religioso e velório", "F-3": "Centro esportivo e de exibição", "F-4": "Estação e terminal de passageiros", "F-5": "Arte cênica e auditório", "F-6": "Clube social e salão de festas", "F-7": "Instalação temporária", "F-8": "Local para refeição", "F-9": "Recreação pública", "F-10": "Exposição de objetos e animais", "F-11": "Boate",
    "G-1": "Garagem sem acesso de público e sem abastecimento", "G-2": "Garagem com acesso de público e sem abastecimento", "G-3": "Local com abastecimento de combustível", "G-4": "Serviço de conservação, manutenção e reparos", "G-5": "Hangar",
    "H-1": "Hospital veterinário e assemelhados", "H-2": "Local onde pessoas requerem cuidados especiais", "H-3": "Hospital e assemelhado (com internação)", "H-4": "Repartição pública, forças armadas e policiais", "H-5": "Local com restrição de liberdade", "H-6": "Clínica e consultório (sem internação)",
    "I-1": "Indústria — carga de incêndio nível I", "I-2": "Indústria — carga de incêndio nível II", "I-3": "Indústria — carga de incêndio nível III",
    "J-1": "Depósito de material incombustível", "J-2": "Depósito — carga nível I", "J-3": "Depósito — carga nível II", "J-4": "Depósito — carga nível III (inclui revenda de GLP)",
    "K-1": "Subestação elétrica", "L-1": "Comércio de fogos de artifício", "L-2": "Indústria de explosivos", "L-3": "Depósito de explosivos", "L-4": "Show pirotécnico",
    "M-1": "Túnel", "M-2": "Tanques ou parque de tanques", "M-3": "Central de comunicação", "M-4": "Canteiro de obras", "M-5": "Silos", "M-6": "Floresta nativa ou cultivada", "M-7": "Pátio de contêineres"
  };
  /* NT 02/2023, Anexo B (conferido no PDF, pp. 5–7): risco e validade da inspeção por divisão.
     F-3: alto só para estádio de futebol; demais casos, médio (tratado no fluxo). */
  PB.RISCO_NT02 = {
    "A-1":"baixo","A-2":"baixo","A-3":"baixo","B-1":"medio","B-2":"medio",
    "C-1":"baixo","C-2":"medio","C-3":"alto",
    "D-1":"medio","D-2":"medio","D-3":"medio","D-4":"medio",
    "E-1":"medio","E-2":"medio","E-3":"medio","E-4":"medio","E-5":"medio","E-6":"medio",
    "F-1":"medio","F-2":"medio","F-4":"medio","F-5":"medio","F-6":"medio","F-7":"alto","F-8":"medio","F-9":"medio","F-10":"medio","F-11":"alto",
    "G-1":"medio","G-2":"medio","G-3":"medio","G-4":"medio","G-5":"medio",
    "H-1":"medio","H-2":"medio","H-3":"alto","H-4":"medio","H-5":"medio","H-6":"medio",
    "I-1":"baixo","I-2":"medio","I-3":"alto",
    "J-1":"baixo","J-2":"baixo","J-3":"medio","J-4":"alto",
    "K-1":"medio","L-1":"medio","L-2":"alto","L-3":"alto","L-4":"alto",
    "M-1":"medio","M-2":"medio","M-3":"medio","M-4":"medio","M-5":"medio","M-6":"medio","M-7":"medio"
  };
  PB.RISCO_ANOS = { baixo: 5, medio: 2, alto: 1 };
  PB.RISCO_NOME = { baixo: "baixo", medio: "médio", alto: "alto" };
  /* NT 02/2023, Anexo A */
  PB.CARGA_NIVEIS = { "1": "nível I (até 300 MJ/m²)", "2": "nível II (acima de 300 até 1.200 MJ/m²)", "3": "nível III (acima de 1.200 MJ/m²)" };

  /* NT 11, item 5.1.5.1.4 (conferido no PDF, pp. 8–9) */
  PB.PCIS_DIVS = ["A-1","A-2","A-3","C-1","C-2","D-1","D-2","D-3","E-1","E-2","E-3","E-4","E-5","E-6","F-8","F-9","G-1","G-2","H-1","H-6","I-1","I-2","J-1","J-2","J-3"];
  /* Divisões que exigem encaminhamento técnico por risco especial (CAM-25) */
  PB.DIVS_ESPECIAIS = ["G-3","G-5","H-5","I-3","J-4","K-1","L-1","L-2","L-3","L-4","M-1","M-2","M-3","M-4","M-5","M-6","M-7","F-7"];

  /* Atividades para busca → divisão provável (exemplos da NT 04, Tabela 1).
     A classificação final é feita no projeto; "Outra" leva à escolha do grupo. */
  PB.ATIVIDADES = [
    ["loja_roupas","Loja de roupas, calçados ou acessórios","C-2","vestuario confeccao boutique sapataria"],
    ["loja_geral","Loja / comércio varejista em geral","C-2","comercio varejo lojas"],
    ["mercadinho","Mercadinho, mercearia ou minimercado","C-2","mercearia bodega"],
    ["supermercado","Supermercado","C-2","atacarejo hipermercado"],
    ["padaria","Padaria ou confeitaria","C-2","panificadora"],
    ["farmacia","Farmácia ou drogaria","C-2","drogaria"],
    ["armarinho","Armarinho, papelaria, bazar","C-2","papelaria bazar presentes"],
    ["loja_metal","Loja de ferragens, metais, louças ou artigos hospitalares","C-1","ferragens louças material hospitalar"],
    ["mat_construcao","Loja de material de construção","C-2","materiais de construcao home center"],
    ["moveis","Loja de móveis, colchões ou eletrodomésticos","C-2","colchoes eletro"],
    ["autopecas","Loja de autopeças ou acessórios","C-2","pecas automotivas"],
    ["shopping","Shopping center, galeria ou centro comercial (acima de 1.500 m²)","C-3","mall galeria centro de compras"],
    ["escritorio","Escritório (administrativo, contábil, advocacia, técnico)","D-1","consultoria contabilidade advocacia coworking"],
    ["salao_beleza","Salão de beleza, barbearia, estética","D-1","cabeleireiro barbearia manicure"],
    ["banco","Agência bancária, lotérica ou correspondente","D-2","banco loterica caixa"],
    ["assist_tecnica","Assistência técnica, chaveiro, lavanderia","D-3","conserto celular eletronicos lavanderia"],
    ["laboratorio","Laboratório (análises clínicas sem internação, químico, fotográfico)","D-4","exames analises"],
    ["escola","Escola, faculdade ou curso preparatório","E-1","colegio universidade cursinho"],
    ["curso_idiomas","Curso de idiomas, artes ou escola especial","E-2","ingles musica artes"],
    ["academia","Academia, estúdio de dança, pilates, artes marciais ou fisioterapia","E-3","musculacao crossfit pilates fisioterapia luta"],
    ["escola_prof","Escola profissionalizante ou centro de treinamento","E-4","senai senac tecnico"],
    ["creche","Creche, berçário ou educação infantil","E-5","pre-escola jardim de infancia maternal"],
    ["escola_especial","Escola para pessoas com deficiência","E-6","apae"],
    ["museu","Museu, biblioteca ou centro de documentação","F-1","acervo arquivo"],
    ["igreja","Igreja, templo, capela ou velório","F-2","religioso funeraria cemiterio"],
    ["ginasio","Ginásio, estádio ou arena com arquibancada","F-3","quadra com arquibancada estadio"],
    ["terminal","Rodoviária, terminal ou estação de passageiros","F-4","rodoviaria aeroporto porto"],
    ["teatro","Teatro, cinema ou auditório","F-5","cinema auditorio"],
    ["salao_festas","Salão de festas, buffet ou clube social","F-6","buffet clube eventos recepcao"],
    ["restaurante","Restaurante, lanchonete, bar ou café","F-8","bar lanchonete pizzaria cafeteria hamburgueria"],
    ["parque","Parque recreativo, zoológico ou brinquedoteca","F-9","recreacao zoologico"],
    ["exposicao","Salão de exposição de objetos ou animais","F-10","exposicao feira permanente"],
    ["boate","Boate, casa noturna ou danceteria","F-11","balada discoteca"],
    ["estacionamento_priv","Garagem/estacionamento sem acesso de público (manobrista, automático)","G-1","garagem manobrista"],
    ["estacionamento","Estacionamento com acesso de público (sem abastecimento)","G-2","estacionamento rotativo"],
    ["posto","Posto de combustível","G-3","posto de gasolina abastecimento"],
    ["oficina","Oficina mecânica, borracharia ou lava-jato","G-4","mecanica funilaria borracharia"],
    ["hangar","Hangar","G-5","aeronaves"],
    ["veterinaria","Clínica ou hospital veterinário, pet shop com alojamento","H-1","veterinario petshop"],
    ["ilpi","Asilo, ILPI, abrigo ou clínica de recuperação","H-2","casa de repouso idosos dependentes quimicos"],
    ["hospital","Hospital, pronto-socorro ou clínica com internação","H-3","upa maternidade internacao"],
    ["reparticao","Repartição pública, fórum, cartório, delegacia ou quartel","H-4","orgao publico tribunal cartorio"],
    ["presidio","Presídio, cadeia ou unidade socioeducativa","H-5","penitenciaria"],
    ["clinica","Clínica, consultório médico/odontológico (sem internação)","H-6","consultorio dentista medico hemodialise"],
    ["hotel","Hotel, pousada, motel, hostel ou albergue","B-1","pousada motel hostel"],
    ["apart_hotel","Apart-hotel ou flat","B-2","flat"],
    ["pensionato","Pensionato, república, alojamento ou convento (até 16 leitos)","A-3","alojamento internato"],
    ["condominio","Condomínio residencial (prédio ou casas)","A-2","edificio apartamentos condominio"],
    ["industria1","Indústria de baixo risco (metal, gesso, serralheria, joias, sucos)","I-1","serralheria metalurgica"],
    ["industria2","Indústria de médio risco (móveis, alimentos, bebidas, marcenaria)","I-2","marcenaria alimentos fabrica"],
    ["industria3","Indústria de alto risco (tintas, borracha, espuma, inflamáveis, grãos)","I-3","quimica tintas borracha"],
    ["deposito_incomb","Depósito de material incombustível (tijolo, areia, cimento, metal)","J-1","deposito material construcao"],
    ["deposito","Depósito ou galpão de mercadorias","J-2","armazem galpao estoque"],
    ["revenda_glp","Revenda de gás de cozinha (GLP)","J-4","deposito de gas botijao"],
    ["subestacao","Subestação elétrica","K-1","energia"],
    ["fogos","Comércio de fogos de artifício","L-1","pirotecnia"],
    ["torre","Central de comunicação ou torre de antena","M-3","telecomunicacoes"],
    ["obra","Canteiro de obras","M-4","construcao"],
    ["silo","Silo ou armazém de grãos","M-5","graos"],
    ["conteiner","Pátio de contêineres","M-7","conteineres"]
  ];

  PB.GRUPOS = [
    ["A","Residencial (moradia coletiva, condomínio)"],["B","Hospedagem"],["C","Comércio"],["D","Serviços profissionais"],
    ["E","Ensino e cultura física"],["F","Reunião de público"],["G","Serviços automotivos"],["H","Saúde e institucional"],
    ["I","Indústria"],["J","Depósito"],["M","Outro uso especial"]
  ];
  PB.GRUPO_DIV_PADRAO = { A:"A-2", B:"B-1", C:"C-2", D:"D-1", E:"E-1", F:"F-6", G:"G-4", H:"H-6", I:"I-2", J:"J-2", M:"M-3" };

  /* -------- Catálogo documental (espelha 05-CATALOGO-DOCUMENTAL.csv) -------- */
  PB.DOCS = {
    "DOC-GER-01": { t: "Cadastro no sistema eletrônico do CBMPB (BRAVO)", d: "Os pedidos são feitos pela internet, no sistema do CBMPB. Tenha em mãos os dados do proprietário, do responsável pelo uso e do imóvel.", f: ["bravo","nt11"], disp: "NT 11, item 5.1.4.1" },
    "DOC-GER-02": { t: "Procuração com firma reconhecida", d: "Necessária quando o pedido for feito por representante (procurador) do proprietário ou do responsável.", f: ["nt07e"], disp: "NT 07, item 10.7.1" },
    "DOC-GER-03": { t: "Comprovante de pagamento da taxa (DAR) ou prova de isenção", d: "A taxa é cobrada pela guia oficial do serviço. Órgãos públicos, algumas entidades e residências unifamiliares podem ser isentos (Lei 9.625, art. 41).", f: ["lei9625","nt11"], disp: "Lei 9.625, arts. 35–41; NT 11, item 6.2.8 b" },
    "DOC-PTS-01": { t: "Formulário eletrônico “Processo Técnico Simplificado” (PTS)", d: "Pedido do Auto de Conformidade de Processo Simplificado (ACPS), feito no sistema do CBMPB com as declarações do proprietário/responsável.", f: ["nt07e"], disp: "NT 07, item 10.1" },
    "DOC-PTS-02": { t: "Declarações do termo do ACPS (área, pavimentos, altura, ocupação)", d: "Informações que constam do Auto de Conformidade (razão social, CNPJ/CPF, área, pavimentos, altura, natureza da ocupação, endereço).", f: ["nt07e"], disp: "NT 07, Anexo A" },
    "DOC-PCI-01": { t: "Projeto arquitetônico (PARQ)", d: "Projeto de arquitetura elaborado por profissional habilitado, conforme as normas do CBMPB.", f: ["nt11"], disp: "NT 11, item 5.1.4.1.1" },
    "DOC-PCI-02": { t: "Projeto das medidas de segurança contra incêndio e pânico", d: "Plantas com as medidas de segurança (saídas, extintores, sinalização, iluminação e demais sistemas exigidos).", f: ["nt11"], disp: "NT 11, item 5.1.4.1.2" },
    "DOC-PCI-03": { t: "Formulário de Segurança contra Incêndio (memorial descritivo)", d: "Descreve as medidas e os materiais. Há modelo oficial do CBMPB.", f: ["nt11","port005","memorial"], disp: "NT 11, item 5.1.4.1.3; Portaria 005/2026" },
    "DOC-PCI-04": { t: "ART ou RRT de elaboração do projeto", d: "Responsabilidade técnica do profissional que elabora o projeto.", f: ["nt11","rt24"], disp: "NT 11, item 5.1.4.1.4" },
    "DOC-PCI-05": { t: "Gerenciamento de risco do SPDA (para-raios) no memorial", d: "Todo PCI deve trazer, no memorial, a análise de risco do sistema de proteção contra descargas atmosféricas.", f: ["nt11"], disp: "NT 11, item 5.7.14" },
    "DOC-PCI-06": { t: "Documento que comprove área, ocupação e data da edificação", d: "Para edificação existente (anterior a 24/06/2012): planta aprovada na prefeitura, IPTU, habite-se ou outro comprovante.", f: ["nt11","nt16","nt04"], disp: "NT 11, item 5.1.4.1.5.2; NT 04, item 6.9" },
    "DOC-PCI-07": { t: "Memorial de cálculo hidráulico", d: "Quando houver hidrantes, mangotinhos ou chuveiros automáticos.", f: ["nt11"], disp: "NT 11, item 5.1.4.1.5.4" },
    "DOC-PCI-08": { t: "Memorial de dimensionamento da carga de incêndio", d: "Para depósitos e similares, ou quando pedido pelo analista.", f: ["nt11"], disp: "NT 11, item 5.1.4.1.5.5" },
    "DOC-PCI-09": { t: "Memorial de lotação e saídas de emergência", d: "Para locais de reunião de público e centros esportivos e de exibição.", f: ["nt11"], disp: "NT 11, itens 5.1.4.1.5.6–7" },
    "DOC-PCI-10": { t: "Memorial de isolamento de risco", d: "Quando o projeto separa edificações do mesmo terreno por isolamento de risco.", f: ["nt11","nt20","rt02","rt28"], disp: "NT 11, item 5.1.4.1.5.8" },
    "DOC-PCI-11": { t: "Memorial de pressurização de escada ou de controle de fumaça", d: "Somente se esses sistemas existirem ou forem exigidos.", f: ["nt11"], disp: "NT 11, itens 5.1.4.1.5.9–10" },
    "DOC-PCI-12": { t: "Autorização da Polícia Civil (DPC) e documentos de fogos/produtos controlados", d: "Inventário de estoque, documento da prefeitura para comércio de fogos e autorização da Polícia Civil, quando houver fogos ou produtos controlados.", f: ["nt11","nt01f"], disp: "NT 11, itens 5.1.4.1.5.1 e 5.1.4.1.5.3" },
    "DOC-PCI-13": { t: "Licença da CNEN para instalação radioativa", d: "Somente para instalações com fontes radioativas, nucleares ou de radiografia industrial.", f: ["nt11"], disp: "NT 11, item 5.1.4.1.5.11" },
    "DOC-PCI-14": { t: "Planilha de informações operacionais e planta das medidas", d: "Podem ser pedidas pelo setor de análise.", f: ["nt11"], disp: "NT 11, itens 5.1.4.1.5.12–13" },
    "DOC-PCIS-01": { t: "PARQ com as medidas de segurança em notas + ART/RRT", d: "No PCIS, as medidas ficam no próprio projeto de arquitetura; o memorial separado é dispensado.", f: ["nt11"], disp: "NT 11, itens 5.1.5.2.4 e 5.1.5.2.6" },
    "DOC-PCIS-02": { t: "Declaração do RT sobre carga de incêndio (indústria/depósito)", d: "Para ocupações I-1, I-2, J-1, J-2 e J-3 no PCIS: nota no PARQ declarando carga de incêndio inferior a 1.200 MJ/m².", f: ["nt11"], disp: "NT 11, item 5.1.5.1.8" },
    "DOC-PCIS-03": { t: "Nota do RT sobre a dispensa de SPDA", d: "Quando a análise de risco dispensar o para-raios, o RT declara a conclusão em nota no PARQ.", f: ["nt11"], disp: "NT 11, item 5.1.5.1.6" },
    "DOC-VIS-01": { t: "ART de instalação ou de manutenção das medidas de segurança", d: "Documento mínimo para pedir vistoria. Instalação: na vistoria final. Manutenção: na renovação do certificado.", f: ["nt11"], disp: "NT 11, itens 6.2.2.2, 6.2.2.3 e 6.2.8 a" },
    "DOC-VIS-02": { t: "Comprovante do emolumento de vistoria", d: "Documento mínimo para pedir vistoria, quando a taxa for devida.", f: ["nt11"], disp: "NT 11, item 6.2.8 b" },
    "DOC-VIS-03": { t: "Projeto aprovado (PCI, PCIS, PTIOT ou PTOTEP)", d: "Referência da vistoria.", f: ["nt11"], disp: "NT 11, item 6.2.1" },
    "DOC-VIS-04": { t: "ARTs específicas dos sistemas instalados", d: "Uma ART para cada sistema existente (ou uma única ART, se houver um só responsável).", f: ["nt11"], disp: "NT 11, itens 6.2.2 a–k e 6.2.2.4" },
    "DOC-VIS-05": { t: "Certificado de brigada de incêndio", d: "Quando a brigada for exigida para a ocupação (NT 17).", f: ["nt11","nt17"], disp: "NT 11, item 6.2.3" },
    "DOC-VIS-06": { t: "Termo de responsabilidade das saídas de emergência", d: "Atesta que as portas de saída abrem no sentido da fuga e ficam abertas durante o evento.", f: ["nt11"], disp: "NT 11, item 6.2.5" },
    "DOC-VIS-07": { t: "Documentos de comércio/armazenamento de fogos", d: "Protocolo do alvará da Polícia Civil ou CR do Exército, memorial das estruturas e licença municipal para comércio de fogos.", f: ["nt11","nt01f"], disp: "NT 11, item 6.2.6" },
    "DOC-VIS-08": { t: "Habilitação do blaster pirotécnico", d: "Cópia da habilitação reconhecida pela Polícia Civil do responsável pela montagem e execução, e termo do blaster.", f: ["nt11","port009"], disp: "NT 11, item 6.2.7; Portaria 009/2026", m: ["termoBlaster"] },
    "DOC-VIS-09": { t: "Atestado de conformidade das instalações elétricas + DRT", d: "Atestado do Anexo A da NT 23, na hipótese prevista pela norma.", f: ["nt23"], disp: "NT 23, item 8.3 e Anexo A", m: ["atestadoEletrico"] },
    "DOC-REN-01": { t: "Declaração de responsabilidade pelas manutenções, com firma reconhecida em cartório (RAS)", d: "Na Renovação Anual Simplificada, o proprietário ou procurador declara que os sistemas aprovados estão mantidos.", f: ["lei9625"], disp: "Lei 9.625, art. 15-A, III e parágrafo único" },
    "DOC-REN-02": { t: "ART de manutenção das medidas de segurança", d: "Exigida quando da renovação do Certificado de Aprovação.", f: ["nt11"], disp: "NT 11, item 6.2.2.3" },
    "DOC-REN-03": { t: "Documentos da renovação do ACPS", d: "O passo a passo e os anexos da renovação do ACPS não foram localizados nas fontes oficiais — confirmar com o CBMPB. Reúna o ACPS anterior e confirme que nada mudou no imóvel.", f: ["lei9625","nt07e"], disp: "Lei 9.625, art. 3º-A, § 1º; NT 07, Anexo A" },
    "DOC-RET-01": { t: "Devolução do certificado original", d: "Para cancelar o certificado e emitir outro com o dado corrigido. O novo mantém a validade do anterior.", f: ["nt11"], disp: "NT 11, item 6.6.3" },
    "DOC-RET-02": { t: "Documento que comprove o dado correto", d: "Ex.: contrato social, cartão CNPJ ou documento do imóvel, conforme o dado corrigido.", f: ["nt11"], disp: "NT 11, item 6.6.3" },
    "DOC-ALT-01": { t: "Projeto aprovado anteriormente e plantas com as alterações", d: "Para avaliar atualização, substituição ou recarimbo do projeto.", f: ["nt11"], disp: "NT 11, itens 5.3–5.5" },
    "DOC-ALT-02": { t: "Autorização do síndico", d: "Para reforma ou alteração em unidade de edificação multifamiliar.", f: ["nt11"], disp: "NT 11, item 5.7.11" },
    "DOC-ALT-03": { t: "Estudo de viabilidade técnica", d: "Quando a modificação alterar ou comprometer a segurança da edificação ou do entorno.", f: ["nt11"], disp: "NT 11, item 5.7.10" },
    "DOC-PRZ-01": { t: "Requerimento de prorrogação com cronograma de execução assinado", d: "Anexado no sistema do CBMPB, assinado pelo proprietário, responsável técnico ou representante.", f: ["lei9625","port046"], disp: "Lei 9.625, art. 15-B, §§ 1º–2º" },
    "DOC-PRZ-02": { t: "Comprovação da inviabilidade de cumprir no prazo", d: "Justificativa de por que as exigências não podem ser cumpridas no prazo do LTV.", f: ["lei9625"], disp: "Lei 9.625, art. 15-B, § 1º" },
    "DOC-PRZ-03": { t: "Novo requerimento e cronograma, com comprovação do andamento", d: "Para a segunda prorrogação (concedida uma única vez), mostrando o andamento da execução do projeto aprovado.", f: ["lei9625"], disp: "Lei 9.625, art. 15-B, §§ 4º–5º" },
    "DOC-PRZ-04": { t: "Medidas compensatórias, plano de emergência/DRT e brigada", d: "Podem ser exigidos no procedimento de prorrogação, conforme a Portaria 046/2024 e o caso.", f: ["port046"], disp: "Portaria 046/2024" },
    "DOC-TAAP-01": { t: "Requerimento conjunto ao Comandante-Geral (proprietário/representante + RT)", d: "Pedido do TAAP com os documentos exigidos pela regulamentação.", f: ["lei9625","port163"], disp: "Lei 9.625, art. 15-C, § 1º (redação da MP 366/2026)", m: ["taapReq"] },
    "DOC-TAAP-02": { t: "Laudo técnico de inviabilidade, avaliação de riscos e medidas compensatórias + DRT", d: "Fundamenta tecnicamente o pedido.", f: ["port163"], disp: "Portaria 163/2026", m: ["taapLaudo"] },
    "DOC-TAAP-03": { t: "Gerenciamento de riscos (NT 13) + DRT", d: "Documento de gerenciamento de riscos do imóvel.", f: ["port163","nt13"], disp: "Portaria 163/2026; NT 13" },
    "DOC-TAAP-04": { t: "Cronograma físico-financeiro assinado", d: "Cronograma de execução das pendências, assinado pelo proprietário/representante e pelo RT.", f: ["port163","lei9625"], disp: "Portaria 163/2026, art. 7º, § 1º, VI", m: ["cronograma"] },
    "DOC-TAAP-05": { t: "Comprovante da taxa proporcional do TAAP", d: "1/12 da taxa de vistoria de regularização por mês solicitado, limitada a 12/12 por período.", f: ["lei9625"], disp: "Lei 9.625, art. 15-C, § 5º" },
    "DOC-EVT-01": { t: "Projeto do evento (PTIOT ou PTOTEP) com plantas e ART/RRT", d: "Formulário, plantas e responsabilidade técnica do projeto e das instalações temporárias.", f: ["nt11"], disp: "NT 11, itens 5.1.7–5.1.8" },
    "DOC-EVT-02": { t: "Certificado válido da edificação permanente", d: "No PTOTEP, a edificação onde o evento ocorre precisa estar regularizada.", f: ["nt11"], disp: "NT 11, item 5.1.8" },
    "DOC-EVT-03": { t: "Termos de responsabilidade do evento", d: "Termo de regularização ou de fiscalização, conforme o caso, e termo de controle de público quando aplicável.", f: ["an005","rt19","port010"], disp: "AN 005/2024; RT 19; Portaria 010/2026", m: ["termoEvtReg","termoEvtFisc","termoPublico"] },
    "DOC-EVT-04": { t: "Documentos de máquinas de chama", d: "Memorial do equipamento, plano de emergência, DRT de instalação/uso, gerenciamento de riscos (NT 13) e projeto com alcance e barreiras. Uso vedado em ambiente fechado.", f: ["rt30","port006","nt13"], disp: "RT 30" },
    "DOC-EVT-05": { t: "ART/RRT de montagem e estabilidade das estruturas", d: "Palcos, arquibancadas, lonas (lotação acima de 100), brinquedos e geradores, conforme o que existir.", f: ["nt11"], disp: "NT 11, item 5.1.7.2" },
    "DOC-REC-01": { t: "Ato contestado, prova da ciência, razões e documentos de suporte", d: "Para defesa ou recurso. Procuração, se houver representante.", f: ["lei9625","nt11"], disp: "Lei 9.625, arts. 18–24-B; NT 11, itens 5.7.4–5" },
    "DOC-EXT-01": { t: "Documentos do órgão de patrimônio (IPHAN, IPHAEP ou município)", d: "Anuência do órgão de proteção para intervenção em bem protegido ou em seu entorno. É processo de outro órgão.", f: ["nt24"], disp: "NT 24" },
    "DOC-EXT-03": { t: "Alvará ou licença municipal", d: "A prefeitura tem regras próprias para alvará de funcionamento ou de evento.", f: [], disp: "Legislação municipal" },
    "DOC-EXT-04": { t: "Autorização do autor para uso de projeto de terceiro", d: "Uso ou cópia de projeto aprovado de outro autor exige autorização ou cessão por escrito.", f: ["an0126","nt11"], disp: "AN 001/2026; NT 11, cap. 11" }
  };

  PB.CLASSES = {
    exigido: { t: "Exigido neste caminho", ord: 1 },
    condicionado: { t: "Condicionado", ord: 2 },
    a_confirmar: { t: "A confirmar", ord: 3 },
    recomendado: { t: "Recomendado", ord: 4 }
  };

  /* -------- Pendências oficiais citadas nos resultados -------- */
  PB.PENDENCIAS = {
    "P-01": "Referência adotada: NT 07/2024 (com as alterações da Portaria 042/2024). A versão de 2023 não é considerada.",
    "P-02": "Baixo Risco A: o CBMPB não emite documento (autodeclaração revogada pela Portaria 042/2024); a dispensa depende de a atividade (CNAE) estar classificada como baixo risco A na REDESIM.",
    "P-03": "Abaixo de 200 m², quem não é Baixo Risco A segue o PTS (interpretação do responsável técnico); a NT 11, item 6.8.7, admite dispensa de vistoria prévia nesses casos.",
    "P-04": "A NT 07 traz limites para GLP, líquidos e fogos no PTS, mas não fala de GNV.",
    "P-05": "A situação da unidade depende do prédio principal (certificado, isolamento e sistemas compartilhados).",
    "P-06": "O passo a passo da renovação do ACPS não foi localizado nas fontes oficiais.",
    "P-07": "O TAAP conta da assinatura do termo (Lei/MP 366); a Portaria 163/2026 e a cartilha falam no fim do LTV. Adotado: assinatura.",
    "P-08": "A MP 366/2026 ainda está em tramitação na Assembleia (consulta em 30/10/2026).",
    "P-09": "A NT 11 traz duas regras de antecedência para eventos: 10 dias (itens 5.1.7.4.7–8) e 48 h/72 h para a vistoria (item 6.1.20).",
    "P-12": "As medidas exigidas dependem das tabelas da NT 04, que precisam ser aplicadas no projeto."
  };
})(window);

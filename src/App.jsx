import { useState, useEffect, useCallback, useMemo } from "react";

// ══════════════════════════════════════════════════════════════════════
// CERTIDÕES — portais oficiais e metadados
// ══════════════════════════════════════════════════════════════════════
const CERTIDOES_CONFIG = [
  {
    id: "cnd_federal",
    nome: "Certidão Negativa Federal (RFB/PGFN)",
    sigla: "CND Federal",
    orgao: "Receita Federal",
    icon: "🏦",
    validade: 180,
    cor: "#1d4ed8",
    urlEmissao: "https://servicos.receitafederal.gov.br/servico/certidoes/",
    urlConsulta: "https://servicos.receitafederal.gov.br/servico/certidoes/",
    instrucao: "Informe o CNPJ no portal da Receita Federal (novo endereço 2026).",
    tipo: "Fiscal Federal",
  },
  {
    id: "fgts",
    nome: "Certificado de Regularidade FGTS (CRF)",
    sigla: "CRF/FGTS",
    orgao: "Caixa Econômica Federal",
    icon: "🏛",
    validade: 30,
    cor: "#f97316",
    urlEmissao: "https://consulta-crf.caixa.gov.br/",
    urlConsulta: "https://consulta-crf.caixa.gov.br/",
    instrucao: "Acesse o portal da CAIXA e informe o CNPJ.",
    tipo: "Fiscal FGTS",
  },
  {
    id: "cndt",
    nome: "Certidão Negativa de Débitos Trabalhistas (CNDT)",
    sigla: "CNDT",
    orgao: "Tribunal Superior do Trabalho",
    icon: "⚖️",
    validade: 180,
    cor: "#7c3aed",
    urlEmissao: "https://cndt-certidao.tst.jus.br/",
    urlConsulta: "https://cndt-certidao.tst.jus.br/",
    instrucao: "Acesse o portal do TST e informe o CNPJ.",
    tipo: "Trabalhista",
  },
  {
    id: "tjpe",
    nome: "Certidão Negativa Cível – TJPE",
    sigla: "CND Cível/TJPE",
    orgao: "Tribunal de Justiça de Pernambuco",
    icon: "🏛",
    validade: 90,
    cor: "#0369a1",
    urlEmissao: "https://certidoesunificadas.app.tjpe.jus.br/",
    urlConsulta: "https://certidoesunificadas.app.tjpe.jus.br/",
    instrucao: "Certidão unificada (cível e criminal) — novo portal TJPE.",
    tipo: "Judicial",
  },
  {
    id: "cnd_estadual",
    nome: "Certidão Negativa Estadual (SEFAZ-PE)",
    sigla: "CND Estadual",
    orgao: "SEFAZ Pernambuco",
    icon: "🗂",
    validade: 60,
    cor: "#16a34a",
    urlEmissao: "https://efisco.sefaz.pe.gov.br/sfi_trb_gpf/PREmitirCertidaoNegativaNarrativaDebitoFiscal",
    urlConsulta: "https://efisco.sefaz.pe.gov.br/sfi_trb_gpf/PREmitirCertidaoNegativaNarrativaDebitoFiscal",
    instrucao: "Portal atualizado da SEFAZ-PE.",
    tipo: "Fiscal Estadual",
  },
  {
    id: "cnd_municipal",
    nome: "Certidão Negativa Municipal",
    sigla: "CND Municipal",
    orgao: "Prefeitura Municipal",
    icon: "🏙",
    validade: 60,
    cor: "#d97706",
    urlEmissao: "",
    urlConsulta: "",
    instrucao: "Link varia por município — cadastre manualmente.",
    tipo: "Fiscal Municipal",
  },
  {
    id: "falencia",
    nome: "Certidão Negativa de Falência/Concordata",
    sigla: "Cert. Falência",
    orgao: "TJPE — Distribuição",
    icon: "📋",
    validade: 30,
    cor: "#dc2626",
    urlEmissao: "https://certidoesunificadas.app.tjpe.jus.br/",
    urlConsulta: "https://certidoesunificadas.app.tjpe.jus.br/",
    instrucao: "Mesma certidão unificada do TJPE.",
    tipo: "Judicial",
  },
  {
    id: "simples",
    nome: "Comprovante de Opção pelo Simples Nacional",
    sigla: "Simples Nacional",
    orgao: "Receita Federal",
    icon: "📄",
    validade: 365,
    cor: "#0891b2",
    urlEmissao: "https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao",
    urlConsulta: "https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao",
    instrucao: "Portal do Simples Nacional.",
    tipo: "Fiscal Federal",
  },
];

// ══════════════════════════════════════════════════════════════════════
// DECLARAÇÕES — texto único por tipo
// ══════════════════════════════════════════════════════════════════════
const DECLARACOES_CONFIG = [
  {
    id:"idoneidade",
    nome:"Declaração de Idoneidade",
    fundamento:"art. 63, I da Lei nº 14.133/2021",
    texto:(e,c)=>`DECLARAÇÃO DE IDONEIDADE

${e?.municipio||"_______"}/${e?.uf||"__"}, ${new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})}.

A empresa ${e?.razaoSocial||"[RAZÃO SOCIAL]"}, inscrita no CNPJ sob o nº ${e?.cnpj||"[CNPJ]"}, com sede à ${e?.logradouro||"[ENDEREÇO]"}, nº ${e?.numero||"s/n"}, ${e?.bairro||""}, ${e?.municipio||""}/${e?.uf||""}, CEP ${e?.cep||""}, neste ato representada por ${e?.repNome||"[REPRESENTANTE]"}, ${e?.repCargo||"[CARGO]"}, CPF nº ${e?.repCpf||"[CPF]"},

DECLARA, para os fins do ${c?.tipoCertame||"certame"} nº ${c?.numero||"____"} — ${c?.processo?`Processo Adm. nº ${c.processo} — `:""}${c?.orgao||"[ÓRGÃO]"}, nos termos do ${this?.fundamento||"art. 63, I da Lei nº 14.133/2021"}, que:

I — Não foi declarada inidônea por nenhum órgão ou entidade da Administração Pública Federal, Estadual ou Municipal;
II — Não está suspensa temporariamente de participar em licitação e impedida de contratar com a Administração Pública;
III — Não possui em seu quadro societário servidor público da ativa ou empregado de empresa pública ou sociedade de economia mista;
IV — Não possui em seu quadro societário cônjuge, companheiro ou parente em linha reta, colateral ou por afinidade, até o terceiro grau, de servidor público que exerça cargo em comissão no órgão licitante.

Por ser expressão da verdade, assina a presente declaração.

________________________________
${e?.repNome||"[Representante Legal]"}
${e?.repCargo||"[Cargo]"} — CPF: ${e?.repCpf||""}
${e?.razaoSocial||""} — CNPJ: ${e?.cnpj||""}`,
  },
  {
    id:"menor",
    nome:"Declaração de Não Emprego de Menor",
    fundamento:"art. 7º, XXXIII da CF/88 e art. 63, VI da Lei nº 14.133/2021",
    texto:(e,c)=>`DECLARAÇÃO DE NÃO EMPREGO DE MENOR

${e?.municipio||"_______"}/${e?.uf||"__"}, ${new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})}.

A empresa ${e?.razaoSocial||"[RAZÃO SOCIAL]"}, CNPJ nº ${e?.cnpj||"[CNPJ]"}, representada por ${e?.repNome||"[REPRESENTANTE]"}, ${e?.repCargo||"[CARGO]"}, CPF nº ${e?.repCpf||"[CPF]"},

DECLARA, em atendimento ao disposto no art. 7º, inciso XXXIII da Constituição Federal de 1988 e ao art. 63, VI da Lei nº 14.133/2021, para fins do ${c?.tipoCertame||"certame"} nº ${c?.numero||"____"} — ${c?.orgao||"[ÓRGÃO]"}, que:

I — Não emprega menor de dezesseis anos, salvo na condição de aprendiz, a partir dos quatorze anos;
II — Não emprega menor de dezoito anos em trabalho noturno, perigoso ou insalubre;
III — Está em plena conformidade com as normas trabalhistas relativas ao trabalho do menor.

A empresa declara estar ciente de que a contratação de menores em desacordo com a legislação vigente constituirá motivo para rescisão unilateral do contrato, sem prejuízo das penalidades cabíveis.

Por ser verdade, firma a presente.

________________________________
${e?.repNome||"[Representante Legal]"}
${e?.repCargo||"[Cargo]"} — CNPJ: ${e?.cnpj||""}`,
  },
  {
    id:"mepp",
    nome:"Declaração de Enquadramento ME/EPP",
    fundamento:"Lei Complementar nº 123/2006 e art. 4º da Lei nº 14.133/2021",
    texto:(e,c)=>`DECLARAÇÃO DE ENQUADRAMENTO COMO MICROEMPRESA OU EMPRESA DE PEQUENO PORTE

${e?.municipio||"_______"}/${e?.uf||"__"}, ${new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})}.

A empresa ${e?.razaoSocial||"[RAZÃO SOCIAL]"}, CNPJ nº ${e?.cnpj||"[CNPJ]"}, com sede em ${e?.municipio||""}/${e?.uf||""}, representada por ${e?.repNome||"[REPRESENTANTE]"}, ${e?.repCargo||"[CARGO]"},

DECLARA, para fins de participação no ${c?.tipoCertame||"certame"} nº ${c?.numero||"____"} — ${c?.orgao||"[ÓRGÃO]"}, sob as penas da lei, nos termos da Lei Complementar nº 123/2006 e do art. 4º da Lei nº 14.133/2021, que:

I — Esta empresa está enquadrada como ${e?.porte==="MEI"?"Microempreendedor Individual — MEI":e?.porte==="ME"?"Microempresa — ME":"Empresa de Pequeno Porte — EPP"}, para todos os efeitos legais;
II — Aufere receita bruta anual igual ou inferior ao limite estabelecido pela Lei Complementar nº 123/2006;
III — Não se enquadra nas hipóteses de exclusão previstas no §4º do art. 3º da Lei Complementar nº 123/2006;
IV — Está apta a usufruir dos benefícios e tratamento diferenciado previstos na referida Lei.

Declara ainda estar ciente de que a falsidade desta declaração sujeita a empresa às penalidades administrativas e penais previstas em lei.

________________________________
${e?.repNome||"[Representante Legal]"}
${e?.repCargo||"[Cargo]"} — CNPJ: ${e?.cnpj||""}`,
  },
  {
    id:"conhecimento",
    nome:"Declaração de Pleno Conhecimento do Edital",
    fundamento:"art. 63, II da Lei nº 14.133/2021",
    texto:(e,c)=>`DECLARAÇÃO DE PLENO CONHECIMENTO DO EDITAL

${e?.municipio||"_______"}/${e?.uf||"__"}, ${new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})}.

A empresa ${e?.razaoSocial||"[RAZÃO SOCIAL]"}, CNPJ nº ${e?.cnpj||"[CNPJ]"}, representada por ${e?.repNome||"[REPRESENTANTE]"}, ${e?.repCargo||"[CARGO]"}, CPF nº ${e?.repCpf||"[CPF]"},

DECLARA, para os fins do ${c?.tipoCertame||"certame"} nº ${c?.numero||"____"} — ${c?.processo?`Processo Adm. nº ${c.processo} — `:""}${c?.orgao||"[ÓRGÃO]"}, sob as penas da lei, em conformidade com o art. 63, II da Lei nº 14.133/2021, que:

I — Tomou pleno conhecimento de todas as cláusulas, condições e especificações constantes do Edital e de seus Anexos;
II — Concorda integralmente com todos os termos do instrumento convocatório;
III — Visitou ou optou por não visitar o local de execução dos serviços/entrega, assumindo plena responsabilidade pelo conhecimento das condições locais;
IV — Não possui qualquer impedimento legal para licitar ou contratar com a Administração Pública;
V — Possui plenas condições técnicas, operacionais e financeiras para o cumprimento integral do objeto licitado.

Por ser verdade, firma a presente declaração.

________________________________
${e?.repNome||"[Representante Legal]"}
${e?.repCargo||"[Cargo]"} — CNPJ: ${e?.cnpj||""}`,
  },
  {
    id:"impedimentos",
    nome:"Declaração de Inexistência de Fatos Impeditivos",
    fundamento:"art. 63, I e IV da Lei nº 14.133/2021",
    texto:(e,c)=>`DECLARAÇÃO DE INEXISTÊNCIA DE FATOS IMPEDITIVOS À HABILITAÇÃO

${e?.municipio||"_______"}/${e?.uf||"__"}, ${new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})}.

A empresa ${e?.razaoSocial||"[RAZÃO SOCIAL]"}, CNPJ nº ${e?.cnpj||"[CNPJ]"}, com sede à ${e?.logradouro||""}, ${e?.numero||""}, ${e?.municipio||""}/${e?.uf||""}, representada por ${e?.repNome||"[REPRESENTANTE]"}, ${e?.repCargo||"[CARGO]"},

DECLARA, para fins habilitatórios no ${c?.tipoCertame||"certame"} nº ${c?.numero||"____"} — ${c?.orgao||"[ÓRGÃO]"}, nos termos do art. 63, I e IV da Lei nº 14.133/2021, que:

I — Não está sob processo de falência, recuperação judicial ou extrajudicial, concurso de credores, dissolução ou liquidação;
II — Não possui em seu quadro societário cônjuge, companheiro(a) ou parente, até o 3º grau, de agentes públicos do órgão licitante;
III — Não possui como sócio servidor público em exercício de cargo em comissão ou função de confiança;
IV — Não foi declarada inidônea por qualquer órgão ou entidade da Administração Pública Direta ou Indireta;
V — Não está inscrita no Cadastro Nacional de Empresas Inidôneas e Suspensas (CEIS) nem no Cadastro Nacional de Empresas Punidas (CNEP);
VI — Não existe qualquer outro fato ou circunstância que possa ser considerado impeditivo à habilitação neste certame.

Compromete-se a comunicar imediatamente ao órgão licitante qualquer alteração que venha a ocorrer nessas condições.

________________________________
${e?.repNome||"[Representante Legal]"}
${e?.repCargo||"[Cargo]"} — CNPJ: ${e?.cnpj||""}`,
  },
  {
    id:"proposta_independente",
    nome:"Declaração de Elaboração Independente de Proposta",
    fundamento:"Instrução Normativa SLTI/MP nº 2/2009",
    texto:(e,c)=>`DECLARAÇÃO DE ELABORAÇÃO INDEPENDENTE DE PROPOSTA

${e?.municipio||"_______"}/${e?.uf||"__"}, ${new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})}.

A empresa ${e?.razaoSocial||"[RAZÃO SOCIAL]"}, CNPJ nº ${e?.cnpj||"[CNPJ]"}, representada por ${e?.repNome||"[REPRESENTANTE]"}, ${e?.repCargo||"[CARGO]"},

DECLARA, para fins do ${c?.tipoCertame||"certame"} nº ${c?.numero||"____"} — ${c?.orgao||"[ÓRGÃO]"}, em conformidade com a Instrução Normativa SLTI/MP nº 2/2009, que:

I — A proposta apresentada foi elaborada de maneira independente, sem qualquer combinação, negociação ou acordo com outro licitante;
II — Os preços praticados foram obtidos por livre e honesta concorrência de mercado, sem coordenação com concorrentes;
III — Nenhum funcionário, representante ou preposto desta empresa discutiu, comparou ou trocou informações com qualquer outro licitante relativas a preços, intenção de participar ou não participar do certame;
IV — Não tenta por qualquer meio fraudar a naturalidade dos resultados do processo licitatório;
V — Conhece o teor do Código Penal Brasileiro no que concerne ao crime de fraude em licitação e demais dispositivos legais pertinentes.

Por ser verdade, firma a presente declaração.

________________________________
${e?.repNome||"[Representante Legal]"}
${e?.repCargo||"[Cargo]"} — CNPJ: ${e?.cnpj||""}`,
  },
  {
    id:"sustentabilidade",
    nome:"Declaração de Sustentabilidade Ambiental",
    fundamento:"IN SLTI/MP nº 1/2010 e art. 5º, IV da Lei nº 14.133/2021",
    texto:(e,c)=>`DECLARAÇÃO DE SUSTENTABILIDADE AMBIENTAL

${e?.municipio||"_______"}/${e?.uf||"__"}, ${new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})}.

A empresa ${e?.razaoSocial||"[RAZÃO SOCIAL]"}, CNPJ nº ${e?.cnpj||"[CNPJ]"}, representada por ${e?.repNome||"[REPRESENTANTE]"}, ${e?.repCargo||"[CARGO]"},

DECLARA, para fins do ${c?.tipoCertame||"certame"} nº ${c?.numero||"____"} — ${c?.orgao||"[ÓRGÃO]"}, em conformidade com a IN SLTI/MP nº 1/2010 e art. 5º, IV da Lei nº 14.133/2021, que:

I — Os produtos/serviços ofertados atendem às especificações de sustentabilidade ambiental estabelecidas no Edital;
II — A empresa adota práticas de gestão ambiental compatíveis com a norma ISO 14001 ou equivalente;
III — Os materiais utilizados nos produtos/serviços ofertados são de procedência legal e seguem as normas ambientais vigentes;
IV — A empresa não possui autos de infração ambiental com penalidade definitiva junto aos órgãos de controle ambiental;
V — Compromete-se a dar destinação ambientalmente adequada a embalagens, resíduos e outros materiais gerados durante a execução do objeto.

Por ser expressão da verdade, assina a presente declaração.

________________________________
${e?.repNome||"[Representante Legal]"}
${e?.repCargo||"[Cargo]"} — CNPJ: ${e?.cnpj||""}`,
  },
  {
    id:"habilitacao",
    nome:"Declaração de Cumprimento dos Requisitos de Habilitação",
    fundamento:"art. 63, I da Lei nº 14.133/2021",
    texto:(e,c)=>`DECLARAÇÃO DE CUMPRIMENTO DOS REQUISITOS DE HABILITAÇÃO

${e?.municipio||"_______"}/${e?.uf||"__"}, ${new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})}.

A empresa ${e?.razaoSocial||"[RAZÃO SOCIAL]"}, CNPJ nº ${e?.cnpj||"[CNPJ]"}, representada por ${e?.repNome||"[REPRESENTANTE]"}, ${e?.repCargo||"[CARGO]"}, CPF nº ${e?.repCpf||"[CPF]"},

DECLARA, para os fins do ${c?.tipoCertame||"certame"} nº ${c?.numero||"____"} — ${c?.processo?`Processo Adm. nº ${c.processo} — `:""}${c?.orgao||"[ÓRGÃO]"}, nos termos do art. 63, I da Lei nº 14.133/2021, que:

I — Cumpre plenamente os requisitos de habilitação jurídica exigidos no Edital;
II — Está em situação regular perante a Fazenda Federal, Estadual e Municipal;
III — Está regular perante o Fundo de Garantia por Tempo de Serviço — FGTS;
IV — Não possui débitos inadimplidos perante a Justiça do Trabalho — CNDT Regular;
V — Atende aos requisitos de qualificação técnica e econômico-financeira previstos no instrumento convocatório;
VI — Não está impedida de licitar e contratar com a Administração Pública;
VII — Tem plena ciência de que a falsidade das declarações ensejará a desclassificação da proposta e a aplicação das penalidades previstas em lei.

Por ser verdade, firma a presente declaração.

________________________________
${e?.repNome||"[Representante Legal]"}
${e?.repCargo||"[Cargo]"} — CNPJ: ${e?.cnpj||""}`,
  },
];

// ══════════════════════════════════════════════════════════════════════
// CONSTANTS / HELPERS
// ══════════════════════════════════════════════════════════════════════
const PNCP_BASE = "https://pncp.gov.br/api/consulta/v1";
const MODALIDADES_PNCP = {1:"Leilão Eletrônico",2:"Diálogo Competitivo",3:"Concurso",4:"Concorrência Eletrônica",5:"Concorrência",6:"Pregão Eletrônico",7:"Pregão Presencial",8:"Dispensa Eletrônica",9:"Inexigibilidade",10:"Manifestação de Interesse",11:"Pré-qualificação",12:"Credenciamento",13:"Leilão Presencial"};
const TIPOS_CERTAME = ["Pregão Eletrônico","Pregão Presencial","Concorrência Eletrônica","Concorrência","Tomada de Preços","Convite","Dispensa Eletrônica","Dispensa de Licitação","Inexigibilidade","Credenciamento","Leilão","Concurso"];
const ESTADOS_BR = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const MESES_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const RESULTADO_OPTS = ["Em andamento","Vencedor","Classificado","Desclassificado","Inabilitado","Desistiu"];
const STATUS_CERTAME_OPTS = ["Aberto","Em análise","Encerrado","Suspenso","Impugnado","Cancelado","Adjudicado","Homologado"];
const HABILITACAO_PADRAO = [
  {id:"hj1",grupo:"Habilitação Jurídica",nome:"Contrato Social ou Estatuto",obrigatorio:true},
  {id:"hj2",grupo:"Habilitação Jurídica",nome:"RG e CPF dos sócios/representantes",obrigatorio:true},
  {id:"rf1",grupo:"Regularidade Fiscal",nome:"CND Federal (RFB/PGFN)",obrigatorio:true},
  {id:"rf2",grupo:"Regularidade Fiscal",nome:"Certidão Negativa Estadual",obrigatorio:true},
  {id:"rf3",grupo:"Regularidade Fiscal",nome:"Certidão Negativa Municipal",obrigatorio:true},
  {id:"rf4",grupo:"Regularidade Fiscal",nome:"CRF/FGTS",obrigatorio:true},
  {id:"rf5",grupo:"Regularidade Fiscal",nome:"CNDT — Débitos Trabalhistas",obrigatorio:true},
  {id:"qt1",grupo:"Qualificação Técnica",nome:"Atestado de Capacidade Técnica",obrigatorio:true},
  {id:"qt2",grupo:"Qualificação Técnica",nome:"Registro no órgão de classe",obrigatorio:false},
  {id:"qf1",grupo:"Qualificação Econômica",nome:"Balanço Patrimonial último exercício",obrigatorio:true},
  {id:"qf2",grupo:"Qualificação Econômica",nome:"Certidão Negativa de Falência",obrigatorio:true},
  {id:"pc1",grupo:"Proposta Comercial",nome:"Proposta de preços assinada",obrigatorio:true},
  {id:"de1",grupo:"Declarações",nome:"Declaração de Idoneidade",obrigatorio:true},
  {id:"de2",grupo:"Declarações",nome:"Declaração Não Emprego de Menor",obrigatorio:true},
];

const fmt = n => n?`R$ ${Number(n).toLocaleString("pt-BR",{minimumFractionDigits:2})}`:"—";
const fmtDate = d => { if(!d)return"—"; return new Date(String(d).slice(0,10)+"T12:00:00").toLocaleDateString("pt-BR"); };
const diasAte = d => { if(!d)return null; return Math.ceil((new Date(String(d).slice(0,10)+"T12:00:00")-new Date())/86400000); };
const pad2 = n => String(n).padStart(2,"0");
const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const maskCNPJ = v => v.replace(/\D/g,"").replace(/(\d{2})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1/$2").replace(/(\d{4})(\d)/,"$1-$2").slice(0,18);
const maskCEP = v => v.replace(/\D/g,"").replace(/(\d{5})(\d)/,"$1-$2").slice(0,9);
const maskPhone = v => v.replace(/\D/g,"").replace(/(\d{2})(\d)/,"($1) $2").replace(/(\d{5})(\d)/,"$1-$2").slice(0,15);

const DB = {
  async get(k){try{const r=await window.storage.get(k);return r?JSON.parse(r.value):null;}catch{return null;}},
  async set(k,v){try{await window.storage.set(k,JSON.stringify(v));return true;}catch{return false;}},
};

// ══════════════════════════════════════════════════════════════════════
// PDF
// ══════════════════════════════════════════════════════════════════════
const openPDF = html => {
  const w=window.open("","_blank");
  if(w){w.document.write(html);w.document.close();setTimeout(()=>{w.focus();w.print();},700);}
};

const pdfCSS = `<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'DM Sans',sans-serif;color:#1e293b;padding:52px;font-size:12.5px;line-height:1.75}
  h1{font-size:18px;font-weight:800;color:#1d4ed8;margin-bottom:2px;text-transform:uppercase;letter-spacing:.5px}
  h2{font-size:13px;font-weight:700;margin:20px 0 8px;border-bottom:2px solid #e2e8f0;padding-bottom:4px}
  .sub{color:#64748b;font-size:11px;margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid #f1f5f9}
  .badge{display:inline-block;padding:3px 12px;border-radius:6px;font-size:11px;font-weight:700;background:#eff6ff;color:#1d4ed8;margin-bottom:16px}
  .g2{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}
  .box{background:#f8fafc;border-radius:7px;padding:9px 12px;border:1px solid #e2e8f0}
  .lbl{font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase}
  .val{font-size:12.5px;font-weight:700;color:#1e293b;margin-top:1px}
  table{width:100%;border-collapse:collapse;margin:10px 0;font-size:11.5px}
  th{background:#1d4ed8;color:#fff;padding:7px 9px;text-align:left;font-size:10px;font-weight:700}
  td{padding:7px 9px;border-bottom:1px solid #f1f5f9}
  tr:nth-child(even) td{background:#f8fafc}
  .total{font-size:16px;font-weight:800;color:#1d4ed8;text-align:right;margin:12px 0}
  .footer{margin-top:44px;padding-top:14px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8;display:flex;justify-content:space-between}
  .dec-body{background:#f8fafc;border-radius:8px;padding:24px 28px;margin-top:14px;line-height:2;border:1px solid #e2e8f0;white-space:pre-wrap;font-size:12px}
  .sign{margin-top:56px;text-align:center}
  .sign-line{width:280px;border-top:1.5px solid #1e293b;margin:0 auto 6px}
  @media print{body{padding:28px}}
</style>`;

const gerarPDFDeclaracao = (decConfig, empresa, certame) => {
  const texto = decConfig.texto(empresa, certame);
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${decConfig.nome}</title>${pdfCSS}</head><body>
    <h1>${decConfig.nome}</h1>
    <div class="sub">Emitida em ${new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})} · Fundamento: ${decConfig.fundamento} · LicitaFlow v5</div>
    ${certame?`<div class="badge">${certame.tipoCertame} nº ${certame.numero||"—"} — ${certame.orgao||""}</div>`:""}
    <div class="dec-body">${texto.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>
    <div class="footer"><span>LicitaFlow v5 © ${new Date().getFullYear()} · Documento gerado eletronicamente</span><span>${decConfig.fundamento}</span></div>
  </body></html>`;
  openPDF(html);
};

const gerarPDFProposta = (dados) => {
  const {empresa:e,certame:c,itens,validade,prazoEntrega,obs,titulo} = dados;
  const total=(itens||[]).reduce((a,it)=>a+(parseFloat(it.qtd)||0)*(parseFloat(it.unit)||0),0);
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Proposta</title>${pdfCSS}</head><body>
    <h1>Proposta Comercial de Preços</h1>
    <div class="sub">Emitida em ${new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})} · LicitaFlow v5</div>
    ${c?`<div class="badge">${c.tipoCertame} nº ${c.numero||"—"} — ${c.orgao||""}</div>`:""}
    <h2>Empresa Proponente</h2>
    <div class="g2">
      <div class="box"><div class="lbl">Razão Social</div><div class="val">${e?.razaoSocial||"—"}</div></div>
      <div class="box"><div class="lbl">CNPJ</div><div class="val">${e?.cnpj||"—"}</div></div>
      <div class="box"><div class="lbl">Endereço</div><div class="val">${e?.logradouro||""}, ${e?.numero||"s/n"} — ${e?.bairro||""}, ${e?.municipio||""}/${e?.uf||""}</div></div>
      <div class="box"><div class="lbl">Representante</div><div class="val">${e?.repNome||"—"} · ${e?.repCargo||""}</div></div>
    </div>
    ${c?`<h2>Dados do Certame</h2><div class="g2">
      <div class="box"><div class="lbl">Modalidade</div><div class="val">${c.tipoCertame||"—"}</div></div>
      <div class="box"><div class="lbl">Processo Adm.</div><div class="val">${c.processo||"—"}</div></div>
      <div class="box"><div class="lbl">Órgão</div><div class="val">${c.orgao||"—"} · ${c.uf||""}</div></div>
      <div class="box"><div class="lbl">Abertura</div><div class="val">${fmtDate(c.dataAbertura)}</div></div>
    </div>`:""}
    <h2>Itens da Proposta</h2>
    <table><thead><tr><th>#</th><th>Descrição</th><th>Un.</th><th>Qtd.</th><th>R$ Unit.</th><th>Total</th></tr></thead><tbody>
      ${(itens||[]).map((it,i)=>`<tr><td>${i+1}</td><td>${it.desc||"—"}</td><td>${it.unidade||"UN"}</td><td>${it.qtd}</td><td>${fmt(it.unit)}</td><td>${fmt((parseFloat(it.qtd)||0)*(parseFloat(it.unit)||0))}</td></tr>`).join("")}
    </tbody></table>
    <div class="total">VALOR GLOBAL: ${fmt(total)}</div>
    <div class="g2">
      <div class="box"><div class="lbl">Validade</div><div class="val">${validade||"60"} dias</div></div>
      <div class="box"><div class="lbl">Prazo entrega</div><div class="val">${prazoEntrega||"A definir"}</div></div>
    </div>
    ${obs?`<h2>Obs.</h2><p>${obs}</p>`:""}
    <div class="sign" style="margin-top:52px"><div class="sign-line"></div><strong>${e?.razaoSocial||""}</strong><br><span>CNPJ: ${e?.cnpj||""} · ${e?.repNome||""} · ${e?.repCargo||""}</span></div>
    <div class="footer"><span>LicitaFlow v5 © ${new Date().getFullYear()}</span><span>Documento eletrônico</span></div>
  </body></html>`;
  openPDF(html);
};

// ══════════════════════════════════════════════════════════════════════
// EMPTY STATES
// ══════════════════════════════════════════════════════════════════════
const EMP0 = {razaoSocial:"",nomeFantasia:"",cnpj:"",ie:"",im:"",porte:"ME",logradouro:"",numero:"",complemento:"",bairro:"",municipio:"",uf:"PE",cep:"",telefone:"",email:"",site:"",repNome:"",repCargo:"",repCpf:"",repEmail:"",repTelefone:""};
const CERT0 = {titulo:"",tipoCertame:"Pregão Eletrônico",numero:"",processo:"",orgao:"",uf:"PE",objeto:"",valor:"",dataPublicacao:"",dataAbertura:"",dataEncerramento:"",editalUrl:"",fonte:"Manual",status:"Aberto",obs:"",monitorando:true,resultado:"Em andamento",valorProposta:"",checklist:[],impugnacoes:[],historico:[]};
const DOC0 = {nome:"",tipo:"Certidão",validade:"",arquivo:""};
const PROP0 = {titulo:"",certameId:"",itens:[{desc:"",unidade:"UN",qtd:1,unit:""}],validade:"60",prazoEntrega:"",obs:""};

// ══════════════════════════════════════════════════════════════════════
// APP
// ══════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data
  const [empresa, setEmpresa] = useState(null);
  const [certames, setCertames] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [propostas, setPropostas] = useState([]);
  const [certidoes, setCertidoes] = useState({}); // { id: { dataEmissao, dataValidade, obs } }

  // UI
  const [selectedCert, setSelectedCert] = useState(null);
  const [certSubTab, setCertSubTab] = useState("info");
  const [modalType, setModalType] = useState(null);
  const [formEmp, setFormEmp] = useState(EMP0);
  const [formCert, setFormCert] = useState(CERT0);
  const [formDoc, setFormDoc] = useState(DOC0);
  const [formProp, setFormProp] = useState(PROP0);
  const [formDec, setFormDec] = useState({decId:"idoneidade",certameId:""});
  const [formCertidao, setFormCertidao] = useState({id:"",dataEmissao:"",dataValidade:"",obs:""});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifDismissed, setNotifDismissed] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [toast, setToast] = useState(null);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calDay, setCalDay] = useState(null);
  const [pncpItems, setPncpItems] = useState([]);
  const [pncpLoading, setPncpLoading] = useState(false);
  const [pncpError, setPncpError] = useState(null);
  const [pncpSearch, setPncpSearch] = useState("");
  const [pncpPag, setPncpPag] = useState(1);
  const [pncpSelected, setPncpSelected] = useState(null);

  const showToast = (msg,type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  // ── LOAD ──
  useEffect(()=>{
    (async()=>{
      setLoading(true);
      const [e,c,d,p,ct] = await Promise.all([DB.get("empresa"),DB.get("certames"),DB.get("documentos"),DB.get("propostas"),DB.get("certidoes")]);
      setEmpresa(e); setFormEmp(e||EMP0);
      setCertames(c||[]); setDocumentos(d||[]); setPropostas(p||[]); setCertidoes(ct||{});
      setLoading(false);
    })();
  },[]);

  // ── EMPRESA ──
  const saveEmpresa = async () => {
    if(!formEmp.razaoSocial||!formEmp.cnpj){showToast("Razão Social e CNPJ obrigatórios","error");return;}
    setSaving(true); await DB.set("empresa",formEmp); setEmpresa(formEmp); setSaving(false);
    showToast("✅ Empresa salva!"); setTab("dashboard");
  };

  // ── CERTAMES ──
  const saveCert = async (cert=formCert) => {
    const isNew=!cert.id;
    const item=isNew?{...cert,id:uid(),criadoEm:new Date().toISOString(),checklist:HABILITACAO_PADRAO.map(h=>({...h,status:"pendente"})),impugnacoes:[],historico:[{id:uid(),data:new Date().toISOString(),acao:"Certame cadastrado"}]}:cert;
    const lista=isNew?[...certames,item]:certames.map(c=>c.id===cert.id?item:c);
    setCertames(lista); await DB.set("certames",lista);
    setFormCert(CERT0); setModalType(null); showToast("✅ Certame salvo!"); return item;
  };
  const delCert = async id => { const l=certames.filter(c=>c.id!==id); setCertames(l); await DB.set("certames",l); if(selectedCert?.id===id){setSelectedCert(null);setTab("certames");} showToast("Removido"); };
  const updateCert = async (id,fields) => {
    const l=certames.map(c=>c.id===id?{...c,...fields}:c); setCertames(l); await DB.set("certames",l);
    if(selectedCert?.id===id) setSelectedCert(p=>({...p,...fields}));
  };

  // ── DOCUMENTOS ──
  const saveDoc = async () => {
    if(!formDoc.nome){showToast("Nome obrigatório","error");return;}
    const d2=diasAte(formDoc.validade);
    const status=!formDoc.validade?"Válido":d2<=0?"Vencido":d2<=15?"Vencendo":"Válido";
    const item=formDoc.id?{...formDoc,status}:{...formDoc,id:uid(),status,criadoEm:new Date().toISOString()};
    const l=formDoc.id?documentos.map(x=>x.id===formDoc.id?item:x):[...documentos,item];
    setDocumentos(l); await DB.set("documentos",l); setFormDoc(DOC0); setModalType(null); showToast("✅ Documento salvo!");
  };
  const delDoc = async id => { const l=documentos.filter(d=>d.id!==id); setDocumentos(l); await DB.set("documentos",l); showToast("Removido"); };

  // ── CERTIDÕES ──
  const saveCertidao = async () => {
    const updated={...certidoes,[formCertidao.id]:{dataEmissao:formCertidao.dataEmissao,dataValidade:formCertidao.dataValidade,obs:formCertidao.obs,atualizadoEm:new Date().toISOString()}};
    setCertidoes(updated); await DB.set("certidoes",updated); setModalType(null); showToast("✅ Certidão atualizada!");
  };

  const certidaoStatus = (cfgId) => {
    const reg=certidoes[cfgId];
    if(!reg||!reg.dataValidade) return "sem-registro";
    const d=diasAte(reg.dataValidade);
    if(d<=0) return "vencida";
    if(d<=15) return "vencendo";
    return "valida";
  };

  // ── PROPOSTAS ──
  const saveProp = async () => {
    if(!formProp.titulo){showToast("Título obrigatório","error");return;}
    const item=formProp.id?formProp:{...formProp,id:uid(),criadoEm:new Date().toISOString()};
    const l=formProp.id?propostas.map(p=>p.id===formProp.id?item:p):[...propostas,item];
    setPropostas(l); await DB.set("propostas",l); showToast("✅ Proposta salva!");
  };
  const delProp = async id => { const l=propostas.filter(p=>p.id!==id); setPropostas(l); await DB.set("propostas",l); showToast("Removida"); };

  // ── HABILITAÇÃO ──
  const toggleHab = async (certId,habId,status) => {
    const cert=certames.find(c=>c.id===certId);
    if(!cert) return;
    const checklist=(cert.checklist||[]).map(h=>h.id===habId?{...h,status}:h);
    await updateCert(certId,{checklist});
  };
  const habProgress = cert => {
    const cl=cert.checklist||[];
    const obrig=cl.filter(h=>h.obrigatorio); const ok=obrig.filter(h=>h.status==="ok");
    return obrig.length?Math.round((ok.length/obrig.length)*100):0;
  };

  // ── IMPUGNAÇÕES ──
  const saveImpugnacao = async (formImp) => {
    if(!formImp.motivo){showToast("Motivo obrigatório","error");return;}
    const item={...formImp,id:uid(),criadoEm:new Date().toISOString()};
    await updateCert(selectedCert.id,{impugnacoes:[...(selectedCert.impugnacoes||[]),item]});
    setModalType(null); showToast("✅ Registrada!");
  };

  // ── AI ──
  const runAI = async (tipo,obj) => {
    setAiLoading(true); setAiResult("");
    const pmap={
      analise:`Analise em português:\n1.RESUMO EXECUTIVO\n2.EXIGÊNCIAS\n3.DOCUMENTOS\n4.RISCOS\n5.RECOMENDAÇÃO\n\nObjeto:${obj.objeto||obj.titulo}\nÓrgão:${obj.orgao}/${obj.uf}\nValor:${fmt(obj.valor)}\nModalidade:${obj.modalidade||obj.tipoCertame}\nAbertura:${fmtDate(obj.dataAbertura)}`,
      impugnacao:`Redija minuta de impugnação de edital:\nModalidade:${obj.tipoCertame}\nNº:${obj.numero||"—"}\nÓrgão:${obj.orgao}\nObjeto:${obj.objeto||obj.titulo}\nApresente: fundamentos legais, argumentação e pedido.`,
    };
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:pmap[tipo]}]})});
      const d=await r.json(); setAiResult(d.content?.[0]?.text||"Sem resposta.");
    }catch{setAiResult("Erro de conexão.");}
    setAiLoading(false);
  };

  // ── PNCP ──
  const fetchPNCP = useCallback(async(termo="",pag=1)=>{
    setPncpLoading(true); setPncpError(null);
    try{
      const hoje=new Date(); const ini=new Date(hoje); ini.setDate(ini.getDate()-1); const fim=new Date(hoje); fim.setDate(fim.getDate()+90);
      const di=`${ini.getFullYear()}${pad2(ini.getMonth()+1)}${pad2(ini.getDate())}`;
      const df=`${fim.getFullYear()}${pad2(fim.getMonth()+1)}${pad2(fim.getDate())}`;
      const res=await fetch(`${PNCP_BASE}/contratacoes/proposta?dataInicial=${di}&dataFinal=${df}&pagina=${pag}&tamanhoPagina=10`);
      if(!res.ok) throw new Error(res.status);
      const json=await res.json();
      const items=(json.data||json||[]).map(c=>({
        id:c.numeroControlePNCP||uid(), numeroControlePNCP:c.numeroControlePNCP,
        modalidade:MODALIDADES_PNCP[c.modalidadeId||c.codigoModalidadeContratacao]||"Licitação",
        objeto:c.objetoCompra||c.objeto||"Sem descrição",
        orgao:c.unidadeOrgao?.nomeUnidade||c.orgaoEntidade?.razaoSocial||"Órgão Público",
        uf:c.unidadeOrgao?.ufSigla||c.ufSigla||"BR",
        valor:c.valorTotalEstimado||c.valor||0,
        dataAbertura:c.dataAberturaProposta||c.dataAbertura,
        dataPublicacao:c.dataPublicacaoPncp||c.dataPublicacao, fonte:"PNCP",
      }));
      setPncpItems(termo?items.filter(i=>(i.objeto+i.orgao).toLowerCase().includes(termo.toLowerCase())):items);
    }catch{setPncpError("Não foi possível conectar à API do PNCP."); setPncpItems([]);}
    setPncpLoading(false);
  },[]);

  useEffect(()=>{ if(tab==="fontes") fetchPNCP(); },[tab]);

  // ── NOTIFS ──
  const notifs = useMemo(()=>{
    const ns=[];
    certames.filter(c=>c.monitorando&&c.status==="Aberto").forEach(c=>{
      const d=diasAte(c.dataAbertura);
      if(d===1) ns.push({id:`c1-${c.id}`,tipo:"urgente",msg:`⏰ AMANHÃ: ${(c.titulo||"").slice(0,40)}`,sub:fmtDate(c.dataAbertura)});
      else if(d<=3&&d>1) ns.push({id:`c3-${c.id}`,tipo:"urgente",msg:`📅 ${d} dias: ${(c.titulo||"").slice(0,40)}`,sub:fmtDate(c.dataAbertura)});
      else if(d<=7) ns.push({id:`c7-${c.id}`,tipo:"alerta",msg:`📌 ${d} dias: ${(c.titulo||"").slice(0,40)}`,sub:fmtDate(c.dataAbertura)});
    });
    CERTIDOES_CONFIG.forEach(cfg=>{
      const reg=certidoes[cfg.id];
      if(reg?.dataValidade){
        const d=diasAte(reg.dataValidade);
        if(d!==null&&d<=0) ns.push({id:`cv-${cfg.id}`,tipo:"urgente",msg:`🚨 Vencida: ${cfg.sigla}`,sub:fmtDate(reg.dataValidade)});
        else if(d!==null&&d<=15) ns.push({id:`ca-${cfg.id}`,tipo:"alerta",msg:`⚠️ Vencendo: ${cfg.sigla}`,sub:`${d}d — ${fmtDate(reg.dataValidade)}`});
      }
    });
    documentos.forEach(d=>{
      if(!d.validade) return;
      const dif=diasAte(d.validade);
      if(dif!==null&&dif<=0) ns.push({id:`dv-${d.id}`,tipo:"urgente",msg:`🚨 Doc vencido: ${d.nome}`,sub:fmtDate(d.validade)});
      else if(dif!==null&&dif<=15) ns.push({id:`da-${d.id}`,tipo:"alerta",msg:`⚠️ Doc vencendo: ${d.nome}`,sub:`${dif}d`});
    });
    return ns.filter(n=>!notifDismissed.includes(n.id));
  },[certames,certidoes,documentos,notifDismissed]);

  // ── CALENDAR ──
  const calEvents = useMemo(()=>{
    const map={};
    const add=(k,ev)=>{ if(!map[k]) map[k]=[]; map[k].push(ev); };
    certames.forEach(c=>{
      if(c.dataAbertura) add(c.dataAbertura.slice(0,10),{...c,tipo:"abertura"});
      if(c.dataEncerramento) add(c.dataEncerramento.slice(0,10),{...c,tipo:"encerramento"});
      (c.impugnacoes||[]).forEach(i=>{ if(i.dataLimite) add(i.dataLimite,{...c,tipo:"impugnacao"}); });
    });
    CERTIDOES_CONFIG.forEach(cfg=>{
      const reg=certidoes[cfg.id];
      if(reg?.dataValidade) add(reg.dataValidade,{id:cfg.id,titulo:cfg.sigla,tipo:"certidao_vence",orgao:cfg.orgao});
    });
    return map;
  },[certames,certidoes]);

  const calDays = useMemo(()=>{
    return {first:new Date(calYear,calMonth,1).getDay(),total:new Date(calYear,calMonth+1,0).getDate()};
  },[calYear,calMonth]);

  // ── STATS ──
  const stats = useMemo(()=>({
    certames:certames.length,
    abertos:certames.filter(c=>c.status==="Aberto").length,
    monitorando:certames.filter(c=>c.monitorando).length,
    vencedores:certames.filter(c=>c.resultado==="Vencedor").length,
    notifs:notifs.length,
    certidoesAlerta:CERTIDOES_CONFIG.filter(cfg=>{const s=certidaoStatus(cfg.id);return s==="vencida"||s==="vencendo";}).length,
    impPendentes:certames.reduce((a,c)=>a+(c.impugnacoes||[]).filter(i=>i.status==="Pendente").length,0),
  }),[certames,notifs,certidoes]);

  const totalProp = (formProp.itens||[]).reduce((a,it)=>a+(parseFloat(it.qtd)||0)*(parseFloat(it.unit)||0),0);
  const NCOL = {urgente:"#dc2626",alerta:"#d97706",info:"#1d4ed8"};

  // ══ ONBOARDING ══
  if(!loading&&!empresa) return(
    <div style={RS.root}>
      <style>{CSS}</style>
      <div style={RS.onboard}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:52,color:"#1d4ed8"}}>⚖</div>
          <h1 style={{fontSize:26,fontWeight:900,color:"#0f172a",letterSpacing:"-1px"}}>LicitaFlow v5</h1>
          <p style={{fontSize:14,color:"#64748b",marginTop:4}}>Plataforma completa de gestão de licitações</p>
        </div>
        <div style={RS.card}>
          <EmpresaForm form={formEmp} setForm={setFormEmp}/>
          <button style={{...RS.btnPrimary,width:"100%",marginTop:16}} onClick={saveEmpresa} disabled={saving}>{saving?"Salvando...":"✅ Cadastrar e Começar"}</button>
        </div>
      </div>
    </div>
  );

  if(loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontSize:14,color:"#94a3b8",background:"#f1f5f9"}}>Carregando LicitaFlow...</div>;

  // ══ MODAL CERTIDÃO ══
  const renderModalCertidao = () => {
    const cfg = CERTIDOES_CONFIG.find(c=>c.id===formCertidao.id);
    if(!cfg) return null;
    const cnpjRaw = (empresa?.cnpj||"").replace(/\D/g,"");
    const urlComCNPJ = cfg.urlEmissao && cnpjRaw
      ? cfg.id==="fgts" ? `${cfg.urlEmissao}?cnpj=${cnpjRaw}` : cfg.urlEmissao
      : cfg.urlEmissao;
    return(
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",gap:12,alignItems:"flex-start",padding:"12px",background:cfg.cor+"10",borderRadius:10,border:`1.5px solid ${cfg.cor}30`}}>
          <div style={{fontSize:28}}>{cfg.icon}</div>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:"#0f172a"}}>{cfg.nome}</div>
            <div style={{fontSize:11,color:"#64748b",marginTop:2}}>{cfg.orgao} · Validade típica: {cfg.validade} dias</div>
            <div style={{fontSize:11,color:"#475569",marginTop:4,lineHeight:1.5}}>{cfg.instrucao}</div>
          </div>
        </div>
        {cfg.urlEmissao && (
          <a href={urlComCNPJ} target="_blank" rel="noreferrer"
            style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:cfg.cor,color:"#fff",borderRadius:10,padding:"11px 16px",fontSize:13,fontWeight:700,textDecoration:"none"}}>
            🌐 Emitir no Portal Oficial — {cfg.orgao}
          </a>
        )}
        {!cfg.urlEmissao && (
          <div style={{background:"#fffbeb",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#d97706",border:"1px solid #fde68a"}}>
            ⚠️ Link do portal municipal não configurado. Acesse a prefeitura do seu município.
          </div>
        )}
        <div style={{borderTop:"1px solid #f1f5f9",paddingTop:14}}>
          <div style={{fontSize:11,fontWeight:800,color:"#64748b",textTransform:"uppercase",marginBottom:10}}>Registrar emissão</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <FG l="Data de Emissão"><FI type="date" value={formCertidao.dataEmissao} onChange={e=>{
              const val=e.target.value;
              if(val&&cfg.validade){
                const venc=new Date(val+"T12:00:00");
                venc.setDate(venc.getDate()+cfg.validade);
                setFormCertidao(p=>({...p,dataEmissao:val,dataValidade:venc.toISOString().slice(0,10)}));
              } else setFormCertidao(p=>({...p,dataEmissao:val}));
            }}/></FG>
            <FG l="Data de Vencimento (calculada automaticamente)"><FI type="date" value={formCertidao.dataValidade} onChange={e=>setFormCertidao(p=>({...p,dataValidade:e.target.value}))}/></FG>
            <FG l="Observações"><FA value={formCertidao.obs} onChange={e=>setFormCertidao(p=>({...p,obs:e.target.value}))} placeholder="Número da certidão, código verificador..."/></FG>
          </div>
        </div>
        <button style={{...RS.btnPrimary,width:"100%"}} onClick={saveCertidao}>💾 Registrar Certidão</button>
      </div>
    );
  };

  return(
    <div style={RS.root}>
      <style>{CSS}</style>
      {toast && <div style={{...RS.toast,background:toast.type==="error"?"#dc2626":"#16a34a"}}>{toast.msg}</div>}

      {/* ── SIDEBAR ── */}
      <aside style={{...RS.sidebar,transform:sidebarOpen?"translateX(0)":"translateX(-260px)"}}>
        <div style={RS.sbLogo} onClick={()=>setSidebarOpen(false)}>
          <span style={{fontSize:24,color:"#60a5fa"}}>⚖</span>
          <div><div style={{fontSize:15,fontWeight:800,color:"#f1f5f9"}}>LicitaFlow v5</div><div style={{fontSize:10,color:"#475569",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:160}}>{empresa?.nomeFantasia||empresa?.razaoSocial}</div></div>
        </div>
        <nav style={{flex:1,padding:"10px 8px",display:"flex",flexDirection:"column",gap:2,overflowY:"auto"}}>
          {[
            {id:"dashboard",ic:"▣",lb:"Dashboard"},
            {id:"empresa",ic:"🏢",lb:"Minha Empresa"},
            {id:"fontes",ic:"🌐",lb:"Buscar (PNCP)"},
            {id:"certames",ic:"📁",lb:"Meus Certames",bd:stats.abertos},
            {id:"habilitacao",ic:"☑",lb:"Habilitação"},
            {id:"historico",ic:"📊",lb:"Histórico"},
            {id:"calendario",ic:"📅",lb:"Calendário"},
            {id:"impugnacoes",ic:"⚠️",lb:"Impugnações",bd:stats.impPendentes},
            {id:"certidoes",ic:"🏅",lb:"Certidões",bd:stats.certidoesAlerta},
            {id:"documentos",ic:"📄",lb:"Documentos"},
            {id:"propostas",ic:"📝",lb:"Propostas"},
            {id:"declaracoes",ic:"📜",lb:"Declarações"},
          ].map(n=>(
            <button key={n.id} style={{...RS.sbItem,...(tab===n.id?RS.sbItemOn:{})}}
              onClick={()=>{setTab(n.id);setSidebarOpen(false);if(n.id!=="certames")setSelectedCert(null);if(n.id!=="fontes")setPncpSelected(null);}}>
              <span style={{fontSize:14,width:20,textAlign:"center",flexShrink:0}}>{n.ic}</span>
              <span style={{flex:1,textAlign:"left"}}>{n.lb}</span>
              {n.bd>0&&<span style={RS.sbBadge}>{n.bd}</span>}
            </button>
          ))}
        </nav>
        <div style={{padding:"12px 16px",borderTop:"1px solid #1e293b",fontSize:10,color:"#475569"}}>{empresa?.cnpj}</div>
      </aside>
      {sidebarOpen&&<div style={RS.overlay} onClick={()=>setSidebarOpen(false)}/>}

      {/* ── HEADER ── */}
  {/* ── HEADER CORRIGIDO ── */}
{/* HEADER CORRIGIDO E SEGURO */}
<header style={{ 
  padding: '12px 20px', 
  background: darkMode ? "#1e293b" : "#fff",
  color: darkMode ? "#fff" : "#1e293b",
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center',
  borderBottom: '1px solid #e2e8f0',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
}}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <div style={{ background: "#1d4ed8", color: "#fff", width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 20 }}>L</div>
    <h1 style={{ fontSize: 18, fontWeight: 800, color: "#1d4ed8", margin: 0 }}>LICITAFLOW</h1>
    <span style={{fontSize:11, background:"#10b981", color:"#fff", padding:"3px 10px", borderRadius:20, fontWeight:600}}>ADMIN</span>
  </div>

  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
    <select 
      value={idAtiva} 
      onChange={(e) => setIdAtiva(e.target.value)}
      style={{ 
        padding: '9px 14px', 
        borderRadius: '8px', 
        border: '2px solid #1d4ed8', 
        fontSize: '14px', 
        background: darkMode ? '#334155' : '#fff', 
        color: darkMode ? '#fff' : '#000', 
        fontWeight: '600',
        minWidth: 220
      }}
    >
      <option value="">🌐 Alternar Empresa / Cliente</option>
      {empresas.map(e => (
        <option key={e.id} value={e.id}>{e.razaoSocial}</option>
      ))}
    </select>
    
    <button 
      onClick={handleNovaEmpresa}
      style={{ 
        background: '#10b981', 
        color: '#fff', 
        border: 'none', 
        padding: '9px 16px', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        fontWeight: 'bold',
        whiteSpace: 'nowrap'
      }}
    >
      + Nova Empresa
    </button>

    <button 
      onClick={() => setDarkMode(!darkMode)}
      style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '4px' }}
    >
      {darkMode ? "☀️" : "🌙"}
    </button>
  </div>
</header>   
    )}

      {/* ── MODAL ── */}
      {modalType&&(
        <div style={RS.mOverlay} onClick={()=>setModalType(null)}>
          <div style={RS.modal} onClick={e=>e.stopPropagation()}>
            <div style={RS.mHdr}>
              <strong>{{addCertame:"📁 Novo Certame",addDoc:"📄 Documento",addImp:"⚠️ Impugnação",certidao:"🏅 Certidão"}[modalType]||"Modal"}</strong>
              <button style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#94a3b8"}} onClick={()=>setModalType(null)}>×</button>
            </div>
            <div style={RS.mBody}>
              {modalType==="addCertame"&&<CertameForm form={formCert} setForm={setFormCert} onSave={saveCert}/>}
              {modalType==="addDoc"&&<DocForm form={formDoc} setForm={setFormDoc} onSave={saveDoc}/>}
              {modalType==="addImp"&&<ImpForm onSave={saveImpugnacao}/>}
              {modalType==="certidao"&&renderModalCertidao()}
            </div>
          </div>
        </div>
      )}

      {/* ══ MAIN ══ */}
      <main style={RS.main} onClick={()=>showNotifs&&setShowNotifs(false)}>

        {/* DASHBOARD */}
        {tab==="dashboard"&&(
          <div style={RS.pg}>
            <PgHdr title="Dashboard" sub={empresa?.razaoSocial}/>
            <div style={RS.grid4}>
              {[
                {l:"Certames",v:stats.certames,ic:"📁",c:"#1d4ed8",bg:"#eff6ff",t:"certames"},
                {l:"Abertos",v:stats.abertos,ic:"🟢",c:"#16a34a",bg:"#f0fdf4",t:"certames"},
                {l:"Alertas",v:stats.notifs,ic:"🔔",c:"#dc2626",bg:"#fef2f2",t:null},
                {l:"Vencedores",v:stats.vencedores,ic:"🏆",c:"#d97706",bg:"#fffbeb",t:"historico"},
                {l:"Certidões",v:stats.certidoesAlerta,ic:"🏅",c:"#7c3aed",bg:"#f5f3ff",t:"certidoes"},
                {l:"Propostas",v:propostas.length,ic:"📝",c:"#0369a1",bg:"#f0f9ff",t:"propostas"},
                {l:"Monitorando",v:stats.monitorando,ic:"◉",c:"#475569",bg:"#f8fafc",t:"certames"},
                {l:"Impugnações",v:stats.impPendentes,ic:"⚖️",c:"#dc2626",bg:"#fef2f2",t:"impugnacoes"},
              ].map((s,i)=>(
                <div key={i} style={{...RS.statCard,background:s.bg,borderColor:s.c+"30",cursor:s.t?"pointer":"default"}} className="hov" onClick={()=>s.t&&setTab(s.t)}>
                  <div style={{fontSize:20}}>{s.ic}</div>
                  <div style={{fontSize:22,fontWeight:900,color:s.c,lineHeight:1}}>{s.v}</div>
                  <div style={{fontSize:10,color:"#64748b",fontWeight:700}}>{s.l}</div>
                </div>
              ))}
            </div>

            {notifs.length>0&&(
              <div style={RS.section}>
                <SHdr title="🔔 Alertas Ativos"><button style={RS.lnkBtn} onClick={()=>setShowNotifs(true)}>Ver →</button></SHdr>
                {notifs.slice(0,3).map(n=>(
                  <div key={n.id} style={{padding:"9px 12px",borderLeft:`3px solid ${NCOL[n.tipo]}`,background:"#fafafa",borderRadius:8,marginBottom:6}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#1e293b"}}>{n.msg}</div>
                    <div style={{fontSize:11,color:"#94a3b8"}}>{n.sub}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={RS.section}>
              <SHdr title="⏰ Próximas Aberturas"><button style={RS.lnkBtn} onClick={()=>setTab("certames")}>Ver todas →</button></SHdr>
              {certames.filter(c=>c.monitorando&&c.status==="Aberto").length===0
                ?<div style={{fontSize:13,color:"#94a3b8"}}>Nenhum certame monitorado. <button style={{...RS.lnkBtn,fontSize:13}} onClick={()=>setTab("certames")}>Adicionar →</button></div>
                :certames.filter(c=>c.monitorando&&c.status==="Aberto").sort((a,b)=>new Date(a.dataAbertura)-new Date(b.dataAbertura)).slice(0,4).map(c=>{
                  const d=diasAte(c.dataAbertura); const prog=habProgress(c);
                  return(
                    <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid #f8fafc",cursor:"pointer"}} className="hov" onClick={()=>{setSelectedCert(c);setTab("certames");}}>
                      <div style={{minWidth:38,height:38,borderRadius:10,background:d<=3?"#dc2626":d<=7?"#d97706":"#1d4ed8",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:10,fontWeight:800,flexShrink:0}}>{d>0?d+"d":d===0?"HOJ":"ENC"}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:700,color:"#1e293b",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.titulo||c.objeto||""}</div>
                        <div style={{fontSize:10,color:"#94a3b8"}}>{c.tipoCertame} · {fmtDate(c.dataAbertura)}</div>
                      </div>
                      <div style={{...RS.pill,background:prog===100?"#f0fdf4":"#eff6ff",color:prog===100?"#16a34a":"#1d4ed8",flexShrink:0}}>{prog}%</div>
                    </div>
                  );
                })}
            </div>

            {/* Certidões alerta */}
            {stats.certidoesAlerta>0&&(
              <div style={RS.section}>
                <SHdr title="🏅 Certidões com Alerta"><button style={RS.lnkBtn} onClick={()=>setTab("certidoes")}>Gerenciar →</button></SHdr>
                {CERTIDOES_CONFIG.filter(cfg=>{const s=certidaoStatus(cfg.id);return s==="vencida"||s==="vencendo";}).map(cfg=>{
                  const reg=certidoes[cfg.id]; const d=diasAte(reg?.dataValidade);
                  return(
                    <div key={cfg.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #f8fafc"}}>
                      <span style={{fontSize:18}}>{cfg.icon}</span>
                      <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700}}>{cfg.sigla}</div><div style={{fontSize:10,color:"#94a3b8"}}>{cfg.orgao}</div></div>
                      <span style={{...RS.pill,background:d<=0?"#fef2f2":"#fffbeb",color:d<=0?"#dc2626":"#d97706",flexShrink:0}}>{d<=0?"Vencida":`${d}d`}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* EMPRESA */}
        {tab==="empresa"&&(
          <div style={RS.pg}>
            <PgHdr title="🏢 Minha Empresa"/>
            <div style={RS.card}><EmpresaForm form={formEmp} setForm={setFormEmp}/><button style={{...RS.btnPrimary,width:"100%",marginTop:16}} onClick={saveEmpresa} disabled={saving}>{saving?"Salvando...":"💾 Salvar"}</button></div>
          </div>
        )}

        {/* PNCP */}
        {tab==="fontes"&&!pncpSelected&&(
          <div style={RS.pg}>
            <PgHdr title="🌐 PNCP ao Vivo" sub="API pública · Próximos 90 dias">
              <button style={RS.refreshBtn} onClick={()=>fetchPNCP(pncpSearch,1)} disabled={pncpLoading}>{pncpLoading?"…":"↻"}</button>
            </PgHdr>
            <div style={RS.card}>
              <div style={{display:"flex",gap:8}}>
                <input style={{...RS.fi,flex:1}} placeholder="Filtrar objeto ou órgão..." value={pncpSearch} onChange={e=>setPncpSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&fetchPNCP(pncpSearch,1)}/>
                <button style={RS.btnPrimary} onClick={()=>fetchPNCP(pncpSearch,1)}>Buscar</button>
              </div>
            </div>
            {pncpLoading&&<Loading/>}
            {pncpError&&<div style={{textAlign:"center",padding:"40px 20px"}}><div style={{fontSize:28,marginBottom:8}}>⚠️</div><div style={{fontWeight:700,marginBottom:12}}>{pncpError}</div><button style={RS.btnPrimary} onClick={()=>fetchPNCP()}>Tentar novamente</button></div>}
            {!pncpLoading&&!pncpError&&<>
              <div style={{fontSize:12,color:"#94a3b8",marginBottom:10,fontWeight:600}}>{pncpItems.length} resultados</div>
              {pncpItems.map(l=>{
                const d=diasAte(l.dataAbertura);
                return(
                  <div key={l.id} style={RS.licCard} className="hov">
                    <div style={{display:"flex",gap:10,marginBottom:10}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:10,color:"#94a3b8",fontWeight:700,marginBottom:3}}>{l.modalidade}</div>
                        <div style={{fontSize:13,fontWeight:700,color:"#1e293b",lineHeight:1.4,marginBottom:4}}>{(l.objeto||"").slice(0,90)}{l.objeto?.length>90?"...":""}</div>
                        <div style={{fontSize:11,color:"#64748b"}}>🏛 {l.orgao} — {l.uf}</div>
                      </div>
                      <div style={{flexShrink:0,textAlign:"right"}}>
                        <div style={{fontSize:13,fontWeight:800,color:"#1d4ed8"}}>{fmt(l.valor)}</div>
                        <span style={{...RS.pill,background:"#eff6ff",color:"#1d4ed8",marginTop:4,display:"inline-block"}}>PNCP</span>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8,borderTop:"1px solid #f1f5f9",paddingTop:10}}>
                      <span style={{fontSize:11,color:d!==null&&d<=7?"#dc2626":"#64748b"}}>📅 {fmtDate(l.dataAbertura)} {d>0?`(${d}d)`:""}</span>
                      <div style={{marginLeft:"auto",display:"flex",gap:6}}>
                        <button style={RS.btnOut} onClick={()=>{setFormCert({...CERT0,titulo:(l.objeto||"").slice(0,80),tipoCertame:l.modalidade||"Pregão Eletrônico",numero:l.numeroControlePNCP||"",orgao:l.orgao||"",uf:l.uf||"",objeto:l.objeto||"",valor:l.valor||"",dataAbertura:l.dataAbertura||"",dataPublicacao:l.dataPublicacao||"",fonte:"PNCP",monitorando:true});setModalType("addCertame");showToast("📥 Dados importados!");}}>📥</button>
                        <button style={RS.btnSec} onClick={()=>setPncpSelected(l)}>Ver +</button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {pncpItems.length>0&&<div style={{display:"flex",justifyContent:"center",gap:12,padding:"14px 0"}}>
                <button style={RS.btnOut} disabled={pncpPag<=1} onClick={()=>{const p=pncpPag-1;setPncpPag(p);fetchPNCP(pncpSearch,p);}}>← Ant.</button>
                <span style={{fontSize:13,color:"#64748b",alignSelf:"center"}}>Pág. {pncpPag}</span>
                <button style={RS.btnOut} onClick={()=>{const p=pncpPag+1;setPncpPag(p);fetchPNCP(pncpSearch,p);}}>Próx. →</button>
              </div>}
            </>}
          </div>
        )}
        {tab==="fontes"&&pncpSelected&&(
          <div style={RS.pg}>
            <button style={RS.backBtn} onClick={()=>{setPncpSelected(null);setAiResult("");}}>← Voltar</button>
            <div style={RS.card}>
              <div style={{fontSize:11,color:"#94a3b8",fontWeight:700,marginBottom:4}}>{pncpSelected.modalidade}</div>
              <div style={{fontSize:16,fontWeight:800,color:"#0f172a",marginBottom:6,lineHeight:1.4}}>{pncpSelected.objeto}</div>
              <div style={{fontSize:12,color:"#64748b",marginBottom:8}}>🏛 {pncpSelected.orgao} — {pncpSelected.uf}</div>
              <div style={{fontSize:20,fontWeight:900,color:"#1d4ed8",marginBottom:12}}>{fmt(pncpSelected.valor)}</div>
              <div style={RS.iGrid}>
                {[{l:"Abertura",v:fmtDate(pncpSelected.dataAbertura)},{l:"Publicação",v:fmtDate(pncpSelected.dataPublicacao)},{l:"Dias",v:(()=>{const d=diasAte(pncpSelected.dataAbertura);return d>0?d+"d":d===0?"Hoje":"Enc.";})()},{l:"UF",v:pncpSelected.uf}].map((x,i)=>(
                  <div key={i} style={RS.iBox}><div style={{fontSize:10,color:"#94a3b8",fontWeight:700,textTransform:"uppercase"}}>{x.l}</div><div style={{fontSize:12,fontWeight:700,color:"#1e293b",marginTop:2}}>{x.v}</div></div>
                ))}
              </div>
              <button style={{...RS.btnPrimary,width:"100%",marginTop:12}} onClick={()=>{setFormCert({...CERT0,titulo:(pncpSelected.objeto||"").slice(0,80),tipoCertame:pncpSelected.modalidade||"Pregão Eletrônico",numero:pncpSelected.numeroControlePNCP||"",orgao:pncpSelected.orgao||"",uf:pncpSelected.uf||"",objeto:pncpSelected.objeto||"",valor:pncpSelected.valor||"",dataAbertura:pncpSelected.dataAbertura||"",dataPublicacao:pncpSelected.dataPublicacao||"",fonte:"PNCP",monitorando:true});setModalType("addCertame");showToast("📥 Importando!");}}>📥 Importar para Meus Certames</button>
            </div>
            <div style={RS.card}>
              <div style={{fontSize:13,fontWeight:800,marginBottom:10}}>🤖 Análise com IA</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
                <button style={RS.btnAI} onClick={()=>runAI("analise",pncpSelected)}>📋 Analisar</button>
              </div>
              {aiLoading&&<AILoad/>}
              {aiResult&&<pre style={RS.aiTxt}>{aiResult}</pre>}
            </div>
          </div>
        )}

        {/* CERTAMES */}
        {tab==="certames"&&!selectedCert&&(
          <div style={RS.pg}>
            <PgHdr title="📁 Meus Certames" sub={`${certames.length} cadastrados`}>
              <button style={RS.btnPrimary} onClick={()=>{setFormCert(CERT0);setModalType("addCertame");}}>+ Novo</button>
            </PgHdr>
            {certames.length===0&&<div style={{textAlign:"center",padding:"48px 20px",color:"#64748b"}}>
              <div style={{fontSize:40,marginBottom:8}}>📁</div><div style={{fontWeight:700,marginBottom:4}}>Nenhum certame</div>
              <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:12}}>
                <button style={RS.btnPrimary} onClick={()=>{setFormCert(CERT0);setModalType("addCertame");}}>+ Manual</button>
                <button style={RS.btnOut} onClick={()=>setTab("fontes")}>🌐 PNCP</button>
              </div>
            </div>}
            {certames.map(c=>{
              const d=diasAte(c.dataAbertura); const prog=habProgress(c);
              return(
                <div key={c.id} style={{...RS.licCard,borderLeft:`4px solid ${c.monitorando&&c.status==="Aberto"?d<=3?"#dc2626":d<=7?"#d97706":"#1d4ed8":"#e2e8f0"}`}} className="hov">
                  <div style={{display:"flex",gap:10,marginBottom:10}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:10,color:"#94a3b8",fontWeight:700,marginBottom:3}}>{c.tipoCertame} {c.numero&&`· ${c.numero}`}</div>
                      <div style={{fontSize:13,fontWeight:700,color:"#1e293b",lineHeight:1.4,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{c.titulo||c.objeto||""}</div>
                      <div style={{fontSize:11,color:"#64748b"}}>🏛 {c.orgao} {c.uf&&`— ${c.uf}`}</div>
                    </div>
                    <div style={{flexShrink:0,textAlign:"right",display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                      <div style={{fontSize:13,fontWeight:800,color:"#1d4ed8"}}>{fmt(c.valor)}</div>
                      <span style={{...RS.pill,background:(c.status==="Aberto"?"#16a34a":"#64748b")+"20",color:c.status==="Aberto"?"#16a34a":"#64748b"}}>{c.status}</span>
                    </div>
                  </div>
                  <div style={{marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#94a3b8",marginBottom:3}}><span>Habilitação</span><span style={{color:prog===100?"#16a34a":"#64748b"}}>{prog}%</span></div>
                    <div style={{background:"#f1f5f9",borderRadius:4,height:4}}><div style={{background:prog===100?"#16a34a":prog>50?"#1d4ed8":"#d97706",borderRadius:4,height:4,width:prog+"%",transition:"width .3s"}}/></div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,borderTop:"1px solid #f1f5f9",paddingTop:10}}>
                    <span style={{fontSize:10,color:d!==null&&d<=7&&c.status==="Aberto"?"#dc2626":"#94a3b8"}}>📅 {fmtDate(c.dataAbertura)}{d!==null&&d>0?` (${d}d)`:""}</span>
                    <button style={{...RS.btnSec,marginLeft:"auto"}} onClick={()=>{setSelectedCert(c);setCertSubTab("info");}}>Ver +</button>
                    <button style={{background:"none",border:"none",color:"#dc2626",fontSize:14,cursor:"pointer",padding:4}} onClick={()=>delCert(c.id)}>🗑</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CERTAME DETALHE */}
        {tab==="certames"&&selectedCert&&(
          <div style={RS.pg}>
            <button style={RS.backBtn} onClick={()=>{setSelectedCert(null);setAiResult("");}}>← Voltar</button>
            <div style={{display:"flex",gap:4,marginBottom:14,overflowX:"auto",scrollbarWidth:"none"}}>
              {[{id:"info",lb:"📋 Info"},{id:"hab",lb:"☑ Habilitação"},{id:"historico",lb:"📊 Histórico"},{id:"imp",lb:"⚠️ Impugnações"}].map(t=>(
                <button key={t.id} style={{...RS.subTab,...(certSubTab===t.id?RS.subTabOn:{})}} onClick={()=>setCertSubTab(t.id)}>{t.lb}</button>
              ))}
            </div>

            {certSubTab==="info"&&(
              <>
                <div style={RS.card}>
                  <div style={{fontSize:10,color:"#94a3b8",fontWeight:700,marginBottom:4}}>{selectedCert.tipoCertame}</div>
                  <div style={{fontSize:16,fontWeight:800,color:"#0f172a",marginBottom:4,lineHeight:1.4}}>{selectedCert.titulo||selectedCert.objeto}</div>
                  <div style={{fontSize:12,color:"#64748b",marginBottom:4}}>🏛 {selectedCert.orgao} {selectedCert.uf&&`— ${selectedCert.uf}`}</div>
                  {selectedCert.processo&&<div style={{fontSize:11,color:"#94a3b8",marginBottom:6}}>Proc. Adm.: {selectedCert.processo}</div>}
                  <div style={{fontSize:20,fontWeight:900,color:"#1d4ed8",marginBottom:10}}>{fmt(selectedCert.valor)}</div>
                  <div style={RS.iGrid}>
                    {[{l:"Nº Edital",v:selectedCert.numero||"—"},{l:"Status",v:selectedCert.status},{l:"Abertura",v:fmtDate(selectedCert.dataAbertura)},{l:"Encerramento",v:fmtDate(selectedCert.dataEncerramento)},{l:"Fonte",v:selectedCert.fonte||"—"},{l:"Resultado",v:selectedCert.resultado||"—"}].map((x,i)=>(
                      <div key={i} style={RS.iBox}><div style={{fontSize:9,color:"#94a3b8",fontWeight:700,textTransform:"uppercase"}}>{x.l}</div><div style={{fontSize:12,fontWeight:700,color:"#1e293b",marginTop:1}}>{x.v}</div></div>
                    ))}
                  </div>
                  {selectedCert.objeto&&<div style={{marginTop:10}}><div style={{fontSize:10,color:"#94a3b8",fontWeight:700,marginBottom:4,textTransform:"uppercase"}}>Objeto</div><p style={{fontSize:12,color:"#475569",lineHeight:1.6}}>{selectedCert.objeto}</p></div>}
                  <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #f1f5f9"}}>
                    <div style={{fontSize:10,color:"#64748b",fontWeight:700,marginBottom:6,textTransform:"uppercase"}}>Resultado</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {RESULTADO_OPTS.map(r=>(
                        <button key={r} style={{...RS.pill,cursor:"pointer",border:`1.5px solid ${selectedCert.resultado===r?"#1d4ed8":"#e2e8f0"}`,background:selectedCert.resultado===r?"#eff6ff":"none",color:selectedCert.resultado===r?"#1d4ed8":"#64748b"}}
                          onClick={()=>updateCert(selectedCert.id,{resultado:r})}>
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={RS.card}>
                  <div style={{fontSize:13,fontWeight:800,marginBottom:10}}>⚡ Ações Rápidas</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <button style={RS.btnAI} onClick={()=>runAI("analise",selectedCert)}>🤖 Analisar</button>
                    <button style={{...RS.btnAI,background:"#7c3aed"}} onClick={()=>{setFormProp({...PROP0,titulo:`Proposta — ${(selectedCert.titulo||"").slice(0,35)}`,certameId:selectedCert.id});setTab("propostas");}}>📝 Proposta</button>
                    <button style={{...RS.btnAI,background:"#0369a1"}} onClick={()=>{setFormDec(p=>({...p,certameId:selectedCert.id}));setTab("declaracoes");}}>📜 Declaração</button>
                    <button style={{...RS.btnAI,background:"#dc2626"}} onClick={()=>runAI("impugnacao",selectedCert)}>⚖️ Minuta Imp.</button>
                  </div>
                  {aiLoading&&<AILoad/>}
                  {aiResult&&<pre style={{...RS.aiTxt,marginTop:12}}>{aiResult}</pre>}
                </div>
              </>
            )}

            {certSubTab==="hab"&&(
              <div style={RS.card}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{fontSize:13,fontWeight:800}}>☑ Checklist de Habilitação</div>
                  <span style={{fontSize:14,fontWeight:800,color:habProgress(selectedCert)===100?"#16a34a":"#1d4ed8"}}>{habProgress(selectedCert)}%</span>
                </div>
                <div style={{background:"#f1f5f9",borderRadius:6,height:8,marginBottom:16}}>
                  <div style={{background:habProgress(selectedCert)===100?"#16a34a":"#1d4ed8",borderRadius:6,height:8,width:habProgress(selectedCert)+"%",transition:"width .3s"}}/>
                </div>
                {[...new Set(HABILITACAO_PADRAO.map(h=>h.grupo))].map(grupo=>{
                  const itens=(selectedCert.checklist||[]).filter(h=>h.grupo===grupo);
                  return(
                    <div key={grupo} style={{marginBottom:14}}>
                      <div style={{fontSize:10,fontWeight:800,color:"#1d4ed8",textTransform:"uppercase",letterSpacing:".4px",marginBottom:8,paddingBottom:4,borderBottom:"1.5px solid #eff6ff"}}>{grupo}</div>
                      {itens.map(item=>(
                        <div key={item.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid #f8fafc"}}>
                          <div style={{display:"flex",gap:3,flexShrink:0}}>
                            {[{s:"ok",c:"#16a34a",bg:"#f0fdf4",lb:"✓"},{s:"pendente",c:"#dc2626",bg:"#fef2f2",lb:"✗"},{s:"na",c:"#94a3b8",bg:"#f8fafc",lb:"—"}].map(btn=>(
                              <button key={btn.s} style={{width:22,height:22,borderRadius:5,border:`1.5px solid ${item.status===btn.s?btn.c:"#e2e8f0"}`,background:item.status===btn.s?btn.bg:"transparent",fontSize:11,cursor:"pointer",fontWeight:700,color:btn.c}}
                                onClick={()=>toggleHab(selectedCert.id,item.id,btn.s)}>
                                {btn.lb}
                              </button>
                            ))}
                          </div>
                          <span style={{flex:1,fontSize:12,color:"#1e293b"}}>{item.nome}</span>
                          {item.obrigatorio&&<span style={{fontSize:9,fontWeight:700,color:"#dc2626",border:"1px solid #fecaca",borderRadius:4,padding:"1px 4px",flexShrink:0}}>OBR</span>}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {certSubTab==="historico"&&(
              <div style={RS.card}>
                <div style={{fontSize:13,fontWeight:800,marginBottom:12}}>📊 Histórico</div>
                <div style={{display:"flex",gap:8,marginBottom:14}}>
                  <input style={{...RS.fi,flex:1}} placeholder="Registrar evento..." id="histInp"/>
                  <button style={RS.btnPrimary} onClick={()=>{const v=document.getElementById("histInp")?.value?.trim();if(v){updateCert(selectedCert.id,{historico:[...(selectedCert.historico||[]),{id:uid(),data:new Date().toISOString(),acao:v}]});document.getElementById("histInp").value="";showToast("✅ Registrado!");}else showToast("Digite um evento","error");}}>+ Add</button>
                </div>
                {(selectedCert.historico||[]).length===0?<div style={{fontSize:13,color:"#94a3b8",textAlign:"center",padding:"20px 0"}}>Nenhum evento</div>:
                  [...(selectedCert.historico||[])].reverse().map((h,i)=>(
                    <div key={h.id||i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:"1px solid #f8fafc"}}>
                      <div style={{width:34,height:34,borderRadius:10,background:"#eff6ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>📌</div>
                      <div><div style={{fontSize:12,fontWeight:600,color:"#1e293b"}}>{h.acao}</div><div style={{fontSize:10,color:"#94a3b8"}}>{new Date(h.data).toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</div></div>
                    </div>
                  ))}
                <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid #f1f5f9"}}>
                  <div style={{fontSize:10,color:"#64748b",fontWeight:700,marginBottom:6,textTransform:"uppercase"}}>Valor da Proposta Apresentada</div>
                  <div style={{display:"flex",gap:8}}>
                    <input style={{...RS.fi,flex:1}} type="number" id="valPropInp" placeholder="R$ 0,00" defaultValue={selectedCert.valorProposta||""}/>
                    <button style={RS.btnPrimary} onClick={()=>{const v=document.getElementById("valPropInp")?.value;if(v){updateCert(selectedCert.id,{valorProposta:v});showToast("Salvo!");}else showToast("Digite o valor","error");}}>Salvar</button>
                  </div>
                </div>
              </div>
            )}

            {certSubTab==="imp"&&(
              <div>
                <div style={RS.card}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div style={{fontSize:13,fontWeight:800}}>⚠️ Impugnações</div>
                    <button style={RS.btnPrimary} onClick={()=>setModalType("addImp")}>+ Nova</button>
                  </div>
                  {(selectedCert.impugnacoes||[]).length===0?<div style={{fontSize:13,color:"#94a3b8",textAlign:"center",padding:"18px 0"}}>Nenhuma impugnação</div>:
                    (selectedCert.impugnacoes||[]).map(i=>{
                      const d=diasAte(i.dataLimite);
                      return(
                        <div key={i.id} style={{background:"#fafafa",borderRadius:10,padding:"12px",border:"1px solid #e2e8f0",marginBottom:8}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                            <span style={{...RS.pill,background:{"Pendente":"#fef2f2","Protocolada":"#eff6ff","Deferida":"#f0fdf4","Indeferida":"#fef2f2"}[i.status]||"#f8fafc",color:{"Pendente":"#dc2626","Protocolada":"#1d4ed8","Deferida":"#16a34a","Indeferida":"#dc2626"}[i.status]||"#64748b"}}>{i.status}</span>
                            <button style={{background:"none",border:"none",color:"#dc2626",fontSize:13,cursor:"pointer"}} onClick={()=>updateCert(selectedCert.id,{impugnacoes:(selectedCert.impugnacoes||[]).filter(x=>x.id!==i.id)})}>🗑</button>
                          </div>
                          <div style={{fontSize:12,fontWeight:600,color:"#1e293b",marginBottom:4}}>{i.motivo}</div>
                          {i.dataLimite&&<div style={{fontSize:11,color:d!==null&&d<=2?"#dc2626":"#64748b"}}>⏰ Prazo: {fmtDate(i.dataLimite)}{d!==null&&d>=0?` (${d}d)`:""}</div>}
                        </div>
                      );
                    })}
                </div>
                <div style={RS.card}>
                  <div style={{fontSize:12,fontWeight:800,marginBottom:10}}>🤖 Minuta via IA</div>
                  <button style={RS.btnAI} onClick={()=>runAI("impugnacao",selectedCert)}>⚖️ Gerar Minuta</button>
                  {aiLoading&&<AILoad/>}
                  {aiResult&&<pre style={{...RS.aiTxt,marginTop:12}}>{aiResult}</pre>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* HABILITAÇÃO GERAL */}
        {tab==="habilitacao"&&(
          <div style={RS.pg}>
            <PgHdr title="☑ Habilitação" sub="Todos os certames"/>
            {certames.length===0?<div style={{textAlign:"center",padding:"48px",color:"#64748b"}}><div style={{fontSize:40}}>☑</div><div style={{fontWeight:700,marginTop:8}}>Nenhum certame</div></div>:
              certames.map(c=>{
                const prog=habProgress(c); const cl=c.checklist||[];
                const ok=cl.filter(h=>h.obrigatorio&&h.status==="ok"); const pend=cl.filter(h=>h.obrigatorio&&h.status==="pendente");
                return(
                  <div key={c.id} style={{...RS.licCard,cursor:"pointer"}} className="hov" onClick={()=>{setSelectedCert(c);setCertSubTab("hab");setTab("certames");}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:700,color:"#1e293b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.titulo||c.objeto||""}</div>
                        <div style={{fontSize:10,color:"#94a3b8"}}>{c.tipoCertame} · {c.orgao}</div>
                      </div>
                      <div style={{...RS.pill,background:prog===100?"#f0fdf4":"#eff6ff",color:prog===100?"#16a34a":"#1d4ed8",flexShrink:0,marginLeft:8}}>{prog}%</div>
                    </div>
                    <div style={{background:"#f1f5f9",borderRadius:6,height:6,marginBottom:8}}><div style={{background:prog===100?"#16a34a":prog>50?"#1d4ed8":"#d97706",borderRadius:6,height:6,width:prog+"%",transition:"width .3s"}}/></div>
                    <div style={{display:"flex",gap:12,fontSize:11}}>
                      <span style={{color:"#16a34a",fontWeight:700}}>✓ {ok.length}</span>
                      <span style={{color:"#dc2626",fontWeight:700}}>✗ {pend.length} pendentes</span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* HISTÓRICO */}
        {tab==="historico"&&(
          <div style={RS.pg}>
            <PgHdr title="📊 Histórico" sub="Participações"/>
            <div style={RS.grid4}>
              {[{l:"Total",v:certames.length,c:"#1d4ed8"},{l:"Vencedor",v:certames.filter(c=>c.resultado==="Vencedor").length,c:"#16a34a"},{l:"Em andamento",v:certames.filter(c=>c.resultado==="Em andamento"||!c.resultado).length,c:"#d97706"},{l:"Perdidos",v:certames.filter(c=>["Desclassificado","Inabilitado"].includes(c.resultado)).length,c:"#dc2626"}].map((s,i)=>(
                <div key={i} style={{...RS.statCard,background:s.c+"10",borderColor:s.c+"30"}}>
                  <div style={{fontSize:22,fontWeight:900,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:10,color:"#64748b",fontWeight:700}}>{s.l}</div>
                </div>
              ))}
            </div>
            {certames.sort((a,b)=>new Date(b.dataAbertura||0)-new Date(a.dataAbertura||0)).map(c=>(
              <div key={c.id} style={{...RS.licCard,cursor:"pointer"}} className="hov" onClick={()=>{setSelectedCert(c);setCertSubTab("historico");setTab("certames");}}>
                <div style={{display:"flex",gap:10,marginBottom:8}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:10,color:"#94a3b8",fontWeight:700,marginBottom:2}}>{c.tipoCertame} {c.numero&&`· ${c.numero}`}</div>
                    <div style={{fontSize:13,fontWeight:700,color:"#1e293b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.titulo||c.objeto||""}</div>
                  </div>
                  <div style={{flexShrink:0,textAlign:"right"}}>
                    <div style={{fontSize:13,fontWeight:800,color:"#1d4ed8"}}>{fmt(c.valor)}</div>
                    {c.resultado&&<span style={{...RS.pill,background:"#f8fafc",color:"#475569",display:"block",marginTop:4}}>{c.resultado}</span>}
                  </div>
                </div>
                <div style={{fontSize:10,color:"#94a3b8",borderTop:"1px solid #f8fafc",paddingTop:8}}>📅 {fmtDate(c.dataAbertura)} · {c.orgao} {c.uf&&`— ${c.uf}`}{c.valorProposta?` · Proposta: ${fmt(c.valorProposta)}`:""}</div>
              </div>
            ))}
          </div>
        )}

        {/* CALENDÁRIO */}
        {tab==="calendario"&&(
          <div style={RS.pg}>
            <PgHdr title="📅 Calendário"/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#fff",borderRadius:14,padding:"12px 16px",marginBottom:12,border:"1px solid #e2e8f0"}}>
              <button style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#1d4ed8",padding:"0 6px",fontWeight:700}} onClick={()=>{if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1);setCalDay(null);}}>‹</button>
              <span style={{fontSize:15,fontWeight:800,color:"#0f172a"}}>{MESES_PT[calMonth]} {calYear}</span>
              <button style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#1d4ed8",padding:"0 6px",fontWeight:700}} onClick={()=>{if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1);setCalDay(null);}}>›</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,background:"#fff",borderRadius:14,padding:"12px",border:"1px solid #e2e8f0",marginBottom:12}}>
              {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d=><div key={d} style={{textAlign:"center",fontSize:10,fontWeight:700,color:"#94a3b8",padding:"4px 0"}}>{d}</div>)}
              {Array(calDays.first).fill(null).map((_,i)=><div key={"e"+i}/>)}
              {Array(calDays.total).fill(null).map((_,i)=>{
                const day=i+1; const key=`${calYear}-${pad2(calMonth+1)}-${pad2(day)}`;
                const evts=calEvents[key]||[];
                const isToday=new Date().toISOString().slice(0,10)===key;
                const isSel=calDay===day;
                return(
                  <div key={day} style={{borderRadius:8,padding:"5px 2px",textAlign:"center",cursor:"pointer",minHeight:40,display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:isSel?"#1d4ed8":isToday?"#eff6ff":"transparent",transition:"background .1s"}} onClick={()=>setCalDay(day===calDay?null:day)}>
                    <span style={{fontSize:12,fontWeight:isToday||isSel?800:400,color:isSel?"#fff":isToday?"#1d4ed8":"#1e293b"}}>{day}</span>
                    {evts.length>0&&<div style={{display:"flex",gap:2,flexWrap:"wrap",justifyContent:"center"}}>{evts.slice(0,3).map((e,j)=><div key={j} style={{width:5,height:5,borderRadius:"50%",background:e.tipo==="certidao_vence"?"#7c3aed":e.tipo==="impugnacao"?"#dc2626":e.tipo==="encerramento"?"#d97706":"#1d4ed8"}}/>)}</div>}
                  </div>
                );
              })}
            </div>
            {calDay&&(
              <div style={RS.card}>
                <div style={{fontSize:13,fontWeight:800,marginBottom:10}}>📅 {pad2(calDay)}/{pad2(calMonth+1)}/{calYear}</div>
                {(calEvents[`${calYear}-${pad2(calMonth+1)}-${pad2(calDay)}`]||[]).length===0?<div style={{fontSize:13,color:"#94a3b8"}}>Nenhum evento</div>:
                  (calEvents[`${calYear}-${pad2(calMonth+1)}-${pad2(calDay)}`]||[]).map((e,i)=>(
                    <div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:"1px solid #f8fafc",cursor:"pointer"}} onClick={()=>{if(e.tipo!=="certidao_vence"){const c=certames.find(x=>x.id===e.id);if(c){setSelectedCert(c);setTab("certames");}}}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:e.tipo==="certidao_vence"?"#7c3aed":e.tipo==="impugnacao"?"#dc2626":e.tipo==="encerramento"?"#d97706":"#1d4ed8",flexShrink:0,marginTop:4}}/>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:"#1e293b"}}>{(e.titulo||e.objeto||"").slice(0,55)}</div>
                        <div style={{fontSize:10,color:"#94a3b8"}}>{e.tipo==="abertura"?"🟢 Abertura":e.tipo==="encerramento"?"🔴 Encerramento":e.tipo==="certidao_vence"?"🏅 Certidão Vence":"⚠️ Prazo Impugnação"} · {e.orgao}</div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
            <div style={{...RS.card,display:"flex",gap:16,flexWrap:"wrap"}}>
              {[{c:"#1d4ed8",l:"Abertura"},{c:"#d97706",l:"Encerramento"},{c:"#dc2626",l:"Impugnação"},{c:"#7c3aed",l:"Certidão"}].map((x,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"#64748b"}}><div style={{width:8,height:8,borderRadius:"50%",background:x.c}}/>{x.l}</div>
              ))}
            </div>
          </div>
        )}

        {/* IMPUGNAÇÕES GERAL */}
        {tab==="impugnacoes"&&(
          <div style={RS.pg}>
            <PgHdr title="⚠️ Impugnações" sub="Todos os certames"/>
            {certames.every(c=>(c.impugnacoes||[]).length===0)?<div style={{textAlign:"center",padding:"48px",color:"#64748b"}}><div style={{fontSize:40}}>⚖️</div><div style={{fontWeight:700,marginTop:8}}>Nenhuma impugnação</div></div>:
              certames.flatMap(c=>(c.impugnacoes||[]).map(i=>({...i,_certame:c}))).map(i=>{
                const d=diasAte(i.dataLimite);
                return(
                  <div key={i.id} style={{...RS.licCard,borderLeft:`4px solid ${i.status==="Pendente"?"#dc2626":"#64748b"}`,cursor:"pointer"}} className="hov" onClick={()=>{setSelectedCert(i._certame);setCertSubTab("imp");setTab("certames");}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <span style={{fontSize:10,color:"#94a3b8",fontWeight:700}}>{i._certame.tipoCertame} · {i._certame.orgao}</span>
                      <span style={{...RS.pill,background:{"Pendente":"#fef2f2","Protocolada":"#eff6ff","Deferida":"#f0fdf4"}[i.status]||"#f8fafc",color:{"Pendente":"#dc2626","Protocolada":"#1d4ed8","Deferida":"#16a34a"}[i.status]||"#64748b"}}>{i.status}</span>
                    </div>
                    <div style={{fontSize:12,fontWeight:600,color:"#1e293b",marginBottom:4}}>{i.motivo.slice(0,80)}</div>
                    {i.dataLimite&&<div style={{fontSize:11,color:d!==null&&d<=2?"#dc2626":"#64748b"}}>⏰ Prazo: {fmtDate(i.dataLimite)}{d!==null&&d>=0?` (${d}d)`:""}</div>}
                  </div>
                );
              })}
          </div>
        )}

        {/* ══ CERTIDÕES ══ */}
        {tab==="certidoes"&&(
          <div style={RS.pg}>
            <PgHdr title="🏅 Certidões" sub="Emissão via portais oficiais"/>
            <div style={{background:"#eff6ff",borderRadius:12,padding:"12px 14px",marginBottom:16,fontSize:12,color:"#1d4ed8",border:"1.5px solid #bfdbfe",lineHeight:1.6}}>
              💡 Clique em <strong>Emitir</strong> para acessar o portal oficial do órgão diretamente. O CNPJ é preenchido automaticamente quando disponível. Após emitir, registre a data para controle de vencimento.
            </div>
            {CERTIDOES_CONFIG.map(cfg=>{
              const reg=certidoes[cfg.id];
              const status=certidaoStatus(cfg.id);
              const statusLabel={valida:"Válida",vencendo:"Vencendo",vencida:"Vencida","sem-registro":"Não registrada"}[status];
              const statusColor={valida:"#16a34a",vencendo:"#d97706",vencida:"#dc2626","sem-registro":"#94a3b8"}[status];
              const d=reg?.dataValidade?diasAte(reg.dataValidade):null;
              const cnpjRaw=(empresa?.cnpj||"").replace(/\D/g,"");
              const urlFinal=cfg.id==="fgts"&&cnpjRaw?`${cfg.urlEmissao}?cnpj=${cnpjRaw}`:cfg.urlEmissao;
              return(
                <div key={cfg.id} style={{background:"#fff",borderRadius:14,padding:"14px",border:"1px solid #e2e8f0",marginBottom:10,borderLeft:`4px solid ${statusColor}`}}>
                  <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                    <div style={{fontSize:28,flexShrink:0}}>{cfg.icon}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,flexWrap:"wrap"}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:700,color:"#0f172a",lineHeight:1.3}}>{cfg.nome}</div>
                          <div style={{fontSize:11,color:"#64748b",marginTop:2}}>{cfg.orgao}</div>
                        </div>
                        <span style={{...RS.pill,background:statusColor+"20",color:statusColor,flexShrink:0}}>{statusLabel}</span>
                      </div>
                      {reg?.dataValidade&&(
                        <div style={{marginTop:6,fontSize:11,color:"#475569",display:"flex",gap:10,flexWrap:"wrap"}}>
                          {reg.dataEmissao&&<span>📅 Emissão: {fmtDate(reg.dataEmissao)}</span>}
                          <span style={{color:statusColor,fontWeight:700}}>⏰ Vence: {fmtDate(reg.dataValidade)}{d!==null?` (${d>0?d+"d":"HOJE"})`:""}</span>
                          {reg.obs&&<span>· {reg.obs}</span>}
                        </div>
                      )}
                      <div style={{marginTop:10,display:"flex",gap:8,flexWrap:"wrap"}}>
                        {cfg.urlEmissao?(
                          <a href={urlFinal} target="_blank" rel="noreferrer"
                            style={{display:"inline-flex",alignItems:"center",gap:6,background:cfg.cor,color:"#fff",borderRadius:8,padding:"7px 12px",fontSize:12,fontWeight:700,textDecoration:"none",flexShrink:0}}>
                            🌐 Emitir / Consultar
                          </a>
                        ):(
                          <span style={{fontSize:11,color:"#d97706",fontStyle:"italic"}}>Link manual — acesse a prefeitura do município</span>
                        )}
                        <button style={{...RS.btnOut,fontSize:12}} onClick={()=>{setFormCertidao({id:cfg.id,dataEmissao:reg?.dataEmissao||"",dataValidade:reg?.dataValidade||"",obs:reg?.obs||""});setModalType("certidao");}}>
                          📝 {reg?"Atualizar":"Registrar"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* DOCUMENTOS */}
        {tab==="documentos"&&(
          <div style={RS.pg}>
            <PgHdr title="📄 Documentos" sub={`${documentos.length} cadastrados`}>
              <button style={RS.btnPrimary} onClick={()=>{setFormDoc(DOC0);setModalType("addDoc");}}>+ Novo</button>
            </PgHdr>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              {[{l:"Total",v:documentos.length,c:"#1d4ed8"},{l:"Válidos",v:documentos.filter(d=>d.status==="Válido").length,c:"#16a34a"},{l:"Vencendo",v:documentos.filter(d=>d.status==="Vencendo").length,c:"#d97706"},{l:"Vencidos",v:documentos.filter(d=>d.status==="Vencido").length,c:"#dc2626"}].map((s,i)=>(
                <div key={i} style={{flex:1,background:"#fff",borderRadius:10,padding:"10px",textAlign:"center",border:"1px solid #e2e8f0",borderBottom:`3px solid ${s.c}`}}>
                  <div style={{fontSize:18,fontWeight:900,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:9,color:"#64748b",fontWeight:700}}>{s.l}</div>
                </div>
              ))}
            </div>
            {documentos.length===0&&<div style={{textAlign:"center",padding:"40px",color:"#64748b"}}><div style={{fontSize:36}}>📄</div><div style={{fontWeight:700,marginTop:8}}>Nenhum documento</div><button style={{...RS.btnPrimary,marginTop:12}} onClick={()=>setModalType("addDoc")}>+ Adicionar</button></div>}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
              {documentos.map(d=>(
                <div key={d.id} style={{background:"#fff",borderRadius:12,padding:"12px",border:"1px solid #e2e8f0"}} className="hov">
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:22}}>📄</span><span style={{...RS.pill,background:({"Válido":"#f0fdf4","Vencendo":"#fffbeb","Vencido":"#fef2f2"}[d.status]||"#f8fafc"),color:({"Válido":"#16a34a","Vencendo":"#d97706","Vencido":"#dc2626"}[d.status]||"#64748b")}}>{d.status}</span></div>
                  <div style={{fontSize:12,fontWeight:700,color:"#1e293b",marginBottom:2,lineHeight:1.3}}>{d.nome}</div>
                  <div style={{fontSize:10,color:"#94a3b8",fontWeight:600,marginBottom:6}}>{d.tipo}</div>
                  {d.validade&&<div style={{fontSize:10,fontWeight:700,color:({"Válido":"#16a34a","Vencendo":"#d97706","Vencido":"#dc2626"}[d.status]),marginBottom:8}}>Vence: {fmtDate(d.validade)}</div>}
                  <div style={{display:"flex",gap:6}}>
                    <button style={{...RS.btnOut,flex:1,fontSize:11}} onClick={()=>{setFormDoc(d);setModalType("addDoc");}}>✏ Editar</button>
                    <button style={{...RS.btnOut,color:"#dc2626",borderColor:"#fecaca",fontSize:11}} onClick={()=>delDoc(d.id)}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROPOSTAS */}
        {tab==="propostas"&&(
          <div style={RS.pg}>
            <PgHdr title="📝 Propostas"/>
            <div style={RS.card}>
              <div style={{fontSize:13,fontWeight:800,marginBottom:12}}>Nova Proposta</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <FG l="Título *"><FI value={formProp.titulo} onChange={e=>setFormProp(p=>({...p,titulo:e.target.value}))} placeholder="Ex: Proposta PE 001/2025"/></FG>
                <FG l="Vincular Certame">
                  <select style={RS.fi} value={formProp.certameId} onChange={e=>setFormProp(p=>({...p,certameId:e.target.value}))}>
                    <option value="">— Nenhum —</option>
                    {certames.map(c=><option key={c.id} value={c.id}>{c.tipoCertame} · {(c.titulo||c.objeto||"").slice(0,50)}</option>)}
                  </select>
                </FG>
                <label style={{fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase"}}>Itens</label>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:400}}>
                    <thead><tr>{["Descrição","Un","Qtd","R$ Unit","Total",""].map(h=><th key={h} style={{background:"#f1f5f9",padding:"6px 6px",textAlign:"left",fontSize:10,fontWeight:700,color:"#64748b",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
                    <tbody>{(formProp.itens||[]).map((it,i)=>(
                      <tr key={i}>
                        <td style={{padding:"4px 3px",borderBottom:"1px solid #f1f5f9"}}><input style={{...RS.fi,fontSize:12,minWidth:100}} value={it.desc} onChange={e=>setFormProp(p=>({...p,itens:p.itens.map((x,j)=>j===i?{...x,desc:e.target.value}:x)}))} placeholder="Item"/></td>
                        <td style={{padding:"4px 3px",borderBottom:"1px solid #f1f5f9"}}><input style={{...RS.fi,width:34,fontSize:12}} value={it.unidade} onChange={e=>setFormProp(p=>({...p,itens:p.itens.map((x,j)=>j===i?{...x,unidade:e.target.value}:x)}))}/></td>
                        <td style={{padding:"4px 3px",borderBottom:"1px solid #f1f5f9"}}><input style={{...RS.fi,width:42,fontSize:12}} type="number" value={it.qtd} onChange={e=>setFormProp(p=>({...p,itens:p.itens.map((x,j)=>j===i?{...x,qtd:e.target.value}:x)}))}/></td>
                        <td style={{padding:"4px 3px",borderBottom:"1px solid #f1f5f9"}}><input style={{...RS.fi,width:80,fontSize:12}} type="number" value={it.unit} onChange={e=>setFormProp(p=>({...p,itens:p.itens.map((x,j)=>j===i?{...x,unit:e.target.value}:x)}))}/></td>
                        <td style={{padding:"4px 3px",fontWeight:700,color:"#1d4ed8",fontSize:12,borderBottom:"1px solid #f1f5f9",whiteSpace:"nowrap"}}>{fmt((parseFloat(it.qtd)||0)*(parseFloat(it.unit)||0))}</td>
                        <td style={{padding:"4px 3px",borderBottom:"1px solid #f1f5f9"}}><button style={{background:"none",border:"none",color:"#dc2626",cursor:"pointer",fontSize:16}} onClick={()=>setFormProp(p=>({...p,itens:p.itens.filter((_,j)=>j!==i)}))}>×</button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <button style={RS.btnOut} onClick={()=>setFormProp(p=>({...p,itens:[...p.itens,{desc:"",unidade:"UN",qtd:1,unit:""}]}))}>+ Item</button>
                  <div style={{fontWeight:800,color:"#1d4ed8",fontSize:14}}>TOTAL: {fmt(totalProp)}</div>
                </div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  <FG l="Validade (dias)" style={{flex:1}}><FI value={formProp.validade} onChange={e=>setFormProp(p=>({...p,validade:e.target.value}))}/></FG>
                  <FG l="Prazo Entrega" style={{flex:2}}><FI value={formProp.prazoEntrega} onChange={e=>setFormProp(p=>({...p,prazoEntrega:e.target.value}))} placeholder="Ex: 30 dias após empenho"/></FG>
                </div>
                <FG l="Observações"><textarea style={{...RS.fi,minHeight:60,resize:"vertical"}} value={formProp.obs} onChange={e=>setFormProp(p=>({...p,obs:e.target.value}))} placeholder="Condições especiais..."/></FG>
                <div style={{display:"flex",gap:8}}>
                  <button style={{...RS.btnPrimary,flex:1}} onClick={saveProp}>💾 Salvar</button>
                  <button style={{...RS.btnPrimary,flex:1,background:"#16a34a"}} onClick={()=>{const c=certames.find(x=>x.id===formProp.certameId);gerarPDFProposta({...formProp,empresa,certame:c});showToast("📄 PDF!");}}>📄 PDF</button>
                </div>
              </div>
            </div>
            {propostas.length>0&&(
              <div style={RS.card}>
                <div style={{fontSize:12,fontWeight:800,marginBottom:10}}>Propostas Salvas</div>
                {propostas.map(p=>{
                  const c=certames.find(x=>x.id===p.certameId);
                  const tot=(p.itens||[]).reduce((a,it)=>a+(parseFloat(it.qtd)||0)*(parseFloat(it.unit)||0),0);
                  return(
                    <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid #f8fafc",flexWrap:"wrap"}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:700,color:"#1e293b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.titulo}</div>
                        {c&&<div style={{fontSize:10,color:"#94a3b8"}}>{c.tipoCertame} · {c.orgao}</div>}
                        <div style={{fontSize:13,fontWeight:800,color:"#1d4ed8"}}>{fmt(tot)}</div>
                      </div>
                      <div style={{display:"flex",gap:6,flexShrink:0}}>
                        <button style={RS.btnSec} onClick={()=>setFormProp(p)}>✏</button>
                        <button style={RS.btnSec} onClick={()=>{const c=certames.find(x=>x.id===p.certameId);gerarPDFProposta({...p,empresa,certame:c});}}>📄</button>
                        <button style={{background:"none",border:"none",color:"#dc2626",fontSize:14,cursor:"pointer",padding:4}} onClick={()=>delProp(p.id)}>🗑</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* DECLARAÇÕES */}
        {tab==="declaracoes"&&(
          <div style={RS.pg}>
            <PgHdr title="📜 Declarações" sub="Textos únicos por tipo · Lei 14.133/2021"/>
            <div style={RS.card}>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <FG l="Tipo de Declaração *">
                  <select style={RS.fi} value={formDec.decId} onChange={e=>setFormDec(p=>({...p,decId:e.target.value}))}>
                    {DECLARACOES_CONFIG.map(d=><option key={d.id} value={d.id}>{d.nome}</option>)}
                  </select>
                </FG>
                <FG l="Vincular ao Certame">
                  <select style={RS.fi} value={formDec.certameId} onChange={e=>setFormDec(p=>({...p,certameId:e.target.value}))}>
                    <option value="">— Nenhum —</option>
                    {certames.map(c=><option key={c.id} value={c.id}>{c.tipoCertame} · {(c.titulo||c.objeto||"").slice(0,50)}</option>)}
                  </select>
                </FG>
                {/* Fundamento */}
                {(() => {
                  const cfg=DECLARACOES_CONFIG.find(d=>d.id===formDec.decId);
                  const certame=certames.find(c=>c.id===formDec.certameId);
                  return cfg?(
                    <>
                      <div style={{background:"#eff6ff",borderRadius:8,padding:"8px 12px",fontSize:11,color:"#1d4ed8",border:"1px solid #bfdbfe"}}>
                        📋 <strong>Fundamento:</strong> {cfg.fundamento}
                      </div>
                      <div style={{background:"#f8fafc",borderRadius:10,padding:"14px",border:"1px solid #e2e8f0"}}>
                        <div style={{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",marginBottom:8}}>Pré-visualização</div>
                        <pre style={{fontSize:11,color:"#334155",lineHeight:1.8,whiteSpace:"pre-wrap",fontFamily:"inherit",maxHeight:300,overflowY:"auto"}}>{cfg.texto(empresa,certame)}</pre>
                      </div>
                      <button style={{...RS.btnPrimary,width:"100%"}} onClick={()=>{gerarPDFDeclaracao(cfg,empresa,certame);showToast("📜 PDF gerado!");}}>📄 Exportar em PDF</button>
                    </>
                  ):null;
                })()}
              </div>
            </div>
            <div style={RS.card}>
              <div style={{fontSize:12,fontWeight:800,marginBottom:10}}>Atalhos Rápidos</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
                {DECLARACOES_CONFIG.map(d=>(
                  <button key={d.id} style={{display:"flex",alignItems:"center",gap:8,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"10px 12px",cursor:"pointer",fontSize:12,fontWeight:600,color:"#1e293b",textAlign:"left"}}
                    onClick={()=>setFormDec(p=>({...p,decId:d.id}))}>
                    <span style={{fontSize:14}}>📜</span><span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.nome}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM NAV */}
      <nav style={RS.bnav}>
        {[{id:"dashboard",ic:"▣",lb:"Início"},{id:"fontes",ic:"🌐",lb:"Buscar"},{id:"certames",ic:"📁",lb:"Certames"},{id:"certidoes",ic:"🏅",lb:"Certidões"},{id:"propostas",ic:"📝",lb:"Propostas"}].map(n=>(
          <button key={n.id} style={{...RS.bnavBtn,...(tab===n.id?RS.bnavOn:{})}} onClick={()=>{setTab(n.id);if(n.id!=="certames")setSelectedCert(null);if(n.id!=="fontes")setPncpSelected(null);}}>
            <span style={{fontSize:19,lineHeight:1}}>{n.ic}</span>
            <span style={{fontSize:9,fontWeight:700}}>{n.lb}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// FORM COMPONENTS
// ══════════════════════════════════════════════════════════════════════
function EmpresaForm({form,setForm}){
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <SL>Dados Básicos</SL>
      <FG l="Razão Social *"><FI value={form.razaoSocial} onChange={e=>f("razaoSocial",e.target.value)} placeholder="Nome oficial da empresa"/></FG>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <FG l="CNPJ *" style={{flex:1,minWidth:140}}><FI value={form.cnpj} onChange={e=>f("cnpj",maskCNPJ(e.target.value))} placeholder="00.000.000/0001-00"/></FG>
        <FG l="Porte" style={{flex:1,minWidth:100}}><select style={RS.fi} value={form.porte} onChange={e=>f("porte",e.target.value)}>{["MEI","ME","EPP","Médio","Grande"].map(o=><option key={o}>{o}</option>)}</select></FG>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <FG l="IE" style={{flex:1,minWidth:120}}><FI value={form.ie} onChange={e=>f("ie",e.target.value)} placeholder="Isento ou nº"/></FG>
        <FG l="IM" style={{flex:1,minWidth:120}}><FI value={form.im} onChange={e=>f("im",e.target.value)}/></FG>
      </div>
      <SL>Endereço</SL>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <FG l="Logradouro" style={{flex:2,minWidth:180}}><FI value={form.logradouro} onChange={e=>f("logradouro",e.target.value)} placeholder="Rua, Av..."/></FG>
        <FG l="Nº" style={{flex:1,minWidth:70}}><FI value={form.numero} onChange={e=>f("numero",e.target.value)}/></FG>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <FG l="Complemento" style={{flex:1,minWidth:120}}><FI value={form.complemento} onChange={e=>f("complemento",e.target.value)}/></FG>
        <FG l="Bairro" style={{flex:1,minWidth:120}}><FI value={form.bairro} onChange={e=>f("bairro",e.target.value)}/></FG>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <FG l="Município" style={{flex:2,minWidth:140}}><FI value={form.municipio} onChange={e=>f("municipio",e.target.value)}/></FG>
        <FG l="UF" style={{flex:1,minWidth:70}}><select style={RS.fi} value={form.uf} onChange={e=>f("uf",e.target.value)}>{ESTADOS_BR.map(s=><option key={s}>{s}</option>)}</select></FG>
        <FG l="CEP" style={{flex:1,minWidth:100}}><FI value={form.cep} onChange={e=>f("cep",maskCEP(e.target.value))}/></FG>
      </div>
      <SL>Contato</SL>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <FG l="Telefone" style={{flex:1,minWidth:140}}><FI value={form.telefone} onChange={e=>f("telefone",maskPhone(e.target.value))}/></FG>
        <FG l="E-mail" style={{flex:2,minWidth:160}}><FI value={form.email} onChange={e=>f("email",e.target.value)}/></FG>
      </div>
      <SL>Representante Legal</SL>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <FG l="Nome Completo" style={{flex:2,minWidth:160}}><FI value={form.repNome} onChange={e=>f("repNome",e.target.value)}/></FG>
        <FG l="Cargo" style={{flex:1,minWidth:120}}><FI value={form.repCargo} onChange={e=>f("repCargo",e.target.value)} placeholder="Diretor, Sócio..."/></FG>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <FG l="CPF" style={{flex:1,minWidth:130}}><FI value={form.repCpf} onChange={e=>f("repCpf",e.target.value)} placeholder="000.000.000-00"/></FG>
        <FG l="E-mail" style={{flex:2,minWidth:160}}><FI value={form.repEmail} onChange={e=>f("repEmail",e.target.value)}/></FG>
      </div>
    </div>
  );
}

function CertameForm({form,setForm,onSave}){
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <FG l="Tipo *"><select style={RS.fi} value={form.tipoCertame} onChange={e=>f("tipoCertame",e.target.value)}>{TIPOS_CERTAME.map(t=><option key={t}>{t}</option>)}</select></FG>
      <FG l="Título / Resumo"><FI value={form.titulo} onChange={e=>f("titulo",e.target.value)} placeholder="Resumo do certame"/></FG>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <FG l="Nº Edital" style={{flex:1,minWidth:110}}><FI value={form.numero} onChange={e=>f("numero",e.target.value)} placeholder="001/2025"/></FG>
        <FG l="Processo Adm." style={{flex:1,minWidth:120}}><FI value={form.processo} onChange={e=>f("processo",e.target.value)}/></FG>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <FG l="Órgão" style={{flex:2,minWidth:160}}><FI value={form.orgao} onChange={e=>f("orgao",e.target.value)}/></FG>
        <FG l="UF" style={{flex:1,minWidth:70}}><select style={RS.fi} value={form.uf} onChange={e=>f("uf",e.target.value)}>{ESTADOS_BR.map(s=><option key={s}>{s}</option>)}</select></FG>
      </div>
      <FG l="Objeto"><textarea style={{...RS.fi,minHeight:60,resize:"vertical"}} value={form.objeto} onChange={e=>f("objeto",e.target.value)} placeholder="Descrição do objeto..."/></FG>
      <FG l="Valor Estimado (R$)"><FI type="number" value={form.valor} onChange={e=>f("valor",e.target.value)}/></FG>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <FG l="Publicação" style={{flex:1,minWidth:120}}><FI type="date" value={form.dataPublicacao} onChange={e=>f("dataPublicacao",e.target.value)}/></FG>
        <FG l="Abertura" style={{flex:1,minWidth:120}}><FI type="date" value={form.dataAbertura} onChange={e=>f("dataAbertura",e.target.value)}/></FG>
        <FG l="Encerramento" style={{flex:1,minWidth:120}}><FI type="date" value={form.dataEncerramento} onChange={e=>f("dataEncerramento",e.target.value)}/></FG>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <FG l="Status" style={{flex:1,minWidth:130}}><select style={RS.fi} value={form.status} onChange={e=>f("status",e.target.value)}>{STATUS_CERTAME_OPTS.map(s=><option key={s}>{s}</option>)}</select></FG>
        <FG l="Fonte" style={{flex:1,minWidth:130}}><select style={RS.fi} value={form.fonte} onChange={e=>f("fonte",e.target.value)}>{["Manual","PNCP","ComprasGov","BNC","Outros"].map(s=><option key={s}>{s}</option>)}</select></FG>
      </div>
      <FG l="URL do Edital"><FI value={form.editalUrl} onChange={e=>f("editalUrl",e.target.value)} placeholder="https://..."/></FG>
      <FG l="Observações"><textarea style={{...RS.fi,minHeight:50,resize:"vertical"}} value={form.obs} onChange={e=>f("obs",e.target.value)}/></FG>
      <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,cursor:"pointer",color:"#475569"}}>
        <input type="checkbox" checked={form.monitorando} onChange={e=>f("monitorando",e.target.checked)}/> Monitorar este certame
      </label>
      <button style={{...RS.btnPrimary,width:"100%"}} onClick={()=>onSave(form)}>💾 Salvar Certame</button>
    </div>
  );
}

function DocForm({form,setForm,onSave}){
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <FG l="Nome *"><FI value={form.nome} onChange={e=>f("nome",e.target.value)} placeholder="Ex: Certidão Negativa Federal"/></FG>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <FG l="Tipo" style={{flex:1,minWidth:130}}><select style={RS.fi} value={form.tipo} onChange={e=>f("tipo",e.target.value)}>{["Certidão","Contábil","Jurídico","Técnico","Trabalhista","Fiscal","Outros"].map(t=><option key={t}>{t}</option>)}</select></FG>
        <FG l="Validade" style={{flex:1,minWidth:130}}><FI type="date" value={form.validade} onChange={e=>f("validade",e.target.value)}/></FG>
      </div>
      <FG l="Arquivo"><FI value={form.arquivo} onChange={e=>f("arquivo",e.target.value)} placeholder="nome-do-arquivo.pdf"/></FG>
      <button style={{...RS.btnPrimary,width:"100%"}} onClick={onSave}>💾 Salvar</button>
    </div>
  );
}

function ImpForm({onSave}){
  const [form,setForm]=useState({motivo:"",dataLimite:"",dataProtocolo:"",status:"Pendente",obs:""});
  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <FG l="Motivo / Fundamento *"><textarea style={{...RS.fi,minHeight:80,resize:"vertical"}} value={form.motivo} onChange={e=>setForm(p=>({...p,motivo:e.target.value}))} placeholder="Descreva o fundamento..."/></FG>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <FG l="Data Limite" style={{flex:1,minWidth:120}}><FI type="date" value={form.dataLimite} onChange={e=>setForm(p=>({...p,dataLimite:e.target.value}))}/></FG>
        <FG l="Data Protocolo" style={{flex:1,minWidth:120}}><FI type="date" value={form.dataProtocolo} onChange={e=>setForm(p=>({...p,dataProtocolo:e.target.value}))}/></FG>
      </div>
      <FG l="Status"><select style={RS.fi} value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>{["Pendente","Protocolada","Respondida","Deferida","Indeferida"].map(s=><option key={s}>{s}</option>)}</select></FG>
      <FG l="Observações"><textarea style={{...RS.fi,minHeight:50,resize:"vertical"}} value={form.obs} onChange={e=>setForm(p=>({...p,obs:e.target.value}))}/></FG>
      <button style={{...RS.btnPrimary,width:"100%"}} onClick={()=>onSave(form)}>💾 Registrar</button>
    </div>
  );
}

// Micro
const FG=({l,children,style})=><div style={{flex:1,display:"flex",flexDirection:"column",gap:4,...style}}><label style={{fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:".3px"}}>{l}</label>{children}</div>;
const FI=(props)=><input style={RS.fi} {...props}/>;
const FA=(props)=><textarea style={{...RS.fi,minHeight:60,resize:"vertical"}} {...props}/>;
const SL=({children})=><div style={{fontSize:10,fontWeight:800,color:"#1d4ed8",textTransform:"uppercase",letterSpacing:".5px",paddingBottom:4,borderBottom:"1.5px solid #eff6ff",marginTop:4}}>{children}</div>;
const PgHdr=({title,sub,children})=><div style={{marginBottom:18,display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}><div><h1 style={{fontSize:20,fontWeight:800,color:"#0f172a",letterSpacing:"-.5px"}}>{title}</h1>{sub&&<p style={{fontSize:12,color:"#94a3b8",marginTop:2}}>{sub}</p>}</div><div style={{display:"flex",gap:8}}>{children}</div></div>;
const SHdr=({title,children})=><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{fontSize:13,fontWeight:800,color:"#1e293b"}}>{title}</span>{children}</div>;
const Loading=()=><div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,padding:"50px",color:"#94a3b8",fontSize:14}}><div style={{width:28,height:28,border:"3px solid #e2e8f0",borderTop:"3px solid #1d4ed8",borderRadius:"50%"}} className="spin"/>Carregando...</div>;
const AILoad=()=><div style={{display:"flex",alignItems:"center",gap:8,padding:"12px 0",color:"#64748b",fontSize:13}}><div style={{width:15,height:15,border:"2px solid #e2e8f0",borderTop:"2px solid #1d4ed8",borderRadius:"50%"}} className="spin"/>Analisando com IA...</div>;

// ══════════════════════════════════════════════════════════════════════
// STYLES — Totalmente responsivos PC + Mobile
// ══════════════════════════════════════════════════════════════════════
const RS = {
  root:{fontFamily:"'DM Sans','Nunito',sans-serif",background:"#f1f5f9",minHeight:"100vh",color:"#1e293b",display:"flex",flexDirection:"column"},
  onboard:{maxWidth:640,margin:"0 auto",padding:"32px 20px 100px",width:"100%"},
  card:{background:"#fff",borderRadius:16,padding:"16px",border:"1px solid #e2e8f0",marginBottom:12},
  hdr:{background:"#fff",borderBottom:"1px solid #e2e8f0",padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50},
  menuBtn:{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#475569",padding:"4px 6px"},
  notifBtn:{background:"none",border:"none",cursor:"pointer",fontSize:18,padding:"6px 8px",borderRadius:8,position:"relative"},
  nDot:{position:"absolute",top:2,right:2,background:"#dc2626",color:"#fff",borderRadius:"50%",fontSize:8,fontWeight:800,width:14,height:14,display:"flex",alignItems:"center",justifyContent:"center"},
  avatar:{width:32,height:32,borderRadius:"50%",background:"#1d4ed8",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0},
  sidebar:{position:"fixed",left:0,top:0,bottom:0,width:260,background:"#0f172a",zIndex:200,transition:"transform .25s",display:"flex",flexDirection:"column"},
  sbLogo:{display:"flex",alignItems:"center",gap:12,padding:"18px 16px",borderBottom:"1px solid #1e293b",cursor:"pointer"},
  sbItem:{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:13,fontWeight:600,textAlign:"left",width:"100%"},
  sbItemOn:{background:"#1e3a5f",color:"#60a5fa"},
  sbBadge:{marginLeft:"auto",background:"#dc2626",color:"#fff",borderRadius:10,fontSize:10,padding:"2px 6px",fontWeight:700},
  overlay:{position:"fixed",inset:0,background:"#00000055",zIndex:150},
  notifPanel:{position:"fixed",top:57,right:0,width:300,maxWidth:"92vw",background:"#fff",border:"1px solid #e2e8f0",borderRadius:"0 0 0 14px",boxShadow:"0 8px 30px #00000022",zIndex:200,maxHeight:420,overflowY:"auto"},
  mOverlay:{position:"fixed",inset:0,background:"#00000060",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"},
  modal:{background:"#fff",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:600,maxHeight:"92vh",overflow:"hidden",display:"flex",flexDirection:"column"},
  mHdr:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 18px",borderBottom:"1px solid #f1f5f9",fontWeight:700,fontSize:14},
  mBody:{overflowY:"auto",padding:"16px 18px 32px"},
  main:{flex:1,overflowY:"auto",paddingBottom:72},
  pg:{padding:"18px 20px",maxWidth:900,margin:"0 auto",width:"100%"},
  grid4:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10,marginBottom:18},
  statCard:{borderRadius:14,padding:"14px",border:"1.5px solid",display:"flex",flexDirection:"column",gap:4},
  section:{background:"#fff",borderRadius:14,padding:"14px 16px",marginBottom:12,border:"1px solid #e2e8f0"},
  licCard:{background:"#fff",borderRadius:14,padding:"14px",border:"1px solid #e2e8f0",marginBottom:10},
  pill:{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:6,display:"inline-block"},
  iGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8,marginTop:10},
  iBox:{background:"#f8fafc",borderRadius:10,padding:"10px 12px",border:"1px solid #f1f5f9"},
  subTabs:{display:"flex",gap:4,marginBottom:14,overflowX:"auto",scrollbarWidth:"none"},
  subTab:{background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:10,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer",color:"#64748b",whiteSpace:"nowrap",flexShrink:0},
  subTabOn:{background:"#1d4ed8",borderColor:"#1d4ed8",color:"#fff"},
  tlItem:{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid #f8fafc",cursor:"pointer"},
  lnkBtn:{background:"none",border:"none",color:"#1d4ed8",fontSize:12,fontWeight:700,cursor:"pointer"},
  backBtn:{background:"none",border:"none",color:"#1d4ed8",fontSize:13,fontWeight:700,cursor:"pointer",padding:"0 0 12px",display:"block"},
  fi:{border:"1.5px solid #e2e8f0",borderRadius:8,padding:"9px 12px",fontSize:13,color:"#1e293b",outline:"none",fontFamily:"inherit",background:"#fafafa",width:"100%",boxSizing:"border-box"},
  btnPrimary:{background:"#1d4ed8",color:"#fff",border:"none",borderRadius:10,padding:"9px 16px",fontSize:13,fontWeight:700,cursor:"pointer"},
  btnSec:{background:"#eff6ff",color:"#1d4ed8",border:"none",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer"},
  btnOut:{background:"none",color:"#475569",border:"1.5px solid #e2e8f0",borderRadius:8,padding:"7px 12px",fontSize:12,fontWeight:700,cursor:"pointer"},
  btnAI:{background:"#1d4ed8",color:"#fff",border:"none",borderRadius:8,padding:"8px 12px",fontSize:12,fontWeight:700,cursor:"pointer"},
  refreshBtn:{background:"#f1f5f9",border:"none",borderRadius:8,width:36,height:36,fontSize:18,cursor:"pointer",color:"#1d4ed8"},
  aiTxt:{fontSize:11,color:"#334155",lineHeight:1.7,whiteSpace:"pre-wrap",fontFamily:"inherit",background:"#f8fafc",borderRadius:8,padding:"12px",border:"1px solid #e2e8f0",maxHeight:260,overflowY:"auto"},
  toast:{position:"fixed",top:66,left:"50%",transform:"translateX(-50%)",color:"#fff",padding:"10px 22px",borderRadius:20,fontSize:13,fontWeight:700,zIndex:999,boxShadow:"0 4px 20px #00000030",whiteSpace:"nowrap"},
  bnav:{position:"fixed",bottom:0,left:0,right:0,background:"#fff",borderTop:"1px solid #e2e8f0",display:"flex",justifyContent:"center",gap:0,padding:"7px 0 10px",zIndex:100},
  bnavBtn:{background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"pointer",color:"#94a3b8",padding:"4px 16px",borderRadius:8,minWidth:60},
  bnavOn:{color:"#1d4ed8"},
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#f1f5f9;margin:0}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}
  .hov{transition:transform .12s,box-shadow .12s}
  .hov:hover{transform:translateY(-1px);box-shadow:0 4px 18px #00000012}
  input:focus,select:focus,textarea:focus{border-color:#1d4ed8!important}
  input[type=date]{color-scheme:light}
  @keyframes spin{to{transform:rotate(360deg)}}
  .spin{animation:spin .8s linear infinite}
  select option{background:#fff;color:#1e293b}
  @media(min-width:768px){
    .hdr-inner{max-width:1200px;margin:0 auto;width:100%}
  }
  @media(max-width:640px){
    .hide-mobile{display:none!important}
  }
`;

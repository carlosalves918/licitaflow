import { useState, useEffect, useCallback, useMemo, useRef } from "react";

// ══════════════════════════════════════════════════════════════════════
// ADMIN CONFIG — altere a senha aqui antes de fazer deploy
// ══════════════════════════════════════════════════════════════════════
const ADMIN_SENHA = "licitaflow@admin2025";
const APP_SENHA = "licitaflow2025"; // Senha de acesso ao sistema
const APP_VERSION = "v7";

// ══════════════════════════════════════════════════════════════════════
// CERTIDÕES — portais oficiais ATUALIZADOS 2025
// ══════════════════════════════════════════════════════════════════════
const CERTIDOES_CONFIG = [
  {
    id:"cnd_federal",
    nome:"Certidão Negativa Federal (RFB/PGFN)",
    sigla:"CND Federal",
    orgao:"Receita Federal + PGFN",
    icon:"🏦",
    validade:180,
    cor:"#1d4ed8",
    urlEmissao:"https://servicos.receitafederal.gov.br/servico/certidoes/",
    urlConsulta:"https://servicos.receitafederal.gov.br/servico/certidoes/",
    instrucao:"Acesse o portal da Receita Federal, clique em 'Emitir certidão de regularidade fiscal' e informe o CNPJ.",
    tipo:"Fiscal Federal",
  },
  {
    id:"fgts",
    nome:"Certificado de Regularidade FGTS (CRF)",
    sigla:"CRF/FGTS",
    orgao:"Caixa Econômica Federal",
    icon:"🏛",
    validade:30,
    cor:"#f97316",
    urlEmissao:"https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf",
    urlConsulta:"https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf",
    instrucao:"Acesse o portal da CAIXA e informe o CNPJ (só números) para consultar e emitir o CRF.",
    tipo:"Fiscal FGTS",
  },
  {
    id:"cndt",
    nome:"Certidão Negativa de Débitos Trabalhistas (CNDT)",
    sigla:"CNDT",
    orgao:"Tribunal Superior do Trabalho",
    icon:"⚖️",
    validade:180,
    cor:"#7c3aed",
    urlEmissao:"https://www.tst.jus.br/certidao",
    urlConsulta:"https://www.tst.jus.br/certidao",
    instrucao:"Acesse o portal do TST, informe o CNPJ e clique em 'Emitir Certidão'. Gratuito e válido por 180 dias.",
    tipo:"Trabalhista",
  },
  {
    id:"tjpe",
    nome:"Certidão Negativa Cível – TJPE",
    sigla:"CND Cível/TJPE",
    orgao:"Tribunal de Justiça de Pernambuco",
    icon:"🏛",
    validade:90,
    cor:"#0369a1",
    urlEmissao:"https://certidoesunificadas.app.tjpe.jus.br/",
    urlConsulta:"https://certidoesunificadas.app.tjpe.jus.br/",
    instrucao:"Acesse o portal unificado do TJPE, informe o CNPJ e solicite a Certidão Negativa Cível.",
    tipo:"Judicial",
  },
  {
    id:"cnd_estadual",
    nome:"Certidão Negativa Estadual (SEFAZ-PE)",
    sigla:"CND Estadual",
    orgao:"SEFAZ Pernambuco",
    icon:"🗂",
    validade:60,
    cor:"#16a34a",
    urlEmissao:"https://efisco.sefaz.pe.gov.br/sfi_trb_gcc/PREmitirCertidaoRegularidadeFiscal",
    urlConsulta:"https://efisco.sefaz.pe.gov.br/sfi_trb_gcc/PREmitirCertidaoRegularidadeFiscal",
    instrucao:"Acesse o eFisco da SEFAZ-PE, informe o CNPJ e emita a Certidão de Regularidade Fiscal Estadual.",
    tipo:"Fiscal Estadual",
  },
  {
    id:"cnd_municipal",
    nome:"Certidão Negativa Municipal",
    sigla:"CND Municipal",
    orgao:"Prefeitura Municipal",
    icon:"🏙",
    validade:60,
    cor:"#d97706",
    urlEmissao:"",
    urlConsulta:"",
    instrucao:"O link varia conforme o município. Acesse o portal da prefeitura da cidade onde a empresa está registrada e busque por 'certidão negativa' ou 'emissão de certidões'.",
    tipo:"Fiscal Municipal",
  },
  {
    id:"falencia",
    nome:"Certidão Negativa de Falência e Recuperação Judicial",
    sigla:"Cert. Falência",
    orgao:"TJPE — 1ª e 2ª Vara Empresarial",
    icon:"📋",
    validade:30,
    cor:"#dc2626",
    urlEmissao:"https://certidoesunificadas.app.tjpe.jus.br/",
    urlConsulta:"https://certidoesunificadas.app.tjpe.jus.br/",
    instrucao:"Acesse o portal unificado do TJPE e solicite a Certidão Negativa de Falência e Recuperação Judicial.",
    tipo:"Judicial",
  },
  {
    id:"simples",
    nome:"Comprovante Simples Nacional / MEI",
    sigla:"Simples Nacional",
    orgao:"Receita Federal",
    icon:"📄",
    validade:365,
    cor:"#0891b2",
    urlEmissao:"https://www8.receita.fazenda.gov.br/SimplesNacional/aplicacoes.aspx?id=21",
    urlConsulta:"https://www8.receita.fazenda.gov.br/SimplesNacional/aplicacoes.aspx?id=21",
    instrucao:"Acesse o portal da Receita Federal (Simples Nacional) para consultar situação e imprimir comprovante de opção.",
    tipo:"Fiscal Federal",
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
  async del(k){try{await window.storage.delete(k);return true;}catch{return false;}},
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
  body{font-family:'DM Sans',sans-serif;color:#1e293b;padding:48px 52px;font-size:13px;line-height:1.8}
  .timbre{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding-bottom:14px;border-bottom:2.5px solid #1d4ed8;gap:16px}
  .timbre-logo{flex-shrink:0}
  .timbre-logo img{max-height:70px;max-width:200px;object-fit:contain;display:block}
  .timbre-info{flex:1;text-align:right}
  .timbre-info .empresa-nome{font-size:15px;font-weight:800;color:#0f172a}
  .timbre-info .empresa-cnpj{font-size:11px;color:#64748b;margin-top:2px}
  .timbre-info .empresa-end{font-size:10.5px;color:#94a3b8;margin-top:1px}
  .sem-timbre{border-bottom:2.5px solid #1d4ed8;margin-bottom:20px;padding-bottom:14px;text-align:right}
  .sem-timbre .empresa-nome{font-size:15px;font-weight:800;color:#0f172a}
  .sem-timbre .empresa-cnpj{font-size:11px;color:#64748b}
  h1{font-size:20px;font-weight:900;color:#1d4ed8;margin-bottom:4px;text-align:center;text-transform:uppercase;letter-spacing:.8px}
  h2{font-size:13.5px;font-weight:700;margin:22px 0 10px;border-bottom:2px solid #e2e8f0;padding-bottom:5px;color:#0f172a}
  .badge{display:block;padding:6px 14px;border-radius:8px;font-size:12px;font-weight:700;background:#eff6ff;color:#1d4ed8;margin:10px 0 16px;text-align:center}
  .g2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}
  .box{background:#f8fafc;border-radius:8px;padding:10px 14px;border:1px solid #e2e8f0}
  .lbl{font-size:9.5px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.4px}
  .val{font-size:13px;font-weight:700;color:#1e293b;margin-top:2px}
  table{width:100%;border-collapse:collapse;margin:12px 0;font-size:12.5px}
  th{background:#1d4ed8;color:#fff;padding:9px 10px;text-align:left;font-size:11px;font-weight:700}
  td{padding:8px 10px;border-bottom:1px solid #f1f5f9;font-size:12.5px}
  tr:nth-child(even) td{background:#f8fafc}
  .total{font-size:18px;font-weight:900;color:#1d4ed8;text-align:right;margin:16px 0;padding:10px 0;border-top:2px solid #e2e8f0}
  .footer{margin-top:48px;padding:16px 0 0;border-top:2px solid #e2e8f0;font-size:12px;color:#64748b}
  .footer-main{display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;font-weight:600}
  .footer-addr{text-align:center;font-size:11.5px;color:#475569;margin-top:6px;font-weight:500;line-height:1.6}
  .dec-body{background:#f8fafc;border-radius:10px;padding:28px 32px;margin-top:16px;line-height:2.1;border:1px solid #e2e8f0;white-space:pre-wrap;font-size:13px}
  .sign{margin-top:60px;text-align:center}
  .sign-line{width:300px;border-top:1.5px solid #1e293b;margin:0 auto 8px}
  .sign-name{font-size:13px;font-weight:700}
  .sign-sub{font-size:11.5px;color:#64748b;margin-top:2px}
  .prop-title{text-align:center;margin:0 auto 20px;padding:12px 24px;background:linear-gradient(135deg,#eff6ff,#f5f3ff);border-radius:10px;border:1.5px solid #c7d2fe}
  .prop-title h1{margin:0}
  @media print{body{padding:24px 32px}}
</style>`;

const gerarPDFDeclaracao = (decConfig, empresa, certame) => {
  const texto = decConfig.texto(empresa, certame);
  const esc = s => String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const endFull = [empresa?.logradouro, empresa?.numero&&"nº "+empresa.numero, empresa?.bairro, empresa?.municipio&&empresa.municipio+(empresa?.uf?"/"+empresa.uf:""), empresa?.cep].filter(Boolean).join(", ");
  const timbreHtml = empresa?.timbre
    ? `<div class="timbre"><div class="timbre-logo"><img src="${esc(empresa.timbre)}" alt="Logo" crossorigin="anonymous"/></div><div class="timbre-info"><div class="empresa-nome">${esc(empresa.razaoSocial)}</div><div class="empresa-cnpj">CNPJ: ${esc(empresa.cnpj)}</div><div class="empresa-end">${esc(endFull)}</div></div></div>`
    : `<div class="sem-timbre"><div class="empresa-nome">${esc(empresa?.razaoSocial)}</div><div class="empresa-cnpj">CNPJ: ${esc(empresa?.cnpj)}</div></div>`;
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(decConfig.nome)}</title>${pdfCSS}</head><body>
    ${timbreHtml}
    <h1>${esc(decConfig.nome)}</h1>
    ${certame?`<div class="badge">${esc(certame.tipoCertame)} nº ${esc(certame.numero||"—")} — ${esc(certame.orgao||"")}</div>`:""}
    <div class="dec-body">${esc(texto)}</div>
    <div class="footer">
      <div class="footer-main"><span>LicitaFlow v7 © ${new Date().getFullYear()} · Documento gerado eletronicamente</span><span>${esc(decConfig.fundamento)}</span></div>
      <div class="footer-addr">${esc(empresa?.razaoSocial)} · CNPJ ${esc(empresa?.cnpj)} · ${esc(endFull)}</div>
    </div>
  </body></html>`;
  openPDF(html);
};

const gerarPDFProposta = (dados) => {
  const {empresa:e,certame:c,itens,validade,prazoEntrega,obs,titulo,tipo,banco,agencia,conta,pix} = dados;
  const total=(itens||[]).reduce((a,it)=>a+(parseFloat(it.qtd)||0)*(parseFloat(it.unit)||0),0);
  const esc = s => String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const endFull = [e?.logradouro, e?.numero&&"nº "+e.numero, e?.bairro, e?.municipio&&e.municipio+(e?.uf?"/"+e.uf:""), e?.cep].filter(Boolean).join(", ");
  const isProp = tipo==="readequada";
  const timbreHtml = e?.timbre
    ? `<div class="timbre"><div class="timbre-logo"><img src="${esc(e.timbre)}" alt="Logo" crossorigin="anonymous"/></div><div class="timbre-info"><div class="empresa-nome">${esc(e.razaoSocial)}</div><div class="empresa-cnpj">CNPJ: ${esc(e.cnpj)}</div><div class="empresa-end">${esc(endFull)}</div></div></div>`
    : `<div class="sem-timbre"><div class="empresa-nome">${esc(e?.razaoSocial)}</div><div class="empresa-cnpj">CNPJ: ${esc(e?.cnpj)}</div></div>`;
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${isProp?"Proposta Readequada":"Proposta Comercial"}</title>${pdfCSS}</head><body>
    ${timbreHtml}
    <div class="prop-title"><h1>${isProp?"PROPOSTA READEQUADA FINAL":"PROPOSTA COMERCIAL DE PREÇOS"}</h1></div>
    ${c?`<div class="badge">${esc(c.tipoCertame)} nº ${esc(c.numero||"—")} — ${esc(c.orgao||"")} ${c.uf?"/ "+c.uf:""}</div>`:""}
    <h2>Empresa Proponente</h2>
    <div class="g2">
      <div class="box"><div class="lbl">Razão Social</div><div class="val">${esc(e?.razaoSocial||"—")}</div></div>
      <div class="box"><div class="lbl">CNPJ</div><div class="val">${esc(e?.cnpj||"—")}</div></div>
      <div class="box"><div class="lbl">Endereço</div><div class="val">${esc(endFull||"—")}</div></div>
      <div class="box"><div class="lbl">Representante Legal</div><div class="val">${esc(e?.repNome||"—")} · ${esc(e?.repCargo||"")}</div></div>
    </div>
    ${c?`<h2>Dados do Processo Licitatório</h2><div class="g2">
      <div class="box"><div class="lbl">Modalidade</div><div class="val">${esc(c.tipoCertame||"—")}</div></div>
      <div class="box"><div class="lbl">Processo Adm.</div><div class="val">${esc(c.processo||"—")}</div></div>
      <div class="box"><div class="lbl">Órgão / UF</div><div class="val">${esc(c.orgao||"—")} / ${esc(c.uf||"")}</div></div>
      <div class="box"><div class="lbl">Data Abertura</div><div class="val">${fmtDate(c.dataAbertura)}</div></div>
    </div>`:""}
    <h2>Itens da Proposta${isProp?" Readequada":""}</h2>
    <table><thead><tr><th>#</th><th>Descrição</th><th>Un.</th><th>Qtd.</th><th>R$ Unitário</th><th>Total</th></tr></thead><tbody>
      ${(itens||[]).map((it,i)=>`<tr><td>${i+1}</td><td>${esc(it.desc||"—")}</td><td>${esc(it.unidade||"UN")}</td><td style="text-align:center">${it.qtd}</td><td style="text-align:right">${fmt(it.unit)}</td><td style="text-align:right;font-weight:700">${fmt((parseFloat(it.qtd)||0)*(parseFloat(it.unit)||0))}</td></tr>`).join("")}
    </tbody></table>
    <div class="total">VALOR GLOBAL: ${fmt(total)}</div>
    <div class="g2">
      <div class="box"><div class="lbl">Validade da Proposta</div><div class="val">${esc(validade||"60")} dias</div></div>
      <div class="box"><div class="lbl">Prazo de Entrega</div><div class="val">${esc(prazoEntrega||"A definir")}</div></div>
    </div>
    ${isProp&&(banco||pix)?`<h2>Dados Bancários para Pagamento</h2><div class="g2">
      ${banco?`<div class="box"><div class="lbl">Banco</div><div class="val">${esc(banco)}</div></div>`:""}
      ${agencia?`<div class="box"><div class="lbl">Agência</div><div class="val">${esc(agencia)}</div></div>`:""}
      ${conta?`<div class="box"><div class="lbl">Conta Corrente</div><div class="val">${esc(conta)}</div></div>`:""}
      ${pix?`<div class="box"><div class="lbl">Chave PIX</div><div class="val">${esc(pix)}</div></div>`:""}
    </div>`:""}
    ${obs?`<h2>Observações</h2><p style="font-size:12.5px;line-height:1.8;color:#475569">${esc(obs)}</p>`:""}
    <div class="sign"><div class="sign-line"></div><div class="sign-name">${esc(e?.repNome||e?.razaoSocial||"")}</div><div class="sign-sub">${esc(e?.repCargo||"")} — CPF: ${esc(e?.repCpf||"—")}</div><div class="sign-sub">${esc(e?.razaoSocial||"")} — CNPJ: ${esc(e?.cnpj||"")}</div></div>
    <div class="footer">
      <div class="footer-main"><span>LicitaFlow v7 © ${new Date().getFullYear()} · Documento gerado eletronicamente</span><span>Proposta válida por ${esc(validade||"60")} dias</span></div>
      <div class="footer-addr">${esc(e?.razaoSocial)} · CNPJ ${esc(e?.cnpj)} · ${esc(endFull)} ${e?.telefone?"· Tel: "+esc(e.telefone):""} ${e?.email?"· "+esc(e.email):""}</div>
    </div>
  </body></html>`;
  openPDF(html);
};

// ══════════════════════════════════════════════════════════════════════
// EMPTY STATES
// ══════════════════════════════════════════════════════════════════════
const EMP0 = {razaoSocial:"",nomeFantasia:"",cnpj:"",ie:"",im:"",porte:"ME",logradouro:"",numero:"",complemento:"",bairro:"",municipio:"",uf:"PE",cep:"",telefone:"",email:"",site:"",repNome:"",repCargo:"",repCpf:"",repEmail:"",repTelefone:"",timbre:"",banco:"",agencia:"",conta:"",tipoConta:"Corrente",pix:""};
const CERT0 = {titulo:"",tipoCertame:"Pregão Eletrônico",numero:"",processo:"",orgao:"",uf:"PE",objeto:"",valor:"",dataPublicacao:"",dataAbertura:"",dataEncerramento:"",editalUrl:"",fonte:"Manual",status:"Aberto",obs:"",monitorando:true,resultado:"Em andamento",valorProposta:"",checklist:[],impugnacoes:[],historico:[]};
const DOC0 = {nome:"",tipo:"Certidão",validade:"",arquivo:""};
const PROP0 = {titulo:"",certameId:"",itens:[{desc:"",unidade:"UN",qtd:1,unit:""}],validade:"60",prazoEntrega:"",obs:""};

// ── CSS Dark/Light/Font dinamico ──
function useTheme() {
  const [dark, setDark] = useState(()=> localStorage.getItem("lf_dark")==="true");
  const [fontSize, setFontSize] = useState(()=> localStorage.getItem("lf_fs")||"normal");
  useEffect(()=>{
    const root = document.documentElement;
    const sz = {small:"13px", normal:"14px", large:"16px"}[fontSize]||"14px";
    // Aplica em AMBAS as variáveis para garantir compatibilidade
    root.style.setProperty("--fs-base", sz);
    root.style.setProperty("--fs", sz);
    // Aplica diretamente no body também
    document.body.style.fontSize = sz;
    if(dark) root.setAttribute("data-theme","dark");
    else root.removeAttribute("data-theme");
    localStorage.setItem("lf_dark", String(dark));
    localStorage.setItem("lf_fs", fontSize);
  },[dark,fontSize]);
  return {dark, setDark, fontSize, setFontSize};
}

// ══════════════════════════════════════════════════════════════════════
// APP
// ══════════════════════════════════════════════════════════════════════
export default function App() {
  const {dark, setDark, fontSize, setFontSize} = useTheme();

  // ── AUTH ──
  const [authed, setAuthed] = useState(()=>sessionStorage.getItem("lf_auth")==="1");
  const [loginSenha, setLoginSenha] = useState("");
  const [loginErr, setLoginErr] = useState("");

  const handleLogin = () => {
    if(loginSenha === APP_SENHA){ sessionStorage.setItem("lf_auth","1"); setAuthed(true); setLoginErr(""); }
    else { setLoginErr("Senha incorreta. Tente novamente."); }
  };

  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── MULTI-EMPRESA ──
  const [empresasList, setEmpresasList] = useState([]); // lista de todas as empresas
  const [empresaAtualId, setEmpresaAtualId] = useState(null); // id da empresa ativa
  const [adminMode, setAdminMode] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminSenhaInput, setAdminSenhaInput] = useState("");

  // Data (escopo da empresa atual)
  const [empresa, setEmpresa] = useState(null);
  const [certames, setCertames] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [propostas, setPropostas] = useState([]);
  const [certidoes, setCertidoes] = useState({});

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
      // Carrega lista de empresas (modo multi)
      const lista = await DB.get("empresas_lista") || [];
      setEmpresasList(lista);
      // ID da empresa ativa
      const eid = await DB.get("empresa_ativa_id") || (lista[0]?.id || null);
      setEmpresaAtualId(eid);
      await carregarEmpresa(eid);
      setLoading(false);
    })();
  },[]);

  const carregarEmpresa = async (eid) => {
    if(!eid) {
      // fallback: tenta carregar empresa legada (v5 anterior)
      const e = await DB.get("empresa");
      if(e) {
        setEmpresa(e); setFormEmp(e);
        const [c,d,p,ct] = await Promise.all([DB.get("certames"),DB.get("documentos"),DB.get("propostas"),DB.get("certidoes")]);
        setCertames(c||[]); setDocumentos(d||[]); setPropostas(p||[]); setCertidoes(ct||{});
      }
      return;
    }
    const [e,c,d,p,ct] = await Promise.all([
      DB.get(`emp_${eid}`), DB.get(`certs_${eid}`),
      DB.get(`docs_${eid}`), DB.get(`props_${eid}`), DB.get(`certreg_${eid}`)
    ]);
    setEmpresa(e||null); setFormEmp(e||EMP0);
    setCertames(c||[]); setDocumentos(d||[]); setPropostas(p||[]); setCertidoes(ct||{});
  };

  const trocarEmpresa = async (eid) => {
    setLoading(true);
    setEmpresaAtualId(eid);
    await DB.set("empresa_ativa_id", eid);
    await carregarEmpresa(eid);
    setTab("dashboard"); setSelectedCert(null);
    setLoading(false);
    showToast(`✅ Empresa trocada!`);
  };

  // ── ADMIN LOGIN ──
  const entrarAdmin = () => {
    if(adminSenhaInput === ADMIN_SENHA) {
      setAdminMode(true);
      setShowAdminLogin(false);
      setAdminSenhaInput("");
      showToast("🔐 Modo Admin ativado!");
    } else {
      showToast("Senha incorreta","error");
    }
  };

  // ── SAVE EMPRESA (com suporte multi) ──
  const saveEmpresa = async () => {
    if(!formEmp.razaoSocial||!formEmp.cnpj){showToast("Razão Social e CNPJ obrigatórios","error");return;}
    setSaving(true);
    let eid = empresaAtualId;
    // Se não tem id ainda, cria um novo
    if(!eid) {
      eid = uid();
      setEmpresaAtualId(eid);
      await DB.set("empresa_ativa_id", eid);
    }
    const empData = {...formEmp, id: eid};
    await DB.set(`emp_${eid}`, empData);
    // Atualiza lista de empresas
    const novaLista = empresasList.filter(e=>e.id!==eid);
    novaLista.push({id:eid, razaoSocial:empData.razaoSocial, cnpj:empData.cnpj, nomeFantasia:empData.nomeFantasia});
    setEmpresasList(novaLista);
    await DB.set("empresas_lista", novaLista);
    setEmpresa(empData);
    setSaving(false);
    showToast("✅ Empresa salva!");
    setTab("dashboard");
  };

  // ── NOVA EMPRESA (admin) ──
  const criarNovaEmpresa = async () => {
    const eid = uid();
    setEmpresaAtualId(eid);
    await DB.set("empresa_ativa_id", eid);
    setEmpresa(null); setFormEmp(EMP0);
    setCertames([]); setDocumentos([]); setPropostas([]); setCertidoes({});
    setTab("empresa");
    showToast("📋 Cadastre os dados da nova empresa");
  };

  const removerEmpresa = async (eid) => {
    if(!window.confirm("Remover esta empresa e todos os seus dados?")) return;
    await Promise.all([
      DB.del(`emp_${eid}`), DB.del(`certs_${eid}`),
      DB.del(`docs_${eid}`), DB.del(`props_${eid}`), DB.del(`certreg_${eid}`)
    ]);
    const novaLista = empresasList.filter(e=>e.id!==eid);
    setEmpresasList(novaLista);
    await DB.set("empresas_lista", novaLista);
    if(empresaAtualId===eid) {
      const prox = novaLista[0]?.id || null;
      await trocarEmpresa(prox);
    }
    showToast("Empresa removida");
  };

  // ── CERTAMES ──
  const eid = empresaAtualId; // shorthand para chave de storage
  const saveCert = async (cert=formCert) => {
    const isNew=!cert.id;
    const item=isNew?{...cert,id:uid(),criadoEm:new Date().toISOString(),checklist:HABILITACAO_PADRAO.map(h=>({...h,status:"pendente"})),impugnacoes:[],historico:[{id:uid(),data:new Date().toISOString(),acao:"Certame cadastrado"}]}:cert;
    const lista=isNew?[...certames,item]:certames.map(c=>c.id===cert.id?item:c);
    setCertames(lista); await DB.set(eid?`certs_${eid}`:"certames",lista);
    setFormCert(CERT0); setModalType(null); showToast("✅ Certame salvo!"); return item;
  };
  const delCert = async id => { const l=certames.filter(c=>c.id!==id); setCertames(l); await DB.set(eid?`certs_${eid}`:"certames",l); if(selectedCert?.id===id){setSelectedCert(null);setTab("certames");} showToast("Removido"); };
  const updateCert = async (id,fields) => {
    const l=certames.map(c=>c.id===id?{...c,...fields}:c); setCertames(l); await DB.set(eid?`certs_${eid}`:"certames",l);
    if(selectedCert?.id===id) setSelectedCert(p=>({...p,...fields}));
  };

  // ── DOCUMENTOS ──
  const saveDoc = async () => {
    if(!formDoc.nome){showToast("Nome obrigatório","error");return;}
    const d2=diasAte(formDoc.validade);
    const status=!formDoc.validade?"Válido":d2<=0?"Vencido":d2<=15?"Vencendo":"Válido";
    const item=formDoc.id?{...formDoc,status}:{...formDoc,id:uid(),status,criadoEm:new Date().toISOString()};
    const l=formDoc.id?documentos.map(x=>x.id===formDoc.id?item:x):[...documentos,item];
    setDocumentos(l); await DB.set(eid?`docs_${eid}`:"documentos",l); setFormDoc(DOC0); setModalType(null); showToast("✅ Documento salvo!");
  };
  const delDoc = async id => { const l=documentos.filter(d=>d.id!==id); setDocumentos(l); await DB.set(eid?`docs_${eid}`:"documentos",l); showToast("Removido"); };

  // ── CERTIDÕES ──
  const saveCertidao = async () => {
    const updated={...certidoes,[formCertidao.id]:{dataEmissao:formCertidao.dataEmissao,dataValidade:formCertidao.dataValidade,obs:formCertidao.obs,atualizadoEm:new Date().toISOString()}};
    setCertidoes(updated); await DB.set(eid?`certreg_${eid}`:"certidoes",updated); setModalType(null); showToast("✅ Certidão atualizada!");
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
    setPropostas(l); await DB.set(eid?`props_${eid}`:"propostas",l); showToast("✅ Proposta salva!");
  };
  const delProp = async id => { const l=propostas.filter(p=>p.id!==id); setPropostas(l); await DB.set(eid?`props_${eid}`:"propostas",l); showToast("Removida"); };

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

  // ── PNCP — publicacao 2026, mais recente primeiro ──
  const fetchPNCP = useCallback(async(termo="",pag=1)=>{
    setPncpLoading(true); setPncpError(null);
    try{
      const hoje=new Date();
      // Janela: publicados nos últimos 7 dias até abertura em 6 meses
      const ini=new Date(hoje); ini.setDate(ini.getDate()-7);
      const fim=new Date(hoje); fim.setDate(fim.getDate()+180);
      const di=`${ini.getFullYear()}${pad2(ini.getMonth()+1)}${pad2(ini.getDate())}`;
      const df=`${fim.getFullYear()}${pad2(fim.getMonth()+1)}${pad2(fim.getDate())}`;

      const mapItem=c=>({
        id:c.numeroControlePNCP||uid(),
        ncp:c.numeroControlePNCP,
        linkEdital:c.numeroControlePNCP?`https://pncp.gov.br/app/editais/${(c.numeroControlePNCP||"").replace(/\//g,"-")}`:null,
        modalidade:MODALIDADES_PNCP[c.modalidadeId||c.codigoModalidadeContratacao]||"Licitação",
        objeto:c.objetoCompra||c.objetoContratacao||c.objeto||"Sem descrição",
        orgao:c.unidadeOrgao?.nomeUnidade||c.orgaoEntidade?.razaoSocial||"Órgão Público",
        uf:c.unidadeOrgao?.ufSigla||c.ufSigla||"BR",
        municipio:c.unidadeOrgao?.municipioNome||"",
        valor:c.valorTotalEstimado||c.valorTotalHomologado||c.valor||0,
        dataAbertura:c.dataAberturaProposta||c.dataAberturaPropostaInicio||c.dataAbertura,
        dataEncerramento:c.dataEncerramentoProposta||null,
        dataPublicacao:c.dataPublicacaoPncp||c.dataInclusao||c.dataPublicacao,
        situacao:c.situacaoCompraId===1?"Recebendo Propostas":c.situacaoCompraId===2?"Em Julgamento":c.situacaoCompraId===3?"Encerrado":"Em andamento",
        fonte:"PNCP",
      });

      let items=[]; let ok=false;

      // Endpoint 1: publicacao (principal — retorna por data de publicação)
      try{
        const r=await fetch(`${PNCP_BASE}/contratacoes/publicacao?dataInicial=${di}&dataFinal=${df}&pagina=${pag}&tamanhoPagina=12`);
        if(r.ok){ const j=await r.json(); const arr=Array.isArray(j)?j:(j.data||[]); if(arr.length>0){ items=arr.map(mapItem); ok=true; }}
      }catch(e){console.warn("publicacao falhou:",e);}

      // Endpoint 2: proposta (fallback)
      if(!ok){
        try{
          const r2=await fetch(`${PNCP_BASE}/contratacoes/proposta?dataInicial=${di}&dataFinal=${df}&pagina=${pag}&tamanhoPagina=12`);
          if(r2.ok){ const j2=await r2.json(); const arr2=Array.isArray(j2)?j2:(j2.data||[]); if(arr2.length>0){ items=arr2.map(mapItem); ok=true; }}
        }catch(e){console.warn("proposta falhou:",e);}
      }

      if(!ok) throw new Error("Sem dados PNCP");
      items.sort((a,b)=>new Date(b.dataPublicacao||b.dataAbertura||0)-new Date(a.dataPublicacao||a.dataAbertura||0));
      if(termo) items=items.filter(i=>(i.objeto+i.orgao+i.municipio).toLowerCase().includes(termo.toLowerCase()));
      setPncpItems(items);
    }catch(err){setPncpError("Não foi possível carregar do PNCP. Tente novamente."); setPncpItems([]);}
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

  // ══ LOGIN ══
  if(!authed) return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f172a 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}input{font-family:inherit}"}</style>
      <div style={{width:"100%",maxWidth:440}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:96,height:96,borderRadius:24,background:"linear-gradient(135deg,#1d4ed8,#7c3aed)",boxShadow:"0 20px 60px #1d4ed860",marginBottom:20,animation:"float 3s ease-in-out infinite"}}>
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none"><rect x="24" y="4" width="4" height="44" rx="2" fill="white" opacity="0.9"/><rect x="6" y="10" width="40" height="4" rx="2" fill="white" opacity="0.9"/><path d="M8 14 L20 38 H8 Z" fill="white" opacity="0.7"/><path d="M44 14 L32 38 H44 Z" fill="white" opacity="0.7"/><circle cx="26" cy="8" r="4" fill="#60a5fa"/></svg>
          </div>
          <h1 style={{fontSize:34,fontWeight:900,color:"#f1f5f9",letterSpacing:"-1px",marginBottom:6}}>LicitaFlow</h1>
          <p style={{fontSize:14,color:"#64748b",fontWeight:500}}>Versão {APP_VERSION} · Gestão Inteligente de Licitações Públicas</p>
        </div>
        <div style={{background:"rgba(255,255,255,0.06)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:20,padding:32}}>
          <div style={{marginBottom:22}}>
            <h2 style={{fontSize:20,fontWeight:800,color:"#f1f5f9",marginBottom:4}}>Bem-vindo de volta</h2>
            <p style={{fontSize:13,color:"#64748b"}}>Digite sua senha para acessar a plataforma</p>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>Senha de Acesso</label>
            <input type="password" value={loginSenha} onChange={e=>setLoginSenha(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="••••••••••••" style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1.5px solid rgba(255,255,255,0.15)",borderRadius:12,padding:"13px 16px",fontSize:15,color:"#f1f5f9",outline:"none",letterSpacing:2}} autoFocus/>
            {loginErr&&<div style={{marginTop:8,fontSize:12,color:"#f87171",fontWeight:600}}>⚠️ {loginErr}</div>}
          </div>
          <button onClick={handleLogin} style={{width:"100%",background:"linear-gradient(135deg,#1d4ed8,#7c3aed)",border:"none",borderRadius:12,padding:"14px",fontSize:15,fontWeight:700,color:"#fff",cursor:"pointer",boxShadow:"0 8px 24px #1d4ed840"}}>Entrar →</button>
          <div style={{marginTop:20,padding:"12px 14px",background:"rgba(255,255,255,0.04)",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)"}}>
            <div style={{fontSize:11,color:"#475569",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:".4px"}}>Acesso padrão</div>
            <div style={{fontSize:12,color:"#94a3b8"}}>Senha: <span style={{color:"#60a5fa",fontWeight:700,fontFamily:"monospace"}}>{APP_SENHA}</span></div>
            <div style={{fontSize:11,color:"#475569",marginTop:3}}>Altere <code style={{color:"#60a5fa"}}>APP_SENHA</code> no App.jsx antes do deploy.</div>
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:18,fontSize:11,color:"#334155"}}>LicitaFlow {APP_VERSION} · Dados salvos localmente no navegador</div>
      </div>
    </div>
  );

  // ══ ONBOARDING ══
  if(!loading&&!empresa) return(
    <div className="app-root" style={{background:"var(--bg-app)",color:"var(--txt)",fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <style>{CSS}</style>
      <div id="app-main">
      <div style={RS.onboard}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:52,color:"#1d4ed8"}}>⚖</div>
          <h1 style={{fontSize:26,fontWeight:900,color:"#0f172a",letterSpacing:"-1px"}}>LicitaFlow v7</h1>
          <p style={{fontSize:14,color:"#64748b",marginTop:4}}>Plataforma de Gestão Inteligente de Licitações</p>
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
      <div id="app-main">
      {toast && <div style={{...RS.toast,background:toast.type==="error"?"#dc2626":"#16a34a"}}>{toast.msg}</div>}

      {/* ── SIDEBAR ── */}
      <aside id="sidebar" style={{...RS.sidebar,transform:sidebarOpen?"translateX(0)":"translateX(-256px)"}}>
        {/* Logo */}
        <div style={RS.sbLogo}>
          <div style={{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#2563eb,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 4px 12px rgba(37,99,235,.4)"}}>
            <svg width="20" height="20" viewBox="0 0 52 52" fill="none">
              <rect x="24" y="3" width="4" height="46" rx="2" fill="white" opacity=".9"/>
              <rect x="5" y="10" width="42" height="4" rx="2" fill="white" opacity=".9"/>
              <path d="M7 14 L19 40 H7 Z" fill="white" opacity=".75"/>
              <path d="M45 14 L33 40 H45 Z" fill="white" opacity=".75"/>
              <circle cx="26" cy="7" r="4" fill="#60a5fa"/>
            </svg>
          </div>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:"#f9fafb",letterSpacing:"-.3px"}}>LicitaFlow</div>
            <div style={{fontSize:10,color:"#6b7280",fontWeight:500}}>{APP_VERSION} · Gestão de Licitações</div>
          </div>
        </div>

        {/* Seletor empresa */}
        {empresasList.length>0&&(
          <div style={{padding:"12px 14px",borderBottom:"1px solid #1f2937"}}>
            <div style={{fontSize:9,color:"#4b5563",fontWeight:700,textTransform:"uppercase",letterSpacing:".8px",marginBottom:6}}>Empresa Ativa</div>
            <select style={{width:"100%",background:"#1f2937",color:"#f9fafb",border:"1px solid #374151",borderRadius:8,padding:"8px 10px",fontSize:12,fontWeight:600,cursor:"pointer"}}
              value={empresaAtualId||""} onChange={e=>trocarEmpresa(e.target.value)}>
              {empresasList.map(e=><option key={e.id} value={e.id}>{(e.nomeFantasia||e.razaoSocial||"").slice(0,24)}</option>)}
            </select>
            {adminMode&&<button style={{width:"100%",background:"#1e3a5f",border:"none",borderRadius:8,padding:"7px",fontSize:11,color:"#60a5fa",fontWeight:600,cursor:"pointer",marginTop:6}} onClick={()=>{setSidebarOpen(false);criarNovaEmpresa();}}>+ Nova Empresa</button>}
          </div>
        )}

        {/* Nav */}
        <nav style={{flex:1,padding:"10px 10px",overflowY:"auto",scrollbarWidth:"none"}}>
          {/* Principal */}
          <div style={RS.sbSection}>Principal</div>
          {[
            {id:"dashboard",lb:"Dashboard",icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>},
            {id:"fontes",lb:"Buscar Editais",bd:null,icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>},
            {id:"certames",lb:"Meus Certames",bd:stats.abertos,icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>},
          ].map(n=>(
            <button key={n.id} onClick={()=>{setTab(n.id);setSidebarOpen(false);if(n.id!=="certames")setSelectedCert(null);if(n.id!=="fontes")setPncpSelected(null);}}
              style={{...RS.sbItem,...(tab===n.id?RS.sbItemOn:{})}}>
              <span style={{color:tab===n.id?"#60a5fa":"#6b7280",flexShrink:0}}>{n.icon}</span>
              <span style={{flex:1}}>{n.lb}</span>
              {n.bd>0&&<span style={RS.sbBadge}>{n.bd}</span>}
            </button>
          ))}

          {/* Gestão */}
          <div style={RS.sbSection}>Gestão</div>
          {[
            {id:"habilitacao",lb:"Habilitação",icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>},
            {id:"historico",lb:"Histórico",icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>},
            {id:"calendario",lb:"Calendário",icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>},
            {id:"impugnacoes",lb:"Impugnações",bd:stats.impPendentes,icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>},
          ].map(n=>(
            <button key={n.id} onClick={()=>{setTab(n.id);setSidebarOpen(false);if(n.id!=="certames")setSelectedCert(null);}}
              style={{...RS.sbItem,...(tab===n.id?RS.sbItemOn:{})}}>
              <span style={{color:tab===n.id?"#60a5fa":"#6b7280",flexShrink:0}}>{n.icon}</span>
              <span style={{flex:1}}>{n.lb}</span>
              {n.bd>0&&<span style={RS.sbBadge}>{n.bd}</span>}
            </button>
          ))}

          {/* Documentos */}
          <div style={RS.sbSection}>Documentos</div>
          {[
            {id:"certidoes",lb:"Certidões",bd:stats.certidoesAlerta,icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>},
            {id:"documentos",lb:"Documentos",icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>},
            {id:"propostas",lb:"Propostas",icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>},
            {id:"declaracoes",lb:"Declarações",icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>},
          ].map(n=>(
            <button key={n.id} onClick={()=>{setTab(n.id);setSidebarOpen(false);}}
              style={{...RS.sbItem,...(tab===n.id?RS.sbItemOn:{})}}>
              <span style={{color:tab===n.id?"#60a5fa":"#6b7280",flexShrink:0}}>{n.icon}</span>
              <span style={{flex:1}}>{n.lb}</span>
              {n.bd>0&&<span style={RS.sbBadge}>{n.bd}</span>}
            </button>
          ))}

          {/* Sistema */}
          <div style={RS.sbSection}>Sistema</div>
          {[
            {id:"empresa",lb:"Cadastrar Empresa",icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>},
            {id:"configuracoes",lb:"Configurações",icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>},
          ].map(n=>(
            <button key={n.id} onClick={()=>{setTab(n.id);setSidebarOpen(false);}}
              style={{...RS.sbItem,...(tab===n.id?RS.sbItemOn:{})}}>
              <span style={{color:tab===n.id?"#60a5fa":"#6b7280",flexShrink:0}}>{n.icon}</span>
              <span style={{flex:1}}>{n.lb}</span>
            </button>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div style={{padding:"12px 16px",borderTop:"1px solid #1f2937",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:10,color:"#6b7280",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{empresa?.cnpj||"—"}</div>
          </div>
          {adminMode
            ?<span style={{background:"#065f46",color:"#34d399",borderRadius:6,padding:"2px 8px",fontSize:9,fontWeight:700}}>ADMIN</span>
            :<button style={{background:"none",border:"1px solid #374151",color:"#6b7280",borderRadius:6,padding:"3px 8px",fontSize:9,fontWeight:700,cursor:"pointer"}} onClick={()=>setShowAdminLogin(true)}>🔐 Admin</button>
          }
        </div>
      </aside>
      {sidebarOpen&&<div id="sidebar-overlay" style={RS.overlay} onClick={()=>setSidebarOpen(false)}/>}lay} onClick={()=>setSidebarOpen(false)}/>}

      {/* ── HEADER ── */}
      <header style={RS.hdr}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button id="menu-btn" style={RS.menuBtn} onClick={()=>setSidebarOpen(v=>!v)} aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#2563eb,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="16" height="16" viewBox="0 0 52 52" fill="none"><rect x="24" y="3" width="4" height="46" rx="2" fill="white"/><rect x="5" y="10" width="42" height="4" rx="2" fill="white"/><path d="M7 14 L19 40 H7 Z" fill="white" opacity=".8"/><path d="M45 14 L33 40 H45 Z" fill="white" opacity=".8"/></svg>
            </div>
            <div>
              <span style={{fontSize:15,fontWeight:800,color:"var(--accent)",letterSpacing:"-.3px"}}>LicitaFlow</span>
              {empresa&&<span style={{fontSize:12,color:"var(--txt-sub)",fontWeight:400,marginLeft:6}}>· {(empresa.nomeFantasia||empresa.razaoSocial||"").slice(0,28)}</span>}
            </div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          {empresasList.length>1&&(
            <select style={{background:"var(--bg-input)",color:"var(--txt)",border:"1.5px solid var(--border)",borderRadius:8,padding:"6px 10px",fontSize:11,fontWeight:600,cursor:"pointer",maxWidth:150}}
              value={empresaAtualId||""} onChange={e=>trocarEmpresa(e.target.value)}>
              {empresasList.map(e=><option key={e.id} value={e.id}>{(e.nomeFantasia||e.razaoSocial||"").slice(0,18)}</option>)}
            </select>
          )}
          <button style={{...RS.notifBtn,background:notifs.length>0?"#fef2f2":"transparent",color:notifs.length>0?"#dc2626":"var(--txt-sub)"}} onClick={()=>setShowNotifs(v=>!v)} title="Notificações">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            {notifs.length>0&&<span style={RS.nDot}>{notifs.length}</span>}
          </button>
          <div style={RS.avatar} onClick={()=>setTab("empresa")} title={empresa?.razaoSocial||"Empresa"}>
            {(empresa?.razaoSocial||"LF").slice(0,2).toUpperCase()}
          </div>
          <button title="Sair do sistema" onClick={()=>{sessionStorage.removeItem("lf_auth");window.location.reload();}}
            style={{background:"none",border:"1.5px solid var(--border)",borderRadius:8,padding:"7px 9px",cursor:"pointer",display:"flex",alignItems:"center",color:"var(--txt-sub)",transition:"all .15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#dc2626";e.currentTarget.style.color="#dc2626";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--txt-sub)";}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      {/* ── MODAL LOGIN ADMIN ── */}
      {showAdminLogin&&(
        <div style={RS.mOverlay} onClick={()=>setShowAdminLogin(false)}>
          <div style={{...RS.modal,maxWidth:360}} onClick={e=>e.stopPropagation()}>
            <div style={RS.mHdr}><span>🔐 Acesso Administrativo</span><button style={{background:"none",border:"none",fontSize:22,cursor:"pointer"}} onClick={()=>setShowAdminLogin(false)}>×</button></div>
            <div style={RS.mBody}>
              <p style={{fontSize:13,color:"#64748b",marginBottom:14}}>Digite a senha de administrador para gerenciar múltiplas empresas.</p>
              <FG l="Senha Admin"><FI type="password" value={adminSenhaInput} onChange={e=>setAdminSenhaInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&entrarAdmin()} placeholder="••••••••"/></FG>
              <button style={{...RS.btnPrimary,width:"100%",marginTop:12}} onClick={entrarAdmin}>🔐 Entrar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── NOTIF PANEL ── */}
      {showNotifs&&(
        <div style={RS.notifPanel} onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",borderBottom:"1px solid #f1f5f9"}}>
            <strong style={{fontSize:13}}>Notificações ({notifs.length})</strong>
            <button style={{background:"none",border:"none",color:"#94a3b8",fontSize:11,cursor:"pointer"}} onClick={()=>{setNotifDismissed(notifs.map(n=>n.id));setShowNotifs(false);}}>Limpar tudo</button>
          </div>
          {notifs.length===0?<div style={{padding:"18px",fontSize:13,color:"#94a3b8",textAlign:"center"}}>Tudo em dia ✓</div>:
            notifs.map(n=>(
              <div key={n.id} style={{padding:"10px 14px",borderBottom:"1px solid #f8fafc",position:"relative",borderLeft:`3px solid ${NCOL[n.tipo]}`}}>
                <div style={{fontSize:12,fontWeight:700,color:"#1e293b",paddingRight:20}}>{n.msg}</div>
                <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{n.sub}</div>
                <button style={{position:"absolute",top:8,right:10,background:"none",border:"none",color:"#94a3b8",fontSize:16,cursor:"pointer"}} onClick={()=>setNotifDismissed(p=>[...p,n.id])}>×</button>
              </div>
            ))}
        </div>
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
      <main id="main-content" style={RS.main} onClick={()=>showNotifs&&setShowNotifs(false)}>

        {/* DASHBOARD */}
        {tab==="dashboard"&&(
          <div style={RS.pg} className="fade-in">
            {/* Header da página */}
            <div style={{marginBottom:28,display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
              <div>
                <h1 style={{fontSize:24,fontWeight:800,color:"var(--txt)",letterSpacing:"-.5px",marginBottom:4}}>
                  Olá! 👋
                </h1>
                <p style={{fontSize:14,color:"var(--txt-sub)",fontWeight:400}}>
                  {empresa?.razaoSocial||"Bem-vindo ao LicitaFlow"} · {new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long"})}
                </p>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button style={{...RS.btnSec,display:"flex",alignItems:"center",gap:6}} onClick={()=>setTab("fontes")}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  Buscar Editais
                </button>
                <button style={{...RS.btnPrimary,display:"flex",alignItems:"center",gap:6}} onClick={()=>{setFormCert({...CERT0});setModalType("addCertame");}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Novo Certame
                </button>
              </div>
            </div>

            {/* KPIs em linha */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:14,marginBottom:28}}>
              {[
                {l:"Total Certames",v:stats.certames,ic:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,c:"#2563eb",bg:"#eff6ff",t:"certames"},
                {l:"Em Aberto",v:stats.abertos,ic:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,c:"#059669",bg:"#ecfdf5",t:"certames"},
                {l:"Vencedores",v:stats.vencedores,ic:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,c:"#d97706",bg:"#fffbeb",t:"historico"},
                {l:"Propostas",v:propostas.length,ic:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,c:"#0369a1",bg:"#f0f9ff",t:"propostas"},
                {l:"Monitorando",v:stats.monitorando,ic:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,c:"#7c3aed",bg:"#f5f3ff",t:"certames"},
                {l:"Certidões ⚠",v:stats.certidoesAlerta,ic:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,c:"#dc2626",bg:"#fef2f2",t:"certidoes"},
                {l:"Alertas",v:stats.notifs,ic:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,c:"#dc2626",bg:"#fef2f2",t:null},
                {l:"Impugnações",v:stats.impPendentes,ic:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>,c:"#d97706",bg:"#fffbeb",t:"impugnacoes"},
              ].map((s,i)=>(
                <div key={i} className="stat-card hov" onClick={()=>s.t&&setTab(s.t)}
                  style={{cursor:s.t?"pointer":"default",background:s.bg,borderColor:s.c+"25",borderWidth:"1.5px"}}>
                  <div style={{width:36,height:36,borderRadius:10,background:s.c+"18",display:"flex",alignItems:"center",justifyContent:"center",color:s.c,marginBottom:4}}>{s.ic}</div>
                  <div style={{fontSize:26,fontWeight:900,color:s.c,lineHeight:1.1,letterSpacing:"-.5px"}}>{s.v}</div>
                  <div style={{fontSize:11,color:"#64748b",fontWeight:600,marginTop:2}}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Layout 2 colunas */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

              {/* Coluna esquerda */}
              <div style={{display:"flex",flexDirection:"column",gap:16}}>

                {/* Próximas Aberturas */}
                <div style={{...RS.section,padding:"20px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                    <div style={{fontWeight:700,fontSize:14,color:"var(--txt)",display:"flex",alignItems:"center",gap:8}}>
                      <span style={{width:28,height:28,borderRadius:8,background:"#eff6ff",display:"inline-flex",alignItems:"center",justifyContent:"center"}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      </span>
                      Próximas Aberturas
                    </div>
                    <button style={RS.lnkBtn} onClick={()=>setTab("certames")}>Ver todas →</button>
                  </div>
                  {certames.filter(c=>c.monitorando&&c.status==="Aberto").length===0?(
                    <div style={{textAlign:"center",padding:"24px 0",color:"var(--txt-sub)"}}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{margin:"0 auto 8px",display:"block",opacity:.4}}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      <div style={{fontSize:13,fontWeight:600}}>Nenhum certame monitorado</div>
                      <button style={{...RS.lnkBtn,marginTop:6,fontSize:13}} onClick={()=>setTab("fontes")}>Buscar no PNCP →</button>
                    </div>
                  ):certames.filter(c=>c.monitorando&&c.status==="Aberto").sort((a,b)=>new Date(a.dataAbertura)-new Date(b.dataAbertura)).slice(0,5).map(c=>{
                    const d=diasAte(c.dataAbertura); const prog=habProgress(c);
                    const color=d<=0?"#dc2626":d<=3?"#dc2626":d<=7?"#d97706":"#2563eb";
                    const bgColor=d<=0?"#fef2f2":d<=3?"#fef2f2":d<=7?"#fffbeb":"#eff6ff";
                    return(
                      <div key={c.id} className="card-hover" style={{display:"flex",alignItems:"center",gap:12,padding:"12px",borderRadius:12,border:"1px solid var(--border-light)",marginBottom:8,cursor:"pointer",background:"var(--bg-input)"}} onClick={()=>{setSelectedCert(c);setTab("certames");}}>
                        <div style={{width:42,height:42,borderRadius:10,background:bgColor,border:`1.5px solid ${color}30`,display:"flex",alignItems:"center",justifyContent:"center",color:color,fontSize:11,fontWeight:800,flexShrink:0,flexDirection:"column",gap:0}}>
                          <span style={{fontSize:13,fontWeight:900,lineHeight:1}}>{d<=0?"ENC":d+"d"}</span>
                          {d>0&&<span style={{fontSize:8,opacity:.7}}>dias</span>}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:700,color:"var(--txt)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.titulo||c.objeto||""}</div>
                          <div style={{fontSize:11,color:"var(--txt-sub)",marginTop:2}}>{c.tipoCertame} · {c.orgao}</div>
                          <div style={{marginTop:6,background:"var(--border)",borderRadius:4,height:4,overflow:"hidden"}}>
                            <div style={{background:prog===100?"#059669":color,height:4,width:prog+"%",borderRadius:4,transition:"width .4s"}}/>
                          </div>
                        </div>
                        <div style={{fontSize:11,fontWeight:700,color:prog===100?"#059669":"var(--txt-sub)",flexShrink:0}}>{prog}%</div>
                      </div>
                    );
                  })}
                </div>

                {/* Alertas */}
                {notifs.length>0&&(
                  <div style={{...RS.section,padding:"20px",borderLeft:"3px solid #dc2626"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                      <div style={{fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8,color:"#dc2626"}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                        {notifs.length} Alerta{notifs.length>1?"s":""} Ativo{notifs.length>1?"s":""}
                      </div>
                      <button style={RS.lnkBtn} onClick={()=>{setNotifDismissed(notifs.map(n=>n.id));}}>Limpar</button>
                    </div>
                    {notifs.slice(0,4).map(n=>(
                      <div key={n.id} style={{padding:"10px 12px",borderLeft:`3px solid ${NCOL[n.tipo]}`,background:n.tipo==="urgente"?"#fef2f2":"#fffbeb",borderRadius:"0 8px 8px 0",marginBottom:6}}>
                        <div style={{fontSize:12,fontWeight:700,color:"var(--txt)"}}>{n.msg}</div>
                        <div style={{fontSize:11,color:"var(--txt-sub)",marginTop:1}}>{n.sub}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Coluna direita */}
              <div style={{display:"flex",flexDirection:"column",gap:16}}>

                {/* Resumo Financeiro */}
                <div style={{...RS.section,padding:"20px",background:"linear-gradient(135deg,#1e3a5f 0%,#1e1b4b 100%)",border:"none"}}>
                  <div style={{fontSize:12,fontWeight:600,color:"#93c5fd",marginBottom:14,textTransform:"uppercase",letterSpacing:".5px"}}>Resumo de Participações</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                    {[
                      {l:"Total participado",v:certames.length,color:"#fff"},
                      {l:"Taxa de sucesso",v:certames.length?Math.round((stats.vencedores/certames.length)*100)+"%":"—",color:"#34d399"},
                      {l:"Valor total licitado",v:fmt(certames.reduce((a,c)=>a+(parseFloat(c.valor)||0),0)),color:"#93c5fd"},
                      {l:"Valor ganho",v:fmt(certames.filter(c=>c.resultado==="Vencedor").reduce((a,c)=>a+(parseFloat(c.valorProposta||c.valor)||0),0)),color:"#fbbf24"},
                    ].map((x,i)=>(
                      <div key={i} style={{background:"rgba(255,255,255,.06)",borderRadius:10,padding:"12px 14px",border:"1px solid rgba(255,255,255,.08)"}}>
                        <div style={{fontSize:10,color:"#9ca3af",fontWeight:600,marginBottom:4}}>{x.l}</div>
                        <div style={{fontSize:16,fontWeight:800,color:x.color}}>{x.v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certidões com Alerta */}
                <div style={{...RS.section,padding:"20px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                    <div style={{fontWeight:700,fontSize:14,color:"var(--txt)",display:"flex",alignItems:"center",gap:8}}>
                      <span style={{width:28,height:28,borderRadius:8,background:"#f5f3ff",display:"inline-flex",alignItems:"center",justifyContent:"center"}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
                      </span>
                      Certidões
                    </div>
                    <button style={RS.lnkBtn} onClick={()=>setTab("certidoes")}>Gerenciar →</button>
                  </div>
                  {CERTIDOES_CONFIG.slice(0,6).map(cfg=>{
                    const s=certidaoStatus(cfg.id); const reg=certidoes[cfg.id]; const d=reg?.dataValidade?diasAte(reg.dataValidade):null;
                    const stc={valida:"#059669","vencendo":"#d97706","vencida":"#dc2626","sem-registro":"#94a3b8"};
                    const stbg={valida:"#ecfdf5","vencendo":"#fffbeb","vencida":"#fef2f2","sem-registro":"#f8fafc"};
                    return(
                      <div key={cfg.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid var(--border-light)"}}>
                        <span style={{fontSize:18,flexShrink:0}}>{cfg.icon}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12,fontWeight:600,color:"var(--txt)"}}>{cfg.sigla}</div>
                          {reg?.dataValidade&&<div style={{fontSize:10,color:"var(--txt-sub)"}}>Vence: {fmtDate(reg.dataValidade)}</div>}
                        </div>
                        <span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:8,background:stbg[s],color:stc[s],flexShrink:0}}>{s==="sem-registro"?"—":s==="valida"?"✓ Ok":d<=0?"Vencida":`${d}d`}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Ações Rápidas */}
                <div style={{...RS.section,padding:"20px"}}>
                  <div style={{fontWeight:700,fontSize:14,color:"var(--txt)",marginBottom:14}}>Ações Rápidas</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {[
                      {l:"Nova Proposta",ic:"📝",t:"propostas",color:"#059669"},
                      {l:"Declarações",ic:"📜",t:"declaracoes",color:"#7c3aed"},
                      {l:"Habilitação",ic:"✅",t:"habilitacao",color:"#2563eb"},
                      {l:"Calendário",ic:"📅",t:"calendario",color:"#d97706"},
                    ].map((a,i)=>(
                      <button key={i} onClick={()=>setTab(a.t)} style={{display:"flex",alignItems:"center",gap:8,padding:"11px 14px",borderRadius:10,border:"1.5px solid var(--border)",background:"var(--bg-input)",cursor:"pointer",fontSize:12,fontWeight:600,color:"var(--txt)",transition:"all .15s"}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor=a.color;e.currentTarget.style.color=a.color;e.currentTarget.style.background=a.color+"10";}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--txt)";e.currentTarget.style.background="var(--bg-input)";}}>
                        <span style={{fontSize:16}}>{a.ic}</span>{a.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
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
            <PgHdr title="🔍 Buscar Editais" sub="PNCP · ComprasGov · Portais Oficiais">
              <button style={RS.refreshBtn} onClick={()=>fetchPNCP(pncpSearch,1)} disabled={pncpLoading}>{pncpLoading?"…":"↻"}</button>
            </PgHdr>
            {/* Tabs de fonte */}
            <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
              {[
                {id:"pncp",lb:"🏛 PNCP",desc:"Portal Nacional"},
                {id:"comprasgov",lb:"🛒 ComprasGov",desc:"Portal Federal"},
                {id:"links",lb:"🔗 Portais Externos",desc:"Links diretos"},
              ].map(s=>(
                <button key={s.id} onClick={()=>setFonteTab&&setFonteTab(s.id)}
                  style={{padding:"8px 16px",borderRadius:10,border:"1.5px solid var(--border)",background:"var(--bg-card)",color:"var(--txt-sub)",fontWeight:600,fontSize:12,cursor:"pointer",flex:1,textAlign:"center"}}>
                  <div style={{fontSize:13}}>{s.lb}</div>
                  <div style={{fontSize:10,opacity:.7}}>{s.desc}</div>
                </button>
              ))}
            </div>
            <div style={RS.card}>
              <div style={{display:"flex",gap:8}}>
                <input style={{...RS.fi,flex:1}} placeholder="Buscar por objeto, órgão ou município..." value={pncpSearch} onChange={e=>setPncpSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&fetchPNCP(pncpSearch,1)}/>
                <button style={RS.btnPrimary} onClick={()=>fetchPNCP(pncpSearch,1)}>Buscar</button>
              </div>
              {/* Links diretos portais */}
              <div style={{marginTop:12,display:"flex",gap:8,flexWrap:"wrap"}}>
                {[
                  {lb:"🏛 PNCP Editais",url:"https://pncp.gov.br/app/editais?status=recebendo_proposta"},
                  {lb:"🛒 ComprasGov",url:"https://compras.dados.gov.br/licitacoes/doc/licitacao"},
                  {lb:"📋 ComprasNet",url:"https://www.comprasnet.gov.br/acesso.asp?url=/ConsultaLicitacoes/ConsLicitacao_Filtro.asp"},
                  {lb:"🌐 BNC",url:"https://www.bnc.org.br/"},
                ].map(p=>(
                  <a key={p.url} href={p.url} target="_blank" rel="noreferrer"
                    style={{padding:"6px 12px",borderRadius:8,border:"1.5px solid var(--border)",background:"var(--bg-input)",color:"var(--txt-sub)",fontSize:11,fontWeight:600,textDecoration:"none",transition:"all .15s",display:"inline-flex",alignItems:"center",gap:4}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor="#2563eb";e.currentTarget.style.color="#2563eb";}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--txt-sub)";}}>
                    {p.lb} ↗
                  </a>
                ))}
              </div>
            </div>
            {pncpLoading&&<Loading/>}
            {pncpError&&<div style={{textAlign:"center",padding:"40px 20px"}}><div style={{fontSize:28,marginBottom:8}}>⚠️</div><div style={{fontWeight:700,marginBottom:12}}>{pncpError}</div><button style={RS.btnPrimary} onClick={()=>fetchPNCP()}>Tentar novamente</button></div>}
            {!pncpLoading&&!pncpError&&<>
              <div style={{fontSize:12,color:"#94a3b8",marginBottom:10,fontWeight:600}}>{pncpItems.length} resultados</div>
              {pncpItems.map((l,idx)=>{
                const d=diasAte(l.dataAbertura);
                const importar=()=>{setFormCert({...CERT0,titulo:(l.objeto||"").slice(0,80),tipoCertame:l.modalidade||"Pregão Eletrônico",numero:l.ncp||"",orgao:l.orgao||"",uf:l.uf||"",objeto:l.objeto||"",valor:l.valor||"",dataAbertura:l.dataAbertura||"",dataPublicacao:l.dataPublicacao||"",fonte:"PNCP",status:"Aberto",monitorando:true});setModalType("addCertame");showToast("📥 Importado!");};
                return(
                  <div key={l.id||idx} style={{...RS.licCard,borderLeft:`3px solid ${l.situacao==="Recebendo Propostas"?"#16a34a":"#e2e8f0"}`}} className="hov">
                    <div style={{display:"flex",gap:10,marginBottom:10}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3,flexWrap:"wrap"}}>
                          <span style={{fontSize:10,color:"#94a3b8",fontWeight:700,textTransform:"uppercase"}}>{l.modalidade}</span>
                          {l.situacao&&<span style={{fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:5,background:l.situacao==="Recebendo Propostas"?"#f0fdf4":"#f8fafc",color:l.situacao==="Recebendo Propostas"?"#16a34a":"#64748b"}}>{l.situacao}</span>}
                          {l.dataPublicacao&&<span style={{fontSize:9,color:"#94a3b8"}}>Pub: {fmtDate(l.dataPublicacao)}</span>}
                        </div>
                        <div style={{fontSize:13,fontWeight:700,color:"#1e293b",lineHeight:1.4,marginBottom:4}}>{(l.objeto||"").slice(0,90)}{l.objeto?.length>90?"...":""}</div>
                        <div style={{fontSize:11,color:"#64748b"}}>🏛 {l.orgao} {l.municipio?`— ${l.municipio}/`:""}{l.uf}</div>
                      </div>
                      <div style={{flexShrink:0,textAlign:"right"}}>
                        <div style={{fontSize:14,fontWeight:800,color:"#1d4ed8"}}>{fmt(l.valor)}</div>
                        <span style={{...RS.pill,background:"#eff6ff",color:"#1d4ed8",display:"block",marginTop:4}}>PNCP</span>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6,borderTop:"1px solid #f1f5f9",paddingTop:10,flexWrap:"wrap"}}>
                      <span style={{fontSize:11,color:d!==null&&d<=7?"#dc2626":"#64748b"}}>📅 {fmtDate(l.dataAbertura)}{d>0?` (${d}d)`:""}</span>
                      <div style={{marginLeft:"auto",display:"flex",gap:6}}>
                        {l.linkEdital&&<a href={l.linkEdital} target="_blank" rel="noreferrer" title="Ver edital no PNCP" style={{background:"#eff6ff",border:"1.5px solid #bfdbfe",borderRadius:8,padding:"5px 8px",fontSize:13,color:"#1d4ed8",textDecoration:"none",display:"flex",alignItems:"center"}}>🌐</a>}
                        <button style={RS.btnOut} onClick={importar}>📥 Importar</button>
                        <button style={RS.btnSec} onClick={()=>setPncpSelected(idx)}>Ver +</button>
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
            <PgHdr title="📝 Propostas" sub="Normal e Readequada Final"/>
            {/* Abas tipo proposta */}
            <div style={{display:"flex",gap:6,marginBottom:14}}>
              {[{id:"normal",lb:"📝 Proposta Normal",desc:"Para participação em certames"},{id:"readequada",lb:"🏆 Proposta Readequada Final",desc:"Para certames vencidos — com dados bancários"}].map(t=>(
                <button key={t.id} onClick={()=>setFormProp(p=>({...p,tipo:t.id||"normal"}))}
                  style={{padding:"8px 16px",borderRadius:10,border:`1.5px solid ${(formProp.tipo||"normal")===t.id?"#1d4ed8":"var(--border)"}`,background:(formProp.tipo||"normal")===t.id?"#eff6ff":"var(--bg-card)",color:(formProp.tipo||"normal")===t.id?"#1d4ed8":"var(--txt-sub)",fontWeight:700,fontSize:12,cursor:"pointer",flex:1,textAlign:"left"}}>
                  <div>{t.lb}</div>
                  <div style={{fontSize:10,fontWeight:400,marginTop:2,color:(formProp.tipo||"normal")===t.id?"#3b82f6":"var(--txt-sub)"}}>{t.desc}</div>
                </button>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:14,alignItems:"start"}}>
              {/* Coluna esquerda: formulário */}
              <div style={RS.card}>
                <div style={{fontSize:13,fontWeight:800,marginBottom:14,color:(formProp.tipo||"normal")==="readequada"?"#16a34a":"#1d4ed8"}}>
                  {(formProp.tipo||"normal")==="readequada"?"🏆 Nova Proposta Readequada Final":"📝 Nova Proposta Comercial"}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                    <FG l="Título *" style={{flex:2,minWidth:180}}><FI value={formProp.titulo} onChange={e=>setFormProp(p=>({...p,titulo:e.target.value}))} placeholder="Ex: Proposta PE 001/2025"/></FG>
                    <FG l="Vincular Certame" style={{flex:2,minWidth:180}}>
                      <select style={RS.fi} value={formProp.certameId} onChange={e=>setFormProp(p=>({...p,certameId:e.target.value}))}>
                        <option value="">— Nenhum —</option>
                        {certames.map(c=><option key={c.id} value={c.id}>{c.tipoCertame} · {(c.titulo||c.objeto||"").slice(0,50)}</option>)}
                      </select>
                    </FG>
                  </div>
                  {/* Tabela de itens melhorada */}
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:"var(--txt-sub)",textTransform:"uppercase",letterSpacing:".4px",marginBottom:8}}>Itens da Proposta</div>
                    <div style={{border:"1.5px solid var(--border)",borderRadius:10,overflow:"hidden"}}>
                      {/* Cabeçalho */}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 70px 80px 130px 120px 36px",background:"var(--bg-input)",padding:"8px 12px",gap:8,borderBottom:"1.5px solid var(--border)"}}>
                        {["Descrição do Item","Unidade","Quantidade","R$ Unitário","Total",""].map(h=>(
                          <div key={h} style={{fontSize:10,fontWeight:700,color:"var(--txt-sub)",textTransform:"uppercase",letterSpacing:".3px"}}>{h}</div>
                        ))}
                      </div>
                      {/* Linhas */}
                      {(formProp.itens||[]).map((it,i)=>(
                        <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 70px 80px 130px 120px 36px",padding:"8px 12px",gap:8,borderBottom:"1px solid var(--border-light)",alignItems:"center",background:i%2===0?"var(--bg-card)":"var(--bg-input)"}}>
                          <input style={{...RS.fi,fontSize:13,padding:"8px 10px"}} value={it.desc||""} onChange={e=>setFormProp(p=>({...p,itens:p.itens.map((x,j)=>j===i?{...x,desc:e.target.value}:x)}))} placeholder={`Item ${i+1}...`}/>
                          <input style={{...RS.fi,fontSize:13,padding:"8px 8px",textAlign:"center"}} value={it.unidade||"UN"} onChange={e=>setFormProp(p=>({...p,itens:p.itens.map((x,j)=>j===i?{...x,unidade:e.target.value}:x)}))}/>
                          <input style={{...RS.fi,fontSize:13,padding:"8px 8px",textAlign:"center"}} type="number" min="1" value={it.qtd||1} onChange={e=>setFormProp(p=>({...p,itens:p.itens.map((x,j)=>j===i?{...x,qtd:e.target.value}:x)}))}/>
                          <input style={{...RS.fi,fontSize:13,padding:"8px 10px",textAlign:"right"}} type="number" step="0.01" value={it.unit||""} onChange={e=>setFormProp(p=>({...p,itens:p.itens.map((x,j)=>j===i?{...x,unit:e.target.value}:x)}))} placeholder="0,00"/>
                          <div style={{fontSize:14,fontWeight:800,color:"#1d4ed8",textAlign:"right",paddingRight:4}}>{fmt((parseFloat(it.qtd)||0)*(parseFloat(it.unit)||0))}</div>
                          <button style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:6,color:"#dc2626",cursor:"pointer",fontSize:14,padding:"4px 6px",lineHeight:1}} onClick={()=>setFormProp(p=>({...p,itens:p.itens.filter((_,j)=>j!==i)}))}>×</button>
                        </div>
                      ))}
                      {/* Total */}
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"var(--bg-input)",borderTop:"1.5px solid var(--border)"}}>
                        <button style={{...RS.btnOut,fontSize:12}} onClick={()=>setFormProp(p=>({...p,itens:[...p.itens,{desc:"",unidade:"UN",qtd:1,unit:""}]}))}>+ Adicionar Item</button>
                        <div style={{fontWeight:900,color:"#1d4ed8",fontSize:16}}>TOTAL: {fmt(totalProp)}</div>
                      </div>
                    </div>
                  </div>
                  {/* Validade e prazo */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:10}}>
                    <FG l="Validade (dias)"><FI value={formProp.validade||"60"} onChange={e=>setFormProp(p=>({...p,validade:e.target.value}))} placeholder="60"/></FG>
                    <FG l="Prazo de Entrega"><FI value={formProp.prazoEntrega||""} onChange={e=>setFormProp(p=>({...p,prazoEntrega:e.target.value}))} placeholder="Ex: 30 dias úteis após empenho"/></FG>
                  </div>
                  {/* Dados bancários — só na readequada */}
                  {(formProp.tipo||"normal")==="readequada"&&(
                    <div style={{background:"#f0fdf4",border:"1.5px solid #bbf7d0",borderRadius:10,padding:"12px 14px"}}>
                      <div style={{fontSize:11,fontWeight:800,color:"#16a34a",textTransform:"uppercase",marginBottom:10,letterSpacing:".4px"}}>🏦 Dados Bancários para Pagamento</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                        <FG l="Banco"><FI value={formProp.banco||empresa?.banco||""} onChange={e=>setFormProp(p=>({...p,banco:e.target.value}))} placeholder="Ex: Banco do Brasil / Caixa..."/></FG>
                        <FG l="Tipo de Conta">
                          <select style={RS.fi} value={formProp.tipoConta||"Corrente"} onChange={e=>setFormProp(p=>({...p,tipoConta:e.target.value}))}>
                            {["Corrente","Poupança","Pagamento"].map(o=><option key={o}>{o}</option>)}
                          </select>
                        </FG>
                        <FG l="Agência"><FI value={formProp.agencia||empresa?.agencia||""} onChange={e=>setFormProp(p=>({...p,agencia:e.target.value}))} placeholder="0000-0"/></FG>
                        <FG l="Conta"><FI value={formProp.conta||empresa?.conta||""} onChange={e=>setFormProp(p=>({...p,conta:e.target.value}))} placeholder="00000-0"/></FG>
                        <FG l="Chave PIX" style={{gridColumn:"1/-1"}}><FI value={formProp.pix||empresa?.pix||""} onChange={e=>setFormProp(p=>({...p,pix:e.target.value}))} placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória"/></FG>
                      </div>
                    </div>
                  )}
                  <FG l="Observações"><textarea style={{...RS.fi,minHeight:65,resize:"vertical"}} value={formProp.obs||""} onChange={e=>setFormProp(p=>({...p,obs:e.target.value}))} placeholder="Condições especiais, descontos, garantias..."/></FG>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <button style={{...RS.btnPrimary,padding:"11px"}} onClick={saveProp}>💾 Salvar Proposta</button>
                    <button style={{...RS.btnPrimary,background:"#16a34a",padding:"11px"}} onClick={()=>{const c=certames.find(x=>x.id===formProp.certameId);gerarPDFProposta({...formProp,empresa,certame:c,tipo:formProp.tipo||"normal"});showToast("📄 PDF gerado!");}}>📄 Exportar PDF</button>
                  </div>
                </div>
              </div>
              {/* Coluna direita: propostas salvas */}
              <div>
                <div style={RS.card}>
                  <div style={{fontSize:13,fontWeight:800,marginBottom:12}}>Propostas Salvas</div>
                  {propostas.length===0&&<div style={{textAlign:"center",padding:"20px",color:"var(--txt-sub)",fontSize:13}}>Nenhuma proposta salva</div>}
                  {propostas.map(p=>{
                    const c=certames.find(x=>x.id===p.certameId);
                    const tot=(p.itens||[]).reduce((a,it)=>a+(parseFloat(it.qtd)||0)*(parseFloat(it.unit)||0),0);
                    const isRead=(p.tipo||"normal")==="readequada";
                    return(
                      <div key={p.id} style={{padding:"12px 0",borderBottom:"1px solid var(--border-light)"}}>
                        <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:6}}>
                          <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:5,background:isRead?"#f0fdf4":"#eff6ff",color:isRead?"#16a34a":"#1d4ed8",flexShrink:0,marginTop:1}}>{isRead?"🏆 READEQUADA":"📝 NORMAL"}</span>
                        </div>
                        <div style={{fontSize:13,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.titulo}</div>
                        {c&&<div style={{fontSize:11,color:"var(--txt-sub)",marginTop:1}}>{c.tipoCertame} · {c.orgao}</div>}
                        <div style={{fontSize:15,fontWeight:900,color:"#1d4ed8",marginTop:2}}>{fmt(tot)}</div>
                        <div style={{display:"flex",gap:6,marginTop:8}}>
                          <button style={{...RS.btnSec,flex:1,fontSize:11}} onClick={()=>setFormProp({...p})}>✏ Editar</button>
                          <button style={{...RS.btnPrimary,flex:1,fontSize:11,background:"#16a34a",padding:"6px"}} onClick={()=>{const c=certames.find(x=>x.id===p.certameId);gerarPDFProposta({...p,empresa,certame:c,tipo:p.tipo||"normal"});}}>📄 PDF</button>
                          <button style={{background:"none",border:"1px solid #fecaca",borderRadius:8,color:"#dc2626",fontSize:12,cursor:"pointer",padding:"6px 8px"}} onClick={()=>delProp(p.id)}>🗑</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
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
        {/* CONFIGURAÇÕES */}
        {tab==="configuracoes"&&(
          <div style={RS.pg}>
            <PgHdr title="⚙️ Configurações"/>

            {/* Aparência */}
            <div style={RS.card}>
              <div style={{fontSize:13,fontWeight:800,marginBottom:14}}>🎨 Aparência</div>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:700}}>Tema escuro</div>
                    <div style={{fontSize:11,color:"#64748b"}}>Fundo preto para uso noturno</div>
                  </div>
                  <button onClick={()=>setDark(v=>!v)}
                    style={{width:48,height:26,borderRadius:13,background:dark?"#1d4ed8":"#e2e8f0",border:"none",cursor:"pointer",position:"relative",transition:"background .2s"}}>
                    <span style={{position:"absolute",top:3,left:dark?22:2,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 4px #00000030"}}/>
                  </button>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:700}}>Tamanho da fonte</div>
                    <div style={{fontSize:11,color:"#64748b"}}>Ajuste o tamanho do texto</div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    {[{v:"small",lb:"P"},{v:"normal",lb:"M"},{v:"large",lb:"G"}].map(f=>(
                      <button key={f.v} onClick={()=>setFontSize(f.v)}
                        style={{width:32,height:32,borderRadius:8,border:"1.5px solid",background:fontSize===f.v?"#1d4ed8":"var(--bg-card)",color:fontSize===f.v?"#fff":"var(--txt-sub)",borderColor:fontSize===f.v?"#1d4ed8":"var(--border)",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                        {f.lb}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Timbre / Logo */}
            <div style={RS.card}>
              <div style={{fontSize:13,fontWeight:800,marginBottom:6}}>🖼 Timbre / Logomarca nos PDFs</div>
              <div style={{fontSize:12,color:"var(--txt-sub)",marginBottom:14,lineHeight:1.6}}>
                Faça o upload da logo diretamente ou cole uma URL. A imagem aparecerá no cabeçalho de todos os PDFs.
              </div>
              {/* Upload direto */}
              <div style={{marginBottom:12}}>
                <label style={{display:"block",fontSize:10,fontWeight:700,color:"var(--txt-sub)",textTransform:"uppercase",letterSpacing:".3px",marginBottom:6}}>Upload da Logo (PNG, JPG, SVG)</label>
                <label style={{display:"flex",alignItems:"center",gap:10,background:"var(--bg-input)",border:"2px dashed var(--border)",borderRadius:10,padding:"14px 16px",cursor:"pointer",transition:"border-color .2s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="#1d4ed8"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
                  <span style={{fontSize:24}}>📁</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:"#1d4ed8"}}>Clique para selecionar arquivo</div>
                    <div style={{fontSize:11,color:"var(--txt-sub)"}}>PNG, JPG, SVG — max 2MB — converte para Base64 automaticamente</div>
                  </div>
                  <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
                    const file=e.target.files?.[0];
                    if(!file)return;
                    if(file.size>2*1024*1024){showToast("Imagem muito grande (max 2MB)","error");return;}
                    const reader=new FileReader();
                    reader.onload=ev=>{ setFormEmp(p=>({...p,timbre:ev.target.result})); showToast("✅ Logo carregada!"); };
                    reader.readAsDataURL(file);
                  }}/>
                </label>
              </div>
              {/* OU URL manual */}
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div style={{flex:1,height:1,background:"var(--border)"}}/>
                <span style={{fontSize:11,color:"var(--txt-sub)",fontWeight:600}}>OU cole uma URL</span>
                <div style={{flex:1,height:1,background:"var(--border)"}}/>
              </div>
              <FG l="URL da Logo (opcional)">
                <FI value={(formEmp.timbre||"").startsWith("data:")?"":(formEmp.timbre||"")} onChange={e=>setFormEmp(p=>({...p,timbre:e.target.value}))} placeholder="https://exemplo.com/logo.png"/>
              </FG>
              {/* Prévia */}
              {formEmp.timbre&&(
                <div style={{marginTop:12,padding:12,background:"var(--bg-input)",borderRadius:10,border:"1px solid var(--border)",textAlign:"center"}}>
                  <img src={formEmp.timbre} alt="Logo" style={{maxHeight:90,maxWidth:"100%",objectFit:"contain",borderRadius:6}}
                    onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="block";}}/>
                  <div style={{display:"none",fontSize:12,color:"#dc2626",padding:8}}>⚠️ Imagem não pôde ser carregada. Use upload direto ou verifique a URL.</div>
                  <div style={{fontSize:10,color:"var(--txt-sub)",marginTop:6,display:"flex",justifyContent:"center",alignItems:"center",gap:8}}>
                    <span>Prévia do timbre nos PDFs</span>
                    <button onClick={()=>setFormEmp(p=>({...p,timbre:""}))} style={{background:"none",border:"none",color:"#dc2626",cursor:"pointer",fontSize:11,fontWeight:700}}>✕ Remover</button>
                  </div>
                </div>
              )}
              <button style={{...RS.btnPrimary,width:"100%",marginTop:12}} onClick={saveEmpresa}>💾 Salvar Logo / Timbre</button>
            </div>

            {/* Admin — Gerenciar Empresas */}
            {adminMode&&(
              <div style={RS.card}>
                <div style={{fontSize:13,fontWeight:800,marginBottom:12}}>🏢 Gerenciar Empresas <span style={{background:"#16a34a",color:"#fff",borderRadius:6,padding:"2px 8px",fontSize:10,marginLeft:6}}>ADMIN</span></div>
                {empresasList.length===0&&<div style={{textAlign:"center",padding:"16px",color:"var(--txt-sub)",fontSize:13}}>Nenhuma empresa cadastrada</div>}
                {empresasList.map(e=>(
                  <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px",borderRadius:10,marginBottom:8,background:e.id===empresaAtualId?"var(--blue-lt)":"var(--bg-input)",border:`1.5px solid ${e.id===empresaAtualId?"#bfdbfe":"var(--border)"}`}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.nomeFantasia||e.razaoSocial}</div>
                      <div style={{fontSize:11,color:"var(--txt-sub)",marginTop:1}}>CNPJ: {e.cnpj}</div>
                    </div>
                    {e.id===empresaAtualId&&<span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:6,background:"#1d4ed8",color:"#fff",flexShrink:0}}>Ativa</span>}
                    {e.id!==empresaAtualId&&<button style={{...RS.btnSec,fontSize:11,flexShrink:0}} onClick={()=>trocarEmpresa(e.id)}>Acessar</button>}
                    <button title="Excluir empresa e todos os dados"
                      style={{background:"#fef2f2",border:"1.5px solid #fecaca",borderRadius:8,color:"#dc2626",cursor:"pointer",fontSize:12,padding:"6px 10px",display:"flex",alignItems:"center",gap:4,flexShrink:0,fontWeight:700}}
                      onClick={()=>removerEmpresa(e.id)}>
                      🗑 Excluir
                    </button>
                  </div>
                ))}
                <button style={{...RS.btnPrimary,width:"100%",marginTop:12}} onClick={criarNovaEmpresa}>+ Adicionar Nova Empresa</button>
              </div>
            )}
            {!adminMode&&(
              <div style={{...RS.card,textAlign:"center"}}>
                <div style={{fontSize:30,marginBottom:8}}>🔐</div>
                <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>Modo Administrador</div>
                <div style={{fontSize:12,color:"#64748b",marginBottom:12}}>Acesse com a senha de admin para gerenciar múltiplas empresas.</div>
                <button style={RS.btnPrimary} onClick={()=>setShowAdminLogin(true)}>🔐 Entrar como Admin</button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* BOTTOM NAV — mobile only */}
      <nav id="bnav-mobile" style={RS.bnav}>
        {[
          {id:"dashboard",lb:"Início",ic:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>},
          {id:"fontes",lb:"Buscar",ic:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>},
          {id:"certames",lb:"Certames",ic:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>},
          {id:"certidoes",lb:"Certidões",ic:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>},
          {id:"configuracoes",lb:"Config",ic:<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33"/></svg>},
        ].map(n=>(
          <button key={n.id} style={{...RS.bnavBtn,...(tab===n.id?RS.bnavOn:{})}} onClick={()=>{setTab(n.id);if(n.id!=="certames")setSelectedCert(null);if(n.id!=="fontes")setPncpSelected(null);}}>
            <span style={{color:tab===n.id?"var(--accent)":"var(--txt-muted)"}}>{n.ic}</span>
            <span>{n.lb}</span>
          </button>
        ))}
      </nav>
      </div>{/* end #app-main */}
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
        <FG l="Telefone" style={{flex:1,minWidth:140}}><FI value={form.telefone} onChange={e=>f("telefone",maskFone(e.target.value))}/></FG>
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
const PgHdr=({title,sub,children})=><div style={{marginBottom:22,display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}><div><h1 style={{fontSize:22,fontWeight:800,color:"var(--txt)",letterSpacing:"-.5px",display:"flex",alignItems:"center",gap:8}}>{title}</h1>{sub&&<p style={{fontSize:12,color:"var(--txt-sub)",marginTop:3,fontWeight:500}}>{sub}</p>}</div><div style={{display:"flex",gap:8,alignItems:"center"}}>{children}</div></div>;
const SHdr=({title,children})=><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><span style={{fontSize:14,fontWeight:700,color:"var(--txt)"}}>{title}</span>{children}</div>;
const Loading=()=><div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,padding:"50px",color:"#94a3b8",fontSize:14}}><div style={{width:28,height:28,border:"3px solid #e2e8f0",borderTop:"3px solid #1d4ed8",borderRadius:"50%"}} className="spin"/>Carregando...</div>;
const AILoad=()=><div style={{display:"flex",alignItems:"center",gap:8,padding:"12px 0",color:"#64748b",fontSize:13}}><div style={{width:15,height:15,border:"2px solid #e2e8f0",borderTop:"2px solid #1d4ed8",borderRadius:"50%"}} className="spin"/>Analisando com IA...</div>;

// ══════════════════════════════════════════════════════════════════════
// STYLES — Totalmente responsivos PC + Mobile
// ══════════════════════════════════════════════════════════════════════
const RS = {
  root:{fontFamily:"'Inter',system-ui,sans-serif",background:"var(--bg-app)",color:"var(--txt)"},
  onboard:{maxWidth:640,margin:"0 auto",padding:"32px 20px 100px",width:"100%"},
  card:{background:"var(--bg-card)",borderRadius:"var(--radius-lg)",padding:"20px",border:"1px solid var(--border)",marginBottom:12,boxShadow:"var(--shadow-sm)"},
  hdr:{background:"var(--bg-card)",borderBottom:"1px solid var(--border)",padding:"0 24px",height:60,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50,boxShadow:"var(--shadow-sm)"},
  menuBtn:{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"var(--txt-sub)",padding:"6px 8px",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"},
  notifBtn:{background:"none",border:"none",cursor:"pointer",fontSize:17,padding:"8px",borderRadius:10,position:"relative",color:"var(--txt-sub)",display:"flex",alignItems:"center"},
  nDot:{position:"absolute",top:4,right:4,background:"#dc2626",color:"#fff",borderRadius:"50%",fontSize:8,fontWeight:800,width:13,height:13,display:"flex",alignItems:"center",justifyContent:"center"},
  avatar:{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0,boxShadow:"0 2px 8px rgba(37,99,235,.3)"},
  sidebar:{width:256,minWidth:256,background:"var(--bg-sidebar)",zIndex:200,transition:"transform .3s ease",display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0},
  sbLogo:{display:"flex",alignItems:"center",gap:12,padding:"20px 18px 16px",borderBottom:"1px solid #1f2937"},
  sbItem:{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderRadius:10,background:"none",border:"none",color:"var(--txt-sidebar)",cursor:"pointer",fontSize:13,fontWeight:500,textAlign:"left",width:"100%",transition:"all .15s"},
  sbItemOn:{background:"var(--bg-sidebar-active)",color:"var(--txt-sidebar-active)",fontWeight:600},
  sbBadge:{marginLeft:"auto",background:"#dc2626",color:"#fff",borderRadius:8,fontSize:9,padding:"2px 7px",fontWeight:700},
  sbSection:{fontSize:9,fontWeight:700,color:"#4b5563",textTransform:"uppercase",letterSpacing:"1px",padding:"16px 18px 6px"},
  overlay:{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:150,backdropFilter:"blur(2px)"},
  notifPanel:{position:"fixed",top:62,right:16,width:340,maxWidth:"92vw",background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:16,boxShadow:"var(--shadow-lg)",zIndex:200,maxHeight:440,overflowY:"auto"},
  mOverlay:{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(3px)"},
  modal:{background:"var(--bg-card)",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:640,maxHeight:"94vh",overflow:"hidden",display:"flex",flexDirection:"column"},
  mHdr:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 22px",borderBottom:"1px solid var(--border)",fontWeight:700,fontSize:15},
  mBody:{overflowY:"auto",padding:"20px 22px 36px"},
  main:{flex:1,overflowY:"auto",minWidth:0},
  pg:{padding:"24px 32px",maxWidth:1400,margin:"0 auto",width:"100%"},
  grid4:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:14,marginBottom:24},
  statCard:{borderRadius:16,padding:"18px 20px",border:"1px solid var(--border)",display:"flex",flexDirection:"column",gap:6,background:"var(--bg-card)",boxShadow:"var(--shadow-sm)"},
  section:{background:"var(--bg-card)",borderRadius:16,padding:"18px 20px",marginBottom:14,border:"1px solid var(--border)",boxShadow:"var(--shadow-sm)"},
  licCard:{background:"var(--bg-card)",borderRadius:14,padding:"16px",border:"1px solid var(--border)",marginBottom:10,boxShadow:"var(--shadow-sm)"},
  pill:{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:6,display:"inline-block"},
  iGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8,marginTop:10},
  iBox:{background:"var(--bg-input)",borderRadius:10,padding:"10px 14px",border:"1px solid var(--border-light)"},
  subTabs:{display:"flex",gap:6,marginBottom:16,overflowX:"auto",scrollbarWidth:"none"},
  subTab:{background:"var(--bg-card)",border:"1.5px solid var(--border)",borderRadius:10,padding:"8px 16px",fontSize:12,fontWeight:600,cursor:"pointer",color:"var(--txt-sub)",whiteSpace:"nowrap",flexShrink:0,transition:"all .15s"},
  subTabOn:{background:"var(--accent)",borderColor:"var(--accent)",color:"#fff"},
  tlItem:{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid var(--border-light)",cursor:"pointer"},
  lnkBtn:{background:"none",border:"none",color:"var(--accent)",fontSize:12,fontWeight:600,cursor:"pointer"},
  backBtn:{background:"none",border:"none",color:"var(--accent)",fontSize:13,fontWeight:600,cursor:"pointer",padding:"0 0 14px",display:"block"},
  fi:{border:"1.5px solid var(--border)",borderRadius:8,padding:"10px 14px",fontSize:13,color:"var(--txt)",outline:"none",fontFamily:"inherit",background:"var(--bg-input)",width:"100%",boxSizing:"border-box",transition:"border-color .15s"},
  btnPrimary:{background:"var(--accent)",color:"#fff",border:"none",borderRadius:10,padding:"10px 20px",fontSize:13,fontWeight:600,cursor:"pointer",transition:"all .15s",boxShadow:"0 2px 8px rgba(37,99,235,.25)"},
  btnSec:{background:"var(--accent-lt)",color:"var(--accent)",border:"none",borderRadius:10,padding:"8px 16px",fontSize:12,fontWeight:600,cursor:"pointer"},
  btnOut:{background:"none",color:"var(--txt-sub)",border:"1.5px solid var(--border)",borderRadius:10,padding:"8px 14px",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .15s"},
  btnDanger:{background:"#fef2f2",color:"#dc2626",border:"1.5px solid #fecaca",borderRadius:10,padding:"8px 14px",fontSize:12,fontWeight:600,cursor:"pointer"},
  btnAI:{background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"#fff",border:"none",borderRadius:10,padding:"9px 14px",fontSize:12,fontWeight:600,cursor:"pointer"},
  refreshBtn:{background:"var(--bg-input)",border:"1.5px solid var(--border)",borderRadius:10,width:38,height:38,fontSize:16,cursor:"pointer",color:"var(--accent)",display:"flex",alignItems:"center",justifyContent:"center"},
  aiTxt:{fontSize:12,color:"var(--txt-sub)",lineHeight:1.8,whiteSpace:"pre-wrap",fontFamily:"inherit",background:"var(--bg-input)",borderRadius:10,padding:"14px",border:"1px solid var(--border)",maxHeight:280,overflowY:"auto"},
  toast:{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",color:"#fff",padding:"11px 24px",borderRadius:24,fontSize:13,fontWeight:600,zIndex:999,boxShadow:"var(--shadow-lg)",whiteSpace:"nowrap"},
  bnav:{position:"fixed",bottom:0,left:0,right:0,background:"var(--bg-card)",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"center",padding:"8px 0 12px",zIndex:100,boxShadow:"0 -2px 16px rgba(0,0,0,.06)"},
  bnavBtn:{background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"pointer",color:"var(--txt-muted)",padding:"4px 18px",borderRadius:10,minWidth:60,fontSize:9,fontWeight:600,transition:"color .15s"},
  bnavOn:{color:"var(--accent)"},
};};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --sidebar-w:256px;
    --fs-base:14px;
    --accent:#2563eb;
    --accent-dark:#1d4ed8;
    --accent-lt:#eff6ff;
    --green:#059669;
    --red:#dc2626;
    --yellow:#d97706;
    --purple:#7c3aed;
    --bg-app:#f0f4f8;
    --bg-card:#ffffff;
    --bg-input:#f8fafc;
    --bg-sidebar:#111827;
    --bg-sidebar-hover:#1f2937;
    --bg-sidebar-active:#1e3a5f;
    --txt:#0f172a;
    --txt-sub:#475569;
    --txt-muted:#94a3b8;
    --txt-sidebar:#9ca3af;
    --txt-sidebar-active:#60a5fa;
    --border:#e2e8f0;
    --border-light:#f1f5f9;
    --shadow-sm:0 1px 3px rgba(0,0,0,.08),0 1px 2px rgba(0,0,0,.04);
    --shadow:0 4px 16px rgba(0,0,0,.08);
    --shadow-lg:0 10px 40px rgba(0,0,0,.12);
    --radius:12px;
    --radius-sm:8px;
    --radius-lg:16px;
  }
  [data-theme="dark"]{
    --bg-app:#0b1120;--bg-card:#141e2e;--bg-input:#0f172a;
    --txt:#f1f5f9;--txt-sub:#94a3b8;--txt-muted:#64748b;
    --border:#1e293b;--border-light:#1a2535;
    --accent:#3b82f6;--accent-lt:#1e3a5f;
  }
  html,body,#root{height:100%;margin:0;padding:0}
  body{background:var(--bg-app);font-size:var(--fs-base);color:var(--txt);font-family:'Inter',system-ui,sans-serif;line-height:1.5;-webkit-font-smoothing:antialiased}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}
  input:focus,select:focus,textarea:focus{border-color:var(--accent)!important;outline:none;box-shadow:0 0 0 3px rgba(37,99,235,.1)}
  input[type=date]{color-scheme:light}
  [data-theme="dark"] input[type=date]{color-scheme:dark}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
  .spin{animation:spin .8s linear infinite}
  .fade-in{animation:fadeIn .2s ease}
  .hov{transition:all .15s ease}
  .hov:hover{transform:translateY(-2px);box-shadow:var(--shadow)}
  select option{background:var(--bg-card);color:var(--txt)}
  button,input,select,textarea{font-family:inherit}
  a{text-decoration:none}

  /* ═══ LAYOUT DESKTOP ═══ */
  @media(min-width:900px){
    .app-root{display:flex;height:100vh;overflow:hidden}
    #sidebar{
      width:var(--sidebar-w);min-width:var(--sidebar-w);max-width:var(--sidebar-w);
      position:relative!important;transform:none!important;
      height:100vh;flex-shrink:0;overflow-y:auto;overflow-x:hidden;scrollbar-width:none;
    }
    #sidebar::-webkit-scrollbar{display:none}
    #sidebar-overlay{display:none!important}
    #app-main{flex:1;min-width:0;display:flex;flex-direction:column;height:100vh;overflow:hidden}
    #main-content{flex:1;overflow-y:auto;padding-bottom:24px}
    #bnav-mobile{display:none!important}
    #menu-btn{display:none!important}
    .pg{padding:24px 32px!important;max-width:none!important}
  }

  /* ═══ LAYOUT MOBILE ═══ */
  @media(max-width:899px){
    .app-root{display:block;min-height:100vh}
    #sidebar{position:fixed!important;z-index:300;height:100vh;overflow-y:auto}
    #app-main{display:flex;flex-direction:column;min-height:100vh}
    #main-content{flex:1;padding-bottom:72px}
    #bnav-mobile{display:flex!important}
    .pg{padding:16px!important}
  }

  /* ═══ COMPONENTES ═══ */
  .stat-card{border-radius:var(--radius-lg);padding:18px 20px;border:1px solid var(--border);background:var(--bg-card);box-shadow:var(--shadow-sm);cursor:pointer;transition:all .18s;display:flex;flex-direction:column;gap:6px}
  .stat-card:hover{transform:translateY(-3px);box-shadow:var(--shadow)}
  .badge{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px;letter-spacing:.3px}
  .card-hover{transition:all .15s}.card-hover:hover{box-shadow:var(--shadow);transform:translateY(-1px)}
`;

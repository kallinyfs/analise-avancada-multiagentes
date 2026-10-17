"use strict";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const moedaEixo = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const inteiro = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const percentual = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 });
const dataPtBr = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });
const mesPtBr = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric", timeZone: "UTC" });
const coresGrafico = ["#231942", "#5E548E", "#9F86C0", "#BE95C4", "#E0B1CB"];
const svgNS = "http://www.w3.org/2000/svg";

const elemento = (id) => document.getElementById(id);
const filtroCategoria = elemento("filtro-categoria");
const filtroCidade = elemento("filtro-cidade");
const filtroMes = elemento("filtro-mes");
const filtroProduto = elemento("filtro-produto");
const botaoLimpar = elemento("limpar-filtros");
const status = elemento("mensagem-status");
let registros = [];

function preencherFiltro(select, valores, rotuloMes = false) {
  for (const valor of valores) {
    const opcao = document.createElement("option");
    opcao.value = valor;
    opcao.textContent = rotuloMes ? rotuloMes(valor) : valor;
    select.append(opcao);
  }
}

function mesDoRegistro(registro) {
  return registro.data.slice(0, 7);
}

function rotuloMes(mes, curto = false) {
  const [ano, numeroMes] = mes.split("-").map(Number);
  const data = new Date(Date.UTC(ano, numeroMes - 1, 1));
  const rotulo = (curto ? mesPtBr : new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" })).format(data);
  return rotulo.charAt(0).toLocaleUpperCase("pt-BR") + rotulo.slice(1);
}

function somar(dados) {
  return dados.reduce((total, registro) => total + registro.valor_venda, 0);
}

function agrupar(dados, campo) {
  const totais = new Map();
  for (const registro of dados) {
    const chave = registro[campo];
    totais.set(chave, (totais.get(chave) || 0) + registro.valor_venda);
  }
  return [...totais.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"));
}

function criarLinhaVazia(container, texto, classe = "grafico-vazio") {
  const vazio = document.createElement("p");
  vazio.className = classe;
  vazio.textContent = texto;
  container.append(vazio);
}

function filtrarPorCampo(campo, valor) {
  const select = campo === "categoria" ? filtroCategoria : campo === "cidade" ? filtroCidade : filtroProduto;
  select.value = select.value === valor ? "" : valor;
  atualizar();
  select.focus();
}

function desenharGrafico(containerId, grupos, totalVendido) {
  const container = elemento(containerId);
  const categoria = containerId === "grafico-categoria";
  const campo = categoria ? "categoria" : "cidade";
  const resumo = elemento(categoria ? "resumo-categoria" : "resumo-cidade");
  const escala = elemento(categoria ? "escala-categoria" : "escala-cidade");
  container.replaceChildren();
  resumo.textContent = "";
  escala.replaceChildren();
  if (grupos.length === 0 || totalVendido === 0) {
    criarLinhaVazia(container, "Sem dados para exibir.");
    return;
  }
  const maior = Math.max(...grupos.map(([, valor]) => valor), 0);
  const prefixo = categoria ? "categorias" : "cidades";
  const [lider, valorLider] = grupos[0];
  resumo.textContent = `${inteiro.format(grupos.length)} ${prefixo} no recorte · maior valor: ${lider} (${moeda.format(valorLider)}, ${percentual.format(valorLider / totalVendido)} do total). Clique em uma linha para filtrar.`;

  for (const [indice, [rotulo, valor]] of grupos.entries()) {
    const linha = document.createElement("div");
    linha.className = "barra-linha barra-interativa";
    linha.setAttribute("role", "button");
    linha.setAttribute("tabindex", "0");
    linha.setAttribute("aria-pressed", String((campo === "categoria" ? filtroCategoria : filtroCidade).value === rotulo));
    linha.setAttribute("aria-label", `${indice + 1}º lugar: ${rotulo}, ${moeda.format(valor)}, ${percentual.format(valor / totalVendido)} do total vendido. Ativar para filtrar.`);
    linha.dataset.filtro = campo;
    linha.dataset.valor = rotulo;
    const posicao = document.createElement("span");
    posicao.className = "barra-posicao";
    posicao.setAttribute("aria-hidden", "true");
    posicao.textContent = inteiro.format(indice + 1).padStart(2, "0");
    const etiqueta = document.createElement("span");
    etiqueta.className = "barra-etiqueta";
    etiqueta.textContent = rotulo;
    const fundo = document.createElement("div");
    fundo.className = "barra-fundo";
    fundo.setAttribute("aria-hidden", "true");
    const barra = document.createElement("div");
    barra.className = "barra-valor";
    barra.style.width = `${maior > 0 ? (valor / maior) * 100 : 0}%`;
    barra.style.setProperty("--barra-cor", coresGrafico[Math.min(indice, coresGrafico.length - 1)]);
    fundo.append(barra);
    const detalhes = document.createElement("div");
    detalhes.className = "barra-detalhes";
    const numero = document.createElement("span");
    numero.className = "barra-numero";
    numero.textContent = moeda.format(valor);
    const participacao = document.createElement("span");
    participacao.className = "barra-participacao";
    participacao.textContent = `${percentual.format(valor / totalVendido)} do total`;
    detalhes.append(numero, participacao);
    linha.append(posicao, etiqueta, fundo, detalhes);
    container.append(linha);
  }

  const inicio = document.createElement("span");
  inicio.textContent = moeda.format(0);
  const fim = document.createElement("span");
  fim.textContent = moeda.format(maior);
  escala.append(inicio, document.createTextNode("Escala de valor vendido"), fim);
}

function desenharPareto(grupos, totalVendido) {
  const container = elemento("grafico-produto");
  const resumo = elemento("resumo-produto");
  container.replaceChildren();
  if (!grupos.length || totalVendido === 0) {
    resumo.textContent = "";
    criarLinhaVazia(container, "Sem dados para exibir.", "estado-vazio");
    return;
  }
  let acumulado = 0;
  const lider = grupos[0];
  const parteDoLider = lider[1] / totalVendido;
  resumo.textContent = `${lider[0]} lidera com ${percentual.format(parteDoLider)} do valor vendido. O acumulado soma a participação do ranking; clique para filtrar.`;
  for (const [indice, [produto, valor]] of grupos.entries()) {
    acumulado += valor;
    const linha = document.createElement("div");
    linha.className = "barra-linha barra-interativa";
    linha.setAttribute("role", "button");
    linha.setAttribute("tabindex", "0");
    linha.setAttribute("aria-pressed", String(filtroProduto.value === produto));
    linha.setAttribute("aria-label", `${indice + 1}º produto: ${produto}, ${moeda.format(valor)}, ${percentual.format(valor / totalVendido)} individual, ${percentual.format(acumulado / totalVendido)} acumulado. Ativar para filtrar.`);
    linha.dataset.filtro = "produto";
    linha.dataset.valor = produto;
    const posicao = document.createElement("span");
    posicao.className = "barra-posicao";
    posicao.setAttribute("aria-hidden", "true");
    posicao.textContent = inteiro.format(indice + 1).padStart(2, "0");
    const etiqueta = document.createElement("span");
    etiqueta.className = "barra-etiqueta";
    etiqueta.textContent = produto;
    const fundo = document.createElement("div");
    fundo.className = "barra-fundo";
    fundo.setAttribute("aria-hidden", "true");
    const barra = document.createElement("div");
    barra.className = "barra-valor";
    barra.style.width = `${Math.min(100, (acumulado / totalVendido) * 100)}%`;
    barra.style.setProperty("--barra-cor", coresGrafico[Math.min(indice, coresGrafico.length - 1)]);
    fundo.append(barra);
    const detalhes = document.createElement("div");
    detalhes.className = "barra-detalhes";
    const numero = document.createElement("span");
    numero.className = "barra-numero";
    numero.textContent = moeda.format(valor);
    const participacao = document.createElement("span");
    participacao.className = "barra-participacao";
    participacao.textContent = `${percentual.format(acumulado / totalVendido)} acumulado`;
    detalhes.append(numero, participacao);
    linha.append(posicao, etiqueta, fundo, detalhes);
    container.append(linha);
  }
}

function criarSvg(tag, atributos = {}) {
  const node = document.createElementNS(svgNS, tag);
  for (const [nome, valor] of Object.entries(atributos)) node.setAttribute(nome, String(valor));
  return node;
}

function passoBonito(valor) {
  if (!Number.isFinite(valor) || valor <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(valor));
  const normalizado = valor / magnitude;
  const unidade = normalizado <= 1 ? 1 : normalizado <= 2 ? 2 : normalizado <= 2.5 ? 2.5 : normalizado <= 5 ? 5 : 10;
  return unidade * magnitude;
}

function curvaSvg(pontos) {
  if (!pontos.length) return "";
  let caminho = `M${pontos[0].x},${pontos[0].y}`;
  for (let indice = 1; indice < pontos.length; indice += 1) {
    const anterior = pontos[indice - 1];
    const atual = pontos[indice];
    const umTerco = (atual.x - anterior.x) / 3;
    caminho += ` C${anterior.x + umTerco},${anterior.y} ${atual.x - umTerco},${atual.y} ${atual.x},${atual.y}`;
  }
  return caminho;
}

function desenharTendencia(dadosBase) {
  const container = elemento("grafico-mensal");
  const resumo = elemento("resumo-mensal");
  container.replaceChildren();
  const grupos = agrupar(dadosBase.map((registro) => ({ ...registro, mes: mesDoRegistro(registro) })), "mes");
  const porMes = new Map(grupos);
  const mesesComRegistros = new Set(dadosBase.map(mesDoRegistro));
  const meses = [...mesesComRegistros].sort();
  if (!meses.length) {
    resumo.textContent = "";
    criarLinhaVazia(container, "Sem dados para exibir.", "estado-vazio");
    return;
  }
  const selecionado = filtroMes.value;
  if (selecionado && !mesesComRegistros.has(selecionado)) meses.push(selecionado);
  meses.sort();
  const selecionadoNoGrafico = selecionado && meses.includes(selecionado) ? selecionado : "";
  const maior = Math.max(...meses.map((mes) => porMes.get(mes) || 0), 0);
  const atual = selecionadoNoGrafico || meses[meses.length - 1];
  const semVendasSelecionadas = Boolean(selecionadoNoGrafico && !mesesComRegistros.has(selecionadoNoGrafico));
  const valorAtual = porMes.get(atual) || 0;
  const anotacaoSemVendas = semVendasSelecionadas ? `: sem vendas neste recorte (${moeda.format(0)})` : `: ${moeda.format(valorAtual)}`;
  resumo.textContent = `${rotuloMes(atual)}${anotacaoSemVendas}${selecionadoNoGrafico ? " · mês selecionado" : " · mês mais recente"}. Selecione um ponto para filtrar.`;

  const largura = Math.max(380, meses.length * 128);
  const altura = 248;
  const margem = { cima: 38, direita: 20, baixo: 42, esquerda: 74 };
  const areaLargura = largura - margem.esquerda - margem.direita;
  const areaAltura = altura - margem.cima - margem.baixo;
  const svg = criarSvg("svg", { viewBox: `0 0 ${largura} ${altura}`, role: "group", "aria-label": "Valor vendido por mês; use Tab e Enter para selecionar um mês" });
  const yBase = margem.cima + areaAltura;
  const passo = passoBonito(maior / 4);
  const limiteY = maior > 0 ? Math.ceil(maior / passo) * passo : passo;
  const quantidadeTicks = Math.max(1, Math.round(limiteY / passo));
  for (let indice = 0; indice <= quantidadeTicks; indice += 1) {
    const valorTick = indice * passo;
    const y = yBase - (valorTick / limiteY) * areaAltura;
    svg.append(criarSvg("line", {
      x1: margem.esquerda,
      y1: y,
      x2: largura - margem.direita,
      y2: y,
      class: indice === 0 ? "linha-eixo" : "linha-grade",
    }));
    const rotuloTick = criarSvg("text", {
      x: margem.esquerda - 9,
      y: y + 4,
      class: "rotulo-eixo",
      "text-anchor": "end",
    });
    rotuloTick.textContent = moedaEixo.format(valorTick);
    svg.append(rotuloTick);
  }
  svg.append(criarSvg("line", {
    x1: margem.esquerda,
    y1: margem.cima,
    x2: margem.esquerda,
    y2: yBase,
    class: "linha-eixo-vertical",
  }));
  const pontos = meses.map((mes, indice) => {
    const x = meses.length === 1 ? largura / 2 : margem.esquerda + indice * areaLargura / (meses.length - 1);
    const valor = porMes.get(mes) || 0;
    const y = yBase - (valor / limiteY) * areaAltura;
    return { mes, valor, x, y, semVendas: !mesesComRegistros.has(mes) };
  });
  if (pontos.length > 1) {
    const curva = curvaSvg(pontos);
    const area = criarSvg("path", {
      d: `${curva} L${pontos[pontos.length - 1].x},${yBase} L${pontos[0].x},${yBase} Z`,
      class: "area-tendencia",
    });
    svg.append(area);
    svg.append(criarSvg("path", { d: curva, class: "linha-tendencia" }));
  }
  for (const ponto of pontos) {
    const pontoSelecionado = ponto.mes === selecionado;
    const detalhePonto = ponto.semVendas
      ? `Sem vendas neste recorte; valor vendido ${moeda.format(0)}${pontoSelecionado ? "; mês selecionado" : ""}.`
      : `${moeda.format(ponto.valor)} vendidos${pontoSelecionado ? "; mês selecionado" : ""}.`;
    const grupo = criarSvg("g", {
      class: `ponto-mensal${pontoSelecionado ? " selecionado" : ""}`,
      role: "button",
      tabindex: "0",
      "aria-pressed": String(pontoSelecionado),
      "aria-label": `${rotuloMes(ponto.mes)}: ${detalhePonto} Ativar para filtrar este mês.`,
      "data-mes": ponto.mes,
    });
    const title = criarSvg("title");
    title.textContent = `${rotuloMes(ponto.mes)}: ${detalhePonto}`;
    const hit = criarSvg("circle", { cx: ponto.x, cy: ponto.y, r: 15, class: "ponto-alvo" });
    const marca = criarSvg("circle", { cx: ponto.x, cy: ponto.y, r: ponto.mes === selecionadoNoGrafico ? 7 : 5, class: "ponto-marca" });
    const posicao = pontos.indexOf(ponto);
    const rotulo = criarSvg("text", { x: ponto.x, y: altura - 13, class: "rotulo-mes", "text-anchor": "middle" });
    rotulo.textContent = rotuloMes(ponto.mes, true).replace(" de ", " ");
    grupo.append(title, hit, marca, rotulo);
    const rotuloValor = criarSvg("text", {
      x: posicao === 0 ? ponto.x + 9 : posicao === pontos.length - 1 ? ponto.x - 9 : ponto.x,
      y: Math.max(27, ponto.y - 10),
      class: ponto.semVendas ? "rotulo-valor rotulo-zero" : "rotulo-valor",
      "text-anchor": posicao === 0 ? "start" : posicao === pontos.length - 1 ? "end" : "middle",
      "aria-hidden": "true",
    });
    rotuloValor.textContent = ponto.semVendas ? "0 vendas" : moeda.format(ponto.valor);
    grupo.append(rotuloValor);
    svg.append(grupo);
  }
  container.append(svg);
}

function formatarData(valor) {
  const [ano, mes, dia] = valor.split("-").map(Number);
  return dataPtBr.format(new Date(Date.UTC(ano, mes - 1, dia)));
}

function adicionarCelula(linha, valor, classe = "") {
  const celula = document.createElement("td");
  if (classe) celula.className = classe;
  celula.textContent = valor;
  linha.append(celula);
}

function desenharTabela(dados) {
  const corpo = elemento("corpo-tabela");
  const fragmento = document.createDocumentFragment();
  for (const registro of dados) {
    const linha = document.createElement("tr");
    adicionarCelula(linha, registro.id_venda);
    adicionarCelula(linha, formatarData(registro.data));
    adicionarCelula(linha, registro.cidade);
    adicionarCelula(linha, registro.categoria);
    adicionarCelula(linha, registro.produto);
    adicionarCelula(linha, inteiro.format(registro.quantidade), "numero");
    adicionarCelula(linha, moeda.format(registro.preco_unitario), "numero");
    adicionarCelula(linha, registro.forma_pagamento);
    adicionarCelula(linha, moeda.format(registro.valor_venda), "numero");
    fragmento.append(linha);
  }
  corpo.replaceChildren(fragmento);
  elemento("contagem-tabela").textContent = `${inteiro.format(dados.length)} ${dados.length === 1 ? "registro" : "registros"}`;
}

function atualizarComparacoes(dadosBase) {
  const meses = [...new Set(dadosBase.map(mesDoRegistro))].sort();
  const mesAtual = filtroMes.value || meses.at(-1) || "";
  const [ano, mes] = mesAtual ? mesAtual.split("-").map(Number) : [0, 0];
  const anteriorDate = mesAtual ? new Date(Date.UTC(ano, mes - 2, 1)) : null;
  const mesAnterior = anteriorDate ? `${anteriorDate.getUTCFullYear()}-${String(anteriorDate.getUTCMonth() + 1).padStart(2, "0")}` : "";
  const atual = dadosBase.filter((registro) => mesDoRegistro(registro) === mesAtual);
  const anterior = dadosBase.filter((registro) => mesDoRegistro(registro) === mesAnterior);
  const nomeAnterior = mesAnterior ? rotuloMes(mesAnterior) : "mês anterior";
  const somaAtual = somar(atual);
  const somaAnterior = somar(anterior);
  const ticketAtual = atual.length ? somaAtual / atual.length : 0;
  const ticketAnterior = anterior.length ? somaAnterior / anterior.length : 0;
  const variacao = (valorAtual, valorAnterior, referencia) => {
    if (valorAnterior === 0) return "sem base anterior comparável.";
    const diferenca = (valorAtual - valorAnterior) / valorAnterior;
    const sinal = diferenca > 0 ? "+" : "";
    return `${sinal}${percentual.format(diferenca)} vs. ${referencia}.`;
  };
  const semMesAnterior = !anterior.length;
  const textoTotal = semMesAnterior ? "sem base anterior comparável." : variacao(somaAtual, somaAnterior, moeda.format(somaAnterior));
  const textoVendas = semMesAnterior ? "sem base anterior comparável." : variacao(atual.length, anterior.length, `${inteiro.format(anterior.length)} vendas`);
  const textoTicket = semMesAnterior ? "sem base anterior comparável." : variacao(ticketAtual, ticketAnterior, moeda.format(ticketAnterior));
  elemento("comparacao-total").textContent = `Vs. ${nomeAnterior}: ${textoTotal}`;
  elemento("comparacao-vendas").textContent = `Vs. ${nomeAnterior}: ${textoVendas}`;
  elemento("comparacao-ticket").textContent = `Vs. ${nomeAnterior}: ${textoTicket}`;
}

function atualizar() {
  const dadosBase = registros.filter((registro) =>
    (!filtroCategoria.value || registro.categoria === filtroCategoria.value) &&
    (!filtroCidade.value || registro.cidade === filtroCidade.value) &&
    (!filtroProduto.value || registro.produto === filtroProduto.value)
  );
  const filtrados = dadosBase.filter((registro) => !filtroMes.value || mesDoRegistro(registro) === filtroMes.value);
  const total = somar(filtrados);
  elemento("kpi-total").textContent = moeda.format(total);
  elemento("kpi-vendas").textContent = inteiro.format(filtrados.length);
  elemento("kpi-ticket").textContent = moeda.format(filtrados.length ? total / filtrados.length : 0);
  atualizarComparacoes(dadosBase);
  desenharTendencia(dadosBase);
  desenharGrafico("grafico-categoria", agrupar(filtrados, "categoria"), total);
  desenharGrafico("grafico-cidade", agrupar(filtrados, "cidade"), total);
  desenharPareto(agrupar(filtrados, "produto"), total);
  desenharTabela(filtrados);

  const semResultado = filtrados.length === 0;
  status.textContent = semResultado
    ? "Nenhuma venda encontrada para os filtros escolhidos. Altere ou limpe os filtros."
    : `${inteiro.format(filtrados.length)} ${filtrados.length === 1 ? "venda encontrada" : "vendas encontradas"}.`;
  status.classList.toggle("vazio", semResultado);
  status.classList.toggle("somente-leitor", !semResultado);
}

function mostrarErro(mensagem) {
  status.textContent = mensagem;
  status.classList.add("erro");
  status.classList.remove("somente-leitor");
}

function ativarInteracaoGrafico(evento) {
  const linha = evento.target.closest(".barra-interativa");
  if (linha) filtrarPorCampo(linha.dataset.filtro, linha.dataset.valor);
  const ponto = evento.target.closest(".ponto-mensal");
  if (ponto) {
    filtroMes.value = filtroMes.value === ponto.dataset.mes ? "" : ponto.dataset.mes;
    atualizar();
    filtroMes.focus();
  }
}

async function iniciar() {
  try {
    const resposta = await fetch("data.json");
    if (!resposta.ok) throw new Error(`Não foi possível carregar data.json (HTTP ${resposta.status}).`);
    const pacote = await resposta.json();
    if (!Array.isArray(pacote.registros)) throw new Error("O arquivo de dados tem formato inválido.");
    registros = pacote.registros;
    preencherFiltro(filtroCategoria, [...new Set(registros.map((r) => r.categoria))].sort((a, b) => a.localeCompare(b, "pt-BR")));
    preencherFiltro(filtroCidade, [...new Set(registros.map((r) => r.cidade))].sort((a, b) => a.localeCompare(b, "pt-BR")));
    preencherFiltro(filtroMes, [...new Set(registros.map(mesDoRegistro))].sort(), rotuloMes);
    preencherFiltro(filtroProduto, [...new Set(registros.map((r) => r.produto))].sort((a, b) => a.localeCompare(b, "pt-BR")));
    for (const select of [filtroCategoria, filtroCidade, filtroMes, filtroProduto]) select.addEventListener("change", atualizar);
    for (const container of [elemento("grafico-categoria"), elemento("grafico-cidade"), elemento("grafico-produto"), elemento("grafico-mensal")]) {
      container.addEventListener("click", ativarInteracaoGrafico);
      container.addEventListener("keydown", (evento) => {
        if (evento.key !== "Enter" && evento.key !== " ") return;
        const interativo = evento.target.closest(".barra-interativa, .ponto-mensal");
        if (!interativo) return;
        evento.preventDefault();
        interativo.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
    }
    botaoLimpar.addEventListener("click", () => {
      filtroCategoria.value = "";
      filtroCidade.value = "";
      filtroMes.value = "";
      filtroProduto.value = "";
      atualizar();
      filtroCategoria.focus();
    });
    atualizar();
  } catch (erro) {
    mostrarErro(`Erro ao carregar o painel: ${erro.message} Abra o site por um servidor HTTP local.`);
  }
}

iniciar();

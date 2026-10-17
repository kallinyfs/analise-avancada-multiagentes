/* Integração automatizada em Chromium real; expectativas calculadas do CSV fonte. */
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");

const [url, portText, dataPath, sourcePath] = process.argv.slice(2);
const port = Number(portText);
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const sourceRows = parseCsv(fs.readFileSync(sourcePath, "utf8"));
const errors = [];
const cases = [];
const viewports = [];
let sequence = 0;
const pending = new Map();
let socket;

function parseCsv(text) {
  const matrix = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(field); field = ""; }
    else if (char === "\n") { row.push(field.replace(/\r$/, "")); matrix.push(row); row = []; field = ""; }
    else field += char;
  }
  if (field || row.length) { row.push(field.replace(/\r$/, "")); matrix.push(row); }
  const [headers, ...records] = matrix;
  headers[0] = headers[0].replace(/^\uFEFF/, "");
  return records.filter((record) => record.length === headers.length)
    .map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index]])));
}

function cents(value) {
  const [whole, fraction = ""] = String(value).split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0").slice(0, 2));
}

function money(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value / 100);
}

function integer(value) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value);
}

function percent(value) {
  return new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 }).format(value);
}

function monthLabel(month) {
  const [year, number] = month.split("-").map(Number);
  const label = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(year, number - 1, 1)));
  return label.charAt(0).toLocaleUpperCase("pt-BR") + label.slice(1);
}

function previousMonth(month) {
  const [year, number] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, number - 2, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function selectedRows(filters = {}) {
  return sourceRows.filter((row) =>
    (!filters.categoria || row.categoria === filters.categoria) &&
    (!filters.cidade || row.cidade === filters.cidade) &&
    (!filters.produto || row.produto === filters.produto) &&
    (!filters.mes || row.data.slice(0, 7) === filters.mes)
  );
}

function group(rows, field) {
  const totals = new Map();
  for (const row of rows) totals.set(row[field], (totals.get(row[field]) || 0) + cents(row.valor_venda));
  return [...totals.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"));
}

function groupMonths(rows) {
  const totals = new Map();
  for (const row of rows) {
    const month = row.data.slice(0, 7);
    totals.set(month, (totals.get(month) || 0) + cents(row.valor_venda));
  }
  return [...totals.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function request(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: "127.0.0.1", port, path: endpoint, ...options }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
    });
    req.on("error", reject);
    req.end();
  });
}

function send(method, params = {}) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    socket = new WebSocket(wsUrl);
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id && pending.has(message.id)) {
        const waiter = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) waiter.reject(new Error(JSON.stringify(message.error)));
        else waiter.resolve(message.result);
      } else if (message.method === "Runtime.exceptionThrown") {
        errors.push(message.params.exceptionDetails.text || "JavaScript exception");
      } else if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
        errors.push({ text: message.params.entry.text, url: message.params.entry.url });
      }
    });
  });
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression: `(${expression})()`, returnByValue: true, awaitPromise: true,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function key(keyName) {
  const values = { Tab: [9, "Tab"], ArrowDown: [40, "ArrowDown"], Enter: [13, "Enter"], " ": [32, "Space"] };
  const [windowsVirtualKeyCode, code] = values[keyName];
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: keyName, code, windowsVirtualKeyCode });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: keyName, code, windowsVirtualKeyCode });
}

async function snapshot() {
  return evaluate(`async () => {
    const bars = (id) => [...document.querySelectorAll(id + ' .barra-linha')].map((row) => ({
      label: row.querySelector('.barra-etiqueta')?.textContent || '',
      money: row.querySelector('.barra-numero')?.textContent || '',
      participation: row.querySelector('.barra-participacao')?.textContent || '',
      aria: row.getAttribute('aria-label'), value: row.dataset.valor, filter: row.dataset.filtro,
      pressed: row.getAttribute('aria-pressed'), width: row.querySelector('.barra-valor')?.style.width || ''
    }));
    const points = [...document.querySelectorAll('#grafico-mensal .ponto-mensal')].map((point) => ({
      month: point.dataset.mes, aria: point.getAttribute('aria-label'),
      title: point.querySelector('title')?.textContent || '', pressed: point.getAttribute('aria-pressed'),
      selected: point.classList.contains('selecionado')
    }));
    const select = (id) => document.querySelector(id).value;
    return {
      total: document.querySelector('#kpi-total').textContent,
      count: document.querySelector('#kpi-vendas').textContent,
      ticket: document.querySelector('#kpi-ticket').textContent,
      comparisons: ['total','vendas','ticket'].map((key) => document.querySelector('#comparacao-' + key).textContent),
      status: document.querySelector('#mensagem-status').textContent,
      category: select('#filtro-categoria'), city: select('#filtro-cidade'),
      month: select('#filtro-mes'), product: select('#filtro-produto'),
      options: Object.fromEntries(['categoria','cidade','mes','produto'].map((name) => [name,
        [...document.querySelector('#filtro-' + name).options].map((option) => option.value)])),
      categories: bars('#grafico-categoria'), cities: bars('#grafico-cidade'), pareto: bars('#grafico-produto'),
      points, svg: Boolean(document.querySelector('#grafico-mensal svg')),
      trendSummary: document.querySelector('#resumo-mensal').textContent,
      emptyMarkers: [...document.querySelectorAll('.grafico-vazio,.estado-vazio')].map((node) => node.textContent),
      ids: [...document.querySelectorAll('#corpo-tabela tr')].map((row) => row.cells[0].textContent),
      tableCount: document.querySelectorAll('#corpo-tabela tr').length,
      countLabel: document.querySelector('#contagem-tabela').textContent,
      badNumber: document.body.innerText.match(/NaN|Infinity|undefined/)?.[0] || null
    };
  }`);
}

function expectedComparison(current, previousValue, reference) {
  const currentValue = current.value;
  const change = (currentValue - previousValue) / previousValue;
  const formatted = `${change > 0 ? "+" : ""}${percent(change)} vs. ${reference}.`;
  return formatted;
}

function verifyComparisons(actual, baseRows, selectedMonth, label) {
  const availableMonths = [...new Set(baseRows.map((row) => row.data.slice(0, 7)))].sort();
  const currentMonth = selectedMonth || availableMonths.at(-1) || "";
  const prevMonth = currentMonth ? previousMonth(currentMonth) : "";
  const currentRows = baseRows.filter((row) => row.data.slice(0, 7) === currentMonth);
  const prevRows = baseRows.filter((row) => row.data.slice(0, 7) === prevMonth);
  const totalCents = (rows) => rows.reduce((sum, row) => sum + cents(row.valor_venda), 0);
  const metrics = [
    { value: totalCents(currentRows), previousValue: totalCents(prevRows), reference: money(totalCents(prevRows)) },
    { value: currentRows.length, previousValue: prevRows.length, reference: `${integer(prevRows.length)} vendas` },
    { value: currentRows.length ? totalCents(currentRows) / currentRows.length : 0,
      previousValue: prevRows.length ? totalCents(prevRows) / prevRows.length : 0,
      reference: money(prevRows.length ? totalCents(prevRows) / prevRows.length : 0) },
  ];
  const previousLabel = prevMonth ? monthLabel(prevMonth) : "mês anterior";
  const wanted = metrics.map((metric) => {
    if (!prevRows.length) return `Vs. ${previousLabel}: sem base anterior comparável.`;
    return `Vs. ${previousLabel}: ${expectedComparison(metric, metric.previousValue, metric.reference)}`;
  });
  assert(JSON.stringify(actual) === JSON.stringify(wanted),
    `${label}: comparações mensais ${JSON.stringify(actual)}; esperado ${JSON.stringify(wanted)}`);
}

function verifyState(actual, filters, label) {
  const rows = selectedRows(filters);
  const baseRows = selectedRows({ ...filters, mes: "" });
  const total = rows.reduce((sum, row) => sum + cents(row.valor_venda), 0);
  const ticket = rows.length ? total / rows.length : 0;
  assert(actual.total === money(total), `${label}: total ${actual.total}, esperado ${money(total)}`);
  assert(Number(actual.count.replace(/\D/g, "")) === rows.length,
    `${label}: quantidade ${actual.count}, esperado ${rows.length}`);
  assert(actual.ticket === money(Math.round(ticket)), `${label}: ticket ${actual.ticket}, esperado ${money(Math.round(ticket))}`);

  for (const [field, result] of [["categoria", actual.categories], ["cidade", actual.cities], ["produto", actual.pareto]]) {
    const wanted = group(rows, field);
    assert(result.length === wanted.length, `${label}: quantidade de grupos ${field} divergente`);
    let accumulated = 0;
    result.forEach((item, index) => {
      const [name, amount] = wanted[index];
      assert(item.label === name && item.money === money(amount),
        `${label}: ${field} ${index + 1}: ${JSON.stringify(item)}, esperado ${name} ${money(amount)}`);
      assert(item.value === name && item.filter === field,
        `${label}: affordance ${field} sem filtro semântico esperado`);
      if (field === "produto") {
        accumulated += amount;
        assert(item.participation === `${percent(accumulated / total)} acumulado`,
          `${label}: Pareto acumulado de ${name}: ${item.participation}`);
        assert(item.aria.includes(`${money(amount)}, ${percent(amount / total)} individual, ${percent(accumulated / total)} acumulado`),
          `${label}: nome acessível do Pareto não informa participação individual e acumulada`);
      } else {
        assert(item.participation === `${percent(amount / total)} do total`,
          `${label}: participação de ${field} ${name} incorreta`);
      }
      assert(item.width.endsWith("%") && Number.parseFloat(item.width) >= 0 && Number.parseFloat(item.width) <= 100,
        `${label}: largura inválida em ${field} ${name}: ${item.width}`);
    });
    if (field === "produto" && total > 0) assert(accumulated === total, `${label}: Pareto não totaliza 100%`);
  }

  const expectedIds = rows.map((row) => row.id_venda);
  assert(JSON.stringify(actual.ids) === JSON.stringify(expectedIds), `${label}: tabela/ordem não corresponde ao CSV filtrado`);
  assert(actual.tableCount === rows.length, `${label}: tabela exibe ${actual.tableCount}, esperado ${rows.length}`);
  assert(Number(actual.countLabel.replace(/\D/g, "")) === rows.length, `${label}: contador da tabela divergente`);
  assert(!actual.badNumber, `${label}: número inválido visível (${actual.badNumber})`);
  assert(actual.status.includes(rows.length ? `${integer(rows.length)} ${rows.length === 1 ? "venda encontrada" : "vendas encontradas"}`
    : "Nenhuma venda encontrada"), `${label}: mensagem de status incorreta: ${actual.status}`);

  const monthTotals = new Map(groupMonths(baseRows));
  const observedMonths = [...new Set(baseRows.map((row) => row.data.slice(0, 7)))].sort();
  // Um mês selecionado sem vendas ainda deve aparecer como ponto zero quando há histórico
  // para as dimensões escolhidas; sem histórico dimensional, mantém-se o estado vazio.
  const months = [...observedMonths];
  if (baseRows.length && filters.mes && !monthTotals.has(filters.mes)) {
    months.push(filters.mes);
    months.sort();
    monthTotals.set(filters.mes, 0);
  }
  assert(actual.svg === (months.length > 0), `${label}: presença do SVG mensal divergente`);
  assert(actual.points.length === months.length, `${label}: pontos mensais ${actual.points.length}, esperado ${months.length}`);
  actual.points.forEach((point, index) => {
    const month = months[index];
    const amount = monthTotals.get(month);
    assert(point.month === month, `${label}: ordem de meses no SVG incorreta`);
    assert(point.title.includes(monthLabel(month)) && point.title.includes(money(amount)),
      `${label}: tooltip do ponto ${month} não informa mês/valor; atual=${JSON.stringify(point.title)}, esperado mês=${JSON.stringify(monthLabel(month))} valor=${JSON.stringify(money(amount))}`);
    assert(point.aria.includes(monthLabel(month)) && point.aria.includes(money(amount)),
      `${label}: nome acessível do ponto ${month} não informa mês/valor`);
    assert(point.pressed === String(filters.mes === month), `${label}: estado aria-pressed do ponto ${month} incorreto`);
    assert(point.selected === (filters.mes === month), `${label}: classe de seleção visual do ponto ${month} incorreta`);
  });
  if (months.length) {
    const highlighted = filters.mes && months.includes(filters.mes) ? filters.mes : observedMonths.at(-1);
    const amount = monthTotals.get(highlighted);
    if (filters.mes && baseRows.length && !observedMonths.includes(filters.mes)) {
      assert(actual.trendSummary.includes(monthLabel(filters.mes)) && actual.trendSummary.includes(money(0)),
        `${label}: resumo não identifica o mês selecionado sem vendas: ${actual.trendSummary}`);
      assert(!/Fevereiro de 2026[^.]*mês mais recente/i.test(actual.trendSummary),
        `${label}: resumo apresenta fevereiro como mês mais recente apesar de março selecionado: ${actual.trendSummary}`);
    } else {
      const suffix = filters.mes && months.includes(filters.mes) ? " · mês selecionado" : " · mês mais recente";
      assert(actual.trendSummary === `${monthLabel(highlighted)}: ${money(amount)}${suffix}. Selecione um ponto para filtrar.`,
        `${label}: resumo da tendência mensal incompatível: ${actual.trendSummary}`);
    }
  } else {
    assert(actual.emptyMarkers.some((text) => text.includes("Sem dados para exibir.")), `${label}: SVG sem estado vazio`);
  }

  if (!rows.length) {
    const expectedEmptyMarkers = baseRows.length ? 3 : 4;
    assert(actual.emptyMarkers.length === expectedEmptyMarkers,
      `${label}: esperados ${expectedEmptyMarkers} estados vazios nos gráficos: ${actual.emptyMarkers.length}`);
    assert(actual.categories.length === 0 && actual.cities.length === 0 && actual.pareto.length === 0,
      `${label}: gráficos de ranking não estão vazios`);
  }
  verifyComparisons(actual.comparisons, baseRows, filters.mes, label);
  return rows.length;
}

async function setFilter(id, value) {
  await evaluate(`async () => { const control=document.getElementById(${JSON.stringify(id)}); control.value=${JSON.stringify(value)}; control.dispatchEvent(new Event('change',{bubbles:true})); }`);
}

async function setFilters(filters = {}) {
  for (const [name, id] of [["categoria", "filtro-categoria"], ["cidade", "filtro-cidade"],
    ["mes", "filtro-mes"], ["produto", "filtro-produto"]]) {
    await setFilter(id, filters[name] || "");
  }
}

async function clickSelector(selector, index = 0) {
  const point = await evaluate(`async () => {
    const node=document.querySelectorAll(${JSON.stringify(selector)})[${index}];
    if(!node) throw new Error('Alvo de clique ausente: '+${JSON.stringify(selector)}+' #'+${index});
    node.scrollIntoView({block:'center',inline:'center'});
    const hit=node.matches('.ponto-mensal') ? node.querySelector('.ponto-alvo') : node;
    const r=hit.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};
  }`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1 });
}

async function focusAndKey(selector, index, keyName) {
  await evaluate(`async () => { const node=document.querySelectorAll(${JSON.stringify(selector)})[${index}]; if(!node) throw new Error('Alvo de teclado ausente'); node.focus(); }`);
  await key(keyName);
}

async function clearWithButton() {
  await clickSelector("#limpar-filtros");
}

async function main() {
  assert(sourceRows.length === 180, `CSV fonte deveria conter 180 vendas, contém ${sourceRows.length}`);
  assert(data.registros.length === sourceRows.length, "JSON e CSV têm números diferentes de registros");
  for (let i = 0; i < sourceRows.length; i += 1) {
    assert(sourceRows[i].id_venda === data.registros[i].id_venda, `ordem/id do JSON diverge da fonte na linha ${i + 1}`);
    assert(cents(sourceRows[i].valor_venda) === cents(data.registros[i].valor_venda), `valor preparado diverge do CSV: ${sourceRows[i].id_venda}`);
  }
  assert(sourceRows.every((row) => row.data >= "2026-01-01" && row.data <= "2026-03-31"), "CSV fora do período Jan–Mar/2026");

  const version = await request("/json/version");
  assert(version.status === 200, "Não foi possível consultar Chromium DevTools");
  const target = await request("/json/new?about:blank", { method: "PUT" });
  await connect(target.body.webSocketDebuggerUrl);
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Page.enable");
  await send("Page.navigate", { url });
  await evaluate(`async () => {const start=Date.now(); while(Date.now()-start<10000){if(document.querySelector('#kpi-total')?.textContent!=='—' && document.querySelector('#mensagem-status')?.textContent!=='Carregando os dados…') return true; await new Promise(r=>setTimeout(r,50));} throw new Error('Dashboard não concluiu carregamento')}`);

  let state = await snapshot();
  const tableRowsInitial = verifyState(state, {}, "inicial");
  assert(tableRowsInitial === 180, "Tabela inicial deve manter as 180 linhas integrais");
  assert(state.options.mes.includes("2026-01") && state.options.mes.includes("2026-02") && state.options.mes.includes("2026-03"),
    "Filtro mensal não disponibiliza Jan–Mar/2026");
  cases.push("initial-integrity", "cards-charts-table", "comparisons", "pareto", "trend-svg");

  // Drill-down via mouse em categoria, produto Pareto e ponto mensal.
  await clickSelector("#grafico-categoria .barra-interativa", 0);
  state = await snapshot();
  verifyState(state, { categoria: state.category }, "drill-down categoria mouse");
  assert(state.category, "Clique em categoria não selecionou valor");
  await setFilters();
  await clickSelector("#grafico-produto .barra-interativa", 0);
  state = await snapshot();
  verifyState(state, { produto: state.product }, "drill-down Pareto mouse");
  assert(state.product, "Clique no Pareto não selecionou produto");
  await setFilters();
  await clickSelector("#grafico-mensal .ponto-mensal", 1);
  state = await snapshot();
  verifyState(state, { mes: state.points[1].month }, "drill-down mês mouse");
  assert(state.month === state.points[1].month, "Clique no ponto SVG não selecionou o mês");
  cases.push("drilldown-mouse", "monthly-selection");

  // Filtros isolados, cada um confrontado com CSV independente.
  const sample = sourceRows[0];
  for (const [id, filters, value, label] of [
    ["filtro-categoria", { categoria: sample.categoria }, sample.categoria, "categoria isolada"],
    ["filtro-cidade", { cidade: sample.cidade }, sample.cidade, "cidade isolada"],
    ["filtro-mes", { mes: sample.data.slice(0, 7) }, sample.data.slice(0, 7), "mês isolado"],
    ["filtro-produto", { produto: sample.produto }, sample.produto, "produto isolado"],
  ]) {
    await setFilters();
    await setFilter(id, value);
    state = await snapshot();
    verifyState(state, filters, label);
  }
  cases.push("isolated-filters");

  // Combinação real de quatro filtros, escolhida de uma mesma linha-fonte.
  await setFilters({ categoria: sample.categoria, cidade: sample.cidade,
    mes: sample.data.slice(0, 7), produto: sample.produto });
  state = await snapshot();
  verifyState(state, { categoria: sample.categoria, cidade: sample.cidade,
    mes: sample.data.slice(0, 7), produto: sample.produto }, "quatro filtros combinados");
  cases.push("combined-filters");

  // Regressão R4-R5: o CSV tem histórico de Santos + Caneta em Jan/Fev, mas zero em Mar.
  // A seleção de março deve continuar representada como ponto selecionado de valor zero,
  // sem trocar o resumo para fevereiro como “mês mais recente”.
  const emptyMonthFilters = { cidade: "Santos", produto: "Caneta", mes: "2026-03" };
  const january = selectedRows({ cidade: "Santos", produto: "Caneta", mes: "2026-01" });
  const february = selectedRows({ cidade: "Santos", produto: "Caneta", mes: "2026-02" });
  const march = selectedRows(emptyMonthFilters);
  const sumCents = (rows) => rows.reduce((sum, row) => sum + cents(row.valor_venda), 0);
  assert(january.length === 3 && sumCents(january) === 3_850, "Oráculo CSV: Santos + Caneta em janeiro deve ser 3 vendas/R$ 38,50");
  assert(february.length === 8 && sumCents(february) === 9_100, "Oráculo CSV: Santos + Caneta em fevereiro deve ser 8 vendas/R$ 91,00");
  assert(march.length === 0 && sumCents(march) === 0, "Oráculo CSV: Santos + Caneta em março deve estar vazio");
  await setFilters(emptyMonthFilters);
  state = await snapshot();
  assert(state.city === "Santos" && state.product === "Caneta" && state.month === "2026-03" && !state.category,
    `Controles não mantêm a seleção exata Santos/Caneta/Março: ${JSON.stringify({ city: state.city, product: state.product, month: state.month, category: state.category })}`);
  verifyComparisons(state.comparisons, selectedRows({ cidade: "Santos", produto: "Caneta" }),
    "2026-03", "Santos + Caneta + março sem vendas");
  verifyState(state, emptyMonthFilters, "Santos + Caneta + março sem vendas");
  const marchPoint = state.points.find((point) => point.month === "2026-03");
  assert(marchPoint, `SVG não contém março selecionado; meses presentes: ${state.points.map((point) => point.month).join(", ")}`);
  assert(marchPoint.pressed === "true" && marchPoint.selected,
    `Ponto de março não apresenta estado selecionado: ${JSON.stringify(marchPoint)}`);
  assert(marchPoint.title.includes("Março de 2026") && marchPoint.title.includes(money(0)),
    `Tooltip SVG de março não informa o valor zero: ${marchPoint.title}`);
  assert(marchPoint.aria.includes("Março de 2026") && marchPoint.aria.includes(money(0)) &&
    !/Fevereiro de 2026.*mês mais recente/i.test(marchPoint.aria),
    `Nome acessível de março está ausente ou usa mês obsoleto: ${marchPoint.aria}`);
  assert(!/Fevereiro de 2026[^.]*mês mais recente/i.test(state.trendSummary),
    `Resumo ainda chama fevereiro de mais recente: ${state.trendSummary}`);
  cases.push("selected-empty-month-after-dimension-filters");

  // Vazio genuíno: combinação de cidade/categoria/produto ausente no CSV (sem adulterar registros).
  const categories = [...new Set(sourceRows.map((row) => row.categoria))];
  const cities = [...new Set(sourceRows.map((row) => row.cidade))];
  const products = [...new Set(sourceRows.map((row) => row.produto))];
  let missing;
  outer: for (const cidade of cities) for (const categoria of categories) for (const produto of products) {
    if (!sourceRows.some((row) => row.cidade === cidade && row.categoria === categoria && row.produto === produto)) {
      missing = { cidade, categoria, produto }; break outer;
    }
  }
  assert(missing, "A base não oferece combinação vazia real para testar");
  await setFilters(missing);
  state = await snapshot();
  verifyState(state, missing, "combinação vazia real");
  cases.push("real-empty");

  // Botão real de limpar restaura controles, 180 linhas e foco previsível.
  await clearWithButton();
  state = await snapshot();
  verifyState(state, {}, "limpar filtros");
  const clearFocus = await evaluate("async () => ({id:document.activeElement.id,visible:document.activeElement.matches(':focus-visible')})");
  assert(clearFocus.id === "filtro-categoria", `Limpar não devolveu foco ao primeiro filtro: ${clearFocus.id}`);
  cases.push("clear");

  // Teclado: foco sequencial mantém links, limpar e os quatro filtros alcançáveis; selects nativos operáveis.
  await evaluate("async () => {document.body.tabIndex=-1;document.body.focus()}");
  const expectedTabOrder = ["https://github.com/kallinyfs", "https://www.linkedin.com/in/kalliny-santos-704b8a34a/?isSelfProfile=true",
    "limpar-filtros", "filtro-categoria", "filtro-cidade", "filtro-mes", "filtro-produto"];
  for (const expected of expectedTabOrder) {
    await key("Tab");
    const focus = await evaluate("async () => ({id:document.activeElement.id,href:document.activeElement.href,visible:document.activeElement.matches(':focus-visible')})");
    assert((focus.id || focus.href) === expected, `Ordem de Tab: esperado ${expected}, recebeu ${focus.id || focus.href}`);
    assert(focus.visible, `Foco visível ausente em ${expected}`);
  }
  await evaluate("async () => document.querySelector('#filtro-categoria').focus()");
  await key("ArrowDown");
  await key("Enter");
  state = await snapshot();
  assert(state.category, "Seta/Enter não selecionaram uma categoria nativa");
  verifyState(state, { categoria: state.category }, "categoria por teclado");

  await setFilters();
  await focusAndKey("#grafico-produto .barra-interativa", 0, "Enter");
  state = await snapshot();
  assert(state.product, "Enter não ativou drill-down de produto");
  verifyState(state, { produto: state.product }, "produto por teclado Enter");
  await setFilters();
  await focusAndKey("#grafico-mensal .ponto-mensal", 0, " ");
  state = await snapshot();
  assert(state.month === state.points[0].month, "Espaço não ativou drill-down do ponto mensal");
  verifyState(state, { mes: state.month }, "mês por teclado Espaço");
  cases.push("keyboard-filters", "drilldown-keyboard");

  // Hover real de uma barra e estilos responsivos em ambos os viewports exigidos.
  await setFilters();
  await send("Emulation.setEmulatedMedia", { features: [{ name: "hover", value: "hover" }] });
  const hoverPoint = await evaluate("async () => {const row=document.querySelector('#grafico-categoria .barra-interativa');row.scrollIntoView({block:'center'});const r=row.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}} ");
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: hoverPoint.x, y: hoverPoint.y });
  const hover = await evaluate("async () => {await new Promise(resolve=>setTimeout(resolve,250));const row=document.querySelector('#grafico-categoria .barra-interativa');return {active:row.matches(':hover'),background:getComputedStyle(row).backgroundColor,transform:getComputedStyle(row).transform}}");
  assert(hover.active && hover.background === "rgb(234, 245, 250)", `Hover de gráfico não destacou linha: ${JSON.stringify(hover)}`);

  for (const viewport of [{ width: 390, height: 844, name: "mobile" }, { width: 1440, height: 900, name: "desktop" }]) {
    await send("Emulation.setDeviceMetricsOverride", {
      width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: viewport.width < 600,
    });
    const layout = await evaluate(`async () => ({
      width:innerWidth,docWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,
      cards:getComputedStyle(document.querySelector('.cartoes')).gridTemplateColumns.split(' ').length,
      filters:getComputedStyle(document.querySelector('.campos-filtro')).gridTemplateColumns.split(' ').length,
      charts:getComputedStyle(document.querySelector('.grade-graficos')).gridTemplateColumns.split(' ').length,
      selectWidth:document.querySelector('#filtro-categoria').getBoundingClientRect().width,
      tableFocusable:document.querySelector('.envoltorio-tabela').tabIndex,
      svgWidth:document.querySelector('#grafico-mensal svg').getBoundingClientRect().width
    })`);
    assert(layout.docWidth <= viewport.width && layout.bodyWidth <= viewport.width,
      `${viewport.name}: overflow horizontal da página (${layout.docWidth}/${viewport.width})`);
    assert(layout.selectWidth <= viewport.width, `${viewport.name}: filtro excede viewport`);
    assert(layout.cards === (viewport.name === "mobile" ? 1 : 3), `${viewport.name}: colunas dos cards ${layout.cards}`);
    assert(layout.filters === (viewport.name === "mobile" ? 1 : 2), `${viewport.name}: colunas dos filtros ${layout.filters}`);
    assert(layout.charts === (viewport.name === "mobile" ? 1 : 2), `${viewport.name}: colunas dos gráficos ${layout.charts}`);
    assert(layout.tableFocusable === 0, `${viewport.name}: tabela não alcançável por teclado`);
    assert(layout.svgWidth > 0 && layout.svgWidth <= viewport.width, `${viewport.name}: SVG mensal sem tamanho válido`);
    viewports.push({ ...viewport, ...layout });
  }
  cases.push("hover", "responsive");

  assert(errors.length === 0, `Erros JavaScript/console no Chromium: ${JSON.stringify(errors)}`);
  const evidence = {
    result: "PASS", url, source: path.basename(sourcePath), sourceRows: sourceRows.length,
    dataRows: data.registros.length, tableRowsInitial, cases, viewports, chartHover: hover,
    emptyCombination: missing, monthlyTotalsCents: Object.fromEntries(groupMonths(sourceRows)),
    runtimeErrors: errors,
  };
  fs.writeFileSync(path.join(__dirname, "browser-evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`);
  console.log("BROWSER_TEST_RESULT=PASS");
  console.log(JSON.stringify(evidence));
  socket.close();
}

main().catch((error) => {
  const evidence = {
    result: "FAIL", url, source: sourcePath ? path.basename(sourcePath) : null,
    sourceRows: sourceRows.length, cases, viewports, runtimeErrors: errors, failure: error.stack || String(error),
  };
  fs.writeFileSync(path.join(__dirname, "browser-evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(error.stack || error);
  if (socket && socket.readyState === WebSocket.OPEN) socket.close();
  process.exitCode = 1;
});

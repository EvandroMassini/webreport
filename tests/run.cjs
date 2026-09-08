/** Criado pela IA: regressões funcionais com dados fictícios, sem sistema PHP. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.WEBREPORT_PLAYWRIGHT_MODULE || 'playwright');
const { createServer } = require('../tools/serve.cjs');

(async function () {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  const results = [];
  const output = path.resolve(__dirname, '../test-results');
  fs.mkdirSync(output, { recursive: true });
  try {
    browser = await chromium.launch({ headless: true, args: ['--no-proxy-server'], ...(process.env.WEBREPORT_BROWSER ? { executablePath: process.env.WEBREPORT_BROWSER } : {}) });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    if (process.env.WEBREPORT_DEBUG) {
      page.on('request', r => console.log('REQUEST', r.url()));
      page.on('response', r => console.log('RESPONSE', r.status(), r.url()));
      page.on('console', msg => console.log('BROWSER', msg.type(), msg.text()));
    }
    const base = `http://127.0.0.1:${server.address().port}`;
    // Exemplos são autossuficientes. Não fazem requisições a serviços externos.
    await page.route('**/*', route => {
      const url = route.request().url();
      return url.startsWith(base + '/') ? route.continue() : route.abort();
    });
    assert.equal((await fetch(base + '/examples/01-vendas.html')).status, 200);
    page.on('requestfailed', req => { if (req.url().startsWith(base)) console.error('REQUEST FAILED', req.url(), req.failure()); });
    const check = (name, condition, details) => {
      assert.ok(condition, `${name}: ${JSON.stringify(details)}`);
      results.push({ name, passed: true, details });
      console.log('OK', name, JSON.stringify(details || ''));
    };
    await page.goto(base + '/examples/01-vendas.html');
    await page.click('#open');
    await page.click('.example-parameters button[type=submit]');
    await page.waitForFunction(() => document.getElementById('status').textContent.startsWith('Relatório gerado'));
    const sales = await page.evaluate(() => {
      materializeAllReportPages(getReportPages());
      return { pages: getReportPages().length,
        rows: document.querySelectorAll('#wr_container_body [id="Registro"]').length,
        total: document.querySelector('#wr_container_body [id="Total"]')?.textContent,
        values: Array.from(document.querySelectorAll('#wr_container_body [id="Valor"]'), e => e.textContent),
        mean: document.querySelector('#wr_container_body [id="Media"]')?.textContent,
        subtotals: Array.from(document.querySelectorAll('#wr_container_body [id="SubtotalValor"]'), e => e.textContent),
        checks: WebReport.runRegressionChecks() };
    });
    check('48 registros e múltiplas páginas', sales.rows === 48 && sales.pages > 1, sales);
    const numeric = s => Number(s.trim().replace(/\./g, '').replace(',', '.'));
    const source = await page.evaluate(() => ExampleReports.sales()[0].Data);
    const total = source.reduce((s, r) => s + r.valor, 0);
    check('Fórmula de cada linha usa o registro atual', sales.values.every((v, i) => numeric(v) === source[i].valor), sales.values);
    check('Soma geral', Math.abs(numeric(sales.total) - total) < .01, sales.total);
    check('Média acumulada', Math.abs(numeric(sales.mean) - total / 48) < .01, sales.mean);
    check('Sem sobreposição detectada', sales.checks.passed, sales.checks);
    await page.screenshot({ path: path.join(output, 'vendas.png') });

    const security = await page.evaluate(() => {
      const config = WebReport.configure(JSON.parse('{"__proto__":{"polluted":true},"constructor":{"prototype":{"polluted":true}}}'));
      const clean = sanitizeReportHtml('<style>body{display:none}</style><img src=x onerror="alert(1)"><a href="java&#10;script:alert(1)">x</a>');
      let invalid = false;
      try { evaluateReportFormula('2 % 3', {}); } catch { invalid = true; }
      return { polluted: ({}).polluted || config.polluted || false, clean, invalid,
        formula: evaluateReportFormula('round(quantidade * preco, 2)', { quantidade: 3, preco: 2.55 }),
        legacy: WebReport.defaults.security.legacyServerPrompts };
    });
    check('Configuração e HTML defensivos', !security.polluted && !/onerror|href=|<style/.test(security.clean) && security.legacy === false, security);
    check('Fórmulas válidas e rejeição de operador desconhecido', security.invalid && security.formula === 7.65, security);
    const csvEscapes = await page.evaluate(() => ({
      quoted: escapeCsvCell('a;"b"\nc', ';', true),
      formula: escapeCsvCell('\n=1+1', ';', true)
    }));
    check('CSV escapa aspas/quebras e protege fórmula após espaço', csvEscapes.quoted === '"a;""b""\nc"' && csvEscapes.formula.startsWith('"\''), csvEscapes);
    const downloadEvent = page.waitForEvent('download');
    await page.evaluate(() => WebReport.exportCsv({ fileName: 'teste-vendas' }));
    const download = await downloadEvent;
    const csv = fs.readFileSync(await download.path(), 'utf8');
    check('CSV com os 48 registros', csv.split('\r\n').length === 49 && csv.includes('Produto demonstrativo 48'), download.suggestedFilename());
    await page.evaluate(() => WebReport.close());
    check('Fechamento libera o visualizador', await page.locator('#wr_report_backdrop').count() === 0);

    // Os formulários precisam permitir desistência, validação e filtro efetivo.
    await page.click('#open');
    await page.screenshot({ path: path.join(output, 'parametros-periodo.png') });
    await page.click('.example-parameters button[type=button]');
    check('Cancelar não gera relatório', await page.locator('#wr_report_backdrop').count() === 0 && await page.locator('dialog').count() === 0);
    await page.click('#open');
    await page.keyboard.press('Escape');
    check('Escape fecha parâmetros', await page.locator('dialog').count() === 0 && await page.locator('#wr_report_backdrop').count() === 0);
    await page.click('#open');
    await page.locator('[name="<DATA INICIAL>"]').fill('2026-09-15');
    await page.locator('[name="<DATA FINAL>"]').fill('2026-09-01');
    await page.click('.example-parameters button[type=submit]');
    check('Período invertido rejeitado', (await page.locator('dialog [role=alert]').textContent()).includes('anterior'));
    await page.locator('[name="<DATA INICIAL>"]').fill('2026-09-01');
    await page.locator('[name="<DATA FINAL>"]').fill('2026-09-05');
    await page.locator('[name="setores"]').selectOption(['Administração']);
    await page.locator('[name="<[Informe um texto qualquer:]>"]').fill('Texto de teste & conferência');
    await page.click('.example-parameters button[type=submit]');
    await page.waitForFunction(() => document.getElementById('status').textContent.startsWith('Relatório gerado'));
    const filtered = await page.evaluate(() => ({ rows: document.querySelectorAll('#wr_container_body [id="Registro"]').length, text: document.getElementById('wr_container_body').textContent }));
    check('Período e seleção filtram dados, texto aparece no cabeçalho', filtered.rows === 5 && filtered.text.includes('Texto de teste & conferência') && !filtered.text.includes('Operações'), filtered.rows);
    await page.evaluate(() => WebReport.close());
    await page.click('#open');
    await page.locator('[name="<DATA INICIAL>"]').fill('2030-01-01');
    await page.locator('[name="<DATA FINAL>"]').fill('2030-01-02');
    await page.click('.example-parameters button[type=submit]');
    check('Filtro sem dados informa o usuário', (await page.locator('#status').textContent()).includes('Nenhum registro') && await page.locator('#wr_report_backdrop').count() === 0);

    await page.goto(base + '/examples/02-documentos.html');
    await page.click('#open');
    await page.locator('[name="<DATA>"]').fill('2026-09-12');
    await page.locator('[name="<[Informe um texto qualquer:]>"]').fill('Observação <b>literal</b>');
    await page.locator('[name="<<ORGANIZACAO>>"]').fill('Organização de Teste');
    await page.locator('[name="responsavel"]').selectOption('Equipe B');
    await page.click('.example-parameters button[type=submit]');
    await page.waitForFunction(() => document.getElementById('status').textContent.startsWith('Relatório gerado'));
    const docs = await page.evaluate(() => {
      const pages = getReportPages(); materializeAllReportPages(pages);
      return pages.map(p => ({ width: p.offsetWidth, height: p.offsetHeight, report: p.dataset.reportIndex, text: p.textContent }));
    });
    check('Orientação por relatório', docs.filter(p => p.report === '0').every(p => p.height > p.width) && docs.filter(p => p.report === '1').every(p => p.width > p.height) && docs.some(p => p.report === '1'), docs.map(({ text, ...rest }) => rest));
    const portrait = docs.filter(p => p.report === '0');
    check('Data, texto, constante e seleção no relatório', portrait[0].text.includes('2026-09-12') && portrait[0].text.includes('Observação <b>literal</b>') && portrait[0].text.includes('Organização de Teste') && portrait[0].text.includes('Equipe B'));
    const find = marker => portrait.findIndex(p => p.text.includes(marker));
    check('Textos completos e quebra após impressão', find('FIM DOCUMENTO A') >= 0 && find('FIM DOCUMENTO B') > find('FIM DOCUMENTO A') && find('FIM DOCUMENTO C') > find('FIM DOCUMENTO B'), portrait.map(p => p.text.slice(-100)));
    const occurrences = portrait.map(p => p.text).join('').split('Este texto demonstra').length - 1;
    check('Nenhum parágrafo perdido na divisão', occurrences === 99, occurrences);
    await page.screenshot({ path: path.join(output, 'documentos.png') });
    for (const scope of ['all', 'page', 'report']) {
      const printed = await page.evaluate(scope => {
        window.print = () => {};
        CurrentPageNumber = getReportPages().length - 1;
        WebReport.print(scope);
        const selected = document.querySelectorAll('.wr-print-included').length;
        return { selected, total: getReportPages().length, rules: document.getElementById('wr_dynamic_print_pages')?.textContent };
      }, scope);
      check('Escopo de impressão: ' + scope, printed.selected === (scope === 'all' ? printed.total : 1), printed);
      await page.emulateMedia({ media: 'print' });
      const visible = await page.locator('.wr_page:visible').count();
      check('CSS de impressão: ' + scope, visible === printed.selected, visible);
      await page.emulateMedia({ media: 'screen' });
      await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    }
    const multiDetail = await page.evaluate(async () => {
      const obj = (n, t, p) => ({ n, t, properties: Object.entries(p).map(([t, v]) => ({ t: Number(t), v: String(v) })) });
      const report = { Name: 'Regressão de múltiplas bands', Structure: [
        obj('MultiPagina', 0, { 43: 0 }),
        obj('MultiA', 1, { 33: 'MultiPagina', 7: 3, 20: 28 }),
        obj('MultiCampo', 7, { 33: 'MultiA', 10: 'valor', 31: 300, 20: 24 }),
        obj('MultiB', 1, { 33: 'MultiPagina', 7: 3, 20: 28 }),
        obj('MultiLegenda', 5, { 33: 'MultiB', 9: 'Segunda band do registro', 31: 300, 20: 24 }),
        obj('MultiResumo', 1, { 33: 'MultiPagina', 7: 4, 20: 28 }),
        obj('MultiSoma', 17, { 33: 'MultiResumo', 10: 'valor', 39: 9, 31: 100, 20: 24 }),
        obj('MultiMedia', 17, { 33: 'MultiResumo', 10: 'valor', 39: 0, 22: 150, 31: 100, 20: 24 })
      ], Data: [{ valor: 10 }, { valor: 30 }] };
      await WebReport.open([report]);
      return { sum: document.querySelector('#wr_container_body [id="MultiSoma"]').textContent.trim(), mean: document.querySelector('#wr_container_body [id="MultiMedia"]').textContent.trim() };
    });
    check('Múltiplas Detail não duplicam acumuladores', multiDetail.sum === '40' && multiDetail.mean === '20', multiDetail);
    // Verifica também a abertura sem servidor, prometida no README.
    await page.unroute('**/*');
    await page.route('**/*', route => route.request().url().startsWith('file:') ? route.continue() : route.abort());
    const { pathToFileURL } = require('node:url');
    await page.goto(pathToFileURL(path.resolve(__dirname, '../examples/01-vendas.html')).href);
    await page.click('#open');
    await page.click('.example-parameters button[type=submit]');
    await page.waitForFunction(() => document.getElementById('status').textContent.startsWith('Relatório gerado'));
    check('Exemplo executável sem servidor', await page.locator('#wr_container_body [id="Registro"]').count() === 48);
    check('Sem exceções JavaScript', errors.length === 0, errors);
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ results, browser: browser.version() }, null, 2));
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

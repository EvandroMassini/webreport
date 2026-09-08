/*! WebReport — Copyright (c) 2026 Evandro / GWBM. SPDX-License-Identifier: MIT. Veja LICENSE. */
/**
 * Aplica dimensões físicas da página conforme formato, orientação e margens.
 */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function applyReportPageMetrics(element, report, orientation) {
    const config = getEffectiveReportConfig(report);
    const page = config.page || {};
    const format = (page.formats || {})[page.format] || { width: 210, height: 297 };
    const landscape = orientation == null ? String(page.orientation).toLowerCase() === 'landscape' : Number(orientation) === 1;
    const width = landscape ? format.height : format.width;
    const height = landscape ? format.width : format.height;
    const margins = Object.assign({ top: 10, right: 10, bottom: 10, left: 10 }, page.margins || {});
    element.style.setProperty('width', width + 'mm', 'important');
    element.style.setProperty('height', height + 'mm', 'important');
    element.style.setProperty('min-height', height + 'mm', 'important');
    element.style.setProperty('max-height', height + 'mm', 'important');
    element.style.padding = margins.top + 'mm ' + margins.right + 'mm ' + margins.bottom + 'mm ' + margins.left + 'mm';
    element.style.boxSizing = 'border-box';
}

/** Avalia fórmulas aritméticas sem executar JavaScript arbitrário. */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function evaluateReportFormula(expression, row) {
    const input = String(expression || '');
    const tokenPattern = /\d+(?:\.\d+)?|[A-Za-z_][A-Za-z0-9_]*|[()+\-*/,]/g;
    // IA: não descarta caracteres desconhecidos que mudariam o valor da fórmula.
    if (input.replace(tokenPattern, '').trim()) throw new Error('Caractere inválido na fórmula.');
    const tokens = input.match(tokenPattern) || [];
    const values = Object.create(null);
    Object.keys(row || {}).forEach(key => { values[key.toLowerCase()] = Number(row[key]) || 0; });
    let position = 0;
    const peek = () => tokens[position];
    const take = () => tokens[position++];
    const primary = () => {
        const token = take();
        if (token === '(') { const value = addition(); if (take() !== ')') throw new Error('Parêntese não fechado.'); return value; }
        if (token === '+' || token === '-') return (token === '-' ? -1 : 1) * primary();
        if (/^\d/.test(token || '')) return Number(token);
        if (/^[A-Za-z_]/.test(token || '')) {
            const name = token.toLowerCase();
            if (peek() !== '(') return values[name] || 0;
            take();
            const args = [];
            if (peek() !== ')') { do { args.push(addition()); } while (peek() === ',' && take()); }
            if (take() !== ')') throw new Error('Função inválida.');
            const functions = {
                abs: args => Math.abs(args[0] || 0),
                min: args => Math.min(...args),
                max: args => Math.max(...args),
                round: args => { const precision = Number(args[1]) || 0; const factor = Math.pow(10, precision); return Math.round((args[0] || 0) * factor) / factor; }
            };
            if (!functions[name]) throw new Error('Função não permitida: ' + name);
            return functions[name](args);
        }
        throw new Error('Token inválido na fórmula.');
    };
    const multiplication = () => { let value = primary(); while (peek() === '*' || peek() === '/') { const operator = take(); const operand = primary(); value = operator === '*' ? value * operand : value / operand; } return value; };
    const addition = () => { let value = multiplication(); while (peek() === '+' || peek() === '-') { const operator = take(); const operand = multiplication(); value = operator === '+' ? value + operand : value - operand; } return value; };
    const result = addition();
    if (position !== tokens.length || !Number.isFinite(result)) throw new Error('Fórmula inválida.');
    return result;
}

/**
 * Origem: função alterada pela IA; base autoral do WebReport: Evandro / GWBM.
 * Derivada de CreateReport original. Monta templates pela Structure, reserva rodapés, percorre Data e cede o controle em lotes. O DOM precisa estar conectado para medir textos e paginar.
 */
function* CreateReportGenerator(Reports, index, returnReports=false) {

    //reiniciar relatorio
    Structure=Reports[index].Structure;
    Rows=Reports[index].Data;
    CurrentRecord=0;
    CurrentPageTemp=0;
    endOfReport=false;
    if (tPage!=undefined)tPage.remove();
    if (Elements!=undefined)Elements.remove();


    Elements = document.createElement('div');
    Elements.setAttribute('id', 'wr_Elements');
    Elements.style.display = 'none';
    document.body.append(Elements);

    tPage = document.createElement('div');
    tPage.style.overflow = 'hidden'
    tPage.style.backgroundColor = 'white';
    applyReportPageMetrics(tPage, Reports[index]);

    //estilos que so devem ser usados se for para exibição
    if (returnReports==false){
        tPage.style.margin = '0 auto 32px';
    }

    tPage.setAttribute('id', 'tPage');
    tPage.className = 'wr_page';
    Elements.append(tPage);

    let h3 = new Date();

    for (let i = 0; i < Structure.length; i++) {
        let e;
        if (Structure[i].t == 0) {
            e = tPage;
        } else {
            e = document.createElement('div');
        }

        e.setAttribute('type', Structure[i].t);
        e.setAttribute('id', Structure[i].n);
        if ([5,6,7,14,17].indexOf(Structure[i].t)!=-1){
            //Elementos de texto
            e.style.minHeight=WRminLineHeight+'px';
        }
        if ([8, 9, 10, 11].indexOf(Structure[i].t)!=-1){
            e.style.wordBreak='break-word'; //Memos e RichText -> break-all, break-word
            e.style.overflow='hidden';
            e.style.minHeight=WRminLineHeight+'px';
            e.className='WR_LongText ';
        }
        for (let i2 = 0; i2 < (Structure[i].properties?.length ?? 0); i2++) {
            if ([0, 1, 2, 3, 4].includes(Structure[i].t)) {
                e.style.position = 'relative';
            } else {
                e.style.position = 'absolute';                
            }
            switch (parseInt(Structure[i].properties[i2].t)) {
                case 1: //Alignment
                    switch (parseInt(Structure[i].properties[i2].v)) {
                        case 0: //left
                            e.style.textAlign = 'left';
                            break;
                        case 1: //center
                            e.style.textAlign = 'center';
                            break;
                        case 2: //right
                            e.style.textAlign = 'right';
                            break;
                        case 3: //justify
                            e.style.textAlign = 'justify';
                            break;
                    }
                    break;
                case 2: //AnchorsBotton
                    break;
                case 3: //AnchorsLeft
                    break;
                case 4: //AnchorsRight
                    break;
                case 5: //AnchorsTop
                    break;
                case 6: //AutoSize
                    e.style.height = 'auto';
                    e.style.width = 'auto';
                    break;
                case 7: //BandType
                    /*
                    0=Title
                    1=Head
                    2=ColumnHead
                    3=Detail
                    4=Sumary
                    5=ColumnFooter
                    6=Footer
                    */
                    e.setAttribute('bandtype', Structure[i].properties[i2].v);
                    break;
                case 8: //MarginBottom
                    e.style.marginBottom = Structure[i].properties[i2].v + 'px';
                    break;
                case 9: //Caption
                    e.setAttribute('text', Structure[i].properties[i2].v);
                    break;
                case 10: //DataField
                    e.setAttribute('datafield', Structure[i].properties[i2].v);
                    //se for 'group', entao ja definir o valor corrente
                    if (parseInt(Structure[i].t) == 3 && Rows.length > 0) {
                        e.setAttribute('currentvalue', Rows[0][e.getAttribute('datafield').toLocaleLowerCase()]);
                    }
                    break;
                case 11: //BorderBottom
                    e.style.borderBottom = Structure[i].properties[i2].v + 'px solid black';
                    break;
                case 12: //BorderLeft
                    e.style.borderLeft = Structure[i].properties[i2].v + 'px solid black';
                    break;
                case 13: //BorderRight
                    e.style.borderRight = Structure[i].properties[i2].v + 'px solid black';
                    break;
                case 14: //BorderTop
                    e.style.borderTop = Structure[i].properties[i2].v + 'px solid black';
                    break;
                case 15: //FontBold
                    if (Structure[i].properties[i2].v == 1) e.style.fontWeight = 'bold';
                    break;
                case 16: //FontItalic
                    if (Structure[i].properties[i2].v == 1) e.style.fontStyle = 'italic';
                    break;
                case 17: //FontName
                    e.style.fontFamily = Structure[i].properties[i2].v;
                    break;
                case 18: //FontSize
                    e.style.fontSize = Structure[i].properties[i2].v + 'pt';
                    break;
                case 19: //FontUnderline
                    if (Structure[i].properties[i2].v == 1) e.style.textDecoration = 'underline';
                    break;
                case 20: //Height
                    if (Structure[i].properties[i2].v == 'auto') {
                        e.style.height = 'auto';
                    } else {
                        //Alguns elementos (Group) não deve ter o hieght definido
                        if ([2, 3, 4].indexOf(Structure[i].t) == -1) e.style.height = Structure[i].properties[i2].v + 'px';
                    }
                    break;
                case 21: //IntegralHeight
                    break;
                case 22: //Left
                    e.style.left = Structure[i].properties[i2].v + 'px';
                    break;
                case 23: //MarginLeft
                    e.style.marginLeft = Structure[i].properties[i2].v + 'px';
                    break;
                case 24: //AlternateColor
                    e.setAttribute('alternatecolor', Structure[i].properties[i2].v);
                    break;
                case 25: //PageBreaking
                    e.setAttribute('pagebreaking', Structure[i].properties[i2].v);                    
                    break;
                case 26: //MarginRight
                    e.style.marginRight = Structure[i].properties[i2].v + 'px';
                    break;
                case 27: //Text
                    e.setAttribute('text', Structure[i].properties[i2].v);
                    break;
                case 28: //Top
                    e.style.top = Structure[i].properties[i2].v + 'px';
                    break;
                case 29: //MarginTop
                    e.style.marginTop = Structure[i].properties[i2].v + 'px';
                    break;
                case 30: //Visible
                    if (Structure[i].properties[i2].v == 0) {
                        e.style.display = 'none';
                    } else {
                        e.style.display = 'initial';
                    }
                    break;
                case 31: //Width                    
                    if (Structure[i].properties[i2].v == 'auto') {
                        e.style.width = 'auto';
                    } else {
                        e.style.width = Structure[i].properties[i2].v + 'px';
                    }
                    break;
                case 32: //DisplayMask
                    e.setAttribute('mask', Structure[i].properties[i2].v);
                    break;
                case 33: //Parent
                    e.setAttribute('parent', Structure[i].properties[i2].v);
                    break;
                case 34: //Align
                    switch (parseInt(Structure[i].properties[i2].v)) {
                        case 0: //topo
                            e.style.verticalAlign = 'top';
                            break;
                        case 1: //center
                            e.style.verticalAlign = 'center';
                            break;
                        case 2: //bottom
                            e.style.verticalAlign = 'bottom';
                            break;
                    }
                    break;
                case 35: //SQL
                    break;
                case 36: //Angle
                    e.style.transform = 'rotate(' + Structure[i].properties[i2].v + 'deg)';
                    break;
                case 37: //Lines
                    setReportHtml(e, Structure[i].properties[i2].v);
                    break;
                case 38: //Picture
                    break;
                case 39: //Info
                    e.setAttribute('info', Structure[i].properties[i2].v);
                    if (e.getAttribute('type') == '14') {
                        e.setAttribute('recno', '1');
                    }
                    break;
                case 40: //BarcodeType
                    break;
                case 41: //ColCount
                    break;
                case 42: //MasterFields
                    break;
                case 43: //Orientation
                    if (Structure[i].properties[i2].v == 0) {
                        //prPortrait
                        e.style.setProperty('width', '21cm', 'important');
                        e.style.setProperty('height', '29.7cm', 'important');
                        e.style.setProperty('max-height', '29.7cm', 'important');
                        e.style.setProperty('min-height', '29.7cm', 'important');
                        e.style.marginLeft = 'auto';
                    } else if (Structure[i].properties[i2].v == 1) {
                        e.style.width = '29.7cm'; //padrao para A4 -> 29.7 -2 de margem
                        e.style.height = '21cm'; //padrao para A4 -> 21 -2 de margem
                        e.style.maxHeight = '21cm'; //padrao para A4 -> 21 -2 de margem ->fundamental para Fifefox
                        e.style.minHeight = '21cm'; //padrao para A4 -> 21 -2 de margem ->fundamental para Fifefox
                        e.style.marginLeft = 'auto';
                    }
                    break;
                case 44: //Backgroud
                    e.style.setProperty('background-color', '#' + Structure[i].properties[i2].v, 'important');
                    break;
                case 45: //FontColor
                    e.style.color = Structure[i].properties[i2].v;
                    break;
                case 46: //ShowText
                    break;
                case 47: //DrawKind
                    break;
                case 48: //Organization
                    break;
                case 49: //Currency
                    e.setAttribute('currency', 1);
                    break;
                case 50: //LoadFromFile
                    break;
                case 51: //LoadFromField
                    break;
                case 52: //DataFormula
                    e.setAttribute('dataformula', Structure[i].properties[i2].v);
                    break;
                case 53: //HoldStyle
                    break;
                case 54: //Holder
                    break;
                case 55: //CarbonCopies
                    break;
                case 56: //NextReport
                    break;
                case 57: //LinkedFields
                    break;
                case 58: //ShowProgress
                    break;
                case 59: //LoadFromFile
                    break;
                case 60: // isHTML
                    e.setAttribute('isHTML', Structure[i].properties[i2].v);
                    break;
                case 61: // HolderHeight
                    e.setAttribute('HolderHeight', Structure[i].properties[i2].v);
                    break;
                case 62: // line height
                    var lh=Structure[i].properties[i2].v;
                    lh=lh.replaceAll(' !important',''); //nao é permitido
                    e.style.lineHeight=lh;
                    break;
            }
        }

        if ([8, 9, 10, 11].includes(Structure[i].t) && e.getAttribute('isHTML') != '1') {
            e.classList.add('WR_PlainText');
        }
        if ([1, 2, 3, 4].includes(Structure[i].t)) {
            e.setAttribute('data-wr-declared-height', e.style.height || '');
        }

        //elementos de exibição de dados 
        if (e.getAttribute('type')>=5){
            e.style.boxSizing='border-box';
            e.style.padding='1px';
        }

        //Criar a estrutura base (template) de elementos
        if (Structure[i].t == 0) {
            //pagina -> Não precisa fazer mais nada, já foi inserida no template
            //     Elements.append(e);
        } else if ([1, 2, 3, 4].indexOf(Structure[i].t) !== -1) {
            //Objetos ancora
            Elements.append(e);
        } else {
            //outros objetos
            e.className = e.className + 'datafield';
            e.style.overflow = 'hidden';
            try {
                getReportElementById(Elements, e.getAttribute('parent')).append(e);
            } catch (error) {
                console.log('---------------------------------------------------------------------------------------------------------');
                console.log("Objeto sem um \"Parent\" definido!");
                console.log(e);
                console.log('---------------------------------------------------------------------------------------------------------');
                console.log("");
            }
        }

    }

    //verificar "preserveheight", espaço destinado a summarys, footers e colfooters, de objetos pai
    for (let i = 0; i < Elements.childNodes.length; i++) {
        let ne = Elements.childNodes[i];
        //type=1 -> band, bandtype [4,5,6] -> summary, columnfooter, footer        
        if (ne.getAttribute('type') == '1' && ['4', '5', '6'].indexOf(ne.getAttribute('bandtype')) !== -1) {            
            ne = Elements.childNodes[i].cloneNode(true);            
            document.body.append(ne);
            //achar o parent do elemento (ne)
            let pa = ne.getAttribute('parent');
            //se não existe parent, entao este é a propria pagina
            if (pa == undefined)pa = Elements.childNodes[0].getAttribute('id'); //-> element 0 sempre sera a pagina
            let ph = 0;
            if (FindItem(pa, Elements)!=undefined){
                ph = parseFloat(FindItem(pa, Elements).getAttribute('preserveheight')) || 0;
            }else{
                pa = Elements.childNodes[0].getAttribute('id'); //-> element 0 sempre sera a pagina
            }
            if (ph == undefined) ph = 0;
            Populate(ne);
            if (ne.getAttribute('bandtype')==4){
                //sumarry só na ultima, então não precisa preservar, desde que ancorado na página
                if (pa.indexOf('RLReport')==-1)ph = ph + ne.offsetHeight;
            } else {
                // ColumnFooter e Footer ocupam espaço em todas as páginas.
                ph = ph + ne.offsetHeight;
            }

            FindItem(pa, Elements).setAttribute('preserveheight', ph); //atualizar o hieght a ser preservado
            ne.remove();
        }
    }

    NewPage('wr_container_body');

    let h4 = new Date();
    if (typeof WRtimings !== 'undefined') {
        WRtimings.structureMs += Math.max(0, h4.getTime() - h3.getTime());
    }
    if (typeof recordReportTiming === 'function') {
        recordReportTiming(index, 'structureMs', h4.getTime() - h3.getTime(), Reports[index], Rows.length);
    }
    let h5 = new Date();

    //procurar eventuais "bands" (1) que não seja do tipo "detail" (3) e que contenham RichText ou Memo
    var dvs=document.getElementById('wr_container_body').querySelectorAll(".WR_LongText");
    
    //havendo "textos longos", remover temporariamente eventuis groups, adicionando-os em seguida
    if (dvs.length>0){
        var gTemp=CurrentPage.querySelectorAll("div[type='3'][data-wr-group-mode='dynamic']");
        for(let i=0;i<gTemp.length;i++){
            gTemp[i].style.display='none';
        }
    }else{
        var gTemp=[];
    }

    for(var di=0;di<dvs.length;di++){
        if (dvs[di].parentNode.getAttribute('bandtype')!=3){
            checkLongText(dvs[di],false); // muito importante o parametro "false", para evitar que o group seja fechado e adicionado erroneamente eventuais sumarys
            //checkLongText(dvs[di]);
        }
    }

    // //devolver eventuais groups para a última pagina
    for(let i=0;i<gTemp.length;i++){
        gTemp[i].style.display='';
        CurrentPage.append(gTemp[i]);
    }

    //adicionar todos os registros (Bands Detail)
    for (let i = 0; i < Rows.length; i++) {
        CurrentRecord = i;
        GetDetails();
    }        

    //fechar algum eventual ultimo group
    for (let i = CurrentPage.childNodes.length - 1; i >= 0; i--) {
        if (CurrentPage.childNodes[i].getAttribute('type') == '3') {
            CloseElement(CurrentPage.childNodes[i]);
            i = -1;
        }
    }
    //fechar a pagina
    endOfReport=true;
    CloseElement(CurrentPage);

    //informacoes de paginas
    let pgs;
    let s;
    pgs = document.querySelectorAll('.wr_lastpage');
    for (let i = 0; i < pgs.length; i++) {
        s = pgs[i].getAttribute('text');
        s = s.replace('#', CurrentPageTemp);
        pgs[i].innerText = s;
        pgs[i].classList.remove('wr_lastpage');//evitar retrabalho
    }

    pgs = document.querySelectorAll('.wr_pagepreview');
    for (let i = 0; i < pgs.length; i++) {
        s = pgs[i].getAttribute('text');
        //primeiro #
        s = s.replace('#', pgs[i].getAttribute('currentpage'));
        //segundo #
        s = s.replace('#', CurrentPageTemp); //currentpagenumber aqui já sera a ultima pagina
        pgs[i].innerText = s;
        pgs[i].classList.remove('wr_pagepreview');//evitar retrabalho
    }

    //remover mensagem
    if (document.getElementById('wr_message')!=undefined)document.getElementById('wr_message').remove();

    //disparar funcao de achao de botoes -> gwbm.js -> nao funciona pq o container do relatorio foi inserido com prepend e nao como append

    // Acumula a fase de dados de cada relatório encadeado.
    let h6 = new Date();
    if (typeof WRtimings !== 'undefined') {
        WRtimings.dataMs += Math.max(0, h6.getTime() - h5.getTime());
    }
    if (typeof recordReportTiming === 'function') {
        recordReportTiming(index, 'dataMs', h6.getTime() - h5.getTime(), Reports[index], Rows.length);
    }

    //resetar funcoes
    if (index>=Reports.length-1){
        document.getElementById('wr_Elements').remove();
        document.getElementById('wr_Params').remove();        
    
        document.getElementsByTagName('body')[0].style.cursor = 'initial';
        const formatter = typeof formatReportDuration === 'function'
            ? formatReportDuration
            : function (value) { return (Math.max(0, Number(value) || 0) / 1000).toFixed(2) + ' s'; };
        const th1 = formatter(typeof WRtimings !== 'undefined' ? WRtimings.requestMs : h2 - h1);
        const th2 = formatter(typeof WRtimings !== 'undefined' ? WRtimings.structureMs : h4 - h3);
        const th3 = formatter(typeof WRtimings !== 'undefined' ? WRtimings.dataMs : h6 - h5);
        const th4 = formatter(typeof WRtimings !== 'undefined' ? h6.getTime() - WRtimings.totalStartedAt : h6 - h1);
        const footer = document.getElementById('wr_container_footer');
        if (footer) {
            const pageCount = document.getElementById('wr_container_body').children.length;
            footer.innerHTML = '<span class="wr-status-dot" aria-hidden="true"></span>'
                + '<button type="button" class="wr-performance-summary" title="Exibir detalhes de desempenho">'
                + pageCount + ' páginas · '
                + 'requisição ' + th1 + ' · estrutura ' + th2 + ' · dados ' + th3 + ' · total ' + th4 + '</button>';
        }
        totalRows=0;
    }

    if (returnReports==true){
        let ret=document.getElementById('wr_container_body').innerHTML;
        if (index>=Reports.length-1)document.getElementById('wr_container_body').remove();
        return ret;
    }
}


/** Registra no console informações técnicas somente quando solicitado. */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function LogCreateReportDiagnostics(Reports, index) {
    if (typeof console === 'undefined' || typeof console.info !== 'function') return;
    const report = Reports?.[index] ?? {};
    const validation = typeof validateReportDefinition === 'function'
        ? validateReportDefinition(report)
        : { errors: [], warnings: [] };
    const timing = typeof WRtimings !== 'undefined' ? WRtimings.reports?.[index] : undefined;
    console.info('[WebReport] Diagnóstico', {
        reportIndex: index,
        reportName: report.name || report.Name || report.ReportName || 'Relatório ' + (index + 1),
        rows: Array.isArray(report.Data) ? report.Data.length : 0,
        validation: validation,
        timing: timing
    });
    validation.warnings.forEach(message => console.warn('[WebReport] ' + message));
    validation.errors.forEach(message => console.error('[WebReport] ' + message));
}

/**
 * Executa a geração síncrona. O quarto parâmetro habilita diagnóstico no
 * console e permanece falso por padrão para preservar chamadas existentes.
 */
/**
 * Origem: função alterada pela IA; base autoral do WebReport: Evandro / GWBM.
 * Executa o gerador até a conclusão; mantém a assinatura síncrona usada nas integrações anteriores.
 */
function CreateReport(Reports, index, returnReports=false, showDiagnostics=false) {
    const iterator = CreateReportGenerator(Reports, index, returnReports);
    let step;
    do { step = iterator.next(); } while (!step.done);
    if (showDiagnostics === true) LogCreateReportDiagnostics(Reports, index);
    return step.value;
}

/** Executa a geração em lotes; o último parâmetro controla o log técnico. */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 * Avança o gerador entre frames, reporta progresso e verifica cancelamento entre lotes. A medição de um texto individual ainda é síncrona.
 */
async function CreateReportAsync(Reports, index, returnReports=false, onProgress, signal, showDiagnostics=false) {
    const iterator = CreateReportGenerator(Reports, index, returnReports);
    let step = iterator.next();
    while (!step.done) {
        if (signal?.aborted) throw new DOMException('Geração cancelada.', 'AbortError');
        if (typeof onProgress === 'function') onProgress(step.value);
        await new Promise(resolve => requestAnimationFrame(resolve));
        step = iterator.next();
    }
    if (showDiagnostics === true) LogCreateReportDiagnostics(Reports, index);
    return step.value;
}

function GetRealTop(Element) {
    var t = Element.offsetTop;
    var et = Element.parentNode;
    if (et ==null || et == undefined) return t;
    //pega a posição TOP do elemento com relação à pagina
    while (et.getAttribute('type') != '0') {
        t = t + et.offsetTop;
        et = et.parentNode;
    }
    return t;
}

/** Retorna o group recém-aberto que ainda não possui outro detail. */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function getFirstDetailGroupToMove(element) {
    var candidate;
    var group = element?.parentElement;
    while (group && Number(group.getAttribute?.('type')) === 3) {
        var hasPreviousDetail = Array.from(group.querySelectorAll("div[type='1']")).some(function (band) {
            var bandType = band.getAttribute('bandtype');
            return band !== element && (bandType == null || bandType === '3');
        });
        if (hasPreviousDetail) break;
        candidate = group;
        group = group.parentElement;
    }
    return candidate;
}

/**
 * Origem: função alterada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function CheckHeight(Element) {
    if (Element.querySelectorAll('.WR_LongText').length > 0) return;

    const elementBottom = Element.getBoundingClientRect().bottom;
    if (elementBottom <= getPageContentBottom(CurrentPage) - getReservedPageHeight(Element) + 0.5) return;

    var movableElement = getFirstDetailGroupToMove(Element) || Element;
    CloseElement(CurrentPage);
    NewPage('wr_container_body');

    var parentId = movableElement.getAttribute('parent');
    var target = !parentId || parentId === CurrentPage.id
        ? CurrentPage
        : getReportElementById(CurrentPage, parentId);

    if (!target && parentId) target = createGroupInstance(parentId);
    if (!target) {
        console.error('Não foi possível reposicionar o elemento na nova página:', Element.id, parentId);
        return;
    }

    target.append(movableElement);
    if (Number(target.getAttribute('type')) === 3 && target.getAttribute('datafield')) {
        var dataField = target.getAttribute('datafield').toLowerCase();
        target.setAttribute('currentvalue', Rows[CurrentRecord]?.[dataField] ?? '');
    }
}

/**
 * Origem: função alterada pela IA; base autoral do WebReport: Evandro / GWBM.
 * Insere totalizadores e rodapés ancorados no contêiner; evita duplicatas e move a band excedente para outra página. Summary da página aguarda endOfReport.
 */
function CloseElement(Element) {
    
    //funcao que adiciona eventuais footers e summarys no "Element", seja pagina, seja group
    for (let i = 1; i < Elements.childNodes.length; i++) {
        //somente bands do tipo summary e footers
        if (Elements.childNodes[i].getAttribute('type') == '1' && ['4', '5', '6'].indexOf(Elements.childNodes[i].getAttribute('bandtype')) !== -1) {
            
            let pa = Elements.childNodes[i].getAttribute('parent');
            if (pa == undefined) pa = CurrentPage.getAttribute('id');

            //ver alguma exceções, por exemplo, sumary na pagina somente se for apos o ultimo registro            
            if ((Elements.childNodes[i].getAttribute('bandtype') == '4') && (pa == CurrentPage.getAttribute('id')) && (CurrentRecord < Rows.length - 1)) {
                pa = '';
            }
            //resolver o problema de registro unico -> se for primeiro e unico registro e for Sumary ancorado na pagina (final)
            if ((Elements.childNodes[i].getAttribute('bandtype') == '4') && (pa == CurrentPage.getAttribute('id')) && endOfReport==false) {
                pa = '';
            }
            //evitar duplicidade
            var name='#'+Elements.childNodes[i].id;
            if (Element.querySelector(name)!==undefined && Element.querySelector(name)!==null){
                pa = '';
            }

            if (pa == Element.getAttribute('id')) {                
                let ne = Elements.childNodes[i].cloneNode(true);
                Populate(ne);
                Element.append(ne);
                SetHeight(ne);

                // Totais e rodapés também precisam respeitar o limite da página.
                // Quando não houver espaço, a própria band é ancorada na página
                // seguinte, mantendo a ordem correta dos totalizadores.
                if (ne.getBoundingClientRect().bottom > getPageContentBottom(CurrentPage) + 0.5) {
                    ne.remove();
                    NewPage('wr_container_body', endOfReport);
                    ancoreElement(ne);
                    SetHeight(ne.parentNode);
                }
                ResetCount(ne); //ressetar o elemento para os proximos registros

                //procurar eventuais bands que contenham RichText ou Memo
                var dvs=ne.querySelectorAll(".WR_LongText");
                for(var di=0;di<dvs.length;di++){
                    checkLongText(dvs[di], false); //o segundo atributo (closePage = false) é pra evitar recusrividade / loop infinito

                    //remover a classe para evitar retrabalho (multiplos relatorios)
                    //dvs[di].classList.remove("WR_LongText");
                }

            }

        }
    }
}

/**
 * Informa se um group participa do fluxo de registros.
 * Groups sem uma band Detail descendente são contêineres estáticos válidos
 * (por exemplo, capas e formulários preenchidos por um único registro).
 */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function groupTemplateContainsDetail(groupId, visited = new Set()) {
    if (!groupId || visited.has(groupId)) return false;
    visited.add(groupId);

    for (let i = 0; i < Elements.childNodes.length; i++) {
        const child = Elements.childNodes[i];
        if (child.getAttribute('parent') !== groupId) continue;

        if (child.getAttribute('type') === '1') {
            const bandType = child.getAttribute('bandtype');
            if (bandType === null || bandType === '3') return true;
        }
        if (child.getAttribute('type') === '3'
            && groupTemplateContainsDetail(child.id, visited)) {
            return true;
        }
    }
    return false;
}

/**
 * Origem: função alterada pela IA; base autoral do WebReport: Evandro / GWBM.
 * Reconstrói elementos estáticos da página ou group. Details são inseridos separadamente por GetDetails; cabeçalhos de group só existem quando o group é criado.
 */
function GetElements(Element,clearPage=false) {

    //eventuais descartes. por exemplo, se o "Element" é um Group ou Page, então Details (registros) não devem ser inseridos.
    //Serão durante inseridos nese caso na rotida que varre o array Rows

    //rotina que localiza todos os objetos da lista onde o parent seja o 'Element'
    var ElementName = Element.getAttribute('id');
    for (let i = 0; i < Elements.childNodes.length; i++) {
        //descartar pagina (type=0)
        if (Elements.childNodes[i].getAttribute('type') != '0') { //paginas nunca sao inseridas novamente!

            let ne = Elements.childNodes[i];

            if (ne.getAttribute('type') === '3') {
                const isChild = ne.getAttribute('parent') === ElementName;
                const isStatic = !groupTemplateContainsDetail(ne.id);

                // Groups ligados a details continuam sob demanda. Um group
                // estático, entretanto, deve existir mesmo sem band Detail.
                if (isChild && isStatic && CurrentPageTemp === 1 && !clearPage) {
                    const staticGroup = ne.cloneNode(true);
                    staticGroup.dataset.wrGroupMode = 'static';
                    GetElements(staticGroup, clearPage);
                    Element.append(staticGroup);
                    Populate(staticGroup);
                    SetHeight(staticGroup);
                }
                continue;
            }

            //ver algumas eventuis situações onde o objeto não deve ser inserido
            //Bands do tipo titulo e direto na página somente na primeira pagina
            if (CurrentPageTemp > 1 && ne.getAttribute('type') == '1' && ([null, undefined].indexOf(ne.getAttribute('parent')) !== -1) && ne.getAttribute('bandtype') == '0') ne = undefined;

            //Bands do tipo detail, footer e summary não devem ser inseridos neste momento, mas seu height deve ser preservado
            if (ne && ne.getAttribute('type') == '1' && [null, undefined, '3', '4', '5', '6'].indexOf(ne.getAttribute('bandtype')) !== -1) ne = undefined;

            if (ne !== undefined) {
                if (ne.getAttribute('parent') == ElementName) {
                    if (clearPage==false){
                        //elelentos normais
                        let ne = Elements.childNodes[i].cloneNode(true);                    
                        GetElements(ne); //recursividade                
                        Element.append(ne);
                        Populate(ne);    
                    }else{                        
                        //paginas vazias, neste caso, somente Header, pq sumary causa recursividade
                        if (Elements.childNodes[i].getAttribute("bandtype")==1){                            
                            let ne = Elements.childNodes[i].cloneNode(true);                    
                            GetElements(ne); //recursividade                
                            Element.append(ne);
                            Populate(ne);    
                        }
                    }
                }
            }
        }
    }
}

/**
 * Origem: função alterada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function checkPageLimit(){
    //funcao que verifica se o ultimo elemento da pagina esta ultrapassando os seus limites
    var lastObj=CurrentPage.childNodes[CurrentPage.childNodes.length-1];
    if (lastObj && lastObj.getBoundingClientRect().bottom > getPageContentBottom(CurrentPage) - getReservedPageHeight(lastObj) + 0.5){
        CloseElement(CurrentPage);
        NewPage('wr_container_body');
        var temp=FindItem(lastObj.getAttribute('id'),CurrentPage);
        if (temp!==undefined)temp.remove();
        CurrentPage.append(lastObj);
    }    
}

/**
 * Cria uma instância de group somente quando um detail realmente precisa dela.
 * Os headers filhos são adicionados nesse momento e nas continuações do group.
 */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function createGroupInstance(groupId) {
    var template = getReportElementById(Elements, groupId);
    if (!template || Number(template.getAttribute('type')) !== 3) return undefined;

    var parentId = template.getAttribute('parent');
    var target = !parentId || parentId === CurrentPage.id
        ? CurrentPage
        : getReportElementById(CurrentPage, parentId);

    if (!target && parentId) {
        var parentTemplate = getReportElementById(Elements, parentId);
        if (parentTemplate && Number(parentTemplate.getAttribute('type')) === 3) {
            target = createGroupInstance(parentId);
        }
    }
    if (!target) return undefined;

    var group = template.cloneNode(true);
    group.dataset.wrGroupMode = groupTemplateContainsDetail(groupId) ? 'dynamic' : 'static';
    var dataField = group.getAttribute('datafield');
    if (dataField) {
        group.setAttribute('currentvalue', Rows[CurrentRecord]?.[dataField.toLowerCase()] ?? '');
    }
    target.append(group);
    GetElements(group);
    Populate(group);
    return group;
}

/** Normaliza a propriedade PageBreaking: -1=nenhuma, 0=antes, 1=depois. */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function getPageBreakingMode(element) {
    if (!element?.hasAttribute?.('pagebreaking')) return -1;
    var mode = Number(element.getAttribute('pagebreaking'));
    return mode === 0 || mode === 1 ? mode : -1;
}

/** Informa se a página já contém uma band Detail efetivamente impressa. */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function currentPageContainsDetail() {
    if (!CurrentPage?.querySelector) return false;
    return CurrentPage.querySelector("div[type='1'][bandtype='3'], div[type='1']:not([bandtype])") !== null;
}

/** Informa se outra band Detail ainda será impressa após a band corrente. */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function hasPendingDetailOutput(templateIndex) {
    for (let index = templateIndex + 1; index < Elements.childNodes.length; index++) {
        var candidate = Elements.childNodes[index];
        if (candidate.getAttribute?.('type') === '1'
            && [null, undefined, '3'].includes(candidate.getAttribute('bandtype'))) {
            return true;
        }
    }
    return CurrentRecord < Rows.length - 1;
}

/** Fecha groups, rodapés e a página corrente antes de uma quebra explícita. */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function createExplicitPageBreak() {
    if (!CurrentPage) return;

    // Groups internos devem ser fechados primeiro para que seus footers sejam
    // impressos na página que está terminando, sem duplicar os da página.
    var groups = Array.from(CurrentPage.querySelectorAll("div[type='3']")).reverse();
    for (const group of groups) {
        if (group.isConnected && group.closest('.wr_page') === CurrentPage) CloseElement(group);
    }

    CloseElement(CurrentPage);
    NewPage('wr_container_body');
}

/** Insere as bands detail e controla a abertura e continuidade dos groups. */
/**
 * Origem: função alterada pela IA; base autoral do WebReport: Evandro / GWBM.
 * Para cada registro, clona as bands Detail, abre groups sob demanda, preenche valores e resolve overflow. PageBreaking só é aplicado às bands Detail; pbAfterPrint aguarda a divisão completa do texto.
 */
function GetDetails() {
    // IA: várias bands podem representar o mesmo registro; acumuladores contam uma vez.
    const computedElements = new Set();
    for (let i = 0; i < Elements.childNodes.length; i++) {
        var templateDetail = Elements.childNodes[i];
        if (templateDetail.getAttribute('type') !== '1'
            || ![null, undefined, '3'].includes(templateDetail.getAttribute('bandtype'))) {
            continue;
        }

        let detail = templateDetail.cloneNode(true);
        var pageBreakingMode = getPageBreakingMode(detail);

        // Não cria uma página vazia quando a band já está no início da página.
        // Isso também evita uma segunda quebra quando pbAfterPrint acabou de
        // abrir a página destinada ao próximo registro.
        if (pageBreakingMode === 0 && currentPageContainsDetail()) {
            createExplicitPageBreak();
        }

        var parentId = detail.getAttribute('parent');
        var parent;

        if (!parentId || parentId === CurrentPage.id) {
            parent = CurrentPage;
        } else {
            parent = getReportElementById(CurrentPage, parentId);
            if (!parent) parent = createGroupInstance(parentId);
        }

        if (!parent) {
            console.error('Parent não encontrado para o detail:', detail.id, parentId);
            continue;
        }

        if (Number(parent.getAttribute('type')) === 3) {
            var dataField = parent.getAttribute('datafield');
            var rowValue = dataField ? Rows[CurrentRecord]?.[dataField.toLowerCase()] : undefined;
            var groupChanged = dataField
                && String(parent.getAttribute('currentvalue') ?? '') !== String(rowValue ?? '');

            if (groupChanged) {
                CloseElement(parent);
                parent = createGroupInstance(parentId);
                ResetCount(detail);
                detail = templateDetail.cloneNode(true);
            }
        }

        Compute(computedElements);
        // IA: clona os valores calculados do registro atual, não do anterior.
        // Compute atualiza atributos/texto nos templates, inclusive DataFormula.
        detail = templateDetail.cloneNode(true);
        parent.append(detail);
        Populate(detail);

        // A população pode medir a band enquanto alguns campos ainda possuem
        // alturas provisórias. Sincroniza holders e reduz a band à geometria
        // final antes de decidir se o registro cabe na página.
        checkHolderHeigth(detail);
        CheckHeight(detail);

        var longTexts = detail.querySelectorAll('.WR_LongText');
        for (var textIndex = 0; textIndex < longTexts.length; textIndex++) {
            checkLongText(longTexts[textIndex], false);
        }

        if (detail.hasAttribute('alternatecolor') && CurrentRecord % 2 === 0) {
            detail.style.backgroundColor = detail.getAttribute('alternatecolor');
        }

        // A quebra ocorre depois de toda a band, inclusive após eventuais
        // divisões de Memo/RichText. Só cria nova página se ainda houver detail
        // a imprimir, evitando uma folha vazia ao final do relatório.
        if (pageBreakingMode === 1 && hasPendingDetailOutput(i)) {
            createExplicitPageBreak();
        }
    }
    checkHolderHeigth();
}

/**
 * Origem: função alterada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function checkHolderHeigth(detailBand){
    var band=detailBand;
    if (!band) {
        var bands=CurrentPage.querySelectorAll("div[type='1']");
        if (bands.length>0) band=bands[bands.length-1];
    }
    if (band){
        if (band.getAttribute("bandtype")===undefined || band.getAttribute("bandtype")===null || band.getAttribute("bandtype")=="3"){
            for (let i=0;i<band.childNodes.length;i++){
                if (band.childNodes[i].getAttribute?.("holderheight") != null){                    
                    for (let i2=0;i2<band.childNodes.length;i2++){
                        if (band.childNodes[i2].getAttribute("id")==band.childNodes[i].getAttribute("holderheight")){
                            var h=band.childNodes[i2].offsetHeight;
                            if (band.offsetHeight<h)band.style.height=h+'px'; //ajustar o height da Band
                            band.childNodes[i].style.height=h+'px'; //band.childNodes[i2].style.height;
                            band.childNodes[i].style.top=band.childNodes[i2].style.top;
                        }                        
                    }
                }
            }

            // SetHeight pode ter preservado uma medição transitória maior.
            // Após ajustar os holders, a altura correta é o maior limite dos
            // filhos, respeitando apenas a altura declarada no template.
            resizeAnchorToChildren(band);
        }
    }    
}

function getFontSize(obj){
    var currentSize=0;
    for(let i=0;i<obj.childNodes.length;i++){
        if (obj.childNodes[i].style!=undefined){
            var size=obj.childNodes[i].style.fontSize;
            if (size!='' && size!=undefined){
                size=size.replace(/\D/g, ""); //somente numeros            
                size=parseInt(size);
                if (size>currentSize)currentSize=size;
            }
            let recursividade=getFontSize(obj.childNodes[i]);
            if (recursividade>currentSize)currentSize=recursividade;    
        }
    }
    return currentSize;
}

/**
 * Origem: função alterada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function ancoreElement(Obj){
    if (Obj.getAttribute('parent')===null || Obj.getAttribute('parent')===undefined){
        CurrentPage.append(Obj);
    }else{
        var parent=Obj.getAttribute('parent');
        if (CurrentPage.querySelector('#'+parent)===null || CurrentPage.querySelector('#'+parent)===undefined){
            var parentTemplate = getReportElementById(Elements, parent);
            if (parentTemplate && Number(parentTemplate.getAttribute('type')) === 3) {
                var groupParent = createGroupInstance(parent);
                if (groupParent) groupParent.append(Obj);
                return;
            }
            var temp;
            if (Elements.querySelector('#'+parent).getAttribute('type')==1 && (Elements.querySelector('#'+parent).getAttribute('bandtype')==3 || Elements.querySelector('#'+parent).getAttribute('bandtype')==undefined)){
                //bands e do tipo detail
                temp=Elements.querySelector('#'+parent).cloneNode(true);
            }else{
                temp=Elements.querySelector('#'+parent).cloneNode(false);
            }

            if (temp.getAttribute('type')==0){
                CurrentPage.append(Obj);
            }else{
                if (temp.getAttribute('type')!=1) temp.innerHTML=''; //se nao for Band do tipo Detail entao apagar tudo
                ancoreElement(temp);

                //remover o objeto ja existente no seu novo parent, caso ele exista, antes de ancora-lo
                if (temp.querySelector('#'+Obj.getAttribute('id'))!==undefined && temp.querySelector('#'+Obj.getAttribute('id'))!==null){
                    temp.querySelector('#'+Obj.getAttribute('id')).remove();
                }
                temp.append(Obj);
            }
        }else{
            CurrentPage.querySelector('#'+parent).append(Obj);
        }
        
        //se for um group, então ajustar seu valor temporario
        if (Obj.parentNode.getAttribute('type')==3 && (Obj.parentNode.getAttribute('datafield')!==undefined && Obj.parentNode.getAttribute('datafield')!==null)){
            if (Rows[CurrentRecord][Obj.parentNode.getAttribute('datafield').toLowerCase()]!==undefined && Rows[CurrentRecord][Obj.parentNode.getAttribute('datafield').toLowerCase()]!==null){
                Obj.parentNode.setAttribute('currentvalue', Rows[CurrentRecord][Obj.parentNode.getAttribute('datafield').toLowerCase()]);
            }
        }
        
    }
}

function char_convert(val) {

    var chars = ["©","Û","®","ž","Ü","Ÿ","Ý","$","Þ","%","¡","ß","¢","à","£","á","À","¤","â","Á","¥","ã","Â","¦","ä","Ã","§","å","Ä","¨","æ","Å","©","ç","Æ","ª","è","Ç","«","é","È","¬","ê","É","­","ë","Ê","®","ì","Ë","¯","í","Ì","°","î","Í","±","ï","Î","²","ð","Ï","³","ñ","Ð","´","ò","Ñ","µ","ó","Õ","¶","ô","Ö","·","õ","Ø","¸","ö","Ù","¹","÷","Ú","º","ø","Û","»","ù","Ü","@","¼","ú","Ý","½","û","Þ","€","¾","ü","ß","¿","ý","à","‚","À","þ","á","ƒ","Á","ÿ","å","„","Â","æ","…","Ã","ç","†","Ä","è","‡","Å","é","ˆ","Æ","ê","‰","Ç","ë","Š","È","ì","‹","É","í","Œ","Ê","î","Ë","ï","Ž","Ì","ð","Í","ñ","Î","ò","‘","Ï","ó","’","Ð","ô","“","Ñ","õ","”","Ò","ö","•","Ó","ø","–","Ô","ù","—","Õ","ú","˜","Ö","û","™","×","ý","š","Ø","þ","›","Ù","ÿ","œ","Ú"]; 
    var codes = ["&copy;","&#219;","&reg;","&#158;","&#220;","&#159;","&#221;","&#36;","&#222;","&#37;","&#161;","&#223;","&#162;","&#224;","&#163;","&#225;","&Agrave;","&#164;","&#226;","&Aacute;","&#165;","&#227;","&Acirc;","&#166;","&#228;","&Atilde;","&#167;","&#229;","&Auml;","&#168;","&#230;","&Aring;","&#169;","&#231;","&AElig;","&#170;","&#232;","&Ccedil;","&#171;","&#233;","&Egrave;","&#172;","&#234;","&Eacute;","&#173;","&#235;","&Ecirc;","&#174;","&#236;","&Euml;","&#175;","&#237;","&Igrave;","&#176;","&#238;","&Iacute;","&#177;","&#239;","&Icirc;","&#178;","&#240;","&Iuml;","&#179;","&#241;","&ETH;","&#180;","&#242;","&Ntilde;","&#181;","&#243;","&Otilde;","&#182;","&#244;","&Ouml;","&#183;","&#245;","&Oslash;","&#184;","&#246;","&Ugrave;","&#185;","&#247;","&Uacute;","&#186;","&#248;","&Ucirc;","&#187;","&#249;","&Uuml;","&#64;","&#188;","&#250;","&Yacute;","&#189;","&#251;","&THORN;","&#128;","&#190;","&#252","&szlig;","&#191;","&#253;","&agrave;","&#130;","&#192;","&#254;","&aacute;","&#131;","&#193;","&#255;","&aring;","&#132;","&#194;","&aelig;","&#133;","&#195;","&ccedil;","&#134;","&#196;","&egrave;","&#135;","&#197;","&eacute;","&#136;","&#198;","&ecirc;","&#137;","&#199;","&euml;","&#138;","&#200;","&igrave;","&#139;","&#201;","&iacute;","&#140;","&#202;","&icirc;","&#203;","&iuml;","&#142;","&#204;","&eth;","&#205;","&ntilde;","&#206;","&ograve;","&#145;","&#207;","&oacute;","&#146;","&#208;","&ocirc;","&#147;","&#209;","&otilde;","&#148;","&#210;","&ouml;","&#149;","&#211;","&oslash;","&#150;","&#212;","&ugrave;","&#151;","&#213;","&uacute;","&#152;","&#214;","&ucirc;","&#153;","&#215;","&yacute;","&#154;","&#216;","&thorn;","&#155;","&#217;","&yuml;","&#156;","&#218;"];

    for(x=0; x<chars.length; x++){
        val=val.replaceAll(codes[x],chars[x]);
    }

    return val;
 }

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function getReportElementById(root, id) {
    if (!root || !id) return undefined;
    if (root.id === id) return root;
    const items = root.querySelectorAll ? root.querySelectorAll('[id]') : [];
    for (let i = items.length - 1; i >= 0; i--) {
        if (items[i].id === id) return items[i];
    }
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function getPageContentBottom(page) {
    const rect = page.getBoundingClientRect();
    const style = getComputedStyle(page);
    return rect.bottom
        - (parseFloat(style.borderBottomWidth) || 0)
        - (parseFloat(style.paddingBottom) || 0);
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function getReservedPageHeight(element) {
    let reserved = 0;
    let current = element;
    while (current && current !== CurrentPage) {
        reserved += parseFloat(current.getAttribute?.('preserveheight')) || 0;
        current = current.parentElement;
    }
    reserved += parseFloat(CurrentPage?.getAttribute('preserveheight')) || 0;
    if (element?.getAttribute?.('data-wr-keep-with-next') === '1') reserved += WRminLineHeight;
    return reserved;
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function getLongTextBreakPoints(source) {
    const points = [{ container: source, offset: 0, natural: true }];
    const walker = document.createTreeWalker(source, NodeFilter.SHOW_TEXT);
    const segmenter = typeof Intl.Segmenter === 'function'
        ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
        : undefined;
    let node;

    while ((node = walker.nextNode())) {
        const value = node.nodeValue || '';
        if (!value.length) continue;

        if (segmenter) {
            for (const part of segmenter.segment(value)) {
                const offset = part.index + part.segment.length;
                points.push({
                    container: node,
                    offset,
                    natural: /[\s.,;:!?…\-–—)\]}]/u.test(part.segment)
                });
            }
        } else {
            let offset = 0;
            for (const character of value) {
                offset += character.length;
                points.push({
                    container: node,
                    offset,
                    natural: /[\s.,;:!?\-–—)\]}]/.test(character)
                });
            }
        }
    }

    // O ponto final no elemento raiz inclui imagens e elementos vazios após o último texto.
    points.push({ container: source, offset: source.childNodes.length, natural: true, final: true });
    return points;
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function repeatTableHeaders(target, source) {
    if (WRactiveConfig?.pagination?.repeatTableHeaders === false) return;
    const sourceTables = source.querySelectorAll('table');
    target.querySelectorAll('table').forEach((table, index) => {
        if (!table.tHead && sourceTables[index]?.tHead) {
            table.prepend(sourceTables[index].tHead.cloneNode(true));
        }
    });
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function renderLongTextRange(target, start, end, source) {
    const range = document.createRange();
    range.setStart(start.container, start.offset);
    range.setEnd(end.container, end.offset);
    target.replaceChildren(range.cloneContents());
    if (source) repeatTableHeaders(target, source);
    range.detach?.();
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function longTextFitsPage(target) {
    const style = getComputedStyle(target);
    const marginBottom = parseFloat(style.marginBottom) || 0;
    const bottom = target.getBoundingClientRect().bottom + marginBottom;
    return bottom <= getPageContentBottom(CurrentPage) - getReservedPageHeight(target) + 0.5;
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 * Busca o maior intervalo que cabe na área útil usando medições reais. A busca binária reduz o número de tentativas em textos extensos.
 */
function findLongTextBreak(target, source, points, startIndex) {
    let low = startIndex + 1;
    let high = points.length - 1;
    let best = startIndex;

    while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        renderLongTextRange(target, points[startIndex], points[middle], source);
        if (longTextFitsPage(target)) {
            best = middle;
            low = middle + 1;
        } else {
            high = middle - 1;
        }
    }

    if (best <= startIndex) return best;

    // Evita cortar uma palavra quando há uma quebra natural próxima.
    const searchLimit = Math.max(startIndex + 1, best - 80);
    for (let i = best; i >= searchLimit; i--) {
        if (points[i].natural) return i;
    }
    return best;
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function finishLongTextPart(target, originalParentHeight) {
    const parent = target.parentNode;
    target.style.height = 'auto';
    if (parent?.style) {
        parent.style.height = originalParentHeight;
        resizeAnchorToChildren(parent);
    }
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function resizeAnchorToChildren(element) {
    if (!element?.children) return;
    if (element.getAttribute?.('type') === '3') {
        element.style.height = 'auto';
        return;
    }
    const declared = parseFloat(element.getAttribute('data-wr-declared-height'));
    let height = Number.isFinite(declared) ? declared : 0;
    for (const child of element.children) {
        const bottom = child.offsetTop + child.offsetHeight + (parseFloat(getComputedStyle(child).marginBottom) || 0);
        if (bottom > height) height = bottom;
    }
    if (height > 0) element.style.height = Math.ceil(height) + 'px';
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function getLongTextParentHeight(target) {
    return target.parentNode?.getAttribute('data-wr-declared-height') || '';
}

/**
 * Libera somente a altura da cópia de uma band Title criada para continuar
 * um texto longo. A band original mantém integralmente a altura declarada.
 */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function prepareTitleContinuationContainer(continuation) {
    const parent = continuation?.parentNode;
    if (!parent
        || parent === CurrentPage
        || parent.getAttribute('type') !== '1'
        || parent.getAttribute('bandtype') !== '0') {
        return;
    }

    parent.dataset.wrContinuationContainer = 'title';
    parent.setAttribute('data-wr-declared-height', '0');
    parent.style.height = 'auto';
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 * Abre a continuação e recria a cadeia de contêineres necessária, preservando cabeçalhos e descontando a altura já consumida.
 */
function createLongTextPage(target, closePage, moveWholeParent = false) {
    const oldParent = target.parentNode;
    if (closePage) CloseElement(oldParent?.parentNode || CurrentPage);
    NewPage('wr_container_body', endOfReport);

    if (moveWholeParent && oldParent) {
        const duplicate = getReportElementById(CurrentPage, oldParent.id);
        if (duplicate) duplicate.remove();
        ancoreElement(oldParent);
        return target;
    }

    let continuation = getReportElementById(CurrentPage, target.id);
    if (!continuation) {
        const template = getReportElementById(Elements, target.id);
        if (!template) throw new Error('Template do texto longo não encontrado: ' + target.id);
        continuation = template.cloneNode(true);
        ancoreElement(continuation);
    }

    continuation.replaceChildren();
    continuation.classList.remove('WR_LongText');
    continuation.classList.add('wr-longtext-continuation');
    continuation.dataset.wrContinuation = continuation.getAttribute('data-wr-continuation-text') || WRactiveConfig.pagination.continuationLabel;
    continuation.style.height = 'auto';
    prepareTitleContinuationContainer(continuation);
    return continuation;
}

/**
 * Origem: função alterada pela IA; base autoral do WebReport: Evandro / GWBM.
 * Segmenta um Memo/RichText em pontos de quebra, mede intervalos no DOM e transporta o restante para novas páginas. Conserva a estrutura HTML através de Range, inclusive para um único nó de texto longo.
 */
function checkLongText(obj, closePage=true){
    if (!obj || !obj.isConnected) return;
    const longTextId = obj.id;
    obj.classList.remove('WR_LongText');

    let html = obj.innerHTML;
    for (const [key, rawValue] of Object.entries(Rows[CurrentRecord] || {})) {
        let value = rawValue == null ? '' : String(rawValue);
        value = value.replaceAll('&#34;', '"');
        html = html.replaceAll('[' + key.toUpperCase() + ']', () => value);
    }
    setReportHtml(obj, html);
    obj.style.height = 'auto';

    const source = obj.cloneNode(true);
    const points = getLongTextBreakPoints(source);
    if (points.length <= 2 || longTextFitsPage(obj)) {
        SetHeight(obj.parentNode);
        if (closePage) CloseElement(obj.parentNode?.parentNode || CurrentPage);
        return;
    }

    let startIndex = 0;
    let movedForSpace = false;
    obj.replaceChildren();

    while (startIndex < points.length - 1) {
        // A altura do pai já pode ter sido expandida pelo conteúdo completo.
        // Usa-se a altura declarada no template como base para cada fragmento.
        const originalParentHeight = getLongTextParentHeight(obj);
        if (obj.parentNode?.style) obj.parentNode.style.height = CurrentPage.style.height;

        let endIndex = findLongTextBreak(obj, source, points, startIndex);

        if (endIndex <= startIndex && !movedForSpace) {
            obj.replaceChildren();
            obj = createLongTextPage(obj, false, true);
            movedForSpace = true;
            continue;
        }

        // Garante progresso mesmo para um elemento indivisível maior que uma página.
        if (endIndex <= startIndex) endIndex = Math.min(startIndex + 1, points.length - 1);
        renderLongTextRange(obj, points[startIndex], points[endIndex], source);
        finishLongTextPart(obj, originalParentHeight);
        startIndex = endIndex;

        if (startIndex < points.length - 1) {
            checkHolderHeigth();
            obj = createLongTextPage(obj, closePage, false);
            movedForSpace = true;
        }
    }

    // Uma medição anterior pode ter deixado a band com a altura do conteúdo
    // completo. Normaliza todas as partes somente depois de concluir a divisão.
    for (const item of document.querySelectorAll('[id]')) {
        if (item.id === longTextId && item.parentNode) resizeAnchorToChildren(item.parentNode);
    }

    if (closePage) CloseElement(obj.parentNode?.parentNode || CurrentPage);
}


/**
 * Origem: função alterada pela IA; base autoral do WebReport: Evandro / GWBM.
 * Clona o template de página, atualiza contadores e recompõe os elementos estáticos de continuação.
 */
function NewPage(Destination, clearPage=false) {    

    CurrentPageNumber++;
    CurrentPageTemp++;
    var nPage = tPage.cloneNode();
    
    //somente no firefox
    if (navigator.userAgent.match(/firefox|fxios/i)){
        nPage.style.pageBreakAfter = 'always';
    }    

    nPage.setAttribute('currentpage', CurrentPageTemp);
    //inicialmente inserir a nova pagina em um elemento qualquer somente para se poder mensuarar seu temanho
    document.body.append(nPage);
    GetElements(nPage,clearPage); //Inserir os objetos filhos da própria página
    document.getElementById(Destination).append(nPage);

    //remover eventuais bands do tipo "title", caso a pagina seja maior que 1
    if (CurrentPageTemp>1){
        var bnds=nPage.querySelectorAll("div[bandtype='0']");
        for (let i=0;i<bnds.length;i++)bnds[i].remove();
    }

    //SOMENTE APOS ANCORADO, VERIFICAR DUPLICIDADE DE ELEMENTOS (ERRO EM UM RELATORIO DO SIAM -> AUTORIZACOES POR INTERVALO DE PROCESSOS)

    CurrentPage = nPage;
    return nPage;
}

    
//             //recursividade

/**
 * Origem: função alterada pela IA; base autoral do WebReport: Evandro / GWBM.
 * Acumula RLDBResult nos templates antes de clonar os totalizadores. Fórmulas usam um avaliador aritmético restrito; ResetCount encerra o acumulador do grupo.
 */
function Compute(computedElements = new Set()) {
    for (let i = 0; i < Elements.childNodes.length; i++) {
        let Element = Elements.childNodes[i];
        let v;
        //somente para as bands corretas
        if (Element.getAttribute('type') == '1' && [null, undefined, '3', '4', '5', '6'].indexOf(Element.getAttribute('bandtype')) !== -1) {
            for (let i2 = 0; i2 < Element.childNodes.length; i2++) {
                //objetos do tipo DBResult e SystemInfo
                const computedElement = Element.childNodes[i2];
                if (computedElements.has(computedElement)) continue;
                computedElements.add(computedElement);

                let ds = Element.childNodes[i2].getAttribute('datafield');
                if ([null, undefined].indexOf(ds) != -1 && [null, undefined].indexOf(Element.childNodes[i2].getAttribute('dataformula')) == -1) {
                    ds = Element.childNodes[i2].getAttribute('dataformula');
                    try {
                        v = evaluateReportFormula(ds, Rows[CurrentRecord]);
                    } catch (error) {
                        console.warn('Fórmula ignorada:', ds, error.message);
                        v = 0;
                    }
                } else {
                    //valor do campo
                    if (ds != undefined) {                        
                        v = Rows[CurrentRecord][ds.toLowerCase()];
                    }
                }

                if (Element.childNodes[i2].getAttribute('type') == '17') {
                    let c, s, m, t;
                    if (v==undefined){
                        console.log('---------------------------------------------------------------------------------------------------------');
                        console.log('"DataField" não informado ou não encontrado para o objeto "'+Element.childNodes[i2].getAttribute('id')+'"');
                        console.log('---------------------------------------------------------------------------------------------------------');
                        console.log('');
                    }
                    switch (parseInt(Element.childNodes[i2].getAttribute('info'))) {
                        case 0: //riAverage
                            c = Element.childNodes[i2].getAttribute('count');
                            if (c == undefined) c = 0;
                            c = parseFloat(c);
                            c++; //acrescer o registro atual no contador
                            s = parseFloat(Element.childNodes[i2].getAttribute('sum'));
                            if (!Number.isFinite(s)) s = 0;
                            s = parseFloat(s) + parseFloat(v); //somar tambem o valor atual
                            // IA: preserva os acumuladores para os próximos registros.
                            Element.childNodes[i2].setAttribute('count', c);
                            Element.childNodes[i2].setAttribute('sum', s);
                            Element.childNodes[i2].setAttribute('average', (s / c));
                            t = s / c;
                            break;
                        case 1: //riCount
                            c = Element.childNodes[i2].getAttribute('count');
                            if (c == undefined) c = 0;
                            c++;
                            Element.childNodes[i2].setAttribute('count', c);
                            t = c;
                            break;
                        case 2: //riFirst
                            if (Element.childNodes[i2].getAttribute('first') == undefined) {
                                Element.childNodes[i2].setAttribute('first', v);
                            }
                            t = Element.childNodes[i2].getAttribute('first');
                            break;
                        case 3: //riFirstText
                            if (Element.childNodes[i2].getAttribute('firsttext') == undefined) {
                                Element.childNodes[i2].setAttribute('firsttext', v);
                            }
                            t = Element.childNodes[i2].getAttribute('firsttext');
                            break;
                        case 4: //riLast
                            Element.childNodes[i2].setAttribute('last', v);
                            t = v;
                            break;
                        case 5: //riLastText
                            Element.childNodes[i2].setAttribute('lasttext', v);
                            t = v;
                            break;
                        case 6: //riMax
                            m = Element.childNodes[i2].getAttribute('max');
                            if (m == undefined) {
                                Element.childNodes[i2].setAttribute('max', v);
                            } else {
                                m = parseFloat(m);
                                if (parseFloat(v) > m) {
                                    Element.childNodes[i2].setAttribute('max', v);
                                }
                            }
                            t = Element.childNodes[i2].getAttribute('max');
                            break;
                        case 7: //riMin
                            m = Element.childNodes[i2].getAttribute('min');
                            if (m == undefined) {
                                Element.childNodes[i2].setAttribute('min', v);
                            } else {
                                m = parseFloat(m);
                                if (parseFloat(v) < m) {
                                    Element.childNodes[i2].setAttribute('min', v);
                                }
                            }
                            t = Element.childNodes[i2].getAttribute('min');
                            break;
                        case 8: //riSimple                            
                            Element.childNodes[i2].setAttribute('simple', v);
                            t = v;
                            break;
                        case 9: //riSum                            
                            m = Element.childNodes[i2].getAttribute('sum');
                            if (m == undefined || m == null) m = 0;
                            m = parseFloat(m) + parseFloat(v);                            
                            Element.childNodes[i2].setAttribute('sum', m);
                            t = m;
                            break;
                    }

                    //ver se existe mascara
                    if (Element.childNodes[i2].getAttribute('mask') != undefined) {
                        t = SetMask(t, Element.childNodes[i2].getAttribute('mask'));
                    }

                    //ver se é currency
                    if (Element.childNodes[i2].getAttribute('currency') != undefined) {
                        t = 'R$ ' + t;
                    }

                    if (Element.childNodes[i2].getAttribute('text') != undefined) {
                        Element.childNodes[i2].innerText = Element.childNodes[i2].getAttribute('text').trim() + ' ' + t;
                    } else {
                        Element.childNodes[i2].innerText = t;
                    }
                } else if (Element.childNodes[i2].getAttribute('type') == '14') {
                    //elementos systeminfo, mas não pega dos details
                    switch (parseInt(Element.childNodes[i2].getAttribute('info'))) {
                        case 6: //recno          
                            if (Element.childNodes[i2].getAttribute('recno') != undefined) {
                                Element.childNodes[i2].setAttribute('recno', parseInt(Element.childNodes[i2].getAttribute('recno')) + 1);
                            } else {
                                Element.childNodes[i2].setAttribute('recno', 1);
                            }
                            break;
                    }
                }
            }

        }
    }
}

/**
 * Origem: função alterada pela IA; base autoral do WebReport: Evandro / GWBM.
 * Percorre os objetos preenchendo DataField, textos e placeholders [CAMPO]. Depois aplica máscaras e mede a altura resultante. Campos de Data são consultados em minúsculas.
 */
function Populate(Element) {    
    //preencher campos com os dados do registro atual
    for (let i = 0; i < Element.childNodes.length; i++) {
        //Recursividade
        for (let i2 = 0; i2 < Element.childNodes[i].childNodes.length; i2++) {            
            Populate(Element.childNodes[i].childNodes[i2]);
        }
        //ATENÇÃO: NODES COM TEXTO INTERNO ACUMULAM UM CHILDNODE!
        if (Element.childNodes[i].tagName != undefined){
            let t;
            if (Element.childNodes[i].getAttribute("datafield") != undefined) {
                //outros objetos baseados em dados (Rows)                
                t = Rows[CurrentRecord][Element.childNodes[i].getAttribute("datafield").toLowerCase()];
            } else {
                if (parseInt(Element.childNodes[i].getAttribute('type')) == 14) {
                    //RLSystemInfo
                    let d = new Date();
                    switch (parseInt(Element.childNodes[i].getAttribute('info'))) {
                        case 0: //itDate
                            t = d.toLocaleDateString();
                            break;
                        case 1: //itFullDate
                            t = d.toLocaleDateString() + ' ' + d.toLocaleTimeString().substring(0, 5);
                            break;
                        case 2: //itHour
                            t = d.toLocaleTimeString().substring(0, 5);
                            break;
                        case 3: //itLastPageNumber
                            t = '<lastpage>';
                            Element.childNodes[i].className = Element.childNodes[i].className + ' wr_lastpage';
                            break;
                        case 4: //itPageNumber
                            t = CurrentPageNumber;
                            break;
                        case 5: //itPagePreview
                            t = '<pagepreview>'
                            //Element.childNodes[i].setAttribute('currentpage', CurrentPageNumber);
                            Element.childNodes[i].setAttribute('currentpage', CurrentPageTemp);
                            Element.childNodes[i].className = Element.childNodes[i].className + ' wr_pagepreview';
                            break;
                        case 6: //itRecNo
                            t = Element.childNodes[i].getAttribute('recno');
                            break;
                        case 7: //itCarbonCopy
                            t = '';
                            break;
                        case 8: //itCopyNo
                            t = '';
                            break;
                    }
                } else if (parseInt(Element.childNodes[i].getAttribute('type')) == 17) {
                    //se for um DBResult, pegar o valor de seus proprios atributos
                    switch (parseInt(Element.childNodes[i].getAttribute('info'))) {
                        case 0:
                            t = Element.childNodes[i].getAttribute('average');
                            break;
                        case 1:
                            t = Element.childNodes[i].getAttribute('count');
                            break;
                        case 2:
                            t = Element.childNodes[i].getAttribute('first');
                            break;
                        case 3:
                            t = Element.childNodes[i].getAttribute('firsttext');
                            break;
                        case 4:
                            t = Element.childNodes[i].getAttribute('last');
                            break;
                        case 5:
                            t = Element.childNodes[i].getAttribute('lasttext');
                            break;
                        case 6:
                            t = Element.childNodes[i].getAttribute('max');
                            break;
                        case 7:
                            t = Element.childNodes[i].getAttribute('min');
                            Element.childNodes[i].innerText = t;
                            break;
                        case 8:
                            t = Element.childNodes[i].getAttribute('simple');
                            break;
                        case 9:                            
                            t = Element.childNodes[i].getAttribute('sum');
                            break;
                    }
                }
            }
            //em alguns casos o valor pode nao existir
            t = (t == undefined ? '' : t);

            //aplicar masara se necesario
            if (Element.childNodes[i].getAttribute('mask') != undefined) {
                t = SetMask(t, Element.childNodes[i].getAttribute('mask'));
            }

            //ver se é currency
            if (Element.childNodes[i].getAttribute('currency') != undefined) {
                t = 'R$ ' + t;
            }

            if (parseInt(Element.childNodes[i].getAttribute('type'))>=8 && parseInt(Element.childNodes[i].getAttribute('type'))<=11) {
                //memos e richtext. talvez haja campos a serem preenchidos -> TINHA PASSADO PARA FUNÇÃO CHECKLONGTEXT, MAS PRECISEI DEIXAR REDUNDANTE PARA CASOS EM QUE O OBJETO ESTEJA ANCORADO EM UM GROUP
                var t_temp='';
                t_temp=Element.childNodes[i].innerHTML;
                var vals=Object.entries(Rows[CurrentRecord]);
                for (let i3 = 0; i3 < vals.length; i3++) {
                    t_temp=t_temp.replaceAll('['+vals[i3][0].toUpperCase()+']', () => vals[i3][1] ?? '');
                }
                setReportHtml(Element.childNodes[i], t_temp);
            }

            //somente quando o elemento atual tiver valor a ser inserido
            if (Element.childNodes[i].childNodes.length == 0) {
                if (Element.childNodes[i].getAttribute('text') != undefined) {
                    if (Element.childNodes[i].getAttribute('text').indexOf('#') != -1) {
                        let s = Element.childNodes[i].getAttribute('text');
                        if (t == '<pagepreview>') {
                            //nao fazer nada agora, fara no final                        
                        } else if (t == '<lastpage>') {
                            //nao fazer nada agora, fara no final
                        } else {
                            s = s.replace('#', t);
                            Element.childNodes[i].innerText = s;
                        }
                    } else {
                        Element.childNodes[i].innerText = Element.childNodes[i].getAttribute('text').trim() + ' ' + t;
                    }
                } else {
                    if (Element.childNodes[i].getAttribute('isHTML')==1){
                        t=t.replaceAll('&#34;','"');
                        setReportHtml(Element.childNodes[i], t);
                    }else{
                        Element.childNodes[i].innerText = t;
                    }
                }
            }            
        }
        if (Element.childNodes[i].tagName != undefined)SetHeight(Element.childNodes[i]); //ajustar o tamanho após a mudança dos textos dos objetos filhos
    }
    if (Element.tagName != undefined)SetHeight(Element);    
}

/**
 * Origem: função alterada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function SetMask(Valor, Mask) {
    let dec = Mask.substr(3, Mask.length - 3).trim();
    Valor = parseFloat(Valor);
    Valor = (new Intl.NumberFormat('pt-BR', { minimumFractionDigits: dec.length, maximumFractionDigits: dec.length }).format(Valor));
    return Valor;
}

function FindItem(ID, Parent = document) {
    //para pegar sempre o ultimo item é necessario que a ordem seja inversa
    for (let i = Parent.childNodes.length - 1; i >= 0; i--) {
        if (Parent.childNodes[i].getAttribute('id') == ID) {
            return Parent.childNodes[i];
            break;
        }
    }
    return;
}

/**
 * Origem: função alterada pela IA; base autoral do WebReport: Evandro / GWBM.
 * Mede o limite inferior dos filhos e recalcula a altura do contêiner; templates ocultos podem exigir uma cópia temporária mensurável.
 */
function SetHeight(Element) {
    if (!Element?.getAttribute || !['1', '2', '3', '4'].includes(Element.getAttribute('type'))) return;

    // Groups são contêineres de fluxo: suas bands filhas são relativas e o
    // navegador deve somar suas alturas. Fixar um valor em px congela o group
    // antes da inclusão dos próximos details e faz o group seguinte sobrepor-se.
    if (Element.getAttribute('type') === '3') {
        Element.style.height = 'auto';
        return;
    }

    const declaredValue = Element.hasAttribute('data-wr-declared-height')
        ? Element.getAttribute('data-wr-declared-height')
        : Element.style.height;
    const declaredHeight = parseFloat(declaredValue);
    let height = Number.isFinite(declaredHeight) ? declaredHeight : 0;
    let measurement = Element;
    let clone;

    // Templates ficam dentro de #wr_Elements (display:none). Mede-se uma única
    // cópia visível, em vez de criar uma cópia para cada filho.
    if (Element.children.length && Element.offsetHeight === 0) {
        clone = Element.cloneNode(true);
        clone.removeAttribute('id');
        clone.style.position = 'absolute';
        clone.style.visibility = 'hidden';
        clone.style.pointerEvents = 'none';
        clone.style.left = '-100000px';
        clone.style.top = '0';
        document.body.append(clone);
        measurement = clone;
    }

    for (const child of measurement.children) {
        const style = getComputedStyle(child);
        const bottom = child.offsetTop + child.offsetHeight + (parseFloat(style.marginBottom) || 0);
        if (bottom > height) height = bottom;
    }

    clone?.remove();
    if (height > 0) Element.style.height = Math.ceil(height) + 'px';
}

function ResetCount(Element) {
    for (let i = 0; i < Elements.childNodes.length; i++) {
        if (Elements.childNodes[i].getAttribute('id') == Element.getAttribute('id')) {
            for (let i2 = 0; i2 < Elements.childNodes[i].childNodes.length; i2++) {
                Elements.childNodes[i].childNodes[i2].removeAttribute('average');
                Elements.childNodes[i].childNodes[i2].removeAttribute('count');
                Elements.childNodes[i].childNodes[i2].removeAttribute('first');
                Elements.childNodes[i].childNodes[i2].removeAttribute('firsttext');
                Elements.childNodes[i].childNodes[i2].removeAttribute('last');
                Elements.childNodes[i].childNodes[i2].removeAttribute('lasttext');
                Elements.childNodes[i].childNodes[i2].removeAttribute('max');
                Elements.childNodes[i].childNodes[i2].removeAttribute('min');
                Elements.childNodes[i].childNodes[i2].removeAttribute('simple');
                Elements.childNodes[i].childNodes[i2].removeAttribute('sum');
                Elements.childNodes[i].childNodes[i2].setAttribute('recno', '1');
            }
        }
    }
}

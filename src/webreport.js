/*! WebReport — Copyright (c) 2026 Evandro / GWBM. SPDX-License-Identifier: MIT. Veja LICENSE. */
/**
 * WebReport - carregamento, interface do visualizador e exportações.
 * A paginação e a montagem dos elementos permanecem em webreport.core.js.
 */

var h1 = new Date();
var h2;
var WRtimings = {
    requestMs: 0,
    structureMs: 0,
    dataMs: 0,
    totalStartedAt: Date.now(),
    reports: []
};
var WRrequestTimingPending = false;

/** Reinicia as métricas sem perder o tempo da requisição em andamento. */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function resetReportTimings(hasServerRequest) {
    WRtimings.requestMs = 0;
    WRtimings.structureMs = 0;
    WRtimings.dataMs = 0;
    WRtimings.totalStartedAt = Date.now();
    WRtimings.reports = [];
    WRrequestTimingPending = Boolean(hasServerRequest);
}

/** Exibe intervalos curtos em ms para evitar o enganoso "0,00 s". */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function formatReportDuration(milliseconds) {
    var value = Math.max(0, Number(milliseconds) || 0);
    return value < 1000 ? Math.round(value) + " ms" : (value / 1000).toFixed(2) + " s";
}

/** Lê preferências sem impedir a abertura quando o armazenamento está indisponível. */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function loadReportPreferences() {
    try {
        return JSON.parse(localStorage.getItem(WRpreferenceKey) || "{}");
    } catch (error) {
        return {};
    }
}

/** Persiste somente preferências visuais e de exportação. */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function saveReportPreferences(patch) {
    if ((WRactiveConfig || WRconfig).viewer.persistPreferences === false) return;
    try {
        var preferences = Object.assign(loadReportPreferences(), patch || {});
        localStorage.setItem(WRpreferenceKey, JSON.stringify(preferences));
    } catch (error) {
        // Ambientes com armazenamento bloqueado continuam funcionando normalmente.
    }
}

/** Acumula métricas por relatório para o painel de desempenho. */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function recordReportTiming(index, phase, milliseconds, report, rowCount) {
    var reportIndex = Math.max(0, Number(index) || 0);
    var entry = WRtimings.reports[reportIndex] || {
        index: reportIndex,
        name: report && (report.name || report.Name || report.ReportName) || ("Relatório " + (reportIndex + 1)),
        rows: Number(rowCount) || 0,
        pages: 0,
        structureMs: 0,
        dataMs: 0
    };
    entry[phase] = (Number(entry[phase]) || 0) + Math.max(0, Number(milliseconds) || 0);
    WRtimings.reports[reportIndex] = entry;
}

/** Cria um diagnóstico serializável, sem incluir os dados sensíveis do relatório. */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function getReportDiagnosticSnapshot() {
    var pages = getReportPages();
    return {
        generatedAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        locale: (WRactiveConfig || WRconfig).locale,
        pageCount: pages.length,
        reportCount: WRlastReports.length,
        reports: WRlastReports.map(function (report, index) {
            return {
                index: index,
                name: report && (report.name || report.Name || report.ReportName) || ("Relatório " + (index + 1)),
                rows: Array.isArray(report && report.Data) ? report.Data.length : 0,
                pages: pages.filter(function (page) { return page.dataset.reportIndex === String(index); }).length
            };
        }),
        validation: {
            errors: WRlastValidation.errors.slice(),
            warnings: WRlastValidation.warnings.slice()
        },
        timings: JSON.parse(JSON.stringify(WRtimings)),
        zoom: WRpreviewZoom
    };
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function downloadReportDiagnostics() {
    var content = JSON.stringify(getReportDiagnosticSnapshot(), null, 2);
    downloadBlob(new Blob([content], { type: "application/json;charset=utf-8" }), "WebReport-diagnostico.json");
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function showPerformanceDetails() {
    var lines = [
        "Requisição: " + formatReportDuration(WRtimings.requestMs),
        "Estrutura: " + formatReportDuration(WRtimings.structureMs),
        "Dados e paginação: " + formatReportDuration(WRtimings.dataMs),
        "Total: " + formatReportDuration(Date.now() - WRtimings.totalStartedAt)
    ];
    WRtimings.reports.forEach(function (entry) {
        lines.push(
            "",
            entry.name + " — " + entry.pages + (entry.pages === 1 ? " página" : " páginas"),
            "Estrutura: " + formatReportDuration(entry.structureMs) + " · dados: " + formatReportDuration(entry.dataMs)
        );
    });
    showWebReportMessage(lines.join("\n"));
}

/** Cancela tanto a chamada ao servidor quanto a paginação em andamento. */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function cancelActiveReportWork() {
    if (WRrequestController) WRrequestController.abort();
    if (WRjqRequest && typeof WRjqRequest.abort === "function") WRjqRequest.abort();
    if (WRgenerationController) WRgenerationController.abort();
}
var Elements;
var tPage;
var CurrentPage;
var CurrentPageNumber = 0;
var CurrentPageTemp = 0;
var CurrentRecord = 0;
var totalRows = 0;
var PermitReport = true;
var endOfReport = false;
var WRminLineHeight = 18;
var Structure = [];
var Rows = [];
var WRexportRows = [];
var WRreportDatasets = [];
var WRpreviewZoom = 1;
var WRkeydownHandler = null;
var WRgenerationController = null;
var WRpageObserver = null;
var WRactiveConfig = null;
var WRrequestController = null;
var WRrequestTimeoutId = null;
var WRjqRequest = null;
var WRmaterializeObserver = null;
var WRpreviousFocus = null;
var WRlastValidation = { errors: [], warnings: [] };
var WRlastReports = [];
var WRlastRequestUrl = "";
var WRpreferenceKey = "webreport.preferences.v2";

var WR_DEFAULT_CONFIG = {
    locale: "pt-BR",
    currency: "BRL",
    minLineHeight: 18,
    page: {
        format: "A4",
        orientation: "portrait",
        margins: { top: 10, right: 10, bottom: 10, left: 10 },
        formats: {
            A4: { width: 210, height: 297 },
            A3: { width: 297, height: 420 },
            Letter: { width: 215.9, height: 279.4 },
            Legal: { width: 215.9, height: 355.6 }
        }
    },
    performance: {
        batchSize: 40,
        virtualizePages: true,
        initialPages: 4,
        materializeMargin: "1600px"
    },
    request: { timeoutMs: 30000 },
    pagination: {
        keepTogether: true,
        orphans: 2,
        widows: 2,
        showContinuation: true,
        continuationLabel: "Continuação",
        repeatTableHeaders: true
    },
    print: { pageSizeMode: "auto" },
    security: {
        htmlMode: "safe",
        protectSpreadsheetFormulas: true,
        legacyServerPrompts: false,
        legacyPromptsSameOriginOnly: true
    },
    export: { delimiter: ";", bom: true, fileName: "WebReport" },
    viewer: {
        zoomMin: 0.5,
        zoomMax: 1.5,
        zoomStep: 0.1,
        persistPreferences: true
    }
};

var WRconfig = mergeReportConfig(WR_DEFAULT_CONFIG, {});
var WRexporters = Object.create(null);

/** Combina configurações sem alterar os objetos recebidos. */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function mergeReportConfig(base, override) {
    var output = Array.isArray(base) ? base.slice() : Object.assign({}, base || {});
    Object.keys(override || {}).forEach(function (key) {
        // IA: impede que configurações JSON alterem protótipos compartilhados.
        if (["__proto__", "constructor", "prototype"].includes(key)) return;
        var value = override[key];
        if (value && typeof value === "object" && !Array.isArray(value)) {
            output[key] = mergeReportConfig(base && base[key], value);
        } else {
            output[key] = value;
        }
    });
    return output;
}

/** Define opções globais e retorna uma cópia da configuração efetiva. */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function configureWebReport(options) {
    WRconfig = mergeReportConfig(WRconfig, options || {});
    return mergeReportConfig(WRconfig, {});
}

/** Permite que cada relatório sobrescreva as opções globais. */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function getEffectiveReportConfig(report) {
    return mergeReportConfig(WRconfig, report && (report.config || report.Config) || {});
}

/** Calcula dimensões e margens da página em milímetros. */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function WRgetPageMetrics(report) {
    var config = getEffectiveReportConfig(report);
    var page = config.page || {};
    var format = (page.formats || {})[page.format] || { width: 210, height: 297 };
    var landscape = String(page.orientation).toLowerCase() === "landscape";
    var margins = mergeReportConfig({ top: 10, right: 10, bottom: 10, left: 10 }, page.margins || {});
    return {
        width: landscape ? format.height : format.width,
        height: landscape ? format.width : format.height,
        margins: margins,
        contentWidth: (landscape ? format.height : format.width) - margins.left - margins.right,
        contentHeight: (landscape ? format.width : format.height) - margins.top - margins.bottom
    };
}

/** Remove scripts, eventos inline, URLs perigosas e CSS executável do HTML do relatório. */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 * Filtro defensivo para HTML de relatórios conhecidos. Remove conteúdo ativo comum; não substitui um sanitizador auditado nem isola CSS arbitrário em modelos não confiáveis.
 */
function sanitizeReportHtml(value, config) {
    var html = value == null ? "" : String(value);
    if ((config || WRactiveConfig || WRconfig).security.htmlMode === "trusted") return html;
    var template = document.createElement("template");
    template.innerHTML = html;
    template.content.querySelectorAll("script,style,iframe,object,embed,link,meta,base,svg,math,form,input,button,textarea,select,template").forEach(function (node) {
        node.remove();
    });
    template.content.querySelectorAll("*").forEach(function (node) {
        Array.from(node.attributes).forEach(function (attribute) {
            var name = attribute.name.toLowerCase();
            // IA: navegadores ignoram controles ASCII dentro de protocolos URL.
            var valueText = attribute.value.replace(/[\u0000-\u0020\u007f]/g, "");
            if (name.indexOf("on") === 0 || /^(?:javascript|vbscript|data\s*:\s*text\/html)/i.test(valueText)) {
                node.removeAttribute(attribute.name);
            }
            if (name === "style" && /expression\s*\(|javascript\s*:/i.test(valueText)) {
                node.removeAttribute(attribute.name);
            }
        });
    });
    return template.innerHTML;
}

/** Aplica conteúdo HTML segundo a política de segurança configurada. */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function setReportHtml(element, value) {
    element.innerHTML = sanitizeReportHtml(value, WRactiveConfig || WRconfig);
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function getStructureProperty(element, type) {
    var property = (element && (element.properties || element.p) || []).find(function (item) { return Number(item.t) === Number(type); });
    return property ? property.v : undefined;
}

/** Valida referências, campos e dimensões antes da renderização. */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function validateReportDefinition(report) {
    var errors = [];
    var warnings = [];
    var structure = report && report.Structure;
    var data = report && report.Data;
    if (!Array.isArray(structure)) errors.push("Structure deve ser um array.");
    if (!Array.isArray(data)) errors.push("Data deve ser um array.");
    if (errors.length) return { errors: errors, warnings: warnings };

    var ids = new Set();
    structure.forEach(function (element, index) {
        var idValue = element.n == null ? element.id : element.n;
        var id = idValue == null ? "" : String(idValue);
        if (!id) warnings.push("Elemento " + (index + 1) + " sem identificador.");
        if (id && ids.has(id)) errors.push("Identificador duplicado: " + id + ".");
        ids.add(id);
    });

    var sampleFields = new Set(Object.keys(data[0] || {}).map(function (field) { return field.toLocaleLowerCase(); }));
    var metrics = WRgetPageMetrics(report);
    structure.forEach(function (element) {
        var parent = element.parent == null ? getStructureProperty(element, 33) : element.parent;
        var field = getStructureProperty(element, 10);
        var left = Number(getStructureProperty(element, 22) || 0);
        var width = Number(getStructureProperty(element, 31) || 0);
        if (parent != null && parent !== "" && !ids.has(String(parent))) {
            warnings.push("O elemento " + (element.n || element.id) + " referencia o pai inexistente " + parent + ".");
        }
        if (field && data.length && !sampleFields.has(String(field).toLocaleLowerCase())) {
            warnings.push("Campo de dados não encontrado: " + field + ".");
        }
        if (width > 0 && left + width > metrics.contentWidth * 96 / 25.4 + 0.5) {
            warnings.push("O elemento " + (element.n || element.id) + " ultrapassa a largura útil da página.");
        }
    });
    return { errors: errors, warnings: Array.from(new Set(warnings)) };
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function showReportDiagnostics(result) {
    var lines = [];
    if (result.errors.length) lines.push("Erros:\n• " + result.errors.join("\n• "));
    if (result.warnings.length) lines.push("Avisos:\n• " + result.warnings.join("\n• "));
    showWebReportMessage(lines.join("\n\n") || "Nenhum problema foi detectado.");
}

/**
 * Encaminha mensagens do visualizador para o MAlert compartilhado sem
 * sobrescrever a função global usada pelos demais módulos do sistema.
 */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function showWebReportMessage() {
    if (typeof window.MAlert === "function") {
        return window.MAlert.apply(window, arguments);
    }

    // Salvaguarda para integrações isoladas que não carregaram message.js.
    var current = document.getElementById("wr_emergency_message");
    if (current) current.remove();

    var overlay = document.createElement("div");
    overlay.id = "wr_emergency_message";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.style.cssText = "position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(15,23,42,.58)";

    var panel = document.createElement("div");
    panel.style.cssText = "width:min(100%,520px);overflow:hidden;color:#172033;background:#fff;border:1px solid #d9e2ef;border-radius:14px;box-shadow:0 24px 70px rgba(15,23,42,.28);font:14px/1.5 Segoe UI,Arial,sans-serif";

    var title = document.createElement("div");
    title.style.cssText = "padding:16px 18px;font-weight:700;background:#f8fafc;border-bottom:1px solid #e7edf5";
    title.textContent = arguments[1] || "Informação";

    var body = document.createElement("div");
    body.style.cssText = "max-height:60vh;overflow:auto;padding:22px 20px;white-space:pre-wrap;overflow-wrap:anywhere";
    body.textContent = arguments[0] == null ? "" : String(arguments[0]);

    var footer = document.createElement("div");
    footer.style.cssText = "display:flex;justify-content:flex-end;padding:12px 16px;background:#f8fafc;border-top:1px solid #e7edf5";

    var button = document.createElement("button");
    button.type = "button";
    button.textContent = "OK";
    button.style.cssText = "min-width:100px;min-height:38px;padding:8px 16px;color:#fff;background:#2563eb;border:0;border-radius:9px;font-weight:600;cursor:pointer";
    button.onclick = function (event) {
        event.preventDefault();
        event.stopPropagation();
        overlay.remove();
    };

    footer.appendChild(button);
    panel.appendChild(title);
    panel.appendChild(body);
    panel.appendChild(footer);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    button.focus();
    return panel;
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function setWaitingState(active, text, percent) {
    var backdrop = document.getElementById("wr_waiting_backdrop");
    if (!active) {
        if (backdrop) backdrop.remove();
        return;
    }
    if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.id = "wr_waiting_backdrop";
        backdrop.className = "wr-waiting-backdrop";
        backdrop.setAttribute("role", "status");
        backdrop.setAttribute("aria-live", "polite");
        backdrop.innerHTML = '<div class="wr-waiting-card"><div class="wr-spinner" aria-hidden="true"></div><div class="wr-waiting-title">Gerando relatório</div><div class="wr-waiting-message"></div><progress class="wr-progress" max="100" value="0" aria-label="Progresso da geração"></progress><button type="button" class="wr-button wr-cancel-generation">Cancelar</button></div>';
        backdrop.querySelector(".wr-cancel-generation").addEventListener("click", cancelActiveReportWork);
        document.body.appendChild(backdrop);
    }
    backdrop.querySelector(".wr-waiting-message").textContent = text || "Preparando páginas…";
    backdrop.querySelector(".wr-progress").value = Math.max(0, Math.min(100, Number(percent) || 0));
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function normalizeReportResponse(response) {
    if (typeof response !== "string") return response;
    try { return JSON.parse(response); } catch (error) { return response; }
}

/**
 * Identifica os formulários de parâmetros gerados pelas rotinas PHP legadas.
 * Outros retornos HTML continuam passando pelo sanitizador normal.
 */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function isLegacyServerPrompt(html) {
    var security = (WRactiveConfig || WRconfig).security || {};
    if (security.legacyServerPrompts === false) return false;

    if (security.legacyPromptsSameOriginOnly !== false) {
        try {
            if (new URL(WRlastRequestUrl, window.location.href).origin !== window.location.origin) return false;
        } catch (error) {
            return false;
        }
    }

    var template = document.createElement("template");
    template.innerHTML = String(html || "");
    return Boolean(template.content.querySelector(
        ".wr_new_param[id^=\"wr_\"], #wr_date_container, #wr_period_container, #wr_find_container, #wr_info_container, #FormFindWebReport.gwbm_frm"
    ));
}

/**
 * Insere um formulário legado e recria seus scripts na ordem recebida.
 * Scripts adicionados por innerHTML não são executados pelo navegador; por isso
 * eles precisam ser substituídos por novos elementos script após inserir o DOM.
 */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 * Executa scripts de um formulário fornecido por servidor confiável. É uma integração legada privilegiada e deve ser habilitada explicitamente.
 */
function mountLegacyServerPrompt(html) {
    var template = document.createElement("template");
    template.innerHTML = String(html || "");
    var scripts = Array.from(template.content.querySelectorAll("script"));
    scripts.forEach(function (script) { script.remove(); });

    template.content.querySelectorAll("[id]").forEach(function (incoming) {
        if (!/^wr_(?:date|period|find|info)(?:_|$)/i.test(incoming.id)
            && !/^FormFindWebReport(?:_|$)/.test(incoming.id)) return;
        var previous = document.getElementById(incoming.id);
        if (previous) previous.remove();
    });

    document.body.appendChild(template.content);

    return scripts.reduce(function (chain, sourceScript) {
        return chain.then(function () {
            return new Promise(function (resolve, reject) {
                var script = document.createElement("script");
                Array.from(sourceScript.attributes).forEach(function (attribute) {
                    script.setAttribute(attribute.name, attribute.value);
                });
                if (sourceScript.src) {
                    script.addEventListener("load", resolve, { once: true });
                    script.addEventListener("error", function () {
                        reject(new Error("Não foi possível carregar um recurso do formulário de parâmetros."));
                    }, { once: true });
                } else {
                    script.textContent = sourceScript.textContent;
                }
                document.body.appendChild(script);
                if (!sourceScript.src) resolve();
            });
        });
    }, Promise.resolve());
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function decodeBase64File(base64, mimeType) {
    var binary = atob(String(base64).replace(/^data:[^,]+,/, ""));
    var bytes = new Uint8Array(binary.length);
    for (var index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return new Blob([bytes], { type: mimeType });
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function downloadBlob(blob, fileName) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function handleReportResponse(rawResponse, callback, format) {
    h2 = new Date();
    if (WRrequestTimingPending && h1 instanceof Date) {
        WRtimings.requestMs = Math.max(0, h2.getTime() - h1.getTime());
    }
    var response = normalizeReportResponse(rawResponse);

    if (typeof response === "string") {
        setWaitingState(false);
        PermitReport = true;
        var message = response.trim();
        if (message) {
            if (isLegacyServerPrompt(message)) {
                return mountLegacyServerPrompt(message).then(function () { return response; });
            }
            var notice = document.createElement("div");
            setReportHtml(notice, message);
            while (notice.firstChild) document.body.appendChild(notice.firstChild);
        }
        return response;
    }

    if (!response || typeof response !== "object") {
        throw new Error("O servidor retornou uma resposta vazia ou inválida.");
    }

    if (response.error) throw new Error(response.error);
    if (Number(response.CodErro) === 1) {
        throw new Error(response.Msg || "O servidor não conseguiu gerar o relatório.");
    }

    var reports = Object.prototype.hasOwnProperty.call(response, "Reports") ? response.Reports : response;
    var reportParams = response.Params;
    var fileFormat = String(format || "").toUpperCase();

    if (fileFormat.startsWith("XLS") || fileFormat.startsWith("CSV")) {
        if (!response.Doc) throw new Error("O servidor não retornou o arquivo solicitado.");
        var extension = fileFormat.startsWith("XLS") ? "xls" : "csv";
        var mime = extension === "xls" ? "application/vnd.ms-excel" : "text/csv;charset=utf-8";
        downloadBlob(decodeBase64File(response.Doc, mime), response.FileName || ("WebReport." + extension));
        setWaitingState(false);
        PermitReport = true;
        return Promise.resolve();
    }

    if (reports === false || reports == null) {
        throw new Error("Houve um erro ao realizar a consulta que geraria os dados do relatório.");
    }
    reports = Array.isArray(reports) ? reports : [reports];

    var rowCount = reports.reduce(function (count, report) {
        return count + (Array.isArray(report && report.Data) ? report.Data.length : 0);
    }, 0);
    if (rowCount === 0) {
        throw new Error("Não foram encontradas informações correspondentes aos parâmetros informados.");
    }

    if (typeof callback === "function") {
        var reportHtml = renderReports(reportParams, reports);
        callback(reportHtml);
        setWaitingState(false);
        PermitReport = true;
        return reportHtml;
    }
    return CreateContainer(reportParams, reports);
}

/**
 * Solicita o relatório mantendo o contrato público legado:
 * getReport(IDREPORT, URL, PARAMS, FORMATO, CALLBACKFUNCTION).
 */
/**
 * Origem: função alterada pela IA; base autoral do WebReport: Evandro / GWBM.
 * Solicita o relatório por POST usando fetch ou jQuery existente, controla timeout/cancelamento e encaminha JSON, arquivos ou formulários legados ao tratador de resposta.
 */
function getReport(IDREPORT, URL, PARAMS, FORMATO, CALLBACKFUNCTION) {
    if (!PermitReport) return Promise.resolve(false);
    if (IDREPORT == null || IDREPORT === "") {
        showWebReportMessage("Identificador de relatório não informado.");
        return Promise.resolve(false);
    }

    PermitReport = false;
    resetReportTimings(true);
    h1 = new Date(WRtimings.totalStartedAt);
    h2 = undefined;
    setWaitingState(true, "Solicitando dados…", 2);

    URL = typeof URL === "string" && URL ? URL : "./webreport.php";
    WRlastRequestUrl = URL;
    FORMATO = FORMATO || "";
    var payload = {
        IDREPORT: IDREPORT,
        FORMAT: FORMATO,
        CALLBACKFUNCTION: typeof CALLBACKFUNCTION === "string" ? CALLBACKFUNCTION : "",
        PARAMS: JSON.stringify(PARAMS)
    };
    var request;
    // A requisição ocorre antes de conhecermos a configuração do relatório.
    // Usar WRactiveConfig aqui reaproveitava indevidamente o timeout do
    // relatório exibido anteriormente e ignorava WebReport.configure().
    var requestConfig = WRconfig.request || {};
    var timeoutMs = Math.max(0, Number(requestConfig.timeoutMs) || 0);
    WRrequestController = typeof AbortController === "function" ? new AbortController() : null;
    if (timeoutMs && WRrequestController) {
        WRrequestTimeoutId = setTimeout(function () {
            WRrequestController.abort("timeout");
        }, timeoutMs);
    }

    if (window.jQuery && typeof window.jQuery.post === "function") {
        request = new Promise(function (resolve, reject) {
            WRjqRequest = window.jQuery.post(URL, payload).done(resolve).fail(function (xhr, statusText) {
                if (statusText === "abort") {
                    var abortError = new Error("A requisição foi cancelada.");
                    abortError.name = "AbortError";
                    reject(abortError);
                    return;
                }
                reject(new Error(xhr.responseText || "Não foi possível concluir a requisição com o servidor."));
            });
            if (WRrequestController) {
                WRrequestController.signal.addEventListener("abort", function () { WRjqRequest.abort(); }, { once: true });
            }
        });
    } else {
        var body = new URLSearchParams();
        Object.keys(payload).forEach(function (key) { body.set(key, payload[key] == null ? "" : payload[key]); });
        request = fetch(URL, {
            method: "POST",
            body: body,
            signal: WRrequestController ? WRrequestController.signal : undefined
        }).then(function (response) {
            if (!response.ok) throw new Error("Falha HTTP " + response.status + ".");
            return response.text();
        });
    }

    return request.then(function (response) {
        return handleReportResponse(response, CALLBACKFUNCTION, FORMATO);
    }).catch(function (error) {
        setWaitingState(false);
        PermitReport = true;
        var timedOut = WRrequestController && WRrequestController.signal.aborted && WRrequestController.signal.reason === "timeout";
        var message = timedOut
            ? "A requisição excedeu o limite de " + formatReportDuration(timeoutMs) + "."
            : (error.name === "AbortError" ? "A requisição foi cancelada." : error.message || String(error));
        showWebReportMessage(message);
        throw error;
    }).finally(function () {
        if (WRrequestTimeoutId) clearTimeout(WRrequestTimeoutId);
        WRrequestTimeoutId = null;
        WRrequestController = null;
        WRjqRequest = null;
    });
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function createReportButton(className, label, icon, handler, title) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "wr-button " + className;
    button.title = title || label;
    button.setAttribute("aria-label", title || label);
    button.innerHTML = '<span class="wr-button-icon" aria-hidden="true">' + icon + '</span>'
        + (label ? '<span class="wr-button-label">' + label + '</span>' : '');
    button.addEventListener("click", handler);
    return button;
}

/** Retorna as opções de impressão na ordem apresentada ao usuário. */
/** Fecha os menus de ação; retorna true quando havia algum aberto. */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function closeReportActionMenus(except) {
    var hadOpenMenu = false;
    document.querySelectorAll(".wr-print-wrap.is-open, .wr-export-wrap.is-open").forEach(function (menu) {
        hadOpenMenu = true;
        if (menu !== except) menu.classList.remove("is-open");
    });
    return hadOpenMenu;
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function getPrintMenuOptions(reportCount) {
    var options = [
        { scope: "all", label: "Imprimir todas as páginas" },
        { scope: "page", label: "Imprimir somente página atual" }
    ];
    if (Number(reportCount) > 1) {
        options.push({ scope: "report", label: "Imprimir somente páginas do relatório atual" });
    }
    return options;
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function createViewerShell(validation, params) {
    WRpreviousFocus = document.activeElement;
    var backdrop = document.createElement("div");
    backdrop.id = "wr_report_backdrop";
    backdrop.className = "wr-report-backdrop";
    var dialog = document.createElement("section");
    dialog.id = "wr_report_dialog";
    dialog.className = "wr-report-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "wr_report_name");
    dialog.setAttribute("tabindex", "-1");

    var toolbar = document.createElement("header");
    toolbar.className = "wr-toolbar";
    toolbar.innerHTML = '<div class="wr-brand"><span class="wr-brand-mark" aria-hidden="true">WR</span><div><strong id="wr_report_name" class="wr-report-name">Visualizador de relatórios</strong><small class="wr-status" aria-live="polite">Preparando…</small></div></div>';
    var controls = document.createElement("div");
    controls.className = "wr-toolbar-controls";

    var search = document.createElement("label");
    search.className = "wr-search";
    search.innerHTML = '<svg class="wr-search-icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path></svg><input type="search" placeholder="Pesquisar" aria-label="Pesquisar no relatório"><output>0</output>';
    search.querySelector("input").addEventListener("input", function (event) { searchReportText(event.target.value); });
    controls.appendChild(search);

    var reportJump = document.createElement("label");
    reportJump.className = "wr-report-jump";
    reportJump.innerHTML = '<span class="wr-visually-hidden">Ir para o relatório</span><select aria-label="Ir para o relatório" disabled><option>Relatório</option></select>';
    reportJump.querySelector("select").addEventListener("change", function (event) {
        var reportIndex = event.target.value;
        var targetPage = getReportPages().findIndex(function (page) { return page.dataset.reportIndex === reportIndex; });
        if (targetPage >= 0) scrollToReportPage(targetPage);
    });
    controls.appendChild(reportJump);

    var navigation = document.createElement("div");
    navigation.className = "wr-page-navigation";
    navigation.appendChild(createReportButton("wr-prev", "", "‹", function () { scrollToReportPage(CurrentPageNumber - 1); }, "Página anterior"));
    navigation.insertAdjacentHTML("beforeend", '<label><input class="wr-page-input" type="number" min="1" value="1" aria-label="Número da página"><span class="wr-page-total">/ 0</span></label>');
    navigation.querySelector("input").addEventListener("change", function (event) { scrollToReportPage(Number(event.target.value) - 1); });
    navigation.appendChild(createReportButton("wr-next", "", "›", function () { scrollToReportPage(CurrentPageNumber + 1); }, "Próxima página"));
    controls.appendChild(navigation);

    var zoom = document.createElement("div");
    zoom.className = "wr-zoom-controls";
    zoom.appendChild(createReportButton("wr-zoom-out", "", "−", function () { setReportZoom(WRpreviewZoom - WRactiveConfig.viewer.zoomStep); }, "Reduzir zoom"));
    zoom.insertAdjacentHTML("beforeend", '<output class="wr-zoom-value">100%</output>');
    zoom.appendChild(createReportButton("wr-zoom-in", "", "+", function () { setReportZoom(WRpreviewZoom + WRactiveConfig.viewer.zoomStep); }, "Aumentar zoom"));
    controls.appendChild(zoom);

    var printWrap = document.createElement("div");
    printWrap.className = "wr-print-wrap";
    var printButton = createReportButton("wr-print", "Imprimir", "⎙", function () {
        closeReportActionMenus(printWrap);
        printWrap.classList.toggle("is-open");
    }, "Escolher páginas para imprimir");
    printWrap.appendChild(printButton);
    var printOptions = getPrintMenuOptions(WRlastReports.length);
    var printMenuHtml = '<div class="wr-print-menu">' + printOptions.map(function (option) {
        return '<button type="button" data-print="' + option.scope + '">' + option.label + '</button>';
    }).join("") + '</div>';
    printWrap.insertAdjacentHTML("beforeend", printMenuHtml);
    printWrap.querySelectorAll("[data-print]").forEach(function (button) {
        button.addEventListener("click", function () {
            PrintReport(button.dataset.print);
            saveReportPreferences({ printScope: button.dataset.print });
            printWrap.classList.remove("is-open");
        });
    });
    controls.appendChild(printWrap);

    var exportWrap = document.createElement("div");
    exportWrap.className = "wr-export-wrap";
    var exportButton = createReportButton("wr-export", "Exportar", "⇩", function () {
        closeReportActionMenus(exportWrap);
        exportWrap.classList.toggle("is-open");
    });
    exportWrap.appendChild(exportButton);
    exportWrap.insertAdjacentHTML("beforeend", '<div class="wr-export-menu"><button type="button" data-export="csv">CSV completo</button><button type="button" data-export="html">Página atual (HTML)</button></div>');
    exportWrap.querySelector('[data-export="csv"]').addEventListener("click", function () { SaveReport(); exportWrap.classList.remove("is-open"); });
    exportWrap.querySelector('[data-export="html"]').addEventListener("click", function () { ExportCurrentPageHtml(); exportWrap.classList.remove("is-open"); });
    controls.appendChild(exportWrap);
    var closeIcon = '<svg class="wr-close-icon" viewBox="0 0 24 24" focusable="false"><path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5"></path></svg>';
    controls.appendChild(createReportButton("wr-close", "", closeIcon, CloseReport, "Fechar relatório"));
    toolbar.appendChild(controls);

    var body = document.createElement("div");
    body.className = "wr-viewer-body";
    body.innerHTML = '<main id="wr_report_preview" class="wr-report-preview" tabindex="0"><div id="wr_container_body" class="wr-report-pages"></div></main><footer id="wr_container_footer" class="wr-container-footer"></footer>';
    dialog.appendChild(toolbar);
    dialog.appendChild(body);
    backdrop.appendChild(dialog);
    backdrop.addEventListener("click", function (event) {
        closeReportActionMenus(event.target.closest(".wr-print-wrap, .wr-export-wrap"));
    });
    document.body.appendChild(backdrop);
    var paramsScript = document.createElement("script");
    paramsScript.id = "wr_Params";
    paramsScript.text = params == null ? "" : String(params);
    dialog.appendChild(paramsScript);
    document.body.classList.add("wr-report-open");
    requestAnimationFrame(function () { dialog.focus(); });
    return body.querySelector("#wr_container_body");
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function updateGenerationProgress(progress, reportCount) {
    var total = Math.max(1, Number(progress.total) || 1);
    var reportIndex = Number(progress.reportIndex) || 0;
    var overall = ((reportIndex + (Number(progress.current) || 0) / total) / reportCount) * 100;
    setWaitingState(true, "Processando registro " + progress.current + " de " + total + "…", overall);
}

/** Monta o visualizador e gera os relatórios sem bloquear longamente a interface. */
/**
 * Origem: função alterada pela IA; base autoral do WebReport: Evandro / GWBM.
 * Valida as definições, abre o visualizador e gera cada relatório em sequência com sua configuração. Finaliza observadores, navegação e exportações e libera o indicador de espera.
 */
async function CreateContainer(paramsOrReports, reportsArgument) {
    var params = Array.isArray(reportsArgument) ? paramsOrReports : undefined;
    var reports = Array.isArray(reportsArgument) ? reportsArgument : paramsOrReports;
    reports = Array.isArray(reports) ? reports : [reports];
    if (!WRrequestTimingPending) {
        resetReportTimings(false);
        h1 = new Date(WRtimings.totalStartedAt);
        h2 = h1;
    } else {
        WRtimings.structureMs = 0;
        WRtimings.dataMs = 0;
    }
    WRrequestTimingPending = false;
    if (!reports.length || !reports[0]) throw new Error("Nenhum relatório foi informado.");
    CloseReport();
    WRreportDatasets = reports.map(function (report) { return Array.isArray(report.Data) ? report.Data : []; });
    WRexportRows = WRreportDatasets.reduce(function (all, rows) { return all.concat(rows); }, []);
    totalRows = WRexportRows.length;
    var validations = reports.map(validateReportDefinition);
    var validation = {
        errors: validations.reduce(function (all, item) { return all.concat(item.errors); }, []),
        warnings: validations.reduce(function (all, item) { return all.concat(item.warnings); }, [])
    };
    WRlastValidation = validation;
    WRlastReports = reports.slice();
    if (validation.errors.length) {
        PermitReport = true;
        setWaitingState(false);
        showReportDiagnostics(validation);
        throw new Error("A definição do relatório contém erros.");
    }
    WRactiveConfig = getEffectiveReportConfig(reports[0]);
    WRgenerationController = new AbortController();
    var pages = createViewerShell(validation, params);
    setWaitingState(true, "Preparando fontes e estilos…", 4);
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    try {
        for (var index = 0; index < reports.length; index += 1) {
            var report = reports[index];
            var firstReportPage = getReportPages().length;
            WRactiveConfig = getEffectiveReportConfig(report);
            if (typeof CreateReportAsync === "function") {
                await CreateReportAsync(reports, index, false, function (progress) {
                    updateGenerationProgress(progress, reports.length);
                }, WRgenerationController.signal);
            } else {
                CreateReport(reports, index, false);
            }
            var reportName = report.name || report.Name || report.ReportName || ("Relatório " + (index + 1));
            getReportPages().slice(firstReportPage).forEach(function (page) {
                page.dataset.reportIndex = String(index);
                page.dataset.reportName = reportName;
            });
        }
        finishReportViewer(validation);
    } catch (error) {
        if (error.name === "AbortError") {
            CloseReport();
            showWebReportMessage("A geração do relatório foi cancelada.");
            return false;
        }
        CloseReport();
        showWebReportMessage(error.message || String(error));
        throw error;
    } finally {
        WRgenerationController = null;
        PermitReport = true;
        setWaitingState(false);
    }
    return true;
}

/** Gera diretamente em um contêiner, útil para integrações e testes automatizados. */
/**
 * Origem: função alterada pela IA; base autoral do WebReport: Evandro / GWBM.
 * Integração síncrona de baixo nível. Aceita um contêiner conectado ao DOM ou a assinatura legada de retorno HTML; utiliza IDs globais, portanto não suporta visualizadores simultâneos.
 */
function renderReports(paramsOrReports, reportsOrContainer) {
    if (Array.isArray(reportsOrContainer)) {
        var params = paramsOrReports;
        var reports = reportsOrContainer;
        var host = document.createElement("div");
        host.id = "wr_container_body";
        host.style.position = "fixed";
        host.style.left = "-100000px";
        host.style.top = "0";
        host.style.visibility = "hidden";
        host.style.overflow = "visible";
        document.body.appendChild(host);

        var paramsScript = document.createElement("script");
        paramsScript.id = "wr_Params";
        paramsScript.text = params == null ? "" : String(params);
        document.body.appendChild(paramsScript);

        var htmlReports = [];
        try {
            reports.forEach(function (report, index) {
                var currentHost = document.getElementById("wr_container_body");
                if (currentHost) currentHost.innerHTML = "";
                WRactiveConfig = getEffectiveReportConfig(report);
                htmlReports.push(encodeURI(CreateReport(reports, index, true)));
            });
        } finally {
            document.getElementById("wr_container_body")?.remove();
            document.getElementById("wr_Params")?.remove();
            document.getElementById("wr_Elements")?.remove();
        }
        return htmlReports;
    }

    var directReports = Array.isArray(paramsOrReports) ? paramsOrReports : [paramsOrReports];
    var container = reportsOrContainer;
    if (!container || !container.nodeType) {
        throw new TypeError("O contêiner de renderização não foi informado.");
    }

    WRreportDatasets = directReports.map(function (report) { return report.Data || []; });
    WRexportRows = WRreportDatasets.reduce(function (all, rows) { return all.concat(rows); }, []);
    var originalId = container.id;
    container.id = "wr_container_body";
    if (!document.getElementById("wr_Params")) {
        var emptyParams = document.createElement("script");
        emptyParams.id = "wr_Params";
        document.body.appendChild(emptyParams);
    }
    directReports.forEach(function (report, index) {
        WRactiveConfig = getEffectiveReportConfig(report);
        CreateReport(directReports, index, false);
    });
    if (originalId) container.id = originalId;
    return container;
}

/** Preenche o seletor usando somente relatórios que produziram páginas. */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function populateReportSelector(pages) {
    var select = document.querySelector(".wr-report-jump select");
    if (!select) return;
    var reports = [];
    pages.forEach(function (page) {
        var index = page.dataset.reportIndex || "0";
        if (!reports.some(function (item) { return item.index === index; })) {
            reports.push({ index: index, name: page.dataset.reportName || ("Relatório " + (Number(index) + 1)) });
        }
    });
    select.textContent = "";
    reports.forEach(function (report) {
        var option = document.createElement("option");
        option.value = report.index;
        option.textContent = report.name;
        select.appendChild(option);
    });
    select.disabled = reports.length < 2;
    var jump = select.closest(".wr-report-jump");
    if (jump) jump.hidden = reports.length < 2;
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function finishReportViewer(validation) {
    var preview = document.getElementById("wr_report_preview");
    var pages = getReportPages();
    if (!preview) return;
    preview.classList.add("wr-preview-ready");
    preview.style.setProperty("--wr-page-zoom", WRpreviewZoom);
    var status = document.querySelector(".wr-status");
    if (status) status.textContent = "";
    var total = document.querySelector(".wr-page-total");
    if (total) total.textContent = "/ " + pages.length;
    populateReportSelector(pages);
    WRtimings.reports.forEach(function (entry, index) {
        entry.pages = pages.filter(function (page) { return page.dataset.reportIndex === String(index); }).length;
    });
    bindPerformanceFooter();
    deferReportPages(pages);
    observeReportPages(pages);
    installViewerKeyboard();
    var savedZoom = Number(loadReportPreferences().zoom);
    setReportZoom(savedZoom || 1);
    scrollToReportPage(0, false);
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function getReportPages() {
    return Array.from(document.querySelectorAll("#wr_container_body .wr_page, #wr_container_body .page, #wr_container_body [data-wr-page]"));
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function buildPageMap(pages) {
    var map = document.querySelector(".wr-page-map");
    if (!map) return;
    map.textContent = "";
    pages.forEach(function (page, index) {
        page.dataset.wrPage = String(index + 1);
        var button = document.createElement("button");
        button.type = "button";
        button.textContent = String(index + 1);
        button.title = "Ir para a página " + (index + 1);
        button.addEventListener("click", function () { scrollToReportPage(index); });
        map.appendChild(button);
    });
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function observeReportPages(pages) {
    if (WRpageObserver) WRpageObserver.disconnect();
    var preview = document.getElementById("wr_report_preview");
    if (!preview || !window.IntersectionObserver) return;
    WRpageObserver = new IntersectionObserver(function (entries) {
        var visible = entries.filter(function (entry) { return entry.isIntersecting; }).sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; })[0];
        if (visible) setCurrentPage(pages.indexOf(visible.target));
    }, { root: preview, threshold: [0.15, 0.45, 0.75] });
    pages.forEach(function (page) { WRpageObserver.observe(page); });
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function setCurrentPage(index) {
    var pages = getReportPages();
    if (!pages.length) return;
    CurrentPageNumber = Math.max(0, Math.min(pages.length - 1, Number(index) || 0));
    var input = document.querySelector(".wr-page-input");
    if (input) input.value = CurrentPageNumber + 1;
    var activePage = pages[CurrentPageNumber];
    var reportName = document.querySelector(".wr-report-name");
    if (reportName) reportName.textContent = activePage.dataset.reportName || "Visualizador de relatórios";

    var activeReportIndex = activePage.dataset.reportIndex;
    var reportPageCount = activeReportIndex == null
        ? pages.length
        : pages.filter(function (page) { return page.dataset.reportIndex === activeReportIndex; }).length;
    var status = document.querySelector(".wr-status");
    if (status) status.textContent = reportPageCount + (reportPageCount === 1 ? " página" : " páginas");
    var reportSelect = document.querySelector(".wr-report-jump select");
    if (reportSelect && activeReportIndex != null) reportSelect.value = activeReportIndex;
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function scrollToReportPage(index, smooth) {
    var pages = getReportPages();
    if (!pages.length) return;
    index = Math.max(0, Math.min(pages.length - 1, Number(index) || 0));
    pages[index].scrollIntoView({ behavior: smooth === false ? "auto" : "smooth", block: "start" });
    setCurrentPage(index);
}

/** Restaura o conteúdo de uma página adiada. */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function materializeReportPage(page) {
    if (!page || !page.__wrDeferredContent) return page;
    page.appendChild(page.__wrDeferredContent);
    page.__wrDeferredContent = null;
    page.classList.remove("wr-page-deferred");
    page.removeAttribute("aria-busy");
    return page;
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function materializeAllReportPages(pages) {
    (pages || getReportPages()).forEach(materializeReportPage);
}

/** Mantém as primeiras páginas prontas e adia o DOM interno das páginas distantes. */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function deferReportPages(pages) {
    if (WRmaterializeObserver) WRmaterializeObserver.disconnect();
    WRmaterializeObserver = null;
    var performanceConfig = (WRactiveConfig || WRconfig).performance || {};
    if (performanceConfig.virtualizePages === false || !window.IntersectionObserver) return;
    var initialPages = Math.max(1, Number(performanceConfig.initialPages) || 4);
    var preview = document.getElementById("wr_report_preview");
    WRmaterializeObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            materializeReportPage(entry.target);
            WRmaterializeObserver.unobserve(entry.target);
        });
    }, {
        root: preview,
        rootMargin: String(performanceConfig.materializeMargin || "1600px") + " 0px"
    });
    pages.slice(initialPages).forEach(function (page) {
        if (!page.firstChild) return;
        var fragment = document.createDocumentFragment();
        while (page.firstChild) fragment.appendChild(page.firstChild);
        page.__wrDeferredContent = fragment;
        page.classList.add("wr-page-deferred");
        page.setAttribute("aria-busy", "true");
        WRmaterializeObserver.observe(page);
    });
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function bindPerformanceFooter() {
    var footerButton = document.querySelector(".wr-performance-summary");
    if (footerButton && !footerButton.dataset.bound) {
        footerButton.dataset.bound = "1";
        footerButton.addEventListener("click", showPerformanceDetails);
    }
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function setReportZoom(value) {
    var viewer = document.getElementById("wr_container_body");
    if (!viewer || !WRactiveConfig) return;
    var options = WRactiveConfig.viewer;
    WRpreviewZoom = Math.max(options.zoomMin, Math.min(options.zoomMax, Number(value) || 1));
    viewer.style.setProperty("--wr-page-zoom", WRpreviewZoom);
    var output = document.querySelector(".wr-zoom-value");
    if (output) output.textContent = Math.round(WRpreviewZoom * 100) + "%";
    saveReportPreferences({ zoom: WRpreviewZoom });
}

/** Pesquisa texto sem alterar a árvore do relatório, preservando medidas e paginação. */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function searchReportText(query) {
    var output = document.querySelector(".wr-search output");
    if (window.CSS && CSS.highlights) CSS.highlights.delete("wr-search");
    query = String(query || "").trim().toLocaleLowerCase(WRactiveConfig && WRactiveConfig.locale || "pt-BR");
    if (!query) {
        if (output) output.textContent = "0";
        return;
    }
    var root = document.getElementById("wr_container_body");
    materializeAllReportPages();
    var ranges = [];
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) { return node.parentElement && node.parentElement.closest("script,style") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
    });
    var node;
    while ((node = walker.nextNode())) {
        var text = node.nodeValue.toLocaleLowerCase(WRactiveConfig && WRactiveConfig.locale || "pt-BR");
        var position = 0;
        while ((position = text.indexOf(query, position)) !== -1) {
            var range = new Range();
            range.setStart(node, position);
            range.setEnd(node, position + query.length);
            ranges.push(range);
            position += Math.max(1, query.length);
        }
    }
    if (window.CSS && CSS.highlights && window.Highlight) CSS.highlights.set("wr-search", new Highlight(...ranges));
    if (output) output.textContent = String(ranges.length);
    if (ranges[0]) ranges[0].startContainer.parentElement.scrollIntoView({ behavior: "smooth", block: "center" });
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function installViewerKeyboard() {
    if (WRkeydownHandler) document.removeEventListener("keydown", WRkeydownHandler, true);
    WRkeydownHandler = function (event) {
        if (!document.getElementById("wr_report_backdrop")) return;
        if (event.key === "Escape") {
            // O visualizador é modal e assume integralmente o Escape enquanto
            // estiver aberto. A captura impede que manipuladores globais do
            // sistema removam também o último formulário .gwbm_frm.
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            if (closeReportActionMenus()) {
                return;
            }
            CloseReport();
            return;
        }
        if (event.key === "Tab") {
            var dialog = document.getElementById("wr_report_dialog");
            var focusable = dialog ? Array.from(dialog.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')).filter(function (element) {
                return !element.hidden && element.getClientRects().length;
            }) : [];
            if (focusable.length) {
                var first = focusable[0];
                var last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
            event.preventDefault();
            document.querySelector(".wr-search input").focus();
        }
        if (event.key === "PageDown") { event.preventDefault(); scrollToReportPage(CurrentPageNumber + 1); }
        if (event.key === "PageUp") { event.preventDefault(); scrollToReportPage(CurrentPageNumber - 1); }
        if (event.key === "Home" && !/input|textarea/i.test(event.target.tagName)) { event.preventDefault(); scrollToReportPage(0); }
        if (event.key === "End" && !/input|textarea/i.test(event.target.tagName)) { event.preventDefault(); scrollToReportPage(getReportPages().length - 1); }
        if ((event.ctrlKey || event.metaKey) && (event.key === "+" || event.key === "=")) { event.preventDefault(); setReportZoom(WRpreviewZoom + WRactiveConfig.viewer.zoomStep); }
        if ((event.ctrlKey || event.metaKey) && event.key === "-") { event.preventDefault(); setReportZoom(WRpreviewZoom - WRactiveConfig.viewer.zoomStep); }
    };
    document.addEventListener("keydown", WRkeydownHandler, true);
}

/**
 * Cria regras @page compatíveis com as dimensões físicas dos relatórios incluídos.
 */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function installPrintPageRules(pages) {
    var previous = document.getElementById("wr_dynamic_print_pages");
    if (previous) previous.remove();

    var sizes = [];
    pages.forEach(function (page) {
        var width = page.style.getPropertyValue("width") || getComputedStyle(page).width;
        var height = page.style.getPropertyValue("height") || getComputedStyle(page).height;
        var key = width + "x" + height;
        var size = sizes.find(function (item) { return item.key === key; });
        if (!size) {
            size = { key: key, name: "wr_print_size_" + sizes.length, width: width, height: height };
            sizes.push(size);
        }
        page.dataset.wrPrintPageSize = size.name;
    });

    var activePrintConfig = WRactiveConfig && WRactiveConfig.print || {};
    var globalPrintConfig = WRconfig && WRconfig.print || {};
    var mode = String(
        activePrintConfig.pageSizeMode && activePrintConfig.pageSizeMode !== "auto"
            ? activePrintConfig.pageSizeMode
            : (globalPrintConfig.pageSizeMode || "auto")
    ).toLowerCase();
    var hasGlobalLegacyLock = Object.prototype.hasOwnProperty.call(globalPrintConfig, "lockPageSize");
    var hasActiveLegacyLock = Object.prototype.hasOwnProperty.call(activePrintConfig, "lockPageSize");
    if (hasGlobalLegacyLock) mode = globalPrintConfig.lockPageSize === true ? "report" : "browser";
    else if (hasActiveLegacyLock) mode = activePrintConfig.lockPageSize === true ? "report" : "browser";
    if (["auto", "browser", "report"].indexOf(mode) === -1) mode = "auto";

    var shouldLockPageSize = mode === "report" || (mode === "auto" && sizes.length > 1);
    if (!shouldLockPageSize) {
        pages.forEach(function (page) { delete page.dataset.wrPrintPageSize; });
        return;
    }

    var rules = sizes.map(function (size) {
        return "@page " + size.name + " { size: " + size.width + " " + size.height + "; margin: 0; }"
            + "@media print { #wr_container_body .wr_page[data-wr-print-page-size=\"" + size.name + "\"] { page: " + size.name + "; } }";
    }).join("\n");
    var style = document.createElement("style");
    style.id = "wr_dynamic_print_pages";
    style.textContent = rules;
    document.head.appendChild(style);
}

/** Imprime somente o escopo escolhido e mantém a seleção até o fim do diálogo nativo. */
/**
 * Origem: função alterada pela IA; base autoral do WebReport: Evandro / GWBM.
 * Marca as páginas incluídas, materializa conteúdo adiado e instala @page por dimensão antes de chamar window.print. Limpa as marcas após o diálogo nativo.
 */
function PrintReport(scope) {
    var pages = getReportPages();
    if (!pages.length) return showWebReportMessage("Nenhuma página está disponível para impressão.");
    scope = scope || loadReportPreferences().printScope || "all";
    var active = pages[CurrentPageNumber];
    var activeReportIndex = active && active.dataset.reportIndex;
    var included = [];

    pages.forEach(function (page, index) {
        var include = scope === "all"
            || (scope === "page" && index === CurrentPageNumber)
            || (scope === "report" && page.dataset.reportIndex === activeReportIndex);
        page.classList.remove("wr-print-included", "wr-print-excluded", "wr-print-first", "wr-print-last");
        page.classList.add(include ? "wr-print-included" : "wr-print-excluded");
        if (include) {
            materializeReportPage(page);
            included.push(page);
        }
    });

    if (!included.length) return showWebReportMessage("Nenhuma página corresponde ao escopo de impressão.");
    included[0].classList.add("wr-print-first");
    included[included.length - 1].classList.add("wr-print-last");
    installPrintPageRules(included);

    document.body.classList.add("wr-printing");
    document.body.dataset.wrPrintScope = scope;
    var cleaned = false;
    var media = typeof window.matchMedia === "function" ? window.matchMedia("print") : null;
    var cleanup = function () {
        if (cleaned) return;
        cleaned = true;
        pages.forEach(function (page) {
            page.classList.remove("wr-print-included", "wr-print-excluded", "wr-print-first", "wr-print-last");
            delete page.dataset.wrPrintPageSize;
        });
        var dynamicStyle = document.getElementById("wr_dynamic_print_pages");
        if (dynamicStyle) dynamicStyle.remove();
        document.body.classList.remove("wr-printing");
        delete document.body.dataset.wrPrintScope;
        window.removeEventListener("afterprint", cleanup);
        window.removeEventListener("focus", focusCleanup);
        if (media && typeof media.removeEventListener === "function") media.removeEventListener("change", mediaCleanup);
    };
    var mediaCleanup = function (event) {
        if (!event.matches) cleanup();
    };
    var focusCleanup = function () {
        setTimeout(cleanup, 0);
    };

    window.addEventListener("afterprint", cleanup);
    window.addEventListener("focus", focusCleanup, { once: true });
    if (media && typeof media.addEventListener === "function") media.addEventListener("change", mediaCleanup);

    // Força o navegador a aplicar classes e regras @page antes de abrir a impressão.
    void document.body.offsetHeight;
    window.print();
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function escapeCsvCell(value, delimiter, protectFormulas) {
    var text = value == null ? "" : String(value);
    if (protectFormulas && /^\s*[=+\-@]/.test(text)) text = "'" + text;
    if (text.indexOf('"') !== -1) text = text.replace(/"/g, '""');
    return /["\r\n]/.test(text) || text.indexOf(delimiter) !== -1 ? '"' + text + '"' : text;
}

/** Exporta todos os conjuntos de dados, preservando a união das colunas. */
/**
 * Origem: função alterada pela IA; base autoral do WebReport: Evandro / GWBM.
 * Exporta os dados originais, unindo colunas dos relatórios. Aspas, delimitadores e quebras são escapados; células com prefixos de fórmula recebem proteção opcional.
 */
function SaveReport(options) {
    var config = mergeReportConfig((WRactiveConfig || WRconfig).export, options || {});
    var rows = WRexportRows.length ? WRexportRows : WRreportDatasets.reduce(function (all, data) { return all.concat(data); }, []);
    if (!rows.length) return showWebReportMessage("Não há dados para exportar.");
    var columns = [];
    var known = new Set();
    rows.forEach(function (row) {
        Object.keys(row || {}).forEach(function (column) {
            if (!known.has(column)) { known.add(column); columns.push(column); }
        });
    });
    var delimiter = config.delimiter || loadReportPreferences().csvDelimiter || ";";
    saveReportPreferences({ csvDelimiter: delimiter });
    var protect = (WRactiveConfig || WRconfig).security.protectSpreadsheetFormulas !== false;
    var lines = [columns.map(function (column) { return escapeCsvCell(column, delimiter, protect); }).join(delimiter)];
    rows.forEach(function (row) {
        lines.push(columns.map(function (column) { return escapeCsvCell(row[column], delimiter, protect); }).join(delimiter));
    });
    var content = (config.bom === false ? "" : "\ufeff") + lines.join("\r\n");
    downloadBlob(new Blob([content], { type: "text/csv;charset=utf-8" }), (config.fileName || "WebReport") + ".csv");
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function ExportCurrentPageHtml() {
    var page = getReportPages()[CurrentPageNumber];
    if (!page) return showWebReportMessage("Nenhuma página está disponível para exportação.");
    materializeReportPage(page);
    var html = '<!doctype html><html><head><meta charset="utf-8"><title>WebReport</title></head><body>' + page.outerHTML + "</body></html>";
    downloadBlob(new Blob([html], { type: "text/html;charset=utf-8" }), "WebReport-pagina-" + (CurrentPageNumber + 1) + ".html");
}

/**
 * Executa verificações de regressão sobre o relatório já paginado.
 * Retorna um objeto serializável para uso em testes e diagnósticos.
 */
/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function runReportRegressionChecks() {
    var pages = getReportPages();
    materializeAllReportPages(pages);
    var errors = [];
    var warnings = [];

    pages.forEach(function (page, pageIndex) {
        var pageRect = page.getBoundingClientRect();
        if (!pageRect.width || !pageRect.height) {
            errors.push("Página " + (pageIndex + 1) + " sem dimensões mensuráveis.");
        }

        var contentBottom = typeof getPageContentBottom === "function"
            ? getPageContentBottom(page)
            : page.getBoundingClientRect().bottom;
        var verticalOverflow = Array.from(page.querySelectorAll("div[type='1'], div[type='2'], div[type='3'], div[type='4']"))
            .some(function (element) {
                return getComputedStyle(element).display !== "none"
                    && element.getBoundingClientRect().bottom > contentBottom + 1;
            });
        if (verticalOverflow) {
            errors.push("Conteúdo vertical invade a margem ou o rodapé na página " + (pageIndex + 1) + ".");
        }

        page.querySelectorAll(".WR_LongText").forEach(function (element) {
            if (element.scrollHeight > element.clientHeight + 1 || element.scrollWidth > element.clientWidth + 1) {
                errors.push("Texto longo excede seus limites na página " + (pageIndex + 1) + ".");
            }
        });

        page.querySelectorAll("div[type='3'][data-wr-group-mode='dynamic']").forEach(function (group) {
            var hasDetail = Array.from(group.querySelectorAll("div[type='1']")).some(function (band) {
                var bandType = band.getAttribute("bandtype");
                return bandType == null || bandType === "3";
            });
            if (!hasDetail) {
                errors.push("Group sem registros deixado isolado na página " + (pageIndex + 1) + ".");
            }
        });

        var parents = [page].concat(Array.from(page.querySelectorAll("div[type='3']")));
        parents.forEach(function (parent) {
            var groups = Array.from(parent.children).filter(function (element) {
                return element.getAttribute && element.getAttribute("type") === "3";
            }).sort(function (a, b) { return a.offsetTop - b.offsetTop; });
            for (var index = 1; index < groups.length; index += 1) {
                var previousBottom = groups[index - 1].offsetTop + groups[index - 1].offsetHeight;
                if (groups[index].offsetTop < previousBottom - 1) {
                    errors.push("Sobreposição de grupos detectada na página " + (pageIndex + 1) + ".");
                    break;
                }
            }
        });

        if (page.scrollWidth > page.clientWidth + 2) {
            warnings.push("Conteúdo horizontal excedente na página " + (pageIndex + 1) + ".");
        }
    });

    return {
        passed: errors.length === 0,
        pages: pages.length,
        reports: new Set(pages.map(function (page) { return page.dataset.reportIndex || "0"; })).size,
        errors: Array.from(new Set(errors)),
        warnings: Array.from(new Set(warnings))
    };
}

/**
 * Origem: função criada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function registerReportExporter(name, handler) {
    if (!name || typeof handler !== "function") throw new TypeError("O exportador precisa de nome e função.");
    WRexporters[name] = handler;
}

/**
 * Origem: função alterada pela IA; base autoral do WebReport: Evandro / GWBM.
 */
function CloseReport() {
    cancelActiveReportWork();
    if (WRpageObserver) { WRpageObserver.disconnect(); WRpageObserver = null; }
    if (WRmaterializeObserver) { WRmaterializeObserver.disconnect(); WRmaterializeObserver = null; }
    if (WRkeydownHandler) { document.removeEventListener("keydown", WRkeydownHandler, true); WRkeydownHandler = null; }
    if (window.CSS && CSS.highlights) CSS.highlights.delete("wr-search");
    var backdrop = document.getElementById("wr_report_backdrop");
    if (backdrop) backdrop.remove();
    setWaitingState(false);
    document.body.classList.remove("wr-report-open", "wr-printing");
    PermitReport = true;
    if (WRpreviousFocus && document.contains(WRpreviousFocus) && typeof WRpreviousFocus.focus === "function") {
        WRpreviousFocus.focus();
    }
    WRpreviousFocus = null;
}

window.WebReport = {
    configure: configureWebReport,
    getReport: getReport,
    render: renderReports,
    open: CreateContainer,
    close: CloseReport,
    exportCsv: SaveReport,
    print: PrintReport,
    diagnostics: getReportDiagnosticSnapshot,
    downloadDiagnostics: downloadReportDiagnostics,
    runRegressionChecks: runReportRegressionChecks,
    registerExporter: registerReportExporter,
    validate: validateReportDefinition,
    defaults: WR_DEFAULT_CONFIG
};

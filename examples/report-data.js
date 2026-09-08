/**
 * Criado pela IA para os exemplos. Todos os nomes e valores são fictícios.
 * Os helpers abaixo geram o JSON nativo {n,t,properties:[{t,v}]}.
 * São conveniências dos exemplos, não fazem parte da API do WebReport.
 */
var ExampleReports = (function () {
    function object(n, t, properties) {
        return { n, t, properties: Object.entries(properties).map(([t, v]) => ({ t: Number(t), v: String(v) })) };
    }
    function band(n, parent, type, height, extra = {}) {
        return object(n, 1, { 33: parent, 7: type, 20: height, ...extra });
    }
    function text(n, parent, caption, left, width, extra = {}) {
        return object(n, 5, { 33: parent, 9: caption, 22: left, 28: 0, 31: width, 20: 22, 18: 10, ...extra });
    }
    function field(n, parent, field, left, width, extra = {}) {
        return object(n, 7, { 33: parent, 10: field, 22: left, 28: 0, 31: width, 20: 22, 18: 10, ...extra });
    }
    function result(n, parent, info, left, extra = {}) {
        const properties = { 33: parent, 39: info, 10: 'valor', 22: left, 28: 0, 31: 110, 20: 24, 18: 10, 1: 2, 32: '#0.00', ...extra };
        if (properties[52]) delete properties[10]; // Fórmula substitui DataField.
        return object(n, 17, properties);
    }
    function footer(prefix, width) {
        return [band(prefix + 'Footer', prefix, 6, 26),
            object(prefix + 'Page', 14, { 33: prefix + 'Footer', 39: 5, 9: 'Página #', 22: 0, 31: width, 20: 22, 1: 2, 18: 9 })];
    }
    function sales(params = {}) {
        const p = 'Vendas';
        const Structure = [object(p, 0, { 43: 0 }),
            band('Cabecalho', p, 1, 64), text('Titulo', 'Cabecalho', 'VENDAS POR SETOR', 0, 690, { 18: 17, 20: 34, 15: 1 }),
            text('Subtitulo', 'Cabecalho', (params['<DATA INICIAL>'] || '2026-09-01') + ' a ' + (params['<DATA FINAL>'] || '2026-09-30') + ' · ' + (params['<[Informe um texto qualquer:]>'] || 'Demonstração'), 0, 690, { 28: 30, 18: 9 }),
            object('Setor', 3, { 33: p, 10: 'setor' }),
            band('GrupoTitulo', 'Setor', 0, 32), field('GrupoNome', 'GrupoTitulo', 'setor', 0, 690, { 15: 1 }),
            band('Colunas', 'Setor', 2, 26, { 44: 'e2e8f0' }),
            text('ColProduto', 'Colunas', 'Produto', 0, 350), text('ColQtd', 'Colunas', 'Quant.', 360, 70, { 1: 2 }),
            text('ColPreco', 'Colunas', 'Preço', 440, 100, { 1: 2 }), text('ColTotal', 'Colunas', 'Valor', 550, 110, { 1: 2 }),
            band('Registro', 'Setor', 3, 26, { 24: '#f1f5f9', 11: 1 }),
            field('Produto', 'Registro', 'produto', 0, 350), field('Qtd', 'Registro', 'quantidade', 360, 70, { 1: 2 }),
            field('Preco', 'Registro', 'preco', 440, 100, { 1: 2, 32: '#0.00' }),
            result('Valor', 'Registro', 8, 550, { 10: '', 52: 'quantidade * preco' }),
            band('Subtotal', 'Setor', 5, 34), text('SubtotalLabel', 'Subtotal', 'Subtotal do setor', 0, 400, { 15: 1 }), result('SubtotalValor', 'Subtotal', 9, 550, { 15: 1 }),
            band('Resumo', p, 4, 70), text('TotalLabel', 'Resumo', 'Total geral', 0, 400, { 15: 1 }), result('Total', 'Resumo', 9, 550, { 15: 1 }),
            text('MediaLabel', 'Resumo', 'Média por registro', 0, 400, { 28: 30 }), result('Media', 'Resumo', 0, 550, { 28: 30 }), ...footer(p, 680)];
        // Campos de dados usam minúsculas. Grupos exigem registros consecutivos.
        const Data = Array.from({ length: 48 }, (_, i) => {
            const quantidade = i % 5 + 1;
            const preco = 10 + (i % 7) * 2.5;
            return { data: '2026-09-' + String(i % 24 + 1).padStart(2, '0'), setor: ['Administração', 'Operações', 'Atendimento'][Math.floor(i / 16)], produto: 'Produto demonstrativo ' + String(i + 1).padStart(2, '0'), quantidade, preco, valor: quantidade * preco };
        }).filter(row => (!params['<DATA INICIAL>'] || row.data >= params['<DATA INICIAL>'])
            && (!params['<DATA FINAL>'] || row.data <= params['<DATA FINAL>'])
            && (!params.setores || params.setores.includes(row.setor)));
        return [{ Name: 'Vendas por setor', Structure, Data }];
    }
    function documents(params = {}) {
        const p = 'Documentos';
        const Structure = [object(p, 0, { 43: 0 }), band('DocHeader', p, 1, 55),
            text('DocTitle', 'DocHeader', 'CADERNO DE DOCUMENTOS', 0, 680, { 18: 17, 20: 34, 15: 1 }),
            band('Documento', p, 3, 80, { 25: 1 }),
            object('Conteudo', 8, { 33: 'Documento', 22: 0, 28: 0, 31: 680, 20: 70, 18: 11, 62: '20px', 60: 1, 37: '<h2>[TITULO]</h2><p>[ORGANIZACAO] · [DATA] · [RESPONSAVEL]</p><p>[OBSERVACAO]</p><p>[TEXTO]</p><p><b>[MARCADOR]</b></p>' }), ...footer(p, 680)];
        const sentence = 'Este texto demonstra a divisão automática de conteúdo entre páginas, preservando a sequência da leitura e a área reservada ao rodapé. ';
        const Data = [
            { titulo: 'Documento A', texto: sentence.repeat(90), marcador: 'FIM DOCUMENTO A' },
            { titulo: 'Documento B', texto: sentence.repeat(4), marcador: 'FIM DOCUMENTO B' },
            { titulo: 'Documento C', texto: sentence.repeat(5), marcador: 'FIM DOCUMENTO C' }
        ];
        // Texto digitado pelo usuário entra como texto literal, não como HTML.
        const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
        Data.forEach(row => Object.assign(row, {
            organizacao: escape(params['<<ORGANIZACAO>>'] || 'Organização Exemplo'),
            data: params['<DATA>'] || '2026-09-08',
            responsavel: escape(params.responsavel || 'Equipe A'),
            observacao: escape(params['<[Informe um texto qualquer:]>'] || 'Documentos para conferência')
        }));
        const r = 'ResumoPaisagem';
        const summary = { Name: 'Resumo em paisagem', Structure: [object(r, 0, { 43: 1 }),
            band('PaisagemHeader', r, 1, 60), text('PaisagemTitle', 'PaisagemHeader', 'RESUMO DOS DOCUMENTOS · PAISAGEM', 0, 1000, { 18: 17, 20: 34, 15: 1 }),
            band('PaisagemDetail', r, 3, 40, { 11: 1 }), field('NomeDocumento', 'PaisagemDetail', 'titulo', 0, 450),
            field('Situacao', 'PaisagemDetail', 'situacao', 470, 480), ...footer(r, 1020)],
            Data: Data.map(row => ({ titulo: row.titulo, situacao: 'Conteúdo demonstrativo concluído' })) };
        return [{ Name: 'Documentos em retrato', Structure, Data }, summary];
    }
    return { sales, documents };
})();

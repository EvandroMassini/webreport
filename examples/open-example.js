/** Criado pela IA: integra a API pública aos botões dos dois exemplos. */
(function () {
    const example = document.currentScript.dataset.example;
    const button = document.getElementById('open');
    const status = document.getElementById('status');
    WebReport.configure({ viewer: { persistPreferences: false } });
    button.addEventListener('click', async function () {
        button.disabled = true;
        status.textContent = 'Gerando…';
        try {
            const sectors = ['Administração', 'Operações', 'Atendimento'];
            const params = example === 'sales'
                ? await ExampleParameters.ask(['<DATA INICIAL>', '<DATA FINAL>', '<[Informe um texto qualquer:]>'], {
                    title: 'Período e setores',
                    defaults: { '<DATA INICIAL>': '2026-09-01', '<DATA FINAL>': '2026-09-30', '<[Informe um texto qualquer:]>': 'Conferência de vendas', setores: sectors },
                    selections: [{ key: 'setores', label: 'Setores (Ctrl/Cmd para selecionar vários)', multiple: true, options: sectors.map(value => ({ value, label: value })) }]
                })
                : await ExampleParameters.ask(['<DATA>', '<[Informe um texto qualquer:]>', '<<ORGANIZACAO>>'], {
                    title: 'Dados dos documentos',
                    defaults: { '<DATA>': '2026-09-08', '<[Informe um texto qualquer:]>': 'Documentos para conferência', '<<ORGANIZACAO>>': 'Organização Exemplo', responsavel: 'Equipe A' },
                    selections: [{ key: 'responsavel', label: 'Responsável', options: ['Equipe A', 'Equipe B'].map(value => ({ value, label: value })) }]
                });
            if (params === null) { status.textContent = 'Geração cancelada.'; return; }
            const reports = ExampleReports[example](params);
            if (!reports[0].Data.length) { status.textContent = 'Nenhum registro encontrado para os filtros informados.'; return; }
            await WebReport.open(reports);
            status.textContent = 'Relatório gerado. Use o cabeçalho do visualizador para pesquisar, imprimir ou exportar.';
        } catch (error) {
            status.textContent = 'Falha: ' + error.message;
        } finally {
            button.disabled = false;
        }
    });
})();

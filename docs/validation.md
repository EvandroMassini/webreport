# Validação da distribuição

Execução local em 8 de setembro de 2026, com Playwright 1.62.1 e Microsoft Edge/Chromium 152.0.4191.66 em modo headless.

A suíte `tests/run.cjs` passou em todas as verificações da execução final:

- 48 linhas de vendas, fórmula de cada registro, três subtotais, total 2.440,00 e média 50,83.
- Múltiplas bands Detail sem duplicar soma ou média.
- Ausência de sobreposição detectada pelo verificador do motor no relatório de vendas.
- Cancelamento por botão e Escape, rejeição de período invertido, filtro real de datas/setores e resposta para ausência de dados.
- Data, texto livre, constante e responsável incorporados ao documento.
- Texto HTML literal fornecido pelo usuário preservado como texto.
- Texto longo dividido sem perda das 99 ocorrências de conteúdo demonstrativo.
- Quebra entre documentos e orientação própria de cada relatório encadeado.
- CSV com todas as linhas, escape de aspas/quebras e proteção de fórmulas.
- Rejeição de caracteres inválidos em fórmulas, proteção da mesclagem de configurações e filtro HTML.
- Seleção de páginas e visibilidade CSS nos três escopos de impressão.
- Execução do exemplo 01 diretamente por arquivo HTML, sem servidor.
- Nenhuma exceção JavaScript não tratada durante a suíte.

Também foram realizadas verificações de sintaxe, instalação via `npm ci` e inspeção visual das capturas de vendas, documentos e formulário de período. Os resultados detalhados e capturas são produzidos novamente em `test-results/` a cada execução; essa pasta não integra o pacote publicado.

A suíte controla a preparação CSS de impressão e substitui `window.print` durante o teste. Ela não automatiza a impressão física nem prova ausência de páginas em branco em todos os drivers. A impressão final, Firefox e Safari devem ser validados no ambiente de destino. O workflow fornecido executa os testes com o Chromium do Playwright; a execução no GitHub ocorrerá depois de publicar o repositório.

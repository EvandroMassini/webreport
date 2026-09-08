# Arquitetura e manutenção

O código conserva scripts clássicos e funções globais para compatibilidade com integrações anteriores. Não é um módulo ES, nem suporta vários motores independentes na mesma página.

## Ciclo de geração

1. `CreateContainer` valida a definição e cria o visualizador.
2. `CreateReportGenerator` transforma `Structure` em templates de DOM ocultos, respeitando a ordem de pais e filhos. Cada relatório recebe suas métricas físicas.
3. Para cada linha de `Data`, `GetDetails` abre groups quando necessário, calcula valores, preenche campos e mede a band resultante.
4. `CheckHeight` move conteúdo que não cabe. `checkLongText` divide Memo/RichText em intervalos do DOM, preservando o texto e a hierarquia necessária.
5. `CloseElement` finaliza groups e páginas com rodapés e totalizadores. O indicador `endOfReport` permite inserir o resumo final.
6. `finishReportViewer` configura navegação, pesquisa, virtualização e exportação.

As variáveis `Elements`, `tPage`, `CurrentPage`, `Rows`, `CurrentRecord` e `WRactiveConfig` são compartilhadas. Uma nova renderização não pode competir com outra. Para aplicações com múltiplos relatórios visíveis simultaneamente, utilize documentos/iframes separados controlados pela aplicação.

## Texto longo

`getLongTextBreakPoints` coleta posições de quebra. `findLongTextBreak` mede o maior trecho que cabe na área útil. `renderLongTextRange` usa Range para preservar o conteúdo HTML, e `createLongTextPage` abre uma continuação com os contêineres necessários. `checkHolderHeigth` e `SetHeight` sincronizam a geometria após as alterações.

Esse processo depende de layout real, fontes carregadas e um DOM conectado. jsdom não verifica a paginação: os testes usam navegador real. Textos de um único registro podem consumir vários frames; os lotes assíncronos são definidos em termos de registros e não eliminam todo bloqueio causado por um registro excepcionalmente grande.

## Groups e totalizadores

Um group dinâmico é aberto somente quando uma Detail precisa dele. `DataField` determina a mudança de grupo pela sequência dos registros. `Compute` acumula estatísticas nos templates; `CloseElement` clona os totalizadores e `ResetCount` reinicia os correspondentes ao grupo. SQL, ordenação e joins não são executados no navegador.

## CSS e impressão

`src/webreport.css` é a única folha necessária. Classes `.wr-*`, `.WR_*` e IDs `wr_*` pertencem ao visualizador. A folha inclui variáveis de tema, toolbar, controles, páginas, progresso e impressão. As regras globais dentro de `@media print` modificam o documento durante impressão; hospede a biblioteca em um documento próprio se a aplicação exigir isolamento completo.

`PrintReport` materializa páginas adiadas e marca as selecionadas. `installPrintPageRules` cria tamanhos nomeados por dimensão, permitindo retrato e paisagem. `afterprint` e eventos relacionados restauram a interface. Não modificar só o CSS de tela para corrigir uma quebra de paginação: a medida usada pelo motor e a medida física impressa precisam permanecer coerentes.

## Dependências

Nenhum CSS de `forms`, `dashboard`, `message` ou do construtor é necessário para `WebReport.open`. `MAlert` é utilizado quando já está disponível; o visualizador tem mensagem própria de fallback. jQuery só é usado opcionalmente em `getReport`. Formulários HTML legados podem depender de funções e estilos externos fornecidos pelo sistema que os gerou.

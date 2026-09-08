# Revisão para publicação

Revisão estática do JavaScript/CSS e regressões funcionais com exemplos sintéticos. Não se trata de auditoria integral de segurança ou certificação de todos os recursos do cadastro.

## Problemas corrigidos na cópia de publicação

- **Mesclagem de configurações:** chaves `__proto__`, `constructor` e `prototype` são ignoradas para impedir alteração indevida de protótipos.
- **Média de RLDBResult:** o acumulador agora atualiza `count` e `sum` a cada registro. Antes, a média podia refletir somente o último valor processado.
- **Fórmulas nas linhas Detail:** os cálculos são realizados antes da clonagem final da band, garantindo valores do registro atual. O exemplo também omite DataField quando utiliza DataFormula.
- **Múltiplas bands Detail:** um conjunto por registro impede que a mesma estatística seja acumulada novamente quando há mais de uma band para o mesmo registro.
- **Fórmulas:** caracteres/operadores desconhecidos deixam de ser descartados silenciosamente. Uma fórmula com `%`, por exemplo, é rejeitada, em vez de ser reinterpretada como outra expressão.
- **Montagem dos objetos:** o pai é procurado dentro do template do relatório, evitando capturar um elemento homônimo já existente no documento.
- **Continuação de título:** uma guarda impede acessar `getAttribute` de um objeto já descartado durante `GetElements`.
- **HTML:** remoção de style, SVG, MathML e formulários embutidos no modo safe; normalização de controles ASCII antes de detectar protocolos perigosos.
- **CSV:** proteção de fórmulas também após quebras de linha e demais espaços iniciais, mantendo aspas e delimitadores escapados.
- **Integração legada:** execução de formulários retornados pelo servidor é desativada por padrão nesta distribuição independente.

## Limites que exigem evolução futura

O motor ainda conserva estado global, nomes de objetos repetidos entre páginas renderizadas e medições síncronas de layout. Esses aspectos dificultam múltiplas instâncias e relatórios muito grandes. Uma refatoração para instâncias isoladas deve ser acompanhada de uma coleção maior de relatórios de regressão.

O catálogo inclui propriedades e tipos não implementados. Os limites foram explicitados em [support.md](support.md), para que a publicação não prometa recursos apenas por constarem nos CSV. A exportação HTML simples não inclui toda a estilização; a opção PDF depende da impressão do navegador.

As melhorias prioritárias seguintes são: instâncias independentes do motor, contrato/schema de validação mais rigoroso, fontes/imagens com espera de carregamento previsível, comparação visual automatizada e extensão da suíte a Firefox/WebKit.

## Validação reproduzível

Execute `npm test` para gerar os dois exemplos no Chromium. A suíte verifica os 48 registros de vendas, soma e média, preservação de texto longo, separação de documentos, orientações mistas, CSV, proteção de HTML/configuração e visibilidade CSS dos escopos de impressão. Os resultados da execução ficam em `test-results/results.json`. O diálogo nativo de impressão e a saída física não são automatizados pela suíte.

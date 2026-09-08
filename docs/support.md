# Suporte e limites do motor

Os 20 tipos e as 62 propriedades do catálogo descrevem o ecossistema histórico. Um `case` vazio no motor não representa suporte funcional.

| Recurso | Situação nesta distribuição |
| --- | --- |
| RLReport (0), RLBand (1) | Página e bands implementadas. |
| RLGroup (3) | Agrupamento por campo, com dados previamente ordenados e bands filhas. |
| RLLabel (5), RLAngleLabel (6), RLDBText (7) | Texto estático, rotação e campo vinculado. |
| RLMemo (8), RLDBMemo (9), RLRichText (10), RLDBRichText (11) | Caminho compartilhado de texto longo. Os exemplos exercitam HTML/Lines e placeholders; não há parser nativo de RTF binário. |
| RLSystemInfo (14) | Data, hora, número de página e registro, conforme Info. CarbonCopy/CopyNo não são implementados. |
| RLDBResult (17) | Agregações e fórmulas aritméticas restritas. Os exemplos e testes cobrem soma, média e valor simples calculado. |
| RLDetailGrid (2), RLSubDetail (4) | Contêineres reconhecidos, mas sem implementação completa das semânticas de grade multicoluna ou consulta mestre/detalhe. |
| RLImage (12), RLDBImage (13) | Picture/LoadFromFile/LoadFromField possuem ramos vazios. Para conteúdo visual conhecido, use imagem em HTML controlado no Memo; não há suporte completo ao objeto de imagem do catálogo. |
| RLDraw (15), RLPanel (16) | Não há implementação completa do desenho geométrico/painel original. |
| RLBarcode (18), RLDBBarcode (19) | Sem geração de código de barras. |

## Propriedades relevantes

Alignment (1), BandType (7), Caption (9), DataField (10), bordas (11–14), fonte (15–19), Height (20), Left (22), AlternateColor (24), PageBreaking (25), Text (27), Top (28), Visible (30), Width (31), DisplayMask (32), Parent (33), Angle (36), Lines (37), Info (39), Orientation (43), Background (44), FontColor (45), Currency (49), DataFormula (52), isHTML (60), HolderHeight (61) e Line-height (62) possuem tratamento no motor, com diferenças em relação ao ecossistema original.

Propriedades como ancoramentos 2–5, IntegralHeight (21), SQL (35), Picture (38), BarcodeType (40), ColCount (41), MasterFields (42), ShowText (46), DrawKind (47), Organization (48), LoadFromFile/Field (50–51 e 59), HoldStyle/Holder (53–54), CarbonCopies (55), NextReport (56), LinkedFields (57) e ShowProgress (58) têm tratamento vazio ou limitado. O encadeamento efetivo é feito pelo array de relatórios, não por NextReport.

`AutoSize` (6) atualmente aplica dimensões automáticas pela presença da propriedade, sem distinguir todos os valores legados. `Align` (34) aplica vertical-align, não o docking completo descrito no catálogo. `Currency` (49) conserva o prefixo `R$`; a configuração `currency` não converte valores monetários. As máscaras seguem o comportamento numérico legado, não o conjunto completo de máscaras Delphi/Fortes.

`PageBreaking` só é processado no fluxo Detail. As opções `pagination.keepTogether`, `orphans` e `widows` não garantem todas as regras tipográficas sugeridas pelos nomes; não foram promovidas a recurso completo nesta publicação. Fontes e imagens remotas podem alterar a paginação após carregamento: use conteúdo de dimensão conhecida e fontes locais/previamente carregadas.

O motor usa dados de entrada e templates confiáveis. O filtro de HTML é defensivo e não transforma a biblioteca em um ambiente isolado para modelos arbitrários enviados por terceiros. Veja [SECURITY.md](../SECURITY.md).

## Compatibilidade de navegador

O formato numérico legado considera a quantidade de caracteres depois dos três primeiros caracteres de DisplayMask. Os exemplos usam `#0.00` para duas casas decimais. Em RLDBResult com DataFormula, omita DataField; um DataField vazio não equivale à ausência da propriedade.

São necessárias APIs modernas: Promise, fetch, AbortController, Range, replaceAll, CSS custom properties e medições de layout. A suíte automatizada usa Chromium. Compatibilidade completa com Firefox/Safari e drivers de impressão específicos precisa de validação no ambiente de destino. Internet Explorer não é suportado.

## Concorrência e escala

Um visualizador por documento. Não abrir simultaneamente renderizações assíncronas concorrentes. A virtualização reduz DOM de páginas fora da tela após gerar o relatório, mas não elimina o custo inicial de paginação nem o armazenamento dos dados. Grandes volumes devem ser filtrados no servidor ou divididos em lotes de relatórios.

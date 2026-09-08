# Catálogo original de objetos e propriedades

Fonte: CSV fornecidos pelo autor. IDs são preservados; o cadastro não garante implementação no navegador. Consulte [suporte](support.md).

## reltipoobjeto

| id | nome | descricao |
|---|---|---|
| 2 | RLDetailGrid | Banda de tipo fixo btDetail. Ideal para a impressão de etiquetas e relatórios em colunas. |
| 15 | RLDraw | Caixa de desenho para figuras geométricas. |
| 13 | RLDBImage | Caixa de imagem ligada a campo de banco de dados. |
| 12 | RLImage | Caixa de imagem. |
| 14 | RLSystemInfo | Caixa de texto de com informações do sistema. |
| 6 | RLAngleLabel | Caixa de texto de com rotação por ângulo. |
| 17 | RLDBResult | Caixa de texto de resultado de operações matemáticas ou estatíticas com campos de banco de dados. |
| 7 | RLDBText | Caixa de texto ligada a campo de banco de dados. |
| 9 | RLDBMemo | Caixa de texto multilinhas ligada a campo de banco de dados. |
| 8 | RLMemo | Caixa de texto multilinhas. |
| 19 | RLDBBarcode | Componente para códigos de barras com campos de banco de dados. |
| 18 | RLBarcode | Componente para códigos de barras. |
| 11 | RLDBRichText | Componente para texto multilinhas em formato RichText ligado a campo de banco de dados. |
| 10 | RLRichText | Componente para texto multilinhas em formato RichText. |
| 16 | RLPanel | Container para controles. |
| 3 | RLGroup | Insira bands sobre um componente de grupo para imprimir sequências de registros de dados. nA quebra de sequência dos registros será detectada automaticamente se for indicado um campo ou conjunto de campos através da propriedade DataFields. |
| 0 | RLReport | Página do relatório. |
| 1 | RLBand | Utilize a banda de impressão para representar registros de dados ou quebras de sequências de dados. Ela deve ser colocada dentro de um Report, Group ou SubDetail. nO comportamento da banda é controlado através da propriedade BandType. |
| 5 | RLLabel | Utilize o TRLLabel para imprimir textos estáticos sobre o relatório. |
| 4 | RLSubDetail | Utilize o TRLSubDetail para imprimir registros ou sequências de dados relacionadas com os registros da fontes de dados principal. |

## reltipopropriedade

| id | nome | ordem | descricao | status |
|---|---|---|---|---|
| 7 | BandType | 1 | 0=Title<br>1=Head<br>2=ColumnHead<br>3=Detail<br>4=Sumary<br>5=ColumnFooter<br>6=Footer. | 1 |
| 34 | Align | 99 | Alinhamento melhorado. Pode assumir um dos seguintes valores: faLeft (Alinhado à esquerda), faTop (Alinhado acima), faRight (Alinhado à direita) ou faBottom (Alinhado abaixo). | 0 |
| 20 | Height | 15 | Altura do objeto. | 1 |
| 62 | Line-height | 0 | Altura padrão das linhas do elemento | 1 |
| 4 | AnchorsRight | 99 | Ancoramento a direita. Pode assumir um dos seguintes valores: True (ancorado) ou False (não ancorado). | 1 |
| 3 | AnchorsLeft | 99 | Ancoramento a esquerda. Pode assumir um dos seguintes valores: True (ancorado) ou False (não ancorado). | 1 |
| 2 | AnchorsBotton | 99 | Ancoramento inferior. Pode assumir um dos seguintes valores: True (ancorado) ou False (não ancorado). | 1 |
| 5 | AnchorsTop | 99 | Ancoramento superior. Pode assumir um dos seguintes valores: True (ancorado) ou False (não ancorado). | 1 |
| 36 | Angle | 99 | Ângulo de inclinação. | 0 |
| 42 | MasterFields | 99 | Campo externo para aplicação de filtro. | 0 |
| 57 | LinkedFields | 99 | Campo local para aplicação de filtro. | 0 |
| 10 | DataField | 50 | Campo relacionado ao banco de dados que será exibido pelo objeto. | 1 |
| 59 | LoadFromFile | 99 | Carrega informações de arquivo em disco. | 0 |
| 50 | LoadFromFile | 0 | Carrega relatório do caminho informado. | 0 |
| 51 | LoadFromField | 0 | Carrega relatório do campo informado. | 0 |
| 24 | AlternateColor | 99 | Cor alternativa para grade de informações. | 1 |
| 45 | FontColor | 99 | Define a cor da fonte utilizada no objeto. | 0 |
| 53 | HoldStyle | 98 | Define as regras de ancoragem entre dois controles. | 0 |
| 17 | FontName | 99 | Define o nome da fonte utilizada no objeto. | 1 |
| 55 | CarbonCopies | 99 | Define o número de cópias da Band | 0 |
| 56 | NextReport | 99 | Define o relatório a ser exibido na sequência. | 1 |
| 18 | FontSize | 99 | Define o tamanho da fonte utilizada no objeto. | 1 |
| 40 | BarcodeType | 99 | Define o tipo de código de barras a ser utilizado. | 0 |
| 16 | FontItalic | 99 | Define se a fonte do objeto será em itálico. Pode assumir um dos seguintes valores: True (fonte em itálico) ou False (fonte normal). | 1 |
| 15 | FontBold | 99 | Define se a fonte do objeto será em negrito. Pode assumir um dos seguintes valores: True (fonte em negrito) ou False (fonte normal). | 1 |
| 19 | FontUnderline | 99 | Define se a fonte do objeto será sublinhada. Pode assumir um dos seguintes valores: True (fonte sublinhada) ou False (fonte normal). | 1 |
| 61 | HolderHeight | 99 | Define se o objeto irá acompanhar a altura de outro objeto | 1 |
| 60 | isHTML | 99 | Define se o objeto irá exibir conteúdo HTML ou texto | 1 |
| 13 | BorderRight | 99 | Desenhar borda direita. | 1 |
| 12 | BorderLeft | 99 | Desenhar borda esquerda. | 1 |
| 11 | BorderBottom | 99 | Desenhar borda inferior. | 1 |
| 14 | BorderTop | 99 | Desenhar borda superior. | 1 |
| 48 | Organization | 99 | Determina a direção para a impressão das bandas. | 0 |
| 46 | ShowText | 99 | Determina se e como serão exibidas as informações junto com as barras. | 0 |
| 21 | IntegralHeight | 99 | Determina se o objeto deve ser imprsso integralmente. | 0 |
| 30 | Visible | 99 | Determina se o objeto será visível em tempo de impressão. | 1 |
| 1 | Alignment | 10 | Especifica como o texto deve ser alinhado dentro de um objeto. Pode assumir os seguinte valores: taLeftJustify (alinhado a esquerda), taCenter (centralizado) ou taRightJustify (alinhado a direita). | 1 |
| 25 | PageBreaking | 99 | Especifica se e como a band ou pager irá forçar a quebra de página. Pode assumir um dos seguintes valores: pbBeforePrInteger(A quebra de página será verificada antes da impressão) ou pbAfterPrInteger(A quebra de página será verificada após a impressão). | 1 |
| 49 | Currency | 99 | Especifica se o objeto exibe valores monetários. | 1 |
| 58 | ShowProgress | 99 | Exibe barra de progresso durante a criação do relatório. | 0 |
| 52 | DataFormula | 99 | Fórmula relacionada aos campos do banco de dados que será exibido pelo objeto. | 1 |
| 44 | Backgroud | 99 | Imagem de fundo. | 0 |
| 31 | Width | 15 | Largura do objeto. | 1 |
| 37 | Lines | 99 | Lista contendo as linhas de texto do memo. | 1 |
| 26 | MarginRight | 99 | Margem direita em milímetros. | 1 |
| 23 | MarginLeft | 99 | Margem esquerda em milímetros. | 1 |
| 8 | MarginBottom | 99 | Margem inferior em milímetros. | 1 |
| 29 | MarginTop | 99 | Margem superior em milímetros. | 1 |
| 32 | DisplayMask | 50 | Mascara de formatação. | 1 |
| 33 | Parent | 0 | Nome do controle de referência. | 1 |
| 54 | Holder | 99 | O mecanismo por trás da propriedade holder é um dos recursos mais interessantes do FortesReport. Esta propriedade aponta para um controle que servirá como âncora, como referência de posicionamento. É possível informar para um RLDBText de uma band detalhe que sua posição horizontal deve se mantêr sempre igual ao RLLabel correspondente no cabeçalho, indicando RLDBText.Holder:=RLLabel. Deste modo, ao mover o label do cabeçalho, em tempo de design ou impressão, o RLDBText será movido junto com ele. Há várias opções de ancoragem e também há a possibilidade de um controle possuir dois holders: um para referência horizontal e outro para vertical, por exemplo. | 0 |
| 43 | Orientation | 99 | Orientação do papel.<br>0 = poPortrait<br>1 = poLandscape. | 1 |
| 28 | Top | 10 | Posicionamento do objeto referente à parte superior. | 1 |
| 22 | Left | 15 | Posicionamento do objeto referente ao lado esquerdo. | 1 |
| 6 | AutoSize | 5 | Redimensionamento automático. | 1 |
| 38 | Picture | 99 | Representa a imagem que aparece no fundo do controle. | 0 |
| 35 | SQL | 99 | Sub consulta utilizada para preencher dados em sub-detail. | 1 |
| 27 | Text | 99 | Texto a ser exibido pelo objeto. | 1 |
| 9 | Caption | 99 | Texto a ser exibido pelo objeto. | 1 |
| 47 | DrawKind | 99 | Tipo de figura geométrica. | 0 |
| 39 | Info | 99 | Tipo de informação a ser exibida. | 1 |
| 41 | ColCount | 99 | Total de colunas da grid. | 0 |

## relobjetopropriedade

| id | idtipoobjeto | idtipopropriedade |
|---|---|---|
| 1 | 1 | 6 |
| 2 | 1 | 7 |
| 3 | 1 | 8 |
| 4 | 1 | 11 |
| 5 | 1 | 12 |
| 6 | 1 | 13 |
| 7 | 1 | 14 |
| 8 | 1 | 15 |
| 9 | 1 | 16 |
| 10 | 1 | 17 |
| 11 | 1 | 18 |
| 12 | 1 | 19 |
| 13 | 1 | 20 |
| 14 | 1 | 21 |
| 15 | 1 | 22 |
| 16 | 1 | 23 |
| 17 | 1 | 25 |
| 18 | 1 | 26 |
| 19 | 1 | 28 |
| 20 | 1 | 29 |
| 21 | 1 | 30 |
| 22 | 1 | 31 |
| 23 | 2 | 6 |
| 24 | 2 | 8 |
| 25 | 2 | 11 |
| 26 | 2 | 12 |
| 27 | 2 | 13 |
| 28 | 2 | 14 |
| 29 | 2 | 15 |
| 30 | 2 | 16 |
| 31 | 2 | 17 |
| 32 | 2 | 18 |
| 33 | 2 | 19 |
| 34 | 2 | 20 |
| 35 | 2 | 21 |
| 36 | 2 | 22 |
| 37 | 2 | 23 |
| 38 | 2 | 25 |
| 39 | 2 | 26 |
| 40 | 2 | 28 |
| 41 | 2 | 29 |
| 42 | 2 | 30 |
| 43 | 2 | 31 |
| 44 | 2 | 41 |
| 45 | 3 | 8 |
| 46 | 3 | 10 |
| 47 | 3 | 11 |
| 48 | 3 | 12 |
| 49 | 3 | 13 |
| 50 | 3 | 14 |
| 51 | 3 | 15 |
| 52 | 3 | 16 |
| 53 | 3 | 17 |
| 54 | 3 | 18 |
| 55 | 3 | 19 |
| 56 | 3 | 20 |
| 57 | 3 | 22 |
| 58 | 3 | 23 |
| 59 | 3 | 25 |
| 60 | 3 | 26 |
| 61 | 3 | 28 |
| 62 | 3 | 29 |
| 63 | 3 | 30 |
| 64 | 3 | 31 |
| 65 | 4 | 8 |
| 66 | 4 | 11 |
| 67 | 4 | 12 |
| 68 | 4 | 13 |
| 69 | 4 | 14 |
| 70 | 4 | 15 |
| 71 | 4 | 16 |
| 72 | 4 | 17 |
| 73 | 4 | 18 |
| 74 | 4 | 19 |
| 75 | 4 | 20 |
| 76 | 4 | 22 |
| 77 | 4 | 23 |
| 78 | 4 | 25 |
| 79 | 4 | 26 |
| 80 | 4 | 28 |
| 81 | 4 | 29 |
| 82 | 4 | 30 |
| 83 | 4 | 31 |
| 84 | 4 | 35 |
| 85 | 4 | 42 |
| 86 | 5 | 1 |
| 87 | 5 | 2 |
| 88 | 5 | 3 |
| 89 | 5 | 4 |
| 90 | 5 | 5 |
| 91 | 5 | 6 |
| 92 | 5 | 9 |
| 93 | 5 | 11 |
| 94 | 5 | 12 |
| 95 | 5 | 13 |
| 96 | 5 | 14 |
| 97 | 5 | 15 |
| 98 | 5 | 16 |
| 99 | 5 | 17 |
| 100 | 5 | 18 |
| 101 | 5 | 19 |
| 102 | 5 | 20 |
| 103 | 5 | 22 |
| 104 | 5 | 28 |
| 105 | 5 | 30 |
| 106 | 5 | 34 |
| 107 | 6 | 1 |
| 108 | 6 | 2 |
| 109 | 6 | 3 |
| 110 | 6 | 4 |
| 111 | 6 | 5 |
| 112 | 6 | 6 |
| 113 | 6 | 9 |
| 114 | 6 | 11 |
| 115 | 6 | 12 |
| 116 | 6 | 13 |
| 117 | 6 | 14 |
| 118 | 6 | 15 |
| 119 | 6 | 16 |
| 120 | 6 | 17 |
| 121 | 6 | 18 |
| 122 | 6 | 19 |
| 123 | 6 | 20 |
| 124 | 6 | 22 |
| 125 | 6 | 28 |
| 126 | 6 | 30 |
| 127 | 6 | 31 |
| 128 | 6 | 36 |
| 129 | 7 | 1 |
| 130 | 7 | 2 |
| 131 | 7 | 3 |
| 132 | 7 | 4 |
| 133 | 7 | 5 |
| 134 | 7 | 6 |
| 135 | 7 | 10 |
| 136 | 7 | 11 |
| 137 | 7 | 12 |
| 138 | 7 | 13 |
| 139 | 7 | 14 |
| 140 | 7 | 15 |
| 141 | 7 | 16 |
| 142 | 7 | 17 |
| 143 | 7 | 18 |
| 144 | 7 | 19 |
| 145 | 7 | 20 |
| 146 | 7 | 22 |
| 147 | 7 | 27 |
| 148 | 7 | 28 |
| 149 | 7 | 30 |
| 150 | 7 | 31 |
| 151 | 7 | 32 |
| 152 | 7 | 34 |
| 153 | 8 | 1 |
| 154 | 8 | 2 |
| 155 | 8 | 3 |
| 156 | 8 | 4 |
| 157 | 8 | 5 |
| 158 | 8 | 6 |
| 159 | 8 | 11 |
| 160 | 8 | 12 |
| 161 | 8 | 13 |
| 162 | 8 | 14 |
| 163 | 8 | 15 |
| 164 | 8 | 16 |
| 165 | 8 | 17 |
| 166 | 8 | 18 |
| 167 | 8 | 19 |
| 168 | 8 | 20 |
| 169 | 8 | 21 |
| 170 | 8 | 22 |
| 171 | 8 | 28 |
| 172 | 8 | 30 |
| 173 | 8 | 31 |
| 174 | 8 | 34 |
| 175 | 8 | 37 |
| 176 | 9 | 1 |
| 177 | 9 | 2 |
| 178 | 9 | 3 |
| 179 | 9 | 4 |
| 180 | 9 | 5 |
| 181 | 9 | 6 |
| 182 | 9 | 11 |
| 183 | 9 | 12 |
| 184 | 9 | 13 |
| 185 | 9 | 14 |
| 186 | 9 | 15 |
| 187 | 9 | 16 |
| 188 | 9 | 17 |
| 189 | 9 | 18 |
| 190 | 9 | 19 |
| 191 | 9 | 20 |
| 192 | 9 | 21 |
| 193 | 9 | 22 |
| 194 | 9 | 28 |
| 195 | 9 | 30 |
| 196 | 9 | 31 |
| 197 | 9 | 34 |
| 198 | 9 | 10 |
| 199 | 10 | 1 |
| 200 | 10 | 2 |
| 201 | 10 | 3 |
| 202 | 10 | 4 |
| 203 | 10 | 5 |
| 204 | 10 | 6 |
| 205 | 10 | 11 |
| 206 | 10 | 12 |
| 207 | 10 | 13 |
| 208 | 10 | 14 |
| 209 | 10 | 15 |
| 210 | 10 | 16 |
| 211 | 10 | 17 |
| 212 | 10 | 18 |
| 213 | 10 | 19 |
| 214 | 10 | 20 |
| 215 | 10 | 21 |
| 216 | 10 | 22 |
| 217 | 10 | 28 |
| 218 | 10 | 30 |
| 219 | 10 | 31 |
| 220 | 10 | 34 |
| 221 | 10 | 37 |
| 222 | 11 | 1 |
| 223 | 11 | 2 |
| 224 | 11 | 3 |
| 225 | 11 | 4 |
| 226 | 11 | 5 |
| 227 | 11 | 6 |
| 228 | 11 | 11 |
| 229 | 11 | 12 |
| 230 | 11 | 13 |
| 231 | 11 | 14 |
| 232 | 11 | 15 |
| 233 | 11 | 16 |
| 234 | 11 | 17 |
| 235 | 11 | 18 |
| 236 | 11 | 19 |
| 237 | 11 | 20 |
| 238 | 11 | 21 |
| 239 | 11 | 22 |
| 240 | 11 | 28 |
| 241 | 11 | 30 |
| 242 | 11 | 31 |
| 243 | 11 | 34 |
| 244 | 11 | 10 |
| 245 | 12 | 2 |
| 246 | 12 | 3 |
| 247 | 12 | 4 |
| 248 | 12 | 5 |
| 249 | 12 | 6 |
| 250 | 12 | 11 |
| 251 | 12 | 12 |
| 252 | 12 | 13 |
| 253 | 12 | 14 |
| 254 | 12 | 20 |
| 255 | 12 | 22 |
| 256 | 12 | 28 |
| 257 | 12 | 30 |
| 258 | 12 | 31 |
| 259 | 12 | 34 |
| 260 | 12 | 38 |
| 261 | 13 | 2 |
| 262 | 13 | 3 |
| 263 | 13 | 4 |
| 264 | 13 | 5 |
| 265 | 13 | 6 |
| 266 | 13 | 11 |
| 267 | 13 | 12 |
| 268 | 13 | 13 |
| 269 | 13 | 14 |
| 270 | 13 | 20 |
| 271 | 13 | 22 |
| 272 | 13 | 28 |
| 273 | 13 | 30 |
| 274 | 13 | 31 |
| 275 | 13 | 34 |
| 276 | 13 | 10 |
| 277 | 14 | 27 |
| 278 | 14 | 39 |
| 279 | 14 | 1 |
| 280 | 14 | 4 |
| 281 | 14 | 3 |
| 282 | 14 | 4 |
| 283 | 14 | 5 |
| 284 | 14 | 6 |
| 285 | 14 | 11 |
| 286 | 14 | 12 |
| 287 | 14 | 13 |
| 288 | 14 | 14 |
| 289 | 14 | 15 |
| 290 | 14 | 16 |
| 291 | 14 | 17 |
| 292 | 14 | 18 |
| 293 | 14 | 19 |
| 294 | 14 | 20 |
| 295 | 14 | 22 |
| 296 | 4 | 57 |
| 297 | 14 | 28 |
| 298 | 14 | 30 |
| 299 | 14 | 31 |
| 300 | 14 | 32 |
| 301 | 14 | 34 |
| 302 | 15 | 2 |
| 303 | 15 | 3 |
| 304 | 15 | 4 |
| 305 | 15 | 5 |
| 306 | 15 | 11 |
| 307 | 15 | 12 |
| 308 | 15 | 13 |
| 309 | 15 | 14 |
| 310 | 15 | 15 |
| 311 | 15 | 16 |
| 312 | 15 | 17 |
| 313 | 15 | 18 |
| 314 | 15 | 19 |
| 315 | 15 | 20 |
| 316 | 15 | 22 |
| 317 | 15 | 28 |
| 318 | 15 | 30 |
| 319 | 15 | 31 |
| 320 | 15 | 34 |
| 321 | 15 | 36 |
| 322 | 16 | 1 |
| 323 | 16 | 2 |
| 324 | 16 | 3 |
| 325 | 16 | 4 |
| 326 | 16 | 5 |
| 327 | 16 | 6 |
| 328 | 16 | 8 |
| 329 | 16 | 11 |
| 330 | 16 | 12 |
| 331 | 16 | 13 |
| 332 | 16 | 14 |
| 333 | 16 | 15 |
| 334 | 16 | 16 |
| 335 | 16 | 17 |
| 336 | 16 | 18 |
| 337 | 16 | 19 |
| 338 | 16 | 20 |
| 339 | 16 | 22 |
| 340 | 16 | 23 |
| 341 | 16 | 26 |
| 342 | 16 | 28 |
| 343 | 16 | 29 |
| 344 | 16 | 30 |
| 345 | 16 | 31 |
| 346 | 16 | 34 |
| 347 | 17 | 1 |
| 348 | 17 | 4 |
| 349 | 17 | 3 |
| 350 | 17 | 4 |
| 351 | 17 | 5 |
| 352 | 17 | 6 |
| 353 | 17 | 10 |
| 354 | 17 | 11 |
| 355 | 17 | 12 |
| 356 | 17 | 13 |
| 357 | 17 | 14 |
| 358 | 17 | 15 |
| 359 | 17 | 16 |
| 360 | 17 | 17 |
| 361 | 17 | 18 |
| 362 | 17 | 19 |
| 363 | 17 | 20 |
| 364 | 17 | 22 |
| 365 | 17 | 27 |
| 366 | 17 | 28 |
| 367 | 17 | 30 |
| 368 | 17 | 31 |
| 369 | 17 | 32 |
| 370 | 17 | 34 |
| 371 | 17 | 39 |
| 372 | 18 | 1 |
| 373 | 18 | 2 |
| 374 | 18 | 3 |
| 375 | 18 | 4 |
| 376 | 18 | 5 |
| 377 | 18 | 6 |
| 378 | 18 | 8 |
| 379 | 18 | 9 |
| 380 | 18 | 11 |
| 381 | 18 | 12 |
| 382 | 18 | 13 |
| 383 | 18 | 14 |
| 384 | 18 | 15 |
| 385 | 18 | 16 |
| 386 | 18 | 17 |
| 387 | 18 | 18 |
| 388 | 18 | 19 |
| 389 | 18 | 20 |
| 390 | 18 | 22 |
| 391 | 18 | 23 |
| 392 | 18 | 26 |
| 393 | 18 | 28 |
| 394 | 18 | 29 |
| 395 | 18 | 30 |
| 396 | 18 | 31 |
| 397 | 18 | 34 |
| 398 | 18 | 40 |
| 399 | 19 | 3 |
| 400 | 19 | 4 |
| 401 | 19 | 5 |
| 402 | 19 | 6 |
| 403 | 19 | 8 |
| 404 | 19 | 10 |
| 405 | 19 | 11 |
| 406 | 19 | 12 |
| 407 | 19 | 13 |
| 408 | 19 | 14 |
| 409 | 19 | 15 |
| 410 | 19 | 16 |
| 411 | 19 | 17 |
| 412 | 19 | 18 |
| 413 | 19 | 19 |
| 414 | 19 | 20 |
| 415 | 19 | 22 |
| 416 | 19 | 23 |
| 417 | 19 | 26 |
| 418 | 19 | 28 |
| 419 | 19 | 29 |
| 420 | 19 | 30 |
| 421 | 19 | 31 |
| 422 | 19 | 34 |
| 423 | 19 | 40 |
| 424 | 5 | 31 |
| 425 | 0 | 29 |
| 426 | 0 | 26 |
| 427 | 0 | 23 |
| 428 | 0 | 8 |
| 429 | 0 | 19 |
| 430 | 0 | 18 |
| 431 | 0 | 17 |
| 432 | 0 | 16 |
| 433 | 0 | 15 |
| 434 | 0 | 14 |
| 435 | 0 | 13 |
| 436 | 0 | 12 |
| 437 | 0 | 11 |
| 438 | 0 | 43 |
| 439 | 0 | 44 |
| 440 | 19 | 45 |
| 441 | 18 | 45 |
| 442 | 17 | 45 |
| 443 | 14 | 45 |
| 444 | 9 | 45 |
| 445 | 8 | 45 |
| 446 | 7 | 45 |
| 447 | 6 | 45 |
| 448 | 5 | 45 |
| 449 | 4 | 45 |
| 450 | 3 | 45 |
| 451 | 2 | 45 |
| 452 | 1 | 45 |
| 453 | 0 | 45 |
| 454 | 1 | 24 |
| 455 | 18 | 46 |
| 456 | 19 | 46 |
| 457 | 15 | 47 |
| 458 | 2 | 48 |
| 459 | 17 | 49 |
| 460 | 7 | 49 |
| 461 | 0 | 51 |
| 462 | 0 | 50 |
| 463 | 7 | 52 |
| 464 | 17 | 52 |
| 465 | 11 | 52 |
| 466 | 9 | 52 |
| 467 | 5 | 54 |
| 468 | 6 | 54 |
| 469 | 7 | 54 |
| 470 | 8 | 54 |
| 471 | 9 | 54 |
| 472 | 10 | 54 |
| 473 | 11 | 54 |
| 474 | 12 | 54 |
| 475 | 13 | 54 |
| 476 | 14 | 54 |
| 477 | 15 | 54 |
| 478 | 16 | 54 |
| 479 | 17 | 54 |
| 480 | 18 | 54 |
| 481 | 19 | 54 |
| 482 | 5 | 53 |
| 483 | 6 | 53 |
| 484 | 7 | 53 |
| 485 | 8 | 53 |
| 486 | 9 | 53 |
| 487 | 10 | 53 |
| 488 | 11 | 53 |
| 489 | 12 | 53 |
| 490 | 13 | 53 |
| 491 | 14 | 53 |
| 492 | 15 | 53 |
| 493 | 16 | 53 |
| 494 | 17 | 53 |
| 495 | 18 | 53 |
| 496 | 19 | 53 |
| 497 | 1 | 55 |
| 498 | 0 | 56 |
| 499 | 0 | 58 |
| 500 | 8 | 59 |
| 501 | 10 | 59 |
| 502 | 1 | 33 |
| 503 | 2 | 33 |
| 504 | 3 | 33 |
| 505 | 4 | 33 |
| 506 | 5 | 33 |
| 507 | 6 | 33 |
| 508 | 7 | 33 |
| 509 | 8 | 33 |
| 510 | 9 | 33 |
| 511 | 10 | 33 |
| 512 | 11 | 33 |
| 513 | 12 | 33 |
| 514 | 13 | 33 |
| 515 | 14 | 33 |
| 516 | 15 | 33 |
| 517 | 16 | 33 |
| 518 | 17 | 33 |
| 519 | 18 | 33 |
| 520 | 19 | 33 |
| 521 | 8 | 60 |
| 522 | 9 | 60 |
| 523 | 10 | 60 |
| 524 | 11 | 60 |
| 525 | 5 | 61 |
| 526 | 6 | 61 |
| 527 | 7 | 61 |
| 528 | 8 | 61 |
| 529 | 9 | 61 |
| 530 | 10 | 61 |
| 531 | 11 | 61 |
| 532 | 17 | 61 |
| 533 | 1 | 62 |
| 534 | 8 | 62 |
| 535 | 9 | 62 |
| 536 | 10 | 62 |
| 537 | 11 | 62 |
| 538 | 7 | 60 |


# Segurança e integração legada

Use o WebReport com definições de relatório controladas pela aplicação. O cliente não substitui autorização, validação de parâmetros ou controle de acesso no servidor. Não envie SQL ao navegador nem publique dados reais nos exemplos.

`security.htmlMode: 'safe'` remove conteúdo ativo comum. O filtro é próprio e não é um sanitizador completo auditado: CSS inline e imagens podem produzir efeitos de layout ou requisições. Para conteúdo arbitrário não confiável, aplique uma política de sanitização auditada no servidor e considere isolamento em documento dedicado. A definição de relatório, incluindo `config`, deve ser confiável; não permita que um usuário externo escolha `htmlMode: 'trusted'`.

## Formulários e scripts legados

`security.legacyServerPrompts` é **false** nesta distribuição. O modo legado permite recriar/executar scripts retornados por um endpoint, para preservar formulários de data, período e seleção do framework original. Mesmo sendo same-origin, um endpoint só deve receber essa permissão se seu conteúdo for confiável.

Se seu sistema depende desse protocolo, habilite explicitamente:

```js
WebReport.configure({ security: {
  legacyServerPrompts: true,
  legacyPromptsSameOriginOnly: true
} });
```

Essa configuração não fornece as dependências do formulário: MAlert, GWBMGrid, formulários, jQuery e outros componentes usados pelo retorno devem ser providos pela aplicação. Argumentos legados `params` de `CreateContainer(params, reports)` e `renderReports(params, reports)` também são código JavaScript executável; nunca preencha esses argumentos com texto arbitrário de usuários.

## Exportações

CSV inclui a união de todas as colunas dos dados recebidos, mesmo que uma coluna não apareça no layout. Remova campos sigilosos antes de fornecer `Data`. A proteção contra fórmulas de planilha está habilitada por padrão, mas a interpretação final depende do programa que abre o CSV.

## Relato de vulnerabilidade

Depois da publicação, prefira o canal privado de segurança do repositório, quando habilitado pelo mantenedor. Não coloque credenciais ou relatórios reais em issues públicas; forneça um caso mínimo com dados fictícios.

# Calendario de Vencimentos Tributarios

Projeto estatico em HTML e CSS para consulta visual de vencimentos tributarios mensais no Brasil.

A pagina organiza obrigacoes federais, estaduais, municipais, trabalhistas/previdenciarias, Simples Nacional, MEI e obrigacoes anuais em uma tabela responsiva, com legenda por categoria e observacoes operacionais.

## Objetivo

Facilitar a visualizacao de prazos recorrentes de tributos e declaracoes, separando os vencimentos por grupo e por faixa semanal do mes.

O conteudo tem carater informativo e deve ser validado com os orgaos oficiais competentes, especialmente em prazos que variam por estado, municipio, feriado ou regra especifica.

## Estrutura do projeto

```text
calendario-tributario/
+-- index.html
`-- README.md
```

## Arquitetura

Este projeto nao possui backend, banco de dados, rotas de API ou processo de build.

A aplicacao atual e composta por:

- Frontend: arquivo unico `index.html`, contendo marcacao HTML e estilos CSS internos.
- Backend: inexistente.
- Banco de Dados: inexistente.
- Dependencias externas: nenhuma fonte ou biblioteca externa obrigatoria.

## Como executar

Abra o arquivo `index.html` diretamente no navegador.

Como alternativa, use um servidor estatico local caso queira simular um ambiente web:

```powershell
python -m http.server 8000
```

Depois acesse:

```text
http://localhost:8000
```

## Conteudo exibido

A pagina apresenta:

- Calendario mensal por grupos de obrigacoes.
- Separacao por semanas/faixas de vencimento.
- Marcadores visuais de datas e periodos.
- Tags coloridas por categoria tributaria.
- Layout responsivo: tabela em desktop e cards empilhados em telas pequenas.
- Tipografia com espacamento vertical ampliado para melhorar a leitura.
- Filtros clicaveis por categoria na legenda.
- Filtro combinado por regime tributario: Simples Nacional, MEI/SIMEI, Lucro Presumido e Lucro Real.
- Pesquisa por nome de imposto ou obrigacao, combinada com os filtros existentes.
- Secao de obrigacoes anuais e especificas.
- Observacoes sobre dias nao uteis, variacao por UF/municipio e fontes de referencia.

## Manutencao

Ao alterar o projeto:

- Mantenha a estrutura simples enquanto o projeto continuar estatico.
- Atualize este README quando houver mudanca relevante de layout, conteudo, dependencia ou arquitetura.
- Evite inserir dados mockados em futuras rotas ou componentes se o projeto evoluir para frontend/backend.
- Caso seja criado um backend, mova regras, limites e validacoes para o servidor.
- Caso seja criado um banco de dados, consulte os dados reais na camada apropriada antes de responder ao frontend.
- Confirme que as regras visuais exibidas no frontend refletem as regras permitidas pelo backend e pelo banco de dados.

## Validacao recomendada

Como nao ha build ou testes automatizados configurados, valide manualmente:

- Abertura do `index.html` no navegador.
- Legibilidade dos numerais e faixas de datas.
- Altura de linha dos textos em desktop e mobile.
- Clique nos filtros da legenda: Todos, Federal, Trabalhista, Estadual, Municipal, Simples e Anual.
- Clique nos filtros de regime tributario e confira se os prazos exibidos correspondem ao regime selecionado.
- Pesquise por nomes como IRPJ, DAS, FGTS, COFINS ou EFD-Reinf e confira os resultados.
- Conversao da tabela em cards empilhados em telas menores.
- Ausencia de sobreposicao entre textos, marcadores e tags.
- Coerencia dos vencimentos e observacoes com fontes oficiais atualizadas.

## Dependencias

Nao existe `package.json` neste projeto.

Dependencias atuais:

- Navegador moderno com suporte a HTML5, CSS3 e JavaScript.
- Fonte Arial/Helvetica disponivel no sistema operacional.

## Fontes e responsabilidade

As informacoes do calendario devem ser revisadas periodicamente, pois prazos tributarios podem mudar por norma legal, calendario oficial, feriados, municipio, UF ou regime tributario.

Use sempre fontes oficiais como Receita Federal, Ministerio do Trabalho e Emprego, Portal do Simples Nacional, Caixa Economica Federal, SEFAZ estadual, prefeitura municipal e legislacao aplicavel antes de tomar decisoes fiscais ou operacionais.

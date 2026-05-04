# Especificacao: Automacao de Atualizacoes Governamentais

## Objetivo

Monitorar fontes oficiais do governo brasileiro e destacar ao usuario quando houver publicacao ou alteracao que possa impactar prazos tributarios exibidos no calendario.

## Escopo

- Consultar fontes oficiais configuradas.
- Detectar mudancas por hash de conteudo normalizado.
- Registrar data da verificacao, titulo, URL, status e termos relacionados.
- Gerar arquivo consumido pelo frontend para exibir alertas.
- Permitir execucao manual local e execucao agendada em CI.

## Fora de Escopo

- Alterar prazos automaticamente quando a fonte nao for estruturada.
- Interpretar noticia juridica ambigua sem revisao humana.
- Consultar fontes estaduais e municipais de todos os entes federativos sem configuracao explicita.

## Requisitos Funcionais

- RF-001: A automacao deve ler uma lista versionada de fontes oficiais.
- RF-002: A automacao deve buscar cada URL oficial e calcular hash do conteudo.
- RF-003: A automacao deve comparar o hash atual com o hash da ultima execucao.
- RF-004: A automacao deve gerar um arquivo JavaScript estatico com as mudancas detectadas.
- RF-005: A interface deve exibir um alerta quando houver mudancas oficiais detectadas.
- RF-006: O alerta deve listar fonte, data de verificacao, termos afetados e link oficial.
- RF-007: A automacao deve falhar com codigo diferente de zero apenas quando nenhuma fonte puder ser consultada.

## Criterios de Sucesso

- CS-001: O projeto continua funcionando abrindo `index.html`.
- CS-002: A pagina mostra alerta quando `data/government-updates.js` contiver mudancas.
- CS-003: O script roda com Node.js sem dependencias externas.
- CS-004: O workflow agendado pode executar a verificacao diariamente.
- CS-005: O README explica como rodar a verificacao manualmente.

## Fontes Oficiais Iniciais

- Receita Federal: Agenda Tributaria 2026.
- Receita Federal: Noticias sobre Simples Nacional e prorrogacoes.
- Portal do Simples Nacional.
- Ministerio do Trabalho e Emprego: FGTS Digital.
- Empresas & Negocios / gov.br: MEI.

# Plano: Automacao de Atualizacoes Governamentais

## Arquitetura

O projeto permanece estatico. A automacao sera executada fora do navegador por Node.js e gravara arquivos estaticos dentro de `data/`.

```text
scripts/check-government-updates.mjs
        |
        v
data/government-sources.json
        |
        v
data/government-updates-state.json
data/government-updates.js
        |
        v
index.html
```

## Decisoes

- Usar Node.js nativo para evitar dependencias.
- Gerar `.js` em vez de `.json` para funcionar tambem quando o usuario abre `index.html` diretamente pelo navegador.
- Exibir mudancas oficiais como alerta revisavel, evitando atualizacao silenciosa de prazos fiscais.
- Versionar estado e resultado para permitir auditoria do que mudou entre execucoes.

## Fluxo

1. Ler fontes oficiais.
2. Buscar HTML de cada fonte.
3. Normalizar texto removendo scripts, estilos e espacos repetidos.
4. Calcular SHA-256.
5. Comparar com estado anterior.
6. Gerar lista de mudancas.
7. Atualizar estado e arquivo consumido pelo frontend.
8. Workflow agendado commita arquivos alterados.

## Riscos

- Sites oficiais podem mudar HTML sem mudar prazo.
- Algumas fontes podem ficar indisponiveis temporariamente.
- Noticias de prorrogacao podem ser regionais, exigindo leitura humana antes de alterar regra geral.

## Mitigacoes

- Exibir termos afetados e link oficial.
- Registrar fontes com erro sem quebrar a pagina.
- Nao alterar prazos automaticamente a partir de texto livre.

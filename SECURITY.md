# Auditoria de Seguranca

## Escopo Auditado

- `index.html`
- `scripts/app.js`
- `scripts/check-government-updates.mjs`
- `data/government-sources.json`
- `data/government-updates.js`
- `.github/workflows/check-government-updates.yml`

## Principais Riscos Identificados

### XSS por dados de fontes externas

Risco: dados gerados pela automacao poderiam ser exibidos como HTML se usados com `innerHTML`.

Controle aplicado:

- A interface usa `textContent`, `createElement` e `appendChild`.
- Links sao validados antes de receber `href`.
- URLs exibidas precisam ser `https` e pertencer a dominios oficiais `gov.br` ou `fazenda.gov.br`.
- O script inline foi movido para `scripts/app.js`.
- Foi adicionada Content Security Policy no HTML.

### Ingestao de fontes nao oficiais

Risco: alteracao maliciosa em `data/government-sources.json` poderia apontar para dominio externo.

Controle aplicado:

- `scripts/check-government-updates.mjs` valida allowlist de dominios oficiais.
- Apenas `https` e permitido.
- Tipos de conteudo inesperados sao rejeitados.

### Abuso de rede ou resposta excessiva

Risco: fonte lenta ou resposta muito grande poderia travar a automacao.

Controle aplicado:

- Timeout de 15 segundos por requisicao.
- Limite de 2 MB por resposta.
- Falhas por fonte sao registradas sem quebrar a pagina.
- A execucao falha apenas se nenhuma fonte oficial puder ser consultada.

### Supply chain no GitHub Actions

Risco: usar action de terceiros para commitar arquivos gerados aumenta superficie de cadeia de suprimentos.

Controle aplicado:

- Workflow usa actions oficiais para checkout e Node.
- Commit e push sao feitos com comandos `git` nativos.
- Permissao `contents: write` fica restrita ao workflow de atualizacao.

## Validacao Recomendada

Execute:

```powershell
node --check scripts\check-government-updates.mjs
node scripts\check-government-updates.mjs
```

Confira:

- `data/government-updates.js` nao contem HTML executavel.
- `index.html` nao contem `innerHTML`.
- `scripts/app.js` usa DOM APIs seguras.
- O alerta de atualizacao oficial abre apenas links governamentais.

## Riscos Residuais

- Uma fonte oficial pode publicar informacao incorreta ou ser comprometida.
- Mudancas normativas podem exigir interpretacao humana antes de atualizar prazos.
- A Content Security Policy ainda permite CSS inline porque o projeto usa estilo embutido em `index.html`.

## Recomendacoes Futuras

- Separar CSS em arquivo externo e remover `style-src 'unsafe-inline'`.
- Criar suite automatizada de testes de DOM para filtros, busca e alertas.
- Rodar Semgrep ou ferramenta equivalente a cada pull request.
- Proteger branch principal com revisao obrigatoria antes de aceitar commits gerados por automacao.

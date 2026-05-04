import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dataDir = path.join(root, 'data');
const sourcesPath = path.join(dataDir, 'government-sources.json');
const statePath = path.join(dataDir, 'government-updates-state.json');
const outputPath = path.join(dataDir, 'government-updates.js');
const maxResponseBytes = 2_000_000;
const requestTimeoutMs = 15_000;
const allowedHostSuffixes = ['.gov.br', '.fazenda.gov.br'];

const stripHtml = (html) => html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/\s+/g, ' ')
  .trim();

const normalize = (text) => text
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/\s+/g, ' ')
  .trim();

const hashText = (text) => createHash('sha256').update(text).digest('hex');

const assertAllowedOfficialUrl = (value) => {
  const url = new URL(value);
  const hostname = url.hostname.toLowerCase();
  const allowed = url.protocol === 'https:'
    && allowedHostSuffixes.some((suffix) => hostname === suffix.slice(1) || hostname.endsWith(suffix));

  if (!allowed) {
    throw new Error(`Fonte fora da allowlist oficial: ${value}`);
  }

  return url.href;
};

const safeJavaScriptJson = (value) => JSON.stringify(value, null, 2)
  .replace(/</g, '\\u003C')
  .replace(/>/g, '\\u003E')
  .replace(/&/g, '\\u0026')
  .replace(/\u2028/g, '\\u2028')
  .replace(/\u2029/g, '\\u2029');

const extractTitle = (html, fallback) => {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return stripHtml(h1?.[1] || title?.[1] || fallback);
};

const extractUpdatedAt = (text) => {
  const match = text.match(/Atualizado em\s+(\d{2}\/\d{2}\/\d{4}(?:\s+\d{2}h\d{2})?)/i)
    || text.match(/Publicado em\s+(\d{2}\/\d{2}\/\d{4}(?:\s+\d{2}h\d{2})?)/i);
  return match?.[1] || null;
};

const buildSnippet = (text, terms) => {
  const normalized = normalize(text);
  const index = terms
    .map((term) => normalize(term))
    .map((term) => normalized.indexOf(term))
    .filter((position) => position >= 0)
    .sort((a, b) => a - b)[0] ?? 0;

  const start = Math.max(0, index - 140);
  return text.slice(start, start + 360).trim();
};

const readJson = async (filePath, fallback) => {
  if (!existsSync(filePath)) return fallback;
  return JSON.parse(await readFile(filePath, 'utf8'));
};

const fetchSource = async (source) => {
  const officialUrl = assertAllowedOfficialUrl(source.url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  const response = await fetch(officialUrl, {
    headers: {
      'user-agent': 'calendario-tributario-update-checker/1.0 (+https://www.gov.br/)'
    },
    signal: controller.signal
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
    throw new Error(`Tipo de conteudo inesperado: ${contentType || 'nao informado'}`);
  }

  const html = await response.text();
  if (Buffer.byteLength(html, 'utf8') > maxResponseBytes) {
    throw new Error(`Resposta excede limite de ${maxResponseBytes} bytes`);
  }

  const text = stripHtml(html);
  const normalized = normalize(text);

  return {
    id: source.id,
    name: source.name,
    authority: source.authority,
    url: officialUrl,
    affects: source.affects,
    title: extractTitle(html, source.name),
    updatedAt: extractUpdatedAt(text),
    hash: hashText(normalized),
    snippet: buildSnippet(text, source.affects)
  };
};

const main = async () => {
  await mkdir(dataDir, { recursive: true });

  const config = await readJson(sourcesPath, { sources: [] });
  const previousState = await readJson(statePath, { checkedAt: null, sources: {} });
  const checkedAt = new Date().toISOString();
  const nextState = { checkedAt, sources: {} };
  const changes = [];
  const errors = [];
  let successfulFetches = 0;

  for (const source of config.sources) {
    try {
      const current = await fetchSource(source);
      const previous = previousState.sources[source.id];
      successfulFetches += 1;

      nextState.sources[source.id] = {
        hash: current.hash,
        checkedAt,
        title: current.title,
        updatedAt: current.updatedAt,
        url: current.url
      };

      if (!previous) {
        changes.push({ ...current, changeType: 'new-source' });
        continue;
      }

      if (previous.hash !== current.hash) {
        changes.push({
          ...current,
          changeType: 'content-changed',
          previousCheckedAt: previous.checkedAt,
          previousUpdatedAt: previous.updatedAt || null
        });
      }
    } catch (error) {
      nextState.sources[source.id] = previousState.sources[source.id] || {
        hash: null,
        checkedAt: null,
        title: source.name,
        updatedAt: null,
        url: source.url
      };
      errors.push({
        id: source.id,
        name: source.name,
        authority: source.authority,
        url: source.url,
        message: error.message
      });
    }
  }

  if (successfulFetches === 0) {
    throw new Error('Nenhuma fonte oficial pode ser consultada.');
  }

  const output = {
    checkedAt,
    hasChanges: changes.length > 0,
    changes,
    errors,
    message: changes.length > 0
      ? 'Fontes oficiais tiveram alteracoes desde a ultima verificacao. Revise os links antes de atualizar prazos.'
      : 'Nenhuma mudanca oficial detectada desde a ultima verificacao.'
  };

  await writeFile(statePath, `${safeJavaScriptJson(nextState)}\n`, 'utf8');
  await writeFile(outputPath, `window.GOVERNMENT_UPDATES = ${safeJavaScriptJson(output)};\n`, 'utf8');

  console.log(`${changes.length} mudanca(s) detectada(s), ${errors.length} erro(s), ${successfulFetches} fonte(s) consultada(s).`);
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

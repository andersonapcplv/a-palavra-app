import fs from 'node:fs';
import crypto from 'node:crypto';

const root = process.cwd();
const input = JSON.parse(fs.readFileSync('runs/piloto-marcos-1-1-3-15/generation-input.json', 'utf8'));
const canonical = JSON.parse(fs.readFileSync('36_criterios_canonicos.json', 'utf8'));
const gateIds = canonical.gates.map((gate) => gate.id);
const required = ['title', 'objective', 'context', 'explanation', 'reflection_questions', 'application', 'summary', 'prayer'];

function jsonFromText(text) {
  if (text && typeof text === 'object') {
    if (text.title || text.gates || text.objective) return text;
    for (const key of ['response', 'output_text', 'content', 'text', 'message', 'result', 'output']) {
      if (text[key] !== undefined) {
        try { return jsonFromText(text[key]); } catch {}
      }
    }
    if (Array.isArray(text)) for (const item of text) { try { return jsonFromText(item); } catch {} }
  }
  const clean = String(text).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try { return JSON.parse(clean); } catch {}
  for (let start = 0; start < clean.length; start += 1) {
    if (clean[start] !== '{' && clean[start] !== '[') continue;
    const opening = clean[start];
    const closing = opening === '{' ? '}' : ']';
    let depth = 0;
    let quoted = false;
    let escaped = false;
    for (let end = start; end < clean.length; end += 1) {
      const char = clean[end];
      if (quoted) {
        if (escaped) escaped = false;
        else if (char === '\\') escaped = true;
        else if (char === '"') quoted = false;
        continue;
      }
      if (char === '"') { quoted = true; continue; }
      if (char === opening) depth += 1;
      else if (char === closing) {
        depth -= 1;
        if (depth === 0) {
          try { return JSON.parse(clean.slice(start, end + 1)); } catch {}
          break;
        }
      }
    }
  }
  throw new Error('Resposta não contém um JSON válido');
}
function responseShape(value, depth = 0) {
  if (depth > 3 || value === null) return value === null ? 'null' : typeof value;
  if (Array.isArray(value)) return { array: value.length, item: value.length ? responseShape(value[0], depth + 1) : null };
  if (typeof value === 'object') return Object.fromEntries(Object.keys(value).slice(0, 20).map((key) => [key, responseShape(value[key], depth + 1)]));
  return typeof value;
}
function assertDraft(draft) {
  if (!draft || typeof draft !== 'object' || Array.isArray(draft)) throw new Error('rascunho não é objeto');
  for (const field of required) if (!(field in draft)) throw new Error(`campo ausente no rascunho: ${field}`);
  if (!Array.isArray(draft.reflection_questions) || draft.reflection_questions.length !== 3) throw new Error('reflection_questions deve conter exatamente 3 itens');
}
function gatePrompt(content) {
  return `Audite o estudo abaixo contra os 36 critérios canônicos. Retorne SOMENTE JSON válido no formato {"gates":{"ID":{"decision":"pass|fail|review|unknown","evidence":"evidência curta"}}}. Inclua exatamente todos os IDs, sem extras. Não aprove por falta de evidência. A evidência deve relacionar o estudo à passagem fornecida.\n\nREFERÊNCIA: ${input.reference}\nPASSAGEM:\n${input.source_passage.map((v) => `${v.reference}: ${v.text}`).join('\n')}\n\nESTUDO:\n${content}\n\nCRITÉRIOS:\n${canonical.gates.map((g) => `${g.id}: ${g.explanation_pt_br}`).join('\n')}`;
}
async function gemini(prompt, mode = 'generation') {
  const model = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
  const system = mode === 'generation'
    ? 'Gere um rascunho editorial em português brasileiro. Retorne somente JSON com title, objective, context, explanation, reflection_questions (3), application, summary e prayer. Não declare aprovação.'
    : 'Você é um auditor independente. Retorne somente JSON válido e não faça comentários fora do JSON.';
  const body = JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, responseMimeType: 'application/json' } });
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body });
    if (response.ok) {
      const data = await response.json();
      return jsonFromText(data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '');
    }
    const errorText = await response.text();
    const retryable = [429, 500, 502, 503, 504].includes(response.status);
    if (!retryable || attempt === 3) throw new Error(`Gemini HTTP ${response.status}: ${errorText}`);
    await new Promise((resolve) => setTimeout(resolve, 3000 * (attempt + 1)));
  }
}
async function groq(prompt) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify({ model: 'openai/gpt-oss-120b', temperature: 0.1, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'Você é um auditor independente. Retorne somente JSON válido e não faça comentários fora do JSON.' }, { role: 'user', content: prompt }] }) });
  if (!response.ok) throw new Error(`Groq HTTP ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return jsonFromText(data.choices?.[0]?.message?.content || '');
}
async function cloudflare(prompt, mode = 'generation') {
  if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_AI_TOKEN) throw new Error('Secrets CLOUDFLARE_ACCOUNT_ID e CLOUDFLARE_AI_TOKEN são obrigatórios no modo temporário');
  const model = process.env.CLOUDFLARE_MODEL || '@cf/openai/gpt-oss-120b';
  const url = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(process.env.CLOUDFLARE_ACCOUNT_ID)}/ai/v1/chat/completions`;
  const system = mode === 'generation'
    ? 'Gere um rascunho editorial em português brasileiro. Retorne somente JSON com title, objective, context, explanation, reflection_questions (3), application, summary e prayer. Não declare aprovação.'
    : 'Você é um auditor independente. Retorne somente JSON válido e não faça comentários fora do JSON.';
  const response = await fetch(url, { method: 'POST', headers: { authorization: `Bearer ${process.env.CLOUDFLARE_AI_TOKEN}`, 'content-type': 'application/json' }, body: JSON.stringify({ model, temperature: 0.1, messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }] }) });
  if (!response.ok) throw new Error(`Cloudflare HTTP ${response.status}: ${await response.text()}`);
  const data = await response.json();
  const message = data.choices?.[0]?.message || {};
  const text = message.content || message.reasoning_content || message.reasoning || data.output_text || data.result?.response || data.response || data.result || data.output || '';
  try { return jsonFromText(text); } catch (error) { throw new Error(`Cloudflare não retornou JSON; campos recebidos: ${JSON.stringify(responseShape(data))}; ${error.message}`); }
}
function normalizeAudit(raw, model) {
  if (!raw?.gates || typeof raw.gates !== 'object') throw new Error(`${model}: resposta sem gates`);
  const gates = {};
  for (const id of gateIds) {
    const result = raw.gates[id];
    if (!result) throw new Error(`${model}: gate ausente ${id}`);
    gates[id] = { decision: result.decision, evidence: String(result.evidence || '') };
  }
  return { model, completed_at: new Date().toISOString(), gates };
}
const evidenceDir = 'runs/piloto-marcos-1-1-3-15/evidence';
fs.mkdirSync(evidenceDir, { recursive: true });
const available = [
  process.env.GEMINI_API_KEY ? 'gemini' : null,
  process.env.GROQ_API_KEY ? 'groq' : null,
  process.env.CLOUDFLARE_AI_TOKEN && process.env.CLOUDFLARE_ACCOUNT_ID ? 'cloudflare' : null,
].filter(Boolean);
if (available.length < 2) throw new Error('Auditoria pausada: são necessárias pelo menos duas APIs disponíveis entre Gemini, Groq e Cloudflare');
const auditors = available.length === 3 ? ['gemini', 'groq'] : available;
const policy = auditors.slice().sort().join('-');
const callProvider = (provider, prompt, mode) => provider === 'gemini' ? gemini(prompt, mode) : provider === 'groq' ? groq(prompt) : cloudflare(prompt, mode);
const generationInput = JSON.stringify({ study_id: input.study_id, reference: input.reference, source_passage: input.source_passage, content_schema: input.content_schema });
const generationProvider = available.includes('cloudflare') ? 'cloudflare' : available[0];
const generated = await callProvider(generationProvider, generationInput, 'generation');
assertDraft(generated);
const content = JSON.stringify(generated, null, 2);
const prompt = gatePrompt(content);
const audits = {};
for (const auditor of auditors) {
  const model = auditor === 'gemini' ? (process.env.GEMINI_MODEL || 'gemini-3.8-flash') : auditor === 'groq' ? 'openai/gpt-oss-120b' : `cloudflare/${process.env.CLOUDFLARE_MODEL || '@cf/openai/gpt-oss-120b'}`;
  audits[auditor] = normalizeAudit(await callProvider(auditor, prompt, 'audit'), model);
}
const pkg = { audit_policy: policy, study_id: input.study_id, reference: input.reference, content, content_sha256: crypto.createHash('sha256').update(content, 'utf8').digest('hex'), audits };
fs.writeFileSync(`${evidenceDir}/audit-package.json`, JSON.stringify(pkg, null, 2) + '\n');
const validation = await import('../scripts/validate-audit-package.mjs');
const result = validation.validateAuditPackage(pkg, gateIds);
fs.writeFileSync(`${evidenceDir}/gate-result.json`, JSON.stringify(result, null, 2) + '\n');
if (!result.valid) { console.error(JSON.stringify(result, null, 2)); process.exit(1); }
const approved = JSON.parse(fs.readFileSync('content/studies-approved.json', 'utf8'));
approved.studies = approved.studies.filter((study) => study.id !== input.study_id);
approved.studies.push({ id: input.study_id, reference: input.reference, ...generated, audit_policy: policy, audit_status: 'approved_for_publication', content_sha256: pkg.content_sha256 });
fs.writeFileSync('content/studies-approved.json', JSON.stringify(approved, null, 2) + '\n');
console.log(`APPROVED_FOR_PUBLICATION ${input.study_id} ${pkg.content_sha256}`);

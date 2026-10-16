import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const CANONICAL_FILE = '36_criterios_canonicos.json';
const AUDIT_POLICIES = {
  'gemini-groq': { auditors: ['gemini', 'groq'], label: 'Gemini e Groq' },
  'cloudflare-groq-temporary': { auditors: ['cloudflare', 'groq'], label: 'Cloudflare e Groq (temporário)' },
};
const DECISIONS = new Set(['pass', 'fail', 'review', 'unknown']);

function readCanonicalGateIds(file = CANONICAL_FILE) {
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(parsed.gates) || parsed.gates.length !== 36) {
    throw new Error('o contrato canônico precisa conter exatamente 36 gates');
  }
  return parsed.gates.map((gate) => gate.id);
}

export function validateAuditPackage(pkg, gateIds = readCanonicalGateIds()) {
  const errors = [];
  const blockers = [];
  const addError = (message) => errors.push(message);
  const addBlocker = (message) => blockers.push(message);

  if (!pkg || typeof pkg !== 'object' || Array.isArray(pkg)) {
    return { valid: false, status: 'blocked', errors: ['pacote deve ser um objeto JSON'], blockers: [] };
  }

  if (typeof pkg.study_id !== 'string' || !pkg.study_id.trim()) addError('study_id obrigatório');
  if (typeof pkg.reference !== 'string' || !pkg.reference.trim()) addError('reference obrigatória');
  if (typeof pkg.content !== 'string' || !pkg.content.trim()) addError('content obrigatório e deve ser exatamente o texto enviado aos dois auditores');
  if (typeof pkg.content_sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(pkg.content_sha256)) {
    addError('content_sha256 deve conter exatamente 64 caracteres hexadecimais');
  } else if (typeof pkg.content === 'string' && createHash('sha256').update(pkg.content, 'utf8').digest('hex') !== pkg.content_sha256.toLowerCase()) {
    addError('content_sha256 não corresponde exatamente ao conteúdo auditado');
  }

  const policy = AUDIT_POLICIES[pkg.audit_policy || 'gemini-groq'];
  if (!policy) addError(`audit_policy inválida: ${pkg.audit_policy}`);

  if (!pkg.audits || typeof pkg.audits !== 'object' || Array.isArray(pkg.audits)) {
    addError(`audits deve conter exatamente os resultados de ${policy?.label || 'dois auditores'}`);
  } else {
    const actualAuditors = Object.keys(pkg.audits).sort();
    const expectedAuditors = [...(policy?.auditors || [])].sort();
    if (JSON.stringify(actualAuditors) !== JSON.stringify(expectedAuditors)) {
      addError(`audits deve conter exatamente dois auditores: ${(policy?.auditors || []).join(' e ')}; terceiros ou substitutos não são aceitos`);
    }

    for (const auditor of (policy?.auditors || [])) {
      const audit = pkg.audits[auditor];
      if (!audit || typeof audit !== 'object' || Array.isArray(audit)) {
        addError(`auditoria ${auditor} ausente ou inválida`);
        continue;
      }
      if (typeof audit.model !== 'string' || !audit.model.trim()) {
        addError(`${auditor}: model obrigatório`);
      } else if (auditor === 'gemini' && !/gemini.*flash/i.test(audit.model)) {
        addError('gemini: o modelo deve ser da família Gemini Flash');
      } else if (auditor === 'cloudflare' && !audit.model.toLowerCase().includes('cloudflare')) {
        addError('cloudflare: o modelo deve identificar o provedor Cloudflare');
      } else if (auditor === 'groq' && audit.model !== 'openai/gpt-oss-120b') {
        addError('groq: o modelo deve ser openai/gpt-oss-120b');
      }
      if (typeof audit.completed_at !== 'string' || !audit.completed_at.trim() || Number.isNaN(Date.parse(audit.completed_at))) {
        addError(`${auditor}: completed_at deve ser uma data válida`);
      }
      if (!audit.gates || typeof audit.gates !== 'object' || Array.isArray(audit.gates)) {
        addError(`${auditor}: gates deve ser um objeto`);
        continue;
      }

      const actualGateIds = Object.keys(audit.gates).sort();
      const expectedGateIds = [...gateIds].sort();
      if (JSON.stringify(actualGateIds) !== JSON.stringify(expectedGateIds)) {
        const missing = expectedGateIds.filter((id) => !actualGateIds.includes(id));
        const extra = actualGateIds.filter((id) => !expectedGateIds.includes(id));
        if (missing.length) addError(`${auditor}: gates ausentes: ${missing.join(', ')}`);
        if (extra.length) addError(`${auditor}: gates não canônicos: ${extra.join(', ')}`);
      }

      for (const gateId of gateIds) {
        const result = audit.gates[gateId];
        if (!result || typeof result !== 'object' || Array.isArray(result)) {
          addError(`${auditor}.${gateId}: resultado ausente ou inválido`);
          continue;
        }
        if (!DECISIONS.has(result.decision)) {
          addError(`${auditor}.${gateId}: decision deve ser pass, fail, review ou unknown`);
        } else if (result.decision !== 'pass') {
          addBlocker(`${auditor}.${gateId}: ${result.decision}`);
        }
        if (typeof result.evidence !== 'string' || !result.evidence.trim()) {
          addError(`${auditor}.${gateId}: evidência obrigatória`);
        }
      }
    }
  }

  const valid = errors.length === 0 && blockers.length === 0;
  return {
    valid,
    status: valid ? 'approved_for_publication' : 'blocked',
    errors,
    blockers,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = process.argv[2];
  if (!file) {
    console.error('Uso: node scripts/validate-audit-package.mjs <arquivo.json>');
    process.exit(2);
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
    const result = validateAuditPackage(pkg);
    if (result.valid) {
      console.log(`OK: todos os 36 critérios aprovados — ${result.status}`);
      process.exit(0);
    }
    console.error('BLOCKED: pacote não pode seguir para publicação.');
    for (const error of result.errors) console.error(`ERRO: ${error}`);
    for (const blocker of result.blockers) console.error(`BLOQUEIO: ${blocker}`);
    process.exit(1);
  } catch (error) {
    console.error(`BLOCKED: ${error.message}`);
    process.exit(1);
  }
}

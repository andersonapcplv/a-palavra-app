import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { validateAuditPackage } from '../scripts/validate-audit-package.mjs';

const canonical = JSON.parse(fs.readFileSync('36_criterios_canonicos.json', 'utf8'));
const gateIds = canonical.gates.map((gate) => gate.id);

function makeAudit(decision = 'pass', auditor = 'gemini') {
  return {
    model: auditor === 'gemini' ? 'gemini-2.5-flash' : 'openai/gpt-oss-120b',
    completed_at: '2026-10-15T12:00:00.000Z',
    gates: Object.fromEntries(gateIds.map((id) => [id, {
      decision,
      evidence: `Evidência de teste para ${id}`,
    }])),
  };
}

function makePackage() {
  const content = 'Texto de estudo controlado para o teste de aceitação.';
  return {
    study_id: 'piloto-marcos-01',
    reference: 'Marcos 1:1-8',
    content,
    content_sha256: createHash('sha256').update(content, 'utf8').digest('hex'),
    audits: {
      gemini: makeAudit('pass', 'gemini'),
      groq: makeAudit('pass', 'groq'),
    },
  };
}

const bothPass = validateAuditPackage(makePackage(), gateIds);
assert.equal(bothPass.valid, true, 'dois passes completos e hash íntegro liberam publicação');
assert.equal(bothPass.status, 'approved_for_publication');

const oneFails = makePackage();
oneFails.audits.groq.gates.TARGET_FIDELITY.decision = 'fail';
assert.equal(validateAuditPackage(oneFails, gateIds).valid, false, 'um fail bloqueia mesmo com o outro auditor aprovando');

const oneUnknown = makePackage();
oneUnknown.audits.gemini.gates.PASTORAL_SAFETY.decision = 'unknown';
assert.equal(validateAuditPackage(oneUnknown, gateIds).valid, false, 'unknown bloqueia');

const missingGate = makePackage();
delete missingGate.audits.gemini.gates.LANGUAGE_CLARITY;
assert.equal(validateAuditPackage(missingGate, gateIds).valid, false, 'gate ausente bloqueia');

const thirdAuditor = makePackage();
thirdAuditor.audits.cloudflare = makeAudit('pass');
assert.equal(validateAuditPackage(thirdAuditor, gateIds).valid, false, 'terceiro auditor não é aceito');

const wrongGemini = makePackage();
wrongGemini.audits.gemini.model = 'gemini-2.5-pro';
assert.equal(validateAuditPackage(wrongGemini, gateIds).valid, false, 'Gemini que não é Flash bloqueia');

const wrongGroq = makePackage();
wrongGroq.audits.groq.model = 'llama-3.3-70b-versatile';
assert.equal(validateAuditPackage(wrongGroq, gateIds).valid, false, 'modelo Groq diferente bloqueia');

const alternatePair = makePackage();
delete alternatePair.audits.groq;
alternatePair.audits.cloudflare = makeAudit('pass');
assert.equal(validateAuditPackage(alternatePair, gateIds).valid, false, 'Cloudflare não substitui auditor fixo');

const missingEvidence = makePackage();
missingEvidence.audits.groq.gates.LANGUAGE_CLARITY.evidence = '  ';
assert.equal(validateAuditPackage(missingEvidence, gateIds).valid, false, 'evidência vazia bloqueia');

const wrongHash = makePackage();
wrongHash.content_sha256 = 'a'.repeat(64);
assert.equal(validateAuditPackage(wrongHash, gateIds).valid, false, 'hash inválido bloqueia');

console.log('OK: política de auditoria — Gemini e Groq obrigatórios, todos os 36 gates, sem terceiro auditor ou aprovação parcial');

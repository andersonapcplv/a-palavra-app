import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const canonical = JSON.parse(fs.readFileSync(path.join(root, '36_criterios_canonicos.json'), 'utf8'));
const gateIds = canonical.gates.map((gate) => gate.id);
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-palavra-audit-cli-'));

function makeAudit(auditor, decision = 'pass') {
  return {
    model: auditor === 'gemini' ? 'gemini-2.5-flash' : 'openai/gpt-oss-120b',
    completed_at: '2026-10-15T12:00:00.000Z',
    gates: Object.fromEntries(gateIds.map((id) => [id, {
      decision,
      evidence: `Fixture offline: evidência controlada para ${id}`,
    }])),
  };
}

function makePackage(decision = 'pass') {
  const content = 'Conteúdo sintético de fixture; não é estudo editorial e não será publicado.';
  return {
    study_id: 'fixture-cli-offline',
    reference: 'Marcos 1:1-8',
    content,
    content_sha256: createHash('sha256').update(content, 'utf8').digest('hex'),
    audits: {
      gemini: makeAudit('gemini', decision),
      groq: makeAudit('groq', decision),
    },
  };
}

function runValidator(file) {
  return spawnSync(process.execPath, [
    path.join(root, 'scripts/validate-audit-package.mjs'),
    file,
  ], { cwd: root, encoding: 'utf8' });
}

const approvedFile = path.join(tempDir, 'approved.json');
const blockedFile = path.join(tempDir, 'blocked.json');
fs.writeFileSync(approvedFile, JSON.stringify(makePackage('pass')));
fs.writeFileSync(blockedFile, JSON.stringify(makePackage('fail')));

const approved = runValidator(approvedFile);
assert.equal(approved.status, 0, `fixture aprovada deveria passar: ${approved.stderr}`);
assert.match(approved.stdout, /approved_for_publication/);

const blocked = runValidator(blockedFile);
assert.notEqual(blocked.status, 0, 'fixture com fail deveria ser bloqueada');
assert.match(blocked.stderr, /BLOCKED/);
assert.match(blocked.stderr, /BLOQUEIO/);

fs.rmSync(tempDir, { recursive: true, force: true });
console.log('OK: CLI do gate — fixture aprovada passa e fixture com fail é bloqueada, sem APIs');

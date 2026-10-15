import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { prepareGenerationInput, parseReference } from '../scripts/prepare-study-generation.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const queuePath = path.join(root, 'content/queue/piloto-marcos-1-1-3-15.json');
const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
const prepared = prepareGenerationInput(queue);

assert.deepEqual(parseReference(queue.reference), {
  bookName: 'Marcos',
  startChapter: 1,
  startVerse: 1,
  endChapter: 3,
  endVerse: 15,
});
assert.equal(prepared.expected_verses, 88, 'o alvo proposto precisa conter exatamente 88 versículos');
assert.equal(prepared.source_passage.length, 88);
assert.equal(prepared.source_passage[0].reference, 'Marcos 1:1');
assert.equal(prepared.source_passage.at(-1).reference, 'Marcos 3:15');
assert.equal(prepared.gate_contract.length, 36);
assert.equal(prepared.source_translation.attribution_file, 'data/biblia-livre-n4-origem.json');
assert.equal(prepared.generation_status, 'ready_for_qwen_generation');
assert.equal(prepared.audit_status, 'not_started');
assert.equal(prepared.publication_status, 'not_approved');
assert.equal(prepared.provisional_target, true);

assert.throws(
  () => prepareGenerationInput({ ...queue, expected_verses: 87 }),
  /esperados 87 versículos/,
  'contagem divergente bloqueia o preparo'
);

console.log('OK: entrada Qwen — Marcos 1:1–3:15, 88 versículos, 36 critérios anexados, ainda não gerada/auditada/publicada');

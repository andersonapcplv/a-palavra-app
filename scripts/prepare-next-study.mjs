import fs from 'node:fs';
import path from 'node:path';
import { prepareGenerationInput } from './prepare-study-generation.mjs';

const queue = JSON.parse(fs.readFileSync('content/queue/all-chapter-studies.json', 'utf8'));
const approved = JSON.parse(fs.readFileSync('content/studies-approved.json', 'utf8'));
const approvedIds = new Set((approved.studies || []).map((study) => study.id));
const priority = queue.studies.filter((study) => /^estudo-marcos-\d+$/.test(study.study_id));
const remainder = queue.studies.filter((study) => !/^estudo-marcos-\d+$/.test(study.study_id));
const item = [...priority, ...remainder].find((study) => !approvedIds.has(study.study_id));
if (!item) {
  console.log('QUEUE_COMPLETE');
  process.exit(0);
}
const prepared = prepareGenerationInput(item);
const output = path.join('runs', item.study_id, 'generation-input.json');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(prepared, null, 2)}\n`);
console.log(JSON.stringify({ study_id: item.study_id, reference: item.reference, input: output, evidence: `runs/${item.study_id}/evidence` }));

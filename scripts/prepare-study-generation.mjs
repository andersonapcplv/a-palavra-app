import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function normalizeName(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
}

export function parseReference(reference) {
  const match = String(reference).match(/^(.+?)\s+(\d+):(\d+)\s*[-–]\s*(?:(\d+):)?(\d+)$/u);
  if (!match) throw new Error(`referência não reconhecida: ${reference}`);
  const startChapter = Number(match[2]);
  const startVerse = Number(match[3]);
  const endChapter = match[4] ? Number(match[4]) : startChapter;
  const endVerse = Number(match[5]);
  if (startChapter < 1 || startVerse < 1 || endChapter < startChapter || endVerse < 1) {
    throw new Error(`limites inválidos na referência: ${reference}`);
  }
  return { bookName: match[1].trim(), startChapter, startVerse, endChapter, endVerse };
}

export function prepareGenerationInput(queue, options = {}) {
  const corpusPath = options.corpusPath ?? path.join(ROOT, 'data/biblia-livre-n4.json');
  const gatesPath = options.gatesPath ?? path.join(ROOT, '36_criterios_canonicos.json');
  const promptPath = options.promptPath ?? path.join(ROOT, 'prompts/GENERATE_STUDY_PILOT.md');
  const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
  const canonical = JSON.parse(fs.readFileSync(gatesPath, 'utf8'));
  const template = fs.readFileSync(promptPath, 'utf8').trim();

  if (typeof queue.study_id !== 'string' || !/^[a-z0-9][a-z0-9-]{2,80}$/.test(queue.study_id)) {
    throw new Error('study_id inválido; use letras minúsculas, números e hífens');
  }
  if (!Array.isArray(canonical.gates) || canonical.gates.length !== 36) {
    throw new Error('o contrato canônico não contém exatamente 36 critérios');
  }

  const range = parseReference(queue.reference);
  const book = corpus.find((item) => normalizeName(item.name) === normalizeName(range.bookName));
  if (!book) throw new Error(`livro não encontrado no corpus: ${range.bookName}`);
  if (range.endChapter > book.chapters.length) throw new Error('capítulo final fora do corpus');

  const sourcePassage = [];
  for (let chapterNumber = range.startChapter; chapterNumber <= range.endChapter; chapterNumber += 1) {
    const verses = book.chapters[chapterNumber - 1];
    const first = chapterNumber === range.startChapter ? range.startVerse : 1;
    const last = chapterNumber === range.endChapter ? range.endVerse : verses.length;
    if (!Array.isArray(verses) || first > verses.length || last > verses.length || first > last) {
      throw new Error(`limites de versículos inválidos no capítulo ${chapterNumber}`);
    }
    for (let verseNumber = first; verseNumber <= last; verseNumber += 1) {
      sourcePassage.push({
        reference: `${book.name} ${chapterNumber}:${verseNumber}`,
        text: verses[verseNumber - 1],
      });
    }
  }

  if (Number.isInteger(queue.expected_verses) && sourcePassage.length !== queue.expected_verses) {
    throw new Error(`esperados ${queue.expected_verses} versículos, mas a referência contém ${sourcePassage.length}`);
  }

  const gateContract = canonical.gates.map(({ number, id, explanation_pt_br }) => ({ number, id, explanation_pt_br }));
  const prompt = `${template}\n\n## Unidade solicitada\n- ID: ${queue.study_id}\n- Referência: ${queue.reference}\n- Quantidade de versículos: ${sourcePassage.length}\n- Tradução: Bíblia Livre N4 (preservar atribuição CC BY 3.0 Brasil)\n\nOs critérios canônicos completos estão no campo gate_contract desta entrada. Eles são requisitos de qualidade do rascunho, não uma autoauditoria. Não emita resultados de auditoria.`;

  return {
    schema_version: 1,
    study_id: queue.study_id,
    reference: queue.reference,
    expected_verses: sourcePassage.length,
    provisional_target: queue.provisional_target === true,
    generation_status: 'ready_for_qwen_generation',
    generator: queue.generator ?? 'Qwen on Kaggle',
    language: 'pt-BR',
    source_translation: {
      name: 'Bíblia Livre N4',
      license: 'CC BY 3.0 Brasil',
      attribution_file: 'data/biblia-livre-n4-origem.json',
    },
    prompt,
    content_schema: {
      title: 'string',
      objective: 'string',
      context: 'string',
      explanation: 'string',
      reflection_questions: 'array<string> (3 perguntas)',
      application: 'string',
      summary: 'string',
      prayer: 'string',
    },
    gate_contract: gateContract,
    source_passage: sourcePassage,
    audit_status: 'not_started',
    publication_status: 'not_approved',
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const queuePath = path.resolve(process.argv[2] ?? path.join(ROOT, 'content/queue/piloto-marcos-1-1-3-15.json'));
    const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
    const prepared = prepareGenerationInput(queue);
    const outputPath = path.resolve(process.argv[3] ?? path.join(ROOT, 'runs', queue.study_id, 'generation-input.json'));
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(prepared, null, 2)}\n`);
    console.log(`Entrada pronta para o Qwen: ${prepared.study_id}; ${prepared.expected_verses} versículos; ${prepared.gate_contract.length} critérios.`);
    console.log(`Arquivo: ${path.relative(ROOT, outputPath)}`);
    console.log('Nenhuma API foi chamada e nenhum conteúdo foi aprovado.');
  } catch (error) {
    console.error(`Geração não iniciada: ${error.message}`);
    process.exit(1);
  }
}

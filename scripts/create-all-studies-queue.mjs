import fs from 'node:fs';

const bible = JSON.parse(fs.readFileSync('data/biblia-livre-n4.json', 'utf8'));
const slug = (value) => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const studies = [];
for (const book of bible) {
  const bookSlug = slug(book.name);
  book.chapters.forEach((verses, index) => {
    const chapter = index + 1;
    studies.push({
      study_id: `estudo-${bookSlug}-${chapter}`,
      reference: `${book.name} ${chapter}:1-${chapter}:${verses.length}`,
      expected_verses: verses.length,
      generator: 'Cloudflare Workers AI',
      language: 'pt-BR',
      generation_status: 'queued',
      audit_status: 'not_started',
      publication_status: 'not_approved',
    });
  });
}
const output = { schema_version: 1, unit: 'one educational study per Bible chapter', total: studies.length, studies };
fs.writeFileSync('content/queue/all-chapter-studies.json', `${JSON.stringify(output, null, 2)}\n`);
console.log(`Fila criada: ${studies.length} estudos para ${bible.length} livros.`);

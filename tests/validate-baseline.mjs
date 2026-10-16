import fs from 'node:fs';
import crypto from 'node:crypto';

const fail = (message) => { console.error(`FAIL: ${message}`); process.exitCode = 1; };
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

const required = [
  'index.html', 'app.js', 'styles.css', 'sw.js', 'manifest.webmanifest',
  'assets/icon-192.png', 'assets/icon-512.png', 'assets/hero-paz-piloto.webp', 'assets/reflexao-paz-piloto.webp', 'assets/quadro-institucional-piloto.webp',
  'data/biblia-livre-n4.json', 'data/marcos-n4.json', 'data/biblia-livre-n4-origem.json',
  'assets/audio/palavra-paz-reflexao.ogg', 'docs/AUDIO_CREDITS.md',
  '36_criterios_canonicos.json', 'content/studies-approved.json'
];
for (const file of required) if (!fs.existsSync(file)) fail(`arquivo ausente: ${file}`);

const manifest = readJson('manifest.webmanifest');
if (manifest.lang !== 'pt-BR') fail('manifesto sem lang pt-BR');
if (!Array.isArray(manifest.icons) || manifest.icons.length < 2) fail('manifesto sem ícones suficientes');

const bible = readJson('data/biblia-livre-n4.json');
const chapters = bible.reduce((total, book) => total + book.chapters.length, 0);
const verses = bible.reduce((total, book) => total + book.chapters.reduce((n, chapter) => n + chapter.length, 0), 0);
if (bible.length !== 66) fail(`livros esperados 66, encontrados ${bible.length}`);
if (chapters !== 1189) fail(`capítulos esperados 1189, encontrados ${chapters}`);
if (verses !== 31102) fail(`versículos esperados 31102, encontrados ${verses}`);

const gates = readJson('36_criterios_canonicos.json').gates.map((gate) => gate.id);
const gatesHash = crypto.createHash('sha256').update(gates.join('|')).digest('hex');
const expected = 'e5863bb7388275432fa0ab4dad0ecccbbb6c60787109addb90e5d0a7b728268a';
if (gates.length !== 36) fail(`gates esperados 36, encontrados ${gates.length}`);
if (gatesHash !== expected) fail(`SHA dos gates divergente: ${gatesHash}`);

const serviceWorker = fs.readFileSync('sw.js', 'utf8');
const appSource = fs.readFileSync('app.js', 'utf8');
const studies = readJson('content/studies-approved.json');
if (studies.schema_version !== 1 || !Array.isArray(studies.studies)) fail('manifesto de estudos inválido');
if (!serviceWorker.includes("const CACHE = 'a-palavra-v0.9.3'")) fail('versão esperada do cache não encontrada');
if (!serviceWorker.includes("url.search = ''")) fail('service worker não normaliza parâmetros de versão');
if (!serviceWorker.includes('cacheResponse(request, response)')) fail('service worker não atualiza o cache após buscar recursos');
if (!appSource.includes('bibleHighlights')) fail('persistência de marcações de versículos não encontrada');
if (!appSource.includes('chapterQuick')) fail('acesso rápido aos capítulos não encontrado');
if (!appSource.includes('bookPicker') || !appSource.includes('verseInput')) fail('navegador visual de livro e campo direto de versículo não encontrados');
if (!appSource.includes('apoie:')) fail('tela separada de apoio não encontrada');
if (!appSource.includes('loadApprovedStudies')) fail('carregamento de estudos aprovados não encontrado');
for (const staleReference of ['ambiente-leitura.mp3', 'ambientAudio', 'bindMusicControls', 'toggleMusic', 'stopMusic']) {
  if (appSource.includes(staleReference)) fail(`referência residual ao áudio removido: ${staleReference}`);
}

if (process.exitCode) process.exit();
console.log(`OK: baseline válida — ${bible.length} livros, ${chapters} capítulos, ${verses} versículos, ${gates.length} gates`);

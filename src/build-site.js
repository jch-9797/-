// 모의시험·학습 사이트 빌드: 문제(exam.js)와 암기노트 데이터를 site-template.html에 넣는다.
// 사용: node src/build-site.js <artifact용 출력 경로>  (저장소 루트의 index.html도 함께 만든다)
const fs = require('fs'), path = require('path');
const { SUBJ, Q } = require('./exam.js');
const read = f => fs.readFileSync(path.join(__dirname, f), 'utf8');

// 암기노트 데이터 (PDF 빌드 스크립트에서 데이터 부분만 실행)
const a = read('build-note.js');
const { S: P, F } = new Function(a.slice(a.indexOf('function face(o)'), a.indexOf('// ---------- HTML')) + ';return {S,F}')();
const b = read('build-written.js');
const i0 = b.indexOf('const S = [];');
const W = new Function('F', b.slice(i0, b.indexOf('const nMn')) + ';return S')(F);

const PIC = require('./pictures.js'), used = new Set();
const CLS = { '#1c7ed6': 'c1', '#2f9e44': 'c2', '#e8590c': 'c3', '#7048e8': 'c4', '#d6336c': 'c5' };
const tidy = secs => secs.map(s => ({
  no: s.no, title: s.title, sub: s.sub, cls: CLS[s.color] || 'c1',
  short: s.title.replace(/^.*? [①-④] /, '').replace(/ \(.*/, ''),
  cards: s.cards.map(({ t, m, s: st, i, table, tip, quote, face, who, img }) => {
    const pic = m && PIC[m] ? { sc: PIC[m][0], t: PIC[m][1].map(x => x.split('|')) } : undefined;
    if (m) used.add(m); if (m && !pic) console.warn('그림 없음:', m);
    return { t, m, s: st, i, table, tip, quote, face, who, img, pic };
  }),
}));

// 보기 순서: PDF 문제집과 같은 번호가 되도록 같은 시드로 섞는다
let seed = 20261118; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const q = [];
for (let s = 0; s < 5; s++) {
  const pos = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3];
  for (let i = 19; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pos[i], pos[j]] = [pos[j], pos[i]]; }
  for (let k = 0; k < 20; k++) {
    const [text, o, e] = Q[s * 20 + k]; const opts = o.slice(1); opts.splice(pos[k], 0, o[0]);
    q.push({ n: s * 20 + k + 1, s, q: text, o: opts, a: pos[k], e });
  }
}
const data = { subj: SUBJ.map(x => x[0]), q, written: tidy(W), practical: tidy(P) };
const js = x => JSON.stringify(x).replace(/</g, '\\u003c');
const page = read('site-template.html').replace('/*DATA*/null', () => js(data)).replace('/*GLOSS*/[]', () => js(require('./glossary.js')));
const gichul = fs.readFileSync(path.join(__dirname, '..', 'gichul', 'gichul.json'), 'utf8');
const out = process.argv[2], extra = process.argv[3];
if (out) fs.writeFileSync(out, page);
// 복원 문제(해설 포함)는 공개 저장소에 두지 않고, 게시용 데이터 파일에만 합친다
if (out && extra) {
  const g = JSON.parse(gichul), x = JSON.parse(fs.readFileSync(extra, 'utf8'));
  fs.writeFileSync(path.join(path.dirname(out), 'gichul.json'), JSON.stringify({ subj: g.subj, rounds: x.rounds.concat(g.rounds), q: x.q.concat(g.q) }));
}
fs.writeFileSync(path.join(__dirname, '..', 'index.html'),
  '<!doctype html>\n<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>\n<script>window.__GICHUL=' + js(JSON.parse(gichul)) + '</script>\n' + page + '\n</body></html>\n');
Object.keys(PIC).filter(k => !used.has(k)).forEach(k => console.warn('쓰이지 않은 그림:', k));
console.log('pictures', used.size, 'questions', q.length, 'cards', data.written.concat(data.practical).reduce((n, s) => n + s.cards.length, 0), 'bytes', page.length);

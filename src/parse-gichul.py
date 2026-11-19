# 기출문제 페이지(HTML)에서 문제·보기·정답만 뽑아 gichul/gichul.json 으로 저장한다.
# 사용: python3 -I src/parse-gichul.py <html 폴더> <출력 폴더>
# 해설·댓글은 가져오지 않는다. 문제 본문은 일반 텍스트로만 저장한다.
import html, json, os, re, sys

src, out = sys.argv[1], sys.argv[2]
SUBJ = ['심리학개론', '이상심리학', '심리검사', '임상심리학', '심리상담']
IMG = re.compile(r'^/images/bk/(bk\d{8})/([A-Za-z0-9_]+\.(?:gif|png|jpg))$')


def text(frag, imgs):
    for m in re.finditer(r'<img[^>]*src="([^"]+)"', frag):
        g = IMG.match(m.group(1))
        if not g:
            raise SystemExit('unexpected image ' + m.group(1))
        imgs.append(g.group(1) + '/' + g.group(2))
    frag = re.sub(r'</?br\s*/?>', '\n', frag)
    frag = re.sub(r'<[^>]+>', '', frag)
    return re.sub(r'[ \t]+', ' ', html.unescape(frag)).strip()


rounds, qs, skipped = [], [], 0
for f in sorted(os.listdir(src)):
    m = re.fullmatch(r'(bk(\d{4})(\d{2})(\d{2}))\.html', f)
    if not m:
        continue
    rid = m.group(1)
    s = open(os.path.join(src, f), encoding='utf-8', errors='replace').read()
    subj = [re.sub(r'^\d과목:\s*', '', x).strip() for x in re.findall(r'exam-class-title">[\s\S]*?<p[^>]*>([^<]+)</p>', s)]
    blocks = re.findall(r'question-num="(\d+)">([\s\S]*?)<div class="reply', s)
    n_ok = 0
    for num, b in blocks:
        num = int(num)
        t = re.search(r'<p class="exam-title"><span class="exam-number">\d+</span>\.([\s\S]*?)</p>', b)
        ol = re.search(r'<ol class="circlednumbers" correct="(\d)">([\s\S]*?)</ol>', b)
        if not t or not ol:
            print('skip', rid, num); continue
        lis = re.findall(r'<li[^>]*>([\s\S]*?)</li>', ol.group(2))
        if len(lis) != 4:
            print('skip (choices)', rid, num, len(lis)); continue
        qi, oi = [], []
        q = {'id': f'{rid}-{num}', 'r': rid, 'n': num, 's': (num - 1) // 20, 'q': text(t.group(1), qi), 'a': int(ol.group(1)) - 1}
        opts = []
        for li in lis:
            im = []
            opts.append(text(li, im)); oi.append(im[0] if im else '')
        q['o'] = opts
        if qi: q['img'] = qi
        if any(oi): q['oimg'] = oi
        if qi or any(oi):
            skipped += 1; continue  # 그림이 있어야 풀 수 있는 문항은 제외
        qs.append(q); n_ok += 1
    rounds.append({'id': rid, 'label': f'{m.group(2)}년 {int(m.group(3))}월 {int(m.group(4))}일 시행', 'n': n_ok})
    print(rid, n_ok, subj)

os.makedirs(out, exist_ok=True)
rounds.sort(key=lambda r: r['id'], reverse=True)
with open(os.path.join(out, 'gichul.json'), 'w', encoding='utf-8') as fp:
    fp.write('{"subj":' + json.dumps(SUBJ, ensure_ascii=False) + ',"rounds":' + json.dumps(rounds, ensure_ascii=False) + ',"q":[\n')
    fp.write(',\n'.join(json.dumps(q, ensure_ascii=False, separators=(',', ':')) for q in qs))
    fp.write('\n]}\n')
print('total', len(qs), 'skipped(image)', skipped, 'answers', [sum(1 for q in qs if q['a'] == k) for k in range(4)])

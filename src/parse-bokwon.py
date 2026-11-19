# 복원 문제 PDF(정답·해설판)에서 문제·보기·정답·해설을 뽑는다.
# 사용: python3 -I src/parse-bokwon.py <출력 json> <말뭉치 json(gichul.json)> <id=label=pdf경로> ...
# 결과물에는 제3자가 쓴 해설이 들어 있으므로 공개 저장소에 올리지 않는다.
import collections, json, re, subprocess, sys

out, corpus_path, specs = sys.argv[1], sys.argv[2], sys.argv[3:]
CIRC = '①②③④'
# 지문(보기 상자)이 PDF에 없는 문항을 가려내는 표현
NEEDS = re.compile(r'다음은|다음이|다음에서|다음의|다음과|다음 (사례|설명|내용|보기|증상|상황|대화|글|특징|\()|<보기>|보기에서|\(\s*\)|ㄱ\s*[,.:]|A\s*에 해당')


def raw_lines(pdf):
    t = subprocess.run(['pdftotext', '-raw', pdf, '-'], capture_output=True, text=True, check=True).stdout
    return [l.rstrip() for l in t.replace('\f', '\n').split('\n')]


docs = {}
for sp in specs:
    rid, label, pdf = sp.split('=', 2)
    docs[rid] = (label, raw_lines(pdf))

# ---- 줄바꿈 이어 붙이기: 낱말 중간에서 끊긴 줄인지 말뭉치 통계로 판단 ----
inside, across = collections.Counter(), collections.Counter()
texts = []
for _, lines in docs.values():
    texts += lines
g = json.load(open(corpus_path, encoding='utf-8'))
for q in g['q']:
    texts += [q['q']] + q['o']
for line in texts:
    toks = line.split()
    for t in toks:
        for i in range(1, len(t)):
            inside[t[max(0, i - 2):i] + '|' + t[i:i + 2]] += 1
            inside[t[i - 1:i] + '|' + t[i:i + 1]] += 0.2
    for a, b in zip(toks, toks[1:]):
        across[a[-2:] + '|' + b[:2]] += 1
        across[a[-1:] + '|' + b[:1]] += 0.2
PART = set('은는이가을를의에도와과로서며고나면만다요음함됨')


def join(a, b):
    if not a: return b
    if not b: return a
    x, y = a.split()[-1], b.split()[0]
    if re.search(r'[A-Za-z0-9,.;:!?)\]%]$', x) or re.match(r'[A-Za-z0-9(\[·‘“\'"]', y):
        if not (re.search(r'[)\]]$', x) and re.match(r'[가-힣]', y) and len(y) <= 3):
            return a + ' ' + b
    k2, k1 = x[-2:] + '|' + y[:2], x[-1:] + '|' + y[:1]
    i, c = inside[k2] + inside[k1], across[k2] + across[k1]
    if i == c:
        return a + (' ' if x[-1] in PART else '') + b
    return a + ('' if i > c else ' ') + b


def parse(lines):
    qs, cur, mode = [], None, None
    for l in lines:
        m = re.fullmatch(r'문제 (\d+)', l.strip())
        if m:
            cur = {'n': int(m.group(1)), 'q': '', 'o': [], 'a': None, 'e': ''}; qs.append(cur); mode = 'head'; continue
        if cur is None or not l.strip() or re.fullmatch(r'\d+ / \d+', l.strip()):
            continue
        s = l.strip()
        if mode == 'head':
            if s.startswith('·') or '정답률' in s or len(s) <= 12 and not re.search(r'[?.]', s) and not cur['q'] and not s[0] in CIRC and re.search(r'[요움]$|^[^\w\s]', s):
                continue
            mode = 'q'
        if s[0] in CIRC and mode in ('q', 'o'):
            mode = 'o'; cur['o'].append(s[1:].strip()); continue
        if s.startswith('정답 및 해설'):
            mode = 'e'; continue
        if mode == 'q': cur['q'] = join(cur['q'], s)
        elif mode == 'o': cur['o'][-1] = join(cur['o'][-1], s)
        elif mode == 'e': cur['e'] = join(cur['e'], s)
    return qs


rounds, allq, dropped = [], [], []
for rid, (label, lines) in docs.items():
    ok = 0
    for q in parse(lines):
        marks = [i for i, o in enumerate(q['o']) if '✔' in o]
        if len(q['o']) != 4 or len(marks) != 1 or not q['q']:
            dropped.append((rid, q['n'], 'format')); continue
        q['o'] = [o.replace('✔', '').strip() for o in q['o']]
        head, sep, rest = q['q'].partition('?')
        if sep and len(rest.strip()) >= 8:  # 물음 뒤에 지문이 이어지는 문항
            q['q'] = head.strip() + '?\n' + re.sub(r'\s*•\s*', '\n• ', rest.strip()).strip()
        elif NEEDS.search(q['q']) and not re.search(r'다음 중', q['q']):
            dropped.append((rid, q['n'], 'passage')); continue
        allq.append({'id': f'{rid}-{q["n"]}', 'r': rid, 'n': q['n'], 's': (q['n'] - 1) // 20, 'q': q['q'], 'a': marks[0], 'o': q['o'], 'e': q['e']}); ok += 1
    rounds.append({'id': rid, 'label': label, 'n': ok})
    print(rid, label, ok)
json.dump({'rounds': rounds, 'q': allq}, open(out, 'w', encoding='utf-8'), ensure_ascii=False)
print('total', len(allq), 'dropped', collections.Counter(d[2] for d in dropped))
print('passage-dropped sample:', [f'{r}#{n}' for r, n, w in dropped if w == 'passage'][:12], [d for d in dropped if d[2] == 'format'])

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

// ---------- 학자 캐리커처 (SVG) ----------
function face(o) {
  const skin = o.skin || '#f6d3b3', hc = o.hc || '#8a8a8a';
  let s = `<svg viewBox="0 0 100 110" class="face">`;
  s += `<circle cx="50" cy="52" r="48" fill="${o.bg || '#e8eefc'}"/>`;
  if (o.hair === 'long') s += `<path d="M20 50 Q18 14 50 12 Q82 14 80 50 L84 92 Q70 80 72 52 L28 52 Q30 80 16 92 Z" fill="${hc}"/>`;
  s += `<path d="M30 96 Q50 82 70 96 L74 110 L26 110 Z" fill="${o.cloth || '#394b6b'}"/>`;
  s += `<ellipse cx="50" cy="52" rx="24" ry="29" fill="${skin}"/>`;
  s += `<ellipse cx="25.5" cy="54" rx="4" ry="7" fill="${skin}"/><ellipse cx="74.5" cy="54" rx="4" ry="7" fill="${skin}"/>`;
  if (o.hair === 'full') s += `<path d="M26 44 Q24 18 50 18 Q76 18 74 44 Q66 30 50 31 Q34 30 26 44 Z" fill="${hc}"/>`;
  if (o.hair === 'side') s += `<path d="M26 50 Q22 30 34 26 Q30 38 30 48 Z" fill="${hc}"/><path d="M74 50 Q78 30 66 26 Q70 38 70 48 Z" fill="${hc}"/>`;
  if (o.hair === 'wild') s += `<path d="M22 50 Q10 30 28 20 Q34 8 50 14 Q66 8 72 20 Q90 30 78 50 Q74 32 50 30 Q26 32 22 50 Z" fill="${hc}"/>`;
  if (o.hair === 'long') s += `<path d="M27 44 Q28 20 50 20 Q72 20 73 44 Q60 32 50 33 Q40 32 27 44 Z" fill="${hc}"/>`;
  s += `<circle cx="41" cy="50" r="2.3" fill="#222"/><circle cx="59" cy="50" r="2.3" fill="#222"/>`;
  s += `<path d="M36 44 l10 -1.5 M54 42.5 l10 1.5" stroke="${hc}" stroke-width="2.2" stroke-linecap="round"/>`;
  s += `<path d="M50 53 q-3 7 1 9" stroke="#b98a6a" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  if (o.beard === 'full') s += `<path d="M27 58 Q28 88 50 90 Q72 88 73 58 Q66 70 50 68 Q34 70 27 58 Z" fill="${hc}"/><path d="M43 71 q7 4 14 0" stroke="#fff" stroke-width="1.5" fill="none"/>`;
  else if (o.beard === 'goatee') s += `<path d="M40 66 Q50 62 60 66 Q58 86 50 88 Q42 86 40 66 Z" fill="${hc}"/><path d="M44 69 q6 3 12 0" stroke="#fff" stroke-width="1.4" fill="none"/>`;
  else if (o.beard === 'must') s += `<path d="M38 66 Q50 60 62 66 Q50 69 38 66 Z" fill="${hc}"/><path d="M44 72 q6 4 12 0" stroke="#a5553f" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  else s += `<path d="M42 69 q8 7 16 0" stroke="#a5553f" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  if (o.glasses) s += `<g fill="rgba(255,255,255,.35)" stroke="#333" stroke-width="1.8"><circle cx="41" cy="50" r="7"/><circle cx="59" cy="50" r="7"/></g><path d="M48 50 h4 M34 50 l-8 -2 M66 50 l8 -2" stroke="#333" stroke-width="1.8"/>`;
  if (o.bow) s += `<path d="M50 96 l-9 -5 v10 z M50 96 l9 -5 v10 z" fill="#d6336c"/><circle cx="50" cy="96" r="2.2" fill="#a61e4d"/>`;
  if (o.tie) s += `<path d="M47 93 h6 l-1 4 l3 12 h-10 l3 -12 z" fill="#c92a2a"/>`;
  s += `</svg>`;
  return s;
}
const F = {
  freud: face({ hair: 'side', hc: '#d9d9d9', beard: 'full', glasses: 1, tie: 1, bg: '#ffe8cc' }),
  adler: face({ hair: 'full', hc: '#5c4a3a', beard: 'must', glasses: 1, bg: '#d3f9d8' }),
  rogers: face({ hair: 'side', hc: '#cfcfcf', glasses: 1, bg: '#fff3bf', cloth: '#7c5c3e' }),
  ellis: face({ hair: 'full', hc: '#4a4a4a', glasses: 1, tie: 1, bg: '#ffe3e3' }),
  beck: face({ hair: 'full', hc: '#f1f1f1', bow: 1, bg: '#d0ebff' }),
  skinner: face({ hair: 'side', hc: '#9a9a9a', glasses: 1, bg: '#e5dbff' }),
  perls: face({ hair: 'wild', hc: '#e0e0e0', beard: 'full', bg: '#c3fae8', cloth: '#b5651d' }),
  glasser: face({ hair: 'full', hc: '#b0b0b0', tie: 1, bg: '#ffec99' }),
  berne: face({ hair: 'full', hc: '#3d3d3d', glasses: 1, bg: '#fcc2d7' }),
  yalom: face({ hair: 'side', hc: '#c8c8c8', beard: 'goatee', glasses: 1, bg: '#dee2e6' }),
  satir: face({ hair: 'long', hc: '#a9743a', bg: '#ffdeeb', cloth: '#862e9c' }),
  wechsler: face({ hair: 'full', hc: '#555', glasses: 1, tie: 1, bg: '#d0ebff' }),
  rorschach: face({ hair: 'full', hc: '#6b4f2a', beard: 'must', bg: '#e9ecef' }),
  linehan: face({ hair: 'long', hc: '#c9c9c9', glasses: 1, bg: '#e5dbff', cloth: '#1c7ed6' }),
};

// ---------- 내용 ----------
// kw 안의 [글자] = 두문자 강조
const S = [];
const sec = (id, color, no, title, sub, cards) => S.push({ id, color, no, title, sub, cards });

sec('a1', '#1c7ed6', '1', '심리평가 ① 검사의 기초', '“좋은 검사란?”은 거의 매회 나오는 단골', [
  { t: '좋은 심리검사의 조건', m: '신타객실', s: '<b>신</b>나게 <b>타</b>고 간 <b>객실</b>', i: [['[신]뢰도', '몇 번 재도 결과가 일관적인가'], ['[타]당도', '재려는 것을 정확히 재는가'], ['[객]관도', '채점자가 달라도 결과가 같은가'], ['[실]용도', '시간·비용·노력이 적게 드는가']], tip: '+ 표준화·규준이 있어야 함' },
  { t: '신뢰도의 종류', m: '재동반내', s: '<b>재</b>미있게 <b>동반</b> <b>내</b>한', i: [['검사-[재]검사', '같은 검사를 시간 간격 두고 2번 (안정성)'], ['[동]형검사', '비슷한 두 검사를 실시 (동등성)'], ['[반]분', '한 검사를 반으로 나눠 상관'], ['문항[내]적 합치도', '문항 하나하나의 일관성 (크론바흐 α)']], tip: '투사검사는 “채점자 간 신뢰도”가 중요' },
  { t: '타당도의 종류', m: '내준구', s: '<b>내</b> 친구 <b>준구</b>', i: [['[내]용타당도', '문항이 측정 내용을 잘 대표하는가 (전문가 판단)'], ['[준]거타당도', '외부 준거와의 상관 → <u>공인</u>(현재)·<u>예언</u>(미래)'], ['[구]인(구성)타당도', '이론적 개념을 재는가 → <u>수렴·변별·요인분석</u>']] },
  { t: '객관적 검사 vs 투사적 검사', table: [['', '객관적 (MMPI 등)', '투사적 (로샤·TAT 등)'], ['장점', '실시·채점·해석 간편<br>신뢰도·타당도 높음<br>검사자 영향 적음', '반응이 독특·풍부<br>방어(꾸미기) 어려움<br>무의식 내용 반영'], ['단점', '사회적 바람직성<br>반응경향성(묵종)<br>문항내용 제한', '신뢰도·타당도 낮음<br>검사자·상황 영향 큼<br>해석에 전문성 필요']], tip: '암기 요령: 한쪽의 장점 = 반대쪽의 단점!' },
  { t: '면접의 3형태', i: [['구조화', '질문·순서 고정 → 신뢰도↑, 초보자도 가능, 융통성↓'], ['비구조화', '자유롭게 진행 → 융통성↑, 숙련 필요, 신뢰도↓'], ['반구조화', '틀은 있되 융통성 있게 (둘의 절충)']] },
  { t: '정신상태검사(MSE) 항목', m: '외말기 사지인 판병', s: '<b>외</b>국 <b>말</b> 탄 <b>기</b>사가 <b>사지</b>(四肢)로 <b>인</b>사, <b>판</b>사는 <b>병</b>가', i: [['[외]모·행동·태도', '옷차림, 위생, 눈맞춤, 협조성'], ['[말]', '속도·양·크기'], ['[기]분·정동', '주관적 기분 / 겉으로 보이는 정서'], ['[사]고', '과정(비약·이탈) + 내용(망상·강박)'], ['[지]각', '환각·착각'], ['[인]지', '지남력(시간·장소·사람)·기억·주의집중'], ['[판]단력 / [병]식', '현실판단 / 자기 병에 대한 인식']] },
  { t: '행동관찰(행동평가)의 방법', m: '자유참자', s: '<b>자유</b>로운 <b>참</b>새가 <b>자</b>고 있다', i: [['[자]연관찰', '실제 생활 장면에서 그대로 관찰'], ['[유]사관찰', '통제된(실험실) 상황을 만들어 관찰'], ['[참]여관찰', '부모·교사 등 주변인이 함께하며 관찰'], ['[자]기관찰', '자기 행동을 스스로 기록 (자기감찰)']] },
]);

sec('a2', '#1c7ed6', '2', '심리평가 ② 지능검사 (K-WAIS-IV)', '숫자 3개만 기억: 평균 100 · 표준편차 15 · 소검사 평균 10(SD 3)', [
  { face: F.wechsler, who: '웩슬러', t: '웩슬러의 지능 정의', quote: '개인이 <b>목적</b>에 맞게 행동하고, <b>합리적</b>으로 사고하며, <b>환경</b>을 효과적으로 다루는 <b>종합적·총체적</b> 능력', m: '목합환종', s: '<b>목</b>욕탕 <b>합</b>격 <b>환</b>영 <b>종</b>이' },
  { t: '4가지 지표', m: '언지작처', s: '<b>언</b>니 <b>지</b>금 <b>작</b>업 <b>처</b>리 중', table: [['지표', '핵심 소검사', '보충', '암기'], ['<b>언</b>어이해', '공통성·어휘·상식', '이해', '<b>공</b>짜 <b>어</b>묵 <b>상</b>'], ['<b>지</b>각추론', '토막짜기·행렬추론·퍼즐', '무게비교·빠진곳찾기', '<b>토</b>요일 <b>행</b>복한 <b>퍼</b>즐'], ['<b>작</b>업기억', '숫자·산수', '순서화', '<b>숫</b>자 <b>산</b>수'], ['<b>처</b>리속도', '동형찾기·기호쓰기', '지우기', '<b>동</b>기(<b>기</b>호)는 빠르다']], tip: '핵심 10개 + 보충 5개 = 총 15개 소검사' },
  { t: '병전 지능 추정 소검사', m: '어상토', s: '<b>어</b>! <b>상</b> 위에 <b>토</b>끼가 (병 나기 전엔 멀쩡했지)', i: [['[어]휘 · [상]식 · [토]막짜기', '뇌손상·정신병리에도 <u>잘 변하지 않는</u> 안정적인 소검사'], ['추가 근거', '학력·직업·학교성적 등 인구학적 자료']] },
  { t: '지능지수(IQ) 분류', table: [['130↑', '120~129', '110~119', '90~109', '80~89', '70~79', '69↓'], ['최우수', '우수', '평균상', '<b>평균</b>', '평균하', '경계선', '매우낮음']], tip: '“90~109 평균”을 기준으로 10점씩 위·아래로' },
  { t: '유동성 지능 vs 결정성 지능 (카텔·혼)', i: [['유동성', '타고난 추론·문제해결력. <u>나이 들면 감소</u> (토막·행렬·숫자)'], ['결정성', '경험·교육으로 쌓인 지식. <u>나이 들어도 유지</u> (어휘·상식·이해)']], tip: '유동 = “흘러 사라진다”, 결정 = “굳어 남는다”' },
  { t: '지능검사 실시·해석 시 유의점', i: [['라포 형성', '불안·긴장을 줄이고 최대 수행을 끌어냄'], ['표준 절차 준수', '지시문·시간제한·채점기준 그대로'], ['행동관찰 병행', '수행 태도·반응양식도 질적 자료'], ['점수만으로 단정 X', '다른 검사·면담·배경정보와 통합 해석']] },
]);

sec('a3', '#1c7ed6', '3', '심리평가 ③ MMPI-2', 'T점수: 평균 50 · 표준편차 10 · 65점 이상이면 “높다”', [
  { t: '임상척도 10개', m: '건우히반남 편강조경내', s: '<b>건우</b>가 <b>히</b>죽, <b>반</b>한 <b>남</b>자 / <b>편강</b>한의원 <b>조경</b>은 <b>내</b> 거', table: [['1 Hs', '2 D', '3 Hy', '4 Pd', '5 Mf'], ['<b>건</b>강염려증', '<b>우</b>울증', '<b>히</b>스테리', '<b>반</b>사회성', '<b>남</b>성성-여성성'], ['6 Pa', '7 Pt', '8 Sc', '9 Ma', '0 Si'], ['<b>편</b>집증', '<b>강</b>박증', '<b>조</b>현병', '<b>경</b>조증', '<b>내</b>향성']] },
  { t: '타당도 척도 3묶음', m: '성·비·방', s: '<b>성</b>실했나? → <b>비</b>정상으로 과장했나? → <b>방</b>어했나?', i: [['[성]실성', '<b>?</b>(무응답 30개↑ 무효) · <b>VRIN</b>(무선반응) · <b>TRIN</b>(고정반응)'], ['[비]전형성', '<b>F</b> · <b>F(B)</b> 후반부 · <b>F(P)</b> 정신병리 · <b>FBS</b> 증상타당도'], ['[방]어성', '<b>L</b>(부인·좋게 보이려 함) · <b>K</b>(교정·세련된 방어) · <b>S</b>(과장된 자기제시)']] },
  { t: 'K 교정을 하는 척도', m: '1·4·7·8·9', s: '<b>일사</b>(14)천리로 <b>칠팔구</b>(789)', i: [['더하는 K 비율', '1번 <b>0.5</b> · 4번 <b>0.4</b> · 7번 <b>1.0</b> · 8번 <b>1.0</b> · 9번 <b>0.2</b>'], ['외우기', '“<b>5·4·1·1·2</b>”  (7·8번만 K를 통째로 더함)']] },
  { t: '꼭 나오는 코드타입', table: [['코드', '별명 / 핵심 특징'], ['<b>1-3 / 3-1</b>', '<b>전환 V</b> (2번이 1·3보다 낮음) → 심리문제를 신체증상으로, 통찰 부족'], ['<b>2-7 / 7-2</b>', '불안 + 우울, 걱정 많음. 고통이 커서 <u>치료 동기 높음</u>'], ['<b>4-9 / 9-4</b>', '충동적 <u>행동화</u>, 반사회적, 규범 무시, 죄책감 적음'], ['<b>6-8 / 8-6</b>', '편집형 조현병 의심: 망상·환각·의심·사고장애'], ['<b>6-8 ↑, 7 ↓</b>', '<b>정신증 V</b> (편집증 계곡)'], ['<b>4-6 / 6-4</b>', '분노·원망, 수동-공격적, 남 탓']] , tip: 'V자 2개: 1-3 사이가 파이면 “전환”, 6-8 사이가 파이면 “정신증”' },
  { t: '무효 프로파일을 의심하는 경우', i: [['무응답 30개 이상', '? 척도 상승'], ['VRIN·TRIN T ≥ 80', '아무렇게나 / 한쪽으로만 응답'], ['F 매우 높음', '증상 과장(faking-bad), 무선반응, 심한 혼란'], ['L·K 매우 높음', '좋게 보이려는 왜곡(faking-good)']] },
  { t: '해석 순서 (서술형 대비)', m: '태타임코 통', s: '<b>태</b>권도 <b>타임</b>! <b>코</b>치와 <b>통</b>합', i: [['[태]도', '검사 태도·소요시간 확인'], ['[타]당도 척도', '프로파일이 믿을 만한가'], ['[임]상척도', '개별 척도 높낮이'], ['[코]드타입', '2~3개 상승 척도 쌍, 형태 분석'], ['[통]합', '내용·보충척도, 면담·다른 검사와 종합']] },
]);

sec('a4', '#1c7ed6', '4', '심리평가 ④ 로샤 · 투사검사', '로샤 10장 · BGT 9개 도형 · TAT 31장 중 20장', [
  { face: F.rorschach, who: '로샤', t: '로샤 채점 항목 (엑스너 종합체계)', m: '위발결형 쌍내평조특', s: '<b>위</b>장·<b>발</b>이 <b>결</b>국 <b>형</b>한테 / <b>쌍</b>둥이가 <b>내</b>게 <b>평</b>소 <b>조</b>용히 <b>특</b>강', i: [['[위]치(반응영역)', '어디를 봤나: W(전체) · D(부분) · Dd(드문 부분) · S(공백)'], ['[발]달질', '반응의 질적 수준'], ['[결]정인', '왜 그렇게 봤나: 형태F·운동M·색채C·음영 등'], ['[형]태질', '반점 모양과 잘 맞는가'], ['[쌍]반응', '대칭으로 2개를 봄'], ['반응[내]용', '사람H·동물A 등'], ['[평]범반응(P)', '남들도 흔히 보는 반응'], ['[조]직활동(Z)', '자극을 조직화한 정도'], ['[특]수점수', '이상한 언어·사고']] },
  { t: '로샤 실시 단계 & 질문단계 주의', i: [['자유연상(반응) 단계', '“무엇처럼 보입니까?” — 그대로 받아적기'], ['질문 단계', '<u>채점에 필요한 정보만</u> 확인 (어디서·왜·무엇)'], ['주의', '유도질문·새 반응 끌어내기 금지, 비지시적으로'], ['한계검증 단계', '필요할 때만 (평범반응을 못 본 경우 등)']] },
  { t: 'BGT (벤더-게슈탈트) — 허트의 평가항목', m: '조크일왜움', s: '<b>조크</b>(joke) <b>일</b>번에 <b>왜</b> <b>움</b>찔?', i: [['[조]직화', '배열 순서, 공간 사용, 도형 위치'], ['[크]기의 일탈', '지나치게 크게/작게'], ['형태의 [일]탈', '폐쇄 곤란, 교차 곤란, 각의 변화'], ['형태의 [왜]곡', '회전, 퇴영, 단순화, 중첩, 보속성'], ['[움]직임(그려가는 방식)', '선의 방향·질']], tip: '적용: 뇌기질적 손상, 언어표현 어려운 사람, 문맹·아동' },
  { t: 'HTP (집-나무-사람)', i: [['집 House', '가정생활·가족관계에 대한 인식'], ['나무 Tree', '<u>무의식적</u> 자기상, 내면의 에너지'], ['사람 Person', '<u>의식적</u> 자기상, 대인관계 태도']], tip: '나무=깊은 뿌리(무의식) / 사람=겉모습(의식)' },
  { t: 'SCT (삭스 문장완성검사) 4영역', m: '가성대자', s: '<b>가성</b>비 <b>대자</b>(大) 사이즈', i: [['[가]족', '어머니·아버지·가족에 대한 태도'], ['[성]', '이성·결혼·성 관계에 대한 태도'], ['[대]인관계', '친구·권위자에 대한 태도'], ['[자]기개념', '두려움·죄책감·능력·과거·미래·목표']] },
  { t: 'TAT (주제통각검사)', i: [['만든 사람', '머레이 & 모건'], ['핵심', '그림을 보고 이야기를 꾸밈 → <b>욕구(need)-압력(press)</b> 분석'], ['알 수 있는 것', '주인공의 욕구, 환경의 압력, 갈등, 대인관계 역동']], tip: '로샤 = 성격의 “구조”, TAT = 성격의 “내용·역동”' },
]);

sec('b1', '#e8590c', '5', '상담이론 ① 정신분석 · 개인심리 · 인간중심', '학자 얼굴 + 한 단어 이미지로 통째로 기억', [
  { face: F.freud, who: '프로이트', img: '🛋️ 소파 + 무의식', t: '정신분석 — 성격 발달단계', m: '구항남잠생', s: '<b>구항</b>(9항)에서 <b>남</b>자가 <b>잠</b>수해 <b>생</b>선 잡는다', i: [['[구]강·[항]문·[남]근·[잠]복·[생]식기', '남근기: 오이디푸스 콤플렉스, 초자아 형성'], ['성격 구조', '원초아(쾌락) · 자아(현실) · 초자아(도덕)']] },
  { t: '불안의 3유형', m: '현신도', s: '<b>현신</b>(現身)한 <b>도</b>사', i: [['[현]실 불안', '실제 외부 위험에 대한 두려움'], ['[신]경증적 불안', '원초아 충동이 터질까 봐 (자아 ↔ 원초아)'], ['[도]덕적 불안', '양심의 가책 (자아 ↔ 초자아)']] },
  { t: '정신분석 기법', m: '자꿈전저해훈', s: '<b>자</b>다가 <b>꿈</b>에서 <b>전</b>을 부쳤는데 <b>저</b> <b>해</b>가 <b>훈</b>제했다', i: [['[자]유연상', '떠오르는 대로 말하기'], ['[꿈]의 분석', '무의식에 이르는 왕도'], ['[전]이 분석', '과거 중요 인물에 대한 감정을 상담자에게 옮김'], ['[저]항 분석', '치료 진행을 방해하는 행동 다루기'], ['[해]석', '무의식적 의미를 설명'], ['[훈]습', '통찰을 반복해 생활에 적용']] },
  { t: '방어기제 (예시와 함께)', i: [['억압', '불쾌한 기억을 무의식으로 밀어냄'], ['부인', '현실 자체를 인정하지 않음'], ['투사', '내 감정을 남의 것이라 함 (“쟤가 날 싫어해”)'], ['합리화', '그럴듯한 핑계 (“신 포도”)'], ['반동형성', '반대로 행동 (“미운 놈 떡 하나 더”)'], ['전치', '화풀이를 약한 대상에게 (“종로에서 뺨 맞고…”)'], ['퇴행', '어린 시절 행동으로 돌아감'], ['승화', '사회적으로 바람직한 방향으로 (공격성→운동)']] },
  { face: F.adler, who: '아들러', img: '💪 열등감 → 우월', t: '개인심리학', m: '열우사생가', s: '<b>열</b>심히 <b>우</b>는 <b>사</b>람, <b>생</b>활이 <b>가</b>엾다', i: [['[열]등감과 보상', '성장의 원동력'], ['[우]월성 추구', '더 나아지려는 기본 동기'], ['[사]회적 관심', '정신건강의 척도 (공동체감)'], ['[생]활양식', '4~5세경 형성되는 삶의 패턴'], ['[가]상적 최종목표', '행동을 이끄는 허구의 목표']], tip: '생활양식 4유형 “<b>지기회사</b>”: 지배형·기생형·회피형·사회적 유용형' },
  { t: '아들러 상담 4단계', m: '관탐통재', s: '<b>관</b>광 <b>탐</b>험, <b>통</b>째로 <b>재</b>밌다', i: [['[관]계 형성', '평등하고 협력적인 관계'], ['생활양식 [탐]색', '가족구도·초기기억·출생순위 조사'], ['[통]찰(해석)', '잘못된 목표·신념 깨닫기'], ['[재]교육(재정향)', '새 행동 실천, 격려']] },
  { face: F.rogers, who: '로저스', img: '🤗 따뜻한 미소', t: '인간중심 — 상담자의 3가지 태도', m: '일무공', s: '<b>일</b> 없이 <b>무공</b> 수련하는 로저스 도사', i: [['[일]치성(진실성)', '겉과 속이 같은 솔직한 태도'], ['[무]조건적 긍정적 존중', '조건 없이 있는 그대로 수용'], ['[공]감적 이해', '내담자의 입장에서 느끼고 전달']], tip: '“완전히 기능하는 사람” = <b>개실신자창</b>: 경험에 개방 · 실존적 삶 · 자기 신뢰 · 자유 · 창조성' },
]);

sec('b2', '#e8590c', '6', '상담이론 ② REBT · 인지치료 · 행동치료', '생각을 바꾸는 사람들(엘리스·벡)과 행동을 바꾸는 사람들(스키너 등)', [
  { face: F.ellis, who: '엘리스', img: '🔤 ABCDE', t: 'REBT — ABCDE 모형', m: 'ABCDE', s: '알파벳 순서 그대로!', i: [['A 선행사건', '시험에 떨어졌다'], ['B 신념', '“난 반드시 붙어야 해, 떨어지면 끝장이야” (비합리적)'], ['C 결과', '우울·무기력 (정서·행동 결과)'], ['D 논박', '“꼭 그래야 한다는 근거가 있나?”'], ['E 효과', '합리적 신념 → 적절한 정서 (F: 새로운 감정)']], tip: '핵심: 감정(C)의 원인은 사건(A)이 아니라 <b>신념(B)</b>' },
  { t: '비합리적 신념의 4특징', m: '당파인비', s: '<b>당파</b> 싸움에 <b>인</b>간이 <b>비</b>참', i: [['[당]위적 사고', '“반드시 ~해야 한다” (자신·타인·세상)'], ['[파]국화', '“끔찍하다, 끝장이다”'], ['낮은 [인]내성', '“도저히 못 견딘다” (좌절 불포용)'], ['인간 [비]하', '“난 쓸모없는 인간이다”']], tip: '합리성 판단 기준: 논리성 · 현실성 · 실용성 (+융통성)' },
  { face: F.beck, who: '벡', img: '🎀 나비넥타이', t: '인지치료 — 인지삼제', m: '자세미', s: '<b>자세</b>히 보니 <b>미</b>래가 어둡다', i: [['[자]기', '“나는 무가치하다”'], ['[세]상(경험)', '“세상은 가혹하다”'], ['[미]래', '“앞으로도 희망이 없다”']], tip: '인지 수준: 자동적 사고 → 중간신념 → 핵심신념(스키마)' },
  { t: '인지적 오류 (예시로 구분!)', i: [['흑백논리', '“1등 아니면 실패” (이분법)'], ['과잉일반화', '한 번 차이고 “난 평생 연애 못 해”'], ['선택적 추상화', '칭찬 9개 무시, 지적 1개만 봄'], ['임의적 추론', '근거 없이 결론 (“답장 없으니 날 싫어해”)'], ['개인화', '무관한 일을 내 탓으로 (“내가 와서 비가 온다”)'], ['의미확대·축소', '실수는 크게, 성공은 작게'], ['정서적 추론', '“불안하니까 위험한 거야”'], ['잘못된 명명', '“난 실패자야” 낙인']] },
  { face: F.skinner, who: '스키너', img: '📦 상자 속 쥐', t: '강화와 처벌', table: [['', '주다 (+정적)', '빼다 (−부적)'], ['행동 ↑ <b>강화</b>', '칭찬·보상 주기', '싫은 것 없애주기<br>(잔소리 중단)'], ['행동 ↓ <b>처벌</b>', '꾸중·벌 주기', '좋은 것 빼앗기<br>(게임 금지)']], tip: '강화계획 반응률: <b>변동비율 &gt; 고정비율 &gt; 변동간격 &gt; 고정간격</b> “<b>변비</b>가 제일 세다(도박)”' },
  { t: '체계적 둔감법 3단계 (울프)', m: '이위둔', s: '<b>이</b> <b>위</b>(胃)는 <b>둔</b>하다', i: [['[이]완훈련', '근육 이완법 배우기'], ['불안[위]계목록 작성', '약한 불안 → 강한 불안 순으로'], ['[둔]감화', '이완 상태에서 낮은 단계부터 노출']], tip: '원리: 상호억제 (이완과 불안은 동시에 못 느낀다)' },
  { t: '행동치료 기법 한 줄 정리', i: [['토큰경제', '바람직한 행동에 토큰 → 나중에 보상과 교환'], ['행동조성', '목표에 가까운 행동을 단계적으로 강화'], ['타임아웃', '강화를 받을 수 없는 곳에 잠시 격리'], ['프리맥 원리', '좋아하는 활동을 보상으로 (“숙제하면 게임”)'], ['혐오치료', '문제행동 + 불쾌자극 연합'], ['홍수법', '강한 불안 자극에 한 번에 노출'], ['모델링', '관찰학습 “<b>주파운동</b>”: 주의→파지→운동재생→동기화']] },
]);

sec('b3', '#e8590c', '7', '상담이론 ③ 게슈탈트 · 현실치료 · 교류분석 · 실존', '헷갈리는 이론은 “키워드 3개”로 구분', [
  { face: F.perls, who: '펄스', img: '🪑 빈 의자', t: '게슈탈트 — 접촉경계 혼란', m: '내투융반자편', s: '<b>내</b> <b>투</b>자 <b>융</b>자, <b>반</b>은 <b>자</b>기 <b>편</b>', i: [['[내]사', '남의 가치를 씹지 않고 삼킴'], ['[투]사', '내 것을 남의 것으로 돌림'], ['[융]합', '너와 나의 경계가 없음'], ['[반]전', '남에게 할 것을 자신에게 함 (자책)'], ['[자]의식', '자신을 지나치게 관찰·의식'], ['[편]향', '감각을 둔화시켜 접촉을 피함 (딴소리)']], tip: '키워드: 지금-여기 · 알아차림 · 접촉 · 미해결 과제 / 기법: 빈 의자, 꿈 작업, 과장하기, 머물러 있기' },
  { t: '신경증의 5개 층', m: '피공교내외', s: '<b>피</b>곤한데 <b>공교</b>롭게 <b>내외</b>가 싸운다', i: [['[피]상층(허위층)', '형식적·상투적으로 만남'], ['[공]포층(연기층)', '역할 연기로 살아감'], ['[교]착층', '막다른 골목, 공허·무기력'], ['[내]파층', '억눌린 감정을 안으로 느낌'], ['[외]파층(폭발층)', '감정을 밖으로 표현, 진정한 접촉']] },
  { face: F.glasser, who: '글래서', img: '🚗 선택하는 운전자', t: '현실치료 — 5가지 기본욕구', m: '생사힘자즐', s: '<b>생사</b>를 건 <b>힘</b>! <b>자</b>유롭게 <b>즐</b>겨라', i: [['[생]존', '먹고 자고 안전하게'], ['[사]랑·소속', '관계 맺고 싶다'], ['[힘](성취)', '인정받고 싶다'], ['[자]유', '스스로 선택하고 싶다'], ['[즐]거움', '재미있게 살고 싶다']], tip: '전행동 “<b>활생느신</b>”: 활동하기·생각하기·느끼기·신체반응' },
  { t: '현실치료 상담 절차 WDEP', m: 'WDEP', s: '<b>W</b>ant 뭘 원해? → <b>D</b>oing 뭘 하고 있어? → <b>E</b>valuation 도움이 돼? → <b>P</b>lan 계획 세우자', i: [['W 바람', '욕구·바람 탐색'], ['D 행동', '현재 하고 있는 행동 탐색'], ['E 평가', '그 행동이 바람을 이루는 데 도움 되는지 <u>스스로</u> 평가'], ['P 계획', '단순·구체적·실현 가능한 계획']] },
  { face: F.berne, who: '번', img: '👨‍👩‍👧 P·A·C', t: '교류분석 — 4가지 분석', m: '구교게각', s: '<b>구</b>청 <b>교</b>실에 <b>게</b>가 <b>각</b> 잡고 앉았다', i: [['[구]조분석', '자아상태 P(부모)·A(어른)·C(아이) 파악'], ['[교]류분석', '상보·교차·이면 교류'], ['[게]임분석', '반복되는 나쁜 결말의 교류'], ['[각]본분석', '어릴 때 쓴 인생 각본']], tip: '생활자세 4: 자기긍정-타인긍정(가장 건강) / 자긍-타부 / 자부-타긍 / 자부-타부' },
  { face: F.yalom, who: '얄롬', img: '⏳ 궁극적 관심사', t: '실존치료 — 4가지 궁극적 관심사', m: '죽자고무', s: '<b>죽자</b>고 <b>고</b>독하게 <b>무</b>의미하게 달린다', i: [['[죽]음', '삶의 유한성 → 삶에 의미 부여'], ['[자]유(와 책임)', '선택의 자유와 그에 따른 책임'], ['[고]립(소외)', '근본적으로 혼자라는 사실'], ['[무]의미', '삶의 의미를 스스로 찾아야 함']], tip: '프랭클 의미치료 기법: 역설적 의도 · 탈숙고' },
]);

sec('b4', '#e8590c', '8', '상담의 실제 · 윤리 · 집단상담', '“초기에 뭘 하나?” “비밀보장 예외는?” — 서술형 단골', [
  { t: '상담 초기 단계의 과제', m: '관이구목', s: '<b>관</b>리<b>이</b>(인)가 <b>구목</b>(나무 9그루)을 심는다', i: [['상담[관]계(라포) 형성', '신뢰·안전한 분위기'], ['문제 [이]해·평가', '호소문제, 배경, 기능수준 파악'], ['[구]조화', '시간·횟수·비용, 역할, 비밀보장과 한계 안내'], ['[목]표 설정', '구체적·현실적·측정 가능·내담자와 합의']], tip: '중기 = 문제해결·통찰·행동변화 / 종결 = 성과평가·이별감정·추수상담' },
  { t: '비밀보장의 예외', m: '자타학법전', s: '<b>자타</b>공인 <b>학</b>교 <b>법전</b>', i: [['[자]해·자살 위험', '내담자 자신이 위험할 때'], ['[타]인을 해칠 위험', '제3자의 안전 위협'], ['[학]대', '아동학대·방임 등 신고 의무'], ['[법]원의 명령', '법적 공개 요구'], ['[전]염병', '치명적 감염병으로 타인이 위험']] },
  { t: '키치너의 윤리 원칙', m: '자무선공충', s: '<b>자</b>! <b>무선</b> <b>공</b>유기 <b>충</b>전', i: [['[자]율성', '내담자의 선택권 존중'], ['[무]해성', '해를 끼치지 않음'], ['[선]행', '내담자에게 이익이 되게'], ['[공]정성', '차별 없이 공평하게'], ['[충]실성', '약속·신뢰를 지킴']] },
  { t: '상담 기법 구분하기', i: [['경청', '말·표정·몸짓까지 주의 깊게 듣기'], ['재진술', '<u>내용</u>을 상담자 말로 바꿔 되돌려줌'], ['반영', '<u>감정</u>을 읽어 되돌려줌'], ['명료화', '모호한 말을 분명하게 (“~라는 뜻인가요?”)'], ['직면', '말과 행동의 <u>불일치·모순</u>을 짚어줌'], ['해석', '행동·감정의 숨은 의미를 설명'], ['요약', '여러 내용을 묶어 정리']], tip: '직면·해석은 <b>라포가 형성된 뒤</b>, 내담자가 준비됐을 때' },
  { t: '자살 위험성 평가 항목', m: '생계수과지', s: '<b>생계</b>가 어려워 <b>수</b>학 <b>과</b>외 <b>지</b>원', i: [['자살 [생]각', '빈도·강도'], ['[계]획', '구체적인 계획이 있는가'], ['[수]단', '수단에 접근 가능한가, 치명성'], ['[과]거 시도력', '이전 시도·가족력'], ['[지]지체계', '도와줄 사람·보호요인']] },
  { t: '얄롬의 집단 치료적 요인 11가지', m: '희보정이 / 가사모 / 대응정실', s: '<b>희보</b>(喜報)! <b>정이</b>가 <b>가사</b>를 <b>모</b>아 <b>대응</b>을 <b>정</b>확히 <b>실</b>행', i: [['[희]망의 고취 · [보]편성', '“나아질 수 있다” · “나만 그런 게 아니구나”'], ['[정]보전달 · [이]타심', '조언·교육 · 남을 도우며 가치감'], ['[가]족 재현 · [사]회기술 · [모]방', '원가족 경험의 교정적 재현 · 기술 발달 · 따라 배우기'], ['[대]인관계 학습 · [응]집력', '피드백으로 배우기 · “우리” 소속감'], ['[정]화 · [실]존적 요인', '감정 표출 · 삶의 책임 수용']] },
  { t: '집단상담의 장단점 & 단계', i: [['장점', '경제적·효율적 / 다양한 피드백 / 소속감 / 대인기술 연습'], ['단점', '비밀보장 한계 / 개인 문제 깊이 못 다룸 / 집단 압력'], ['단계(코리)', '초기 → 과도기(저항·갈등) → 작업 → 종결']] },
]);

sec('c1', '#2f9e44', '9', '심리치료 · 가족치료', '제3동향(DBT·ACT)과 동기강화상담은 최근 출제 증가', [
  { face: F.linehan, who: '리네한', img: '⚖️ 수용 ↔ 변화', t: 'DBT (변증법적 행동치료) 4기술', m: '마고정대', s: '<b>마고</b>할미는 <b>정대</b>하다', i: [['[마]음챙김', '지금 이 순간을 판단 없이 알아차림'], ['[고]통 감내', '위기를 악화시키지 않고 견디기'], ['[정]서 조절', '감정을 이해하고 조절'], ['[대]인관계 효율성', '관계를 지키며 원하는 것 요청·거절']], tip: '대상: 경계성 성격장애, 만성 자살·자해' },
  { t: 'ACT (수용전념치료) 6과정', m: '수탈현맥가전', s: '<b>수탈</b>당한 <b>현</b>대 <b>맥</b>주 <b>가전</b>', i: [['[수]용', '불편한 경험을 있는 그대로 받아들임'], ['인지적 [탈]융합', '생각을 “생각일 뿐”으로 거리 두기'], ['[현]재에 머무르기', '지금-여기 접촉'], ['[맥]락으로서의 자기', '관찰하는 나'], ['[가]치', '내가 원하는 삶의 방향'], ['[전]념 행동', '가치에 맞는 행동 실천']], tip: '목표: 증상 제거 X → <b>심리적 유연성</b> ↑' },
  { t: '동기강화상담(MI) 4원리', m: '공불저자', s: '<b>공</b>부 <b>불</b>량 <b>저자</b>', i: [['[공]감 표현하기', '반영적 경청으로 수용'], ['[불]일치감 만들기', '현재 행동 ↔ 중요한 가치의 차이 깨닫게'], ['[저]항과 함께 구르기', '맞서 싸우지 않고 방향 전환'], ['[자]기효능감 지지', '“할 수 있다”는 믿음 북돋기']], tip: '기술 OARS: 열린 질문 · 인정하기 · 반영하기 · 요약하기' },
  { t: '변화단계 모델 (프로차스카)', m: '전숙준실유', s: '<b>전</b> <b>숙</b>소 <b>준</b>비 <b>실</b>수 <b>유</b>감', i: [['[전]숙고', '문제 인식 없음, 변화 의지 없음'], ['[숙]고', '문제는 알지만 양가감정'], ['[준]비', '곧 바꾸려고 계획 (1개월 이내)'], ['[실]행', '실제로 행동 변화 중 (6개월 미만)'], ['[유]지', '변화를 6개월 이상 지속, 재발 방지']] },
  { face: F.satir, who: '사티어', img: '🗣️ 의사소통', t: '사티어 — 의사소통 유형', m: '회비초산일', s: '<b>회비</b>로 <b>초</b>(식초) <b>산</b> <b>일</b>', i: [['[회]유형', '자기 무시, 남 비위 맞춤 “다 내 잘못이야”'], ['[비]난형', '타인 무시, 남 탓 “다 너 때문이야”'], ['[초]이성형', '감정 무시, 논리·규칙만'], ['[산]만형', '자기·타인·상황 모두 무시, 딴소리'], ['[일]치형', '말과 감정이 일치 (건강한 유형)']] },
  { t: '가족치료 4대 학파', m: '보분 · 미구 · 헤전 · 사경', s: '<b>보</b>리 <b>분</b>식 / <b>미</b>역 <b>구</b>이 / <b>헤</b>어 <b>전</b>문 / <b>사</b>과 <b>경</b>매', table: [['학자', '이론', '핵심 개념·기법'], ['<b>보</b>웬', '다세대', '자아<b>분</b>화, 삼각관계, 가계도'], ['<b>미</b>누친', '<b>구</b>조적', '경계선, 하위체계, 합류, 실연'], ['<b>헤</b>일리', '<b>전</b>략적', '역설적 개입, 지시, 시련기법'], ['<b>사</b>티어', '<b>경</b>험적', '의사소통 유형, 가족조각, 자존감']] },
  { t: '사회기술훈련(SST) 절차', m: '지모역피과', s: '<b>지</b>금 <b>모</b>여서 <b>역</b>할 <b>피</b>드백 <b>과</b>제', i: [['[지]시(교육)', '기술의 필요성과 방법 설명'], ['[모]델링', '시범 보여주기'], ['[역]할연습', '직접 해보기 (행동시연)'], ['[피]드백·강화', '잘한 점 칭찬, 교정'], ['[과]제', '실생활에서 연습 → 일반화']] },
]);

sec('c2', '#2f9e44', '10', '이상심리 핵심 (DSM-5)', '진단기준은 “증상 개수 + 기간” 숫자가 점수', [
  { t: '이상행동의 판별 기준', m: '통사주부', s: '<b>통</b> 큰 <b>사</b>모님은 <b>주부</b>', i: [['[통]계적 일탈', '평균에서 크게 벗어남'], ['[사]회문화적 규범 위반', '그 사회의 규범에서 벗어남'], ['[주]관적 고통', '본인이 괴로움'], ['[부]적응(기능 손상)', '직업·학업·대인관계에 지장']] },
  { t: '조현병 5대 증상', m: '망환언행음', s: '<b>망</b>한 <b>환</b>상의 <b>언행</b>, <b>음</b>~', i: [['[망]상', '피해·관계·과대망상 등 (양성)'], ['[환]각', '환청이 가장 흔함 (양성)'], ['와해된 [언]어', '지리멸렬, 연상 이완 (양성)'], ['와해된/긴장성 [행]동', '(양성)'], ['[음]성증상', '정서 둔마, 무언어증, 무의욕증']], tip: '5개 중 2개↑(망·환·언 중 1개 필수)가 <b>1개월</b>, 전체 징후 <b>6개월</b>↑' },
  { t: '양성증상 vs 음성증상', table: [['', '양성 (없던 게 생김)', '음성 (있던 게 없어짐)'], ['증상', '망상·환각·와해된 언어/행동', '정서둔마·무언어·무의욕·무쾌감'], ['원인', '도파민 과잉', '뇌 구조적 이상'], ['약물', '반응 좋음', '반응 나쁨'], ['예후', '좋은 편', '나쁜 편']] },
  { t: '주요우울장애', m: '9개 중 5개 · 2주', s: '우울기분 또는 흥미상실 중 <b>1개는 필수</b>', i: [['필수 2', '① 우울한 기분 ② 흥미·즐거움 상실'], ['신체', '③ 체중·식욕 변화 ④ 불면/과수면 ⑤ 정신운동 초조/지체 ⑥ 피로'], ['인지', '⑦ 무가치감·죄책감 ⑧ 집중력 감소·우유부단 ⑨ 죽음·자살 생각']] },
  { t: 'PTSD 4대 증상군', m: '침회인각', s: '<b>침</b> 뱉고 <b>회</b>피하니 <b>인</b>상에 <b>각</b>인', i: [['[침]투', '악몽, 플래시백, 반복되는 기억'], ['[회]피', '관련 생각·장소·사람 피함'], ['[인]지·기분의 부정적 변화', '죄책감, 흥미 상실, 기억 못 함'], ['[각]성·반응성 변화', '과각성, 놀람, 수면장애, 분노']], tip: 'PTSD = <b>1개월 이상</b> / 급성스트레스장애 = 3일~1개월' },
  { t: '기간 숫자 총정리', table: [['장애', '기간'], ['주요우울 · 경조증 4일 · 조증 1주', '<b>2주</b>'], ['조현병(활성기) · PTSD', '<b>1개월</b>'], ['범불안 · ADHD · 조현병 전체', '<b>6개월</b>'], ['지속성 우울 · 순환성', '<b>2년</b> (아동 1년)'], ['ADHD 발병 연령', '<b>12세 이전</b>, 2개 이상 장면']] },
  { t: '성격장애 3군집', m: 'A 편조조 / B 반경연자 / C 회의강', s: 'A <b>편</b>안한 <b>조조</b>영화 · B <b>반경</b>(半徑) <b>연자</b>방아 · C <b>회의</b>는 <b>강</b>하게', i: [['A군 (기이·괴상)', '[편]집성 · [조]현성 · [조]현형'], ['B군 (극적·변덕)', '[반]사회성 · [경]계성 · [연]극성 · [자]기애성'], ['C군 (불안·두려움)', '[회]피성 · [의]존성 · [강]박성']] },
]);

sec('d1', '#7048e8', '11', '자문 · 교육 · 심리재활', '분량은 적지만 매회 2~3문제 — 외우면 그대로 점수', [
  { t: '임상심리사의 역할', m: '평치재 교자행연', s: '<b>평</b>소 <b>치</b>료는 <b>재</b>밌게, <b>교자</b>만두 <b>행</b>복한 <b>연</b>구', i: [['[평]가·진단', '심리검사·면담'], ['[치]료', '심리치료·상담'], ['심리[재]활', '사회복귀 지원'], ['[교]육·훈련', '강의·수련 감독'], ['[자]문', '타 전문가·기관에 조언'], ['[행]정', '프로그램 운영·관리'], ['[연]구', '치료 효과 검증 등']], tip: '과학자-실무자 모델(볼더, 1949): <b>연구 + 임상</b> 둘 다 갖춘 전문가' },
  { t: '자문의 단계', m: '이평중종추', s: '<b>이</b> <b>평</b>야에서 <b>중종</b>이 <b>추</b>수한다', i: [['질문의 [이]해', '의뢰 내용·목적 파악'], ['[평]가', '면담·관찰·검사로 상황 평가'], ['[중]재(개입)', '해결 전략 제안·실행'], ['[종]결', '목표 달성 시 마무리'], ['[추]적', '효과가 유지되는지 확인']] },
  { t: '카플란의 정신건강 자문 4유형', table: [['', '사례 (개별 환자)', '행정 (프로그램·조직)'], ['<b>내담자/프로그램</b> 중심', '내담자 중심 사례 자문<br><small>환자 치료법을 조언</small>', '프로그램 중심 행정 자문<br><small>프로그램 자체를 조언</small>'], ['<b>피자문자</b> 중심', '피자문자 중심 사례 자문<br><small>자문받는 사람의 역량↑</small>', '피자문자 중심 행정 자문<br><small>관리자의 행정능력↑</small>']], tip: '2 × 2 = “누구 중심(내담자/피자문자)” × “무엇(사례/행정)”' },
  { t: '예방의 3수준', m: '막고 · 잡고 · 돌리고', s: '1차 <b>막고</b> → 2차 빨리 <b>잡고</b> → 3차 되<b>돌리고</b>', i: [['1차 예방', '발생 자체를 방지 (교육·홍보·환경개선)'], ['2차 예방', '조기 발견·조기 치료 (선별검사, 위기개입)'], ['3차 예방', '재발 방지·재활·사회복귀']] },
  { t: '정신재활 모형 4단계 (앤서니)', m: '손기역불', s: '<b>손기</b>정 선수, <b>역</b>에서 <b>불</b>이익', table: [['단계', '의미', '개입'], ['<b>손</b>상', '증상 (환각·망상)', '약물·심리치료'], ['<b>기</b>능결함', '일상 기술 부족', '기술훈련'], ['<b>역</b>할장애', '직업·학생 역할 못함', '직업재활·지원'], ['<b>불</b>이익', '차별·편견·빈곤', '제도 변화·권익옹호']] },
  { t: '정신재활 프로그램 & 직업재활', i: [['재활 개입', '사회기술훈련 · 환자/가족 심리교육 · 약물·증상관리 · 직업재활 · 주거 · 사례관리'], ['직업재활 단계', '보호작업장 → 임시(과도기적)취업 → 지원고용 → 독립취업'], ['사례관리 과정', '접수 → 사정 → 계획 → 개입 → 점검 → 평가'], ['스트레스-취약성 모델', '타고난 취약성 + 스트레스 → 발병 (대처·약물이 보호요인)']], tip: '가족의 표출정서(EE) “<b>비적과</b>”: 비난 · 적대감 · 과도한 정서적 관여 → 재발↑' },
]);

// ---------- HTML ----------
const kw = s => s.replace(/\[(.+?)\]/g, '<em>$1</em>');
const tbl = t => `<table>${t.map((r, i) => `<tr>${r.map(c => i === 0 ? `<th>${c}</th>` : `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
const PIC = require('./pictures.js');
const escH = x => String(x).replace(/[&<>]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]));
function picStrip(m) {
  const p = PIC[m]; if (!p) return '';
  return `<div class="pic"><div class="tiles">${p[1].map(x => { const [sy, ct, e, cu] = x.split('|');
    return `<div class="tile"><span class="e">${e}</span><span class="sy">${escH(sy)}</span><span class="ct">${escH(ct)}</span>${cu ? `<span class="cu">${escH(cu)}</span>` : ''}</div>`; }).join('')}</div></div>`;
}
function card(c) {
  let h = `<div class="card">`;
  if (c.face) h += `<div class="who">${c.face}<div><div class="name">${c.who}</div>${c.img ? `<div class="img">${c.img}</div>` : ''}</div></div>`;
  h += `<h3>${c.t}</h3>`;
  if (c.quote) h += `<div class="quote">“${c.quote}”</div>`;
  if (c.m) h += `<div class="mn"><span class="key">${c.m}</span><span class="story">${c.s}</span>${PIC[c.m] ? `<span class="scn">${PIC[c.m][0]}</span>` : ''}</div>` + picStrip(c.m);
  if (c.i) h += `<ul>${c.i.map(([a, b]) => `<li><b>${kw(a)}</b><span>${b}</span></li>`).join('')}</ul>`;
  if (c.table) h += tbl(c.table);
  if (c.tip) h += `<div class="tip">💡 ${c.tip}</div>`;
  return h + `</div>`;
}
const quiz = S.flatMap(s => s.cards.filter(c => c.m && c.m.length < 22).map(c => [c.m, c.t.replace(/ — .*/, '').replace(/\(.*?\)/g, '').trim(), s.no, PIC[c.m] ? PIC[c.m][0] : '']));

const fontDir = path.join(__dirname, 'node_modules');
const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<link rel="stylesheet" href="file://${fontDir}/pretendard/dist/web/static/pretendard.css">
<link rel="stylesheet" href="file://${fontDir}/@fontsource/jua/index.css">
<style>
@page{size:A4;margin:11mm 10mm 12mm}
*{box-sizing:border-box}
body{margin:0;zoom:1.0;font-family:Pretendard,'Noto Color Emoji',sans-serif;font-size:8.600pt;line-height:1.42;color:#212529;-webkit-print-color-adjust:exact;print-color-adjust:exact}
h1,h2,h3,.key,.name,.big{font-family:Jua,Pretendard,sans-serif;font-weight:400}
section{break-before:page;--c:#1c7ed6}
.head{background:var(--c);color:#fff;border-radius:10px;padding:8px 14px;display:flex;align-items:center;gap:12px;margin-bottom:9px}
.head .no{background:#fff;color:var(--c);width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:400 15pt Jua;flex:none}
.head h2{margin:0;font-size:15pt}.head p{margin:0;font-size:8.500pt;opacity:.92}
.cols{column-count:2;column-gap:9px}
.card{break-inside:avoid;border:1.300px solid #dee2e6;border-top:3.500px solid var(--c);border-radius:9px;padding:7px 9px 8px;margin:0 0 9px;background:#fff}
.card h3{margin:0 0 4px;font-size:11pt;color:#212529}
.who{display:flex;align-items:center;gap:8px;margin-bottom:4px}
.face{width:46px;height:50px;flex:none}
.name{font-size:12pt;color:var(--c);line-height:1.1}.img{font-size:8.500pt;color:#495057}
.pic{margin:-1px 0 4px}
.scn{margin-left:auto;font-family:'Noto Color Emoji',sans-serif;font-size:13pt;letter-spacing:1px;white-space:nowrap;flex:none}
.tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(46px,1fr));gap:2px}
.tile{background:#f1f3f5;border-radius:5px;padding:1px 1px 2px;text-align:center;display:flex;flex-direction:column;align-items:center;line-height:1.12}
.tile .e{font-size:11.5pt;font-family:'Noto Color Emoji',sans-serif;line-height:1.1}
.tile .sy{font:400 8.5pt Jua;color:#e03131}
.tile .ct{font-size:6.3pt;font-weight:700}
.tile .cu{font-size:5.9pt;color:#666}
.mn{background:#fff9db;border:1.300px dashed #f59f00;border-radius:8px;padding:4px 8px;margin:3px 0 5px;display:flex;align-items:center;gap:9px}
.key{font-size:13.500pt;color:#e03131;white-space:nowrap;letter-spacing:.5px;flex:none;max-width:48%;white-space:normal;line-height:1.15}
.story{font-size:8.400pt;color:#5c3c00}.story b{color:#e03131;font-weight:800}
ul{list-style:none;margin:0;padding:0}
li{display:flex;gap:7px;padding:1.800px 0;border-bottom:.7px dotted #e3e6ea}li:last-child{border:0}
li b{flex:0 0 36%;font-weight:700}li span{flex:1;color:#343a40}
em{font-style:normal;color:#e03131;font-weight:900;background:#ffe3e3;border-radius:3px;padding:0 1.500px}
u{text-decoration:none;background:linear-gradient(transparent 55%,#c5f6fa 55%)}
table{width:100%;border-collapse:collapse;font-size:8.100pt;margin-top:3px}
th,td{border:1px solid #ced4da;padding:2.500px 4px;text-align:center;vertical-align:middle}
th{background:color-mix(in srgb,var(--c) 14%,#fff);font-weight:700}
td small{color:#666}
.tip{margin-top:5px;font-size:8.100pt;background:#f1f3f5;border-radius:6px;padding:3px 7px;color:#343a40}
.quote{font-size:9pt;background:#f8f9fa;border-left:3px solid var(--c);padding:4px 8px;margin:3px 0 5px}
/* cover */
.cover{break-before:auto}
.hero{background:linear-gradient(135deg,#1c7ed6,#7048e8);color:#fff;border-radius:16px;padding:22px 24px;text-align:center}
.hero h1{font-size:30pt;margin:4px 0 2px}.hero .sub{font-size:12pt;opacity:.95}
.hero .faces{display:flex;justify-content:center;gap:6px;margin-top:12px}.hero .face{width:50px;height:55px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:11px}
.box{border:1.300px solid #dee2e6;border-radius:11px;padding:10px 13px}
.box h3{margin:0 0 5px;font-size:12.500pt;color:#1c7ed6}
.box ol,.box ul.d{margin:0;padding-left:17px;list-style:revert}.box ul.d li,.box ol li{display:list-item;border:0;padding:1.500px 0}
.big{font-size:17pt;color:#e03131}
.formula{background:#fff9db;border:1.500px dashed #f59f00;border-radius:11px;padding:10px 14px;margin-top:10px}
.formula h3{margin:0 0 4px;font-size:12.500pt;color:#e8590c}
.ex{background:#fff;border-radius:8px;padding:7px 10px;margin-top:6px;border:1px solid #ffe066;font-size:8.800pt}
.toc{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px}
.toc div{border-radius:8px;padding:6px 8px;color:#fff;font-size:8.600pt;font-weight:600}
.toc b{font:400 11pt Jua;display:block}
.note{font-size:7.800pt;color:#868e96;margin-top:8px}
.q{column-count:2;column-gap:10px}
.q td{height:auto!important;padding-top:1.5px!important;padding-bottom:1.5px!important}
.q td.pe{font-family:'Noto Color Emoji',sans-serif;font-size:7.5pt;line-height:1.2;letter-spacing:1px;white-space:nowrap;width:1%}
.q table{break-inside:auto}.q td{text-align:left;height:19px}.q td.k{font:400 10.500pt Jua;color:#e03131;white-space:nowrap;width:34%}.q td.b{width:8%;text-align:center;color:#868e96}
</style></head><body>

<section class="cover">
 <div class="hero">
  <div class="sub">두문자 · 연상 스토리 · 학자 캐리커처로 외우는</div>
  <h1>임상심리사 2급 실기 합격 암기노트</h1>
  <div class="sub">읽고 → 가리고 → 써보면 끝! &nbsp;|&nbsp; 암기법 ${quiz.length}개 수록</div>
  <div class="faces">${[F.freud, F.adler, F.rogers, F.ellis, F.beck, F.skinner, F.perls, F.glasser, F.berne, F.yalom, F.satir, F.linehan].join('')}</div>
 </div>
 <div class="grid2">
  <div class="box"><h3>📝 시험 한눈에 보기</h3>
   <ul class="d"><li>방식: <b>필답형(서술형)</b> — 직접 손으로 써야 함</li><li>시간: <b>3시간</b> / 합격: 100점 만점에 <b class="big">60</b>점 이상</li>
   <li>4과목: 기초심리<b>평가</b> · 기초심리<b>상담</b> · 심리<b>치료</b> · 자문·교육·심리<b>재활</b></li>
   <li>기출 반복 비율이 높음 → <b>“키워드를 정확히 쓰는가”</b>가 당락</li></ul>
   <div class="note">※ 문항 수·세부 일정은 회차마다 다르니 Q-Net 공고를 꼭 확인하세요.</div></div>
  <div class="box"><h3>📖 이 노트 읽는 법</h3>
   <ul class="d"><li><span class="key" style="font-size:11pt">빨간 글씨</span> = 두문자 (이것만 떠올리면 됨)</li><li>노란 상자 = 두문자를 문장으로 만든 <b>연상 스토리</b></li><li>그림 줄 = <b>그림 → 두문자 → 내용 → 연상 단어 → 그림</b> 사슬. 회색 칸 하나가 두문자의 글자 하나</li>
   <li><em>빨</em>간 형광 글자 = 그 두문자가 나온 자리</li><li>💡 = 함께 나오는 보너스 키워드</li><li>마지막 장 = <b>가리고 써보는 셀프 테스트</b></li></ul></div>
 </div>
 <div class="formula"><h3>✍️ 서술형 답안 공식 — “번호 + 키워드 + 한 줄 설명”</h3>
  <div>① 묻는 개수만큼 <b>번호를 매겨</b> 쓴다 &nbsp;② 줄 맨 앞에 <b>키워드</b>를 먼저 쓴다 &nbsp;③ 뒤에 <b>한 줄 설명</b>을 붙인다 &nbsp;④ 빈칸으로 두지 않는다 (부분점수!)</div>
  <div class="ex"><b>Q. 로저스가 제시한 상담자의 태도 3가지를 쓰고 설명하시오.</b><br>
  ① <b>일치성(진실성)</b>: 상담자가 겉과 속이 일치하는 솔직한 태도로 내담자를 대하는 것<br>
  ② <b>무조건적 긍정적 존중</b>: 내담자를 조건 없이 있는 그대로 수용하고 존중하는 것<br>
  ③ <b>공감적 이해</b>: 내담자의 입장에서 감정을 이해하고 이를 전달하는 것 &nbsp; ← 머릿속으로는 “<span class="key" style="font-size:10pt">일무공</span>”</div></div>
 <div class="grid2">
  <div class="box"><h3>🗓️ 3회독 공부법</h3><ol><li><b>1회독</b>: 스토리를 소리 내어 읽으며 그림 떠올리기</li><li><b>2회독</b>: 오른쪽 설명을 손으로 가리고 두문자만 보고 말하기</li><li><b>3회독</b>: 마지막 장 셀프 테스트를 백지에 써보기 → 틀린 것만 다시</li></ol></div>
  <div class="box"><h3>🔥 시험 직전 TOP 10</h3><div style="font-size:8.600pt;line-height:1.6"><b>일무공</b> · <b>언지작처</b> · <b>어상토</b> · <b>건우히반남 편강조경내</b> · <b>위발결형 쌍내평조특</b> · <b>자타학법전</b> · <b>이위둔</b> · <b>당파인비</b> · <b>이평중종추</b> · <b>손기역불</b></div></div>
 </div>
 <div class="toc">${S.map(s => `<div style="background:${s.color}"><b>${s.no}</b>${s.title.replace(/^.*? [①-④] /, '').replace(/ \(.*/, '')}</div>`).join('')}<div style="background:#495057"><b>★</b>셀프 테스트</div></div>
 <div class="note">※ 학자 그림은 암기용으로 그린 캐리커처입니다. 교재마다 용어 번역(예: 일치성=진실성, 구인=구성)이 조금씩 다르니, 본인 교재의 표현과 함께 묶어 외우세요.</div>
</section>

${S.map(s => `<section style="--c:${s.color}"><div class="head"><div class="no">${s.no}</div><div><h2>${s.title}</h2><p>${s.sub}</p></div></div><div class="cols">${s.cards.map(card).join('')}</div></section>`).join('\n')}

<section style="--c:#495057"><div class="head"><div class="no">★</div><div><h2>셀프 테스트 — 그림·두문자만 보고 써보기</h2><p>그림을 보고 두문자를, 두문자를 보고 내용을 떠올려 오른쪽 칸에 풀어서 써보세요. 막히면 숫자(장 번호)로 돌아가 확인!</p></div></div>
<div class="q"><table>${quiz.map(([m, t, n, e]) => `<tr><td class="pe">${e}</td><td class="k">${m}</td><td>${t}</td><td class="b">${n}</td></tr>`).join('')}</table></div>
<div class="formula" style="margin-top:12px"><h3>🎯 마지막 한마디</h3>이 시험은 “얼마나 아느냐”보다 <b>“아는 걸 얼마나 정확한 단어로 쓰느냐”</b>의 시험입니다. 두문자 → 키워드 → 한 줄 설명. 이 순서로 손이 움직이면 60점은 넘습니다. 합격을 응원합니다! 🍀</div>
</section>
</body></html>`;

// Chromium의 다단(column) 인쇄가 카드를 다음 쪽으로 밀어내는 문제를 피하려고, 카드를 두 칸에 높이 순으로 직접 나눠 담는다
const reflow = () => document.querySelectorAll('.cols').forEach(box => {
  const cards = [...box.children];
  box.style.cssText += ';column-count:auto;display:flex;gap:9px;align-items:flex-start';
  const cols = [0, 1].map(() => { const d = document.createElement('div'); d.style.cssText = 'flex:1;min-width:0'; box.appendChild(d); return d; });
  cards.forEach(c => cols[0].appendChild(c));
  const h = cards.map(c => c.offsetHeight + 9), tot = h.reduce((a, x) => a + x, 0);
  // 읽는 순서를 지키면서(앞쪽은 왼칸, 뒤쪽은 오른칸) 두 칸 높이 차가 가장 작은 지점에서 나눈다
  let best = 0, bestMax = Infinity, run = 0;
  for (let k = 0; k <= cards.length; k++) { const m = Math.max(run, tot - run); if (m < bestMax) { bestMax = m; best = k; } run += h[k] || 0; }
  cards.slice(best).forEach(c => cols[1].appendChild(c));
  // 한 쪽(약 1020px)을 넘는 장은 그 장만 살짝 축소해서 한 쪽에 맞춘다
  const sec = box.closest('section'), LIM = 1015;
  if (sec.scrollHeight <= LIM) return;
  const inner = document.createElement('div');
  while (sec.firstChild) inner.appendChild(sec.firstChild);
  sec.appendChild(inner);
  inner.style.transformOrigin = '0 0';
  let z = 1;
  for (let t = 0; t < 6; t++) {  // 폭을 넓힌 만큼 높이가 줄어드므로 몇 번 반복해서 맞춘다
    inner.style.width = (100 / z) + '%';
    const H = inner.scrollHeight;
    if (H * z <= LIM) break;
    z = Math.min(z, LIM / H) * 0.995;
  }
  inner.style.transform = `scale(${z})`;
  sec.style.height = LIM + 'px'; sec.style.overflow = 'hidden';
});
module.exports={reflow,F,card,tbl,css:html.match(/<style>([\s\S]*?)<\/style>/)[1],fontDir};
if(require.main===module)(async () => {
  const out = process.argv[2];
  fs.writeFileSync(path.join(__dirname, 'note.html'), html);
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + path.join(__dirname, 'note.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.setViewportSize({ width: 718, height: 1035 }); await p.emulateMedia({ media: 'print' });
  await p.evaluate(reflow);
  await p.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
  await b.close();
  console.log('ok', quiz.length);
})();

#!/usr/bin/env python3
"""실전사회성 지창훈 릴스 자동 편집기.

plan.json 하나로 원본 영상을 인스타그램 릴스 완성본으로 만든다.
  - 9:16 1080x1920 세로 크롭
  - 첫 2초 급 줌인 (hook.zoom)
  - 훅 텍스트 팝업 애니메이션 (hook.text)
  - 상단 고정 제목, 하단 자막 (핵심어 금색)
  - 우상단 워터마크
  - 마지막 로고 엔딩 카드 (흰 배경, 왼→오 드러나는 모션)
  - 음량 -14 LUFS 정규화

사용법:
  python3 render.py plan.json            # 완성본 렌더
  python3 render.py plan.json --preview  # 앞 8초만 빠르게 렌더해서 확인
"""
import json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
FONTS = os.path.join(HERE, "fonts")
FONT = "NanumGothic ExtraBold"
W, H = 1080, 1920

# 브랜드 색 (ASS는 &HAABBGGRR)
GREEN = "&H001E220B"      # #0B221E
GOLD = "&H002B84B3"       # #B3842B
WHITE = "&H00FFFFFF"
BOX = "&H401E220B"        # 반투명 딥그린 박스


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit("ffmpeg 실패:\n" + r.stderr[-3000:])
    return r.stdout


def probe(path):
    out = run(["ffprobe", "-v", "error", "-show_entries",
               "format=duration:stream=codec_type", "-of", "json", path])
    d = json.loads(out)
    has_audio = any(s.get("codec_type") == "audio" for s in d.get("streams", []))
    return float(d["format"]["duration"]), has_audio


def ts(t):
    t = max(0.0, t)
    return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"


def colorize(text, words):
    for w in words or []:
        text = text.replace(w, "{\\c" + GOLD + "}" + w + "{\\c" + WHITE + "}")
    return text.replace("\n", "\\N")


def build_ass(plan, dur):
    title = plan.get("title", "")
    hook = plan.get("hook", {})
    lines = [
        "[Script Info]", "ScriptType: v4.00+", f"PlayResX: {W}", f"PlayResY: {H}",
        "WrapStyle: 0", "", "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, "
        "Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, "
        "Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
        # 상단 고정 제목: 세이프존(y>=230) 안, 오른쪽 230px 비움
        f"Style: Title,{FONT},66,{WHITE},{WHITE},{GREEN},{BOX},-1,0,0,0,100,100,0,0,3,18,0,8,80,230,270,1",
        # 하단 자막: y<=1440 (아래 UI 가림 영역 위)
        f"Style: Sub,{FONT},54,{WHITE},{WHITE},{GREEN},{BOX},-1,0,0,0,100,100,0,0,3,14,0,2,80,230,500,1",
        # 훅 텍스트: 화면 중앙 크게
        f"Style: Hook,{FONT},120,{WHITE},{WHITE},{GREEN},{GREEN},-1,0,0,0,100,100,0,0,1,8,6,5,80,230,0,1",
        # 워터마크
        f"Style: Mark,{FONT},34,&H4DFFFFFF,&H4DFFFFFF,&H801E220B,&H00000000,-1,0,0,0,100,100,0,0,1,2,0,9,0,250,190,1",
        "", "[Events]",
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ]
    if title:
        lines.append(f"Dialogue: 1,{ts(0)},{ts(dur)},Title,,0,0,0,,{colorize(title, plan.get('title_highlight'))}")
    if hook.get("text"):
        hd = float(hook.get("duration", 2.0))
        # 0.25초 동안 40%→112%→100% 팝업 후 마지막 0.2초 페이드아웃
        anim = "{\\fscx40\\fscy40\\t(0,180,\\fscx112\\fscy112)\\t(180,260,\\fscx100\\fscy100)\\fad(0,200)}"
        lines.append(f"Dialogue: 2,{ts(0)},{ts(hd)},Hook,,0,0,0,,{anim}{colorize(hook['text'], hook.get('highlight'))}")
    wm = plan.get("watermark", "실전사회성 지창훈")
    if wm:
        lines.append(f"Dialogue: 0,{ts(0)},{ts(dur)},Mark,,0,0,0,,{wm}")
    for s in plan.get("subtitles", []):
        lines.append(f"Dialogue: 1,{ts(s['start'])},{ts(min(s['end'], dur))},Sub,,0,0,0,,"
                     f"{{\\fad(80,80)}}{colorize(s['text'], s.get('highlight'))}")
    return "\n".join(lines) + "\n"


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    plan_path = sys.argv[1]
    preview = "--preview" in sys.argv
    plan = json.load(open(plan_path, encoding="utf-8"))
    base = os.path.dirname(os.path.abspath(plan_path))
    src = os.path.join(base, plan["input"])
    out = os.path.join(base, plan.get("output", "final.mp4"))
    if preview:
        out = out.replace(".mp4", "_preview.mp4")

    src_dur, has_audio = probe(src)
    t0, t1 = plan.get("trim", [0, src_dur])
    t1 = min(t1, src_dur)
    if preview:
        t1 = min(t1, t0 + 8)
    dur = t1 - t0

    tmp = tempfile.mkdtemp()
    ass = os.path.join(tmp, "subs.ass")
    open(ass, "w", encoding="utf-8").write(build_ass(plan, dur))

    hook = plan.get("hook", {})
    zoom = 0.25 if hook.get("zoom", True) else 0.0
    hd = float(hook.get("duration", 2.0))
    # 0→0.3초에 확대, 훅 끝나기 0.3초 전부터 원래 크기로 복귀
    z = (f"(1+{zoom}*(min(t/0.3,1)*lt(t,{hd - 0.3})"
         f"+max(0,({hd}-t)/0.3)*gte(t,{hd - 0.3})*lt(t,{hd})))")
    vf = (f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
          f"scale=w='trunc({W}*{z}/2)*2':h='trunc({H}*{z}/2)*2':eval=frame,"
          f"crop={W}:{H},setsar=1,fps=30,"
          f"subtitles='{ass}':fontsdir='{FONTS}'")
    body = os.path.join(tmp, "body.mp4")
    cmd = ["ffmpeg", "-y", "-ss", str(t0), "-t", str(dur), "-i", src]
    if not has_audio:
        cmd += ["-f", "lavfi", "-t", str(dur), "-i", "anullsrc=r=48000:cl=stereo"]
    cmd += ["-vf", vf, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000",
            "-map", "0:v:0", "-map", "0:a:0" if has_audio else "1:a:0",
            "-c:v", "libx264", "-preset", "veryfast" if preview else "medium", "-crf", "20",
            "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2", body]
    run(cmd)

    end_len = 0 if preview else float(plan.get("end_card", 2.0))
    if end_len <= 0:
        os.replace(body, out)
        print("완성:", out)
        return

    logo = os.path.join(REPO, plan.get("logo", "brand/logo-jichanghun.webp"))
    end = os.path.join(tmp, "end.mp4")
    # 흰 배경 위 로고가 왼쪽에서 오른쪽으로 드러남 (0.8초)
    run(["ffmpeg", "-y", "-f", "lavfi", "-t", str(end_len), "-i", f"color=white:s={W}x{H}:r=30",
         "-loop", "1", "-t", str(end_len), "-i", logo,
         "-f", "lavfi", "-t", str(end_len), "-i", "anullsrc=r=48000:cl=stereo",
         "-filter_complex",
         "[1:v]scale=960:-2,format=rgba[l];"
         "[l]geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lt(X,W*min(T/0.8,1)),alpha(X,Y),0)'[lr];"
         "[0:v][lr]overlay=(W-w)/2:(H-h)/2:shortest=1,format=yuv420p[v]",
         "-map", "[v]", "-map", "2:a", "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2", end])

    lst = os.path.join(tmp, "list.txt")
    open(lst, "w").write(f"file '{body}'\nfile '{end}'\n")
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy",
         "-movflags", "+faststart", out])
    print("완성:", out)


if __name__ == "__main__":
    main()

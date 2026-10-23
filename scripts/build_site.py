"""Generate the static lesson site from the repository's Markdown (Python 3)."""
from pathlib import Path
import html
import re

ROOT = Path(__file__).resolve().parents[1]
REPO = 'https://github.com/vanphuoc0443/HIT_WEB'


def inline(text):
    tokens = []
    def stash(value):
        tokens.append(value)
        return f'\x00{len(tokens)-1}\x00'
    text = re.sub(r'`([^`]+)`', lambda m: stash('<code>' + html.escape(m[1]) + '</code>'), text)
    text = html.escape(text)
    text = re.sub(r'!\[([^\]]*)\]\(([^\s]+)\)', lambda m: '<img loading="lazy" src="' + m[2] + '" alt="' + m[1] + '">', text)
    text = re.sub(r'\[([^\]]+)\]\(([^\s]+)\)', r'<a href="\2">\1</a>', text)
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    return re.sub(r'\x00(\d+)\x00', lambda m: tokens[int(m[1])], text)


def cells(line):
    # Pipes inside inline code are not table separators.
    return re.split(r'\s*\|\s*(?=(?:[^`]*`[^`]*`)*[^`]*$)', line.strip().strip('|'))


def markdown(source):
    lines = source.splitlines()
    out, toc = [], []
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        if line.startswith('```'):
            lang = line[3:].strip()
            code = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith('```'):
                code.append(lines[i])
                i += 1
            out.append(f'<div class="code-block"><div class="code-toolbar"><span>{html.escape(lang or "code")}</span><button class="copy" type="button">Sao chép</button></div><pre><code>{html.escape(chr(10).join(code))}</code></pre></div>')
        elif re.match(r'^#{1,6} ', line):
            match = re.match(r'^(#+) (.*)', line)
            level, title = len(match[1]), match[2]
            if level != 1:
                anchor = f'muc-{len(toc)+1}'
                toc.append((level, title, anchor))
                out.append(f'<h{level} id="{anchor}">{inline(title)}</h{level}>')
        elif re.match(r'^(---+|\*\*\*+)$', line):
            out.append('<hr>')
        elif line.startswith('|') and i + 1 < len(lines) and re.match(r'^\|[\s:|\-]+$', lines[i+1].strip()):
            headers = cells(line)
            out.append('<div class="table-wrap"><table><thead><tr>' + ''.join('<th scope="col">'+inline(c)+'</th>' for c in headers) + '</tr></thead><tbody>')
            i += 2
            while i < len(lines) and lines[i].strip().startswith('|'):
                out.append('<tr>' + ''.join('<td>'+inline(c)+'</td>' for c in cells(lines[i])) + '</tr>')
                i += 1
            out.append('</tbody></table></div>')
            continue
        elif re.match(r'^[-*] ', line):
            out.append('<ul>')
            while i < len(lines) and re.match(r'^\s*[-*] ', lines[i]):
                out.append('<li>'+inline(re.sub(r'^\s*[-*] ', '', lines[i]))+'</li>')
                i += 1
            out.append('</ul>')
            continue
        else:
            out.append('<p>'+inline(line)+'</p>')
        i += 1
    return '\n'.join(out), toc


rows = []
for line in (ROOT / 'README.md').read_text(encoding='utf-8').splitlines():
    match = re.match(r'\|\s*(\d+)\s*\|\s*(.*?)\s*\|', line)
    if match:
        rows.append((int(match[1]), match[2]))
available = {n for n, _ in rows if (ROOT / f'Lesson{n}/theory.md').exists()}



def shell(title, body, prefix='', active=0, toc=''):
    nav = ''.join(f'<a class="week {"active" if n == active else ""}" href="{prefix}Lesson{n}/README.html" '+('aria-current="page"' if n == active else '')+f'><span class="week-number">{n:02}</span><span><b>Tuần {n}</b><span>{html.escape(topic)}</span></span><span class="status {"ready" if n in available else ""}" aria-label="{"Có lý thuyết" if n in available else "Chưa có nội dung"}"></span></a>' for n, topic in rows)
    try_script = f'<script src="{prefix}assets/try-it.js" defer></script>' if 'class="code-block"' in body else ''
    mobile_toc = ('<details class="mobile-toc"><summary>Trong bài này</summary>' + toc.replace('<aside class="toc">', '<div class="toc-inline">').replace('</aside>', '</div>') + '</details>') if toc else ''
    return f'''<!DOCTYPE html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="Tài liệu lớp HIT Web Private 2026: lộ trình 14 tuần, lý thuyết và ví dụ thực hành."><title>{html.escape(title)} · HIT Web Private 2026</title><script>try{{document.documentElement.dataset.theme=localStorage.getItem('hit-theme')==='light'?'light':'dark'}}catch(e){{}}</script><link rel="stylesheet" href="{prefix}assets/site.css"><script src="{prefix}assets/site.js" defer></script>{try_script}</head>
<body class="{'home-page' if not active else 'lesson-page'}"><span class="page-start" aria-hidden="true"></span><a class="skip" href="#content">Đến nội dung chính</a><header class="header"><div class="header-inner"><a class="brand" href="{prefix}index.html"><img class="logo" src="{prefix}assets/logoCLB.jpg" alt="Logo CLB Tin học Đại học Công nghiệp Hà Nội" width="48" height="48"><span>HIT<span class="brand-divider">/</span><strong>WEB PRIVATE</strong><small>CÂU LẠC BỘ TIN HỌC · 2026</small></span></a><nav class="header-actions" aria-label="Điều hướng chính"><a class="course-link" href="{prefix}index.html#curriculum">Lộ trình học</a><a class="repo" href="{REPO}">GitHub ↗</a><button id="theme" type="button" aria-label="Bật giao diện sáng">Sáng</button></nav></div><div class="reading-progress" aria-hidden="true"></div></header>
<details class="mobile-nav"><summary>Lộ trình học <span>Chọn tuần</span></summary><nav aria-label="Danh sách tuần trên điện thoại">{nav}</nav></details><div class="layout"><aside class="sidebar"><a class="course-home" href="{prefix}index.html">← Tổng quan khóa học</a><div class="sidebar-title"><h2>Lộ trình học</h2><span>14 tuần</span></div><p class="sidebar-note">Từ những dòng code đầu tiên.</p><nav aria-label="Danh sách tuần">{nav}</nav><div class="sidebar-footer">{len(available):02} / {len(rows):02} tuần có tài liệu</div></aside><main id="content" tabindex="-1">{body if not active else body.replace('<article class="prose">', mobile_toc + '<article class="prose">')}<footer class="footer"><a class="footer-brand" href="{prefix}index.html">HIT<span>CLUB.</span></a><p>Cùng học. Cùng làm. Cùng tốt hơn.</p><a href="{REPO}">Mã nguồn của lớp ↗</a></footer></main>{toc}</div><button id="top" type="button" aria-label="Về đầu trang" hidden>↑</button></body></html>'''


def lesson_link(n, topic):
    ready = n in available
    return f'''<a class="lesson-row {'is-ready' if ready else ''} reveal" href="Lesson{n}/README.html"><span class="lesson-index">{n:02}</span><div class="lesson-row-title"><h3>{html.escape(topic)}</h3><span>{'Lý thuyết & ví dụ' if ready else 'Chưa có nội dung'}</span></div><span class="row-action">{'Đọc bài' if ready else 'Xem tuần'} <span aria-hidden="true">↗</span></span></a>'''


cards = ''.join(lesson_link(n, topic) for n, topic in rows)
first = min(available) if available else 1
home = f'''<section class="hero" aria-labelledby="home-title"><div class="hero-copy"><span class="eyebrow">HIT WEB PRIVATE / 2026</span><h1 id="home-title">Học bằng cách<br><em>tự tay làm.</em></h1><p>Hiểu nền tảng. Thử ý tưởng. Biến những dòng code đầu tiên thành trang web của bạn.</p><a class="primary" href="Lesson{first}/README.html">Bắt đầu học <span aria-hidden="true">↗</span></a></div><div class="lab reveal"><div class="lab-head"><span>CSS / PLAYGROUND</span><span class="live-label">Tương tác trực tiếp</span></div><div class="lab-stage" id="flex-demo" style="--demo-gap:12px"><span class="demo-block">H</span><span class="demo-block">I</span><span class="demo-block">T</span></div><div class="lab-controls"><div class="control-line"><span>flex-direction</span><div class="segmented" role="group" aria-label="Hướng Flexbox"><button type="button" data-direction="row" aria-pressed="true">row</button><button type="button" data-direction="column" aria-pressed="false">column</button></div></div><label class="control-line" for="demo-gap"><span>gap</span><span><output id="gap-value" for="demo-gap">12</output>px</span></label><input id="demo-gap" aria-label="Khoảng cách giữa các khối" type="range" min="0" max="32" value="12" step="4"><pre class="lab-code"><code><span>.your-first-layout</span> {{
  display: flex;
  flex-direction: <b id="code-direction">row</b>;
  gap: <b id="code-gap">12px</b>;
}}</code></pre></div><p class="lab-caption">Đổi một thuộc tính. Thấy ngay sự khác biệt.</p></div></section>
<section class="course-intro reveal" aria-label="Tổng quan khóa học"><p>Một lộ trình.<br><strong>Nhiều thứ bạn có thể làm.</strong></p><div><span>14 tuần</span><span>HTML · CSS · JavaScript</span><span>{len(available):02} bài đã sẵn sàng</span></div></section>
<section class="curriculum" id="curriculum"><div class="section-title reveal"><h2>Lộ trình học<span>.</span></h2><p>Bắt đầu từ tuần 1, hoặc chọn đúng phần bạn đang cần.</p></div><div class="course-tools"><label class="search"><span class="sr-only">Tìm tuần học</span><input type="search" id="lesson-search" placeholder="Tìm HTML, Git, JavaScript…" autocomplete="off"><span aria-hidden="true">/</span></label><div class="lesson-filter" role="group" aria-label="Lọc tuần học"><button type="button" data-filter="all" aria-pressed="true">Tất cả <span>{len(rows)}</span></button><button type="button" data-filter="ready" aria-pressed="false">Có tài liệu <span>{len(available)}</span></button></div></div><p id="search-status" class="sr-only" role="status" aria-live="polite"></p><div class="lesson-list">{cards}</div><div class="search-empty" hidden><h3>Chưa tìm thấy tuần phù hợp.</h3><p>Thử từ khóa khác hoặc xem toàn bộ lộ trình.</p><button type="button" id="reset-search" class="text-button">Xóa bộ lọc →</button></div></section>
<section class="closing reveal"><p>Không cần biết hết<br>để <em>bắt đầu.</em></p><span>Viết dòng đầu tiên. Phần còn lại, cùng học tiếp.</span><a href="Lesson{first}/README.html" class="text-link">Khám phá Tuần {first} <span aria-hidden="true">↗</span></a></section>'''

outputs = {ROOT / 'index.html': shell('Lộ trình học', home)}
for n, topic in rows:
    folder = ROOT / f'Lesson{n}'
    source = folder / 'theory.md'
    article, headings = markdown(source.read_text(encoding='utf-8')) if source.exists() else (f'<div class="empty"><span class="empty-number" aria-hidden="true">{n:02}</span><h2>Bài học đang được chuẩn bị.</h2><p>Tuần này chưa có tài liệu. Trong lúc chờ, bạn có thể tiếp tục với hai bài học đầu tiên.</p><a class="primary" href="../index.html#curriculum">Xem lộ trình <span aria-hidden="true">↗</span></a></div>', [])
    toc = '<aside class="toc"><span class="toc-label">Trong bài này</span><nav aria-label="Mục lục bài học">' + ''.join(f'<a class="level-{level}" href="#{anchor}">{html.escape(title)}</a>' for level, title, anchor in headings) + '</nav></aside>' if headings else ''
    prev = f'<a href="../Lesson{n-1}/README.html"><span>Tuần trước</span><b>← Tuần {n-1:02}</b></a>' if n > 1 else '<a href="../index.html"><span>Tổng quan</span><b>← Lộ trình học</b></a>'
    nex = f'<a href="../Lesson{n+1}/README.html"><span>Tuần tiếp theo</span><b>Tuần {n+1:02} →</b></a>' if n < 14 else '<a href="../index.html"><span>Tổng quan</span><b>Về lộ trình →</b></a>'
    body = f'<div class="breadcrumb"><a href="../index.html">Lộ trình</a><span>/</span> Tuần {n:02}</div><header class="lesson-header"><span class="eyebrow">TUẦN {n:02} / WEB PRIVATE 2026</span><h1>{html.escape(topic)}</h1><div class="lesson-meta"><span>{"Lý thuyết & ví dụ" if source.exists() else "Chưa có nội dung"}</span>' + (f'<a href="{REPO}/blob/main/Lesson{n}/theory.md">Đọc Markdown ↗</a>' if source.exists() else '') + f'</div></header><article class="prose">{article}</article><nav class="lesson-pagination" aria-label="Chuyển tuần">{prev}{nex}</nav>'
    outputs[folder / 'README.html'] = shell(f'Tuần {n}: {topic}', body, '../', n, toc)

if '--stdout' in __import__('sys').argv:
    import json
    print(json.dumps({str(path.relative_to(ROOT)): content for path, content in outputs.items()}, ensure_ascii=True))
else:
    for path, content in outputs.items():
        path.parent.mkdir(exist_ok=True)
        path.write_text(content, encoding='utf-8')
    print(f'Generated {len(outputs)} pages; {len(available)} available lessons.')
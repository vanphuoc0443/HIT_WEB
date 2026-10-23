"""Generate the static lesson site from the repository's Markdown (Python 3)."""
from pathlib import Path
import html
import re

ROOT = Path(__file__).resolve().parents[1]
REPO = 'https://github.com/thienbao28287/WEB_PRIVATE_2026'


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
    return f'''<!DOCTYPE html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="Tài liệu lớp HIT Web Private 2026: lộ trình 14 tuần, lý thuyết và ví dụ thực hành."><title>{html.escape(title)} · HIT Web Private 2026</title><link rel="stylesheet" href="{prefix}assets/site.css"><script src="{prefix}assets/site.js" defer></script></head>
<body><a class="skip" href="#content">Đến nội dung chính</a><header class="header"><a class="brand" href="{prefix}index.html"><img class="logo" src="{prefix}assets/logoCLB.jpg" alt="Logo CLB Tin học Đại học Công nghiệp Hà Nội" width="43" height="43"><span>HIT <strong>WEB PRIVATE</strong><small>HỌC CÙNG NHAU · 2026</small></span></a><div class="header-actions"><a class="repo" href="{REPO}">Repository ↗</a><button id="theme" type="button" aria-label="Chuyển giao diện sáng tối">☼</button></div></header>
<details class="mobile-nav"><summary>Lộ trình học <span>Chọn tuần</span></summary><nav aria-label="Danh sách tuần trên điện thoại">{nav}</nav></details><div class="layout"><aside class="sidebar"><a class="course-home" href="{prefix}index.html">← Tổng quan khóa học</a><div class="sidebar-title"><h2>Lộ trình học</h2><span>14 tuần</span></div><p class="sidebar-note">Từ những dòng code đầu tiên.</p><nav aria-label="Danh sách tuần">{nav}</nav><div class="sidebar-footer"><span class="status ready"></span> {len(available)} tuần đã có tài liệu</div></aside><main id="content" tabindex="-1">{body}<footer class="footer">HIT CLUB <span>Web Private 2026 · Cùng học, cùng tiến bộ.</span><a href="{REPO}">Xem mã nguồn ↗</a></footer></main>{toc}</div><button id="top" type="button" aria-label="Về đầu trang" hidden>↑</button></body></html>'''


cards = ''.join(f'<a class="lesson-card {"published-lesson" if n in available else "upcoming"}" href="Lesson{n}/README.html"><div class="card-meta"><span>TUẦN {n:02}</span><span class="pill {"published" if n in available else ""}">{"Có lý thuyết" if n in available else "Chưa có nội dung"}</span></div><h3>{html.escape(topic)}</h3><div class="card-bottom"><span>{"Đọc bài học" if n in available else "Xem tuần học"}</span><span aria-hidden="true">↗</span></div></a>' for n, topic in rows)
home = f'''<div class="breadcrumb">Tài liệu học tập <span>/</span> Tổng quan</div><section class="hero"><span class="eyebrow">HIT WEB PRIVATE 2026</span><h1>Học web.<br><span>Bắt đầu từ nền tảng.</span></h1><p>HTML, CSS và JavaScript trong 14 tuần. Học lý thuyết, tự viết code, hiểu từng bước.</p><a class="primary" href="Lesson1/README.html">Bắt đầu với Tuần 1 <span>→</span></a></section><div class="course-stats"><div><strong>14</strong><span>tuần học</span></div><div><strong>02</strong><span>tuần có lý thuyết</span></div><div><strong>03</strong><span>HTML · CSS · JS</span></div></div><section class="curriculum"><div class="section-title"><div><h2>Lộ trình lớp Web Private</h2></div></div><div class="lesson-grid">{cards}</div></section>'''
(ROOT / 'index.html').write_text(shell('Lộ trình học', home), encoding='utf-8')
for n, topic in rows:
    folder = ROOT / f'Lesson{n}'
    folder.mkdir(exist_ok=True)
    source = folder / 'theory.md'
    article, headings = markdown(source.read_text(encoding='utf-8')) if source.exists() else ('<div class="empty"><span class="eyebrow">ĐANG CHỜ TÀI LIỆU</span><h2>Hẹn bạn ở tuần học này.</h2><p>Tuần này chưa có nội dung trong repo. Bạn có thể quay lại các tuần đã có tài liệu để tiếp tục học.</p><a class="primary" href="../index.html">Xem lộ trình →</a></div>', [])
    toc = '<aside class="toc"><span class="eyebrow">TRONG BÀI NÀY</span><nav aria-label="Mục lục bài học">' + ''.join(f'<a class="level-{level}" href="#{anchor}">{html.escape(title)}</a>' for level, title, anchor in headings) + '</nav></aside>' if headings else ''
    prev = f'<a href="../Lesson{n-1}/README.html">← Tuần {n-1}</a>' if n > 1 else '<a href="../index.html">← Lộ trình học</a>'
    nex = f'<a href="../Lesson{n+1}/README.html">Tuần {n+1} →</a>' if n < 14 else '<a href="../index.html">Về lộ trình →</a>'
    body = f'<div class="breadcrumb"><a href="../index.html">Lộ trình</a><span>/</span> Tuần {n:02}</div><header class="lesson-header"><span class="eyebrow">HIT WEB PRIVATE 2026 · TUẦN {n:02}</span><h1>{html.escape(topic)}</h1><div class="lesson-meta"><span>{"Lý thuyết & ví dụ" if source.exists() else "Chưa có nội dung"}</span>' + (f'<a href="{REPO}/blob/main/Lesson{n}/theory.md">Đọc Markdown ↗</a>' if source.exists() else '') + f'</div></header><article class="prose">{article}</article><nav class="lesson-pagination" aria-label="Chuyển tuần">{prev}{nex}</nav>'
    (folder / 'README.html').write_text(shell(f'Tuần {n}: {topic}', body, '../', n, toc), encoding='utf-8')
print(f'Generated index.html and {len(rows)} lesson pages; {len(available)} available lessons.')

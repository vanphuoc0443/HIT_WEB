"""Check local links, anchors and exact fenced-code preservation."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import re

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.links, self.ids, self.blocks = [], set(), []
        self.in_pre = False
        self.feed(path.read_text(encoding='utf-8'))

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f'Duplicate ID: {attrs["id"]}'
            self.ids.add(attrs['id'])
        for key in ('src', 'href'):
            if key in attrs:
                self.links.append(attrs[key])
        if tag == 'pre':
            self.in_pre = True
            self.blocks.append('')

    def handle_endtag(self, tag):
        if tag == 'pre':
            self.in_pre = False

    def handle_data(self, data):
        if self.in_pre:
            self.blocks[-1] += data


paths = [ROOT / 'index.html', *sorted(ROOT.glob('Lesson*/README.html'))]
pages = {path.resolve(): Page(path) for path in paths}
checked = 0
for path, page in pages.items():
    for link in page.links:
        url = urlsplit(link)
        if url.scheme or url.netloc:
            continue
        target = (path.parent / unquote(url.path)).resolve() if url.path else path
        assert target.exists(), f'{path}: missing {link}'
        if url.fragment:
            assert target in pages and unquote(url.fragment) in pages[target].ids, f'Broken anchor: {link}'
        checked += 1
    source = path.parent / 'theory.md'
    if source.exists():
        blocks = re.findall(r'^```[^\n]*\n(.*?)\n```', source.read_text(encoding='utf-8'), re.M | re.S)
        assert blocks == page.blocks, f'Code changed in {path}'
assert len(pages) == 15
print(f'PASS: {len(pages)} pages, {checked} local links/assets/anchors; all lesson code blocks preserved.')

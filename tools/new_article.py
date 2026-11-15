#!/usr/bin/env python3
"""
EYE VINA – đăng 1 bài viết tin tức lên website tĩnh eyevina.com.

Cách dùng (chạy ở thư mục gốc repo):
    python3 tools/new_article.py tools/drafts/<slug>.json            # kiểm tra + tạo bài
    python3 tools/new_article.py tools/drafts/<slug>.json --check    # chỉ kiểm tra, không ghi

File JSON của bài (xem tools/WRITING-GUIDE.md):
{
  "slug": "lens-can-loan-ha-noi-cach-chon-do",          # chữ thường, không dấu, gạch nối
  "date": "2026-11-16",
  "title": "...",                 # thẻ <title>, 40–65 ký tự, có từ khóa chính
  "h1": "...",                    # tiêu đề hiển thị
  "description": "...",           # meta description 120–160 ký tự
  "keywords": ["...", "..."],     # 4–10 cụm từ khóa
  "card_title": "...",            # tiêu đề ở danh sách tin tức
  "card_desc": "...",             # tóm tắt 1–2 câu
  "image_source": "images/sp/....jpg",   # ảnh có sẵn trong repo làm ảnh bìa
  "image_alt": "...",
  "body_html": "<p class=\"art-lead\">...</p><h2 id=\"...\">...</h2>...",
  "faq": [["Câu hỏi?", "Trả lời."], ...]
}

Script tự làm: trang tin-tuc/<slug>.html (giao diện, menu, giỏ hàng như các trang khác),
mục lục, khung quảng cáo EYEMEDI ở ~1/3 bài, slider "Sản phẩm liên quan", schema Article/FAQ/Breadcrumb,
ảnh bìa + ảnh thẻ, chèn bài lên đầu mục tin tức ở trang chủ và tin-tuc.html, sitemap.xml, tools/articles.json.
"""
import html, json, os, re, sys
from datetime import date as _date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://eyevina.com/'
SHELL = 'tin-tuc/mua-lens-can-uy-tin-o-ha-noi-eyevina.html'   # trang mẫu lấy khung giao diện
esc = lambda s: html.escape(str(s), quote=True)
P = lambda *a: os.path.join(ROOT, *a)


def die(msg):
    print('LỖI:', msg)
    sys.exit(1)


def read(p):
    return open(P(p), encoding='utf-8').read()


def write(p, s):
    os.makedirs(os.path.dirname(P(p)) or ROOT, exist_ok=True)
    open(P(p), 'w', encoding='utf-8').write(s)


def plain(h):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', h))).strip()


# ---------------------------------------------------------------- kiểm tra
def validate(a):
    need = ['slug', 'date', 'title', 'h1', 'description', 'keywords', 'card_title', 'card_desc', 'image_source', 'body_html', 'faq']
    for k in need:
        if not a.get(k):
            die(f'thiếu trường "{k}"')
    if not re.fullmatch(r'[a-z0-9]+(-[a-z0-9]+)*', a['slug']):
        die('slug chỉ gồm chữ thường không dấu, số và dấu gạch nối')
    if os.path.exists(P('tin-tuc', a['slug'] + '.html')):
        die('đã có bài với slug này')
    if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', a['date']):
        die('date dạng YYYY-MM-DD')
    if not 30 <= len(a['title']) <= 70:
        die(f'title dài {len(a["title"])} ký tự (cần 30–70)')
    if not 100 <= len(a['description']) <= 170:
        die(f'description dài {len(a["description"])} ký tự (cần 100–170)')
    if not os.path.exists(P(a['image_source'])):
        die('không thấy ảnh ' + a['image_source'])
    body = a['body_html']
    if re.search(r'<(script|iframe|style|form|object|embed)\b', body, re.I) or re.search(r'\son\w+\s*=', body, re.I):
        die('body_html không được chứa script/iframe/style/form hoặc thuộc tính on...=')
    if '<h1' in body.lower():
        die('body_html không chứa <h1> (H1 lấy từ trường h1)')
    h2 = re.findall(r'<h2[^>]*>', body)
    if len(h2) < 4:
        die('cần ít nhất 4 thẻ <h2>')
    words = len(plain(body).split())
    if words < 900:
        die(f'bài quá ngắn: {words} từ (cần ≥ 900)')
    for link in set(re.findall(r'href="(/san-pham/[^"#?]+)"', body)):
        if not os.path.exists(P(link.lstrip('/'))):
            die('link sản phẩm không tồn tại: ' + link)
    if len(set(re.findall(r'href="/san-pham/', body))) == 0:
        die('cần ít nhất 1 link tới trang sản phẩm /san-pham/...')
    if not (3 <= len(a['faq']) <= 8):
        die('faq cần 3–8 câu')
    low = plain(body).lower()
    miss = [k for k in a['keywords'] if k.lower() not in low and k.lower() not in a['title'].lower()]
    if miss:
        print('CẢNH BÁO: từ khóa chưa xuất hiện trong bài:', miss)
    return words


# ---------------------------------------------------------------- ảnh
def make_images(a):
    from PIL import Image
    im = Image.open(P(a['image_source'])).convert('RGB')
    out = {}
    for name, (tw, th) in {'thumb': (520, 336), 'cover': (1200, 630)}.items():
        w, h = im.size
        r = tw / th
        if w / h > r:
            nw = int(h * r); box = ((w - nw) // 2, 0, (w - nw) // 2 + nw, h)
        else:
            nh = int(w / r); box = (0, (h - nh) // 2, w, (h - nh) // 2 + nh)
        c = im.crop(box)
        if c.size[0] > tw:
            c = c.resize((tw, th), Image.LANCZOS)
        fn = f'images/news/{a["slug"]}{"" if name == "thumb" else "-cover"}.jpg'
        os.makedirs(P('images/news'), exist_ok=True)
        c.save(P(fn), 'JPEG', quality=82, optimize=True, progressive=True)
        out[name] = (fn, c.size)
    return out


# ---------------------------------------------------------------- trang bài viết
def build_page(a, imgs):
    shell = read(SHELL)
    url = f'{SITE}tin-tuc/{a["slug"]}.html'
    # các khối dùng lại từ trang mẫu
    ad = re.search(r'<aside class="adbox".*?</aside>\s*<script>[^<]*adSlider[^<]*</script>', shell, re.S)
    sl = re.search(r'<div class="pslider" id="artRelated".*?</button>\s*</div>', shell, re.S)
    if not ad or not sl:
        die('trang mẫu thiếu khung quảng cáo hoặc slider')
    body = a['body_html']
    # id cho mọi h2 + mục lục
    toc, n = [], 0
    def _h2(m):
        nonlocal n
        n += 1
        attrs, text = m.group(1), m.group(2)
        hid = re.search(r'id="([^"]+)"', attrs)
        hid = hid.group(1) if hid else f'muc-{n}'
        toc.append((hid, plain(text)))
        return f'<h2 id="{hid}">{text}</h2>'
    body = re.sub(r'<h2([^>]*)>(.*?)</h2>', _h2, body, flags=re.S)
    # ảnh bìa sau đoạn mở đầu
    cover_fn, (cw, ch) = imgs['cover']
    fig = f'<figure class="art-fig"><img src="/{cover_fn}" alt="{esc(a.get("image_alt") or a["h1"])}" width="{cw}" height="{ch}"><figcaption>{esc(a.get("image_alt") or a["card_title"])}</figcaption></figure>'
    toc_html = '<nav class="toc" aria-label="Mục lục"><b>Nội dung bài viết</b><ol>' + ''.join(f'<li><a href="#{i}">{esc(t)}</a></li>' for i, t in toc) + '</ol></nav>'
    m = re.search(r'</p>', body)
    body = (body[:m.end()] + '\n' + fig + '\n' + toc_html + body[m.end():]) if m else fig + toc_html + body
    # quảng cáo ở ~1/3 bài: trước thẻ h2 thứ ceil(n/3)+1
    h2s = [m.start() for m in re.finditer(r'<h2 ', body)]
    k = min(len(h2s) - 1, max(1, round(len(h2s) / 3)))
    body = body[:h2s[k]] + ad.group(0) + '\n\n' + body[h2s[k]:]
    faq_html = '\n'.join(f'<details{" open" if i == 0 else ""}><summary>{esc(q)}</summary><p>{esc(ans)}</p></details>' for i, (q, ans) in enumerate(a['faq']))
    d = _date.fromisoformat(a['date']).strftime('%d/%m/%Y')
    article = f'''<article class="art-wrap">
  <div class="container art">
    <nav class="crumb" aria-label="breadcrumb"><a href="/">Trang chủ</a> › <a href="/tin-tuc.html">Tin tức</a> › <span>{esc(a["card_title"][:70])}</span></nav>
    <h1>{esc(a["h1"])}</h1>
    <p class="art-meta">EYE VINA · <time datetime="{a["date"]}">{d}</time> · Kính áp tròng Hà Nội</p>
{body}

<h2 id="faq">Câu hỏi thường gặp</h2>
<div class="faq">{faq_html}</div>

<div class="art-cta">
<b>Cần tư vấn chọn lens?</b>
<p>EYE VINA – cửa hàng lens Hà Nội &amp; nhà cung cấp kính áp tròng sỉ miền Bắc.</p>
<div><a class="c1" href="https://zalo.me/0989666559" target="_blank" rel="noopener">Nhắn Zalo 0989 666 559</a><a class="c2" href="/#san-pham">Xem sản phẩm</a></div>
</div>

<h2>Sản phẩm liên quan</h2>
{sl.group(0)}
<script>window.addEventListener('DOMContentLoaded',()=>{{prodSlider('artRelated',12)}});</script>
  </div>
</article>'''
    t = shell[:shell.index('<article class="art-wrap">')] + article + shell[shell.index('</article>') + len('</article>'):]
    kw = ', '.join(a['keywords'])
    cover_abs = SITE + cover_fn
    subs = [
        (r'<title>.*?</title>', f'<title>{esc(a["title"])}</title>'),
        (r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{esc(a["description"])}">'),
        (r'<meta name="keywords" content="[^"]*">', f'<meta name="keywords" content="{esc(kw)}">'),
        (r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{url}">'),
        (r'<link rel="alternate" hreflang="vi-VN" href="[^"]*">', f'<link rel="alternate" hreflang="vi-VN" href="{url}">'),
        (r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{url}">'),
        (r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{esc(a["title"])}">'),
        (r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{esc(a["description"])}">'),
        (r'<meta property="og:image" content="[^"]*">', f'<meta property="og:image" content="{cover_abs}">'),
        (r'<meta property="og:image:alt" content="[^"]*">', f'<meta property="og:image:alt" content="{esc(a["title"])}">'),
    ]
    for pat, val in subs:
        t, c = re.subn(pat, lambda m, v=val: v, t, count=1)
    graph = {"@context": "https://schema.org", "@graph": [
        {"@type": "Article", "@id": url + "#article", "headline": a['title'], "description": a['description'],
         "datePublished": a['date'], "dateModified": a['date'], "inLanguage": "vi-VN", "mainEntityOfPage": url,
         "image": cover_abs, "keywords": kw,
         "author": {"@type": "Organization", "name": "EYE VINA", "url": SITE},
         "publisher": {"@type": "Organization", "name": "EYE VINA", "logo": {"@type": "ImageObject", "url": SITE + "images/logo-eye-vina.png"}}},
        {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": ans}} for q, ans in a['faq']]},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Trang chủ", "item": SITE},
            {"@type": "ListItem", "position": 2, "name": "Tin tức", "item": SITE + "tin-tuc.html"},
            {"@type": "ListItem", "position": 3, "name": a['card_title'][:110], "item": url}]}]}
    t = re.sub(r'<script type="application/ld\+json">.*?</script>',
               lambda m: '<script type="application/ld+json">' + json.dumps(graph, ensure_ascii=False) + '</script>', t, count=1, flags=re.S)
    return t


# ---------------------------------------------------------------- danh sách tin
def item_html(a, thumb, hidden=False):
    u = f'/tin-tuc/{a["slug"]}.html'
    d = _date.fromisoformat(a['date']).strftime('%d/%m/%Y')
    return f'''      <article class="news-item"{' hidden' if hidden else ''}>
        <a class="thumb" href="{u}"><img loading="lazy" decoding="async" width="520" height="336" src="/{thumb}" alt="{esc(a["card_title"])}"></a>
        <div class="nc">
          <h3><a href="{u}">{esc(a["card_title"])}</a></h3>
          <time class="date">{d}</time>
          <p class="excerpt">{esc(a["card_desc"])}</p>
          <a class="more" href="{u}">Xem thêm →</a>
        </div>
      </article>'''


def add_to_list(path, list_id, more_id, show, a, thumb, total_re=None):
    s = read(path)
    open_tag = f'<div class="news-list" id="{list_id}">'
    i = s.index(open_tag) + len(open_tag)
    j = s.index('\n    </div>', i)
    inner = item_html(a, thumb) + '\n' + s[i:j].lstrip('\n')
    items = re.findall(r'      <article class="news-item".*?</article>', inner, re.S)
    fixed = []
    for k, it in enumerate(items):
        it = re.sub(r'<article class="news-item"( hidden)?>', '<article class="news-item"' + (' hidden' if k >= show else '') + '>', it, count=1)
        fixed.append(it)
    s = s[:i] + '\n' + '\n'.join(fixed) + s[j:]
    left = max(0, len(items) - show)
    s = re.sub(rf'(id="{more_id}"[^>]*>[^<]*<span>)\(còn \d+\)(</span>)', rf'\g<1>(còn {left})\2', s, count=1)
    if total_re:
        s = re.sub(r'Tổng hợp \d+ bài viết', f'Tổng hợp {len(items)} bài viết', s, count=1)
        # schema ItemList của trang tin tức
        m = re.search(r'<script type="application/ld\+json">(.*?)</script>', s, re.S)
        if m:
            g = json.loads(m.group(1))
            for node in g.get('@graph', []):
                if node.get('@type') == 'ItemList':
                    el = node['itemListElement']
                    el.insert(0, {"@type": "ListItem", "position": 1, "url": f'{SITE}tin-tuc/{a["slug"]}.html', "name": a['card_title']})
                    for n, x in enumerate(el):
                        x['position'] = n + 1
            s = s[:m.start(1)] + json.dumps(g, ensure_ascii=False) + s[m.end(1):]
    write(path, s)
    return len(items)


def add_sitemap(a, cover):
    s = read('sitemap.xml')
    u = f'{SITE}tin-tuc/{a["slug"]}.html'
    if u in s:
        return
    block = f'  <url>\n    <loc>{u}</loc>\n    <lastmod>{a["date"]}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n    <image:image><image:loc>{SITE}{cover}</image:loc></image:image>\n  </url>\n'
    s = s.replace('</urlset>', block + '</urlset>')
    s = re.sub(r'(<loc>https://eyevina.com/tin-tuc.html</loc>\s*<lastmod>)[^<]*', rf'\g<1>{a["date"]}', s, count=1)
    write('sitemap.xml', s)


def main():
    if len(sys.argv) < 2:
        die('cách dùng: python3 tools/new_article.py tools/drafts/<slug>.json [--check]')
    a = json.load(open(sys.argv[1], encoding='utf-8'))
    words = validate(a)
    print(f'OK kiểm tra: {words} từ, {len(a["faq"])} câu hỏi, title {len(a["title"])} ký tự, description {len(a["description"])} ký tự')
    if '--check' in sys.argv:
        return
    imgs = make_images(a)
    write(f'tin-tuc/{a["slug"]}.html', build_page(a, imgs))
    n1 = add_to_list('tin-tuc.html', 'newsAll', 'newsAllMore', 8, a, imgs['thumb'][0], total_re=True)
    n2 = add_to_list('index.html', 'newsHome', 'newsHomeMore', 4, a, imgs['thumb'][0])
    add_sitemap(a, imgs['cover'][0])
    reg = json.load(open(P('tools/articles.json'), encoding='utf-8'))
    reg.insert(0, {"slug": a['slug'], "date": a['date'], "title": a['title'], "topic": a.get('topic', ''), "keywords": a['keywords']})
    json.dump(reg, open(P('tools/articles.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'ĐÃ TẠO: tin-tuc/{a["slug"]}.html | tin-tuc.html {n1} bài | trang chủ {n2} tin | sitemap + articles.json đã cập nhật')
    print(f'URL: {SITE}tin-tuc/{a["slug"]}.html')


if __name__ == '__main__':
    main()

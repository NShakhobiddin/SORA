#!/usr/bin/env python3
"""Bojxonachi Sora — bilim bazasini shakllantirish.

data-src/ dagi huquqiy hujjatlarni (docx) va taqiqlangan/cheklangan
tovarlar jadvalini (xlsx) o'qib, sayt qidiruv dvigateli uchun
web/src/data/kb.json va web/src/data/prohibited.json fayllarini yaratadi.

Bo'lish qoidalari:
  • Bojxona kodeksi — "N-modda." sarlavhalari bo'yicha;
  • Qaror/farmon hujjatlari — "N." raqamli bandlar va "ILOVA" bo'limlari bo'yicha;
  • docx ichidagi jadvallar "Nomi — miqdori" qatorlariga aylantiriladi;
  • juda uzun bo'laklar xatboshi chegarasida qismlarga bo'linadi.

Ishga tushirish:  python3 tools/build_kb.py
"""
import json
import re
import sys
from pathlib import Path

try:
    import docx  # python-docx
    import openpyxl
except ImportError:
    sys.exit("pip install python-docx openpyxl")

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'data-src'
OUT = ROOT / 'web' / 'src' / 'data'

# Hujjat fayli → (qisqa kod, mavzu tegi, to'liq nom, lex.uz URL)
DOCS = [
    ('1. Bojxona kodeksi.docx', 'Bojxona kodeksi', '',
     "O'zbekiston Respublikasining Bojxona kodeksi", 'https://lex.uz/docs/-2876352'),
    ('2. 244 Ajratilgan.docx', 'VMQ 244-son', 'tovar normalari',
     "VM qarori: Ayrim turdagi tovarlarni bojxona chegarasi orqali olib o'tish tartibi (2025-yil 19-aprel, 244-son)",
     'https://lex.uz/uz/docs/-7484114'),
    ('3. 191 Ajratilgan.docx', 'VMQ 191-son', 'dori vositalari',
     "VM qarori: Dori vositalari va tibbiy buyumlarni jismoniy shaxslar tomonidan olib kirish-olib chiqish tartibi (191-son)",
     'https://lex.uz/uz/docs/-2978664'),
    ('4. 66 Ajratilgan.docx', 'VMQ 66-son', 'valyuta',
     "VM qarori: Jismoniy shaxslar tomonidan naqd milliy va chet el valyutasini olib kirish-olib chiqish tartibi (66-son)",
     'https://lex.uz/uz/docs/-3527855'),
    ('5. 814 ajratilgan.docx', 'VMQ 814-son', "yashil-qizil yo'laklar",
     "VM qarori: O'tkazish punktlarida ikki yo'lakli va masofaviy bojxona nazorati tizimi (814-son)",
     'https://lex.uz/uz/docs/-3376313'),
    ('6. 2606 ajratilgan.docx', 'DBQ 2606-son', "yo'lovchi deklaratsiyasi",
     "DBQ qarori: Yo'lovchi bojxona deklaratsiyasini to'ldirish va rasmiylashtirish tartibi to'g'risidagi yo'riqnoma (2606-son)",
     'https://lex.uz/uz/docs/-2416332'),
    ('7. PF-104 ajratilgan.docx', 'PF-104', 'zargarlik buyumlari',
     "Prezident farmoni: Zargarlik buyumlari sohasini rivojlantirish (PF-104)",
     'https://lex.uz/uz/docs/-6162956'),
    ('8. PQ-4508 07.11.2019.docx', 'PQ-4508', 'shaxsiy ehtiyoj tovarlari',
     "Prezident qarori: Jismoniy shaxslar tomonidan shaxsiy ehtiyojlari uchun tovarlarni olib o'tish tartibi (PQ-4508)",
     'https://lex.uz/uz/docs/-4594346'),
    ('9.700 ajratilgan.docx', 'VMQ 700-son', 'bojxona tartib-taomillari',
     "VM qarori: Bojxona sohasidagi ayrim tartib-taomillarni takomillashtirish (700-son)",
     'https://lex.uz/uz/docs/-4508482'),
]

XLSX = 'Лист Microsoft Excel.xlsx'

MAX_CHUNK = 1400   # belgidan uzun bo'laklar bo'linadi
MIN_CHUNK = 60     # bundan qisqa "yetim" bo'laklar oldingisiga qo'shiladi

MODDA_RE = re.compile(r'^(\d+(?:–|—|-)?\d*-modda)\.?\s*(.*)', re.IGNORECASE)
BAND_RE = re.compile(r'^(\d+)\.\s+\S')
ILOVA_RE = re.compile(r'(\d+-ILOVA|\bILOVA\b)\s*$')


def doc_blocks(path: Path):
    """docx dan matn bloklari: xatboshilar va jadvallar HUJJATDAGI TARTIBDA
    (jadval o'z ilovasi/bandi ichida qolishi uchun body elementlari bo'ylab
    yuriladi)."""
    from docx.table import Table
    from docx.text.paragraph import Paragraph
    d = docx.Document(str(path))
    blocks = []
    for el in d.element.body.iterchildren():
        if el.tag.endswith('}p'):
            t = Paragraph(el, d).text.strip().replace('﻿', '')
            if t:
                blocks.append(('p', t))
        elif el.tag.endswith('}tbl'):
            tb = Table(el, d)
            rows = []
            for r in tb.rows:
                cells = [c.text.strip().replace('\n', ' ') for c in r.cells]
                # birlashgan kataklardagi takrorlarni olib tashlaymiz
                dedup = []
                for c in cells:
                    if not dedup or dedup[-1] != c:
                        dedup.append(c)
                cells = [c for c in dedup if c]
                if cells:
                    rows.append(' — '.join(cells))
            if rows:
                blocks.append(('table', '\n'.join(rows)))
    return blocks


def split_kodeks(blocks):
    """Bojxona kodeksi: N-modda sarlavhalari bo'yicha."""
    chunks, cur_title, cur = [], None, []
    for kind, t in blocks:
        m = MODDA_RE.match(t)
        if kind == 'p' and m:
            if cur_title and cur:
                chunks.append((cur_title, '\n'.join(cur)))
            cur_title = f"{m.group(1)}. {m.group(2)}".strip().rstrip('.')
            cur = []
        else:
            if cur_title is None:
                continue  # kodeks nomi/kirish
            cur.append(t)
    if cur_title and cur:
        chunks.append((cur_title, '\n'.join(cur)))
    return chunks


def split_qaror(blocks, code):
    """Qaror/farmon: raqamli bandlar va ILOVA bo'limlari bo'yicha."""
    chunks = []          # (sarlavha, matn)
    cur_title, cur = None, []
    header_done = False
    ilova_name = None

    def flush():
        nonlocal cur_title, cur
        if cur_title and cur:
            chunks.append((cur_title, '\n'.join(cur)))
        cur_title, cur = None, []

    for kind, t in blocks:
        if kind == 'table':
            # jadval joriy bo'lakka (odatda ilova) qo'shiladi
            if cur_title is None:
                cur_title = ilova_name or f"{code} jadval"
            cur.append(t)
            continue
        im = ILOVA_RE.search(t)
        if im:
            flush()
            ilova_name = f"{code}, {im.group(1).upper()}"
            cur_title = ilova_name
            continue
        bm = BAND_RE.match(t)
        if bm and not header_done:
            header_done = True
        if bm:
            flush()
            base = ilova_name or code
            cur_title = f"{base}, {bm.group(1)}-band"
            cur = [t]
        else:
            if cur_title is None:
                # hujjat sarlavhasi/kirish — birinchi mazmunli xatboshini
                # "umumiy" bo'lak sifatida saqlaymiz
                if header_done or len(t) < MIN_CHUNK:
                    continue
                cur_title = f"{code}, umumiy qoidalar"
                cur = [t]
                flush()
                continue
            cur.append(t)
    flush()
    return chunks


def split_long(title, text):
    """Uzun bo'lakni xatboshi chegarasida qismlarga bo'ladi."""
    if len(text) <= MAX_CHUNK:
        return [(title, text)]
    parts, cur, out = text.split('\n'), [], []
    for p in parts:
        if cur and len('\n'.join(cur)) + len(p) > MAX_CHUNK:
            out.append(cur)
            cur = []
        cur.append(p)
    if cur:
        out.append(cur)
    return [(title if i == 0 else f"{title} (davomi {i + 1})", '\n'.join(c))
            for i, c in enumerate(out)]


def build_kb():
    kb, n = [], 0
    for fname, code, tag, full, url in DOCS:
        path = SRC / fname
        if not path.exists():
            print(f"OGOHLANTIRISH: {fname} topilmadi, o'tkazib yuborildi")
            continue
        blocks = doc_blocks(path)
        label = f"{code} ({tag})" if tag else code
        raw = split_kodeks(blocks) if 'kodeksi' in fname.lower() else split_qaror(blocks, label)
        for title, text in raw:
            text = text.strip()
            if len(text) < MIN_CHUNK and len(title) < MIN_CHUNK:
                continue
            for t2, x2 in split_long(title, text):
                n += 1
                kb.append({
                    'id': f'KB-{n:03d}',
                    'manba': code if code in t2 else f'{code}, {t2}' if 'modda' in t2 else code,
                    'sarlavha': t2,
                    'matn': x2,
                    'hujjat': full,
                    'url': url,
                })
    return kb


def build_prohibited():
    wb = openpyxl.load_workbook(SRC / XLSX)
    ws = wb.worksheets[0]
    rows = list(ws.iter_rows(values_only=True))
    out = []
    for r in rows[1:]:
        if not r or not r[1]:
            continue
        out.append({
            'tovar': str(r[1]).strip(),
            'holati': str(r[2] or '').strip(),
            'huquqiy_manba': str(r[3] or '').strip(),
            'cheklov_ruxsat_istisno': str(r[4] or '').strip(),
            'vakolatli_organ_oqibat': str(r[5] or '').strip(),
            'url': str(r[6] or '').strip(),
        })
    return out


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    kb = build_kb()
    prohibited = build_prohibited()
    (OUT / 'kb.json').write_text(
        json.dumps(kb, ensure_ascii=False, indent=1), encoding='utf-8')
    (OUT / 'prohibited.json').write_text(
        json.dumps(prohibited, ensure_ascii=False, indent=1), encoding='utf-8')
    total = sum(len(c['matn']) for c in kb)
    print(f"kb.json: {len(kb)} bo'lak, {total} belgi")
    print(f"prohibited.json: {len(prohibited)} yozuv")
    for code in {c['manba'].split(',')[0] for c in kb}:
        cnt = sum(1 for c in kb if c['manba'].startswith(code))
        print(f'  {code}: {cnt}')


if __name__ == '__main__':
    main()

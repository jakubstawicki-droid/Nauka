"""Wspólne narzędzia: wyciąga linie z PDF-u wraz z rozmiarem i krojem czcionki."""
import pdfplumber

PROGRAM = 'materialy/Program przygotowawczy - egzamin ustny LSP Gersona.pdf'


def lines(path=PROGRAM, first=0, last=None):
    out = []
    with pdfplumber.open(path) as pdf:
        pages = pdf.pages[first:last]
        for off, p in enumerate(pages):
            for l in p.extract_text_lines(return_chars=True):
                c = l['chars'][0]
                size = round(c['size'], 1)
                font = c['fontname'].split('+')[-1]
                # numer strony w stopce
                if l['x0'] > 250 and l['text'].strip().isdigit():
                    continue
                out.append(dict(page=first + off + 1, size=size, font=font, x=round(l['x0']), text=l['text'].strip()))
    return out


def join(parts):
    """Skleja linie łamane w PDF-ie w jeden tekst."""
    s = ''
    for p in parts:
        p = p.strip()
        if not p:
            continue
        if not s:
            s = p
        elif s.endswith('-') and len(s) > 1 and s[-2].isalpha():
            s += p  # złożenia typu „magiczno-kultowej”
        else:
            s += ' ' + p
    return s


def find_page(needle, path=PROGRAM, start=0):
    with pdfplumber.open(path) as pdf:
        for i in range(start, len(pdf.pages)):
            if needle in (pdf.pages[i].extract_text() or ''):
                return i
    raise ValueError(needle)

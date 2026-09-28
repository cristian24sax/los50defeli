"""Conserva el diseño del PDF de referencia y añade el enlace al mapa."""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / '.pdf-tools'))
import pymupdf

MAP_URL = 'https://www.google.com/maps?q=-12.07380639957765,-76.97107796226963&z=19'
doc = pymupdf.open(ROOT / 'invitacion_pdf_felicitas_retama.pdf')
page = doc[0]
background = (250 / 255, 248 / 255, 244 / 255)
# Sample the actual paper color to blend the replacement with the original.
pix = page.get_pixmap()
background = tuple(c / 255 for c in pix.pixel(20, 20)[:3])
page.add_redact_annot(pymupdf.Rect(110, 530, 485, 700), fill=background)
page.apply_redactions()
ink = (74 / 255, 64 / 255, 54 / 255)
rose = (168 / 255, 111 / 255, 104 / 255)
gold = (185 / 255, 151 / 255, 103 / 255)
page.insert_font(fontname='InvitationSans', fontfile='C:/Windows/Fonts/calibri.ttf')
page.insert_font(fontname='InvitationItalic', fontfile='C:/Windows/Fonts/georgiai.ttf')
button = pymupdf.Rect(172, 569, 423, 607)
page.draw_rect(button, color=gold, fill=background, width=0.8)
page.insert_textbox(pymupdf.Rect(175, 581, 420, 602), 'VER UBICACIÓN EN EL MAPA',
                    fontname='InvitationSans', fontsize=11, color=rose, align=1)
page.insert_link({'kind': pymupdf.LINK_URI, 'from': button, 'uri': MAP_URL})
page.insert_textbox(pymupdf.Rect(125, 622, 470, 653),
                    'Toca el botón para ver cómo llegar\nal Local Comunal Matazango.',
                    fontname='InvitationItalic', fontsize=11, color=ink, align=1)
page.insert_textbox(pymupdf.Rect(160, 681, 435, 710), '¡Te esperamos!',
                    fontname='InvitationItalic', fontsize=17, color=rose, align=1)
# Also make the venue itself clickable.
page.insert_link({'kind': pymupdf.LINK_URI, 'from': pymupdf.Rect(393, 432, 541, 487), 'uri': MAP_URL})
doc.set_metadata({'title': '50 años de Felicitas · Invitación', 'subject': 'Invitación con ubicación clicable'})
doc.save(ROOT / 'invitacion_felicitas.pdf', garbage=4, deflate=True)
doc.close()
with pymupdf.open(ROOT / 'invitacion_felicitas.pdf') as result:
    assert len(result) == 1
    assert len([link for link in result[0].get_links() if link.get('uri') == MAP_URL]) == 2
    result[0].get_pixmap(matrix=pymupdf.Matrix(1.3, 1.3)).save(ROOT / 'invitacion_preview.png')
    print('PDF verificado: 1 página y 2 enlaces al mapa.')

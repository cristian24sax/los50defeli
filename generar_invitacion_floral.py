"""PDF floral con texto vectorial, enlaces y QR real de Google Maps."""
from pathlib import Path
import sys
ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / '.pdf-tools'))
import pymupdf as pdf
import qrcode

MAP = 'https://www.google.com/maps?q=-12.07380639957765,-76.97107796226963&z=19'
doc = pdf.open()
p = doc.new_page(width=600, height=900)
p.insert_image(p.rect, filename=str(ROOT / 'fondo_invitacion_floral.png'))
def color(h): return tuple(int(h[i:i+2],16)/255 for i in (0,2,4))
rose, ink, gold, blush = map(color, ['A84962','38251B','B88B50','F9EBE4'])
for name, file in [('serif','georgia.ttf'),('bold','georgiab.ttf'),('italic','georgiai.ttf'),('sans','calibri.ttf'),('sb','calibrib.ttf'),('script','Gabriola.ttf')]:
    p.insert_font(fontname=name,fontfile='C:/Windows/Fonts/'+file)
def text(s,y,size=16,font='serif',c=ink,x=40,w=520,h=65):
    remaining=p.insert_textbox(pdf.Rect(x,y,x+w,y+h),s,fontname=font,fontsize=size,color=c,align=1)
    assert remaining>=0,(s,remaining)
def line(x1,y1,x2,y2,c=gold,width=1): p.draw_line((x1,y1),(x2,y2),color=c,width=width)
def heart(x,y,size,c=rose):
    shape=p.new_shape()
    shape.draw_bezier((x,y+size*.3),(x-size*.75,y-size*.35),(x-size,y+size*.45),(x,y+size))
    shape.draw_bezier((x,y+size),(x+size,y+size*.45),(x+size*.75,y-size*.35),(x,y+size*.3))
    shape.finish(color=c,fill=c,closePath=True); shape.commit()
def rounded(rect,fill,stroke,r=.15): p.draw_rect(pdf.Rect(rect),color=stroke,fill=fill,width=1,radius=r)

p.draw_circle((300,64),30,color=gold,fill=blush,width=1.4)
heart(300,51,22)
line(205,64,252,64);line(348,64,395,64)
text('U N A  F E C H A  P A R A  R E C O R D A R',107,12,'sans',gold)
text('TE INVITO A CELEBRAR MIS',151,26,'bold')
text('50',190,68,'italic',rose,x=163,w=125,h=94)
text('AÑOS',205,51,'serif',ink,x=286,w=170,h=85)
text('Felicitas',277,42,'script',rose)
line(135,345,273,345);line(327,345,465,345);heart(300,337,11)
text('Acompáñame a celebrar este momento tan especial',368,16,'italic',rose)

# Three matching cards, with simple vector calendar, clock and location icons.
for x in (39,216,393): rounded((x,422,x+168,500),blush,color('EBD2C9'))
# calendar
p.draw_rect(pdf.Rect(52,445,78,470),color=rose,width=2)
line(52,452,78,452,rose,2)
for x in (58,72): line(x,441,x,448,rose,2)
for x,y in [(58,457),(65,457),(72,457),(58,464),(65,464)]: p.draw_rect(pdf.Rect(x,y,x+2,y+2),color=rose,fill=rose)
text('24 de\nOctubre',436,18,'bold',x=84,w=117,h=54)
# clock
p.draw_circle((239,459),14,color=rose,width=2)
line(239,450,239,459,rose,2);line(239,459,246,464,rose,2)
text('8:00 P. M.',446,18,'bold',x=258,w=120,h=40)
# location pin
sh=p.new_shape();sh.draw_bezier((422,477),(392,449),(410,435),(422,441));sh.draw_bezier((422,441),(440,445),(435,459),(422,477));sh.finish(color=rose,width=2);sh.commit()
p.draw_circle((420,451),4,color=rose,width=1.6)
text('Local\nMatazango',440,16,'bold',x=437,w=119,h=50)

button=pdf.Rect(122,525,478,582)
rounded(button,rose,rose,.5)
heart(156,542,15,color('FFFFFF'))
line(180,538,180,570,color('EDD7DD'))
text('VER UBICACIÓN EN MAPA',543,14,'sb',color('FFFFFF'),x=187,w=251,h=35)
line(449,547,456,554,color('FFFFFF'),2);line(456,554,449,561,color('FFFFFF'),2)
p.insert_link({'kind':pdf.LINK_URI,'from':button,'uri':MAP})
p.insert_link({'kind':pdf.LINK_URI,'from':pdf.Rect(393,422,561,500),'uri':MAP})

rounded((60,610,540,778),blush,blush,.16)
text('DESCUBRE MÁS',625,23,'serif')
qr=qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,box_size=1,border=4)
qr.add_data(MAP);qr.make(fit=True)
matrix=qr.get_matrix();unit=85/len(matrix);qx,qy=91,658
rounded((qx-4,qy-4,qx+89,qy+89),color('FFFFFF'),rose,.12)
sh=p.new_shape()
for row,values in enumerate(matrix):
    for col,black in enumerate(values):
        if black: sh.draw_rect(pdf.Rect(qx+col*unit,qy+row*unit,qx+(col+1)*unit,qy+(row+1)*unit))
sh.finish(color=None,fill=ink);sh.commit()
p.insert_link({'kind':pdf.LINK_URI,'from':pdf.Rect(qx,qy,qx+85,qy+85),'uri':MAP})
text('Escanea para ver el mapa',751,9,'sans',rose,x=69,w=131,h=20)
text('TAMBIÉN PODRÁS VISITAR\nLA PÁGINA WEB',658,13,'sb',rose,x=206,w=299,h=40)
text('Mira los recuerdos y déjale\nun mensaje lleno de cariño a Feli.',701,13,'sans',ink,x=206,w=299,h=42)
text('Enlace web disponible próximamente',750,10,'italic',rose,x=206,w=299,h=23)
text('¡Te esperamos!',797,30,'script',rose,x=99,w=402,h=60)
line(214,842,277,842);line(323,842,386,842);heart(300,834,11)
doc.set_metadata({'title':'50 años de Felicitas · Invitación floral','subject':'24 de Octubre · 8:00 P. M. · Local Matazango'})
out=ROOT/'invitacion_felicitas_floral.pdf'
doc.save(out,garbage=4,deflate=True)
doc.close()
with pdf.open(out) as check:
    assert len(check)==1
    assert len(check[0].get_links())==3
    assert 'CONFIRMAR' not in check[0].get_text()
    check[0].get_pixmap(matrix=pdf.Matrix(1.4,1.4)).save(ROOT/'invitacion_floral_preview.png')
    print('Verificado: una página, texto legible y tres enlaces al mapa.')

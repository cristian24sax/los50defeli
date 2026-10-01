"""Invitación con marco floral, texto vectorial, mapa, web y QR."""
from pathlib import Path
import sys
ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / '.pdf-tools'))
import pymupdf as pdf
import qrcode
MAP = 'https://www.google.com/maps?q=-12.07380639957765,-76.97107796226963&z=19'
WEB = 'https://los50defeli.lat/'
def color(h): return tuple(int(h[i:i+2],16)/255 for i in (0,2,4))
paper,ink,rose,gold,leaf=map(color,['FCF9F3','493D34','A06F67','C5B18A','899078'])
doc=pdf.open();p=doc.new_page(width=540,height=810)
p.draw_rect(p.rect,color=paper,fill=paper)
p.insert_image(p.rect,filename=str(ROOT/'fondo_invitacion_floral.png'))
for name,file in [('serif','georgia.ttf'),('italic','georgiai.ttf'),('sans','calibri.ttf'),('script','Gabriola.ttf')]:
    p.insert_font(fontname=name,fontfile='C:/Windows/Fonts/'+file)
p.insert_font(fontname='sansbold',fontfile='C:/Windows/Fonts/calibrib.ttf')
def text(s,y,size=16,font='serif',c=ink,x=45,w=450,h=60):
    assert p.insert_textbox(pdf.Rect(x,y,x+w,y+h),s,fontname=font,fontsize=size,color=c,align=1)>=0,s
def line(x1,y1,x2,y2,c=gold): p.draw_line((x1,y1),(x2,y2),color=c,width=.65)
stem=p.new_shape();stem.draw_bezier((251,98),(260,82),(272,63),(290,52));stem.finish(color=leaf,width=.8);stem.commit()
for a,b,c in [((259,86),(245,81),(248,69)),((268,74),(266,60),(274,53)),((278,64),(293,66),(302,56))]:
    shape=p.new_shape();shape.draw_bezier(a,b,c,a);shape.finish(color=leaf,width=.7);shape.commit()
text('U N A  F E C H A  P A R A  R E C O R D A R',119,10,'sans',rose)
text('Te invito a celebrar mis',158,19)
text('50',187,99,'italic',rose,h=135)
text('A Ñ O S',307,12,'sans',rose)
text('Felicitas',325,52,'script',ink,h=105)
text('Acompáñame a celebrar\neste momento tan especial.',415,17,'italic',ink,h=55)
line(232,490,308,490)
text('24 de octubre de 2026',512,21)
text('7:00 p. m.  ·  Local Matazango',550,16)
map_button=pdf.Rect(116,582,424,624)
p.draw_rect(map_button,color=color('97565F'),fill=color('97565F'),radius=.5)
text('VER UBICACIÓN EN EL MAPA',595,14,'sansbold',(1,1,1),x=126,w=288,h=24)
p.insert_link({'kind':pdf.LINK_URI,'from':map_button,'uri':MAP})
line(66,637,474,637)
p.draw_rect(pdf.Rect(65,649,475,759),color=None,fill=paper,radius=.12)
qr=qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,box_size=1,border=4)
qr.add_data(WEB);qr.make(fit=True)
matrix=qr.get_matrix();unit=78/len(matrix);qx,qy=80,660
p.draw_rect(pdf.Rect(qx,qy,qx+78,qy+78),color=None,fill=(1,1,1))
shape=p.new_shape()
for row,values in enumerate(matrix):
    for col,black in enumerate(values):
        if black: shape.draw_rect(pdf.Rect(qx+col*unit,qy+row*unit,qx+(col+1)*unit,qy+(row+1)*unit))
shape.finish(color=None,fill=ink);shape.commit()
text('La invitación también está en la web',661,12,'sans',ink,x=174,w=286,h=25)
text('los50defeli.lat',686,22,'serif',rose,x=174,w=286,h=38)
text('Mira mis fotos y déjame unas palabras.\nToca el enlace o escanea el código.',722,11,'sans',ink,x=174,w=286,h=36)
p.insert_link({'kind':pdf.LINK_URI,'from':pdf.Rect(qx,qy,qx+78,qy+78),'uri':WEB})
p.insert_link({'kind':pdf.LINK_URI,'from':pdf.Rect(182,682,458,717),'uri':WEB})
text('¡Te esperamos!',770,15,'italic',rose,h=30)
doc.set_metadata({'title':'50 años de Felicitas · Invitación','subject':'24 de octubre de 2026 · 7:00 p. m. · Local Matazango'})
out=ROOT/'invitacion_felicitas_floral.pdf'
doc.save(out,garbage=4,deflate=True);doc.close()
with pdf.open(out) as check:
    assert len(check)==1
    links=[link.get('uri') for link in check[0].get_links()]
    assert links.count(WEB)==2 and links.count(MAP)==1
    assert '7:00 p. m.' in check[0].get_text().replace('\u00a0', ' ')
    check[0].get_pixmap(matrix=pdf.Matrix(1.5,1.5)).save(ROOT/'invitacion_floral_preview.png')
    print('Verificado: una página, 7 p. m., mapa y web clicables.')

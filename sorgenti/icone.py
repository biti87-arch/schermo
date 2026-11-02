"""Genera le icone dell'app (schermo del GM a tre ante d'ottone con un d20 arancione, su fondo marrone brace) per Android, Windows e web (AD6)."""
from PIL import Image, ImageDraw
import math, os
R=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
BR=(204,168,96,255); BR2=(150,118,58,255); CORNICE=(122,94,46,255); CORNICE2=(108,82,38,255)
D20=(196,89,17,255); D20C=(232,140,70,255); D20S=(130,56,10,255)
def sfondo(n):
    im=Image.new('RGBA',(n,n)); px=im.load(); c=n/2
    for y in range(n):
        for x in range(n):
            d=min(1,math.hypot(x-c,y-c)/(n*0.72))
            a=(84,54,30); b=(24,16,10)
            px[x,y]=tuple(int(a[i]*(1-d)+b[i]*d) for i in range(3))+(255,)
    return im
def primo_piano(n,sf=True):
    S=n*4; im=Image.new('RGBA',(S,S),(0,0,0,0)); dr=ImageDraw.Draw(im); s=S/1024
    K=0.8  # simbolo al 80%, centrato come nelle altre app
    P=lambda pts:[((512+(x-512)*K)*s,(512+(y-498)*K)*s) for x,y in pts]
    # schermo del GM a tre ante: centrale chiara, laterali più scure in prospettiva, ognuna con la cornice
    dr.polygon(P([(96,262),(344,206),(344,722),(96,790)]),fill=BR2)
    dr.polygon(P([(928,262),(680,206),(680,722),(928,790)]),fill=BR2)
    dr.rectangle(P([(344,206),(680,722)]),fill=BR)
    w=int(18*s*K)
    dr.rectangle(P([(386,250),(638,676)]),outline=CORNICE,width=w)
    dr.polygon(P([(140,296),(304,258),(304,686),(140,738)]),outline=CORNICE2,width=w)
    dr.polygon(P([(884,296),(720,258),(720,686),(884,738)]),outline=CORNICE2,width=w)
    # d20 arancione davanti, in basso a destra (icosaedro visto di fronte: esagono e faccia superiore)
    cx,cy,r=700,742,172
    H=[(cx+r*math.cos(math.radians(a)),cy+r*math.sin(math.radians(a))) for a in (-90,-30,30,90,150,210)]
    T=[(cx,cy-r*0.56),(cx+r*0.6,cy+r*0.40),(cx-r*0.6,cy+r*0.40)]
    dr.polygon(P(H),fill=D20); dr.polygon(P(T),fill=D20C)
    lw=int(11*s*K)
    for a,b in [(0,0),(0,1),(0,5),(1,1),(1,2),(1,3),(2,5),(2,4),(2,3)]:
        dr.line(P([T[a],H[b]]),fill=D20S,width=lw)
    dr.polygon(P(T),outline=D20S,width=lw); dr.polygon(P(H),outline=D20S,width=lw)
    return im.resize((n,n),Image.LANCZOS)
def icona(n,rotonda=False):
    im=sfondo(n); fg=primo_piano(n); im.alpha_composite(fg)
    if rotonda:
        m=Image.new('L',(n*4,n*4),0); ImageDraw.Draw(m).ellipse([0,0,n*4-1,n*4-1],fill=255)
        im.putalpha(m.resize((n,n),Image.LANCZOS))
    return im
def fg_adattivo(n):
    im=Image.new('RGBA',(n,n),(0,0,0,0)); f=primo_piano(int(n*0.62)); o=(n-f.size[0])//2
    im.alpha_composite(f,(o,o)); return im
def splash(w,h,scuro=False):
    im=Image.new('RGBA',(w,h),(21,18,14,255) if scuro else (240,235,226,255))
    f=primo_piano(int(min(w,h)*0.32)); im.alpha_composite(f,((w-f.size[0])//2,(h-f.size[1])//2)); return im
icona(1024).save(f'{R}/assets/icon-only.png'); fg_adattivo(1024).save(f'{R}/assets/icon-foreground.png')
sfondo(1024).save(f'{R}/assets/icon-background.png')
splash(2732,2732).save(f'{R}/assets/splash.png'); splash(2732,2732,True).save(f'{R}/assets/splash-dark.png')
icona(512).save(f'{R}/desktop/icon.png'); icona(192).save(f'{R}/www/icona.png')
res=f'{R}/android/app/src/main/res'
for d in os.listdir(res):
    p=os.path.join(res,d)
    for fn in os.listdir(p):
        fp=os.path.join(p,fn)
        if not fn.endswith('.png'): continue
        w,h=Image.open(fp).size
        if fn=='ic_launcher.png': icona(w).save(fp)
        elif fn=='ic_launcher_round.png': icona(w,True).save(fp)
        elif fn=='ic_launcher_foreground.png': fg_adattivo(w).save(fp)
        elif fn=='ic_launcher_background.png': sfondo(w).save(fp)
        elif fn=='splash.png': splash(w,h,'night' in d).save(fp)
print('ok')

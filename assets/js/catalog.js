/* Sapphire Scents: ingredient artwork and product catalogue */

const ART={
oud(u){return `<svg viewBox="0 0 100 100"><defs><linearGradient id="${u}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9a6a42"/><stop offset=".45" stop-color="#5e3519"/><stop offset="1" stop-color="#26130a"/></linearGradient>
<filter id="${u}f" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.035 0.42" numOctaves="3" seed="${u.length*7}"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .05  0 0 0 0 .02  1.8 0 0 0 -.62"/><feComposite in2="SourceGraphic" operator="in"/></filter></defs>
<g transform="rotate(-18 50 50)"><path d="M4 56 L12 40 L36 33 L70 27 L95 34 L97 48 L76 60 L40 69 L12 70 Z" fill="url(#${u}a)"/>
<path d="M4 56 L12 40 L36 33 L70 27 L95 34 L97 48 L76 60 L40 69 L12 70 Z" fill="#fff" filter="url(#${u}f)"/>
<path d="M12 40 L36 33 L70 27 L95 34 L80 40 L46 44 L18 48Z" fill="#c99566" opacity=".28"/>
<path d="M95 34 L97 48 L76 60 L80 40Z" fill="#1a0c05" opacity=".45"/>
<path d="M12 40 L36 33 L70 27 L95 34" stroke="#f1c79a" stroke-opacity=".35" stroke-width="1" fill="none"/></g></svg>`},
amber(u){return `<svg viewBox="0 0 100 100"><defs><radialGradient id="${u}a" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#fff0b8"/><stop offset=".28" stop-color="#f7b544"/><stop offset=".62" stop-color="#c8640c"/><stop offset="1" stop-color="#5e2402"/></radialGradient><filter id="${u}b"><feGaussianBlur stdDeviation="1.6"/></filter></defs>
<path d="M48 6 L74 12 L92 34 L90 62 L72 88 L42 95 L16 80 L8 52 L18 22 Z" fill="url(#${u}a)"/>
<path d="M48 6 L74 12 L92 34 L60 40 L30 30 L18 22Z" fill="#ffd98a" opacity=".35"/>
<path d="M60 40 L92 34 L90 62 L72 88 Z" fill="#7a3006" opacity=".35"/>
<circle cx="56" cy="58" r="3" fill="#fff4c8" opacity=".55"/><circle cx="40" cy="66" r="1.8" fill="#fff4c8" opacity=".5"/><circle cx="66" cy="70" r="1.4" fill="#fff4c8" opacity=".5"/>
<ellipse cx="36" cy="24" rx="12" ry="5" fill="#fff" opacity=".75" filter="url(#${u}b)" transform="rotate(-25 36 24)"/></svg>`},
rose(u){const pet=(r,n,rx,ry,off,g)=>Array.from({length:n},(_,i)=>`<ellipse cx="50" cy="${50-r}" rx="${rx}" ry="${ry}" fill="url(#${g})" stroke="#ff9fae" stroke-opacity=".25" stroke-width=".8" transform="rotate(${i*360/n+off} 50 50)"/>`).join('');
 return `<svg viewBox="0 0 100 100"><defs><radialGradient id="${u}p" cx=".5" cy=".9" r="1"><stop offset="0" stop-color="#5a0414"/><stop offset=".5" stop-color="#b0102c"/><stop offset="1" stop-color="#ef4a62"/></radialGradient><radialGradient id="${u}q" cx=".5" cy=".9" r="1"><stop offset="0" stop-color="#4a0310"/><stop offset=".6" stop-color="#c41834"/><stop offset="1" stop-color="#ff6d80"/></radialGradient><linearGradient id="${u}l"><stop offset="0" stop-color="#2f5a24"/><stop offset="1" stop-color="#6e9a3c"/></linearGradient></defs>
<path d="M50 70 C70 72 92 84 98 98 C80 96 62 88 50 70Z" fill="url(#${u}l)"/><path d="M50 70 C30 76 10 88 4 98 C24 96 40 88 50 70Z" fill="url(#${u}l)" opacity=".85"/>
${pet(22,6,20,26,0,u+'p')}${pet(14,5,15,20,30,u+'q')}${pet(7,4,10,13,10,u+'p')}
<path d="M50 50 m-5 0 a5 5 0 1 1 10 0 a4 4 0 1 1 -7 1" stroke="#3a020c" stroke-width="1.6" fill="none"/></svg>`},
jasmine(u){return `<svg viewBox="0 0 100 100"><defs><linearGradient id="${u}p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#f3ede0"/><stop offset="1" stop-color="#d8cdb2"/></linearGradient></defs>
<path d="M50 54 C58 66 70 80 86 96" stroke="#3d6a2a" stroke-width="3" fill="none"/><path d="M62 74 C72 66 84 66 92 70 C84 78 72 80 62 74Z" fill="#4f7d32"/>
${[0,72,144,216,288].map(a=>`<path d="M50 50 C40 36 41 12 50 4 C59 12 60 36 50 50Z" fill="url(#${u}p)" stroke="#cfc3a6" stroke-width=".6" transform="rotate(${a} 50 50)"/><path d="M50 46 C47 34 48 18 50 10" stroke="#e6dcc4" stroke-width="1" fill="none" transform="rotate(${a} 50 50)"/>`).join('')}
<circle cx="50" cy="50" r="5" fill="#f1d36a"/><circle cx="50" cy="50" r="2.2" fill="#b98b22"/></svg>`},
saffron(u){return `<svg viewBox="0 0 100 100"><defs><linearGradient id="${u}s" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffc46b"/><stop offset=".3" stop-color="#e2381d"/><stop offset="1" stop-color="#8a0b10"/></linearGradient></defs>
${[[-40,0],[-22,4],[-6,-3],[10,2],[26,-2],[42,3],[-30,8],[30,8]].map(([a,o],i)=>`<g transform="rotate(${a} 50 88)"><path d="M50 88 C${48+o} 64 ${54+o} 40 ${50+o} ${16+i*3}" stroke="url(#${u}s)" stroke-width="${2.2+(i%3)*.6}" stroke-linecap="round" fill="none"/><path d="M${50+o} ${16+i*3} l-3 -4 l6 0z" fill="#9a0d14"/></g>`).join('')}</svg>`},
vanilla(u){return `<svg viewBox="0 0 100 100"><defs><linearGradient id="${u}v" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b3519"/><stop offset=".5" stop-color="#2c160a"/><stop offset="1" stop-color="#120804"/></linearGradient></defs>
<path d="M8 86 C30 64 52 40 90 10 C94 12 95 15 93 17 C58 46 34 70 13 92 C9 92 7 90 8 86Z" fill="url(#${u}v)"/>
<path d="M20 94 C40 72 62 50 96 26 C99 29 99 32 97 34 C66 56 44 78 25 98 C21 98 19 97 20 94Z" fill="url(#${u}v)"/>
<path d="M14 84 C34 64 54 44 86 16" stroke="#8c5a30" stroke-width="1" fill="none" opacity=".7"/><path d="M24 92 C44 72 64 54 92 32" stroke="#8c5a30" stroke-width="1" fill="none" opacity=".6"/>
<g transform="translate(30 30)"><g fill="#f4ecc7" stroke="#d9cc94" stroke-width=".6">${[0,72,144,216,288].map(a=>`<ellipse cx="0" cy="-11" rx="6" ry="11" transform="rotate(${a})"/>`).join('')}</g><circle r="5" fill="#f0d870"/></g></svg>`},
cinnamon(u){const stick=(y,rot)=>`<g transform="rotate(${rot} 50 50)"><rect x="8" y="${y}" width="84" height="14" rx="3" fill="url(#${u}c)"/><path d="M10 ${y+4} H90" stroke="#5a260c" stroke-width=".9" opacity=".7"/><path d="M12 ${y+10} H88" stroke="#e1a066" stroke-width=".7" opacity=".5"/><ellipse cx="90" cy="${y+7}" rx="4" ry="7" fill="#6b3212"/><path d="M90 ${y+7} m0 -4 a4 4 0 1 1 -2 6 a2.5 2.5 0 1 1 2 -3" stroke="#c88a54" stroke-width="1" fill="none"/></g>`;
 return `<svg viewBox="0 0 100 100"><defs><linearGradient id="${u}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d48a4c"/><stop offset=".35" stop-color="#a5531f"/><stop offset=".8" stop-color="#6e3112"/><stop offset="1" stop-color="#4a1f09"/></linearGradient></defs>${stick(34,-12)}${stick(50,8)}</svg>`},
cocoa(u){return `<svg viewBox="0 0 100 100"><defs><linearGradient id="${u}t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a4f2e"/><stop offset="1" stop-color="#4a2210"/></linearGradient></defs>
<g transform="rotate(14 50 50)"><path d="M10 34 L60 18 L92 38 L44 56Z" fill="url(#${u}t)"/><path d="M10 34 L44 56 L44 82 L10 60Z" fill="#3b1a0b"/><path d="M44 56 L92 38 L92 64 L44 82Z" fill="#2a1207"/>
<path d="M27 26 L60 46 M44 21 L76 41 M28 46 L74 27" stroke="#5c2e17" stroke-width="2.4"/><path d="M14 35 L58 20 L70 28" stroke="#c98b62" stroke-width="1.2" fill="none" opacity=".55"/></g>
<g transform="translate(70 76) rotate(-30)"><ellipse rx="13" ry="8" fill="#5b2b16"/><path d="M-12 0 Q0 -3 12 0" stroke="#2c1208" stroke-width="1.5" fill="none"/><ellipse cx="-4" cy="-3" rx="4" ry="1.5" fill="#c2835a" opacity=".5"/></g></svg>`},
tonka(u){return `<svg viewBox="0 0 100 100"><defs><radialGradient id="${u}k" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#6a4128"/><stop offset=".6" stop-color="#2a150a"/><stop offset="1" stop-color="#0d0603"/></radialGradient></defs>
${[[50,36,-20],[44,60,10],[62,76,-35]].map(([x,y,r])=>`<g transform="translate(${x} ${y}) rotate(${r})"><ellipse rx="34" ry="10" fill="url(#${u}k)"/><path d="M-28 -2 Q-10 -6 6 -2 T28 -1 M-24 4 Q0 7 24 3" stroke="#7a5236" stroke-width="1.1" fill="none" opacity=".7"/></g>`).join('')}</svg>`},
musk(u){return `<svg viewBox="0 0 100 100"><defs><radialGradient id="${u}m" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#e7e0d2"/><stop offset="1" stop-color="#a99e88"/></radialGradient></defs>${[[46,48,30],[70,62,16],[28,70,13],[64,30,12]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${u}m)"/>`).join('')}</svg>`},
leather(u){return `<svg viewBox="0 0 100 100"><defs><linearGradient id="${u}l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a45a2c"/><stop offset=".6" stop-color="#6b3317"/><stop offset="1" stop-color="#3d1a0a"/></linearGradient></defs><path d="M8 28 Q50 6 92 22 Q86 52 90 80 Q48 96 12 82 Q18 54 8 28Z" fill="url(#${u}l)"/><path d="M17 33 Q50 15 83 28 Q78 52 81 74 Q48 88 20 76 Q25 54 17 33Z" fill="none" stroke="#efc08a" stroke-width="1.6" stroke-dasharray="4 3"/></svg>`},
vetiver(u){return `<svg viewBox="0 0 100 100">${Array.from({length:14},(_,i)=>`<path d="M50 6 C${40+i*1.5} 30 ${20+i*4.5} 60 ${10+i*6} 96" stroke="${i%2?'#a98a55':'#7d6236'}" stroke-width="2" fill="none" stroke-linecap="round"/>`).join('')}<rect x="42" y="2" width="16" height="10" rx="3" fill="#5d4424"/></svg>`},
patchouli(u){return `<svg viewBox="0 0 100 100"><defs><linearGradient id="${u}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6f9a46"/><stop offset="1" stop-color="#2a4718"/></linearGradient></defs><path d="M50 4C82 18 94 50 62 88C56 95 44 95 38 88C6 50 18 18 50 4Z" fill="url(#${u}g)"/><path d="M50 8L50 92M50 30L32 22M50 30L68 22M50 50L28 42M50 50L72 42M50 70L34 62M50 70L66 62" stroke="#1f3511" stroke-width="1.6" fill="none"/></svg>`},
almonds(u){return `<svg viewBox="0 0 100 100"><defs><linearGradient id="${u}n" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9a26a"/><stop offset=".6" stop-color="#9c5e2c"/><stop offset="1" stop-color="#5e3314"/></linearGradient></defs>${[[40,44,-30],[64,62,20]].map(([x,y,r])=>`<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 -28 C16 -18 18 10 0 28 C-18 10 -16 -18 0 -28Z" fill="url(#${u}n)"/><path d="M0 -24 C6 -10 6 8 0 22" stroke="#6e3c18" stroke-width="1" fill="none" opacity=".6"/></g>`).join('')}</svg>`},
tobacco(u){return `<svg viewBox="0 0 100 100"><defs><linearGradient id="${u}t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b07a3a"/><stop offset="1" stop-color="#5e3613"/></linearGradient></defs><path d="M50 3C84 22,92 62,50 97C8 62,16 22,50 3Z" fill="url(#${u}t)"/><path d="M50 8L50 94M50 28L32 20M50 28L68 20M50 48L26 38M50 48L74 38M50 68L30 60M50 68L70 60" stroke="#4e2d0e" stroke-width="2" fill="none"/></svg>`},
balsam(u){return `<svg viewBox="0 0 100 100"><path d="M50 96C50 60,48 30,52 4" stroke="#3c2a14" stroke-width="3" fill="none"/>${[18,32,46,60,74].map((y,i)=>`<path d="M51 ${y}C${30-i*2} ${y-6},${24-i*2} ${y+8},${22-i} ${y+14}M51 ${y}C${72+i*2} ${y-6},${78+i*2} ${y+8},${80+i} ${y+14}" stroke="#2f5a3a" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('')}</svg>`},
frankincense(u){return `<svg viewBox="0 0 100 100"><defs><radialGradient id="${u}f" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fff3cf"/><stop offset=".6" stop-color="#e6cb85"/><stop offset="1" stop-color="#b8923e"/></radialGradient></defs>${[[32,40,17,13],[64,32,13,10],[58,64,19,14],[26,70,11,9]].map(([x,y,a,b])=>`<ellipse cx="${x}" cy="${y}" rx="${a}" ry="${b}" fill="url(#${u}f)"/>`).join('')}</svg>`},
myrrh(u){return `<svg viewBox="0 0 100 100"><defs><radialGradient id="${u}m" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#e98a5a"/><stop offset=".6" stop-color="#a3421c"/><stop offset="1" stop-color="#5c1d08"/></radialGradient></defs>${[[36,44,18,14],[66,36,13,11],[58,68,18,13],[28,72,11,9]].map(([x,y,a,b])=>`<ellipse cx="${x}" cy="${y}" rx="${a}" ry="${b}" fill="url(#${u}m)"/>`).join('')}<ellipse cx="32" cy="38" rx="5" ry="3" fill="#ffd2b0" opacity=".6"/></svg>`},
incense(u){return `<svg viewBox="0 0 100 100"><path d="M30 96L62 30" stroke="#6b3a1c" stroke-width="4" stroke-linecap="round"/><path d="M62 30L66 22" stroke="#d0461c" stroke-width="4" stroke-linecap="round"/><path d="M67 20C60 12 76 8 68 0M70 22C80 14 66 8 78 2" stroke="#c9c2b6" stroke-width="2" fill="none" opacity=".8"/><path d="M50 96L82 40" stroke="#6b3a1c" stroke-width="3.5" stroke-linecap="round" opacity=".8"/></svg>`},
citrus(u,c1='#f59a1a',c2='#ffd27a'){let w='';for(let i=0;i<10;i++){const a=(i*36)*Math.PI/180,b=(i*36+30)*Math.PI/180;w+=`<path d="M50 50L${(50+37*Math.cos(a)).toFixed(1)} ${(50+37*Math.sin(a)).toFixed(1)}A37 37 0 0 1 ${(50+37*Math.cos(b)).toFixed(1)} ${(50+37*Math.sin(b)).toFixed(1)}Z" fill="${c2}"/>`}return `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="${c1}"/><circle cx="50" cy="50" r="42" fill="#fff3d6"/>${w}<circle cx="50" cy="50" r="4" fill="#fff3d6"/></svg>`},
orange(u){return ART.citrus(u,'#ea7a0c','#ffab3d')},
lemon(u){return ART.citrus(u,'#e8ae17','#f8d54a')},
bergamot(u){return ART.citrus(u,'#9cb52a','#e4e070')},
mango(u){return `<svg viewBox="0 0 100 100"><defs><radialGradient id="${u}g" cx=".35" cy=".35" r=".8"><stop offset="0" stop-color="#ffd24a"/><stop offset=".55" stop-color="#f59a1a"/><stop offset="1" stop-color="#c2410c"/></radialGradient></defs><path d="M48 12C78 10 94 40 84 66C74 92 34 96 18 74C4 54 18 14 48 12Z" fill="url(#${u}g)"/><path d="M48 12C50 6 56 3 62 4C58 8 54 10 48 12Z" fill="#4f7d32"/><ellipse cx="36" cy="32" rx="9" ry="5" fill="#fff" opacity=".35" transform="rotate(-30 36 32)"/></svg>`},
strawberry(u){return `<svg viewBox="0 0 100 100"><defs><radialGradient id="${u}s" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#ff6b6b"/><stop offset=".6" stop-color="#d11a2a"/><stop offset="1" stop-color="#7a0a12"/></radialGradient></defs><path d="M50 94C22 74 14 42 26 28C38 16 62 16 74 28C86 42 78 74 50 94Z" fill="url(#${u}s)"/>${[[38,40],[50,36],[62,40],[34,54],[46,52],[58,52],[66,56],[42,66],[54,66],[48,78]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="1.6" ry="2.4" fill="#ffe08a"/>`).join('')}<path d="M30 26L42 20L50 8L58 20L70 26L56 28L50 24L44 28Z" fill="#3f7d2a"/></svg>`},
peach(u){return `<svg viewBox="0 0 100 100"><defs><radialGradient id="${u}p" cx=".35" cy=".35" r=".8"><stop offset="0" stop-color="#ffe0b8"/><stop offset=".5" stop-color="#ffa36b"/><stop offset="1" stop-color="#d9534f"/></radialGradient></defs><circle cx="50" cy="56" r="38" fill="url(#${u}p)"/><path d="M50 20C46 40 46 70 50 94" stroke="#c4553f" stroke-width="2" fill="none" opacity=".5"/><path d="M52 20C60 8 74 6 82 10C74 18 62 22 52 20Z" fill="#4f7d32"/></svg>`},
honey(u){return `<svg viewBox="0 0 100 100"><defs><linearGradient id="${u}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd36b"/><stop offset="1" stop-color="#c47a0c"/></linearGradient></defs>${[[30,34],[56,34],[43,56],[69,56],[30,78],[56,78]].map(([x,y])=>`<path d="M${x} ${y-13}L${x+12} ${y-6}L${x+12} ${y+6}L${x} ${y+13}L${x-12} ${y+6}L${x-12} ${y-6}Z" fill="url(#${u}h)" stroke="#a35f06" stroke-width="1.5"/>`).join('')}</svg>`},
sandalwood(u){return `<svg viewBox="0 0 100 100"><defs><linearGradient id="${u}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8c595"/><stop offset=".5" stop-color="#c49564"/><stop offset="1" stop-color="#8a6036"/></linearGradient></defs>${[[24,-14],[44,6],[64,-4]].map(([y,r])=>`<g transform="rotate(${r} 50 50)"><rect x="8" y="${y}" width="84" height="15" rx="3" fill="url(#${u}w)"/><path d="M12 ${y+5}H88M14 ${y+10}H84" stroke="#9a6b3e" stroke-width=".9" opacity=".7"/></g>`).join('')}</svg>`},
mint(u){return `<svg viewBox="0 0 100 100"><defs><linearGradient id="${u}n" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fc96a"/><stop offset="1" stop-color="#2f7a32"/></linearGradient></defs><path d="M50 96V30" stroke="#2f5a24" stroke-width="3"/>${[[30,-35],[50,35],[70,-30]].map(([y,r])=>`<path d="M50 ${y}C30 ${y-18} 14 ${y-6} 12 ${y+6}C26 ${y+14} 42 ${y+8} 50 ${y}Z" fill="url(#${u}n)" transform="rotate(${r>0?180:0} 50 ${y}) "/>`).join('')}<path d="M50 30C38 14 44 4 50 2C56 4 62 14 50 30Z" fill="url(#${u}n)"/></svg>`},
thyme(u){return `<svg viewBox="0 0 100 100"><path d="M20 92C40 60 58 36 84 8" stroke="#4d5d2a" stroke-width="3" fill="none"/>${[[30,76],[38,64],[46,52],[54,42],[62,32],[70,24],[78,14]].map(([x,y],i)=>`<ellipse cx="${x+(i%2?7:-7)}" cy="${y}" rx="7" ry="4" fill="${i%2?'#6f8a3a':'#5a7430'}" transform="rotate(${i%2?30:-30} ${x} ${y})"/>`).join('')}</svg>`},
milkbroom(u){return `<svg viewBox="0 0 100 100"><path d="M50 96C50 70 46 40 40 14M50 70C60 50 70 36 80 24M50 60C40 46 30 36 20 30" stroke="#5a7a3a" stroke-width="2.5" fill="none"/>${[[40,14],[44,24],[38,34],[80,24],[72,32],[66,40],[20,30],[28,36],[34,44],[46,8],[86,18],[14,24]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4.5" fill="#fbf7ec" stroke="#d9cfb3" stroke-width=".8"/>`).join('')}</svg>`},
tea(u,c='#3a2a14'){return `<svg viewBox="0 0 100 100">${[[30,40,-30],[60,34,20],[46,62,-10],[70,64,40],[28,70,10]].map(([x,y,r])=>`<path d="M${x-16} ${y}C${x-6} ${y-10} ${x+6} ${y-10} ${x+16} ${y}C${x+6} ${y+8} ${x-6} ${y+8} ${x-16} ${y}Z" fill="${c}" transform="rotate(${r} ${x} ${y})"/>`).join('')}</svg>`},
coffee(u){return `<svg viewBox="0 0 100 100"><defs><radialGradient id="${u}c" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#8a5a34"/><stop offset="1" stop-color="#2a140a"/></radialGradient></defs>${[[34,40,-30],[64,38,25],[48,66,5]].map(([x,y,r])=>`<g transform="translate(${x} ${y}) rotate(${r})"><ellipse rx="16" ry="21" fill="url(#${u}c)"/><path d="M0 -18C-6 -6 6 6 0 18" stroke="#1a0b04" stroke-width="2.5" fill="none"/></g>`).join('')}</svg>`},
banana(u){return `<svg viewBox="0 0 100 100"><defs><linearGradient id="${u}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff07a"/><stop offset=".6" stop-color="#f5c518"/><stop offset="1" stop-color="#c79400"/></linearGradient></defs><path d="M14 30C20 70 60 92 90 74C92 70 90 68 86 68C58 78 30 60 24 26C22 20 14 22 14 30Z" fill="url(#${u}b)"/><path d="M14 30L10 22L18 20Z" fill="#5a4214"/><path d="M90 74L96 76L92 70Z" fill="#3a2a10"/></svg>`},
fruity(u){return `<svg viewBox="0 0 100 100"><g transform="translate(-10 -6) scale(.62)">${ART.strawberry(u+'a').replace(/<\/?svg[^>]*>/g,'')}</g><g transform="translate(40 30) scale(.6)">${ART.peach(u+'b').replace(/<\/?svg[^>]*>/g,'')}</g><g transform="translate(14 44) scale(.52)">${ART.orange(u+'c').replace(/<\/?svg[^>]*>/g,'')}</g></svg>`},
drop(u){return `<svg viewBox="0 0 100 100"><defs><linearGradient id="${u}d" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd27a"/><stop offset=".6" stop-color="#FF9E0D"/><stop offset="1" stop-color="#a85a00"/></linearGradient></defs><path d="M50 6C66 34 80 50 80 66A30 30 0 0 1 20 66C20 50 34 34 50 6Z" fill="url(#${u}d)"/><ellipse cx="40" cy="62" rx="6" ry="11" fill="#fff" opacity=".35"/></svg>`},
};
const ALIAS={citrus:'orange',ambergris:'musk','milk broom':'milkbroom','woody notes':'sandalwood',agarwood:'oud','tonka beans':'tonka','black tea':'tea','white tea':'whitetea','white oud':'oud',oudh:'oud',almond:'almonds'};
ART.whitetea=u=>ART.tea(u,'#9a8a5a');
let U=0;
function art(k){k=(k||'').toLowerCase();k=ALIAS[k]||k;const f=ART[k]||ART.drop;return f('i'+(++U)+'_')}
function hasArt(k){k=(k||'').toLowerCase();k=ALIAS[k]||k;return !!ART[k]}

/* ---------------- Sapphire Scents catalogue ----------------
   Perfume names, prices, notes and stories: shopsapphirescents.com and the brand's posts.
   Diffuser prices: shopsapphirescents.com/product-category/diffusers. Specs: manufacturer sheets. */
const IMG={amber:'images/crown-amber.webp',jag:'images/crown-jagaban.webp',hero:'images/hero-bottle.webp',flower:'images/flower.webp'};

const PERFUMES=[
 {id:'ace',name:'Ace',price:60000,notes:['Oud','Vanilla','Cinnamon','Almonds'],family:'Sweet oud',tags:['sweet'],a:'#3a3a44',pair:'Vanilla & Cinnamon',
  story:'A fresh, sweet take on oud built with vanilla, cinnamon and almonds. Made for the evenings, and for days when you are exceptionally happy.'},
 {id:'arewa',name:'Arewa',price:60000,notes:['Mango','Strawberry'],family:'Fruity',tags:['sweet','fruity'],a:'#c2410c',pair:'Mango & Strawberry',
  story:'“Arewa” means beautiful one in Yoruba. A blend of mango and strawberries for people who love delicious scents, and a head-turner wherever it goes.'},
 {id:'asiko',name:'Asiko',price:100000,notes:['Oud','Amber','Leather','Tonka Beans'],family:'Leather oud',tags:['new','woody'],a:'#7a3324',pair:'Oud & Amber',
  story:'“Asiko” means time in Yoruba. This fragrance was curated as an encouragement to everyone in their waiting period. Your time will come.'},
 {id:'cherub',name:'Cherub',price:100000,notes:['Oud','Honey','Tobacco'],family:'Honeyed oud',tags:['sweet','woody'],a:'#8a5a1a',pair:'Honey & Tobacco',
  story:'Inspired by the cherubim, the four-faced angels who stand in the presence of God. Anything that close to God must carry an extraordinary aura. This is the aura of heaven.'},
 {id:'chocolate',name:'Chocolate',price:60000,notes:['Cocoa','Oud'],family:'Gourmand oud',tags:['best','sweet'],a:'#5a2614',pair:'Cocoa & Oud',
  story:'Born from a lifelong love of chocolate: a sexy cocoa fragrance with a tinge of oud. One of the house best sellers.'},
 {id:'dejavu',name:'Dejavu',price:100000,notes:['Oud','Balsam','Patchouli'],family:'Woody',tags:['woody'],a:'#4a3a24',pair:'Balsam & Patchouli',
  story:'A woody fragrance of oud, balsam and patchouli, made to mark a milestone for the house: a million dollars in perfume sold.'},
 {id:'desire',name:'Desire',price:60000,notes:['Vanilla','Oud','Musk'],family:'Sweet musk',tags:['sweet'],a:'#9a5a6a',pair:'Vanilla & Musk',
  story:'Created when the founder realised the house had too few sweet fragrances for women. Warm, sweet and made to leave a lasting impression.'},
 {id:'enigma',name:'Enigma',price:60000,notes:['Oud','Citrus','Amber','Vanilla'],family:'Citrus amber',tags:['fresh'],a:'#6a4a8a',pair:'Citrus & Amber',
  story:'When its original maker discontinued it, Sapphire Scents secured the fragrance oil and added its own signature touch. A wonder in a bottle.'},
 {id:'epiphany',name:'Epiphany',price:75000,notes:['Oud','Orange','Patchouli','Jasmine'],family:'Bright floral',tags:['fresh','floral'],a:'#c4661a',pair:'Orange & Jasmine',
  story:'A brainwave that stands alone in the collection. Made with very little oud, so it feels lighter and less mysterious than the rest of the house.'},
 {id:'goddess',name:'Goddess',price:100000,notes:['Oud','Rose','Vanilla','Jasmine'],family:'Floral oud',tags:['floral'],a:'#7a2350',pair:'Rose & Jasmine',
  story:'Every woman is a goddess. An homage to feminine beauty, allure and divinity, built on soft rose and jasmine over warm oud.'},
 {id:'gq',name:'GQ',price:60000,notes:['Oud','Musk'],family:'Musky oud',tags:['woody'],a:'#2a3a5a',pair:'Oud & Musk',
  story:'Made for the perfect gentleman. A tinge of oud and the presence of musk make it a favourite with men, ideal for a first date or meeting her father.'},
 {id:'grandeur',name:'Grandeur',price:100000,notes:['Oud','Rose','Vetiver','Jasmine'],family:'Floral oud',tags:['best','floral'],a:'#8c7330',pair:'Rose & Vetiver',
  story:'Reworked after feedback from clients and distributors to be deeper and more intense. A best seller, and one of five on every Sapphire lover’s shelf.'},
 {id:'ivy',name:'Ivy',price:100000,notes:['Oud','Sandalwood','Musk','Vanilla','Myrrh'],family:'Sweet woody',tags:['woody','sweet'],a:'#8a1d4a',pair:'Sandalwood & Myrrh',
  story:'The founder counts Ivy among his finest work. A sweet and woody unisex fragrance, ideal for events.'},
 {id:'jagaban',name:'Jagaban',price:100000,img:'jag',notes:['Incense','Mint','Cinnamon','Oud','Amber','Woody Notes'],pyramid:{top:['Incense','Mint'],heart:['Cinnamon','Oud'],base:['Amber','Woody Notes']},family:'Spiced oud',tags:['best','woody'],a:'#8a4a16',pair:'Incense & Cinnamon',
  story:'Made to be a truly Nigerian fragrance, and the founder’s biggest surprise. A best seller, now featured on Fragrantica.'},
 {id:'kadara',name:'Kadara',price:100000,notes:['Saffron','Jasmine','Oud'],family:'Spiced floral oud',tags:['floral'],a:'#3a5d66',pair:'Saffron & Jasmine',
  story:'Kadara is the Yoruba word for destiny. You don’t decide your destiny, you discover it. For men and women convinced they are on earth for a divine purpose.'},
 {id:'lust',name:'Lust',price:100000,notes:['Oud','Amber','Musk','Patchouli','Vanilla'],family:'Sensual amber',tags:['sweet'],a:'#0f4a4e',pair:'Amber & Musk',
  story:'The house’s most sensual fragrance, recommended for honeymoon nights and any evening you want to give your partner a special treat.'},
 {id:'oud-magnifique',name:'Oud Magnifique',price:75000,notes:['Oud','Musk','Rose'],family:'Rose oud',tags:['best','floral'],a:'#2f5157',pair:'Oud & Rose',
  story:'A “commercial oud”: an oud blend made to smell good to African noses while keeping its originality. One of the house’s biggest sellers.'},
 {id:'opulence',name:'Opulence',price:100000,notes:['Oud','Saffron','Patchouli','Musk','Rose'],family:'Spiced rose oud',tags:['floral','woody'],a:'#6a1a2a',pair:'Saffron & Rose',
  story:'One of the fragrances the house improved as its collection of rare oils grew. Rich saffron and rose over patchouli and musk.'},
 {id:'ruby',name:'Ruby',price:60000,notes:['Oud','Rose'],family:'Rose oud',tags:['floral'],a:'#b0123a',pair:'Oud & Rose',
  story:'A perfect marriage of oriental and French: woody and rosy, light and soft. Inspired by the founder’s first oud and rose blend, and named after his first daughter.'},
 {id:'saki',name:'Saki',price:100000,notes:['Frankincense','Patchouli','Sandalwood'],family:'Resinous',tags:['woody'],a:'#5a24b0',pair:'Frankincense & Sandalwood',
  story:'“Saki” means royalty, honour and favour in Yoruba. Created in the most trying period for the business, as a reminder of the grace that followed.'},
 {id:'salsa',name:'Salsa',price:60000,notes:['Oud','Thyme'],family:'Aromatic oud',tags:['woody'],a:'#5a6a2a',pair:'Oud & Thyme',
  story:'For nights out, weddings and birthdays. Mysterious, sweet and classy: it tells the room you deserve respect.'},
 {id:'sapphire-no-48',name:'Sapphire No. 48',price:100000,notes:['Oud','Milk Broom'],family:'Soft oud',tags:['best','woody'],a:'#3a4a7a',pair:'Oud & Milk Broom',
  story:'Created while preparing for a store opening. Tested on the founder’s wrist, it was still oozing after 24 hours. It became the house’s best seller.'},
 {id:'sapphire-no-5',name:'Sapphire No. 5',price:60000,notes:['Oud','Lemon','Jasmine'],family:'Citrus floral oud',tags:['fresh','floral'],a:'#b08a2a',pair:'Lemon & Jasmine',
  story:'The perfect fusion of oriental and French perfumery, created to suit African climates.'},
 {id:'sapphire-no-7',name:'Sapphire No. 7',price:60000,notes:['Oud','Ambergris','Musk'],family:'Musky amber',tags:['woody'],a:'#5a6a8a',pair:'Ambergris & Musk',
  story:'The first choice of alpha males. If success had a scent, it would be Sapphire No. 7.'},
 {id:'seraph',name:'Seraph',price:60000,notes:['Oud','Amber','Jasmine','Frankincense','Vanilla'],family:'Amber resinous',tags:['woody','sweet'],a:'#3a5fe0',pair:'Amber & Frankincense',
  story:'Inspired by the six-winged seraphim who stand in God’s presence. Anything that close to God should smell this good.'},
 {id:'siren',name:'Siren',price:100000,notes:['Bergamot','Orange','Peach','Sandalwood'],family:'Fruity citrus',tags:['fresh','fruity'],a:'#c4553f',pair:'Peach & Bergamot',
  story:'A siren is a seductive, irresistible woman: she shows up and all your worries disappear. An all-time favourite with women across Africa.'},
 {id:'symphony',name:'Symphony',price:60000,notes:['Oud','Balsam'],family:'Smoky oud',tags:['woody'],a:'#6d5590',pair:'Oud & Balsam',
  story:'A fine blend of oud and balsam: very smoky, very musky and irresistible, yet sweet and refreshing on every skin type.'},
];
PERFUMES.forEach(p=>{p.type='perfume';p.img=p.img||'amber';p.kind='Perfume'});

const REFILL_NOTES={arewa:'Mango',asiko:'Amber',banana:'Banana','black-tea':'Black Tea',bespoke:'Drop',cherub:'Honey','chocolate-r':'Cocoa',coffee:'Coffee',frankincense:'Frankincense',fruity:'Fruity','jagaban-r':'Incense',jasmine:'Jasmine',lemon:'Lemon',mango:'Mango',myrrh:'Myrrh',oud:'Oud',patchouli:'Patchouli','saki-r':'Frankincense','sapphire-no-5-r':'Jasmine','seraph-r':'Amber','siren-r':'Peach',strawberry:'Strawberry',vanilla:'Vanilla','white-oud':'Oud','white-tea':'White Tea'};
const REFILL_PHOTOS=['myrrh','white-oud','cherub','frankincense','siren','fruity','strawberry','banana','sapphire-no-5','black-tea','seraph','lemon','patchouli','asiko','coffee','saki','mango','jasmine','bespoke'];
const REFILLS=[
 ['arewa','Arewa',150000,'arewa'],['asiko','Asiko',150000,'asiko'],['banana','Banana',150000],['bespoke','Bespoke',200000],['black-tea','Black Tea',150000],
 ['cherub','Cherub',150000,'cherub'],['chocolate-r','Chocolate',150000,'chocolate'],['coffee','Coffee',150000],['frankincense','Frankincense',200000],['fruity','Fruity',150000],
 ['jagaban-r','Jagaban',150000,'jagaban'],['jasmine','Jasmine',150000],['lemon','Lemon',150000],['mango','Mango',150000],['myrrh','Myrrh',200000],
 ['oud','Oud',150000],['patchouli','Patchouli',200000],['saki-r','Saki',150000,'saki'],['sapphire-no-5-r','Sapphire No. 5',150000,'sapphire-no-5'],['seraph-r','Seraph',150000,'seraph'],
 ['siren-r','Siren',150000,'siren'],['strawberry','Strawberry',150000],['vanilla','Vanilla',150000],['white-oud','White Oud',150000],['white-tea','White Tea',150000],
].map(([rid,name,price,perfume])=>{
  const id=rid.replace(/-r$/,'')+'-refill';
  const pf=perfume&&PERFUMES.find(p=>p.id===perfume);
  const note=REFILL_NOTES[rid];
  let story;
  if(pf) story=`The ${pf.name} scent as a diffuser oil, so your home, office or store carries the same signature as the perfume: ${pf.notes.join(', ').toLowerCase()}.`;
  else if(rid==='bespoke') story='A scent blended for your space. Tell the Sapphire team the mood you want for your home, hotel or business and they will advise on the blend.';
  else story=`${name} scent oil for diffusers. A single, clear note to fill a room, an office or a store, from the house known for blending Moroccan roses, Ethiopian frankincense and European lavender.`;
  const base=rid.replace(/-r$/,'');
  const photo=REFILL_PHOTOS.includes(base)?`images/refills/${base}.webp`:null;
  return {id,name,price,type:'refill',kind:'Scent refill',note,perfume:pf?pf.id:null,story,a:pf?pf.a:'#8a6a2a',family:pf?'Signature scent':'Single note',photo,thumb:photo?photo.replace('.webp','-sm.webp'):null};
});

const DIFFUSERS=[
 {id:'i-1',name:'i-1 Diffuser',short:'i-1',price:250000,tagline:'Smart desktop diffuser with clock and display',
  images:['images/diffusers/i1-desk.webp','images/diffusers/i1-front.webp'],
  summary:'A compact smart aroma diffuser shaped like a classic perfume bottle. Beyond scenting the room it keeps time, wakes you with an alarm, reads the temperature and humidity, and lights the way at night with a radar-sensing night light.',
  body:'Choose the plug-in wall version with interchangeable plugs, or the version with a 1,200 mAh rechargeable battery that you can place anywhere. Set the working hours and scent concentration across the day from the buttons or the Bluetooth app, and infrared oil detection tells you when it is time for a refill.',
  features:['Button and Bluetooth app control','Smart interactive display with clock and alarm','Temperature and humidity monitoring','Radar-sensing night light','Infrared oil-level detection and leak-proof design','Custom 24-hour working time and scent concentration','Plug-in wall-mounted or 1,200 mAh rechargeable battery versions'],
  specs:[['Size','91 × 70 × 140 mm'],['Oil capacity','100 ml'],['Coverage','33–100 m³ (1,177–3,531 ft³)'],['Power','4 W, DC 5 V'],['Weight','0.45 kg'],['Noise','≤ 40 dBA'],['Oil use','0.68 g per hour'],['Control','Buttons, Bluetooth app']],
  bestFor:'Bedrooms, desks, bathrooms and small offices'},
 {id:'i-3',name:'i-3 Diffuser',short:'i-3',price:350000,tagline:'Perfume-bottle diffuser for living rooms and offices',
  images:['images/diffusers/i3-concrete.webp','images/diffusers/i3-lounge.webp','images/diffusers/i3-front.webp'],
  summary:'Inspired by the shape of a perfume bottle, the i-3 is an elegant, minimalist diffuser for larger rooms. A high-definition display shows the time, working mode, duration and humidity, and a built-in alarm keeps your aromatic moments on schedule.',
  body:'Use it as a desktop piece or mount it on the wall. The wall version comes with an interchangeable socket and an anti-theft wall plate for easy, secure installation. Whether at home, in the office or at a spa, it quietly fills the space with a lasting scent.',
  features:['Button, Wi-Fi and Bluetooth remote control','Desktop or wall-mounted styles','High-definition display: time, mode, duration, humidity','Built-in alarm','Built-in leak-proof function','Anti-theft wall plate on the wall-mounted version'],
  specs:[['Size','161 × 84 × 199 mm'],['Oil capacity','300 ml'],['Coverage','266–800 m³ (9,417–28,252 ft³)'],['Power','7.5 W, DC 5 V'],['Weight','1 kg'],['Noise','≤ 40 dBA'],['Oil use','3.93 g per hour'],['Control','Buttons, Wi-Fi, Bluetooth app']],
  bestFor:'Living rooms, offices, spas and reception areas'},
 {id:'i-5',name:'i-5 Diffuser',short:'i-5',price:650000,tagline:'500 ml air-pump diffuser, wall or tabletop',
  images:['images/diffusers/i5-white.webp','images/diffusers/i5-wall-black.webp','images/diffusers/i5-parts.webp'],
  summary:'A large-capacity air-pump diffuser that turns scent oil into a fine, dry mist with no water and no heat. Its 500 ml oil bottle runs for long stretches between refills, making it ideal for homes, boutiques and offices that want a constant signature scent.',
  body:'Mount it on the wall with the two screw holes on the back or stand it on a shelf on its fitted foot pads. Control it from the touch buttons or the mobile app over Bluetooth and dual-band Wi-Fi, with seven mist levels and seven timer settings up to 24 hours. A security lock on the atomizer cap keeps the oil in place.',
  features:['Waterless air-pump (cold-air) diffusion','500 ml oil bottle','Touch buttons, mobile app, Bluetooth and 2.4/5 GHz Wi-Fi','7 mist levels, from minimum to maximum','7 timer settings, up to 24 hours','Wall-mounted or tabletop, with foot pads fitted','Security lock on the atomizer cap','Black or white finish','All accessories included, with 1-year support'],
  specs:[['Oil capacity','500 ml'],['Diffusion','Air pump, waterless'],['Mist levels','7'],['Timer','Min, 1, 2, 4, 8, 12 and 24 hours'],['Mounting','Wall or tabletop'],['Finish','Black or white'],['Control','Touch buttons, app, Bluetooth, Wi-Fi'],['Support','1 year']],
  bestFor:'Homes, boutiques, salons and open-plan offices'},
 {id:'f-air',name:'F-AIR Diffuser',short:'F-AIR',price:700000,tagline:'Floor-standing fragrance machine for large spaces',
  images:['images/diffusers/fair-card.webp','images/diffusers/fair-lounge.webp','images/diffusers/fair-cafe.webp'],
  summary:'A floor-standing fragrance machine in brushed aluminium, built to scent large spaces. Two-fluid atomization breaks the oil into an ultra-fine mist that spreads evenly through lobbies, restaurants and showrooms.',
  body:'Fill the 500 ml reservoir with your Sapphire scent, then manage schedules and intensity from your phone over Bluetooth and Wi-Fi, or from the remote control. It stands on a slim round base and looks at home in a lounge, a hotel lobby or a café.',
  features:['Two-fluid atomization for an ultra-fine mist','Covers large spaces, up to 3,000 m³','500 ml oil reservoir','Bluetooth and Wi-Fi app control, plus remote','Brushed aluminium column on a round base'],
  specs:[['Type','Floor-standing'],['Oil capacity','500 ml'],['Coverage','Up to 3,000 m³'],['Diffusion','Two-fluid atomization'],['Control','Bluetooth, Wi-Fi app, remote'],['Finish','Brushed aluminium']],
  bestFor:'Hotel lobbies, restaurants, showrooms and large homes'},
];
DIFFUSERS.forEach(d=>{d.type='diffuser';d.kind='Diffuser'});

const ALL=[...PERFUMES,...REFILLS,...DIFFUSERS];
const byId=Object.fromEntries(ALL.map(p=>[p.id,p]));
const naira=n=>'₦'+n.toLocaleString('en-NG');
const productUrl=p=>`product.html?id=${encodeURIComponent(p.id)}`;
const CONTACT={email:'info@shopsapphirescents.com',instagram:'https://www.instagram.com/sapphirescents/',facebook:'https://www.facebook.com/walejana/'};

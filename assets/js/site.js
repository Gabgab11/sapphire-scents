/* Sapphire Scents: shared header, footer, bag and product cards for every page */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- header, menu, footer ---------- */
const NAV=[['perfumes.html','Perfumes'],['diffusers.html','Diffusers'],['refills.html','Scent Refills'],['about.html','About'],['contact.html','Contact']];
function here(){const f=location.pathname.split('/').pop()||'index.html';return f.endsWith('.html')?f:f+'.html'}
function renderChrome(){
  const cur=here();
  const links=NAV.map(([h,l])=>`<li><a href="${h}"${cur===h?' aria-current="page"':''}>${l}</a></li>`).join('');
  const hd=$('#site-header');
  hd.className='site';
  hd.innerHTML=`<div class="wrap nav">
    <a class="logo" href="index.html" aria-label="Sapphire Scents home">Sapphire <em>Scents</em></a>
    <ul class="nav-links">${links}</ul>
    <div class="nav-tools">
      <form class="search" action="perfumes.html" role="search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input id="q" name="q" type="search" placeholder="Search scents" aria-label="Search scents"></form>
      <button class="bagbtn" id="bagBtn" aria-label="Open bag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 8h14l1 13H4Z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg><span>Bag (<span id="bagCount">0</span>)</span></button>
      <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false" aria-controls="mmenu"><i></i><i></i><i></i></button>
    </div>
  </div>
  <nav class="mmenu" id="mmenu" hidden aria-label="Menu"><ul>${links}</ul></nav>`;
  $('#burger').addEventListener('click',()=>{const m=$('#mmenu'),o=m.hidden;m.hidden=!o;$('#burger').setAttribute('aria-expanded',String(o));hd.classList.toggle('menu-open',o)});
  const year=new Date().getFullYear();
  $('#site-footer').innerHTML=`<div class="wrap">
    <div class="foot">
      <div><a class="logo" href="index.html">Sapphire <em>Scents</em></a><p style="margin-top:16px;max-width:34ch">Affordable luxury perfumes for Africans all over the world. Made in Nigeria since 2015.</p>
        <div class="socials"><a href="${CONTACT.instagram}" target="_blank" rel="noopener">Instagram</a><a href="${CONTACT.facebook}" target="_blank" rel="noopener">Facebook</a></div></div>
      <div><h4>Shop</h4><ul><li><a href="perfumes.html">Perfumes</a></li><li><a href="perfumes.html?c=best">Best sellers</a></li><li><a href="diffusers.html">Diffusers</a></li><li><a href="refills.html">Scent refills</a></li></ul></div>
      <div><h4>House</h4><ul><li><a href="about.html">Our story</a></li><li><a href="contact.html#distributors">Become a distributor</a></li><li><a href="contact.html">Contact</a></li></ul></div>
      <div><h4>Get in touch</h4><ul><li><a href="mailto:${CONTACT.email}">${CONTACT.email}</a></li><li><a href="${CONTACT.instagram}" target="_blank" rel="noopener">@sapphirescents</a></li></ul></div>
    </div>
    <div class="foot-note"><span>© ${year} Sapphire Scents. All rights reserved.</span><span>Every bottle of Sapphire Scents is a journey in perfume history.</span></div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend',`<div class="scrim" id="scrim" hidden></div>
  <aside class="drawer" id="drawer" aria-label="Shopping bag">
    <div class="dhead"><h3>Your bag</h3><button class="close" id="closeBag" aria-label="Close bag">✕</button></div>
    <div class="lines" id="lines"></div>
    <div class="dfoot"><div class="sub"><span>Subtotal</span><span id="subtotal">₦0</span></div>
      <p class="dnote">Delivery is confirmed by our team when you place your order.</p>
      <a class="btn solid" id="checkout" href="checkout.html">Checkout</a></div>
  </aside>
  <div class="toast" id="toast" role="status"></div>`);
  const setH=()=>document.documentElement.style.setProperty('--hh',hd.offsetHeight+'px');setH();addEventListener('resize',setH);
  const solid=()=>hd.classList.toggle('solid',!document.body.classList.contains('has-hero')||scrollY>40);solid();addEventListener('scroll',solid,{passive:true});
}

/* ---------- bag (kept in this browser) ---------- */
let BAG=[];
try{BAG=JSON.parse(localStorage.getItem('ss_bag')||'[]').filter(l=>byId[l.id])}catch(e){BAG=[]}
const saveBag=()=>{try{localStorage.setItem('ss_bag',JSON.stringify(BAG))}catch(e){}};
const bagTotal=()=>BAG.reduce((s,l)=>s+byId[l.id].price*l.qty,0);
function addToBag(id,qty=1,opt=''){
  const p=byId[id];if(!p)return;
  const ex=BAG.find(l=>l.id===id&&(l.opt||'')===opt);
  if(ex)ex.qty+=qty;else BAG.push({id,qty,opt});
  saveBag();renderBag();toast(`${p.name}${opt?' ('+opt+')':''} added to your bag`);
  const c=$('#bagCount');c&&c.parentElement.animate([{transform:'scale(1.15)'},{transform:'scale(1)'}],{duration:350});
}
function thumb(p){
  if(p.type==='perfume')return `<img src="${IMG[p.img]}" alt="">`;
  if(p.type==='diffuser')return `<img class="cover" src="${p.images[0]}" alt="">`;
  return `<i class="ico">${art(p.note)}</i>`;
}
function renderBag(){
  const n=BAG.reduce((s,l)=>s+l.qty,0);
  $$('#bagCount').forEach(e=>e.textContent=n);
  if(!$('#lines'))return;
  $('#subtotal').textContent=naira(bagTotal());
  $('#lines').innerHTML=BAG.length?BAG.map((l,i)=>{const p=byId[l.id];return `<div class="line"><a class="th" href="${productUrl(p)}" style="--a:${p.a||'#8a6a2a'}">${thumb(p)}</a><div style="min-width:0"><h4><a href="${productUrl(p)}">${esc(p.name)}</a></h4><small>${p.kind}${l.opt?' · '+esc(l.opt):''}</small><div class="qty"><button data-dec="${i}" aria-label="Decrease">−</button><span>${l.qty}</span><button data-inc="${i}" aria-label="Increase">+</button></div></div><div style="text-align:right"><div class="price">${naira(p.price*l.qty)}</div><button class="rm" data-rm="${i}">Remove</button></div></div>`}).join(''):'<p class="empty-bag">Your bag is empty.<br><a class="tlink" href="perfumes.html">Shop perfumes</a></p>';
  const co=$('#checkout');co.classList.toggle('disabled',!BAG.length);co.setAttribute('aria-disabled',String(!BAG.length));
}
function openBag(){$('#scrim').hidden=false;$('#drawer').classList.add('open')}
function closeBag(){$('#drawer').classList.remove('open');$('#scrim').hidden=true}
let tT;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tT);tT=setTimeout(()=>t.classList.remove('show'),2600)}

/* ---------- product cards ---------- */
function perfumeCard(p){
  const badges=[p.tags.includes('new')?'<span class="badge new">New</span>':'',p.tags.includes('best')?'<span class="badge">Best seller</span>':''].join('');
  return `<article class="card" style="--a:${p.a}">
    <a class="tile" href="${productUrl(p)}" aria-label="${esc(p.name)}"><img src="${IMG[p.img]}" alt="${esc(p.name)} bottle" loading="lazy"><span class="mono">${esc(p.name)}</span><div class="badges">${badges}</div><span class="qv">View scent</span></a>
    <div class="cbody"><h3><a href="${productUrl(p)}">${esc(p.name)}</a></h3><p class="fmt">${esc(p.family)}</p>
    <p class="notes">${p.notes.map(esc).join(' · ')}</p>
    <div class="crow"><span class="price">${naira(p.price)}</span><button class="add" data-add="${p.id}">Add to bag</button></div></div></article>`;
}
function refillCard(r){
  return `<article class="card rcard" style="--a:${r.a}">
    <a class="tile rtile" href="${productUrl(r)}" aria-label="${esc(r.name)} scent refill"><span class="rart">${art(r.note)}</span><span class="rname">${esc(r.name)}</span><span class="rkind">Scent refill</span><span class="qv">View refill</span></a>
    <div class="cbody"><h3><a href="${productUrl(r)}">${esc(r.name)}</a></h3><p class="fmt">${r.perfume?'Signature scent':'Single note'} · diffuser oil</p>
    <div class="crow"><span class="price">${naira(r.price)}</span><button class="add" data-add="${r.id}">Add to bag</button></div></div></article>`;
}
function diffuserCard(d){
  return `<article class="card dcard">
    <a class="tile dtile" href="${productUrl(d)}" aria-label="${esc(d.name)}"><img src="${d.images[0]}" alt="${esc(d.name)}" loading="lazy"><span class="qv">View diffuser</span></a>
    <div class="cbody"><h3><a href="${productUrl(d)}">${esc(d.name)}</a></h3><p class="fmt">${esc(d.tagline)}</p>
    <div class="crow"><span class="price">${naira(d.price)}</span><a class="add" href="${productUrl(d)}">Details</a></div></div></article>`;
}
const anyCard=p=>p.type==='perfume'?perfumeCard(p):p.type==='refill'?refillCard(p):diffuserCard(p);

/* ---------- shared clicks ---------- */
document.addEventListener('click',e=>{
  const add=e.target.closest('[data-add]');if(add){e.preventDefault();addToBag(add.dataset.add,+(add.dataset.qty||1),add.dataset.opt||'');return}
  if(e.target.closest('#bagBtn')){openBag();return}
  if(e.target.closest('#closeBag')||e.target.id==='scrim'){closeBag();return}
  const t=e.target;
  if(t.dataset&&t.dataset.inc){BAG[+t.dataset.inc].qty++;saveBag();renderBag();return}
  if(t.dataset&&t.dataset.dec){const l=BAG[+t.dataset.dec];l.qty--;if(!l.qty)BAG.splice(+t.dataset.dec,1);saveBag();renderBag();return}
  if(t.dataset&&t.dataset.rm){BAG.splice(+t.dataset.rm,1);saveBag();renderBag();return}
  if(t.closest('#checkout.disabled')){e.preventDefault();toast('Your bag is empty');}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeBag();const m=$('#mmenu');if(m&&!m.hidden)$('#burger').click()}});
addEventListener('storage',e=>{if(e.key==='ss_bag'){try{BAG=JSON.parse(e.newValue||'[]')}catch(_){BAG=[]}renderBag()}});

renderChrome();renderBag();

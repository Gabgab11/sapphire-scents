/* Sapphire Scents dashboard: staff sign in, edit products and photos, bulk upload, history.
   Talks to Supabase directly (Auth, Data API, Storage). Access is enforced in the database
   by row-level security: only people on the staff list can change anything. */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>'₦'+(+n||0).toLocaleString('en-NG');
const TYPES={perfume:'Perfume',refill:'Scent refill',diffuser:'Diffuser'};
const TAGS=['best','new','sweet','floral','woody','fresh','fruity'];
const TAGNAMES={best:'Best seller',new:'New',sweet:'Sweet',floral:'Floral',woody:'Woody',fresh:'Fresh',fruity:'Fruity'};
const slug=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60);

let CFG=null,S=null,ME=null,PRODUCTS=[],VIEW='products',FILTER={q:'',type:'all',status:'all'};

/* ---------------- tiny Supabase client ---------------- */
const KEY='ss_admin_session';
function saveSession(s){S=s;try{s?localStorage.setItem(KEY,JSON.stringify(s)):localStorage.removeItem(KEY)}catch(e){}}
function loadSession(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){return null}}
async function authCall(path,body,method='POST',token){
  const r=await fetch(`${CFG.supabaseUrl}/auth/v1/${path}`,{method,headers:{apikey:CFG.supabaseKey,'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:body?JSON.stringify(body):undefined});
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(j.msg||j.error_description||j.message||j.error||`Sign-in service error (${r.status})`);
  return j;
}
function asSession(j){return{access_token:j.access_token,refresh_token:j.refresh_token,expires_at:j.expires_at||Math.floor(Date.now()/1000)+(j.expires_in||3600),user:j.user}}
async function token(){
  if(!S)throw new Error('Signed out');
  if(S.expires_at-60<Date.now()/1000){
    try{saveSession(asSession(await authCall('token?grant_type=refresh_token',{refresh_token:S.refresh_token})))}
    catch(e){saveSession(null);render();throw new Error('Your session ended. Please sign in again.')}
  }
  return S.access_token;
}
async function api(path,{method='GET',body,prefer,headers={}}={}){
  const t=await token();
  const r=await fetch(`${CFG.supabaseUrl}/rest/v1/${path}`,{method,headers:{apikey:CFG.supabaseKey,Authorization:`Bearer ${t}`,'Content-Type':'application/json',...(prefer?{Prefer:prefer}:{}),...headers},body:body!==undefined?JSON.stringify(body):undefined});
  if(r.status===204)return null;
  const j=await r.json().catch(()=>null);
  if(!r.ok){const m=(j&&(j.message||j.hint))||`Request failed (${r.status})`;throw new Error(/row-level security|permission denied/i.test(m)?'You don’t have permission to change this. Ask an owner to add you to the staff list.':m)}
  return j;
}
async function upload(path,blob){
  const t=await token();
  const r=await fetch(`${CFG.supabaseUrl}/storage/v1/object/products/${path}`,{method:'POST',headers:{apikey:CFG.supabaseKey,Authorization:`Bearer ${t}`,'Content-Type':blob.type,'x-upsert':'true','cache-control':'31536000'},body:blob});
  if(!r.ok){const j=await r.json().catch(()=>({}));throw new Error(j.message||j.error||`Photo upload failed (${r.status})`)}
  return `${CFG.supabaseUrl}/storage/v1/object/public/products/${path}`;
}

/* ---------------- images: shrink in the browser before upload ---------------- */
async function shrink(file,max,quality=.86){
  const bmp=await createImageBitmap(file);
  const k=Math.min(1,max/Math.max(bmp.width,bmp.height));
  const w=Math.max(1,Math.round(bmp.width*k)),h=Math.max(1,Math.round(bmp.height*k));
  const c=document.createElement('canvas');c.width=w;c.height=h;
  c.getContext('2d').drawImage(bmp,0,0,w,h);bmp.close&&bmp.close();
  const b=await new Promise(res=>c.toBlob(res,'image/webp',quality));
  if(b&&b.type==='image/webp')return b;
  return await new Promise(res=>c.toBlob(res,'image/jpeg',quality));
}
async function uploadPhoto(id,file){
  if(!/^image\/(jpeg|png|webp|gif|heic|heif)$/i.test(file.type)&&!/\.(jpe?g|png|webp|gif|heic)$/i.test(file.name))throw new Error(`${file.name} isn’t a photo`);
  const stamp=Date.now().toString(36);
  const big=await shrink(file,1400),small=await shrink(file,480,.8);
  const ext=big.type==='image/webp'?'webp':'jpg';
  const url=await upload(`${id}/${stamp}.${ext}`,big);
  const thumb=await upload(`${id}/${stamp}-sm.${ext}`,small);
  return {url,thumb};
}
function photoOf(p){const d=p.data||{};
  if(p.type==='perfume')return {src:(IMG[d.img]||d.img||IMG.amber),cover:false};
  if(p.type==='refill')return d.thumb||d.photo?{src:d.thumb||d.photo,cover:true}:null;
  return d.images&&d.images[0]?{src:d.images[0],cover:true}:null}
function thumbHTML(p){const ph=photoOf(p);
  if(ph)return `<div class="thumb${ph.cover?' cover':''}"><img src="${esc(ph.src)}" alt="" loading="lazy"></div>`;
  return `<div class="thumb">${art((p.data||{}).note||((p.data||{}).notes||[])[0]||'drop')}</div>`}

/* ---------------- toast ---------------- */
let tT;function toast(m,bad){const t=$('#toast');t.textContent=m;t.classList.toggle('bad',!!bad);t.classList.add('show');clearTimeout(tT);tT=setTimeout(()=>t.classList.remove('show'),bad?5000:2600)}

/* ---------------- sign in ---------------- */
function loginView(mode='in',msg=''){
  const recovering=mode==='newpw';
  $('#app').innerHTML=`<main class="login"><form class="lcard" id="lform" novalidate>
    <h1>Sapphire <em>Scents</em><br>dashboard</h1>
    <p>${recovering?'Choose a new password for your account.':mode==='reset'?'Enter your email and we’ll send a link to set a new password.':'Sign in with your staff email to manage products and photos.'}</p>
    ${recovering?'':`<label class="f">Email<input class="in" id="lemail" type="email" autocomplete="username" required></label>`}
    ${mode==='reset'?'':`<label class="f">${recovering?'New password':'Password'}<input class="in" id="lpw" type="password" autocomplete="${recovering?'new-password':'current-password'}" minlength="${recovering?8:1}" required></label>`}
    <p class="err" id="lerr" ${msg?'':'hidden'}>${esc(msg)}</p>
    <button class="btn primary" type="submit">${recovering?'Save new password':mode==='reset'?'Send reset link':'Sign in'}</button>
    ${recovering?'':`<button class="linkbtn" type="button" id="lswap">${mode==='reset'?'Back to sign in':'Forgot your password?'}</button>`}
  </form></main>`;
  const sw=$('#lswap');sw&&(sw.onclick=()=>loginView(mode==='reset'?'in':'reset'));
  $('#lform').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('[type=submit]'),er=$('#lerr');er.hidden=true;b.setAttribute('aria-busy','true');
    try{
      if(recovering){const pw=$('#lpw').value;if(pw.length<8)throw new Error('Use at least 8 characters.');await authCall('user',{password:pw},'PUT',S.access_token);toast('Password saved');await start();return}
      const email=$('#lemail').value.trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Enter a valid email address.');
      if(mode==='reset'){await authCall('recover',{email,redirect_to:location.origin+location.pathname});er.hidden=false;er.style.color='var(--ok)';er.textContent='If that email is on the staff list, a reset link is on its way.';b.removeAttribute('aria-busy');return}
      const pw=$('#lpw').value;if(!pw)throw new Error('Enter your password.');
      saveSession(asSession(await authCall('token?grant_type=password',{email,password:pw})));
      await start();
    }catch(err){er.hidden=false;er.style.color='';er.textContent=/invalid login/i.test(err.message)?'That email and password don’t match.':err.message;b.removeAttribute('aria-busy')}
  };
  const f=$('#lemail')||$('#lpw');f&&f.focus();
}
async function signOut(){try{if(S)await authCall('logout',null,'POST',S.access_token)}catch(e){}saveSession(null);ME=null;loginView()}

/* ---------------- shell ---------------- */
function shell(){
  const tabs=[['products','Products'],['bulk','Bulk upload'],['history','History'],['team','Team']];
  $('#app').innerHTML=`<header class="top"><div class="top-in">
    <a class="brand" href="index.html" target="_blank" rel="noopener">Sapphire <em>Scents</em><small>Dashboard</small></a>
    <nav class="tabs" role="tablist" aria-label="Dashboard sections">${tabs.map(([k,l])=>`<button role="tab" data-tab="${k}" aria-selected="${VIEW===k}">${l}</button>`).join('')}</nav>
    <div class="who"><span>${esc(ME.name||ME.email)}${ME.role==='owner'?' · Owner':''}</span><button class="btn small" id="out">Sign out</button></div>
  </div></header><main class="main" id="view"></main>
  <div class="dlg" id="dlg" hidden></div>`;
  $$('[data-tab]').forEach(b=>b.onclick=()=>{VIEW=b.dataset.tab;try{history.replaceState(null,'','#'+VIEW)}catch(e){}shell()});
  $('#out').onclick=signOut;
  ({products:productsView,bulk:bulkView,history:historyView,team:teamView})[VIEW]();
}
async function loadProducts(){PRODUCTS=await api('products?select=*&order=type.asc,sort.asc,name.asc')||[]}

/* ---------------- products ---------------- */
function statusOf(p){return !p.visible?'hidden':!p.in_stock?'sold':'live'}
function productsView(){
  const v=$('#view');
  v.innerHTML=`<div class="head"><div><h2>Products</h2><p>Change prices, stock and photos. Changes show on the shop within a minute.</p></div>
    <button class="btn amber" id="addP">+ Add product</button></div>
  <div class="bar"><input class="in" id="q" type="search" placeholder="Search by name or note" aria-label="Search products" value="${esc(FILTER.q)}">
    <div class="chips" role="group" aria-label="Product type">${[['all','All'],['perfume','Perfumes'],['refill','Refills'],['diffuser','Diffusers']].map(([k,l])=>`<button class="chip" data-type="${k}" aria-pressed="${FILTER.type===k}">${l}</button>`).join('')}</div>
    <select class="sel" id="st" aria-label="Status" style="width:auto">${[['all','Any status'],['live','On the shop'],['sold','Sold out'],['hidden','Hidden']].map(([k,l])=>`<option value="${k}"${FILTER.status===k?' selected':''}>${l}</option>`).join('')}</select>
    <span class="count" id="cnt"></span></div>
  <div class="list" id="plist"></div>`;
  $('#q').oninput=e=>{FILTER.q=e.target.value;drawList()};
  $$('[data-type]').forEach(b=>b.onclick=()=>{FILTER.type=b.dataset.type;$$('[data-type]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));drawList()});
  $('#st').onchange=e=>{FILTER.status=e.target.value;drawList()};
  $('#addP').onclick=()=>editor(null);
  drawList();
}
function drawList(){
  const q=FILTER.q.trim().toLowerCase();
  const L=PRODUCTS.filter(p=>(FILTER.type==='all'||p.type===FILTER.type)&&(FILTER.status==='all'||statusOf(p)===FILTER.status)&&(!q||[p.name,p.id,(p.data.notes||[]).join(' '),p.data.family,p.data.note].join(' ').toLowerCase().includes(q)));
  $('#cnt').textContent=`${L.length} of ${PRODUCTS.length}`;
  $('#plist').innerHTML=L.length?`<div class="row hd"><span></span><span>Product</span><span class="c-type">Type</span><span>Price</span><span>In stock</span><span>On shop</span><span></span></div>`+L.map(p=>`<div class="row" data-id="${esc(p.id)}">
    <div class="c-thumb">${thumbHTML(p)}</div>
    <div class="pname c-name"><b>${esc(p.name)}</b><small>${esc(p.data.family||p.data.tagline||p.id)}${!p.visible?' · <span class="tag hidden">Hidden</span>':!p.in_stock?' · <span class="tag sold">Sold out</span>':''}</small></div>
    <div class="c-type"><span class="tag">${TYPES[p.type]}</span></div>
    <label class="price-in c-price"><span>₦</span><input inputmode="numeric" data-price value="${(+p.price).toLocaleString('en-NG')}" aria-label="Price of ${esc(p.name)}"></label>
    <label class="sw c-stock"><input type="checkbox" data-stock ${p.in_stock?'checked':''}><i></i><span>In stock</span></label>
    <label class="sw c-live"><input type="checkbox" data-live ${p.visible?'checked':''}><i></i><span>On shop</span></label>
    <div class="c-edit"><button class="btn small" data-edit>Edit</button></div></div>`).join(''):`<div class="empty">No products match. <button class="linkbtn" id="clr">Clear filters</button></div>`;
  const c=$('#clr');c&&(c.onclick=()=>{FILTER={q:'',type:'all',status:'all'};productsView()});
  $$('#plist .row[data-id]').forEach(row=>{
    const p=PRODUCTS.find(x=>x.id===row.dataset.id);
    row.querySelector('[data-edit]').onclick=()=>editor(p);
    const pin=row.querySelector('[data-price]');
    const savePrice=async()=>{const n=parseInt(pin.value.replace(/[^\d]/g,''),10);
      if(isNaN(n)){pin.value=(+p.price).toLocaleString('en-NG');return}
      if(n===+p.price){pin.value=n.toLocaleString('en-NG');return}
      try{await patch(p,{price:n});pin.value=n.toLocaleString('en-NG');toast(`${p.name}: price now ${fmt(n)}`)}catch(e){pin.value=(+p.price).toLocaleString('en-NG');toast(e.message,true)}};
    pin.onblur=savePrice;pin.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();pin.blur()}};
    row.querySelector('[data-stock]').onchange=async e=>{const v=e.target.checked;try{await patch(p,{in_stock:v});toast(`${p.name} ${v?'is back in stock':'marked sold out'}`);drawList()}catch(er){e.target.checked=!v;toast(er.message,true)}};
    row.querySelector('[data-live]').onchange=async e=>{const v=e.target.checked;try{await patch(p,{visible:v});toast(`${p.name} ${v?'is on the shop':'is hidden from the shop'}`);drawList()}catch(er){e.target.checked=!v;toast(er.message,true)}};
  });
}
async function patch(p,changes){
  const r=await api(`products?id=eq.${encodeURIComponent(p.id)}`,{method:'PATCH',body:changes,prefer:'return=representation'});
  if(!r||!r.length)throw new Error('That change wasn’t saved. You may not have permission.');
  Object.assign(p,r[0]);return p;
}

/* ---------------- editor ---------------- */
function editor(p){
  const isNew=!p;
  const d=isNew?{type:'perfume',data:{notes:[],tags:[]},in_stock:true,visible:true,price:'',sort:0}:JSON.parse(JSON.stringify(p));
  d.data=d.data||{};
  let photos=[];// working photo list for this product
  const initPhotos=()=>{const x=d.data;photos=d.type==='perfume'?(x.img&&/^https?:/.test(x.img)?[{url:x.img,thumb:x.img}]:[]):d.type==='refill'?(x.photo?[{url:x.photo,thumb:x.thumb||x.photo}]:[]):(x.images||[]).map(u=>({url:u,thumb:u}))};
  initPhotos();
  const perfumes=PRODUCTS.filter(x=>x.type==='perfume');
  const dlg=$('#dlg');dlg.hidden=false;
  const close=()=>{dlg.hidden=true;dlg.innerHTML='';document.removeEventListener('keydown',onKey)};
  const onKey=e=>{if(e.key==='Escape')close()};document.addEventListener('keydown',onKey);
  dlg.onclick=e=>{if(e.target===dlg)close()};
  function body(){
    const x=d.data,t=d.type;
    return `<div class="grid2">
      <label class="f">Type<select class="sel" id="e_type" ${isNew?'':'disabled'}>${Object.entries(TYPES).map(([k,l])=>`<option value="${k}"${t===k?' selected':''}>${l}</option>`).join('')}</select>${isNew?'':'<small>The type can’t change after a product is created.</small>'}</label>
      <label class="f">Name<input class="in" id="e_name" value="${esc(d.name||'')}" maxlength="80" required></label>
      <label class="f">Price (₦)<input class="in" id="e_price" inputmode="numeric" value="${d.price===''?'':(+d.price).toLocaleString('en-NG')}" required></label>
      <label class="f">Web address<input class="in" id="e_id" value="${esc(d.id||'')}" ${isNew?'':'readonly'} pattern="[a-z0-9][a-z0-9-]*"><small>${isNew?'Filled from the name. Lowercase letters, numbers and dashes.':'shopsapphirescents.com/product?id='+esc(d.id)}</small></label>
    </div>
    <div class="grid2"><label class="sw"><input type="checkbox" id="e_stock" ${d.in_stock?'checked':''}><i></i><span>In stock</span></label>
      <label class="sw"><input type="checkbox" id="e_live" ${d.visible?'checked':''}><i></i><span>Show on the shop</span></label></div>
    <fieldset><legend>Photos</legend>
      <div class="photos" id="e_photos"></div>
      <label class="drop" id="e_drop"><input type="file" id="e_file" accept="image/*" ${t==='diffuser'?'multiple':''}><b>Add ${t==='diffuser'?'photos':'a photo'}</b><span>Drop ${t==='diffuser'?'images':'an image'} here or tap to choose. Large photos are shrunk automatically.</span></label>
      <p class="hint">${t==='perfume'?'A bottle on a plain or see-through background looks best. With no photo, the standard Sapphire bottle is shown.':t==='refill'?'A square photo of the refill bottle works best.':'The first photo is the main one. Use the arrows to change the order.'}</p>
    </fieldset>
    <fieldset><legend>Description</legend>
      ${t==='diffuser'?`<label class="f">Tagline<input class="in" id="e_tagline" value="${esc(x.tagline||'')}" maxlength="120"></label>
        <label class="f">Summary<textarea class="ta" id="e_summary">${esc(x.summary||'')}</textarea></label>
        <label class="f">More detail<textarea class="ta" id="e_body">${esc(x.body||'')}</textarea></label>
        <label class="f">Features <small>One per line</small><textarea class="ta" id="e_features">${esc((x.features||[]).join('\n'))}</textarea></label>
        <label class="f">Specifications <small>One per line, like “Oil capacity: 300 ml”</small><textarea class="ta" id="e_specs">${esc((x.specs||[]).map(s=>s[0]+': '+s[1]).join('\n'))}</textarea></label>
        <label class="f">Best for<input class="in" id="e_bestFor" value="${esc(x.bestFor||'')}"></label>`
      :`<label class="f">Story<textarea class="ta" id="e_story">${esc(x.story||'')}</textarea></label>`}
      ${t==='perfume'?`<div class="grid2"><label class="f">Notes <small>Separate with commas</small><input class="in" id="e_notes" value="${esc((x.notes||[]).join(', '))}"></label>
        <label class="f">Family <small>e.g. Sweet oud</small><input class="in" id="e_family" value="${esc(x.family||'')}"></label></div>
        <label class="f">Headline pair <small>Shown on the homepage, e.g. Oud & Amber</small><input class="in" id="e_pair" value="${esc(x.pair||'')}"></label>
        <div class="f">Collections<div class="tagpick">${TAGS.map(g=>`<label><input type="checkbox" data-tag="${g}" ${(x.tags||[]).includes(g)?'checked':''}>${TAGNAMES[g]}</label>`).join('')}</div></div>`:''}
      ${t==='refill'?`<div class="grid2"><label class="f">Matching perfume<select class="sel" id="e_perfume"><option value="">None (single note)</option>${perfumes.map(pf=>`<option value="${esc(pf.id)}"${x.perfume===pf.id?' selected':''}>${esc(pf.name)}</option>`).join('')}</select></label>
        <label class="f">Main note <small>Picks the illustration when there’s no photo</small><input class="in" id="e_note" value="${esc(x.note||'')}"></label></div>`:''}
    </fieldset>
    <fieldset><legend>Display</legend><div class="grid2">
      <label class="f">Order in lists <small>Lower numbers show first</small><input class="in" id="e_sort" inputmode="numeric" value="${+d.sort||0}"></label>
      <label class="f">Accent colour<input class="in" id="e_a" type="color" value="${/^#[0-9a-f]{6}$/i.test(x.a||'')?x.a:'#8a6a2a'}" style="padding:4px;height:42px"></label></div></fieldset>
    <p class="err" id="e_err" hidden></p>`;
  }
  dlg.innerHTML=`<section class="panel" role="dialog" aria-modal="true" aria-labelledby="e_h">
    <div class="phead"><h3 id="e_h">${isNew?'Add product':esc(d.name)}</h3><button class="btn ghost small" id="e_x" aria-label="Close">✕</button></div>
    <form class="pbody" id="e_form" novalidate></form>
    <div class="pfoot"><div>${isNew?'':`<button class="btn danger small" id="e_del" type="button">Delete</button> <a class="btn ghost small" href="product.html?id=${encodeURIComponent(d.id)}" target="_blank" rel="noopener">View on shop</a>`}</div>
      <div style="display:flex;gap:10px"><button class="btn" id="e_cancel" type="button">Cancel</button><button class="btn primary" id="e_save" type="button">${isNew?'Add product':'Save changes'}</button></div></div>
  </section>`;
  const form=$('#e_form');
  function drawPhotos(){
    $('#e_photos').innerHTML=photos.length?photos.map((ph,i)=>`<div class="ph">${i===0&&photos.length>1?'<small>Main</small>':''}<img src="${esc(ph.thumb||ph.url)}" alt=""><button type="button" class="x" data-rm="${i}" aria-label="Remove photo">✕</button>${photos.length>1?`<div class="ord">${i>0?`<button type="button" data-l="${i}" aria-label="Move earlier">‹</button>`:''}${i<photos.length-1?`<button type="button" data-r="${i}" aria-label="Move later">›</button>`:''}</div>`:''}</div>`).join(''):'<p class="hint">No photo yet.</p>';
    $$('[data-rm]',form).forEach(b=>b.onclick=()=>{photos.splice(+b.dataset.rm,1);drawPhotos()});
    $$('[data-l]',form).forEach(b=>b.onclick=()=>{const i=+b.dataset.l;[photos[i-1],photos[i]]=[photos[i],photos[i-1]];drawPhotos()});
    $$('[data-r]',form).forEach(b=>b.onclick=()=>{const i=+b.dataset.r;[photos[i+1],photos[i]]=[photos[i],photos[i+1]];drawPhotos()});
  }
  async function addFiles(files){
    const id=($('#e_id').value||slug($('#e_name').value)||'new').trim();
    const list=[...files].slice(0,d.type==='diffuser'?10:1);
    const drop=$('#e_drop');drop.setAttribute('aria-busy','true');drop.querySelector('b').textContent='Uploading…';
    try{for(const f of list){const r=await uploadPhoto(id,f);if(d.type==='diffuser')photos.push(r);else photos=[r]}drawPhotos();toast(list.length>1?`${list.length} photos added. Save to keep them.`:'Photo added. Save to keep it.')}
    catch(e){toast(e.message,true)}
    finally{drop.removeAttribute('aria-busy');drop.querySelector('b').textContent=d.type==='diffuser'?'Add photos':'Add a photo'}
  }
  function wire(){
    drawPhotos();
    const ty=$('#e_type');ty&&(ty.onchange=()=>{collect();d.type=ty.value;photos=[];form.innerHTML=body();wire()});
    const nm=$('#e_name'),idf=$('#e_id');
    if(isNew){let touched=!!idf.value;idf.oninput=()=>{touched=true};nm.oninput=()=>{if(!touched)idf.value=slug(nm.value)+(d.type==='refill'&&nm.value?'-refill':'')}}
    $('#e_file').onchange=e=>{if(e.target.files.length)addFiles(e.target.files);e.target.value=''};
    const dr=$('#e_drop');
    dr.ondragover=e=>{e.preventDefault();dr.classList.add('over')};dr.ondragleave=()=>dr.classList.remove('over');
    dr.ondrop=e=>{e.preventDefault();dr.classList.remove('over');if(e.dataTransfer.files.length)addFiles(e.dataTransfer.files)};
  }
  function collect(){
    const v=id=>{const el=$('#'+id);return el?el.value.trim():undefined};
    const x=d.data;
    d.name=v('e_name');d.price=(v('e_price')||'').replace(/[^\d]/g,'');d.in_stock=$('#e_stock').checked;d.visible=$('#e_live').checked;
    d.sort=parseInt((v('e_sort')||'0').replace(/[^\d-]/g,''),10)||0;x.a=v('e_a');
    if(isNew)d.id=v('e_id');
    if(d.type==='diffuser'){x.tagline=v('e_tagline');x.summary=v('e_summary');x.body=v('e_body');x.bestFor=v('e_bestFor');
      x.features=(v('e_features')||'').split('\n').map(s=>s.trim()).filter(Boolean);
      x.specs=(v('e_specs')||'').split('\n').map(s=>s.trim()).filter(Boolean).map(s=>{const i=s.indexOf(':');return i>0?[s.slice(0,i).trim(),s.slice(i+1).trim()]:[s,'']});
      x.short=x.short||(d.name||'').replace(/ Diffuser$/i,'');x.images=photos.map(p=>p.url)}
    else{x.story=v('e_story')}
    if(d.type==='perfume'){x.notes=(v('e_notes')||'').split(',').map(s=>s.trim()).filter(Boolean);x.family=v('e_family');x.pair=v('e_pair')||x.notes.slice(0,2).join(' & ');
      x.tags=$$('[data-tag]',form).filter(c=>c.checked).map(c=>c.dataset.tag);x.img=photos[0]?photos[0].url:(x.img&&!/^https?:/.test(x.img)?x.img:'amber')}
    if(d.type==='refill'){x.perfume=v('e_perfume')||null;x.note=v('e_note')||x.note||'Drop';x.family=x.perfume?'Signature scent':'Single note';x.photo=photos[0]?photos[0].url:null;x.thumb=photos[0]?photos[0].thumb:null;x.kind='Scent refill'}
    for(const k of Object.keys(x))if(x[k]===undefined||x[k]===null||x[k]==='')delete x[k];
  }
  form.innerHTML=body();wire();
  $('#e_x').onclick=close;$('#e_cancel').onclick=close;
  $('#e_save').onclick=async()=>{
    const er=$('#e_err'),btn=$('#e_save');er.hidden=true;collect();
    const problems=[];
    if(!d.name)problems.push('a name');
    if(d.price===''||isNaN(+d.price))problems.push('a price');
    if(isNew&&!/^[a-z0-9][a-z0-9-]{0,62}$/.test(d.id||''))problems.push('a web address using lowercase letters, numbers and dashes');
    if(isNew&&PRODUCTS.some(x=>x.id===d.id))problems.push(`a different web address (“${d.id}” is already used)`);
    if(problems.length){er.hidden=false;er.textContent='Please add '+problems.join(', ')+'.';return}
    btn.setAttribute('aria-busy','true');
    const row={name:d.name,price:+d.price,in_stock:d.in_stock,visible:d.visible,sort:d.sort,data:d.data};
    try{
      if(isNew){
        if(!row.sort)row.sort=(Math.max(0,...PRODUCTS.filter(x=>x.type===d.type).map(x=>x.sort||0))+10);
        const r=await api('products',{method:'POST',body:{id:d.id,type:d.type,...row},prefer:'return=representation'});
        PRODUCTS.push(r[0]);toast(`${d.name} added to the shop`);
      }else{await patch(p,row);toast(`${d.name} saved`)}
      close();drawList();
    }catch(e){er.hidden=false;er.textContent=e.message;btn.removeAttribute('aria-busy')}
  };
  const del=$('#e_del');
  del&&(del.onclick=()=>{
    const foot=$('.pfoot');const box=document.createElement('div');box.className='confirm';box.style.flexBasis='100%';
    box.innerHTML=`<span>Delete <b>${esc(d.name)}</b> for good? To take it off the shop for now, turn off “Show on the shop” instead.</span><button class="btn danger solid small" type="button" id="e_yes">Delete</button><button class="btn small" type="button" id="e_no">Keep it</button>`;
    foot.prepend(box);del.disabled=true;
    $('#e_no').onclick=()=>{box.remove();del.disabled=false};
    $('#e_yes').onclick=async()=>{try{await api(`products?id=eq.${encodeURIComponent(p.id)}`,{method:'DELETE'});PRODUCTS=PRODUCTS.filter(x=>x.id!==p.id);toast(`${d.name} deleted`);close();drawList()}catch(e){toast(e.message,true)}};
  });
  setTimeout(()=>{const f=$('#e_name');f&&f.focus()},50);
}

/* ---------------- bulk upload ---------------- */
const COLS=['id','type','name','price','in_stock','visible','sort','family','notes','tags','story','photo_url'];
function toRowCSV(p){const x=p.data||{};
  const photo=p.type==='perfume'?(/^https?:/.test(x.img||'')?x.img:''):p.type==='refill'?(x.photo||''):((x.images||[])[0]||'');
  return [p.id,p.type,p.name,p.price,p.in_stock?'yes':'no',p.visible?'yes':'no',p.sort,x.family||'',(x.notes||[]).join('; '),(x.tags||[]).join('; '),x.story||x.summary||'',photo]}
function csvCell(v){v=String(v==null?'':v);return /[",\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}
function makeCSV(rows){return '﻿'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n')}
function parseCSV(text){
  text=text.replace(/^﻿/,'');const rows=[];let row=[],cell='',q=false;
  const delim=(text.split('\n')[0].match(/;/g)||[]).length>(text.split('\n')[0].match(/,/g)||[]).length?';':',';
  for(let i=0;i<text.length;i++){const c=text[i];
    if(q){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++}else q=false}else cell+=c}
    else if(c==='"')q=true;else if(c===delim){row.push(cell);cell=''}else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell=''}else cell+=c}
  if(cell!==''||row.length){row.push(cell);rows.push(row)}
  return rows.filter(r=>r.some(c=>c.trim()!==''));
}
function download(name,text){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'}));a.download=name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
const yes=v=>/^(yes|y|true|1|in stock|on)$/i.test(String(v).trim());
const listOf=v=>String(v||'').split(/[;|]/).map(s=>s.trim()).filter(Boolean);

function bulkView(){
  $('#view').innerHTML=`<div class="head"><div><h2>Bulk upload</h2><p>Update many products at once from a spreadsheet, or add a batch of photos.</p></div></div>
  <div class="cards2">
    <section class="card"><h3>Products from a spreadsheet</h3>
      <ol class="steps"><li>Download the current products (or the blank template).</li><li>Edit it in Excel or Google Sheets. Add new rows for new products.</li><li>Save as CSV and upload it here. You’ll see every change before anything is saved.</li></ol>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" id="b_exp">Download current products</button><button class="btn ghost" id="b_tpl">Blank template</button></div>
      <label class="drop" id="b_drop"><input type="file" id="b_file" accept=".csv,text/csv"><b>Upload CSV file</b><span>Drop it here or tap to choose</span></label>
      <p class="hint">Columns: ${COLS.join(', ')}. Separate notes and tags with semicolons. Use “yes” or “no” for in_stock and visible. Leave a cell empty to keep what’s there.</p>
    </section>
    <section class="card"><h3>Photos in bulk</h3>
      <ol class="steps"><li>Name each photo after its product, like <b>jagaban.jpg</b> or <b>white-oud-refill.png</b>.</li><li>Drop them all here. We match each one to its product.</li><li>Check the matches, then upload. Photos are shrunk automatically.</li></ol>
      <label class="drop" id="p_drop"><input type="file" id="p_file" accept="image/*" multiple><b>Choose photos</b><span>Drop up to 60 images here or tap to choose</span></label>
    </section>
  </div>
  <div id="b_out" style="margin-top:22px"></div>`;
  $('#b_exp').onclick=()=>download(`sapphire-products-${new Date().toISOString().slice(0,10)}.csv`,makeCSV([COLS,...PRODUCTS.map(toRowCSV)]));
  $('#b_tpl').onclick=()=>download('sapphire-products-template.csv',makeCSV([COLS,['new-scent','perfume','New Scent','75000','yes','yes','','Sweet oud','Oud; Vanilla','new; sweet','A short story about the scent.','']]));
  const hook=(drop,input,fn)=>{input.onchange=e=>{if(e.target.files.length)fn(e.target.files);e.target.value=''};
    drop.ondragover=e=>{e.preventDefault();drop.classList.add('over')};drop.ondragleave=()=>drop.classList.remove('over');
    drop.ondrop=e=>{e.preventDefault();drop.classList.remove('over');if(e.dataTransfer.files.length)fn(e.dataTransfer.files)}};
  hook($('#b_drop'),$('#b_file'),f=>readCSV(f[0]));
  hook($('#p_drop'),$('#p_file'),f=>matchPhotos(f));
}
async function readCSV(file){
  const out=$('#b_out');
  if(!/\.csv$/i.test(file.name)&&file.type!=='text/csv'){out.innerHTML='<p class="err">That isn’t a CSV file. In Excel or Google Sheets choose File › Save as / Download › CSV.</p>';return}
  const rows=parseCSV(await file.text());
  if(rows.length<2){out.innerHTML='<p class="err">The file is empty.</p>';return}
  const head=rows[0].map(h=>h.trim().toLowerCase().replace(/\s+/g,'_'));
  if(!head.includes('id')&&!head.includes('name')){out.innerHTML='<p class="err">The first row needs column names, including id or name. Download the template to see the layout.</p>';return}
  const plan=rows.slice(1).map((r,i)=>planRow(Object.fromEntries(head.map((h,j)=>[h,(r[j]||'').trim()])),i+2));
  const ok=plan.filter(p=>p.status==='new'||p.status==='upd');
  const n={new:plan.filter(p=>p.status==='new').length,upd:plan.filter(p=>p.status==='upd').length,same:plan.filter(p=>p.status==='same').length,bad:plan.filter(p=>p.status==='bad').length};
  out.innerHTML=`<div class="head"><div><h2 style="font-size:24px">Check the changes</h2><p>${n.new} new · ${n.upd} updated · ${n.same} unchanged${n.bad?` · <b style="color:var(--bad)">${n.bad} with problems (skipped)</b>`:''}</p></div>
    <div style="display:flex;gap:10px"><button class="btn" id="b_cancel">Cancel</button><button class="btn primary" id="b_go" ${ok.length?'':'disabled'}>Save ${ok.length} change${ok.length===1?'':'s'}</button></div></div>
  <div class="tblwrap"><table class="t"><thead><tr><th>Row</th><th>Status</th><th>Product</th><th>What changes</th></tr></thead><tbody>
  ${plan.map(p=>`<tr><td>${p.line}</td><td><span class="st ${p.status}">${{new:'New',upd:'Update',same:'No change',bad:'Problem'}[p.status]}</span></td><td>${esc(p.label)}</td><td class="diff">${p.status==='bad'?`<span style="color:var(--bad)">${esc(p.error)}</span>`:p.diff.map(x=>`${esc(x[0])}: ${x[1]===undefined?'':esc(x[1])+' → '}<b>${esc(x[2])}</b>`).join('<br>')||'—'}</td></tr>`).join('')}
  </tbody></table></div>`;
  $('#b_cancel').onclick=()=>{out.innerHTML=''};
  $('#b_go').onclick=async e=>{const b=e.target;b.setAttribute('aria-busy','true');b.textContent='Saving…';let done=0,failed=[];
    for(const p of ok){try{
      if(p.status==='new'){const r=await api('products',{method:'POST',body:p.row,prefer:'return=representation'});PRODUCTS.push(r[0])}
      else{const cur=PRODUCTS.find(x=>x.id===p.row.id);await patch(cur,p.row.changes)}
      done++;b.textContent=`Saving ${done} of ${ok.length}…`}catch(er){failed.push(`${p.label}: ${er.message}`)}}
    out.innerHTML=`<div class="card"><h3>${done} change${done===1?'':'s'} saved</h3>${failed.length?`<p class="err">${failed.length} couldn’t be saved:<br>${failed.map(esc).join('<br>')}</p>`:'<p>Everything is live on the shop within a minute.</p>'}</div>`;
    toast(`${done} product${done===1?'':'s'} saved`)};
}
function planRow(c,line){
  const id=(c.id||slug(c.name)+((c.type||'').toLowerCase()==='refill'&&c.name?'-refill':'')).toLowerCase();
  const cur=PRODUCTS.find(p=>p.id===id);
  const label=c.name||(cur&&cur.name)||id||'(no name)';
  const bad=m=>({line,label,status:'bad',error:m,diff:[]});
  if(!/^[a-z0-9][a-z0-9-]{0,62}$/.test(id))return bad('Needs an id or name');
  const price=c.price!==undefined&&c.price!==''?parseInt(String(c.price).replace(/[^\d]/g,''),10):undefined;
  if(c.price&&isNaN(price))return bad(`Price “${c.price}” isn’t a number`);
  const type=(c.type||'').toLowerCase().replace(/s$/,'').replace('scent refill','refill');
  if(type&&!TYPES[type])return bad(`Type must be perfume, refill or diffuser`);
  if(cur&&type&&type!==cur.type)return bad(`It’s already a ${TYPES[cur.type].toLowerCase()}; the type can’t change`);
  if(!cur){
    if(!c.name)return bad('New products need a name');
    if(!type)return bad('New products need a type: perfume, refill or diffuser');
    if(price===undefined)return bad('New products need a price');
  }
  const data=cur?JSON.parse(JSON.stringify(cur.data||{})):{};
  const t=cur?cur.type:type;
  if(c.family)data.family=c.family;
  if(c.notes)data.notes=listOf(c.notes);
  if(c.tags)data.tags=listOf(c.tags).map(s=>s.toLowerCase().replace('best seller','best'));
  if(c.story){if(t==='diffuser')data.summary=c.story;else data.story=c.story}
  if(c.photo_url){if(!/^https:\/\//.test(c.photo_url))return bad('photo_url must start with https://');
    if(t==='perfume')data.img=c.photo_url;else if(t==='refill'){data.photo=c.photo_url;data.thumb=c.photo_url}else data.images=[c.photo_url,...(data.images||[]).filter(u=>u!==c.photo_url)]}
  if(!cur){if(t==='perfume'){data.notes=data.notes||[];data.tags=data.tags||[];data.img=data.img||'amber'}if(t==='refill'){data.note=data.note||(data.notes||[])[0]||'Drop'}}
  const row={name:c.name||undefined,price,in_stock:c.in_stock!==undefined&&c.in_stock!==''?yes(c.in_stock):undefined,visible:c.visible!==undefined&&c.visible!==''?yes(c.visible):undefined,sort:c.sort!==undefined&&c.sort!==''?parseInt(c.sort,10)||0:undefined,data};
  for(const k of Object.keys(row))if(row[k]===undefined)delete row[k];
  if(!cur){
    const sort=row.sort||(Math.max(0,...PRODUCTS.filter(x=>x.type===t).map(x=>x.sort||0))+10);
    return {line,label,status:'new',row:{id,type:t,in_stock:true,visible:true,...row,sort},diff:[['Type',undefined,TYPES[t]],['Price',undefined,fmt(price)]]};
  }
  const diff=[],changes={};
  const cmp=(k,lab,a,b,show=v=>v)=>{if(b!==undefined&&JSON.stringify(a)!==JSON.stringify(b)){diff.push([lab,show(a),show(b)]);return true}return false};
  if(cmp('name','Name',cur.name,row.name))changes.name=row.name;
  if(cmp('price','Price',+cur.price,row.price,fmt))changes.price=row.price;
  if(cmp('in_stock','In stock',cur.in_stock,row.in_stock,v=>v?'yes':'no'))changes.in_stock=row.in_stock;
  if(cmp('visible','On shop',cur.visible,row.visible,v=>v?'yes':'no'))changes.visible=row.visible;
  if(cmp('sort','Order',cur.sort,row.sort))changes.sort=row.sort;
  const dd=[];for(const k of new Set([...Object.keys(cur.data||{}),...Object.keys(data)]))if(JSON.stringify((cur.data||{})[k])!==JSON.stringify(data[k]))dd.push(k);
  if(dd.length){changes.data=data;dd.forEach(k=>diff.push([({story:'Story',summary:'Summary',notes:'Notes',tags:'Collections',family:'Family',img:'Photo',photo:'Photo',thumb:'Photo thumbnail',images:'Photos'})[k]||k,undefined,Array.isArray(data[k])?data[k].join(', '):String(data[k]??'').slice(0,80)]))}
  return {line,label,status:diff.length?'upd':'same',row:{id,changes},diff};
}
async function matchPhotos(files){
  const out=$('#b_out');
  const list=[...files].filter(f=>/^image\//.test(f.type)||/\.(jpe?g|png|webp|gif|heic)$/i.test(f.name)).slice(0,60);
  const find=f=>{const base=slug(f.name.replace(/\.[^.]+$/,'').replace(/[-_ ]?(\d+|sm|small|photo|img)$/i,''));
    return PRODUCTS.find(p=>p.id===base)||PRODUCTS.find(p=>slug(p.name)===base&&p.type==='perfume')||PRODUCTS.find(p=>slug(p.name)===base)||PRODUCTS.find(p=>p.id===base+'-refill')||null};
  const plan=list.map(f=>({f,p:find(f),url:URL.createObjectURL(f)}));
  const matched=plan.filter(x=>x.p);
  out.innerHTML=`<div class="head"><div><h2 style="font-size:24px">Match photos</h2><p>${matched.length} of ${plan.length} photos matched a product. Change any match below.</p></div>
    <div style="display:flex;gap:10px"><button class="btn" id="m_cancel">Cancel</button><button class="btn primary" id="m_go">Upload photos</button></div></div>
  <div class="tblwrap"><table class="t"><thead><tr><th>Photo</th><th>File</th><th>Product</th><th>Use as</th></tr></thead><tbody>
  ${plan.map((x,i)=>`<tr><td><img src="${x.url}" alt="" style="width:56px;height:56px;object-fit:cover;border-radius:8px"></td><td>${esc(x.f.name)}</td>
   <td><select class="sel" data-m="${i}" aria-label="Product for ${esc(x.f.name)}"><option value="">Skip this photo</option>${['perfume','refill','diffuser'].map(t=>`<optgroup label="${TYPES[t]}s">${PRODUCTS.filter(p=>p.type===t).map(p=>`<option value="${esc(p.id)}"${x.p&&x.p.id===p.id?' selected':''}>${esc(p.name)}</option>`).join('')}</optgroup>`).join('')}</select></td>
   <td><select class="sel" data-u="${i}" aria-label="How to use ${esc(x.f.name)}"><option value="main">Main photo</option><option value="extra">Extra photo (diffusers)</option></select></td></tr>`).join('')}
  </tbody></table></div>`;
  $('#m_cancel').onclick=()=>{plan.forEach(x=>URL.revokeObjectURL(x.url));out.innerHTML=''};
  $('#m_go').onclick=async e=>{const b=e.target;b.setAttribute('aria-busy','true');let done=0,failed=[];
    const jobs=plan.map((x,i)=>({x,id:$(`[data-m="${i}"]`).value,use:$(`[data-u="${i}"]`).value})).filter(j=>j.id);
    for(const j of jobs){b.textContent=`Uploading ${done+1} of ${jobs.length}…`;
      try{const p=PRODUCTS.find(q=>q.id===j.id);const r=await uploadPhoto(p.id,j.x.f);const data=JSON.parse(JSON.stringify(p.data||{}));
        if(p.type==='perfume')data.img=r.url;else if(p.type==='refill'){data.photo=r.url;data.thumb=r.thumb}
        else data.images=j.use==='extra'?[...(data.images||[]),r.url]:[r.url,...(data.images||[])];
        await patch(p,{data});done++}catch(er){failed.push(`${j.x.f.name}: ${er.message}`)}}
    plan.forEach(x=>URL.revokeObjectURL(x.url));
    out.innerHTML=`<div class="card"><h3>${done} photo${done===1?'':'s'} uploaded</h3>${failed.length?`<p class="err">${failed.map(esc).join('<br>')}</p>`:'<p>They show on the shop within a minute.</p>'}</div>`;
    toast(`${done} photo${done===1?'':'s'} uploaded`)};
}

/* ---------------- history ---------------- */
async function historyView(){
  const v=$('#view');v.innerHTML=`<div class="head"><div><h2>History</h2><p>The last 150 changes, newest first: who changed what, and when.</p></div></div><div class="hist" id="hl"><div class="empty">Loading…</div></div>`;
  let rows;try{rows=await api('product_changes?select=*&order=changed_at.desc&limit=150')}catch(e){$('#hl').innerHTML=`<div class="empty">${esc(e.message)}</div>`;return}
  if(!rows.length){$('#hl').innerHTML='<div class="empty">No changes yet.</div>';return}
  const say=r=>{const a=r.after||{},b=r.before||{},n=esc(a.name||b.name||r.product_id);
    if(r.action==='added')return `Added <b>${n}</b> (${TYPES[a.type]||''}, ${fmt(a.price)})`;
    if(r.action==='deleted')return `Deleted <b>${n}</b>`;
    const ch=[];if(a.name!==b.name)ch.push(`renamed from ${esc(b.name)}`);if(a.price!==b.price)ch.push(`price ${fmt(b.price)} → <b>${fmt(a.price)}</b>`);
    if(a.in_stock!==b.in_stock)ch.push(a.in_stock?'back in stock':'marked <b>sold out</b>');if(a.visible!==b.visible)ch.push(a.visible?'shown on the shop':'<b>hidden</b> from the shop');
    if(a.sort!==b.sort)ch.push('order changed');
    const da=a.data||{},db=b.data||{};const keys=[...new Set([...Object.keys(da),...Object.keys(db)])].filter(k=>JSON.stringify(da[k])!==JSON.stringify(db[k]));
    const nice={story:'story',summary:'summary',body:'details',notes:'notes',tags:'collections',family:'family',img:'photo',photo:'photo',thumb:null,images:'photos',features:'features',specs:'specifications',tagline:'tagline',pair:'headline pair',a:'colour',perfume:'matching perfume',note:'main note',bestFor:'best for'};
    const ks=[...new Set(keys.map(k=>nice[k]===undefined?k:nice[k]).filter(Boolean))];if(ks.length)ch.push('updated '+ks.join(', '));
    return `<b>${n}</b>: ${ch.join(', ')||'saved'}`};
  $('#hl').innerHTML=rows.map(r=>`<div class="hrow"><time datetime="${esc(r.changed_at)}">${new Date(r.changed_at).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</time><div>${say(r)}<br><small>by ${esc(r.changed_by||'unknown')}</small></div></div>`).join('');
}

/* ---------------- team ---------------- */
async function teamView(){
  const v=$('#view');const owner=ME.role==='owner';
  v.innerHTML=`<div class="head"><div><h2>Team</h2><p>People who can sign in to this dashboard.</p></div></div>
  <div class="cards2"><section class="card"><h3>Staff list</h3><div id="tl">Loading…</div></section>
  <section class="card"><h3>${owner?'Add someone':'Need access for someone?'}</h3>${owner?`
    <form id="tf" class="grid2" novalidate><label class="f">Email<input class="in" id="t_email" type="email" required></label><label class="f">Name<input class="in" id="t_name"></label>
    <label class="f">Role<select class="sel" id="t_role"><option value="editor">Editor: products and photos</option><option value="owner">Owner: also manages the team</option></select></label>
    <div style="align-self:end"><button class="btn primary" type="submit">Add to staff list</button></div></form>
    <p class="hint">Then create their login: in Supabase, open Authentication › Users › Add user, enter the same email, set a password and tick “Auto confirm”. Share the password with them privately; they can change it with “Forgot your password?”.</p><p class="err" id="t_err" hidden></p>`
    :'<p>Ask a Sapphire owner to add them.</p>'}</section></div>`;
  const draw=async()=>{let rows;try{rows=await api('staff?select=*&order=role.asc,email.asc')}catch(e){$('#tl').textContent=e.message;return}
    $('#tl').innerHTML=`<div class="tblwrap"><table class="t"><thead><tr><th>Name</th><th>Email</th><th>Role</th>${owner?'<th></th>':''}</tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.name||'')}</td><td>${esc(r.email)}</td><td>${r.role==='owner'?'Owner':'Editor'}</td>${owner?`<td>${r.email===ME.email?'You':`<button class="btn small danger" data-rmstaff="${esc(r.email)}">Remove</button>`}</td>`:''}</tr>`).join('')}</tbody></table></div>`;
    $$('[data-rmstaff]').forEach(b=>b.onclick=async()=>{if(b.dataset.sure!=='1'){b.dataset.sure='1';b.textContent='Tap again to remove';return}
      try{await api(`staff?email=eq.${encodeURIComponent(b.dataset.rmstaff)}`,{method:'DELETE'});toast('Removed from the staff list');draw()}catch(e){toast(e.message,true)}})};
  draw();
  const tf=$('#tf');tf&&(tf.onsubmit=async e=>{e.preventDefault();const er=$('#t_err');er.hidden=true;const email=$('#t_email').value.trim().toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){er.hidden=false;er.textContent='Enter a valid email.';return}
    try{await api('staff',{method:'POST',body:{email,name:$('#t_name').value.trim()||null,role:$('#t_role').value}});tf.reset();toast(`${email} added to the staff list`);draw()}
    catch(err){er.hidden=false;er.textContent=/duplicate/i.test(err.message)?'They’re already on the list.':err.message}});
}

/* ---------------- start ---------------- */
async function start(){
  try{const r=await fetch('assets/js/config.json',{cache:'no-store'});CFG=await r.json()}catch(e){$('#app').innerHTML='<div class="boot">The dashboard couldn’t load its settings. Refresh to try again.</div>';return}
  if(!CFG.supabaseKey||CFG.supabaseKey==='PENDING'){$('#app').innerHTML='<div class="boot">The dashboard is being set up. Check back shortly.</div>';return}
  // returning from a password-reset email
  const h=new URLSearchParams(location.hash.slice(1));
  if(h.get('access_token')&&['recovery','invite','signup','magiclink'].includes(h.get('type'))){saveSession(asSession({access_token:h.get('access_token'),refresh_token:h.get('refresh_token'),expires_in:+h.get('expires_in')||3600}));history.replaceState(null,'',location.pathname);return loginView('newpw')}
  if(h.get('error_description')){history.replaceState(null,'',location.pathname);return loginView('in',h.get('error_description').replace(/\+/g,' '))}
  S=S||loadSession();
  if(!S)return loginView();
  try{
    const email=(S.user&&S.user.email||'').toLowerCase();
    const me=await api(`staff?select=*&email=eq.${encodeURIComponent(email)}`);
    if(!me||!me.length){const e=email;await signOut();return loginView('in',`${e} isn’t on the Sapphire staff list yet. Ask an owner to add you.`)}
    ME=me[0];
    await loadProducts();
    const want=location.hash.slice(1);if(['products','bulk','history','team'].includes(want))VIEW=want;
    shell();
  }catch(e){if(!S)return;$('#app').innerHTML=`<div class="boot">${esc(e.message)} <button class="btn small" onclick="location.reload()">Try again</button></div>`}
}
start();
})();

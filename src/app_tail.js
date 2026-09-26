/* =====================================================================
   OMRÅDE — valgt område gemmes kun lokalt (localStorage), aldrig uploadet.
   { name, region, lat, lon, radius(km), skov, trees[], bund[] }
   ===================================================================== */
const AREA_DEFAULT={name:"Asserbo",region:"Nordsjælland",lat:56.00,lon:11.98,radius:5,skov:"nal",trees:["fyr","gran"],bund:["mos","naale","sand"]};
function area(){return LS.get("omraade",null)||AREA_DEFAULT}
function setArea(a){LS.set("omraade",a);const rec=LS.get("omraader",[]).filter(x=>x.name!==a.name);rec.unshift(a);LS.set("omraader",rec.slice(0,6))}
const SKOV={nal:"Nåleskov",lov:"Løvskov",bland:"Blandskov",aaben:"Åbent landskab"};
const TREEN={fyr:"fyr",gran:"gran",birk:"birk",bog:"bøg",eg:"eg",andre:"andre træer"};
const BUNDN={mos:"mos",naale:"nåledække",blade:"blade",graes:"græs",sand:"sandet jord"};
function areaLine(a){const p=[];if(a.skov)p.push(SKOV[a.skov]);if(a.trees&&a.trees.length)p.push(a.trees.map(t=>TREEN[t]).join("/"));if(a.bund&&a.bund.length)p.push(a.bund.map(b=>BUNDN[b]).join(", "));return p.join(" · ")}
/* Faste forslag, bruges også når kortet ikke kan hentes (offline). Koordinater er omtrentlige. */
const PRESETS=[
  {name:"Asserbo",region:"Nordsjælland",lat:56.00,lon:11.98},{name:"Tisvilde Hegn",region:"Nordsjælland",lat:56.04,lon:12.05},
  {name:"Gribskov",region:"Nordsjælland",lat:55.99,lon:12.30},{name:"Rude Skov",region:"Nordsjælland",lat:55.83,lon:12.49},
  {name:"Rold Skov",region:"Himmerland",lat:56.80,lon:9.85},{name:"Silkeborgskovene",region:"Midtjylland",lat:56.13,lon:9.55},
  {name:"Almindingen",region:"Bornholm",lat:55.12,lon:14.92},{name:"Nationalpark Thy",region:"Thy",lat:57.00,lon:8.55}];

/* =====================================================================
   GEOGRAFI — et let filter/rangeringslag over det samme artsbibliotek.
   GEO[id]: iNaturalist research-grade observationer i et 0,5°-gitter
   (50–66°N, 5°V–30°Ø). 4 tegn pr. celle: indeks (base36, 3 tegn) + antal (0–9).
   GEO.__effort: alle guidens arter samlet = hvor godt området er dækket.
   Kun positive fund tæller: fravær af observationer er ikke bevis for fravær.
   ===================================================================== */
const G={lat0:50,lon0:-5,d:.5,cols:70,rows:32};
function cellOf(lat,lon){const r=Math.floor((lat-G.lat0)/G.d),c=Math.floor((lon-G.lon0)/G.d);if(r<0||c<0||r>=G.rows||c>=G.cols)return -1;return r*G.cols+c}
const GEOC={};
function geoMap(id){if(GEOC[id])return GEOC[id];const m=new Map(),s=(typeof GEO!=="undefined"&&GEO[id])||"";for(let i=0;i+4<=s.length;i+=4)m.set(parseInt(s.substr(i,3),36),+s[i+3]);return GEOC[id]=m}
function nearCount(id,lat,lon){const c0=cellOf(lat,lon);if(c0<0)return null;const r0=Math.floor(c0/G.cols),k0=c0%G.cols,m=geoMap(id);let n=0;
  for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const r=r0+dr,k=k0+dc;if(r>=0&&k>=0&&r<G.rows&&k<G.cols)n+=m.get(r*G.cols+k)||0}return n}
function coverage(a){const n=nearCount("__effort",a.lat,a.lon);return n==null?"ude":n<20?"lav":"god"}

/* Relevans = sæson + skovtype + træer + skovbund + registreret i regionen.
   Understøttende evidens — skjuler aldrig arter og bestemmer aldrig noget. */
function relevance(s,a,month){
  a=a||area(); month=month||new Date().getMonth()+1;
  let sc=0; const why=[]; const m=s.m||[];
  const inS=m.includes(month), edge=m.includes(month%12+1)||m.includes((month+10)%12+1);
  if(inS){sc+=3;why.push("Sæson nu")} else if(edge){sc+=.5;why.push("Kant af sæsonen")} else {sc-=3;why.push("Uden for sæson")}
  const vv=s.vv||[], forest=vv.filter(v=>v!=="ved"), sted=s.k.sted||[];
  const conif=vv.includes("fyr")||vv.includes("gran"), decid=vv.includes("lov")||vv.includes("birk");
  const open=sted.includes("graes")||(s.k.hab||[]).includes("aaben");
  if(a.skov==="nal"){if(conif)sc+=1.5;else if(open&&!forest.length)sc-=1.5;else if(decid)sc-=1}
  if(a.skov==="lov"){if(decid)sc+=1.5;else if(conif)sc-=1;else if(open&&!forest.length)sc-=1}
  if(a.skov==="bland"&&(conif||decid))sc+=1;
  if(a.skov==="aaben"){if(open){sc+=2;why.push("Åbent landskab")}else sc-=1.5}
  const at=[...new Set((a.trees||[]).map(t=>t==="bog"||t==="eg"?"lov":t).filter(t=>t!=="andre"))];
  if(at.length&&forest.length){const hit=forest.filter(v=>at.includes(v));
    if(hit.length){sc+=2;why.push("Ved "+hit.map(v=>({fyr:"fyr",gran:"gran",birk:"birk",lov:"løvtræ"})[v]).join("/"))} else sc-=1.5}
  const sb=(s.bund||[]).concat(sted), bm={mos:"mos",naale:"naale",graes:"graes",sand:"sand",blade:"jord"};
  if((a.bund||[]).some(x=>sb.includes(bm[x])))sc+=.5;
  const n=nearCount(s.id,a.lat,a.lon);
  if(n>0){sc+=2;why.push("Registreret i regionen")}
  return {sc,why,n,inS};
}
function ranked(list,a){const mo=new Date().getMonth()+1;return list.map(s=>({s,r:relevance(s,a,mo)})).sort((x,y)=>y.r.sc-x.r.sc)}
const isDanger=s=>s.st==="meget"||s.st==="gift";
function watchList(a){
  const r=ranked(SP,a); const top=r.slice(0,10);
  let d=top.filter(x=>isDanger(x.s)).length;
  for(const x of r.slice(10)){ if(d>=3)break; if(isDanger(x.s)&&x.r.inS){for(let i=top.length-1;i>=0;i--){if(!isDanger(top[i].s)){top.splice(i,1);break}} top.push(x);d++} }
  return top.sort((x,y)=>y.r.sc-x.r.sc);
}

/* ---------- kort (Leaflet + OpenStreetMap, hentes først når kortet åbnes) ---------- */
let LEAF=null;
function loadLeaflet(){
  if(window.L) return Promise.resolve();
  if(LEAF) return LEAF;
  LEAF=new Promise((res,rej)=>{
    const c=document.createElement("link");c.rel="stylesheet";c.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";document.head.appendChild(c);
    const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    const t=setTimeout(()=>{LEAF=null;rej(new Error("timeout"))},12000);
    s.onload=()=>{clearTimeout(t);res()};s.onerror=()=>{clearTimeout(t);LEAF=null;rej(new Error("offline"))};document.head.appendChild(s);
  });
  return LEAF;
}
const NOMI="https://nominatim.openstreetmap.org";
async function geoSearch(q){const r=await fetch(`${NOMI}/search?format=jsonv2&limit=6&accept-language=da&q=${encodeURIComponent(q)}`);if(!r.ok)throw 0;return (await r.json()).map(x=>({name:(x.name||x.display_name.split(",")[0]),region:x.display_name.split(",").slice(1,3).join(",").trim(),lat:+x.lat,lon:+x.lon}))}
async function geoName(lat,lon){try{const r=await fetch(`${NOMI}/reverse?format=jsonv2&zoom=13&accept-language=da&lat=${lat}&lon=${lon}`);const j=await r.json();const a=j.address||{};
  return {name:a.village||a.town||a.hamlet||a.suburb||a.city||a.municipality||j.name||"Valgt sted",region:a.municipality||a.county||a.state||""}}catch(e){return {name:"Valgt sted",region:""}}}
const r3=x=>Math.round(x*1000)/1000; /* ca. 100 m – præcis GPS gemmes ikke */

let AOV=null;
function openArea(){
  const cur=area();
  AOV={d:{...cur},step:"map",map:null,circle:null,mark:null};
  const el=document.createElement("div");el.id="areaov";document.body.appendChild(el);document.body.classList.add("noscroll");
  drawArea();
}
function closeArea(){const el=$("#areaov");if(AOV&&AOV.map){AOV.map.remove()}AOV=null;if(el)el.remove();document.body.classList.remove("noscroll")}
function drawArea(){
  const el=$("#areaov"), d=AOV.d;
  if(AOV.step==="map"){
    const rec=LS.get("omraader",[]).filter(x=>x.name!==d.name).slice(0,4);
    el.innerHTML=`<div class="ov-top"><span class="lbl">Vælg område</span><button class="ov-x" aria-label="Luk">×</button></div>
    <div class="ov-q"><h1>Hvor skal du på svampetur?</h1></div>
    <form class="ov-search"><input type="search" enterkeyhint="search" placeholder="Søg efter et sted …" aria-label="Søg efter et sted"><button class="lbl">Søg</button></form>
    <div class="ov-res"></div>
    <div id="map"><div class="map-msg">Henter kort …</div></div>
    <div class="ov-bottom">
      <div class="ov-sel"><span class="lbl dim">Valgt</span><b id="selName">${esc(d.name)}</b><span class="dim" id="selReg">${esc(d.region||"")}</span></div>
      <div class="ov-rad">${[[5,"Nærområde","ca. 5 km"],[15,"Større område","ca. 15 km"]].map(([r,t,s])=>`<button data-r="${r}" class="${d.radius==r?"on":""}">${t}<small>${s}</small></button>`).join("")}</div>
      ${rec.length?`<div class="ov-recent"><span class="lbl dim">Tidligere</span>${rec.map((x,i)=>`<button data-rec="${i}">${esc(x.name)}</button>`).join("")}</div>`:""}
      <div class="ov-btns"><button id="myPos" class="btn">Brug min position</button><button id="useArea" class="btn fill">Brug dette område</button></div>
    </div>`;
    $(".ov-x",el).onclick=closeArea;
    const setSel=(p,move)=>{Object.assign(d,{name:p.name,region:p.region||"",lat:r3(p.lat),lon:r3(p.lon)});$("#selName").textContent=d.name;$("#selReg").textContent=d.region||"";
      if(AOV.map){AOV.mark.setLatLng([d.lat,d.lon]);AOV.circle.setLatLng([d.lat,d.lon]);if(move)AOV.map.setView([d.lat,d.lon],11)}};
    el.querySelectorAll("[data-rec]").forEach(b=>b.onclick=()=>{const x=rec[+b.dataset.rec];Object.assign(d,x);setSel(x,true)});
    el.querySelectorAll(".ov-rad button").forEach(b=>b.onclick=()=>{d.radius=+b.dataset.r;el.querySelectorAll(".ov-rad button").forEach(x=>x.classList.toggle("on",x===b));if(AOV.circle)AOV.circle.setRadius(d.radius*1000)});
    $(".ov-search",el).onsubmit=async e=>{e.preventDefault();const q=$("input",e.target).value.trim();const box=$(".ov-res",el);if(!q)return;box.innerHTML=`<p class="dim">Søger …</p>`;
      try{const res=await geoSearch(q);box.innerHTML=res.length?res.map((x,i)=>`<button data-i="${i}"><b>${esc(x.name)}</b><span>${esc(x.region)}</span></button>`).join(""):`<p class="dim">Ingen steder fundet.</p>`;
        box.querySelectorAll("button").forEach(b=>b.onclick=()=>{setSel(res[+b.dataset.i],true);box.innerHTML="";$("input",e.target).blur()})}
      catch(err){box.innerHTML=`<p class="dim">Søgning kræver internet. Vælg et forslag:</p>`+presetsHTML();bindPresets(box,setSel)}};
    $("#myPos").onclick=()=>{if(!navigator.geolocation){alert("Din browser kan ikke finde din position.");return}
      $("#myPos").textContent="Finder position …";
      navigator.geolocation.getCurrentPosition(async p=>{const lat=r3(p.coords.latitude),lon=r3(p.coords.longitude);const nm=await geoName(lat,lon);setSel({lat,lon,...nm},true);$("#myPos").textContent="Brug min position"},
        ()=>{$("#myPos").textContent="Brug min position";alert("Positionen kunne ikke hentes. Tjek at Safari har adgang til lokalitet.")},{enableHighAccuracy:false,timeout:10000,maximumAge:300000})};
    $("#useArea").onclick=()=>{ if(!(d.name===area().name&&d.lat===area().lat)){d.skov=null;d.trees=[];d.bund=[]} AOV.step="skov";drawArea()};
    loadLeaflet().then(()=>{
      if(!AOV||AOV.step!=="map")return;
      const m=L.map("map",{zoomControl:false,attributionControl:true}).setView([d.lat,d.lon],10);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:"© OpenStreetMap"}).addTo(m);
      AOV.circle=L.circle([d.lat,d.lon],{radius:d.radius*1000,color:"#111",weight:1,fillColor:"#111",fillOpacity:.05}).addTo(m);
      AOV.mark=L.marker([d.lat,d.lon],{icon:L.divIcon({className:"pin",iconSize:[14,14]})}).addTo(m);
      m.on("click",async e=>{const lat=r3(e.latlng.lat),lon=r3(e.latlng.lng);setSel({lat,lon,name:"…",region:""});const nm=await geoName(lat,lon);if(AOV&&d.lat===lat)setSel({lat,lon,...nm})});
      AOV.map=m;
    }).catch(()=>{const mp=$("#map");if(mp){mp.innerHTML=`<div class="map-msg"><p>Kortet kræver internet. Resten af guiden virker stadig.</p><span class="lbl dim">Vælg et område</span>${presetsHTML()}</div>`;bindPresets(mp,setSel)}});
    return;
  }
  const steps={
    skov:{t:"Hvordan ser skoven ud?",h:"Et hurtigt indtryk er nok.",multi:false,o:[["nal","Mest nåletræ"],["lov","Mest løvtræ"],["bland","Blandskov"],["aaben","Åbent landskab"]],next:"trees"},
    trees:{t:"Hvilke træer ser du?",h:"Vælg gerne flere.",multi:true,o:[["fyr","Fyr"],["gran","Gran"],["birk","Birk"],["bog","Bøg"],["eg","Eg"],["andre","Andre"]],next:"bund"},
    bund:{t:"Skovbunden",h:"Hvad dækker jorden?",multi:true,o:[["mos","Mos"],["naale","Nåledække"],["blade","Blade"],["graes","Græs"],["sand","Sandet"]],next:null}
  };
  const st=steps[AOV.step], key=AOV.step, val=d[key]||(st.multi?[]:null);
  el.innerHTML=`<div class="ov-top"><span class="lbl">${esc(d.name)}</span><button class="ov-x" aria-label="Luk">×</button></div>
    <div class="ov-q"><span class="lbl dim">${["skov","trees","bund"].indexOf(key)+1} / 3</span><h1>${st.t}</h1><p class="dim">${st.h}</p></div>
    <div class="hab-opts">${st.o.map(([v,l])=>`<button data-v="${v}" class="${(st.multi?val.includes(v):val===v)?"on":""}">${l}</button>`).join("")}</div>
    <div class="ov-btns col">${st.multi?`<button class="btn fill" id="habNext">${st.next?"Videre":"Færdig"}</button>`:""}<button class="btn" id="habDk">Ved ikke</button><button class="lbl dim ov-skip" id="habSkip">Spring over</button></div>`;
  $(".ov-x",el).onclick=closeArea;
  const go=()=>{if(st.next){AOV.step=st.next;drawArea()}else{setArea(d);closeArea();render()}};
  el.querySelectorAll(".hab-opts button").forEach(b=>b.onclick=()=>{const v=b.dataset.v;
    if(st.multi){const a=new Set(d[key]||[]);a.has(v)?a.delete(v):a.add(v);d[key]=[...a];b.classList.toggle("on")}
    else{d[key]=v;go()}});
  $("#habDk").onclick=()=>{d[key]=st.multi?[]:null;go()};
  $("#habSkip").onclick=()=>{setArea(d);closeArea();render()};
  const nx=$("#habNext");if(nx)nx.onclick=go;
}
function presetsHTML(){return `<div class="presets">${PRESETS.map((p,i)=>`<button data-p="${i}"><b>${p.name}</b><span>${p.region}</span></button>`).join("")}</div>`}
function bindPresets(root,setSel){root.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>setSel(PRESETS[+b.dataset.p],true))}

/* =====================================================================
   FUND — lokal feltnotesbog i IndexedDB. Intet uploades.
   finds:  { id, schema:1, created, updated,
             area:{name,lat,lon,radius}|null,
             photos:{ hele|hat|under|stok : {thumb:{type,buf}, w, h} },
             obs:{ under, trees[], sted[], farve },
             ident:{ status:"ukendt"|"bud"|"bestemt", species, by },
             note }
   photos: { key:"<id>:<slot>", type, buf }   (fuld opløsning, maks. 1800 px)
   Strukturen er forberedt til en senere "Analysér mit fund" (fire fotos +
   observationer + område) – der sendes intet nogen steder i dag.
   ===================================================================== */
const DB={db:null,
  open(){if(this.db)return Promise.resolve(this.db);return new Promise((res,rej)=>{const r=indexedDB.open("svampe",1);
    r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains("finds"))d.createObjectStore("finds",{keyPath:"id"});if(!d.objectStoreNames.contains("photos"))d.createObjectStore("photos",{keyPath:"key"})};
    r.onsuccess=()=>{this.db=r.result;res(this.db)};r.onerror=()=>rej(r.error)})},
  async run(store,mode,fn){const d=await this.open();return new Promise((res,rej)=>{const t=d.transaction(store,mode);let out;const q=fn(t.objectStore(store),t);if(q&&"onsuccess" in q)q.onsuccess=()=>{out=q.result};t.oncomplete=()=>res(out);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error)})},
  all(){return this.run("finds","readonly",s=>s.getAll())},
  get(id){return this.run("finds","readonly",s=>s.get(id))},
  put(f){return this.run("finds","readwrite",s=>s.put(f))},
  photo(key){return this.run("photos","readonly",s=>s.get(key))},
  putPhoto(rec){return this.run("photos","readwrite",s=>s.put(rec))},
  async del(id){await this.run("finds","readwrite",s=>s.delete(id));await this.run("photos","readwrite",s=>{for(const k of SLOTS)s.delete(id+":"+k[0])})},
  async clear(){await this.run("finds","readwrite",s=>s.clear());await this.run("photos","readwrite",s=>s.clear())}
};
const toRec=async b=>({type:b.type||"image/jpeg",buf:await b.arrayBuffer()});
const toBlob=r=>r?new Blob([r.buf],{type:r.type}):null;
let URLS=[];
function objURL(rec){const b=toBlob(rec);if(!b)return "";const u=URL.createObjectURL(b);URLS.push(u);return u}
function freeURLs(){URLS.forEach(u=>URL.revokeObjectURL(u));URLS=[]}
let FINDS=[];
async function loadFinds(){try{FINDS=(await DB.all()).sort((a,b)=>b.created-a.created)}catch(e){FINDS=[]}updBadge();return FINDS}
/* flyt gamle "Fundet i dag"-markeringer (localStorage) ind i notesbogen */
async function migrateOld(){
  const old=LS.get("fund",null); if(!old||!Object.keys(old).length) return;
  try{for(const day in old) for(const f of old[day]) await DB.put({id:"old-"+f.id+"-"+f.t,schema:1,created:f.t,updated:f.t,area:null,photos:{},obs:{trees:[],sted:[]},ident:{status:"bud",species:f.id,by:""},note:f.n||"",legacy:true});
    LS.set("fund_migreret",old); localStorage.removeItem("svampe.fund");}catch(e){}
}
const SLOTS=[["hele","Hele svampen","Tag den, hvor den står. Få gerne skovbunden og træerne omkring med.",""],
  ["hat","Hatten","Tag hatten ovenfra. Få farve, overflade og form med.",""],
  ["under","Undersiden","Fotografér tydeligt under hatten.","Se efter lameller, rør, ribber eller pigge."],
  ["stok","Stok og basis","Få hele stokken med – også helt ned til basis.","Stokbasis kan være afgørende for bestemmelsen. Fotografér gerne svampen, hvor den står, før du plukker den – og grav basis fri."]];
const SLOTN={hele:"Hele svampen",hat:"Hatten",under:"Undersiden",stok:"Stok og basis"};
const SLOTI={hele:"hele",hat:"hat",under:"under",stok:"basis"};
const OBS={
  under:{t:"Hvad er der under hatten?",multi:false,o:[["lameller","Lameller"],["ror","Rør / porer"],["ribber","Ribber / folder"],["pigge","Pigge"],["andet","Anden form"]]},
  trees:{t:"Hvilke træer står den ved?",multi:true,o:[["fyr","Fyr"],["gran","Gran"],["birk","Birk"],["lov","Andet løvtræ"],["bland","Blandskov"]]},
  sted:{t:"Hvor vokser den?",multi:true,o:[["mos","Mos"],["naale","Nåledække"],["jord","Jord"],["ved","Dødt ved"],["graes","Græs"]]},
  farve:{t:"Farve på hatten",multi:false,o:[["hvid","Hvid"],["gulgron","Gulgrøn"],["gulorange","Gul / orange"],["rod","Rød"],["brun","Brun"],["grasort","Grå / sort"]]}
};
function obsLine(o){const p=[];if(o.under)p.push(OBS.under.o.find(x=>x[0]===o.under)[1]);(o.trees||[]).forEach(t=>p.push(OBS.trees.o.find(x=>x[0]===t)[1]));(o.sted||[]).forEach(t=>p.push(OBS.sted.o.find(x=>x[0]===t)[1]));return p.join(" · ")}
function identTitle(f){const i=f.ident||{},s=S[i.species];if(i.status==="bestemt"&&s)return s.da;if(i.status==="bud"&&s)return "Mulig "+lcName(s);return "Ukendt"}
const DAYN=["søndag","mandag","tirsdag","onsdag","torsdag","fredag","lørdag"];
const hhmm=t=>{const d=new Date(t);return String(d.getHours()).padStart(2,"0")+"."+String(d.getMinutes()).padStart(2,"0")};
const dayKey=t=>{const d=new Date(t);return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()};
const dayLabel=t=>{const d=new Date(t);return `${d.getDate()}. ${MONN[d.getMonth()]}`};

/* ---------- billedbehandling: skaler ned før lagring ---------- */
async function shrink(file,max,q){
  const url=URL.createObjectURL(file);
  try{const img=new Image();img.src=url;await img.decode();
    let w=img.naturalWidth,h=img.naturalHeight;const k=Math.min(1,max/Math.max(w,h));w=Math.round(w*k);h=Math.round(h*k);
    const c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d");x.imageSmoothingQuality="high";x.drawImage(img,0,0,w,h);
    const blob=await new Promise(r=>c.toBlob(r,"image/jpeg",q));c.width=c.height=0;return {blob,w,h};
  }finally{URL.revokeObjectURL(url)}
}

/* ---------- REGISTRÉR EN SVAMP ---------- */
let REG=null;
function newReg(guess){REG={id:null,created:null,step:0,ph:{},prev:{},obs:{trees:[],sted:[]},ident:{status:guess?"bud":"ukendt",species:guess||null,by:""},note:"",busy:false}}
async function editReg(id){const f=await DB.get(id);if(!f)return false;newReg();Object.assign(REG,{id:f.id,created:f.created,obs:{trees:[],sted:[],...f.obs},ident:{...f.ident},note:f.note||"",step:4,area:f.area,legacyPh:f.photos||{}});
  for(const k in (f.photos||{})){REG.prev[k]=objURL(f.photos[k].thumb);REG.ph[k]={keep:true,...f.photos[k]}}return true}
function regProg(){const lab=["Hele svampen","Hatten","Undersiden","Stok og basis","Se efter","Gem"];
  return `<ol class="rg-prog">${lab.map((l,i)=>`<li class="${i===REG.step?"cur":""}${i<4&&REG.ph[SLOTS[i][0]]?" done":""}"><button data-go="${i}" aria-label="${i+1}: ${l}">${nn(i+1)}</button></li>`).join("")}</ol>`}
V.reg=()=>{
  if(!REG) newReg();
  const top=`<div class="rg-top"><span class="lbl dim">${REG.id?"Redigér fund":"Registrér et fund"}</span><button id="rgCancel">Annullér</button></div>${regProg()}`;
  if(REG.step<4){
    const [k,t,ins,help]=SLOTS[REG.step], pv=REG.prev[k];
    return `${top}<div class="rg-q"><div class="lock-n"><span class="num">${nn(REG.step+1)}</span>${pg(SLOTI[k],22)}<span class="lbl">${SLOTN[k]}</span></div><h1 class="t-state">${t}</h1><p>${ins}</p>${help?`<p class="dim">${help}</p>`:""}</div>
    <div class="rg-shot">${pv?`<img src="${pv}" alt="">`:`<label class="rg-cam"><input type="file" accept="image/*" capture="environment" data-slot="${k}">${pg("kamera",48)}<b>${REG.busy?"Behandler …":"Tag foto"}</b></label>`}</div>
    <div class="rg-act">${pv?`<label class="btn grow"><input type="file" accept="image/*" capture="environment" data-slot="${k}">Tag igen</label><button class="btn fill grow" id="rgNext">Brug foto</button>`
      :`<label class="btn grow"><input type="file" accept="image/*" data-slot="${k}">Vælg fra billeder</label><button class="btn grow" id="rgNext">Spring over</button>`}</div>
    <p class="rg-note">Billeder gemmes kun på denne enhed.</p>`;
  }
  if(REG.step===4){
    const q=(key)=>{const d=OBS[key],v=REG.obs[key];return `<section class="rg-obs"><h2 class="sh">${d.t}</h2><div class="pills rg-chips">${d.o.map(([o,l])=>`<button data-k="${key}" data-v="${o}" class="${(d.multi?(v||[]).includes(o):v===o)?"on":""}">${key==="farve"?`<i style="background:${SWATCH[o]}"></i>`:key==="under"?pg(o==="andet"?"form":o,22,l):""}${l}</button>`).join("")}<button data-k="${key}" data-v="" class="dk ${(d.multi?!(v||[]).length:!v)?"on":""}">Ved ikke</button></div></section>`};
    return `${top}<div class="rg-q"><div class="lock-n"><span class="num">05</span>${pg("under",22)}<span class="lbl">Se efter</span></div><h1 class="t-state">Hvad ser du?</h1><p class="dim">Kun det, du faktisk kan se. Spring over, hvis du er i tvivl.</p></div>
      ${q("under")}${q("trees")}${q("sted")}${q("farve")}
      <div class="rg-act"><button class="btn grow" id="rgNext">Spring over</button><button class="btn fill grow" id="rgNext2">Videre</button></div>`;
  }
  const u=REG.obs.under; const opts=SP.slice().sort((a,b)=>((b.under===u||b.underAlt===u)-(a.under===u||a.underAlt===u))||a.da.localeCompare(b.da,"da"));
  const sel=`<select id="rgSp"><option value="">Vælg art …</option>${u?`<optgroup label="Passer med undersiden">${opts.filter(s=>s.under===u||s.underAlt===u).map(s=>`<option value="${s.id}" ${REG.ident.species===s.id?"selected":""}>${s.da}</option>`).join("")}</optgroup><optgroup label="Øvrige arter">`:""}${opts.filter(s=>!u||!(s.under===u||s.underAlt===u)).map(s=>`<option value="${s.id}" ${REG.ident.species===s.id?"selected":""}>${s.da}</option>`).join("")}${u?"</optgroup>":""}</select>`;
  const st=REG.ident.status;
  return `${top}<div class="rg-q"><div class="lock-n"><span class="num">06</span><span class="lbl">Gem</span></div><h1 class="t-state">Hvad tror du, det er?</h1><p class="dim">Ukendt er et fint svar.</p></div>
    <div class="rg-id">
      <button data-st="ukendt" class="${st==="ukendt"?"on":""}"><b>Ukendt</b><span>Et gyldigt svar. Du har set, fotograferet og noteret.</span></button>
      <button data-st="bud" class="${st==="bud"?"on":""}"><b>Jeg tror, det er …</b><span>Dit eget bud – ikke en bestemmelse.</span></button>
      <button data-st="bestemt" class="${st==="bestemt"?"on":""}"><b>Bestemt af en kyndig</b><span>Fx jeres guide, der har set netop dette eksemplar.</span></button>
    </div>
    ${st!=="ukendt"?`<div class="rg-field"><span class="lbl">${st==="bud"?"Dit bud":"Art"}</span>${sel}</div>`:""}
    ${st==="bestemt"?`<div class="rg-field"><span class="lbl">Bestemt af</span><input id="rgBy" type="text" value="${esc(REG.ident.by||"")}" placeholder="Navn"></div>`:""}
    <div class="rg-field"><span class="lbl">Note</span><textarea id="rgNote" placeholder="Hvad så du? Duft, farveskift, antal …">${esc(REG.note)}</textarea></div>
    <div class="rg-field"><span class="lbl">Område</span><p>${esc((REG.area||area()).name)}</p></div>
    <p class="rg-note">Billeder og noter gemmes kun på denne enhed.</p>
    <div class="rg-act"><button class="btn big" id="rgSave"><span class="bl">Gem fund</span>${arrow}</button></div>`;
};
function bindReg(root){
  $("#rgCancel",root).onclick=()=>{if(Object.keys(REG.ph).some(k=>!REG.ph[k].keep)&&!confirm("Kassér fotos og observationer?"))return;const back=REG.id?"#/fund/"+REG.id:"#/fund";REG=null;freeURLs();location.hash=back};
  root.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{REG.step=+b.dataset.go;render();scrollTo(0,0)});
  root.querySelectorAll("input[type=file]").forEach(inp=>inp.onchange=async()=>{
    const f=inp.files&&inp.files[0];if(!f)return;const k=inp.dataset.slot;REG.busy=true;render(true);
    try{const full=await shrink(f,1800,.82),th=await shrink(full.blob,480,.78);REG.ph[k]={full:full.blob,thumb:th.blob,w:full.w,h:full.h};if(REG.prev[k])URL.revokeObjectURL(REG.prev[k]);REG.prev[k]=URL.createObjectURL(full.blob)}
    catch(e){alert("Billedet kunne ikke læses. Prøv igen.")}REG.busy=false;render(true)});
  const nx=()=>{REG.step++;render();scrollTo(0,0)};
  const n1=$("#rgNext",root);if(n1)n1.onclick=nx;const n2=$("#rgNext2",root);if(n2)n2.onclick=nx;
  root.querySelectorAll(".rg-chips button").forEach(b=>b.onclick=()=>{const k=b.dataset.k,v=b.dataset.v,d=OBS[k];
    if(d.multi){if(!v)REG.obs[k]=[];else{const s=new Set(REG.obs[k]||[]);s.has(v)?s.delete(v):s.add(v);REG.obs[k]=[...s]}}else REG.obs[k]=v||null;render(true)});
  root.querySelectorAll(".rg-id button").forEach(b=>b.onclick=()=>{REG.ident.status=b.dataset.st;if(b.dataset.st==="ukendt")REG.ident.species=null;render(true)});
  const sp=$("#rgSp",root);if(sp)sp.onchange=()=>{REG.ident.species=sp.value||null};
  const by=$("#rgBy",root);if(by)by.oninput=()=>{REG.ident.by=by.value};
  const no=$("#rgNote",root);if(no)no.oninput=()=>{REG.note=no.value};
  const sv=$("#rgSave",root);if(sv)sv.onclick=saveReg;
}
async function saveReg(){
  const btn=$("#rgSave");btn.disabled=true;btn.textContent="Gemmer …";
  try{
    if(REG.ident.status!=="ukendt"&&!REG.ident.species)REG.ident.status="ukendt";
    const id=REG.id||("f"+Date.now().toString(36)+Math.random().toString(36).slice(2,6));const now=Date.now();
    const a=REG.area||area();
    const rec={id,schema:1,created:REG.created||now,updated:now,area:{name:a.name,lat:a.lat,lon:a.lon,radius:a.radius},photos:{},obs:REG.obs,ident:REG.ident,note:REG.note};
    for(const [k] of SLOTS){const p=REG.ph[k];if(!p)continue;
      if(p.keep){rec.photos[k]={thumb:p.thumb,w:p.w,h:p.h};continue}
      rec.photos[k]={thumb:await toRec(p.thumb),w:p.w,h:p.h};await DB.putPhoto({key:id+":"+k,...await toRec(p.full)})}
    await DB.put(rec);
    if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});
    Object.values(REG.prev).forEach(u=>URL.revokeObjectURL(u));REG=null;await loadFinds();location.hash="#/fund/"+id;
  }catch(e){btn.disabled=false;btn.textContent="Gem fund";alert("Fundet kunne ikke gemmes på enheden. Er der plads nok?")}
}

/* ---------- FUND: notesbog ---------- */
V.finds=()=>`${pageHead("","Fund","Det, du har set og fotograferet. Et fund er en observation – ikke en bestemmelse.")}
  <div class="cta-wrap"><a class="btn big" href="#/registrer"><span class="bl">${pg("kamera",24)}Registrér et fund</span>${arrow}</a></div>
  <div id="fdList"><p class="meta pad" style="padding-top:48px">Henter …</p></div>
  <p class="meta pad" style="margin-top:32px">Billederne gemmes kun på denne enhed. Læg guiden på hjemmeskærmen, så gemmer Safari dine fund mere sikkert.</p>`;
async function bindFinds(root){
  freeURLs(); const list=await loadFinds(); const box=$("#fdList",root); if(!box)return;
  if(!list.length){box.innerHTML=`<div class="empty-st">${pg("hele",48)}<p class="t-obs">Notesbogen er tom.</p><p class="intro">Når du ser en svamp, så tag fire billeder og notér, hvad du ser. Du behøver ikke vide, hvad det er.</p></div>`;return}
  let html="",last="";
  for(const f of list){const dk=dayKey(f.created);if(dk!==last){if(last)html+=`</div>`;html+=`<div class="fd-day"><h2 class="t-obs">${dayLabel(f.created)}</h2><span class="lbl">${DAYN[new Date(f.created).getDay()]}</span></div><div class="ix">`;last=dk}
    const slot=["hele","hat","under","stok"].find(k=>f.photos&&f.photos[k]);const ui=f.obs&&f.obs.under;const unk=!f.ident||f.ident.status==="ukendt";
    const img=slot?`<div class="ph"><img src="${objURL(f.photos[slot].thumb)}" alt=""></div>`:`<div class="ph none">${pg(ui?(ui==="andet"?"form":ui):"hele",32)}</div>`;
    html+=`<a href="#/fund/${f.id}">${img}<span class="t"><b class="nm${unk?" unk":""}">${esc(identTitle(f))}</b><span class="m">${hhmm(f.created)}${f.area?" · "+esc(f.area.name):""}</span>${obsLine(f.obs||{})?`<span class="m">${ui?pg(ui==="andet"?"form":ui,16):""}${esc(obsLine(f.obs||{}))}</span>`:""}</span></a>`}
  box.innerHTML=html+`</div>`;
}
V.find=(id)=>`<div id="fdDetail"><p class="meta pad" style="padding-top:48px">Henter …</p></div>`;
async function bindFind(root,id){
  freeURLs();const f=await DB.get(id).catch(()=>null);const box=$("#fdDetail",root);if(!box)return;
  if(!f){box.innerHTML=`<p class="t-obs pad" style="padding-top:48px">Fundet findes ikke længere.</p><div class="btn-row"><a class="btn" href="#/fund">Til fund</a></div>`;return}
  const s=S[f.ident&&f.ident.species], st=(f.ident||{}).status||"ukendt", d=new Date(f.created);
  const slots=SLOTS.map(([k],i)=>{const p=f.photos&&f.photos[k];return `<figure class="fd-slot">${p?`<button class="ph" data-full="${k}"><img src="${objURL(p.thumb)}" alt=""></button>`:`<div class="ph none">${pg(SLOTI[k],28)}</div>`}<figcaption><span class="num">${nn(i+1)}</span><span class="lbl">${SLOTN[k]}</span></figcaption></figure>`}).join("");
  const row=(l,v,ic)=>v?`<div class="fd-row"><span class="lbl">${l}</span><p>${ic?pg(ic,20):""}${v}</p></div>`:"";
  const idHTML=st==="ukendt"?`<p class="lbl">Identifikation</p><p class="meta">Ubestemt. Et ukendt fund er stadig en observation.</p>`
    :st==="bud"?`<p class="lbl">Identifikation</p><p class="meta">Dit eget bud – ikke en bestemmelse.</p>`:`<p class="lbl">Identifikation</p><p class="meta">Bestemt af en kyndig${f.ident.by?": "+esc(f.ident.by):""}.</p>`;
  const gastroOK=s&&typeof GASTRO!=="undefined"&&GASTRO[s.id]&&!s.noGastro;
  box.innerHTML=`<header class="ph-head"><p class="lbl">${d.getDate()}. ${MONN[d.getMonth()]} · ${hhmm(f.created)}${f.area?" · "+esc(f.area.name):""}</p><h1 class="t-display"${st==="ukendt"?' style="font-style:italic"':""}>${esc(identTitle(f))}</h1></header>
    <div class="fd-slots">${slots}</div>
    <div class="fd-id">${idHTML}</div>
    <div class="fd-rows">
      ${row("Fundet",`${d.getDate()}. ${MONN[d.getMonth()]} · ${hhmm(f.created)}`)}
      ${row("Område",f.area?esc(f.area.name):"")}
      ${row("Træer",esc((f.obs.trees||[]).map(t=>OBS.trees.o.find(x=>x[0]===t)[1]).join(" · ")),"trae")}
      ${row("Vokser i",esc((f.obs.sted||[]).map(t=>OBS.sted.o.find(x=>x[0]===t)[1]).join(" · ")),"bund")}
      ${row("Underside",f.obs.under?OBS.under.o.find(x=>x[0]===f.obs.under)[1]:"",f.obs.under?(f.obs.under==="andet"?"form":f.obs.under):null)}
      ${row("Hatfarve",f.obs.farve?OBS.farve.o.find(x=>x[0]===f.obs.farve)[1]:"","hat")}
      ${row("Note",f.note?esc(f.note).replace(/\n/g,"<br>"):"")}
    </div>
    ${s&&isDanger(s)?`<p class="say danger"><b>${stInfo(s).t}.</b> ${s.danger||""}</p>`:""}
    <div class="btn-col"><button class="btn fill" id="fdCmp">Sammenlign med guiden</button><div class="btn-row in"><a class="btn" href="#/registrer/ret/${f.id}">Redigér</a>${navigator.canShare?`<button class="btn" id="fdShare">Del billeder</button>`:""}</div></div>
    ${gastroOK?`${st!=="bestemt"?`<p class="say"><b>Ikke sikkert bestemt.</b> Spis ikke svampen, før en kyndig har bestemt netop dette eksemplar.</p>`:""}
      <a class="to-kitchen" href="#/art/${s.id}/koekken"><span class="lbl">I køkkenet</span><span class="row"><b class="t-state">Arten i køkkenet</b>${arrow}</span><span class="s">Gælder arten – ikke dit konkrete fund.</span></a>`:""}
    <div class="btn-row"><button class="txt-link del" id="fdDel">Slet fund</button></div>`;
  box.querySelectorAll("[data-full]").forEach(b=>b.onclick=async()=>{const r=await DB.photo(f.id+":"+b.dataset.full);const u=r?objURL(r):$("img",b).src;showLB(u,`${SLOTN[b.dataset.full]} · ${esc(identTitle(f))}`,dayLabel(f.created)+" · "+hhmm(f.created))});
  $("#fdDel",box).onclick=async()=>{if(!confirm("Slet dette fund og dets billeder fra enheden?"))return;await DB.del(f.id);await loadFinds();location.hash="#/fund"};
  $("#fdCmp",box).onclick=()=>{
    if(s){location.hash="#/art/"+s.id;return}
    const tm={fyr:"fyr",gran:"gran",birk:"birk",lov:"lov"}, sm={mos:"mos",naale:"naale",jord:"jord",ved:"ved",graes:"graes"};
    K={a:{},step:0,stopShown:false};
    if(f.obs.under){K.a.under=f.obs.under;const t=(f.obs.trees||[]).map(x=>tm[x]).filter(Boolean)[0];if(t)K.a.trae=t;const sd=(f.obs.sted||[]).map(x=>sm[x]).filter(Boolean)[0];if(sd)K.a.sted=sd;
      if(f.obs.farve&&FLOW[f.obs.under].includes("farve"))K.a.farve=f.obs.farve;const qs=keyQs();K.step=qs.findIndex(q=>!(q in K.a));if(K.step<0)K.step=qs.length}
    location.hash="#/noegle"};
  const sh=$("#fdShare",box);if(sh)sh.onclick=async()=>{const files=[];for(const [k] of SLOTS){const r=await DB.photo(f.id+":"+k);if(r)files.push(new File([r.buf],`svamp-${k}.jpg`,{type:r.type}))}
    if(!files.length){alert("Fundet har ingen billeder.");return}try{await navigator.share({files})}catch(e){}};
}
function showLB(src,cap,small){const lb=document.createElement("div");lb.id="lb";lb.innerHTML=`<button aria-label="Luk">×</button><img src="${src}" alt=""><div class="c">${cap}<small>${esc(small||"")}</small></div>`;lb.onclick=()=>lb.remove();document.body.appendChild(lb)}

/* ---------- I SKOVEN NU ---------- */
function areaHead(a){const cov=coverage(a);return `<div class="area-h"><p class="lbl g">Område</p><h2 class="t-obs">${esc(a.name)}</h2><p class="meta">${esc([a.region,areaLine(a)].filter(Boolean).join(" · "))||"Ingen skovtype valgt"}</p><button class="txt-link" data-area>Skift område ${arrow}</button>
  ${cov!=="god"?`<p class="cov">Guiden viser relevante arter fra sit eget artsbibliotek. ${cov==="ude"?"Området ligger uden for de fund, guiden bygger på, så":"Der er få fund herfra, så"} rækkefølgen bygger kun på årstiden og det, du har fortalt om skoven.</p>`:""}</div>`}
V.omraade=()=>{
  const a=area(), top=watchList(a);
  return `${pageHead("I skoven nu · "+MONN[new Date().getMonth()],"Arter, du kan møde","Ud fra årstiden, skoven og hvor arterne er fundet før. Det siger, hvad du kan møde – ikke hvad du har fundet.")}
  ${areaHead(a)}
  <div style="height:32px"></div>${ixList(top.map(x=>x.s),{num:true,spot:true})}
  ${russula()}
  <div class="btn-row"><a class="btn fill" href="#/noegle">Find en art</a><a class="btn" href="#/arter">Alle arter</a></div>`;
};

/* ---------- GASTRONOMI — lys smørgul: fra skoven ind i køkkenet ---------- */
V.kitchen=(id)=>{
  const s=S[id], g=typeof GASTRO!=="undefined"&&GASTRO[id], t=g&&g.tags;
  if(!s||!g||s.noGastro||!SPIS(s)) return `<p class="t-obs pad" style="padding-top:48px">Ingen køkkenbeskrivelse for denne art.</p>`;
  const li=a=>a.map(x=>`<li>${x}</li>`).join("");
  const W=o=>cap1(o.join(" · ").toLowerCase());
  const im=photo(id,"kod")||photo(id,"typisk")||photo(id);
  return `<header class="k-id"><p class="lbl">I køkkenet</p><h1 class="t-display">${s.da}</h1><p class="la">${s.la}</p>
    <p class="k-safe">Gastronomien gælder arten – ikke dit konkrete fund. Kun efter sikker artsbestemmelse.</p></header>
  ${t?`<dl class="k-sense">${t.s.length?`<div><dt class="lbl">Smag</dt><dd>${W(t.s.map(x=>GVOC.s[x]))}</dd></div>`:""}<div><dt class="lbl">Tekstur</dt><dd>${W(t.t.map(x=>GVOC.t[x]))}</dd></div><div><dt class="lbl">Bedst</dt><dd>${W(t.k.map(x=>GVOC.k[x]))}</dd></div></dl>`:""}
  ${g.hvorfor?`<section class="sec">${sh("Hvorfor")}<p class="t-read">${g.hvorfor}</p></section>`:""}
  ${im?`<figure class="k-img">${phHTML(im,s.da,{ann:false,lb:photoKey(im)})}<figcaption>${esc(im.c||"")}</figcaption></figure>`:""}
  <section class="sec">${sh("Hvad den kan")}<ul class="k-list">${li(g.bedstTil)}</ul></section>
  <section class="sec">${sh("Behandling")}<ol class="k-list">${li(g.behandling)}</ol></section>
  <section class="sec">${sh("Passer godt med")}<p class="k-pair">${W(g.passer)}</p><p class="meta">${g.koekken.join(" · ")} køkken</p></section>
  <section class="sec">${sh("Tre måder")}
    ${g.retter.map(r=>`<details class="k-dish"><summary><span class="k-n">${r.n}</span><span class="k-t"><span class="lbl">${r.type} · ${r.ker}</span><b class="nm">${r.titel}</b><span class="meta">${[r.tid,r.til].filter(Boolean).join(" · ")}</span></span></summary>
      <div class="k-body"><h4 class="lbl">Ingredienser</h4><ul>${li(r.ingr)}</ul><h4 class="lbl">Fremgangsmåde</h4><ol>${li(r.metode)}</ol>${r.tip?`<p class="k-tip"><span class="lbl">Tip</span>${r.tip}</p>`:""}</div></details>`).join("")}
  </section>
  <a class="quiet" href="#/art/${id}">Tilbage til ${lcName(s)} ${arrow}</a>`;
};

/* ---------- offline: gem alle guidens billeder ---------- */
function precacheImages(btn){
  if(!("serviceWorker" in navigator)||!navigator.serviceWorker.controller){alert("Offline-lagring er ikke tilgængelig i denne browser.");return}
  const urls=[];for(const id in PH)PH[id].forEach(p=>{urls.push(p.s);urls.push(p.t)});
  btn.disabled=true;btn.textContent="Gemmer billeder …";
  const ch=new MessageChannel();ch.port1.onmessage=e=>{const d=e.data;if(d.done){btn.textContent=`${d.ok} billeder gemt offline`;LS.set("offlineImgs",Date.now())}else btn.textContent=`Gemmer … ${d.n}/${urls.length}`};
  navigator.serviceWorker.controller.postMessage({type:"precache",urls},[ch.port2]);
}


/* ---------- info ---------- */
V.info=()=>{
  const cr=[];for(const id in (typeof PH!=="undefined"?PH:{})) PH[id].forEach(p=>cr.push(`<div><b>${S[id]?S[id].da:id}</b> · ${VIEWN[p.v]||p.v}: ${esc(p.by||"")}</div>`));
  return `${pageHead("Om guiden","Sikkerhed og kilder","")}
  <div class="big-safe t-read">Svampe kan variere meget i udseende. Fotos og digitale bestemmelsesnøgler kan ikke alene afgøre, om en svamp er sikker at spise. Spis kun svampe, som er sikkert bestemt af en person med den nødvendige viden.</div>
  <div class="prose">
    <h2 class="sh">“Det kan være” er ikke “sikker at spise”</h2>
    <p>Guiden lærer dig at se forskelle. Den bestemmer ikke svampe. Når Undersøg siger “det kan være”, betyder det kun, at dine svar ligner beskrivelsen af en af guidens ${SP.length} arter. Der findes tusindvis af arter i Danmark.</p>
    <h2 class="sh">Tre ting, der ikke må blandes sammen</h2>
    <p><b>Bestemmelse</b> – hvilken art er det? <b>Spiselighed</b> – kan arten spises? <b>Gastronomi</b> – hvordan bruges arten i køkkenet? Kun en sikker bestemmelse af netop dit eksemplar gør de to sidste relevante.</p>
    <h2 class="sh">Forgiftning</h2>
    <p>Giftlinjen (døgnåben):<a class="phone" href="tel:82121212">82 12 12 12</a></p>
    <p>Akut livsfare: <a class="phone" href="tel:112" style="display:inline">112</a></p>
    <p>Tag svampen – eller rester af den – med. Symptomer efter Grøn fluesvamp og Snehvid fluesvamp kommer først efter 6–24 timer; efter gift-slørhatte efter dage til uger.</p>
    <h2 class="sh">Gode vaner i skoven</h2>
    <ul><li>Grav hele svampen fri – basis skal med.</li><li>Hold ukendte svampe adskilt fra spisesvampe.</li><li>Tag kun friske, faste eksemplarer.</li><li>Vis alt til jeres guide.</li></ul>
    <h2 class="sh">Kilder</h2>
    <p>Artsbeskrivelser er sammenholdt med danske og europæiske kilder, bl.a. Danmarks Svampeatlas (svampe.databasen.org), Naturbasen, Arter.dk, Lex.dk og Trap Danmark. Udbredelse i området bygger på iNaturalist-observationer med ‘research grade’. Guiden er et udvalg og kan indeholde fejl – ved tvivl gælder altid en kyndig persons vurdering.</p>
    <h2 class="sh">Fotos</h2>
    <p>Fotos fra iNaturalist-observationer med “research grade”, primært fra Danmark og nabolandene, udvalgt og kontrolleret én gang pr. art og genbrugt overalt, brugt under de angivne Creative Commons-licenser. Bestemmelsen af den enkelte observation er foretaget af iNaturalist-brugere.</p>
    <div class="credits small">${cr.join("")||"<div>Ingen fotos indlejret.</div>"}</div>
    <h2 class="sh">Offline</h2>
    <p>Tekster, Undersøg, quiz og dine fund virker uden net, når siden først er åbnet. Billeder hentes, når du ser dem – eller alle på én gang her (ca. 12 MB):</p>
    <p style="margin-top:16px"><button class="btn" id="precache">${LS.get("offlineImgs",null)?"Billeder gemt – opdatér":"Gem alle billeder offline"}</button></p>
    <p>Kortet og stedsøgningen kræver internet.</p>
    <h2 class="sh">Privatliv</h2>
    <p>Dine fund, billeder og dit valgte område gemmes kun på denne enhed. Intet uploades. Din position bruges kun, når du trykker ‘Brug min position’, og gemmes afrundet.</p>
    <p>Kortdata © OpenStreetMap-bidragydere. Stedsøgning: Nominatim.</p>
    <h2 class="sh">Indstillinger</h2>
    <p style="margin-top:16px"><button class="btn" id="resetAll">Nulstil fund, område og quiz</button></p>
  </div>`;
};

/* =====================================================================
   ROUTER
   ===================================================================== */
const app=$("#app");
const UPDATED="26. september 2026";
function route(){
  const h=(location.hash||"#/").slice(2).split("/");
  const [a,b,c]=h;
  switch(a){
    case "": case undefined: return {v:V.home(),root:true,tab:"hjem",home:true};
    case "omraade": case "asserbo": return {v:V.omraade(),t:"Start",tab:"hjem"};
    case "laer": return {v:V.lesson(),t:"Start",tab:"hjem"};
    case "arter": if(!b) return {v:V.list(),root:true,tab:"arter",list:true};
      return {v:V.list(b),t:"Arter",tab:"arter",list:b!=="pas"};
    case "art": if(c==="koekken") return {v:V.kitchen(b),t:S[b]?S[b].da:"",tab:"arter",kitchen:true};
      return {v:V.species(b),t:"Arter",tab:"arter",sp:b};
    case "forskelle": return {v:V.pairs(),root:true,tab:"forskelle"};
    case "forskel": return {v:V.pair(b),t:"Se forskellen",tab:"forskelle",pair:true};
    case "noegle": return {v:V.key(),root:true,tab:"noegle",key:true};
    case "quiz": return {v:V.quiz(),t:"Start",tab:"hjem",quiz:true};
    case "registrer": {
      const mode=b==="ret"?"ret:"+c:b==="art"?"art:"+c:"ny";
      if(!REG||REG.mode!==mode){ if(b==="ret") return {v:`<p class="meta pad" style="padding-top:48px">Henter …</p>`,t:"Fund",tab:"fund",loadEdit:c,mode};
        newReg(b==="art"?c:null); REG.mode=mode; }
      return {v:V.reg(),t:"Fund",tab:"fund",reg:true};
    }
    case "fund": if(b) return {v:V.find(b),t:"Fund",tab:"fund",find:b};
      return {v:V.finds(),root:true,tab:"fund",finds:true};
    case "info": return {v:V.info(),t:"Start",tab:"hjem",info:true};
    default: return {v:V.home(),root:true,tab:"hjem",home:true};
  }
}
let lastHash=null;
function render(keepScroll){
  const r=route();
  const y=window.scrollY;
  document.body.classList.toggle("kitchen",!!r.kitchen);
  document.querySelector('meta[name="theme-color"]').content=r.kitchen?"#F6E8B1":"#FFFFFF";
  app.innerHTML=`<div class="view">${r.v}</div><footer class="foot"><span class="wmk">Svampeguiden</span><p>Et foto eller en nøgle kan ikke afgøre, om en svamp kan spises. Spis kun svampe, der er sikkert bestemt af en kyndig.</p><a href="#/info">Sikkerhed og kilder ${arrow}</a><small>Testversion · Opdateret ${UPDATED}</small></footer>`;
  $("#ttl").textContent=r.t||"";
  $("#top").classList.toggle("root",!!r.root);
  $("#reg").style.visibility=(r.reg||r.loadEdit)?"hidden":"visible";
  document.querySelectorAll("#tabs a").forEach(a=>a.classList.toggle("on",a.dataset.t===r.tab));
  initGalleries(app);
  if(r.key) bindKey(app);
  if(r.quiz) bindQuiz(app);
  if(r.finds) bindFinds(app);
  if(r.find) bindFind(app,r.find);
  if(r.reg) bindReg(app);
  if(r.loadEdit) editReg(r.loadEdit).then(ok=>{if(ok){REG.mode=r.mode;render()}else location.hash="#/fund"});
  if(r.list) bindFilters(app);
  if(r.pair){const hd=$(".cmp-head",app),nm=$(".ab-names",app);if(hd&&nm&&"IntersectionObserver" in window){new IntersectionObserver(([e])=>hd.classList.toggle("show",!e.isIntersecting&&e.boundingClientRect.top<0)).observe(nm)}}
  if(r.info){
    const rs=$("#resetAll");if(rs)rs.onclick=async()=>{if(confirm("Slet alle fund, billeder, valgt område og quiz-resultater på denne enhed?")){await DB.clear().catch(()=>{});["omraade","omraader","quizBest","quizRounds","fund_migreret"].forEach(k=>{try{localStorage.removeItem("svampe."+k)}catch(e){}});await loadFinds();render()}};
    const pc=$("#precache");if(pc)pc.onclick=()=>precacheImages(pc);
  }
  app.querySelectorAll("[data-jump]").forEach(a=>a.onclick=e=>{e.preventDefault();const t=document.getElementById(a.dataset.jump);if(t)window.scrollTo({top:t.getBoundingClientRect().top+scrollY-70,behavior:"smooth"})});
  if(keepScroll) window.scrollTo(0,y); else if(location.hash!==lastHash) window.scrollTo(0,0);
  lastHash=location.hash;
}
function foundTodayIds(){const d=dayKey(Date.now());return new Set(FINDS.filter(f=>dayKey(f.created)===d&&f.ident&&f.ident.species).map(f=>f.ident.species))}
function updBadge(){
  const d=dayKey(Date.now()), n=FINDS.filter(f=>dayKey(f.created)===d).length, a=$('#tabs a[data-t="fund"]');
  let b=a.querySelector(".n"); if(!n){b&&b.remove();return}
  if(!b){b=document.createElement("span");b.className="n";a.appendChild(b)} b.textContent=n;
}
document.addEventListener("click",e=>{if(e.target.closest("[data-area]")){e.preventDefault();openArea()}});
$("#back").onclick=()=>{if(history.length>1&&lastHashStack>0){history.back()}else location.hash="#/"};
let lastHashStack=0;
window.addEventListener("hashchange",()=>{lastHashStack++;const st=document.getElementById("stop");if(st)st.remove();render()});
const topUpd=()=>{$("#top").classList.toggle("scrolled",scrollY>4)};window.addEventListener("scroll",topUpd,{passive:true});
try{localStorage.removeItem("svampe.felt")}catch(e){}
render();
migrateOld().then(loadFinds).then(()=>{if(location.hash===""||location.hash==="#/"||location.hash.startsWith("#/arter"))render(true)});
if("serviceWorker" in navigator&&location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(()=>{});


/* =====================================================================
   STATE (localStorage)
   ===================================================================== */
const LS = {
  get(k,d){try{const v=localStorage.getItem("svampe."+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem("svampe."+k,JSON.stringify(v))}catch(e){}}
};
function foundToday(id){return foundTodayIds().has(id)}

/* =====================================================================
   HELPERS
   ===================================================================== */
const $=(s,r=document)=>r.querySelector(s);
// Artsnavn midt i en sætning: små bogstaver, men egennavne (Karl Johan) bevares.
const lcName=s=>/^Karl /.test(s.da)?s.da:s.da.charAt(0).toLowerCase()+s.da.slice(1);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const VIEWN = {typisk:"Typisk",ung:"Ung",gammel:"Ældre",under:"Underside",stok:"Stok",basis:"Basis",habitat:"Voksested",kod:"Snit",ring:"Ring",top:"Hat"};
const MONN=["januar","februar","marts","april","maj","juni","juli","august","september","oktober","november","december"];
function photos(id){return (typeof PH!=="undefined"&&PH[id])||[]}
function photo(id,views){const p=photos(id);if(!views)return p[0];for(const v of [].concat(views)){const f=p.find(x=>x.v===v);if(f)return f}return null}
function photoKey(p){for(const id in PH){const i=PH[id].indexOf(p);if(i>=0)return id+":"+i}return null}
const nn=i=>String(i).padStart(2,"0");
const MSHORT=["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec"];
function monthRange(m){
  if(!m||!m.length) return ""; if(m.length>=12) return "hele året";
  const s=new Set(m); let a=m.find(x=>!s.has(x===1?12:x-1)); if(a==null) a=m[0];
  let b=a; while(s.has(b%12+1)&&b%12+1!==a) b=b%12+1;
  return a===b?MSHORT[a-1]:MSHORT[a-1]+"–"+MSHORT[b-1];
}
const cap1=t=>t.charAt(0).toUpperCase()+t.slice(1);

/* ---------- annotationer: dobbelt kontrastlinje + nummer; forklaringen står under billedet ---------- */
function annSVG(a){
  if(!a||!a.length) return "";
  let g="",m="";
  a.forEach(([x,y,r],i)=>{
    g+=`<circle class="o" cx="${x*4}" cy="${y*3}" r="${r*4+1.5}"/><circle class="i" cx="${x*4}" cy="${y*3}" r="${r*4-1.5}"/>`;
    const lx=Math.min(94,Math.max(6,x+r*.72)), ly=Math.min(92,Math.max(8,y-r*4/3*.72));
    m+=`<span class="ann-m" style="left:${lx.toFixed(1)}%;top:${ly.toFixed(1)}%">${i+1}</span>`;
  });
  return `<svg class="ann" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">${g}</svg>${m}`;
}
function legend(a){return a&&a.some(x=>x[3])?`<span class="lgs">${a.map((x,i)=>x[3]?`<span class="lg"><i>${i+1}</i>${esc(x[3])}</span>`:"").join("")}</span>`:""}
function phHTML(p,label,opts={}){
  if(!p) return `<div class="ph none">${opts.icon?pg(opts.icon,32):""}</div>`;
  const src=opts.thumb?p.t:p.s, att=opts.defer?`data-src="${src}"`:`src="${src}" loading="lazy"`;
  return `<div class="ph"${opts.lb?` data-lb="${opts.lb}"`:""}><img ${att} alt="${esc(p.c||label||"")}" decoding="async">${opts.ann===false?"":annSVG(p.a)}</div>`;
}
const SPIS=s=>s.st==="god"||s.st==="spis";
/* Kulinarisk kvalitet og sikkerhed er to forskellige ting: mærket siger status, linjen under siger betingelsen. */
function stInfo(s){
  if(s.st==="meget") return {t:s.deadly?"Dødeligt giftig":"Meget giftig",c:"rust"};
  return ({god:{t:"God spisesvamp",c:"moss"},spis:{t:"Spiselig",c:""},ikke:{t:"Ikke spiselig",c:""},fra:{t:"Frarådes",c:""},gift:{t:"Giftig",c:"rust-pale"}})[s.st];
}
function statusTag(s,c){const x=stInfo(s),k=c==null?x.c:c;return k?`<span class="tag ${k}">${x.t}</span>`:`<span class="st-plain">${x.t}</span>`}
const stTxt=s=>statusTag(s);
function monthsHTML(m){const now=new Date().getMonth()+1;return `<div class="months" role="img" aria-label="Sæson: ${m.map(x=>MONN[x-1]).join(", ")}">${MONTHS.map((l,i)=>`<span class="${m.includes(i+1)?"on":""}${now===i+1?" now":""}">${l}</span>`).join("")}</div>`}
/* Én pil: tegnet på samme 24-gitter og med samme linje som piktogrammerne */
const VS=`<svg class="arr vs" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12H20.5M8.5 6.5L3 12L8.5 17.5M15.5 6.5L21 12L15.5 17.5"/></svg>`;
const arrow=`<svg class="arr" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12H19.5M13.5 6L19.5 12L13.5 18"/></svg>`;

/* =====================================================================
   PIKTOGRAMMER — SVAMPEGUIDENs botaniske alfabet.
   Én silhuet (hat + stok); den del, der tales om, er fyldt sort.
   Undersidetyperne har hver sin tekstur. Samme tegn betyder altid det samme.
   ===================================================================== */
const CAP="M3.5 11.5C3.5 6.5 7.5 3.5 12 3.5S20.5 6.5 20.5 11.5Z", STEM='<path d="M10.5 11.5V20.5H13.5V11.5"/>';
const PG={
  hele:`<path d="${CAP}"/>${STEM}`,
  hat:`<path class="f" d="${CAP}"/>${STEM}`,
  under:`<path d="${CAP}"/><path class="f" d="M3.5 11.5H20.5C17 14.6 7 14.6 3.5 11.5Z"/><path d="M10.5 13.8V20.5H13.5V13.8"/>`,
  lameller:`<path d="${CAP}"/><path d="M3.5 11.5C7 14.6 17 14.6 20.5 11.5M6 11.5V12.9M8 11.5V13.5M10 11.5V13.8M14 11.5V13.8M16 11.5V13.5M18 11.5V12.9"/><path d="M10.5 13.9V20.5H13.5V13.9"/>`,
  ror:`<path d="M3.5 11C3.5 6 7.5 3.5 12 3.5S20.5 6 20.5 11Z"/><path d="M3.5 11C7 15.6 17 15.6 20.5 11"/>${[[6.3,12.5],[9.1,13.3],[12,13.6],[14.9,13.3],[17.7,12.5]].map(([x,y])=>`<circle class="f d" cx="${x}" cy="${y}" r="1.05"/>`).join("")}<path d="M10 14.6C9.2 17 9 19 9.4 20.5H14.6C15 19 14.8 17 14 14.6"/>`,
  ribber:`<path d="M3 5.5C7 7.3 17 7.3 21 5.5C19.5 9.5 16 12.3 13.5 13.5V20.5H10.5V13.5C8 12.3 4.5 9.5 3 5.5Z"/><path d="M6.2 7.3L10.2 12.4M8.2 9.6L7.6 7.6M9.6 7.7L11.2 12.2M17.8 7.3L13.8 12.4M15.8 9.6L16.4 7.6M14.4 7.7L12.8 12.2M12 7.7V12.4"/>`,
  pigge:`<path d="${CAP}"/>${STEM}${[4.8,7,9.2,14.8,17,19.2].map((x,i)=>`<path class="f" d="M${x-.9} 11.5L${x} ${i%5?15:13.8}L${x+.9} 11.5Z"/>`).join("")}`,
  stok:`<path d="${CAP}"/><path class="f" d="M10.5 11.5H13.5V20.5H10.5Z"/>`,
  ring:`<path d="${CAP}"/>${STEM}<path class="f" d="M10.5 13.4H13.5L15.4 15.8H8.6Z"/>`,
  basis:`<path d="${CAP}"/><path d="M10.5 11.5V18.2M13.5 11.5V18.2"/><path class="f" d="M9 17C8.7 20 10 21.2 12 21.2S15.3 20 15 17L13.6 18.3L12 17L10.4 18.3Z"/>`,
  knold:`<path d="${CAP}"/><path d="M10.5 11.5V17.6M13.5 11.5V17.6"/><path class="f" d="M8.8 19.2C8.8 17.6 10.2 17 12 17S15.2 17.6 15.2 19.2 13.8 21.3 12 21.3 8.8 20.8 8.8 19.2Z"/>`,
  kod:`<path d="${CAP}"/>${STEM}<path class="f" d="M12 3.5C16.5 3.5 20.5 6.5 20.5 11.5H13.5V20.5H12Z"/><path d="M12 2.2V21.8"/>`,
  trae:`<path d="M7.2 12.8C4.6 12.8 3.6 9.8 5.6 8.2C5.2 5.2 8.2 3.6 10.2 4.8C11.2 2.6 14.8 2.6 15.8 4.8C18.2 4.2 20.3 6.6 19 8.6C20.7 10.2 19.6 12.8 17 12.8Z"/><path d="M12 20.5V12.8M12 15.3L9.6 12.9M12 14.4L14.2 12.9M5 20.5H19"/>`,
  bund:`<path d="M3 15H21M5 15L5.8 11.5M7.6 15L7 12M10.2 15L11 12.4M13 15L12.4 11.6M15.8 15L16.6 12M18.6 15L18 12.8M6 18.3H8.5M11 19.8H13.5M15.8 18.3H18.3"/>`,
  form:`<circle cx="12" cy="12.3" r="6.6"/><path d="M4.5 19.5H19.5"/>`,
  kamera:`<path d="M3 8H7.5L9 5.5H15L16.5 8H21V19H3Z"/><circle cx="12" cy="13.3" r="3.6"/>`
};
const PGN={hele:"Hele svampen",hat:"Hat",under:"Underside",lameller:"Lameller",ror:"Rør",ribber:"Ribber",pigge:"Pigge",stok:"Stok",ring:"Ring",basis:"Basis med pose",knold:"Basis med knold",kod:"Kød og snit",trae:"Træ",bund:"Voksested",form:"Anden form",kamera:"Kamera"};
function pg(n,size=22,label){const t=label||PGN[n]||n;return `<svg class="pg${size>=40?" lg":""}" viewBox="0 0 24 24" width="${size}" height="${size}" role="img" aria-label="${esc(t)}">${PG[n]||""}</svg>`}
const UNDERN={lameller:"Lameller",ror:"Rør",ribber:"Ribber",pigge:"Pigge",andet:"Anden form"};
const FORMN={kugle:"Kugle",morkel:"Bikagehat",hjerne:"Hjernefoldet hat",ore:"Øreformet"};
function underIcon(s){return s.under==="andet"?"form":(s.id==="falsk"?"lameller":s.under)}
function underLabel(s){if(s.under==="andet")return FORMN[(s.k.form||[])[0]]||"Anden form";if(s.underNote)return s.underNote;return UNDERN[s.id==="falsk"?"lameller":s.under]}
const VVN={fyr:"Fyr",gran:"Gran",birk:"Birk",lov:"Bøg og eg",ved:"Dødt ved"};
/* ---------- store anatomiske tegninger (kun hvor de lærer noget) ---------- */
function dia(type,hl,o={}){
  const INK="var(--ink)", HL="#D6D6D6";
  const f=p=>hl===p?`fill="${HL}" stroke="${INK}"`:`fill="#fff" stroke="${INK}"`;
  let s="";
  const ground=`<path d="M8 196 H192" stroke="${INK}" stroke-width="1" stroke-dasharray="3 4"/>`;
  if(type==="ribber"){
    s+=`<path d="M28 58 Q100 88 172 58 Q158 108 114 134 L114 198 L86 198 L86 134 Q42 108 28 58 Z" ${f("hat")} stroke-width="1.6"/>`;
    s+=`<path d="M40 80 Q70 110 88 134 M58 88 Q80 112 92 136 M100 92 V138 M142 88 Q120 112 108 136 M160 80 Q130 110 112 134 M48 86 Q66 104 76 116 M152 86 Q134 104 124 116" fill="none" stroke="${INK}" stroke-width="${hl==="under"?2:1.2}"/>`;
    s+=`<ellipse cx="100" cy="60" rx="72" ry="12" ${f("hat")} stroke-width="1.6"/>`;
    s+=`<path d="M86 134 L86 198 L114 198 L114 134" ${f("stok")} stroke-width="1.6"/>`;
  } else {
    const ror=type==="ror";
    const cap=ror?"M22 98 Q24 22 100 20 Q176 22 178 98 Z":"M26 92 Q34 30 100 26 Q166 30 174 92 Z";
    const uy=ror?98:92;
    s+=`<path d="${cap}" ${f("hat")} stroke-width="1.6"/>`;
    const stem=ror?`M80 ${uy+14} Q66 160 76 196 L124 196 Q134 160 120 ${uy+14} Z`:`M91 ${uy+8} L89 196 L111 196 L109 ${uy+8} Z`;
    s+=`<path d="${stem}" ${f("stok")} stroke-width="1.6"/>`;
    if(type==="lameller"){
      s+=`<path d="M26 92 L174 92 Q140 104 100 104 Q60 104 26 92 Z" ${f("under")} stroke-width="1.4"/>`;
      let g="";for(let x=34;x<=166;x+=8){if(x>88&&x<112)continue;g+=`M${x} 92.5 L${x+(100-x)*.12} ${98+(1-Math.abs(x-100)/74)*5}`}
      s+=`<path d="${g}" stroke="${INK}" stroke-width="1"/>`;
    } else if(ror){
      s+=`<path d="M22 98 L178 98 Q150 114 100 114 Q50 114 22 98 Z" ${f("under")} stroke-width="1.4"/>`;
      let g="";for(let x=34;x<=166;x+=7){for(let y=101;y<=110;y+=4.5){if(Math.abs(x-100)<22&&y>104)continue;g+=`<circle cx="${x}" cy="${y+(1-Math.abs(x-100)/78)*3}" r="1.2" fill="${INK}"/>`}}
      s+=g;
    } else if(type==="pigge"){
      let g="";for(let x=32;x<=168;x+=6.5){if(x>88&&x<112)continue;const l=6+(1-Math.abs(x-100)/70)*5;g+=`M${x} 92 L${x+.6} ${92+l}`}
      s+=`<path d="M26 92 L174 92" stroke="${INK}" stroke-width="1.4"/><path d="${g}" stroke="${INK}" stroke-width="1.4"/>`;
    }
    if(o.ring){const ry=type==="lameller"?118:122;
      s+=`<path d="M86 ${ry} Q100 ${ry-5} 114 ${ry} L120 ${ry+12} Q100 ${ry+17} 80 ${ry+12} Z" ${f("ring")} stroke-width="1.4"/>`}
    if(o.volva==="pose") s+=`<path d="M84 170 Q72 198 100 200 Q128 198 116 170 L112 184 L106 172 L100 186 L94 172 L88 184 Z" ${f("basis")} stroke-width="1.4"/>`;
    if(o.volva==="knold") s+=`<ellipse cx="100" cy="188" rx="21" ry="12" ${f("basis")} stroke-width="1.4"/>`;
  }
  return `<svg viewBox="0 0 200 214" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${s}${ground}</svg>`;
}
function diaFor(s,hl){
  const t=s.id==="falsk"?"lameller":s.under;
  return dia(t,hl,{ring:s.k.ring&&s.k.ring[0]==="ja",volva:s.k.basis&&(s.k.basis[0]==="pose"||s.k.basis[0]==="knold")?s.k.basis[0]:null});
}
/* =====================================================================
   GALLERI — swipe; kun det første billede hentes med det samme
   ===================================================================== */
function gallery(id,list){
  const all=photos(id); list=list||all;
  if(!list.length) return `<div class="gal"><div class="gal-track"><div class="slide">${phHTML(null,"")}</div></div></div>`;
  const ix=list.map(p=>all.indexOf(p));
  return `<div class="gal" data-sp="${id}" data-ix="${ix.join(",")}">
    <div class="gal-track">${list.map((x,i)=>`<div class="slide">${phHTML(x,"",{lb:id+":"+ix[i],defer:i>0})}</div>`).join("")}</div>
    <div class="arr-btn l"><button aria-label="Forrige billede">${arrow.replace('class="arr"','class="arr back"')}</button></div><div class="arr-btn r"><button aria-label="Næste billede">${arrow}</button></div>
    <div class="gal-meta"><span class="lbl v"></span><span class="gal-n"></span><p class="cap"></p></div>
    <p class="credit"></p>
  </div>`;
}
function initGalleries(root){
  root.querySelectorAll(".gal[data-sp]").forEach(g=>{
    const all=photos(g.dataset.sp), p=g.dataset.ix.split(",").map(i=>all[+i]), tr=$(".gal-track",g), cap=$(".cap",g), v=$(".v",g), n=$(".gal-n",g), cr=$(".credit",g);
    let cur=-1;
    const imgs=[...g.querySelectorAll(".gal-track img")];
    const load=i=>{for(const j of [i,i+1,i-1]){const im=imgs[j];if(im&&im.dataset.src){im.src=im.dataset.src;delete im.dataset.src}}};
    const set=i=>{ if(i===cur)return; cur=i; const x=p[i]; if(!x) return; load(i);
      v.textContent=VIEWN[x.v]||""; cap.innerHTML=`${legend(x.a)}${esc(x.c||"")}`; n.textContent=p.length>1?(i+1)+" / "+p.length:""; cr.textContent=x.by?"Foto: "+x.by:"";
    };
    set(0);
    tr.addEventListener("scroll",()=>set(Math.round(tr.scrollLeft/tr.clientWidth)),{passive:true});
    $(".arr-btn.l button",g).onclick=()=>tr.scrollBy({left:-tr.clientWidth,behavior:"smooth"});
    $(".arr-btn.r button",g).onclick=()=>tr.scrollBy({left:tr.clientWidth,behavior:"smooth"});
    if(p.length<2) g.classList.add("single");
  });
}
document.addEventListener("click",e=>{
  const el=e.target.closest("[data-lb]"); if(!el) return;
  const [id,i]=el.dataset.lb.split(":"); const p=photos(id)[+i]; if(!p) return;
  showLB(p.s,`${esc(S[id]?S[id].da:"")} — ${esc(VIEWN[p.v]||"")}: ${esc(p.c||"")}`,p.by);
});

/* =====================================================================
   FÆLLES BYGGESTEN
   ===================================================================== */
const V={};
function pageHead(label,title,intro,cls=""){return `<header class="ph-head ${cls}">${label?`<p class="lbl">${label}</p>`:""}<h1 class="t-display">${title}</h1>${intro?`<p class="intro">${intro}</p>`:""}</header>`}
function sh(t,extra=""){return `<h2 class="sh"><span>${t}</span>${extra}</h2>`}
function tagsOf(s){const g=typeof GASTRO!=="undefined"&&GASTRO[s.id];return g&&g.tags&&SPIS(s)&&!s.noGastro?g.tags:null}
function tasteWords(s){const t=tagsOf(s);if(!t)return "";const w=[...t.s.map(x=>GVOC.s[x]),...t.t.slice(0,1).map(x=>GVOC.t[x])];return w.length?cap1(w.join(" · ").toLowerCase()):""}
/* Indeksrække: billede · navn · latin · ét mærke · én–to linjer metadata */
function ixRow(s,o={}){
  const p=photo(s.id,"typisk")||photo(s.id), tw=tasteWords(s);
  return `<a href="#/art/${s.id}">${phHTML(p,s.da,{ann:false,thumb:true})}<span class="t">${o.n?`<span class="num">${o.n}</span>`:""}<b class="nm">${s.da}</b><i class="la2">${s.la}</i>${statusTag(s)}
    ${o.spot&&s.spot?`<span class="kd">${s.spot}</span>`:`<span class="m">${underLabel(s)} · ${monthRange(s.m)}</span>${o.taste&&tw?`<span class="m">${tw}</span>`:""}`}
    ${foundToday(s.id)?`<span class="m">Set i dag</span>`:""}</span></a>`;
}
const ixList=(l,o={})=>`<div class="ix">${l.map((s,i)=>ixRow(s,o.num?{...o,n:nn(i+1)}:o)).join("")}</div>`;
function pairItem(p){const a=S[p.a],b=S[p.b],pa=photo(a.id,"typisk")||photo(a.id),pb=photo(b.id,"typisk")||photo(b.id),both=pa&&pb;
  return `<a href="#/forskel/${p.id}"${both?"":` class="txt-only"`}>${both?`<div class="ab">${phHTML(pa,"",{ann:false,thumb:true})}${phHTML(pb,"",{ann:false,thumb:true})}</div>`:""}<span class="t"${both?"":` style="padding:0"`}><b class="nm">${a.da}${VS}${b.da}</b><span class="q">${p.q}${arrow}</span></span></a>`}
const pairList=l=>`<div class="pl">${l.map(pairItem).join("")}</div>`;
function russula(){return `<aside class="note"><span class="lbl">Skørhatte og mælkehatte</span><p>Du vil møde mange skørhatte (<i>Russula</i>). Kødet knækker som kridt, og der kommer ingen mælk. Der er mange arter, flere er skarpe eller giftige, og ingen er med i guiden. Mælkehatte ligner dem, men bløder mælk, når du brækker en lamel.</p></aside>`}

/* =====================================================================
   START
   ===================================================================== */
/* Stednavnet er selve kontrollen: sidste ord og chevron hænger sammen ved linjeskift */
const AREA_CHEV=`<svg class="area-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9.5 6 6 6-6"/></svg>`;
function areaTitle(n){return `<span class="an">${esc(n)}</span>${AREA_CHEV}`}
V.home=()=>{
  const a=area(), top=watchList(a), hero=top[0]&&top[0].s;
  const meta=cap1([a.skov?SKOV[a.skov].toLowerCase():null,(a.trees||[]).length?a.trees.map(t=>TREEN[t]).join("/"):null].filter(Boolean).join(" · "));
  const alpha=["lameller","ror","ribber","pigge","ring","basis"];
  const hp=hero&&(photo(hero.id,"typisk")||photo(hero.id));
  const best=LS.get("quizBest",null);
  return `
  <section class="home-area">
    <p class="lbl">Område</p>
    <h1 class="t-display"><button class="area-name" data-area aria-label="${esc(a.name)} – skift område">${areaTitle(a.name)}</button></h1>
    ${meta?`<p class="meta">${esc(meta)}</p>`:""}
  </section>
  ${hero?`<a class="hm-hero" href="#/art/${hero.id}" aria-label="${hero.da}">${phHTML(hp,hero.da,{ann:false})}</a>`:""}
  <a class="hm-now" href="#/omraade"><span class="lbl">I skoven nu · ${MONN[new Date().getMonth()]}</span><span class="row"><b class="t-state">${top.length} svampe, du kan møde</b>${arrow}</span></a>
  <nav class="hm-go" aria-label="Guiden"><p class="lbl">Guiden</p>
    <a href="#/laer"><span class="t-cat">Lær at se</span><span class="s">Seks tegn under og ved hatten.</span></a>
    <a href="#/noegle"><span class="t-cat">Find en art</span><span class="s">Undersøg det, du står med.</span></a>
    <a href="#/arter/pas"><span class="t-cat">Pas på</span><span class="s">Giftige arter og farlige forvekslinger.</span></a>
  </nav>
  <nav class="more" aria-label="Mere"><p class="lbl">Mere</p>
    <a href="#/forskelle">Se forskellen${arrow}</a>
    <a href="#/quiz">Quiz${best!=null?`<span class="m">Bedst ${best}/10</span>`:""}${arrow}</a>
    <a href="#/fund">Mine fund${FINDS.length?`<span class="m">${FINDS.length}</span>`:""}${arrow}</a>
  </nav>`;
};

/* =====================================================================
   LÆR AT SE — alfabetet, som resten af guiden bruger
   ===================================================================== */
/* Lær at se: piktogram = orientering (kun i indekset), tegning = forklaring, foto = genkendelse */
V.lesson=()=>{
  const ex=(pairs)=>pairs.map(([id,v,i])=>{const p=i!=null?photos(id)[i]:photo(id,v);return p?{id,p}:null}).filter(Boolean);
  const L=[
    {id:"lameller",g:"hat",i:"Lameller",t:"Lameller",d:dia("lameller","under"),
      x:"Tynde, bladagtige plader under hatten – som siderne i en bog, der står på højkant.",
      e:ex([["snehvid","under"],["gron","under"],["falsk","under"],["rodbrun","under"]])},
    {id:"ror",g:"hat",i:"Rør / porer",t:"Rør og porer",d:dia("ror","under"),
      x:"En svampet flade af tætte små huller. Hvert hul er åbningen på et rør. Svampe med rør hedder rørhatte.",
      e:ex([["karljohan","under"],["brunstokket","under"],["galde","under"],["slimror","under"]])},
    {id:"ribber",g:"hat",i:"Ribber",t:"Ribber",d:dia("ribber","under"),
      x:"Lave, butte, grenede folder, der løber ned ad stokken. Mere som rynker end som blade.",
      e:ex([["kantarel","under"],["tragt","under"],["trompet","under"]])},
    {id:"pigge",g:"hat",i:"Pigge",t:"Pigge",d:dia("pigge","under"),
      x:"Små tapper, der hænger ned som istapper. Ingen blade, ingen huller.",
      e:ex([["pigsvamp",null,1],["pigsvamp",null,2]])},
    {id:"ring",g:"stok",i:"Ring",t:"Ring",d:dia("lameller","ring",{ring:true}),
      x:"Et skørt eller en krave om stokken – resten af en hinde, der dækkede lamellerne på den unge svamp. Den kan falde af.",
      e:ex([["parasol","ring"],["gron","ring"],["slimror","stok"],["rodmende","stok"]])},
    {id:"basis",g:"stok",i:"Basis",t:"Basis",tech:"Volva – en pose om stokkens fod",d:dia("lameller","basis",{ring:true,volva:"pose"}),
      x:"Nederst på stokken kan der sidde en pose eller en knold. Hos de giftigste fluesvampe sidder den ofte i jorden – grav altid hele svampen fri.",
      e:ex([["gron","basis"],["snehvid","basis"],["kliddet","basis"],["panter","basis"]])}
  ];
  const idx=(g,lbl)=>`<div class="lt-grp"><p class="lbl">${lbl}</p><div class="lt-idx">${L.filter(l=>l.g===g).map(l=>`<a href="#/laer" data-jump="les-${l.id}">${pg(l.id,40,l.i)}<span>${l.i}</span></a>`).join("")}</div></div>`;
  return `${pageHead("","Lær at se","Næsten al bestemmelse begynder under hatten. Seks tegn går igen i hele guiden.")}
    <nav class="lt-index" aria-label="De seks tegn">${idx("hat","Under hatten")}${idx("stok","På stokken")}</nav>
    ${L.map(l=>`<section class="lt-sec" id="les-${l.id}">
      <h2 class="t-state">${l.t}</h2>
      ${l.tech?`<p class="tech">${l.tech}</p>`:""}
      <p class="lt-x">${l.x}</p>
      <div class="lt-track" role="list">
        <figure class="lt-draw" role="listitem"><div class="dia">${l.d}</div></figure>
        ${l.e.map(({id,p})=>`<figure class="lt-ph" role="listitem">${phHTML(p,S[id].da,{ann:false,lb:photoKey(p)})}<figcaption><a href="#/art/${id}">${S[id].da} ${arrow}</a></figcaption></figure>`).join("")}
      </div>
    </section>`).join("")}
    <section class="lt-end"><p class="t-read">Se under hatten. Se på stokken. Grav basis fri.</p>
    <div class="btn-row in"><a class="btn fill" href="#/quiz">Test dig selv</a></div></section>`;
};

/* =====================================================================
   ARTER — indeks og filtre (SKOVEN / KØKKENET)
   ===================================================================== */
const FILT={
  skov:{t:"Skoven",c:[
    {id:"saeson",t:"Sæson",o:[["nu","I sæson nu"]],test:s=>relevance(s,area()).inS},
    {id:"under",t:"Underside",o:Object.entries(UNDERN),icon:v=>v==="andet"?"form":v,test:(s,v)=>s.under===v||s.underAlt===v},
    {id:"trae",t:"Træ",o:[["fyr","Fyr"],["gran","Gran"],["birk","Birk"],["lov","Bøg og eg"]],test:(s,v)=>(s.vv||[]).includes(v)},
    {id:"sted",t:"Voksested",o:[["mos","Mos"],["naale","Nåledække"],["graes","Græs"],["ved","Dødt ved"]],test:(s,v)=>(s.meta.substrates||[]).includes(v)||(v==="ved"&&(s.vv||[]).includes("ved"))}]},
  koekken:{t:"Køkkenet",c:[
    {id:"smag",t:"Smag",o:Object.entries(GVOC.s),test:(s,v)=>{const t=tagsOf(s);return !!t&&t.s.includes(v)}},
    {id:"tekstur",t:"Tekstur",o:Object.entries(GVOC.t),test:(s,v)=>{const t=tagsOf(s);return !!t&&t.t.includes(v)}},
    {id:"tilb",t:"Tilberedning",o:Object.entries(GVOC.k),test:(s,v)=>{const t=tagsOf(s);return !!t&&t.k.includes(v)}}]}
};
let F={}, FOPEN=null;
const allCats=()=>[...FILT.skov.c,...FILT.koekken.c];
const fTone=()=>"moss";
const CHEV=`<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9.5 6 6 6-6"/></svg>`;
function filterUI(groups){
  const active=allCats().filter(c=>F[c.id]&&groups.some(g=>FILT[g].c.includes(c)));
  return `<div class="flt">${groups.map(g=>{const open=FOPEN===g, n=FILT[g].c.filter(c=>F[c.id]).length;
    return `<button class="flt-h" data-fg="${g}" aria-expanded="${open}"><span class="t-cat">${FILT[g].t}</span>${n?`<span class="k">${n} valgt</span>`:""}${CHEV}</button>
    ${open?`<div class="flt-b">${FILT[g].c.map(c=>`<div class="flt-c"><span class="lbl">${c.t}</span><div class="pills">${c.o.map(([v,l])=>`<button data-fc="${c.id}" data-fv="${v}" class="${F[c.id]===v?"on":""}" aria-pressed="${F[c.id]===v}">${c.icon?pg(c.icon(v),18,l):""}${l}</button>`).join("")}</div></div>`).join("")}</div>`:""}`}).join("")}<div class="flt-end"></div></div>
  ${active.length?`<div class="flt-act">${active.map(c=>{const l=(c.o.find(o=>o[0]===F[c.id])||[,""])[1];return `<button class="tag ${fTone(c)}" data-fx="${c.id}" aria-label="Fjern ${esc(l)}">${l}<svg class="x" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7L17 17M17 7L7 17"/></svg></button>`}).join("")}<button class="clr" id="fClear">Nulstil</button></div>`:""}`;
}
function bindFilters(root){
  root.querySelectorAll("[data-fg]").forEach(b=>b.onclick=()=>{FOPEN=FOPEN===b.dataset.fg?null:b.dataset.fg;render(true)});
  root.querySelectorAll("[data-fv]").forEach(b=>b.onclick=()=>{const c=b.dataset.fc;F[c]=F[c]===b.dataset.fv?undefined:b.dataset.fv;if(!F[c])delete F[c];render(true)});
  root.querySelectorAll("[data-fx]").forEach(b=>b.onclick=()=>{delete F[b.dataset.fx];render(true)});
  const c=$("#fClear",root);if(c)c.onclick=()=>{F={};render(true)};
}
/* Indholdet er generelt; kun rækkefølgen er lokal – det siges diskret, dér hvor listen starter */
function localNote(A){return `<p class="local-note lbl">Ordnet for ${esc(A.name)} · ${MONN[new Date().getMonth()]}</p>`}
function applyFilters(list,groups){
  const cats=allCats().filter(c=>F[c.id]&&groups.some(g=>FILT[g].c.includes(c)));
  return list.filter(s=>cats.every(c=>c.test(s,F[c.id])));
}
V.list=(grp)=>{
  const A=area(), RK=ranked(SP,A), REL=Object.fromEntries(RK.map(x=>[x.s.id,x.r]));
  const ord=l=>l.slice().sort((x,y)=>REL[y.id].sc-REL[x.id].sc);
  if(grp==="pas"){
    const four=["snehvid","gron","giftslor","hjelmhat"].map(id=>S[id]);
    return `${pageHead("Pas på","Arter, du bør kende","Fire arter er dødeligt giftige og vokser samme steder som spisesvampe. De to fluesvampe kendes på posen ved basis, gift-slørhatten på de rustbrune lameller, hjelmhatten på de sølvhvide trævler og det døde træ.","danger")}
    ${ixList(four)}
    <section class="sec">${sh("Giftige og ikke spiselige")}${localNote(A)}${ixList(ord(SP.filter(s=>s.grp==="pas"&&!four.includes(s))))}</section>
    <section class="sec">${sh("Se forskellen")}${pairList(PAIRS)}</section>
    ${russula()}`;
  }
  const groups=grp==="godt"?["koekken"]:["skov","koekken"];
  const kitchenOn=FILT.koekken.c.some(c=>F[c.id]);
  const filtering=groups.some(g=>FILT[g].c.some(c=>F[c.id]));
  let base=grp==="godt"?SP.filter(s=>s.grp==="godt"):SP;
  if(kitchenOn) base=base.filter(s=>tagsOf(s));
  const res=ord(applyFilters(base,groups));
  const head=grp==="godt"?pageHead("","Spisesvampe","Spiselig betyder spiselig efter sikker artsbestemmelse. Hver art har en forveksling – se den altid.")
    :pageHead("","Arter",`<b>${SP.length} arter</b>, ordnet efter, hvad du kan møde i ${esc(A.name)} nu.`);
  const body=filtering||grp==="godt"
    ?`${grp==="godt"&&!filtering?localNote(A):""}<p class="res-n">${res.length?res.length+" "+(res.length===1?"art.":"arter."):"Ingen arter passer."}${kitchenOn&&grp!=="godt"?" Kun arter, der regnes for spiselige.":""}</p>${res.length?ixList(res,{taste:kitchenOn||grp==="godt"}):""}`
    :`<section class="sec">${sh("Spisesvampe",`<a href="#/arter/godt">Alle ${arrow}</a>`)}${ixList(ord(SP.filter(s=>s.grp==="godt")))}</section>
      <section class="sec">${sh("Pas på",`<a href="#/arter/pas">Alle ${arrow}</a>`)}${ixList(ord(SP.filter(s=>s.grp==="pas")))}</section>`;
  return `${head}${filterUI(groups)}${body}`;
};

/* =====================================================================
   ARTSSIDEN — én redaktionel profil
   navn · status · foto · karakter · kend den på · kendetegn (nummereret) ·
   voksested og sæson · smag og tekstur · forvekslinger · køkkenet
   ===================================================================== */
const LOOKMAP={Hat:"hat",Form:"hat",Farve:"hat",Overflade:"hat",Hud:"hat",Underside:"under",Stok:"stok",Ring:"stok",Basis:"basis",Kød:"kod",Snit:"kod",Mælk:"kod",Indre:"kod",Duft:"kod",Smag:"kod",Vækst:"vaekst",Alder:"alder",Tilberedning:"tilb"};
const PARTS=[["hat","Hat",["top"]],["under","Underside",["under"]],["stok","Stok",["stok","ring"]],["basis","Basis",["basis"]],["kod","Kød",["kod"]],["vaekst","Vækst",[]],["alder","Alder",[]],["tilb","Tilberedning",[]]];
const FARVEN={hvid:"Hvid",gulgron:"Grønlig",gulorange:"Gul til orange",rod:"Rød",brun:"Brun",grasort:"Grå til sort"};
function signature(s){
  const k=s.k, items=[[underIcon(s),underLabel(s)]];
  const f=(k.farve||[])[0]; if(f) items.push(["hat",FARVEN[f]+(s.under==="andet"?"":" hat")]);
  const has=(q,v)=>(k[q]||[]).length===1&&k[q][0]===v, any=(q,v)=>(k[q]||[]).includes(v);
  const d=has("basis","pose")?["basis","Pose ved basis"]:any("basis","knold")&&s.amanita?["knold","Knold ved basis"]
    :has("maelk","orange")?["kod","Orange mælk"]:has("maelk","hvid")?["kod","Hvid mælk"]
    :any("skift","bla")?["kod","Blåner"]:any("skift","rod")?["kod","Rødmer"]
    :has("hul","ja")?["stok","Hul stok"]:has("net","lyst")?["stok","Lyst net"]:has("net","mort")?["stok","Mørkt net"]
    :has("ring","ja")?["ring","Ring"]:has("slim","ja")?["hat","Slimet"]:null;
  if(d) items.push(d);
  const vv=(s.vv||[]).filter(v=>v!=="ved");
  if(vv.length) items.push(["trae",vv.map(v=>VVN[v]).join(" · ")]);
  else if((s.vv||[]).includes("ved")||(s.k.sted||[]).includes("ved")) items.push(["bund","Dødt ved"]);
  else if((s.k.sted||[]).includes("graes")) items.push(["bund","Græs"]);
  return `<ul class="sig" aria-label="Kendetegn i korte træk">${items.slice(0,4).map(([i,l])=>`<li class="lock">${pg(i,24,l)}<span>${l}</span></li>`).join("")}</ul>`;
}
function kendetegn(s){
  const groups={}, used=new Set();
  for(const [k,v,n] of s.look){const key=LOOKMAP[k]||"hat";(groups[key]=groups[key]||[]).push([k,v,n])}
  if(!groups.basis&&(s.amanita||photo(s.id,"basis"))&&s.sides&&s.sides.basis) groups.basis=[["Basis",s.sides.basis]];
  const all=photos(s.id);
  let html="", no=0;
  for(const [key,title0,views] of PARTS){
    const e=groups[key]; if(!e) continue;
    const title=key==="hat"&&s.under==="andet"?"Form":title0;
    const icon=key==="hat"?(s.under==="andet"?"form":"hat"):key==="under"?underIcon(s):key==="basis"?(s.k.basis&&s.k.basis.includes("knold")&&!s.k.basis.includes("pose")?"knold":"basis"):key==="vaekst"?"bund":["stok","kod"].includes(key)?key:null;
    const ph=all.filter((p,i)=>i>0&&views.includes(p.v)&&!used.has(p)); ph.forEach(p=>used.add(p));
    const [f,...rest]=e, pre=f[0]!==title0&&f[0]!==title?`${f[0]}. `:"";
    html+=`<div class="kt">
      <div class="lock-n kt-h">${icon?pg(icon,22,title):""}<span class="lbl">${title}</span></div>
      <p class="t-obs">${pre}${f[1]}</p>${f[2]?`<span class="nb">${f[2]}</span>`:""}
      ${rest.map(([k,v,n])=>`<p class="kt-more"><b>${k}.</b> ${v}${n?`<span class="nb">${n}</span>`:""}</p>`).join("")}
      ${ph.map(p=>`<figure class="kt-ph${["under","kod","ring"].includes(p.v)&&!(p.a&&p.a.length)?" detail":""}">${phHTML(p,"",{lb:photoKey(p)})}<figcaption>${legend(p.a)}${esc(p.c||"")}</figcaption></figure>`).join("")}
    </div>`;
  }
  if(s.under!=="andet") html+=`<details class="anat"><summary>Se anatomien</summary><figure class="plate"><div class="dia">${diaFor(s,null)}</div><figcaption class="meta">Skematisk tegning: underside${s.k.ring&&s.k.ring[0]==="ja"?", ring":""}${s.k.basis&&(s.k.basis.includes("pose")||s.k.basis.includes("knold"))?" og basis":""} hos ${lcName(s)}.</figcaption></figure></details>`;
  return {html,used};
}
V.species=(id)=>{
  const s=S[id]; if(!s) return V.list();
  const A=area(), rel=relevance(s,A);
  const g=typeof GASTRO!=="undefined"&&GASTRO[id], tags=tagsOf(s);
  const pairs=PAIRS.filter(p=>p.a===id||p.b===id);
  const likeOnly=s.like.filter(x=>!pairs.some(p=>p.a===x||p.b===x));
  const KT=kendetegn(s);
  const hero=photos(id).filter(p=>!KT.used.has(p));
  const field=s.st==="meget";
  let warn="";
  if(s.danger){ if(isDanger(s)){const m=s.danger.match(/^(.+?[.!])\s(.*)$/);warn=m?`<b>${m[1]}</b> ${m[2]}`:s.danger}else warn=s.danger;
    warn=`<p class="warn t-read">${warn}</p>`; }
  const vv=(s.vv||[]).filter(v=>v!=="ved"), bund=(s.bund||[]).map(b=>BUND[b]);
  if((s.vv||[]).includes("ved")) bund.unshift("Dødt ved");
  const mo=MONN[new Date().getMonth()];
  const ctx=!rel.inS?`Ikke i sæson i ${mo}.`:rel.n>0?`Kan mødes i ${esc(A.name)} nu.`:`I sæson nu.`;
  const W=o=>cap1(o.join(" · ").toLowerCase());
  return `
  <header class="sp-id${field?" field":""}">
    <h1 class="t-display">${s.da}</h1>
    <p class="la">${s.la}</p>${s.alt?`<p class="syn">${s.alt}</p>`:""}
    <div class="st-row">${statusTag(s,field?"paper":null)}</div>
    ${SPIS(s)?`<p class="st-note">Kun efter sikker artsbestemmelse.</p>`:""}
    ${warn}
  </header>
  ${gallery(id,hero)}
  <p class="lede t-obs">${s.lede}</p>
  <div class="sig-w"><p class="lbl">Kend den på</p>${signature(s)}</div>

  <section class="sec">${sh("Kendetegn")}${KT.html}</section>

  <section class="sec">${sh("Voksested")}
    ${vv.length?`<p class="hab-r"><span>${vv.map(v=>VVN[v]).join(" · ")}</span></p>`:""}
    ${bund.length?`<p class="hab-r"><span>${[...new Set(bund)].join(" · ")}</span></p>`:""}
    <p class="hab">${s.hab}</p>
    ${s.rare?`<p class="meta">${s.rare}</p>`:""}
    <div class="season"><p class="lbl">Sæson</p>${monthsHTML(s.m)}</div>
    <p class="ctx${rel.inS?" on":""}">${ctx}</p>
  </section>

  ${tags&&g?`<section class="sec">${sh("Smag og tekstur")}
    <dl class="sense">
      <div><dt class="lbl">Smag</dt><dd>${tags.s.length?`<span class="t-obs">${W(tags.s.map(x=>GVOC.s[x]))}</span>`:""}<p>${g.smag}</p></dd></div>
      <div><dt class="lbl">Tekstur</dt><dd><span class="t-obs">${W(tags.t.map(x=>GVOC.t[x]))}</span><p>${g.tekstur}</p></dd></div>
      <div><dt class="lbl">Bedst til</dt><dd><span class="t-obs">${W(tags.k.map(x=>GVOC.k[x]))}</span></dd></div>
    </dl></section>`:""}
  ${s.noGastro&&SPIS(s)?`<section class="sec">${sh("Smag og tekstur")}<p class="say">Ingen køkkenbeskrivelse: arten har en dødelig dobbeltgænger og er kun for meget erfarne samlere.</p></section>`:""}

  ${(pairs.length||likeOnly.length||s.extra)?`<section class="sec">${sh("Forvekslinger")}
    <div class="ix sq">${pairs.map(p=>{const o=S[p.a===id?p.b:p.a];return `<a href="#/forskel/${p.id}">${phHTML(photo(o.id,"typisk")||photo(o.id),"",{ann:false,thumb:true})}<span class="t"><b class="nm">${o.da}</b>${statusTag(o)}<span class="q">${p.q} Se forskellen ${arrow}</span></span></a>`}).join("")}
    ${likeOnly.map(x=>`<a href="#/art/${x}">${phHTML(photo(x,"typisk")||photo(x),"",{ann:false,thumb:true})}<span class="t"><b class="nm">${S[x].da}</b>${statusTag(S[x])}</span></a>`).join("")}</div>
    ${s.extra?`<p class="say">${s.extra}</p>`:""}</section>`:""}

  ${tags&&g?`<a class="to-kitchen" href="#/art/${id}/koekken"><span class="row"><b class="t-display">Gå i køkkenet</b>${arrow}</span><span class="s">Hvorfor den opfører sig, som den gør – og tre måder at lave den på.</span></a>`:""}`;
};

/* =====================================================================
   SE FORSKELLEN — A / B, én afgørende forskel, så detaljerne
   ===================================================================== */
const ROWICON={Underside:"under",Porer:"under",Lameller:"under",Stok:"stok",Ring:"ring",Stokbasis:"basis",Basis:"basis",Kød:"kod",Snit:"kod",Smag:"kod",Duft:"kod",Konsistens:"kod",Mælk:"kod",Hat:"hat",Form:"hat",Farve:"hat",Voksested:"bund"};
V.pairs=()=>`${pageHead("","Se forskellen","To arter side om side. Én detalje ad gangen.")}${pairList(PAIRS)}`;
V.pair=(pid)=>{
  const p=PAIRS.find(x=>x.id===pid); if(!p) return V.pairs();
  const a=S[p.a], b=S[p.b];
  const ha=photo(a.id,"typisk")||photo(a.id), hb=photo(b.id,"typisk")||photo(b.id);
  const lead=(sp,lbl)=>lbl==="Underside"||lbl==="Lameller"||lbl==="Porer"?pg(underIcon(sp),20,underLabel(sp)):"";
  const used=new Set([ha,hb]); let no=0;
  return `<div class="cmp-head"><a href="#/art/${a.id}">${a.da}</a><a href="#/art/${b.id}">${b.da}</a></div>
  ${ha&&hb?`<div class="ab tall">${phHTML(ha,a.da,{ann:false,lb:photoKey(ha)})}${phHTML(hb,b.da,{ann:false,lb:photoKey(hb)})}</div>`:""}
  <div class="ab-names"><a href="#/art/${a.id}"><b class="nm">${a.da}</b>${statusTag(a)}</a><a href="#/art/${b.id}"><b class="nm">${b.da}</b>${statusTag(b)}</a></div>
  <section class="decisive"><p class="lbl">Det afgørende</p><h1 class="t-state">${p.q}</h1><p class="k">${p.key}</p></section>
  ${p.rows.map(([lbl,view,ta,tb])=>{
    const pa=view&&photo(a.id,view), pb=view&&photo(b.id,view);
    const show=pa&&pb&&!used.has(pa)&&!used.has(pb); if(show){used.add(pa);used.add(pb)}
    const ic=ROWICON[lbl];
    return `<section class="cmp-row"><div class="lock-n">${ic?pg(ic,22,lbl):""}<span class="lbl">${lbl}</span></div>
      ${show?`<div class="pair">${phHTML(pa,a.da,{lb:photoKey(pa)})}${phHTML(pb,b.da,{lb:photoKey(pb)})}</div>`:""}
      <div class="txt"><p>${lead(a,lbl)}${show?legend(pa.a):""}${ta}</p><p>${lead(b,lbl)}${show?legend(pb.a):""}${tb}</p></div></section>`}).join("")}
  <nav class="more"><a href="#/art/${a.id}">${a.da}${arrow}</a><a href="#/art/${b.id}">${b.da}${arrow}</a></nav>`;
};

/* =====================================================================
   UNDERSØG — nøglen (morfologi først)
   ===================================================================== */
let K={a:{},step:0,stopShown:false};
function keyQs(){return K.a.under?["under"].concat(FLOW[K.a.under]):["under"]}
function scoreSp(){
  const u=K.a.under;
  let c=SP.filter(s=>u==="vedikke"||!u||s.under===u||s.underAlt===u);
  return c.map(s=>{let sc=0;
    for(const q of FLOW[u]||[]){const a=K.a[q]; if(!a||a==="vedikke")continue;
      let vals=s.k[q];
      if(q==="hab"){ if(a==="bland") vals=(s.k.hab.includes("lov")||s.k.hab.includes("nal"))?["bland"]:[]; else if(a==="skovbund") vals=s.k.hab.includes("traeved")&&s.k.hab.length===1?[]:["skovbund"]; }
      if(!vals) continue;
      const soft=q==="trae"||q==="sted";
      if(vals.includes(a)) sc+=soft?1:2; else sc-=soft?1:3;
    }
    if(s.under===u) sc+=1;
    sc+=relevance(s,area()).inS?.5:-.5;
    return {s,sc};
  }).sort((x,y)=>y.sc-x.sc);
}
function amanitaSignal(){
  const a=K.a;
  const lam=a.under==="lameller"||a.under==="vedikke";
  return lam&&(a.basis==="pose"||a.basis==="knold"||(a.ring==="ja"&&a.basis==="vedikke")||(a.farve==="hvid"&&a.basis!=="ingen"));
}
const QICON={under:"under",ring:"ring",basis:"basis",farve:"hat",pletter:"hat",slim:"hat",skift:"kod",maelk:"kod",pore:"ror",net:"stok",hul:"stok",ribtype:"ribber",trae:"trae",sted:"bund",hab:"trae",form:"form"};
const SWATCH={hvid:"#F4F4F2",gulgron:"#B9B77A",gulorange:"#E0A12E",rod:"#C23B22",brun:"#7A5234",grasort:"#3C3A36",lyserod:"#E6B8B0",gul:"#D9C04A"};
V.key=()=>{
  const qs=keyQs();
  if(K.step>=qs.length&&K.a.under) return keyResult();
  const qid=qs[K.step], q=Q[qid];
  const total=K.a.under?qs.length:6;
  const icon=v=>qid==="under"?(v==="andet"?"form":v):qid==="ring"?(v==="ja"?"ring":"stok"):qid==="basis"?({pose:"basis",knold:"knold",ingen:"stok"})[v]:qid==="form"?"form":null;
  const withIcon=["under","ring","basis"].includes(qid), sw=qid==="farve"||qid==="pore", tiles=withIcon||sw;
  const body=(l,h)=>`<span><b>${l}</b>${h?`<small>${h}</small>`:""}</span>`;
  const opts=q.o.map(([v,l,h])=>tiles
    ?`<button class="opt tile" data-v="${v}">${withIcon?pg(icon(v),52,l):`<i class="sw" style="background:${SWATCH[v]}"></i>`}${body(l,h)}</button>`
    :`<button class="opt rowo" data-v="${v}">${body(l,h)}${arrow}</button>`).join("");
  const dk=`<button class="opt ${tiles?"tile":"rowo"} dk" data-v="vedikke">${body("Ved ikke")}${arrow}</button>`;
  return `<div class="key-top"><span class="lbl">Undersøg · ${K.step+1} / ${total}</span>${K.step?`<button class="txt-link" id="kRestart">Start forfra</button>`:""}</div>
  <div class="key-prog" aria-hidden="true">${Array.from({length:total},(_,i)=>`<i class="${i<=K.step?"on":""}"></i>`).join("")}</div>
  <div class="key-q"><p class="lbl">Hvad ser du?</p><h1 class="t-state">${q.t}</h1><p class="intro">${q.h}</p></div>
  <div class="${tiles?"tiles":"rows"}">${opts}${dk}</div>
  ${K.step?`<div class="btn-row"><button class="btn" id="kBack">Tilbage</button></div>`:`<p class="aside">Usikker? <a href="#/laer">Lær de fire slags underside</a>.</p>`}`;
};
function keyResult(){
  const u=K.a.under;
  const given=Object.entries(K.a).filter(([k,v])=>v&&v!=="vedikke").map(([k,v])=>{const o=Q[k].o.find(x=>x[0]===v);return `${QLBL[k]}: ${(o?o[1]:v).toLowerCase()}`}).join(" · ");
  let r=scoreSp();
  const best=r.length?r[0].sc:0;
  let top=r.filter(x=>x.sc>=best-3&&x.sc>0).slice(0,3);
  const danger=amanitaSignal()||top.some(x=>x.s.st==="meget");
  let html=`${pageHead("Undersøg","Det kan være","Et forslag blandt guidens "+SP.length+" arter – ikke en sikker bestemmelse.")}<p class="given meta">${esc(given)}</p>`;
  if(K.a.form==="kugle") html+=`<p class="say"><b>Skær den igennem.</b> Ser du omridset af en hat og lameller, er det en fluesvamp i ‘æg’-stadiet. Er den sortviolet indeni, er det en giftig bruskbold.</p>`;
  if(K.a.form==="morkel"||K.a.form==="hjerne") html+=`<p class="say"><b>Skær på langs.</b> Spiselig morkel har ét gennemgående hulrum. Ægte stenmorkel har hjernefolder og kamre – og er meget giftig.</p>`;
  if(danger) html+=`<p class="say danger"><b>Dødeligt giftige arter er mulige.</b> Dine svar udelukker dem ikke. <button class="txt-link" id="kStop">Se, hvad du skal undersøge ${arrow}</button></p>`;
  if(!top.length){
    html+=`<div class="empty-st">${pg("form",48)}<p class="t-obs">Ingen af guidens arter passer godt.</p><p class="intro">Det er normalt. Der findes tusindvis af svampearter i Danmark, og guiden rummer ${SP.length}. Registrér den som ukendt – det er også et fund.</p></div>`;
  } else {
    html+=`<div class="ix res-ix">${top.map(x=>ixRow(x.s)).join("").replace(/<a /g,"<a ")}</div>`;
    if(top.length>1){
      const qs=["under"].concat(FLOW[u]||[]).concat(["skift"]).filter((v,i,a)=>a.indexOf(v)===i);
      const rows=qs.filter(q=>{const vs=top.map(x=>(x.s.k[q]||(q==="under"?[x.s.under]:[])).join());return vs.every(Boolean)&&new Set(vs).size>1});
      if(rows.length) html+=`<section class="sec">${sh("Det skiller dem ad")}<dl class="sep">${rows.map(q=>`<dt class="lock">${QICON[q]?pg(QICON[q],20):""}<span class="lbl">${QLBL[q]}</span></dt><dd>${top.map(x=>{const vals=q==="under"?[x.s.under]:x.s.k[q];return `<p><b>${x.s.da}</b> ${vals.map(v=>{const o=Q[q].o.find(z=>z[0]===v);return o?o[1].toLowerCase():v}).join(" eller ")}</p>`}).join("")}</dd>`).join("")}</dl></section>`;
      const pr=PAIRS.find(p=>top.slice(0,2).every(x=>x.s.id===p.a||x.s.id===p.b));
      if(pr) html+=`<div class="btn-row"><a class="btn fill" href="#/forskel/${pr.id}">Se forskellen side om side</a></div>`;
    }
  }
  html+=`<div class="btn-row"><button class="btn" id="kBack">Ret svar</button><button class="btn" id="kRestart">Start forfra</button></div>`;
  return html;
}
function showStop(){
  if($("#stop")) return;
  const el=document.createElement("div"); el.id="stop"; el.setAttribute("role","dialog"); el.setAttribute("aria-label","Stop");
  const L=[["basis","Hele basis.","Grav svampen fri med en kniv. En løs pose? En knold med kant eller vortebælter? Posen sidder ofte under jorden."],
    ["ring","Ring.","Et hængende skørt under hatten – eller mærket efter et, der er faldet af."],
    ["lameller","Lameller.","Hvide? Frie af stokken?"],
    ["hat","Hat.","Vorter, flager eller hudrester? Regnen kan have vasket dem af."]];
  el.innerHTML=`<div class="in">
    <div class="stop-sign"><h1>STOP</h1><p>Gruppen rummer dødeligt giftige arter. Spis ikke en svamp på grundlag af denne guide.</p></div>
    <div class="stop-body">
      <p class="t-read">Lameller sammen med ring, pose eller knold ved basis er kendetegn for fluesvampe (<i>Amanita</i>). Grøn fluesvamp og Snehvid fluesvamp vokser i Danmark.</p>
      <h2 class="sh">Undersøg – uden at smage</h2>
      <ol>${L.map(([i,b,t],n)=>`<li><span class="num">${nn(n+1)}</span>${pg(i,26)}<span><b>${b}</b>${t}</span></li>`).join("")}</ol>
      <div class="pair">${phHTML(photo("gron","basis"),"Grøn fluesvamp – basis")}${phHTML(photo("kliddet","basis")||photo("panter","basis"),"Knold")}</div>
      <div class="txt"><p>Grøn fluesvamp: løs pose</p><p>Kliddet fluesvamp: knold med kant</p></div>
      <p class="meta">Hold svampen adskilt fra spisesvampe i kurven, og vis den til jeres guide. Mistanke om forgiftning: Giftlinjen <a href="tel:82121212">82 12 12 12</a>. Akut fare: 112.</p>
      <div class="btn-col"><button class="btn fill" id="stopOk">Forstået</button><a class="btn" href="#/forskel/gron-kliddet" id="stopCmp">Se forskellen: pose og knold</a></div>
    </div></div>`;
  document.body.appendChild(el);
  $("#stopOk",el).onclick=()=>el.remove();
  $("#stopCmp",el).onclick=()=>el.remove();
}

function bindKey(root){
  root.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{
    const qs=keyQs(), qid=qs[K.step];
    K.a[qid]=b.dataset.v;
    if(qid==="under"){for(const k in K.a) if(k!=="under") delete K.a[k]}
    K.step++;
    render();window.scrollTo(0,0);
    if(!K.stopShown&&amanitaSignal()){K.stopShown=true;showStop()}
  });
  const bk=$("#kBack",root); if(bk) bk.onclick=()=>{const qs=keyQs();K.step=Math.max(0,Math.min(K.step,qs.length)-1);delete K.a[qs[K.step]];if(!amanitaSignal())K.stopShown=false;render();window.scrollTo(0,0)};
  root.querySelectorAll("#kRestart").forEach(b=>b.onclick=()=>{K={a:{},step:0,stopShown:false};render();window.scrollTo(0,0)});
  const ks=$("#kStop",root); if(ks) ks.onclick=showStop;
}
/* =====================================================================
   QUIZ — træner øjet, ikke spiselighed
   ===================================================================== */
const SCEN=[
  {q:"En orange svamp med lameller under fyr. Hvordan skelner du Velsmagende mælkehat fra Rødbrun mælkehat?",img:["maelkehat","typisk"],
   o:["Brækker en lamel og ser mælkens farve","Ser, om den står i mos","Måler hatten","Lugter til stokken"],c:0,
   e:"Velsmagende mælkehat har orange mælk og grønne pletter. Rødbrun mælkehat har hvid, brændende skarp mælk."},
  {q:"Du finder en rørhat under fyr. Hvad kan træet fortælle dig?",img:["sandror","typisk"],
   o:["At den er spiselig","Hvilke arter du kan forvente – ikke hvad den er","Ingenting","At den ikke er giftig"],c:1,
   e:"Træer og skovbund snævrer mulighederne ind. De afgør aldrig en bestemmelse – og aldrig om en svamp kan spises."},
  {q:"En hvid hatsvamp med hvide lameller og en ring. Hvad undersøger du nu?",img:["snehvid","typisk"],
   o:["Hele basis – jeg graver den fri","Duften","Hattens størrelse","Hvor mange der står sammen"],c:0,
   e:"En hvid svamp med hvide lameller og ring kan være Snehvid fluesvamp. Posen ved basis sidder ofte under jorden."},
  {q:"En gul, tragtformet svamp i nåleskoven. Hvad kigger du på først?",img:["falsk","typisk"],
   o:["Hattens farve","Undersiden: ribber eller lameller?","Om den står i skygge","Om den lugter af svamp"],c:1,
   e:"Kantarel har butte ribber. Falsk kantarel har tynde, tætte lameller – og farverne overlapper."},
  {q:"En brun rørhat. Hvad skiller Karl Johan fra Galderørhat?",img:["galde","typisk"],
   o:["Hattens farve","Størrelsen","Nettet på stokken og porernes farve","Om den vokser under bøg"],c:2,
   e:"Karl Johan: fint, lyst net og hvide til gule porer. Galderørhat: groft, mørkt net og lyserøde porer."},
  {q:"Brun hat med hvide vorter. Hvad skiller Panterfluesvamp fra Rødmende fluesvamp?",img:["panter","typisk"],
   o:["Om kødet rødmer, og om ringen er riflet","Hvor store vorterne er","Om hatten er våd","Om der er snegle på"],c:0,
   e:"Rødmende fluesvamp rødmer langsomt og har riflet ring. Panterfluesvamp rødmer ikke og har glat ring. Begge frarådes."},
  {q:"En lille brun svamp med gul stok i mos under gran. Hvad tjekker du?",img:["tragt","typisk"],
   o:["Om den er klistret","Om stokken er hul, og om undersiden har ribber eller rustbrune lameller","Om den er større end 5 cm","Om den dufter af anis"],c:1,
   e:"Tragtkantarel har hul stok og grå ribber. Puklet gift-slørhat har massiv stok og rustbrune lameller – og vokser samme sted."},
  {q:"En stor svamp med skællet hat og høj stok i en lysning. Hvad ser du efter?",img:["parasol","typisk"],
   o:["Slangeskindsmønster på stokken og en løs ring","Om hatten er rund","Om der er orm i","Om den står alene"],c:0,
   e:"Stor kæmpeparasolhat har slangeskind og en ring, der kan skubbes. Små parasolhatte kan være giftige."},
  {q:"Hvornår er en svamp sikker at spise?",img:null,
   o:["Når den ligner billedet","Når guiden siger ‘det kan være’","Når dyr har spist af den","Når netop dit eksemplar er sikkert bestemt af en kyndig"],c:3,
   e:"Snegle og dyr kan tåle svampe, der er dødelige for os. Billeder og nøgler kan kun hjælpe dig til at se."},
  {q:"Hvilken del af en fluesvamp overses oftest?",img:["gron","typisk"],
   o:["Hatten","Lamellerne","Basis – den sidder i jorden","Ringen"],c:2,
   e:"Plukker du svampen ved at knække stokken, efterlader du posen i jorden. Grav hele svampen fri."}
];
let QZ=null;
function newQuiz(){
  const qs=[], pool=[];
  for(const s of SP){ if(s.id==="trompet"||s.under==="andet")continue; for(const p of photos(s.id)) if(p.v==="under") pool.push({s,p}); }
  pool.sort(()=>Math.random()-.5);
  const ul={lameller:"Lameller",ror:"Rør",ribber:"Ribber",pigge:"Pigge"};
  pool.slice(0,3).forEach(({s,p})=>qs.push({t:"under",q:"Hvad ser du under hatten?",p,o:Object.values(ul),icons:Object.keys(ul),c:Object.keys(ul).indexOf(s.under),
    e:`Det er ${s.da}: ${s.sides.under}${s.id==="falsk"?" Bemærk: falsk kantarel har lameller – ikke ribber.":""}`}));
  [...PAIRS].sort(()=>Math.random()-.5).slice(0,3).forEach(pr=>{
    const others=PAIRS.filter(x=>x.id!==pr.id).sort(()=>Math.random()-.5).slice(0,3).map(x=>x.q);
    const o=[pr.q,...others].sort(()=>Math.random()-.5);
    qs.push({t:"pair",q:"Hvilken detalje skiller de to ad?",two:[pr.a,pr.b],o,c:o.indexOf(pr.q),e:pr.key});
  });
  [...SCEN].sort(()=>Math.random()-.5).slice(0,4).forEach(sc=>qs.push({t:"scen",q:sc.q,p:sc.img?photo(sc.img[0],sc.img[1])||photo(sc.img[0]):null,o:sc.o,c:sc.c,e:sc.e}));
  QZ={qs:[qs[0],qs[3],qs[6],qs[1],qs[4],qs[7],qs[2],qs[5],qs[8],qs[9]].filter(Boolean),i:0,score:0,ans:null};
}
V.quiz=()=>{
  if(!QZ) newQuiz();
  const n=QZ.qs.length;
  if(QZ.i>=n){
    const best=Math.max(LS.get("quizBest",0),QZ.score); LS.set("quizBest",best);
    LS.set("quizRounds",LS.get("quizRounds",0)+1);
    const msg=QZ.score>=9?"Du ser detaljerne. Brug dem i skoven – og vis stadig alt til en kyndig.":QZ.score>=6?"Godt set. Tag en runde mere, og se igen på dem, du missede.":"Det er svært i begyndelsen. Læs Lær at se, og prøv igen.";
    return `<header class="ph-head"><p class="lbl">Quiz · resultat</p><p class="qz-score">${QZ.score}<span class="g">/${n}</span></p><p class="intro">${msg}</p><p class="meta" style="margin-top:12px">Bedste resultat ${best} / ${n} · ${LS.get("quizRounds",0)} runder</p></header>
    <div class="btn-row"><button class="btn fill" id="qzAgain">Ny runde</button><a class="btn" href="#/laer">Lær at se</a></div>`;
  }
  const q=QZ.qs[QZ.i];
  let media="";
  if(q.two) media=`<div class="pair">${q.two.map(id=>phHTML(photo(id,"typisk")||photo(id),S[id].da,{ann:false})).join("")}</div><div class="txt"><p class="nm">${S[q.two[0]].da}</p><p class="nm">${S[q.two[1]].da}</p></div>`;
  else if(q.p) media=`<div class="qz-img">${phHTML(q.p,"",{ann:false})}</div>`;
  const ans=QZ.ans;
  return `<div class="key-top"><span class="lbl">Quiz · ${QZ.i+1} / ${n}</span><span class="lbl">${QZ.score} rigtige</span></div>
  <div class="key-prog" aria-hidden="true">${Array.from({length:n},(_,i)=>`<i class="${i<=QZ.i?"on":""}"></i>`).join("")}</div>
  <h1 class="qz-q t-obs">${q.q}</h1>${media}
  <div class="rows">${q.o.map((o,i)=>`<button class="qz-opt rowo ${ans!=null?(i===q.c?"ok":i===ans?"no":""):""}" data-i="${i}" ${ans!=null?"disabled":""}>${q.icons?pg(q.icons[i],26,o):""}<span>${o}</span></button>`).join("")}</div>
  ${ans!=null?`<div class="qz-exp"><span class="lbl">${ans===q.c?"Rigtigt":"Ikke helt"}</span><p>${q.e}</p></div><div class="btn-row"><button class="btn fill" id="qzNext">${QZ.i+1<n?"Næste":"Se resultat"}</button></div>`:""}`;
};

function bindQuiz(root){
  root.querySelectorAll(".qz-opt").forEach(b=>b.onclick=()=>{if(QZ.ans!=null)return;QZ.ans=+b.dataset.i;if(QZ.ans===QZ.qs[QZ.i].c)QZ.score++;render(true);setTimeout(()=>{const e=$(".qz-exp");e&&e.scrollIntoView({behavior:"smooth",block:"center"})},50)});
  const nx=$("#qzNext",root); if(nx) nx.onclick=()=>{QZ.i++;QZ.ans=null;render();window.scrollTo(0,0)};
  const ag=$("#qzAgain",root); if(ag) ag.onclick=()=>{QZ=null;render()};
}

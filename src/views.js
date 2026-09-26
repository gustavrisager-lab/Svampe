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
function annSVG(a){
  if(!a||!a.length) return "";
  let g="";
  for(const [x,y,r,t] of a){
    const cx=x*4, cy=y*3, rr=r*4;
    g+=`<circle class="o" cx="${cx}" cy="${cy}" r="${rr}"/><circle cx="${cx}" cy="${cy}" r="${rr}"/>`;
    if(t){const w=t.length*9.4+16, lx=Math.min(Math.max(cx-w/2,6),394-w), ly=cy+rr+8>270?cy-rr-30:cy+rr+8;
      g+=`<rect x="${lx}" y="${ly}" width="${w}" height="22"/><text x="${lx+7}" y="${ly+15.5}">${esc(t.toUpperCase())}</text>`;}
  }
  return `<svg class="ann" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">${g}</svg>`;
}
function phHTML(p,label,opts={}){
  if(!p) return `<div class="ph empty"><span>${esc(label||"Foto mangler")}</span></div>`;
  const src=opts.thumb?p.t:p.s, att=opts.defer?`data-src="${src}"`:`src="${src}" loading="lazy"`;
  return `<div class="ph"${opts.lb?` data-lb="${opts.lb}"`:""}><img ${att} alt="${esc(p.c||label||"")}" decoding="async">${opts.ann===false?"":annSVG(p.a)}</div>`;
}
const SPIS=s=>s.st==="god"||s.st==="spis";
function statusHTML(s){const t=STATUS[s.st];return `<span class="status ${t.c}"><i aria-hidden="true"></i>${t.t}${s.deadly?" · dødelig":""}</span>`}
function stTxt(s){const t=STATUS[s.st];return `<span class="st ${t.c}">${t.t}${s.deadly?" · dødelig":""}</span>`}
function monthsHTML(m){const now=new Date().getMonth()+1;return `<div class="months" role="img" aria-label="Sæson: ${m.map(x=>MONN[x-1]).join(", ")}">${MONTHS.map((l,i)=>`<span class="${m.includes(i+1)?"on":""}${now===i+1?" now":""}">${l}</span>`).join("")}</div>`}
const arrow=`<span class="arr" aria-hidden="true">→</span>`;

/* =====================================================================
   PIKTOGRAMMER — SVAMPEs botaniske alfabet.
   Én silhuet (hat + stok); den del, der tales om, er fyldt sort.
   Undersidetyperne har hver sin tekstur. Samme tegn betyder altid det samme.
   ===================================================================== */
const CAP="M3.5 11.5C3.5 6.5 7.5 3.5 12 3.5S20.5 6.5 20.5 11.5Z", STEM='<path d="M10.5 11.5V20.5H13.5V11.5"/>';
const PG={
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
const PGN={hat:"Hat",under:"Underside",lameller:"Lameller",ror:"Rør",ribber:"Ribber",pigge:"Pigge",stok:"Stok",ring:"Ring",basis:"Basis med pose",knold:"Basis med knold",kod:"Kød og snit",trae:"Træ",bund:"Voksested",form:"Anden form",kamera:"Kamera"};
function pg(n,size=22,label){const t=label||PGN[n]||n;return `<svg class="pg" viewBox="0 0 24 24" width="${size}" height="${size}" role="img" aria-label="${esc(t)}">${PG[n]||""}</svg>`}
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
  if(!list.length) return `<div class="gal"><div class="gal-track"><div class="slide">${phHTML(null,"Foto mangler")}</div></div></div>`;
  const ix=list.map(p=>all.indexOf(p));
  return `<div class="gal" data-sp="${id}" data-ix="${ix.join(",")}">
    <div class="gal-track">${list.map((x,i)=>`<div class="slide">${phHTML(x,"",{lb:id+":"+ix[i],defer:i>0})}</div>`).join("")}</div>
    <div class="arr-btn l"><button aria-label="Forrige billede">‹</button></div><div class="arr-btn r"><button aria-label="Næste billede">›</button></div>
    <div class="gal-meta"><p class="cap"></p><span class="gal-n"></span></div>
    <p class="credit"></p>
  </div>`;
}
function initGalleries(root){
  root.querySelectorAll(".gal[data-sp]").forEach(g=>{
    const all=photos(g.dataset.sp), p=g.dataset.ix.split(",").map(i=>all[+i]), tr=$(".gal-track",g), cap=$(".cap",g), n=$(".gal-n",g), cr=$(".credit",g);
    let cur=-1;
    const imgs=[...g.querySelectorAll(".gal-track img")];
    const load=i=>{for(const j of [i,i+1,i-1]){const im=imgs[j];if(im&&im.dataset.src){im.src=im.dataset.src;delete im.dataset.src}}};
    const set=i=>{ if(i===cur)return; cur=i; const x=p[i]; if(!x) return; load(i);
      cap.innerHTML=`<span class="lbl">${VIEWN[x.v]||""}</span> ${esc(x.c||"")}`; n.textContent=p.length>1?(i+1)+" / "+p.length:""; cr.textContent=x.by?"Foto: "+x.by:"";
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
function pageHead(label,title,intro,cls=""){return `<header class="ph-head ${cls}">${label?`<span class="lbl">${label}</span>`:""}<h1 class="d">${title}</h1>${intro?`<p class="intro">${intro}</p>`:""}</header>`}
function sh(t,extra=""){return `<h2 class="sh">${t}${extra}</h2>`}
function tagsOf(s){const g=typeof GASTRO!=="undefined"&&GASTRO[s.id];return g&&g.tags&&SPIS(s)&&!s.noGastro?g.tags:null}
function culLine(s){const t=tagsOf(s);if(!t)return "";const w=[...t.s.map(x=>GVOC.s[x]),...t.t.slice(0,1).map(x=>GVOC.t[x])];return w.length?`<span class="cul">${w.join(" · ")}</span>`:""}
function card(s,opt={}){
  return `<a class="card" href="#/art/${s.id}"><div class="card-ph">${phHTML(photo(s.id,"typisk")||photo(s.id),s.da,{ann:false,thumb:true})}${opt.n?`<span class="num">${opt.n}</span>`:""}${foundToday(s.id)?`<span class="found">Set i dag</span>`:""}</div>
    <h3 class="nm">${s.da}</h3><p class="la">${s.la}</p>${stTxt(s)}${opt.spot?`<p class="kdp-s"><span class="lbl">Kend den på</span>${s.spot||""}</p>`:culLine(s)}</a>`;
}
function russula(){return `<aside class="note"><h3 class="lbl">Skørhatte og mælkehatte</h3><p>Du vil møde mange skørhatte (<i>Russula</i>). Kødet knækker som kridt, og der kommer ingen mælk. Der er mange arter, og flere er skarpe eller giftige, så de er ikke med i guiden. Mælkehatte ligner dem, men bløder mælk, når du brækker en lamel.</p></aside>`}

/* =====================================================================
   START
   ===================================================================== */
V.home=()=>{
  const a=area(), top=watchList(a), hero=top[0]&&top[0].s;
  const meta=[a.skov?SKOV[a.skov]:null,(a.trees||[]).length?a.trees.map(t=>TREEN[t]).join("/"):null,MONN[new Date().getMonth()]].filter(Boolean).join(" · ");
  const alpha=["lameller","ror","ribber","pigge","ring","basis"];
  return `
  <section class="home-area">
    <span class="lbl">Område</span>
    <h1 class="d-xl">${esc(a.name)}</h1>
    <p class="meta">${esc(meta)}</p>
    <button class="txt-link" data-area>Skift område ${arrow}</button>
  </section>
  <a class="home-now" href="#/omraade">
    ${hero?`<figure>${phHTML(photo(hero.id,"typisk")||photo(hero.id),hero.da,{ann:false})}<figcaption>${hero.da}</figcaption></figure>`:""}
    <span class="lbl">I skoven nu</span>
    <span class="row"><b class="d-m">${top.length} arter, du kan møde</b>${arrow}</span>
  </a>
  <nav class="entrances" aria-label="Indgange">
    <a href="#/laer"><span class="t d-m">Lær at se</span><span class="alpha" aria-hidden="true">${alpha.map(n=>pg(n,22)).join("")}</span><span class="s">De seks tegn, der gør svampe lettere at forstå.</span>${arrow}</a>
    <a href="#/noegle"><span class="t d-m">Kig nærmere</span><span class="s">Undersøg det, du står med – trin for trin.</span>${arrow}</a>
    <a href="#/arter/godt"><span class="t d-m">Spisesvampe</span><span class="s">Smag, kendetegn og forvekslinger.</span>${arrow}</a>
  </nav>
  <div class="cta-wrap"><a class="btn big" href="#/registrer">${pg("kamera",24)}Registrér et fund</a></div>
  <nav class="minor" aria-label="Mere">
    <a href="#/arter/pas" class="warn">Pas på${arrow}</a>
    <a href="#/forskelle">Se forskellen${arrow}</a>
    <a href="#/quiz">Quiz${LS.get("quizBest",null)!=null?`<span class="m">bedst ${LS.get("quizBest")}/10</span>`:""}${arrow}</a>
    <a href="#/fund">Mine fund${FINDS.length?`<span class="m">${FINDS.length}</span>`:""}${arrow}</a>
  </nav>`;
};

/* =====================================================================
   LÆR AT SE — alfabetet, som resten af guiden bruger
   ===================================================================== */
V.lesson=()=>{
  const L=[
    {id:"lameller",t:"Lameller",tech:"",d:dia("lameller","under"),p:photo("snehvid","under")||photo("kliddet","under"),
      x:"Tynde, bladagtige plader under hatten – som siderne i en bog, der står på højkant.", ex:["gron","parasol","falsk"]},
    {id:"ror",t:"Rør og porer",tech:"",d:dia("ror","under"),p:photo("karljohan","under"),
      x:"En svampet flade af tætte små huller. Hvert hul er åbningen på et lille rør. Svampe med rør kaldes rørhatte.", ex:["karljohan","brunstokket","galde"]},
    {id:"ribber",t:"Ribber og folder",tech:"Også kaldet lister",d:dia("ribber","under"),p:photo("kantarel","under"),
      x:"Lave, butte, grenede folder, der løber ned ad stokken. Mere som rynker end som blade.", ex:["kantarel","tragt"]},
    {id:"pigge",t:"Pigge",tech:"",d:dia("pigge","under"),p:photo("pigsvamp","under"),
      x:"Små tapper, der hænger ned som istapper. Ingen blade, ingen huller.", ex:["pigsvamp"]},
    {id:"ring",t:"Ring",tech:"Fagord: annulus",d:dia("lameller","ring",{ring:true}),p:photo("parasol","ring")||photo("parasol","stok"),
      x:"Et skørt eller en krave om stokken – rester af en hinde, der dækkede lamellerne på den unge svamp. Den kan falde af.", ex:["parasol","rod","slimror"]},
    {id:"basis",t:"Basis og volva",tech:"Volva: en pose om stokkens fod",d:dia("lameller","basis",{ring:true,volva:"pose"}),p:photo("gron","basis")||photo("snehvid","basis"),
      x:"Nederst på stokken kan der sidde en pose eller en knold. Hos de giftigste fluesvampe sidder posen ofte skjult i jorden. Grav derfor altid hele svampen fri.", ex:["gron","snehvid","kliddet"]}
  ];
  return `${pageHead("Før du går i skoven","Lær at se","Næsten al bestemmelse begynder under hatten. Fire slags underside – og to steder på stokken, der skiller spisesvampe fra de farligste fluesvampe. Tegnene går igen overalt i guiden.")}
    <nav class="alphabet" aria-label="Indhold">${L.map(l=>`<a href="#/laer" data-jump="les-${l.id}">${pg(l.id,40,l.t)}<span>${l.t}</span></a>`).join("")}</nav>
    ${L.map(l=>`<section class="lesson" id="les-${l.id}">
      <div class="lesson-h">${pg(l.id,30,l.t)}<h2 class="d-m">${l.t}</h2></div>
      ${l.tech?`<p class="tech">${l.tech}</p>`:""}
      <p class="ed">${l.x}</p>
      <div class="lesson-fig"><div class="dia">${l.d}</div>${phHTML(l.p,l.t,{lb:l.p?photoKey(l.p):null})}</div>
      <p class="ex">Fx ${l.ex.map(id=>`<a href="#/art/${id}">${S[id].da}</a>`).join(", ")}</p>
    </section>`).join("")}
    <section class="lesson"><h2 class="d-m">Husk</h2><p class="ed">Se under hatten. Se på stokken. Grav basis fri. Se, hvilke træer den står ved. Og smag aldrig på en svamp, du ikke kender.</p>
    <div class="btn-row"><a class="btn fill" href="#/quiz">Test dig selv</a><a class="btn" href="#/noegle">Kig nærmere</a></div></section>`;
};

/* =====================================================================
   ARTER — lister og filtre (SKOVEN / KØKKENET)
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
function filterUI(groups){
  const cat=allCats().find(c=>c.id===FOPEN&&groups.some(g=>FILT[g].c.includes(c)));
  const active=allCats().filter(c=>F[c.id]&&groups.some(g=>FILT[g].c.includes(c)));
  return `<div class="flt">
    ${groups.map(g=>`<div class="flt-g"><span class="lbl">${FILT[g].t}</span><div class="flt-c">${FILT[g].c.map(c=>`<button data-fc="${c.id}" class="${F[c.id]?"set":""}${FOPEN===c.id?" open":""}" aria-expanded="${FOPEN===c.id}">${c.t}</button>`).join("")}</div></div>`).join("")}
    ${cat?`<div class="flt-o" role="group" aria-label="${cat.t}">${cat.o.map(([v,l])=>`<button data-fv="${v}" class="${F[cat.id]===v?"on":""}" aria-pressed="${F[cat.id]===v}">${cat.icon?pg(cat.icon(v),20,l):""}${l}</button>`).join("")}</div>`:""}
    ${active.length?`<div class="flt-a"><span>${active.map(c=>(c.o.find(o=>o[0]===F[c.id])||[,""])[1]).join(" · ")}</span><button id="fClear">Nulstil</button></div>`:""}
  </div>`;
}
function bindFilters(root){
  root.querySelectorAll("[data-fc]").forEach(b=>b.onclick=()=>{FOPEN=FOPEN===b.dataset.fc?null:b.dataset.fc;render(true)});
  root.querySelectorAll("[data-fv]").forEach(b=>b.onclick=()=>{F[FOPEN]=F[FOPEN]===b.dataset.fv?undefined:b.dataset.fv;if(!F[FOPEN])delete F[FOPEN];render(true)});
  const c=$("#fClear",root);if(c)c.onclick=()=>{F={};FOPEN=null;render(true)};
}
function applyFilters(list,groups){
  const cats=allCats().filter(c=>F[c.id]&&groups.some(g=>FILT[g].c.includes(c)));
  return list.filter(s=>cats.every(c=>c.test(s,F[c.id])));
}
V.list=(grp)=>{
  const A=area(), RK=ranked(SP,A), REL=Object.fromEntries(RK.map(x=>[x.s.id,x.r]));
  const ord=l=>l.slice().sort((x,y)=>REL[y.id].sc-REL[x.id].sc);
  const grid=l=>`<div class="grid">${l.map(s=>card(s)).join("")}</div>`;
  if(grp==="pas"){
    const four=["snehvid","gron","giftslor","hjelmhat"].map(id=>S[id]);
    return `${pageHead("Pas på","Arter, du bør kende","Fire arter er dødeligt giftige og vokser samme steder som spisesvampe. De to fluesvampe kendes på posen ved basis, gift-slørhatten på de rustbrune lameller, hjelmhatten på de sølvhvide trævler og det døde træ.","danger")}
    <div class="grid">${four.map(s=>card(s)).join("")}</div>
    <section class="sec">${sh("Giftige og ikke-spiselige")}${grid(ord(SP.filter(s=>s.grp==="pas"&&!four.includes(s))))}</section>
    <section class="sec">${sh("Se forskellen")}<div class="cmp-list">${PAIRS.map(cmpLink).join("")}</div></section>
    ${russula()}`;
  }
  const groups=grp==="godt"?["koekken"]:["skov","koekken"];
  const kitchenOn=FILT.koekken.c.some(c=>F[c.id]);
  const filtering=groups.some(g=>FILT[g].c.some(c=>F[c.id]));
  let base=grp==="godt"?SP.filter(s=>s.grp==="godt"):SP;
  if(kitchenOn) base=base.filter(s=>tagsOf(s));
  const res=ord(applyFilters(base,groups));
  const head=grp==="godt"?pageHead("Spisesvampe","Spisesvampe","Spiselig betyder spiselig efter sikker artsbestemmelse. Hver art har en forveksling – se den altid.")
    :pageHead("Arter","Arter",`${SP.length} arter – et udvalg, ikke en komplet liste. Ordnet efter, hvad du kan møde i ${esc(A.name)} nu.`);
  const body=filtering
    ?`<p class="count">${res.length?res.length+" "+(res.length===1?"art":"arter"):"Ingen arter passer"}${kitchenOn?" · kun arter, der regnes for spiselige":""}</p>${grid(res)}`
    :grp==="godt"?grid(res)
    :`<section class="sec">${sh("Spisesvampe",`<a class="sh-link" href="#/arter/godt">Alle ${arrow}</a>`)}${grid(ord(SP.filter(s=>s.grp==="godt")))}</section>
      <section class="sec">${sh("Pas på",`<a class="sh-link" href="#/arter/pas">Alle ${arrow}</a>`)}${grid(ord(SP.filter(s=>s.grp==="pas")))}</section>`;
  return `${head}${filterUI(groups)}${body}`;
};
function cmpLink(p){const a=S[p.a],b=S[p.b];return `<a href="#/forskel/${p.id}"><span class="pair-ph">${phHTML(photo(a.id,"typisk")||photo(a.id),"",{ann:false,thumb:true})}${phHTML(photo(b.id,"typisk")||photo(b.id),"",{ann:false,thumb:true})}</span><span class="t"><b class="nm">${a.da} <i>og</i> ${b.da}</b><span>${p.q}</span></span>${arrow}</a>`}

/* =====================================================================
   ARTSSIDEN — én redaktionel profil
   navn · status · foto · karakter · signatur · kendetegn · voksested ·
   smag og tekstur · forvekslinger · køkkenet
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
  return `<ul class="sig" aria-label="Kendetegn i korte træk">${items.slice(0,4).map(([i,l])=>`<li>${pg(i,28,l)}<span>${l}</span></li>`).join("")}</ul>`;
}
function kendetegn(s){
  const groups={}, used=new Set();
  for(const [k,v,n] of s.look){const key=LOOKMAP[k]||"hat";(groups[key]=groups[key]||[]).push([k,v,n])}
  if(!groups.basis&&(s.amanita||photo(s.id,"basis"))&&s.sides&&s.sides.basis) groups.basis=[["Basis",s.sides.basis]];
  const all=photos(s.id);
  let html="";
  for(const [key,title0,views] of PARTS){
    const e=groups[key]; if(!e) continue;
    const title=key==="hat"&&s.under==="andet"?"Form":title0;
    const icon=key==="hat"?(s.under==="andet"?"form":"hat"):key==="under"?underIcon(s):key==="basis"?(s.k.basis&&s.k.basis.includes("knold")&&!s.k.basis.includes("pose")?"knold":"basis"):key==="vaekst"?"bund":["stok","kod"].includes(key)?key:null;
    const ph=all.filter((p,i)=>i>0&&views.includes(p.v)&&!used.has(p)); ph.forEach(p=>used.add(p));
    html+=`<div class="kt">
      <h3 class="kt-h">${icon?pg(icon,24,title):""}<span>${title}</span></h3>
      <div class="kt-t">${e.map(([k,v,n])=>`<p>${k!==title0&&k!==title?`<b>${k}.</b> `:""}${v}${n?` <span class="nb">${n}</span>`:""}</p>`).join("")}</div>
      ${ph.map(p=>`<figure class="kt-ph">${phHTML(p,"",{lb:photoKey(p)})}<figcaption>${esc(p.c||"")}</figcaption></figure>`).join("")}
    </div>`;
  }
  if(s.under!=="andet") html+=`<details class="anat"><summary>Se anatomien</summary><div class="dia">${diaFor(s,null)}</div><p class="small">Skematisk tegning: underside${s.k.ring&&s.k.ring[0]==="ja"?", ring":""}${s.k.basis&&(s.k.basis.includes("pose")||s.k.basis.includes("knold"))?" og basis":""} hos ${lcName(s)}.</p></details>`;
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
  const note=SPIS(s)?`<p class="st-note">Kun efter sikker artsbestemmelse.</p>`:"";
  const danger=s.danger?`<p class="${isDanger(s)?"danger":"caution"}">${s.danger}</p>`:"";
  const vv=(s.vv||[]).filter(v=>v!=="ved"), bund=(s.bund||[]).map(b=>BUND[b]);
  if((s.vv||[]).includes("ved")) bund.unshift("Dødt ved");
  const mo=MONN[new Date().getMonth()];
  const ctx=!rel.inS?`Ikke i sæson i ${mo}.`:rel.n>0?`Kan mødes i ${esc(A.name)} nu.`:`I sæson nu.`;
  return `
  <header class="sp-head">
    <h1 class="d">${s.da}</h1>
    <p class="la">${s.la}${s.alt?`<span class="alt">${s.alt}</span>`:""}</p>
    ${statusHTML(s)}${note}${danger}
  </header>
  ${gallery(id,hero)}
  <p class="lede">${s.lede}</p>
  ${signature(s)}
  ${s.spot?`<p class="kdp"><span class="lbl">Kend den på</span>${s.spot}</p>`:""}

  <section class="sec">${sh("Kendetegn")}${KT.html}</section>

  <section class="sec">${sh("Voksested")}
    ${vv.length?`<p class="hab-r">${pg("trae",24)}<span>${vv.map(v=>VVN[v]).join(" · ")}</span></p>`:""}
    ${bund.length?`<p class="hab-r">${pg("bund",24)}<span>${[...new Set(bund)].join(" · ")}</span></p>`:""}
    <p class="hab">${s.hab}</p>
    ${s.rare?`<p class="small">${s.rare}</p>`:""}
    <div class="season"><span class="lbl">Sæson</span>${monthsHTML(s.m)}</div>
    <p class="ctx${rel.inS?" on":""}">${ctx}</p>
  </section>

  ${tags&&g?`<section class="sec">${sh("Smag og tekstur")}
    <dl class="taste">
      ${tags.s.length?`<dt class="lbl">Smag</dt><dd><b>${tags.s.map(x=>GVOC.s[x]).join(" · ")}</b><span class="ed">${g.smag}</span></dd>`:`<dt class="lbl">Smag</dt><dd><span class="ed">${g.smag}</span></dd>`}
      <dt class="lbl">Tekstur</dt><dd><b>${tags.t.map(x=>GVOC.t[x]).join(" · ")}</b><span class="ed">${g.tekstur}</span></dd>
      <dt class="lbl">Bedst til</dt><dd><b>${tags.k.map(x=>GVOC.k[x]).join(" · ")}</b></dd>
    </dl></section>`:""}
  ${s.noGastro&&SPIS(s)?`<section class="sec">${sh("Smag og tekstur")}<p class="caution">Ingen køkkenbeskrivelse: arten har en dødelig dobbeltgænger og er kun for meget erfarne samlere.</p></section>`:""}

  ${(pairs.length||likeOnly.length||s.extra)?`<section class="sec">${sh("Forvekslinger")}
    <div class="lk">${pairs.map(p=>{const o=S[p.a===id?p.b:p.a];return `<a href="#/forskel/${p.id}">${phHTML(photo(o.id,"typisk")||photo(o.id),"",{ann:false,thumb:true})}<span class="t"><b class="nm">${o.da}</b>${stTxt(o)}<span class="q">${p.q}</span></span>${arrow}</a>`}).join("")}
    ${likeOnly.map(x=>`<a href="#/art/${x}">${phHTML(photo(x,"typisk")||photo(x),"",{ann:false,thumb:true})}<span class="t"><b class="nm">${S[x].da}</b>${stTxt(S[x])}</span>${arrow}</a>`).join("")}</div>
    ${s.extra?`<p class="caution">${s.extra}</p>`:""}</section>`:""}

  ${tags&&g?`<a class="to-kitchen" href="#/art/${id}/koekken"><span class="lbl">Gastronomi</span><span class="row"><b class="d-m">Gå i køkkenet</b>${arrow}</span><span class="s">Hvorfor den opfører sig, som den gør – og tre måder at lave den på.</span></a>`:""}
  <a class="quiet" href="#/registrer/art/${id}">${pg("kamera",20)}<span>Registrér et fund</span></a>`;
};

/* =====================================================================
   SE FORSKELLEN
   ===================================================================== */
const ROWICON={Underside:"under",Porer:"under",Lameller:"under",Stok:"stok",Ring:"ring",Stokbasis:"basis",Basis:"basis",Kød:"kod",Snit:"kod",Smag:"kod",Duft:"kod",Konsistens:"kod",Mælk:"kod",Hat:"hat",Form:"hat",Farve:"hat",Voksested:"bund"};
V.pairs=()=>`${pageHead("Forvekslinger","Se forskellen","To arter side om side. Én detalje ad gangen.")}<div class="cmp-list">${PAIRS.map(cmpLink).join("")}</div>`;
V.pair=(pid)=>{
  const p=PAIRS.find(x=>x.id===pid); if(!p) return V.pairs();
  const a=S[p.a], b=S[p.b];
  const lead=(sp,lbl)=>lbl==="Underside"||lbl==="Lameller"||lbl==="Porer"?pg(underIcon(sp),20,underLabel(sp)):"";
  return `<div class="cmp-head"><a href="#/art/${a.id}"><b class="nm">${a.da}</b>${stTxt(a)}</a><a href="#/art/${b.id}"><b class="nm">${b.da}</b>${stTxt(b)}</a></div>
  <p class="cmp-key"><span class="lbl">Se efter</span>${p.key}</p>
  ${(()=>{const used=new Set();return p.rows.map(([lbl,view,ta,tb])=>{
    const pa=photo(a.id,view), pb=photo(b.id,view);
    const show=pa&&pb&&!used.has(pa)&&!used.has(pb); if(show){used.add(pa);used.add(pb)}
    const ic=ROWICON[lbl];
    return `<section class="cmp-row"><h3 class="kt-h">${ic?pg(ic,24,lbl):""}<span>${lbl}</span></h3>
      ${show?`<div class="pair">${phHTML(pa,a.da,{lb:photoKey(pa)})}${phHTML(pb,b.da,{lb:photoKey(pb)})}</div>`:""}
      <div class="txt"><p>${lead(a,lbl)}${ta}</p><p>${lead(b,lbl)}${tb}</p></div></section>`}).join("")})()}
  <nav class="minor"><a href="#/art/${a.id}">${a.da}${arrow}</a><a href="#/art/${b.id}">${b.da}${arrow}</a></nav>`;
};

/* =====================================================================
   KIG NÆRMERE — nøglen (morfologi først)
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
const SWATCH={hvid:"#F2F2F2",gulgron:"#B9B77A",gulorange:"#E0A12E",rod:"#C23B22",brun:"#7A5234",grasort:"#3C3A36",lyserod:"#E6B8B0",gul:"#D9C04A"};
V.key=()=>{
  const qs=keyQs();
  if(K.step>=qs.length&&K.a.under) return keyResult();
  const qid=qs[K.step], q=Q[qid];
  const total=K.a.under?qs.length:6;
  const icon=v=>qid==="under"?(v==="andet"?"form":v):qid==="ring"?(v==="ja"?"ring":"stok"):qid==="basis"?({pose:"basis",knold:"knold",ingen:"stok"})[v]:qid==="form"?"form":null;
  const withIcon=["under","ring","basis"].includes(qid), sw=qid==="farve"||qid==="pore";
  const opts=q.o.map(([v,l,h])=>`<button class="opt" data-v="${v}">${withIcon?pg(icon(v),52,l):sw?`<i class="sw" style="background:${SWATCH[v]}"></i>`:""}<span class="tx"><b>${l}</b>${h?`<small>${h}</small>`:""}</span></button>`).join("");
  return `<div class="key-top"><span class="lbl">Kig nærmere · ${K.step+1} / ${total}</span>${K.step?`<button class="txt-link" id="kRestart">Start forfra</button>`:""}</div>
  <div class="key-prog" aria-hidden="true">${Array.from({length:total},(_,i)=>`<i class="${i<=K.step?"on":""}"></i>`).join("")}</div>
  <div class="key-q">${QICON[qid]?pg(QICON[qid],32):""}<h1 class="d">${q.t}</h1><p class="intro">${q.h}</p></div>
  <div class="opts ${withIcon||sw?"grid2":""}">${opts}<button class="opt dk" data-v="vedikke"><span class="tx"><b>Ved ikke</b></span></button></div>
  ${K.step?`<div class="btn-row"><button class="btn" id="kBack">Tilbage</button></div>`:`<p class="aside">Usikker? <a href="#/laer">Lær de fire slags underside</a>.</p>`}`;
};
function keyResult(){
  const u=K.a.under;
  const given=Object.entries(K.a).filter(([k,v])=>v&&v!=="vedikke").map(([k,v])=>{const o=Q[k].o.find(x=>x[0]===v);return `${QLBL[k]}: ${(o?o[1]:v).toLowerCase()}`}).join(" · ");
  let r=scoreSp();
  const best=r.length?r[0].sc:0;
  let top=r.filter(x=>x.sc>=best-3&&x.sc>0).slice(0,3);
  const danger=amanitaSignal()||top.some(x=>x.s.st==="meget");
  let html=`${pageHead("Kig nærmere","Det kan være","Et forslag blandt guidens "+SP.length+" arter – ikke en sikker bestemmelse.")}<p class="given">${esc(given)}</p>`;
  if(K.a.form==="kugle") html+=`<p class="caution"><b>Skær den igennem.</b> Ser du omridset af en hat og lameller, er det en fluesvamp i ‘æg’-stadiet. Er den sortviolet indeni, er det en giftig bruskbold.</p>`;
  if(K.a.form==="morkel"||K.a.form==="hjerne") html+=`<p class="caution"><b>Skær på langs.</b> Spiselig morkel har ét gennemgående hulrum. Ægte stenmorkel har hjernefolder og kamre – og er meget giftig.</p>`;
  if(danger) html+=`<p class="danger"><b>Dødeligt giftige arter er mulige.</b> Dine svar udelukker dem ikke. <button class="txt-link" id="kStop">Se, hvad du skal undersøge ${arrow}</button></p>`;
  if(!top.length){
    html+=`<p class="ed pad">Ingen af guidens arter passer godt. Det er helt normalt – der findes tusindvis af svampearter i Danmark, og guiden rummer kun ${SP.length}.</p>`;
  } else {
    html+=`<div class="res">${top.map(x=>`<a href="#/art/${x.s.id}">${phHTML(photo(x.s.id,"typisk")||photo(x.s.id),"",{ann:false,thumb:true})}<span class="t"><b class="nm">${x.s.da}</b><span class="la">${x.s.la}</span>${stTxt(x.s)}</span>${arrow}</a>`).join("")}</div>`;
    if(top.length>1){
      const qs=["under"].concat(FLOW[u]||[]).concat(["skift"]).filter((v,i,a)=>a.indexOf(v)===i);
      const rows=qs.filter(q=>{const vs=top.map(x=>(x.s.k[q]||(q==="under"?[x.s.under]:[])).join());return vs.every(Boolean)&&new Set(vs).size>1});
      if(rows.length) html+=`<section class="sec">${sh("Det skiller dem ad")}<dl class="sep">${rows.map(q=>`<dt class="kt-h">${QICON[q]?pg(QICON[q],20):""}<span>${QLBL[q]}</span></dt><dd>${top.map(x=>{const vals=q==="under"?[x.s.under]:x.s.k[q];return `<p><b>${x.s.da}</b> ${vals.map(v=>{const o=Q[q].o.find(z=>z[0]===v);return o?o[1].toLowerCase():v}).join(" eller ")}</p>`}).join("")}</dd>`).join("")}</dl></section>`;
      const pr=PAIRS.find(p=>top.slice(0,2).every(x=>x.s.id===p.a||x.s.id===p.b));
      if(pr) html+=`<div class="btn-row"><a class="btn fill" href="#/forskel/${pr.id}">Se forskellen side om side</a></div>`;
    }
  }
  html+=`<div class="btn-row"><button class="btn" id="kBack">Ret svar</button><button class="btn" id="kRestart">Start forfra</button></div>
  <a class="quiet" href="#/registrer">${pg("kamera",20)}<span>Registrér et fund</span></a>`;
  return html;
}
function showStop(){
  if($("#stop")) return;
  const el=document.createElement("div"); el.id="stop"; el.setAttribute("role","dialog"); el.setAttribute("aria-label","Stop");
  el.innerHTML=`<div class="in">
    <div class="stop-sign"><h1>STOP</h1><p>Gruppen rummer dødeligt giftige arter. Spis ikke en svamp på grundlag af denne guide.</p></div>
    <div class="stop-body">
      <p class="ed">Lameller sammen med ring, pose eller knold ved basis er kendetegn for fluesvampe (<i>Amanita</i>). Grøn fluesvamp og Snehvid fluesvamp vokser i Danmark.</p>
      <h2 class="sh">Undersøg – uden at smage</h2>
      <ol>
        <li>${pg("basis",28)}<span><b>Hele basis.</b> Grav svampen fri med en kniv. En løs pose? En knold med kant eller vortebælter? Posen sidder ofte under jorden.</span></li>
        <li>${pg("ring",28)}<span><b>Ring.</b> Et hængende skørt under hatten – eller mærket efter et, der er faldet af.</span></li>
        <li>${pg("lameller",28)}<span><b>Lameller.</b> Hvide? Frie af stokken?</span></li>
        <li>${pg("hat",28)}<span><b>Hat.</b> Vorter, flager eller hudrester? Regnen kan have vasket dem af.</span></li>
      </ol>
      <div class="pair">${phHTML(photo("gron","basis"),"Grøn fluesvamp – basis")}${phHTML(photo("kliddet","basis")||photo("panter","basis"),"Knold")}</div>
      <div class="txt"><p>Grøn fluesvamp: løs pose</p><p>Kliddet fluesvamp: knold med kant</p></div>
      <p class="small">Hold svampen adskilt fra spisesvampe i kurven, og vis den til jeres guide. Mistanke om forgiftning: Giftlinjen <a href="tel:82121212">82 12 12 12</a>. Akut fare: 112.</p>
      <div class="btn-col"><a class="btn" href="#/forskel/gron-kliddet" id="stopCmp">Se forskellen: pose og knold</a><button class="btn fill" id="stopOk">Forstået</button></div>
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
    const msg=QZ.score>=9?"Du ser detaljerne. Brug dem i skoven – og vis stadig alt til en kyndig.":QZ.score>=6?"Godt set. Tag en runde mere, og kig på dem, du missede.":"Det er svært i begyndelsen. Se Lær at se, og prøv igen.";
    return `${pageHead("Quiz",`${QZ.score} / ${n}`,msg)}<p class="small pad">Bedste resultat ${best} / ${n} · ${LS.get("quizRounds",0)} runder</p>
    <div class="btn-row"><button class="btn fill" id="qzAgain">Ny runde</button><a class="btn" href="#/laer">Lær at se</a></div>`;
  }
  const q=QZ.qs[QZ.i];
  let media="";
  if(q.two) media=`<div class="pair">${q.two.map(id=>phHTML(photo(id,"typisk")||photo(id),S[id].da,{ann:false})).join("")}</div><div class="txt"><p class="nm">${S[q.two[0]].da}</p><p class="nm">${S[q.two[1]].da}</p></div>`;
  else if(q.p) media=`<div class="qz-img">${phHTML(q.p,"",{ann:false})}</div>`;
  const ans=QZ.ans;
  return `<div class="key-top"><span class="lbl">Quiz · ${QZ.i+1} / ${n}</span><span class="lbl">${QZ.score} rigtige</span></div>
  <h1 class="qz-q">${q.q}</h1>${media}
  <div class="qz-opts">${q.o.map((o,i)=>`<button class="qz-opt ${ans!=null?(i===q.c?"ok":i===ans?"no":""):""}" data-i="${i}" ${ans!=null?"disabled":""}>${q.icons?pg(q.icons[i],28,o):""}<span>${o}</span></button>`).join("")}</div>
  ${ans!=null?`<p class="qz-exp ${ans===q.c?"":"bad"}"><span class="lbl">${ans===q.c?"Rigtigt":"Ikke helt"}</span>${q.e}</p><div class="btn-row"><button class="btn fill" id="qzNext">${QZ.i+1<n?"Næste":"Se resultat"}</button></div>`:""}`;
};
function bindQuiz(root){
  root.querySelectorAll(".qz-opt").forEach(b=>b.onclick=()=>{if(QZ.ans!=null)return;QZ.ans=+b.dataset.i;if(QZ.ans===QZ.qs[QZ.i].c)QZ.score++;render(true);setTimeout(()=>{const e=$(".qz-exp");e&&e.scrollIntoView({behavior:"smooth",block:"center"})},50)});
  const nx=$("#qzNext",root); if(nx) nx.onclick=()=>{QZ.i++;QZ.ans=null;render();window.scrollTo(0,0)};
  const ag=$("#qzAgain",root); if(ag) ag.onclick=()=>{QZ=null;render()};
}


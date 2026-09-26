/* SVAMPEGUIDEN – service worker. Shell: netværk først (så opdateringer når frem),
   billeder: cache først (hentes første gang, de vises), kort-fliser: netværk med
   lille cache. Intet brugerindhold passerer herigennem – fund ligger i IndexedDB. */
const VER="33b5b88d43";
const SHELL=["./","./index.html","./manifest.webmanifest","./icons/icon-180.png","./icons/icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open("shell-"+VER).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("shell-")&&k!=="shell-"+VER).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
async function trim(name,max){const c=await caches.open(name);const ks=await c.keys();for(let i=0;i<ks.length-max;i++)await c.delete(ks[i])}
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET")return;
  const u=new URL(r.url);
  if(u.origin===location.origin&&u.pathname.includes("/img/")){
    e.respondWith(caches.open("img-v1").then(async c=>{const hit=await c.match(r);if(hit)return hit;const res=await fetch(r);if(res.ok)c.put(r,res.clone());return res}));return}
  if(u.origin===location.origin){
    e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open("shell-"+VER).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match("./index.html"))));return}
  if(u.hostname==="cdnjs.cloudflare.com"){
    e.respondWith(caches.open("lib-v1").then(async c=>{const hit=await c.match(r);if(hit)return hit;const res=await fetch(r);if(res.ok)c.put(r,res.clone());return res}));return}
  if(u.hostname==="tile.openstreetmap.org"){
    e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open("tiles-v1").then(c=>c.put(r,cp).then(()=>trim("tiles-v1",400)))}return res}).catch(()=>caches.match(r).then(m=>m||Response.error())));return}
});
self.addEventListener("message",e=>{
  const d=e.data||{}; if(d.type!=="precache")return; const port=e.ports[0];
  e.waitUntil((async()=>{const c=await caches.open("img-v1");let ok=0,n=0;
    for(const u of d.urls){n++;try{if(!(await c.match(u))){const res=await fetch(u);if(res.ok){await c.put(u,res);ok++}}else ok++}catch(err){}
      if(port&&n%10===0)port.postMessage({n})}
    if(port)port.postMessage({done:true,ok})})());
});

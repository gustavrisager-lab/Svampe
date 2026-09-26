
"use strict";
/* =====================================================================
   DATA — species
   under: lameller | ror | ribber | pigge
   k: attributes used by the identification key (arrays = all accepted)
   ===================================================================== */
const MONTHS = ["J","F","M","A","M","J","J","A","S","O","N","D"];
const STATUS = {
  god:   {t:"God spisesvamp", c:"s-god"},
  spis:  {t:"Spiselig", c:"s-spis"},
  ikke:  {t:"Ikke spiselig", c:"s-ikke"},
  fra:   {t:"Frarådes", c:"s-fra"},
  gift:  {t:"Giftig", c:"s-gift"},
  meget: {t:"Meget giftig", c:"s-meget"}
};
const SP = [
{ id:"kantarel", da:"Kantarel", la:"Cantharellus cibarius", alt:"Almindelig kantarel",
  grp:"godt", st:"god", under:"ribber",
  lede:"Æggeblommegul, kødfuld og fast. Det afgørende sidder under hatten: butte, grenede ribber – ikke tynde lameller.",
  look:[
    ["Hat","Æggeblommegul, 2–10 cm. Først hvælvet, så tragtformet med bølget, indrullet kant.", "Farven kan være blegere i tørvejr."],
    ["Underside","Butte, lave, gaffeldelte ribber, der løber langt ned ad stokken.", "Ribberne er tykke og afrundede – ikke skarpe som blade."],
    ["Stok","Massiv og fast, samme farve som hatten, smalner nedad.", ""],
    ["Kød","Hvidligt til lysegult, fast. Kan flås i trævler.", ""],
    ["Duft","Ofte svagt frugtagtig, som abrikos.", "Ikke altid tydelig – brug den som ekstra tegn, ikke som bevis."]
  ],
  field:[["Underside","Butte ribber – ikke lameller"],["Stok","Massiv, fast"],["Farve","Ens æggegul overalt"]],
  sides:{hat:"Æggegul, bølget kant. Ingen skæl eller pletter.", under:"Butte, grenede ribber der fortsætter ned ad stokken.", stok:"Massiv, glat, samme gule farve.", basis:"Ingen knold, pose eller ring.", kod:"Hvidligt, fast og trævlet – som kogt kyllingebryst."},
  hab:"Løv- og nåleskov på sur, mosrig bund. Under bøg, eg, birk, fyr og gran.", trees:["Bøg","Eg","Birk","Fyr","Gran"],
  m:[6,7,8,9,10], like:["falsk"],
  k:{ring:["nej"],basis:["ingen"],farve:["gulorange"],pletter:["nej"],skift:["ingen"],hab:["lov","nal"],ribtype:["butte"],hul:["nej"]}
},
{ id:"tragt", da:"Tragtkantarel", la:"Craterellus tubaeformis", alt:"Syn. Cantharellus tubaeformis",
  grp:"godt", st:"god", under:"ribber",
  lede:"Lille, brun tragt på en gul, hul stok. Vokser ofte i hundredvis i fugtig mos under nåletræer – og kommer sent på sæsonen.",
  look:[
    ["Hat","Gråbrun til mørkebrun, 1–5 cm, tragtformet med et hul ned i stokken. Bølget kant.",""],
    ["Underside","Grålige til gullige, grenede ribber, der løber ned ad stokken.","Ribberne er lave og butte – ikke tætte, rustbrune lameller."],
    ["Stok","Gul til orangegul, hul, ofte sammentrykt med en fure.","Den hule stok er et af de vigtigste tegn."],
    ["Kød","Tyndt og sejt.",""]
  ],
  field:[["Stok","Gul og hul"],["Underside","Grå, grenede ribber"],["Hat","Brun tragt med hul i midten"]],
  sides:{hat:"Brun tragt – midten åbner sig ned i stokken.", under:"Lave, grenede, grå-gule ribber.", stok:"Gul, hul, ofte flad med en fure.", basis:"Ingen knold eller ring. Står ofte i grupper.", kod:"Tyndt, sejt. Stokken er hul hele vejen."},
  hab:"Fugtig, mosrig nåleskov på sur bund, især under gran og fyr. Ofte i store mængder.", trees:["Gran","Fyr"],
  m:[8,9,10,11,12], like:["giftslor"],
  k:{ring:["nej"],basis:["ingen"],farve:["brun","grasort"],pletter:["nej"],skift:["ingen"],hab:["nal"],ribtype:["butte"],hul:["ja"]}
},
{ id:"trompet", da:"Trompetsvamp", la:"Craterellus cornucopioides", alt:"Stor trompetsvamp · sort trompetsvamp",
  grp:"godt", st:"god", under:"ribber", underNote:"Næsten glat",
  lede:"En sort-grå trompet, hul hele vejen ned. Næsten usynlig i bøgeløv – når du har set én, ser du dem alle.",
  look:[
    ["Form","Trompet- eller tragtformet, hul fra kanten helt ned til basis. 3–10 cm høj.",""],
    ["Farve","Indersiden sortbrun til sort, fugtig. Ydersiden askegrå.",""],
    ["Underside","Næsten glat eller kun svagt rynket – ingen egentlige ribber eller lameller.",""],
    ["Kød","Tyndt, sejt, gråsort.",""]
  ],
  field:[["Form","Sort, hul trompet"],["Underside","Grå og næsten glat"],["Voksested","I løv under bøg"]],
  sides:{hat:"Sort trompet, hul helt ned. Kanten krøllet.", under:"Ydersiden er askegrå og næsten glat.", stok:"Går gradvist over i trompeten – ingen tydelig stok.", basis:"Smal, hul basis. Vokser i grupper.", kod:"Tyndt og sejt, gråsort."},
  hab:"Løvskov på næringsrig bund, især under bøg og eg, gerne i fugtigt løv. Sjælden i ren nåleskov.", trees:["Bøg","Eg"],
  m:[8,9,10,11], like:[],
  k:{ring:["nej"],basis:["ingen"],farve:["grasort"],pletter:["nej"],skift:["ingen"],hab:["lov"],ribtype:["butte","glat"],hul:["ja"]}
},
{ id:"pigsvamp", da:"Almindelig pigsvamp", la:"Hydnum repandum", alt:"",
  grp:"godt", st:"god", under:"pigge",
  lede:"Lys creme til orange, uregelmæssig hat – og under den: sprøde pigge i stedet for lameller.",
  look:[
    ["Hat","Creme, lys okker til orangegul, 3–15 cm. Uregelmæssig, ofte bølget.",""],
    ["Underside","Tætte, sprøde pigge, der let brækker af og løber lidt ned ad stokken.",""],
    ["Stok","Hvidlig, kort og kraftig, ofte skævt placeret.",""],
    ["Kød","Hvidt og sprødt, bliver gulligt-brunt ved tryk.","Ældre eksemplarer kan smage bittert."]
  ],
  field:[["Underside","Pigge – ikke lameller"],["Farve","Creme til lys orange"],["Kød","Hvidt, sprødt"]],
  sides:{hat:"Lys creme-orange, uregelmæssig og ofte flosset.", under:"Pigge som et lille tæppe af istapper.", stok:"Hvidlig, kraftig, ofte excentrisk.", basis:"Ingen knold eller ring. Ofte i buer eller ringe.", kod:"Hvidt og sprødt; gulner ved tryk."},
  hab:"Løv- og nåleskov, ofte i buer eller cirkler.", trees:["Bøg","Eg","Gran","Fyr"],
  m:[8,9,10,11], like:[],
  extra:"Der findes flere nært beslægtede pigsvampe i Danmark (fx Rødbrun pigsvamp). Seje, læderagtige eller mørke pigsvampe tilhører andre slægter og skal ikke i kurven.",
  k:{ring:["nej"],basis:["ingen"],farve:["gulorange","hvid"],pletter:["nej"],skift:["brun"],hab:["lov","nal"]}
},
{ id:"karljohan", da:"Karl Johan", la:"Boletus edulis", alt:"Spiselig rørhat",
  grp:"godt", st:"god", under:"ror",
  lede:"Brun hat som en bolle, tyk stok og rør i stedet for lameller. Se efter det fine, lyse net øverst på stokken.",
  look:[
    ["Hat","Brun i mange nuancer, 5–25 cm, glat, ofte lidt fedtet. Ofte med en lysere rand.",""],
    ["Underside","Rør (porer): hvide hos unge, siden gule og til sidst olivengrønne.","Porerne blåner ikke."],
    ["Stok","Tyk, tøndeformet eller køllet, lys, med et fint hvidt netmønster – tydeligst øverst.",""],
    ["Kød","Hvidt, fast, ændrer ikke farve ved snit.",""]
  ],
  field:[["Stok","Fint, LYST net"],["Porer","Hvide → gule → oliven"],["Kød","Hvidt, blåner ikke"]],
  sides:{hat:"Brun, glat, ofte med lysere rand. Som en bolle.", under:"Rør med små porer – hvide hos unge, gule til oliven hos ældre.", stok:"Tyk og lys med fint hvidt net øverst.", basis:"Tyk, køllet basis. Ingen ring eller pose.", kod:"Hvidt, ingen farveændring ved snit."},
  hab:"Både løv- og nåleskov: bøg, eg, birk, gran og fyr.", trees:["Bøg","Eg","Birk","Gran","Fyr"],
  m:[7,8,9,10], like:["galde","brunstokket"],
  k:{ring:["nej"],basis:["ingen"],farve:["brun"],slim:["nej"],pore:["hvid","gul"],net:["lyst"],skift:["ingen"],hab:["lov","nal"]}
},
{ id:"brunstokket", da:"Brunstokket rørhat", la:"Imleria badia", alt:"Syn. Boletus badius · Xerocomus badius",
  grp:"godt", st:"spis", under:"ror",
  lede:"Kastanjebrun hat og gullige porer, der blåner, når du trykker på dem. Almindelig under fyr og gran.",
  look:[
    ["Hat","Kastanje- til chokoladebrun, 4–15 cm, fløjlsagtig; klæbrig i vådt vejr.",""],
    ["Underside","Creme til gulgrønne porer, der blåner ved tryk.",""],
    ["Stok","Slankere end Karl Johan, brunlig med mørkere længdestriber – uden net.",""],
    ["Kød","Hvidligt til gulligt, blåner svagt i snit.",""]
  ],
  field:[["Porer","Gule – blåner ved tryk"],["Stok","Stribet, uden net"],["Hat","Kastanjebrun"]],
  sides:{hat:"Kastanjebrun, klæbrig når den er våd.", under:"Gullige porer der blåner, når du trykker.", stok:"Brunlig, stribet – intet net.", basis:"Ingen ring eller pose.", kod:"Blegt; blåner svagt i snittet."},
  hab:"Især nåleskov på sur bund – fyr og gran. Også blandskov.", trees:["Fyr","Gran","Bøg"],
  m:[8,9,10,11], like:["karljohan"],
  k:{ring:["nej"],basis:["ingen"],farve:["brun"],slim:["nej","ja"],pore:["gul"],net:["intet"],skift:["bla"],hab:["nal","lov"]}
},
{ id:"slimror", da:"Brungul slimrørhat", la:"Suillus luteus", alt:"",
  grp:"godt", st:"spis", under:"ror",
  lede:"Glinsende, slimet brun hat, gule porer og en tydelig ring på stokken. Vokser kun under fyr.",
  look:[
    ["Hat","Chokolade- til gulbrun, 4–12 cm, meget slimet og blank i fugtigt vejr.",""],
    ["Underside","Små, gule porer.",""],
    ["Stok","Gullig med en tydelig hvid-violet, hudagtig ring. Over ringen små brune prikker.",""],
    ["Hud","Slimlaget kan trækkes af.","Nogle mennesker får maveproblemer; mange fjerner hathuden før tilberedning."]
  ],
  field:[["Hat","Slimet, blank, brun"],["Stok","Tydelig ring"],["Træ","Kun under fyr"]],
  sides:{hat:"Brun og slimet – glinser som lak.", under:"Små gule porer.", stok:"Tydelig ring; prikker over ringen.", basis:"Ingen pose eller knold.", kod:"Blegt gult, ingen tydelig blåning."},
  hab:"Kun under fyr, gerne på sandet bund, i plantager og ved stier.", trees:["Fyr"],
  m:[8,9,10,11], like:[],
  k:{ring:["ja"],basis:["ingen"],farve:["brun"],slim:["ja"],pore:["gul"],net:["intet"],skift:["ingen"],hab:["nal"]}
},
{ id:"parasol", da:"Stor kæmpeparasolhat", la:"Macrolepiota procera", alt:"Stor parasolhat",
  grp:"godt", st:"god", under:"lameller",
  lede:"En kæmpe: hat op til 30 cm, høj stok med slangeskindsmønster og en løs ring, der kan skubbes op og ned.",
  look:[
    ["Hat","10–30 cm. Ung som en trommestik, siden flad med mørk pukkel og brune skæl på lys bund.",""],
    ["Underside","Hvide, tætte lameller, der ikke er vokset fast til stokken.",""],
    ["Stok","Høj og slank med brunt slangeskindsmønster. Dobbelt ring, der kan skubbes op og ned.","Slangeskindsmønstret er det bedste tegn."],
    ["Basis","Knoldet opsvulmet – men uden pose eller skede.",""],
    ["Kød","Hvidt, ændrer ikke farve.",""]
  ],
  field:[["Stok","Slangeskindsmønster"],["Ring","Løs – kan skubbes"],["Størrelse","Stor – hat over 10 cm"]],
  sides:{hat:"Brune skæl på lys bund, mørk pukkel i midten.", under:"Hvide, frie lameller.", stok:"Slangeskindsmønster, løs dobbelt ring.", basis:"Knold, men ingen pose. Grav alligevel fri og se efter.", kod:"Hvidt – rødmer ikke."},
  hab:"Lysninger, skovbryn, græsarealer og lysåben skov.", trees:["Lysninger","Skovbryn","Græs"],
  m:[7,8,9,10], like:["panter"],
  extra:"Små parasolhatte (hat under ca. 10 cm) kan være giftige arter af slægten Lepiota. Rabarber-parasolhat (Chlorophyllum) har kød, der rødmer, og ingen slangeskind på stokken. Kun hatten spises, og altid tilberedt.",
  k:{ring:["ja"],basis:["knold"],farve:["brun","hvid"],pletter:["ja"],skift:["ingen"],hab:["aaben","lov","nal"]}
},

/* ---- PAS PÅ ---- */
{ id:"gron", da:"Grøn fluesvamp", la:"Amanita phalloides", alt:"Grønhvid fluesvamp",
  grp:"pas", st:"meget", deadly:true, under:"lameller", amanita:true,
  lede:"Danmarks farligste svamp. Olivengrøn hat, hvide lameller, ring – og en hvid pose om stokkens basis, som ofte sidder skjult i jorden.",
  look:[
    ["Hat","Olivengrøn til gulgrøn, sjældnere næsten hvid, 5–15 cm. Fint radiært trævlet, som regel uden pletter.","Farven varierer meget – stol ikke på grønt."],
    ["Underside","Hvide, tætte, frie lameller.",""],
    ["Stok","Hvid, ofte med svagt grønligt zigzagmønster. Hængende hvid ring, der kan falde af.",""],
    ["Basis","En stor, hvid, løs pose (volva) om stokkens fod.","Posen sidder ofte under jorden. Grav hele svampen fri."]
  ],
  field:[["Basis","HVID POSE – grav fri"],["Lameller","Hvide"],["Ring","Hængende skørt"]],
  sides:{hat:"Olivengrøn, trævlet, som regel glat. Farven varierer.", under:"Hvide, frie lameller.", stok:"Hvid, ring højt oppe, evt. svagt mønster.", basis:"LØS HVID POSE. Det vigtigste tegn – og det der oftest overses.", kod:"Hvidt, ingen farveændring."},
  hab:"Løvskov, især under eg og bøg.", trees:["Eg","Bøg","Hassel"],
  m:[7,8,9,10], like:["kliddet","snehvid"],
  danger:"Dødeligt giftig. Indeholder amatoxiner, som ødelægger leveren. Symptomer kommer først efter 6–24 timer. Giften ødelægges ikke ved kogning, stegning eller tørring.",
  k:{ring:["ja","nej"],basis:["pose"],farve:["gulgron","hvid"],pletter:["nej"],skift:["ingen"],hab:["lov"]}
},
{ id:"snehvid", da:"Snehvid fluesvamp", la:"Amanita virosa", alt:"",
  grp:"pas", st:"meget", deadly:true, under:"lameller", amanita:true,
  lede:"Ren hvid overalt. Lige så dødelig som Grøn fluesvamp. En hvid hatsvamp med hvide lameller skal altid graves fri.",
  look:[
    ["Hat","Ren hvid, 5–10 cm, klokkeformet og ofte lidt skæv.",""],
    ["Underside","Hvide, tætte, frie lameller.",""],
    ["Stok","Hvid og fnugget-skællet, med en skrøbelig ring, der kan forsvinde.",""],
    ["Basis","Hvid, løs pose (volva) om en knold.","Ofte skjult i jorden eller mosset."]
  ],
  field:[["Farve","Hvid OVERALT"],["Basis","Pose – grav fri"],["Stok","Fnugget, skrøbelig ring"]],
  sides:{hat:"Ren hvid, klokkeformet, ofte skæv.", under:"Hvide, frie lameller.", stok:"Fnugget-skællet; ringen er skrøbelig.", basis:"Løs, hvid pose. Grav den fri.", kod:"Hvidt."},
  hab:"Sur, fattig bund i løv- og nåleskov – fx under bøg, birk og gran.", trees:["Bøg","Birk","Gran","Fyr"],
  m:[7,8,9,10], like:["gron","kliddet"],
  danger:"Dødeligt giftig (amatoxiner). Unge, lukkede eksemplarer kan ligne en støvbold – skær den igennem: ser du omridset af en hat og lameller, er det ingen støvbold. Champignoner har lyserøde til brune lameller og ingen pose.",
  k:{ring:["ja","nej"],basis:["pose"],farve:["hvid"],pletter:["nej"],skift:["ingen"],hab:["lov","nal"]}
},
{ id:"kliddet", da:"Kliddet fluesvamp", la:"Amanita citrina", alt:"",
  grp:"pas", st:"ikke", under:"lameller", amanita:true,
  lede:"Meget almindelig. Lær den – den har samme bygning som de dødelige fluesvampe, men basis er en rund knold med skarp kant, og den dufter af rå kartofler.",
  look:[
    ["Hat","Bleg citrongul til hvid, 4–10 cm, med flade, gråhvide til brunlige hudflager.",""],
    ["Underside","Hvide lameller.",""],
    ["Stok","Hvidlig med hængende ring.",""],
    ["Basis","Stor, rund knold med en skarp kant øverst – ikke en løs pose.",""],
    ["Duft","Rå kartofler.","Et af de få tilfælde, hvor duften virkelig hjælper."]
  ],
  field:[["Basis","Rund knold med skarp kant"],["Duft","Rå kartofler"],["Hat","Bleggul med flager"]],
  sides:{hat:"Bleggul til hvid, med flade hudflager.", under:"Hvide lameller.", stok:"Hvidlig, ring.", basis:"Rund knold med skarp kant – se forskellen på Grøn fluesvamps løse pose.", kod:"Hvidt; lugter af rå kartofler."},
  hab:"Løv- og nåleskov på sur bund. Meget almindelig.", trees:["Bøg","Eg","Fyr","Gran"],
  m:[8,9,10,11], like:["gron","snehvid"],
  danger:"Ikke dødelig, men den ligner Grøn fluesvamp og Snehvid fluesvamp. Den hvide form kan ikke sikkert skelnes fra Snehvid fluesvamp af en begynder.",
  k:{ring:["ja"],basis:["knold"],farve:["gulgron","hvid"],pletter:["ja","nej"],skift:["ingen"],hab:["lov","nal"]}
},
{ id:"rod", da:"Rød fluesvamp", la:"Amanita muscaria", alt:"",
  grp:"pas", st:"gift", under:"lameller", amanita:true,
  lede:"Eventyrsvampen. Rød hat med hvide vorter – men regnen kan vaske vorterne af, og gamle hatte blegner til orange.",
  look:[
    ["Hat","Klar rød til orange, 8–20 cm, med hvide vorter.","Vorterne kan være vasket af. Farven blegner med alderen."],
    ["Underside","Hvide, frie lameller.",""],
    ["Stok","Hvid, med hængende ring.",""],
    ["Basis","Knold med ringe eller bælter af hvide vorter.",""]
  ],
  field:[["Hat","Rød med hvide vorter"],["Lameller","Hvide"],["Basis","Knold med vorte-ringe"]],
  sides:{hat:"Rød-orange med hvide vorter, der kan vaskes af.", under:"Hvide lameller.", stok:"Hvid, ring.", basis:"Knold med koncentriske vortebælter.", kod:"Hvidt, gulligt under hathuden."},
  hab:"Især under birk, også fyr og gran. Meget almindelig.", trees:["Birk","Fyr","Gran"],
  m:[8,9,10,11], like:["panter"],
  danger:"Giftig. Påvirker nervesystemet (forvirring, kramper, bevidsthedspåvirkning).",
  k:{ring:["ja"],basis:["knold"],farve:["rod","gulorange"],pletter:["ja","nej"],skift:["ingen"],hab:["lov","nal","aaben"]}
},
{ id:"panter", da:"Panterfluesvamp", la:"Amanita pantherina", alt:"",
  grp:"pas", st:"meget", under:"lameller", amanita:true,
  lede:"Brun hat med rent hvide vorter og riflet kant. Kan forveksles med den rødmende fluesvamp – kødet rødmer ikke hos panteren.",
  look:[
    ["Hat","Brun til gråbrun, 5–12 cm, med rent hvide vorter. Kanten er fint riflet (stribet).",""],
    ["Underside","Hvide lameller.",""],
    ["Stok","Hvid. Ringen er glat – uden riller på oversiden.",""],
    ["Basis","Knold med en skarp, tætsiddende krave – som kanten på en sok – og ofte 1–3 ringbælter over.",""],
    ["Kød","Hvidt, rødmer ikke.",""]
  ],
  field:[["Hat","Brun, HVIDE vorter"],["Ring","Glat"],["Kød","Rødmer IKKE"]],
  sides:{hat:"Brun med rent hvide vorter; riflet kant.", under:"Hvide lameller.", stok:"Hvid; glat ring.", basis:"Knold med skarp krave som en sokkekant.", kod:"Hvidt – rødmer ikke."},
  hab:"Løv- og nåleskov, gerne på sandet bund.", trees:["Bøg","Eg","Fyr"],
  m:[7,8,9,10], like:["rodmende","parasol","rod"],
  danger:"Meget giftig. Samme type gift som Rød fluesvamp, men stærkere.",
  k:{ring:["ja","nej"],basis:["knold"],farve:["brun"],pletter:["ja"],skift:["ingen"],hab:["lov","nal"]}
},
{ id:"rodmende", da:"Rødmende fluesvamp", la:"Amanita rubescens", alt:"",
  grp:"pas", st:"fra", under:"lameller", amanita:true,
  lede:"Rødbrun hat med grålige vorter, og kød der langsomt bliver rødligt. Spises af nogle erfarne samlere efter tilberedning – men den er giftig rå og ligner panterfluesvampen.",
  look:[
    ["Hat","Rødbrun til lyserødbrun, 5–15 cm, med grålige til brunlige vorter. Kanten ikke riflet.",""],
    ["Underside","Hvide lameller, der får rødlige pletter.",""],
    ["Stok","Hvidlig til rødlig. Ringen er riflet (stribet) på oversiden.",""],
    ["Kød","Rødmer langsomt, især i snit og ved insektgange.",""]
  ],
  field:[["Kød","Rødmer langsomt"],["Ring","Riflet ovenpå"],["Hat","Rødbrun, grå vorter"]],
  sides:{hat:"Rødbrun med gråhvide vorter.", under:"Hvide lameller med rødlige pletter.", stok:"Riflet ring; rødlige toner.", basis:"Knold uden skarp krave, ofte rødlig.", kod:"Rødmer langsomt."},
  hab:"Løv- og nåleskov. Meget almindelig.", trees:["Bøg","Eg","Birk","Fyr","Gran"],
  m:[6,7,8,9,10], like:["panter"],
  danger:"Frarådes: giftig i rå tilstand og let at forveksle med Panterfluesvamp.",
  k:{ring:["ja"],basis:["knold","ingen"],farve:["brun","rod"],pletter:["ja"],skift:["rod"],hab:["lov","nal"]}
},
{ id:"giftslor", da:"Puklet gift-slørhat", la:"Cortinarius rubellus", alt:"Syn. C. speciosissimus",
  grp:"pas", st:"meget", deadly:true, under:"lameller",
  lede:"Orangebrun hat med spids pukkel, rustbrune lameller og gule bånd på stokken. Vokser i samme mos som tragtkantarellen.",
  look:[
    ["Hat","Orange- til rødbrun, 3–8 cm, kegleformet med spids pukkel, fint filtet.",""],
    ["Underside","Rigtige lameller: tykke, fjerntstillede, rustbrune.","Tragtkantarel har lave, grå ribber."],
    ["Stok","Massiv (ikke hul), brunlig med gule bånd eller zoner.",""],
    ["Kød","Gulbrunt.",""]
  ],
  field:[["Underside","Rustbrune LAMELLER"],["Stok","Massiv, gule bånd"],["Hat","Spids pukkel"]],
  sides:{hat:"Orangebrun med spids pukkel.", under:"Rustbrune, tykke lameller.", stok:"Massiv, med gule bånd.", basis:"Ingen pose. Ofte dybt i mos.", kod:"Gulbrunt, massivt."},
  hab:"Fugtig, sur nåleskov med mos, især under gran – samme sted som tragtkantarel.", trees:["Gran","Fyr"],
  m:[8,9,10], like:["tragt"],
  danger:"Dødeligt giftig. Giften (orellanin) ødelægger nyrerne. Symptomer kommer først efter 2 dage til 3 uger.",
  k:{ring:["nej"],basis:["ingen"],farve:["brun","gulorange"],pletter:["nej"],skift:["ingen"],hab:["nal"],ribtype:["tynde"],hul:["nej"]}
},
{ id:"galde", da:"Galderørhat", la:"Tylopilus felleus", alt:"",
  grp:"pas", st:"ikke", under:"ror",
  lede:"Ligner en Karl Johan – men porerne bliver lyserøde, og stokken har et groft, mørkt net. Ét eksemplar gør hele retten bitter.",
  look:[
    ["Hat","Brun til gyldenbrun, 5–15 cm, mat.",""],
    ["Underside","Hvidlige porer, der bliver lyserøde med alderen.",""],
    ["Stok","Med groft, MØRKT brunt netmønster.","Karl Johan har fint, LYST net."],
    ["Smag","Meget bitter.","Se efter porer og net – ikke smag."]
  ],
  field:[["Stok","Groft, MØRKT net"],["Porer","Lyserøde"],["Smag","Meget bitter"]],
  sides:{hat:"Brun, mat – ligner Karl Johan.", under:"Porer: hvidlige → lyserøde.", stok:"Groft, mørkebrunt net.", basis:"Ingen ring eller pose.", kod:"Hvidt, blåner ikke. Bittert."},
  hab:"Nåle- og løvskov på sur bund, ofte ved gamle stubbe.", trees:["Fyr","Gran","Bøg","Eg"],
  m:[7,8,9,10], like:["karljohan"],
  k:{ring:["nej"],basis:["ingen"],farve:["brun"],slim:["nej"],pore:["hvid","lyserod"],net:["mort"],skift:["ingen"],hab:["nal","lov","traeved"]}
},
{ id:"falsk", da:"Falsk kantarel", la:"Hygrophoropsis aurantiaca", alt:"Almindelig orangekantarel",
  grp:"pas", st:"ikke", under:"lameller", underAlt:"ribber",
  lede:"Den klassiske forveksling. Mere orange end kantarellen og tyndkødet – og under hatten sidder der rigtige, tynde lameller.",
  look:[
    ["Hat","Orange, ofte mørkere i midten, 2–8 cm, fløjlsagtig og tynd.",""],
    ["Underside","Tynde, tætte, gentagne gange gaffeldelte lameller i klart orange.","Kantarellen har lave, butte ribber."],
    ["Stok","Tynd, blød, ofte buet, orange til brunlig.",""],
    ["Kød","Tyndt og blødt – uden kantarellens faste trævler.",""]
  ],
  field:[["Underside","Tynde, TÆTTE lameller"],["Farve","Klart orange"],["Kød","Tyndt, blødt"]],
  sides:{hat:"Orange, tynd, fløjlsagtig.", under:"Tynde, tætte lameller – gaffeldelte.", stok:"Tynd, blød, ofte buet.", basis:"Ingen ring. Ofte på eller ved dødt træ.", kod:"Tyndt, blødt."},
  hab:"Nåleskov, i nålestrøelse og på eller ved rådnende træ og stubbe.", trees:["Fyr","Gran","Dødt træ"],
  m:[8,9,10,11], like:["kantarel"],
  danger:"Ikke spiselig. Ikke farlig på samme måde som fluesvampene, men kan give maveproblemer.",
  k:{ring:["nej"],basis:["ingen"],farve:["gulorange"],pletter:["nej"],skift:["ingen"],hab:["nal","traeved"],ribtype:["tynde"],hul:["nej"]}
},
/* ---- nåleskov på sand ---- */
{ id:"sandror", da:"Broget slimrørhat", la:"Suillus variegatus", alt:"Sandrørhat",
  grp:"godt", st:"spis", under:"ror",
  lede:"Gulbrun, kornet-filtet hat og olivengule porer – uden ring. En typisk rørhat i sandet fyrreskov.",
  look:[
    ["Hat","Gul- til olivenbrun, 5–12 cm, fint kornet eller filtet. Kun lidt fedtet i vådt vejr.","Ikke glinsende slimet som Brungul slimrørhat."],
    ["Underside","Små, olivengule til brunlige porer. Kan blåne svagt.",""],
    ["Stok","Gullig, kraftig – uden ring.",""],
    ["Kød","Gulligt, blåner svagt i snit.",""]
  ],
  field:[["Hat","Kornet, gulbrun"],["Stok","INGEN ring"],["Træ","Under fyr"]],
  sides:{hat:"Gulbrun og kornet-filtet, ikke blank.", under:"Små, olivengule porer.", stok:"Gullig og uden ring.", basis:"Ingen pose eller knold.", kod:"Gulligt, blåner svagt."},
  hab:"Under fyr på sandet, sur bund – ofte med lyng og mos.", trees:["Fyr"],
  m:[8,9,10,11], like:["slimror"],
  k:{ring:["nej"],basis:["ingen"],farve:["brun","gulorange"],slim:["nej","ja"],pore:["gul"],net:["intet"],skift:["bla","ingen"],hab:["nal"]}
},
{ id:"maelkehat", da:"Velsmagende mælkehat", la:"Lactarius deliciosus", alt:"",
  grp:"godt", st:"god", under:"lameller",
  lede:"Orange hat med mørkere ringe og grønne pletter. Bræk en lamel: der kommer gulerodsorange mælk.",
  look:[
    ["Hat","Orange, 4–12 cm, med mørkere koncentriske ringe. Midten fordybet. Ofte grønplettet.",""],
    ["Underside","Tætte, orange lameller, der får grønne pletter ved tryk.",""],
    ["Mælk","Gulerodsorange mælk, når du brækker en lamel.","Rødbrun mælkehat har HVID mælk."],
    ["Stok","Orange, hul, ofte med små mørkere gruber.",""]
  ],
  field:[["Mælk","ORANGE"],["Pletter","Grønne ved tryk"],["Træ","Under fyr"]],
  sides:{hat:"Orange med ringe; grønne pletter med alderen.", under:"Tætte orange lameller.", stok:"Orange, hul, med gruber.", basis:"Ingen ring, pose eller knold.", kod:"Brækker som kridt. Orange mælk."},
  hab:"Under fyr, især på sandet bund.", trees:["Fyr"],
  m:[8,9,10], like:["rodbrun"],
  extra:"Under gran vokser Gran-mælkehat (L. deterrimus), hvis orange mælk bliver rødlig efter 10–30 minutter. Mælkehatte med hvid mælk hører ikke hjemme i kurven, når du leder efter denne.",
  k:{ring:["nej"],basis:["ingen"],farve:["gulorange"],pletter:["nej"],skift:["ingen"],maelk:["orange"],hab:["nal"]}
},
{ id:"rodbrun", da:"Rødbrun mælkehat", la:"Lactarius rufus", alt:"",
  grp:"pas", st:"ikke", under:"lameller",
  lede:"Meget almindelig i nåleskov. Rødbrun hat med en lille pukkel – og hvid mælk, der smager brændende skarpt.",
  look:[
    ["Hat","Rødbrun, 3–10 cm, tør og mat, ofte med en lille spids pukkel i midten.",""],
    ["Underside","Tætte, lyse creme- til rødlige lameller.",""],
    ["Mælk","Hvid mælk, der ikke skifter farve.","Smagen bliver brændende skarp efter lidt tid – du behøver ikke smage."],
    ["Stok","Rødbrun, lidt lysere end hatten.",""]
  ],
  field:[["Mælk","HVID"],["Hat","Rødbrun, lille pukkel"],["Sted","Mos under nåletræ"]],
  sides:{hat:"Ensfarvet rødbrun med lille pukkel.", under:"Lyse lameller.", stok:"Rødbrun, glat.", basis:"Ingen ring eller pose.", kod:"Brækker som kridt. Hvid mælk."},
  hab:"Nåleskov – især fyr og gran – på sur bund, gerne i mos. Meget almindelig.", trees:["Fyr","Gran"],
  m:[7,8,9,10,11], like:["maelkehat"],
  danger:"Ikke spiselig. Brændende skarp og mistænkt for at være giftig.",
  k:{ring:["nej"],basis:["ingen"],farve:["brun","rod"],pletter:["nej"],skift:["ingen"],maelk:["hvid"],hab:["nal"]}
},
{ id:"netblad", da:"Almindelig netbladhat", la:"Paxillus involutus", alt:"",
  grp:"pas", st:"meget", under:"lameller",
  lede:"Brun hat med længe indrullet kant og gulbrune lameller, der brunes, når du rører dem. Meget almindelig – og kan være dødelig.",
  look:[
    ["Hat","Brun til olivenbrun, 5–15 cm, kanten længe rullet ind under hatten.",""],
    ["Underside","Gulbrune, nedløbende lameller, der brunes ved tryk og let skubbes af.",""],
    ["Stok","Kort, brunlig, uden ring.",""],
    ["Kød","Gulligt, brunes.",""]
  ],
  field:[["Kant","Rullet ind"],["Lameller","Brunes ved tryk"],["Farve","Brun"]],
  sides:{hat:"Brun, fløjlsagtig; kanten rullet ind.", under:"Gulbrune lameller – brunes ved tryk.", stok:"Kort og brunlig.", basis:"Ingen ring eller pose.", kod:"Gulligt; brunes."},
  hab:"Både under birk, fyr, gran og løvtræ på sur bund. Meget almindelig.", trees:["Birk","Fyr","Gran"],
  m:[7,8,9,10,11], like:[],
  danger:"Meget giftig. Blev tidligere spist, men kan udløse en immunreaktion, der ødelægger de røde blodlegemer – også når den er tilberedt. Kan være dødelig.",
  k:{ring:["nej"],basis:["ingen"],farve:["brun"],pletter:["nej"],skift:["brun"],maelk:["ingen"],hab:["nal","lov"]}
},
{ id:"ridder", da:"Ægte ridderhat", la:"Tricholoma equestre", alt:"",
  grp:"pas", st:"fra", under:"lameller",
  lede:"Gul, klæbrig hat med sandkorn på og svovlgule lameller. Almindelig i sandet fyrreskov – men frarådes.",
  look:[
    ["Hat","Gul til gulbrun, 4–10 cm, klæbrig, ofte med sand klistret fast. Midten brunere.",""],
    ["Underside","Klart svovlgule lameller.",""],
    ["Stok","Gul, uden ring og uden pose.",""],
    ["Duft","Melagtig.",""]
  ],
  field:[["Lameller","Svovlgule"],["Hat","Klæbrig, sandkorn"],["Træ","Sandet fyrreskov"]],
  sides:{hat:"Gul og klæbrig – ofte med sand på.", under:"Svovlgule lameller.", stok:"Gul, ingen ring.", basis:"Ingen pose – men grav alligevel fri og tjek.", kod:"Hvidligt til gulligt."},
  hab:"Sandet fyrreskov.", trees:["Fyr"],
  m:[9,10,11], like:["kliddet"],
  danger:"Frarådes. Efter forgiftninger med muskelnedbrydning, især i Frankrig, frarådes den. Sammenhængen er omdiskuteret – lad den stå.",
  k:{ring:["nej"],basis:["ingen"],farve:["gulorange","gulgron"],pletter:["nej"],skift:["ingen"],maelk:["ingen"],hab:["nal"]}
},
/* ---- udvidelse: eng, dødt ved og forår ---- */
{ id:"markchamp", da:"Mark-champignon", la:"Agaricus campestris", alt:"",
  grp:"godt", st:"god", under:"lameller",
  lede:"Hvid hat og lameller, der er klart lyserøde hos unge og chokoladebrune hos ældre. Vokser på græsmarker – ikke inde i skoven.",
  look:[
    ["Hat","Hvid, 3–10 cm, silkeagtig til fint skællet.",""],
    ["Underside","Frie lameller: klart lyserøde hos unge, siden chokoladebrune.","Fluesvampe har hvide lameller hele livet."],
    ["Stok","Kort, hvid, med en tynd ring, der let forsvinder. Ingen knold og ingen pose.",""],
    ["Kød","Hvidt; kan blive svagt rødligt. Gulner IKKE.","Karbol-champignon bliver kromgul i stokbasis."],
    ["Duft","Behagelig svampeduft.","Karbol-champignon lugter af blæk."]
  ],
  field:[],
  sides:{hat:"Hvid og silkeagtig.", under:"Lyserøde (unge) til chokoladebrune lameller.", stok:"Kort, hvid, tynd ring.", basis:"Ingen pose og ingen knold – grav alligevel fri og tjek.", kod:"Hvidt, gulner ikke. Lugter ikke af blæk."},
  hab:"Græsmarker, enge og græsning med heste eller kvæg – typisk ikke i skov.", trees:[],
  m:[7,8,9,10], like:["karbol","snehvid"],
  extra:"Unge, lukkede champignoner og unge fluesvampe kan ligne hinanden. Skær igennem, se lamellernes farve – og grav basis fri.",
  vv:[], bund:["graes"], spot:"Lyserøde til chokoladebrune lameller – aldrig hvide. Ingen pose.",
  k:{ring:["ja","nej"],basis:["ingen"],farve:["hvid"],pletter:["nej"],skift:["ingen","rod"],maelk:["ingen"],hab:["aaben"],sted:["graes","jord"]}
},
{ id:"karbol", da:"Karbol-champignon", la:"Agaricus xanthodermus", alt:"",
  grp:"pas", st:"gift", under:"lameller",
  lede:"Ligner en champignon, men stokbasis bliver kromgul, når du skærer den, og den lugter af blæk eller karbol.",
  look:[
    ["Hat","Hvid til gråhvid, 5–12 cm; ung ofte lidt kantet. Gulner, når du ridser.",""],
    ["Underside","Lameller lyserøde, siden brune.",""],
    ["Stok","Hvid, tydelig ring, let knoldet basis.",""],
    ["Snit","Skær stokbasis over: KROMGUL med det samme.","Det vigtigste tegn."],
    ["Duft","Blæk, karbol – kraftigst ved opvarmning.",""]
  ],
  field:[],
  sides:{hat:"Hvid; gulner ved ridsning.", under:"Lyserøde til brune lameller.", stok:"Hvid med tydelig ring.", basis:"Skær basis over: kromgul.", kod:"Kromgult i stokbasis. Lugter af blæk."},
  hab:"Haver, parker, skovbryn og levende hegn – ofte nær bebyggelse.", trees:[],
  m:[7,8,9,10], like:["markchamp"],
  danger:"Giftig. Giver kraftige mave-tarm-symptomer hos de fleste.",
  vv:[], bund:["graes","kant"], spot:"Skær stokbasis over: KROMGUL. Lugter af blæk.",
  k:{ring:["ja"],basis:["knold","ingen"],farve:["hvid"],pletter:["nej"],skift:["brun"],maelk:["ingen"],hab:["aaben","lov"],sted:["graes","jord"]}
},
{ id:"stoevbold", da:"Kæmpestøvbold", la:"Calvatia gigantea", alt:"Syn. Langermannia gigantea",
  grp:"godt", st:"spis", under:"andet", form:"kugle",
  lede:"En hvid kugle fra fodbold- til kæmpestørrelse på enge og i haver. Kun når den er hvid og fast hele vejen igennem.",
  look:[
    ["Form","Kugleformet, 10–50 cm eller mere, uden stok.",""],
    ["Overflade","Glat, hvid til lædergul, som ruskind.",""],
    ["Indre","Helt hvidt og fast hos unge. Bliver gult, olivenbrunt og pulveragtigt med alderen.",""],
    ["Snit","Skær altid igennem fra top til bund.","Ser du omridset af en hat og lameller, er det en fluesvamp i ‘æg’-stadiet."]
  ],
  field:[],
  sides:{hat:"Hvid kugle, glat som ruskind.", under:"Ingen underside – sporerne dannes inde i kuglen.", stok:"Ingen stok.", basis:"Fæstnet med en tynd streng.", kod:"Helt hvidt og ensartet – ellers skal den ikke i køkkenet."},
  hab:"Enge, haver, parker og skovbryn på næringsrig bund – ofte ved brændenælder.", trees:[],
  m:[7,8,9,10], like:["snehvid"],
  extra:"Mindre støvbolde kan forveksles med fluesvampenes ‘æg’ og med den giftige Almindelig bruskbold, som er sort-violet indeni.",
  vv:[], bund:["graes"], spot:"Skær den igennem: helt hvid og ensartet – intet omrids af hat og lameller.",
  k:{form:["kugle"],farve:["hvid"],sted:["graes","jord"]}
},
{ id:"parykhat", da:"Stor parykhat", la:"Coprinus comatus", alt:"",
  grp:"godt", st:"god", under:"lameller",
  lede:"Høj, hvid og cylindrisk med pjuskede skæl – som en paryk. Lamellerne bliver sorte og opløses til blæk nedefra.",
  look:[
    ["Hat","Hvid, cylindrisk til ægformet, 5–15 cm høj, med grove, opstående skæl og brunlig top.",""],
    ["Underside","Tætte lameller: hvide → lyserøde → sorte og flydende fra kanten.",""],
    ["Stok","Hvid, hul, med en løs, smal ring.",""],
    ["Alder","Opløses til sort ‘blæk’ på få timer.","Kun unge, rent hvide eksemplarer bruges."]
  ],
  field:[],
  sides:{hat:"Hvid ‘paryk’ med pjuskede skæl.", under:"Hvide lameller, der bliver sorte fra kanten.", stok:"Hvid, hul, løs ring.", basis:"Let fortykket. Ingen pose.", kod:"Hvidt – sort blæk med alderen."},
  hab:"Græs, vejkanter, plæner og nyanlagte arealer med forstyrret jord.", trees:[],
  m:[5,6,7,8,9,10,11], like:[],
  extra:"Grå blækhat er en anden art, som giver forgiftning sammen med alkohol. Stor parykhat skal tilberedes samme dag, den plukkes.",
  vv:[], bund:["graes","kant"], spot:"Høj hvid ‘paryk’ med pjuskede skæl – lameller sorte fra kanten.",
  k:{ring:["ja","nej"],basis:["ingen"],farve:["hvid"],pletter:["ja"],skift:["ingen"],maelk:["ingen"],hab:["aaben"],sted:["graes","jord"]}
},
{ id:"svovlhat", da:"Knippe-svovlhat", la:"Hypholoma fasciculare", alt:"",
  grp:"pas", st:"gift", under:"lameller",
  lede:"Svovlgul, i tætte knipper på stubbe og døde rødder. Lamellerne bliver grønlige og til sidst sortviolette.",
  look:[
    ["Hat","Svovlgul med orangebrun midte, 2–7 cm.",""],
    ["Underside","Lameller: svovlgule → GRØNLIGE → sortviolette.","Det grønne skær er det bedste tegn."],
    ["Stok","Gul og tynd, med en mørk zone af sporer.",""],
    ["Vækst","Altid på træ – i tætte knipper.",""]
  ],
  field:[],
  sides:{hat:"Svovlgul med orangebrun midte.", under:"Grønlige lameller.", stok:"Gul, tynd, i knipper.", basis:"Knipper fra samme stub eller rod.", kod:"Gult og meget bittert."},
  hab:"På stubbe, rødder og liggende stammer af både løv- og nåletræ. Mest om efteråret, men kan ses hele året.", trees:["Dødt træ"],
  m:[6,7,8,9,10,11,12], like:["skaelhat"],
  danger:"Giftig. Giver mave-tarm-forgiftning efter 5–10 timer.",
  vv:["ved"], bund:[], spot:"Svovlgul i knipper på træ – GRØNLIGE lameller.",
  k:{ring:["nej"],basis:["ingen"],farve:["gulorange"],pletter:["nej"],skift:["ingen"],maelk:["ingen"],hab:["traeved"],trae:["lov","fyr","gran","birk"],sted:["ved"]}
},
{ id:"skaelhat", da:"Foranderlig skælhat", la:"Kuehneromyces mutabilis", alt:"",
  grp:"godt", st:"spis", under:"lameller", noGastro:true,
  lede:"Honningbrune hatte i store knipper på løvtræstubbe. Spiselig – men har en dødelig dobbeltgænger, så den er kun for erfarne.",
  look:[
    ["Hat","Honning- til kanelbrun, 2–6 cm. Tørrer tofarvet: lys midte, mørk rand.",""],
    ["Underside","Lyse, siden kanelbrune lameller.",""],
    ["Stok","Med ring. UNDER ringen små, brune, opstående skæl.","Randbæltet hjelmhat har sølvhvide trævler – ingen skæl."],
    ["Vækst","I store, tætte knipper.",""]
  ],
  field:[],
  sides:{hat:"Honningbrun, tofarvet i tørvejr.", under:"Kanelbrune lameller.", stok:"Små brune skæl under ringen.", basis:"Knipper fra samme stub.", kod:"Tyndt, lyst."},
  hab:"På stubbe og døde stammer af løvtræ, især bøg og birk. I store knipper.", trees:["Bøg","Birk","Dødt træ"],
  m:[4,5,6,7,8,9,10,11], like:["hjelmhat","svovlhat"],
  danger:"Kun for erfarne. Randbæltet hjelmhat vokser samme type steder og er dødeligt giftig. Ingen opskrifter i denne guide.",
  vv:["lov","birk","ved"], bund:[], spot:"Små brune SKÆL på stokken under ringen.",
  k:{ring:["ja"],basis:["ingen"],farve:["brun","gulorange"],pletter:["nej"],skift:["ingen"],maelk:["ingen"],hab:["traeved"],trae:["lov","birk"],sted:["ved"]}
},
{ id:"hjelmhat", da:"Randbæltet hjelmhat", la:"Galerina marginata", alt:"",
  grp:"pas", st:"meget", deadly:true, under:"lameller",
  lede:"Lille brun svamp på dødt træ – ofte nåletræ. Indeholder de samme dødelige giftstoffer som Grøn fluesvamp.",
  look:[
    ["Hat","Honningbrun, 1–5 cm; lysner, når den tørrer.",""],
    ["Underside","Gulbrune, siden rustbrune lameller.",""],
    ["Stok","Brunlig med SØLVHVIDE trævler på langs – ingen skæl. Tynd ring, der kan forsvinde.",""],
    ["Vækst","Enkeltvis eller i små knipper på formuldet træ.",""]
  ],
  field:[],
  sides:{hat:"Honningbrun, lysner i tørvejr.", under:"Rustbrune lameller.", stok:"Sølvhvide trævler – ingen skæl.", basis:"Mørkere nederst. På træ.", kod:"Tyndt, brunligt."},
  hab:"På dødt, formuldet træ – ofte nåletræ, også løvtræ, flis og nedgravet ved.", trees:["Gran","Fyr","Dødt træ"],
  m:[5,6,7,8,9,10,11,12], like:["skaelhat"],
  danger:"Dødeligt giftig. Indeholder amatoxiner som Grøn fluesvamp. Symptomer kommer først efter 6–24 timer.",
  vv:["gran","fyr","ved"], bund:["dodnaale"], spot:"SØLVHVIDE trævler på stokken – ingen skæl. På dødt træ.",
  k:{ring:["ja","nej"],basis:["ingen"],farve:["brun","gulorange"],pletter:["nej"],skift:["ingen"],maelk:["ingen"],hab:["traeved"],trae:["fyr","gran","lov","birk"],sted:["ved"]}
},
{ id:"morkel", da:"Spiselig morkel", la:"Morchella esculenta", alt:"",
  grp:"godt", st:"god", under:"andet", form:"morkel",
  lede:"Forårets svamp. En hat som en bikage af gruber – og helt hul indeni fra top til bund.",
  look:[
    ["Hat","5–15 cm, ægformet, gul-, grå- eller okkerbrun, med dybe gruber adskilt af ribber.",""],
    ["Stok","Hvidlig, kornet og hul.",""],
    ["Snit","Skær på langs: ÉT sammenhængende hulrum fra hattens top gennem stokken.","Ægte stenmorkel har flere uregelmæssige kamre."],
    ["Tilberedning","Skal altid tilberedes grundigt.","Rå eller for lidt tilberedte morkler er giftige."]
  ],
  field:[],
  sides:{hat:"Bikage af gruber og ribber.", under:"Ingen underside – gruberne sidder udvendigt.", stok:"Hvidlig, kornet, hul.", basis:"Let fortykket.", kod:"Ét hulrum hele vejen igennem."},
  hab:"Om foråret på kalkholdig, næringsrig bund – under ask og elm, i haver, parker og på flis.", trees:["Ask","Elm"],
  m:[4,5], like:["stenmorkel"],
  vv:["lov"], bund:[], spot:"Bikagehat – og hul som ét rør hele vejen igennem.",
  k:{form:["morkel"],trae:["lov"],sted:["jord","ved"],farve:["brun","gulorange","grasort"]}
},
{ id:"stenmorkel", da:"Ægte stenmorkel", la:"Gyromitra esculenta", alt:"",
  grp:"pas", st:"meget", under:"andet", form:"hjerne",
  lede:"Forårssvamp i sandet fyrreskov. Hatten er foldet som en hjerne – ikke et net af gruber. Tidligere kaldt spiselig; i dag regnes den ikke for sikker.",
  look:[
    ["Hat","Rødbrun til mørkebrun, 5–10 cm, uregelmæssigt og hjerneagtigt foldet.",""],
    ["Stok","Hvidlig, kort og tyk, ofte furet.",""],
    ["Snit","Indeni flere uregelmæssige kamre – ikke ét gennemgående rør.",""]
  ],
  field:[],
  sides:{hat:"Hjerneagtige folder – ingen gruber.", under:"Ingen underside.", stok:"Hvidlig, tyk, furet.", basis:"Kort og bred.", kod:"Uregelmæssige kamre."},
  hab:"Om foråret på sandet bund i fyrreskov og fyrreplantager, også på flis og forstyrret bund.", trees:["Fyr","Gran"],
  m:[3,4,5], like:["morkel"],
  danger:"Meget giftig. Indeholder gyromitrin, som ikke fjernes sikkert ved kogning eller tørring. Kan skade lever og nervesystem.",
  vv:["fyr","gran"], bund:["sand","naale"], spot:"Hjerneagtige folder – ikke gruber. Kamre indeni.",
  k:{form:["hjerne"],trae:["fyr","gran"],sted:["jord","naale","ved"],farve:["brun"]}
},
{ id:"ostershat", da:"Almindelig østershat", la:"Pleurotus ostreatus", alt:"",
  grp:"godt", st:"god", under:"lameller",
  lede:"Muslingeformede, grå til brunlige hatte i etager på løvtræ. En vintersvamp, der tåler frost.",
  look:[
    ["Hat","5–20 cm, muslinge- eller tungeformet, blågrå, grå eller brunlig.",""],
    ["Underside","Hvide lameller, der løber langt ned på stokken.",""],
    ["Stok","Kort og skæv, sidder i siden – kan næsten mangle.",""],
    ["Vækst","I etager på døde og svækkede løvtræer.",""]
  ],
  field:[],
  sides:{hat:"Muslingeformet, grå til brun.", under:"Hvide, nedløbende lameller.", stok:"Kort, sidestillet.", basis:"Sidder på træet.", kod:"Hvidt, fast."},
  hab:"På døde og svækkede stammer af løvtræ – især bøg, poppel og pil. Mest sent efterår og vinter.", trees:["Bøg","Poppel","Dødt træ"],
  m:[10,11,12,1,2,3], like:[],
  vv:["lov","ved"], bund:[], spot:"Muslingeformede hatte i etager på løvtræ – nedløbende hvide lameller.",
  k:{ring:["nej"],basis:["ingen"],farve:["grasort","brun","hvid"],pletter:["nej"],skift:["ingen"],maelk:["ingen"],hab:["traeved"],trae:["lov","birk"],sted:["ved"]}
},
{ id:"judasore", da:"Almindelig judasøre", la:"Auricularia auricula-judae", alt:"",
  grp:"godt", st:"spis", under:"andet", form:"ore",
  lede:"Brun, gummiagtig og formet som et øre. Sidder på grene – især af hyld – hele året.",
  look:[
    ["Form","Øre- eller skålformet, 3–8 cm, gummi- til geléagtig.",""],
    ["Overflade","Ydersiden fint fløjlshåret og rødbrun; indersiden glat, ofte med årer.",""],
    ["Vækst","På grene af løvtræ, især hyld. Tørrer ind og genopliver i regnvejr.",""]
  ],
  field:[],
  sides:{hat:"Brunt, gummiagtigt ‘øre’.", under:"Indersiden glat med årer.", stok:"Ingen stok.", basis:"Sidder direkte på grenen.", kod:"Gummiagtigt, geléagtigt."},
  hab:"På grene og stammer af løvtræ, især hyld. Hele året, mest i fugtigt vejr.", trees:["Hyld","Dødt træ"],
  m:[1,2,3,4,5,6,7,8,9,10,11,12], like:[],
  vv:["lov","ved"], bund:[], spot:"Brunt, gummiagtigt ‘øre’ på hyldegrene.",
  k:{form:["ore"],trae:["lov"],sted:["ved"],farve:["brun"]}
}

];

/* =====================================================================
   TRÆER, BUND OG "SPOT DEN" – struktureret metadata pr. art
   t = træer (nøgle), s = vokser i (nøgle), vv = VOKSER VED (visning),
   bund = mos/nåle/sand … (visning), spot = ét kendetegn
   ===================================================================== */
const EXTRA = {
  brunstokket:{vv:["fyr","gran"],bund:["mos","naale","sur"],t:["fyr","gran","lov"],s:["mos","naale","jord"],spot:"Tryk på de gule porer – de bliver blå."},
  karljohan:{vv:["fyr","gran","birk","lov"],bund:["mos","naale","kant"],t:["fyr","gran","birk","lov"],s:["jord","mos","naale"],spot:"Fint, hvidt net øverst på den tykke stok."},
  slimror:{vv:["fyr"],bund:["sand","naale","kant"],t:["fyr"],s:["naale","jord"],spot:"Slimet, blank brun hat – og en ring på stokken."},
  sandror:{vv:["fyr"],bund:["sand","sur","mos"],t:["fyr"],s:["jord","mos","naale"],spot:"Kornet gulbrun hat, olivengule porer – ingen ring."},
  maelkehat:{vv:["fyr"],bund:["sand","mos","naale"],t:["fyr"],s:["jord","mos","naale"],spot:"Bræk en lamel: ORANGE mælk. Grønne pletter ved tryk."},
  kantarel:{vv:["fyr","gran","birk","lov"],bund:["mos","sur"],t:["fyr","gran","birk","lov"],s:["mos","jord","naale"],spot:"Butte ribber – ikke lameller. Æggegul overalt."},
  tragt:{vv:["gran","fyr"],bund:["mos","naale","sur"],t:["gran","fyr"],s:["mos","naale"],spot:"Hul, gul stok og grå ribber. Kommer for alvor i oktober."},
  pigsvamp:{vv:["fyr","gran","lov"],bund:["mos"],t:["fyr","gran","lov"],s:["mos","jord","naale"],spot:"Pigge under hatten – ingen lameller."},
  parasol:{vv:[],bund:["kant","graes","sand"],t:null,s:["jord","graes"],spot:"Slangeskindsmønster på stokken og en løs ring."},
  trompet:{vv:["lov"],bund:[],t:["lov"],s:["jord"],spot:"Sort, hul trompet i bøgeløv.",rare:"Sjælden i ren nåleskov – vokser under bøg og eg."},
  snehvid:{vv:["gran","fyr","birk","lov"],bund:["sur","mos"],t:["gran","fyr","birk","lov"],s:["jord","mos"],spot:"Hvid overalt: lameller, ring og POSE – grav den fri."},
  gron:{vv:["lov"],bund:["kant"],t:["lov"],s:["jord"],spot:"Grønlig hat, hvide lameller, POSE ved basis.",rare:"Mest under eg og bøg – sjælden i ren nåleskov, men mulig hvor der står løvtræ."},
  panter:{vv:["fyr","lov"],bund:["sand"],t:["lov","fyr"],s:["jord","naale"],spot:"Brun hat, rent hvide vorter – kødet rødmer ikke."},
  rod:{vv:["birk","fyr","gran"],bund:["sand","sur"],t:["birk","fyr","gran"],s:["jord","mos","naale"],spot:"Rød hat, hvide vorter – knold med vorteringe."},
  kliddet:{vv:["fyr","gran","lov"],bund:["sur","sand"],t:["fyr","gran","lov","birk"],s:["jord","naale","mos"],spot:"Rund knold med skarp kant. Dufter af rå kartofler."},
  rodmende:{vv:["fyr","gran","birk","lov"],bund:[],t:["lov","fyr","gran","birk"],s:["jord","naale","mos"],spot:"Kødet rødmer langsomt, ringen er riflet."},
  giftslor:{vv:["gran","fyr"],bund:["mos","sur"],t:["gran","fyr"],s:["mos"],spot:"Rustbrune lameller og gule bånd på stokken."},
  netblad:{vv:["birk","fyr","gran"],bund:["sur"],t:["birk","fyr","gran","lov"],s:["jord","mos","naale"],spot:"Indrullet kant; gulbrune lameller der brunes ved tryk."},
  ridder:{vv:["fyr"],bund:["sand"],t:["fyr"],s:["jord"],spot:"Svovlgule lameller, klæbrig gul hat med sandkorn."},
  rodbrun:{vv:["fyr","gran"],bund:["mos","sur","naale"],t:["fyr","gran","birk"],s:["mos","naale","jord"],spot:"Rødbrun hat med lille pukkel – HVID mælk."},
  galde:{vv:["fyr","gran","lov"],bund:["sur","dodnaale"],t:["fyr","gran","lov"],s:["jord","ved","naale"],spot:"Groft, MØRKT net på stokken og lyserøde porer."},
  falsk:{vv:["fyr","gran","ved"],bund:["naale","dodnaale"],t:["fyr","gran"],s:["naale","ved","mos"],spot:"Tynde, tætte orange lameller – blød og tyndkødet."}
};
const ORDER=["brunstokket","karljohan","slimror","sandror","maelkehat","kantarel","tragt","pigsvamp","parasol","trompet",
  "snehvid","gron","panter","rod","kliddet","rodmende","giftslor","netblad","ridder","rodbrun","galde","falsk",
  "markchamp","parykhat","stoevbold","ostershat","judasore","morkel","skaelhat","karbol","svovlhat","hjelmhat","stenmorkel"];
for(const s of SP){const x=EXTRA[s.id]; if(!x) continue;
  s.vv=x.vv; s.bund=x.bund; s.spot=x.spot; s.rare=x.rare||"";
  if(x.t) s.k.trae=x.t; s.k.sted=x.s;
  if(s.under==="lameller"&&!s.k.maelk) s.k.maelk=["ingen"];}
SP.sort((a,b)=>ORDER.indexOf(a.id)-ORDER.indexOf(b.id));
const BUND={mos:"Mos",naale:"Nåledække",sand:"Sandet jord",sur:"Sur jord",kant:"Skovkant / sti",dodnaale:"Dødt nåletræ",graes:"Græs / lysning"};
/* Struktureret metadata pr. art (afledt af felterne ovenfor):
   meta = { habitats:[nål|løv|åben|ved], treeAssociations:[fyr|gran|birk|lov],
            substrates:[mos|naale|jord|ved|graes|sand…], seasonMonths:[1–12] }
   regions: se GEO (observationsgitter) – beregnes lokalt i browseren. */
for(const s of SP){const vv=s.vv||[];s.meta={habitats:[...new Set([vv.some(v=>v==="fyr"||v==="gran")&&"nål",vv.some(v=>v==="lov"||v==="birk")&&"løv",((s.k.sted||[]).includes("graes"))&&"åben",vv.includes("ved")&&"ved"].filter(Boolean))],
  treeAssociations:vv.filter(v=>v!=="ved"),substrates:[...new Set([...(s.bund||[]),...(s.k.sted||[])])],seasonMonths:s.m}}
const S = Object.fromEntries(SP.map(s=>[s.id,s]));

/* =====================================================================
   COMPARISONS
   ===================================================================== */
const PAIRS = [
{ id:"kantarel-falsk", a:"kantarel", b:"falsk", q:"Butte ribber eller tynde lameller?",
  key:"Kantarel har butte ribber. Falsk kantarel har tynde, tætte lameller.",
  rows:[
    ["Underside","under","Lave, butte, grenede ribber, som løber ned ad stokken.","Tynde, tætte, skarpe lameller – gaffeldelte."],
    ["Form","typisk","Kødfuld og kompakt. Kanten bølget.","Tynd og let. Mere regelmæssig tragt."],
    ["Farve","typisk","Æggeblommegul, ens overalt.","Klart orange; lamellerne ofte stærkere farvet end hatten."],
    ["Konsistens","kod","Fast; kødet kan flås i trævler.","Blød og tyndkødet."],
    ["Voksested","habitat","Skovbund med mos, under løv- og nåletræer.","Nålestrøelse og rådnende træ, især under fyr."]
  ]},
{ id:"tragt-giftslor", a:"tragt", b:"giftslor", q:"Hul stok med ribber – eller massiv stok med lameller?",
  key:"Tragtkantarel: hul gul stok og grå ribber. Puklet gift-slørhat: massiv stok og rustbrune lameller.",
  rows:[
    ["Underside","under","Lave, grå-gule, grenede ribber.","Tykke, rustbrune lameller."],
    ["Stok","stok","Gul, hul, ofte med fure.","Massiv, med gule bånd."],
    ["Hat","typisk","Brun tragt med hul i midten.","Orangebrun med spids pukkel."],
    ["Voksested","habitat","Fugtig mos under gran og fyr.","Samme sted! Derfor skal hvert eksemplar tjekkes."]
  ]},
{ id:"karljohan-galde", a:"karljohan", b:"galde", q:"Lyst eller mørkt net på stokken?",
  key:"Karl Johan har fint, lyst net. Galderørhat har groft, mørkt net og lyserøde porer.",
  rows:[
    ["Stok","stok","Fint, HVIDT net – tydeligst øverst.","Groft, MØRKEBRUNT net."],
    ["Porer","under","Hvide → gule → olivengrønne.","Hvidlige → lyserøde."],
    ["Hat","typisk","Brun, ofte lidt fedtet, lysere rand.","Brun til gyldenbrun, mat."],
    ["Smag","kod","Mild.","Meget bitter."]
  ]},
{ id:"gron-kliddet", a:"gron", b:"kliddet", q:"Løs pose eller rund knold?",
  key:"Grøn fluesvamp har en løs, hvid pose. Kliddet fluesvamp har en rund knold med skarp kant.",
  rows:[
    ["Stokbasis","basis","Stor, løs, hvid pose (volva).","Rund knold med skarp kant."],
    ["Hat","typisk","Olivengrøn, trævlet, som regel uden flager.","Bleggul med flade, grålige flager."],
    ["Duft","kod","Ikke karakteristisk hos unge.","Rå kartofler."],
    ["Voksested","habitat","Løvskov – eg og bøg.","Løv- og nåleskov på sur bund."]
  ]},
{ id:"panter-rodmende", a:"panter", b:"rodmende", q:"Rødmer kødet? Er ringen riflet?",
  key:"Panterfluesvamp: kødet rødmer ikke, ringen er glat. Rødmende fluesvamp: kødet rødmer, ringen er riflet.",
  rows:[
    ["Kød","kod","Hvidt, rødmer ikke.","Rødmer langsomt, især ved insektgange."],
    ["Ring","stok","Glat.","Riflet (stribet) på oversiden."],
    ["Hat","typisk","Brun med RENT hvide vorter; riflet kant.","Rødbrun med GRÅLIGE vorter; glat kant."],
    ["Basis","basis","Knold med skarp krave.","Knold uden skarp krave, ofte rødlig."]
  ]},
{ id:"parasol-panter", a:"parasol", b:"panter", q:"Slangeskind eller glat hvid stok?",
  key:"Stor kæmpeparasolhat har slangeskindsmønster og løs ring. Fluesvampe har glat, hvid stok og knold med krave eller pose.",
  rows:[
    ["Stok","stok","Brunt slangeskindsmønster; løs ring.","Glat, hvid; fastsiddende ring."],
    ["Hat","typisk","Brune skæl, mørk pukkel. Op til 30 cm.","Hvide vorter på brun bund. 5–12 cm."],
    ["Basis","basis","Knoldet, men uden krave eller pose.","Knold med skarp krave."],
    ["Voksested","habitat","Lysninger, græs, skovbryn.","Inde i skoven."]
  ]},
{ id:"markchamp-snehvid", a:"markchamp", b:"snehvid", q:"Lyserøde eller hvide lameller? Pose?",
  key:"Mark-champignon har lyserøde til chokoladebrune lameller og ingen pose. Snehvid fluesvamp har hvide lameller hele livet – og en pose ved basis.",
  rows:[
    ["Lameller","under","Lyserøde hos unge, siden chokoladebrune.","Hvide – hele livet."],
    ["Stokbasis","basis","Ingen pose, ingen knold.","Løs, hvid pose om en knold."],
    ["Hat","typisk","Hvid, silkeagtig, ofte lidt flad.","Ren hvid, klokkeformet, ofte skæv."],
    ["Voksested","habitat","Græsmarker og enge.","Skov på sur bund."]
  ]},
{ id:"markchamp-karbol", a:"markchamp", b:"karbol", q:"Bliver stokbasis kromgul?",
  key:"Karbol-champignon bliver kromgul i stokbasis, når du skærer den over, og lugter af blæk. Mark-champignon gulner ikke.",
  rows:[
    ["Snit","kod","Hvidt; kan blive svagt rødligt.","Kromgult i stokbasis – med det samme."],
    ["Duft","kod","Behagelig svampeduft.","Blæk, karbol."],
    ["Hat","typisk","Hvid, silkeagtig.","Hvid til gråhvid; gulner ved ridsning."],
    ["Voksested","habitat","Græsmarker og enge.","Haver, parker, skovbryn."]
  ]},
{ id:"morkel-stenmorkel", a:"morkel", b:"stenmorkel", q:"Gruber eller hjernefolder?",
  key:"Spiselig morkel har gruber som en bikage og ét hulrum indeni. Ægte stenmorkel er foldet som en hjerne og har kamre indeni.",
  rows:[
    ["Hat","typisk","Gruber adskilt af ribber – som en bikage.","Uregelmæssige, hjerneagtige folder."],
    ["Snit","kod","Ét sammenhængende hulrum fra top til bund.","Flere uregelmæssige kamre."],
    ["Voksested","habitat","Kalkholdig bund, ask og elm, haver.","Sandet fyrreskov og fyrreplantager."],
    ["Sæson","","April–maj.","Marts–maj – ofte lidt tidligere."]
  ]},
{ id:"skaelhat-hjelmhat", a:"skaelhat", b:"hjelmhat", q:"Skæl eller sølvtrævler på stokken?",
  key:"Foranderlig skælhat har små brune skæl under ringen og vokser i store knipper på løvtræ. Randbæltet hjelmhat har sølvhvide trævler og vokser ofte på nåletræ. Forvekslingen er livsfarlig.",
  rows:[
    ["Stok","stok","Små, brune, opstående skæl under ringen.","Sølvhvide trævler på langs – ingen skæl."],
    ["Hat","typisk","Honningbrun, tofarvet i tørvejr.","Honningbrun, lysner i tørvejr – næsten ens."],
    ["Voksested","habitat","Store knipper på løvtræ, især bøg og birk.","Enkeltvis eller små knipper, ofte på nåletræ."],
    ["Konklusion","","Spiselig – kun for erfarne.","Dødeligt giftig."]
  ]},
{ id:"maelkehat-rodbrun", a:"maelkehat", b:"rodbrun", q:"Orange eller hvid mælk?",
  key:"Velsmagende mælkehat har orange mælk og grønne pletter. Rødbrun mælkehat har hvid mælk og brændende skarp smag.",
  rows:[
    ["Mælk","kod","Gulerodsorange.","Hvid, skifter ikke farve."],
    ["Hat","typisk","Orange med mørkere ringe; grønne pletter.","Ensfarvet rødbrun, lille pukkel."],
    ["Lameller","under","Orange; grønne ved tryk.","Lyse, creme til rødlige."],
    ["Voksested","habitat","Under fyr, på sandet bund.","Nåleskov, gerne i mos. Meget almindelig."]
  ]}
];

/* =====================================================================
   IDENTIFICATION KEY
   ===================================================================== */
const Q = {
  under:{t:"Hvad er der under hatten?", h:"Vend svampen forsigtigt, eller se op under hatten.", o:[
    ["lameller","Lameller","Tynde blade som siderne i en bog"],
    ["ror","Rør / porer","En svamp med små huller"],
    ["ribber","Ribber / folder","Lave, butte, grenede folder"],
    ["pigge","Pigge","Små tapper, som istapper"],
    ["andet","Anden form","Kugle, morkel, øre – ingen hat med underside"]]},
  form:{t:"Hvilken form har den?", h:"Svampe uden en hat med underside.", o:[
    ["kugle","Kugle","Rund, uden stok"],["morkel","Bikage","Hat med gruber"],["hjerne","Hjerne","Hat med folder"],["ore","Øre / gelé","Gummiagtig, på grene"]]},
  ring:{t:"Har stokken en ring?", h:"Et skørt eller en krave rundt om stokken, under hatten. Den kan være faldet af – se efter et mærke.", o:[
    ["ja","Ja","Skørt eller krave"],["nej","Nej","Glat stok"]]},
  basis:{t:"Hvordan ser stokkens basis ud?", h:"Grav svampen fri med kniv eller fingre. Det vigtigste sidder ofte under jorden.", o:[
    ["pose","Pose / skede","Løs hinde om foden, som en æggeskal"],
    ["knold","Knold","Opsvulmet, evt. med kant eller vortebælter"],
    ["ingen","Lige / smal","Ingen knold og ingen pose"]]},
  farve:{t:"Hvilken farve har hatten?", h:"Vælg den nærmeste. Farver varierer med alder og vejr.", o:[
    ["hvid","Hvid / bleg",""],["gulgron","Gulgrøn / oliven",""],["gulorange","Gul / orange",""],
    ["rod","Rød",""],["brun","Brun",""],["grasort","Grå / sort",""]]},
  pletter:{t:"Er der pletter, vorter eller skæl på hatten?", h:"Hvide vorter, flager af hud eller brune skæl.", o:[
    ["ja","Ja","Vorter, flager eller skæl"],["nej","Nej","Glat hat"]]},
  skift:{t:"Skifter kødet farve, når du skærer eller trykker?", h:"Skær svampen over, eller tryk på undersiden. Vent et minut.", o:[
    ["bla","Blåner","Bliver blå"],["rod","Rødmer","Bliver langsomt rødlig"],["brun","Gulner / brunes","Bliver gul-orange eller brun"],["ingen","Ingen ændring",""]]},
  trae:{t:"Hvilke træer står den ved?", h:"Se op: hvilke træer står nærmest svampen? Træet hjælper – men afgør aldrig bestemmelsen.", o:[
    ["fyr","Fyr","Lange nåle i par, rødlig bark højt oppe"],["gran","Gran","Korte, stive nåle; hængende kogler"],
    ["birk","Birk","Hvid bark"],["lov","Løvtræ","Bøg, eg"]]},
  sted:{t:"Hvor vokser den?", h:"Se ned: hvad står den i?", o:[
    ["mos","Mos","Grønt, blødt tæppe"],["naale","Nåledække","Brune nåle på skovbunden"],
    ["jord","Jord / sand","Bar jord, sand"],["ved","Dødt ved","Stub, rod, gren"],["graes","Græs","Eng, plæne, skovbryn"]]},
  maelk:{t:"Kommer der mælk, når du brækker en lamel?", h:"Knæk forsigtigt kanten af hatten eller en lamel. Nogle svampe bløder en mælkesaft.", o:[
    ["orange","Orange mælk","Gulerodsfarvet"],["hvid","Hvid mælk",""],["ingen","Ingen mælk",""]]},
  hab:{t:"Hvor vokser den?", h:"Se op: hvilke træer står nærmest?", o:[
    ["lov","Under løvtræ","Bøg, eg, birk"],["nal","Under nåletræ","Fyr, gran"],["bland","Blandskov","Både løv og nål"],
    ["traeved","På dødt træ","Stub, gren, rådnende ved"],["skovbund","Skovbund","Mos, løv, nåle"],["aaben","Lysning / græs","Åbent, skovbryn"]]},
  slim:{t:"Er hatten slimet og blank?", h:"Rør ved hatten. Nogle rørhatte er klæbrige i vådt vejr.", o:[
    ["ja","Ja, slimet","Blank som lak"],["nej","Nej, tør / mat",""]]},
  pore:{t:"Hvilken farve har porerne?", h:"Porerne er den svampede underside.", o:[
    ["hvid","Hvid / creme",""],["gul","Gul / oliven",""],["lyserod","Lyserød",""]]},
  net:{t:"Er der et netmønster på stokken?", h:"Se især øverst på stokken, lige under hatten.", o:[
    ["lyst","Lyst, fint net",""],["mort","Mørkt, groft net",""],["intet","Intet net","Glat, stribet eller prikket"]]},
  ribtype:{t:"Hvordan ser folderne ud?", h:"Kør en finger hen over dem.", o:[
    ["butte","Lave og butte","Afrundede, grenede"],["tynde","Tynde og skarpe","Tætte, som blade"],["glat","Næsten glat","Kun svage rynker"]]},
  hul:{t:"Er stokken hul?", h:"Skær stokken over, eller se ned i hattens midte.", o:[
    ["ja","Ja, hul",""],["nej","Nej, massiv",""]]}
};
const FLOW = {
  lameller:["trae","sted","ring","basis","farve","pletter","maelk"],
  ror:["trae","sted","pore","skift","net","slim"],
  ribber:["trae","sted","ribtype","hul","farve"],
  pigge:["trae","sted","farve"],
  andet:["form","trae","sted"],
  vedikke:["trae","sted","ring","basis","farve"]
};
const QLBL = {form:"Form",trae:"Træ",sted:"Vokser i",maelk:"Mælk",under:"Underside",ring:"Ring",basis:"Stokbasis",farve:"Hatfarve",pletter:"Hatoverflade",skift:"Farveskift",hab:"Voksested",slim:"Hat",pore:"Porer",net:"Stoknet",ribtype:"Folder",hul:"Stok"};


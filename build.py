"""Samler src/ til index.html og sw.js. Kun standardbiblioteket.

    python3 build.py

Rediger i src/, kør build, commit både src/ og index.html/sw.js.
"""
import json, hashlib, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
S = "src/"
rd = lambda f: open(S + f, encoding="utf-8").read()
PH = json.load(open(S + "photos.json", encoding="utf-8"))
data = ("const PH = " + json.dumps(PH, ensure_ascii=False, separators=(",", ":")).replace("},{", "},\n{") + ";\n"
        + rd("geo.js") + "\n" + rd("gastro.js"))
app = rd("data.js") + "\n" + rd("views.js") + "\n" + rd("app_tail.js")
html = rd("shell.html").replace("/*__CSS__*/", rd("app.css")).replace("/*__PHOTOS__*/", data).replace("/*__APP__*/", app)
open("index.html", "w", encoding="utf-8").write(html)
ver = hashlib.sha1(html.encode()).hexdigest()[:10]
open("sw.js", "w", encoding="utf-8").write(rd("sw.tpl.js").replace("__VER__", ver))
print("arter", len(PH), "fotos", sum(len(v) for v in PH.values()), "index", len(html.encode()) // 1024, "KB", "version", ver)

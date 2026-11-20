"""Subset Noto Sans SC to the characters used by index.html. Run: python -I build_font.py
Needs fonttools + brotli, and NotoSansSC-VF.ttf (path in SRC)."""
import re, sys, pathlib
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools import subset
SRC = r"D:\dev\company\03_公司本身\08_业务体系\海外方向_20261111\任务包_20261112\C1_产出\fonts\NotoSansSC-VF.ttf"
here = pathlib.Path(__file__).parent
text = (here/"index.html").read_text(encoding="utf-8")
chars = sorted({c for c in text if "\u2e80" <= c <= "\u9fff" or "\uff00" <= c <= "\uffef" or "\u3000" <= c <= "\u303f"} | set("，。？！：；、“”"))
print(len(chars), "".join(chars))
for w in (900, 500):
    f = TTFont(SRC)
    f = instantiateVariableFont(f, {"wght": w})
    opt = subset.Options(); opt.flavor = "woff2"; opt.layout_features = ["*"]
    s = subset.Subsetter(opt); s.populate(text="".join(chars)); s.subset(f)
    f.flavor = "woff2"; f.save(here/"fonts"/f"NotoSansSC-{w}.woff2")

# Check: every Chinese character on the page must be in both subsets (no tofu boxes).
bad = []
for w in (900, 500):
    cmap = TTFont(here/"fonts"/f"NotoSansSC-{w}.woff2").getBestCmap()
    miss = [c for c in chars if ord(c) not in cmap]
    if miss: bad.append((w, "".join(miss)))
if bad:
    sys.exit(f"MISSING GLYPHS: {bad}")
print("glyph check ok:", len(chars), "chars in both weights")

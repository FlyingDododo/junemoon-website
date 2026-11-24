(function(){
  var doc=document.documentElement;
  // The service name lives here. HTML carries the same word as no-JS fallback.
  var BRAND='Subtitled';
  document.title=BRAND+' by Junemoon';
  [].forEach.call(document.querySelectorAll('[data-brand]'),function(e){e.textContent=BRAND});

  // EN / 中文: swaps the explanation. The parents' words and their glosses stay as they are.
  var lang=document.getElementById('lang');
  function setLang(l){
    doc.setAttribute('data-lang',l);
    lang.setAttribute('aria-pressed',l==='zh'?'true':'false');
    try{localStorage.setItem('st-lang',l)}catch(e){}
    fit();
  }
  lang.setAttribute('aria-pressed',doc.getAttribute('data-lang')==='zh'?'true':'false');
  lang.addEventListener('click',function(){setLang(doc.getAttribute('data-lang')==='zh'?'en':'zh')});

  // Big lines fill the column width (data-fit = share of the width), never more than 2.2x the viewport height allows.
  var fits=document.querySelectorAll('[data-fit]');
  function fit(){
    [].forEach.call(fits,function(el){
      var box=el.parentNode.clientWidth-parseFloat(getComputedStyle(el.parentNode).paddingLeft)-parseFloat(getComputedStyle(el.parentNode).paddingRight);
      el.style.fontSize='100px';
      var w=el.scrollWidth||1;
      var size=Math.min(100*box*parseFloat(el.getAttribute('data-fit'))/w, innerHeight*0.42);
      el.style.fontSize=Math.max(32,Math.floor(size))+'px';
    });
  }
  fit();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
  var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(fit,80)});

  // Motion: once, when half in view. Off for reduced motion; no-JS shows everything.
  var still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!still&&'IntersectionObserver' in window){
    doc.classList.add('mv');
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting)return;
        var t=e.target;
        if(t.classList.contains('wall'))t.classList.add('in');
        else [].forEach.call(t.closest('.f').querySelectorAll('.ln'),function(l){l.classList.add('in')});
        io.unobserve(t);
      });
    },{threshold:.35});
    [].forEach.call(document.querySelectorAll('.f+.f'),function(s){
      var l=s.querySelector('.ln');
      if(l&&l.getBoundingClientRect().top>innerHeight){s.classList.add('rv');io.observe(l)}
    });
    var wall=document.querySelector('.wall');
    if(wall){if(wall.getBoundingClientRect().top<innerHeight)wall.classList.add('in');else io.observe(wall)}
  }

  // Month: dark squares show their sample title.
  var cal=document.getElementById('cal');
  if(cal){
    var zh=document.getElementById('ro-zh'),en=document.getElementById('ro-en');
    var btns=cal.querySelectorAll('button');
    function show(x){
      [].forEach.call(btns,function(o){o.setAttribute('aria-pressed',o===x?'true':'false')});
      zh.textContent=x.getAttribute('data-zh');en.textContent=x.getAttribute('data-en');
    }
    [].forEach.call(btns,function(x,i){
      x.setAttribute('aria-pressed',i===0?'true':'false');
      x.addEventListener('mouseenter',function(){show(x)});
      x.addEventListener('focus',function(){show(x)});
      x.addEventListener('click',function(){show(x)});
    });
  }
})();

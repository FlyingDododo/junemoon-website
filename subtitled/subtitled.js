(function(){
  // The service name lives here. HTML carries the same word as no-JS fallback.
  var BRAND='Subtitled';
  document.title=BRAND+' by Junemoon';
  [].forEach.call(document.querySelectorAll('[data-brand]'),function(e){e.textContent=BRAND});

  // 中 / EN: hide every English gloss for two seconds.
  var b=document.getElementById('lang'),h=document.getElementById('h1'),orig=h.textContent,t;
  b.addEventListener('click',function(){
    document.documentElement.classList.add('glossoff');
    h.textContent=h.getAttribute('data-alt');
    clearTimeout(t);
    t=setTimeout(function(){document.documentElement.classList.remove('glossoff');h.textContent=orig},2000);
  });

  // Screens 2-8: the Chinese line appears once when it is half in view, its English 200ms later.
  var still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!still&&'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting)return;
        [].forEach.call(e.target.closest('.screen').querySelectorAll('.ln'),function(l){l.classList.add('in')});
        io.unobserve(e.target);
      });
    },{threshold:.5});
    // only hide screens whose Chinese line is still below the fold
    [].forEach.call(document.querySelectorAll('.screen+.screen'),function(s){
      var l=s.querySelector('.ln');
      if(l&&l.getBoundingClientRect().top>innerHeight){s.classList.add('rv');io.observe(l)}
    });
  }

  // Screen 3: dark squares show their sample title.
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

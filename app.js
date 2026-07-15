
(function(){
  var C=window.NK_CONTENT; NK.buildMaps(C);
  document.getElementById('p-prehled').innerHTML=NK.renderPrehled(C);
  document.getElementById('p-harmonogram').innerHTML=NK.renderHarmonogram(C);
  document.getElementById('p-playbooky').innerHTML=NK.renderPlaybooky(C);
  var panels={prehled:'p-prehled',harmonogram:'p-harmonogram',playbooky:'p-playbooky',vystupy:'p-vystupy'};
  var tabs=[].slice.call(document.querySelectorAll('.tab'));
  function show(name){tabs.forEach(function(t){t.setAttribute('aria-selected',t.dataset.tab===name?'true':'false');});
    for(var k in panels)document.getElementById(panels[k]).classList.toggle('on',k===name);
    if(name==='vystupy')buildOutput();window.scrollTo(0,0);}
  tabs.forEach(function(t){t.addEventListener('click',function(){show(t.dataset.tab);});});
  document.addEventListener('click',function(e){var a=e.target.closest('a[href^="#"]');if(!a)return;
    var href=a.getAttribute('href');e.preventDefault();
    if(href==='#harmonogram'){show('harmonogram');return;}
    if(href==='#playbooky'){show('playbooky');return;}
    if(a.dataset.pb){show('playbooky');var el=document.getElementById('pb-'+a.dataset.pb);
      if(el)setTimeout(function(){el.scrollIntoView({behavior:'smooth',block:'start'});},60);}});
  [].forEach.call(document.querySelectorAll('.week-h'),function(h){h.addEventListener('click',function(){
    var open=h.getAttribute('aria-expanded')==='true';h.setAttribute('aria-expanded',!open);
    h.parentElement.querySelector('.week-body').hidden=open;});});
  var fields=[].slice.call(document.querySelectorAll('[data-k]'));
  fields.forEach(function(el){var key='nk-'+el.dataset.k;
    try{var v=localStorage.getItem(key);if(v!==null){if(el.type==='checkbox')el.checked=v==='1';else el.value=v;}}catch(e){}
    el.addEventListener(el.type==='checkbox'?'change':'input',function(){
      try{localStorage.setItem(key,el.type==='checkbox'?(el.checked?'1':'0'):el.value);}catch(e){}
      if(el.classList.contains('done-cb'))el.closest('.day').classList.toggle('done',el.checked);update();});
    if(el.classList.contains('done-cb'))el.closest('.day').classList.toggle('done',el.checked);});
  var doneCbs=[].slice.call(document.querySelectorAll('.done-cb'));
  function update(){var done=doneCbs.filter(function(c){return c.checked;}).length,tot=doneCbs.length;
    var pf=document.getElementById('pfill');if(pf)pf.style.width=(tot?Math.round(done/tot*100):0)+'%';
    var pn=document.getElementById('pnum');if(pn)pn.textContent=done;
    [].forEach.call(document.querySelectorAll('.week'),function(w){var cbs=[].slice.call(w.querySelectorAll('.done-cb'));
      var d=cbs.filter(function(c){return c.checked;}).length;var c=w.querySelector('.wk-count');if(c)c.textContent=d+'/'+c.dataset.total;});}
  update();
  function buildOutput(){var lines=['VÝSTUPY – NK Ivana ('+new Date().toLocaleDateString('cs-CZ')+')',''];
    [].forEach.call(document.querySelectorAll('.day'),function(d){var out=(d.querySelector('textarea')||{}).value||'';
      var done=(d.querySelector('.done-cb')||{}).checked;
      if(out.trim()||done){lines.push('• '+d.dataset.label+(done?'  [HOTOVO]':''));if(out.trim())lines.push('  '+out.trim().replace(/\n/g,'\n  '));lines.push('');}});
    if(lines.length<=2)lines.push('(zatím nic vyplněného)');document.getElementById('outbox').value=lines.join('\n');}
  var rf=document.getElementById('refresh');if(rf)rf.addEventListener('click',buildOutput);
  document.getElementById('copybtn').addEventListener('click',function(){buildOutput();var ta=document.getElementById('outbox');ta.select();
    navigator.clipboard.writeText(ta.value).then(toast,function(){document.execCommand('copy');toast();});});
  document.getElementById('dlbtn').addEventListener('click',function(){buildOutput();
    var b=new Blob([document.getElementById('outbox').value],{type:'text/plain'});var a=document.createElement('a');
    a.href=URL.createObjectURL(b);a.download='vystupy-ivana.txt';a.click();});
  var tEl;function toast(){var e=document.createElement('div');e.className='toast show';e.textContent='Zkopírováno ✓';
    document.body.appendChild(e);clearTimeout(tEl);tEl=setTimeout(function(){e.remove();},1800);}
})();

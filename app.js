
(function(){
  function boot(C){
  NK.buildMaps(C);
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
    if(a.target==='_blank')return;
    var href=a.getAttribute('href');e.preventDefault();
    if(href==='#harmonogram'){show('harmonogram');return;}
    if(href==='#playbooky'){show('playbooky');return;}
    if(a.dataset.pb){show('playbooky');var el=document.getElementById('pb-'+a.dataset.pb);
      if(el)setTimeout(function(){el.scrollIntoView({behavior:'smooth',block:'start'});},60);}});
  [].forEach.call(document.querySelectorAll('.week-h'),function(h){h.addEventListener('click',function(){
    var open=h.getAttribute('aria-expanded')==='true';h.setAttribute('aria-expanded',!open);
    h.parentElement.querySelector('.week-body').hidden=open;});});
  var fields=[].slice.call(document.querySelectorAll('[data-k]'));
  var timers={};
  function pushState(el){var k=el.dataset.k,val=el.type==='checkbox'?(el.checked?'1':'0'):el.value;
    try{localStorage.setItem('nk-'+k,val);}catch(e){}
    if(window.NKDB){if(el.type==='checkbox'){NKDB.setState(k,val);}
      else{clearTimeout(timers[k]);timers[k]=setTimeout(function(){NKDB.setState(k,val);},700);}}}
  fields.forEach(function(el){var key='nk-'+el.dataset.k;
    try{var v=localStorage.getItem(key);if(v!==null){if(el.type==='checkbox')el.checked=v==='1';else el.value=v;}}catch(e){}
    el.addEventListener(el.type==='checkbox'?'change':'input',function(){
      if(el.classList.contains('done-cb'))el.closest('.day').classList.toggle('done',el.checked);
      pushState(el);update();});
    if(el.classList.contains('done-cb'))el.closest('.day').classList.toggle('done',el.checked);});
  var doneCbs=[].slice.call(document.querySelectorAll('.done-cb'));
  function update(){var done=doneCbs.filter(function(c){return c.checked;}).length,tot=doneCbs.length;
    var pf=document.getElementById('pfill');if(pf)pf.style.width=(tot?Math.round(done/tot*100):0)+'%';
    var pn=document.getElementById('pnum');if(pn)pn.textContent=done;
    [].forEach.call(document.querySelectorAll('.week'),function(w){var cbs=[].slice.call(w.querySelectorAll('.done-cb'));
      var d=cbs.filter(function(c){return c.checked;}).length;var c=w.querySelector('.wk-count');if(c)c.textContent=d+'/'+c.dataset.total;});
    refreshLocks();refreshMilestones();}
  function refreshLocks(){if(!window.NK)return;C.playbooks.forEach(function(p){var lk=NK.pbLocked(C,p.unlock||0);
    var s=document.getElementById('pb-'+p.id);if(s)s.classList.toggle('locked',lk);
    var a=document.querySelector('.pbnav a[href="#pb-'+p.id+'"]');if(a)a.classList.toggle('locked',lk);});}
  function refreshMilestones(){if(!window.NK)return;var done=doneCbs.filter(function(c){return c.checked;}).length,tot=doneCbs.length;
    var pct=tot?Math.round(done/tot*100):0;var f=document.getElementById('ovfill');if(f)f.style.width=pct+'%';
    var pp=document.getElementById('ovpct');if(pp)pp.textContent=pct;var dd=document.getElementById('ovdays');if(dd)dd.textContent=done;
    var wd=NK.weeksDone(C);[].forEach.call(document.querySelectorAll('.mile'),function(m){m.classList.toggle('done',!!wd[+m.dataset.week]);});}
  function routeHash(){var h=location.hash;
    if(/^#pb-/.test(h)){show('playbooky');var el=document.getElementById(h.slice(1));
      if(el)setTimeout(function(){el.scrollIntoView({block:'start'});},90);}
    else if(h==='#harmonogram')show('harmonogram');else if(h==='#playbooky')show('playbooky');}
  window.addEventListener('hashchange',routeHash);
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
  update();routeHash();
  if(window.NKDB){NKDB.loadState().then(function(rows){if(!rows||!rows.length)return;
    rows.forEach(function(row){var el=document.querySelector('[data-k="'+row.k+'"]');if(!el)return;
      if(el.type==='checkbox'){el.checked=row.v==='1';if(el.classList.contains('done-cb'))el.closest('.day').classList.toggle('done',el.checked);}
      else el.value=row.v;
      try{localStorage.setItem('nk-'+row.k,row.v);}catch(e){}});
    update();});}
  // ---- INLINE EDITOR (aktivní jen s ?edit v URL) ----
  function applyEdit(path,val){var s=path.split('.');
    if(s[0]==='prehled')C.prehled[s[1]]=val;
    else if(s[0]==='pb'){if(s[2]==='md')C.playbooks[+s[1]].md=val;else C.playbooks[+s[1]][s[2]]=val;}
    else if(s[0]==='day'){var d=C.weeks[+s[1]].days[+s[2]];if(s[3]==='step')d.steps[+s[4]]=val;else d[s[3]]=val;}}
  function enableEdit(){document.body.classList.add('nk-edit');
    [].forEach.call(document.querySelectorAll('[data-edit]'),function(el){el.setAttribute('contenteditable','true');
      el.addEventListener('mousedown',function(e){e.stopPropagation();});
      el.addEventListener('click',function(e){e.stopPropagation();e.preventDefault();});
      el.addEventListener('input',function(){applyEdit(el.getAttribute('data-edit'),el.innerText.trim());});});
    [].forEach.call(document.querySelectorAll('[data-edit-md]'),function(el){var path=el.getAttribute('data-edit-md');
      var s=path.split('.');var md=(s[0]==='pb')?(C.playbooks[+s[1]].md||''):'';
      var ta=document.createElement('textarea');ta.className='nk-mdedit';ta.value=md;
      ta.addEventListener('input',function(){applyEdit(path,ta.value);ta.style.height='auto';ta.style.height=ta.scrollHeight+'px';});
      ta.addEventListener('mousedown',function(e){e.stopPropagation();});
      el.innerHTML='';el.appendChild(ta);ta.style.height=ta.scrollHeight+'px';});
    var bar=document.createElement('div');bar.id='nk-editbar';
    bar.innerHTML='<span>✏️ Režim úprav – klikni do textu a přepiš ho</span><button id="nk-pub">🚀 Publikovat</button>';
    document.body.appendChild(bar);
    document.getElementById('nk-pub').addEventListener('click',function(){var b=this;b.disabled=true;b.textContent='Publikuji…';
      NKDB.saveContent(C).then(function(ok){b.disabled=false;b.textContent='🚀 Publikovat';
        var t=document.createElement('div');t.className='toast show';t.textContent=ok?'✅ Publikováno! Web je aktualizovaný.':'❌ Chyba při publikaci';
        document.body.appendChild(t);setTimeout(function(){t.remove();},2600);});});}
  if(/[?&]edit/.test(location.search)&&window.NKDB)enableEdit();
  }
  var def=window.NK_CONTENT;
  if(window.NKDB&&NKDB.loadContent){NKDB.loadContent().then(function(d){boot(d||def);}).catch(function(){boot(def);});}
  else boot(def);
})();

(function(){
  var C=JSON.parse(JSON.stringify(window.NK_CONTENT));
  var root=document.getElementById('editor');
  function esc(s){return (s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

  function pbOptions(sel){
    return '<option value="">(žádný)</option>'+C.playbooks.map(function(p){
      return '<option value="'+p.id+'"'+(p.id===sel?' selected':'')+'>'+esc(p.title)+'</option>';}).join('');
  }
  function fld(label,kind,attrs,value,multiline){
    var a=Object.keys(attrs).map(function(k){return 'data-'+k+'="'+attrs[k]+'"';}).join(' ');
    var inp=multiline
      ? '<textarea data-kind="'+kind+'" '+a+' rows="'+(multiline===true?3:multiline)+'">'+esc(value)+'</textarea>'
      : '<input data-kind="'+kind+'" '+a+' value="'+esc(value)+'">';
    return '<div class="fld"><label>'+label+'</label>'+inp+'</div>';
  }
  function dayForm(d,wi,di){
    return '<div class="ed-day">'
      +'<div class="row">'+fld('Datum / den','day',{w:wi,d:di,field:'dow'},d.dow)
      +'<div style="flex:2">'+fld('Název dne','day',{w:wi,d:di,field:'title'},d.title)+'</div></div>'
      +fld('Cíl','day',{w:wi,d:di,field:'goal'},d.goal)
      +fld('Kroky (každý na nový řádek)','day',{w:wi,d:di,field:'steps'},(d.steps||[]).join('\n'),4)
      +'<div class="row">'+fld('Večer pošli','day',{w:wi,d:di,field:'deliver'},d.deliver)
      +'<div class="fld"><label>Playbook odkaz</label><select data-kind="day" data-w="'+wi+'" data-d="'+di+'" data-field="pb">'+pbOptions(d.pb)+'</select></div></div>'
      +'<div class="ed-actions"><button class="mini del" data-act="delday" data-w="'+wi+'" data-d="'+di+'">🗑 smazat den</button></div></div>';
  }
  function build(){
    var h='<details class="ed-sec" open><summary>🏠 Přehled (úvodní strana)</summary><div class="ed-body">';
    var p=C.prehled;
    h+=fld('Úvodní věta (lead)','prehled',{field:'lead'},p.lead,2)
      +fld('Highlight (💛 / 🎥)','prehled',{field:'highlight'},p.highlight,3)
      +fld('Deadline / nejdůležitější teď','prehled',{field:'deadline'},p.deadline,4)
      +fld('Strategie','prehled',{field:'strategie'},p.strategie,3)
      +fld('Nabídka','prehled',{field:'nabidka'},p.nabidka,3)
      +fld('Komu ANO','prehled',{field:'ano'},p.ano,2)
      +fld('Komu NE','prehled',{field:'ne'},p.ne,2)
      +fld('Pravidla','prehled',{field:'pravidla'},p.pravidla,5);
    h+='</div></details>';

    h+='<details class="ed-sec" open><summary>📅 Harmonogram (týdny a dny)</summary><div class="ed-body">';
    C.weeks.forEach(function(w,wi){
      h+='<div class="ed-week">'
       +fld('Název týdne','week',{w:wi,field:'name'},w.name)
       +fld('Podnadpis','week',{w:wi,field:'sub'},w.sub)
       +w.days.map(function(d,di){return dayForm(d,wi,di);}).join('')
       +'<div class="ed-actions"><button class="mini" data-act="addday" data-w="'+wi+'">➕ přidat den</button>'
       +'<button class="mini del" data-act="delweek" data-w="'+wi+'">🗑 smazat celý týden</button></div></div>';
    });
    h+='<div class="ed-actions"><button class="mini" data-act="addweek">➕ přidat týden</button></div></div></details>';

    h+='<details class="ed-sec"><summary>📚 Playbooky</summary><div class="ed-body">';
    C.playbooks.forEach(function(pb,i){
      h+='<div class="ed-day">'
       +fld('Nadpis (s emoji)','pb',{i:i,field:'title'},pb.title)
       +fld('Obsah (Markdown)','pb',{i:i,field:'md'},pb.md,10)
       +'<div class="ed-actions"><button class="mini del" data-act="delpb" data-i="'+i+'">🗑 smazat playbook</button></div></div>';
    });
    h+='<div class="ed-actions"><button class="mini" data-act="addpb">➕ přidat playbook</button></div></div></details>';
    root.innerHTML=h;
  }

  root.addEventListener('input',onEdit);
  root.addEventListener('change',onEdit);
  function onEdit(e){
    var el=e.target,k=el.dataset.kind; if(!k)return;
    if(k==='prehled')C.prehled[el.dataset.field]=el.value;
    else if(k==='week')C.weeks[+el.dataset.w][el.dataset.field]=el.value;
    else if(k==='day'){var d=C.weeks[+el.dataset.w].days[+el.dataset.d];
      if(el.dataset.field==='steps')d.steps=el.value.split('\n').map(function(s){return s.trim();}).filter(Boolean);
      else d[el.dataset.field]=el.value;}
    else if(k==='pb')C.playbooks[+el.dataset.i][el.dataset.field]=el.value;
  }
  root.addEventListener('click',function(e){
    var b=e.target.closest('[data-act]'); if(!b)return;
    var a=b.dataset.act,w=+b.dataset.w,d=+b.dataset.d,i=+b.dataset.i;
    if(a==='addday')C.weeks[w].days.push({id:'d'+Date.now(),dow:'',title:'Nový den',goal:'',steps:[],deliver:'',pb:''});
    else if(a==='delday'){if(!confirm('Smazat tento den?'))return;C.weeks[w].days.splice(d,1);}
    else if(a==='addweek')C.weeks.push({name:'Nový týden',sub:'',days:[]});
    else if(a==='delweek'){if(!confirm('Smazat celý týden i s dny?'))return;C.weeks.splice(w,1);}
    else if(a==='addpb')C.playbooks.push({id:'pb'+Date.now(),title:'✨ Nový playbook',md:'> Popis…'});
    else if(a==='delpb'){if(!confirm('Smazat playbook?'))return;C.playbooks.splice(i,1);}
    else return;
    build();
  });

  // toolbar
  function contentJs(){return 'window.NK_LOGO='+JSON.stringify(window.NK_LOGO)+';\nwindow.NK_CONTENT='+JSON.stringify(C)+';\n';}
  document.getElementById('downloadBtn').addEventListener('click',function(){
    var b=this;
    if(!window.NKDB){toast('Chybí připojení k databázi');return;}
    b.disabled=true;var orig=b.textContent;b.textContent='Publikuji…';
    NKDB.saveContent(C).then(function(ok){b.disabled=false;b.textContent=orig;
      toast(ok?'✅ Publikováno! Web je aktualizovaný.':'❌ Chyba při publikaci');});
  });
  var dj=document.getElementById('downloadJson');
  if(dj)dj.addEventListener('click',function(){
    var bl=new Blob([contentJs()],{type:'text/javascript'});var a=document.createElement('a');
    a.href=URL.createObjectURL(bl);a.download='content.js';a.click();toast('Staženo (záloha)');
  });
  document.getElementById('copyBtn').addEventListener('click',function(){
    navigator.clipboard.writeText(JSON.stringify(C,null,2)).then(function(){toast('JSON zkopírován');});
  });
  document.getElementById('resetBtn').addEventListener('click',function(){
    if(!confirm('Zahodit všechny neuložené změny?'))return;
    C=JSON.parse(JSON.stringify(window.NK_CONTENT));build();toast('Změny zahozeny');
  });
  var prev=document.getElementById('prev');
  document.getElementById('previewBtn').addEventListener('click',function(){
    NK.buildMaps(C);
    document.getElementById('prevBody').innerHTML=
      '<div class="wrap">'+NK.renderPrehled(C)+'</div><hr style="margin:24px 0;border:none;border-top:1px solid var(--line)">'
      +'<div class="wrap">'+NK.renderHarmonogram(C)+'</div><hr style="margin:24px 0;border:none;border-top:1px solid var(--line)">'
      +'<div class="wrap">'+NK.renderPlaybooky(C)+'</div>';
    if(prev.showModal)prev.showModal(); else prev.setAttribute('open','');
  });
  document.getElementById('prevClose').addEventListener('click',function(){prev.close?prev.close():prev.removeAttribute('open');});

  var tEl;function toast(m){var e=document.createElement('div');e.className='toast show';e.textContent=m;
    document.body.appendChild(e);clearTimeout(tEl);tEl=setTimeout(function(){e.remove();},2200);}
  build();
  // načti aktuální publikovaný obsah z databáze (ať edituješ to, co je živé)
  if(window.NKDB&&NKDB.loadContent){NKDB.loadContent().then(function(d){if(d){C=JSON.parse(JSON.stringify(d));build();}});}
})();

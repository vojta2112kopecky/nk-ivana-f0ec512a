
window.NK={};
NK.esc=function(s){return (s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
NK.inline=function(t){
  t=NK.esc(t);
  t=t.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
  t=t.replace(/(^|[^\*])\*([^\*]+?)\*/g,'$1<i>$2</i>');
  t=t.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
  return t;
};
NK.md=function(md){
  var out=[],lines=(md||'').split('\n'),i=0;
  function flush(tag,buf){if(buf.length)out.push('<'+tag+'>'+buf.join('')+'</'+tag+'>');}
  while(i<lines.length){
    var ln=lines[i];
    if(/^!btn /.test(ln)){var m=ln.slice(5).match(/\[([^\]]+)\]\(([^)]+)\)/);
      if(m)out.push('<a class="btn" href="'+m[2]+'" target="_blank" rel="noopener">'+NK.esc(m[1])+'</a>');i++;continue;}
    if(/^####\s+/.test(ln)){out.push('<h4>'+NK.inline(ln.replace(/^####\s+/,''))+'</h4>');i++;continue;}
    if(/^###\s+/.test(ln)){out.push('<p class="qh"><b>'+NK.inline(ln.replace(/^###\s+/,''))+'</b></p>');i++;continue;}
    if(/^>\s?/.test(ln)){var b=[];while(i<lines.length&&/^>\s?/.test(lines[i])){b.push(NK.inline(lines[i].replace(/^>\s?/,'')));i++;}
      out.push('<div class="callout">'+b.join('<br>')+'</div>');continue;}
    if(/^-\s+/.test(ln)){var b=[];while(i<lines.length&&/^-\s+/.test(lines[i])){b.push('<li>'+NK.inline(lines[i].replace(/^-\s+/,''))+'</li>');i++;}flush('ul',b);continue;}
    if(/^\d+\.\s+/.test(ln)){var b=[];while(i<lines.length&&/^\d+\.\s+/.test(lines[i])){b.push('<li>'+NK.inline(lines[i].replace(/^\d+\.\s+/,''))+'</li>');i++;}flush('ol',b);continue;}
    if(ln.trim()===''){i++;continue;}
    out.push('<p>'+NK.inline(ln)+'</p>');i++;
  }
  return out.join('');
};
NK.renderPrehled=function(C){var p=C.prehled;
  return '<img class="hero-logo" src="'+window.NK_LOGO+'" alt="NK">'
   +'<p class="eyebrow">Akční plán · service delivery</p>'
   +'<h1>Ivano, tady je celá tvoje cesta.</h1>'
   +'<p class="lead">'+NK.inline(p.lead)+'</p>'
   +'<div class="callout">'+NK.md(p.highlight).replace(/^<p>|<\/p>$/g,'').replace(/<\/p><p>/g,'<br>')+'</div>'
   +'<h2>🔥 Nejdůležitější teď (do čtvrtka 23. 7.)</h2><div class="card">'+NK.md(p.deadline)+'</div>'
   +'<h2>🗺️ Kde co najdeš</h2><div class="tiles">'
   +'<a class="tile" href="#harmonogram"><b>📅 Harmonogram</b><span>Co dělat každý den + odškrtávání</span></a>'
   +'<a class="tile" href="#playbooky"><b>📚 Playbooky</b><span>Jak na každou věc + šablony</span></a>'
   +'<a class="tile" href="'+C.sheet+'" target="_blank" rel="noopener"><b>📇 Databáze</b><span>Kontakty a nahrávky z hovorů</span></a></div>'
   +'<p class="muted" style="font-size:12.5px;margin-top:6px">Tvoje odškrtání a výstupy se ukládají samy do tvého prohlížeče.</p>'
   +'<h2>🎯 Strategie a nabídka</h2><div class="card">'+NK.md(p.strategie)+'</div>'
   +'<div class="callout">'+NK.md(p.nabidka).replace(/^<p>|<\/p>$/g,'')+'</div>'
   +'<div class="grid2"><div class="card"><b>✅ Komu ANO</b><br>'+NK.inline(p.ano)+'</div>'
   +'<div class="card"><b>⛔ Komu NE</b><br>'+NK.inline(p.ne)+'</div></div>'
   +'<h2>🤝 Pravidla</h2><div class="card">'+NK.md(p.pravidla)+'</div>';
};
NK.renderHarmonogram=function(C){
  var tot=0;C.weeks.forEach(function(w){tot+=w.days.length;});
  var h='<p class="eyebrow">Todolist</p><h1>Harmonogram</h1>'
   +'<p class="lead">Každý den ≈ 2 hodiny. Odškrtávej si kroky, k výstupu vždy vlož odkaz. Večer pošli Vojtovi (záložka Výstupy).</p>'
   +'<div class="progress"><div class="pmeta"><span>Hotové dny</span><span><b id="pnum">0</b> / <b id="ptot">'+tot+'</b></span></div><div class="pbar"><i id="pfill"></i></div></div>';
  C.weeks.forEach(function(w,wi){
    h+='<section class="week"><button class="week-h" aria-expanded="'+(wi===0?'true':'false')+'">'
     +'<span><span class="week-name">'+NK.esc(w.name)+'</span><span class="week-sub">'+NK.esc(w.sub)+'</span></span>'
     +'<span class="week-meta"><span class="wk-count" data-total="'+w.days.length+'">0/'+w.days.length+'</span><span class="chev">▾</span></span></button>'
     +'<div class="week-body"'+(wi===0?'':' hidden')+'>';
    w.days.forEach(function(d){
      var pb=d.pb?(' <a class="pblink" href="#pb-'+d.pb+'" data-pb="'+d.pb+'">📚 '+NK.esc((C.pbmap||{})[d.pb]||'Playbook')+'</a>'):'';
      var steps=d.steps.map(function(s,i){return '<li><label class="chk"><input type="checkbox" data-k="'+d.id+'-s'+i+'"><span>'+NK.esc(s)+'</span></label></li>';}).join('');
      h+='<article class="day" data-label="'+NK.esc(d.dow+' – '+d.title)+'"><div class="day-top">'
       +'<span class="dow">'+NK.esc(d.dow)+'</span><h3 class="day-title">'+NK.esc(d.title)+'</h3>'
       +'<label class="donepill"><input type="checkbox" class="done-cb" data-k="'+d.id+'-done"><span>Hotovo</span></label></div>'
       +'<p class="goal"><span class="k">Cíl</span> '+NK.esc(d.goal)+pb+'</p><ul class="steps">'+steps+'</ul>'
       +'<div class="outwrap"><label class="lbl">Můj výstup / odkazy</label>'
       +'<textarea class="out" data-k="'+d.id+'-out" rows="2" placeholder="Sem napiš, cos udělala, a vlož odkazy…"></textarea>'
       +'<p class="deliver">📤 Večer pošli: '+NK.esc(d.deliver)+'</p></div></article>';
    });
    h+='</div></section>';
  });
  return h;
};
NK.renderPlaybooky=function(C){
  var nav=C.playbooks.map(function(p){return '<a href="#pb-'+p.id+'" data-pb="'+p.id+'">'+NK.esc(p.title.replace(/^[^ ]+ /,''))+'</a>';}).join('');
  var secs=C.playbooks.map(function(p){return '<section class="pb" id="pb-'+p.id+'"><h3 class="pb-h">'+NK.esc(p.title)+'</h3>'+NK.md(p.md)+'</section>';}).join('');
  return '<p class="eyebrow">Jak na to + šablony</p><h1>Playbooky</h1>'
   +'<p class="lead">Ke každé fázi trychtýře: účel, přesný postup a šablony. Klikni na téma nebo skroluj.</p>'
   +'<div class="pbnav">'+nav+'</div>'+secs;
};
NK.buildMaps=function(C){C.pbmap={};C.playbooks.forEach(function(p){C.pbmap[p.id]=p.title.replace(/^[^ ]+ /,'');});C.sheet="https://docs.google.com/spreadsheets/d/1ofap4TRpJXR7ZSdBqVdz7DmuTm1pM5_VWWlu263_2bA/edit";};

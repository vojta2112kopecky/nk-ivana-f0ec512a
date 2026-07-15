
window.NKDB=(function(){
  var S=window.NK_SUPA||{}; if(!S.url){return null;}
  var H={apikey:S.key,Authorization:'Bearer '+S.key,'Content-Type':'application/json'};
  function up(h){var o={};for(var k in H)o[k]=H[k];for(var k in h)o[k]=h[k];return o;}
  return {
    loadContent:function(){return fetch(S.url+'/rest/v1/nk_content?id=eq.main&select=data',{headers:H})
      .then(function(r){return r.ok?r.json():[];}).then(function(a){return a[0]?a[0].data:null;}).catch(function(){return null;});},
    saveContent:function(data){return fetch(S.url+'/rest/v1/nk_content?on_conflict=id',
      {method:'POST',headers:up({Prefer:'resolution=merge-duplicates,return=minimal'}),
       body:JSON.stringify({id:'main',data:data,updated_at:new Date().toISOString()})}).then(function(r){return r.ok;}).catch(function(){return false;});},
    loadState:function(){return fetch(S.url+'/rest/v1/nk_state?select=k,v',{headers:H})
      .then(function(r){return r.ok?r.json():[];}).catch(function(){return [];});},
    setState:function(k,v){return fetch(S.url+'/rest/v1/nk_state?on_conflict=k',
      {method:'POST',headers:up({Prefer:'resolution=merge-duplicates,return=minimal'}),
       body:JSON.stringify({k:k,v:v,updated_at:new Date().toISOString()})}).catch(function(){});}
  };
})();

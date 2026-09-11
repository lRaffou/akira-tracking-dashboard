const choose = document.getElementById('history-scenario');
const message = document.getElementById('connection');
let activeHistory = 0;
const formatValue = n => n == null ? '—' : new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2}).format(n);
async function getJSON(url) {if(url==='/api/benchmark')return LocalTracker.snapshot();if(url==='/api/status')return LocalTracker.state;return LocalTracker.history(new URL(url,'https://local.invalid').searchParams.get('scenario'));}
async function refresh(){
  try{
    const [next,status]=await Promise.all([getJSON('/api/benchmark'),getJSON('/api/status')]);
    Object.assign(window.BENCHMARK_DATA,next);
    window.render();
    document.querySelectorAll('.score').forEach(input=>{input.readOnly=true;input.title='Meilleur score : maximum du record de référence et des runs importés';});
    document.getElementById('status').textContent='Records de référence inclus. Les graphiques utilisent uniquement les runs importés.';
    message.textContent=status.state+' · '+next.run_count+' runs'+(status.last_scan?' · contrôle à '+status.last_scan:'')+(status.errors?.length?' · '+status.errors.length+' fichier(s) à vérifier : '+status.errors[0]:'');
    await updateInsights();
    highlightRecords();
    await history();
  }catch(e){message.textContent='Lecture locale interrompue : ' + e.message + '';}
}

let refreshBusy=false;
async function cycle(){if(refreshBusy)return;refreshBusy=true;try{await LocalTracker.scan();}finally{refreshBusy=false;}}
function feedback(e){if(e.name!=='AbortError')message.textContent='Impossible de continuer : '+e.message;}
(async()=>{
  try{
    await LocalTracker.init();
    window.BENCHMARK_DATA=await LocalTracker.snapshot();
    for(const c of window.BENCHMARK_DATA.categories)for(const s of c.scenarios){const o=document.createElement('option');o.value=o.textContent=s.name;choose.append(o);}
    const script=document.createElement('script');script.src='app.js';script.onload=async()=>{
      choose.addEventListener('change',()=>history().catch(feedback));
      document.getElementById('folder').disabled=!('showDirectoryPicker' in window);
      document.getElementById('resume').disabled=!('showDirectoryPicker' in window);
      document.getElementById('backup').disabled=false;document.getElementById('restore').disabled=false;
      await refresh();setInterval(cycle,5000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)cycle();});
      if(!('showDirectoryPicker' in window))message.textContent='Ouvre cette page dans Chrome sur ordinateur pour connecter le dossier Stats.';
    };document.head.append(script);
  }catch(e){message.textContent='Stockage Chrome indisponible : '+e.message;}
})();
document.getElementById('folder').onclick=()=>LocalTracker.select().then(refresh).catch(feedback);
document.getElementById('resume').onclick=()=>LocalTracker.resume().then(refresh).catch(feedback);
document.getElementById('refresh-tables').onclick=async()=>{const button=document.getElementById('refresh-tables');button.disabled=true;button.textContent='Actualisation…';try{await LocalTracker.scan();await refresh();document.getElementById('status').textContent='Tableaux actualisés à '+formatRunDate(new Date())+'.';}catch(e){feedback(e);}finally{button.disabled=false;button.textContent='Actualiser les tableaux ↻';}};
document.getElementById('backup').onclick=async()=>{try{const value=await LocalTracker.backup(),url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='akira-historique-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){feedback(e);}};
document.getElementById('restore').onclick=()=>document.getElementById('restore-file').click();
document.getElementById('restore-file').onchange=async event=>{try{const file=event.target.files[0];if(!file)return;await LocalTracker.restore(JSON.parse(await file.text()));await refresh();message.textContent='Historique restauré. Les runs identiques sont fusionnés.';}catch(e){feedback(e);}finally{event.target.value='';}};

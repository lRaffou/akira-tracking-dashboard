/* Dates displayed locally; stored timestamps retain their original format. */
window.formatRunDate=function(value){
 const date=value instanceof Date?value:new Date(value);
 if(!Number.isFinite(date.getTime()))return '—';
 const pad=n=>String(n).padStart(2,'0');
 return pad(date.getDate())+'-'+pad(date.getMonth()+1)+'-'+date.getFullYear()+' '+pad(date.getHours())+'h'+pad(date.getMinutes());
};
/* Everything stays in Chrome. No network request, no write access to game files. */
window.LocalTracker = (() => {
  let db, directory = null, busy = false, enabled = false;
  const observed = new Map();
  const names = new Map(window.BENCHMARK_DATA.categories.flatMap(c => c.scenarios).map(s => [s.name.toLowerCase(), s.name]));
  const baseline = structuredClone(window.BENCHMARK_DATA);
  const state = {state:'Choisis le dossier Stats pour commencer.', errors:[]};
  function open() {
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open('akira-tracking-chrome-v1',1);
      req.onupgradeneeded=()=>{req.result.createObjectStore('runs',{keyPath:'run_key'});req.result.createObjectStore('meta');};
      req.onsuccess=()=>{db=req.result;resolve();};req.onerror=()=>reject(req.error);
    });
  }
  function read(store,key) {
    return new Promise((resolve,reject)=>{const req=db.transaction(store).objectStore(store).get(key);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
  }
  function all() {
    return new Promise((resolve,reject)=>{const req=db.transaction('runs').objectStore('runs').getAll();req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
  }
  function write(store,value,key) {
    return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');const target=tx.objectStore(store);key===undefined?target.put(value):target.put(value,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Enregistrement interrompu'));});
  }
  function csvLine(line) {
    const cells=[];let value='',quoted=false;
    for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(quoted&&line[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}else if(ch===','&&!quoted){cells.push(value);value='';}else value+=ch;}
    cells.push(value);return cells;
  }
  function parse(name,text) {
    const m=name.match(/^(.+) - Challenge - (\d{4})\.(\d{2})\.(\d{2})-(\d{2})\.(\d{2})\.(\d{2}) Stats\.csv$/i);
    if(!m||!names.has(m[1].toLowerCase()))return null;
    if(!/[\r\n]$/.test(text))throw Error('Fichier en cours d’écriture ou incomplet');
    const fields={};for(const line of text.replace(/^\uFEFF/,'').split(/\r?\n/)){const row=csvLine(line);if(row.length>=2&&row[0].trim().endsWith(':'))fields[row[0].trim().slice(0,-1)]=row[1].trim();}
    if(fields.Scenario?.toLowerCase()!==m[1].toLowerCase())throw Error('Scénario absent ou incohérent');
    function number(key,required=false){const raw=fields[key];if(raw===undefined||raw===''){if(required)throw Error('Champ manquant : '+key);return null;}const v=Number(raw.replace(',','.'));if(!Number.isFinite(v)||v<0)throw Error('Nombre invalide : '+key);return v;}
    const scenario=names.get(m[1].toLowerCase()),played_at=`${m[2]}-${m[3]}-${m[4]}T${m[5]}:${m[6]}:${m[7]}`;
    const date=new Date(played_at+'Z');if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,19)!==played_at)throw Error('Date invalide');
    const hits=number('Hit Count'),misses=number('Miss Count');
    return {run_key:scenario+'|'+played_at,scenario,played_at,score:number('Score',true),accuracy:hits!==null&&misses!==null&&hits+misses>0?100*hits/(hits+misses):null,hits,misses,damage:number('Damage Done'),source:name};
  }
  async function scan() {
    if(busy||!enabled||!directory)return;
    busy=true;
    try {
      if(await directory.queryPermission({mode:'read'})!=='granted'){enabled=false;state.state='Accès à réautoriser : clique sur Reprendre le suivi.';return;}
      const errors=[];let matching=0;
      for await (const [name,handle] of directory.entries()) {
        if(handle.kind!=='file'||!name.endsWith('Stats.csv')||!names.has(name.split(' - Challenge - ')[0].toLowerCase()))continue;
        matching++;
        try {
          const file=await handle.getFile(),sig=file.size+':'+file.lastModified,old=observed.get(name);
          if(!old||old.sig!==sig){observed.set(name,{sig,since:Date.now(),done:false});continue;}
          if(old.done||Date.now()-old.since<2500)continue;
          const buffer=await file.arrayBuffer();let text;
          try{text=new TextDecoder('utf-8',{fatal:true}).decode(buffer);}catch{text=new TextDecoder('windows-1252').decode(buffer);}
          const after=await handle.getFile();if(after.size!==file.size||after.lastModified!==file.lastModified)continue;
          const run=parse(name,text);if(run)await write('runs',run);old.done=true;
        }catch(e){errors.push(name+' : '+e.message);}
      }
      state.state=matching?'Suivi actif · dossier '+directory.name:'Aucun CSV du benchmark trouvé. Vérifie que tu as sélectionné le dossier stats.';
      state.last_scan=formatRunDate(new Date());state.errors=errors.slice(0,5);
    }catch(e){state.state='Lecture interrompue : '+e.message;state.errors=[e.message];}
    finally{busy=false;}
  }
  async function select() {
    // Must be called directly from a user gesture, before other asynchronous work.
    const selected=await window.showDirectoryPicker({id:'akira-kovaaks-stats',mode:'read'});
    if(busy)throw Error('Un contrôle est en cours. Réessaie dans quelques secondes.');
    directory=selected;observed.clear();
    try{await write('meta',directory,'directory');}catch{state.errors=['Chrome ne peut pas mémoriser ce dossier : sélectionne-le de nouveau à la prochaine ouverture.'];}
    enabled=true;state.state='Dossier sélectionné. Première lecture dans quelques secondes…';await scan();
  }
  async function resume() {
    if(!directory)return select();
    if(await directory.requestPermission({mode:'read'})==='granted'){enabled=true;await scan();}else{state.state='Accès refusé. Ton historique enregistré reste disponible.';}
  }
  async function init() {
    await open();directory=await read('meta','directory');
    if(directory){if(await directory.queryPermission({mode:'read'})==='granted'){enabled=true;await scan();}else state.state='Dossier mémorisé. Clique sur Reprendre le suivi pour autoriser sa lecture.';}
  }
  async function snapshot() {
    const result=structuredClone(baseline),runs=await all();result.run_count=runs.length;
    const maxima=new Map();for(const r of runs)maxima.set(r.scenario,Math.max(maxima.get(r.scenario)||0,r.score));
    for(const c of result.categories)for(const s of c.scenarios){s.reference_score=s.score;s.score=Math.max(s.score,maxima.get(s.name)||0);}
    return result;
  }
  async function history(name){return (await all()).filter(r=>r.scenario===name).sort((a,b)=>a.played_at.localeCompare(b.played_at));}
  async function backup(){return {version:1,exported_at:new Date().toISOString(),runs:await all()};}
  async function restore(value){
    if(value.version!==1||!Array.isArray(value.runs))throw Error('Sauvegarde non reconnue');
    for(const r of value.runs){if(!r||!names.has(String(r.scenario).toLowerCase())||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(r.played_at)||r.run_key!==r.scenario+'|'+r.played_at||typeof r.score!=='number'||!Number.isFinite(r.score)||r.score<0)throw Error('Run invalide');for(const k of ['accuracy','hits','misses','damage'])if(r[k]!=null&&(typeof r[k]!=='number'||!Number.isFinite(r[k])||r[k]<0||(k==='accuracy'&&r[k]>100)))throw Error('Métrique invalide');}
    await new Promise((resolve,reject)=>{const tx=db.transaction('runs','readwrite');for(const r of value.runs)tx.objectStore('runs').put(r);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});
  }
  return {init,select,resume,scan,snapshot,history,backup,restore,parse,state};
})();

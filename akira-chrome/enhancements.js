const ui = (tag,text,cls) => {const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const rankNames=['Non classé','Bronze','Silver','Gold','Platinum','Diamond'];
let analyticsRuns=[];
let historyLimit=100;
const controls=ui('div',undefined,'analytics-controls');
function selectControl(id,label,options,parent=controls){const wrap=ui('label',label+' '),select=ui('select');select.id=id;options.forEach(([v,t])=>{const o=ui('option',t);o.value=v;select.append(o)});wrap.append(select);parent.append(wrap);return select;}
const categories=window.BENCHMARK_DATA.categories;
const categoryFilter=selectControl('category-filter','Catégorie',[['','Toutes'],...categories.map(c=>[c.name,c.name])]);
const rankFilter=selectControl('rank-filter','Rang du run',[['','Tous'],...rankNames.map((r,i)=>[String(i),r])]);
const period=selectControl('period','Période',[['7','7 jours'],['30','30 jours'],['all','Tout']]);period.value='all';
const metric=selectControl('metric','Graphique',[['score','Score'],['accuracy','Accuracy (%)']]);
document.querySelector('#history h2').after(controls);
const session=ui('section',undefined,'session-panel');session.append(ui('h2','Tes objectifs de session'),ui('p','Les trois prochains rangs les plus proches, selon la part du palier restant.'));session.append(ui('div',undefined,'objective-grid'));document.querySelector('.section-title').before(session);
const weekly=ui('section',undefined,'weekly-panel');weekly.append(ui('h2','Ton bilan hebdomadaire'),ui('p','7 derniers jours contre les 7 jours précédents. Moyennes comparées par scénario, sans mélanger les échelles de score.'));weekly.append(ui('div',undefined,'weekly-content'));session.after(weekly);
const density=selectControl('density','Affichage',[['compact','Compact'],['airy','Aéré']],document.querySelector('.section-title'));
try{density.value=localStorage.getItem('akira-density')||'compact';}catch{}
function setDensity(){document.body.classList.toggle('airy',density.value==='airy');try{localStorage.setItem('akira-density',density.value);}catch{}}
density.onchange=setDensity;setDensity();
const more=ui('button','Afficher 100 runs de plus');more.id='history-more';document.querySelector('.history-scroll').after(more);more.onclick=()=>{historyLimit+=100;history();};
function scenarioMap(){return new Map(window.BENCHMARK_DATA.categories.flatMap(c=>c.scenarios.map(s=>[s.name,{...s,category:c.name}])));}
function runRank(r,s){return s.thresholds.filter(t=>r.score>=t).length;}
function weeklySummary(runs,now=new Date()){
 const end=now.getTime(),day=86400000,start=end-7*day,previous=start-7*day;
 const recent=runs.filter(r=>{const t=new Date(r.played_at).getTime();return t>=start&&t<=end;}),older=runs.filter(r=>{const t=new Date(r.played_at).getTime();return t>=previous&&t<start;});
 const best=new Map(),records={recent:0,older:0};
 for(const r of [...runs].sort((a,b)=>a.played_at.localeCompare(b.played_at))){const t=new Date(r.played_at).getTime();if(t>end)continue;const old=best.get(r.scenario);if(old!==undefined&&r.score>old){if(t>=start)records.recent++;else if(t>=previous)records.older++;}best.set(r.scenario,Math.max(old??0,r.score));}
 return {recent,older,records};
}
async function updateInsights(){
 analyticsRuns=(await LocalTracker.backup()).runs;
 const map=scenarioMap(),grid=session.querySelector('.objective-grid');grid.replaceChildren();
 const objectives=[...map.values()].map(s=>{const p=points(s.score,s.thresholds),r=Math.floor(p);return {...s,p,r,remaining:r===5?Infinity:1-(p-r)};}).filter(s=>s.r<5).sort((a,b)=>a.remaining-b.remaining).slice(0,3);
 if(!objectives.length)grid.append(ui('p','Diamond atteint sur les 12 scénarios !'));
 objectives.forEach(s=>{const card=ui('article',undefined,'objective');card.append(ui('h3',s.name),ui('p',rankNames[s.r]+' → '+rankNames[s.r+1]),ui('strong','Objectif : '+formatValue(s.thresholds[s.r])),ui('p','Encore '+formatValue(s.thresholds[s.r]-s.score)+' points · '+Math.round(s.remaining*100)+' % du palier'));const b=ui('button','Voir mon évolution');b.onclick=()=>openScenarioStats(s.name);card.append(b);grid.append(card);});
 const w=weeklySummary(analyticsRuns),box=weekly.querySelector('.weekly-content');box.replaceChildren();
 box.append(ui('p',`${w.recent.length} runs ces 7 derniers jours · ${w.older.length} la période précédente. Records battus : ${w.records.recent} contre ${w.records.older}.`));
 box.append(ui('p','Records calculés parmi les runs importés ; le premier run d’un scénario ne compte pas comme un record battu.','muted'));
 const table=ui('table'),head=ui('tr');['Scénario','Moyenne actuelle','Moyenne précédente','Évolution'].forEach(t=>head.append(ui('th',t)));const thead=ui('thead');thead.append(head);table.append(thead);const body=ui('tbody');
 for(const [name] of map){const a=w.recent.filter(r=>r.scenario===name),b=w.older.filter(r=>r.scenario===name);if(!a.length&&!b.length)continue;const avg=x=>x.length?x.reduce((n,r)=>n+r.score,0)/x.length:null;const av=avg(a),bv=avg(b),delta=av!==null&&bv!==null&&bv>0?(av-bv)/bv*100:null;const row=ui('tr');[name,formatValue(av)+(a.length?' ('+a.length+' runs)':''),formatValue(bv)+(b.length?' ('+b.length+' runs)':''),delta===null?'Comparaison indisponible':(delta>=0?'+':'')+formatValue(delta)+' %'].forEach(t=>row.append(ui('td',t)));body.append(row);}
 table.append(body);if(body.children.length){const wrap=ui('div',undefined,'history-scroll');wrap.append(table);box.append(wrap);}else box.append(ui('p','Aucun run sur ces deux périodes. Ton bilan apparaîtra après tes prochaines sessions.'));
 document.querySelectorAll('.scenario-row').forEach((row,i)=>{const s=[...map.values()][i],name=row.querySelector('.scenario-cell');const meta=ui('div',undefined,'score-origin');meta.append(badge(points(s.score,s.thresholds)));name.append(meta);});
 const latest=[...analyticsRuns].sort((a,b)=>b.played_at.localeCompare(a.played_at))[0];const info=document.getElementById('last-result')||ui('p');info.id='last-result';info.textContent=latest?'Dernier run disponible : '+latest.scenario+' · '+formatValue(latest.score)+' · '+formatRunDate(latest.played_at):'Aucun run importé pour le moment.';document.querySelector('.folder-panel').append(info);
 document.querySelector('.folder-panel').dataset.attention=/réautoriser|autoriser|refus|interromp|Choisis|mémorisé/.test(LocalTracker.state.state)?'true':'false';
}
function fillScenarios(selected){const old=selected||choose.value;choose.replaceChildren();for(const c of window.BENCHMARK_DATA.categories)if(!categoryFilter.value||categoryFilter.value===c.name)for(const s of c.scenarios){const o=ui('option',s.name);o.value=s.name;choose.append(o);}if([...choose.options].some(o=>o.value===old))choose.value=old;}
categoryFilter.onchange=()=>{fillScenarios();historyLimit=100;history();};[rankFilter,period,metric].forEach(c=>c.onchange=()=>{historyLimit=100;history();});
async function history(){
 const ticket=++activeHistory,all=await LocalTracker.history(choose.value);if(ticket!==activeHistory)return;
 const s=scenarioMap().get(choose.value);if(!s)return;
 document.querySelector('#history h2').textContent='Évolution · '+s.name;
 const cutoff=period.value==='all'?-Infinity:Date.now()-Number(period.value)*86400000;
 const rows=all.filter(r=>new Date(r.played_at).getTime()>=cutoff&&(rankFilter.value===''||runRank(r,s)===Number(rankFilter.value)));
 window.renderStatsSummary?.(s,rows);
 document.getElementById('history-count').textContent=rows.length+' runs filtrés · '+all.length+' au total pour ce scénario';
 const svg=document.getElementById('chart');svg.replaceChildren();const ns='http://www.w3.org/2000/svg';
 function draw(tag,attrs,text){const n=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;svg.append(n);return n;}
 const accuracy=metric.value==='accuracy',valid=rows.filter(r=>r[metric.value]!=null);
 if(!valid.length)draw('text',{x:50,y:120,fill:'#ccc'},accuracy?'Aucune accuracy disponible pour ces filtres.':'Aucun run pour ces filtres.');
 else{
 const values=valid.map(r=>r[metric.value]),max=accuracy?100:Math.max(...values,...s.thresholds,...all.map(r=>r.score))*1.12,min=0,times=valid.map(r=>new Date(r.played_at).getTime());
 const x=t=>65+(t-times[0])/Math.max(times.at(-1)-times[0],1)*820,y=v=>220-(v-min)/(max-min)*195;
 for(let i=0;i<=4;i++){const v=max*i/4;draw('line',{x1:65,x2:885,y1:y(v),y2:y(v),stroke:'#34353e'});draw('text',{x:3,y:y(v)+4,fill:'#aaa','font-size':11},formatValue(v)+(accuracy?' %':''));}
 if(!accuracy)s.thresholds.forEach((t,i)=>{draw('line',{x1:65,x2:885,y1:y(t),y2:y(t),stroke:colors[i+1],'stroke-dasharray':'3 6',opacity:.5});draw('text',{x:892,y:y(t)+4,fill:colors[i+1],'font-size':11},rankNames[i+1]);});
 draw('polyline',{points:valid.map((r,i)=>x(times[i])+','+y(r[metric.value])).join(' '),fill:'none',stroke:accuracy?'#8de0c4':'#80b6ff','stroke-width':2});
 if(!accuracy){const cumulative=new Map();let best=0;for(const r of all){best=Math.max(best,r.score);cumulative.set(r.run_key,best);}draw('polyline',{points:valid.map((r,i)=>x(times[i])+','+y(cumulative.get(r.run_key))).join(' '),fill:'none',stroke:'#e5af43','stroke-dasharray':'6 4','stroke-width':2});}
 valid.forEach((r,i)=>{const dot=draw('circle',{cx:x(times[i]),cy:y(r[metric.value]),r:3,fill:accuracy?'#8de0c4':'#80b6ff'}),title=document.createElementNS(ns,'title');title.textContent=formatRunDate(r.played_at)+' · '+formatValue(r[metric.value]);dot.append(title);});
 const axisPart=valid[0].played_at.slice(0,10)===valid.at(-1).played_at.slice(0,10)?'time':'date';
 draw('text',{x:65,y:248,fill:'#bbb','font-size':11},formatRunDate(valid[0].played_at,axisPart));draw('text',{x:885,y:248,fill:'#bbb','font-size':11,'text-anchor':'end'},formatRunDate(valid.at(-1).played_at,axisPart));
 }
 svg.setAttribute('aria-label',accuracy?'Évolution de l’accuracy en pourcentage':'Scores, record cumulé et seuils de rang');
 document.querySelector('#chart + p').textContent=accuracy?'Vert : accuracy de chaque run. Les valeurs manquantes sont exclues.':'Bleu : score · Doré : record cumulé depuis le premier run importé · Lignes colorées : seuils de rang.';
 const body=document.getElementById('history-rows');body.replaceChildren();rows.slice(-historyLimit).reverse().forEach(r=>{const tr=ui('tr');[formatRunDate(r.played_at),formatValue(r.score),null,r.accuracy==null?'—':formatValue(r.accuracy)+' %',formatValue(r.hits),formatValue(r.damage)].forEach((v,i)=>{const td=ui('td',v===null?undefined:v);if(i===2)td.append(badge(runRank(r,s)));tr.append(td);});body.append(tr);});more.hidden=rows.length<=historyLimit;
}

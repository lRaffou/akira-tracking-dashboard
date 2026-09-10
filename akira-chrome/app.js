"use strict";
const ranks = ["Non classé", "Bronze", "Silver", "Gold", "Platinum", "Diamond"];
const colors = ["#7d8999", "#c77b45", "#a8b8ca", "#d7b52b", "#54b9b0", "#a66be0"];
const gradients = ["linear-gradient(90deg,#77879a,#aab7c7)","linear-gradient(90deg,#b66f45,#e0a27b)","linear-gradient(90deg,#92a7bf,#d1dceb)","linear-gradient(90deg,#bf991d,#f0d45c)","linear-gradient(90deg,#3c9995,#83d5ce)","linear-gradient(90deg,#8651c1,#c58cf0)"];
const fmt = n => new Intl.NumberFormat("fr-FR", {maximumFractionDigits:2}).format(n);
const data = window.BENCHMARK_DATA;
function points(score, thresholds) {
  const bounds = [0, ...thresholds];
  for (let i=1;i<bounds.length;i++) if(score<bounds[i]) return i-1+(score-bounds[i-1])/(bounds[i]-bounds[i-1]);
  return 5;
}
const average = items => items.reduce((sum,s)=>sum+points(s.score,s.thresholds),0)/items.length;
const el = (tag, text, cls) => {const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
const rankImages = [null,'bronze.webp','silver.webp','gold.webp','platinum.webp','diamond.webp'];
function rankIcon(rank){const img=el('img',undefined,'rank-icon');img.src='assets/ranks/'+rankImages[rank];img.alt='';img.width=32;img.height=32;return img;}
function badge(p){const rank=Math.floor(p),node=el('span',undefined,'badge');if(rank>0)node.append(rankIcon(rank));node.append(el('span',ranks[rank]));node.style.color=colors[rank];return node;}
function validate(){
  if(!data || !Array.isArray(data.categories) || data.categories.length!==4) throw Error("Il faut quatre catégories dans data.js.");
  for(const c of data.categories){
    if(!Array.isArray(c.scenarios)||c.scenarios.length!==3)throw Error("Chaque catégorie doit contenir trois scénarios.");
    for(const s of c.scenarios)if(!Number.isFinite(s.score)||s.score<0||!Array.isArray(s.thresholds)||s.thresholds.length!==5||s.thresholds.some((v,i)=>!Number.isFinite(v)||v<=0||(i>0&&v<=s.thresholds[i-1])))throw Error("Score ou seuils invalides : "+s.name);
  }
}
function render(){
  document.getElementById("title").textContent=data.title;document.title=data.title;
  document.getElementById("player").textContent=data.player;
  const all=data.categories.flatMap(c=>c.scenarios), p=average(all), rank=Math.floor(p);
  document.getElementById("global-rank").textContent=ranks[rank];document.getElementById("global-rank").style.color=colors[rank];
  document.querySelector(".rank-symbol").style.color=colors[rank];
  document.querySelector('.rank-symbol').replaceChildren(rank>0?rankIcon(rank):document.createTextNode('◇'));
  document.getElementById("global-points").textContent="Ton niveau moyen sur les 12 scénarios";
  document.getElementById("global-next").textContent=rank===5?"Diamond atteint":Math.round((p-rank)*100)+" % du chemin de "+ranks[rank]+" à "+ranks[rank+1];
  document.getElementById("global-bar").max=1;
  document.getElementById("global-bar").value=rank===5?1:p-rank;
  document.getElementById("global-bar").setAttribute("aria-label","Progression vers le prochain rang global");
  document.getElementById("achieved").textContent=all.filter(s=>s.score>=s.thresholds[0]).length+" / 12";
  document.getElementById("best").textContent=data.categories.reduce((a,b)=>average(a.scenarios)>=average(b.scenarios)?a:b).name;
  const root=document.getElementById("categories");root.replaceChildren();

  const table=el('table');table.setAttribute('aria-label','Tracking Benchmark by Akira');
  const thead=el('thead'),hr=el('tr');
  ['Catégorie','Scénario','High score',...ranks.slice(1),'Rang scénario','Rang catégorie'].forEach((t,i)=>{const th=el('th');th.scope='col';if(i>=3&&i<=7){th.style.color=colors[i-2];const label=el('span',undefined,'rank-heading');label.append(rankIcon(i-2),el('span',t));th.append(label);}else th.textContent=t;hr.append(th)});thead.append(hr);table.append(thead);
  data.categories.forEach((c,ci)=>{
    const body=el('tbody');
    c.scenarios.forEach((s,si)=>{
      const row=el('tr',undefined,'scenario-row'),sp=points(s.score,s.thresholds),sr=Math.floor(sp);
      row.style.setProperty('--fill', ['#697481','#af7108','#85939f','#b69a35','#489e94','#6b82ce'][sr]);
      if(si===0){const cat=el('th',undefined,'category-cell');cat.scope='rowgroup';cat.rowSpan=3;cat.style.color=['#60ceeb','#96a6ff','#d7adff','#5ed6b0'][ci];cat.append(el('span',c.name));row.append(cat);}
      const name=el('th',undefined,'scenario-cell');name.scope='row';name.append(el('span',s.name,'scenario-name'),el('small',sr===5?'Diamond atteint':'Encore '+fmt(s.thresholds[sr]-s.score)+' points pour '+ranks[sr+1]));row.append(name);
      const scoreCell=el('td'),input=el('input',undefined,'score');input.type='number';input.min='0';input.step='any';input.value=s.score;input.id='score-'+ci+'-'+si;input.style.color=colors[sr];input.setAttribute('aria-label','High score de '+s.name);
      input.addEventListener('change',()=>{const v=input.valueAsNumber;if(!Number.isFinite(v)||v<0){input.setCustomValidity('Saisis un score positif ou nul.');input.reportValidity();return;}input.setCustomValidity('');s.score=v;render();document.getElementById(input.id).focus();document.getElementById('status').textContent='Score mis à jour. Exporte tes données et remplace data.js pour conserver tes modifications.';});input.addEventListener('input',()=>input.setCustomValidity(''));scoreCell.append(input);row.append(scoreCell);
      const progressCell=el('td',undefined,'progress-cell');progressCell.colSpan=5;const track=el('div',undefined,'progress-track');const width=Math.max(0,Math.min(100,sp/5*100));const fill=el('span',undefined,'progress-fill');fill.style.width=width+'%';fill.style.setProperty('background',gradients[sr],'important');fill.style.setProperty('--fill-color',colors[sr]);track.append(fill);
      s.thresholds.forEach((v,i)=>{const marker=el('span',undefined,'progress-marker');marker.style.left=((i+.5)/5*100)+'%';marker.style.setProperty('--rank-color',colors[i+1]);marker.append(el('b',fmt(v)),el('small',ranks[i+1]));marker.setAttribute('aria-label',ranks[i+1]+' : '+fmt(v)+(s.score>=v?', atteint':', non atteint'));track.append(marker)});progressCell.append(track);row.append(progressCell);
      const rankCell=el('td',undefined,'scenario-rank');rankCell.append(badge(sp));row.append(rankCell);
      if(si===0){const categoryRank=el('td',undefined,'category-rank-new');categoryRank.rowSpan=3;categoryRank.append(badge(average(c.scenarios)));row.append(categoryRank);}
      body.append(row);
    });table.append(body);
  });root.append(table);
}
const playlistText=data.categories.flatMap(c=>c.scenarios.map(s=>s.name)).join('\n');
const playlistArea=document.getElementById('playlist-text');
document.getElementById('copy-playlist')?.addEventListener('click',async()=>{
 const feedback=document.getElementById('playlist-status');
 try{await navigator.clipboard.writeText(playlistArea.value);feedback.textContent='Code copié ! Colle-le dans les playlists en ligne de KovaaK’s.';}
 catch{playlistArea.focus();playlistArea.select();let copied=false;try{copied=document.execCommand('copy');}catch{}feedback.textContent=copied?'Code copié ! Colle-le dans KovaaK’s.':'Appuie sur Ctrl+C pour copier le code sélectionné.';}
});
document.getElementById('download-playlist')?.addEventListener('click',()=>{const blob=new Blob([playlistText+'\n'],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='akira-kovaaks-playlist.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
document.getElementById('export').addEventListener('click',()=>{
 const blob=new Blob(['// Seuils : Bronze, Silver, Gold, Platinum, Diamond.\nwindow.BENCHMARK_DATA = '+JSON.stringify(data,null,2)+';\n'],{type:'text/javascript;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='data.js';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.getElementById('status').textContent='Export demandé : remplace data.js par le fichier téléchargé.';
});
try{validate();render();}catch(error){document.getElementById('status').textContent='Impossible de charger les données : '+error.message;document.getElementById('export').disabled=true;}


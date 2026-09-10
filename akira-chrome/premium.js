// Presentation only: keep the same controls, data and calculations.
const overview=document.querySelector('.overview');
const folderPanel=document.querySelector('.folder-panel');
const connection=document.getElementById('connection');
const connectionStrip=document.createElement('div');connectionStrip.className='connection-strip';connectionStrip.append(connection);overview.append(connectionStrip);
const settings=document.createElement('details');settings.className='connection-settings';
const settingsTitle=document.createElement('summary');settingsTitle.textContent='Dossier Stats et sauvegardes';settings.append(settingsTitle,folderPanel);overview.after(settings);
document.getElementById('status').after(session);
const weeklyFold=document.createElement('details');weeklyFold.className='weekly-fold';const weeklyTitle=document.createElement('summary');weeklyTitle.textContent='Bilan hebdomadaire';weeklyFold.append(weeklyTitle,weekly);document.getElementById('history').after(weeklyFold);
weekly.querySelector('h2').hidden=true;
const label=document.createElement('span');label.className='profile-label';label.textContent='AKIRA / PERFORMANCE';document.querySelector('.intro').prepend(label);
let previousScores=null;
window.highlightRecords=function(){
 const current=window.BENCHMARK_DATA.categories.flatMap(c=>c.scenarios);
 if(previousScores){document.querySelectorAll('.scenario-row').forEach((row,i)=>{if(current[i].score>(previousScores.get(current[i].name)??Infinity)){row.classList.add('record-updated');const flag=document.createElement('span');flag.className='record-flag';flag.textContent='Nouveau record';row.querySelector('.scenario-cell').append(flag);}});}
 previousScores=new Map(current.map(s=>[s.name,s.score]));
};

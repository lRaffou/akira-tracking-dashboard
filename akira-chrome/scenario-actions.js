/* Row controls share the existing history view and local tracker. */
let scenarioDialog;
window.renderStatsSummary=function(s,runs){
 let box=document.querySelector('.stats-summary');if(!box){box=document.createElement('div');box.className='stats-summary';document.querySelector('#history .analytics-controls').before(box);}box.replaceChildren();
 const mean=items=>items.reduce((sum,r)=>sum+r.score,0)/items.length;
 const recent=runs.slice(-5),previous=runs.slice(-10,-5);
 const delta=recent.length===5&&previous.length===5?mean(recent)-mean(previous):null;
 const items=[['Record',formatValue(s.score),'Référence et runs importés'],['Moyenne',runs.length?formatValue(mean(runs)):'—','Selon les filtres'],['Runs',String(runs.length),'Selon les filtres'],['Évolution récente',delta===null?'—':(delta>0?'+':'')+formatValue(delta),delta===null?'10 runs nécessaires':'Moyenne des 5 derniers vs 5 précédents']];
 for(const [label,value,note]of items){const card=document.createElement('div');for(const[tag,text]of [['small',label],['strong',value],['p',note]]){const n=document.createElement(tag);n.textContent=text;card.append(n);}box.append(card);}
};
function openScenarioStats(name){
  if(!scenarioDialog){
    scenarioDialog=document.createElement('dialog');scenarioDialog.className='scenario-dialog';scenarioDialog.setAttribute('aria-label','Statistiques du scénario');
    const close=document.createElement('button');close.textContent='Fermer ×';close.className='dialog-close';close.onclick=()=>scenarioDialog.close();
    scenarioDialog.append(close);document.body.append(scenarioDialog);
    scenarioDialog.addEventListener('click',event=>{if(event.target===scenarioDialog){const box=scenarioDialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)scenarioDialog.close();}});
  }
  const panel=document.getElementById('history');
  scenarioDialog.append(panel);
  categoryFilter.value='';fillScenarios();choose.value=name;rankFilter.value='';historyLimit=100;
  panel.querySelector('h2').textContent='Évolution · '+name;
  if(!scenarioDialog.open)scenarioDialog.showModal();history().catch(feedback);
}
let rowRefreshBusy=false;
window.installScenarioActions=function(){
  document.querySelectorAll('.scenario-row').forEach(row=>{
    if(row.querySelector('.scenario-actions'))return;
    const actions=document.createElement('span');actions.className='scenario-actions';
    function control(label,path){const button=document.createElement('button');button.type='button';button.title=label;button.setAttribute('aria-label',label+' : '+row.dataset.scenario);button.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="'+path+'"/></svg>';actions.append(button);return button;}
    control('Stats','M4 19V5 M4 19h16 M7 14l4-5 4 3 5-7').onclick=()=>openScenarioStats(row.dataset.scenario);
    const refreshButton=control('Actualiser ce scénario','M20 4v6h-6 M20 10a8 8 0 1 0-2 8');
    const play=document.createElement('a');play.href='steam://run/824270/?action=jump-to-scenario;name='+encodeURIComponent(row.dataset.scenario);play.title='Jouer dans KovaaK’s';play.setAttribute('aria-label','Jouer : '+row.dataset.scenario);play.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M7 4v16l14-8z"/></svg>';actions.append(play);
    function rowMessage(target,text){let note=target.querySelector('.row-feedback');if(!note){note=document.createElement('span');note.className='row-feedback';note.setAttribute('role','status');target.querySelector('.scenario-cell').append(note);}note.textContent=text;}
    refreshButton.onclick=async()=>{
      if(rowRefreshBusy){rowMessage(row,'Actualisation déjà en cours…');return;}rowRefreshBusy=true;refreshButton.disabled=true;refreshButton.classList.add('is-refreshing');refreshButton.setAttribute('aria-busy','true');rowMessage(row,'Actualisation…');
      try{
        await LocalTracker.scan();
        const next=await LocalTracker.snapshot(),name=row.dataset.scenario;
        const source=next.categories.flatMap(c=>c.scenarios).find(s=>s.name===name);
        const target=window.BENCHMARK_DATA.categories.flatMap(c=>c.scenarios).find(s=>s.name===name);
        const previous=target.score;Object.assign(target,source);render(name);
        const updated=[...document.querySelectorAll('.scenario-row')].find(r=>r.dataset.scenario===name);
        const score=updated.querySelector('.score');score.readOnly=true;
        rowMessage(updated,LocalTracker.state.errors?.length?'Lecture à vérifier':LocalTracker.state.state.startsWith('Suivi actif')?(target.score>previous?'Nouveau record 🏆':'À jour ✓'):'Dossier Stats à connecter ou réautoriser');
        if(target.score>previous){const flag=document.createElement('span');flag.className='record-flag';flag.textContent='🏆';flag.title='Nouveau record';flag.setAttribute('role','img');flag.setAttribute('aria-label','Nouveau record');updated.querySelector('.scenario-name').append(flag);}
        updated.querySelector('.scenario-actions button:last-child').focus();
        document.getElementById('status').textContent=name+' : score actualisé depuis les runs disponibles. '+LocalTracker.state.state;
        if(scenarioDialog?.open&&choose.value===name)await history();
      }catch(error){feedback(error);rowMessage(row,'Actualisation impossible');}finally{rowRefreshBusy=false;refreshButton.disabled=false;refreshButton.classList.remove('is-refreshing');refreshButton.removeAttribute('aria-busy');}
    };
    row.querySelector('.scenario-cell').append(actions);
  });
};

import { questions } from './questions.js';

const $ = (id) => document.getElementById(id);
const sections = { intro: $('intro'), quiz: $('quiz'), results: $('results') };
let run = [], index = 0, score = 0, selected = [], checked = false, history = [];
const letters = ['A','B','C','D','E','F'];
const chapterNames = {
  1:'Network defense and wireless security',2:'Identity access and professional practice',
  3:'Cryptography and information protection',4:'Threats, attacks, and adversaries',
  5:'Endpoint tools and troubleshooting',6:'Vulnerability assessment and risk',7:'Incident response and recovery'
};
// Chapter boundaries follow the supplied reviewer guide.
const ranges = [[1,36],[37,67],[68,91],[92,133],[134,146],[147,165],[166,179]];
function show(which){ Object.entries(sections).forEach(([k,el])=>el.classList.toggle('hidden',k!==which)); window.scrollTo({top:0,behavior:'smooth'}); }
function start(){
  const choice=$('chapter').value;
  run=questions.filter(q=>choice==='all'||(q.id>=ranges[+choice-1][0]&&q.id<=ranges[+choice-1][1]));
  if($('shuffle').checked) run=run.slice().sort(()=>Math.random()-.5);
  index=0; score=0; selected=[]; checked=false; history=[]; $('score').textContent='0'; render(); show('quiz');
}
function decodeAnswer(q){
  if(q.answer==='None') return [];
  if(q.answer==='Match'||q.answer==='Order') return null;
  return [...q.answer].filter(c=>/[A-F]/.test(c));
}
function isMatching(q){ return q.type==='matching'&&Array.isArray(q.matching); }
function render(){
  const saved=history[index];
  selected=saved?[...saved.selected]:[];
  checked=!!saved?.checked;
  const q=run[index]; if(!q)return finish();
  const chapter=ranges.findIndex(([a,b])=>q.id>=a&&q.id<=b)+1;
  $('chapter-label').textContent=`CHAPTER 0${chapter}`;
  $('counter').textContent=`QUESTION ${index+1} OF ${run.length}`;
  $('number').textContent=`QUESTION ${String(q.id).padStart(3,'0')}`;
  $('question').textContent=q.question;
  $('progress').style.width=`${(index/run.length)*100}%`;
  $('back').disabled=index===0;
  $('back').style.opacity=index===0?'.42':'1';
  const key=decodeAnswer(q);
  const multi=key&&key.length>1;
  $('instruction').textContent=isMatching(q)?'Match each item with the correct description.':q.choices.length?(multi?'Choose all correct answers.':'Select one answer.'):(key===null?'Matching/order item: answer in the original reviewer is noted as '+q.answer+'.':'Select the best answer.');
  const area=$('answers'); area.innerHTML='';
  if(isMatching(q)){
    q.matching.forEach((pair,i)=>{
      const row=document.createElement('label'); row.className='match-row';
      const term=document.createElement('span'); term.className='match-term'; term.textContent=pair.left;
      const select=document.createElement('select'); select.className='match-select'; select.dataset.matchIndex=String(i); select.setAttribute('aria-label',`Match for ${pair.left}`);
      const placeholder=document.createElement('option'); placeholder.value=''; placeholder.textContent='Choose a match…'; select.append(placeholder);
      q.matching.forEach((option,j)=>{const el=document.createElement('option');el.value=String(j);el.textContent=option.right;select.append(el);});
      if(selected[i]!==undefined)select.value=String(selected[i]);
      select.disabled=checked;select.addEventListener('change',()=>{selected[i]=select.value===''?null:Number(select.value);$('next').disabled=q.matching.some((_,j)=>selected[j]===null||selected[j]===undefined);});
      row.append(term,select);area.append(row);
    });
  } else q.choices.forEach((choice,i)=>{
    const letter=choice.label||letters[i]; const button=document.createElement('button');
    button.className='answer'; button.type='button';
    if(selected.includes(letter))button.classList.add('selected');
    button.innerHTML=`<span class="answer-key">${letter}</span><span></span>`; button.querySelector('span:last-child').textContent=choice.text;
    button.disabled=checked; button.addEventListener('click',()=>toggle(letter)); area.append(button);
  });
  const feedback=$('feedback'); feedback.classList.add('hidden'); feedback.classList.remove('good'); feedback.textContent='';
  $('next').disabled=!checked&&selected.length===0; $('next').innerHTML=checked?(index===run.length-1?'See results <span>→</span>':'Next question <span>→</span>'):'Check answer <span>→</span>';
  if(checked) reveal();
}
function toggle(letter){
  if(checked)return;
  const q=run[index], key=decodeAnswer(q), multi=key&&key.length>1;
  if(multi) selected=selected.includes(letter)?selected.filter(x=>x!==letter):[...selected,letter];
  else selected=[letter];
  $('next').disabled=selected.length===0;
  document.querySelectorAll('.answer').forEach(b=>b.classList.toggle('selected',selected.includes(b.querySelector('.answer-key').textContent)));
}
function isCorrect(){
  const q=run[index]; if(isMatching(q))return q.matching.every((pair,i)=>selected[i]===i);
  const key=decodeAnswer(q); if(key===null)return false;
  return selected.length===key.length&&selected.every(x=>key.includes(x));
}
function pointsFor(q,response){
  if(!response?.checked)return 0;
  if(isMatching(q))return q.matching.reduce((points,_,i)=>points+(response.selected[i]===i?1:0),0);
  if(q.answer==='None')return response.selected.length===0?1:0;
  if(q.answer==='Match'||q.answer==='Order')return 0;
  const correct=[...q.answer].filter(c=>/[A-F]/.test(c));
  return response.selected.length===correct.length&&response.selected.every(c=>correct.includes(c))?1:0;
}
function maxPoints(){return run.reduce((total,q)=>total+(isMatching(q)?q.matching.length:1),0);}
function updateScore(){score=run.reduce((total,q,i)=>total+pointsFor(q,history[i]),0);$('score').textContent=score;}
function reveal(){
  const q=run[index], key=decodeAnswer(q), correct=isCorrect();
  updateScore();
  if(isMatching(q)){
    document.querySelectorAll('.match-select').forEach((control,i)=>{
      control.classList.add(Number(control.value)===i?'match-correct':'match-wrong');
    });
  }
  document.querySelectorAll('.answer').forEach(b=>{
    const letter=b.querySelector('.answer-key').textContent;
    if(key&&key.includes(letter))b.classList.add('correct');
    else if(selected.includes(letter))b.classList.add('wrong');
  });
  const f=$('feedback'); f.classList.remove('hidden');
  if(isMatching(q)){
    const errors=q.matching.map((pair,i)=>selected[i]===i?null:`<b>${pair.left}</b> → ${pair.right}`).filter(Boolean);
    f.classList.toggle('good',correct);f.innerHTML=correct?'<b>All matches correct.</b> Nice work.':`<b>Check these correct matches:</b><br>${errors.join('<br>')}`;
  }
  else if(key===null){f.innerHTML=`The reviewer marks this as a <b>${q.answer.toLowerCase()}</b> item. The matching/order layout is retained as written in the source.`;}
  else if(!key.length){f.innerHTML=correct?'<b>Correct.</b> The reviewer key lists no correct option.':'<b>Incorrect.</b> The reviewer key lists no correct option; leave every choice unselected.';}
  else if(correct){f.classList.add('good');f.innerHTML='<b>Correct.</b> Nice work.';}
  else {const answer=key.length?key.join(', '):'No listed choice';f.innerHTML=`<b>Incorrect.</b> Correct answer: <b>${answer}</b>.`;}
}
function checkOrNext(){
  if(!checked){const q=run[index];if(isMatching(q)){if(q.matching.some((_,i)=>selected[i]===null||selected[i]===undefined))return;}else if(!selected.length && q.answer!=='None')return;checked=true; history[index]={selected:[...selected],correct:isCorrect(),checked:true}; reveal();$('next').innerHTML=index===run.length-1?'See results <span>→</span>':'Next question <span>→</span>';return;}
  if(index<run.length-1){index++;render();}else finish();
}
function back(){
  if(index===0)return;
  index--;render();
}
function finish(){
  updateScore();
  const maximum=maxPoints();
  $('final-score').textContent=`${score} / ${maximum}`;
  const pct=maximum?Math.round(score/maximum*100):0;
  $('percent').textContent=`${pct}% correct`;
  $('result-title').textContent=pct>=80?'Excellent work.':pct>=60?'Good progress.':'Keep practicing.';
  $('result-copy').textContent=`You earned ${score} of ${maximum} possible points. Matching questions award one point for each correct pair. Review the questions you missed, then try again.`;
  show('results');

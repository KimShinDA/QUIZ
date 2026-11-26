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
      [...new Set(q.matching.map(option=>option.right))].forEach(answer=>{const el=document.createElement('option');el.value=answer;el.textContent=answer;select.append(el);});
      if(selected[i]!==undefined)select.value=selected[i];
      select.disabled=checked;select.addEventListener('change',()=>{selected[i]=select.value===''?null:select.value;$('next').disabled=q.matching.some((_,j)=>selected[j]===null||selected[j]===undefined);});
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
  const q=run[index]; if(isMatching(q))return q.matching.every((pair,i)=>selected[i]===pair.right);
  const key=decodeAnswer(q); if(key===null)return false;
  return selected.length===key.length&&selected.every(x=>key.includes(x));
}
function pointsFor(q,response){
  if(!response?.checked)return 0;
  if(isMatching(q))return q.matching.reduce((points,pair,i)=>points+(response.selected[i]===pair.right?1:0),0);
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
      control.classList.add(control.value===q.matching[i].right?'match-correct':'match-wrong');
    });
  }

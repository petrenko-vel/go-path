(function(){
"use strict";
// ---------- утилиты ----------
const $=(s,r)=> (r||document).querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const addDays=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return iso(d)};
const dow=s=>{const x=parse(s).getDay();return x===0?7:x}; // 1=Пн..7=Вс
const isWE=s=>dow(s)>=6;
const mondayOf=s=>addDays(s,-(dow(s)-1));
const todayS=()=>iso(new Date());
const nextWeekday=s=>{while(isWE(s))s=addDays(s,1);return s};
const fmtT=m=>pad(Math.floor(m/60))+':'+pad(m%60);
const toMin=t=>{const [h,m]=t.split(':').map(Number);return h*60+m};
const MON=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const MONN=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const DOW=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const fmtD=s=>{const d=parse(s);return d.getDate()+' '+MON[d.getMonth()]};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const ANCHOR=parse('2026-09-14'); // понедельник числителя
function parity(s){const m=parse(mondayOf(s));const w=Math.round((m-ANCHOR)/864e5/7);return ((w%2)+2)%2===0?'Ч':'З'}

// ---------- расписание пар (из Google-таблицы) ----------
const P=(a,b,name,kind,room,who)=>({s:toMin(a),e:toMin(b),name,kind,room,who});
const PAIRS={
 'Ч':{1:[P('14:10','17:00','ООП и паттерны','лаб','207с','Никитин')],
  2:[P('12:40','14:00','Русский язык','онлайн','','Кочкина'),P('14:10','15:30','Основы схемотехники','практ','230С','Левченко'),P('15:40','17:00','ООП и паттерны','практ','230с','Никитин'),P('17:10','18:30','Архитектура ИС','лаб','213с','Никитин')],
  3:[P('11:10','12:30','Русский язык','практ','206сс','Кочкина'),P('12:40','15:30','Основы схемотехники','лаб','121С/126с','Голан'),P('15:40','17:00','Упр. ИТ-инфраструктурой','лаб','213с','Гамазов')],
  4:[P('12:40','14:00','Упр. ИТ-инфраструктурой','лек','315с','Дышечев'),P('14:10','15:30','Основы схемотехники','лек','300С','Левченко'),P('15:40','17:00','Методы и средства разработки ИС','лек','201С','Парфенова')],
  5:[P('15:40','17:00','Низкоуровневое прогр.','лаб','212с','Докучаев'),P('17:10','18:30','Роботизированные системы','практ','206С','Пузановский')]},
 'З':{1:[P('14:10','17:00','Методы и средства разработки ИС','лаб','133С','Лежнев')],
  2:[P('12:40','14:00','ООП и паттерны','лек','201с','Куликова'),P('14:10','15:30','Основы схемотехники','практ','230С','Левченко'),P('15:40','17:00','Архитектура ИС','практ','230с','Никитин')],
  3:[P('12:40','15:30','Роботизированные системы','лаб','207с','Пузановский'),P('15:40','17:00','Упр. ИТ-инфраструктурой','лаб','213с','Гамазов')],
  4:[P('12:40','14:00','Низкоуровневое прогр.','лек','209с','Нечипоренко'),P('14:10','15:30','Роботизированные системы','лек','300С','Пузановский'),P('15:40','17:00','Архитектура ИС','лек','201с','Никитин')],
  5:[P('15:40','17:00','Низкоуровневое прогр.','лаб','212с','Докучаев'),P('17:10','18:30','Роботизированные системы','практ','206С','Пузановский')]}};
// пары как в расписании (с устойчивым номером) и правки, которые ты внесла в календаре
function basePairs(d){
 return (isWE(d)?[]:(PAIRS[parity(d)][dow(d)]||[])).map(p=>Object.assign({},p,{id:d+'|'+fmtT(p.s)+'|'+p.name,date:d}));
}
function applyPairOv(p,o,d){return Object.assign({},p,{s:o.s!=null?o.s:p.s,e:o.e!=null?o.e:p.e,name:o.name||p.name,room:o.room!=null?o.room:p.room,note:o.note||'',date:d||p.date,edited:true})}
function pairsOn(d){
 const out=[];
 basePairs(d).forEach(p=>{const o=S.pairOv[p.id];if(!o)out.push(p);else if(!o.off&&(!o.date||o.date===d))out.push(applyPairOv(p,o,d))});
 Object.keys(S.pairOv).forEach(id=>{ // пары, перенесённые на этот день с другого
  const o=S.pairOv[id],od=id.split('|')[0];
  if(o.off||!o.date||o.date!==d||od===d)return;
  const bp=basePairs(od).find(x=>x.id===id);if(bp)out.push(applyPairOv(bp,o,d));
 });
 return out.sort((a,b)=>a.s-b.s);
}

// ---------- темы ----------
const TOPICS=[];
STAGES.forEach(st=>st.topics.forEach((t,i)=>{
 const d=TOPIC_DATA['s'+st.id+'-'+i]||null;
 TOPICS.push({id:'s'+st.id+'-'+i,stage:st.id,idx:i,title:t[0],what:t[1],why:t[2],diff:t[3],req:t[4],blocks:t[5],verify:t[6],d});
}));
const TBY=Object.fromEntries(TOPICS.map(t=>[t.id,t]));
const TOTAL_BLOCKS=TOPICS.reduce((a,t)=>a+t.blocks,0);
const DIFF=['','🟢','🟡','🔴'];
const STAT={new:'не начата',wip:'в работе',done:'освоена',redo:'повторить'};

// ---------- состояние ----------
const KEY='gopath.v1';
let storageOK=true;
function defaults(){return {v:1,status:{'s0-0':'done'},doneAt:{'s0-0':'2026-11-10'},notes:{},blocks:[],reviews:[],tasks:[],sessions:[],code:{},termHide:false,pairOv:{},workOv:{},workDef:null,practice:{},practiceAt:{},track:{days:{},hours:{},topics:{},visits:[]},links:[],theme:'auto',timer:{mode:'work',dur:2700,endAt:null,left:2700,topic:''},ready:false}}
function load(){
 try{const r=localStorage.getItem(KEY);if(r){const o=JSON.parse(r);return Object.assign(defaults(),o)}}catch(e){storageOK=false}
 return defaults();
}
let S=load();
if(!S.practice||typeof S.practice!=='object')S.practice={};
if(!S.practiceAt||typeof S.practiceAt!=='object')S.practiceAt={};
if(!S.code||typeof S.code!=='object')S.code={};
if(!S.pairOv)S.pairOv={};if(!S.workOv)S.workOv={};
if(!S.track||typeof S.track!=='object')S.track={days:{},hours:{},topics:{},visits:[]};
['days','hours','topics'].forEach(k=>{if(!S.track[k])S.track[k]={}});if(!Array.isArray(S.track.visits))S.track.visits=[];
migrateRoadmap();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){storageOK=false;banner()}}
function banner(){const b=$('#banner');if(b)b.hidden=storageOK}
function toast(msg){const t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),3800)}

// ---------- логика ----------
function topicStatus(id){return S.status[id]||'new'}
function setStatus(id,st,opts){
 const prev=topicStatus(id);S.status[id]=st;
 if(st==='done'){S.doneAt[id]=todayS();S.reviews=S.reviews.filter(r=>r.topic!==id||r.done);
  [3,7,21].forEach((n,i)=>S.reviews.push({id:uid(),topic:id,due:nextWeekday(addDays(todayS(),n)),step:i+1,done:false}));
  if(prev!=='done')toast('Тема освоена. '+REST_TIPS[Math.floor(Math.random()*REST_TIPS.length)]+' Повторения поставлены: +3 дня, +1 неделя, +3 недели.')}
 else if(st==='redo'){S.reviews.push({id:uid(),topic:id,due:nextWeekday(todayS()),step:0,done:false})}
 else if(prev==='done'){S.reviews=S.reviews.filter(r=>r.topic!==id||r.done)} // тема больше не освоена: повторения не нужны
 save();
 if(!(opts&&opts.fromBlocks))syncBlocksFromStatus(id,st,prev);
}
function isGo(b){return b.kind!=='other'}
// карта обучения выросла (19 этапов): старые номера тем заменяются новыми во всех данных
function migrateRoadmap(){
 if((S.rmV||0)>=2)return;
 const m=id=>ID_MAP[id]||id;
 const rk=o=>{const out={};Object.keys(o||{}).forEach(k=>{out[m(k)]=o[k]});return out};
 S.status=rk(S.status);S.doneAt=rk(S.doneAt);S.notes=rk(S.notes);S.code=rk(S.code);S.practice=rk(S.practice);
 const pa={};Object.keys(S.practiceAt||{}).forEach(k=>{const i=k.lastIndexOf(':');pa[m(k.slice(0,i))+k.slice(i)]=S.practiceAt[k]});S.practiceAt=pa;
 (S.blocks||[]).forEach(b=>{if(b.topic)b.topic=m(b.topic)});
 (S.reviews||[]).forEach(r=>{if(r.topic)r.topic=m(r.topic)});
 (S.sessions||[]).forEach(x=>{if(x.topic)x.topic=m(x.topic)});
 (S.tasks||[]).forEach(x=>{if(x.topic)x.topic=m(x.topic)});
 (S.links||[]).forEach(x=>{if(x.topic)x.topic=m(x.topic)});
 if(S.timer&&S.timer.topic)S.timer.topic=m(S.timer.topic);
 S.track.topics=rk(S.track.topics);
 S.rmV=2;S.planV=0; // план по новым темам построится заново при запуске
}
// статус темы меняется: блоки этой темы в календаре подстраиваются
function syncBlocksFromStatus(id,st,prev){
 const today=todayS();let changed=false;
 if(st==='done'&&prev!=='done'){
  S.blocks.forEach(b=>{if(isGo(b)&&b.topic===id&&!b.done&&b.date<=today){b.done=true;changed=true}});
  const n=S.blocks.length;
  S.blocks=S.blocks.filter(b=>!(isGo(b)&&b.topic===id&&!b.done&&b.date>today&&!b.manual));
  if(S.blocks.length!==n)changed=true;
  if(changed)fillPlan(); // ничего не двигаем: освободившиеся места остаются свободными
 }else if(prev==='done'&&st!=='done'){ // тема снова не освоена: её блоки возвращаются в план
  if(st==='new')S.blocks.forEach(b=>{if(isGo(b)&&b.topic===id&&b.done)b.done=false});
  fillPlan();changed=true;
 }else if(st==='new'&&prev!=='new'){
  S.blocks.forEach(b=>{if(isGo(b)&&b.topic===id&&b.done){b.done=false;changed=true}});
  if(changed)fillPlan();
 }
 if(changed)save();
}
// блок отмечен или снят: статус темы подстраивается
function afterBlockDone(topicId,nowDone){
 const t=TBY[topicId];if(!t)return;
 const done=S.blocks.filter(b=>isGo(b)&&b.topic===topicId&&b.done).length,st=topicStatus(topicId);
 if(nowDone){
  if(done>=t.blocks){if(st!=='done')setStatus(topicId,'done',{fromBlocks:true})}
  else if(st==='new')setStatus(topicId,'wip',{fromBlocks:true});
 }else if(st==='done')setStatus(topicId,'wip',{fromBlocks:true});
}
function toggleBlockDone(id){
 const b=S.blocks.find(x=>x.id===id);if(!b)return;
 b.done=!b.done;save();
 if(isGo(b)&&b.topic)afterBlockDone(b.topic,b.done);
}
function doneBlocks(){return TOPICS.filter(t=>topicStatus(t.id)==='done').reduce((a,t)=>a+t.blocks,0)}
function activityDays(){
 const set=new Set();
 S.blocks.filter(b=>b.done&&isGo(b)).forEach(b=>set.add(b.date));
 S.sessions.forEach(x=>set.add(x.date));S.tasks.forEach(x=>set.add(x.date));Object.values(S.practiceAt).forEach(d=>set.add(d));
 Object.values(S.doneAt).forEach(d=>set.add(d));
 S.reviews.filter(r=>r.done&&r.doneAt).forEach(r=>set.add(r.doneAt));
 return set;
}
function streak(){
 const act=activityDays();let d=todayS();let n=0;
 if(!isWE(d)&&!act.has(d))d=addDays(d,-1);
 for(let i=0;i<400;i++){if(isWE(d)){d=addDays(d,-1);continue}
  if(act.has(d)){n++;d=addDays(d,-1)}else break}
 return n;
}
function nextTopic(){return TOPICS.find(t=>topicStatus(t.id)!=='done'&&topicStatus(t.id)!=='redo')||null}
function dueReviews(){const t=todayS();return S.reviews.filter(r=>!r.done&&r.due<=t)}
function paceInfo(){
 const from=addDays(todayS(),-14);
 const dn=S.blocks.filter(b=>b.done&&isGo(b)&&b.date>=from).length+S.sessions.filter(s=>s.date>=from&&s.mode==='timer').length;
 return dn;
}

// ---------- роутер ----------
let route='home',param='',topicTab='note',calMode='week',calDate=todayS(),monthDate=todayS();
function go(h){location.hash=h}
function parseHash(){
 const h=(location.hash||'#home').slice(1);
 if(h.startsWith('t-')){route='topic';param=h.slice(2)}
 else if(h.startsWith('st-')){route='stage';param=h.slice(3)}
 else if(h.startsWith('quick=')){route='calendar';param='';try{quickPre=decodeURIComponent(h.slice(6))}catch(_){quickPre=''}}
 else{route=['home','map','calendar','tasks','materials','stats','setup'].includes(h)?h:'home';param=''}
}
function rerender(){const y=scrollY;render();scrollTo(0,y)}
function render(){
 parseHash();
 document.querySelectorAll('nav a').forEach(a=>{const k=a.getAttribute('href').slice(1);a.removeAttribute('aria-current');if(k===route||(route==='topic'||route==='stage')&&k==='map')a.setAttribute('aria-current','page')});
 const m=$('#main');
 const fn={home:vHome,map:vMap,stage:vStage,topic:vTopic,calendar:vCalendar,tasks:vTasks,materials:vMaterials,stats:vStats,setup:vSetup}[route];
 m.className='wrap'+(route==='topic'||route==='calendar'?' wide':'');
 m.innerHTML=fn();
 if(route==='calendar')bindCalendar();
 if(route==='materials')applyMatFilter();
 if(route==='topic')updateGutter();
 window.scrollTo(0,0);
 if(route==='calendar'){if(calAuto){calAuto=false;autoScrollCal()}}else calAuto=true;
 if(route==='calendar'&&quickPre!==null){const tx=quickPre;quickPre=null;history.replaceState(null,'','#calendar');openQuick(tx)}
 renderTimer();
}

// ---------- виды ----------
function progressBar(p){return '<div class="bar" role="progressbar" aria-valuenow="'+Math.round(p)+'" aria-valuemin="0" aria-valuemax="100"><i style="width:'+p+'%"></i></div>'}
// карточка «Сегодня»: прошедшее скрывается, остаётся текущее и предстоящее
function todayCard(){
 const t=todayS(),nowD=new Date(),now=nowD.getHours()*60+nowD.getMinutes();
 const todayBlocks=S.blocks.filter(b=>b.date===t).sort((a,b)=>a.start-b.start);
 const goTotal=todayBlocks.filter(isGo).length,goDone=todayBlocks.filter(b=>isGo(b)&&b.done).length;
 const wk=workOn(t);
 const all=(wk?[{s:wk.s,e:wk.e,kind:'work',title:'Работа',sub:''}]:[]).concat(pairsOn(t).map(p=>({s:p.s,e:p.e,kind:'pair',title:p.name,sub:p.kind+(p.room?', '+p.room:'')})))
  .concat(todayBlocks.map(b=>({s:b.start,e:b.start+b.dur,kind:isGo(b)?'go':'other',title:b.title,id:b.id,done:b.done}))).sort((a,b)=>a.s-b.s);
 // прошедшее прячем; невыполненный блок Go не прячем, чтобы его можно было отметить
 const items=all.filter(x=>x.e>now||(x.kind==='go'&&!x.done));
 const hiddenCount=all.length-items.length;
 return '<div class="card hcard" id="todaycard"><div class="hc-head"><span class="hc-ic">📅</span><h3>Сегодня</h3>'+(goTotal?'<span class="small mute">блоков Go: '+goDone+' из '+goTotal+'</span>':'')+'</div>'
  +(isWE(t)&&!all.length?'<div class="hempty"><div class="he-ic">🌿</div><b>Выходной</b><div class="small mute">Отдыхай. Занятия по плану только в будни.</div></div>'
   :items.length?'<div class="tline">'+items.map(x=>{const nowOn=x.s<=now&&now<x.e,late=x.kind==='go'&&!x.done&&x.e<=now;
     return '<div class="tl '+x.kind+(x.done?' done':'')+(nowOn?' now':'')+(late?' late':'')+'"><div class="tl-time">'+fmtT(x.s)+'<br><span class="small mute">'+fmtT(x.e)+'</span></div><div class="tl-body"><b>'+esc(x.title)+'</b>'
      +'<div class="small mute">'+(nowOn?'<span class="nowbadge">идёт сейчас</span> ':'')+(late?'не отмечен · ':'')+(x.kind==='pair'?'пара · '+esc(x.sub):x.kind==='work'?'учёба вечером':x.kind==='other'?'дело':'блок Go')+'</div></div>'
      +(x.kind==='go'||x.kind==='other'?'<button class="btn sm'+(x.done?' on':'')+'" data-act="bdone" data-id="'+x.id+'">'+(x.done?'Готово ✓':'Отметить')+'</button>':'')+'</div>'}).join('')+'</div>'
   :'<div class="hempty"><div class="he-ic">'+(hiddenCount?'🌙':'☕')+'</div><b>'+(hiddenCount?'На сегодня всё':'На сегодня ничего нет')+'</b>'+(hiddenCount?'<div class="small mute">Все дела на сегодня позади.</div>':'')+'</div>')
  +'<div class="row hc-act"><a class="btn sm ghost" href="#calendar">Открыть календарь</a></div></div>';
}
let qShift=0;
function dayHash(str){let h=0;for(const c of str)h=(h*31+c.charCodeAt(0))>>>0;return h}
function vHome(){
 const nt=nextTopic(),dr=dueReviews(),t=todayS();
 const db=doneBlocks(),pct=db/TOTAL_BLOCKS*100;
 const pace=paceInfo(),left=TOTAL_BLOCKS-db;
 const doneT=TOPICS.filter(x=>topicStatus(x.id)==='done').length;
 const weeks=pace>=4?Math.ceil(left/(pace/2)):null;
 const dowFull=['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'][dow(t)-1];
 const pills=[fmtD(t),dowFull].concat(isWE(t)?[]:[parity(t)==='Ч'?'Числитель':'Знаменатель']);
 // сегменты пути: один на этап, заливка по освоенным блокам
 const cur=(STAGES.find(st=>TOPICS.filter(x=>x.stage===st.id).some(x=>topicStatus(x.id)!=='done'))||{}).id;
 const segs=STAGES.map(st=>{const ts=TOPICS.filter(x=>x.stage===st.id),all=ts.reduce((a,x)=>a+x.blocks,0),dn=ts.filter(x=>topicStatus(x.id)==='done').reduce((a,x)=>a+x.blocks,0),p=all?dn/all*100:0;
  return '<a class="pseg'+(st.id===cur?' cur':'')+(p>=100?' full':'')+'" href="#st-'+st.id+'" title="Этап '+st.id+'. '+esc(st.title)+': '+Math.round(p)+'%" style="flex:'+Math.max(all,2)+'"><i style="width:'+p+'%"></i><span>'+st.id+'</span></a>'}).join('');
 const tile=(ic,n,l)=>'<div class="hstat"><span class="hi">'+ic+'</span><div><b>'+n+'</b><div class="small mute">'+l+'</div></div></div>';
 const progress='<div class="card hprog"><div class="hp-top"><div><div class="hp-pct">'+Math.round(pct)+'<small>%</small></div><div class="small mute">пройдено блоков: '+db+' из '+TOTAL_BLOCKS+'</div></div>'
  +'<div class="hstats">'+tile('🔥',streak(),(n=>n%10===1&&n%100!==11?'день':[2,3,4].includes(n%10)&&![12,13,14].includes(n%100)?'дня':'дней')(streak())+' подряд')+tile('📚',doneT+' / '+TOPICS.length,'тем освоено')+tile('⏳','≈ '+Math.round(left*50/60)+' ч','осталось занятий')+tile('🗓',weeks?'≈ '+weeks+' нед.':'—',weeks?'до конца по твоему темпу':'прогноз появится через 2 недели')+'</div></div>'
  +'<div class="ppath" aria-label="Путь по этапам">'+segs+'</div><div class="small mute pathcap">Этапы 0–'+(STAGES.length-1)+': каждый сегмент заполняется по мере освоения тем. '+(cur!==undefined?'Сейчас этап '+cur+'.':'')+'</div></div>';
 // текущая тема
 let curCard;
 if(nt){
  const stt=topicStatus(nt.id),nb=S.blocks.filter(b=>b.topic===nt.id&&!b.done).sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:a.start-b.start)[0];
  const pi=practiceItems(nt).length,pdn=practiceDone(nt.id);
  curCard='<div class="card hcard"><div class="hc-head"><span class="hc-ic">🎯</span><h3>Текущая тема</h3></div>'
   +'<a class="nolink hc-title" href="#t-'+nt.id+'">'+esc(nt.title)+'</a>'
   +'<div class="small mute">Этап '+nt.stage+'. '+esc(STAGES[nt.stage].title)+'</div>'
   +'<p class="small hc-what">'+esc(nt.what)+'</p>'
   +'<div class="tmeta"><span class="chip">'+DIFF[nt.diff]+' '+DIFF_T[nt.diff]+'</span><span class="chip">блоков: '+nt.blocks+'</span>'+(nb?'<span class="chip warn">📅 '+fmtD(nb.date)+', '+fmtT(nb.start)+'</span>':'')+'</div>'
   +(pi&&pdn?'<div class="small mute">Практика: '+pdn+' из '+pi+'</div>'+progressBar(pdn/pi*100):'')
   +'<div class="row hc-act"><a class="btn pri" data-act="opennote" data-id="'+nt.id+'"'+(stt==='new'?' data-st="wip"':'')+' href="#t-'+nt.id+'">'+(stt==='new'?'Начать':'Продолжить')+'</a>'+(nt.d?'':'')+(!nb?'<button class="btn ghost" data-act="plan" data-id="'+nt.id+'">📅 В календарь</button>':'')+'</div></div>';
 }else curCard='<div class="card hcard"><div class="hc-head"><span class="hc-ic">🎯</span><h3>Текущая тема</h3></div><p>Все темы пройдены. Это успех 🎉</p></div>';
 // повторения
 const RSTEP={0:'повтор',1:'через 3 дня',2:'через неделю',3:'через 3 недели'};
 const upcoming=S.reviews.filter(r=>!r.done&&r.due>t).sort((a,b)=>a.due<b.due?-1:1)[0];
 const revCard='<div class="card hcard"><div class="hc-head"><span class="hc-ic">🔁</span><h3>Пора повторить</h3>'+(dr.length?'<span class="hc-count">'+dr.length+'</span>':'')+'</div>'
  +(dr.length?dr.map(r=>'<div class="hrow"><div class="t"><a class="nolink" href="#t-'+r.topic+'"><b>'+esc(TBY[r.topic].title)+'</b></a><div class="small mute">'+(RSTEP[r.step]||'повтор')+(r.due<t?' · просрочено с '+fmtD(r.due):'')+'</div></div><button class="btn sm pri" data-act="revdone" data-id="'+r.id+'">Повторила</button></div>').join('')
   :'<div class="hempty"><div class="he-ic">🎉</div><b>Всё повторено</b><div class="small mute">'+(upcoming?'Ближайшее повторение: '+fmtD(upcoming.due)+', «'+esc(TBY[upcoming.topic].title)+'».':'Повторения появятся, когда ты освоишь первую тему.')+'</div></div>')+'</div>';
 return '<div class="hello"><h1>Привет, Валерия!</h1><div class="pills">'+pills.map(x=>'<span class="dpill">'+x+'</span>').join('')+'</div></div>'
  +progress
  +'<div class="hgrid">'+curCard+revCard+todayCard()+'</div>'
  +'<div class="hgrid">'+quizCard(t)+achCard(doneT)+'</div>';
}
// вопрос для разминки из пройденных и текущих тем
function quizCard(t){
 const st=x=>topicStatus(x.id);
 let pool=TOPICS.filter(x=>x.d&&x.d.q&&x.d.q.length&&['done','wip','redo'].includes(st(x)));
 const nt=nextTopic();
 if(!pool.length&&nt&&nt.d&&nt.d.q&&nt.d.q.length)pool=[nt];
 if(!pool.length)return '<div class="card hcard"><div class="hc-head"><span class="hc-ic">🧠</span><h3>Вопрос для разминки</h3></div><div class="hempty"><div class="he-ic">📖</div><b>Пока нет вопросов</b><div class="small mute">Они появятся, когда начнёшь тему с конспектом.</div></div></div>';
 const h=dayHash(t)+qShift*7919,tp=pool[h%pool.length],q=tp.d.q[Math.floor(h/pool.length)%tp.d.q.length];
 return '<div class="card hcard"><div class="hc-head"><span class="hc-ic">🧠</span><h3>Вопрос для разминки</h3></div>'
  +'<div class="small mute">Из темы «<a href="#t-'+tp.id+'" data-act="opennote">'+esc(tp.title)+'</a>»</div>'
  +'<div class="hc-q">'+esc(q[0])+'</div>'
  +'<details><summary>Показать ответ</summary><p class="small">'+esc(q[1])+'</p></details>'
  +'<div class="small mute">Сначала ответь вслух или своими словами, потом открывай.</div>'
  +'<div class="row hc-act"><button class="btn sm ghost" data-act="newq">🔀 Другой вопрос</button></div></div>';
}
// достижения по реальным данным: значок, цвет, прогресс до цели
function achCard(doneT){
 const timers=S.sessions.filter(x=>x.mode==='timer').length;
 const s0=TOPICS.filter(x=>x.stage===0),s0d=s0.filter(x=>topicStatus(x.id)==='done').length;
 const str=streak(),pr=practiceTotal(),rv=S.reviews.filter(r=>r.done).length;
 // [иконка, название, описание, текущее, цель, цвет]
 const list=[
  ['🌱','Первая тема','освоить одну тему',doneT,1,'#2e9d4f'],
  ['🔥','3 дня подряд','серия будних дней: 3',str,3,'#e8702a'],
  ['📆','Целая неделя','серия будних дней: 5',str,5,'#3b82c4'],
  ['⏱','Первый блок','завершить блок по таймеру',timers,1,'#8b5cf6'],
  ['✅','Практик','выполнить 5 заданий практики',pr,5,'#0f9b8e'],
  ['🔁','Память тренирована','сделать первое повторение',rv,1,'#d6457a'],
  ['🧱','Инструменты готовы','пройти этап 0',s0d,s0.length,'#d99a00'],
  ['🧠','Десятка','освоить 10 тем',doneT,10,'#5566d6']];
 const got=list.filter(x=>x[3]>=x[4]).length;
 return '<div class="card hcard"><div class="hc-head"><span class="hc-ic">🏅</span><h3>Достижения</h3><span class="achcount"><b>'+got+'</b> из '+list.length+'</span></div>'
  +progressBar(got/list.length*100)
  +'<div class="achs">'+list.map(x=>{const ok=x[3]>=x[4],cur=Math.min(x[3],x[4]);
   return '<div class="ach'+(ok?' got':'')+'" style="--ac:'+x[5]+'" title="'+esc(x[2])+'"><div class="medal"><span class="ai">'+x[0]+'</span></div><div class="abody"><b>'+esc(x[1])+'</b><div class="small mute">'+esc(x[2])+'</div>'
    +(ok?'<div class="adone">получено</div>':'<div class="aprog"><i style="width:'+(cur/x[4]*100)+'%"></i></div><div class="small mute">'+cur+' из '+x[4]+'</div>')+'</div></div>'}).join('')+'</div></div>';
}
function stageRow(st){
 const ts=TOPICS.filter(t=>t.stage===st.id),d=ts.filter(t=>topicStatus(t.id)==='done').length;
 return '<a class="item" href="#st-'+st.id+'"><span class="t"><b>Этап '+st.id+'. '+esc(st.title)+'</b><br><span class="small mute">'+d+' из '+ts.length+' тем · '+ts.reduce((a,t)=>a+t.blocks,0)+' блоков</span></span><span class="prog">'+progressBar(d/ts.length*100)+'<b class="pct">'+Math.round(d/ts.length*100)+'%</b></span></a>';
}
const STAGE_ICON=['🛠','🔤','🧠','✨','🧪','⚡','🌐','🗄','🧱','🔐','🏛','🚀','📨','🔗','📡','🖥','🎯','⏱','🎓'];
function mapStage(st,cur){
 const ts=TOPICS.filter(t=>t.stage===st.id),d=ts.filter(t=>topicStatus(t.id)==='done').length,pct=d/ts.length*100;
 const state=d===ts.length?'done':(st.id===cur?'cur':'next');
 const blocks=ts.reduce((a,t)=>a+t.blocks,0),hrs=Math.round(blocks*50/60*10)/10;
 const nt=ts.find(t=>topicStatus(t.id)!=='done');
 const badge={done:'Пройден',cur:'Сейчас здесь',next:'Впереди'}[state];
 return '<div class="mstage '+state+'"><div class="mnode">'+(state==='done'?'✓':STAGE_ICON[st.id]||st.id)+'</div>'
  +'<div class="card mcardstage"><div class="row"><span class="small mute">Этап '+st.id+'</span><span class="mbadge '+state+'">'+badge+'</span><span class="sp"></span><b class="pct">'+Math.round(pct)+'%</b></div>'
  +'<h3><a class="nolink" href="#st-'+st.id+'">'+esc(st.title)+'</a></h3>'
  +progressBar(pct)
  +'<div class="mdots" aria-label="Темы этапа">'+ts.map(t=>'<a class="dot s-'+topicStatus(t.id)+'" href="#t-'+t.id+'" title="'+esc(t.title)+' · '+STAT[topicStatus(t.id)]+'"></a>').join('')+'</div>'
  +'<div class="small mute">'+d+' из '+ts.length+' тем · '+blocks+' блоков · ≈ '+hrs+' ч</div>'
  +'<div class="row mact"><a class="btn sm'+(state==='cur'?' pri':'')+'" href="#st-'+st.id+'">Открыть этап</a>'+(nt&&state!=='done'?'<a class="btn sm ghost" data-act="opennote" href="#t-'+nt.id+'">'+(state==='cur'?'Продолжить':'Начать')+': '+esc(nt.title)+'</a>':'')+'</div>'
  +'</div></div>';
}
function vMap(){
 const total=TOPICS.length,done=TOPICS.filter(t=>topicStatus(t.id)==='done').length,pct=done/total*100;
 const left=TOPICS.filter(t=>topicStatus(t.id)!=='done').reduce((a,t)=>a+t.blocks,0);
 const cur=(STAGES.find(st=>TOPICS.filter(t=>t.stage===st.id).some(t=>topicStatus(t.id)!=='done'))||{}).id;
 const nt=nextTopic();
 return '<h1>Карта обучения</h1>'
 +'<div class="card shero">'+ring(pct)+'<div class="shtxt"><div class="small mute">Твой путь по Go</div><h2 style="margin:2px 0 8px">'+(cur!==undefined?'Сейчас: этап '+cur+'. '+esc(STAGES[cur].title):'Все этапы пройдены')+'</h2>'
 +'<div class="tmeta"><span class="chip ok">освоено тем: '+done+' из '+total+'</span><span class="chip">осталось блоков: '+left+'</span><span class="chip">≈ '+Math.round(left*50/60)+' ч занятий</span></div>'
 +(nt?'<p><a class="btn pri" data-act="opennote" href="#t-'+nt.id+'">Продолжить: '+esc(nt.title)+'</a></p>':'')+'</div></div>'
 +'<p class="small mute maplegend"><span class="dot s-new"></span> не начата <span class="dot s-wip"></span> в работе <span class="dot s-done"></span> освоена <span class="dot s-redo"></span> на повторе. Точки внутри этапа это темы: нажми, чтобы открыть.</p>'
 +'<div class="mroad">'+STAGES.map(st=>mapStage(st,cur)).join('')+'</div>'
 +'<div class="card"><h3>Дальше: Middle и Senior</h3>'+LEVELS_NEXT.map(l=>'<p><b>'+l[0]+'.</b> '+esc(l[1])+'</p>').join('')+'</div>';
}
function topicRow(t){
 const st=topicStatus(t.id);
 return '<a class="item" href="#t-'+t.id+'"><span class="t"><b>'+esc(t.title)+'</b><br><span class="small mute">'+DIFF[t.diff]+' · '+(t.req?'обяз.':'жел.')+' · блоков: '+t.blocks+(t.d?' · есть конспект':'')+'</span></span><span class="small stt'+(st==='done'?' done':'')+'">'+STAT[st]+'</span></a>';
}
let stageFilter='all',stageReq=false;
const DIFF_T=['','Лёгкая','Средняя','Сложная'];
function ring(p){const r=34,c=2*Math.PI*r;return '<svg class="ring" viewBox="0 0 80 80" role="img" aria-label="Прогресс '+Math.round(p)+'%"><circle cx="40" cy="40" r="'+r+'" class="rb"/><circle cx="40" cy="40" r="'+r+'" class="rf" stroke-dasharray="'+(c*p/100).toFixed(1)+' '+c.toFixed(1)+'" transform="rotate(-90 40 40)"/><text x="40" y="45" text-anchor="middle">'+Math.round(p)+'%</text></svg>'}
function stageTopicCard(t,n){
 const st=topicStatus(t.id),nb=S.blocks.filter(b=>b.topic===t.id&&!b.done).sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:a.start-b.start)[0];
 const href='#t-'+t.id,hasNote=!!t.d;
 // Главная кнопка = следующий шаг по теме; вторая = смена статуса; третья = запланировать
 const main={new:['Начать','wip',true],wip:['Продолжить','',true],redo:['Повторить','',true],done:[hasNote?'Читать конспект':'Открыть','',false]}[st];
 const second={new:['done','Уже знаю ✓'],wip:['done','Освоена ✓'],redo:['done','Освоена ✓'],done:['redo','На повтор']}[st];
 const hrs=Math.round(t.blocks*50/60*10)/10;
 return '<div class="tc st-'+st+'"><div class="tnum">'+(st==='done'?'✓':n)+'</div><div class="tbody"><div class="tmain">'
 +'<a class="ttl nolink" href="#t-'+t.id+'">'+esc(t.title)+'</a>'
 +'<p class="small mute twhat">'+esc(t.what)+'</p>'
 +'<div class="row tact"><a class="btn sm'+(main[2]?' pri':'')+'" data-act="opennote" data-id="'+t.id+'"'+(main[1]?' data-st="'+main[1]+'"':'')+' href="'+href+'">'+main[0]+'</a>'
 +'<button class="btn sm" data-act="status" data-id="'+t.id+'" data-st="'+second[0]+'">'+second[1]+'</button>'
 +(!nb&&st!=='done'?'<button class="btn sm ghost" data-act="plan" data-id="'+t.id+'" title="Поставить блок в календарь">📅 В календарь</button>':'')+'</div></div>'
 +'<div class="tinfo"><span class="small stt'+(st==='done'?' done':'')+'">'+STAT[st]+'</span>'
 +'<ul><li><span class="ic">'+DIFF[t.diff]+'</span>'+DIFF_T[t.diff]+'</li>'
 +'<li><span class="ic">'+(t.req?'●':'○')+'</span>'+(t.req?'обязательная':'желательная')+'</li>'
 +'<li><span class="ic">⏱</span>блоков: '+t.blocks+' · ~'+hrs+' ч</li>'
 +(nb?'<li class="cal"><span class="ic">📅</span>'+fmtD(nb.date)+', '+fmtT(nb.start)+'</li>':'')+'</ul></div>'
 +'</div></div>';
}
function vStage(){
 const st=STAGES[+param];if(!st)return '<p>Этап не найден.</p>';
 const all=TOPICS.filter(t=>t.stage===st.id),cnt=k=>all.filter(t=>topicStatus(t.id)===k).length;
 const done=cnt('done'),pct=all.length?done/all.length*100:0;
 const left=all.filter(t=>topicStatus(t.id)!=='done').reduce((a,t)=>a+t.blocks,0);
 const nt=all.find(t=>topicStatus(t.id)!=='done'&&topicStatus(t.id)!=='redo')||all.find(t=>topicStatus(t.id)==='redo');
 const shown=all.filter(t=>(stageFilter==='all'||topicStatus(t.id)===stageFilter)&&(!stageReq||t.req));
 const fl=[['all','Все',all.length],['wip','В работе',cnt('wip')],['done','Освоены',done],['redo','На повторе',cnt('redo')]];
 const prev=STAGES[st.id-1],next=STAGES[st.id+1];
 return '<div class="row"><a href="#map">← Карта</a><span class="sp"></span>'+(prev?'<a class="btn sm" href="#st-'+prev.id+'">← Этап '+prev.id+'</a>':'')+(next?'<a class="btn sm" href="#st-'+next.id+'">Этап '+next.id+' →</a>':'')+'</div>'
 +'<div class="card shero">'+ring(pct)+'<div class="shtxt"><div class="small mute">Этап '+st.id+' из '+(STAGES.length-1)+'</div><h1>'+esc(st.title)+'</h1>'
 +'<div class="tmeta"><span class="chip ok">освоено: '+done+' из '+all.length+'</span><span class="chip">осталось блоков: '+left+'</span><span class="chip">≈ '+Math.round(left*50/60*10)/10+' ч занятий</span></div>'
 +(nt?'<p><a class="btn pri" href="#t-'+nt.id+'">'+(topicStatus(nt.id)==='wip'?'Продолжить':'Начать')+': '+esc(nt.title)+'</a></p>':'<p><b>Этап пройден 🎉</b></p>')
 +'</div></div>'
 +'<div class="stlayout"><div class="stmain">'
 +'<div class="row filters">'+fl.map(f=>'<button class="btn sm'+(stageFilter===f[0]?' on':'')+'" data-act="sfilter" data-v="'+f[0]+'">'+f[1]+' · '+f[2]+'</button>').join('')+'<span class="sp"></span><label class="chk"><input type="checkbox" data-act="sreq"'+(stageReq?' checked':'')+'> только обязательные</label></div>'
 +'<div class="tlist">'+(shown.length?shown.map(t=>stageTopicCard(t,all.indexOf(t)+1)).join(''):'<div class="card mute">По этому фильтру тем нет.</div>')+'</div></div>'
 +'<aside class="stside"><div class="card tip"><h3>Как учить тебе</h3><p class="small">'+esc(st.how)+'</p></div></aside></div>';
}
function renderBlocks(bs){
 return bs.map(b=>{const k=b[0];
  if(k==='p')return '<p>'+b[1]+'</p>';
  if(k==='h')return '<h3>'+esc(b[1])+'</h3>';
  if(k==='real')return '<div class="real"><div class="rhead"><b>В реальной разработке</b><span class="freq" title="Как часто это встречается в рабочем коде">'+[1,2,3,4,5].map(i=>'<i'+(i<=b[1]?' class="on"':'')+'></i>').join('')+'<em>'+esc(b[2])+'</em></span></div><ul>'+b[3].map(x=>'<li>'+x+'</li>').join('')+'</ul></div>';
  if(k==='case')return '<div class="case"><div class="chead">💼 '+esc(b[1])+'</div>'+b[2]+'</div>';
  if(k==='ol')return '<ol class="steps">'+b[1].map(x=>'<li>'+x+'</li>').join('')+'</ol>';
  if(k==='src')return '<div class="srcs"><h3>Источники и где читать дальше</h3>'+b[1].map(l=>'<a class="item" href="'+esc(l[1])+'" target="_blank" rel="noopener noreferrer"><span>📘</span><span class="t"><b>'+esc(l[0])+'</b><br><span class="small mute">'+esc(l[2])+'</span></span><span class="chip">'+(l[3]==='ru'?'RU':'EN')+'</span></a>').join('')+'</div>';
  if(k==='ul')return '<ul>'+b[1].map(x=>'<li>'+x+'</li>').join('')+'</ul>';
  if(k==='code')return '<pre><code>'+esc(b[1])+'</code></pre>';
  if(k==='out')return '<pre class="out"><code>'+esc(b[1])+'</code></pre>';
  if(k==='warn')return '<div class="callout">'+b[1]+'</div>';
  if(k==='tbl'||k==='mem')return '<div class="tw"><table><thead><tr>'+b[1].map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+b[2].map(r=>'<tr>'+r.map(c=>'<td>'+c+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
  return '';}).join('');
}
function linkRow(l){
 const dq=esc((l[1]+' '+l[2]).toLowerCase());
 const ic={art:'📄',doc:'📘',video:'▶️',course:'🎓',trainer:'🧩'}[l[0]]||'🔗';
 const tn={art:'Статья',doc:'Документация',video:'Видео',course:'Курс',trainer:'Тренажёр'}[l[0]];
 return '<a class="item" data-type="'+esc(l[0])+'" data-lang="'+(l[3]==='ru'?'ru':'en')+'" data-q="'+dq+'" href="'+esc(l[2])+'" target="_blank" rel="noopener noreferrer"><span>'+ic+'</span><span class="t">'+esc(l[1])+'</span>'+(tn?'<span class="chip type">'+tn+'</span>':'')+'<span class="chip">'+(l[3]==='ru'?'RU':'EN')+'</span></a>';
}
function vTopic(){
 const t=TBY[param];if(!t)return '<p>Тема не найдена.</p>';
 const st=topicStatus(t.id);
 const tabs=[['note','Конспект'],['mat','Материалы'],['my','Мои заметки'],['task','Практика'+(practiceDone(t.id)?' '+practiceDone(t.id)+'/'+practiceItems(t).length:'')]];
 let body='';
 if(topicTab==='note'){
  body=t.d?renderBlocks(t.d.b)+'<div class="card"><h3>Проверь себя</h3><p class="small mute">Сначала ответь сама, потом открой. Ответ без «почему» не засчитывается.</p>'+t.d.q.map(q=>'<details><summary>'+esc(q[0])+'</summary><p>'+esc(q[1])+'</p></details>').join('')+'</div>'
   :'<div class="callout">Конспект для этой темы появится, когда дойдём до неё: я напишу его в ходе занятия и добавлю сюда.</div>';
 }else if(topicTab==='mat'){
  const ls=(t.d?t.d.l:[]).concat(S.links.filter(l=>l.topic===t.id).map(l=>[l.type,l.title,l.url,l.lang]));
  const hasVid=ls.some(l=>l[0]==='video');
  body='<div class="list">'+(ls.length?ls.map(linkRow).join(''):'<p class="mute">Материалов пока нет.</p>')+'</div>'+(hasVid?'':'<p class="small mute">Видео: подтверждённых ссылок для этой темы пока нет. Найдёшь хорошее, добавь ниже.</p>')
   +'<div class="card"><h3>Добавить ссылку</h3><form data-form="addlink"><input type="hidden" name="topic" value="'+t.id+'"><label>Название</label><input type="text" name="title" required><label>Адрес</label><input type="url" name="url" required placeholder="https://"><div class="row"><div><label>Тип</label><select name="type"><option value="art">Статья</option><option value="video">Видео</option><option value="course">Курс</option><option value="doc">Документация</option><option value="trainer">Тренажёр</option></select></div><div><label>Язык</label><select name="lang"><option value="ru">RU</option><option value="en">EN</option></select></div></div><p><button class="btn pri" type="submit">Добавить</button></p></form></div>';
 }else if(topicTab==='my'){
  body='<label for="nt">Заметки к теме (сохраняются сразу)</label><textarea id="nt" data-note="'+t.id+'" style="min-height:200px">'+esc(S.notes[t.id]||'')+'</textarea>';
 }else{
  body=practiceBlock(t);
 }
 const ti=TOPICS.indexOf(t),pv=TOPICS[ti-1],nx=TOPICS[ti+1];
 const sameStage=TOPICS.filter(x=>x.stage===t.stage),pi=practiceItems(t).length,pdn=practiceDone(t.id);
 const nb=S.blocks.filter(b=>b.topic===t.id&&!b.done).sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:a.start-b.start)[0];
 const stIcon={new:'○',wip:'◐',done:'✓',redo:'↻'};
 const hero='<div class="card thero"><div class="thmain"><div class="small mute">Этап '+t.stage+' · '+esc(STAGES[t.stage].title)+' · тема '+(sameStage.indexOf(t)+1)+' из '+sameStage.length+'</div>'
  +'<h1>'+esc(t.title)+'</h1>'
  +'<div class="tmeta"><span class="chip">'+DIFF[t.diff]+' '+DIFF_T[t.diff]+'</span><span class="chip">'+(t.req?'обязательная':'желательная')+'</span><span class="chip">блоков: '+t.blocks+' · ~'+Math.round(t.blocks*50/60*10)/10+' ч</span>'+(t.d?'<span class="chip ok">есть конспект</span>':'')+'</div>'
  +'<div class="seg" role="group" aria-label="Статус темы">'+['new','wip','done','redo'].map(k=>'<button class="seg-b s-'+k+(st===k?' on':'')+'" data-act="status" data-id="'+t.id+'" data-st="'+k+'" aria-pressed="'+(st===k)+'"><span>'+stIcon[k]+'</span> '+STAT[k]+'</button>').join('')+'</div></div>'
  +'<div class="thside"><div class="small mute">Практика</div>'
  +(pi?progressBar(pdn/pi*100)+'<div class="small">'+pdn+' из '+pi+' заданий · <a href="#t-'+t.id+'" data-act="tab" data-tab="task">открыть</a></div>':'<div class="small mute">заданий нет</div>')
  +'<div class="small mute thgap">Календарь</div>'
  +(nb?'<div class="small"><b>📅 '+fmtD(nb.date)+', '+fmtT(nb.start)+'</b></div>':'<div class="small mute">блок не запланирован</div>')
  +'<button class="btn sm" data-act="plan" data-id="'+t.id+'">'+(nb?'+ ещё блок':'Запланировать блок')+'</button></div></div>';
 const tile=(ic,ttl,txt)=>'<div class="ttile"><div class="tt"><span class="ti">'+ic+'</span><b>'+ttl+'</b></div><p>'+esc(txt)+'</p></div>';
 const tiles='<div class="ttiles">'+tile('🎯','Что понять',t.what)+tile('💡','Зачем это нужно',t.why)+tile('✅','Как проверить себя',t.verify)+'</div>';
 const bottomNav='<div class="topicnav">'+(pv?'<a class="tn prev" data-act="opennote" href="#t-'+pv.id+'"><span class="small mute">← Предыдущая тема</span><b>'+esc(pv.title)+'</b></a>':'<span></span>')+(nx?'<a class="tn next" data-act="opennote" href="#t-'+nx.id+'"><span class="small mute">Следующая тема →</span><b>'+esc(nx.title)+'</b></a>':'<span></span>')+'</div>';
 return '<div class="row topnav"><a href="#st-'+t.stage+'">← Этап '+t.stage+'. '+esc(STAGES[t.stage].title)+'</a><span class="sp"></span>'+(S.termHide?'<button class="btn sm" data-act="termtoggle">Открыть терминал</button>':'')+(pv?'<a class="btn sm" data-act="opennote" href="#t-'+pv.id+'" title="'+esc(pv.title)+'">← Предыдущая</a>':'')+(nx?'<a class="btn sm" data-act="opennote" href="#t-'+nx.id+'" title="'+esc(nx.title)+'">Следующая →</a>':'')+'</div>'
 +'<div class="tlayout'+(S.termHide?' noterm':'')+'"><div class="tcol">'+hero+tiles
 +'<div class="tabs" role="tablist">'+tabs.map(x=>'<button class="btn sm'+(topicTab===x[0]?' on':'')+'" role="tab" aria-selected="'+(topicTab===x[0])+'" data-act="tab" data-tab="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>'
 +'<div class="card">'+body+'</div>'+bottomNav+'</div>'+(S.termHide?'':terminalHtml(t))+'</div>';
}
function topicOptions(sel){return '<option value="">— без темы —</option>'+STAGES.map(st=>'<optgroup label="Этап '+st.id+'">'+TOPICS.filter(t=>t.stage===st.id).map(t=>'<option value="'+t.id+'"'+(t.id===sel?' selected':'')+'>'+esc(t.title)+'</option>').join('')+'</optgroup>').join('')}
// ---------- практика: задания берутся из конспекта, вводить ничего не нужно ----------
function practiceItems(t){
 const bl=t.d?t.d.b:[];
 const pick=re=>{let r=null;bl.forEach((b,i)=>{if(b[0]==='h'&&re.test(b[1])&&bl[i+1]&&bl[i+1][0]==='ol')r=bl[i+1][1]});return r};
 const own=pick(/практик/i)||pick(/как делать|задани/i);
 if(own&&own.length)return own;
 return ['Разобрать тему: '+esc(t.what),'Проверить себя: '+esc(t.verify)];
}
function practiceDone(id){return Object.keys(S.practice[id]||{}).filter(k=>S.practice[id][k]).length}
function practiceTotal(){return Object.keys(S.practiceAt).length}
function practiceList(t){
 const items=practiceItems(t),st=S.practice[t.id]||{};
 return '<div class="plist">'+items.map((x,i)=>'<label class="pitem'+(st[i]?' on':'')+'"><input type="checkbox" data-act="ptoggle" data-id="'+t.id+'" data-i="'+i+'"'+(st[i]?' checked':'')+'><span class="ptxt"><b>'+(i+1)+'.</b> '+x+'</span></label>').join('')+'</div>';
}
function practiceBlock(t){
 const n=practiceItems(t).length,d=practiceDone(t.id),all=d>=n;
 return '<div class="row"><b class="sp">Выполнено '+d+' из '+n+'</b><span class="chip">'+DIFF[t.diff]+' '+DIFF_T[t.diff]+'</span></div>'+progressBar(d/n*100)
  +'<p class="small mute pverify"><b>Как проверить:</b> '+esc(t.verify)+'</p>'
  +practiceList(t)
  +(all&&topicStatus(t.id)!=='done'?'<div class="callout"><b>Все задания выполнены.</b> Если можешь объяснить тему без подсказок, отметь её освоенной.<p><button class="btn pri sm" data-act="status" data-id="'+t.id+'" data-st="done">Отметить тему освоенной</button></p></div>':'')
  +(all&&topicStatus(t.id)==='done'?'<p class="small mute">Тема освоена. Повторения поставлены автоматически.</p>':'');
}
let taskFilter='all';
function vTasks(){
 const t0=todayS(),nt=nextTopic(),todayBlocks=S.blocks.filter(b=>b.date===t0&&isGo(b)).sort((a,b)=>a.start-b.start);
 const totalItems=TOPICS.reduce((a,t)=>a+practiceItems(t).length,0),doneItems=TOPICS.reduce((a,t)=>a+practiceDone(t.id),0);
 let h='<h1>Практика</h1><p class="mute">Задания берутся из конспектов тем, записывать ничего не нужно: открой тему, делай и отмечай. Всего выполнено: <b>'+doneItems+'</b> из '+totalItems+'.</p>';
 h+='<div class="card"><h3>Практика на сегодня</h3>'
  +(isWE(t0)?'<p class="mute">Сегодня выходной, занятий по плану нет.</p>':
    (todayBlocks.length?'<p class="small mute">По календарю: '+todayBlocks.map(b=>fmtT(b.start)+' '+esc(b.title)).join('; ')+'</p>':'<p class="small mute">Блоков на сегодня в календаре нет.</p>'))
  +(nt?'<p><a class="nolink" href="#t-'+nt.id+'" data-act="openpractice"><b>'+esc(nt.title)+'</b></a> <span class="small mute">Этап '+nt.stage+'</span></p>'+practiceBlock(nt)
     +'<p><a class="btn sm" href="#t-'+nt.id+'" data-act="openpractice">Открыть тему</a></p>':'<p>Все темы пройдены.</p>')
  +'</div>';
 const fl=[['all','Все'],['todo','Не выполнено'],['done','Выполнено']];
 h+='<div class="row filters">'+fl.map(f=>'<button class="btn sm'+(taskFilter===f[0]?' on':'')+'" data-act="tfilter" data-v="'+f[0]+'">'+f[1]+'</button>').join('')+'</div>';
 h+=STAGES.map(st=>{
  const ts=TOPICS.filter(t=>t.stage===st.id);
  const rows=ts.filter(t=>{const n=practiceItems(t).length,d=practiceDone(t.id);return taskFilter==='all'||(taskFilter==='done'?d>=n:d<n)});
  if(!rows.length)return '';
  const sn=ts.reduce((a,t)=>a+practiceItems(t).length,0),sd=ts.reduce((a,t)=>a+practiceDone(t.id),0);
  return '<div class="card"><div class="row"><h3 class="sp" style="margin:0">Этап '+st.id+'. '+esc(st.title)+'</h3><span class="small mute">'+sd+' из '+sn+'</span></div>'
   +rows.map(t=>{const n=practiceItems(t).length,d=practiceDone(t.id);
    return '<a class="item" href="#t-'+t.id+'" data-act="openpractice"><span class="t"><b>'+esc(t.title)+'</b><br><span class="small mute">'+DIFF[t.diff]+' · заданий: '+n+'</span></span><span class="prog">'+progressBar(d/n*100)+'<b class="pct">'+d+'/'+n+'</b></span></a>'}).join('')+'</div>';
 }).join('')||'<div class="card mute">По этому фильтру ничего нет.</div>';
 return h;
}
let matType='all',matLang='all',matStage='all',matQ='';
const MTYPES=[['all','Все'],['trainer','Тренажёры'],['doc','Документация'],['art','Статьи'],['video','Видео'],['course','Курсы']];
function allMatLinks(){
 const out=BASE_LINKS.map(l=>({t:l[0],lang:l[3]})).concat(STEPIK.map(()=>({t:'course',lang:'ru'})));
 TOPICS.forEach(t=>{(t.d?t.d.l:[]).concat(S.links.filter(l=>l.topic===t.id).map(l=>[l.type,l.title,l.url,l.lang])).forEach(l=>out.push({t:l[0],lang:l[3]}))});
 return out;
}
function matBar(withTopics){
 const all=allMatLinks(),cnt=k=>k==='all'?all.length:all.filter(x=>x.t===k).length;
 const stages=[...new Set(withTopics.map(t=>t.stage))];
 return '<div class="card matbar"><input type="search" id="mq" placeholder="Поиск по названию или теме" value="'+esc(matQ)+'" aria-label="Поиск материалов">'
  +'<div class="row">'+MTYPES.filter(x=>x[0]==='all'||cnt(x[0])).map(x=>'<button class="btn sm'+(matType===x[0]?' on':'')+'" data-act="mfilter" data-k="type" data-v="'+x[0]+'">'+x[1]+' · '+cnt(x[0])+'</button>').join('')+'</div>'
  +'<div class="row"><span class="small mute">Язык:</span>'+[['all','Любой'],['ru','RU'],['en','EN']].map(x=>'<button class="btn sm'+(matLang===x[0]?' on':'')+'" data-act="mfilter" data-k="lang" data-v="'+x[0]+'">'+x[1]+'</button>').join('')
  +'<span class="small mute">Раздел:</span><select id="mstage" aria-label="Раздел"><option value="all">Все</option><option value="base"'+(matStage==='base'?' selected':'')+'>Справочники и курсы</option>'+stages.map(i=>'<option value="'+i+'"'+(matStage===String(i)?' selected':'')+'>Этап '+i+'. '+esc(STAGES[i].title)+'</option>').join('')+'</select>'
  +'<span class="sp"></span><b class="small" id="mcount"></b><button class="btn sm ghost" data-act="mreset">Сбросить</button></div></div>';
}
function applyMatFilter(){
 const q=matQ.trim().toLowerCase();let shown=0;
 document.querySelectorAll('.mcard').forEach(c=>{
  const stOk=matStage==='all'||c.dataset.stage===matStage;let any=0;
  c.querySelectorAll('.item[data-type]').forEach(it=>{
   const ok=stOk&&(matType==='all'||it.dataset.type===matType)&&(matLang==='all'||it.dataset.lang===matLang)&&(!q||it.dataset.q.includes(q)||(c.dataset.title||'').includes(q));
   it.hidden=!ok;if(ok)any++;
  });
  c.hidden=!any;shown+=any;
 });
 const n=$('#mcount');if(n)n.textContent='Найдено: '+shown;
 const em=$('#mempty');if(em)em.hidden=shown>0;
}
function vMaterials(){
 const byTopic=TOPICS.filter(t=>t.d&&t.d.l.length||S.links.some(l=>l.topic===t.id));
 return '<h1>Материалы</h1>'+matBar(byTopic)
 +'<div class="card mcard" data-stage="base" data-title="основные справочники"><h3>Основные справочники</h3><div class="list">'+BASE_LINKS.map(linkRow).join('')+'</div></div>'
 +'<div class="card mcard" data-stage="base" data-title="курсы на stepik"><h3>Курсы на Stepik</h3><div class="list">'+STEPIK.map(s=>linkRow(['course',s[0],s[1],'ru'])).join('')+'</div></div>'
 +byTopic.map(t=>{const ls=(t.d?t.d.l:[]).concat(S.links.filter(l=>l.topic===t.id).map(l=>[l.type,l.title,l.url,l.lang]));return '<div class="card mcard" data-stage="'+t.stage+'" data-title="'+esc(t.title.toLowerCase())+'"><h3><a href="#t-'+t.id+'">'+esc(t.title)+'</a></h3><div class="list">'+ls.map(linkRow).join('')+'</div></div>'}).join('')
 +'<div class="card mute" id="mempty" hidden>По этим фильтрам ничего не нашлось. Нажми «Сбросить».</div>'
 +'<div class="card"><h3>Своя ссылка</h3><form data-form="addlink"><label>Название</label><input type="text" name="title" required><label>Адрес</label><input type="url" name="url" required placeholder="https://"><label>Тема</label><select name="topic">'+topicOptions('')+'</select><div class="row"><div><label>Тип</label><select name="type"><option value="art">Статья</option><option value="video">Видео</option><option value="course">Курс</option><option value="doc">Документация</option><option value="trainer">Тренажёр</option></select></div><div><label>Язык</label><select name="lang"><option value="ru">RU</option><option value="en">EN</option></select></div></div><p><button class="btn pri" type="submit">Добавить</button></p></form></div>';
}
function vSetup(){
 return '<h1>Данные и настройки</h1>'
 +'<div class="card"><h3>Тема оформления</h3><div class="row">'+[['auto','Как в системе'],['light','Светлая'],['dark','Тёмная']].map(x=>'<button class="btn sm'+(S.theme===x[0]?' on':'')+'" data-act="theme" data-v="'+x[0]+'">'+x[1]+'</button>').join('')+'</div></div>'
 +'<div class="card"><h3>Расписание пар</h3><p class="small">Взято из твоей Google-таблицы. Числитель с понедельника 14.09.2026, недели чередуются. Сейчас: <b>'+(parity(todayS())==='Ч'?'числитель':'знаменатель')+'</b>. Разовые изменения вноси прямо в календаре: нажми на пару или на работу.</p></div>'
 +'<div class="card"><h3>Резервная копия</h3><p class="small mute">Прогресс, календарь и статистика хранятся только в этом браузере: очистка данных сайта сотрёт всё. Сохрани файл и при необходимости загрузи его обратно.'+(S.lastBackup?' Последняя копия: '+fmtD(S.lastBackup)+'.':' Копий ещё не было.')+'</p><div class="row"><button class="btn pri" data-act="dlbackup">Скачать копию</button><label class="btn" tabindex="0">Загрузить из файла<input type="file" id="impf" accept=".json,application/json" hidden></label></div></div>'
 +'<div class="card"><h3>Сброс</h3><p><button class="btn danger" data-act="reset">Стереть всё</button></p></div>';
}

// ---------- календарь ----------
const HH=64;let CAL0=8*60,CAL1=21*60,calAuto=true;
let quickPre=null; // текст для окна быстрого добавления, пришедший из ссылки
let calScroll=null,calScrollX=0; // положение прокрутки сетки календаря (null: выставить автоматически)
const PAIR_NO={'11:10':3,'12:40':4,'14:10':5,'15:40':6,'17:10':7};
function isMissed(b){const nd=new Date(),nm=nd.getHours()*60+nd.getMinutes(),t=todayS();return !b.done&&(b.date<t||(b.date===t&&b.start+b.dur<=nm))}
function snap(){return JSON.stringify({b:S.blocks,p:S.pairOv,w:S.workOv,d:S.workDef})}
// сообщение с кнопкой «Отменить»: возвращает блоки к снимку
function undoToast(msg,snapshot){
 document.querySelectorAll('.toast').forEach(x=>x.remove());
 const t=document.createElement('div');t.className='toast act';t.setAttribute('role','status');
 const sp=document.createElement('span');sp.textContent=msg;
 const bt=document.createElement('button');bt.type='button';bt.className='btn sm';bt.textContent='Отменить';
 bt.onclick=()=>{const o=JSON.parse(snapshot);if(Array.isArray(o))S.blocks=o;else{S.blocks=o.b;S.pairOv=o.p||{};S.workOv=o.w||{};S.workDef=o.d||null}save();t.remove();rerender()};
 t.appendChild(sp);t.appendChild(bt);document.body.appendChild(t);setTimeout(()=>t.remove(),9000);
}
function updateBlkInfo(){
 const f=document.querySelector('form[data-form=block]'),el=$('#blkinfo');if(!f||!el)return;
 if(!f.start.value||!f.date.value){el.textContent='';return}
 const start=toMin(f.start.value),dur=Math.max(15,+f.dur.value||50),end=Math.min(1440,start+dur);
 const note=f.done.checked?'':conflictNote(f.date.value,start,end,f.id.value||undefined);
 el.className='blkinfo '+(note?'soft':'ok');
 el.textContent=fmtT(start)+'–'+fmtT(end)+'. '+(note?'Пересекается с: '+note+'. Это нормально, можно сохранить.':'Время свободно.');
}
function updateNowLine(){
 const nd=new Date(),nm=nd.getHours()*60+nd.getMinutes(),l=document.querySelector('.nowline');
 if(l&&nm>=CAL0&&nm<=CAL1)l.style.top=(nm-CAL0)/60*HH+'px';
}
function vCalendar(){
 const jump=calMode==='week'?calDate:monthDate;
 const head='<div class="cal-head"><button class="btn sm" data-act="calprev" aria-label="Назад">←</button><button class="btn sm" data-act="caltoday">Сегодня</button><button class="btn sm" data-act="calnext" aria-label="Вперёд">→</button><b class="sp" id="calttl"></b>'
  +'<input type="date" id="caljump" class="caljump" aria-label="Перейти к дате" value="'+jump+'">'
  +'<button class="btn sm'+(calMode==='week'?' on':'')+'" data-act="calmode" data-v="week">Неделя</button><button class="btn sm'+(calMode==='month'?' on':'')+'" data-act="calmode" data-v="month">Месяц</button>'
  +'<button class="btn sm" data-act="quickadd">Быстро добавить</button><button class="btn sm pri" data-act="newblock">+ Дело</button></div>';
 const leg='<p class="small mute legend"><span class="chip" style="background:var(--pair)">пара</span><span class="chip" style="background:color-mix(in srgb,var(--mute) 16%,var(--card))">работа</span><span class="chip">блок Go</span><span class="chip" style="background:color-mix(in srgb,#c98a1b 22%,var(--card))">другое дело</span><span class="chip ok">выполнен</span><span class="chip warn">пропущен</span> Тяни блок, чтобы перенести. Галочка в углу отмечает выполненным. Нажми на пару или работу, чтобы изменить или перенести. Нажми на пустое время, чтобы добавить дело.</p>';
 const st=planStats(),wd=calMode==='week'?[...Array(7)].map((_,i)=>addDays(mondayOf(calDate),i)):null;
 const bar='<div class="calbar'+(st.missed||st.gap?' warn':'')+'">'+planInfo(st)+(wd?weekSummary(wd):'')+'</div>';
 return head+bar+(calMode==='week'?weekView():monthView())+leg;
}
function weekSummary(days){
 const bs=S.blocks.filter(b=>days.includes(b.date)&&isGo(b)),dn=bs.filter(b=>b.done).length,mins=bs.reduce((a,b)=>a+b.dur,0);
 return '<span class="wsum"><span class="wlab">Неделя:</span> <b>'+bs.length+'</b> блоков · <b>'+dn+'</b> выполнено · ≈ <b>'+Math.round(mins/60*10)/10+'</b> ч'+(bs.length?'<span class="wbar">'+progressBar(dn/bs.length*100)+'</span>':'')+'</span>';
}
// видимые часы: 8–21, но шире, если на неделе есть блоки вне этого диапазона
function calRange(days){
 let lo=8*60,hi=21*60;
 S.blocks.forEach(b=>{if(days.includes(b.date)){lo=Math.min(lo,Math.floor(b.start/60)*60);hi=Math.max(hi,Math.ceil((b.start+b.dur)/60)*60)}});
 CAL0=lo;CAL1=Math.min(hi,24*60);
}
// блоки, идущие одновременно, ставим рядом: полосы (lane) внутри дня
function laneLayout(bs){
 const arr=bs.slice().sort((a,b)=>a.start-b.start||String(a.id).localeCompare(String(b.id))),res={};let group=[],gEnd=0;
 const flush=()=>{
  if(!group.length)return;const lanes=[];
  group.forEach(b=>{let i=lanes.findIndex(end=>end<=b.start);if(i<0){i=lanes.length;lanes.push(0)}lanes[i]=b.start+b.dur;res[b.id]={lane:i}});
  group.forEach(b=>{res[b.id].lanes=lanes.length});group=[];
 };
 arr.forEach(b=>{if(group.length&&b.start>=gEnd)flush();group.push(b);gEnd=Math.max(gEnd,b.start+b.dur)});flush();
 return res;
}
function weekView(){
 const mon=mondayOf(calDate),days=[...Array(7)].map((_,i)=>addDays(mon,i)),t=todayS();
 calRange(days);
 const par=parity(mon),H=(CAL1-CAL0)/60*HH,nd=new Date(),nm=nd.getHours()*60+nd.getMinutes();
 let hours='<div class="hours">'+[...Array((CAL1-CAL0)/60)].map((_,i)=>'<div>'+pad(CAL0/60+i)+':00</div>').join('')+'</div>';
 let cols=days.map(d=>{
  const we=isWE(d);let ev='';
  const ps=pairsOn(d),wk=workOn(d);
  if(wk)ev+=evBox(wk.s,wk.e,'work','<b>Работа</b> '+fmtT(wk.s)+'–'+fmtT(wk.e),' data-wd="'+d+'" tabindex="0" role="button" title="Работа: нажми, чтобы изменить время"');
  if(ps.length){const a=ps[0].s-40,b=ps[ps.length-1].e+25;
   ev+=evBox(a,ps[0].s,'travel','дорога · 40 мин');ev+=evBox(ps[ps.length-1].e,b,'travel','дорога · 25 мин');
   ps.forEach(p=>ev+=evBox(p.s,p.e,'pair'+(p.edited?' edited':''),'<b>'+fmtT(p.s)+'–'+fmtT(p.e)+'</b>'+(PAIR_NO[fmtT(p.s)]?' <span class="pno">'+PAIR_NO[fmtT(p.s)]+' пара</span>':'')+'<br>'+esc(p.name)+' ('+esc(p.kind)+(p.room?', '+esc(p.room):'')+')'+(p.note?' <span class="bnote">✎</span>':''),
    ' data-pid="'+esc(p.id)+'" data-date="'+d+'" tabindex="0" role="button" title="'+esc(p.name+(p.note?'. '+p.note:'')+' (нажми, чтобы изменить или перенести)')+'"'))}
  const bs=S.blocks.filter(b=>b.date===d),lay=laneLayout(bs);
  bs.forEach(b=>{
   const miss=isGo(b)&&isMissed(b),stt=b.done?'выполнено':miss?'пропущен':'запланировано';
   const ttl=fmtT(b.start)+'–'+fmtT(Math.min(1440,b.start+b.dur))+' · '+b.title+' ('+stt+')'+(b.note?'. '+b.note:'');
   const chk=b.done?'Снять отметку о выполнении':'Отметить выполненным',L=lay[b.id]||{lane:0,lanes:1};
   const xs=L.lanes>1?'left:calc(3px + (100% - 6px) * '+L.lane+' / '+L.lanes+');right:auto;width:calc((100% - 6px) / '+L.lanes+' - 2px);':'';
   ev+=evBox(b.start,b.start+b.dur,'go'+(b.done?' done':'')+(miss?' missed':'')+(L.lanes>1?' lane':'')+(isGo(b)?'':' oth cat-'+(b.cat||'other')),
    '<button class="bchk" type="button" data-act="bdone" data-id="'+b.id+'" aria-label="'+chk+'" title="'+chk+'">✓</button><b>'+fmtT(b.start)+'</b> '+esc(b.title)+(b.note?' <span class="bnote">✎</span>':''),
    ' data-bid="'+b.id+'" tabindex="0" role="button" title="'+esc(ttl)+'" aria-label="'+esc(ttl)+'"',xs);
  });
  if(d===t&&nm>=CAL0&&nm<=CAL1)ev+='<div class="nowline" style="top:'+(nm-CAL0)/60*HH+'px"><i></i></div>';
  return '<div class="daycol'+(we?' we':'')+(d===t?' today':'')+(d<t?' past':'')+'" data-date="'+d+'" style="height:'+H+'px">'+ev+'</div>';
 });
 const heads='<div class="dayh"></div>'+days.map(d=>'<div class="dayh'+(d===t?' today':'')+(isWE(d)?' we':'')+'">'+DOW[dow(d)-1]+' '+parse(d).getDate()+'</div>').join('');
 return '<p id="calsub" hidden data-ttl="'+fmtD(days[0])+' – '+fmtD(days[6])+' · '+(par==='Ч'?'числитель':'знаменатель')+'"></p><div class="calwrap"><div class="calgrid">'+heads+hours+cols.join('')+'</div></div>';
}
function evBox(a,b,cls,html,attrs,xs){
 if(b<=CAL0||a>=CAL1)return '';
 const top=(Math.max(a,CAL0)-CAL0)/60*HH,h=Math.max(20,(Math.min(b,CAL1)-Math.max(a,CAL0))/60*HH-2);
 return '<div class="ev '+cls+'" style="top:'+top+'px;height:'+h+'px;'+(xs||'')+'"'+(attrs||'')+'>'+html+'</div>';
}
function monthView(){
 const d=parse(monthDate),y=d.getFullYear(),m=d.getMonth();
 const first=iso(new Date(y,m,1)),start=mondayOf(first),t=todayS();
 let cells='';
 for(let i=0;i<42;i++){const s=addDays(start,i);if(i>=35&&parse(s).getMonth()!==m)break;
  const all=S.blocks.filter(b=>b.date===s),bl=all.filter(isGo),dn=bl.filter(b=>b.done).length,ot=all.length-bl.length;
  cells+='<button class="mcell'+(isWE(s)?' we':'')+(parse(s).getMonth()!==m?' out':'')+(s===t?' today':'')+'" data-act="gotoweek" data-date="'+s+'" aria-label="'+fmtD(s)+'"><b>'+parse(s).getDate()+'</b>'+(dow(s)===1?' <span class="small mute">'+parity(s)+'</span>':'')+(bl.length?'<br><span class="chip">Go '+dn+'/'+bl.length+'</span>':'')+(ot?'<br><span class="chip">дел: '+ot+'</span>':'')+'</button>';}
 return '<p class="small mute" id="calsub" data-ttl="'+MONN[m]+' '+y+'">Нажми на день, чтобы открыть неделю. Ч и З у понедельников — числитель и знаменатель.</p><div class="mgrid" style="margin-bottom:4px">'+DOW.map(x=>'<div class="small mute" style="text-align:center">'+x+'</div>').join('')+'</div><div class="mgrid">'+cells+'</div>';
}
function bindCalendar(){
 const sub=$('#calsub'),ttl=$('#calttl');if(sub&&ttl)ttl.textContent=sub.dataset.ttl;
 const nav=document.querySelector('header.top');if(nav)document.documentElement.style.setProperty('--navh',nav.offsetHeight+'px');
 document.querySelectorAll('.daycol').forEach(col=>{
  col.addEventListener('click',e=>{
   if(e.target.closest('.ev.go'))return;
   const y=e.clientY-col.getBoundingClientRect().top;
   const mins=Math.max(CAL0,Math.min(Math.min(CAL1,24*60)-50,CAL0+Math.round(y/HH*60/15)*15));
   openBlock(null,{date:col.dataset.date,start:mins});
  });
 });
 document.querySelectorAll('.ev.pair').forEach(n=>{n.addEventListener('click',()=>openPair(n.dataset.pid,n.dataset.date));n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openPair(n.dataset.pid,n.dataset.date)}})});
 document.querySelectorAll('.ev.work').forEach(n=>{n.addEventListener('click',()=>openWork(n.dataset.wd));n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openWork(n.dataset.wd)}})});
 let touchTap=null; // на телефоне блок не перетаскивают (мешает прокрутке): касание открывает окно блока
 document.querySelectorAll('.ev.go').forEach(n=>{
  n.addEventListener('pointerdown',e=>{if(e.target.closest('.bchk'))return;if(e.pointerType==='touch'){touchTap=n.dataset.bid;return}startDrag(e,n)});
  n.addEventListener('click',e=>{if(e.target.closest('.bchk'))return;if(touchTap===n.dataset.bid){touchTap=null;openBlock(n.dataset.bid)}});
  n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openBlock(n.dataset.bid)}});
 });
}
// при первом открытии страницы календаря показываем вечер: там учёба
function autoScrollCal(){
 const w=$('.calwrap');if(!w||calMode!=='week')return;
 const tc=w.querySelector('.daycol.today'),nd=new Date(),nm=nd.getHours()*60+nd.getMinutes();
 const focus=tc?Math.max(nm,16*60):16*60;
 window.scrollTo(0,Math.max(0,w.getBoundingClientRect().top+scrollY+(focus-CAL0)/60*HH-150));
 if(tc&&w.scrollWidth>w.clientWidth)w.scrollLeft=Math.max(0,tc.offsetLeft-50);
}
const WORK_START=9*60,WORK_END=12*60; // по утрам в будни работа, учёба вечером
function workOn(d){
 const o=S.workOv[d];
 if(o&&o.off)return null;
 if(o&&o.s!=null)return {s:o.s,e:o.e};
 if(isWE(d))return null;
 const def=S.workDef||{s:WORK_START,e:WORK_END},ps=pairsOn(d),e=Math.min(def.e,ps.length?ps[0].s-40:def.e);
 return e>def.s?{s:def.s,e}:null;
}
// почему время занято: работа, пара или дорога (пустая строка, если свободно)
function busyReason(date,s,e){
 if(isWE(date))return 'выходной';
 const w=workOn(date);if(w&&s<w.e&&e>w.s)return 'работа';
 const ps=pairsOn(date);
 for(const p of ps)if(s<p.e&&e>p.s)return 'пара «'+p.name+'»';
 if(ps.length){
  const a=ps[0].s-40,z=ps[ps.length-1].e+25;
  if(s<ps[0].s&&e>a)return 'дорога на пары';
  if(e>ps[ps.length-1].e&&s<z)return 'дорога с пар';
 }
 return '';
}
function overlapPair(date,s,e){return !!busyReason(date,s,e)}
function goConflict(date,s,e,ignoreId){
 // блоки из автоплана гибкие: они сами сдвинутся, поэтому конфликтуют только ручные и выполненные
 const c=S.blocks.find(b=>b.id!==ignoreId&&(b.manual||b.done)&&b.date===date&&s<b.start+b.dur&&e>b.start);
 return c?'блоком «'+c.title+'» ('+fmtT(c.start)+')':'';
}
// полное сообщение о конфликте или пустая строка
function conflictMsg(date,s,e,ignoreId){
 if(isWE(date))return 'Выходной. Блоки на выходные не ставим.';
 if(s<CAL0||e>CAL1)return 'Блок должен целиком укладываться в '+fmtT(CAL0)+'–'+fmtT(CAL1)+'.';
 const r=busyReason(date,s,e);if(r)return 'В это время занято: '+r+'. Выбери другое время.';
 const g=goConflict(date,s,e,ignoreId);if(g)return 'Пересекается с '+g+'. Выбери другое время.';
 return '';
}
// чему мешает время (только для подсказки, сохранять можно в любом случае)
function conflictNote(date,s,e,ignoreId){
 const parts=[],r=busyReason(date,s,e);
 if(r&&r!=='выходной')parts.push(r);
 const c=S.blocks.find(b=>b.id!==ignoreId&&b.date===date&&s<b.start+b.dur&&e>b.start);
 if(c)parts.push('блок «'+c.title+'»');
 return parts.join(', ');
}
// ближайшее свободное вечернее окно для нового блока
function suggestSlot(){
 const nowD=new Date(),nm=nowD.getHours()*60+nowD.getMinutes(),today=todayS();
 const free=(d,st)=>!busyReason(d,st,st+BLOCK_MIN)&&!S.blocks.some(b=>b.date===d&&st<b.start+b.dur&&st+BLOCK_MIN>b.start);
 let d=today;
 for(let i=0;i<21;i++,d=addDays(d,1)){
  if(isWE(d))continue;
  for(const w of (GO_WIN[parity(d)][dow(d)]||[])){
   const [a,b]=w.split('-').map(toMin);
   for(let st=a;st+BLOCK_MIN<=b;st+=BLOCK_STEP){if(d===today&&st<=nm)continue;if(free(d,st))return {date:d,start:st}}
  }
 }
 return {date:nextWeekday(addDays(today,1)),start:17*60+30};
}
// сколько блоков плана не поместилось в календарь
// сводка плана: сколько блоков расставлено, что пропущено и не поместилось
function planStats(){
 const t=todayS(),open=TOPICS.filter(x=>topicStatus(x.id)!=='done'),ids=new Set(open.map(x=>x.id));
 const need=open.reduce((a,x)=>a+Math.max(0,x.blocks-S.blocks.filter(b=>b.topic===x.id&&b.done).length),0);
 const planned=S.blocks.filter(b=>!b.done&&b.date>=t&&!isMissed(b)&&ids.has(b.topic));
 return {planned:planned.length,last:planned.reduce((m,b)=>b.date>m?b.date:m,''),gap:Math.max(0,need-planned.length),missed:S.blocks.filter(b=>isGo(b)&&isMissed(b)).length};
}
function planInfo(st){
 const pl=n=>n%10===1&&n%100!==11?'блок':[2,3,4].includes(n%10)&&![12,13,14].includes(n%100)?'блока':'блоков';
 return '<span class="pi-main" title="Сколько блоков плана обучения сейчас стоит в календаре"><span class="wlab">План:</span> <b>'+st.planned+'</b> '+pl(st.planned)+(st.last?' до '+fmtD(st.last):'')+'</span>'
  +(st.missed?'<span class="pi-miss" title="Блоки, время которых прошло без отметки"><b>пропущено '+st.missed+'</b></span>':'')
  +(st.gap?'<span class="pi-gap" title="Не поместилось до '+fmtD(PLAN_END)+', эти темы пойдут позже"><b>не влезло '+st.gap+'</b></span>':'')
  +(st.missed?'<button class="btn sm pri" data-act="movemissed" title="Поставить пропущенные блоки в ближайшие свободные вечера">Перенести пропущенные</button>':'')
  +'<button class="btn sm ghost" data-act="rebuildplan" title="Заново расставить будущие блоки плана. Сегодняшние, прошлые, ручные и выполненные не меняются">Перестроить план</button>';
}
function tryPlace(b,date,start){
 b.date=date;b.start=start;b.manual=true;save();return true;
}
function startDrag(e,node){
 if(e.button!==undefined&&e.button!==0)return;
 const b=S.blocks.find(x=>x.id===node.dataset.bid);if(!b)return;
 const sx=e.clientX,sy=e.clientY,r0=node.getBoundingClientRect();let moved=false,ghost=null;
 node.setPointerCapture(e.pointerId);
 const target=ev=>{
  const col=[...document.querySelectorAll('.daycol')].find(c=>{const r=c.getBoundingClientRect();return ev.clientX>=r.left&&ev.clientX<r.right});
  if(!col)return null;
  let mins=CAL0+Math.round(((r0.top+(ev.clientY-sy)-col.getBoundingClientRect().top)/HH*60)/15)*15;
  mins=Math.max(CAL0,Math.min(Math.min(CAL1,24*60)-b.dur,mins));
  return {col,mins};
 };
 const clearGhost=()=>{if(ghost){ghost.remove();ghost=null}};
 const mv=ev=>{
  const dx=ev.clientX-sx,dy=ev.clientY-sy;
  if(!moved&&Math.abs(dx)+Math.abs(dy)<6)return;
  moved=true;node.classList.add('drag');node.style.transform='translate('+dx+'px,'+dy+'px)';
  clearGhost();const t=target(ev);if(!t)return;
  const msg=conflictNote(t.col.dataset.date,t.mins,t.mins+b.dur,b.id);
  ghost=document.createElement('div');ghost.className='dropghost'+(msg?' warn':'');
  ghost.style.top=(t.mins-CAL0)/60*HH+'px';ghost.style.height=(b.dur/60*HH-2)+'px';
  ghost.innerHTML='<b>'+fmtT(t.mins)+'–'+fmtT(t.mins+b.dur)+'</b>'+(msg?'<br><small>пересекается: '+esc(msg)+'</small>':'');
  t.col.appendChild(ghost);
 };
 const up=ev=>{
  node.removeEventListener('pointermove',mv);node.removeEventListener('pointerup',up);node.removeEventListener('pointercancel',up);
  try{node.releasePointerCapture(ev.pointerId)}catch(_){}
  clearGhost();
  if(!moved){openBlock(b.id);return}
  const t=target(ev);
  if(!t){rerender();return}
  const sn=snap(),ok=tryPlace(b,t.col.dataset.date,t.mins);
  rerender();if(ok)undoToast('Блок перенесён',sn);
 };
 node.addEventListener('pointermove',mv);node.addEventListener('pointerup',up);node.addEventListener('pointercancel',up);
}
const BCATS=[['work','Работа'],['study','Учёба'],['personal','Личное'],['other','Другое']];
function toggleKind(f){
 const go=f.kind.value==='go';
 f.querySelectorAll('.only-go').forEach(e=>{e.hidden=!go});
 f.querySelectorAll('.only-other').forEach(e=>{e.hidden=go});
}
function openBlock(id,pre){
 const b=id?S.blocks.find(x=>x.id===id):null;
 const nt=nextTopic(),slot=suggestSlot();
 const v=b||Object.assign({kind:'go',cat:'other',title:nt?'Go: '+nt.title:'Go',topic:nt?nt.id:'',date:slot.date,start:slot.start,dur:50,done:false},pre||{});
 const kind=v.kind==='other'?'other':'go';
 const m=document.createElement('div');m.className='modal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');
 m.innerHTML='<form class="box" data-form="block"><h3>'+(b?'Дело':'Новое дело')+'</h3>'
  +'<label>Что это</label><select name="kind"><option value="go"'+(kind==='go'?' selected':'')+'>Занятие по Go (из плана обучения)</option><option value="other"'+(kind==='other'?' selected':'')+'>Другое дело</option></select>'
  +'<label>Название</label><input type="text" name="title" required value="'+esc(v.title)+'">'
  +'<div class="only-go"><label>Тема</label><select name="topic">'+topicOptions(v.topic)+'</select></div>'
  +'<div class="only-other"><label>Категория</label><select name="cat">'+BCATS.map(c=>'<option value="'+c[0]+'"'+(v.cat===c[0]?' selected':'')+'>'+c[1]+'</option>').join('')+'</select></div>'
  +'<div class="row"><div><label>Дата</label><input type="date" name="date" required value="'+v.date+'"></div><div><label>Начало</label><input type="time" name="start" required step="300" value="'+fmtT(v.start)+'"></div></div>'
  +'<div class="row moveq"><span class="small mute">Перенести:</span>'+[['today','Сегодня'],['tomorrow','Завтра'],['d1','+1 день'],['w1','+1 неделя'],['am','Утро'],['day','День'],['eve','Вечер']].map(x=>'<button class="btn sm" type="button" data-act="mvq" data-k="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>'
  +'<label>Длительность, мин</label><input type="number" name="dur" min="15" max="600" step="5" value="'+v.dur+'"><div class="row durq">'+[30,45,50,60,90].map(n=>'<button class="btn sm" type="button" data-act="setdur" data-v="'+n+'">'+n+'</button>').join('')+'</div><div class="blkinfo" id="blkinfo"></div>'
  +'<label><input type="checkbox" name="done"'+(v.done?' checked':'')+'> Выполнено</label>'
  +'<label>Заметка</label><textarea name="note" rows="2" placeholder="Что сделать, ссылка, вопрос">'+esc(v.note||'')+'</textarea>'
  +'<input type="hidden" name="id" value="'+(b?b.id:'')+'">'
  +'<p class="row"><button class="btn pri" type="submit">Сохранить</button><button class="btn" type="button" data-act="closemodal">Отмена</button>'+(b?'<span class="sp"></span><button class="btn" type="button" data-act="dupblock" data-id="'+b.id+'">Копия на завтра</button><button class="btn danger" type="button" data-act="delblock" data-id="'+b.id+'">Удалить</button>':'')+'</p></form>';
 document.body.appendChild(m);toggleKind(m.querySelector('form'));updateBlkInfo();const f=m.querySelector('input[name=title]');f&&f.focus();
}
// окно пары: изменить время, аудиторию, перенести на другой день, отменить
function openPair(id,date){
 const od=id.split('|')[0],bp=basePairs(od).find(x=>x.id===id);if(!bp)return;
 const cur=pairsOn(date).find(x=>x.id===id)||bp;
 const m=document.createElement('div');m.className='modal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');
 m.innerHTML='<form class="box" data-form="pair"><h3>Пара</h3><p class="small mute">По расписанию: '+esc(bp.name)+', '+fmtD(od)+', '+fmtT(bp.s)+'–'+fmtT(bp.e)+'. Правка действует только для этого занятия.</p>'
  +'<label>Название</label><input type="text" name="name" required value="'+esc(cur.name)+'">'
  +'<label>Аудитория</label><input type="text" name="room" value="'+esc(cur.room||'')+'">'
  +'<div class="row"><div><label>Дата</label><input type="date" name="date" required value="'+date+'"></div><div><label>Начало</label><input type="time" name="start" required step="300" value="'+fmtT(cur.s)+'"></div><div><label>Конец</label><input type="time" name="end" required step="300" value="'+fmtT(cur.e)+'"></div></div>'
  +'<label>Заметка</label><textarea name="note" rows="2" placeholder="Например: перенесли, взять ноутбук">'+esc(cur.note||'')+'</textarea><input type="hidden" name="pid" value="'+esc(id)+'">'
  +'<p class="row"><button class="btn pri" type="submit">Сохранить</button><button class="btn" type="button" data-act="closemodal">Отмена</button><span class="sp"></span>'+(S.pairOv[id]?'<button class="btn" type="button" data-act="pairreset" data-pid="'+esc(id)+'">Как в расписании</button>':'')+'<button class="btn danger" type="button" data-act="pairoff" data-pid="'+esc(id)+'">Пары не будет</button></p></form>';
 document.body.appendChild(m);
}
// окно работы: время на этот день, выходной, или для всех будней
function openWork(date){
 const w=workOn(date)||{s:WORK_START,e:WORK_END},o=S.workOv[date];
 const m=document.createElement('div');m.className='modal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');
 m.innerHTML='<form class="box" data-form="work"><h3>Работа, '+fmtD(date)+'</h3>'
  +'<div class="row"><div><label>С</label><input type="time" name="start" step="300" value="'+fmtT(w.s)+'"></div><div><label>До</label><input type="time" name="end" step="300" value="'+fmtT(w.e)+'"></div></div>'
  +'<label><input type="checkbox" name="all"> Так во все будни (по умолчанию)</label>'
  +'<label><input type="checkbox" name="off"> В этот день работы нет</label><input type="hidden" name="wdate" value="'+date+'">'
  +'<p class="row"><button class="btn pri" type="submit">Сохранить</button><button class="btn" type="button" data-act="closemodal">Отмена</button>'+(o?'<span class="sp"></span><button class="btn" type="button" data-act="workreset" data-wd="'+date+'">Как по умолчанию</button>':'')+'</p></form>';
 document.body.appendChild(m);
}

// ---------- таймер ----------
let tick=null;
function tLeft(){const T=S.timer;return T.endAt?Math.max(0,Math.round((T.endAt-Date.now())/1000)):T.left}
function fmtS(s){return pad(Math.floor(s/60))+':'+pad(s%60)}
function renderTimer(){
 const T=S.timer,pill=$('#tpill');if(!pill)return;
 const l=tLeft();pill.textContent=(T.mode==='work'?'Блок ':'Отдых ')+fmtS(l);pill.classList.toggle('run',!!T.endAt);
 const p=$('#tpanel');if(p&&!p.hidden){const d=$('#tdisp');if(d)d.textContent=fmtS(l);const bt=$('#tgo');if(bt)bt.textContent=T.endAt?'Пауза':'Старт'}
 if(T.endAt&&l<=0)finishTimer();
}
function finishTimer(){
 const T=S.timer;
 if(T.mode==='work'){S.sessions.push({date:todayS(),min:Math.round(T.dur/60),topic:T.topic||'',mode:'timer',at:Date.now()});
  const tip=REST_TIPS[Math.floor(Math.random()*REST_TIPS.length)];
  S.timer={mode:'rest',dur:600,endAt:null,left:600,topic:T.topic};toast('Блок закончен. '+tip);document.title='✔ Блок готов';}
 else{S.timer={mode:'work',dur:2700,endAt:null,left:2700,topic:T.topic};toast('Отдых закончен. Можно начинать следующий блок.')}
 save();renderTimer();if(route==='home')render();
}
function timerPanel(){
 const T=S.timer;
 return '<div class="card" style="margin:0"><h3 id="tdisp" style="font-size:36px;text-align:center;margin:0">'+fmtS(tLeft())+'</h3><p class="small mute" style="text-align:center">'+(T.mode==='work'?'Рабочий блок':'Отдых')+'</p><div class="row" style="justify-content:center"><button class="btn pri" id="tgo" data-act="tgo">'+(T.endAt?'Пауза':'Старт')+'</button><button class="btn" data-act="treset">Сброс</button></div><div class="row" style="justify-content:center;margin-top:8px"><button class="btn sm" data-act="tmode" data-v="work">Блок 45</button><button class="btn sm" data-act="tmode" data-v="rest">Отдых 10</button></div><label>Тема блока</label><select id="ttopic" data-act="ttopic">'+topicOptions(T.topic)+'</select></div>';
}
function timerAct(a,el){
 const T=S.timer;
 if(a==='tgo'){if(T.endAt){T.left=tLeft();T.endAt=null}else{T.endAt=Date.now()+T.left*1000;document.title='Go Path'}save();renderTimer()}
 if(a==='treset'){const el0=T.dur-tLeft();if(T.mode==='work'&&el0>=300)S.sessions.push({date:todayS(),min:Math.round(el0/60),topic:T.topic||'',mode:'partial',at:Date.now()});T.endAt=null;T.left=T.dur;save();renderTimer()}
 if(a==='tmode'){const v=el.dataset.v;S.timer={mode:v,dur:v==='work'?2700:600,endAt:null,left:v==='work'?2700:600,topic:T.topic};save();renderTimer()}
}

// ---------- события ----------
document.addEventListener('click',e=>{
 const el=e.target.closest('[data-act]');if(!el)return;
 const a=el.dataset.act,id=el.dataset.id;
 if(['tgo','treset','tmode'].includes(a)){timerAct(a,el);return}
 if(a==='status'){const y=scrollY;setStatus(id,el.dataset.st);render();if(route==='stage')scrollTo(0,y)}
 else if(a==='opennote'){topicTab='note';if(el.dataset.st)setStatus(id,el.dataset.st)}
 else if(a==='dlbackup'){
  const blob=new Blob([JSON.stringify(S,null,1)],{type:'application/json'}),u=URL.createObjectURL(blob),l=document.createElement('a');
  l.href=u;l.download='go-path-backup-'+todayS()+'.json';document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);
  S.lastBackup=todayS();save();toast('Копия сохранена в папку загрузок');render()}
 else if(a==='quickadd'){openQuick('')}
 else if(a==='runcode'){runCode()}
 else if(a==='resetcode'){const id=$('#term').dataset.id;delete S.code[id];save();const ta=$('#codeed');ta.value=starterCode(TBY[id]);updateGutter();$('#termout').textContent='';const st=$('#termstatus');st.className='term-st';st.textContent='Код сброшен к примеру из конспекта'}
 else if(a==='termtoggle'){S.termHide=!S.termHide;save();const y=scrollY;render();scrollTo(0,y)}
 else if(a==='pairoff'){const sn=snap(),pid=el.dataset.pid;S.pairOv[pid]=Object.assign({},S.pairOv[pid]||{},{off:true});save();const m=$('.modal');m&&m.remove();rerender();undoToast('Пара убрана из этого дня',sn)}
 else if(a==='pairreset'){const sn=snap();delete S.pairOv[el.dataset.pid];save();const m=$('.modal');m&&m.remove();rerender();undoToast('Пара возвращена как в расписании',sn)}
 else if(a==='workreset'){const sn=snap();delete S.workOv[el.dataset.wd];save();const m=$('.modal');m&&m.remove();rerender();undoToast('Работа возвращена по умолчанию',sn)}
 else if(a==='mvq'){const f=document.querySelector('form[data-form=block]');if(f){
  const k=el.dataset.k,add=n=>{f.date.value=addDays(f.date.value||todayS(),n)};
  if(k==='today')f.date.value=todayS();else if(k==='tomorrow')f.date.value=addDays(todayS(),1);else if(k==='d1')add(1);else if(k==='w1')add(7);
  else if(k==='am')f.start.value='09:00';else if(k==='day')f.start.value='14:00';else if(k==='eve')f.start.value='18:00';
  updateBlkInfo()}}
 else if(a==='dupblock'){const b=S.blocks.find(x=>x.id===id);if(b){const sn=snap();S.blocks.push(Object.assign({},b,{id:uid(),date:addDays(b.date,1),done:false,manual:true}));save();const m=$('.modal');m&&m.remove();rerender();undoToast('Копия создана на '+fmtD(addDays(b.date,1)),sn)}}
 else if(a==='setdur'){const f=document.querySelector('form[data-form=block]');if(f){f.dur.value=el.dataset.v;updateBlkInfo()}}
 else if(a==='movemissed'){const sn=snap();S.blocks=S.blocks.filter(x=>!(isGo(x)&&isMissed(x)));fillPlan();rerender();undoToast('Пропущенные блоки перенесены на ближайшие вечера',sn)}
 else if(a==='mfilter'){const y=scrollY;if(el.dataset.k==='type')matType=el.dataset.v;else matLang=el.dataset.v;render();scrollTo(0,y)}
 else if(a==='newq'){qShift++;const y=scrollY;render();scrollTo(0,y)}
 else if(a==='mreset'){matType='all';matLang='all';matStage='all';matQ='';render()}
 else if(a==='sfilter'){stageFilter=el.dataset.v;const y=scrollY;render();scrollTo(0,y)}
 else if(a==='tab'){topicTab=el.dataset.tab;render()}
 else if(a==='plan'){openBlock(null,{title:'Go: '+TBY[id].title,topic:id})}
 else if(a==='revdone'){const r=S.reviews.find(x=>x.id===id);if(r){r.done=true;r.doneAt=todayS();save();render()}}
 else if(a==='bdone'){toggleBlockDone(id);rerender()}
 else if(a==='openpractice'){topicTab='task'}
 else if(a==='tfilter'){taskFilter=el.dataset.v;const y=scrollY;render();scrollTo(0,y)}
 else if(a==='ptoggle'){const i=el.dataset.i,pr=S.practice[id]=S.practice[id]||{};
  if(el.checked){pr[i]=true;S.practiceAt[id+':'+i]=todayS()}else{delete pr[i];delete S.practiceAt[id+':'+i]}
  save();const y=scrollY;render();scrollTo(0,y)}
 else if(a==='closemodal'){const m=$('.modal');m&&m.remove()}
 else if(a==='delblock'){const sn=snap(),old=S.blocks.find(x=>x.id===id);S.blocks=S.blocks.filter(x=>x.id!==id);save();if(old&&isGo(old)&&old.topic&&old.done)afterBlockDone(old.topic,false);const m=$('.modal');m&&m.remove();rerender();undoToast('Дело удалено',sn)}
 else if(a==='newblock'){openBlock(null,{})}
 else if(a==='rebuildplan'){if(confirm('Построить план заново по оставшимся темам? Всё, что стоит на сегодня и раньше, блоки, которые ты добавила или двигала сама, и выполненные останутся на месте. Заменятся только будущие блоки, созданные автоматически.')){const sn=snap(),r=rebuildPlan();rerender();undoToast('Поставлено блоков: '+r.placed+(r.left?'. Не влезло до конца года: '+r.left:''),sn)}}
 else if(a==='calprev'||a==='calnext'){const k=a==='calnext'?1:-1;if(calMode==='week')calDate=addDays(calDate,7*k);else{const d=parse(monthDate);d.setMonth(d.getMonth()+k,1);monthDate=iso(d)}rerender()}
 else if(a==='caltoday'){calDate=todayS();monthDate=todayS();rerender()}
 else if(a==='calmode'){
  const to=el.dataset.v;
  if(to==='month'&&calMode!=='month')monthDate=calDate;
  if(to==='week'&&calMode==='month'){const md=parse(monthDate),td=parse(todayS());calDate=(md.getFullYear()===td.getFullYear()&&md.getMonth()===td.getMonth())?todayS():iso(new Date(md.getFullYear(),md.getMonth(),1))}
  calMode=to;calAuto=true;render()}
 else if(a==='gotoweek'){calDate=el.dataset.date;calMode='week';calAuto=true;render()}
 else if(a==='theme'){S.theme=el.dataset.v;save();applyTheme();render()}
 else if(a==='export'){$('#exp').value=JSON.stringify(S,null,1)}
 else if(a==='copy'){const t=$('#exp');if(!t.value)t.value=JSON.stringify(S,null,1);t.select();try{navigator.clipboard.writeText(t.value).then(()=>toast('Скопировано'),()=>toast('Выдели текст и скопируй вручную'))}catch(_){toast('Выдели текст и скопируй вручную')}}
 else if(a==='import'){doImport($('#imp').value)}
 else if(a==='reset'){if(el.dataset.sure){S=defaults();save();render();toast('Данные стёрты')}else{el.dataset.sure='1';el.textContent='Точно стереть? Нажми ещё раз';setTimeout(()=>{el.dataset.sure='';el.textContent='Стереть всё'},4000)}}
 else if(a==='ttoggle'){const p=$('#tpanel');p.hidden=!p.hidden;if(!p.hidden)p.innerHTML=timerPanel()}
});
document.addEventListener('change',e=>{
 if(e.target.name==='kind'&&e.target.form&&e.target.form.dataset.form==='block'){
  const f=e.target.form;toggleKind(f);
  if(f.kind.value==='other'&&/^Go(:|$)/.test(f.title.value))f.title.value='';
  if(f.kind.value==='go'&&!f.title.value){const nt=nextTopic();if(nt)f.title.value='Go: '+nt.title}
  updateBlkInfo();return}
 if(e.target.id==='caljump'){const v=e.target.value;if(v){calDate=v;monthDate=v;rerender()}return}
 if(e.target.name==='topic'&&e.target.closest&&e.target.closest('form[data-form=block]')){const f=e.target.form,tp=TBY[e.target.value];if(tp&&(!f.title.value||/^Go(:|$)/.test(f.title.value)))f.title.value='Go: '+tp.title;updateBlkInfo();return}
 if(e.target.id==='termsample'){
  const sm=termSamples[+e.target.value],ta=$('#codeed'),tm=$('#term');
  if(e.target.value===''||!sm||!ta||!tm)return;
  const known=termSamples.some(x=>x.code===ta.value)||ta.value===TERM_TEMPLATE||!ta.value.trim();
  if(known||confirm('Заменить текущий код выбранным примером?')){ta.value=sm.code;S.code[tm.dataset.id]=sm.code;save();updateGutter();const o=$('#termout');if(o)o.textContent=''}
  e.target.value='';return}
 if(e.target.id==='mstage'){matStage=e.target.value;applyMatFilter();return}
 
 if(e.target.id==='ttopic'){S.timer.topic=e.target.value;save()}
 if(e.target.id==='impf'){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>doImport(String(r.result));r.readAsText(f)}
});
document.addEventListener('input',e=>{if(e.target.id==='quicktxt'){updateQuick();return}if(e.target.closest&&e.target.closest('form[data-form=block]'))updateBlkInfo();if(e.target.id==='codeed'){const tm=$('#term');if(tm){S.code[tm.dataset.id]=e.target.value;save();updateGutter()}return}if(e.target.id==='mq'){matQ=e.target.value;applyMatFilter();return}const n=e.target.dataset&&e.target.dataset.note;if(n){S.notes[n]=e.target.value;save()}});
document.addEventListener('submit',e=>{
 const f=e.target.closest('form');if(!f)return;e.preventDefault();
 const fd=Object.fromEntries(new FormData(f).entries()),k=f.dataset.form;
 if(k==='addlink'){if(!/^https?:\/\//i.test(fd.url)){toast('Адрес должен начинаться с http:// или https://');return}
  S.links.push({topic:fd.topic||'',title:fd.title,url:fd.url,type:fd.type,lang:fd.lang});save();render();toast('Ссылка добавлена')}

 else if(k==='block'){
  const dur=Math.max(15,+fd.dur||50),start=toMin(fd.start),kind=fd.kind==='other'?'other':'go';
  let b=fd.id?S.blocks.find(x=>x.id===fd.id):null;
  const oldTopic=b&&isGo(b)?b.topic:'',wasDone=b?b.done:false;
  if(!b){b={id:uid()};S.blocks.push(b)}
  Object.assign(b,{kind,cat:kind==='other'?(fd.cat||'other'):undefined,title:fd.title,topic:kind==='go'?(fd.topic||''):'',date:fd.date,start,dur:Math.min(dur,1440-start),done:!!fd.done,manual:true,note:(fd.note||'').trim()});
  save();
  // статусы тем подстраиваются под отметки в календаре
  if(kind==='go'){
   if(oldTopic&&oldTopic!==b.topic&&wasDone)afterBlockDone(oldTopic,false);
   if(b.topic&&b.done!==wasDone)afterBlockDone(b.topic,b.done);
   else if(b.topic&&b.done&&oldTopic!==b.topic)afterBlockDone(b.topic,true);
  }
  const m=$('.modal');m&&m.remove();rerender()}
 else if(k==='pair'){
  const id=fd.pid,od=id.split('|')[0],bp=basePairs(od).find(x=>x.id===id);if(!bp)return;
  const s0=toMin(fd.start),e0=toMin(fd.end);
  if(!(e0>s0)){toast('Конец должен быть позже начала.');return}
  const sn=snap(),o={s:s0,e:e0,name:fd.name,room:fd.room,note:(fd.note||'').trim()};
  if(fd.date!==od)o.date=fd.date;
  const same=s0===bp.s&&e0===bp.e&&fd.name===bp.name&&(fd.room||'')===(bp.room||'')&&!o.note&&!o.date;
  if(same)delete S.pairOv[id];else S.pairOv[id]=o;
  save();const m=$('.modal');m&&m.remove();rerender();undoToast('Пара сохранена',sn)}
 else if(k==='work'){
  const d=fd.wdate,s0=toMin(fd.start||'00:00'),e0=toMin(fd.end||'00:00'),sn=snap();
  if(fd.off){S.workOv[d]={off:true}}
  else{
   if(!(e0>s0)){toast('Конец должен быть позже начала.');return}
   if(fd.all){S.workDef={s:s0,e:e0};Object.keys(S.workOv).forEach(x=>{if(!S.workOv[x].off)delete S.workOv[x]})}
   else S.workOv[d]={s:s0,e:e0};
  }
  save();const m=$('.modal');m&&m.remove();rerender();undoToast('Работа сохранена',sn)}
 else if(k==='quick'){
  const r=applyQuick(fd.text);if(!r){toast('Ничего не распознано. Пример: завтра 9:30-10:30 Задача');return}
  const m=$('.modal');m&&m.remove();calAuto=true;render();
  undoToast('Добавлено дел: '+r.n+(r.pairs?', правок пар: '+r.pairs:''),r.sn)}
});
let downOnOverlay=false;
document.addEventListener('mousedown',e=>{downOnOverlay=e.target.classList.contains('modal')});
document.addEventListener('click',e=>{if(downOnOverlay&&e.target.classList.contains('modal'))e.target.remove();downOnOverlay=false});
document.addEventListener('change',e=>{if(e.target.dataset&&e.target.dataset.act==='sreq'){stageReq=e.target.checked;const y=scrollY;render();scrollTo(0,y)}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const m=$('.modal');if(m)m.remove()}});
function doImport(txt){
 try{const o=JSON.parse(txt);if(!o||typeof o!=='object'||o.v!==1||!o.status)throw 0;S=Object.assign(defaults(),o);save();render();toast('Данные восстановлены')}
 catch(_){toast('Это не похоже на копию платформы. Ничего не изменено.')}
}
function applyTheme(){document.documentElement.dataset.theme=S.theme==='auto'?'':S.theme;if(S.theme==='auto')document.documentElement.removeAttribute('data-theme')}

// ---------- старт ----------
// ---------- план занятий (окна из Google-таблицы «Параметры/Расписание пар») ----------
const GO_WIN={ // окна для Go: по утрам работа, поэтому занятия вечером, после пар и дороги
 'Ч':{1:['17:30-21:00'],2:['19:00-21:00'],3:['17:30-21:00'],4:['17:30-21:00'],5:['19:00-21:00']},
 'З':{1:['17:30-21:00'],2:['17:30-21:00'],3:['17:30-21:00'],4:['17:30-21:00'],5:['19:00-21:00']}};
const PLAN_VERSION=5; // при смене окон повышаем: план перестроится сам при следующем открытии
const PLAN_END='2027-06-30'; // конец плана: карта на ~280 блоков занимает около пяти месяцев
const PLAN_SKIP=['2026-12-31','2027-01-01','2027-01-04','2027-01-05','2027-01-06','2027-01-07','2027-01-08','2027-02-23','2027-03-08','2027-05-03','2027-05-10']; // праздники (примерно) // конец плана и праздничные дни
const BLOCK_MIN=50, BLOCK_STEP=60; // блок 50 мин + 10 мин перерыв
function planSlots(date){
 if(isWE(date)||PLAN_SKIP.includes(date))return [];
 const out=[];
 (GO_WIN[parity(date)][dow(date)]||[]).forEach(w=>{
  const [a,b]=w.split('-').map(toMin);
  for(let st=a;st+BLOCK_MIN<=b;st+=BLOCK_STEP)if(!overlapPair(date,st,st+BLOCK_MIN))out.push(st);
 });
 return out;
}
// Ставит блоки по оставшимся темам на каждый будний день, начиная с сегодняшнего вечера. Будущие невыполненные блоки заменяются.
// очередь недостающих блоков по порядку тем; counted: какие уже стоящие блоки считаются запланированными
function planQueue(counted){
 const q=[];
 TOPICS.forEach(t=>{
  if(topicStatus(t.id)==='done')return;
  const have=S.blocks.filter(b=>isGo(b)&&b.topic===t.id&&counted(b)).length;
  for(let i=have+1;i<=t.blocks;i++)q.push({topic:t.id,title:'Go: '+t.title+(t.blocks>1?' ('+i+'/'+t.blocks+')':'')});
 });
 return q;
}
// ставит блоки из очереди в свободные вечерние окна, начиная с сегодняшнего вечера; чужие блоки не трогает
function placeQueue(queue){
 const today=todayS(),nd=new Date(),nowMin=nd.getHours()*60+nd.getMinutes();
 let d=today,placed=0;
 while(d<=PLAN_END&&queue.length){
  for(const st of planSlots(d)){
   if(!queue.length)break;
   if(d===today&&st<=nowMin)continue;
   if(S.blocks.some(b=>b.date===d&&st<b.start+b.dur&&st+BLOCK_MIN>b.start))continue;
   const q=queue.shift();
   S.blocks.push({id:uid(),title:q.title,topic:q.topic,date:d,start:st,dur:BLOCK_MIN,done:false});placed++;
  }
  d=addDays(d,1);
 }
 return {placed,left:queue.length};
}
// автоматическое пополнение плана: НИЧЕГО не двигает и не удаляет, только добавляет недостающие блоки
function fillPlan(){
 const r=placeQueue(planQueue(()=>true));
 S.planV=PLAN_VERSION;save();
 return r;
}
// по кнопке: будущие автоматические блоки строятся заново. Сегодняшние, прошлые, ручные и выполненные остаются на месте
function rebuildPlan(){
 const from=todayS();
 S.blocks=S.blocks.filter(b=>b.done||b.date<=from||b.manual||!isGo(b));
 const r=placeQueue(planQueue(()=>true));
 S.planV=PLAN_VERSION;save();
 return r;
}

// ---------- статистика ----------
function fmtDur(sec){sec=Math.round(sec);if(sec<60)return sec+' с';const m=Math.round(sec/60);if(m<60)return m+' мин';const h=Math.floor(m/60);return h+' ч'+(m%60?' '+(m%60)+' мин':'')}
const MIN=sec=>Math.round(sec/60);
function bars(items,showVal){
 const max=Math.max(1,...items.map(i=>i.v));
 return '<div class="bars" style="--n:'+items.length+'">'+items.map(i=>'<div class="bcol" title="'+esc(i.tip||'')+'"><div class="bval">'+(showVal&&i.v?esc(i.t):'')+'</div><div class="btrack"><i class="'+(i.cls||'')+'" style="height:'+(i.v/max*100)+'%"></i></div><div class="blab">'+esc(i.l)+'</div></div>').join('')+'</div>';
}
function vStats(){
 const T=S.track,t=todayS(),act=activityDays();
 const dsec=d=>T.days[d]||0;
 const lastN=n=>[...Array(n)].map((_,i)=>addDays(t,-(n-1-i)));
 const sum=a=>a.reduce((x,d)=>x+dsec(d),0);
 const totalSec=Object.values(T.days).reduce((a,b)=>a+b,0);
 const days14=lastN(14),days7=lastN(7);
 const timerS=S.sessions.filter(x=>x.mode==='timer');
 const blockMin=timerS.map(x=>x.min),avgBlock=blockMin.length?blockMin.reduce((a,b)=>a+b,0)/blockMin.length:0;
 const calDone=S.blocks.filter(b=>b.done&&isGo(b)).length,calAll=S.blocks.filter(isGo).length;
 const doneT=TOPICS.filter(x=>topicStatus(x.id)==='done').length;
 const rev=S.reviews,revDone=rev.filter(r=>r.done).length;
 const V=T.visits,vTotal=V.length,vAvg=vTotal?V.reduce((a,v)=>a+v.sec,0)/vTotal:0,vMax=vTotal?Math.max(...V.map(v=>v.sec)):0;
 const activeDays=Object.keys(T.days).filter(d=>T.days[d]>=60).length;
 const kpi=(n,l,sub)=>'<div class="card kpi"><div class="kn">'+n+'</div><div class="kl">'+l+'</div>'+(sub?'<div class="small mute">'+sub+'</div>':'')+'</div>';
 let h='<h1>Статистика</h1><p class="mute">Данные собираются сами, пока ты на сайте: открытая вкладка и любое действие в последние 2 минуты. Хранятся только в этом браузере.</p>';
 h+='<div class="grid kpis">'
  +kpi(fmtDur(dsec(t)),'сегодня на сайте','за 7 дней: '+fmtDur(sum(days7)))
  +kpi(fmtDur(totalSec),'всего на сайте','дней с занятиями: '+activeDays)
  +kpi(streak(),'серия будних дней','выходные серию не прерывают')
  +kpi(timerS.length,'блоков по таймеру',blockMin.length?'в среднем '+Math.round(avgBlock)+' мин, дольше всего '+Math.max(...blockMin)+' мин':'ещё нет завершённых блоков')
  +kpi(calDone+' / '+calAll,'блоков из календаря','выполнено / запланировано')
  +kpi(doneT+' / '+TOPICS.length,'тем освоено',Math.round(doneT/TOPICS.length*100)+'% карты')
  +kpi(vTotal,'визитов',vTotal?'средний '+fmtDur(vAvg)+', длиннейший '+fmtDur(vMax):'')
  +kpi(revDone+' / '+rev.length,'повторений сделано',rev.length?'':'появятся после освоения тем')
  +kpi(practiceTotal(),'заданий практики выполнено','из конспектов тем')
  +'</div>';
 h+='<div class="card"><h3>Время на сайте по дням (14 дней)</h3>'+bars(days14.map(d=>({v:dsec(d),t:MIN(dsec(d))?MIN(dsec(d))+'м':'',l:DOW[dow(d)-1]+' '+parse(d).getDate(),tip:fmtD(d)+': '+fmtDur(dsec(d)),cls:d===t?'today':(isWE(d)?'we':'')})),true)+'</div>';
 const W=14,startD=addDays(mondayOf(t),-(W-1)*7);
 let cells='';
 for(let w=0;w<W;w++)for(let k=0;k<7;k++){const d=addDays(startD,w*7+k);if(d>t){cells+='<i class="hc" style="visibility:hidden"></i>';continue}
  const m=MIN(dsec(d)),lv=m>=45?4:m>=15?3:m>=1?2:act.has(d)?1:0;
  cells+='<i class="hc l'+lv+(d===t?' tod':'')+'" title="'+fmtD(d)+': '+(m?fmtDur(dsec(d)):act.has(d)?'была активность':'нет занятий')+'"></i>'}
 h+='<div class="card"><h3>Активность за 14 недель</h3><div class="heat">'+cells+'</div><p class="small mute">Строки: Пн–Вс, столбцы: недели. Чем темнее, тем дольше ты была на сайте.</p></div>';
 const hrs=[...Array(24)].map((_,i)=>({v:T.hours[i]||0,t:'',l:i%3===0?String(i):'',tip:pad(i)+':00 – '+fmtDur(T.hours[i]||0)}));
 const dowSum=[0,0,0,0,0,0,0],dowDays=[0,0,0,0,0,0,0];
 Object.keys(T.days).forEach(d=>{if(T.days[d]>=60){const k=dow(d)-1;dowSum[k]+=T.days[d];dowDays[k]++}});
 const dws=DOW.map((n,k)=>{const v=dowDays[k]?dowSum[k]/dowDays[k]:0;return {v,t:MIN(v)+'м',l:n,tip:n+': в среднем '+fmtDur(v),cls:k>=5?'we':''}});
 const bestH=hrs.reduce((a,b)=>b.v>a.v?b:a,hrs[0]);
 h+='<div class="grid2"><div class="card"><h3>В какое время суток ты учишься</h3>'+bars(hrs,false)+'<p class="small mute">'+(bestH.v?'Чаще всего: около '+bestH.tip.slice(0,5)+'.':'Пока нет данных.')+'</p></div>'
  +'<div class="card"><h3>По дням недели (среднее за день)</h3>'+bars(dws,true)+'</div></div>';
 const ids=new Set([...Object.keys(T.topics),...S.sessions.map(x=>x.topic).filter(Boolean),...S.blocks.filter(b=>b.done&&b.topic).map(b=>b.topic)]);
 const rows=[...ids].map(id=>{const tp=TBY[id],ss=S.sessions.filter(x=>x.topic===id&&x.mode==='timer'),pg=T.topics[id]||0,mins=ss.reduce((a,x)=>a+x.min,0);
  return {id,title:tp?tp.title:id,pg,n:ss.length,mins,avg:ss.length?mins/ss.length:0,cal:S.blocks.filter(b=>b.done&&b.topic===id).length,st:tp?topicStatus(id):'new'}}).sort((a,b)=>(b.pg+b.mins*60)-(a.pg+a.mins*60));
 h+='<div class="card"><h3>Что и сколько ты учила</h3>'+(rows.length?'<div class="tw"><table><thead><tr><th>Тема</th><th>На странице темы</th><th>Блоков таймера</th><th>Всего по таймеру</th><th>Средний блок</th><th>Блоков в календаре</th><th>Статус</th></tr></thead><tbody>'
  +rows.map(r=>'<tr><td><a href="#t-'+r.id+'">'+esc(r.title)+'</a></td><td>'+(r.pg?fmtDur(r.pg):'—')+'</td><td>'+r.n+'</td><td>'+(r.mins?r.mins+' мин':'—')+'</td><td>'+(r.n?Math.round(r.avg)+' мин':'—')+'</td><td>'+(r.cal||'—')+'</td><td><span class="stt'+(r.st==='done'?' done':'')+'">'+STAT[r.st]+'</span></td></tr>').join('')
  +'</tbody></table></div>':'<p class="mute">Пока пусто. Открой тему или запусти таймер блока: данные появятся здесь.</p>')+'</div>';
 const rec=S.sessions.slice().sort((a,b)=>(b.at||0)-(a.at||0)||(a.date<b.date?1:-1)).slice(0,12);
 const MODE={timer:'блок завершён',partial:'прерван',manual:'вручную'};
 h+='<div class="card"><h3>Последние блоки таймера</h3>'+(rec.length?'<div class="tw"><table><thead><tr><th>Дата</th><th>Время</th><th>Тема</th><th>Минут</th><th></th></tr></thead><tbody>'
  +rec.map(x=>'<tr><td>'+fmtD(x.date)+'</td><td>'+(x.at?pad(new Date(x.at).getHours())+':'+pad(new Date(x.at).getMinutes()):'—')+'</td><td>'+(x.topic&&TBY[x.topic]?esc(TBY[x.topic].title):'<span class="mute">без темы</span>')+'</td><td>'+x.min+'</td><td class="small mute">'+(MODE[x.mode]||esc(x.mode||''))+'</td></tr>').join('')
  +'</tbody></table></div>':'<p class="mute">Блоков ещё не было. Запусти таймер в шапке и выбери тему.</p>')+'</div>';
 h+='<div class="card"><h3>Прогресс по этапам</h3>'+STAGES.map(st=>{const ts=TOPICS.filter(x=>x.stage===st.id),d=ts.filter(x=>topicStatus(x.id)==='done').length,p=d/ts.length*100;
  return '<a class="item" href="#st-'+st.id+'"><span class="t">Этап '+st.id+'. '+esc(st.title)+'</span><span class="prog">'+progressBar(p)+'<b class="pct">'+Math.round(p)+'%</b></span></a>'}).join('')+'</div>';
 const rv=V.slice().reverse().slice(0,8);
 h+='<div class="card"><h3>Когда ты заходила на сайт</h3>'+(rv.length?'<div class="tw"><table><thead><tr><th>Дата</th><th>С</th><th>До</th><th>Активно</th></tr></thead><tbody>'
  +rv.map(v=>{const a=new Date(v.s),b=new Date(v.e);return '<tr><td>'+fmtD(iso(a))+'</td><td>'+pad(a.getHours())+':'+pad(a.getMinutes())+'</td><td>'+pad(b.getHours())+':'+pad(b.getMinutes())+'</td><td>'+fmtDur(v.sec)+'</td></tr>'}).join('')
  +'</tbody></table></div><p class="small mute">Первый визит в статистике: '+fmtD(iso(new Date(V[0].s)))+'.</p>':'<p class="mute">Пока нет данных.</p>')+'</div>';
 return h;
}
// сбор времени на сайте: считаем, пока вкладка активна и были действия за последние 2 минуты
let lastInput=Date.now(),lastBeat=Date.now(),lastTrackSave=Date.now(),curVisit=null;
['mousemove','keydown','scroll','click','touchstart'].forEach(ev=>addEventListener(ev,()=>{lastInput=Date.now()},{passive:true}));
function startVisit(){
 const now=Date.now(),V=S.track.visits,l=V[V.length-1];
 if(l&&now-l.e<10*60*1000){curVisit=l}else{curVisit={s:now,e:now,sec:0};V.push(curVisit);if(V.length>500)V.shift()}
 curVisit.e=now;
}
function beat(){
 const now=Date.now(),dt=Math.min(10,(now-lastBeat)/1000);lastBeat=now;
 if(document.visibilityState!=='visible'||now-lastInput>120000)return;
 const T=S.track,d=todayS();
 T.days[d]=(T.days[d]||0)+dt;
 const hr=new Date().getHours();T.hours[hr]=(T.hours[hr]||0)+dt;
 if(route==='topic'&&TBY[param])T.topics[param]=(T.topics[param]||0)+dt;
 curVisit.sec+=dt;curVisit.e=now;
 if(now-lastTrackSave>15000){save();lastTrackSave=now}
}

// ---------- иконки вместо системных смайликов ----------
const ICON_PATHS={
 calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
 target:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
 help:'<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',
 sparkles:'<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/>',
 flame:'<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
 repeat:'<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
 timer:'<path d="M10 2h4"/><path d="m12 14 3-3"/><circle cx="12" cy="14" r="8"/>',
 checkcircle:'<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
 book:'<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
 bookopen:'<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
 leaf:'<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
 moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
 coffee:'<path d="M10 2v2M14 2v2M6 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/>',
 library:'<path d="m16 6 4 14M12 6v14M8 8v12M4 4v16"/>',
 hourglass:'<path d="M5 22h14M5 2h14M17 22v-4.17a2 2 0 0 0-.59-1.42L12 12l-4.41 4.41A2 2 0 0 0 7 17.83V22M7 2v4.17a2 2 0 0 0 .59 1.42L12 12l4.41-4.41A2 2 0 0 0 17 6.17V2"/>',
 refresh:'<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
 award:'<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>',
 terminal:'<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
 type:'<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/>',
 flask:'<path d="M10 2v7.31L4.5 19a1.5 1.5 0 0 0 1.3 2.25h12.4A1.5 1.5 0 0 0 19.5 19L14 9.31V2M8.5 2h7M7 16h10"/>',
 zap:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
 globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
 database:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
 flag:'<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
 briefcase:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
 file:'<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/>',
 cap:'<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
 cube:'<path d="M12 2 21 7v10l-9 5-9-5V7z"/><path d="M12 22V12M3 7l9 5 9-5"/>',
 link:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
 bulb:'<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/>',
 check:'<path d="M20 6 9 17l-5-5"/>',
 play:'<polygon points="6 3 20 12 6 21 6 3"/>',
 lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
 layers:'<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
 send:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
 activity:'<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
 server:'<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>',
 circle:'<circle cx="12" cy="12" r="8"/>',
 dotfill:'<circle cx="12" cy="12" r="6" fill="currentColor"/>',
 half:'<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/>',
 redo:'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>'
};
const EMOJI_ICON={'📅':'calendar','📆':'calendar','🗓':'calendar','🎯':'target','🧠':'help','🎉':'sparkles','✨':'sparkles','🔥':'flame','🔁':'repeat','⏱':'timer','✅':'checkcircle','🧱':'grid',
 '📘':'book','📖':'bookopen','🌿':'leaf','🌱':'leaf','🌙':'moon','☕':'coffee','📚':'library','⏳':'hourglass','🔀':'refresh','🏅':'award','🛠':'terminal','🔤':'type',
 '🧪':'flask','⚡':'zap','🌐':'globe','🗄':'database','🚀':'flag','🔐':'lock','🏛':'layers','📨':'send','📡':'activity','🖥':'server','💼':'briefcase','📄':'file','🎓':'cap','🧩':'cube','🔗':'link','💡':'bulb','✓':'check','✔':'check','▶':'play',
 '🟢':'dot-l1','🟡':'dot-l2','🔴':'dot-l3','○':'circle','●':'dotfill','◐':'half','↻':'redo'};
const EMOJI_RE=new RegExp('('+Object.keys(EMOJI_ICON).join('|')+')\\uFE0F?','g');
function makeIcon(name){
 const sp=document.createElement('span');sp.className='ic-w';
 if(name.startsWith('dot-')){sp.innerHTML='<svg class="ic ic-'+name.slice(4)+'" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7" fill="currentColor" stroke="none"/></svg>'}
 else sp.innerHTML='<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICON_PATHS[name]+'</svg>';
 return sp;
}
function iconize(root){
 if(!root)return;
 if(root.nodeType===3){iconizeText(root);return}
 if(root.nodeType!==1)return;
 const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>/OPTION|TEXTAREA|TITLE|SCRIPT|STYLE|SVG/i.test(n.parentNode.nodeName)?NodeFilter.FILTER_REJECT:(EMOJI_RE.lastIndex=0,EMOJI_RE.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT)});
 const list=[];while(w.nextNode())list.push(w.currentNode);
 list.forEach(iconizeText);
}
function iconizeText(n){
 if(!n.parentNode||/OPTION|TEXTAREA|TITLE|SCRIPT|STYLE/i.test(n.parentNode.nodeName))return;
 const txt=n.nodeValue;EMOJI_RE.lastIndex=0;if(!EMOJI_RE.test(txt))return;
 EMOJI_RE.lastIndex=0;
 const frag=document.createDocumentFragment();let last=0,m;
 while((m=EMOJI_RE.exec(txt))){if(m.index>last)frag.appendChild(document.createTextNode(txt.slice(last,m.index)));frag.appendChild(makeIcon(EMOJI_ICON[m[1]]));last=m.index+m[0].length}
 if(last<txt.length)frag.appendChild(document.createTextNode(txt.slice(last)));
 n.parentNode.replaceChild(frag,n);
}
function startIcons(){
 iconize(document.body);
 new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>iconize(n)))).observe(document.body,{childList:true,subtree:true});
}

// ---------- терминал: запуск Go через онлайн-компилятор Wandbox ----------
const RUN_URL='https://wandbox.org/api/compile.json',RUN_COMPILER='go-1.23.2';
const TERM_TEMPLATE='package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Привет, Go!")\n}\n';
let termSamples=[];
function stripTags(h){return String(h).replace(/<[^>]+>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&')}
// примеры из конспекта: полные программы (package main), кроме многофайловых
function collectSamples(t){
 const out=[];let head='Пример';
 if(!t.d)return out;
 t.d.b.forEach((b,i)=>{
  if(b[0]==='h')head=stripTags(b[1]).replace(/^\d+\.\s*/,'');
  else if(b[0]==='code'&&/^package main\b/m.test(b[1])&&!/"example\.com\//.test(b[1])){
   const nx=t.d.b[i+1],err=nx&&nx[0]==='out'&&/^\.\/main\.go/.test(nx[1]);
   out.push({label:(out.length+1)+'. '+head+(err?' (пример ошибки)':''),code:b[1]});
  }
 });
 // одинаковые заголовки различаем номером варианта
 const seen={};
 out.forEach(x=>{const k=x.label.replace(/^\d+\.\s*/,'');seen[k]=(seen[k]||0)+1;x.n=seen[k]});
 out.forEach(x=>{const k=x.label.replace(/^\d+\.\s*/,'');if(seen[k]>1)x.label=x.label+' (вариант '+x.n+')'});
 return out;
}
function starterCode(t){const sm=collectSamples(t);return sm.length?sm[0].code:TERM_TEMPLATE}
function terminalHtml(t){
 termSamples=collectSamples(t);
 const code=S.code[t.id]!=null?S.code[t.id]:starterCode(t);
 return '<aside class="term" id="term" data-id="'+t.id+'"><div class="term-head"><b>Терминал Go</b><span class="small mute">онлайн, Go 1.23</span><span class="sp"></span><button class="btn sm ghost" data-act="termtoggle" title="Скрыть терминал">Скрыть</button></div>'
  +'<div class="term-bar"><button class="btn sm pri" data-act="runcode" id="runbtn">▶ Запустить</button><button class="btn sm" data-act="resetcode">Сбросить</button>'
  +'<select id="termsample" aria-label="Примеры из конспекта"><option value="">Примеры из конспекта</option>'+termSamples.map((x,i)=>'<option value="'+i+'">'+esc(x.label)+'</option>').join('')+'</select></div>'
  +'<div class="edwrap"><pre class="gut" id="gut" aria-hidden="true"></pre><textarea id="codeed" spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off" aria-label="Код на Go">'+esc(code)+'</textarea></div>'
  +'<details class="term-in"><summary>Ввод для программы (stdin)</summary><textarea id="termin" spellcheck="false" placeholder="Каждая строка это одна строка ввода, который прочитает программа"></textarea></details>'
  +'<div class="term-out"><div class="term-st" id="termstatus">Нажми «Запустить» или Ctrl+Enter</div><pre id="termout"></pre></div>'
  +'<p class="small mute term-note">При запуске код отправляется на сервер онлайн-компилятора Wandbox. Файлов и сети там нет, время выполнения ограничено.</p></aside>';
}
function updateGutter(){
 const ta=$('#codeed'),g=$('#gut');if(!ta||!g)return;
 const n=ta.value.split('\n').length;let t='';for(let i=1;i<=n;i++)t+=i+'\n';
 g.textContent=t;g.scrollTop=ta.scrollTop;
}
async function runCode(){
 const ta=$('#codeed'),btn=$('#runbtn'),out=$('#termout'),st=$('#termstatus');if(!ta||!btn)return;
 const code=ta.value;if(!code.trim()){st.className='term-st bad';st.textContent='Код пустой';return}
 btn.disabled=true;st.className='term-st run';st.textContent='Выполняется…';out.textContent='';
 const t0=performance.now(),ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),30000);
 try{
  const r=await fetch(RUN_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({compiler:RUN_COMPILER,code:code,stdin:($('#termin')||{}).value||'',save:false}),signal:ctl.signal});
  if(!r.ok)throw new Error('HTTP '+r.status);
  const d=await r.json(),ms=Math.round(performance.now()-t0);
  const fix=x=>String(x||'').replace(/(\.\/)?prog\.go/g,'main.go');
  const cerr=fix(d.compiler_error||d.compiler_message).trim();
  const pout=d.program_message?fix(d.program_message):fix((d.program_output||'')+(d.program_error||''));
  const code0=String(d.status||'0');
  if(cerr&&!pout){st.className='term-st bad';st.textContent='Ошибка компиляции';out.textContent=cerr}
  else if(code0!=='0'||d.signal){st.className='term-st bad';st.textContent='Программа завершилась с ошибкой (код '+code0+(d.signal?', '+d.signal:'')+'), '+ms+' мс';out.textContent=pout||cerr}
  else{st.className='term-st ok';st.textContent='Выполнено за '+ms+' мс';out.textContent=pout||'(программа ничего не вывела)'}
 }catch(e){
  st.className='term-st bad';
  st.textContent=e.name==='AbortError'?'Время ожидания вышло (30 с). Возможно, программа зациклилась.':'Не удалось связаться с онлайн-компилятором. Проверь интернет и попробуй позже.';
 }finally{clearTimeout(to);btn.disabled=false}
}
// ввод: Tab вставляет табуляцию, Enter сохраняет отступ, Ctrl+Enter запускает
document.addEventListener('keydown',e=>{
 const ta=e.target;if(!ta||ta.id!=='codeed')return;
 if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();runCode();return}
 if(e.key==='Tab'){e.preventDefault();ta.setRangeText('\t',ta.selectionStart,ta.selectionEnd,'end');ta.dispatchEvent(new Event('input',{bubbles:true}));return}
 if(e.key==='Enter'&&!e.shiftKey){
  e.preventDefault();
  const pos=ta.selectionStart,before=ta.value.slice(0,pos),line=before.slice(before.lastIndexOf('\n')+1);
  const indent=(line.match(/^\t*/)||[''])[0]+(/\{\s*$/.test(line)?'\t':'');
  ta.setRangeText('\n'+indent,pos,ta.selectionEnd,'end');ta.dispatchEvent(new Event('input',{bubbles:true}));
 }
});
document.addEventListener('scroll',e=>{const c=e.target;if(c&&c.classList&&c.classList.contains('calwrap')){calScroll=c.scrollTop;calScrollX=c.scrollLeft}},true);
document.addEventListener('scroll',e=>{if(e.target&&e.target.id==='codeed'){const g=$('#gut');if(g)g.scrollTop=e.target.scrollTop}},true);

// ---------- быстрое добавление дел текстом ----------
const QWD={'пн':1,'пон':1,'понедельник':1,'вт':2,'вторник':2,'ср':3,'среда':3,'среду':3,'чт':4,'четверг':4,'пт':5,'пятница':5,'пятницу':5,'сб':6,'суббота':6,'субботу':6,'вс':7,'воскресенье':7};
const Q_DATE_RE=/^(сегодня|послезавтра|завтра|\d{4}-\d{2}-\d{2}|\d{1,2}\.\d{1,2}(?:\.\d{2,4})?|(?:в\s+)?(?:понедельник|вторник|среду|среда|четверг|пятницу|пятница|субботу|суббота|воскресенье|пн|вт|ср|чт|пт|сб|вс))(?=[\s,:;]|$)\s*[,:;]?\s*/i;
function qDate(tok){
 tok=tok.toLowerCase().replace(/^в\s+/,'').trim();const t=todayS();
 if(tok==='сегодня')return t;if(tok==='завтра')return addDays(t,1);if(tok==='послезавтра')return addDays(t,2);
 if(/^\d{4}-\d{2}-\d{2}$/.test(tok))return tok;
 let m=tok.match(/^(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?$/);
 if(m){const td=parse(t);let y=m[3]?+m[3]:td.getFullYear();if(y<100)y+=2000;const d=new Date(y,+m[2]-1,+m[1]);if(!m[3]&&iso(d)<t)d.setFullYear(y+1);return iso(d)}
 if(QWD[tok]){let d=addDays(t,1);for(let i=0;i<7;i++){if(dow(d)===QWD[tok])return d;d=addDays(d,1)}}
 return null;
}
const qHour=h=>(h<8?h+12:h); // «к 3» значит 15:00
const qCat=t=>/созвон|встреч|звонок|собеседован|работ|задач/i.test(t)?'work':/пар[аыу]\b|учёб|учеб|лекц|экзамен|зачёт/i.test(t)?'study':'other';
// разбирает текст: по строке на дело. Возвращает дела, правки пар и замечания
function parseQuick(text){
 const out={items:[],pairs:[],warns:[]};let cur=addDays(todayS(),1);
 String(text||'').split('\n').forEach(raw=>{
  let line=raw.trim().replace(/^[-•*]\s*/,'').replace(/^\d+[.)]\s+/,'');if(!line)return;
  let date=cur;const dm=line.match(Q_DATE_RE);
  if(dm){const d=qDate(dm[1]);if(d){date=d;cur=d;line=line.slice(dm[0].length).trim()}}
  if(!line)return; // строка была только датой
  const low=line.toLowerCase();
  const pm=low.match(/пар[уыа]?\s.*иду\s+только\s+к\s+(\d{1,2})(?::(\d{2}))?/)||low.match(/иду\s+на\s+пар[уы]\s+только\s+к\s+(\d{1,2})(?::(\d{2}))?/);
  if(pm){out.pairs.push({date,from:qHour(+pm[1])*60+(pm[2]?+pm[2]:0)});return}
  if(/пары?\s+(?:не\s+иду|отменя\w+|отменены|нет)/.test(low)){out.pairs.push({date,from:24*60});return}
  let start=null,end=null,dur=null,rest=line;
  let m=rest.match(/(?:с\s*)?(\d{1,2}):(\d{2})\s*(?:-|–|—|до)\s*(\d{1,2})(?::(\d{2}))?/);
  if(m){start=+m[1]*60+ +m[2];end=+m[3]*60+(m[4]?+m[4]:0);rest=rest.replace(m[0],' ')}
  else if((m=rest.match(/(?:в\s*|к\s*)?(\d{1,2}):(\d{2})/))){start=+m[1]*60+ +m[2];rest=rest.replace(m[0],' ')}
  else if((m=rest.match(/\bв\s+(\d{1,2})(?![\d:])/))){start=qHour(+m[1])*60;rest=rest.replace(m[0],' ')}
  const dm2=rest.match(/\(?\s*(?:на\s+)?(\d+(?:[.,]\d+)?)\s*(минут|мин|часа|часов|час|ч)\b\s*\)?/i);
  if(dm2){const v=parseFloat(dm2[1].replace(',','.'));dur=/мин/i.test(dm2[2])?Math.round(v):Math.round(v*60);rest=rest.replace(dm2[0],' ')}
  const title=rest.replace(/^[\s,:;–—-]+|[\s,:;–—-]+$/g,'').replace(/\s{2,}/g,' ');
  if(start==null){out.warns.push('Нет времени: «'+raw.trim()+'»');return}
  if(!title){out.warns.push('Нет названия: «'+raw.trim()+'»');return}
  if(end!=null&&end<=start)end+=12*60;
  const d=dur||(end!=null?end-start:60);
  out.items.push({date,start,dur:Math.max(15,Math.min(d,1440-start)),title:title.charAt(0).toUpperCase()+title.slice(1),cat:qCat(title)});
 });
 return out;
}
function quickPreview(text){
 const r=parseQuick(text);let h='';
 r.items.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:a.start-b.start).forEach(x=>{h+='<div class="qrow"><b>'+DOW[dow(x.date)-1]+' '+fmtD(x.date)+'</b> '+fmtT(x.start)+'–'+fmtT(x.start+x.dur)+' · '+esc(x.title)+'</div>'});
 r.pairs.forEach(x=>{
  const ps=pairsOn(x.date),off=ps.filter(p=>p.e<=x.from),cut=ps.filter(p=>p.s<x.from&&p.e>x.from);
  h+='<div class="qrow"><b>'+DOW[dow(x.date)-1]+' '+fmtD(x.date)+'</b> пары: '+(x.from>=1440?'не иду':'иду только к '+fmtT(x.from))
   +(off.length?'. Уберу: '+off.map(p=>fmtT(p.s)+' '+esc(p.name)).join(', '):'')+(cut.length?'. Сдвину начало на '+fmtT(x.from)+': '+cut.map(p=>esc(p.name)).join(', '):'')+'</div>';
 });
 r.warns.forEach(w=>{h+='<div class="qrow warn">'+esc(w)+'</div>'});
 return {html:h||'<div class="small mute">Пока ничего не распознано.</div>',n:r.items.length+r.pairs.length,warns:r.warns.length};
}
function openQuick(text){
 const m=document.createElement('div');m.className='modal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');
 const ph='завтра:\n9:30-10:30 Задача по HH\n11:00 Созвон (30 мин)\nс 13:00 до 14:00 Встреча\nна пару иду только к 3';
 m.innerHTML='<form class="box wide" data-form="quick"><h3>Быстро добавить дела</h3><p class="small mute">По строке на дело: дата (сегодня, завтра, пт, 20.11), время или промежуток, название, при желании длительность в скобках. Строка вида «завтра:» задаёт дату для следующих строк. «На пару иду только к 3» уберёт ранние пары.</p>'
  +'<textarea id="quicktxt" name="text" rows="9" placeholder="'+esc(ph)+'">'+esc(text||'')+'</textarea><div class="qprev" id="qprev"></div>'
  +'<p class="row"><button class="btn pri" type="submit" id="qgo">Добавить в календарь</button><button class="btn" type="button" data-act="closemodal">Отмена</button></p></form>';
 document.body.appendChild(m);updateQuick();const f=m.querySelector('textarea');f&&f.focus();
}
function updateQuick(){
 const ta=$('#quicktxt'),pv=$('#qprev'),go=$('#qgo');if(!ta||!pv)return;
 const r=quickPreview(ta.value);pv.innerHTML=r.html;if(go)go.disabled=!r.n;
}
function applyQuick(text){
 const r=parseQuick(text);if(!r.items.length&&!r.pairs.length)return null;
 const sn=snap();
 r.items.forEach(x=>S.blocks.push({id:uid(),kind:'other',cat:x.cat,title:x.title,topic:'',date:x.date,start:x.start,dur:x.dur,done:false,manual:true,note:''}));
 r.pairs.forEach(x=>{ // пары до указанного времени убираем, пересекающую начинаем позже
  pairsOn(x.date).forEach(p=>{
   if(p.e<=x.from)S.pairOv[p.id]=Object.assign({},S.pairOv[p.id]||{},{off:true});
   else if(p.s<x.from)S.pairOv[p.id]=Object.assign({},S.pairOv[p.id]||{},{s:x.from});
  });
 });
 save();
 const first=r.items.concat(r.pairs).map(x=>x.date).sort()[0];
 if(first){calDate=first;monthDate=first;calMode='week'}
 return {sn,n:r.items.length,pairs:r.pairs.length};
}

function init(){
 applyTheme();banner();
 startIcons();
 if((S.planV||0)<PLAN_VERSION)fillPlan();
 startVisit();setInterval(beat,5000);setInterval(()=>{if(route==='calendar')updateNowLine()},60000);
 setInterval(()=>{if(route==='home'){const c=document.getElementById('todaycard');if(c)c.outerHTML=todayCard()}},30000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save()});
 addEventListener('pagehide',save);
 window.addEventListener('hashchange',render);
 setInterval(renderTimer,500);
 render();
}
init();
})();

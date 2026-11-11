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
const pairsOn=s=>isWE(s)?[]:(PAIRS[parity(s)][dow(s)]||[]);

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
function defaults(){return {v:1,status:{'s0-0':'done'},doneAt:{'s0-0':'2026-11-10'},notes:{},blocks:[],reviews:[],tasks:[],sessions:[],practice:{},practiceAt:{},track:{days:{},hours:{},topics:{},visits:[]},links:[],theme:'auto',timer:{mode:'work',dur:2700,endAt:null,left:2700,topic:''},ready:false}}
function load(){
 try{const r=localStorage.getItem(KEY);if(r){const o=JSON.parse(r);return Object.assign(defaults(),o)}}catch(e){storageOK=false}
 return defaults();
}
let S=load();
if(!S.practice||typeof S.practice!=='object')S.practice={};
if(!S.practiceAt||typeof S.practiceAt!=='object')S.practiceAt={};
if(!S.track||typeof S.track!=='object')S.track={days:{},hours:{},topics:{},visits:[]};
['days','hours','topics'].forEach(k=>{if(!S.track[k])S.track[k]={}});if(!Array.isArray(S.track.visits))S.track.visits=[];
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){storageOK=false;banner()}}
function banner(){const b=$('#banner');if(b)b.hidden=storageOK}
function toast(msg){const t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),3800)}

// ---------- логика ----------
function topicStatus(id){return S.status[id]||'new'}
function setStatus(id,st){
 const prev=topicStatus(id);S.status[id]=st;
 if(st==='done'){S.doneAt[id]=todayS();S.reviews=S.reviews.filter(r=>r.topic!==id||r.done);
  [3,7,21].forEach((n,i)=>S.reviews.push({id:uid(),topic:id,due:nextWeekday(addDays(todayS(),n)),step:i+1,done:false}));
  if(prev!=='done')toast('Тема освоена. '+REST_TIPS[Math.floor(Math.random()*REST_TIPS.length)]+' Повторения поставлены: +3 дня, +1 неделя, +3 недели.')}
 else if(st==='redo'){S.reviews.push({id:uid(),topic:id,due:nextWeekday(todayS()),step:0,done:false})}
 save();
}
function doneBlocks(){return TOPICS.filter(t=>topicStatus(t.id)==='done').reduce((a,t)=>a+t.blocks,0)}
function activityDays(){
 const set=new Set();
 S.blocks.filter(b=>b.done).forEach(b=>set.add(b.date));
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
 const dn=S.blocks.filter(b=>b.done&&b.date>=from).length+S.sessions.filter(s=>s.date>=from&&s.mode==='timer').length;
 return dn;
}

// ---------- роутер ----------
let route='home',param='',topicTab='note',calMode='week',calDate=todayS(),monthDate=todayS();
function go(h){location.hash=h}
function parseHash(){
 const h=(location.hash||'#home').slice(1);
 if(h.startsWith('t-')){route='topic';param=h.slice(2)}
 else if(h.startsWith('st-')){route='stage';param=h.slice(3)}
 else{route=['home','map','calendar','tasks','materials','stats','setup'].includes(h)?h:'home';param=''}
}
function render(){
 parseHash();
 document.querySelectorAll('nav a').forEach(a=>{const k=a.getAttribute('href').slice(1);a.removeAttribute('aria-current');if(k===route||(route==='topic'||route==='stage')&&k==='map')a.setAttribute('aria-current','page')});
 const m=$('#main');
 const fn={home:vHome,map:vMap,stage:vStage,topic:vTopic,calendar:vCalendar,tasks:vTasks,materials:vMaterials,stats:vStats,setup:vSetup}[route];
 m.innerHTML=fn();
 if(route==='calendar')bindCalendar();
 if(route==='materials')applyMatFilter();
 window.scrollTo(0,0);
 renderTimer();
}

// ---------- виды ----------
function progressBar(p){return '<div class="bar" role="progressbar" aria-valuenow="'+Math.round(p)+'" aria-valuemin="0" aria-valuemax="100"><i style="width:'+p+'%"></i></div>'}
// карточка «Сегодня»: прошедшее скрывается, остаётся текущее и предстоящее
function todayCard(){
 const t=todayS(),nowD=new Date(),now=nowD.getHours()*60+nowD.getMinutes();
 const todayBlocks=S.blocks.filter(b=>b.date===t).sort((a,b)=>a.start-b.start);
 const goTotal=todayBlocks.length,goDone=todayBlocks.filter(b=>b.done).length;
 const all=pairsOn(t).map(p=>({s:p.s,e:p.e,kind:'pair',title:p.name,sub:p.kind+(p.room?', '+p.room:'')}))
  .concat(todayBlocks.map(b=>({s:b.start,e:b.start+b.dur,kind:'go',title:b.title,id:b.id,done:b.done}))).sort((a,b)=>a.s-b.s);
 // прошедшее прячем; невыполненный блок Go не прячем, чтобы его можно было отметить
 const items=all.filter(x=>x.e>now||(x.kind==='go'&&!x.done));
 const hiddenCount=all.length-items.length;
 return '<div class="card hcard" id="todaycard"><div class="hc-head"><span class="hc-ic">📅</span><h3>Сегодня</h3>'+(goTotal?'<span class="small mute">блоков Go: '+goDone+' из '+goTotal+'</span>':'')+'</div>'
  +(isWE(t)?'<div class="hempty"><div class="he-ic">🌿</div><b>Выходной</b><div class="small mute">Отдыхай. Занятия по плану только в будни.</div></div>'
   :items.length?'<div class="tline">'+items.map(x=>{const nowOn=x.s<=now&&now<x.e,late=x.kind==='go'&&!x.done&&x.e<=now;
     return '<div class="tl '+x.kind+(x.done?' done':'')+(nowOn?' now':'')+(late?' late':'')+'"><div class="tl-time">'+fmtT(x.s)+'<br><span class="small mute">'+fmtT(x.e)+'</span></div><div class="tl-body"><b>'+esc(x.title)+'</b>'
      +'<div class="small mute">'+(nowOn?'<span class="nowbadge">идёт сейчас</span> ':'')+(late?'не отмечен · ':'')+(x.kind==='pair'?'пара · '+esc(x.sub):'блок Go')+'</div></div>'
      +(x.kind==='go'?'<button class="btn sm'+(x.done?' on':'')+'" data-act="bdone" data-id="'+x.id+'">'+(x.done?'Готово ✓':'Отметить')+'</button>':'')+'</div>'}).join('')+'</div>'
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
const STAGE_ICON=['🛠','🔤','🧠','✨','🧪','⚡','🌐','🗄','🚀','🧱','🎯'];
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
 return '<div class="row topnav"><a href="#st-'+t.stage+'">← Этап '+t.stage+'. '+esc(STAGES[t.stage].title)+'</a><span class="sp"></span>'+(pv?'<a class="btn sm" data-act="opennote" href="#t-'+pv.id+'" title="'+esc(pv.title)+'">← Предыдущая</a>':'')+(nx?'<a class="btn sm" data-act="opennote" href="#t-'+nx.id+'" title="'+esc(nx.title)+'">Следующая →</a>':'')+'</div>'
 +hero+tiles
 +'<div class="tabs" role="tablist">'+tabs.map(x=>'<button class="btn sm'+(topicTab===x[0]?' on':'')+'" role="tab" aria-selected="'+(topicTab===x[0])+'" data-act="tab" data-tab="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>'
 +'<div class="card">'+body+'</div>'+bottomNav;
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
 const t0=todayS(),nt=nextTopic(),todayBlocks=S.blocks.filter(b=>b.date===t0).sort((a,b)=>a.start-b.start);
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
 +'<div class="card"><h3>Расписание пар</h3><p class="small">Взято из твоей Google-таблицы. Числитель с понедельника 14.09.2026, недели чередуются. Сейчас: <b>'+(parity(todayS())==='Ч'?'числитель':'знаменатель')+'</b>. Если пары изменятся, скажи мне в чате, я обновлю сайт.</p></div>'
 +'<div class="card"><h3>Сброс</h3><p><button class="btn danger" data-act="reset">Стереть всё</button></p></div>';
}

// ---------- календарь ----------
const HH=48,CAL0=8*60,CAL1=21*60;
function vCalendar(){
 const head='<div class="cal-head"><button class="btn sm" data-act="calprev" aria-label="Назад">←</button><button class="btn sm" data-act="caltoday">Сегодня</button><button class="btn sm" data-act="calnext" aria-label="Вперёд">→</button><b class="sp" id="calttl"></b><button class="btn sm'+(calMode==='week'?' on':'')+'" data-act="calmode" data-v="week">Неделя</button><button class="btn sm'+(calMode==='month'?' on':'')+'" data-act="calmode" data-v="month">Месяц</button><button class="btn sm" data-act="rebuildplan">Перестроить план</button><button class="btn sm pri" data-act="newblock">+ Блок</button></div>';
 const leg='<p class="small mute"><span class="chip" style="background:var(--pair)">пара</span><span class="chip">блок Go (тяни, чтобы перенести; нажми, чтобы изменить)</span><span class="chip warn">повторение</span> Выходные заняты отдыхом: блоки туда не ставятся.</p>';
 return '<h1>Календарь</h1>'+head+(calMode==='week'?weekView():monthView())+leg;
}
function weekView(){
 const mon=mondayOf(calDate),days=[...Array(7)].map((_,i)=>addDays(mon,i)),t=todayS();
 const par=parity(mon),H=(CAL1-CAL0)/60*HH;
 let hours='<div class="hours" style="padding-top:0">'+[...Array((CAL1-CAL0)/60)].map((_,i)=>'<div>'+pad(CAL0/60+i)+':00</div>').join('')+'</div>';
 let cols=days.map(d=>{
  const we=isWE(d);let ev='';
  if(!we){
   const ps=pairsOn(d);
   if(ps.length){const a=ps[0].s-40,b=ps[ps.length-1].e+25;
    ev+=evBox(a,ps[0].s,'travel','дорога');ev+=evBox(ps[ps.length-1].e,b,'travel','дорога');
    ps.forEach(p=>ev+=evBox(p.s,p.e,'pair','<b>'+fmtT(p.s)+'</b> '+esc(p.name)+' ('+p.kind+(p.room?', '+esc(p.room):'')+')'))}
   S.reviews.filter(r=>!r.done&&r.due===d).forEach((r,i)=>{ev+='<div class="ev rev" style="top:'+(i*20)+'px;height:20px;pointer-events:none">↻ '+esc((TBY[r.topic]||{title:''}).title)+'</div>'});
   S.blocks.filter(b=>b.date===d).forEach(b=>{ev+=evBox(b.start,b.start+b.dur,'go'+(b.done?' done':''),'<b>'+fmtT(b.start)+'</b> '+esc(b.title),' data-bid="'+b.id+'" tabindex="0" role="button"')});
  }else ev='<div style="padding:8px;color:var(--mute);font-size:13px">Выходной</div>';
  return '<div class="daycol'+(we?' we':'')+(d===t?' today':'')+'" data-date="'+d+'" style="height:'+H+'px">'+ev+'</div>';
 });
 const heads='<div class="dayh"></div>'+days.map(d=>'<div class="dayh'+(d===t?' today':'')+(isWE(d)?' we':'')+'">'+DOW[dow(d)-1]+' '+parse(d).getDate()+'</div>').join('');
 return '<p class="small mute" id="calsub" data-ttl="'+fmtD(days[0])+' – '+fmtD(days[6])+' · '+(par==='Ч'?'числитель':'знаменатель')+'">'+(par==='Ч'?'Числитель':'Знаменатель')+'</p><div class="calwrap"><div class="calgrid">'+heads+hours+cols.join('')+'</div></div>';
}
function evBox(a,b,cls,html,attrs){
 if(b<=CAL0||a>=CAL1)return '';
 const top=(Math.max(a,CAL0)-CAL0)/60*HH,h=Math.max(18,(Math.min(b,CAL1)-Math.max(a,CAL0))/60*HH-2);
 return '<div class="ev '+cls+'" style="top:'+top+'px;height:'+h+'px"'+(attrs||'')+'>'+html+'</div>';
}
function monthView(){
 const d=parse(monthDate),y=d.getFullYear(),m=d.getMonth();
 const first=iso(new Date(y,m,1)),start=mondayOf(first),t=todayS();
 let cells='';
 for(let i=0;i<42;i++){const s=addDays(start,i);if(i>=35&&parse(s).getMonth()!==m)break;
  const bl=S.blocks.filter(b=>b.date===s),dn=bl.filter(b=>b.done).length,rv=S.reviews.filter(r=>!r.done&&r.due===s).length;
  cells+='<button class="mcell'+(isWE(s)?' we':'')+(parse(s).getMonth()!==m?' out':'')+(s===t?' today':'')+'" data-act="gotoweek" data-date="'+s+'" aria-label="'+fmtD(s)+'"><b>'+parse(s).getDate()+'</b>'+(dow(s)===1?' <span class="small mute">'+parity(s)+'</span>':'')+(bl.length?'<br><span class="chip">Go '+dn+'/'+bl.length+'</span>':'')+(rv?'<br><span class="chip warn">↻ '+rv+'</span>':'')+'</button>';}
 return '<p class="small mute" id="calsub" data-ttl="'+MONN[m]+' '+y+'">Нажми на день, чтобы открыть неделю. Ч и З у понедельников — числитель и знаменатель.</p><div class="mgrid" style="margin-bottom:4px">'+DOW.map(x=>'<div class="small mute" style="text-align:center">'+x+'</div>').join('')+'</div><div class="mgrid">'+cells+'</div>';
}
function bindCalendar(){
 const sub=$('#calsub'),ttl=$('#calttl');if(sub&&ttl)ttl.textContent=sub.dataset.ttl;
 document.querySelectorAll('.daycol').forEach(col=>{
  col.addEventListener('click',e=>{
   if(e.target.closest('.ev.go'))return;
   if(col.classList.contains('we')){toast('Выходной. Блоки на выходные не ставим.');return}
   const y=e.clientY-col.getBoundingClientRect().top;
   const mins=Math.max(CAL0,Math.min(CAL1-50,CAL0+Math.round(y/HH*60/15)*15));
   openBlock(null,{date:col.dataset.date,start:mins});
  });
 });
 document.querySelectorAll('.ev.go').forEach(n=>{
  n.addEventListener('pointerdown',e=>startDrag(e,n));
  n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openBlock(n.dataset.bid)}});
 });
}
function overlapPair(date,s,e){return pairsOn(date).some(p=>s<p.e&&e>p.s)}
function tryPlace(b,date,start){
 if(isWE(date)){toast('Выходной. Блоки на выходные не ставим.');return false}
 if(overlapPair(date,start,start+b.dur)){toast('Пересекается с парой. Выбери другое время.');return false}
 b.date=date;b.start=start;save();return true;
}
function startDrag(e,node){
 if(e.button!==undefined&&e.button!==0)return;
 const b=S.blocks.find(x=>x.id===node.dataset.bid);if(!b)return;
 const sx=e.clientX,sy=e.clientY,r0=node.getBoundingClientRect();let moved=false;
 node.setPointerCapture(e.pointerId);
 const mv=ev=>{const dx=ev.clientX-sx,dy=ev.clientY-sy;if(!moved&&Math.abs(dx)+Math.abs(dy)<6)return;moved=true;node.classList.add('drag');node.style.transform='translate('+dx+'px,'+dy+'px)'};
 const up=ev=>{
  node.removeEventListener('pointermove',mv);node.removeEventListener('pointerup',up);node.removeEventListener('pointercancel',up);
  try{node.releasePointerCapture(ev.pointerId)}catch(_){}
  if(!moved){openBlock(b.id);return}
  const cols=[...document.querySelectorAll('.daycol')];
  const col=cols.find(c=>{const r=c.getBoundingClientRect();return ev.clientX>=r.left&&ev.clientX<r.right});
  if(!col){render();return}
  const colTop=col.getBoundingClientRect().top;
  let mins=CAL0+Math.round(((r0.top+(ev.clientY-sy)-colTop)/HH*60)/15)*15;
  mins=Math.max(CAL0,Math.min(CAL1-b.dur,mins));
  tryPlace(b,col.dataset.date,mins);
  render();
 };
 node.addEventListener('pointermove',mv);node.addEventListener('pointerup',up);node.addEventListener('pointercancel',up);
}
function openBlock(id,pre){
 const b=id?S.blocks.find(x=>x.id===id):null;
 const nt=nextTopic();
 const v=b||Object.assign({title:nt?'Go: '+nt.title:'Go',topic:nt?nt.id:'',date:nextWeekday(todayS()),start:9*60+30,dur:50,done:false},pre||{});
 const m=document.createElement('div');m.className='modal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');
 m.innerHTML='<form class="box" data-form="block"><h3>'+(b?'Блок':'Новый блок')+'</h3><label>Название</label><input type="text" name="title" required value="'+esc(v.title)+'"><label>Тема</label><select name="topic">'+topicOptions(v.topic)+'</select><div class="row"><div><label>Дата</label><input type="date" name="date" required value="'+v.date+'"></div><div><label>Начало</label><input type="time" name="start" required step="900" value="'+fmtT(v.start)+'"></div></div><label>Длительность, мин</label><input type="number" name="dur" min="15" max="180" step="5" value="'+v.dur+'"><label><input type="checkbox" name="done"'+(v.done?' checked':'')+'> Выполнен</label><input type="hidden" name="id" value="'+(b?b.id:'')+'"><p class="row"><button class="btn pri" type="submit">Сохранить</button><button class="btn" type="button" data-act="closemodal">Отмена</button>'+(b?'<span class="sp"></span><button class="btn danger" type="button" data-act="delblock" data-id="'+b.id+'">Удалить</button>':'')+'</p></form>';
 document.body.appendChild(m);const f=m.querySelector('input[name=title]');f&&f.focus();
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
 else if(a==='mfilter'){const y=scrollY;if(el.dataset.k==='type')matType=el.dataset.v;else matLang=el.dataset.v;render();scrollTo(0,y)}
 else if(a==='newq'){qShift++;const y=scrollY;render();scrollTo(0,y)}
 else if(a==='mreset'){matType='all';matLang='all';matStage='all';matQ='';render()}
 else if(a==='sfilter'){stageFilter=el.dataset.v;const y=scrollY;render();scrollTo(0,y)}
 else if(a==='tab'){topicTab=el.dataset.tab;render()}
 else if(a==='plan'){openBlock(null,{title:'Go: '+TBY[id].title,topic:id})}
 else if(a==='revdone'){const r=S.reviews.find(x=>x.id===id);if(r){r.done=true;r.doneAt=todayS();save();render()}}
 else if(a==='bdone'){const b=S.blocks.find(x=>x.id===id);if(b){b.done=!b.done;save();render()}}
 else if(a==='openpractice'){topicTab='task'}
 else if(a==='tfilter'){taskFilter=el.dataset.v;const y=scrollY;render();scrollTo(0,y)}
 else if(a==='ptoggle'){const i=el.dataset.i,pr=S.practice[id]=S.practice[id]||{};
  if(el.checked){pr[i]=true;S.practiceAt[id+':'+i]=todayS()}else{delete pr[i];delete S.practiceAt[id+':'+i]}
  save();const y=scrollY;render();scrollTo(0,y)}
 else if(a==='closemodal'){const m=$('.modal');m&&m.remove()}
 else if(a==='delblock'){S.blocks=S.blocks.filter(x=>x.id!==id);save();const m=$('.modal');m&&m.remove();render()}
 else if(a==='newblock'){openBlock(null,{})}
 else if(a==='rebuildplan'){if(confirm('Заменить все будущие невыполненные блоки новым планом по оставшимся темам?')){const r=rebuildPlan();render();toast('Поставлено блоков: '+r.placed+(r.left?'. Не влезло до 31.12: '+r.left:''))}}
 else if(a==='calprev'||a==='calnext'){const k=a==='calnext'?1:-1;if(calMode==='week')calDate=addDays(calDate,7*k);else{const d=parse(monthDate);d.setMonth(d.getMonth()+k,1);monthDate=iso(d)}render()}
 else if(a==='caltoday'){calDate=todayS();monthDate=todayS();render()}
 else if(a==='calmode'){calMode=el.dataset.v;if(calMode==='month')monthDate=calDate;render()}
 else if(a==='gotoweek'){calDate=el.dataset.date;calMode='week';render()}
 else if(a==='theme'){S.theme=el.dataset.v;save();applyTheme();render()}
 else if(a==='export'){$('#exp').value=JSON.stringify(S,null,1)}
 else if(a==='copy'){const t=$('#exp');if(!t.value)t.value=JSON.stringify(S,null,1);t.select();try{navigator.clipboard.writeText(t.value).then(()=>toast('Скопировано'),()=>toast('Выдели текст и скопируй вручную'))}catch(_){toast('Выдели текст и скопируй вручную')}}
 else if(a==='import'){doImport($('#imp').value)}
 else if(a==='reset'){if(el.dataset.sure){S=defaults();save();render();toast('Данные стёрты')}else{el.dataset.sure='1';el.textContent='Точно стереть? Нажми ещё раз';setTimeout(()=>{el.dataset.sure='';el.textContent='Стереть всё'},4000)}}
 else if(a==='ttoggle'){const p=$('#tpanel');p.hidden=!p.hidden;if(!p.hidden)p.innerHTML=timerPanel()}
});
document.addEventListener('change',e=>{if(e.target.id==='mstage'){matStage=e.target.value;applyMatFilter();return}
 
 if(e.target.id==='ttopic'){S.timer.topic=e.target.value;save()}
 if(e.target.id==='impf'){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>doImport(String(r.result));r.readAsText(f)}
});
document.addEventListener('input',e=>{if(e.target.id==='mq'){matQ=e.target.value;applyMatFilter();return}const n=e.target.dataset&&e.target.dataset.note;if(n){S.notes[n]=e.target.value;save()}});
document.addEventListener('submit',e=>{
 const f=e.target.closest('form');if(!f)return;e.preventDefault();
 const fd=Object.fromEntries(new FormData(f).entries()),k=f.dataset.form;
 if(k==='addlink'){if(!/^https?:\/\//i.test(fd.url)){toast('Адрес должен начинаться с http:// или https://');return}
  S.links.push({topic:fd.topic||'',title:fd.title,url:fd.url,type:fd.type,lang:fd.lang});save();render();toast('Ссылка добавлена')}

 else if(k==='block'){
  const dur=Math.max(15,+fd.dur||50),start=toMin(fd.start);
  let b=fd.id?S.blocks.find(x=>x.id===fd.id):null;
  const tmp={dur,date:b?b.date:fd.date,start:b?b.start:start};
  if(isWE(fd.date)){toast('Выходной. Блоки на выходные не ставим.');return}
  if(overlapPair(fd.date,start,start+dur)){toast('Пересекается с парой. Выбери другое время.');return}
  if(!b){b={id:uid()};S.blocks.push(b)}
  Object.assign(b,{title:fd.title,topic:fd.topic||'',date:fd.date,start,dur,done:!!fd.done});
  save();const m=$('.modal');m&&m.remove();render()}
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
const GO_WIN={ // окна для Go по дню недели; у знаменателя и числителя отличается только среда
 'Ч':{1:['09:30-12:30'],2:['09:30-12:00'],3:['09:30-10:30','17:25-19:25'],4:['09:30-12:00'],5:['09:30-12:30']},
 'З':{1:['09:30-12:30'],2:['09:30-12:00'],3:['09:30-12:00'],4:['09:30-12:00'],5:['09:30-12:30']}};
const PLAN_END='2026-12-31', PLAN_SKIP=['2026-12-31']; // конец плана и праздничные дни
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
// Ставит блоки по оставшимся темам на каждый будний день, начиная с завтра. Будущие невыполненные блоки заменяются.
function rebuildPlan(){
 const from=addDays(todayS(),1);
 S.blocks=S.blocks.filter(b=>b.done||b.date<from);
 const queue=[];
 TOPICS.forEach(t=>{const st=topicStatus(t.id);if(st==='done')return;
  for(let i=1;i<=t.blocks;i++)queue.push({topic:t.id,title:'Go: '+t.title+(t.blocks>1?' ('+i+'/'+t.blocks+')':'')})});
 let d=from,placed=0;
 while(d<=PLAN_END&&queue.length){
  for(const st of planSlots(d)){
   if(!queue.length)break;
   const q=queue.shift();
   S.blocks.push({id:uid(),title:q.title,topic:q.topic,date:d,start:st,dur:BLOCK_MIN,done:false});placed++;
  }
  d=addDays(d,1);
 }
 S.planV=1;save();
 return {placed,left:queue.length};
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
 const calDone=S.blocks.filter(b=>b.done).length,calAll=S.blocks.length;
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
 circle:'<circle cx="12" cy="12" r="8"/>',
 dotfill:'<circle cx="12" cy="12" r="6" fill="currentColor"/>',
 half:'<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/>',
 redo:'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>'
};
const EMOJI_ICON={'📅':'calendar','📆':'calendar','🗓':'calendar','🎯':'target','🧠':'help','🎉':'sparkles','✨':'sparkles','🔥':'flame','🔁':'repeat','⏱':'timer','✅':'checkcircle','🧱':'grid',
 '📘':'book','📖':'bookopen','🌿':'leaf','🌱':'leaf','🌙':'moon','☕':'coffee','📚':'library','⏳':'hourglass','🔀':'refresh','🏅':'award','🛠':'terminal','🔤':'type',
 '🧪':'flask','⚡':'zap','🌐':'globe','🗄':'database','🚀':'flag','💼':'briefcase','📄':'file','🎓':'cap','🧩':'cube','🔗':'link','💡':'bulb','✓':'check','✔':'check','▶':'play',
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

function init(){
 applyTheme();banner();
 startIcons();
 if(!S.planV)rebuildPlan();
 startVisit();setInterval(beat,5000);
 setInterval(()=>{if(route==='home'){const c=document.getElementById('todaycard');if(c)c.outerHTML=todayCard()}},30000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save()});
 addEventListener('pagehide',save);
 window.addEventListener('hashchange',render);
 setInterval(renderTimer,500);
 render();
}
init();
})();

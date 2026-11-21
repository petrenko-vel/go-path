// ===== КОНСПЕКТЫ тем. Карта переделана под курсы Stepik, конспекты добавляются по главам файлами js/notes-*.js =====
// блоки: ['p',html] ['h',text] ['ul',[html]] ['ol',[html]] ['code',src] ['out',text] ['warn',html] ['tbl',[head],[rows]] ['real',уровень,подпись,[пункты]] ['case',заголовок,html] ['src',[[название,url,описание,язык]]]
const A=(u,t)=>`<a href="${u}" target="_blank" rel="noopener noreferrer">${t}</a>`;
const TOPIC_DATA = {};

// Подключает конспекты (js/notes-*.js): блоки заменяются, ссылки дополняются старыми
function mergeNotes(N){
 Object.keys(N).forEach(id=>{
  const old=TOPIC_DATA[id]||{b:[],q:[],l:[]},n=N[id];
  const urls=new Set((n.l||[]).map(x=>x[2]));
  TOPIC_DATA[id]={b:n.b,q:n.q||old.q,l:(n.l||[]).concat((old.l||[]).filter(x=>!urls.has(x[2]))),quiz:n.quiz||null,task:n.task||null};
 });
}
// «§» в примерах кода означает обратную кавычку (чтобы не экранировать в шаблонных строках)
function fixTicks(){Object.values(TOPIC_DATA).forEach(d=>d.b.forEach(b=>{if(b[0]==='code'||b[0]==='out'||b[0]==='lines')b[1]=b[1].replace(/§/g,'`')}))}

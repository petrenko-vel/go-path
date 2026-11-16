// конспекты привязаны к старым номерам тем: переносим на новые
(function(){
 const n={};
 Object.keys(TOPIC_DATA).forEach(k=>{n[ID_MAP[k]||k]=TOPIC_DATA[k]});
 Object.keys(TOPIC_DATA).forEach(k=>{delete TOPIC_DATA[k]});
 Object.assign(TOPIC_DATA,n);
})();
fixTicks();

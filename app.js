const $=s=>document.querySelector(s),app=$('#app');
const ST=JSON.parse(localStorage.getItem('cao')||'{}');ST.best=ST.best||{};ST.known=ST.known||{};ST.lang=ST.lang||'ru';
const save=()=>localStorage.setItem('cao',JSON.stringify(ST));
document.documentElement.dataset.t=ST.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
$('#theme').onclick=()=>{ST.theme=document.documentElement.dataset.t=document.documentElement.dataset.t=='dark'?'light':'dark';save()};
const LG={ru:'RU',en:'EN',both:'RU+EN'};$('#lang').textContent=LG[ST.lang];
$('#lang').onclick=()=>{ST.lang={ru:'en',en:'both',both:'ru'}[ST.lang];$('#lang').textContent=LG[ST.lang];save();route()};
const T=(ru,en)=>ST.lang=='ru'?ru:ST.lang=='en'?en:ru+' / '+en;
const KEYS=['1','2','5','6','8','cp'],NAME={cp:'Checkpoint 5–6'};
const mname=k=>k=='cp'?NAME.cp:MODS[k].t;
const qs=k=>QUESTIONS.filter(q=>q.m==k);
const shuf=a=>{a=[...a];for(let i=a.length-1;i;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const theoryHTML=k=>{const m=MODS[k];return `<div class="card"><h2>${m.t}</h2>${ST.lang!='en'?'<ul class="th">'+m.ru.map(x=>`<li>${x}</li>`).join('')+'</ul>':''}${ST.lang!='ru'?'<ul class="th mut">'+m.en.map(x=>`<li>${x}</li>`).join('')+'</ul>':''}</div>`};
function home(){const know=k=>qs(k).filter(q=>ST.known[q.id]).length;
app.innerHTML=`<h1>${T('Подготовка к мидтерму','Midterm prep')}</h1><p class="mut">Computer Architecture and Organisation · IT Essentials 8 · ${QUESTIONS.length} ${T('вопросов','questions')}</p>
<div class="grid">${KEYS.map(k=>{const n=qs(k).length,b=ST.best[k];return `<a class="card" href="#/m/${k}/${k=='cp'?'questions':'theory'}"><div class="big">${k=='cp'?'5–6':k}</div><b>${mname(k).split('·').pop().trim()}</b><div class="mut">${n} ${T('вопросов','questions')} · ${T('карточки','cards')} ${know(k)}/${n}${b!=null?' · '+T('лучший тест','best')+' '+b+'%':''}</div><div class="bar"><i style="width:${know(k)/n*100}%"></i></div></a>`}).join('')}
<a class="card" href="#/test" style="border-color:var(--cu)"><div class="big">▶</div><b>${T('Полный тест','Full test')}</b><div class="mut">${T('Все модули, варианты ответов перемешиваются','All modules, answer options are shuffled')}</div></a></div>`}
function module(k,tab){const tabs=(k=='cp'?['questions','cards','test']:['theory','questions','cards','test']),L={theory:T('Теория','Theory'),questions:T('Вопросы','Questions'),cards:T('Карточки','Flashcards'),test:T('Тест','Test')};
app.innerHTML=`<h1>${mname(k)}</h1><div class="tabs">${tabs.map(t=>`<a class="${t==tab?'on':''}" href="#/m/${k}/${t}">${L[t]}</a>`).join('')}</div><div id="v"></div>`;
const v=$('#v');if(tab=='theory')v.innerHTML=theoryHTML(k);
if(tab=='questions')v.innerHTML=qs(k).map((q,i)=>`<div class="card" style="margin:12px 0"><b>${i+1}. ${esc(q.q)}</b>${q.a.length>1?` <span class="tag">${T('выберите несколько','choose several')}</span>`:''}${q.o.map((o,j)=>`<div class="opt ${q.a.includes(j)?'ok':''}" style="border:1px solid var(--line);border-radius:10px;padding:8px 12px;margin:6px 0">${q.a.includes(j)?'✓ ':''}${esc(o)}</div>`).join('')}</div>`).join('');
if(tab=='cards')cards(v,k);if(tab=='test')run(v,qs(k),k,qs(k).length)}
function cards(v,k){let deck=shuf(qs(k)).sort((a,b)=>!!ST.known[a.id]-!!ST.known[b.id]),i=0,back=false;
const draw=()=>{if(i>=deck.length){v.innerHTML=`<div class="card">${T('Колода пройдена','Deck complete')} 🎉<div class="row"><button class="p" id="re">${T('Заново','Restart')}</button></div></div>`;$('#re').onclick=()=>cards(v,k);return}
const q=deck[i];v.innerHTML=`<div class="mut">${i+1}/${deck.length}</div><div class="card flip" id="c" tabindex="0">${back?q.a.map(j=>`<div>✓ ${esc(q.o[j])}</div>`).join(''):esc(q.q)}</div><div class="mut">${T('Нажмите на карточку, чтобы перевернуть','Tap the card to flip')}</div><div class="row"><button id="no">${T('Повторить','Review again')}</button><button class="p" id="yes">${T('Знаю','Got it')}</button></div>`;
$('#c').onclick=()=>{back=!back;draw()};$('#yes').onclick=()=>{ST.known[q.id]=1;save();i++;back=false;draw()};$('#no').onclick=()=>{delete ST.known[q.id];save();i++;back=false;draw()}};draw()}
function run(v,list,key,n){v.innerHTML=`<div class="card"><p>${list.length} ${T('вопросов','questions')}. ${T('Порядок вопросов и вариантов ответа случайный — запоминайте смысл, а не позицию.','Questions and options are shuffled — learn the answer, not its position.')}</p><button class="p" id="go">${T('Начать тест','Start test')}</button></div>`;
$('#go').onclick=()=>{const Qs=shuf(list).slice(0,n).map(q=>{const o=shuf(q.o.map((t,j)=>({t,ok:q.a.includes(j)})));return{q:q.q,o,multi:q.a.length>1}});let i=0,score=0,wrong=[];
const step=()=>{if(i>=Qs.length){const p=Math.round(score/Qs.length*100);if(key){ST.best[key]=Math.max(ST.best[key]||0,p);save()}
v.innerHTML=`<div class="card"><div class="big">${p}%</div>${score}/${Qs.length}<div class="row"><button class="p" id="again">${T('Ещё раз','Retry')}</button></div></div>`+(wrong.length?`<h2>${T('Ошибки','Mistakes')}</h2>`+wrong.map(w=>`<div class="card" style="margin:10px 0"><b>${esc(w.q)}</b>${w.o.filter(o=>o.ok).map(o=>`<div class="opt ok">✓ ${esc(o.t)}</div>`).join('')}</div>`).join(''):'');$('#again').onclick=()=>run(v,list,key,n);return}
const q=Qs[i],sel=new Set();let done=false;
const paint=()=>{v.innerHTML=`<div class="bar"><i style="width:${i/Qs.length*100}%"></i></div><div class="card" style="margin-top:14px"><div class="mut">${i+1}/${Qs.length}${q.multi?' · '+T('выберите несколько','choose all that apply'):''}</div><h2>${esc(q.q)}</h2>${q.o.map((o,j)=>`<button class="opt ${done?(o.ok?'ok':sel.has(j)?'bad':''):sel.has(j)?'sel':''}" data-j="${j}" ${done?'disabled':''}>${esc(o.t)}</button>`).join('')}<div class="row"><button class="p" id="nx">${done?(i+1<Qs.length?T('Дальше','Next'):T('Результат','Finish')):T('Проверить','Check')}</button></div></div>`;
v.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const j=+b.dataset.j;if(!q.multi)sel.clear();sel.has(j)?sel.delete(j):sel.add(j);paint()});
$('#nx').onclick=()=>{if(done){i++;step();return}if(!sel.size)return;done=true;const good=q.o.every((o,j)=>o.ok==sel.has(j));if(good)score++;else wrong.push(q);paint()}};paint()};step()}}
function fullTest(){app.innerHTML=`<h1>${T('Полный тест','Full test')}</h1><div class="card"><div class="row">${KEYS.map(k=>`<label><input type="checkbox" value="${k}" checked> ${k=='cp'?'5–6 CP':T('Модуль ','Module ')+k}</label>`).join('')}</div><div class="row"><label>${T('Вопросов','Questions')}: <select id="n"><option>20</option><option>40</option><option>60</option><option value="999">${T('все','all')}</option></select></label></div></div><div id="v"></div>`;
const go=()=>{const ks=[...document.querySelectorAll('input:checked')].map(i=>i.value),list=QUESTIONS.filter(q=>ks.includes(q.m));if(list.length)run($('#v'),list,null,+$('#n').value)};document.querySelectorAll('input,select').forEach(e=>e.onchange=go);go()}
function route(){const p=location.hash.slice(2).split('/');scrollTo(0,0);
if(p[0]=='m'&&KEYS.includes(p[1]))module(p[1],p[2]||'questions');else if(p[0]=='theory')app.innerHTML=`<h1>${T('Вся теория','All theory')}</h1>`+KEYS.filter(k=>k!='cp').map(theoryHTML).join('<br>');else if(p[0]=='test')fullTest();else home()}
addEventListener('hashchange',route);route();

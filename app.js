let user=null,posts=[],stories=[],chats=[],friends=[],activeChat=null,postPhoto=null,storyPhoto=null,storyTimer=null,storyPct=0;
const DB_VERSION=4;
(function(){try{const v=parseInt(localStorage.getItem('db_version')||'0',10);if(v!==DB_VERSION){if(v<3)Object.keys(localStorage).filter(k=>k.startsWith('db_')).forEach(k=>localStorage.removeItem(k));localStorage.setItem('db_version',String(DB_VERSION))}}catch(e){}})();

function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
function now(){return Date.now()}
function ago(t){const s=Math.floor((Date.now()-t)/1000);if(s<60)return'Just now';if(s<3600)return Math.floor(s/60)+'m';if(s<86400)return Math.floor(s/3600)+'h';return Math.floor(s/86400)+'d'}
function ini(n){return(n||'?').split(/\s+/).map(x=>x[0]).join('').toUpperCase().slice(0,2)}
function hash(s){let h=0;for(let i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0}return'h'+Math.abs(h).toString(16)}
function save(k,v){try{localStorage.setItem('db_'+k,JSON.stringify(v));return true}catch(e){toast('Could not save');return false}}
function load(k,d){try{const v=JSON.parse(localStorage.getItem('db_'+k));return v!=null?v:d}catch(e){return d}}
function toast(m){const t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);setTimeout(()=>t.remove(),2200)}
function esc(s){const d=document.createElement('div');d.textContent=s||'';return d.innerHTML}
function compress(file,max,q){return new Promise(r=>{const img=new Image(),u=URL.createObjectURL(file);img.onload=()=>{URL.revokeObjectURL(u);let w=img.width,h=img.height;if(w>max){h=Math.round(h*max/w);w=max}const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);r(c.toDataURL('image/jpeg',q))};img.onerror=()=>r(null);img.src=u})}

function heartbeat(){
  if(!user) return;
  let presence=load('presence',{});
  presence[user.id]={id:user.id,name:user.name,email:user.email,photo:user.photo||null,last:now()};
  const cutoff=now()-5*60*1000;
  Object.keys(presence).forEach(id=>{if(presence[id].last<cutoff) delete presence[id]});
  save('presence',presence);
  updateOnlineBadge();
}
function getOnline(){
  const presence=load('presence',{});
  const cutoff=now()-5*60*1000;
  return Object.values(presence).filter(p=>p.last>=cutoff).sort((a,b)=>b.last-a.last);
}
function updateOnlineBadge(){
  const n=getOnline().filter(p=>user && p.id!==user.id).length;
  const b=document.getElementById('online-badge');
  if(!b) return;
  if(n>0){b.textContent=String(n);b.classList.remove('hidden')}else b.classList.add('hidden');
}

function showLogin(){document.getElementById('login-box').classList.remove('hidden');document.getElementById('reg-box').classList.add('hidden')}
function showReg(){document.getElementById('login-box').classList.add('hidden');document.getElementById('reg-box').classList.remove('hidden')}

function doRegister(){
  const name=document.getElementById('reg-name').value.trim(),camp=document.getElementById('reg-camp').value.trim()||'',email=document.getElementById('reg-email').value.trim().toLowerCase(),pass=document.getElementById('reg-pass').value,err=document.getElementById('reg-err');
  if(!name||!email||pass.length<6){err.textContent='Enter name, email, password (6+)';err.classList.remove('hidden');return}
  let users=load('users',{});
  if(users[email]){err.textContent='Email already registered';err.classList.remove('hidden');return}
  const u={id:uid(),name,camp,email,bio:'',photo:null,passHash:hash(pass),created:now()};
  users[email]=u;save('users',users);
  user={id:u.id,name,camp,email,bio:'',photo:null};save('session',user);
  let people=load('people',[]);
  if(!people.find(p=>p.email===email)){people.push({id:u.id,name,camp,email,photo:null});save('people',people)}
  heartbeat();enter();toast('Welcome to DeerBook!');
}
function doLogin(){
  const email=document.getElementById('login-email').value.trim().toLowerCase(),pass=document.getElementById('login-pass').value,err=document.getElementById('login-err');
  const u=load('users',{})[email];
  if(!u||u.passHash!==hash(pass)){err.textContent='Wrong email or password';err.classList.remove('hidden');return}
  user={id:u.id,name:u.name,camp:u.camp||'',email:u.email,bio:u.bio||'',photo:u.photo||null};save('session',user);
  heartbeat();enter();
}
function doLogout(){
  if(user){let presence=load('presence',{});delete presence[user.id];save('presence',presence)}
  localStorage.removeItem('db_session');user=null;
  document.getElementById('app').classList.add('hidden');document.getElementById('auth').classList.remove('hidden');showLogin();
}

function enter(){
  document.getElementById('auth').classList.add('hidden');document.getElementById('app').classList.remove('hidden');
  updateAvatars();
  document.getElementById('menu-name').textContent=user.name;
  document.getElementById('prof-name').textContent=user.name;
  document.getElementById('prof-camp').textContent=user.camp||'';
  document.getElementById('prof-email').textContent=user.email;
  const b=document.getElementById('prof-bio');if(b)b.textContent=user.bio||'';
  posts=load('posts',[]);
  stories=load('stories',[]).filter(s=>now()-s.created<86400000);
  chats=load('chats_'+user.id,[]);
  friends=load('friends_'+user.id,[]);
  heartbeat();
  go('feed');
  setInterval(heartbeat,30000);
}
function updateAvatars(){
  const letter=ini(user&&user.name);
  ['nav-av','comp-av','menu-av','prof-av'].forEach(id=>{
    const e=document.getElementById(id);if(!e)return;
    if(user&&user.photo){e.innerHTML=`<img src="${user.photo}" class="w-full h-full object-cover" alt="">`;e.classList.remove('bg-fb-blue')}
    else{e.textContent=letter;e.classList.add('bg-fb-blue')}
  });
  const img=document.getElementById('prof-av-img'),av=document.getElementById('prof-av');
  if(img&&user&&user.photo){img.src=user.photo;img.classList.remove('hidden');if(av)av.classList.add('opacity-0')}
  else if(img){img.classList.add('hidden');if(av)av.classList.remove('opacity-0')}
}

function showEditProfile(){
  document.getElementById('prof-view').classList.add('hidden');
  document.getElementById('prof-edit').classList.remove('hidden');
  document.getElementById('edit-name').value=user.name||'';
  document.getElementById('edit-camp').value=user.camp||'';
  document.getElementById('edit-bio').value=user.bio||'';
}
function cancelEditProfile(){document.getElementById('prof-edit').classList.add('hidden');document.getElementById('prof-view').classList.remove('hidden')}
function saveProfile(){
  const name=document.getElementById('edit-name').value.trim(),camp=document.getElementById('edit-camp').value.trim(),bio=document.getElementById('edit-bio').value.trim();
  if(!name){toast('Name required');return}
  user.name=name;user.camp=camp;user.bio=bio;save('session',user);
  let users=load('users',{});
  if(users[user.email]){users[user.email].name=name;users[user.email].camp=camp;users[user.email].bio=bio;save('users',users)}
  let people=load('people',[]);
  const pi=people.findIndex(p=>p.id===user.id);
  if(pi>=0){people[pi].name=name;people[pi].camp=camp;save('people',people)}
  document.getElementById('prof-name').textContent=name;
  document.getElementById('prof-camp').textContent=camp;
  document.getElementById('prof-bio').textContent=bio;
  document.getElementById('menu-name').textContent=name;
  updateAvatars();heartbeat();cancelEditProfile();toast('Profile saved');
}
async function onProfilePhoto(e){
  const f=e.target.files[0];if(!f)return;
  const data=await compress(f,400,0.75);if(!data)return;
  user.photo=data;save('session',user);
  let users=load('users',{});
  if(users[user.email]){users[user.email].photo=data;save('users',users)}
  let people=load('people',[]);
  const pi=people.findIndex(p=>p.id===user.id);
  if(pi>=0){people[pi].photo=data;save('people',people)}
  updateAvatars();heartbeat();toast('Photo updated');
}

function go(page){
  ['feed','online','friends','chat','menu','profile'].forEach(p=>{
    const el=document.getElementById('page-'+p);if(el)el.classList.toggle('hidden',p!==page);
    const nav=document.getElementById('nav-'+p);
    if(nav){
      if(p===page){nav.classList.add('text-fb-blue','border-b-2','border-fb-blue');nav.classList.remove('text-fb-sec')}
      else{nav.classList.remove('text-fb-blue','border-b-2','border-fb-blue');nav.classList.add('text-fb-sec')}
    }
  });
  if(page==='feed'){renderFeed();renderStories()}
  if(page==='online')renderOnline();
  if(page==='friends')renderPeople();
  if(page==='chat'){document.getElementById('chat-list').classList.remove('hidden');renderChats()}
  if(page==='profile')renderProfPosts();
}

function openComposer(){document.getElementById('composer-expand').classList.remove('hidden');document.getElementById('post-text-full').focus()}
async function onPhoto(e){const f=e.target.files[0];if(!f)return;postPhoto=await compress(f,1200,0.75);if(postPhoto){document.getElementById('post-prev-img').src=postPhoto;document.getElementById('post-prev').classList.remove('hidden')}}
function clearPhoto(){postPhoto=null;document.getElementById('post-prev').classList.add('hidden')}
function createPost(){
  const text=(document.getElementById('post-text-full').value||'').trim();
  if(!text&&!postPhoto){toast('Write something or add a photo');return}
  posts.unshift({id:uid(),authorId:user.id,author:user.name,camp:user.camp,photo:user.photo||null,text,image:postPhoto,likes:[],comments:[],created:now()});
  save('posts',posts);
  document.getElementById('post-text-full').value='';clearPhoto();
  document.getElementById('composer-expand').classList.add('hidden');
  renderFeed();toast('Posted!');
}
function like(id){
  const p=posts.find(x=>x.id===id);if(!p)return;
  const i=p.likes.indexOf(user.id);
  if(i>=0)p.likes.splice(i,1);else p.likes.push(user.id);
  save('posts',posts);renderFeed();
}
function comment(id){
  const inp=document.getElementById('c-'+id);const t=inp.value.trim();if(!t)return;
  const p=posts.find(x=>x.id===id);if(!p)return;
  p.comments.push({author:user.name,text:t,created:now()});
  save('posts',posts);inp.value='';renderFeed();
}

function renderFeed(){
  const el=document.getElementById('feed');
  if(!posts.length){
    el.innerHTML='<div class="text-center text-fb-sec py-16"><div class="text-4xl mb-3 opacity-40"><i class="fa-solid fa-newspaper"></i></div><p class="text-sm font-medium">Your feed is quiet</p><p class="text-xs mt-1">Tap What\'s on your mind? to share something</p></div>';
    return;
  }
  el.innerHTML=posts.map(p=>{
    const liked=p.likes.includes(user.id);
    const av=p.photo
      ? `<img src="${p.photo}" class="w-10 h-10 rounded-full object-cover" alt="">`
      : `<div class="w-10 h-10 rounded-full bg-fb-blue flex items-center justify-center text-sm font-bold text-white">${ini(p.author)}</div>`;
    const likesTxt=p.likes.length?(p.likes.length===1?'1 like':p.likes.length+' likes'):'';
    const cmTxt=p.comments.length?(p.comments.length===1?'1 comment':p.comments.length+' comments'):'';
    const meta=[likesTxt,cmTxt].filter(Boolean).join(' · ');
    return `<article class="post-card">
      <div class="p-3 flex items-center gap-3">
        ${av}
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-sm truncate">${esc(p.author)}</div>
          <div class="text-[11px] text-fb-sec">${esc(p.camp||'')} ${p.camp?'· ':''}${ago(p.created)}</div>
        </div>
      </div>
      ${p.text?`<div class="px-4 pb-3 text-[15px] leading-relaxed whitespace-pre-wrap">${esc(p.text)}</div>`:''}
      ${p.image?`<div class="w-full bg-black/20"><img src="${p.image}" class="w-full max-h-[480px] object-contain" alt=""></div>`:''}
      ${meta?`<div class="px-4 py-2 text-xs text-fb-sec border-t border-fb-border">${meta}</div>`:''}
      <div class="px-2 py-1 flex border-t border-fb-border">
        <button type="button" onclick="like('${p.id}')" class="flex-1 py-2.5 text-sm rounded-lg hover:bg-fb-hover flex items-center justify-center gap-2 ${liked?'text-fb-blue font-semibold':'text-fb-sec'}">
          <i class="fa-${liked?'solid':'regular'} fa-thumbs-up"></i> Like
        </button>
        <button type="button" onclick="document.getElementById('cs-${p.id}').classList.toggle('hidden')" class="flex-1 py-2.5 text-sm text-fb-sec rounded-lg hover:bg-fb-hover flex items-center justify-center gap-2">
          <i class="fa-regular fa-comment"></i> Comment
        </button>
      </div>
      <div id="cs-${p.id}" class="hidden px-3 pb-3 border-t border-fb-border pt-2 space-y-2">
        ${p.comments.map(c=>`<div class="flex gap-2"><div class="w-7 h-7 rounded-full bg-fb-hover flex items-center justify-center text-[10px] font-bold text-fb-sec flex-shrink-0">${ini(c.author)}</div><div class="bg-fb-hover rounded-2xl px-3 py-1.5 text-xs flex-1"><b>${esc(c.author)}</b> ${esc(c.text)}</div></div>`).join('')}
        <div class="flex gap-2 items-center">
          <input id="c-${p.id}" class="flex-1 bg-fb-hover rounded-full px-3 py-2 text-xs focus:outline-none" placeholder="Write a comment..." onkeydown="if(event.key==='Enter')comment('${p.id}')">
          <button type="button" onclick="comment('${p.id}')" class="text-fb-blue text-xs font-semibold px-2">Post</button>
        </div>
      </div>
    </article>`;
  }).join('');
}

function renderOnline(){
  heartbeat();
  const list=getOnline();
  const el=document.getElementById('online-list');
  if(!list.length){
    el.innerHTML='<div class="bg-fb-card rounded-xl border border-fb-border p-8 text-center text-fb-sec text-sm">Nobody is online right now.<br><span class="text-xs">Create another account in a private window to see them here.</span></div>';
    return;
  }
  el.innerHTML=list.map(p=>{
    const isMe=user && p.id===user.id;
    const av=p.photo
      ? `<img src="${p.photo}" class="w-12 h-12 rounded-full object-cover" alt="">`
      : `<div class="w-12 h-12 rounded-full bg-fb-blue flex items-center justify-center font-bold text-white">${ini(p.name)}</div>`;
    return `<div class="bg-fb-card rounded-xl border border-fb-border p-3 flex items-center gap-3">
      <div class="relative">${av}<span class="online-dot"></span></div>
      <div class="flex-1 min-w-0">
        <div class="font-semibold text-sm truncate">${esc(p.name)}${isMe?' <span class="text-fb-sec font-normal">(you)</span>':''}</div>
        <div class="text-xs text-fb-green flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-fb-green inline-block"></span> Active now</div>
      </div>
      ${!isMe?`<button type="button" onclick="messagePerson('${esc(p.name)}')" class="text-xs font-semibold bg-fb-blue text-white px-3 py-2 rounded-lg">Message</button>`:''}
    </div>`;
  }).join('');
  updateOnlineBadge();
}
function messagePerson(name){
  go('chat');
  document.getElementById('newchat-name').value=name;
  createChat();
}

function openStoryUpload(){storyPhoto=null;document.getElementById('st-prev').classList.add('hidden');document.getElementById('st-file').value='';document.getElementById('st-cap').value='';document.getElementById('story-modal').classList.remove('hidden')}
function closeStoryModal(){document.getElementById('story-modal').classList.add('hidden')}
async function onStoryPhoto(e){const f=e.target.files[0];if(!f)return;storyPhoto=await compress(f,1080,0.72);if(storyPhoto){document.getElementById('st-prev-img').src=storyPhoto;document.getElementById('st-prev').classList.remove('hidden')}}
function shareStory(){
  if(!storyPhoto){toast('Choose a photo');return}
  stories.unshift({id:uid(),authorId:user.id,author:user.name,photo:storyPhoto,caption:document.getElementById('st-cap').value.trim(),created:now()});
  save('stories',stories);closeStoryModal();renderStories();toast('Story shared!');
}
function renderStories(){
  const row=document.getElementById('stories-row');
  const by={};stories.forEach(s=>{if(!by[s.authorId]||s.created>by[s.authorId].created)by[s.authorId]=s});
  row.innerHTML=Object.values(by).map(s=>`<div onclick="viewStory('${s.id}')" class="flex-shrink-0 w-24 h-40 rounded-xl relative cursor-pointer overflow-hidden"><img src="${s.photo}" class="w-full h-full object-cover" alt=""><div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div><span class="absolute bottom-2 left-2 right-2 text-[11px] font-medium text-white truncate">${s.authorId===user.id?'Your story':esc(s.author.split(' ')[0])}</span></div>`).join('');
}
function viewStory(id){
  const s=stories.find(x=>x.id===id);if(!s)return;
  document.getElementById('sv-img').src=s.photo;
  document.getElementById('sv-name').textContent=s.author;
  document.getElementById('sv-av').textContent=ini(s.author);
  document.getElementById('sv-time').textContent=ago(s.created);
  document.getElementById('sv-cap').textContent=s.caption||'';
  document.getElementById('story-view').classList.remove('hidden');
  storyPct=0;if(storyTimer)clearInterval(storyTimer);
  storyTimer=setInterval(()=>{storyPct+=1.5;document.getElementById('story-bar').style.width=storyPct+'%';if(storyPct>=100)closeStory()},100);
}
function closeStory(){document.getElementById('story-view').classList.add('hidden');if(storyTimer)clearInterval(storyTimer)}

function renderChats(){
  const el=document.getElementById('chats');
  if(!chats.length){el.innerHTML='<div class="p-6 text-center text-fb-sec text-sm">No chats yet.<br>Tap <b class="text-fb-blue">New Message</b> to start.</div>';return}
  el.innerHTML=chats.map(c=>{
    const last=c.messages[c.messages.length-1];
    return `<div onclick="openChat('${c.id}')" class="p-3 flex gap-3 hover:bg-fb-hover cursor-pointer">
      <div class="w-12 h-12 rounded-full bg-fb-blue flex items-center justify-center font-bold text-white text-sm">${ini(c.peerName)}</div>
      <div class="flex-1 min-w-0"><div class="font-semibold text-sm truncate">${esc(c.peerName)}</div>
      <div class="text-xs text-fb-sec truncate">${last?esc(last.text):'Start chatting'}</div></div>
    </div>`;
  }).join('');
}
function startChat(){document.getElementById('newchat-name').value='';document.getElementById('newchat-modal').classList.remove('hidden');document.getElementById('newchat-name').focus()}
function closeNewChat(){document.getElementById('newchat-modal').classList.add('hidden')}
function createChat(){
  const name=document.getElementById('newchat-name').value.trim();
  if(!name){toast('Enter a name');return}
  let c=chats.find(x=>x.peerName.toLowerCase()===name.toLowerCase());
  if(!c){c={id:uid(),peerName:name,messages:[],created:now()};chats.unshift(c);save('chats_'+user.id,chats)}
  closeNewChat();openChat(c.id);renderChats();
}
function openChat(id){
  activeChat=id;const c=chats.find(x=>x.id===id);if(!c)return;
  document.getElementById('chat-empty').classList.add('hidden');
  document.getElementById('chat-active').classList.remove('hidden');
  document.getElementById('chat-name').textContent=c.peerName;
  document.getElementById('chat-av').textContent=ini(c.peerName);
  const pane=document.getElementById('chat-pane');pane.classList.remove('hidden');pane.classList.add('flex');
  if(window.innerWidth<640)document.getElementById('chat-list').classList.add('hidden');
  renderMsgs();document.getElementById('chat-in').focus();
}
function closeChatMob(){document.getElementById('chat-list').classList.remove('hidden');document.getElementById('chat-pane').classList.add('hidden')}
function renderMsgs(){
  const c=chats.find(x=>x.id===activeChat);if(!c)return;
  const box=document.getElementById('chat-msgs');
  box.innerHTML=c.messages.map(m=>`<div class="flex ${m.from===user.id?'justify-end':''}"><div class="max-w-[75%] px-3 py-2 rounded-2xl text-sm ${m.from===user.id?'bg-fb-blue text-white':'bg-fb-card border border-fb-border'}">${esc(m.text)}</div></div>`).join('');
  box.scrollTop=box.scrollHeight;
}
function sendMsg(){
  const inp=document.getElementById('chat-in');const t=inp.value.trim();if(!t||!activeChat)return;
  const c=chats.find(x=>x.id===activeChat);if(!c)return;
  c.messages.push({id:uid(),from:user.id,text:t,created:now()});
  save('chats_'+user.id,chats);inp.value='';renderMsgs();renderChats();
}

function renderPeople(){
  const q=(document.getElementById('friend-search').value||'').toLowerCase();
  let people=load('people',[]).filter(p=>p.id!==user.id);
  if(q) people=people.filter(p=>p.name.toLowerCase().includes(q));
  const onlineIds=new Set(getOnline().map(p=>p.id));
  const el=document.getElementById('people-list');
  if(!people.length){
    el.innerHTML='<div class="text-fb-sec text-sm p-4 bg-fb-card rounded-xl border border-fb-border">No other people yet. Open DeerBook in a private/incognito window and create a second account to add friends and see who is online.</div>';
    return;
  }
  el.innerHTML=people.map(p=>{
    const isF=friends.includes(p.id);
    const isOn=onlineIds.has(p.id);
    const av=p.photo
      ? `<img src="${p.photo}" class="w-12 h-12 rounded-full object-cover" alt="">`
      : `<div class="w-12 h-12 rounded-full bg-fb-blue flex items-center justify-center font-bold text-white">${ini(p.name)}</div>`;
    return `<div class="bg-fb-card rounded-xl border border-fb-border p-3 flex items-center gap-3">
      <div class="relative">${av}${isOn?'<span class="online-dot"></span>':''}</div>
      <div class="flex-1 min-w-0">
        <div class="font-semibold text-sm truncate">${esc(p.name)}</div>
        <div class="text-xs ${isOn?'text-fb-green':'text-fb-sec'}">${isOn?'Active now':(p.camp||'DeerBook')}</div>
      </div>
      <button type="button" onclick="toggleFriend('${p.id}')" class="text-xs font-semibold px-3 py-2 rounded-lg ${isF?'bg-fb-hover':'bg-fb-blue text-white'}">${isF?'Friends':'Add Friend'}</button>
    </div>`;
  }).join('');
}
function toggleFriend(id){
  const i=friends.indexOf(id);
  if(i>=0)friends.splice(i,1);else friends.push(id);
  save('friends_'+user.id,friends);renderPeople();
}
function renderProfPosts(){
  const mine=posts.filter(p=>p.authorId===user.id);
  document.getElementById('prof-posts').innerHTML=mine.length
    ? mine.map(p=>`<div class="post-card p-3"><div class="text-sm whitespace-pre-wrap">${esc(p.text||'')}</div>${p.image?`<img src="${p.image}" class="mt-2 rounded-lg max-h-48 w-full object-cover" alt="">`:''}<div class="text-[11px] text-fb-sec mt-2">${ago(p.created)}</div></div>`).join('')
    : '<p class="text-fb-sec text-sm p-4">No posts yet</p>';
}

window.addEventListener('DOMContentLoaded',function(){
  try{
    let s=load('session',null);
    if(s&&s.email){
      const u=load('users',{})[s.email];
      if(u){s={id:u.id,name:u.name,camp:u.camp||'',email:u.email,bio:u.bio||'',photo:u.photo||null};save('session',s)}
      user=s;enter();
    } else {
      document.getElementById('auth').classList.remove('hidden');showLogin();
    }
  }catch(e){document.getElementById('auth').classList.remove('hidden');showLogin()}
});

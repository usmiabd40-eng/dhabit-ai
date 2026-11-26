const $=id=>document.getElementById(id);
const source=$("source"),shape=$("shape"),messages=$("messages");
const CHAT_KEY="dhabit-ai-chats-v2",THEME_KEY="dhabit-ai-theme";
let chats=[],activeId=null,thread=[],busy=false,mode="full";
function status(message=""){$("status").textContent=message}
function resize(){source.style.height="auto";source.style.height=Math.min(source.scrollHeight,260)+"px"}
function setTheme(value){document.body.dataset.theme=value;try{localStorage.setItem(THEME_KEY,value)}catch{};const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=value==="dark"?"#111a15":"#f5f7f4";$("themeToggle").title=value==="dark"?"الوضع الفاتح":"الوضع الداكن"}
function initTheme(){let value="light";try{value=localStorage.getItem(THEME_KEY)||"light"}catch{};if(value!=="dark"&&value!=="light")value="light";setTheme(value)}
function selectMode(value){mode=value;$("style")?.setAttribute("value",value);document.querySelectorAll(".mode-option").forEach(b=>b.classList.toggle("selected",b.dataset.mode===value))}
function persist(){if(!thread.length)return;const id=activeId||"c-"+Date.now();activeId=id;const first=thread.find(m=>m.role==="user");const item={id,title:(first?.text||"محادثة جديدة").slice(0,48),updated:Date.now(),messages:thread};const index=chats.findIndex(c=>c.id===id);if(index>=0)chats[index]=item;else chats.unshift(item);chats.sort((a,b)=>b.updated-a.updated);chats=chats.slice(0,30);try{localStorage.setItem(CHAT_KEY,JSON.stringify(chats))}catch{};renderHistory()}
function initHistory(){try{const value=JSON.parse(localStorage.getItem(CHAT_KEY)||"[]");chats=Array.isArray(value)?value:[]}catch{chats=[]}renderHistory()}
function renderHistory(){const list=$("historyList");list.innerHTML="";if(!chats.length){const p=document.createElement("p");p.className="history-empty";p.textContent="ستظهر محادثاتك هنا";list.append(p);return}chats.forEach(c=>{const b=document.createElement("button");b.className="history-item"+(c.id===activeId?" current":"");b.textContent=c.title;b.title=c.title;b.onclick=()=>loadChat(c.id);list.append(b)})}
function showThread(){ $("welcome").classList.add("hidden");$("conversation").classList.remove("hidden")}
function showWelcome(){ $("conversation").classList.add("hidden");$("welcome").classList.remove("hidden")}
function scrollEnd(){const el=$("conversation");el.scrollTop=el.scrollHeight}
function download(text,name){const blob=new Blob([text],{type:"text/plain;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function addMessage(role,text,actions=false,save=true){const article=document.createElement("article");article.className="message "+role;const avatar=document.createElement("div");avatar.className="avatar";avatar.textContent=role==="user"?"أ":"ض";const wrap=document.createElement("div");wrap.className="bubble-wrap";const label=document.createElement("div");label.className="message-name";label.textContent=role==="user"?"أنت":"ضَابِط AI";const bubble=document.createElement("div");bubble.className="bubble";bubble.textContent=text;wrap.append(label,bubble);
 if(actions){const tools=document.createElement("div");tools.className="answer-tools";const copy=document.createElement("button");copy.innerHTML='<svg class="icon" viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg> نسخ النتيجة';copy.onclick=async()=>{try{await navigator.clipboard.writeText(text);status("تم نسخ النص المشكول.")}catch{status("تعذّر النسخ. يمكنك تحديد النص ونسخه يدويًا.")}};const saveButton=document.createElement("button");saveButton.innerHTML='<svg class="icon" viewBox="0 0 24 24"><path d="M12 3v12m-5-5 5 5 5-5"/><path d="M5 17v3h14v-3"/></svg> تنزيل TXT';saveButton.onclick=()=>download(text,"dhabit-ai-text.txt");tools.append(copy,saveButton);wrap.append(tools)}
 article.append(avatar,wrap);messages.append(article);if(save){thread.push({role,text,actions});persist()}scrollEnd();return article}
function loadChat(id){if(busy)return;const chat=chats.find(c=>c.id===id);if(!chat)return;activeId=id;thread=chat.messages.slice();messages.innerHTML="";thread.forEach(m=>addMessage(m.role,m.text,m.actions,false));showThread();renderHistory();closeSidebar();scrollEnd()}
function closeSidebar(){$("sidebar").classList.remove("open");$("scrim").classList.remove("visible")}
function newChat(){if(busy)return;activeId=null;thread=[];messages.innerHTML="";source.value="";resize();$("count").textContent="0 / 12,000";status("");showWelcome();renderHistory();closeSidebar();source.focus()}
function clearEditor(){source.value="";resize();$("count").textContent="0 / 12,000";source.focus()}
source.addEventListener("input",()=>{$("count").textContent=source.value.length.toLocaleString("en")+" / 12,000";resize()});
source.addEventListener("keydown",event=>{if(event.key==="Enter"&&!event.shiftKey){event.preventDefault();processText()}});
$("shape").addEventListener("click",processText);
$("clearInput").addEventListener("click",clearEditor);
document.querySelectorAll(".mode-option").forEach(b=>b.addEventListener("click",()=>selectMode(b.dataset.mode)));
document.querySelectorAll(".example-chip").forEach(b=>b.addEventListener("click",()=>{source.value=b.dataset.prompt;selectMode(b.dataset.mode||"full");resize();source.focus()}));
async function processText(){const text=source.value.trim();if(!text){status("أدخل النص العربي أولًا.");source.focus();return}if(busy)return;busy=true;showThread();addMessage("user",text);clearEditor();shape.disabled=true;shape.innerHTML='<span>جارٍ التشكيل</span><span>…</span>';status("تحليل السياق والبنية اللغوية…");const pending=document.createElement("article");pending.className="message assistant";pending.innerHTML='<div class="avatar">ض</div><div class="bubble-wrap"><div class="message-name">ضَابِط AI</div><div class="typing">يجري ضبط النص العربي…</div></div>';messages.append(pending);scrollEnd();
 try{const response=await fetch("/api/diacritize",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text,mode,preserveExisting:$("keep").checked})});const data=await response.json().catch(()=>({error:"تعذّرت قراءة استجابة الخادم."}));if(!response.ok)throw new Error(data.error||"تعذّرت معالجة النص.");if(typeof data.text!=="string"||!data.text.trim())throw new Error("لم تصل نتيجة التشكيل.");pending.remove();addMessage("assistant",data.text,true);status(data.note||"اكتمل التشكيل. يُرجى مراجعة المواضع الملتبسة.");}
 catch(error){pending.remove();addMessage("assistant","لم نتمكن من معالجة النص. "+error.message);status("تعذّرت المعالجة. تحقق من الاتصال وإعدادات الخدمة.");}
 finally{busy=false;shape.disabled=false;shape.innerHTML='<span>تشكيل النص</span><svg class="icon" viewBox="0 0 24 24"><path d="M7 17 17 7M7 7h10v10"/></svg>';source.focus()}}
$("newChat").onclick=newChat;$("clearChat").onclick=newChat;$("assistantNav").onclick=newChat;
$("themeToggle").onclick=()=>setTheme(document.body.dataset.theme==="dark"?"light":"dark");
$("menuToggle").onclick=()=>{$("sidebar").classList.toggle("open");$("scrim").classList.toggle("visible")};$("scrim").onclick=closeSidebar;
$("aboutToggle").onclick=()=>{$("aboutModal").classList.remove("hidden");closeSidebar()};$("closeAbout").onclick=()=>$("aboutModal").classList.add("hidden");$("aboutModal").addEventListener("click",e=>{if(e.target===$("aboutModal"))$("aboutModal").classList.add("hidden")});
initTheme();initHistory();selectMode("full");
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));

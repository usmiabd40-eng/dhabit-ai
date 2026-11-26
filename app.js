const $=id=>document.getElementById(id);
const source=$("source"),shape=$("shape"),messages=$("messages");
let currentMessages=[],savedChats=[],activeChatId=null,isSending=false;
const STORE_KEY="dhabit-ai-chats-v1",THEME_KEY="dhabit-ai-theme";
function resizeInput(){source.style.height="auto";source.style.height=Math.min(source.scrollHeight,190)+"px"}
function setStatus(text){$("status").textContent=text||""}
function showConversation(){$("welcome").classList.add("hidden");$("conversation").classList.remove("hidden")}
function showWelcome(){$("conversation").classList.add("hidden");$("welcome").classList.remove("hidden")}
function scrollBottom(){const c=$("conversation");c.scrollTop=c.scrollHeight}
function escapeText(text){return String(text).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function persistChats(){try{localStorage.setItem(STORE_KEY,JSON.stringify(savedChats.slice(0,30)))}catch{}}
function persistCurrent(){if(!currentMessages.length)return;const id=activeChatId||("chat-"+Date.now());activeChatId=id;const old=savedChats.findIndex(x=>x.id===id);const item={id,title:(currentMessages.find(x=>x.role==="user")?.text||"محادثة جديدة").slice(0,55),updated:Date.now(),messages:currentMessages};if(old>=0)savedChats[old]=item;else savedChats.unshift(item);savedChats.sort((a,b)=>b.updated-a.updated);persistChats();renderHistory()}
function renderHistory(){const list=$("historyList");list.innerHTML="";if(!savedChats.length){const empty=document.createElement("div");empty.className="history-empty";empty.textContent="ستظهر محادثاتك هنا";list.append(empty);return}savedChats.slice(0,20).forEach(chat=>{const b=document.createElement("button");b.className="history-item";b.textContent=chat.title;b.title=chat.title;b.onclick=()=>loadChat(chat.id);list.append(b)})}
function loadChat(id){const chat=savedChats.find(x=>x.id===id);if(!chat)return;activeChatId=id;currentMessages=chat.messages.slice();messages.innerHTML="";currentMessages.forEach(m=>renderMessage(m.role,m.text,m.tools,false));showConversation();scrollBottom();$("sidebar").classList.remove("open")}
function renderMessage(type,text,tools=false,track=true){
 const row=document.createElement("article");row.className="message "+type;
 const avatar=document.createElement("div");avatar.className="avatar";avatar.textContent=type==="user"?"أ":"ض";
 const wrap=document.createElement("div");wrap.className="bubble-wrap";
 const name=document.createElement("div");name.className="message-name";name.textContent=type==="user"?"رسالتك":"ضَابِط AI";
 const bubble=document.createElement("div");bubble.className="bubble";bubble.textContent=text;wrap.append(name,bubble);
 if(tools){const actions=document.createElement("div");actions.className="answer-tools";
  const copy=document.createElement("button");copy.innerHTML='<svg class="ui-icon" viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg> نسخ';
  copy.onclick=async()=>{try{await navigator.clipboard.writeText(text);setStatus("تم نسخ النص المشكول.")}catch{setStatus("تعذّر النسخ تلقائيًا.")}};
  const download=document.createElement("button");download.innerHTML='<svg class="ui-icon" viewBox="0 0 24 24"><path d="M12 3v12m-5-5 5 5 5-5"/><path d="M5 17v3h14v-3"/></svg> تحميل';
  download.onclick=()=>downloadText(text,"dhabit-ai-text.txt");actions.append(copy,download);wrap.append(actions)}
 row.append(avatar,wrap);messages.append(row);if(track){currentMessages.push({role:type,text,tools});persistCurrent()}scrollBottom();return row
}
function downloadText(text,name){const a=document.createElement("a"),u=URL.createObjectURL(new Blob([text],{type:"text/plain;charset=utf-8"}));a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1200)}
function exportChat(){if(!currentMessages.length){setStatus("لا توجد محادثة لتصديرها.");return}const text=currentMessages.map(m=>(m.role==="user"?"أنت:":"ضَابِط AI:")+"\n"+m.text).join("\n\n————————————\n\n");downloadText(text,"dhabit-ai-conversation.txt");setStatus("تم تجهيز ملف المحادثة.")}
function newChat(){if(isSending)return;messages.innerHTML="";currentMessages=[];activeChatId=null;source.value="";resizeInput();$("count").textContent="0 / 12,000";setStatus("");showWelcome();$("sidebar").classList.remove("open")}
function setTheme(theme){document.body.dataset.theme=theme;try{localStorage.setItem(THEME_KEY,theme)}catch{};const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=theme==="dark"?"#101a15":"#0b2119";$("themeToggle").title=theme==="dark"?"التبديل إلى الوضع الفاتح":"التبديل إلى الوضع الداكن"}
function initTheme(){let t;try{t=localStorage.getItem(THEME_KEY)}catch{};if(!t)t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";setTheme(t)}
function initChats(){try{savedChats=JSON.parse(localStorage.getItem(STORE_KEY)||"[]");if(!Array.isArray(savedChats))savedChats=[]}catch{savedChats=[]}renderHistory()}
$("newChat").onclick=newChat;$("clearChat").onclick=newChat;$("exportChat").onclick=exportChat;
$("themeToggle").onclick=()=>setTheme(document.body.dataset.theme==="dark"?"light":"dark");
source.addEventListener("input",()=>{$("count").textContent=source.value.length.toLocaleString("en")+" / 12,000";resizeInput()});
source.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}});
$("shape").addEventListener("click",send);
document.querySelectorAll("[data-prompt]").forEach((b,i)=>b.addEventListener("click",()=>{source.value=b.dataset.prompt;if(i===1)$("style").value="ending";resizeInput();source.focus()}));
async function send(){
 const text=source.value.trim();if(!text){setStatus("اكتب النص العربي أولًا.");source.focus();return}if(isSending)return;
 isSending=true;showConversation();renderMessage("user",text);source.value="";resizeInput();$("count").textContent="0 / 12,000";shape.disabled=true;shape.innerHTML='<span>جارٍ العمل</span><b>…</b>';setStatus("يجري تحليل النص وسياقه…");
 const typing=document.createElement("div");typing.className="message assistant";typing.innerHTML='<div class="avatar">ض</div><div class="bubble-wrap"><div class="message-name">ضَابِط AI</div><div class="typing">يفكّر في التشكيل المناسب…</div></div>';messages.append(typing);scrollBottom();
 try{
  const r=await fetch("/api/diacritize",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text,mode:$("style").value,preserveExisting:$("keep").checked})});
  const data=await r.json().catch(()=>({error:"تعذّر قراءة استجابة الخادم"}));if(!r.ok)throw new Error(data.error||"تعذّرت معالجة النص");if(!data.text)throw new Error("لم تصل نتيجة التشكيل");
  typing.remove();renderMessage("assistant",data.text,true);setStatus(data.note||"اكتمل التشكيل. راجع الكلمات التي تحتمل أكثر من وجه إعرابي.");
 }catch(e){typing.remove();renderMessage("assistant","عذرًا، لم أتمكن من تشكيل النص. "+e.message+"\n\nتأكد من إعداد مفتاح خدمة الذكاء الاصطناعي في Cloudflare ثم حاول مرة أخرى.");setStatus("تعذّرت المعالجة.")}
 finally{isSending=false;shape.disabled=false;shape.innerHTML='<span>إرسال</span><b>↑</b>';source.focus()}
}
$("menuToggle").onclick=()=>$("sidebar").classList.toggle("open");
$("aboutToggle").onclick=()=>{$("aboutModal").classList.remove("hidden");$("sidebar").classList.remove("open")};
$("closeAbout").onclick=()=>$("aboutModal").classList.add("hidden");
$("aboutModal").addEventListener("click",e=>{if(e.target===$("aboutModal"))$("aboutModal").classList.add("hidden")});
initTheme();initChats();
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));

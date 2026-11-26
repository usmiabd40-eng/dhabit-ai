const $=id=>document.getElementById(id);
const source=$("source"),shape=$("shape"),messages=$("messages");
let shaped="",conversationCount=0;
function resizeInput(){source.style.height="auto";source.style.height=Math.min(source.scrollHeight,190)+"px"}
function setStatus(text){$("status").textContent=text||""}
function showConversation(){ $("welcome").classList.add("hidden");$("conversation").classList.remove("hidden")}
function showWelcome(){ $("conversation").classList.add("hidden");$("welcome").classList.remove("hidden")}
function scrollBottom(){const c=$("conversation");c.scrollTop=c.scrollHeight}
function addMessage(type,text,tools=false){
 const row=document.createElement("article");row.className="message "+type;
 const avatar=document.createElement("div");avatar.className="avatar";avatar.textContent=type==="user"?"أنت":"ض";
 const wrap=document.createElement("div");wrap.className="bubble-wrap";
 const name=document.createElement("div");name.className="message-name";name.textContent=type==="user"?"رسالتك":"ضَابِط AI";
 const bubble=document.createElement("div");bubble.className="bubble";bubble.textContent=text;
 wrap.append(name,bubble);
 if(tools){
  const actions=document.createElement("div");actions.className="answer-tools";
  const copy=document.createElement("button");copy.textContent="نسخ النص";copy.onclick=async()=>{try{await navigator.clipboard.writeText(text);setStatus("تم نسخ النص المشكول.")}catch{setStatus("تعذّر النسخ تلقائيًا.")}};
  const download=document.createElement("button");download.textContent="تحميل TXT";download.onclick=()=>{const a=document.createElement("a"),u=URL.createObjectURL(new Blob([text],{type:"text/plain;charset=utf-8"}));a.href=u;a.download="dhabit-ai-text.txt";a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
  actions.append(copy,download);wrap.append(actions);
 }
 row.append(avatar,wrap);messages.append(row);scrollBottom();return row;
}
function addHistory(label){const list=$("historyList");if(conversationCount===0)list.innerHTML="";const b=document.createElement("button");b.className="history-item";b.textContent=label.slice(0,42);b.title=label;b.onclick=()=>{showConversation();};list.prepend(b);conversationCount++}
function newChat(){messages.innerHTML="";shaped="";source.value="";resizeInput();$("count").textContent="0 / 12,000";setStatus("");showWelcome();$("sidebar").classList.remove("open")}
$("newChat").onclick=newChat;$("clearChat").onclick=newChat;
source.addEventListener("input",()=>{$("count").textContent=source.value.length.toLocaleString("en")+" / 12,000";resizeInput()});
source.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}});
$("shape").addEventListener("click",send);
document.querySelectorAll("[data-prompt]").forEach((b,i)=>b.addEventListener("click",()=>{source.value=b.dataset.prompt;if(i===1)$("style").value="ending";resizeInput();source.focus()}));
async function send(){
 const text=source.value.trim();if(!text){setStatus("اكتب النص العربي أولًا.");source.focus();return}
 showConversation();addHistory(text);addMessage("user",text);source.value="";resizeInput();$("count").textContent="0 / 12,000";shape.disabled=true;shape.innerHTML="<span>جارٍ العمل</span><b>…</b>";setStatus("يجري تحليل النص وسياقه…");
 const typing=document.createElement("div");typing.className="message assistant";typing.innerHTML='<div class="avatar">ض</div><div class="bubble-wrap"><div class="message-name">ضَابِط AI</div><div class="typing">يفكّر في التشكيل المناسب…</div></div>';messages.append(typing);scrollBottom();
 try{
  const r=await fetch("/api/diacritize",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text,mode:$("style").value,preserveExisting:$("keep").checked})});
  const data=await r.json().catch(()=>({error:"تعذّر قراءة استجابة الخادم"}));
  if(!r.ok)throw new Error(data.error||"تعذّرت معالجة النص");
  if(!data.text)throw new Error("لم تصل نتيجة التشكيل");
  shaped=data.text;typing.remove();addMessage("assistant",shaped,true);setStatus(data.note||"اكتمل التشكيل. راجع الكلمات التي تحتمل أكثر من وجه إعرابي.");
 }catch(e){typing.remove();addMessage("assistant","عذرًا، لم أتمكن من تشكيل النص. "+e.message+"\n\nتأكد من إعداد مفتاح خدمة الذكاء الاصطناعي في Cloudflare ثم حاول مرة أخرى.");setStatus("تعذّرت المعالجة.")}
 finally{shape.disabled=false;shape.innerHTML="<span>إرسال</span><b>↑</b>";source.focus()}
}
$("menuToggle").onclick=()=>$("sidebar").classList.toggle("open");
$("aboutToggle").onclick=()=>{$("aboutModal").classList.remove("hidden");$("sidebar").classList.remove("open")};
$("closeAbout").onclick=()=>$("aboutModal").classList.add("hidden");
$("aboutModal").addEventListener("click",e=>{if(e.target===$("aboutModal"))$("aboutModal").classList.add("hidden")});
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));

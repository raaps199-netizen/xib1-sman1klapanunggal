(function(){
function getSession(){try{return JSON.parse(sessionStorage.getItem('bionestSession')||localStorage.getItem('bionestSession')||'null')}catch{return null}}
function show(){
 const modal=document.getElementById('studentModal'),actions=document.getElementById('modalQrActions');
 if(!modal||!actions)return;
 const p=getSession(),selected=document.getElementById('modalName')?.textContent?.trim();
 const own=p&&selected&&p.full_name===selected,admin=p?.role==='super_admin';
 actions.classList.toggle('hidden',!own&&!admin);
 actions.classList.toggle('inline-flex',own||admin);
 actions.innerHTML='<i data-lucide="qr-code" class="w-4 h-4"></i><span>'+(admin?'QR Siswa':'QR Saya')+'</span>';
 actions.onclick=()=>{location.href=(admin?'qr.html?name=':'qr.html?username=')+encodeURIComponent(admin?selected:p.username);};
 if(window.lucide)lucide.createIcons();
}
const modal=document.getElementById('studentModal');
if(modal)new MutationObserver(show).observe(modal,{attributes:true,attributeFilter:['class']});
window.addEventListener('DOMContentLoaded',show);
})();
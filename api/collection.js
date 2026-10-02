import { put, list, del } from '@vercel/blob';

const PREFIX='collection-daily/';
const REPORT_PREFIX='collection-reports/';
const KEY=process.env.COLLECTION_BOT_KEY||process.env.LIBRARY_BOT_KEY||'';
const STUDENTS_URL='https://raw.githubusercontent.com/raaps199-netizen/xib1-sman1klapanunggal/main/data/students-public.json';

function json(res,status,data){return res.status(status).json(data);}
function today(){
  return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
}
function isAdmin(body){
  return String(body?.role||'')==='super_admin' && !!body?.username && !!body?.password_sha256;
}
async function verifyAdmin(body){
  if(!isAdmin(body))return false;
  const r=await fetch('https://raw.githubusercontent.com/raaps199-netizen/xib1-sman1klapanunggal/main/data/accounts.json');
  if(!r.ok)return false;
  const d=await r.json();
  const a=(d.members||[]).find(x=>x.username===String(body.username).toLowerCase());
  return !!a && a.role==='super_admin' && a.password_sha256===body.password_sha256;
}
async function getBlob(day){
  const {blobs}=await list({prefix:PREFIX});
  return blobs.find(b=>b.pathname===PREFIX+day+'.json')||null;
}
async function createBlank(day){
  const r=await fetch(STUDENTS_URL);
  if(!r.ok)throw new Error('Data siswa tidak dapat dimuat.');
  const d=await r.json();
  const students=(d.items||[]).sort((a,b)=>String(a.full_name||'').localeCompare(String(b.full_name||''),'id',{sensitivity:'base'})).map((x,i)=>({
    absen:i+1,id:x.id,username:x.username,full_name:x.full_name,status:'BELUM DIVERIFIKASI',note:''
  }));
  const data={date:day,class:'XI.B1',status:'BELUM DIMULAI',operator:'',started_at:null,finished_at:null,students};
  await put(PREFIX+day+'.json',JSON.stringify(data),{access:'public',addRandomSuffix:false,contentType:'application/json',token:process.env.BLOB_READ_WRITE_TOKEN});
  return data;
}
async function loadDay(day){
  const blob=await getBlob(day);
  if(!blob)return createBlank(day);
  const r=await fetch(blob.url);
  if(!r.ok)throw new Error('Data pengumpulan gagal dibaca.');
  return r.json();
}
async function saveDay(day,data){
  const old=await getBlob(day);
  if(old)await del(old.url);
  await put(PREFIX+day+'.json',JSON.stringify(data),{access:'public',addRandomSuffix:false,contentType:'application/json',token:process.env.BLOB_READ_WRITE_TOKEN});
  return data;
}
async function cleanupOld(day){
  const {blobs}=await list({prefix:PREFIX});
  await Promise.all(blobs.filter(b=>b.pathname!==PREFIX+day+'.json').map(b=>del(b.url)));
}
export default async function handler(req,res){
  try{
    const day=today();
    await cleanupOld(day);

    if(req.method==='GET'){
      const data=await loadDay(day);
      return json(res,200,{...data,server_date:day});
    }

    if(req.method==='POST'){
      const body=typeof req.body==='string'?JSON.parse(req.body):(req.body||{});
      if(!await verifyAdmin(body))return json(res,403,{error:'Akses hanya untuk Super Admin.'});
      let data=await loadDay(day);

      if(body.action==='save'){
        if(Array.isArray(body.students))data.students=body.students.map((s,i)=>({
          absen:Number(s.absen)||i+1,
          id:s.id||'',
          username:String(s.username||''),
          full_name:String(s.full_name||'').slice(0,120),
          status:String(s.status||'BELUM DIVERIFIKASI').slice(0,40),
          note:String(s.note||'').slice(0,300)
        }));
        data.status=body.status||data.status;
        data.operator=String(body.operator||data.operator||'').slice(0,100);
        if(data.status==='BERLANGSUNG'&&!data.started_at)data.started_at=new Date().toISOString();
        if(data.status==='SELESAI'&&!data.finished_at)data.finished_at=new Date().toISOString();
        await saveDay(day,data);
        return json(res,200,{ok:true,data});
      }

      if(body.action==='start'){
        data.status='BERLANGSUNG';
        data.operator=String(body.operator||'').slice(0,100);
        data.started_at=data.started_at||new Date().toISOString();
        await saveDay(day,data);
        return json(res,200,{ok:true,data});
      }

      if(body.action==='finish'){
        data.status='SELESAI';
        data.operator=String(body.operator||data.operator||'').slice(0,100);
        data.finished_at=new Date().toISOString();
        await saveDay(day,data);
        return json(res,200,{ok:true,data});
      }

      return json(res,400,{error:'Action tidak dikenal.'});
    }

    return json(res,405,{error:'Method tidak diizinkan.'});
  }catch(error){
    console.error('Collection API:',error);
    return json(res,500,{error:error.message||'Gagal memproses data pengumpulan.'});
  }
}
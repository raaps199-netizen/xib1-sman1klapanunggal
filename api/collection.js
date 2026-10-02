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
  const blob=await put(PREFIX+day+'.json',JSON.stringify(data),{access:'public',addRandomSuffix:false,contentType:'application/json',token:process.env.BLOB_READ_WRITE_TOKEN});
  return {data,blob};
}
async function loadDay(day){
  const blob=await getBlob(day);
  if(!blob)return createBlank(day);
  const r=await fetch(blob.url);
  if(!r.ok)throw new Error('Data pengumpulan gagal dibaca.');
  return {data:await r.json(),blob};
}
async function saveDay(day,data,oldBlob){
  // Reuse the blob discovered by loadDay instead of listing the store a second time.
  if(oldBlob)await del(oldBlob.url);
  await put(PREFIX+day+'.json',JSON.stringify(data),{access:'public',addRandomSuffix:false,contentType:'application/json',token:process.env.BLOB_READ_WRITE_TOKEN});
  return data;
}
export default async function handler(req,res){
  try{
    const day=today();

    if(req.method==='GET'){
      if(KEY && String(req.headers['x-collection-bot-key']||'')===KEY){
        const {blobs}=await list({prefix:REPORT_PREFIX});
        const items=[];
        for(const blob of blobs){try{const rr=await fetch(blob.url);items.push(await rr.json());}catch(e){}}
        items.sort((a,b)=>String(a.created_at).localeCompare(String(b.created_at)));
        return json(res,200,{items});
      }
      // Let Vercel's CDN absorb frequent dashboard polling across visitors.
      res.setHeader('Cache-Control','public, s-maxage=10, stale-while-revalidate=20');
      const {data}=await loadDay(day);
      return json(res,200,{...data,server_date:day});
    }

    if(req.method==='POST'){
      const body=typeof req.body==='string'?JSON.parse(req.body):(req.body||{});
      if(body.action==='ack'){
        if(!KEY || body.bot_key!==KEY)return json(res,401,{error:'Unauthorized.'});
        const id=String(body.id||'').trim();if(!id)return json(res,400,{error:'ID laporan wajib diisi.'});
        const {blobs}=await list({prefix:REPORT_PREFIX});const found=blobs.find(b=>b.pathname===REPORT_PREFIX+id+'.json');
        if(found)await del(found.url);return json(res,200,{ok:true});
      }
      if(!await verifyAdmin(body))return json(res,403,{error:'Akses hanya untuk Super Admin.'});
      if(body.action==='report'){
        const students=Array.isArray(body.students)?body.students:[];
        if(body.class!=='XI.B1'||!students.length)return json(res,400,{error:'Laporan tidak valid.'});
        const id='report-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
        const report={id,class:'XI.B1',date:String(body.date||''),time:String(body.time||''),operator:String(body.operator||'Operator').slice(0,100),students:students.map((s,i)=>({absen:Number(s.absen)||i+1,full_name:String(s.full_name||'').slice(0,120),username:String(s.username||'').slice(0,80),status:String(s.status||'BELUM DIVERIFIKASI').slice(0,40),note:String(s.note||'').slice(0,300)})),created_at:new Date().toISOString()};
        await put(REPORT_PREFIX+id+'.json',JSON.stringify(report),{access:'public',addRandomSuffix:false,contentType:'application/json',token:process.env.BLOB_READ_WRITE_TOKEN});
        return json(res,201,{ok:true,id});
      }

      let {data,blob}=await loadDay(day);

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
        await saveDay(day,data,blob);
        return json(res,200,{ok:true,data});
      }

      if(body.action==='start'){
        data.status='BERLANGSUNG';
        data.operator=String(body.operator||'').slice(0,100);
        data.started_at=data.started_at||new Date().toISOString();
        await saveDay(day,data,blob);
        return json(res,200,{ok:true,data});
      }

      if(body.action==='finish'){
        data.status='SELESAI';
        data.operator=String(body.operator||data.operator||'').slice(0,100);
        data.finished_at=new Date().toISOString();
        await saveDay(day,data,blob);
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
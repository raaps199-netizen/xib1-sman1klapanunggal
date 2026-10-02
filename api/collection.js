import { put, list, del } from '@vercel/blob';

const PREFIX = 'collection-reports/';
const KEY = process.env.COLLECTION_BOT_KEY || process.env.LIBRARY_BOT_KEY || '';

function json(res,status,data){return res.status(status).json(data);}

export default async function handler(req,res){
  try{
    if(req.method==='POST'){
      const body=typeof req.body==='string'?JSON.parse(req.body):(req.body||{});

      if(body.action==='ack'){
        if(!KEY || body.bot_key!==KEY) return json(res,401,{error:'Unauthorized.'});
        const id=String(body.id||'').trim();
        if(!id) return json(res,400,{error:'ID laporan wajib diisi.'});
        const {blobs}=await list({prefix:PREFIX});
        const found=blobs.find(b=>b.pathname===PREFIX+id+'.json');
        if(found) await del(found.url);
        return json(res,200,{ok:true});
      }

      const students=Array.isArray(body.students)?body.students:[];
      if(body.class!=='XI.B1'||!students.length) return json(res,400,{error:'Laporan tidak valid.'});
      if(students.length>100) return json(res,400,{error:'Jumlah siswa tidak valid.'});

      const safeStudents=students.map((s,i)=>({
        absen:Number(s.absen)||i+1,
        full_name:String(s.full_name||'').slice(0,120),
        username:String(s.username||'').slice(0,80),
        status:String(s.status||'BELUM DIVERIFIKASI').slice(0,40),
        note:String(s.note||'').slice(0,300)
      }));

      const id='report-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
      const report={
        id,
        class:'XI.B1',
        date:String(body.date||''),
        time:String(body.time||''),
        operator:String(body.operator||'Operator').slice(0,100),
        students:safeStudents,
        created_at:new Date().toISOString()
      };

      await put(PREFIX+id+'.json',JSON.stringify(report),{
        access:'public',
        addRandomSuffix:false,
        contentType:'application/json',
        token:process.env.BLOB_READ_WRITE_TOKEN
      });

      return json(res,201,{ok:true,id});
    }

    if(req.method==='GET'){
      if(!KEY || String(req.headers['x-collection-bot-key']||'')!==KEY) return json(res,401,{error:'Unauthorized.'});
      const {blobs}=await list({prefix:PREFIX});
      const items=[];
      for(const blob of blobs){
        try{
          const r=await fetch(blob.url);
          const report=await r.json();
          items.push(report);
        }catch(e){ console.error('Gagal membaca laporan:',e.message||e); }
      }
      items.sort((a,b)=>String(a.created_at).localeCompare(String(b.created_at)));
      return json(res,200,{items});
    }

    return json(res,405,{error:'Method tidak diizinkan.'});
  }catch(error){
    console.error('Collection API:',error);
    return json(res,500,{error:error.message||'Gagal memproses laporan.'});
  }
}
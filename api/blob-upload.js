import { handleUpload } from '@vercel/blob/client';

const ROOT='https://api.github.com/repos/raaps199-netizen/xib1-sman1klapanunggal/contents/';
const headers=()=>{const h={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'Bionest-One-Library'};if(process.env.GITHUB_TOKEN)h.Authorization='Bearer '+process.env.GITHUB_TOKEN;return h;};

async function accountFromPayload(clientPayload){
  const payload=JSON.parse(clientPayload||'{}');
  const username=String(payload.username||'').trim().toLowerCase();
  const passwordHash=String(payload.password_sha256||'');
  if(!username||!passwordHash) throw new Error('Sesi login tidak valid.');
  const r=await fetch(ROOT+'data/accounts.json',{headers:headers()});
  if(!r.ok) throw new Error('Akun tidak dapat diverifikasi.');
  const file=await r.json();
  const accounts=JSON.parse(Buffer.from(file.content.replace(/\n/g,''),'base64').toString('utf8'));
  const account=(accounts.members||[]).find(x=>x.username===username&&x.password_sha256===passwordHash);
  if(!account) throw new Error('Sesi login tidak valid.');
  return account;
}

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method tidak diizinkan.'});
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body):(req.body||{});
    if(!body || !body.type || !body.payload) throw new Error('Payload upload Blob tidak valid.');
    const uploadOptions={
      body,
      request:req,
      onBeforeGenerateToken:async(pathname,clientPayload)=>{
        const account=await accountFromPayload(clientPayload);
        const safe=String(pathname||'library-file').replace(/[^a-zA-Z0-9._-]/g,'-');
        return {
          allowedContentTypes:[
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ],
          addRandomSuffix:true,
          maximumSizeInBytes:10*1024*1024,
          tokenPayload:JSON.stringify({username:account.username})
        };
      },
      onUploadCompleted:async({blob})=>{
        console.log('Library Blob upload completed:',blob.url);
      }
    };
    if(process.env.BLOB_READ_WRITE_TOKEN) uploadOptions.token=process.env.BLOB_READ_WRITE_TOKEN;
    const jsonResponse=await handleUpload(uploadOptions);
    return res.status(200).json(jsonResponse);
  }catch(error){
    console.error('Library Blob token error:',error);return res.status(400).json({error:error.message||'Gagal menyiapkan upload.'});
  }
}

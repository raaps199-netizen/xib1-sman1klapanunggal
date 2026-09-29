import { issueSignedToken, presignUrl } from '@vercel/blob';

const ROOT='https://api.github.com/repos/raaps199-netizen/xib1-sman1klapanunggal/contents/';

async function accountFromPayload(clientPayload){
  const payload=JSON.parse(clientPayload||'{}');
  const username=String(payload.username||'').trim().toLowerCase();
  const passwordHash=String(payload.password_sha256||'');
  if(!username||!passwordHash) throw new Error('Sesi login tidak valid.');
  const r=await fetch(ROOT+'data/accounts.json',{headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'Bionest-One-Library'}});
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
    const payload=body.payload||body;
    const pathname=String(payload.pathname||'').trim();
    const clientPayload=String(payload.clientPayload||'');
    const contentType=String(payload.contentType||'application/octet-stream');
    const size=Number(payload.size||0);

    if(!pathname) throw new Error('Nama file tidak valid.');
    if(size<1||size>10*1024*1024) throw new Error('Ukuran file maksimal 10 MB.');
    const allowed=[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if(!allowed.includes(contentType)) throw new Error('Format file tidak didukung.');

    const account=await accountFromPayload(clientPayload);
    const safePath='library/'+pathname.replace(/^library\//,'').replace(/[^a-zA-Z0-9._/-]/g,'-');

    const token=await issueSignedToken({
      pathname:safePath,
      operations:['put'],
      validUntil:Date.now()+15*60*1000,
      allowedContentTypes:allowed,
      maximumSizeInBytes:10*1024*1024
    });

    const {presignedUrl}=await presignUrl(token,{
      pathname:safePath,
      operation:'put',
      access:'public',
      validUntil:Date.now()+15*60*1000
    });

    return res.status(200).json({pathname:safePath,presignedUrl,username:account.username});
  }catch(error){
    console.error('Library Blob presign error:',error);
    return res.status(400).json({error:error.message||'Gagal membuat URL upload.'});
  }
}

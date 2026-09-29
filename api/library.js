import { del } from '@vercel/blob';
export default async function handler(req, res) {
    if (!['GET','POST'].includes(req.method)) return res.status(405).json({ error: 'Method tidak diizinkan.' });
    const token = process.env.GITHUB_TOKEN;
    const ROOT = 'https://api.github.com/repos/raaps199-netizen/xib1-sman1klapanunggal/contents/';
    const headers = { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'Bionest-One-Library' };
    const jsonPath = 'data/library.json';
    const publicJsonPath = 'data/library-public.json';
    async function readPublicLibrary() {
        const r = await fetch('https://raw.githubusercontent.com/raaps199-netizen/xib1-sman1klapanunggal/main/data/library-public.json', { headers: { 'Cache-Control': 'max-age=60' } });
        if (!r.ok) throw new Error('Database Library publik tidak dapat dibaca.');
        const data = await r.json();
        return data.items || [];
    }
    async function writePublicLibrary(items, message) {
        const file = await githubFile(publicJsonPath);
        const publicItems = items.filter(item => item.status === 'published');
        const content = Buffer.from(JSON.stringify({ updated_at: new Date().toISOString(), items: publicItems }, null, 2) + '\\n').toString('base64');
        const body = { message, content, branch: 'main' };
        if (file) body.sha = file.sha;
        const r = await fetch(ROOT + publicJsonPath, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.message || 'Gagal memperbarui index publik Library.'); }
    }
    async function githubFile(path) { const r = await fetch(ROOT + path, { headers }); if (r.status === 404) return null; if (!r.ok) throw new Error('Database Library GitHub tidak dapat dibaca.'); return r.json(); }
    async function readLibrary() { const file = await githubFile(jsonPath); if (!file) return { items: [], sha: null }; const raw = Buffer.from(file.content.replace(/\n/g, ''), 'base64').toString('utf8'); return { items: JSON.parse(raw).items || [], sha: file.sha }; }
    async function writeLibrary(items, sha, message) { const content = Buffer.from(JSON.stringify({ updated_at: new Date().toISOString(), items }, null, 2) + '\n').toString('base64'); const body = { message, content, branch: 'main' }; if (sha) body.sha = sha; const r = await fetch(ROOT + jsonPath, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.message || 'Gagal menyimpan database Library.'); } }
    async function authenticate(body) { const username = String(body.username || '').trim().toLowerCase(); const passwordHash = String(body.password_sha256 || ''); if (!username || !passwordHash) throw new Error('Sesi login tidak valid.'); const accountsFile = await githubFile('data/accounts.json'); const accounts = JSON.parse(Buffer.from(accountsFile.content.replace(/\n/g, ''), 'base64').toString('utf8')); const account = (accounts.members || []).find(item => item.username === username); if (!account || account.password_sha256 !== passwordHash) throw new Error('Sesi login tidak valid.'); return account; }
    try {
        if (req.method === 'GET') { const requestedId = String(req.query?.id || '').trim(); const botKey = String(req.headers['x-library-bot-key'] || req.query?.key || ''); if (requestedId) { const items = await readPublicLibrary(); const item = items.find(item => item.id === requestedId && item.status === 'published'); if (!item) return res.status(404).json({ error: 'Dokumen tidak ditemukan.' }); return res.status(200).json({ item }); } if (req.query?.pending === '1') { if (!process.env.LIBRARY_BOT_KEY || botKey !== process.env.LIBRARY_BOT_KEY) return res.status(403).json({ error: 'Akses bot ditolak.' }); const items = (await readLibrary()).items; return res.status(200).json({ items: items.filter(item => item.status === 'pending') }); } const items = await readPublicLibrary(); return res.status(200).json({ items: items.filter(item => item.status === 'published') }); }
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
        const action = String(body.action || '').trim();
        if (action === 'moderate') {
            const botKey=String(body.bot_key||'');
            if(!process.env.LIBRARY_BOT_KEY || botKey!==process.env.LIBRARY_BOT_KEY) return res.status(403).json({error:'Akses bot ditolak.'});
            const id=String(body.id||'').trim();
            const decision=String(body.decision||'').toLowerCase();
            if(!['approve','reject'].includes(decision)) return res.status(400).json({error:'Decision tidak valid.'});
            const data=await readLibrary();
            const item=data.items.find(x=>x.id===id);
            if(!item) return res.status(404).json({error:'Item tidak ditemukan.'});
            if(item.status!=='pending') return res.status(400).json({error:'Item ini sudah diproses.'});
            if(decision==='reject'){
                if(item.blob_url){try{await del(item.blob_url);}catch(e){console.error('Blob reject cleanup failed:',e);}} else if(item.path){const file=await githubFile(item.path);if(file){const rr=await fetch(ROOT+item.path,{method:'DELETE',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({message:'library: reject '+id,sha:file.sha,branch:'main'})});if(!rr.ok)throw new Error('File gagal dibersihkan dari GitHub.');}}
                await writeLibrary(data.items.filter(x=>x.id!==id),data.sha,'library: reject '+id);
                return res.status(200).json({ok:true,decision:'reject',item});
            }
            item.status='published'; item.published_at=new Date().toISOString();
            await writeLibrary(data.items,data.sha,'library: approve '+id);
            await writePublicLibrary(data.items,'library: refresh public index '+id);
            try{
                const annPath='data/announcements.json'; const annFile=await githubFile(annPath);
                const announcements=JSON.parse(Buffer.from(annFile.content.replace(/\\n/g,''),'base64').toString('utf8'));
                announcements.unshift({id:'ann-library-'+Date.now(),date:new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Jakarta'}),type:'Library',title:'Koleksi baru di Library: '+item.title.slice(0,90),description:(item.type==='article'?'Tulisan':'Dokumen')+' baru dari '+item.author+' telah tersedia di Library.',author:'Bionest One',library_id:item.id,created_at:new Date().toISOString()});
                const content=Buffer.from(JSON.stringify(announcements,null,2)+'\n','utf8').toString('base64');
                const rr=await fetch(ROOT+annPath,{method:'PUT',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({message:'announcement: library '+item.id,content,sha:annFile.sha,branch:'main'})});
                if(!rr.ok) console.error('Library announcement failed:',await rr.text());
            }catch(e){console.error('Library announcement error:',e);}
            return res.status(200).json({ok:true,decision:'approve',item});
        }
        const account = await authenticate(body);
        if (action === 'create_article') {
            const title = String(body.title || '').trim(), category = String(body.category || 'Artikel').trim(), excerpt = String(body.excerpt || '').trim(), content = String(body.content || '').trim();
            if (!title || !content) return res.status(400).json({ error: 'Judul dan isi tulisan wajib diisi.' });
            if (content.length > 500000) return res.status(400).json({ error: 'Tulisan terlalu besar.' });
            const id = 'article-' + Date.now() + '-' + Math.random().toString(36).slice(2,8);
            const item = { id, type:'article', title, category, excerpt, author:account.full_name || account.username, author_username:account.username, content, status:'pending', created_at:new Date().toISOString() };
            const data = await readLibrary(); data.items.unshift(item); await writeLibrary(data.items, data.sha, 'library: publish article ' + id); return res.status(200).json({ ok:true, item });
        }
        if (action === 'upload_file') {
            const title=String(body.title||'').trim(), category=String(body.category||'Dokumen').trim(), description=String(body.description||'').trim(), filename=String(body.filename||'').trim().replace(/[^a-zA-Z0-9._-]/g,'-'), mime=String(body.mime||''), base64=String(body.file_base64||'').replace(/^data:[^;]+;base64,/,'');
            if (!title || !filename) return res.status(400).json({ error:'Judul dan file wajib diisi.' });
            if (!['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(mime)) return res.status(400).json({ error:'Format hanya PDF, DOC, atau DOCX.' });
            const blobUrl=String(body.blob_url||'').trim(); const bytes=Number(body.size||0); if(!blobUrl) return res.status(400).json({error:'Upload file belum selesai.'}); if(!bytes||bytes>10*1024*1024) return res.status(400).json({error:'Ukuran file maksimal 10 MB.'});
            const id='file-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
            const data=await readLibrary(); const item={id,type:'file',title,category,description,author:account.full_name||account.username,author_username:account.username,filename,mime,size:bytes,blob_url:blobUrl,status:'pending',created_at:new Date().toISOString()}; data.items.unshift(item); await writeLibrary(data.items,data.sha,'library: register file '+id); return res.status(200).json({ok:true,item});
        }
        if(action==='delete'){const id=String(body.id||'').trim();const data=await readLibrary();const item=data.items.find(x=>x.id===id);if(!item)return res.status(404).json({error:'Item tidak ditemukan.'});if(item.author_username!==account.username&&account.role!=='super_admin')return res.status(403).json({error:'Lu tidak punya akses menghapus item ini.'});const wasPublished=item.status==='published';if(item.blob_url){try{await del(item.blob_url);}catch(e){console.error('Blob delete failed:',e);}} else if(item.path){const file=await githubFile(item.path);if(file){const r=await fetch(ROOT+item.path,{method:'DELETE',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({message:'library: delete '+id,sha:file.sha,branch:'main'})});if(!r.ok)throw new Error('File gagal dihapus dari GitHub.');}}const remaining=data.items.filter(x=>x.id!==id);await writeLibrary(remaining,data.sha,'library: remove '+id);if(wasPublished) await writePublicLibrary(remaining,'library: refresh public index after delete '+id);return res.status(200).json({ok:true});}
        return res.status(400).json({error:'Aksi Library tidak dikenal.'});
    } catch(error) { return res.status(500).json({error:error.message||'Terjadi kesalahan pada Library.'}); }
}
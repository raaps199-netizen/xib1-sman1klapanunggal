export default async function handler(req, res) {
    if (!['GET','POST'].includes(req.method)) return res.status(405).json({ error: 'Method tidak diizinkan.' });
    const token = process.env.GITHUB_TOKEN;
    if (!token) return res.status(500).json({ error: 'GITHUB_TOKEN belum dipasang di Vercel. Tambahkan token repository ke Environment Variables.' });
    const ROOT = 'https://api.github.com/repos/raaps199-netizen/xib1-sman1klapanunggal/contents/';
    const headers = { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'Bionest-One-Library' };
    const jsonPath = 'data/library.json';
    async function githubFile(path) { const r = await fetch(ROOT + path, { headers }); if (r.status === 404) return null; if (!r.ok) throw new Error('Database Library GitHub tidak dapat dibaca.'); return r.json(); }
    async function readLibrary() { const file = await githubFile(jsonPath); if (!file) return { items: [], sha: null }; const raw = Buffer.from(file.content.replace(/\n/g, ''), 'base64').toString('utf8'); return { items: JSON.parse(raw).items || [], sha: file.sha }; }
    async function writeLibrary(items, sha, message) { const content = Buffer.from(JSON.stringify({ updated_at: new Date().toISOString(), items }, null, 2) + '\n').toString('base64'); const body = { message, content, branch: 'main' }; if (sha) body.sha = sha; const r = await fetch(ROOT + jsonPath, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.message || 'Gagal menyimpan database Library.'); } }
    async function authenticate(body) { const username = String(body.username || '').trim().toLowerCase(); const passwordHash = String(body.password_sha256 || ''); if (!username || !passwordHash) throw new Error('Sesi login tidak valid.'); const accountsFile = await githubFile('data/accounts.json'); const accounts = JSON.parse(Buffer.from(accountsFile.content.replace(/\n/g, ''), 'base64').toString('utf8')); const account = (accounts.members || []).find(item => item.username === username); if (!account || account.password_sha256 !== passwordHash) throw new Error('Sesi login tidak valid.'); return account; }
    try {
        if (req.method === 'GET') { const data = await readLibrary(); return res.status(200).json({ items: data.items.filter(item => item.status === 'published') }); }
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
        const account = await authenticate(body);
        const action = String(body.action || '').trim();
        if (action === 'create_article') {
            const title = String(body.title || '').trim(), category = String(body.category || 'Artikel').trim(), excerpt = String(body.excerpt || '').trim(), content = String(body.content || '').trim();
            if (!title || !content) return res.status(400).json({ error: 'Judul dan isi tulisan wajib diisi.' });
            if (content.length > 500000) return res.status(400).json({ error: 'Tulisan terlalu besar.' });
            const id = 'article-' + Date.now() + '-' + Math.random().toString(36).slice(2,8);
            const item = { id, type:'article', title, category, excerpt, author:account.full_name || account.username, author_username:account.username, content, status:'published', created_at:new Date().toISOString() };
            const data = await readLibrary(); data.items.unshift(item); await writeLibrary(data.items, data.sha, 'library: publish article ' + id); return res.status(200).json({ ok:true, item });
        }
        if (action === 'upload_file') {
            const title=String(body.title||'').trim(), category=String(body.category||'Dokumen').trim(), description=String(body.description||'').trim(), filename=String(body.filename||'').trim().replace(/[^a-zA-Z0-9._-]/g,'-'), mime=String(body.mime||''), base64=String(body.file_base64||'').replace(/^data:[^;]+;base64,/,'');
            if (!title || !filename || !base64) return res.status(400).json({ error:'Judul dan file wajib diisi.' });
            if (!['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(mime)) return res.status(400).json({ error:'Format hanya PDF, DOC, atau DOCX.' });
            const bytes=Buffer.byteLength(base64,'base64'); if(bytes>2.5*1024*1024) return res.status(400).json({error:'Ukuran file maksimal 2.5 MB untuk upload lewat serverless.'});
            const id='file-'+Date.now()+'-'+Math.random().toString(36).slice(2,8), path='assets/library/files/'+id+'-'+filename;
            const upload=await fetch(ROOT+path,{method:'PUT',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({message:'library: upload '+filename,content:base64,branch:'main'})});
            if(!upload.ok){const d=await upload.json().catch(()=>({}));throw new Error(d.message||'Gagal mengunggah file ke GitHub.');}
            const data=await readLibrary(); const item={id,type:'file',title,category,description,author:account.full_name||account.username,author_username:account.username,filename,mime,size:bytes,path,status:'published',created_at:new Date().toISOString()}; data.items.unshift(item); await writeLibrary(data.items,data.sha,'library: register file '+id); return res.status(200).json({ok:true,item});
        }
        if(action==='delete'){const id=String(body.id||'').trim();const data=await readLibrary();const item=data.items.find(x=>x.id===id);if(!item)return res.status(404).json({error:'Item tidak ditemukan.'});if(item.author_username!==account.username&&account.role!=='super_admin')return res.status(403).json({error:'Lu tidak punya akses menghapus item ini.'});if(item.path){const file=await githubFile(item.path);if(file){const r=await fetch(ROOT+item.path,{method:'DELETE',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({message:'library: delete '+id,sha:file.sha,branch:'main'})});if(!r.ok)throw new Error('File gagal dihapus dari GitHub.');}}await writeLibrary(data.items.filter(x=>x.id!==id),data.sha,'library: remove '+id);return res.status(200).json({ok:true});}
        return res.status(400).json({error:'Aksi Library tidak dikenal.'});
    } catch(error) { return res.status(500).json({error:error.message||'Terjadi kesalahan pada Library.'}); }
}
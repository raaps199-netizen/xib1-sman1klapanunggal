export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(204).end();

    const token = process.env.GITHUB_TOKEN;
    if (!token) return res.status(500).json({ error: 'Server belum dikonfigurasi.' });

    const repo = 'raaps199-netizen/xib1-sman1klapanunggal';
    const apiUrl = `https://api.github.com/repos/${repo}/contents/data/announcements.json`;
    const accountsUrl = `https://api.github.com/repos/${repo}/contents/data/accounts.json`;
    const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Bionest-One'
    };

    try {
        const readAnnouncements = async () => {
            const response = await fetch(apiUrl, { headers });
            if (!response.ok) throw new Error('Database pengumuman tidak dapat dibaca.');
            const file = await response.json();
            const decoded = Buffer.from(file.content.replace(/\\n/g, ''), 'base64').toString('utf8');
            return { file, items: JSON.parse(decoded) };
        };

        if (req.method === 'GET') {
            const { items } = await readAnnouncements();
            return res.status(200).json({ ok: true, announcements: Array.isArray(items) ? items : [] });
        }

        if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan.' });

        const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
        const username = String(body.username || '').trim().toLowerCase();
        const password_sha256 = String(body.password_sha256 || '');
        const action = String(body.action || '').trim().toLowerCase();

        if (!username || !password_sha256) return res.status(400).json({ error: 'Data autentikasi tidak lengkap.' });

        const accountResponse = await fetch(accountsUrl, { headers });
        if (!accountResponse.ok) throw new Error('Database akun tidak dapat dibaca.');
        const accountFile = await accountResponse.json();
        const accountDecoded = Buffer.from(accountFile.content.replace(/\\n/g, ''), 'base64').toString('utf8');
        const accounts = JSON.parse(accountDecoded);
        const account = (accounts.members || []).find(item => item.username === username);

        if (!account || account.password_sha256 !== password_sha256 || account.role !== 'super_admin') {
            return res.status(403).json({ error: 'Akses admin ditolak.' });
        }

        const { file, items } = await readAnnouncements();
        const announcements = Array.isArray(items) ? items : [];

        if (action === 'add') {
            const title = String(body.title || '').trim();
            const type = String(body.type || 'Informasi').trim().slice(0, 40);
            const description = String(body.description || '').trim();

            if (!title || !description) return res.status(400).json({ error: 'Judul dan isi pengumuman wajib diisi.' });

            const item = {
                id: `ann-${Date.now()}`,
                date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }),
                type: type || 'Informasi',
                title: title.slice(0, 120),
                description: description.slice(0, 500),
                author: account.full_name || account.username,
                created_at: new Date().toISOString()
            };

            announcements.unshift(item);
            const content = Buffer.from(JSON.stringify(announcements, null, 2) + '\\n', 'utf8').toString('base64');
            const updateResponse = await fetch(apiUrl, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `announcement: add ${item.id}`, content, sha: file.sha, branch: 'main' })
            });

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json().catch(() => ({}));
                throw new Error(errorData.message || 'Gagal menyimpan pengumuman.');
            }
            return res.status(200).json({ ok: true, announcement: item });
        }

        if (action === 'delete') {
            const id = String(body.id || '').trim();
            const index = announcements.findIndex(item => item.id === id);
            if (index === -1) return res.status(404).json({ error: 'Pengumuman tidak ditemukan.' });

            const removed = announcements.splice(index, 1)[0];
            const content = Buffer.from(JSON.stringify(announcements, null, 2) + '\\n', 'utf8').toString('base64');
            const updateResponse = await fetch(apiUrl, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `announcement: delete ${removed.id}`, content, sha: file.sha, branch: 'main' })
            });

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json().catch(() => ({}));
                throw new Error(errorData.message || 'Gagal menghapus pengumuman.');
            }
            return res.status(200).json({ ok: true, removed });
        }

        return res.status(400).json({ error: 'Action tidak dikenal.' });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Gagal memproses pengumuman.' });
    }
}

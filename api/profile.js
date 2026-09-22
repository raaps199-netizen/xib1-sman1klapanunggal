export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method tidak diizinkan.' });
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        return res.status(500).json({ error: 'Server belum dikonfigurasi untuk menyimpan profil.' });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
        const username = String(body.username || '').trim().toLowerCase();
        const password_sha256 = String(body.password_sha256 || '');
        const updates = body.updates || {};

        if (!username || !password_sha256) {
            return res.status(400).json({ error: 'Data autentikasi tidak lengkap.' });
        }

        const allowed = ['quote', 'bio', 'hobby', 'favourite_subject', 'instagram'];
        const cleanUpdates = {};
        for (const key of allowed) {
            if (Object.prototype.hasOwnProperty.call(updates, key)) {
                cleanUpdates[key] = String(updates[key] ?? '').trim();
            }
        }

        const apiUrl = 'https://api.github.com/repos/raaps199-netizen/xib1-sman1klapanunggal/contents/data/accounts.json';
        const headers = {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'User-Agent': 'Bionest-One'
        };

        const fileResponse = await fetch(apiUrl, { headers });
        if (!fileResponse.ok) {
            throw new Error('Database GitHub tidak dapat dibaca.');
        }

        const file = await fileResponse.json();
        const decoded = Buffer.from(file.content.replace(/\n/g, ''), 'base64').toString('utf8');
        const database = JSON.parse(decoded);
        const account = (database.members || []).find(item => item.username === username);

        if (!account || account.password_sha256 !== password_sha256) {
            return res.status(401).json({ error: 'Sesi tidak valid.' });
        }

        Object.assign(account, cleanUpdates);

        const newContent = Buffer.from(JSON.stringify(database, null, 2) + '\n', 'utf8').toString('base64');
        const updateResponse = await fetch(apiUrl, {
            method: 'PUT',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: `profile: update ${username}`,
                content: newContent,
                sha: file.sha,
                branch: 'main'
            })
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gagal menyimpan perubahan ke GitHub.');
        }

        return res.status(200).json({ ok: true, profile: {
            username: account.username,
            full_name: account.full_name,
            role: account.role,
            quote: account.quote || '',
            bio: account.bio || '',
            hobby: account.hobby || '',
            favourite_subject: account.favourite_subject || '',
            instagram: account.instagram || ''
        }});
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Gagal menyimpan profil.' });
    }
}

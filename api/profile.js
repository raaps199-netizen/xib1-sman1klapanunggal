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
        const updates = {
            ...(body.updates && typeof body.updates === 'object' ? body.updates : {})
        };

        // Profile picture upload uses the same authenticated profile endpoint.
        if (body.action === 'profile_picture') {
            const image = String(body.image || '');
            if (image && !image.startsWith('data:image/')) {
                return res.status(400).json({ error: 'File foto tidak valid.' });
            }

            const match = image.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/i);
            if (image && !match) {
                return res.status(400).json({ error: 'Gunakan JPG, PNG, atau WebP.' });
            }

            const imageBase64 = match ? match[2] : '';
            if (imageBase64 && Buffer.byteLength(imageBase64, 'base64') > 2 * 1024 * 1024) {
                return res.status(400).json({ error: 'Ukuran foto maksimal 2 MB.' });
            }

            const apiUrl = 'https://api.github.com/repos/raaps199-netizen/xib1-sman1klapanunggal/contents/data/accounts.json';
            const headers = {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
                'User-Agent': 'Bionest-One'
            };

            const fileResponse = await fetch(apiUrl, { headers });
            if (!fileResponse.ok) throw new Error('Database GitHub tidak dapat dibaca.');

            const file = await fileResponse.json();
            const decoded = Buffer.from(file.content.replace(/\\n/g, ''), 'base64').toString('utf8');
            const database = JSON.parse(decoded);
            const account = (database.members || []).find(item => item.username === username);

            if (!account || account.password_sha256 !== password_sha256) {
                return res.status(401).json({ error: 'Sesi tidak valid.' });
            }

            const profilePath = `assets/profile/${username}.webp`;
            const profileUrl = `https://raw.githubusercontent.com/raaps199-netizen/xib1-sman1klapanunggal/main/${profilePath}`;

            let existingSha;
            const existingResponse = await fetch(
                `https://api.github.com/repos/raaps199-netizen/xib1-sman1klapanunggal/contents/${profilePath}`,
                { headers }
            );
            if (existingResponse.ok) {
                existingSha = (await existingResponse.json()).sha;
            }

            if (imageBase64) {
                const imageResponse = await fetch(
                    `https://api.github.com/repos/raaps199-netizen/xib1-sman1klapanunggal/contents/${profilePath}`,
                    {
                        method: 'PUT',
                        headers: { ...headers, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message: `profile: update picture ${username}`,
                            content: imageBase64,
                            ...(existingSha ? { sha: existingSha } : {}),
                            branch: 'main'
                        })
                    }
                );

                if (!imageResponse.ok) {
                    const errorData = await imageResponse.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Gagal menyimpan foto profil.');
                }
                account.avatar_url = profileUrl;
            } else if (existingSha) {
                const deleteResponse = await fetch(
                    `https://api.github.com/repos/raaps199-netizen/xib1-sman1klapanunggal/contents/${profilePath}`,
                    {
                        method: 'DELETE',
                        headers: { ...headers, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message: `profile: remove picture ${username}`,
                            sha: existingSha,
                            branch: 'main'
                        })
                    }
                );
                if (!deleteResponse.ok) {
                    const errorData = await deleteResponse.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Gagal menghapus foto profil.');
                }
                account.avatar_url = '';
            } else {
                account.avatar_url = '';
            }
            const newContent = Buffer.from(JSON.stringify(database, null, 2) + '\n', 'utf8').toString('base64');
            const updateResponse = await fetch(apiUrl, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `profile: save picture url ${username}`,
                    content: newContent,
                    sha: file.sha,
                    branch: 'main'
                })
            });

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json().catch(() => ({}));
                throw new Error(errorData.message || 'Foto tersimpan, tetapi data profil gagal diperbarui.');
            }

            return res.status(200).json({
                ok: true,
                profile: {
                    username: account.username,
                    full_name: account.full_name,
                    role: account.role,
                    quote: account.quote || '',
                    bio: account.bio || '',
                    hobby: account.hobby || '',
                    favourite_subject: account.favourite_subject || '',
                    instagram: account.instagram || '',
                    avatar_url: profileUrl + '?v=' + Date.now()
                }
            });
        }

        // Support both the current payload ({ updates: {...} })
        // and older cached clients that send editable fields at the top level.
        for (const key of ['quote', 'bio', 'hobby', 'favourite_subject', 'instagram']) {
            if (Object.prototype.hasOwnProperty.call(body, key)) {
                updates[key] = body[key];
            }
        }

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
            instagram: account.instagram || '',
            avatar_url: account.avatar_url || ''
        }});
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Gagal menyimpan profil.' });
    }
}

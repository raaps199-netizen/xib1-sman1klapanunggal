const GITHUB_API = 'https://api.github.com';
const REPO = 'raaps199-netizen/xib1-sman1klapanunggal';
const FILE_PATH = 'data/violations.json';
const BRANCH = 'main';

async function githubRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            'X-GitHub-Api-Version': '2022-11-28',
            ...(options.headers || {})
        }
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `GitHub request failed: ${response.status}`);
    }
    return response.json();
}

async function readJsonFile() {
    const file = await githubRequest(`${GITHUB_API}/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`);
    const raw = Buffer.from(file.content.replace(/\\n/g, '').replace(/\s+$/g, ''), 'base64').toString('utf8');
    return { data: JSON.parse(raw || '[]'), sha: file.sha };
}

export default async function handler(req, res) {
    if (!process.env.GITHUB_TOKEN) {
        return res.status(500).json({ error: 'Server belum dikonfigurasi.' });
    }

    try {
        if (req.method === 'GET') {
            const { data } = await readJsonFile();
            const student = String(req.query?.student || '').trim();
            return res.status(200).json({
                violations: student ? data.filter(item => item.student === student) : data
            });
        }

        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method tidak diizinkan.' });
        }

        const body = req.body || {};
        const { username, password_sha256, student, category, violation } = body;

        if (!username || !password_sha256 || !student || !category || !violation) {
            return res.status(400).json({ error: 'Data laporan belum lengkap.' });
        }

        const accountsFile = await githubRequest(`${GITHUB_API}/repos/${REPO}/contents/data/accounts.json?ref=${BRANCH}`);
        const accountsRaw = Buffer.from(accountsFile.content.replace(/\\n/g, '').replace(/\s+$/g, ''), 'base64').toString('utf8');
        const accounts = JSON.parse(accountsRaw || '[]');
        const reporter = accounts.find(account =>
            account.username === username &&
            account.password_sha256 === password_sha256
        );

        if (!reporter) {
            return res.status(401).json({ error: 'Sesi tidak valid.' });
        }

        const { data, sha } = await readJsonFile();
        const account = accounts.find(item => item.username === student);

        if (!account) {
            return res.status(404).json({ error: 'Siswa tidak ditemukan.' });
        }

        const now = new Date();
        const jakarta = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Jakarta',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(now);
        const time = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Jakarta',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).format(now);

        const id = `vio-${Date.now()}`;
        const record = {
            id,
            student: account.username,
            student_name: account.full_name,
            category,
            violation,
            reported_by: reporter.username,
            reported_by_name: reporter.full_name,
            date: jakarta,
            time,
            created_at: now.toISOString()
        };

        data.push(record);

        const content = Buffer.from(JSON.stringify(data, null, 2) + '\n').toString('base64');
        await githubRequest(`${GITHUB_API}/repos/${REPO}/contents/${FILE_PATH}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: `feat: record violation for ${account.full_name}`,
                content,
                sha,
                branch: BRANCH
            })
        });

        return res.status(201).json({ message: 'Pelanggaran berhasil dicatat.', violation: record });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Gagal menyimpan data pelanggaran.' });
    }
}

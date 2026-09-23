import crypto from 'crypto';

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
        const errorText = await response.text();
        const error = new Error(errorText);
        error.status = response.status;
        throw error;
    }
    return response.json();
}

async function readJsonFile() {
    const file = await githubRequest(`${GITHUB_API}/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`);
    const raw = Buffer.from(file.content.replace(/\\n/g, '').replace(/\s+$/g, ''), 'base64').toString('utf8');
    return { data: JSON.parse(raw || '[]'), sha: file.sha };
}

async function getAccounts() {
    const file = await githubRequest(`${GITHUB_API}/repos/${REPO}/contents/data/accounts.json?ref=${BRANCH}`);
    const raw = Buffer.from(file.content.replace(/\\n/g, '').replace(/\s+$/g, ''), 'base64').toString('utf8');
    return JSON.parse(raw || '[]');
}

function getTeacherMap() {
    try {
        const parsed = JSON.parse(process.env.TEACHER_PINS || '{}');
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function signTeacherToken(teacherName, subject) {
    const payload = Buffer.from(JSON.stringify({
        role: 'teacher',
        name: teacherName,
        subject,
        exp: Date.now() + 8 * 60 * 60 * 1000
    })).toString('base64url');
    const signature = crypto.createHmac('sha256', process.env.TEACHER_SECRET).update(payload).digest('base64url');
    return payload + '.' + signature;
}

function decodeTeacherToken(token) {
    try {
        const [payload, signature] = String(token || '').split('.');
        if (!payload || !signature || !process.env.TEACHER_SECRET) return null;
        const expected = crypto.createHmac('sha256', process.env.TEACHER_SECRET).update(payload).digest('base64url');
        if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
        const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        if (data.role !== 'teacher' || !data.name || !data.subject || data.exp <= Date.now()) return null;
        return data;
    } catch {
        return null;
    }
}

function verifyTeacherToken(token) {
    try {
        return !!decodeTeacherToken(token);
    } catch {
        return false;
    }
}

export default async function handler(req, res) {
    if (!process.env.GITHUB_TOKEN || !process.env.TEACHER_PINS || !process.env.TEACHER_SECRET) {
        return res.status(500).json({ error: 'Sistem guru belum dikonfigurasi.' });
    }

    try {
        if (req.method === 'GET') {
            const student = String(req.query?.student || '').trim();
            const username = String(req.query?.username || '').trim();
            const password_sha256 = String(req.query?.password_sha256 || '').trim();

            if (!student || !username || !password_sha256) {
                return res.status(401).json({ error: 'Akses riwayat membutuhkan sesi login.' });
            }

            const accounts = await getAccounts();
            const member = accounts.find(a => a.username === username && a.password_sha256 === password_sha256);
            if (!member || member.username !== student) {
                return res.status(403).json({ error: 'Riwayat hanya dapat dilihat oleh pemilik profil.' });
            }

            const { data } = await readJsonFile();
            return res.status(200).json({ violations: data.filter(item => item.student === student) });
        }

        if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan.' });

        const body = req.body || {};

        if (body.action === 'teacher_login') {
            const pin = String(body.pin || '').trim();
            const teacherMap = getTeacherMap();
            const teacher = teacherMap[pin];
            if (!teacher) {
                return res.status(401).json({ error: 'Kode guru salah.' });
            }

            const teacherName = typeof teacher === 'string' ? teacher : teacher.name;
            const subject = typeof teacher === 'string' ? '' : teacher.subject;

            if (!teacherName || !subject) {
                return res.status(500).json({ error: 'Data guru belum lengkap di konfigurasi.' });
            }

            return res.status(200).json({
                token: signTeacherToken(String(teacherName), String(subject)),
                teacher_name: String(teacherName),
                subject: String(subject)
            });
        }

        const teacherData = decodeTeacherToken(body.teacher_token);
        if (!teacherData) {
            return res.status(403).json({ error: 'Akses khusus guru diperlukan.' });
        }

        const { student, category, violation } = body;
        if (!student || !category || !violation) {
            return res.status(400).json({ error: 'Data laporan belum lengkap.' });
        }

        const accounts = await getAccounts();
        const account = accounts.find(item => item.username === student);
        if (!account) return res.status(404).json({ error: 'Siswa tidak ditemukan.' });

        const { data, sha } = await readJsonFile();
        const now = new Date();
        const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year:'numeric', month:'2-digit', day:'2-digit' }).format(now);
        const time = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false }).format(now);

        const record = {
            id: `vio-${Date.now()}`,
            student: account.username,
            student_name: account.full_name,
            category,
            violation,
            reported_by: 'teacher',
            reported_by_name: teacherData.name,
            subject: teacherData.subject,
            date,
            time,
            created_at: now.toISOString()
        };

        data.push(record);
        const encoded = Buffer.from(JSON.stringify(data, null, 2) + '\n').toString('base64');

        await githubRequest(`${GITHUB_API}/repos/${REPO}/contents/${FILE_PATH}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: `feat: record violation for ${account.full_name}`,
                content: encoded,
                sha,
                branch: BRANCH
            })
        });

        return res.status(201).json({
            message: 'Pelanggaran berhasil dicatat.',
            violation: record
        });
    } catch (error) {
        console.error('Violation API error:', error);
        let detail = error?.message || 'Unknown error';
        try {
            const parsed = JSON.parse(detail);
            detail = parsed.message || parsed.error || detail;
        } catch {}
        return res.status(error?.status || 500).json({
            error: 'Gagal memproses laporan.',
            detail: String(detail).slice(0, 500)
        });
    }
}

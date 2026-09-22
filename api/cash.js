export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan.' });

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
        const action = String(body.action || '').trim();
        const token = process.env.GITHUB_TOKEN;
        if (!token) return res.status(500).json({ error: 'Server belum dikonfigurasi.' });

        const apiUrl = 'https://api.github.com/repos/raaps199-netizen/xib1-sman1klapanunggal/contents/data/cash.json';
        const headers = {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'User-Agent': 'Bionest-One'
        };

        const readCash = async () => {
            const response = await fetch(apiUrl, { headers });
            if (!response.ok) throw new Error('Database kas tidak dapat dibaca.');
            const file = await response.json();
            const decoded = Buffer.from(file.content.replace(/\\n/g, ''), 'base64').toString('utf8');
            return { file, database: JSON.parse(decoded) };
        };

        const authenticateMember = async () => {
            const username = String(body.username || '').trim().toLowerCase();
            const password_sha256 = String(body.password_sha256 || '');
            if (!username || !password_sha256) return null;

            const accountsUrl = 'https://api.github.com/repos/raaps199-netizen/xib1-sman1klapanunggal/contents/data/accounts.json';
            const response = await fetch(accountsUrl, { headers });
            if (!response.ok) throw new Error('Database akun tidak dapat dibaca.');
            const file = await response.json();
            const decoded = Buffer.from(file.content.replace(/\\n/g, ''), 'base64').toString('utf8');
            const accounts = JSON.parse(decoded);
            const account = (accounts.members || []).find(item => item.username === username);
            if (!account || account.password_sha256 !== password_sha256) return null;
            return account;
        };

        if (action === 'summary') {
            const account = await authenticateMember();
            if (!account) return res.status(401).json({ error: 'Sesi tidak valid.' });

            const { database } = await readCash();
            const transactions = Array.isArray(database.transactions) ? database.transactions : [];
            const income = transactions.filter(t => t.type === 'income');
            const expenses = transactions.filter(t => t.type === 'expense');

            const totalByCategory = category =>
                income.filter(t => t.category === category).reduce((sum, t) => sum + Number(t.amount || 0), 0);

            const totalKas = totalByCategory('kas');
            const totalPoe = totalByCategory('poe');
            const totalIncome = totalKas + totalPoe;
            const totalExpense = expenses.reduce((sum, t) => sum + Number(t.amount || 0), 0);

            const byStudent = {};
            for (const t of transactions) {
                if (!t.student) continue;
                if (!byStudent[t.student]) byStudent[t.student] = { kas: 0, poe: 0, total: 0 };
                const amount = Number(t.amount || 0);
                if (t.type === 'income') {
                    if (t.category === 'kas') byStudent[t.student].kas += amount;
                    if (t.category === 'poe') byStudent[t.student].poe += amount;
                    byStudent[t.student].total += amount;
                }
            }

            return res.status(200).json({
                ok: true,
                totals: { kas: totalKas, poe: totalPoe, income: totalIncome, expense: totalExpense, balance: totalIncome - totalExpense },
                byStudent,
                transactions: transactions.slice().reverse()
            });
        }

        if (action === 'add') {
            const botSecret = process.env.BOT_API_SECRET;
            const authHeader = String(req.headers.authorization || '');
            const suppliedSecret = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
            if (!botSecret || suppliedSecret !== botSecret) {
                return res.status(401).json({ error: 'Bot tidak terautentikasi.' });
            }

            const student = String(body.student || '').trim().toLowerCase();
            const category = String(body.category || '').trim().toLowerCase();
            const amount = Number(body.amount);
            const month = String(body.month || '').trim();
            const description = String(body.description || '').trim();

            if (!student || !['kas', 'poe'].includes(category) || !Number.isFinite(amount) || amount <= 0) {
                return res.status(400).json({ error: 'Data transaksi tidak valid.' });
            }

            const { file, database } = await readCash();
            if (!Array.isArray(database.transactions)) database.transactions = [];

            database.transactions.push({
                id: `tx-${Date.now()}`,
                type: 'income',
                category,
                student,
                amount: Math.round(amount),
                month: month || new Date().toLocaleString('id-ID', { month: 'long' }),
                description: description || `Pembayaran ${category}`,
                source: 'whatsapp-bot',
                created_at: new Date().toISOString()
            });

            const newContent = Buffer.from(JSON.stringify(database, null, 2) + '\\n', 'utf8').toString('base64');
            const updateResponse = await fetch(apiUrl, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `cash: add ${student} ${category}`,
                    content: newContent,
                    sha: file.sha,
                    branch: 'main'
                })
            });

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json().catch(() => ({}));
                throw new Error(errorData.message || 'Gagal menyimpan transaksi.');
            }

            return res.status(200).json({ ok: true, transaction: database.transactions.at(-1) });
        }

        return res.status(400).json({ error: 'Action tidak dikenal.' });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Gagal memproses kas.' });
    }
}

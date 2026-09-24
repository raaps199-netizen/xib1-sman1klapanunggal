export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan.' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const kategori = String(body.kategori || 'umum').trim().slice(0, 40);
    const inputLevel = String(body.level || 'mudah').toLowerCase().trim();

    let difficulty = 'mudah';
    let points = 500;
    if (['sedang', 'medium'].includes(inputLevel)) {
      difficulty = 'sedang';
      points = 1000;
    } else if (['hard', 'sulit', 'susah'].includes(inputLevel)) {
      difficulty = 'sulit';
      points = 2500;
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API trivia belum dikonfigurasi di server.' });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          {
            role: 'system',
            content: 'Kamu pembuat soal trivia Bahasa Indonesia. Balas HANYA JSON valid. Soal harus faktual, punya tepat satu jawaban benar, dan pilihan salah harus masuk akal.'
          },
          {
            role: 'user',
            content: `Buat 1 soal trivia unik dan acak.
Kategori: ${kategori}
Tingkat kesulitan: ${difficulty}

JSON WAJIB:
{
  "soal": "pertanyaan",
  "jawabanBenar": "jawaban benar",
  "jawabanSalah": ["salah 1", "salah 2", "salah 3"]
}`
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.error?.message || 'Groq gagal membuat soal.');
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content;
    const quiz = JSON.parse(raw);

    if (!quiz?.soal || !quiz?.jawabanBenar || !Array.isArray(quiz.jawabanSalah) || quiz.jawabanSalah.length < 3) {
      throw new Error('Format soal dari Groq tidak valid.');
    }

    const options = [
      { text: String(quiz.jawabanBenar), correct: true },
      ...quiz.jawabanSalah.slice(0, 3).map(text => ({ text: String(text), correct: false }))
    ];

    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return res.status(200).json({
      ok: true,
      soal: String(quiz.soal),
      options,
      reward: points,
      level: difficulty,
      kategori
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Gagal membuat soal trivia.' });
  }
}

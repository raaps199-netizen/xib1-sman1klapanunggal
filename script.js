lucide.createIcons();

const students = [
    { id: 1, name: "Khafi", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 2, name: "Arjasena", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 3, name: "Orlen", fullName: "Danendra Orlen Wasatha", role: "Siswa XI.B1", quote: "Simply lovely", ig: "#" },
    { id: 4, name: "Avisha", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 5, name: "Fareal", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 6, name: "Andrian", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 7, name: "Sadam", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 8, name: "Wisnu", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 9, name: "Tania", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 10, name: "Jauharah", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 11, name: "Keyla", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 12, name: "Mikaela", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 13, name: "Ridho", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 14, name: "Rizky", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 15, name: "Zyella", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 16, name: "Nishar", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 17, name: "Alvian", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 18, name: "Brella", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 19, name: "Fathian", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 20, name: "Reno", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 21, name: "Lutfan", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 22, name: "Rafif", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 23, name: "Kevin", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 24, name: "Arya", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 25, name: "Al Mira", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 26, name: "Elang", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 27, name: "Dzaky", fullName: "M. Dzaky Pradana", role: "Siswa XI.B1", quote: "No excuses. Just results", ig: "#" },
    { id: 28, name: "Aisahra", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 29, name: "Satria", fullName: "Satria Arjasena M", role: "Siswa XI.B1", quote: "If it's meant for you, it will find it's way to you.", ig: "#" },
    { id: 30, name: "Putri", fullName: "Putri Aulia", role: "Siswa XI.B1", quote: "calm is power. i choose peace over chaos", ig: "#" },
    { id: 31, name: "Fahri", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 32, name: "Rifqi", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 33, name: "Fadhil", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 34, name: "Yusuf", fullName: "Harazaki Yusuf", role: "Siswa XI.B1", quote: "I'll be myself", ig: "#" },
    { id: 35, name: "Kirana", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 36, name: "Effan", fullName: "Effan Zandra A.P", role: "Siswa XI.B1", quote: "You're the most important person in your life", ig: "#" },
    { id: 37, name: "Dzaki", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 38, name: "Aura", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 39, name: "Reva", fullName: "Reva Amalia A", role: "Siswa XI.B1", quote: "if a million loved you, I am one of them, and if one loved you, it was me, if no one loved you then know that I am dead", ig: "#" },
    { id: 40, name: "Surya", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 41, name: "Dhirgam", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 42, name: "Yoga", fullName: "Yoga R.R", role: "Siswa XI.B1", quote: "The death of democracy is the death of the people's will.", ig: "#" },
    { id: 43, name: "Dude", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 44, name: "Daffa", fullName: "M. Daffa Azalia", role: "Siswa XI.B1", quote: "Be what you wanna be", ig: "#" },
    { id: 45, name: "Irfan", fullName: "Irfan Asyraf Musyaffa", role: "Siswa XI.B1", quote: "silence is better explaining", ig: "#" },
    { id: 46, name: "Ara", fullName: "Ara Ananda", role: "Siswa XI.B1", quote: "be your own light", ig: "#" },
    { id: 47, name: "Anissa", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 48, name: "Meli", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 49, name: "Gibran", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 50, name: "Salsabila", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" }
];

const studentGrid = document.getElementById('studentGrid');
students.forEach(s => {
    const card = document.createElement('div');
    card.className = "p-4 rounded-xl bg-techCard border border-slate-800 hover:border-techCyan/50 cursor-pointer text-center transition transform hover:-translate-y-1";
    card.addEventListener('click', () => openModal(s));
    card.innerHTML = `
        <h4 class="text-sm font-semibold text-slate-200 py-4">${s.name}</h4>
    `;
    studentGrid.appendChild(card);
});

function openModal(student) {
    document.getElementById('modalName').innerText = student.fullName || student.name;
    document.getElementById('modalRole').innerText = student.role;
    document.getElementById('modalQuote').innerText = `"${student.quote}"`;
    document.getElementById('modalIg').href = student.ig;
    document.getElementById('studentModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('studentModal').classList.add('hidden');
}

const schedules = {
    Senin: {
        mapel: ['MTK TL', 'Inggris', 'Fisika'],
        piket: ['Khafi', 'Arjasena', 'Orlen', 'Avisha', 'Fareal', 'Andrian', 'Sadam', 'Wisnu', 'Tania', 'Jauharah']
    },
    Selasa: {
        mapel: ['Fisika', 'Sunda', 'Informatika', 'PAI'],
        piket: ['Keyla', 'Mikaela', 'Ridho', 'Rizky', 'Zyella', 'Nishar', 'Alvian', 'Brella', 'Fathian', 'Reno']
    },
    Rabu: {
        mapel: ['PKN', 'PKWU', 'Kimia', 'B. Indo', 'SBK'],
        piket: ['Lutfan', 'Rafif', 'Kevin', 'Arya', 'Al Mira', 'Elang', 'Dzaki N.', 'Aisahra', 'Satria P', 'Putri']
    },
    Kamis: {
        mapel: ['Kimia', 'Penjas', 'Sejarah', 'MTK U'],
        piket: ['Fahri', 'Rifqi', 'Fadhil', 'Yusuf', 'Kirana', 'Effan', 'Dzaki', 'Aura', 'Reva', 'Surya']
    },
    Jumat: {
        mapel: ['MTK TL', 'MTK U', 'BK', 'B. Indo', 'Informatika'],
        piket: ['Dhirgam', 'Yoga', 'Dude', 'Daffa', 'Irfan', 'Ara', 'Anissa', 'Meli', 'Gibran', 'Salsabila']
    }
};

function switchDay(day) {
    const data = schedules[day];
    if (!data) return;

    const list = document.getElementById('scheduleList');
    const piket = document.getElementById('piketList');

    list.innerHTML = data.mapel.map((m, i) => `
        <li class="flex items-center gap-2 text-slate-300">
            <span class="text-xs text-slate-500 font-mono w-5">${i + 1}.</span>
            <i data-lucide="check-circle-2" class="w-4 h-4 text-techCyan"></i>
            <span>${m}</span>
        </li>
    `).join('');

    piket.innerHTML = data.piket.map(p => `
        <span class="px-3 py-1 rounded-full bg-cyan-950 text-techCyan border border-techCyan/30 text-xs">${p}</span>
    `).join('');

    document.querySelectorAll('.tab-btn').forEach(button => {
        const isActive = button.dataset.day === day;
        button.classList.toggle('bg-techCyan', isActive);
        button.classList.toggle('text-techDark', isActive);
        button.classList.toggle('font-bold', isActive);
        button.classList.toggle('bg-techCard', !isActive);
        button.classList.toggle('text-slate-300', !isActive);
    });

    lucide.createIcons();
}

document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => switchDay(button.dataset.day));
});

switchDay('Senin');

const gradDate = new Date("May 1, 2028 00:00:00").getTime();
setInterval(() => {
    const now = new Date().getTime();
    const diff = gradDate - now;
    document.getElementById('days').innerText = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    document.getElementById('hours').innerText = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
    document.getElementById('minutes').innerText = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
    document.getElementById('seconds').innerText = Math.max(0, Math.floor((diff % (1000 * 60)) / 1000));
}, 1000);

const bgm = document.getElementById('bgmAudio');
const bgmBtn = document.getElementById('bgmToggle');
const bgmIcon = document.getElementById('bgmIcon');
let isPlaying = false;

bgmBtn.onclick = () => {
    if (isPlaying) {
        bgm.pause();
        bgmIcon.setAttribute('data-lucide', 'volume-x');
    } else {
        bgm.play().catch(() => {});
        bgmIcon.setAttribute('data-lucide', 'volume-2');
    }
    isPlaying = !isPlaying;
    lucide.createIcons();
};

window.openModal = openModal;
window.closeModal = closeModal;
window.switchDay = switchDay;

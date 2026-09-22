lucide.createIcons();

const students = [
    { id: 1, name: "Khafi", fullName: "Ashabul Khafi", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 2, name: "Arjasena", fullName: "Satria Arjasena Maulana", role: "Siswa XI.B1", quote: "If it's meant for you, it will find it's way to you.", ig: "#" },
    { id: 3, name: "Orlen", fullName: "Danendra Orlen Wasatha", role: "Siswa XI.B1", quote: "Simply lovely", ig: "#" },
    { id: 4, name: "Avisha", fullName: "Avisha Fakhiran Anwar", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 5, name: "Fareal", fullName: "Fareal Julyans Zalfine", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 6, name: "Andrian", fullName: "Andrian Pranata Tambunan", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 7, name: "Sadam", fullName: "Sadam Al Fahri", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 8, name: "Wisnu", fullName: "Wisnu Panji Pratama", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 9, name: "Tania", fullName: "Tania Fitri Izati", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 10, name: "Jauharah", fullName: "Jauharah Tuhfah", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 11, name: "Keyla", fullName: "Keyla Ajeng Firmansyah", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 12, name: "Mikaela", fullName: "Mikaela Leona", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 13, name: "Ridho", fullName: "Ridho Saputra Ependi", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 14, name: "Rizky", fullName: "Rizky Dwi Saputra Hidayat", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 15, name: "Zyella", fullName: "Zyella Almaira Sigit", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 16, name: "Nishar", fullName: "Nishar Soma Maulana", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 17, name: "Alvian", fullName: "Alvian Arkan Iniesta", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 18, name: "Brella", fullName: "Brela Terta Zafina", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 19, name: "Fathian", fullName: "Fathian Khairul Akbar", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 20, name: "Reno", fullName: "Reno Ramzi Nararya", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 21, name: "Lutfan", fullName: "Lutfan Attaullah Sultoni", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 22, name: "Rafif", fullName: "Ahmad Rafif Hidayat", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 23, name: "Kevin", fullName: "Kevin Habiyal Huda", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 24, name: "Arya", fullName: "Arya Pratama", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 25, name: "Al Mira", fullName: "Al Mira Berlian Handayani", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 26, name: "Elang", fullName: "Elang Bari Dermawan", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 27, name: "Dzaky", fullName: "Muhammad Dzaky Pradana", role: "Siswa XI.B1", quote: "No excuses. Just results", ig: "#" },
    { id: 28, name: "Aisahra", fullName: "Aisahra Mayjasti Aulia Putri", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 29, name: "Satria", fullName: "Satria Putra Pratama", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 30, name: "Putri", fullName: "Putri Aulia", role: "Siswa XI.B1", quote: "calm is power. i choose peace over chaos", ig: "#" },
    { id: 31, name: "Fahri", fullName: "Muhammad Fahri Maulana", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 32, name: "Rifqi", fullName: "Rifqi Binangkit", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 33, name: "Fadhil", fullName: "Askha Fadhil Raihan Adinomo", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 34, name: "Yusuf", fullName: "Harazaki Yusuf Rahardjo Telaumbanua", role: "Siswa XI.B1", quote: "I'll be myself", ig: "#" },
    { id: 35, name: "Kirana", fullName: "Kirana Intan Permata", role: "Siswa XI.B1", quote: "Be proud of how far you've come", ig: "#" },
    { id: 36, name: "Effan", fullName: "Effan Zandra Arya Putra", role: "Siswa XI.B1", quote: "You're the most important person in your life", ig: "#" },
    { id: 37, name: "Dzaki", fullName: "Dzakii Nizaar Akmal", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 38, name: "Aura", fullName: "Aura Rizky Triyastuti", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 39, name: "Reva", fullName: "Reva Amalia Achmad", role: "Siswa XI.B1", quote: "if a million loved you, I am one of them, and if one loved you, it was me, if no one loved you then know that I am dead", ig: "#" },
    { id: 40, name: "Surya", fullName: "Surya Melano", role: "Siswa XI.B1", quote: "Wong liyo ngerti opo", ig: "#" },
    { id: 41, name: "Dhirgam", fullName: "Dhirgam Nawi Hasib Dhiya Ul'Haq", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 42, name: "Yoga", fullName: "Yoga Rizki Ramadhan", role: "Siswa XI.B1", quote: "The death of democracy is the death of the people's will.", ig: "#" },
    { id: 43, name: "Dude", fullName: "Dude Ramadhan", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 44, name: "Daffa", fullName: "M. Daffa Azalia", role: "Siswa XI.B1", quote: "Be what you wanna be", ig: "#" },
    { id: 45, name: "Irfan", fullName: "Irfan Asyraf Musyaffa", role: "Siswa XI.B1", quote: "silence is better explaining", ig: "#" },
    { id: 46, name: "Ara", fullName: "Ara Ananda Putri", role: "Siswa XI.B1", quote: "be your own light", ig: "#" },
    { id: 47, name: "Anissa", fullName: "Annisa Zahra", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 48, name: "Meli", fullName: "Meli Anggraeni", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 49, name: "Gibran", fullName: "Gibran Ayatullah", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 50, name: "Salsabila", fullName: "Salsabil Fajrianita", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
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

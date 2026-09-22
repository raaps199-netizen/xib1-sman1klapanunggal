
const memberGate = document.getElementById('memberGate');
const memberYesBtn = document.getElementById('memberYesBtn');
const visitorBtn = document.getElementById('visitorBtn');

async function showMemberGate() {
    try {
        if (window.supabaseClient) {
            const { data: { session } } = await window.supabaseClient.auth.getSession();
            if (session) {
                sessionStorage.setItem('bionestAccess', 'member');
                await renderMemberProfile(session);
                return;
            }
        }
    } catch (error) {
        console.warn('Session check failed:', error);
    }

    if (sessionStorage.getItem('bionestAccess')) return;
    memberGate.classList.remove('hidden');
    memberGate.classList.add('flex');
    document.body.classList.add('overflow-hidden');
    lucide.createIcons();
}

function closeMemberGate() {
    memberGate.classList.add('hidden');
    memberGate.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
}

memberYesBtn.addEventListener('click', () => {
    sessionStorage.setItem('bionestAccess', 'member');
    window.location.href = 'login.html';
});

visitorBtn.addEventListener('click', () => {
    sessionStorage.setItem('bionestAccess', 'visitor');
    closeMemberGate();
});

window.addEventListener('DOMContentLoaded', showMemberGate);

async function renderMemberProfile(session) {
    if (!window.supabaseClient) return;

    const { data: profile } = await window.supabaseClient
        .from('profiles')
        .select('id, username, full_name, role, quote, bio, hobby, favourite_subject, instagram, avatar_url')
        .eq('id', session.user.id)
        .maybeSingle();

    if (!profile) return;

    const existing = document.getElementById('memberProfileButton');
    if (existing) existing.remove();

    const container = document.querySelector('nav .max-w-7xl > div:last-child');
    if (!container) return;

    const button = document.createElement('button');
    button.id = 'memberProfileButton';
    button.className = 'flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 transition';
    button.innerHTML = `
        <span class="w-7 h-7 rounded-full bg-gradient-to-br from-techCyan to-techBlue text-techDark flex items-center justify-center text-[10px] font-black">${getInitials(profile.full_name || profile.username)}</span>
        <span class="hidden sm:block text-xs font-semibold text-slate-200 max-w-[100px] truncate">${profile.full_name || profile.username}</span>
    `;
    button.addEventListener('click', () => openMemberProfile(profile));
    container.insertBefore(button, container.firstChild);

    lucide.createIcons();
}

function openMemberProfile(profile) {
    let modal = document.getElementById('memberProfileModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'memberProfileModal';
        modal.className = 'fixed inset-0 z-[90] hidden items-center justify-center bg-black/80 backdrop-blur-md p-4';
        modal.innerHTML = `
            <div class="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-techCard border border-cyan-500/30 shadow-2xl shadow-cyan-950/50">
                <div class="h-1 bg-gradient-to-r from-techCyan via-techBlue to-techCyan"></div>
                <div class="p-6 sm:p-7">
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex items-center gap-3">
                            <div id="profileAvatar" class="w-14 h-14 rounded-2xl bg-gradient-to-br from-techCyan to-techBlue text-techDark flex items-center justify-center text-lg font-black"></div>
                            <div>
                                <p class="text-[10px] uppercase tracking-[.25em] text-techCyan">Member Profile</p>
                                <h2 id="profileDisplayName" class="text-xl font-black mt-1"></h2>
                                <p id="profileDisplayRole" class="text-xs text-slate-500 mt-1"></p>
                            </div>
                        </div>
                        <button id="closeProfileModal" class="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition">
                            <i data-lucide="x"></i>
                        </button>
                    </div>

                    <div class="mt-7 p-4 rounded-2xl bg-slate-950/40 border border-white/5">
                        <p class="text-[10px] uppercase tracking-widest text-slate-600">Username</p>
                        <p id="profileUsername" class="font-mono text-sm text-cyan-300 mt-1"></p>
                    </div>

                    <form id="profileEditForm" class="mt-5 space-y-4">
                        <div>
                            <label class="text-xs text-slate-400">Nama</label>
                            <input id="profileFullName" class="mt-1 w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-700 text-white outline-none focus:border-techCyan/50">
                        </div>
                        <div>
                            <label class="text-xs text-slate-400">Quote</label>
                            <input id="profileQuote" class="mt-1 w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-700 text-white outline-none focus:border-techCyan/50">
                        </div>
                        <div>
                            <label class="text-xs text-slate-400">Bio</label>
                            <textarea id="profileBio" rows="3" class="mt-1 w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-700 text-white outline-none focus:border-techCyan/50 resize-none"></textarea>
                        </div>
                        <div class="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label class="text-xs text-slate-400">Hobi</label>
                                <input id="profileHobby" class="mt-1 w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-700 text-white outline-none focus:border-techCyan/50">
                            </div>
                            <div>
                                <label class="text-xs text-slate-400">Mata Pelajaran Favorit</label>
                                <input id="profileSubject" class="mt-1 w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-700 text-white outline-none focus:border-techCyan/50">
                            </div>
                        </div>
                        <div>
                            <label class="text-xs text-slate-400">Instagram</label>
                            <input id="profileInstagram" placeholder="@username atau URL" class="mt-1 w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-700 text-white outline-none focus:border-techCyan/50">
                        </div>

                        <p id="profileSaveStatus" class="text-xs min-h-5 text-center"></p>

                        <div class="flex flex-col sm:flex-row gap-3 pt-2">
                            <button type="submit" class="flex-1 py-3 rounded-xl bg-white text-slate-950 font-black hover:bg-cyan-100 transition">Simpan perubahan</button>
                            <button type="button" id="profileLogout" class="px-5 py-3 rounded-xl border border-red-500/20 text-red-300 hover:bg-red-500/10 transition">Logout</button>
                        </div>

                        <a id="adminControlLink" href="admin.html" class="hidden items-center justify-center gap-2 w-full py-3 rounded-xl border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 transition text-sm font-semibold">
                            <i data-lucide="shield-check" class="w-4 h-4"></i> Buka Control Panel
                        </a>
                    </form>
                </div>
            </div>`;
        document.body.appendChild(modal);

        document.getElementById('closeProfileModal').onclick = () => closeMemberProfile();
        document.getElementById('profileLogout').onclick = async () => {
            await window.supabaseClient.auth.signOut();
            sessionStorage.clear();
            location.href = 'index.html';
        };

        document.getElementById('profileEditForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            const status = document.getElementById('profileSaveStatus');
            status.className = 'text-xs min-h-5 text-center text-slate-400';
            status.textContent = 'Menyimpan...';

            try {
                const { error } = await window.supabaseClient
                    .from('profiles')
                    .update({
                        full_name: document.getElementById('profileFullName').value.trim(),
                        quote: document.getElementById('profileQuote').value.trim(),
                        bio: document.getElementById('profileBio').value.trim(),
                        hobby: document.getElementById('profileHobby').value.trim(),
                        favourite_subject: document.getElementById('profileSubject').value.trim(),
                        instagram: document.getElementById('profileInstagram').value.trim()
                    })
                    .eq('id', profile.id);

                if (error) throw error;

                status.className = 'text-xs min-h-5 text-center text-emerald-400';
                status.textContent = 'Profil berhasil diperbarui.';
                document.getElementById('profileDisplayName').textContent = document.getElementById('profileFullName').value.trim();
            } catch (error) {
                status.className = 'text-xs min-h-5 text-center text-red-400';
                status.textContent = error.message || 'Gagal menyimpan profil.';
            }
        });
    }

    document.getElementById('profileAvatar').textContent = getInitials(profile.full_name || profile.username);
    document.getElementById('profileDisplayName').textContent = profile.full_name || 'Member';
    document.getElementById('profileDisplayRole').textContent = profile.role === 'super_admin' ? 'SUPER ADMIN · XI.B1' : 'STUDENT · XI.B1';
    document.getElementById('profileUsername').textContent = '@' + profile.username;
    document.getElementById('profileFullName').value = profile.full_name || '';
    document.getElementById('profileQuote').value = profile.quote || '';
    document.getElementById('profileBio').value = profile.bio || '';
    document.getElementById('profileHobby').value = profile.hobby || '';
    document.getElementById('profileSubject').value = profile.favourite_subject || '';
    document.getElementById('profileInstagram').value = profile.instagram || '';

    const adminLink = document.getElementById('adminControlLink');
    adminLink.classList.toggle('hidden', profile.role !== 'super_admin');
    adminLink.classList.toggle('flex', profile.role === 'super_admin');

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.classList.add('overflow-hidden');
    lucide.createIcons();
}

function closeMemberProfile() {
    const modal = document.getElementById('memberProfileModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
}

window.closeMemberProfile = closeMemberProfile;

lucide.createIcons();

const students = [
    { id: 1, name: "Khafi", fullName: "Ashabul Khafi", role: "Siswa XI.B1", quote: "carpe diem, seize the day make your life extraordinary", ig: "#" },
    { id: 2, name: "Arjasena", fullName: "Satria Arjasena Maulana", role: "Siswa XI.B1", quote: "If it's meant for you, it will find it's way to you.", ig: "#" },
    { id: 3, name: "Orlen", fullName: "Danendra Orlen Wasatha", role: "Siswa XI.B1", quote: "Simply lovely", ig: "#" },
    { id: 4, name: "Avisha", fullName: "Avisha Fakhiran Anwar", role: "Siswa XI.B1", quote: "be urself until u grow up", ig: "#" },
    { id: 5, name: "Fareal", fullName: "Fareal Julyans Zalfine", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 6, name: "Andrian", fullName: "Andrian Pranata Tambunan", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 7, name: "Sadam", fullName: "Sadam Al Fahri", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 8, name: "Wisnu", fullName: "Wisnu Panji Pratama", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 9, name: "Tania", fullName: "Tania Fitri Izati", role: "Siswa XI.B1", quote: "doing what you love is freedom, loving what you do is happiness", ig: "#" },
    { id: 10, name: "Jauharah", fullName: "Jauharah Tuhfah", role: "Siswa XI.B1", quote: "relax diva, you're going to be a engineer", ig: "#" },
    { id: 11, name: "Keyla", fullName: "Keyla Ajeng Firmansyah", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 12, name: "Mikaela", fullName: "Mikaela Leona", role: "Siswa XI.B1", quote: "if you love someone, let them know", ig: "#" },
    { id: 13, name: "Ridho", fullName: "Ridho Saputra Ependi", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 14, name: "Rizky", fullName: "Rizky Dwi Saputra Hidayat", role: "Siswa XI.B1", quote: "1 2 3 letsgow", ig: "#" },
    { id: 15, name: "Zyella", fullName: "Zyella Almaira Sigit", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 16, name: "Nishar", fullName: "Nishar Soma Maulana", role: "Siswa XI.B1", quote: "go go go power rangers", ig: "#" },
    { id: 17, name: "Alvian", fullName: "Alvian Arkan Iniesta", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 18, name: "Brella", fullName: "Brela Terta Zafina", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 19, name: "Fathian", fullName: "Fathian Khairul Akbar", role: "Siswa XI.B1", quote: "there's nothing you can't do if you try", ig: "#" },
    { id: 20, name: "Reno", fullName: "Reno Ramzi Nararya", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 21, name: "Lutfan", fullName: "Lutfan Attaullah Sultoni", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 22, name: "Rafif", fullName: "Ahmad Rafif Hidayat", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 23, name: "Kevin", fullName: "Kevin Habiyal Huda", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 24, name: "Arya", fullName: "Arya Pratama", role: "Siswa XI.B1", quote: "i'm back to come", ig: "#" },
    { id: 25, name: "Al Mira", fullName: "Al Mira Berlian Handayani", role: "Siswa XI.B1", quote: "you never fail until you stop trying", ig: "#" },
    { id: 26, name: "Elang", fullName: "Elang Bari Dermawan", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 27, name: "Dzaky", fullName: "Muhammad Dzaky Pradana", role: "Siswa XI.B1", quote: "No excuses. Just results", ig: "#" },
    { id: 28, name: "Aisahra", fullName: "Aisahra Mayjasti Aulia Putri", role: "Siswa XI.B1", quote: "dare to dream dare to achieve", ig: "#" },
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
    { id: 48, name: "Meli", fullName: "Meli Anggraeni", role: "Siswa XI.B1", quote: "Be careful who you trust; even shadows disappear in the dark", ig: "#" },
    { id: 49, name: "Gibran", fullName: "Gibran Ayatullah", role: "Siswa XI.B1", quote: "XI.B1", ig: "#" },
    { id: 50, name: "Salsabila", fullName: "Salsabil Fajrianita", role: "Siswa XI.B1", quote: "Ready or not ready, kudu ready", ig: "#" },
];

const studentGrid = document.getElementById('studentGrid');
const studentSearch = document.getElementById('studentSearch');
const studentSearchInfo = document.getElementById('studentSearchInfo');

function renderStudents(query = '') {
    const keyword = query.trim().toLowerCase();
    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(keyword) ||
        s.fullName.toLowerCase().includes(keyword)
    );

    studentGrid.innerHTML = filtered.map(s => `
        <div class="student-card p-4 rounded-xl bg-techCard border border-slate-800 hover:border-techCyan/50 cursor-pointer text-center transition transform hover:-translate-y-1">
            <h4 class="text-sm font-semibold text-slate-200 py-4">${s.name}</h4>
        </div>
    `).join('');

    studentGrid.querySelectorAll('.student-card').forEach((card, index) => {
        card.addEventListener('click', () => openModal(filtered[index]));
    });

    studentSearchInfo.innerText = keyword
        ? `${filtered.length} dari ${students.length} siswa ditemukan`
        : `${students.length} siswa terdaftar`;
}

renderStudents();
studentSearch.addEventListener('input', e => renderStudents(e.target.value));

const positions = {
    "Daffa": "Ketua Kelas",
    "Rifqi": "Wakil Ketua",
    "Keyla": "Sekretaris",
    "Al Mira": "Sekretaris",
    "Alvian": "Bendahara",
    "Brella": "Bendahara"
};

let dayByStudent = {};

function getInitials(name) {
    return name
        .split(' ')
        .filter(Boolean)
        .map(part => part[0])
        .join('')
        .slice(0, 3)
        .toUpperCase();
}

function openModal(student) {
    document.getElementById('modalAvatar').innerText = getInitials(student.fullName || student.name);
    document.getElementById('modalId').innerText = `MEMBER #${String(student.id).padStart(2, '0')}`;
    document.getElementById('modalName').innerText = student.fullName || student.name;
    document.getElementById('modalRole').innerText = student.role;
    document.getElementById('modalPosition').innerText = positions[student.name] || 'Siswa';
    document.getElementById('modalDuty').innerText = dayByStudent[student.name] || 'Belum ditentukan';
    document.getElementById('modalQuote').innerText = `"${student.quote}"`;
    document.getElementById('modalIg').href = student.ig;
    document.getElementById('studentModal').classList.remove('hidden');
    lucide.createIcons();
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

Object.entries(schedules).forEach(([day, data]) => {
    data.piket.forEach(name => {
        dayByStudent[name] = day;
    });
});

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

const announcements = [
    {
        date: '22 September 2026',
        type: 'Informasi',
        title: 'Ujian Tengah Semester Dimulai',
        description: 'Jangan lupa belajar dan persiapkan laptop/alat tulis kalian dengan baik!'
    }
];

function renderAnnouncements() {
    const container = document.getElementById('announcementList');
    container.innerHTML = announcements.map(item => `
        <article class="p-6 rounded-2xl bg-gradient-to-r from-techCard to-slate-800 border-l-4 border-techCyan">
            <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs text-techCyan font-mono">${item.date}</span>
                <span class="px-2 py-1 rounded-full bg-cyan-950 text-techCyan border border-techCyan/20 text-[10px] uppercase tracking-wider">${item.type}</span>
            </div>
            <h3 class="text-lg font-bold mt-2">${item.title}</h3>
            <p class="text-slate-300 text-sm mt-2">${item.description}</p>
        </article>
    `).join('');
}

function renderTimeline() {
    const container = document.getElementById('timelineList');
    container.innerHTML = announcements.map((item, index) => `
        <div class="relative pl-8 ${index < announcements.length - 1 ? 'pb-6' : ''}">
            ${index < announcements.length - 1 ? '<div class="absolute left-2 top-4 bottom-0 w-px bg-cyan-500/20"></div>' : ''}
            <div class="absolute left-0 top-1 w-5 h-5 rounded-full bg-techDark border-2 border-techCyan"></div>
            <div class="p-5 rounded-xl bg-techCard border border-slate-800">
                <span class="text-xs text-techCyan font-mono">${item.date}</span>
                <h4 class="font-bold mt-1">${item.title}</h4>
                <p class="text-sm text-slate-400 mt-1">${item.description}</p>
            </div>
        </div>
    `).join('');
}

renderAnnouncements();
renderTimeline();

function getTodayKey() {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[new Date().getDay()];
}

function getNextSchoolDay() {
    const order = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    const today = getTodayKey();
    if (order.includes(today)) return today;
    return today === 'Sabtu' ? 'Senin' : 'Senin';
}

function renderToday() {
    const today = getNextSchoolDay();
    const data = schedules[today];
    const now = new Date();

    document.getElementById('todayTitle').innerText =
        getTodayKey() === today ? `Jadwal ${today}` : `Jadwal ${today} (Hari Sekolah Berikutnya)`;

    document.getElementById('todayDate').innerText = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    document.getElementById('todayLessons').innerHTML = data.mapel.map((item, index) => `
        <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
            <span class="w-8 h-8 rounded-lg bg-cyan-950 text-techCyan flex items-center justify-center text-xs font-bold">${index + 1}</span>
            <span class="text-sm font-medium text-slate-200">${item}</span>
        </div>
    `).join('');

    document.getElementById('todayPiketCount').innerText = data.piket.length;
    document.getElementById('todayPiket').innerHTML = data.piket.map(name => `
        <span class="px-2.5 py-1 rounded-full bg-cyan-950 text-techCyan border border-techCyan/30 text-xs">${name}</span>
    `).join('');

    lucide.createIcons();
}

renderToday();

const classStats = document.getElementById('classStats');
const totalLessons = Object.values(schedules).reduce((total, day) => total + day.mapel.length, 0);
classStats.innerHTML = [
    { value: students.length, label: 'Siswa', icon: 'users' },
    { value: Object.keys(schedules).length, label: 'Hari Sekolah', icon: 'calendar-days' },
    { value: totalLessons, label: 'Sesi Mapel / Minggu', icon: 'book-open' },
    { value: 'XI.B1', label: 'Kelas', icon: 'cpu' }
].map(stat => `
    <div class="p-5 rounded-2xl bg-techCard border border-cyan-500/20 text-center">
        <i data-lucide="${stat.icon}" class="w-5 h-5 mx-auto mb-2 text-techCyan"></i>
        <div class="text-2xl font-extrabold text-white">${stat.value}</div>
        <p class="text-xs text-slate-400 mt-1">${stat.label}</p>
    </div>
`).join('');

const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuIcon = document.getElementById('mobileMenuIcon');

mobileMenuToggle.addEventListener('click', () => {
    const isHidden = mobileMenu.classList.toggle('hidden');
    mobileMenuIcon.setAttribute('data-lucide', isHidden ? 'menu' : 'x');
    mobileMenuToggle.setAttribute('aria-label', isHidden ? 'Buka menu' : 'Tutup menu');
    lucide.createIcons();
});

document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenuIcon.setAttribute('data-lucide', 'menu');
        lucide.createIcons();
    });
});

lucide.createIcons();

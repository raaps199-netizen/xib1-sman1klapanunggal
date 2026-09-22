/*
 * XI.B1 AUTH
 * GitHub JSON database + browser session.
 */

const ACCOUNTS_URL = 'data/accounts.json';

async function loadAccounts() {
    const response = await fetch(ACCOUNTS_URL + '?v=' + Date.now(), { cache: 'no-store' });
    if (!response.ok) throw new Error('Database akun tidak dapat dimuat.');
    const data = await response.json();
    return Array.isArray(data.members) ? data.members : [];
}

async function hashPassword(value) {
    const bytes = new TextEncoder().encode(value);
    const buffer = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(buffer)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function getStoredProfile() {
    try {
        return JSON.parse(sessionStorage.getItem('bionestSession') || 'null');
    } catch {
        return null;
    }
}

function saveStoredProfile(profile) {
    sessionStorage.setItem('bionestSession', JSON.stringify(profile));
    sessionStorage.setItem('bionestRole', profile.role);
    sessionStorage.setItem('bionestAccess', 'member');
}

function buildSession(profile) {
    return { user: { id: profile.username, email: profile.username + '@bionest.local' } };
}

async function loginWithUsername(username, password) {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) throw new Error('Username wajib diisi.');

    const accounts = await loadAccounts();
    const account = accounts.find(item => item.username === cleanUsername);
    if (!account) throw new Error('Username atau password salah.');

    const passwordHash = await hashPassword(password);
    if (passwordHash !== account.password_sha256) {
        throw new Error('Username atau password salah.');
    }

    const profile = { ...account };
    sessionStorage.setItem('bionestAuthHash', account.password_sha256);
    delete profile.password_sha256;
    saveStoredProfile(profile);
    return profile;
}

window.supabaseClient = {
    auth: {
        async getSession() {
            const profile = getStoredProfile();
            return { data: { session: profile ? buildSession(profile) : null }, error: null };
        },
        async signOut() {
            sessionStorage.clear();
            return { error: null };
        }
    },
    from(table) {
        if (table !== 'profiles') throw new Error('Table tidak dikenal.');

        let mode = 'select';
        let updateData = null;
        let filters = {};

        const query = {
            select() {
                mode = 'select';
                return query;
            },
            update(data) {
                mode = 'update';
                updateData = data || {};
                return query;
            },
            eq(field, value) {
                filters[field] = value;
                return query;
            },
            maybeSingle: async () => {
                const profile = getStoredProfile();
                if (!profile || (filters.id && filters.id !== profile.username)) return { data: null, error: null };
                return { data: { ...profile }, error: null };
            },
            single: async () => {
                const profile = getStoredProfile();
                if (!profile || (filters.id && filters.id !== profile.username)) {
                    return { data: null, error: new Error('Profil tidak ditemukan.') };
                }
                return { data: { ...profile }, error: null };
            },
            order: async () => {
                const accounts = await loadAccounts();
                return { data: accounts.map(({ password_sha256, ...profile }) => profile), error: null };
            }
        };

        if (mode === 'update') {
            query.eq = (field, value) => {
                filters[field] = value;
                return {
                    then: async resolve => {
                        const current = getStoredProfile();
                        if (current && (!filters.id || filters.id === current.username)) {
                            const updated = { ...current, ...updateData };
                            saveStoredProfile(updated);
                        }
                        return resolve({ data: getStoredProfile(), error: null });
                    }
                };
            };
        }

        return query;
    }
};

async function updateProfile(updates) {
    const profile = getStoredProfile();
    const password_sha256 = sessionStorage.getItem('bionestAuthHash');
    if (!profile || !password_sha256) throw new Error('Sesi login sudah tidak valid.');

    const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: profile.username,
            password_sha256,
            updates
        })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Gagal menyimpan profil.');

    saveStoredProfile({ ...profile, ...result.profile });
    return result.profile;
}

window.updateProfile = updateProfile;

const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const button = document.getElementById('loginBtn');
        const status = document.getElementById('loginStatus');

        button.disabled = true;
        button.classList.add('opacity-60');
        status.className = 'text-xs text-center min-h-5 pt-1 text-slate-400';
        status.textContent = 'Memeriksa akun...';

        try {
            const profile = await loginWithUsername(
                document.getElementById('username').value,
                document.getElementById('password').value
            );

            sessionStorage.setItem('bionestRole', profile.role);
            window.location.href = 'index.html';
        } catch (error) {
            status.className = 'text-xs text-center min-h-5 pt-1 text-red-400';
            status.textContent = error.message || 'Login gagal.';
        } finally {
            button.disabled = false;
            button.classList.remove('opacity-60');
        }
    });
}

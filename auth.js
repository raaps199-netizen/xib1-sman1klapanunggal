/*
 * XI.B1 AUTH
 * Supabase Auth + public profiles.
 *
 * IMPORTANT: put only the Supabase Publishable Key here.
 * Never put a service_role/secret key in the frontend.
 */

const SUPABASE_URL = 'https://jszzaqnggaatrgyiksfs.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_2ZluJ_DxgGzsA2pFZmxrzQ_X9vF897m';

window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

async function loginWithUsername(username, password) {
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername) throw new Error('Username wajib diisi.');

    // Auth accounts are provisioned with this internal email convention.
    const authEmail = cleanUsername + '@bionest.local';

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: authEmail,
        password
    });

    if (error) throw new Error('Username atau password salah.');

    const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('id, username, role, full_name, quote')
        .eq('id', data.user.id)
        .single();

    if (profileError || !profile) {
        await supabaseClient.auth.signOut();
        throw new Error('Profil akun belum terdaftar.');
    }

    if (profile.username !== cleanUsername) {
        await supabaseClient.auth.signOut();
        throw new Error('Akun tidak valid.');
    }

    return profile;
}

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

/*
 * XI.B1 AUTH
 * Backend: Supabase Auth + profiles table.
 *
 * Isi dua nilai ini setelah membuat project Supabase:
 * 1. SUPABASE_URL
 * 2. SUPABASE_ANON_KEY
 *
 * Jangan pernah menaruh service_role key di frontend.
 */

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loginWithUsername(username, password) {
    const cleanUsername = username.trim().toLowerCase();

    const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('id, username, role, full_name')
        .eq('username', cleanUsername)
        .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) throw new Error('Username atau password salah.');

    // Supabase Auth uses an internal email identity.
    const authEmail = profile.id + '@bionest.local';

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: authEmail,
        password
    });

    if (error) throw new Error('Username atau password salah.');

    if (data.user?.id !== profile.id) {
        await supabaseClient.auth.signOut();
        throw new Error('Akun tidak valid.');
    }

    return profile;
}

document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const button = document.getElementById('loginBtn');
    const status = document.getElementById('loginStatus');
    button.disabled = true;
    button.classList.add('opacity-60');
    status.className = 'text-xs text-center min-h-5 text-slate-400';
    status.textContent = 'Memeriksa akun...';

    try {
        const profile = await loginWithUsername(
            document.getElementById('username').value,
            document.getElementById('password').value
        );

        sessionStorage.setItem('bionestRole', profile.role);

        if (profile.role === 'super_admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        status.className = 'text-xs text-center min-h-5 text-red-400';
        status.textContent = error.message || 'Login gagal.';
    } finally {
        button.disabled = false;
        button.classList.remove('opacity-60');
    }
});

lucide.createIcons();

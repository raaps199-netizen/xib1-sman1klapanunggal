-- XI.B1 BIONEST ONE - SUPABASE DATABASE
-- Jalankan di Supabase SQL Editor.
-- Password TIDAK disimpan di database aplikasi. Password ditangani Supabase Auth.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    username text unique not null,
    full_name text not null,
    role text not null default 'student'
        check (role in ('student', 'super_admin')),
    quote text default 'XI.B1',
    bio text default '',
    instagram text default '',
    avatar_url text default '',
    hobby text default '',
    favourite_subject text default '',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles(username);
create index if not exists profiles_role_idx on public.profiles(role);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and role = 'super_admin'
    );
$$;

alter table public.profiles enable row level security;

drop policy if exists "Public can view basic profiles" on public.profiles;
create policy "Public can view basic profiles"
on public.profiles for select
to anon, authenticated
using (true);

drop policy if exists "Student can update own profile" on public.profiles;
create policy "Student can update own profile"
on public.profiles for update
to authenticated
using (id = auth.uid() and role = 'student')
with check (id = auth.uid() and role = 'student');

drop policy if exists "Super admin can update profiles" on public.profiles;
create policy "Super admin can update profiles"
on public.profiles for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "Super admin can insert profiles" on public.profiles;
create policy "Super admin can insert profiles"
on public.profiles for insert
to authenticated
with check (public.is_super_admin());

drop policy if exists "Super admin can delete profiles" on public.profiles;
create policy "Super admin can delete profiles"
on public.profiles for delete
to authenticated
using (public.is_super_admin());

-- Roster XI.B1.
-- Baris ini adalah data kelas, bukan password/login credential.
insert into public.profiles (id, username, full_name, role, quote)
select
    gen_random_uuid(),
    v.username,
    v.full_name,
    'student',
    v.quote
from (values
('khafi','Ashabul Khafi','carpe diem, seize the day make your life extraordinary'),
('arjasena','Satria Arjasena Maulana','If it''s meant for you, it will find it''s way to you.'),
('orlen','Danendra Orlen Wasatha','Simply lovely'),
('avisha','Avisha Fakhiran Anwar','be urself until u grow up'),
('fareal','Fareal Julyans Zalfine','XI.B1'),
('andrian','Andrian Pranata Tambunan','XI.B1'),
('sadam','Sadam Al Fahri','XI.B1'),
('wisnu','Wisnu Panji Pratama','XI.B1'),
('tania','Tania Fitri Izati','doing what you love is freedom, loving what you do is happiness'),
('jauharah','Jauharah Tuhfah','relax diva, you''re going to be a engineer'),
('keyla','Keyla Ajeng Firmansyah','XI.B1'),
('mikaela','Mikaela Leona','if you love someone, let them know'),
('ridho','Ridho Saputra Ependi','XI.B1'),
('rizky','Rizky Dwi Saputra Hidayat','1 2 3 letsgow'),
('zyella','Zyella Almaira Sigit','XI.B1'),
('nishar','Nishar Soma Maulana','go go go power rangers'),
('alvian','Alvian Arkan Iniesta','XI.B1'),
('brella','Brela Terta Zafina','XI.B1'),
('fathian','Fathian Khairul Akbar','there''s nothing you can''t do if you try'),
('reno','Reno Ramzi Nararya','XI.B1'),
('lutfan','Lutfan Attaullah Sultoni','XI.B1'),
('rafif','Ahmad Rafif Hidayat','XI.B1'),
('kevin','Kevin Habiyal Huda','XI.B1'),
('arya','Arya Pratama','i''m back to come'),
('almira','Al Mira Berlian Handayani','you never fail until you stop trying'),
('elang','Elang Bari Dermawan','XI.B1'),
('dzaky','Muhammad Dzaky Pradana','No excuses. Just results'),
('aisahra','Aisahra Mayjasti Aulia Putri','dare to dream dare to achieve'),
('satria','Satria Putra Pratama','XI.B1'),
('putri','Putri Aulia','calm is power. i choose peace over chaos'),
('fahri','Muhammad Fahri Maulana','XI.B1'),
('rifqi','Rifqi Binangkit','XI.B1'),
('fadhil','Askha Fadhil Raihan Adinomo','XI.B1'),
('yusuf','Harazaki Yusuf Rahardjo Telaumbanua','I''ll be myself'),
('kirana','Kirana Intan Permata','Be proud of how far you''ve come'),
('effan','Effan Zandra Arya Putra','You''re the most important person in your life'),
('dzaki','Dzakii Nizaar Akmal','XI.B1'),
('aura','Aura Rizky Triyastuti','XI.B1'),
('reva','Reva Amalia Achmad','XI.B1'),
('surya','Surya Melano','Wong liyo ngerti opo'),
('dhirgam','Dhirgam Nawi Hasib Dhiya Ul''Haq','XI.B1'),
('yoga','Yoga Rizki Ramadhan','The death of democracy is the death of the people''s will.'),
('dude','Dude Ramadhan','XI.B1'),
('daffa','M. Daffa Azalia','Be what you wanna be'),
('irfan','Irfan Asyraf Musyaffa','silence is better explaining'),
('ara','Ara Ananda Putri','be your own light'),
('anissa','Annisa Zahra','XI.B1'),
('meli','Meli Anggraeni','Be careful who you trust; even shadows disappear in the dark'),
('gibran','Gibran Ayatullah','XI.B1'),
('salsabila','Salsabil Fajrianita','Ready or not ready, kudu ready')
) as v(username, full_name, quote)
where not exists (
    select 1 from public.profiles p where p.username = v.username
);

-- Setelah akun Auth dibuat, UPDATE id profile agar sama dengan auth.users.id.
-- Jangan pernah menyimpan password plaintext di tabel profiles.

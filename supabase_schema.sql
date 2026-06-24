create extension if not exists pgcrypto;

-- =========================================================================
-- Helper Function: Auto Update updated_at
-- =========================================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
new.updated_at = now();
return new;
end;
$$ language plpgsql;

-- =========================================================================
-- Profiles
-- =========================================================================
create table public.profiles (
id uuid references auth.users on delete cascade primary key,
email text not null,
display_name text,
avatar_url text,
streak_count integer default 0 not null,
created_at timestamptz default now() not null,
updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = id);

create policy "Users can insert their own profile"
on public.profiles
for insert
with check (auth.uid() = id);

drop trigger if exists profiles_updated_at on public.profiles;

create trigger profiles_updated_at
before update on public.profiles
for each row
execute procedure public.update_updated_at();

-- =========================================================================
-- Auto Create Profile on Signup
-- =========================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
insert into public.profiles (
id,
email,
display_name,
avatar_url
)
values (
new.id,
new.email,
coalesce(
new.raw_user_meta_data->>'full_name',
new.raw_user_meta_data->>'display_name',
split_part(new.email, '@', 1)
),
new.raw_user_meta_data->>'avatar_url'
);

return new;
end;
$$ language plpgsql security definer
set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

-- =========================================================================
-- User Question Progress
-- =========================================================================
create table public.user_questions (
id uuid default gen_random_uuid() primary key,

user_id uuid references public.profiles(id)
on delete cascade
not null,

question_id text not null,
pattern text not null,

difficulty text
check (difficulty in ('easy', 'medium', 'hard'))
not null,

status text
check (status in ('not-started', 'in-progress', 'completed'))
default 'not-started'
not null,

last_step integer default 0 not null,

attempt_count integer default 0 not null,

completed_at timestamptz,

last_attempted_at timestamptz
default now()
not null,

unique(user_id, question_id)
);

alter table public.user_questions enable row level security;

create policy "Users can view their own progress"
on public.user_questions
for select
using (auth.uid() = user_id);

create policy "Users can insert their own progress"
on public.user_questions
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own progress"
on public.user_questions
for update
using (auth.uid() = user_id);

create policy "Users can delete their own progress"
on public.user_questions
for delete
using (auth.uid() = user_id);

create index idx_user_questions_user
on public.user_questions(user_id);

create index idx_user_questions_pattern
on public.user_questions(pattern);

create index idx_user_questions_user_status
on public.user_questions(user_id, status);

-- =========================================================================
-- Bookmarks
-- =========================================================================
create table public.bookmarks (
id uuid default gen_random_uuid() primary key,

user_id uuid references public.profiles(id)
on delete cascade
not null,

question_id text not null,

created_at timestamptz default now() not null,

unique(user_id, question_id)
);

alter table public.bookmarks enable row level security;

create policy "Users can view their own bookmarks"
on public.bookmarks
for select
using (auth.uid() = user_id);

create policy "Users can insert their own bookmarks"
on public.bookmarks
for insert
with check (auth.uid() = user_id);

create policy "Users can delete their own bookmarks"
on public.bookmarks
for delete
using (auth.uid() = user_id);

create index idx_bookmarks_user
on public.bookmarks(user_id);

-- =========================================================================
-- Saved Snippets
-- =========================================================================
create table public.saved_snippets (
id uuid default gen_random_uuid() primary key,

user_id uuid references public.profiles(id)
on delete cascade
not null,

question_id text,

title text default 'Untitled Simulation' not null,

code text not null,

input_params jsonb,

created_at timestamptz default now() not null,

updated_at timestamptz default now() not null
);

alter table public.saved_snippets enable row level security;

create policy "Users can view their own snippets"
on public.saved_snippets
for select
using (auth.uid() = user_id);

create policy "Users can insert their own snippets"
on public.saved_snippets
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own snippets"
on public.saved_snippets
for update
using (auth.uid() = user_id);

create policy "Users can delete their own snippets"
on public.saved_snippets
for delete
using (auth.uid() = user_id);

create index idx_saved_snippets_user
on public.saved_snippets(user_id);

drop trigger if exists saved_snippets_updated_at
on public.saved_snippets;

create trigger saved_snippets_updated_at
before update on public.saved_snippets
for each row
execute procedure public.update_updated_at();

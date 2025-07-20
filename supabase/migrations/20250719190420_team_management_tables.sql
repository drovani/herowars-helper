-- Create player_team table for user team management
create table public.player_team (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    description text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create player_team_hero table for team hero assignments
create table public.player_team_hero (
    id uuid primary key default gen_random_uuid(),
    team_id uuid not null references public.player_team(id) on delete cascade,
    hero_slug text not null references public.hero(slug) on delete cascade,
    created_at timestamptz default now(),
    
    -- Ensure unique hero per team (no duplicates)
    unique(team_id, hero_slug)
);

-- Create indexes for performance
create index idx_player_team_user_id on public.player_team(user_id);
create index idx_player_team_hero_team_id on public.player_team_hero(team_id);
create index idx_player_team_hero_hero_slug on public.player_team_hero(hero_slug);

-- Add trigger to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_player_team_updated_at
    before update on public.player_team
    for each row execute function update_updated_at_column();

-- Row Level Security (RLS) policies
alter table public.player_team enable row level security;
alter table public.player_team_hero enable row level security;

-- Users can only access their own teams
create policy "Users can view their own teams"
    on public.player_team for select
    using (auth.uid() = user_id);

create policy "Users can create their own teams"
    on public.player_team for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own teams"
    on public.player_team for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own teams"
    on public.player_team for delete
    using (auth.uid() = user_id);

-- Users can only access team heroes for their own teams
create policy "Users can view their own team heroes"
    on public.player_team_hero for select
    using (exists (
        select 1 from public.player_team pt 
        where pt.id = team_id and pt.user_id = auth.uid()
    ));

create policy "Users can add heroes to their own teams"
    on public.player_team_hero for insert
    with check (exists (
        select 1 from public.player_team pt 
        where pt.id = team_id and pt.user_id = auth.uid()
    ));

create policy "Users can update heroes in their own teams"
    on public.player_team_hero for update
    using (exists (
        select 1 from public.player_team pt 
        where pt.id = team_id and pt.user_id = auth.uid()
    ));

create policy "Users can remove heroes from their own teams"
    on public.player_team_hero for delete
    using (exists (
        select 1 from public.player_team pt 
        where pt.id = team_id and pt.user_id = auth.uid()
    ));
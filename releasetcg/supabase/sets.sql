-- Card sets for the project.
-- Run this once in the Supabase dashboard: SQL Editor > New query > paste > Run.
-- It is safe to run again.

-- 1. A table that lists every set. The app keeps the same list in
--    src/lib/sets/sets.ts; the CSV importer adds a set's row here for you.
create table if not exists public.sets (
  code        text primary key check (code ~ '^[A-Z0-9]{2,8}$'),
  number      integer not null unique check (number > 0),
  name        text not null,
  card_count  integer not null check (card_count > 0),
  created_at  timestamptz not null default now()
);

alter table public.sets enable row level security;

drop policy if exists "Anyone can read sets" on public.sets;
create policy "Anyone can read sets"
  on public.sets for select
  using (true);

-- Admins (users.role = 'admin') can add and edit sets.
drop policy if exists "Admins can manage sets" on public.sets;
create policy "Admins can manage sets"
  on public.sets for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- 2. The sets you have today.
insert into public.sets (code, number, name, card_count)
values ('IRFO', 1, 'Iridescent Foray', 81)
on conflict (code) do update
  set number = excluded.number,
      name = excluded.name,
      card_count = excluded.card_count;

-- 3. Which cards use a set tag that isn't in the table? This should return
--    no rows. If it returns rows, fix those cards' SetName (or add the set
--    above) before running step 4.
select id, "Name", "SetName"
from public.cards
where "SetName" is not null
  and "SetName" not in (select code from public.sets);

-- 4. From now on a card's SetName must be a real set. NOT VALID means
--    "enforce this for new and edited cards"; the second line then checks
--    the cards that are already there.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'cards_setname_fkey'
  ) then
    alter table public.cards
      add constraint cards_setname_fkey
      foreign key ("SetName") references public.sets (code)
      on update cascade
      not valid;
  end if;
end $$;

alter table public.cards validate constraint cards_setname_fkey;

-- 5. Optional but recommended: a card number can only be used once per set.
--    First check there are no repeats (should return no rows):
select "SetName", "CardNumber", count(*)
from public.cards
where "SetName" is not null and "CardNumber" is not null
group by 1, 2
having count(*) > 1;

--    If that returned nothing, run this:
-- create unique index if not exists cards_set_number_key
--   on public.cards ("SetName", "CardNumber")
--   where "SetName" is not null and "CardNumber" is not null;

-- ---------------------------------------------------------------------------
-- Handy afterwards
-- ---------------------------------------------------------------------------
-- Add a set by hand (the importer does this for you):
--   insert into public.sets (code, number, name, card_count)
--   values ('XXXX', 2, 'Set Name', 81);
--
-- Publish every card of a set so it shows in the Gallery:
--   update public.cards set pool = 'public' where "SetName" = 'XXXX';

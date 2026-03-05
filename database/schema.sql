-- PostgreSQL schema for gift reservation site
-- Run with: psql -d <database_name> -f database/schema.sql

begin;

create table if not exists gift_items (
  id text primary key,
  category_id text not null,
  name text not null,
  description text,
  image_url text,
  is_reserved boolean not null default false,
  reserved_by text,
  reserved_device_token text,
  reserved_pin_hash text,
  reserved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reservation_events (
  event_id bigserial primary key,
  item_id text not null references gift_items(id) on delete cascade,
  action text not null check (action in ('reserve', 'release')),
  actor_name text,
  created_at timestamptz not null default now()
);

create index if not exists idx_gift_items_category_id on gift_items(category_id);
create index if not exists idx_gift_items_is_reserved on gift_items(is_reserved);
create index if not exists idx_reservation_events_item_id on reservation_events(item_id);
alter table gift_items add column if not exists reserved_device_token text;
alter table gift_items add column if not exists reserved_pin_hash text;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_gift_items_updated_at on gift_items;
create trigger trg_gift_items_updated_at
before update on gift_items
for each row
execute function set_updated_at();

-- Safe reservation: only reserves if item is currently available.
create or replace function reserve_gift_item(
  p_item_id text,
  p_actor_name text default null,
  p_device_token text default null,
  p_pin_hash text default null
)
returns boolean
language plpgsql
as $$
declare
  v_actor_name text;
  v_device_token text;
  v_pin_hash text;
  v_rows integer;
begin
  v_actor_name := nullif(trim(p_actor_name), '');
  v_device_token := nullif(trim(p_device_token), '');
  v_pin_hash := nullif(trim(p_pin_hash), '');
  if v_actor_name is null then
    return false;
  end if;
  if v_device_token is null then
    return false;
  end if;
  if v_pin_hash is null then
    return false;
  end if;

  update gift_items
     set is_reserved = true,
         reserved_by = v_actor_name,
         reserved_device_token = v_device_token,
         reserved_pin_hash = v_pin_hash,
         reserved_at = now()
   where id = p_item_id
     and is_reserved = false;

  get diagnostics v_rows = row_count;

  if v_rows = 1 then
    insert into reservation_events(item_id, action, actor_name)
    values (p_item_id, 'reserve', v_actor_name);
    return true;
  end if;

  return false;
end;
$$;

-- Release reservation (admin/owner action in future backend rules)
create or replace function release_gift_item(
  p_item_id text,
  p_actor_name text default null,
  p_device_token text default null,
  p_pin_hash text default null
)
returns boolean
language plpgsql
as $$
declare
  v_actor_name text;
  v_device_token text;
  v_pin_hash text;
  v_rows integer;
begin
  v_actor_name := nullif(trim(p_actor_name), '');
  v_device_token := nullif(trim(p_device_token), '');
  v_pin_hash := nullif(trim(p_pin_hash), '');
  if v_actor_name is null then
    return false;
  end if;
  if v_device_token is null then
    return false;
  end if;

  update gift_items
     set is_reserved = false,
         reserved_by = null,
         reserved_device_token = null,
         reserved_pin_hash = null,
         reserved_at = null
   where id = p_item_id
     and is_reserved = true
     and (
       reserved_device_token = v_device_token
       or (
         v_pin_hash is not null
         and reserved_pin_hash = v_pin_hash
         and lower(coalesce(reserved_by, '')) = lower(v_actor_name)
       )
       or (
         reserved_device_token is null
         and lower(coalesce(reserved_by, '')) = lower(v_actor_name)
       )
     );

  get diagnostics v_rows = row_count;

  if v_rows = 1 then
    insert into reservation_events(item_id, action, actor_name)
    values (p_item_id, 'release', nullif(trim(p_actor_name), ''));
    return true;
  end if;

  return false;
end;
$$;

commit;

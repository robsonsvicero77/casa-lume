-- Execute no SQL Editor do Supabase depois de schema.sql e admin.sql.
-- Vincula o cadastro existente ao Supabase Auth e cria a wishlist privada por cliente.

alter table public.customers
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

create unique index if not exists customers_auth_user_id_key
  on public.customers(auth_user_id)
  where auth_user_id is not null;

-- Associa cadastros antigos somente a contas com email confirmado.
update public.customers c
set auth_user_id = u.id
from auth.users u
where c.auth_user_id is null
  and lower(c.email) = lower(u.email)
  and u.email_confirmed_at is not null;

drop policy if exists "Customers read own profile" on public.customers;
create policy "Customers read own profile"
  on public.customers for select to authenticated
  using (auth_user_id = (select auth.uid()));

create or replace function public.sync_customer_profile(p_full_name text, p_phone text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_email_confirmed_at timestamptz;
  v_customer_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select u.email, u.email_confirmed_at
    into v_email, v_email_confirmed_at
  from auth.users u
  where u.id = v_user_id;

  if v_email is null or v_email_confirmed_at is null then
    raise exception 'Confirme seu email antes de acessar a conta';
  end if;
  if length(trim(coalesce(p_full_name, ''))) not between 2 and 120 then
    raise exception 'Informe um nome entre 2 e 120 caracteres';
  end if;
  if length(coalesce(p_phone, '')) > 40 then
    raise exception 'O WhatsApp deve ter no máximo 40 caracteres';
  end if;

  select c.id into v_customer_id
  from public.customers c
  where c.auth_user_id = v_user_id
  for update;

  if v_customer_id is not null then
    update public.customers
    set full_name = trim(p_full_name),
        email = lower(v_email),
        phone = coalesce(trim(p_phone), '')
    where id = v_customer_id;
  else
    insert into public.customers (auth_user_id, full_name, email, phone)
    values (v_user_id, trim(p_full_name), lower(v_email), coalesce(trim(p_phone), ''))
    on conflict (email) do update
      set auth_user_id = excluded.auth_user_id,
          full_name = excluded.full_name,
          phone = excluded.phone
      where public.customers.auth_user_id is null
         or public.customers.auth_user_id = excluded.auth_user_id
    returning id into v_customer_id;

    if v_customer_id is null then
      raise exception 'Este email já está vinculado a outra conta';
    end if;
  end if;

  return v_customer_id;
end;
$$;

revoke all on function public.sync_customer_profile(text, text) from public;
grant execute on function public.sync_customer_profile(text, text) to authenticated;

create table if not exists public.customer_wishlist (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.customer_wishlist enable row level security;
revoke all on public.customer_wishlist from anon, authenticated;
grant select, insert, delete on public.customer_wishlist to authenticated;

drop policy if exists "Customers read own wishlist" on public.customer_wishlist;
create policy "Customers read own wishlist"
  on public.customer_wishlist for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Customers add to own wishlist" on public.customer_wishlist;
create policy "Customers add to own wishlist"
  on public.customer_wishlist for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Customers remove from own wishlist" on public.customer_wishlist;
create policy "Customers remove from own wishlist"
  on public.customer_wishlist for delete to authenticated
  using (user_id = (select auth.uid()));

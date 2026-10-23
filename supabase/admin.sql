-- Execute no SQL Editor do Supabase depois de schema.sql.
-- Usuários Auth precisam ser adicionados à tabela admin_users para receber acesso.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.admin_users add column if not exists email text;
alter table public.admin_users add column if not exists full_name text not null default '';
alter table public.admin_users add column if not exists is_active boolean not null default true;
update public.admin_users a set email=u.email from auth.users u where a.user_id=u.id and a.email is null;
alter table public.admin_users alter column email set not null;
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
grant select, insert, update, delete on public.admin_users to authenticated;

create or replace function public.is_active_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()) and is_active);
$$;
revoke all on function public.is_active_admin() from public;
grant execute on function public.is_active_admin() to authenticated;
grant execute on function public.is_active_admin() to anon;

drop policy if exists "Admins can read their own access" on public.admin_users;
create policy "Admins can read their own access" on public.admin_users
  for select to authenticated using (user_id = (select auth.uid()) or (select public.is_active_admin()));
drop policy if exists "Admins manage admin users" on public.admin_users;
create policy "Admins manage admin users" on public.admin_users for all to authenticated
  using ((select public.is_active_admin())) with check ((select public.is_active_admin()));

drop policy if exists "Anyone can read active products" on public.products;
create policy "Anyone can read active products" on public.products for select to anon, authenticated
  using (active = true or (select public.is_active_admin()));
drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products for all to authenticated
  using ((select public.is_active_admin())) with check ((select public.is_active_admin()));
grant select on public.products to anon,authenticated;
grant insert,update,delete on public.products to authenticated;

-- Imagens carregadas diretamente ao Storage privado para escrita administrativa.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public=true,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "Casa Lume public product images" on storage.objects;
create policy "Casa Lume public product images" on storage.objects for select to anon,authenticated using (bucket_id='product-images');
drop policy if exists "Casa Lume admins upload product images" on storage.objects;
create policy "Casa Lume admins upload product images" on storage.objects for insert to authenticated
  with check (bucket_id='product-images' and (select public.is_active_admin()));
drop policy if exists "Casa Lume admins update product images" on storage.objects;
create policy "Casa Lume admins update product images" on storage.objects for update to authenticated
  using (bucket_id='product-images' and (select public.is_active_admin()))
  with check (bucket_id='product-images' and (select public.is_active_admin()));
drop policy if exists "Casa Lume admins delete product images" on storage.objects;
create policy "Casa Lume admins delete product images" on storage.objects for delete to authenticated
  using (bucket_id='product-images' and (select public.is_active_admin()));

-- Clientes se cadastram com nome, email e WhatsApp; os dados ficam visíveis à administração.
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(), full_name text not null,
  email text not null unique, phone text not null default '',
  created_at timestamptz not null default now(), is_active boolean not null default true
);
alter table public.customers enable row level security;
grant insert on public.customers to anon,authenticated;
grant select,update on public.customers to authenticated;
drop policy if exists "Customers register" on public.customers;
create policy "Customers register" on public.customers for insert to anon,authenticated
  with check (length(trim(full_name)) between 2 and 120 and email ~* '^[^@]+@[^@]+\.[^@]+$' and length(phone) <= 40);
drop policy if exists "Admins manage customers" on public.customers;
create policy "Admins manage customers" on public.customers for all to authenticated
  using ((select public.is_active_admin())) with check ((select public.is_active_admin()));

alter table public.products add column if not exists stock integer not null default 0 check (stock >= 0);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(), customer_id uuid references public.customers(id) on delete set null,
  customer_name text not null, customer_email text not null, customer_phone text not null default '',
  total numeric(10,2) not null default 0 check(total>=0),
  status text not null default 'pending' check(status in ('pending','confirmed','shipped','completed','cancelled')),
  tracking_code text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
  product_id text references public.products(id) on delete set null, product_name text not null,
  price numeric(10,2) not null check(price>=0), quantity integer not null check(quantity>0)
);
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
grant select,update,insert,delete on public.orders,public.order_items to authenticated;
drop policy if exists "Admins manage orders" on public.orders;
create policy "Admins manage orders" on public.orders for all to authenticated
  using ((select public.is_active_admin())) with check ((select public.is_active_admin()));
drop policy if exists "Admins manage order items" on public.order_items;
create policy "Admins manage order items" on public.order_items for all to authenticated
  using ((select public.is_active_admin())) with check ((select public.is_active_admin()));

create or replace function public.cancel_order(p_order_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare item record;
begin
  if not public.is_active_admin() then raise exception 'Not authorized'; end if;
  perform 1 from public.orders where id=p_order_id and status <> 'cancelled' and status <> 'completed' for update;
  if not found then raise exception 'Order not found or cannot be cancelled'; end if;
  for item in select product_id,quantity from public.order_items where order_id=p_order_id and product_id is not null loop
    update public.products set stock=stock+item.quantity where id=item.product_id;
  end loop;
  update public.orders set status='cancelled',updated_at=now() where id=p_order_id;
end; $$;
revoke all on function public.cancel_order(uuid) from public;
grant execute on function public.cancel_order(uuid) to authenticated;

create or replace function public.create_admin_order(p_customer_id uuid,p_name text,p_email text,p_phone text,p_items jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_order uuid:=gen_random_uuid(); item jsonb; product_row public.products%rowtype; qty integer; sum_total numeric(10,2):=0;
begin
  if not public.is_active_admin() then raise exception 'Not authorized'; end if;
  if length(trim(p_name))<2 or p_email !~* '^[^@]+@[^@]+\.[^@]+$' then raise exception 'Invalid customer details'; end if;
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items)=0 then raise exception 'At least one item is required'; end if;
  insert into public.orders(id,customer_id,customer_name,customer_email,customer_phone)
    values(v_order,p_customer_id,trim(p_name),lower(trim(p_email)),coalesce(p_phone,''));
  for item in select value from jsonb_array_elements(p_items) loop
    qty:=(item->>'quantity')::integer;
    if qty<1 then raise exception 'Invalid quantity'; end if;
    select * into product_row from public.products where id=item->>'product_id' and active for update;
    if not found then raise exception 'Product unavailable'; end if;
    if product_row.stock<qty then raise exception 'Insufficient stock for %',product_row.name; end if;
    update public.products set stock=stock-qty where id=product_row.id;
    insert into public.order_items(order_id,product_id,product_name,price,quantity)
      values(v_order,product_row.id,product_row.name,product_row.price,qty);
    sum_total:=sum_total+product_row.price*qty;
  end loop;
  update public.orders set total=sum_total where id=v_order;
  return v_order;
end; $$;
revoke all on function public.create_admin_order(uuid,text,text,text,jsonb) from public;
grant execute on function public.create_admin_order(uuid,text,text,text,jsonb) to authenticated;

-- Checkout WhatsApp: registra a intenção como pendente e reserva o estoque antes de abrir a conversa.
create or replace function public.create_whatsapp_order(p_name text,p_email text,p_phone text,p_items jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_order uuid:=gen_random_uuid(); v_customer uuid; item jsonb; product_row public.products%rowtype; qty integer; sum_total numeric(10,2):=0;
begin
  if length(trim(coalesce(p_name,'')))<2 or length(trim(coalesce(p_name,'')))>120
    or coalesce(p_email,'') !~* '^[^@]+@[^@]+\.[^@]+$' or length(coalesce(p_phone,''))>40 then
    raise exception 'Informe nome, email e telefone válidos';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items)=0 or jsonb_array_length(p_items)>30 then
    raise exception 'Sacola inválida';
  end if;
  select id into v_customer from public.customers where lower(email)=lower(trim(p_email)) limit 1;
  insert into public.orders(id,customer_id,customer_name,customer_email,customer_phone)
    values(v_order,v_customer,trim(p_name),lower(trim(p_email)),coalesce(trim(p_phone),''));
  for item in select value from jsonb_array_elements(p_items) loop
    qty:=(item->>'quantity')::integer;
    if qty<1 or qty>99 then raise exception 'Quantidade inválida'; end if;
    select * into product_row from public.products where id=item->>'productId' and active for update;
    if not found then raise exception 'Produto indisponível'; end if;
    if product_row.stock<qty then raise exception 'Estoque insuficiente para % (disponível: %)',product_row.name,product_row.stock; end if;
    update public.products set stock=stock-qty where id=product_row.id;
    insert into public.order_items(order_id,product_id,product_name,price,quantity)
      values(v_order,product_row.id,product_row.name,product_row.price,qty);
    sum_total:=sum_total+product_row.price*qty;
  end loop;
  update public.orders set total=sum_total where id=v_order;
  return v_order;
end; $$;
revoke all on function public.create_whatsapp_order(text,text,text,jsonb) from public;
grant execute on function public.create_whatsapp_order(text,text,text,jsonb) to anon,authenticated;

-- Checkout sem conta: registra o pedido, mas deixa o estoque para confirmacao manual.
create or replace function public.create_whatsapp_guest_order(p_items jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_order uuid := gen_random_uuid();
  item jsonb;
  product_row public.products%rowtype;
  qty integer;
  sum_total numeric(10,2) := 0;
begin
  if jsonb_typeof(p_items) is distinct from 'array' then
    raise exception 'Sacola invalida';
  end if;
  if jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 30 then
    raise exception 'Sacola invalida';
  end if;

  insert into public.orders(id,customer_name,customer_email,customer_phone)
    values(v_order,'Cliente sem cadastro','sem-cadastro+' || v_order::text || '@whatsapp.local','');

  for item in select value from jsonb_array_elements(p_items) loop
    qty := (item->>'quantity')::integer;
    if qty < 1 or qty > 99 then
      raise exception 'Quantidade invalida';
    end if;

    select * into product_row
    from public.products
    where id = item->>'productId' and active;
    if not found then
      raise exception 'Produto indisponivel';
    end if;

    insert into public.order_items(order_id,product_id,product_name,price,quantity)
      values(v_order,product_row.id,product_row.name,product_row.price,qty);
    sum_total := sum_total + product_row.price * qty;
  end loop;

  update public.orders set total = sum_total where id = v_order;
  return v_order;
end; $$;
revoke all on function public.create_whatsapp_guest_order(jsonb) from public;
grant execute on function public.create_whatsapp_guest_order(jsonb) to anon,authenticated;

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(), text text not null, author text not null,
  age integer check(age is null or age>0), rating integer not null default 5 check(rating between 1 and 5),
  is_approved boolean not null default true, created_at timestamptz not null default now()
);
alter table public.testimonials add column if not exists rating integer not null default 5 check(rating between 1 and 5);
alter table public.testimonials add column if not exists is_approved boolean not null default true;
alter table public.testimonials enable row level security;
drop policy if exists "Testimonials are public" on public.testimonials;
create policy "Testimonials are public" on public.testimonials for select to anon,authenticated using (is_approved=true);
drop policy if exists "Admins manage testimonials" on public.testimonials;
create policy "Admins manage testimonials" on public.testimonials for all to authenticated
  using ((select public.is_active_admin())) with check ((select public.is_active_admin()));
grant select on public.testimonials to anon,authenticated;
grant select,insert,update,delete on public.testimonials to authenticated;

-- 1. Crie sua conta em Authentication > Users.
-- 2. Libere o primeiro administrador (troque o email):
-- insert into public.admin_users(user_id,email,full_name)
-- select id,email,coalesce(raw_user_meta_data->>'full_name','Admin') from auth.users where email='voce@exemplo.com';

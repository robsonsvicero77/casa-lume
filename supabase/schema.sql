-- Execute no SQL Editor do projeto Supabase.
create table if not exists public.products (
  id text primary key,
  name text not null,
  scent text not null default '',
  price numeric(10,2) not null check (price >= 0),
  size text not null default '',
  tag text not null default 'Feita à mão',
  image text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
drop policy if exists "Anyone can read active products" on public.products;
create policy "Anyone can read active products" on public.products
for select to anon, authenticated using (active = true);

insert into public.products (id,name,scent,price,size,tag,image) values
('flor-de-algodao','Flor de Algodão','Algodão · musk · baunilha',89,'200 g · até 40 horas','Mais querida','https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=85'),
('cafe-com-calma','Café com Calma','Café · canela · açúcar mascavo',96,'200 g · até 40 horas','Feita à mão','https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=1000&q=85'),
('jardim-de-cha','Jardim de Chá','Chá branco · jasmim · bergamota',92,'200 g · até 40 horas','Novo aroma','https://images.unsplash.com/photo-1603905179139-d6e2e3b81f85?auto=format&fit=crop&w=1000&q=85'),
('fim-de-tarde','Fim de Tarde','Sândalo · âmbar · figo',98,'200 g · até 40 horas','Edição especial','https://images.unsplash.com/photo-1608181831718-c9e1b17f3e08?auto=format&fit=crop&w=1000&q=85')
on conflict (id) do nothing;

create table if not exists public.newsletter_subscribers (
  id bigint generated always as identity primary key,
  email text not null unique check (email = lower(email)),
  created_at timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;
drop policy if exists "Anyone can subscribe to newsletter" on public.newsletter_subscribers;
create policy "Anyone can subscribe to newsletter" on public.newsletter_subscribers
for insert to anon, authenticated with check (email ~* '^[^@]+@[^@]+\.[^@]+$');

# Casa Lume · velas artesanais

Loja em React e Vite com catálogo, checkout pelo WhatsApp e painel de gestão ligado ao Supabase.

## Iniciar localmente

```bash
npm install
npm run dev
```

Configure `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `VITE_WHATSAPP_NUMBER` em `.env.local`.

## Painel administrativo

O painel em `/admin/login` inclui pedidos, produtos com upload de imagens e controle de estoque, usuários administrativos, clientes e depoimentos. Coleções e Instagram Feed não fazem parte do painel.

1. Execute `supabase/schema.sql` e depois `supabase/admin.sql` no SQL Editor do Supabase.
2. Crie uma conta em **Authentication → Users** e libere-a usando o SQL de exemplo no final de `admin.sql`.
3. Publique convites administrativos com `supabase functions deploy invite-admin` (Supabase CLI).

No cadastro do produto, informe as unidades disponíveis. O checkout registra um pedido pendente e reserva a quantidade antes de abrir o WhatsApp. O ID do pedido é incluído na mensagem. Se o cliente não pagar, cancele o pedido no painel para devolver a quantidade ao estoque. Os pedidos também podem ser confirmados, enviados e concluídos pelo painel. Clientes podem criar conta em `/cadastro`, entrar em `/conta/login` e salvar produtos na wishlist pela vitrine. A conta exige email confirmado. Depoimentos aprovados aparecem na página inicial.

Para habilitar contas e wishlist, execute `supabase/customer-accounts.sql` no SQL Editor depois de `schema.sql` e `admin.sql`. Em **Authentication → URL Configuration**, permita os endereços do site (incluindo `/conta`) para os links de confirmação de email.

## Páginas

- `/`, `/produtos` e `/produto/:id` — vitrine e catálogo
- `/sacola` — sacola e checkout pelo WhatsApp
- `/sobre`, `/contato` e `/duvidas` — páginas institucionais
- `/cadastro`, `/conta/login` e `/conta` — cadastro, login e área do cliente com wishlist
- `/admin/login` — acesso administrativo

## Configuração

- `supabase/schema.sql` configura o catálogo e a newsletter.
- `supabase/admin.sql` configura permissões, estoque, pedidos, clientes, depoimentos e Storage.
- `supabase/customer-accounts.sql` habilita perfis autenticados e wishlist privada por cliente.
- `supabase/functions/invite-admin/` contém a função segura para convidar administradores.
- `CONFIGURACAO-VERCEL-SUPABASE.md` explica configuração e publicação.

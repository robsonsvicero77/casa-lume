# Casa Lume · velas artesanais

Loja responsiva em React e Vite com catálogo ligado opcionalmente ao Supabase e pedidos encaminhados ao WhatsApp.

## Iniciar localmente

```bash
npm install
npm run dev
```

Copie `.env.example` para `.env.local` para configurar Supabase e o número de WhatsApp. O catálogo de demonstração funciona sem conexão.

## Páginas

- `/` — início e destaques da marca
- `/produtos` — catálogo com busca e filtros por perfil aromático
- `/produto/:id` — detalhes, quantidade e adicionar à sacola
- `/sacola` — itens, resumo e finalização pelo WhatsApp
- `/sobre` — história e valores artesanais
- `/contato` — mensagem encaminhada ao WhatsApp
- `/duvidas` — perguntas frequentes
- rota não encontrada — página 404 com retorno à loja

## Estrutura do código

- `src/pages/` contém as páginas e seus fluxos.
- `src/components/` contém navegação, catálogo, cartões, sacola, conteúdo e elementos de interface reutilizáveis.
- `src/lib/` contém acesso ao Supabase e formatação de moeda.
- `supabase/schema.sql` cria as tabelas e adiciona produtos de demonstração.
- `CONFIGURACAO-VERCEL-SUPABASE.md` explica configuração e publicação.

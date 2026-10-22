# Configuração da loja Casa Lume

## 1. Preparar o Supabase (opcional)

A loja já funciona com os quatro produtos de demonstração definidos no site. O Supabase é opcional: ao conectá-lo, o catálogo ativo passa a ser lido da tabela `products`.

1. Crie um projeto em [supabase.com](https://supabase.com/) e escolha uma região próxima dos clientes.
2. No painel do projeto, abra **SQL Editor → New query**, cole o conteúdo de `supabase/schema.sql` e execute. Isso cria o catálogo, libera leitura pública somente de produtos ativos e insere quatro produtos iniciais.
3. Abra **Project Settings → API** e copie a **Project URL** e a chave pública **anon/publishable**.
4. Não use a chave `service_role` no site ou na Vercel. Ela não é necessária para este catálogo público.

## 2. Rodar localmente

Na pasta do projeto:

```bash
npm install
```

Copie `.env.example` para `.env.local` e preencha:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
VITE_WHATSAPP_NUMBER=55DDDNUMERO
```

Use no WhatsApp o código do país, DDD e número, somente dígitos (exemplo: `5511999999999`). Se deixar as variáveis Supabase em branco, a vitrine usa os produtos locais de demonstração. Inicie com `npm run dev` e abra o endereço mostrado no terminal.

## 3. Publicar na Vercel

1. Crie um repositório Git para esta pasta e envie o código ao GitHub, GitLab ou Bitbucket.
2. Na [Vercel](https://vercel.com/), escolha **Add New → Project**, importe esse repositório.
3. A Vercel detecta Vite. Confirme **Build Command** `npm run build` e **Output Directory** `dist`.
4. Em **Environment Variables**, cadastre `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `VITE_WHATSAPP_NUMBER`. Se não conectou Supabase ainda, pode omitir as duas primeiras.
5. Clique em **Deploy**. Ao mudar variáveis depois, faça um novo deploy para que o build as incorpore.
6. Em **Settings → Domains**, adicione seu domínio se tiver um e siga as instruções de DNS exibidas pela Vercel.

O `vercel.json` já contém o rewrite da aplicação para que a página inicial continue funcionando em hospedagem Vercel.

## 4. Atualizar produtos

Com Supabase conectado, edite os registros em **Table Editor → products**. Use um `id` único, preço numérico em reais, URL pública para `image` e `active = true` para exibir o item. Desative um produto com `active = false`. O site ainda mantém produtos demonstrativos se a consulta estiver indisponível ou a tabela vazia.

As imagens do catálogo de exemplo são hospedadas pelo Unsplash. Substitua pelas imagens próprias dos seus produtos antes de abrir a loja ao público. O checkout monta uma mensagem com itens, quantidades e subtotal e inicia o pedido no WhatsApp. Atualize o número na variável `VITE_WHATSAPP_NUMBER`. O valor de frete e o pagamento são combinados diretamente com a loja no WhatsApp.

## Estrutura

- `src/`: aplicação e estilos responsivos.
- `src/pages/`: páginas da loja (a página inicial fica em `Home.jsx`).
- `src/components/`: cabeçalho, hero, catálogo, cartões de produto, sacola, rodapé e demais componentes.
- `src/lib/`: acesso ao Supabase e formatação de preços.
- `supabase/schema.sql`: estrutura e catálogo inicial do Supabase.
- `.env.example`: variáveis necessárias para configurar localmente.

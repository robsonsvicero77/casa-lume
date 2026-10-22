import { createClient } from '@supabase/supabase-js';
export const demoProducts = [
  { id:'flor-de-algodao',name:'Flor de Algodão',scent:'Algodão · musk · baunilha',price:89,size:'200 g · até 40 horas',tag:'Mais querida',image:'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=85' },
  { id:'cafe-com-calma',name:'Café com Calma',scent:'Café · canela · açúcar mascavo',price:96,size:'200 g · até 40 horas',tag:'Feita à mão',image:'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=1000&q=85' },
  { id:'jardim-de-cha',name:'Jardim de Chá',scent:'Chá branco · jasmim · bergamota',price:92,size:'200 g · até 40 horas',tag:'Novo aroma',image:'https://images.unsplash.com/photo-1603905179139-d6e2e3b81f85?auto=format&fit=crop&w=1000&q=85' },
  { id:'fim-de-tarde',name:'Fim de Tarde',scent:'Sândalo · âmbar · figo',price:98,size:'200 g · até 40 horas',tag:'Edição especial',image:'https://images.unsplash.com/photo-1608181831718-c9e1b17f3e08?auto=format&fit=crop&w=1000&q=85' },
];
export const supabase = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY) : null;
export async function getProducts() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('active', true).order('created_at', { ascending: false });
      if (!error && data?.length) return data;
      if (error) console.warn('Catálogo Supabase indisponível; exibindo produtos de demonstração.', error.message);
    } catch (error) { console.error('Falha ao carregar catálogo:', error); }
  }
  return demoProducts;
}

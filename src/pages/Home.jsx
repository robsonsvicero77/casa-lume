import { useState } from 'react';
import Hero from '../components/Hero.jsx';
import Values from '../components/Values.jsx';
import ProductCatalog from '../components/ProductCatalog.jsx';
import BrandStory from '../components/BrandStory.jsx';
import Ritual from '../components/Ritual.jsx';
import Newsletter from '../components/Newsletter.jsx';
import { supabase } from '../lib/products.js';

export default function Home({ products, addToCart }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [notice, setNotice] = useState('');
  async function subscribe(event) {
    event.preventDefault();
    if (!supabase) { setNotice('Conecte o Supabase para ativar a lista de novidades.'); return; }
    const { error } = await supabase.from('newsletter_subscribers').insert({ email: email.trim().toLowerCase() });
    if (!error || error.code === '23505') setSubscribed(true);
    else setNotice('Não foi possível cadastrar agora. Tente novamente.');
  }
  return <>
    <main id="inicio"><Hero/><Values/><ProductCatalog products={products} addToCart={addToCart}/><BrandStory/><Ritual/><Newsletter email={email} setEmail={setEmail} subscribed={subscribed} onSubmit={subscribe} notice={notice}/></main>
  </>;
}

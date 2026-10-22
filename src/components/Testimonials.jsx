import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '../lib/products.js';
export default function Testimonials(){
 const [rows,setRows]=useState([]);
 useEffect(()=>{let active=true;if(supabase)supabase.from('testimonials').select('id,text,author,rating').eq('is_approved',true).order('created_at',{ascending:false}).limit(3).then(({data})=>{if(active)setRows(data||[])});return()=>{active=false}},[]);
 if(!rows.length)return null;
 return <section className="admin-public-testimonials wrap"><span className="eyebrow">PALAVRAS QUE AQUECEM</span><h2>Quem já acendeu a sua</h2><div>{rows.map(row=><article key={row.id}><p>“{row.text}”</p><div className="admin-testimonial-stars">{Array.from({length:row.rating||5},(_,i)=><Star size={13} fill="currentColor" key={i}/>)}</div><small>{row.author}</small></article>)}</div></section>;
}

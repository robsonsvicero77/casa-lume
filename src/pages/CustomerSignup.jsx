import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Flame } from 'lucide-react';
import { supabase } from '../lib/products.js';

export default function CustomerSignup(){
 const [form,setForm]=useState({full_name:'',email:'',phone:''}),[error,setError]=useState(''),[done,setDone]=useState(false),[saving,setSaving]=useState(false);
 async function submit(e){e.preventDefault();setError('');if(!supabase){setError('O cadastro está temporariamente indisponível.');return;}setSaving(true);const {error:e2}=await supabase.from('customers').insert({full_name:form.full_name.trim(),email:form.email.trim().toLowerCase(),phone:form.phone.trim()});if(e2)setError(e2.code==='23505'?'Este email já está cadastrado.':e2.message);else setDone(true);setSaving(false);}
 return <main className="signup-page"><Link to="/" className="signup-back"><ArrowLeft size={16}/> Voltar à loja</Link><section className="signup-card"><i><Flame/></i><span className="admin-eyebrow">CASA LUME</span><h1>Faça parte da nossa lista</h1><p>Cadastre seus dados para receber novidades, lançamentos e atendimento personalizado.</p>{done?<div className="signup-done"><Check/> Cadastro recebido. Obrigada!</div>:<form onSubmit={submit}><label>Seu nome<input required minLength="2" maxLength="120" value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})}/></label><label>Email<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>WhatsApp<input required type="tel" maxLength="40" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label>{error&&<div className="admin-error">{error}</div>}<button className="admin-primary" disabled={saving}>{saving?'Enviando…':'Cadastrar'}</button></form>}</section></main>;
}

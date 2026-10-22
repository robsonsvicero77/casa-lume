import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Flame, LockKeyhole } from 'lucide-react';
import { supabase } from '../../lib/products.js';
import { useAdminAuth } from './AdminAuth.jsx';

export default function AdminLogin() {
  const { user } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  if (user) return <Navigate to="/admin" replace />;
  async function submit(event) {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      if (!supabase) throw new Error('O acesso administrativo precisa de um projeto Supabase configurado.');
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError) throw signInError;
      const { data: admin, error: adminError } = await supabase.from('admin_users').select('user_id').eq('user_id', data.user.id).eq('is_active', true).maybeSingle();
      if (adminError) throw adminError;
      if (!admin) { await supabase.auth.signOut(); throw new Error('Esta conta não está autorizada a administrar a Casa Lume.'); }
      navigate('/admin', { replace: true });
    } catch (err) { setError(err.message || 'Não foi possível entrar.'); }
    finally { setLoading(false); }
  }
  return <main className="admin-login"><Link className="admin-back" to="/"><ArrowLeft size={16}/> Voltar à loja</Link><section className="admin-login-card"><div className="admin-brand-mark"><Flame/></div><span className="admin-eyebrow">CASA LUME</span><h1>Painel administrativo</h1><p>Acesse sua conta para cuidar da loja.</p>{error&&<div className="admin-error" role="alert">{error}</div>}<form onSubmit={submit}><label>Email<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@exemplo.com"/></label><label>Senha<div className="admin-password"><input type={showPassword?'text':'password'} autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Sua senha"/><button type="button" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword?'Ocultar senha':'Mostrar senha'}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label><button className="admin-primary" disabled={loading}><LockKeyhole size={16}/>{loading?'Entrando…':'Entrar no painel'}</button></form><small>O acesso é liberado somente para contas administrativas cadastradas.</small></section></main>;
}

import { Flame, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/products.js';
import { useAdminAuth } from './AdminAuth.jsx';
export default function AdminFrame({title,eyebrow='GESTÃO DA LOJA',children}){
  const {user}=useAdminAuth();const navigate=useNavigate();
  async function logout(){await supabase?.auth.signOut();navigate('/admin/login',{replace:true});}
  return <main className="admin-shell"><header className="admin-topbar"><Link className="admin-wordmark" to="/admin"><i><Flame size={18}/></i> casa lume <small>ADMIN</small></Link><div><span>{user?.email}</span><button className="admin-quiet" onClick={logout}><LogOut size={16}/> Sair</button></div></header><section className="admin-content"><Link className="admin-back-inline" to="/admin">← Voltar ao painel</Link><div className="admin-heading"><span className="admin-eyebrow">{eyebrow}</span><h1>{title}</h1></div>{children}</section></main>;
}

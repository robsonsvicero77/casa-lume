import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/products.js';
import { Navigate } from 'react-router-dom';

const AuthContext = createContext({ user: null, loading: true });
export const useAdminAuth = () => useContext(AuthContext);

export default function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!supabase) { setLoading(false); return undefined; }
    let alive = true;
    supabase.auth.getSession().then(async ({ data }) => {
      const sessionUser = data.session?.user || null;
      if (sessionUser) {
        const { data: admin } = await supabase.from('admin_users').select('user_id').eq('user_id', sessionUser.id).eq('is_active', true).maybeSingle();
        if (alive) setUser(admin ? sessionUser : null);
      }
    }).finally(() => { if (alive) setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user || null;
      if (!sessionUser) { setUser(null); return; }
      Promise.resolve().then(async () => {
        const { data: admin } = await supabase.from('admin_users').select('user_id').eq('user_id', sessionUser.id).eq('is_active', true).maybeSingle();
        if (alive) setUser(admin ? sessionUser : null);
      });
    });
    return () => { alive = false; subscription.unsubscribe(); };
  }, []);
  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function AdminOnly({ children }) {
  const { user, loading } = useAdminAuth();
  if (loading) return <div className="admin-loading">Verificando acesso…</div>;
  return user ? children : <Navigate to="/admin/login" replace />;
}

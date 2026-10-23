import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Flame } from 'lucide-react';
import { supabase } from '../lib/products.js';

export default function CustomerSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!supabase) {
      setError('O cadastro está temporariamente indisponível.');
      return;
    }

    setSaving(true);
    const fullName = form.full_name.trim();
    const phone = form.phone.trim();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim().toLowerCase(),
      password: form.password,
      options: {
        data: { full_name: fullName, phone },
        emailRedirectTo: `${window.location.origin}/conta`,
      },
    });

    if (signUpError) {
      setError(
        signUpError.message.includes('already registered')
          ? 'Este email já possui uma conta. Entre na sua conta.'
          : signUpError.message,
      );
      setSaving(false);
      return;
    }

    if (data.session) {
      const { error: profileError } = await supabase.rpc('sync_customer_profile', {
        p_full_name: fullName,
        p_phone: phone,
      });

      if (profileError) {
        setError(profileError.message);
        setSaving(false);
        return;
      }

      navigate('/conta', { replace: true });
      return;
    }

    setNotice('Conta criada! Confirme seu email pelo link que enviamos para entrar.');
    setSaving(false);
  }

  return (
    <main className="signup-page">
      <Link to="/" className="signup-back">
        <ArrowLeft size={16} /> Voltar à loja
      </Link>
      <section className="signup-card">
        <i><Flame /></i>
        <span className="admin-eyebrow">CASA LUME</span>
        <h1>Crie sua conta</h1>
        <p>Salve seus aromas favoritos e tenha tudo em um só lugar.</p>
        {notice ? (
          <div className="signup-done"><Check /> {notice}</div>
        ) : (
          <form onSubmit={submit}>
            <label>
              Seu nome
              <input
                required
                minLength="2"
                maxLength="120"
                autoComplete="name"
                value={form.full_name}
                onChange={(event) => setForm({ ...form, full_name: event.target.value })}
              />
            </label>
            <label>
              Email
              <input
                required
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </label>
            <label>
              WhatsApp
              <input
                required
                type="tel"
                maxLength="40"
                autoComplete="tel"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </label>
            <label>
              Senha (mínimo de 8 caracteres)
              <input
                required
                type="password"
                minLength="8"
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
            </label>
            {error && <div className="admin-error" role="alert">{error}</div>}
            <button className="admin-primary" disabled={saving}>
              {saving ? 'Criando conta…' : 'Criar conta'}
            </button>
          </form>
        )}
        <p className="customer-auth-switch">
          Já tem uma conta? <Link to="/conta/login">Entrar</Link>
        </p>
      </section>
    </main>
  );
}

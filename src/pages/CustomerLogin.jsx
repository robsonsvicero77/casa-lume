import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Flame } from "lucide-react";
import { supabase } from "../lib/products.js";

export default function CustomerLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (!supabase) {
      setError("O acesso à conta está temporariamente indisponível.");
      return;
    }

    setSaving(true);
    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      },
    );

    if (signInError) {
      setError(
        "Email ou senha incorretos. Confira os dados e tente novamente.",
      );
      setSaving(false);
      return;
    }

    const { error: profileError } = await supabase.rpc(
      "sync_customer_profile",
      {
        p_full_name: data.user.user_metadata?.full_name || data.user.email,
        p_phone: data.user.user_metadata?.phone || "",
      },
    );

    if (profileError) {
      await supabase.auth.signOut();
      setError(profileError.message);
      setSaving(false);
      return;
    }

    navigate(location.state?.from || "/conta", { replace: true });
  }

  return (
    <main className="signup-page">
      <Link to="/" className="signup-back">
        <ArrowLeft size={16} /> Voltar à loja
      </Link>
      <section className="signup-card">
        <i>
          <Flame />
        </i>
        <span className="admin-eyebrow">CASA LUME</span>
        <h1>Entre na sua conta</h1>
        <p>Acesse sua wishlist e seus aromas favoritos.</p>
        <form onSubmit={submit}>
          <label>
            Email
            <input
              required
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
            />
          </label>
          <label>
            Senha
            <input
              required
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
            />
          </label>
          {error && (
            <div className="admin-error" role="alert">
              {error}
            </div>
          )}
          <button className="admin-primary" disabled={saving}>
            {saving ? "Entrando…" : "Entrar"}
          </button>
        </form>
        <p className="customer-auth-switch">
          Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>
      </section>
    </main>
  );
}

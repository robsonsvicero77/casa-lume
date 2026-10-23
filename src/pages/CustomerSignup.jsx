import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Eye, EyeOff, Flame } from "lucide-react";
import { supabase } from "../lib/products.js";

export default function CustomerSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!supabase) {
      setError("O cadastro está temporariamente indisponível.");
      return;
    }

    setSaving(true);
    const fullName = form.full_name.trim();
    const phone = form.phone.trim();
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          data: { full_name: fullName, phone },
          emailRedirectTo: `${window.location.origin}/conta`,
        },
      });

      if (signUpError) {
        const message = signUpError.message.toLowerCase();
        if (message.includes("already registered")) {
          setError("Este email já possui uma conta. Entre na sua conta.");
        } else if (message.includes("redirect") || message.includes("url")) {
          setError(
            "O endereço de confirmação deste site não está autorizado. Adicione o domínio em Authentication → URL Configuration no Supabase.",
          );
        } else {
          setError(signUpError.message);
        }
        setSaving(false);
        return;
      }

      if (data.user?.identities?.length === 0) {
        setError("Este email já possui uma conta. Entre na sua conta.");
        setSaving(false);
        return;
      }

      if (data.session) {
        const { error: profileError } = await supabase.rpc(
          "sync_customer_profile",
          {
            p_full_name: fullName,
            p_phone: phone,
          },
        );

        if (profileError) {
          setError(
            profileError.code === "PGRST202" || profileError.code === "42883"
              ? "O cadastro de clientes ainda não foi habilitado no banco. Execute supabase/customer-accounts.sql no SQL Editor do Supabase."
              : profileError.message,
          );
          setSaving(false);
          return;
        }

        navigate("/conta", { replace: true });
        return;
      }

      setNotice(
        "Conta criada! Confirme seu email pelo link que enviamos para entrar.",
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? `Não foi possível concluir o cadastro: ${requestError.message}`
          : "Não foi possível conectar ao serviço de cadastro. Confira sua conexão e tente novamente.",
      );
    } finally {
      setSaving(false);
    }
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
        <h1>Crie sua conta</h1>
        <p>Salve seus aromas favoritos e tenha tudo em um só lugar.</p>
        {notice ? (
          <div className="signup-done">
            <Check /> {notice}
          </div>
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
                onChange={(event) =>
                  setForm({ ...form, full_name: event.target.value })
                }
              />
            </label>
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
              WhatsApp
              <input
                required
                type="tel"
                maxLength="40"
                autoComplete="tel"
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
              />
            </label>
            <label>
              Senha (mínimo de 8 caracteres)
              <div className="customer-password-field">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  minLength="8"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>
            {error && (
              <div className="admin-error" role="alert">
                {error}
              </div>
            )}
            <button className="admin-primary" disabled={saving}>
              {saving ? "Criando conta…" : "Criar conta"}
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

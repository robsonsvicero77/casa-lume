import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Heart, LogOut } from "lucide-react";
import ProductCard from "../components/ProductCard.jsx";
import { useCustomerAuth } from "../lib/CustomerAuth.jsx";
import { supabase } from "../lib/products.js";

export function CustomerOnly({ children }) {
  const { user, loading } = useCustomerAuth();

  if (loading)
    return <main className="customer-account-page">Carregando sua conta…</main>;
  return user ? children : <Navigate to="/conta/login" replace />;
}

export default function CustomerAccount({ products, addToCart }) {
  const navigate = useNavigate();
  const { user, wishlist, refreshWishlist } = useCustomerAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadProfile() {
      if (!supabase || !user) return;
      let { data, error: profileError } = await supabase
        .from("customers")
        .select("full_name, email, phone")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!data && !profileError) {
        const { error: syncError } = await supabase.rpc(
          "sync_customer_profile",
          {
            p_full_name: user.user_metadata?.full_name || "Cliente",
            p_phone: user.user_metadata?.phone || "",
          },
        );

        if (syncError) profileError = syncError;
        else {
          const result = await supabase
            .from("customers")
            .select("full_name, email, phone")
            .eq("auth_user_id", user.id)
            .maybeSingle();
          data = result.data;
          profileError = result.error;
        }
      }

      if (!alive) return;
      if (profileError) setError(profileError.message);
      else setProfile(data);
      setLoading(false);
    }

    loadProfile();
    refreshWishlist();

    return () => {
      alive = false;
    };
  }, [user, refreshWishlist]);

  const savedProducts = useMemo(
    () =>
      wishlist
        .map((id) => products.find((product) => product.id === id))
        .filter(Boolean),
    [products, wishlist],
  );

  async function logout() {
    await supabase?.auth.signOut();
    navigate("/", { replace: true });
  }

  const name =
    profile?.full_name || user?.user_metadata?.full_name || "Cliente";

  return (
    <main className="customer-account-page">
      <header className="customer-account-heading">
        <div>
          <span className="eyebrow">SUA CASA LUME</span>
          <h1>Olá, {name.split(" ")[0]}.</h1>
          <p>{profile?.email || user?.email}</p>
        </div>
        <button className="customer-logout" onClick={logout}>
          <LogOut size={16} /> Sair
        </button>
      </header>

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}

      <section className="customer-wishlist">
        <div className="customer-wishlist-heading">
          <div>
            <span className="eyebrow">AROMAS QUE VOCÊ GUARDOU</span>
            <h2>
              <Heart size={21} /> Minha wishlist
            </h2>
          </div>
          <span>
            {wishlist.length} {wishlist.length === 1 ? "favorito" : "favoritos"}
          </span>
        </div>

        {loading ? (
          <p className="customer-empty">Carregando sua conta…</p>
        ) : savedProducts.length ? (
          <div className="grid">
            {savedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                addToCart={addToCart}
              />
            ))}
          </div>
        ) : (
          <div className="customer-empty">
            <Heart size={25} />
            <p>Sua wishlist ainda está vazia.</p>
            <Link className="text-link" to="/produtos">
              Descobrir aromas <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

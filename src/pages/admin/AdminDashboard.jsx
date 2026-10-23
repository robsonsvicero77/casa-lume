import {
  Flame,
  LogOut,
  Package,
  Plus,
  ShoppingBag,
  Users,
  UserCog,
  MessageSquareQuote,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/products.js";
import { useAdminAuth } from "./AdminAuth.jsx";

const options = [
  {
    icon: ShoppingBag,
    title: "Pedidos",
    description:
      "Registrar e acompanhar pedidos, confirmar e cancelar com reposição de estoque.",
    path: "/admin/pedidos",
  },
  {
    icon: Package,
    title: "Produtos",
    description:
      "Cadastrar, editar, publicar e remover produtos com upload de imagens.",
    path: "/admin/produtos",
  },
  {
    icon: UserCog,
    title: "Usuários Admin",
    description: "Autorizar e desativar contas administrativas.",
    path: "/admin/usuarios",
  },
  {
    icon: Users,
    title: "Clientes",
    description: "Consultar cadastros, buscar e exportar a lista de clientes.",
    path: "/admin/clientes",
  },
  {
    icon: MessageSquareQuote,
    title: "Depoimentos",
    description: "Adicionar, editar e remover depoimentos de clientes.",
    path: "/admin/depoimentos",
  },
  {
    icon: Plus,
    title: "Novo produto",
    description: "Cadastre um novo aroma no catálogo.",
    path: "/admin/produtos?novo=1",
  },
  {
    icon: ShoppingBag,
    title: "Ver a loja",
    description: "Confira a vitrine como seus clientes veem.",
    path: "/",
  },
];
export default function AdminDashboard() {
  const { user } = useAdminAuth();
  const navigate = useNavigate();
  async function logout() {
    await supabase?.auth.signOut();
    navigate("/admin/login", { replace: true });
  }
  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <Link className="admin-wordmark" to="/">
          <i>
            <Flame size={18} />
          </i>{" "}
          casa lume <small>ADMIN</small>
        </Link>
        <div>
          <span>{user?.email}</span>
          <button className="admin-quiet" onClick={logout}>
            <LogOut size={16} /> Sair
          </button>
        </div>
      </header>
      <section className="admin-content">
        <div className="admin-heading">
          <span className="admin-eyebrow">ESPAÇO DE GESTÃO</span>
          <h1>Painel administrativo</h1>
          <p>Gerencie os principais aspectos da sua loja.</p>
        </div>
        <div className="admin-cards">
          {options.map(({ icon: Icon, title, description, path }) => (
            <Link to={path} key={title} className="admin-card">
              <i>
                <Icon />
              </i>
              <span>
                <strong>{title}</strong>
                <small>{description}</small>
              </span>
            </Link>
          ))}
        </div>
        <div className="admin-note">
          <Flame size={18} />
          <span>Seu espaço para manter cada detalhe da Casa Lume aceso.</span>
        </div>
      </section>
    </main>
  );
}

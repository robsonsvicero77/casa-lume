import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import AdminFrame from "./AdminFrame.jsx";
import { supabase } from "../../lib/products.js";
import { money } from "../../lib/format.js";
const statuses = [
  ["", "Todos"],
  ["pending", "Pendente"],
  ["confirmed", "Confirmado"],
  ["shipped", "Enviado"],
  ["completed", "Concluído"],
  ["cancelled", "Cancelado"],
];
const labels = {
  pending: "Pendente",
  confirmed: "Confirmado",
  shipped: "Enviado",
  completed: "Concluído",
  cancelled: "Cancelado",
};
export default function AdminOrders() {
  const [orders, setOrders] = useState([]),
    [products, setProducts] = useState([]),
    [customers, setCustomers] = useState([]),
    [filter, setFilter] = useState(""),
    [expanded, setExpanded] = useState(""),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [showForm, setShowForm] = useState(false),
    [form, setForm] = useState({
      customer_id: "",
      name: "",
      email: "",
      phone: "",
      product_id: "",
      quantity: 1,
      tracking: "",
    });
  async function load() {
    setLoading(true);
    const [
      { data: orderData, error: e1 },
      { data: productData, error: e2 },
      { data: customerData, error: e3 },
    ] = await Promise.all([
      supabase
        .from("orders")
        .select("*,order_items(*)")
        .order("created_at", { ascending: false }),
      supabase
        .from("products")
        .select("id,name,price,stock")
        .eq("active", true)
        .order("name"),
      supabase
        .from("customers")
        .select("id,full_name,email,phone")
        .eq("is_active", true)
        .order("full_name"),
    ]);
    if (e1 || e2 || e3) setError((e1 || e2 || e3).message);
    setOrders(orderData || []);
    setProducts(productData || []);
    setCustomers(customerData || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);
  function selectCustomer(id) {
    const c = customers.find((x) => x.id === id);
    setForm({
      ...form,
      customer_id: id,
      name: c?.full_name || "",
      email: c?.email || "",
      phone: c?.phone || "",
    });
  }
  async function create(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { error: e2 } = await supabase.rpc("create_admin_order", {
        p_customer_id: form.customer_id || null,
        p_name: form.name,
        p_email: form.email,
        p_phone: form.phone,
        p_items: [
          { product_id: form.product_id, quantity: Number(form.quantity) },
        ],
      });
      if (e2) throw e2;
      setNotice("Pedido registrado e estoque atualizado.");
      setShowForm(false);
      setForm({
        customer_id: "",
        name: "",
        email: "",
        phone: "",
        product_id: "",
        quantity: 1,
        tracking: "",
      });
      await load();
    } catch (err) {
      setError(err.message || "Não foi possível registrar o pedido.");
    } finally {
      setSaving(false);
    }
  }
  async function changeStatus(order, status) {
    setSaving(true);
    setError("");
    try {
      if (status === "cancelled") {
        const { error: e } = await supabase.rpc("cancel_order", {
          p_order_id: order.id,
        });
        if (e) throw e;
      } else {
        const update = { status, updated_at: new Date().toISOString() };
        if (status === "shipped")
          update.tracking_code =
            form.tracking ||
            window.prompt("Código de rastreio (opcional):") ||
            null;
        const { error: e } = await supabase
          .from("orders")
          .update(update)
          .eq("id", order.id);
        if (e) throw e;
      }
      setNotice(`Pedido ${labels[status].toLowerCase()}.`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }
  const list = orders.filter((o) => !filter || o.status === filter);
  return (
    <AdminFrame title="Pedidos" eyebrow="VENDAS">
      <div className="admin-heading-row admin-order-controls">
        <div className="admin-stat">
          <ShoppingBag />
          <strong>{orders.length}</strong>
          <small>pedidos</small>
        </div>
        <div>
          <button className="admin-quiet" onClick={load}>
            <RefreshCw size={15} /> Atualizar
          </button>
          <button
            className="admin-primary"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus size={16} /> Registrar pedido
          </button>
        </div>
      </div>
      {showForm && (
        <form className="admin-order-form" onSubmit={create}>
          <h2>Novo pedido</h2>
          <label>
            Selecionar cliente cadastrado
            <select
              value={form.customer_id}
              onChange={(e) => selectCustomer(e.target.value)}
            >
              <option value="">Outro cliente</option>
              {customers.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.full_name} · {c.email}
                </option>
              ))}
            </select>
          </label>
          <div className="admin-form-row">
            <label>
              Nome
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              Email
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label>
              WhatsApp
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
          </div>
          <div className="admin-form-row">
            <label>
              Produto
              <select
                required
                value={form.product_id}
                onChange={(e) =>
                  setForm({ ...form, product_id: e.target.value })
                }
              >
                <option value="">Selecione</option>
                {products.map((p) => (
                  <option value={p.id} key={p.id}>
                    {p.name} · {money(p.price)} · estoque {p.stock}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Quantidade
              <input
                required
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </label>
          </div>
          <button
            className="admin-primary"
            disabled={saving || !form.product_id}
          >
            {saving ? "Registrando…" : "Criar pedido e reservar estoque"}
          </button>
        </form>
      )}
      {error && <div className="admin-error">{error}</div>}
      {notice && (
        <div className="admin-success">
          {notice}
          <button onClick={() => setNotice("")}>
            <X size={15} />
          </button>
        </div>
      )}
      <div className="admin-order-filters">
        {statuses.map(([value, label]) => (
          <button
            className={filter === value ? "active" : ""}
            onClick={() => setFilter(value)}
            key={value}
          >
            {label}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="admin-empty">Carregando pedidos…</p>
      ) : list.length === 0 ? (
        <p className="admin-empty">Nenhum pedido neste filtro.</p>
      ) : (
        <div className="admin-order-list">
          {list.map((order) => (
            <article key={order.id} className="admin-order">
              <div className="admin-order-main">
                <div>
                  <small>
                    #{order.id.slice(0, 8)} ·{" "}
                    {new Date(order.created_at).toLocaleString("pt-BR")}
                  </small>
                  <h2>{order.customer_name}</h2>
                  <small>
                    {order.customer_email}
                    {order.customer_phone ? ` · ${order.customer_phone}` : ""}
                  </small>
                </div>
                <strong>{money(order.total)}</strong>
                <span
                  className={`admin-status ${order.status === "completed" ? "active" : ""}`}
                >
                  {labels[order.status]}
                </span>
                <div className="admin-order-actions">
                  {order.status === "pending" && (
                    <button
                      onClick={() => changeStatus(order, "confirmed")}
                      disabled={saving}
                    >
                      <Check size={14} /> Confirmar
                    </button>
                  )}
                  {order.status === "confirmed" && (
                    <button
                      onClick={() => changeStatus(order, "shipped")}
                      disabled={saving}
                    >
                      <Truck size={14} /> Enviado
                    </button>
                  )}
                  {order.status === "shipped" && (
                    <button
                      onClick={() => changeStatus(order, "completed")}
                      disabled={saving}
                    >
                      <Package size={14} /> Concluir
                    </button>
                  )}
                  {!["cancelled", "completed"].includes(order.status) && (
                    <button
                      className="danger"
                      onClick={() => {
                        if (
                          confirm(
                            "Cancelar o pedido e devolver os itens ao estoque?",
                          )
                        )
                          changeStatus(order, "cancelled");
                      }}
                      disabled={saving}
                    >
                      <X size={14} /> Cancelar
                    </button>
                  )}
                  <button
                    className="icon"
                    onClick={() =>
                      setExpanded(expanded === order.id ? "" : order.id)
                    }
                  >
                    {expanded === order.id ? (
                      <ChevronUp size={17} />
                    ) : (
                      <ChevronDown size={17} />
                    )}
                  </button>
                </div>
              </div>
              {order.tracking_code && (
                <small className="admin-tracking">
                  <Truck size={13} /> Rastreio: {order.tracking_code}
                </small>
              )}
              {expanded === order.id && (
                <div className="admin-order-items">
                  {(order.order_items || []).map((item) => (
                    <div key={item.id}>
                      <span>
                        {item.product_name} × {item.quantity}
                      </span>
                      <strong>{money(item.price * item.quantity)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </AdminFrame>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Download, Search, Users, X } from "lucide-react";
import AdminFrame from "./AdminFrame.jsx";
import { supabase } from "../../lib/products.js";
export default function AdminCustomers() {
  const [rows, setRows] = useState([]),
    [search, setSearch] = useState(""),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  async function load() {
    const { data, error: e } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });
    if (e) setError(e.message);
    else setRows(data || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);
  const filtered = useMemo(
    () =>
      rows.filter((c) =>
        `${c.full_name} ${c.email} ${c.phone}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [rows, search],
  );
  function exportCsv() {
    const esc = (s) => `"${String(s || "").replaceAll('"', '""')}"`;
    const csv = [
      "Nome,Email,WhatsApp,Cadastro",
      ...filtered.map((c) =>
        [
          c.full_name,
          c.email,
          c.phone,
          new Date(c.created_at).toLocaleDateString("pt-BR"),
        ]
          .map(esc)
          .join(","),
      ),
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "clientes-casa-lume.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  async function toggle(c) {
    const { error: e } = await supabase
      .from("customers")
      .update({ is_active: !c.is_active })
      .eq("id", c.id);
    if (e) setError(e.message);
    else {
      setRows((r) =>
        r.map((x) => (x.id === c.id ? { ...x, is_active: !c.is_active } : x)),
      );
      setNotice("Status do cadastro atualizado.");
    }
  }
  return (
    <AdminFrame title="Clientes" eyebrow="RELACIONAMENTO">
      <div className="admin-heading-row admin-customer-tools">
        <div className="admin-stat">
          <Users />
          <strong>{rows.length}</strong>
          <small>cadastros</small>
        </div>
        <button className="admin-primary" onClick={exportCsv}>
          <Download size={16} /> Exportar CSV
        </button>
      </div>
      {error && <div className="admin-error">{error}</div>}
      {notice && (
        <div className="admin-success">
          {notice}
          <button onClick={() => setNotice("")}>
            <X size={15} />
          </button>
        </div>
      )}
      <label className="admin-search">
        <Search size={17} />
        <input
          placeholder="Buscar nome, email ou WhatsApp"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <div className="admin-product-list">
        {loading ? (
          <p className="admin-empty">Carregando clientes…</p>
        ) : filtered.length === 0 ? (
          <p className="admin-empty">Nenhum cadastro encontrado.</p>
        ) : (
          filtered.map((c) => (
            <article className="admin-product" key={c.id}>
              <div className="admin-customer-avatar">
                {c.full_name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="admin-product-info">
                <div>
                  <h2>{c.full_name}</h2>
                  <small>
                    {c.email} · {c.phone}
                  </small>
                </div>
                <span
                  className={
                    c.is_active ? "admin-status active" : "admin-status"
                  }
                >
                  {c.is_active ? "Ativo" : "Inativo"}
                </span>
                <small>
                  {new Date(c.created_at).toLocaleDateString("pt-BR")}
                </small>
              </div>
              <div className="admin-product-actions">
                <button onClick={() => toggle(c)}>
                  {c.is_active ? "Desativar" : "Ativar"}
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </AdminFrame>
  );
}

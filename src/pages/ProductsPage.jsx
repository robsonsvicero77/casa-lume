import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import ProductCard from "../components/ProductCard.jsx";

export default function ProductsPage({ products, addToCart }) {
  const [category, setCategory] = useState("Todos"),
    [query, setQuery] = useState("");
  const categories = ["Todos", "Florais", "Doces", "Amadeirados"];
  const visible = useMemo(
    () =>
      products.filter((p) => {
        const text = `${p.name} ${p.scent}`.toLocaleLowerCase("pt-BR");
        const matches = text.includes(query.toLocaleLowerCase("pt-BR"));
        const group =
          category === "Todos" ||
          (category === "Florais" && /flor|jasmim|chá|algodão/i.test(text)) ||
          (category === "Doces" &&
            /baunilha|doce|café|açúcar|figo/i.test(text)) ||
          (category === "Amadeirados" && /sândalo|âmbar|madeira/i.test(text));
        return matches && group;
      }),
    [products, category, query],
  );
  return (
    <main className="page-shell">
      <div className="page-hero">
        <div className="breadcrumbs">
          <Link to="/">início</Link>
          <span>/</span> coleção
        </div>
        <label className="eyebrow">FEITAS EM PEQUENOS LOTES</label>
        <h1>
          Velas para cada
          <br />
          <em>jeito de sentir.</em>
        </h1>
        <p>Descubra a fragrância que combina com o seu momento.</p>
      </div>
      <section className="catalog-page">
        <div className="catalog-tools">
          <div className="filters">
            {categories.map((c) => (
              <button
                className={category === c ? "active" : ""}
                key={c}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <label className="search-box">
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar aroma"
              aria-label="Buscar aroma"
            />
          </label>
        </div>
        <p className="results-count">
          {visible.length} {visible.length === 1 ? "aroma" : "aromas"} para
          conhecer
        </p>
        {visible.length ? (
          <div className="grid">
            {visible.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                addToCart={addToCart}
              />
            ))}
          </div>
        ) : (
          <div className="no-results">
            Não encontramos esse aroma.{" "}
            <button
              onClick={() => {
                setQuery("");
                setCategory("Todos");
              }}
            >
              Limpar filtros
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

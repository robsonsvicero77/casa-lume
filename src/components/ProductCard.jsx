import { useState } from 'react';
import { ArrowRight, Heart, Plus } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { money } from '../lib/format.js';
import { useCustomerAuth } from '../lib/CustomerAuth.jsx';

export default function ProductCard({ product, addToCart }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, wishlist, toggleWishlist } = useCustomerAuth();
  const [favoriteError, setFavoriteError] = useState('');
  const isFavorite = wishlist.includes(product.id);
  const hasInventory = product.stock !== undefined && product.stock !== null;
  const soldOut = hasInventory && Number(product.stock) < 1;

  async function handleFavorite() {
    if (!user) {
      navigate('/conta/login', { state: { from: location.pathname } });
      return;
    }

    setFavoriteError('');
    try {
      await toggleWishlist(product.id);
    } catch (error) {
      setFavoriteError(error.message || 'Não foi possível atualizar sua wishlist.');
    }
  }

  return (
    <article className="product">
      <Link
        className="photo"
        to={`/produto/${product.id}`}
        aria-label={`Ver vela ${product.name}`}
      >
        <img
          src={product.image}
          alt={`Vela artesanal ${product.name}`}
          loading="lazy"
        />
        <span className="tag">{product.tag || 'Feita à mão'}</span>
        <span className="quick">
          <ArrowRight size={15} /> ver detalhes
        </span>
      </Link>
      <button
        className="product-favorite"
        type="button"
        onClick={handleFavorite}
        aria-label={isFavorite ? `Remover ${product.name} da wishlist` : `Salvar ${product.name} na wishlist`}
        aria-pressed={isFavorite}
        title={isFavorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
      >
        <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>
      {favoriteError && <span className="wishlist-error" role="status">{favoriteError}</span>}

      <div className="product-line">
        <Link to={`/produto/${product.id}`}>
          <h3>{product.name}</h3>
        </Link>
        <b>{money(product.price)}</b>
      </div>

      <p className="scent">{product.scent}</p>
      <div className="product-content">
        <div className="product-meta">
          <small>{product.size || 'Cera vegetal · pavio de algodão'}</small>
          {hasInventory && (
            <small className={soldOut ? 'stock-out' : 'stock-count'}>
              {soldOut ? 'sem estoque' : `${product.stock} em estoque`}
            </small>
          )}
        </div>

        <button
          className="add-product"
          onClick={() => addToCart(product)}
          disabled={soldOut}
        >
          <Plus size={14} />
          {soldOut ? 'sem estoque' : 'adicionar à sacola'}
        </button>
      </div>

    </article>
  );
}

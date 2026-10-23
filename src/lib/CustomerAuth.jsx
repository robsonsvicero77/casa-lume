import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from './products.js';

const CustomerAuthContext = createContext({
  user: null,
  loading: true,
  wishlist: [],
  refreshWishlist: async () => {},
  toggleWishlist: async () => {},
});

export const useCustomerAuth = () => useContext(CustomerAuthContext);

export default function CustomerAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);

  const loadWishlist = useCallback(async (userId) => {
    if (!supabase || !userId) {
      setWishlist([]);
      return;
    }

    const { data, error } = await supabase
      .from('customer_wishlist')
      .select('product_id')
      .eq('user_id', userId);

    if (!error) setWishlist((data || []).map((item) => item.product_id));
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    let alive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      const sessionUser = data.session?.user || null;
      setUser(sessionUser);
      if (sessionUser) loadWishlist(sessionUser.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user || null;
      setUser(sessionUser);

      Promise.resolve().then(() => {
        if (!alive) return;
        if (sessionUser) loadWishlist(sessionUser.id);
        else setWishlist([]);
      });
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, [loadWishlist]);

  const refreshWishlist = useCallback(async () => {
    if (user) await loadWishlist(user.id);
  }, [loadWishlist, user]);

  const toggleWishlist = useCallback(async (productId) => {
    if (!user || !supabase) return false;

    const isSaved = wishlist.includes(productId);
    const query = supabase.from('customer_wishlist');
    const { error } = isSaved
      ? await query.delete().eq('user_id', user.id).eq('product_id', productId)
      : await query.insert({ user_id: user.id, product_id: productId });

    if (error) throw error;

    setWishlist((current) =>
      isSaved
        ? current.filter((id) => id !== productId)
        : [...new Set([...current, productId])],
    );
    return true;
  }, [user, wishlist]);

  return (
    <CustomerAuthContext.Provider
      value={{ user, loading, wishlist, refreshWishlist, toggleWishlist }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

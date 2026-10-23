import { Flame, Menu, ShoppingBag, UserRound, X } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function Header({ count, openCart, menuOpen, setMenuOpen, user }) {
  return <header className="header">
    <Link className="logo" to="/" aria-label="Casa Lume, início" onClick={()=>setMenuOpen(false)}><i><Flame size={19}/></i><span>casa lume<small>VELAS ARTESANAIS</small></span></Link>
    <nav className={menuOpen?'nav shown':'nav'}><Link to="/produtos" onClick={()=>setMenuOpen(false)}>a coleção</Link><Link to="/sobre" onClick={()=>setMenuOpen(false)}>nosso jeito</Link><Link to="/duvidas" onClick={()=>setMenuOpen(false)}>dúvidas</Link><Link to="/contato" onClick={()=>setMenuOpen(false)}>contato</Link><Link to="/cadastro" onClick={()=>setMenuOpen(false)}>cadastre-se</Link><Link className="nav-account-link" to={user?'/conta':'/conta/login'} onClick={()=>setMenuOpen(false)}>{user?'minha conta':'entrar'}</Link></nav>
    <div className="header-actions">
      <button className="bag" onClick={openCart} aria-label={`Minha sacola, ${count} ${count === 1 ? 'item' : 'itens'}`}><ShoppingBag size={18}/>{count > 0 && <i>{count}</i>}</button>
      <Link className="account-link" to={user?'/conta':'/conta/login'} aria-label={user?'Minha conta':'Entrar'} title={user?'Minha conta':'Entrar'}><UserRound size={19}/></Link>
    </div>
    <button className="menu" onClick={()=>setMenuOpen(!menuOpen)} aria-label="Abrir menu">{menuOpen?<X/>:<Menu/>}</button>
  </header>;
}

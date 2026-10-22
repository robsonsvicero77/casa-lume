import { Flame, Menu, ShoppingBag, X } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function Header({ count, openCart, menuOpen, setMenuOpen }) {
  return <header className="header">
    <Link className="logo" to="/" aria-label="Casa Lume, início" onClick={()=>setMenuOpen(false)}><i><Flame size={19}/></i><span>casa lume<small>VELAS ARTESANAIS</small></span></Link>
    <nav className={menuOpen?'nav shown':'nav'}><Link to="/produtos" onClick={()=>setMenuOpen(false)}>a coleção</Link><Link to="/sobre" onClick={()=>setMenuOpen(false)}>nosso jeito</Link><Link to="/duvidas" onClick={()=>setMenuOpen(false)}>dúvidas</Link><Link to="/contato" onClick={()=>setMenuOpen(false)}>contato</Link></nav>
    <button className="bag" onClick={openCart}><ShoppingBag size={16}/><span>Minha sacola</span><i>{count}</i></button>
    <button className="menu" onClick={()=>setMenuOpen(!menuOpen)} aria-label="Abrir menu">{menuOpen?<X/>:<Menu/>}</button>
  </header>;
}

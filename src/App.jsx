import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import Toast from './components/Toast.jsx';
import Home from './pages/Home.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import CartPage from './pages/CartPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import FAQPage from './pages/FAQPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import AnnouncementBar from './components/AnnouncementBar.jsx';
import FloatingBag from './components/FloatingBag.jsx';
import { demoProducts, getProducts } from './lib/products.js';

function Store(){
  const [products,setProducts]=useState(demoProducts);
  const [cart,setCart]=useState(()=>{try{return JSON.parse(localStorage.getItem('casa-lume-cart')||'[]')}catch{return []}});
  const [cartOpen,setCartOpen]=useState(false),[toast,setToast]=useState(''),[menuOpen,setMenuOpen]=useState(false);
  const location=useLocation();
  useEffect(()=>{let active=true;getProducts().then(next=>{if(active)setProducts(next)});return()=>{active=false}},[]);
  useEffect(()=>{localStorage.setItem('casa-lume-cart',JSON.stringify(cart))},[cart]);
  useEffect(()=>{window.scrollTo(0,0);setMenuOpen(false)},[location.pathname]);
  const count=cart.reduce((n,item)=>n+item.qty,0),total=useMemo(()=>cart.reduce((n,item)=>n+item.price*item.qty,0),[cart]);
  const addToCart=product=>{setCart(current=>current.find(item=>item.id===product.id)?current.map(item=>item.id===product.id?{...item,qty:item.qty+1}:item):[...current,{...product,qty:1}]);setToast(`${product.name} entrou na sacola`);window.setTimeout(()=>setToast(''),2200)};
  const changeQuantity=(id,delta)=>setCart(current=>current.map(item=>item.id===id?{...item,qty:item.qty+delta}:item).filter(item=>item.qty>0));
  const shared={products,addToCart,cart,count,total,changeQuantity,openCart:()=>setCartOpen(true)};
  return <>
    <AnnouncementBar/>
    <Header count={count} openCart={()=>setCartOpen(true)} menuOpen={menuOpen} setMenuOpen={setMenuOpen}/>
    <Routes>
      <Route path="/" element={<Home {...shared}/>}/>
      <Route path="/produtos" element={<ProductsPage {...shared}/>}/>
      <Route path="/produto/:id" element={<ProductDetailPage {...shared}/>}/>
      <Route path="/sacola" element={<CartPage {...shared}/>}/>
      <Route path="/sobre" element={<AboutPage/>}/>
      <Route path="/contato" element={<ContactPage/>}/>
      <Route path="/duvidas" element={<FAQPage/>}/>
      <Route path="*" element={<NotFoundPage/>}/>
    </Routes>
    <Footer/>
    <FloatingBag count={count} onClick={()=>setCartOpen(true)}/>
    {toast&&<Toast message={toast} openCart={()=>setCartOpen(true)}/>}
    {cartOpen&&<CartDrawer items={cart} count={count} total={total} close={()=>setCartOpen(false)} changeQuantity={changeQuantity}/>}
  </>;
}
export default function App(){return <BrowserRouter><Store/></BrowserRouter>}

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
import { demoProducts, getProducts, supabase } from './lib/products.js';
import { buildWhatsAppOrderUrl } from './lib/format.js';
import CheckoutDialog from './components/CheckoutDialog.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ProductAdmin from './pages/admin/ProductAdmin.jsx';
import AdminAuthProvider, { AdminOnly } from './pages/admin/AdminAuth.jsx';
import './pages/admin/admin.css';
import AdminOrders from './pages/admin/AdminOrders.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminCustomers from './pages/admin/AdminCustomers.jsx';
import AdminTestimonials from './pages/admin/AdminTestimonials.jsx';
import CustomerSignup from './pages/CustomerSignup.jsx';

function Store(){
  const [products,setProducts]=useState(demoProducts);
  const [cart,setCart]=useState(()=>{try{return JSON.parse(localStorage.getItem('casa-lume-cart')||'[]')}catch{return []}});
  const [cartOpen,setCartOpen]=useState(false),[toast,setToast]=useState(''),[menuOpen,setMenuOpen]=useState(false);
  const [checkoutOpen,setCheckoutOpen]=useState(false);
  const location=useLocation();
  const isAdmin=location.pathname.startsWith('/admin');
  useEffect(()=>{let active=true;getProducts().then(next=>{if(active)setProducts(next)});return()=>{active=false}},[]);
  useEffect(()=>{localStorage.setItem('casa-lume-cart',JSON.stringify(cart))},[cart]);
  useEffect(()=>{window.scrollTo(0,0);setMenuOpen(false)},[location.pathname]);
  const count=cart.reduce((n,item)=>n+item.qty,0),total=useMemo(()=>cart.reduce((n,item)=>n+item.price*item.qty,0),[cart]);
  const addToCart=product=>{const hasInventory=product.stock!==undefined&&product.stock!==null;if(hasInventory&&Number(product.stock)<1){setToast('Este aroma está sem estoque no momento.');window.setTimeout(()=>setToast(''),2200);return;}setCart(current=>{const item=current.find(row=>row.id===product.id);if(item){if(hasInventory&&item.qty>=Number(product.stock)){setToast(`Temos apenas ${product.stock} unidade(s) de ${product.name}.`);window.setTimeout(()=>setToast(''),2200);return current;}return current.map(row=>row.id===product.id?{...row,qty:row.qty+1}:row);}return [...current,{...product,qty:1}];});setToast(`${product.name} entrou na sacola`);window.setTimeout(()=>setToast(''),2200)};
  const changeQuantity=(id,delta)=>setCart(current=>{const item=current.find(row=>row.id===id);if(delta>0&&item?.stock!==undefined&&item?.stock!==null&&item.qty+delta>Number(item.stock)){setToast(`Temos apenas ${item.stock} unidade(s) de ${item.name}.`);window.setTimeout(()=>setToast(''),2200);return current;}return current.map(row=>row.id===id?{...row,qty:row.qty+delta}:row).filter(row=>row.qty>0);});
  const openCheckout=()=>setCheckoutOpen(true);
  async function submitCheckout(customer){if(!supabase)throw new Error('O checkout precisa de uma conexão ativa com a loja. Tente novamente mais tarde.');const {data:orderId,error}=await supabase.rpc('create_whatsapp_order',{p_name:customer.name,p_email:customer.email,p_phone:customer.phone,p_items:cart.map(item=>({productId:item.id,quantity:item.qty}))});if(error)throw error;const phone=(import.meta.env.VITE_WHATSAPP_NUMBER||'5511999999999').replace(/\D/g,'');const url=buildWhatsAppOrderUrl(phone,cart,total,orderId);setCart([]);setCartOpen(false);return url;}
  const shared={products,addToCart,cart,count,total,changeQuantity,openCart:()=>setCartOpen(true),beginCheckout:openCheckout};
  if(isAdmin)return <Routes><Route path="/admin/login" element={<AdminLogin/>}/><Route path="/admin" element={<AdminOnly><AdminDashboard/></AdminOnly>}/><Route path="/admin/produtos" element={<AdminOnly><ProductAdmin/></AdminOnly>}/><Route path="/admin/pedidos" element={<AdminOnly><AdminOrders/></AdminOnly>}/><Route path="/admin/usuarios" element={<AdminOnly><AdminUsers/></AdminOnly>}/><Route path="/admin/clientes" element={<AdminOnly><AdminCustomers/></AdminOnly>}/><Route path="/admin/depoimentos" element={<AdminOnly><AdminTestimonials/></AdminOnly>}/><Route path="*" element={<AdminLogin/>}/></Routes>;
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
      <Route path="/cadastro" element={<CustomerSignup/>}/>
      <Route path="*" element={<NotFoundPage/>}/>
    </Routes>
    <Footer/>
    <FloatingBag count={count} onClick={()=>setCartOpen(true)}/>
    {toast&&<Toast message={toast} openCart={()=>setCartOpen(true)}/>}
    {cartOpen&&<CartDrawer items={cart} count={count} total={total} close={()=>setCartOpen(false)} changeQuantity={changeQuantity} beginCheckout={openCheckout}/>}
    {checkoutOpen&&<CheckoutDialog onClose={()=>setCheckoutOpen(false)} onSubmit={submitCheckout}/>}
  </>;
}
export default function App(){return <AdminAuthProvider><BrowserRouter><Store/></BrowserRouter></AdminAuthProvider>}

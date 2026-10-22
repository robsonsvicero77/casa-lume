import { ShoppingBag } from 'lucide-react';
export default function FloatingBag({count,onClick}){return <button className="float-bag" onClick={onClick} aria-label={`Abrir sacola, ${count} itens`}><ShoppingBag size={19}/>{count>0&&<i>{count}</i>}</button>}

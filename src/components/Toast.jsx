import { Check } from 'lucide-react';
export default function Toast({message,openCart}){return <div className="toast"><Check size={15}/>{message}<button onClick={openCart}>ver sacola</button></div>}

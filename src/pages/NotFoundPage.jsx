import { Link } from "react-router-dom";
import { ArrowRight, Flame } from "lucide-react";
export default function NotFoundPage() {
  return (
    <main className="page-shell">
      <section className="not-found">
        <Flame size={34} />
        <label className="eyebrow">ESSA PÁGINA NÃO ACENDEU</label>
        <h1>
          Vamos voltar
          <br />
          <em>para a luz?</em>
        </h1>
        <p>O endereço pode ter mudado ou não existe.</p>
        <Link className="button dark" to="/">
          voltar ao início <ArrowRight size={15} />
        </Link>
      </section>
    </main>
  );
}

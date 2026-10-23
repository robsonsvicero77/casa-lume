import { ArrowDown, ArrowRight, Flame } from "lucide-react";
export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <label className="eyebrow">PEQUENOS RITUAIS, GRANDES RESPIROS</label>
        <h1>
          Acenda um pouco
          <br />
          de <em>calma.</em>
        </h1>
        <p>
          Velas feitas à mão para deixar a casa mais sua — e cada pausa um pouco
          mais especial.
        </p>
        <a className="button dark" href="#colecao">
          encontre seu aroma <ArrowRight size={16} />
        </a>
        <div className="note">
          <span>✳ ♡ ☼</span>
          Feitas uma a uma,
          <br />
          com carinho de verdade.
        </div>
      </div>
      <div className="hero-image">
        <img
          src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1500&q=90"
          alt="Vela artesanal acesa em uma mesa aconchegante"
        />
        <div className="stamp">
          <Flame size={18} />
          um sopro de
          <br />
          aconchego
        </div>
        <small>cera vegetal · pavio de algodão</small>
      </div>
      <a className="scroll" href="#colecao">
        <ArrowDown size={14} /> role devagar
      </a>
    </section>
  );
}

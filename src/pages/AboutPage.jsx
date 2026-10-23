import { Link } from "react-router-dom";
import { ArrowRight, Check, Flame, Heart, Sparkles } from "lucide-react";
export default function AboutPage() {
  return (
    <main className="page-shell">
      <div className="breadcrumbs">
        <Link to="/">início</Link>
        <span>/</span> nosso jeito
      </div>
      <section className="about-hero">
        <div>
          <label className="eyebrow">UMA CASA, UM RESPIRO</label>
          <h1>
            A gente faz velas.
            <br />E abre espaço para <em>pausas.</em>
          </h1>
          <p>
            A Casa Lume nasceu da vontade de fazer as coisas com calma: com as
            mãos, com intenção e com cuidado de verdade.
          </p>
          <Link className="button dark" to="/produtos">
            acenda seu momento <ArrowRight size={15} />
          </Link>
        </div>
        <img
          src="https://images.unsplash.com/photo-1602523961358-f9f03dd557db?auto=format&fit=crop&w=1200&q=85"
          alt="Vela sendo preparada artesanalmente"
        />
      </section>
      <section className="about-story">
        <label className="eyebrow">DO NOSSO ATELIÊ PARA A SUA CASA</label>
        <h2>
          Pequenos lotes.
          <br />
          <em>Feitos de verdade.</em>
        </h2>
        <div className="story-columns">
          <p>
            Cada vela começa com uma escolha cuidadosa de fragrância, cera e
            pavio. A gente prepara, despeja e finaliza uma a uma, respeitando o
            tempo de cada etapa. Sem linha de produção apressada: só o cuidado
            de quem faz algo para alguém.
          </p>
          <p>
            Usamos cera vegetal e pavio de algodão. Os aromas são pensados para
            acompanhar diferentes momentos, de uma manhã tranquila a uma noite
            que pede aconchego. O resultado é simples: uma luz suave e um
            cheirinho que faz a casa parecer ainda mais sua.
          </p>
        </div>
      </section>
      <section className="about-values">
        <article>
          <Sparkles />
          <h3>Escolhas conscientes</h3>
          <p>Cera vegetal e materiais selecionados para uma queima gostosa.</p>
        </article>
        <article>
          <Heart />
          <h3>Cuidado artesanal</h3>
          <p>Produzidas em pequenos lotes, com atenção em cada acabamento.</p>
        </article>
        <article>
          <Check />
          <h3>Feitas para durar</h3>
          <p>
            Orientações de cuidado acompanham sua vela para aproveitar cada
            hora.
          </p>
        </article>
        <article>
          <Flame />
          <h3>Fragrâncias com intenção</h3>
          <p>Notas escolhidas para acolher e criar memórias no dia a dia.</p>
        </article>
      </section>
      <section className="about-cta">
        <h2>
          Que aroma combina com
          <br />o seu <em>agora?</em>
        </h2>
        <Link className="button dark" to="/produtos">
          ver a coleção <ArrowRight size={15} />
        </Link>
      </section>
    </main>
  );
}

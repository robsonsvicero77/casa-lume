import { Link } from "react-router-dom";
const questions = [
  [
    "Do que as velas são feitas?",
    "Nossas velas são feitas artesanalmente com cera vegetal e pavio de algodão. Cada aroma é preparado em pequenos lotes no ateliê.",
  ],
  [
    "Quanto tempo a vela queima?",
    "A duração estimada aparece na descrição de cada produto. Para uma queima uniforme, deixe a cera derreter até as bordas na primeira vez e apare o pavio antes de reacender.",
  ],
  [
    "Como faço um pedido?",
    "Adicione os aromas à sacola e finalize pelo WhatsApp. A gente confirma disponibilidade, calcula o frete e combina o pagamento com você.",
  ],
  [
    "Quais são as formas de pagamento?",
    "As opções de pagamento são confirmadas diretamente pelo WhatsApp no momento do pedido.",
  ],
  [
    "Como funciona o envio?",
    "Combinamos o frete e o prazo conforme seu CEP durante o atendimento. A partir de R$ 220, o site informa frete grátis; confirme a elegibilidade com a loja.",
  ],
  [
    "Posso presentear alguém?",
    "Sim! Escreva para a gente pelo WhatsApp e conte que é presente. Vamos ajudar a combinar uma embalagem especial.",
  ],
  [
    "Como cuidar da minha vela?",
    "Mantenha longe de correntes de ar, crianças e animais. Não deixe a vela acesa sem supervisão. Apare o pavio para cerca de 5 mm antes de cada uso e interrompa quando restar aproximadamente 1 cm de cera.",
  ],
];
export default function FAQPage() {
  return (
    <main className="page-shell">
      <div className="breadcrumbs">
        <Link to="/">início</Link>
        <span>/</span> dúvidas
      </div>
      <section className="faq-page">
        <div className="faq-heading">
          <label className="eyebrow">SEM PRESSA, A GENTE EXPLICA</label>
          <h1>
            Dúvidas que
            <br />
            acendem por <em>aqui.</em>
          </h1>
          <p>
            Informações para você aproveitar sua vela e fazer seu pedido com
            tranquilidade.
          </p>
        </div>
        <div className="faq-list">
          {questions.map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span>+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
          <div className="faq-contact">
            Ainda ficou com dúvida?{" "}
            <Link to="/contato">
              fale com a gente <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Instagram, MessageCircle } from "lucide-react";
export default function ContactPage() {
  const [name, setName] = useState(""),
    [message, setMessage] = useState("");
  function send(e) {
    e.preventDefault();
    const phone = (
      import.meta.env.VITE_WHATSAPP_NUMBER || "5511999999999"
    ).replace(/\D/g, "");
    const text = `Oi, Casa Lume! Meu nome é ${name}. ${message}`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }
  return (
    <main className="page-shell">
      <div className="breadcrumbs">
        <Link to="/">início</Link>
        <span>/</span> contato
      </div>
      <section className="contact-layout">
        <div className="contact-intro">
          <label className="eyebrow">A GENTE ADORA UM OI</label>
          <h1>
            Vamos conversar
            <br />
            com <em>calma?</em>
          </h1>
          <p>
            Dúvida sobre aromas, pedidos ou presentes? Mande sua mensagem e a
            gente te responde com carinho.
          </p>
          <div className="contact-method">
            <MessageCircle />
            <div>
              <strong>WhatsApp</strong>
              <span>Atendimento de segunda a sexta</span>
            </div>
          </div>
          <a
            className="contact-method"
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
          >
            <Instagram />
            <div>
              <strong>Instagram</strong>
              <span>Acompanhe os bastidores do ateliê</span>
            </div>
          </a>
        </div>
        <form className="contact-form" onSubmit={send}>
          <label htmlFor="contact-name">Seu nome</label>
          <input
            id="contact-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Como podemos te chamar?"
          />
          <label htmlFor="contact-message">Como podemos ajudar?</label>
          <textarea
            id="contact-message"
            rows="5"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            placeholder="Escreva sua mensagem..."
          />
          <button className="button dark">
            continuar pelo WhatsApp <ArrowRight size={15} />
          </button>
          <small>
            A mensagem será aberta no WhatsApp para você revisar e enviar.
          </small>
        </form>
      </section>
    </main>
  );
}

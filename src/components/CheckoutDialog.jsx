import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  MessageCircle,
  UserRound,
  X,
} from "lucide-react";

export default function CheckoutDialog({
  onClose,
  onGuestCheckout,
  onAccountCheckout,
  user,
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [whatsAppUrl, setWhatsAppUrl] = useState("");
  const [registered, setRegistered] = useState(false);

  async function continueCheckout(checkoutAction) {
    setLoading(true);
    setError("");
    const popup = window.open("about:blank", "_blank");

    try {
      const result = await checkoutAction();
      setWhatsAppUrl(result.url);
      setRegistered(result.registered);
      if (popup) popup.location.href = result.url;
    } catch (checkoutError) {
      popup?.close();
      setError(
        checkoutError.code === "PGRST202" || checkoutError.code === "42883"
          ? "A função de checkout não está instalada no Supabase. Execute supabase/admin.sql no SQL Editor depois de schema.sql."
          : checkoutError.message ||
              "Não foi possível preparar o pedido. Confira o estoque e tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  function chooseRegistered() {
    if (user) {
      continueCheckout(onAccountCheckout);
      return;
    }

    onClose();
    navigate("/cadastro", { state: { from: "/sacola" } });
  }

  function chooseLogin() {
    onClose();
    navigate("/conta/login", { state: { from: "/sacola" } });
  }

  return (
    <div
      className="checkout-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}
    >
      <section
        className="checkout-dialog checkout-options"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
      >
        <button
          className="checkout-close"
          onClick={onClose}
          aria-label="Fechar"
          disabled={loading}
        >
          <X size={20} />
        </button>

        {whatsAppUrl ? (
          <>
            <CheckCircle2 size={30} className="checkout-check" />
            <span className="eyebrow">
              {registered ? "PEDIDO REGISTRADO" : "PEDIDO PRONTO"}
            </span>
            <h2 id="checkout-title">
              {registered
                ? "Seu pedido está reservado"
                : "Continue pelo WhatsApp"}
            </h2>
            <p>
              {registered
                ? "Conclua a conversa pelo WhatsApp para combinar pagamento e entrega."
                : "O pedido não foi registrado no site. Envie a mensagem para confirmar disponibilidade, frete e pagamento."}
            </p>
            <a
              className="button dark"
              href={whatsAppUrl}
              target="_blank"
              rel="noreferrer"
            >
              abrir WhatsApp <ArrowRight size={15} />
            </a>
            <button className="checkout-finish" onClick={onClose}>
              Fechar
            </button>
          </>
        ) : (
          <>
            <h2 id="checkout-title">Opções de Checkout</h2>
            <p className="checkout-options-intro">
              Escolha como deseja continuar:
            </p>

            <div className="checkout-options-list">
              <button
                className="checkout-option checkout-option-register"
                onClick={chooseRegistered}
                disabled={loading}
              >
                <UserRound aria-hidden="true" />
                <span>
                  <strong>Cadastrado</strong>
                  <small>
                    {user
                      ? "Finalizar pedido e acompanhar compras"
                      : "Fazer cadastro e acompanhar compras"}
                  </small>
                </span>
              </button>

              <button
                className="checkout-option checkout-option-guest"
                onClick={() => continueCheckout(onGuestCheckout)}
                disabled={loading}
              >
                <MessageCircle aria-hidden="true" />
                <span>
                  <strong>Sem Cadastro</strong>
                  <small>Enviar via WhatsApp sem cadastro</small>
                  <small className="checkout-option-note">
                    O estoque só é reservado ao finalizar com uma conta.
                  </small>
                </span>
              </button>

              <button
                className="checkout-option checkout-option-login"
                onClick={chooseLogin}
                disabled={loading}
              >
                <LockKeyhole aria-hidden="true" />
                <span>
                  <strong>Já Tenho Conta</strong>
                  <small>Fazer login para acompanhar minhas compras</small>
                </span>
              </button>
            </div>

            {error && (
              <div className="admin-error" role="alert">
                {error}
              </div>
            )}

            <p className="checkout-security-note">
              Ambiente seguro. Seus dados são protegidos.
            </p>
          </>
        )}
      </section>
    </div>
  );
}

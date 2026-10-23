export const money = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

export function buildOrderMessage(items, total, orderId = "") {
  const products = items
    .map(
      (item) => `* ${item.name} | ${money(item.price)}\n     Qtd: ${item.qty}`,
    )
    .join("\n\n");
  const reference = orderId ? `\n\nPedido Casa Lume: ${orderId}` : "";
  return `Olá! Gostaria de fazer um pedido:\n\n🛒 *MEU PEDIDO:*\n${products}\n\n💰 *TOTAL: ${money(total)}*${reference}\n\nAguardo retorno! 😊`;
}

export function buildWhatsAppOrderUrl(phone, items, total, orderId = "") {
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;
  const url = new URL(
    isMobile ? "whatsapp://send" : "https://api.whatsapp.com/send",
  );
  url.searchParams.set("phone", phone);
  url.searchParams.set("text", buildOrderMessage(items, total, orderId));
  return url.toString();
}

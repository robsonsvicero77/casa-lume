export const money = value => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(value);

export function buildOrderMessage(items, total) {
  const cartIcon = '\u{1F6D2}';
  const moneyIcon = '\u{1F4B0}';
  const smileIcon = '\u{1F60A}';
  const products = items.map(item =>
    `* ${item.name} | ${money(item.price)}\n     Qtd: ${item.qty}`
  ).join('\n\n');

  return `Olá! Gostaria de fazer um pedido:\n\n${cartIcon} *MEU PEDIDO:*\n${products}\n\n${moneyIcon} *TOTAL: ${money(total)}*\n\nAguardo retorno! ${smileIcon}`;
}

export function buildWhatsAppOrderUrl(phone, items, total) {
  const url = new URL('https://api.whatsapp.com/send');
  url.searchParams.set('phone', phone);
  url.searchParams.set('text', buildOrderMessage(items, total));
  return url.toString();
}

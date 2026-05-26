export function getWhatsAppLink(productTitle?: string) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5490000000000'
  const message = productTitle
    ? `Hola! Quisiera consultar por este producto: ${productTitle}`
    : 'Hola! Quisiera consultar por la tienda.'
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

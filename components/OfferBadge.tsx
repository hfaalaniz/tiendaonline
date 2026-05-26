type Props = {
  originalPrice: number
  discountPct: number
  size?: 'sm' | 'md'
}

export function salePrice(original: number, pct: number) {
  return original * (1 - pct / 100)
}

export default function OfferBadge({ originalPrice, discountPct, size = 'md' }: Props) {
  if (!discountPct || discountPct <= 0) return null
  const sale = salePrice(originalPrice, discountPct)

  return (
    <div className={`offer-badge-wrap offer-badge-${size}`}>
      <span className="offer-pct">-{discountPct}%</span>
      <div className="offer-prices">
        <span className="offer-original">${originalPrice.toFixed(2)}</span>
        <span className="offer-sale">${sale.toFixed(2)}</span>
      </div>
    </div>
  )
}

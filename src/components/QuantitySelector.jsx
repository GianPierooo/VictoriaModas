import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'

export default function QuantitySelector({ 
  quantity, 
  onQuantityChange, 
  min = 1, 
  max = 99,
  showLabel = true 
}) {
  const handleDecrease = () => {
    if (quantity > min) {
      onQuantityChange(quantity - 1)
    }
  }

  const handleIncrease = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1)
    }
  }

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value) && value >= min && value <= max) {
      onQuantityChange(value)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {showLabel && (
        <label className="text-[10px] uppercase tracking-luxe text-ink-muted">
          Cantidad
        </label>
      )}
      <div className="inline-flex w-fit items-center overflow-hidden rounded-full border border-ink/20">
        <button
          className="flex h-10 w-10 items-center justify-center text-ink-soft transition-colors hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={handleDecrease}
          disabled={quantity <= min}
          aria-label="Disminuir cantidad"
        >
          <MinusIcon className="h-4 w-4" />
        </button>
        <input
          type="number"
          className="h-10 w-12 border-x border-ink/15 bg-transparent text-center text-sm font-light text-ink focus:outline-none focus:ring-1 focus:ring-inset focus:ring-clay"
          value={quantity}
          onChange={handleInputChange}
          min={min}
          max={max}
          aria-label="Cantidad"
        />
        <button
          className="flex h-10 w-10 items-center justify-center text-ink-soft transition-colors hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={handleIncrease}
          disabled={quantity >= max}
          aria-label="Aumentar cantidad"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

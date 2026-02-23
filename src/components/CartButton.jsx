import React from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import './CartButton.css'

const CartButton = () => {
  const { setIsCartOpen, getCartItemsCount } = useCart()
  const itemsCount = getCartItemsCount()

  return (
    <button 
      className="cart-float-button"
      onClick={() => setIsCartOpen(true)}
      aria-label="Abrir carrito"
    >
      <ShoppingCart size={24} />
      {itemsCount > 0 && (
        <span className="cart-badge">{itemsCount}</span>
      )}
    </button>
  )
}

export default CartButton
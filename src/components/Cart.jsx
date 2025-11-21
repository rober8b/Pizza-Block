import React from 'react'
import { X, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import './Cart.css'

const Cart = () => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    getCartTotal
  } = useCart()

  const navigate = useNavigate()

  const handleCheckout = () => {
    setIsCartOpen(false)
    navigate('/checkout')
  }

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div className="cart-overlay" onClick={() => setIsCartOpen(false)} />
      )}

      {/* Carrito lateral */}
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <div className="cart-header-content">
            <ShoppingCart size={24} />
            <h2>Tu Pedido</h2>
          </div>
          <button className="cart-close-btn" onClick={() => setIsCartOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="cart-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <ShoppingCart size={64} />
              <p>Tu carrito está vacío</p>
              <span>Agregá productos para comenzar tu pedido</span>
            </div>
          ) : (
            <>
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.categoria}`} className="cart-item">
                  <div className="cart-item-info">
                    <h4>{item.nombre}</h4>
                    {item.descripcion && (
                      <p className="cart-item-description">{item.descripcion}</p>
                    )}
                    <span className="cart-item-category">{item.categoria}</span>
                  </div>
                  
                  <div className="cart-item-actions">
                    <div className="cart-item-quantity">
                      <button
                        onClick={() => decreaseQuantity(item.id, item.categoria)}
                        className="quantity-btn"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="quantity">{item.cantidad}</span>
                      <button
                        onClick={() => increaseQuantity(item.id, item.categoria)}
                        className="quantity-btn"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <div className="cart-item-price-row">
                      <span className="cart-item-price">
                        ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id, item.categoria)}
                        className="cart-item-remove"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal">
              <span>Subtotal:</span>
              <span className="subtotal-amount">
                ${getCartTotal().toLocaleString('es-AR')}
              </span>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>
              Continuar con el pedido
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default Cart
import React from 'react'
import { X, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import './Cart.css'

const PROMO_EMPANADAS_CANTIDAD = 12
const PROMO_EMPANADAS_PRECIO   = 27500
const PRECIO_UNITARIO_EMPANADA = 2750

const Cart = () => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    getCartTotal,
  } = useCart()

  const navigate = useNavigate()

  // Calcula cuántas empanadas hay en total en el carrito
  const totalEmpanadas = cartItems
    .filter(i => i.categoria === 'Empanadas')
    .reduce((sum, i) => sum + i.cantidad, 0)

  const docenas = Math.floor(totalEmpanadas / PROMO_EMPANADAS_CANTIDAD)

  // Devuelve el precio a mostrar para cada item
  const getItemPrice = (item) => {
    if (item.categoria !== 'Empanadas' || docenas === 0) {
      return item.precio * item.cantidad
    }
    // Hay promo activa — el precio por empanada es $27500/12
    const precioPorUnidad = PROMO_EMPANADAS_PRECIO / PROMO_EMPANADAS_CANTIDAD
    return Math.round(precioPorUnidad * item.cantidad)
  }

  // Indica si la promo está activa para mostrar badge
  const promoActiva = docenas > 0

  const handleCheckout = () => {
    setIsCartOpen(false)
    navigate('/checkout')
  }

  return (
    <>
      {isCartOpen && (
        <div className="cart-overlay" onClick={() => setIsCartOpen(false)} />
      )}

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
              {/* Banner promo empanadas */}
              {promoActiva && (
                <div className="cart-promo-banner">
                  🎉 ¡Promo docena aplicada! Ahorrás ${(docenas * 5500).toLocaleString('es-AR')}
                </div>
              )}

              {cartItems.map((item) => (
                <div key={`${item.id}-${item.categoria}`} className="cart-item">
                  <div className="cart-item-info">
                    <h4>{item.nombre}</h4>
                    {item.descripcion && (
                      <p className="cart-item-description">{item.descripcion}</p>
                    )}
                    {item.tipoPizza && (
                      <p className="cart-item-description">
                        {item.tipoPizza === 'al_molde' ? '🍕 Al molde' : '🔥 A la piedra'}
                      </p>
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
                        ${getItemPrice(item).toLocaleString('es-AR')}
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
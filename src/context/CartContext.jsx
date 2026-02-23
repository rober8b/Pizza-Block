import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

// ── Promo: 12 empanadas $27.500 en vez de $33.000 ──────────
const PROMO_EMPANADAS_CANTIDAD = 12
const PROMO_EMPANADAS_PRECIO   = 27500

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Cargar carrito del localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('pizzaBlockCart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('pizzaBlockCart', JSON.stringify(cartItems))
  }, [cartItems])

  // Agregar producto al carrito
  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id && item.categoria === product.categoria)
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id && item.categoria === product.categoria
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      }
      
      return [...prevItems, { ...product, cantidad: 1 }]
    })
    setIsCartOpen(true)
  }

  // Remover producto del carrito
  const removeFromCart = (productId, categoria) => {
    setCartItems(prevItems =>
      prevItems.filter(item => !(item.id === productId && item.categoria === categoria))
    )
  }

  // Aumentar cantidad
  const increaseQuantity = (productId, categoria) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId && item.categoria === categoria
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      )
    )
  }

  // Disminuir cantidad
  const decreaseQuantity = (productId, categoria) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId && item.categoria === categoria
          ? { ...item, cantidad: Math.max(1, item.cantidad - 1) }
          : item
      )
    )
  }

  // Limpiar carrito
  const clearCart = () => {
    setCartItems([])
  }

  // Calcular total con promo de empanadas
  const getCartTotal = () => {
    // Contar total de empanadas en el carrito (pueden ser de distintos tipos)
    const totalEmpanadas = cartItems
      .filter(item => item.categoria === 'Empanadas')
      .reduce((sum, item) => sum + item.cantidad, 0)

    // Cuántas docenas completas hay → cada una vale $27.500
    const docenas       = Math.floor(totalEmpanadas / PROMO_EMPANADAS_CANTIDAD)
    const empanadasSueltas = totalEmpanadas % PROMO_EMPANADAS_CANTIDAD

    // Total de empanadas con promo aplicada
    const totalEmpanadasConPromo =
      docenas * PROMO_EMPANADAS_PRECIO +
      empanadasSueltas * 2750 // precio unitario normal

    // Total del resto de productos (todo lo que NO sea empanada)
    const totalResto = cartItems
      .filter(item => item.categoria !== 'Empanadas')
      .reduce((sum, item) => sum + item.precio * item.cantidad, 0)

    return totalEmpanadasConPromo + totalResto
  }

  // Descuento aplicado (útil para mostrarlo en el carrito)
  const getPromoEmpanadasDescuento = () => {
    const totalEmpanadas = cartItems
      .filter(item => item.categoria === 'Empanadas')
      .reduce((sum, item) => sum + item.cantidad, 0)

    const docenas = Math.floor(totalEmpanadas / PROMO_EMPANADAS_CANTIDAD)
    if (docenas === 0) return 0

    const precioNormal = docenas * PROMO_EMPANADAS_CANTIDAD * 2750
    const precioPromo  = docenas * PROMO_EMPANADAS_PRECIO
    return precioNormal - precioPromo // 5500 por docena
  }

  // Obtener cantidad total de items
  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.cantidad, 0)
  }

  const value = {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    getPromoEmpanadasDescuento,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export default CartContext
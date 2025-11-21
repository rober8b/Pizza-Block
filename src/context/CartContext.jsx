import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

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

  // Calcular total
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.precio * item.cantidad), 0)
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
    getCartItemsCount
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export default CartContext
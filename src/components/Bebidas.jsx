import React, { useState, useEffect } from 'react'
import { Search, X, ShoppingCart, Lock, Coffee, Wine } from 'lucide-react'
import BebidasPostresData from '../data/Bebidas-data'
import './Bebidas.css'
import { useCart } from '../context/CartContext'
import { estaAbierto } from '../utils/HorariosService'

const Bebidas = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [abierto, setAbierto] = useState(estaAbierto())
  const { addToCart } = useCart()

  // Verificar estado cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setAbierto(estaAbierto())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const filteredProducts = BebidasPostresData.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Separar por tipo
  const bebidas = filteredProducts.filter(p => p.tipo === 'bebida')
  const postres = filteredProducts.filter(p => p.tipo === 'postre')

  const handleAddToCart = (producto, e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation()
    }
    
    if (!abierto) {
      alert('Lo sentimos, estamos cerrados en este momento. Consulta nuestros horarios de atención.')
      return
    }
    
    addToCart({
      ...producto,
      categoria: 'Bebidas y Postres'
    })
  }

  return (
    <div className='bebidas-container' id='bebidas'>
        
      <div className="section-header">
        <h1 className="section-title">Bebidas</h1>
        <p className="section-subtitle">Complementá tu pedido</p>
      </div>

      {/* Sección Bebidas */}
      <div className="products-grid">
        {bebidas.map(({id, nombre, descripcion, precio}) => (
          <div 
            key={id} 
            className='product-card'
            onClick={() => setSelectedProduct({id, nombre, descripcion, precio})}
          >
            <div className="product-content">
              <h3 className='nombre-product'>{nombre}</h3>
              <span className='precio-product'>${precio.toLocaleString('es-AR')}</span>
            </div>

            <div className="product-footer">
              <button 
                className={`add-to-cart-btn ${!abierto ? 'disabled' : ''}`}
                onClick={(e) => handleAddToCart({id, nombre, descripcion, precio}, e)}
                disabled={!abierto}
              >
                {abierto ? (
                  <>
                    <ShoppingCart size={18} />
                    Agregar
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Cerrado
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>   

      {/* Sección Postres */}
      <div className="section-header">
        <h1 className="section-title">Postres</h1>
      </div>
      <div className="postres-grid">
        {postres.map(({id, nombre, descripcion, precio}) => (
          <div 
            key={id} 
            className='product-card'
            onClick={() => setSelectedProduct({id, nombre, descripcion, precio})}
          >
            <div className="product-content">
              <h3 className='nombre-product'>{nombre}</h3>
              <span className='precio-product'>${precio.toLocaleString('es-AR')}</span>
            </div>

            <div className="product-footer">
              <button 
                className={`add-to-cart-btn ${!abierto ? 'disabled' : ''}`}
                onClick={(e) => handleAddToCart({id, nombre, descripcion, precio}, e)}
                disabled={!abierto}
              >
                {abierto ? (
                  <>
                    <ShoppingCart size={18} />
                    Agregar
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Cerrado
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>   

      {/* Modal de detalles */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="modal-close"
                      onClick={() => setSelectedProduct(null)}
                    >
                      <X size={24} />
                    </button>
                    <h2 className="modal-title">{selectedProduct.nombre}</h2>
                    <p className="modal-description">{selectedProduct.descripcion}</p>
                    <div className="modal-price">
                      <span className="price-label">Precio:</span>
                      <span className="price-value">${selectedProduct.precio.toLocaleString('es-AR')}</span>
                    </div>
                    
                    {!abierto && (
                      <div className="modal-cerrado-aviso">
                        <Lock size={20} />
                        <p>Estamos cerrados. Consultá nuestros horarios de atención.</p>
                      </div>
                    )}
                    
                <button 
                    className={`modal-add-cart ${!abierto ? 'disabled' : ''}`}
                    onClick={() => {
                        if (abierto) {
                          handleAddToCart(selectedProduct)
                          setSelectedProduct(null)
                        } else {
                          alert('Lo sentimos, estamos cerrados en este momento.')
                        }
                    }}
                    disabled={!abierto}
                    >
                    {abierto ? (
                    <>
                        <ShoppingCart size={20} />
                        Agregar al carrito
                    </>
                    ) : (
                    <>
                        <Lock size={20} />
                        Cerrado
                    </>
                      )}
                </button>
            </div>
        </div>
      )}
    </div>
  )
}

export default Bebidas
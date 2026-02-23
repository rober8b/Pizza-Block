import React, { useState, useEffect } from 'react'
import PizzaData from '../data/Pizzas-data'
import './Pizzas.css'
import pizzas_banner from '../assets/pizzas_banner.png'
import { Search, X, ShoppingCart, Lock } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { estaAbierto } from '../utils/HorariosService'

const Pizzas = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPizza, setSelectedPizza] = useState(null)
  const [abierto, setAbierto] = useState(estaAbierto())
  const { addToCart } = useCart()

  // Verificar estado cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setAbierto(estaAbierto())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const filteredProducts = PizzaData.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      categoria: 'Pizzas'
    })
  }

  return (
    <div className='Pizzas-container' id='pizzas'>
      <div className="pizzas_banner">
        <img src={pizzas_banner} alt="Banner de pizza block" />
      </div>

      <div className="section-header">
        <h2 className="section-title">Pizzas</h2>
      </div>

      {/* Buscador */}
      <div className="search-container">
        <div className="search-box">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Buscar pizza..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="clear-search"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Lista de productos */}
      <div className="products-grid">
        {filteredProducts.map(({id, nombre, descripcion, precio}) => (
          <div 
            key={id} 
            className='product-card'
            onClick={() => setSelectedPizza({id, nombre, descripcion, precio})}
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

      {filteredProducts.length === 0 && (
        <div className="no-results">
          <p>No se encontraron pizzas con "{searchTerm}"</p>
        </div>
      )}

      {/* Modal de detalles */}
      {selectedPizza && (
        <div className="modal-overlay" onClick={() => setSelectedPizza(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setSelectedPizza(null)}
            >
              <X size={24} />
            </button>
            <h2 className="modal-title">{selectedPizza.nombre}</h2>
            <p className="modal-description">{selectedPizza.descripcion}</p>
            <div className="modal-price">
              <span className="price-label">Precio:</span>
              <span className="price-value">${selectedPizza.precio.toLocaleString('es-AR')}</span>
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
                  handleAddToCart(selectedPizza)
                  setSelectedPizza(null)
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

export default Pizzas
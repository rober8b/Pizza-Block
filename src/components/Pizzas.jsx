import React, { useState } from 'react'
import productos from '../data/Pizzas-data'
import './Pizzas.css'
import pizzas_banner from '../assets/pizzas_banner.png'
import { Search, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { ShoppingCart } from 'lucide-react'

const Pizzas = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPizza, setSelectedPizza] = useState(null)
  const { addToCart } = useCart()

  // Filtrar productos según búsqueda
  const filteredProducts = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddToCart = (producto, e) => {
  e.stopPropagation()
  addToCart({
    ...producto,
    categoria: 'Milanesas' // Cambiar según el componente
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
              <p className='descrip-product'>{descripcion}</p>
            </div>
            <div className="product-price">
              <span className='precio-product'>${precio.toLocaleString('es-AR')}</span>
            </div>
            <button 
              className="add-to-cart-btn"
              onClick={(e) => handleAddToCart(producto, e)}
            >
              <ShoppingCart size={18} />
              Agregar
            </button>
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
            <div className="modal-info">
              <p>Para hacer tu pedido, contactanos por WhatsApp</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Pizzas
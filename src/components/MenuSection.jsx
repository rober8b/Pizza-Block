import React, { useState } from 'react'
import { Search, X } from 'lucide-react'
import './MenuSection.css'

const MenuSection = ({ id, title, banner, productos }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)

  const filteredProducts = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className='menu-section' id={id}>
      {banner && (
        <div className="section-banner">
          <img src={banner} alt={`Banner de ${title}`} />
        </div>
      )}

      <div className="section-header">
        <h2 className="section-title">{title}</h2>
      </div>

      {/* Buscador */}
      <div className="search-container">
        <div className="search-box">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder={`Buscar ${title.toLowerCase()}...`}
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
            onClick={() => setSelectedItem({id, nombre, descripcion, precio})}
          >
            <div className="product-content">
              <h3 className='nombre-product'>{nombre}</h3>
              {descripcion && <p className='descrip-product'>{descripcion}</p>}
            </div>
            <div className="product-price">
              <span className='precio-product'>${precio.toLocaleString('es-AR')}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-results">
          <p>No se encontraron resultados para "{searchTerm}"</p>
        </div>
      )}

      {/* Modal de detalles */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setSelectedItem(null)}
            >
              <X size={24} />
            </button>
            <h2 className="modal-title">{selectedItem.nombre}</h2>
            {selectedItem.descripcion && (
              <p className="modal-description">{selectedItem.descripcion}</p>
            )}
            <div className="modal-price">
              <span className="price-label">Precio:</span>
              <span className="price-value">${selectedItem.precio.toLocaleString('es-AR')}</span>
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

export default MenuSection
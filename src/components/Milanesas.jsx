import React, { useState } from 'react'
import { Search, X } from 'lucide-react'
import Milanesas_banner from '../assets/Milanesas_banner.png'
import milanesasData from '../data/Milanesas-data'
import './Milanesas.css'
import BannerSandwiches from '../assets/Milanesas_banner_2.png'
import sandwichesData from '../data/Sandwiches-data'
import fritasExtra_image from '../assets/extra_fritas-image.png'
import papasData from '../data/Papas-data'

const Milanesas = () => {
  const [searchMilanesas, setSearchMilanesas] = useState('')
  const [searchSandwiches, setSearchSandwiches] = useState('')
  const [searchPapas, setSearchPapas] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)

  // Filtrar productos según búsqueda
  const filteredMilanesas = milanesasData.filter(producto =>
    producto.nombre.toLowerCase().includes(searchMilanesas.toLowerCase()) ||
    (producto.descripcion && producto.descripcion.toLowerCase().includes(searchMilanesas.toLowerCase()))
  )

  const filteredSandwiches = sandwichesData.filter(producto =>
    producto.nombre.toLowerCase().includes(searchSandwiches.toLowerCase()) ||
    (producto.descripcion && producto.descripcion.toLowerCase().includes(searchSandwiches.toLowerCase()))
  )

  const filteredPapas = papasData.filter(producto =>
    producto.nombre.toLowerCase().includes(searchPapas.toLowerCase())
  )

  const openModal = (item) => {
    setSelectedItem(item)
  }

  const closeModal = () => {
    setSelectedItem(null)
  }

  return (
    <div className='milanesas-container' id='milanesas'>
      {/* Sección Milanesas */}
      <div className="milanesas_banner">
        <img src={Milanesas_banner} alt="Banner de Milanesas" />
      </div>

      <div className="section-header">
        <h2 className="section-title">Milanesas</h2>
      </div>

      {/* Buscador Milanesas */}
      <div className="search-container">
        <div className="search-box">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Buscar milanesa..."
            value={searchMilanesas}
            onChange={(e) => setSearchMilanesas(e.target.value)}
            className="search-input"
          />
          {searchMilanesas && (
            <button 
              onClick={() => setSearchMilanesas('')}
              className="clear-search"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Grid de Milanesas */}
      <div className="products-grid">
        {filteredMilanesas.map(({id, nombre, descripcion, precio}) => (
          <div 
            key={id} 
            className='product-card'
            onClick={() => openModal({nombre, descripcion, precio})}
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

      {filteredMilanesas.length === 0 && (
        <div className="no-results">
          <p>No se encontraron milanesas con "{searchMilanesas}"</p>
        </div>
      )}

      {/* Sección Papas */}
      <div className="papas_banner">
        <img className="papas_extra-img" src={fritasExtra_image} alt="Papas extras" />
      </div>

      <div className="section-header">
        <h2 className="section-title-small">Papas</h2>
      </div>

      {/* Grid de Papas */}
      <div className="products-grid">
        {filteredPapas.map(({id, nombre, precio}) => (
          <div 
            key={id} 
            className='product-card product-card-simple'
            onClick={() => openModal({nombre, descripcion: '', precio})}
          >
            <div className="product-content">
              <h3 className='nombre-product'>{nombre}</h3>
            </div>
            <div className="product-price">
              <span className='precio-product'>${precio.toLocaleString('es-AR')}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredPapas.length === 0 && (
        <div className="no-results">
          <p>No se encontraron papas con "{searchPapas}"</p>
        </div>
      )}

      {/* Sección Sandwiches */}
      <div className="banner_sandwiches">
        <img className='banner_sandwiches-img' src={BannerSandwiches} alt="Banner de Sandwiches" />
      </div>

      <div className="section-header">
        <h2 className="section-title">Sandwiches</h2>
      </div>

      {/* Grid de Sandwiches */}
      <div className="products-grid">
        {filteredSandwiches.map(({id, nombre, descripcion, precio}) => (
          <div 
            key={id} 
            className='product-card'
            onClick={() => openModal({nombre, descripcion, precio})}
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

      {filteredSandwiches.length === 0 && (
        <div className="no-results">
          <p>No se encontraron sandwiches con "{searchSandwiches}"</p>
        </div>
      )}

      {/* Modal de detalles */}
      {selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={closeModal}
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

export default Milanesas
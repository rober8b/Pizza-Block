import React, { useState, useEffect } from 'react'
import { Search, X, ShoppingCart, Lock } from 'lucide-react'
import Milanesas_banner from '../assets/Milanesas_banner.png'
import milanesasData from '../data/Milanesas-data'
import './Milanesas.css'
import BannerSandwiches from '../assets/Milanesas_banner_2.png'
import sandwichesData from '../data/Sandwiches-data'
import fritasExtra_image from '../assets/extra_fritas-image.png'
import papasData from '../data/Papas-data'
import { useCart } from '../context/CartContext'
import MilanesaConfigModal from './MilanesaConfigModal' 
import SandwichConfigModal from './SandwichConfigModal'
import { estaAbierto } from '../utils/HorariosService'

const Milanesas = () => {
  const [searchMilanesas, setSearchMilanesas] = useState('')
  const [searchSandwiches, setSearchSandwiches] = useState('')
  const [searchPapas, setSearchPapas] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [milanesaToConfig, setMilanesaToConfig] = useState(null)
  const [sandwichToConfig, setSandwichToConfig] = useState(null)
  const [abierto, setAbierto] = useState(estaAbierto())
  const { addToCart } = useCart()

  // Verificar estado cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setAbierto(estaAbierto())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

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

  const handleAddToCart = (producto, categoria, e) => {
    e.stopPropagation()
    
    if (!abierto) {
      alert('Lo sentimos, estamos cerrados en este momento. Consulta nuestros horarios de atención.')
      return
    }
    
    if (categoria === 'Milanesas') {
      setMilanesaToConfig({
        ...producto,
        categoria: categoria
      })
    } else if (categoria === 'Sandwiches') {
      setSandwichToConfig({
        ...producto,
        categoria: categoria
      })
    } else {
      addToCart({
        ...producto,
        categoria: categoria
      })
    }
  }

  const handleConfirmMilanesa = (configuredItem) => {
    let descripcionCompleta = configuredItem.descripcion || ''
    descripcionCompleta += `\n🥩 ${configuredItem.tipoCarne === 'carne' ? 'Carne' : 'Pollo'}`
    
    if (configuredItem.extraPapas) {
      descripcionCompleta += `\n🍟 ${configuredItem.extraPapas.nombre}`
    } else {
      descripcionCompleta += '\n🍟 Papas incluidas'
    }

    addToCart({
      ...configuredItem,
      descripcion: descripcionCompleta.trim(),
      precio: configuredItem.precioFinal
    })

    setMilanesaToConfig(null)
  }

  const handleConfirmSandwich = (configuredItem) => {
    addToCart({
      ...configuredItem,
      precio: configuredItem.precioFinal
    })

    setSandwichToConfig(null)
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
            onClick={() => setSelectedItem({id, nombre, descripcion, precio, categoria: 'Milanesas'})}
          >
            <div className="product-content">
              <h3 className='nombre-product'>{nombre}</h3>
              <span className='precio-product'>${precio.toLocaleString('es-AR')}</span>
            </div>
            <div className="product-footer">
              <button 
                className={`add-to-cart-btn ${!abierto ? 'disabled' : ''}`}
                onClick={(e) => handleAddToCart({id, nombre, descripcion, precio}, 'Milanesas', e)}
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
            onClick={() => setSelectedItem({id, nombre, descripcion: '', precio, categoria: 'Papas'})}
          >
            <div className="product-content">
              <h3 className='nombre-product'>{nombre}</h3>
              <span className='precio-product'>${precio.toLocaleString('es-AR')}</span>
            </div>
            <div className="product-footer">
              <button 
                className={`add-to-cart-btn ${!abierto ? 'disabled' : ''}`}
                onClick={(e) => handleAddToCart({id, nombre, precio}, 'Papas', e)}
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
            onClick={() => setSelectedItem({id, nombre, descripcion, precio, categoria: 'Sandwiches'})}
          >
            <div className="product-content">
              <h3 className='nombre-product'>{nombre}</h3>
              <span className='precio-product'>${precio.toLocaleString('es-AR')}</span>
            </div>
            <div className="product-footer">
              <button 
                className={`add-to-cart-btn ${!abierto ? 'disabled' : ''}`}
                onClick={(e) => handleAddToCart({id, nombre, descripcion, precio}, 'Sandwiches', e)}
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

      {filteredSandwiches.length === 0 && (
        <div className="no-results">
          <p>No se encontraron sandwiches con "{searchSandwiches}"</p>
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
                  handleAddToCart(selectedItem, selectedItem.categoria, { stopPropagation: () => {} })
                  setSelectedItem(null)
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

      {/* Modal de configuración de milanesa */}
      {milanesaToConfig && (
        <MilanesaConfigModal
          item={milanesaToConfig}
          onClose={() => setMilanesaToConfig(null)}
          onConfirm={handleConfirmMilanesa}
        />
      )}

      {/* Modal de configuración de sandwich */}
      {sandwichToConfig && (
        <SandwichConfigModal
          item={sandwichToConfig}
          onClose={() => setSandwichToConfig(null)}
          onConfirm={handleConfirmSandwich}
        />
      )}
    </div>
  )
}

export default Milanesas
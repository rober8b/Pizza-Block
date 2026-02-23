import React, { useState, useEffect } from 'react'
import { Search, X, ShoppingBag, ShoppingCart, Lock } from 'lucide-react'
import banner_empanadas from '../assets/banner_empanadas.png'
import "./Empanadas.css"
import empanada from '../assets/empanadas.png'
import Precio_empanadas from '../assets/Precio_empanadas.png'
import Linea_larga from '../assets/linea.png'
import { useCart } from '../context/CartContext'
import { estaAbierto } from '../utils/HorariosService'

const Empanadas = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmpanada, setSelectedEmpanada] = useState(null)
  const [abierto, setAbierto] = useState(estaAbierto())
  const { addToCart } = useCart()

  // Verificar estado cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setAbierto(estaAbierto())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Lista de sabores de empanadas
  const sabores = [
    { id: 1, nombre: 'Jamón y Mozzarella', descripcion: 'Jamón cocido y queso mozzarella', precio: 2750 },
    { id: 2, nombre: 'Cebolla y Mozzarella', descripcion: 'Cebolla caramelizada con mozzarella', precio: 2750 },
    { id: 3, nombre: 'Salchicha y Mozzarella', descripcion: 'Salchicha con queso mozzarella', precio: 2750 },
    { id: 4, nombre: 'Carne Picante', descripcion: 'Carne picada con ají y especias', precio: 2750 },
    { id: 5, nombre: 'Carne', descripcion: 'Carne picada, cebolla y especias', precio: 2750 },
    { id: 6, nombre: 'Pollo', descripcion: 'Pollo desmenuzado con especias', precio: 2750 },
    { id: 7, nombre: 'Caprese', descripcion: 'Tomate, mozzarella y albahaca', precio: 2750},
    { id: 8, nombre: 'Roquefort', descripcion: 'Queso roquefort cremoso', precio: 2750 },
    { id: 9, nombre: 'Verdura', descripcion: 'Acelga, cebolla y especias', precio: 2750 },
    { id: 10, nombre: 'Humita', descripcion: 'Choclo molido con salsa blanca', precio: 2750 },
    { id: 11, nombre: 'Calabresa', descripcion: 'Calabresa con especias', precio: 2750 }
  ]

  const filteredSabores = sabores.filter(sabor =>
    sabor.nombre.toLowerCase().includes(searchTerm.toLowerCase())
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
      categoria: 'Empanadas'
    })
  }

  return (
    <div className='empanadas-container' id='empanadas'>
      <div className="empanadas_banner">
        <img src={banner_empanadas} alt="Banner de empanadas block" />
      </div>

      <div className="section-header">
        <h2 className="section-title">Nuestros Sabores</h2>
        <p className="section-subtitle">Empanadas artesanales hechas al momento</p>
      </div>

      {/* Buscador */}
      <div className="search-container">
        <div className="search-box">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Buscar sabor..."
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

      {/* Grid de sabores */}
      <div className="sabores-grid">
        {filteredSabores.map((sabor) => (
          <div 
            key={sabor.id} 
            className='sabor-card'
            onClick={() => setSelectedEmpanada(sabor)}
          >
            <div className="empanadas-content">
              <h3 className='sabor-nombre'>{sabor.nombre}</h3>
              <span className='sabor-precio'>${sabor.precio.toLocaleString('es-AR')}</span>
            </div>
            
            <div className="sabor-footer">              
              <button 
                className={`add-to-cart-btn-empanada ${!abierto ? 'disabled' : ''}`}
                onClick={(e) => handleAddToCart(sabor, e)}
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

      {filteredSabores.length === 0 && (
        <div className="no-results">
          <p>No se encontraron sabores con "{searchTerm}"</p>
        </div>
      )}

      {/* Precio */}
      <div className="empanadas_precio">
        <img src={Precio_empanadas} alt="Precios de empanadas" />
      </div>

      <div className="linea_div">
        <img className='linea_div-img' src={Linea_larga} alt="linea divisoria" />
      </div>

      {/* Modal de detalles */}
      {selectedEmpanada && (
        <div className="modal-overlay" onClick={() => setSelectedEmpanada(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setSelectedEmpanada(null)}
            >
              <X size={24} />
            </button>
            <div className="modal-icon">
              <img src={empanada} alt="empanadas block" />
            </div>
            <h2 className="modal-title">{selectedEmpanada.nombre}</h2>
            <p className="modal-description">{selectedEmpanada.descripcion}</p>
            <div className="modal-price">
              <span className="price-label">Precio:</span>
              <span className="price-value">${selectedEmpanada.precio.toLocaleString('es-AR')}</span>
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
                  handleAddToCart(selectedEmpanada)
                  setSelectedEmpanada(null)
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

export default Empanadas
import React, { useState } from 'react'
import { Search, X, ShoppingBag } from 'lucide-react'
import banner_empanadas from '../assets/banner_empanadas.png'
import "./Empanadas.css"
import Precio_empanadas from '../assets/Precio_empanadas.png'
import Linea_larga from '../assets/linea.png'
import { useCart } from '../context/CartContext'
import { ShoppingCart } from 'lucide-react'

const Empanadas = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmpanada, setSelectedEmpanada] = useState(null)
  const { addToCart } = useCart()

  // Lista de sabores de empanadas
  const sabores = [
    { id: 1, nombre: 'Jamón y Mozzarella', descripcion: 'Jamón cocido y queso mozzarella' },
    { id: 2, nombre: 'Cebolla y Mozzarella', descripcion: 'Cebolla caramelizada con mozzarella' },
    { id: 3, nombre: 'Salchicha y Mozzarella', descripcion: 'Salchicha con queso mozzarella' },
    { id: 4, nombre: 'Carne Picante', descripcion: 'Carne picada con ají y especias' },
    { id: 5, nombre: 'Carne', descripcion: 'Carne picada, cebolla y especias' },
    { id: 6, nombre: 'Pollo', descripcion: 'Pollo desmenuzado con especias' },
    { id: 7, nombre: 'Caprese', descripcion: 'Tomate, mozzarella y albahaca' },
    { id: 8, nombre: 'Roquefort', descripcion: 'Queso roquefort cremoso' },
    { id: 9, nombre: 'Verdura', descripcion: 'Acelga, cebolla y especias' },
    { id: 10, nombre: 'Humita', descripcion: 'Choclo molido con salsa blanca' },
    { id: 11, nombre: 'Calabresa', descripcion: 'Calabresa con especias' }
  ]

  const filteredSabores = sabores.filter(sabor =>
    sabor.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddToCart = (producto, e) => {
  e.stopPropagation()
  addToCart({
    ...producto,
    categoria: 'Milanesas' // Cambiar según el componente
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
            <div className="sabor-icon">
              <ShoppingBag size={24} />
            </div>
            <h3 className='sabor-nombre'>{sabor.nombre}</h3>
            <p className='sabor-descripcion'>{sabor.descripcion}</p>

            <button className="add-to-cart-btn" 
            onClick={(e) => handleAddToCart(producto, e)}>
            <ShoppingCart size={18} />  
            Agregar 
            </button>
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
              <ShoppingBag size={48} />
            </div>
            <h2 className="modal-title">{selectedEmpanada.nombre}</h2>
            <p className="modal-description">{selectedEmpanada.descripcion}</p>
            <div className="modal-info">
              <p>Consultá precios y hacé tu pedido por WhatsApp</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Empanadas
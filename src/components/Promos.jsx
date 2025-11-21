import React, { useState } from 'react'
import { X, Tag, Package } from 'lucide-react'
import delivery_image from '../assets/delivery.png'
import './Promos.css'

const Promos = () => {
  const [showModal, setShowModal] = useState(false)
  const [selectedPromo, setSelectedPromo] = useState(null)

  // Datos de las promos basados en tu imagen
  const promos = [
    {
      id: 1,
      numero: '1',
      nombre: 'Promo Clásica',
      descripcion: '1 Mozzarella + 12 Empanadas',
      precio: 40000,
      detalle: 'Pizza grande de mozzarella más una docena de empanadas del sabor que elijas.'
    },
    {
      id: 2,
      numero: '2',
      nombre: 'Promo Empanadas',
      descripcion: '24 Empanadas',
      precio: 50000,
      detalle: '2 docenas de empanadas surtidas de los sabores que prefieras.'
    },
    {
      id: 3,
      numero: '3',
      nombre: 'Promo Triple Mozza',
      descripcion: '3 Grandes de Mozzarella',
      precio: 40000,
      detalle: '3 pizzas grandes de mozzarella, ideal para compartir en familia.'
    }
  ]

  const openPromoModal = (promo) => {
    setSelectedPromo(promo)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedPromo(null)
  }

  return (
    <div className='container-promos' id='promos'>
      <div className="banner_promos">
        <img className='banner_delivery-img' src={delivery_image} alt="Delivery disponible" />
      </div>

      <div className="promos-intro">
        <Package className="intro-icon" size={40} />
        <h2>Promociones Especiales</h2>
        <p>¡Aprovechá nuestras increíbles promos sin cargo de delivery!</p>
      </div>

      {/* Grid de promos */}
      <div className="promos-grid">
        {promos.map((promo) => (
          <div 
            key={promo.id} 
            className='promo-card'
            onClick={() => openPromoModal(promo)}
          >
            <div className="promo-badge">
              <Tag size={20} />
              <span>PROMO {promo.numero}</span>
            </div>
            <div className="promo-content">
              <h3 className='promo-nombre'>{promo.nombre}</h3>
              <p className='promo-descripcion'>{promo.descripcion}</p>
            </div>
            <div className="promo-footer">
              <span className='promo-precio'>${promo.precio.toLocaleString('es-AR')}</span>
              <button className="promo-btn">Ver detalles</button>
            </div>
          </div>
        ))}
      </div>
      

      {/* Modal de detalles */}
      {showModal && selectedPromo && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={closeModal}
            >
              <X size={24} />
            </button>
            <div className="modal-promo-badge">
              PROMO {selectedPromo.numero}
            </div>
            <h2 className="modal-title">{selectedPromo.nombre}</h2>
            <div className="modal-promo-description">
              <p className="modal-items">{selectedPromo.descripcion}</p>
              <p className="modal-detail">{selectedPromo.detalle}</p>
            </div>
            <div className="modal-price">
              <span className="price-label">Precio especial:</span>
              <span className="price-value">${selectedPromo.precio.toLocaleString('es-AR')}</span>
            </div>
            <div className="modal-delivery-badge">
              🛵 Delivery sin cargo
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

export default Promos
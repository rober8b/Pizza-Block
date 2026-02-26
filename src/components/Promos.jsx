import React, { useState, useEffect } from 'react'
import { X, Tag, Package, ShoppingCart, Lock } from 'lucide-react'
import delivery_image from '../assets/delivery.png'
import './Promos.css'
import { useCart } from '../context/CartContext'
import { estaAbierto } from '../utils/HorariosService'

const Promos = () => {
  const [showModal, setShowModal] = useState(false)
  const [selectedPromo, setSelectedPromo] = useState(null)
  const [abierto, setAbierto] = useState(estaAbierto())
  const { addToCart } = useCart()
  const [configuracion, setConfiguracion] = useState({})

  // Verificar estado cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setAbierto(estaAbierto())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

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
    setConfiguracion({})
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedPromo(null)
  }

  const handleAddToCart = (promo, e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation()
    }
    
    if (!abierto) {
      alert('Lo sentimos, estamos cerrados en este momento. Consulta nuestros horarios de atención.')
      return
    }
    
    addToCart({
      ...promo,
      categoria: 'Promos',
      configuracion
    })
  }
  
  const getMaxEmpanadas = () => {
    if (selectedPromo?.id === 1) return 12
    if (selectedPromo?.id === 2) return 24
    return 0
  }

  const getTotalEmpanadas = () => {
    const emp = configuracion.empanadas || {}
    return Object.values(emp).reduce((a, b) => a + b, 0)
  }

  const changeEmpanadaCantidad = (gusto, delta) => {
    setConfiguracion(prev => {
      const emp = prev.empanadas || {}
      const actual = emp[gusto] || 0
      const total = Object.values(emp).reduce((a,b)=>a+b,0)
      const max = getMaxEmpanadas()

      // evitar superar máximo
      if (delta > 0 && total >= max) return prev

      const nuevaCantidad = Math.max(0, actual + delta)

      return {
        ...prev,
        empanadas: {
          ...emp,
          [gusto]: nuevaCantidad
        }
      }
    })
  }

  const setPizzaTipo = (index, tipo) => {
    setConfiguracion(prev => {
      const pizzas = prev.pizzas || {}
      return {
        ...prev,
        pizzas: {
          ...pizzas,
          [index]: tipo
        }
      }
    })
  }

  const gustosEmpanadas = [
      'Carne',
      'Jamón y Mozzarella',
      'Pollo',
      'Caprese',
      'Humita',
      'Roquefort',
      'Verdura',
      'Carne picante',
      'Cebolla y Mozzarella',
      'Salchicha y Mozzarella',
      'Calabresa'
  ]

  const isPromoComplete = () => {
    if (!selectedPromo) return false

    // PROMO 1
    if (selectedPromo.id === 1) {
      const total = getTotalEmpanadas()
      return !!configuracion.pizzaTipo && total === 12
    }

    // PROMO 2
    if (selectedPromo.id === 2) {
      const total = getTotalEmpanadas()
      return total === 24
    }

    // PROMO 3
    if (selectedPromo.id === 3) {
      const pizzas = configuracion.pizzas || {}
      return pizzas[1] && pizzas[2] && pizzas[3]
    }

    return true
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
                <button 
                  className={`add-to-cart-btn-promo ${!abierto ? 'disabled' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    openPromoModal(promo)
                  }}
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
            <h2 className="modal-title-promo">{selectedPromo.nombre}</h2>
            <div className="modal-promo-description">
              <p className="modal-items">{selectedPromo.descripcion}</p>
              <p className="modal-detail">{selectedPromo.detalle}</p>
            </div>
            {/* CONFIGURADOR PROMOS */}
            <div className="promo-config">
              {/* PROMO 1 */}
              {selectedPromo.id === 1 && (
                <>
                  <h4>Tipo de pizza</h4>
                  <div className="config-options">
                    {['Molde', 'Piedra'].map(tipo => (
                      <button
                        key={tipo}
                        className={`config-btn ${configuracion.pizzaTipo === tipo ? 'active' : ''}`}
                        onClick={() => setConfiguracion(prev => ({ ...prev, pizzaTipo: tipo }))}
                      >
                        {tipo}
                      </button>
                    ))}
                  </div>

                  <h4>
                    Elegí las empanadas ({getTotalEmpanadas()}/12)
                  </h4>
                  <div className="empanadas-list">
                    {gustosEmpanadas.map(gusto => {
                      const cantidad = configuracion.empanadas?.[gusto] || 0

                      return (
                        <div key={gusto} className="emp-row">
                          <span>{gusto}</span>

                          <div className="contador">
                            <button onClick={() => changeEmpanadaCantidad(gusto,-1)}>-</button>
                            <span>{cantidad}</span>
                            <button
                              onClick={() => changeEmpanadaCantidad(gusto,1)}
                              disabled={getTotalEmpanadas() >= 12}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {/* PROMO 2 */}
              {selectedPromo.id === 2 && (
                <>
                  <h4>
                    Elegí las empanadas ({getTotalEmpanadas()}/24)
                  </h4>

                  <div className="empanadas-list">
                    {gustosEmpanadas.map(gusto => {
                      const cantidad = configuracion.empanadas?.[gusto] || 0

                      return (
                        <div key={gusto} className="emp-row">
                          <span>{gusto}</span>

                          <div className="contador">
                            <button onClick={() => changeEmpanadaCantidad(gusto,-1)}>-</button>
                            <span>{cantidad}</span>
                            <button
                              onClick={() => changeEmpanadaCantidad(gusto,1)}
                              disabled={getTotalEmpanadas() >= 24}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {/* PROMO 3 */}
              {selectedPromo.id === 3 && (
                <>
                  <h4>Tipo de cada pizza</h4>
                  {[1,2,3].map(i => (
                    <div key={i} className="pizza-select-row">
                      <span>Pizza {i}</span>
                      <div className="config-options">
                        {['Molde','Piedra'].map(tipo => (
                          <button
                            key={tipo}
                            className={`config-btn ${(configuracion.pizzas?.[i]) === tipo ? 'active' : ''}`}
                            onClick={() => setPizzaTipo(i, tipo)}
                          >
                            {tipo}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
            <div className="modal-price">
              <span className="price-label">Precio especial:</span>
              <span className="price-value">${selectedPromo.precio.toLocaleString('es-AR')}</span>
            </div>
            
            {!abierto && (
              <div className="modal-cerrado-aviso">
                <Lock size={20} />
                <p>Estamos cerrados. Consultá nuestros horarios de atención.</p>
              </div>
            )}
            
            <button 
              className={`modal-add-cart ${(!abierto || !isPromoComplete()) ? 'disabled' : ''}`}
              onClick={() => {
                if (abierto && isPromoComplete()) {
                  addToCart({
                    ...selectedPromo,
                    categoria: 'Promos',
                    configuracion
                  })
                  closeModal()
                } else {
                  alert('Lo sentimos, estamos cerrados en este momento.')
                }
              }}
              disabled={!abierto || !isPromoComplete()}
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
            {!isPromoComplete() && (
              <div className="modal-validation">
                ⚠️ Completá la configuración para continuar
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Promos
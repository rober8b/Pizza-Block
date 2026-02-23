import React, { useState, useEffect } from 'react'
import { Clock, AlertCircle, CheckCircle, X, Info } from 'lucide-react'
import { getMensajeEstado, getHorariosCompletos } from '../utils/HorariosService'
import './HorariosBanner.css'

const HorariosBanner = () => {
  const [estado, setEstado] = useState(getMensajeEstado())
  const [showModal, setShowModal] = useState(false)
  const [showBanner, setShowBanner] = useState(true)
  const [autoHidden, setAutoHidden] = useState(false)

  useEffect(() => {
    // Actualizar estado cada minuto (sin mostrar banner automáticamente)
    const interval = setInterval(() => {
      setEstado(getMensajeEstado())
    }, 60000) // 60 segundos

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Ocultar banner después de 15 segundos solo la primera vez
    if (showBanner && !autoHidden) {
      const timer = setTimeout(() => {
        setShowBanner(false)
        setAutoHidden(true) // Marcar que ya se ocultó automáticamente
      }, 15000) // 15 segundos

      return () => clearTimeout(timer)
    }
  }, [showBanner, autoHidden])

  const getIcon = () => {
    if (estado.tipo === 'success') return <CheckCircle size={20} />
    if (estado.tipo === 'warning') return <Clock size={20} />
    return <AlertCircle size={20} />
  }

  const horarios = getHorariosCompletos()

  const handleToggleBanner = () => {
    setShowBanner(true)
    setAutoHidden(true) // Evitar que se oculte automáticamente de nuevo
  }

  // Si el banner está oculto, mostrar solo un botón pequeño
  if (!showBanner) {
    return (
      <div className="horarios-floating-btn">
        <button 
          className="horarios-toggle-btn"
          onClick={handleToggleBanner}
          title="Ver estado y horarios"
        >
          <Clock size={20} />
        </button>
      </div>
    )
  }

  return (
    <>
      <div className={`horarios-banner ${estado.tipo} ${showBanner ? 'visible' : 'hidden'}`}>
        <div className="horarios-banner-content">
          {getIcon()}
          <span className="horarios-mensaje">{estado.mensaje}</span>
          <button 
            className="horarios-info-btn"
            onClick={() => setShowModal(true)}
            title="Ver horarios completos"
          >
            <Info size={18} />
          </button>
          <button 
            className="horarios-close-btn"
            onClick={() => setShowBanner(false)}
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Modal de Horarios */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-horarios-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setShowModal(false)}
            >
              <X size={24} />
            </button>
            
            <div className="modal-horarios-header">
              <Clock size={32} />
              <h2>Horarios de Atención</h2>
            </div>

            <div className="horarios-lista">
              {horarios.map((dia, index) => (
                <div key={index} className={`horario-item ${dia.horarios === 'Cerrado' ? 'cerrado' : ''}`}>
                  <span className="horario-dia">{dia.dia}</span>
                  <span className="horario-horas">{dia.horarios}</span>
                </div>
              ))}
            </div>

            <div className="horarios-nota">
              <p>📍 Hacemos delivery en toda la zona</p>
              <p>🍕 Los pedidos se toman solo en estos horarios</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default HorariosBanner
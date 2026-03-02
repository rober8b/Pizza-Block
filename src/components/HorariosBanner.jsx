import React, { useState, useEffect } from 'react'
import { Clock, AlertCircle, CheckCircle, X, Info } from 'lucide-react'
import { getMensajeEstado, getHorariosCompletos } from '../utils/HorariosService'
import { supabase } from '../lib/supabase'
import './HorariosBanner.css'

const HorariosBanner = () => {
  const [estado, setEstado] = useState(getMensajeEstado())
  const [showModal, setShowModal] = useState(false)
  const [showBanner, setShowBanner] = useState(true)
  const [autoHidden, setAutoHidden] = useState(false)
  const [vacaciones, setVacaciones] = useState(null)

  const checkVacaciones = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracion')
        .select('valor')
        .eq('id', 'vacaciones')
        .single()

      if (!activo || !fechaInicio || !fechaFin) { setVacaciones(null); return }

      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      const desdeDate = new Date(fechaInicio)
      const hastaDate = new Date(fechaFin)
      hastaDate.setHours(23, 59, 59, 999)

      if (hoy >= desdeDate && hoy <= hastaDate) {
        setVacaciones(data.valor)
      } else {
        setVacaciones(null)
      }
    } catch (e) {
      setVacaciones(null)
    }
  }

  useEffect(() => {
    checkVacaciones()
    const interval = setInterval(() => {
      setEstado(getMensajeEstado())
      checkVacaciones()
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (showBanner && !autoHidden) {
      const timer = setTimeout(() => {
        setShowBanner(false)
        setAutoHidden(true)
      }, 15000)
      return () => clearTimeout(timer)
    }
  }, [showBanner, autoHidden])

  const horarios = getHorariosCompletos()

  const handleToggleBanner = () => {
    setShowBanner(true)
    setAutoHidden(true)
  }

  // ── Modo vacaciones ──────────────────────────────────────
  if (vacaciones) {
    const reabreDate = new Date(vacaciones.fechaFin)
    reabreDate.setDate(reabreDate.getDate() + 1)
    const reabreDia = reabreDate.toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long'
    })

    return (
      <div className="vacaciones-banner">
        <div className="vacaciones-banner-content">
          <span className="vacaciones-icon">🍕</span>
          <div className="vacaciones-texto">
            <strong>¡Estamos de vacaciones!</strong>
            <span>Reabrimos el {reabreDia} — ¡Gracias por tu paciencia!</span>
          </div>
        </div>
      </div>
    )
  }

  // ── Modo normal ──────────────────────────────────────────
  const getIcon = () => {
    if (estado.tipo === 'success') return <CheckCircle size={20} />
    if (estado.tipo === 'warning') return <Clock size={20} />
    return <AlertCircle size={20} />
  }

  if (!showBanner) {
    return (
      <div className="horarios-floating-btn">
        <button className="horarios-toggle-btn" onClick={handleToggleBanner} title="Ver estado y horarios">
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
          <button className="horarios-info-btn" onClick={() => setShowModal(true)} title="Ver horarios completos">
            <Info size={18} />
          </button>
          <button className="horarios-close-btn" onClick={() => setShowBanner(false)} title="Cerrar">
            <X size={18} />
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-horarios-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
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
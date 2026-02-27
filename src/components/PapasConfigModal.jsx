import React, { useState } from 'react';
import { X, ShoppingCart, Check } from 'lucide-react';

const PapasConfigModal = ({ item, onClose, onConfirm }) => {
  const [extrasSeleccionados, setExtrasSeleccionados] = useState([])
  const [errorExtras, setErrorExtras] = useState('')

  const extrasOptions = [
    { id: 'ninguno',   nombre: 'Sin extra',                    precio: 0 },
    { id: 'cheddar',   nombre: 'Cheddar con Panceta y Verdeo', precio: 7500 },
    { id: 'huevos',    nombre: 'Huevos Fritos',                precio: 5000 },
    { id: 'provenzal', nombre: 'Provenzal',                    precio: 5000 },
  ]

  const handleExtraClick = (extraId) => {
    setErrorExtras('')
    if (extraId === 'ninguno') {
      setExtrasSeleccionados(['ninguno'])
      return
    }
    setExtrasSeleccionados(prev => {
      const sinNinguno = prev.filter(e => e !== 'ninguno')
      return sinNinguno.includes(extraId)
        ? sinNinguno.filter(e => e !== extraId)
        : [...sinNinguno, extraId]
    })
  }

  const precioExtras = extrasSeleccionados
    .filter(id => id !== 'ninguno')
    .reduce((sum, id) => sum + (extrasOptions.find(e => e.id === id)?.precio || 0), 0)

  const precioFinalTotal = item.precio + precioExtras

  const handleConfirm = () => {
    if (extrasSeleccionados.length === 0) {
      setErrorExtras('Debes seleccionar una opción')
      return
    }

    const sinNinguno = extrasSeleccionados.filter(id => id !== 'ninguno')
    const extrasFinales = sinNinguno.length === 0
      ? null
      : sinNinguno.map(id => extrasOptions.find(e => e.id === id))

    // Construir descripción
    let descripcionCompleta = item.descripcion || ''
    if (extrasFinales && extrasFinales.length > 0) {
      descripcionCompleta += `\n🍟 Con ${extrasFinales.map(e => e.nombre).join(', ')}`
    }

    onConfirm({
      ...item,
      extraPapas: extrasFinales,
      descripcion: descripcionCompleta.trim(),
      precioFinal: precioFinalTotal
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-config" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-scroll-content">
          <h2 className="modal-title">Configurá tus Papas</h2>
          <p className="modal-subtitle">{item.nombre}</p>

          <div className="config-section">
            <h3 className="config-title">
              Extras <span className="required">*</span>
            </h3>

            {extrasSeleccionados.some(e => e !== 'ninguno') && (
              <p className="multi-extras-hint">🎉 ¡Agregá todos los extras que quieras!</p>
            )}

            <div className="options-list">
              {extrasOptions.map((extra) => (
                <button
                  key={extra.id}
                  className={`option-row ${extrasSeleccionados.includes(extra.id) ? 'selected' : ''}`}
                  onClick={() => handleExtraClick(extra.id)}
                >
                  <div className="option-info">
                    <span className="option-name">{extra.nombre}</span>
                    {extra.precio > 0 && (
                      <span className="option-price">+${extra.precio.toLocaleString('es-AR')}</span>
                    )}
                  </div>
                  {extrasSeleccionados.includes(extra.id) && (
                    <div className="check-badge-small"><Check size={16} /></div>
                  )}
                </button>
              ))}
            </div>
            {errorExtras && <p className="error-message">{errorExtras}</p>}
          </div>

          <div className="modal-total">
            <span>Total:</span>
            <span className="total-amount">${precioFinalTotal.toLocaleString('es-AR')}</span>
          </div>

          <button className="modal-confirm-btn" onClick={handleConfirm}>
            <ShoppingCart size={20} />
            Agregar al carrito
          </button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .modal-config { padding: 0; }

        .modal-scroll-content {
          overflow-y: auto;
          overflow-x: hidden;
          padding: 24px;
          flex: 1;
        }

        .modal-close {
          position: absolute;
          top: 16px; right: 16px;
          background: #f3f4f6;
          border: none;
          border-radius: 50%;
          width: 36px; height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          z-index: 10;
        }

        .modal-close:hover { background: #e5e7eb; transform: rotate(90deg); }

        .modal-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 4px 0;
        }

        .modal-subtitle {
          font-size: 16px;
          color: #6b7280;
          margin: 0 0 24px 0;
        }

        .config-section { margin-bottom: 28px; }

        .config-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 12px 0;
        }

        .required { color: #ef4444; font-weight: 700; }

        .multi-extras-hint {
          font-size: 13px;
          color: #d97706;
          background: #fef3c7;
          padding: 6px 12px;
          border-radius: 8px;
          margin-bottom: 10px;
          font-weight: 500;
        }

        .options-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .option-row {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
        }

        .option-row:hover {
          border-color: #f59e0b;
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.15);
        }

        .option-row.selected {
          border-color: #f59e0b;
          background: #fffbeb;
        }

        .option-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .option-name {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }

        .option-price {
          font-size: 14px;
          color: #059669;
          font-weight: 600;
        }

        .check-badge-small {
          background: #f59e0b;
          color: white;
          border-radius: 50%;
          width: 24px; height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .error-message {
          color: #ef4444;
          font-size: 14px;
          margin-top: 8px;
          font-weight: 500;
        }

        .modal-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: #f9fafb;
          border-radius: 12px;
          margin: 0 24px 16px 24px;
          font-size: 18px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .total-amount { color: #f59e0b; font-size: 24px; }

        .modal-confirm-btn {
          width: calc(100% - 48px);
          background: #f59e0b;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 16px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          margin: 0 24px 24px 24px;
          flex-shrink: 0;
        }

        .modal-confirm-btn:hover {
          background: #d97706;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }

        .modal-confirm-btn:active { transform: translateY(0); }

        @media (max-width: 640px) {
          .modal-scroll-content { padding: 20px; }
          .modal-title { font-size: 20px; }
          .modal-total { margin: 0 20px 16px 20px; }
          .modal-confirm-btn { width: calc(100% - 40px); margin: 0 20px 20px 20px; }
        }
      `}</style>
    </div>
  )
}

export default PapasConfigModal

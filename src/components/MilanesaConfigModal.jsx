import React, { useState } from 'react';
import { X, ShoppingCart, Check } from 'lucide-react';

const MilanesaConfigModal = ({ item, onClose, onConfirm }) => {
  const [tipoCarne, setTipoCarne] = useState('');
  const [extraPapas, setExtraPapas] = useState('');
  const [errorCarne, setErrorCarne] = useState('');
  const [errorPapas, setErrorPapas] = useState('');

  const extrasOptions = [
    { id: 'ninguno', nombre: 'Sin extra', precio: 0 },
    { id: 'cheddar', nombre: 'Cheddar con Panceta y Verdeo', precio: 7500 },
    { id: 'huevos', nombre: 'Huevos Fritos', precio: 5000 },
    { id: 'provenzal', nombre: 'Provenzal', precio: 5000 }
  ];

  const handleConfirm = () => {
    let hasError = false;

    if (!tipoCarne) {
      setErrorCarne('Debes seleccionar el tipo de carne');
      hasError = true;
    }

    if (!extraPapas) {
      setErrorPapas('Debes seleccionar una opción para las papas');
      hasError = true;
    }

    if (hasError) return;

    const selectedExtra = extrasOptions.find(e => e.id === extraPapas);
    const precioFinal = item.precio + (selectedExtra?.precio || 0);

    onConfirm({
      ...item,
      tipoCarne,
      extraPapas: extraPapas === 'ninguno' ? null : selectedExtra,
      precioFinal
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-config" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-scroll-content">
          <h2 className="modal-title">Configurá tu Milanesa</h2>
          <p className="modal-subtitle">{item.nombre}</p>

        {/* Tipo de Carne - OBLIGATORIO */}
        <div className="config-section">
          <h3 className="config-title">
            Tipo de Carne <span className="required">*</span>
          </h3>
          <div className="options-grid">
            <button
              className={`option-card ${tipoCarne === 'carne' ? 'selected' : ''}`}
              onClick={() => {
                setTipoCarne('carne');
                setErrorCarne('');
              }}
            >
              {tipoCarne === 'carne' && (
                <div className="check-badge">
                  <Check size={16} />
                </div>
              )}
              <span className="option-name">Carne</span>
            </button>
            <button
              className={`option-card ${tipoCarne === 'pollo' ? 'selected' : ''}`}
              onClick={() => {
                setTipoCarne('pollo');
                setErrorCarne('');
              }}
            >
              {tipoCarne === 'pollo' && (
                <div className="check-badge">
                  <Check size={16} />
                </div>
              )}
              <span className="option-name">Pollo</span>
            </button>
          </div>
          {errorCarne && <p className="error-message">{errorCarne}</p>}
        </div>

        {/* Extras para Papas - OBLIGATORIO */}
        <div className="config-section">
          <h3 className="config-title">
            Extras para las Papas <span className="required">*</span>
          </h3>
          <p className="info-text">Todas nuestras milanesas vienen con papas incluidas</p>
          <div className="options-list">
            {extrasOptions.map((extra) => (
              <button
                key={extra.id}
                className={`option-row ${extraPapas === extra.id ? 'selected' : ''}`}
                onClick={() => {
                  setExtraPapas(extra.id);
                  setErrorPapas('');
                }}
              >
                <div className="option-info">
                  <span className="option-name">{extra.nombre}</span>
                  {extra.precio > 0 && (
                    <span className="option-price">+${extra.precio.toLocaleString('es-AR')}</span>
                  )}
                </div>
                {extraPapas === extra.id && (
                  <div className="check-badge-small">
                    <Check size={16} />
                  </div>
                )}
              </button>
            ))}
          </div>
          {errorPapas && <p className="error-message">{errorPapas}</p>}
        </div>

        {/* Precio Total */}
                {/* Precio Total */}
        <div className="modal-total">
          <span>Total:</span>
          <span className="total-amount">
            ${(item.precio + (extrasOptions.find(e => e.id === extraPapas)?.precio || 0)).toLocaleString('es-AR')}
          </span>
        </div>

        {/* Botón Confirmar */}
        <button className="modal-confirm-btn" onClick={handleConfirm}>
          <ShoppingCart size={20} />
          Agregar al carrito
        </button>
      </div>
    </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
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
          overflow-y: auto;
          overflow-x: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .modal-config {
          padding: 24px;
          overflow-y: auto;
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #f3f4f6;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          z-index: 10;
        }

        .modal-close:hover {
          background: #e5e7eb;
          transform: rotate(90deg);
        }

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

        .config-section {
          margin-bottom: 28px;
        }

        .config-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 12px 0;
        }

        .required {
          color: #ef4444;
          font-weight: 700;
        }

        .optional {
          color: #6b7280;
          font-size: 14px;
          font-weight: 400;
        }

        .info-text {
          font-size: 14px;
          color: #059669;
          background: #d1fae5;
          padding: 8px 12px;
          border-radius: 8px;
          margin-bottom: 12px;
          font-weight: 500;
        }

        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .option-card {
          position: relative;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80px;
        }

        .option-card:hover {
          border-color: #f59e0b;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
        }

        .option-card.selected {
          border-color: #f59e0b;
          background: #fffbeb;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
        }

        .check-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #f59e0b;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .check-badge-small {
          background: #f59e0b;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .option-name {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
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

        .option-price {
          font-size: 14px;
          color: #059669;
          font-weight: 600;
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
          padding: 16px;
          background: #f9fafb;
          border-radius: 12px;
          margin-bottom: 16px;
          font-size: 18px;
          font-weight: 600;
        }

        .total-amount {
          color: #f59e0b;
          font-size: 24px;
        }

        .modal-confirm-btn {
          width: 100%;
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
        }

        .modal-confirm-btn:hover {
          background: #d97706;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }

        .modal-confirm-btn:active {
          transform: translateY(0);
        }

        @media (max-width: 640px) {
          .modal-config {
            padding: 20px;
          }

          .modal-title {
            font-size: 20px;
          }

          .options-grid {
            grid-template-columns: 1fr;
          }

          .option-card {
            min-height: 60px;
          }
        }
      `}</style>
    </div>
  );
};

export default MilanesaConfigModal;
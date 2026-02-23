import React, { useState } from 'react';
import { X, ShoppingCart, Check } from 'lucide-react';

const SandwichConfigModal = ({ item, onClose, onConfirm }) => {
  const [tipoCarne, setTipoCarne] = useState('');
  const [ingredientes, setIngredientes] = useState([]);
  const [errorCarne, setErrorCarne] = useState('');
  const [errorIngredientes, setErrorIngredientes] = useState('');

  // Determinar si el sandwich necesita selección de ingredientes
  const necesitaIngredientes = item.id === 2; // Sandwich con 2 ingredientes
  const maxIngredientes = 2;

  const ingredientesOptions = [
    'Lechuga',
    'Tomate',
    'Jamón y Queso'
  ];

  const handleToggleIngrediente = (ingrediente) => {
    if (ingredientes.includes(ingrediente)) {
      // Remover ingrediente
      setIngredientes(ingredientes.filter(i => i !== ingrediente));
    } else {
      // Agregar ingrediente solo si no alcanzó el máximo
      if (ingredientes.length < maxIngredientes) {
        setIngredientes([...ingredientes, ingrediente]);
        setErrorIngredientes('');
      }
    }
  };

  const handleConfirm = () => {
    let hasError = false;

    if (!tipoCarne) {
      setErrorCarne('Debes seleccionar el tipo de carne');
      hasError = true;
    }

    if (necesitaIngredientes && ingredientes.length !== maxIngredientes) {
      setErrorIngredientes(`Debes seleccionar exactamente ${maxIngredientes} ingredientes`);
      hasError = true;
    }

    if (hasError) return;

    // Crear descripción completa
    let descripcionCompleta = item.descripcion || '';
    descripcionCompleta += `\n🥩 ${tipoCarne === 'carne' ? 'Carne' : 'Pollo'}`;
    
    if (necesitaIngredientes && ingredientes.length > 0) {
      descripcionCompleta += `\n🥗 ${ingredientes.join(', ')}`;
    }

    onConfirm({
      ...item,
      tipoCarne,
      ingredientes: necesitaIngredientes ? ingredientes : [],
      descripcion: descripcionCompleta.trim(),
      precioFinal: item.precio
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-config" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-scroll-content">
          <h2 className="modal-title">Configurá tu Sandwich</h2>
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

        {/* Ingredientes - Solo para sandwich con 2 ingredientes */}
        {necesitaIngredientes && (
          <div className="config-section">
            <h3 className="config-title">
              Ingredientes <span className="required">*</span>
            </h3>
            <p className="info-text">
              Seleccioná exactamente {maxIngredientes} ingredientes ({ingredientes.length}/{maxIngredientes})
            </p>
            <div className="options-list">
              {ingredientesOptions.map((ingrediente) => (
                <button
                  key={ingrediente}
                  className={`option-row ${ingredientes.includes(ingrediente) ? 'selected' : ''} ${
                    ingredientes.length >= maxIngredientes && !ingredientes.includes(ingrediente) ? 'disabled' : ''
                  }`}
                  onClick={() => handleToggleIngrediente(ingrediente)}
                  disabled={ingredientes.length >= maxIngredientes && !ingredientes.includes(ingrediente)}
                >
                  <div className="option-info">
                    <span className="option-name">{ingrediente}</span>
                  </div>
                  {ingredientes.includes(ingrediente) && (
                    <div className="check-badge-small">
                      <Check size={16} />
                    </div>
                  )}
                </button>
              ))}
            </div>
            {errorIngredientes && <p className="error-message">{errorIngredientes}</p>}
          </div>
        )}

        {/* Precio Total */}
        <div className="modal-total">
          <span>Total:</span>
          <span className="total-amount">
            ${item.precio.toLocaleString('es-AR')}
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
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .modal-config {
          padding: 0;
        }

        .modal-scroll-content {
          overflow-y: auto;
          overflow-x: hidden;
          padding: 24px;
          flex: 1;
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

        .option-row:hover:not(.disabled) {
          border-color: #f59e0b;
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.15);
        }

        .option-row.selected {
          border-color: #f59e0b;
          background: #fffbeb;
        }

        .option-row.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .option-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
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

        .total-amount {
          color: #f59e0b;
          font-size: 24px;
        }

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

        .modal-confirm-btn:active {
          transform: translateY(0);
        }

        @media (max-width: 640px) {
          .modal-scroll-content {
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

          .modal-total {
            margin: 0 20px 16px 20px;
          }

          .modal-confirm-btn {
            width: calc(100% - 40px);
            margin: 0 20px 20px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default SandwichConfigModal;
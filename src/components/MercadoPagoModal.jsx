import React, { useState } from 'react';
import { X, Upload, Check, AlertCircle, CreditCard } from 'lucide-react';

const MercadoPagoModal = ({ isOpen, onClose, totalAmount, onConfirmPayment }) => {
  const [comprobante, setComprobante] = useState(null);
  const [comprobantePreview, setComprobantePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Datos de Mercado Pago (reemplazá con tus datos reales)
  const mpData = {
    alias: 'pizza.block.ar',
    cvu: '0000003100032135029692',
    titular: 'Lucas Laureano Naya'
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      setError('Por favor, subí una imagen (JPG, PNG, etc.)');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen es muy grande. Máximo 5MB');
      return;
    }

    setError('');

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setComprobantePreview(reader.result);
      setComprobante(file);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setComprobante(null);
    setComprobantePreview(null);
    setError('');
  };

  const handleConfirm = async () => {
    if (!comprobante) {
      setError('Debés subir el comprobante de pago');
      return;
    }

    setLoading(true);

    // Convertir imagen a base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      onConfirmPayment(base64String);
    };
    reader.readAsDataURL(comprobante);
  };

  const handleCopyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    // Aquí podrías agregar un toast o mensaje de "Copiado!"
  };

  if (!isOpen) return null;

  return (
    <div className="mp-overlay" onClick={onClose}>
      <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
        <button className="mp-close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="mp-scroll-content">
          <div className="mp-header">
            <CreditCard size={48} className="mp-icon" />
            <h2 className="mp-title">Pago con Mercado Pago</h2>
            <p className="mp-subtitle">Realizá la transferencia y subí el comprobante</p>
          </div>

          {/* Datos de Mercado Pago */}
          <div className="mp-data-section">
            <h3 className="mp-section-title">Datos para transferir</h3>
            
            <div className="mp-data-card">
              <div className="mp-data-item">
                <span className="mp-data-label">Alias:</span>
                <div className="mp-data-value-group">
                  <span className="mp-data-value">{mpData.alias}</span>
                  <button 
                    className="mp-copy-btn"
                    onClick={() => handleCopyToClipboard(mpData.alias, 'alias')}
                  >
                    Copiar
                  </button>
                </div>
              </div>

              <div className="mp-data-item">
                <span className="mp-data-label">CVU:</span>
                <div className="mp-data-value-group">
                  <span className="mp-data-value">{mpData.cvu}</span>
                  <button 
                    className="mp-copy-btn"
                    onClick={() => handleCopyToClipboard(mpData.cvu, 'cvu')}
                  >
                    Copiar
                  </button>
                </div>
              </div>

              <div className="mp-data-item">
                <span className="mp-data-label">Titular:</span>
                <span className="mp-data-value">{mpData.titular}</span>
              </div>

              <div className="mp-total-amount">
                <span>Monto a transferir:</span>
                <span className="mp-amount">${totalAmount.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>

          {/* Subir comprobante */}
          <div className="mp-upload-section">
            <h3 className="mp-section-title">
              Comprobante de pago <span className="mp-required">*</span>
            </h3>
            
            {!comprobantePreview ? (
              <label className="mp-upload-area">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mp-file-input"
                />
                <Upload size={48} className="mp-upload-icon" />
                <p className="mp-upload-text">
                  Hacé click para subir el comprobante
                </p>
                <span className="mp-upload-hint">
                  JPG, PNG o captura de pantalla (máx. 5MB)
                </span>
              </label>
            ) : (
              <div className="mp-preview-container">
                <img 
                  src={comprobantePreview} 
                  alt="Comprobante" 
                  className="mp-preview-image"
                />
                <button 
                  className="mp-remove-btn"
                  onClick={handleRemoveImage}
                >
                  <X size={20} />
                  Cambiar imagen
                </button>
              </div>
            )}

            {error && (
              <div className="mp-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Instrucciones */}
          <div className="mp-instructions">
            <AlertCircle size={20} />
            <div className="mp-instructions-text">
              <strong>Importante:</strong> Una vez que realices la transferencia, 
              subí el comprobante para que podamos confirmar tu pedido.
            </div>
          </div>
        </div>

        {/* Footer fijo */}
        <div className="mp-footer">
          <button 
            className="mp-confirm-btn" 
            onClick={handleConfirm}
            disabled={!comprobante || loading}
          >
            {loading ? (
              <>
                <div className="mp-spinner"></div>
                Enviando...
              </>
            ) : (
              <>
                <Check size={20} />
                Confirmar y Enviar Pedido
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .mp-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
          animation: mpFadeIn 0.3s ease;
        }

        @keyframes mpFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .mp-modal {
          background: white;
          border-radius: 20px;
          max-width: 550px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          position: relative;
          animation: mpSlideUp 0.3s ease;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        @keyframes mpSlideUp {
          from { 
            transform: translateY(30px);
            opacity: 0;
          }
          to { 
            transform: translateY(0);
            opacity: 1;
          }
        }

        .mp-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #f5f5f5;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          z-index: 10;
        }

        .mp-close-btn:hover {
          background: #e0e0e0;
          transform: rotate(90deg);
        }

        .mp-scroll-content {
          overflow-y: auto;
          padding: 32px 28px;
          flex: 1;
        }

        .mp-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .mp-icon {
          color: #00a8e8;
          margin-bottom: 12px;
        }

        .mp-title {
          font-size: 26px;
          font-weight: 700;
          color: #111;
          margin: 0 0 8px 0;
        }

        .mp-subtitle {
          font-size: 15px;
          color: #666;
          margin: 0;
        }

        .mp-data-section {
          margin-bottom: 28px;
        }

        .mp-section-title {
          font-size: 18px;
          font-weight: 600;
          color: #111;
          margin: 0 0 12px 0;
        }

        .mp-required {
          color: #ef4444;
          font-weight: 700;
        }

        .mp-data-card {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 20px;
          border: 2px solid #e9ecef;
        }

        .mp-data-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #dee2e6;
        }

        .mp-data-item:last-of-type {
          border-bottom: none;
        }

        .mp-data-label {
          font-weight: 600;
          color: #495057;
          font-size: 14px;
        }

        .mp-data-value-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mp-data-value {
          font-family: 'Courier New', monospace;
          color: #111;
          font-weight: 500;
          font-size: 15px;
        }

        .mp-copy-btn {
          background: #00a8e8;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mp-copy-btn:hover {
          background: #0088bb;
          transform: translateY(-1px);
        }

        .mp-total-amount {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 2px solid #dee2e6;
          font-size: 18px;
          font-weight: 700;
        }

        .mp-amount {
          color: #00a8e8;
          font-size: 24px;
        }

        .mp-upload-section {
          margin-bottom: 20px;
        }

        .mp-upload-area {
          border: 3px dashed #cbd5e0;
          border-radius: 12px;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          background: #f8f9fa;
        }

        .mp-upload-area:hover {
          border-color: #00a8e8;
          background: #f0f9ff;
        }

        .mp-file-input {
          display: none;
        }

        .mp-upload-icon {
          color: #00a8e8;
          margin-bottom: 12px;
        }

        .mp-upload-text {
          font-size: 16px;
          font-weight: 600;
          color: #111;
          margin: 0 0 8px 0;
        }

        .mp-upload-hint {
          font-size: 13px;
          color: #666;
        }

        .mp-preview-container {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid #e9ecef;
        }

        .mp-preview-image {
          width: 100%;
          height: auto;
          max-height: 300px;
          object-fit: contain;
          display: block;
          background: #f8f9fa;
        }

        .mp-remove-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(239, 68, 68, 0.95);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .mp-remove-btn:hover {
          background: rgba(220, 38, 38, 0.95);
          transform: translateY(-2px);
        }

        .mp-error {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          padding: 12px;
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 8px;
          color: #c00;
          font-size: 14px;
          font-weight: 500;
        }

        .mp-instructions {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 8px;
          color: #856404;
          font-size: 14px;
          line-height: 1.5;
        }

        .mp-instructions-text {
          flex: 1;
        }

        .mp-footer {
          padding: 20px 28px;
          border-top: 2px solid #e9ecef;
          background: white;
          border-radius: 0 0 20px 20px;
        }

        .mp-confirm-btn {
          width: 100%;
          background: linear-gradient(135deg, #00a8e8, #0088bb);
          color: white;
          border: none;
          padding: 16px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .mp-confirm-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 168, 232, 0.3);
        }

        .mp-confirm-btn:disabled {
          background: #cbd5e0;
          cursor: not-allowed;
          transform: none;
        }

        .mp-spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: mpSpin 0.8s linear infinite;
        }

        @keyframes mpSpin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .mp-modal {
            max-height: 95vh;
          }

          .mp-scroll-content {
            padding: 24px 20px;
          }

          .mp-title {
            font-size: 22px;
          }

          .mp-data-card {
            padding: 16px;
          }

          .mp-data-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .mp-footer {
            padding: 16px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default MercadoPagoModal;
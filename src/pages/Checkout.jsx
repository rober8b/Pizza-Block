import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { User, Mail, Phone, MapPin, DollarSign, ShoppingBag, ArrowLeft, Loader, Home, Store } from 'lucide-react'
import MercadoPagoModal from '../components/MercadoPagoModal'
import './Checkout.css'

const Checkout = () => {
  const navigate = useNavigate()
  const { cartItems, getCartTotal, clearCart } = useCart()
  
  const COSTO_ENVIO = 0 // Envío gratis para delivery
  // const COSTO_ENVIO = 2000 // Descomentar para activar costo de envío
  
  const [formData, setFormData] = useState({
    tipoEntrega: '', // 'delivery' o 'retiro'
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    calle: '',
    entrecalles: '',
    numero: '',
    metodoPago: 'efectivo'
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [modalInfo, setModalInfo] = useState({
    title: "",
    message: "",
    success: false
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // Estados para Mercado Pago
  const [mpModalOpen, setMpModalOpen] = useState(false)
  const [pendingOrderData, setPendingOrderData] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Si cambia el tipo de entrega a retiro, forzar mercado pago
    if (name === 'tipoEntrega' && value === 'retiro') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        metodoPago: 'mercadopago'
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.tipoEntrega) newErrors.tipoEntrega = 'Selecciona un tipo de entrega'
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es requerido'
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido'
    } else if (!/^\d{10,}$/.test(formData.telefono.replace(/\s/g, ''))) {
      newErrors.telefono = 'Teléfono inválido (mínimo 10 dígitos)'
    }
    
    // Solo validar dirección si es delivery
    if (formData.tipoEntrega === 'delivery') {
      if (!formData.calle.trim()) newErrors.calle = 'La calle es requerida'
      if (!formData.numero.trim()) newErrors.numero = 'El número es requerido'
      if (!formData.entrecalles.trim()) newErrors.entrecalles = 'Las entrecalles son requeridas'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const subtotal = getCartTotal()
    const envio = formData.tipoEntrega === 'delivery' ? COSTO_ENVIO : 0
    const total = subtotal + envio

    // Si es Mercado Pago, abrir modal de comprobante
    if (formData.metodoPago === 'mercadopago') {
      setPendingOrderData({
        cliente: formData,
        pedido: cartItems,
        total: {
          subtotal: subtotal,
          total: total
        },
        envio: envio
      })
      setMpModalOpen(true)
      return
    }

    // Si es efectivo, enviar directo
    await sendOrder(null)
  }

  const sendOrder = async (comprobanteBase64) => {
    setLoading(true)

    try {
      const orderData = pendingOrderData || {
        cliente: formData,
        pedido: cartItems,
        total: {
          subtotal: getCartTotal(),
          total: getCartTotal() + (formData.tipoEntrega === 'delivery' ? COSTO_ENVIO : 0)
        },
        envio: formData.tipoEntrega === 'delivery' ? COSTO_ENVIO : 0
      }

      const response = await fetch('http://localhost:5000/api/pedido', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          comprobante: comprobanteBase64
        })
      })

      const data = await response.json()

      if (data.success) {
        clearCart()
        setMpModalOpen(false)
        setPendingOrderData(null)
        setModalInfo({
          title: "¡Pedido realizado con éxito! 🎉",
          message: "Tu pedido fue enviado correctamente. En breve nos contactamos por WhatsApp.",
          success: true
        }) 
        setModalOpen(true)
      } else {
        setMpModalOpen(false)
        setModalInfo({
          title: "Error al procesar tu pedido",
          message: "Hubo un problema al enviar el pedido. Intenta nuevamente.",
          success: false
        })
        setModalOpen(true)
      }

    } catch (error) {
      console.error('Error:', error)
      setMpModalOpen(false)
      setModalInfo({
        title: "Error de conexión",
        message: "No pudimos comunicarnos con el servidor. Vuelve a intentarlo en un rato.",
        success: false
      })
      setModalOpen(true)
    } finally {
      setLoading(false)
    }
  }

  const subtotal = getCartTotal()
  const envio = formData.tipoEntrega === 'delivery' ? COSTO_ENVIO : 0
  const total = subtotal + envio

  if (cartItems.length === 0 && !modalOpen) {
    return (
      <div className="checkout-container">
        <div className="checkout-empty">
          <ShoppingBag size={64} />
          <h2>No hay productos en tu carrito</h2>
          <p>Agregá productos para continuar con tu pedido</p>
          <button onClick={() => navigate('/')} className="btn-volver">
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  const closeModal = () => {
    setModalOpen(false)
    if (modalInfo.success) {
      navigate("/")
    }
  }

  return (
    <>
      {modalOpen && (
        <div className="modal-overlay">
          <div className={`modal-box ${modalInfo.success ? "success" : "error"}`}>
            <h2>{modalInfo.title}</h2>
            <p>{modalInfo.message}</p>

            <button onClick={closeModal} className="modal-btn">
              {modalInfo.success ? "Volver al inicio" : "Cerrar"}
            </button>
          </div>
        </div>
      )}
      
      <div className="checkout-container">
        <button onClick={() => navigate('/')} className="btn-back">
          <ArrowLeft size={20} />
          Volver
        </button>

        <div className="checkout-content">
          {/* Formulario */}
          <div className="checkout-form-section">
            <h1 className="checkout-title">Finalizar Pedido</h1>
            
            <form onSubmit={handleSubmit} className="checkout-form">
              {/* Tipo de Entrega */}
              <div className="form-section tipo-entrega-section">
                <h3>¿Cómo querés recibir tu pedido?</h3>
                
                <div className="tipo-entrega-options">
                  <label className={`tipo-entrega-card ${formData.tipoEntrega === 'delivery' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="tipoEntrega"
                      value="delivery"
                      checked={formData.tipoEntrega === 'delivery'}
                      onChange={handleChange}
                    />
                    <div className="tipo-entrega-content">
                      <Home size={32} />
                      <h4>Delivery</h4>
                      <p>Entrega a domicilio</p>
                      <span className="tipo-entrega-badge">
                        {COSTO_ENVIO > 0 ? `$${COSTO_ENVIO.toLocaleString('es-AR')}` : 'GRATIS 🎉'}
                      </span>
                    </div>
                  </label>

                  <label className={`tipo-entrega-card ${formData.tipoEntrega === 'retiro' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="tipoEntrega"
                      value="retiro"
                      checked={formData.tipoEntrega === 'retiro'}
                      onChange={handleChange}
                    />
                    <div className="tipo-entrega-content">
                      <Store size={32} />
                      <h4>Retiro en Local</h4>
                      <p>Pasá a buscar tu pedido</p>
                      <span className="tipo-entrega-badge success">Sin costo</span>
                    </div>
                  </label>
                </div>
                {errors.tipoEntrega && <span className="error-message center">{errors.tipoEntrega}</span>}
              </div>

              {/* Mostrar resto del formulario solo si seleccionó tipo de entrega */}
              {formData.tipoEntrega && (
                <>
                  <div className="form-section">
                    <h3><User size={20} /> Datos Personales</h3>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="nombre">Nombre *</label>
                        <input
                          type="text"
                          id="nombre"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          className={errors.nombre ? 'error' : ''}
                          disabled={loading}
                        />
                        {errors.nombre && <span className="error-message">{errors.nombre}</span>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="apellido">Apellido *</label>
                        <input
                          type="text"
                          id="apellido"
                          name="apellido"
                          value={formData.apellido}
                          onChange={handleChange}
                          className={errors.apellido ? 'error' : ''}
                          disabled={loading}
                        />
                        {errors.apellido && <span className="error-message">{errors.apellido}</span>}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="email"><Mail size={16} /> Email </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? 'error' : ''}
                        placeholder="ejemplo@email.com"
                        disabled={loading}
                      />
                      {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="telefono"><Phone size={16} /> Teléfono *</label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        className={errors.telefono ? 'error' : ''}
                        placeholder="1123456789"
                        disabled={loading}
                      />
                      {errors.telefono && <span className="error-message">{errors.telefono}</span>}
                    </div>
                  </div>

                  {/* Solo mostrar dirección si es delivery */}
                  {formData.tipoEntrega === 'delivery' && (
                    <div className="form-section">
                      <h3><MapPin size={20} /> Dirección de Entrega</h3>
                      
                      <div className="form-row">
                        <div className="form-group" style={{flex: 2}}>
                          <label htmlFor="calle">Calle *</label>
                          <input
                            type="text"
                            id="calle"
                            name="calle"
                            value={formData.calle}
                            onChange={handleChange}
                            className={errors.calle ? 'error' : ''}
                            disabled={loading}
                          />
                          {errors.calle && <span className="error-message">{errors.calle}</span>}
                        </div>

                        <div className="form-group" style={{flex: 1}}>
                          <label htmlFor="numero">Número *</label>
                          <input
                            type="text"
                            id="numero"
                            name="numero"
                            value={formData.numero}
                            onChange={handleChange}
                            className={errors.numero ? 'error' : ''}
                            disabled={loading}
                          />
                          {errors.numero && <span className="error-message">{errors.numero}</span>}
                        </div>

                        <div className="form-group" style={{ marginTop: "1rem" }}>
                          <label htmlFor="entrecalles">Entrecalles *</label>
                          <input
                            type="text"
                            id="entrecalles"
                            name="entrecalles"
                            value={formData.entrecalles}
                            onChange={handleChange}
                            className={errors.entrecalles ? 'error' : ''}
                            disabled={loading}
                            placeholder="Ej: San Martín y Rivadavia"
                          />
                          {errors.entrecalles && <span className="error-message">{errors.entrecalles}</span>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Si es retiro, mostrar dirección del local */}
                  {formData.tipoEntrega === 'retiro' && (
                    <div className="form-section info-section">
                      <h3><Store size={20} /> Dirección del Local</h3>
                      <div className="local-info">
                        <p><strong>📍 Dirección:</strong> Av. Ejemplo 1234, Buenos Aires</p>
                        <p><strong>🕒 Horario de retiro:</strong> Lun-Dom 12-16hs y 19-23hs (excepto Miércoles)</p>
                        <p className="info-note">Te avisaremos por WhatsApp cuando tu pedido esté listo para retirar</p>
                      </div>
                    </div>
                  )}

                  <div className="form-section">
                    <h3><DollarSign size={20} /> Método de Pago</h3>
                    
                    {formData.tipoEntrega === 'retiro' ? (
                      <div className="payment-info-retiro">
                        <div className="payment-locked">
                          <DollarSign size={24} />
                          <p><strong>Pago con Mercado Pago</strong></p>
                          <span className="payment-note">Para retiros en local, el pago se realiza únicamente con Mercado Pago</span>
                        </div>
                      </div>
                    ) : (
                      <div className="payment-methods">
                        <label className={`payment-option ${formData.metodoPago === 'efectivo' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="metodoPago"
                            value="efectivo"
                            checked={formData.metodoPago === 'efectivo'}
                            onChange={handleChange}
                            disabled={loading}
                          />
                          <span>💵 Efectivo</span>
                        </label>

                        <label className={`payment-option ${formData.metodoPago === 'mercadopago' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="metodoPago"
                            value="mercadopago"
                            checked={formData.metodoPago === 'mercadopago'}
                            onChange={handleChange}
                            disabled={loading}
                          />
                          <span>💳 Mercado Pago</span>
                        </label>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader className="spinner" size={20} />
                        Enviando pedido...
                      </>
                    ) : (
                      'Confirmar Pedido'
                    )}
                  </button>
                </>
              )}
            </form>
          </div>

          {/* Resumen del pedido */}
          <div className="checkout-summary">
            <h3>Resumen del Pedido</h3>
            
            <div className="summary-items">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.categoria}`} className="summary-item">
                  <div className="summary-item-header">
                    <div className="summary-item-info">
                      <span className="summary-item-name">{item.nombre}</span>
                      <span className="summary-item-qty">x{item.cantidad}</span>
                    </div>
                    <span className="summary-item-price">
                      ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                    </span>
                  </div>
                  
                  {/* Mostrar configuraciones si existen */}
                  {(item.tipoCarne || item.extraPapas || (item.ingredientes && item.ingredientes.length > 0)) && (
                    <div className="summary-item-config">
                      {/* Tipo de carne para milanesas y sandwiches */}
                      {item.tipoCarne && (
                        <div className="config-line">
                          🥩 {item.tipoCarne === 'carne' ? 'Carne' : 'Pollo'}
                        </div>
                      )}
                      
                      {/* Extra de papas para milanesas */}
                      {item.extraPapas && (
                        <div className="config-line">
                          🍟 Papas con {item.extraPapas.nombre}
                        </div>
                      )}
                      
                      {/* Sin extra de papas */}
                      {item.categoria === 'Milanesas' && !item.extraPapas && (
                        <div className="config-line">
                          🍟 Papas incluidas
                        </div>
                      )}
                      
                      {/* Ingredientes para sandwiches */}
                      {item.ingredientes && item.ingredientes.length > 0 && (
                        <div className="config-line">
                          🥗 {item.ingredientes.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${subtotal.toLocaleString('es-AR')}</span>
              </div>
              {formData.tipoEntrega === 'delivery' && (
                <div className="summary-row envio-gratis">
                  <span>Envío:</span>
                  <span className="gratis-badge">
                    {COSTO_ENVIO > 0 ? `$${COSTO_ENVIO.toLocaleString('es-AR')}` : 'GRATIS 🎉'}
                  </span>
                </div>
              )}
              {formData.tipoEntrega === 'retiro' && (
                <div className="summary-row envio-gratis">
                  <span>Retiro en local:</span>
                  <span className="gratis-badge">SIN CARGO ✨</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total:</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Mercado Pago */}
      <MercadoPagoModal
        isOpen={mpModalOpen}
        onClose={() => {
          setMpModalOpen(false)
          setPendingOrderData(null)
          setLoading(false)
        }}
        totalAmount={pendingOrderData?.total.total || 0}
        onConfirmPayment={sendOrder}
      />
    </>
  )
}

export default Checkout
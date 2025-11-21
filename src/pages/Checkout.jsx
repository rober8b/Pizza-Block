import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { User, Mail, Phone, MapPin, DollarSign, ShoppingBag, ArrowLeft } from 'lucide-react'
import './Checkout.css'

const Checkout = () => {
  const navigate = useNavigate()
  const { cartItems, getCartTotal, clearCart } = useCart()
  
  const COSTO_ENVIO = 2000 // Costo fijo de envío
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    calle: '',
    numero: '',
    metodoPago: 'efectivo'
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es requerido'
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido'
    } else if (!/^\d{10,}$/.test(formData.telefono.replace(/\s/g, ''))) {
      newErrors.telefono = 'Teléfono inválido (mínimo 10 dígitos)'
    }
    if (!formData.calle.trim()) newErrors.calle = 'La calle es requerida'
    if (!formData.numero.trim()) newErrors.numero = 'El número es requerido'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Crear mensaje para WhatsApp
    const subtotal = getCartTotal()
    const total = subtotal + COSTO_ENVIO
    
    let mensaje = `🍕 *NUEVO PEDIDO - PIZZA BLOCK* 🍕\n\n`
    mensaje += `👤 *Cliente:* ${formData.nombre} ${formData.apellido}\n`
    mensaje += `📧 *Email:* ${formData.email}\n`
    mensaje += `📱 *Teléfono:* ${formData.telefono}\n`
    mensaje += `📍 *Dirección:* ${formData.calle} ${formData.numero}\n`
    mensaje += `💳 *Método de pago:* ${formData.metodoPago === 'efectivo' ? 'Efectivo' : 'Mercado Pago'}\n\n`
    
    mensaje += `🛒 *DETALLE DEL PEDIDO:*\n`
    mensaje += `${'─'.repeat(30)}\n`
    
    cartItems.forEach(item => {
      mensaje += `• ${item.nombre} (${item.categoria})\n`
      if (item.descripcion) {
        mensaje += `  _${item.descripcion}_\n`
      }
      mensaje += `  Cantidad: ${item.cantidad} × $${item.precio.toLocaleString('es-AR')}\n`
      mensaje += `  Subtotal: $${(item.precio * item.cantidad).toLocaleString('es-AR')}\n\n`
    })
    
    mensaje += `${'─'.repeat(30)}\n`
    mensaje += `💰 *Subtotal:* $${subtotal.toLocaleString('es-AR')}\n`
    mensaje += `🚚 *Envío:* $${COSTO_ENVIO.toLocaleString('es-AR')}\n`
    mensaje += `${'═'.repeat(30)}\n`
    mensaje += `💵 *TOTAL:* $${total.toLocaleString('es-AR')}\n`

    // Número de WhatsApp (reemplaza con tu número)
    const numeroWhatsApp = '5491234567890' // Cambia este número
    const mensajeCodificado = encodeURIComponent(mensaje)
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`
    
    // Abrir WhatsApp
    window.open(urlWhatsApp, '_blank')
    
    // Limpiar carrito y volver al inicio
    clearCart()
    alert('¡Pedido enviado! Te contactaremos pronto.')
    navigate('/')
  }

  const subtotal = getCartTotal()
  const total = subtotal + COSTO_ENVIO

  if (cartItems.length === 0) {
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

  return (
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
                  />
                  {errors.apellido && <span className="error-message">{errors.apellido}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email"><Mail size={16} /> Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="ejemplo@email.com"
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
                />
                {errors.telefono && <span className="error-message">{errors.telefono}</span>}
              </div>
            </div>

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
                  />
                  {errors.numero && <span className="error-message">{errors.numero}</span>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3><DollarSign size={20} /> Método de Pago</h3>
              
              <div className="payment-methods">
                <label className={`payment-option ${formData.metodoPago === 'efectivo' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="metodoPago"
                    value="efectivo"
                    checked={formData.metodoPago === 'efectivo'}
                    onChange={handleChange}
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
                  />
                  <span>💳 Mercado Pago</span>
                </label>
              </div>
            </div>

            <button type="submit" className="btn-submit">
              Confirmar Pedido por WhatsApp
            </button>
          </form>
        </div>

        {/* Resumen del pedido */}
        <div className="checkout-summary">
          <h3>Resumen del Pedido</h3>
          
          <div className="summary-items">
            {cartItems.map((item) => (
              <div key={`${item.id}-${item.categoria}`} className="summary-item">
                <div className="summary-item-info">
                  <span className="summary-item-name">{item.nombre}</span>
                  <span className="summary-item-qty">x{item.cantidad}</span>
                </div>
                <span className="summary-item-price">
                  ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                </span>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${subtotal.toLocaleString('es-AR')}</span>
            </div>
            <div className="summary-row">
              <span>Envío:</span>
              <span>${COSTO_ENVIO.toLocaleString('es-AR')}</span>
            </div>  
            <div className="summary-row total">
              <span>Total:</span>
              <span>${total.toLocaleString('es-AR')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
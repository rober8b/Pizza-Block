import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import './Admin.css'

const STATUS_COLUMNS = [
  { key: 'nuevo',      label: '🆕 Nuevos',      next: 'preparando', nextLabel: 'Preparar' },
  { key: 'preparando', label: '👨‍🍳 Preparando',  next: 'en_camino',  nextLabel: 'Enviar' },
  { key: 'en_camino',  label: '🛵 En camino',    next: 'entregado',  nextLabel: 'Entregado' },
]

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Build a rich product list from whatever shape the cart items have
function ProductsList({ products }) {
  if (!Array.isArray(products) || products.length === 0) {
    return <div className="order-card__products">Sin productos</div>
  }
  return (
    <div className="order-card__products">
      {products.map((p, i) => {
        const qty  = p.cantidad ?? p.quantity ?? 1
        const name = p.nombre ?? p.name ?? p.title ?? '—'
        // Build extras string from known fields
        const extras = [
          p.tipoPizza   ? (p.tipoPizza === 'al_molde' ? '🍕 Al molde' : '🔥 A la piedra') : null,
          p.tipoCarne   ? (p.tipoCarne === 'carne' ? '🥩 Carne' : '🍗 Pollo') : null,
          p.extraPapas  ? `🍟 Papas con ${p.extraPapas.nombre ?? p.extraPapas}` : null,
          p.ingredientes?.length ? `🥗 ${p.ingredientes.join(', ')}` : null,
        ].filter(Boolean).join(' · ')

        return (
          <div key={i} className="order-card__product-line">
            <span className="order-card__product-qty">{qty}x</span>
            <span className="order-card__product-name">{name}</span>
            {extras && <span className="order-card__product-extras">{extras}</span>}
          </div>
        )
      })}
    </div>
  )
}

function formatProductsText(products) {
  if (!Array.isArray(products)) return ''
  return products.map(p => {
    const qty  = p.cantidad ?? p.quantity ?? 1
    const name = p.nombre ?? p.name ?? p.title ?? '?'
    const extras = [
      p.tipoPizza   ? (p.tipoPizza === 'al_molde' ? '🍕 Al molde' : '🔥 A la piedra') : null,
      p.tipoCarne   ? (p.tipoCarne === 'carne' ? '🥩 Carne' : '🍗 Pollo') : null,
      p.extraPapas  ? `🍟 Papas con ${p.extraPapas.nombre ?? p.extraPapas}` : null,
      p.ingredientes?.length ? `🥗 ${p.ingredientes.join(', ')}` : null,
    ].filter(Boolean).join(' · ')
    return extras ? `${qty}x ${name} (${extras})` : `${qty}x ${name}`
  }).join(' | ')
}

function OrderCard({ order, onAdvance, isNew }) {
  const waText = encodeURIComponent(`Hola ${order.customer_name}, recibimos tu pedido 🍕`)
  const waUrl  = `https://wa.me/${order.phone?.replace(/\D/g, '')}?text=${waText}`

  return (
    <div className={`order-card ${isNew ? 'order-card--new' : ''}`}>
      <div className="order-card__header">
        <span className="order-card__name">{order.customer_name}</span>
        <span className="order-card__time">{formatTime(order.created_at)}</span>
      </div>

      <div className="order-card__address">📍 {order.address}</div>

      <ProductsList products={order.products} />

      <div className="order-card__footer">
        <span className="order-card__total">${order.total?.toLocaleString('es-AR')}</span>
        <span className="order-card__payment">{order.payment_method}</span>
      </div>

      {order.receipt_url && (
        <a href={order.receipt_url} target="_blank" rel="noopener noreferrer" className="order-card__receipt">
          📎 Ver comprobante
        </a>
      )}

      <div className="order-card__actions">
        {onAdvance && (
          <button className="btn btn--primary" onClick={() => onAdvance(order.id)}>
            {STATUS_COLUMNS.find(c => c.key === order.status)?.nextLabel ?? 'Avanzar'}
          </button>
        )}
        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn btn--whatsapp">
          WhatsApp
        </a>
      </div>
    </div>
  )
}

function HistorialRow({ order }) {
  return (
    <div className="historial-row">
      <div className="historial-row__info">
        <span className="historial-row__name">{order.customer_name}</span>
        <span className="historial-row__address">📍 {order.address}</span>
        <span className="historial-row__products">{formatProductsText(order.products)}</span>
      </div>
      <div className="historial-row__meta">
        <span className="historial-row__date">{formatDate(order.created_at)} {formatTime(order.created_at)}</span>
        <span className="historial-row__payment">{order.payment_method}</span>
        <span className="historial-row__total">${order.total?.toLocaleString('es-AR')}</span>
        {order.receipt_url && (
          <a href={order.receipt_url} target="_blank" rel="noopener noreferrer" className="historial-row__receipt">
            📎 Comprobante
          </a>
        )}
      </div>
    </div>
  )
}

const ADMIN_PASSWORD = 'pizza2024' // 🔑 Cambiá esto

function AdminLogin({ onLogin }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', '1')
      onLogin()
    } else {
      setError(true)
      setInput('')
    }
  }

  return (
    <div className="admin-login">
      <form onSubmit={handleSubmit} className="admin-login__box">
        <h1>🍕 Panel Admin</h1>
        <p>Ingresá la contraseña para continuar</p>
        <input
          type="password"
          value={input}
          onChange={e => { setInput(e.target.value); setError(false) }}
          placeholder="Contraseña"
          autoFocus
        />
        {error && <span className="admin-login__error">Contraseña incorrecta</span>}
        <button type="submit">Entrar</button>
      </form>
    </div>
  )
}

export default function Admin() {
  const [authed, setAuthed]               = useState(() => sessionStorage.getItem('admin_auth') === '1')
  const [orders, setOrders]               = useState([])
  const [newOrderIds, setNewOrderIds]     = useState(new Set())
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)
  const [showHistorial, setShowHistorial] = useState(false)
  const [historial, setHistorial]         = useState([])
  const [historialLoading, setHistorialLoading] = useState(false)
  const [soundUnlocked, setSoundUnlocked] = useState(false)
  const audioCtxRef = useRef(null)

  // ── Sound ──────────────────────────────────────────────
  const unlockSound = () => {
    if (audioCtxRef.current) return
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    setSoundUnlocked(true)
  }

  const playAlert = useCallback(() => {
    try {
      const ctx = audioCtxRef.current
      if (!ctx) return
      // Resume context in case browser suspended it (required after page idle)
      const play = () => {
        ;[0, 0.32].forEach(startTime => {
        const osc  = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(880, ctx.currentTime + startTime)
        gain.gain.setValueAtTime(0.6, ctx.currentTime + startTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + 0.4)
        osc.start(ctx.currentTime + startTime)
        osc.stop(ctx.currentTime + startTime + 0.5)
        })
      }
      if (ctx.state === 'suspended') {
        ctx.resume().then(play)
      } else {
        play()
      }
    } catch (e) { console.warn('Audio error:', e) }
  }, [])

  // ── Data fetching ───────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .neq('status', 'entregado')
      .order('created_at', { ascending: true })
    if (error) setError('Error cargando pedidos: ' + error.message)
    else setOrders(data)
    setLoading(false)
  }, [])

  const fetchHistorial = useCallback(async () => {
    setHistorialLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'entregado')
      .order('created_at', { ascending: false })
      .limit(50)
    if (!error) setHistorial(data)
    setHistorialLoading(false)
  }, [])

  const toggleHistorial = () => {
    if (!showHistorial && historial.length === 0) fetchHistorial()
    setShowHistorial(prev => !prev)
  }

  const advanceOrder = useCallback(async (orderId) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return
    const col = STATUS_COLUMNS.find(c => c.key === order.status)
    if (!col?.next) return
    const { error } = await supabase.from('orders').update({ status: col.next }).eq('id', orderId)
    if (error) alert('Error actualizando estado: ' + error.message)
  }, [orders])

  // ── Realtime ────────────────────────────────────────────
  useEffect(() => {
    fetchOrders()

    const channel = supabase
      .channel('orders-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newOrder = payload.new
          setOrders(prev => [...prev, newOrder])
          setNewOrderIds(prev => new Set([...prev, newOrder.id]))
          playAlert()
          setTimeout(() => {
            setNewOrderIds(prev => { const n = new Set(prev); n.delete(newOrder.id); return n })
          }, 8000)
        }
        if (payload.eventType === 'UPDATE') {
          const updated = payload.new
          if (updated.status === 'entregado') {
            setOrders(prev => prev.filter(o => o.id !== updated.id))
            setHistorial(prev => [updated, ...prev])
          } else {
            setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
          }
        }
        if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchOrders, playAlert])

  // ── Guards ──────────────────────────────────────────────
  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />
  if (loading) return <div className="admin-loading">Cargando pedidos...</div>
  if (error)   return <div className="admin-error">{error}</div>

  return (
    <div className="admin">
      <header className="admin__header">
        <h1>🍕 Panel de Pedidos</h1>
        <div className="admin__header-actions">
          <button className="btn btn--historial" onClick={toggleHistorial}>
            {showHistorial ? '✕ Cerrar historial' : '📋 Ver historial'}
          </button>
          <button className="btn btn--refresh" onClick={fetchOrders}>↺ Actualizar</button>
        </div>
      </header>

      {/* Sound unlock banner — iOS/browsers require a user gesture */}
      {!soundUnlocked && (
        <div className="admin__sound-banner">
          🔔 Para recibir alertas sonoras de nuevos pedidos, activá el sonido
          <button onClick={unlockSound}>Activar sonido</button>
        </div>
      )}

      <div className="admin__board">
        {STATUS_COLUMNS.map(col => {
          const colOrders = orders.filter(o => o.status === col.key)
          return (
            <div key={col.key} className={`admin__column admin__column--${col.key}`}>
              <h2 className="admin__column-title">
                {col.label}
                <span className="admin__column-count">{colOrders.length}</span>
              </h2>
              <div className="admin__cards">
                {colOrders.length === 0 && <p className="admin__empty">Sin pedidos</p>}
                {colOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isNew={newOrderIds.has(order.id)}
                    onAdvance={col.next ? advanceOrder : null}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {showHistorial && (
        <div className="historial">
          <div className="historial__header">
            <h2>📋 Historial de pedidos entregados</h2>
            <span className="historial__count">{historial.length} pedidos</span>
          </div>
          {historialLoading && <p className="historial__loading">Cargando historial...</p>}
          {!historialLoading && historial.length === 0 && (
            <p className="historial__empty">No hay pedidos entregados todavía.</p>
          )}
          {!historialLoading && historial.map(order => (
            <HistorialRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { supabase } from './lib/supabase'
import { useEffect, useState } from 'react'
import './App.css'
import Home from './components/Home'
import Navbar from './components/Navbar'
import Pizzas from './components/Pizzas'
import Empanadas from './components/Empanadas'
import Milanesas from './components/Milanesas'
import Bebidas from './components/Bebidas'
import Promos from './components/Promos'
import Footer from './components/Footer'
import BtnWsp from './components/BtnWsp'
import Cart from './components/Cart'
import CartButton from './components/CartButton'
import Checkout from './pages/Checkout'
import HorariosBanner from './components/HorariosBanner'
import Admin from './pages/Admin'

function HomePage() {
  return (
    <>
      <Navbar />
      <HorariosBanner />
      <Home />
      <Pizzas />
      <Empanadas />
      <Milanesas />
      <Bebidas />
      <Promos />
      <Footer />
    </>
  )
}

// Wrapper that hides cart/buttons on /admin
function AppShell() {
  const location = useLocation()
  const isAdmin = location.pathname === '/admin'
  const [vacaciones, setVacaciones] = useState(null)
  const [checkingVac, setCheckingVac] = useState(true)

  useEffect(() => {
    if (isAdmin) { setCheckingVac(false); return } // no bloquear el admin
    
    const check = async () => {
      try {
        const { data } = await supabase
          .from('configuracion')
          .select('valor')
          .eq('id', 'vacaciones')
          .single()

        console.log('Vacaciones data:', data) // 👈 agregá esto
        console.log('Valor:', data?.valor)    // 👈 y esto

        if (data?.valor?.activo && data?.valor?.fechaInicio && data?.valor?.fechaFin) {
          const hoy = new Date()
          hoy.setHours(0, 0, 0, 0)
          
          // Parsear fechas como locales agregando T00:00:00 para evitar problema UTC
          const desde = new Date(data.valor.fechaInicio + 'T00:00:00')
          const hasta = new Date(data.valor.fechaFin + 'T23:59:59')
          
          if (hoy >= desde && hoy <= hasta) {
            setVacaciones(data.valor)
          }
        }
      } catch (e) {}
      setCheckingVac(false)
    }
    check()
  }, [isAdmin])

  if (checkingVac) return null // espera silenciosa

  // Pantalla de vacaciones para clientes
  if (vacaciones && !isAdmin) {
    const reabreDate = new Date(vacaciones.fechaFin) // ✅
    reabreDate.setDate(reabreDate.getDate() + 1)
    const reabreDia = reabreDate.toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long'
    })

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
        color: 'white',
        textAlign: 'center',
        padding: '2rem',
        gap: '1rem'
      }}>
        <span style={{ fontSize: '5rem' }}>🍕</span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>¡Estamos de vacaciones!</h1>
        <p style={{ fontSize: '1.1rem', color: '#cbd5e1', maxWidth: 400 }}>
          Lo sentimos, no estamos tomando pedidos en este momento.
        </p>
        <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#d32f2f' }}>
          Reabrimos el {reabreDia} 🎉
        </p>
      </div>
    )
  }

  return (
    <div className='App'>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      {!isAdmin && (
        <>
          <Cart />
          <CartButton />
          <BtnWsp />
        </>
      )}
    </div>
  )
}

function App() {
  return (
    <CartProvider>
      <Router>
        <AppShell />
      </Router>
    </CartProvider>
  )
}

export default App
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
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

  return (
    <div className='App'>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>

      {/* Hide cart UI on admin — it breaks the layout */}
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
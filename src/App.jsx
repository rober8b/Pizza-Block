import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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

function App() {
  return (
    <CartProvider>
      <Router>
        <div className='App'>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
          <Cart />
          <CartButton />
          <BtnWsp />
        </div>
      </Router>
    </CartProvider>
  )
}

export default App
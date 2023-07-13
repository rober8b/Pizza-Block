import './App.css'
import Home from './components/Home'
import Navbar from './components/Navbar'
import Pizzas from './components/Pizzas'
import Empanadas from './components/Empanadas'
import Milanesas from './components/Milanesas'
import Promos from './components/Promos'
import Footer from './components/Footer'
import BtnWsp from './components/BtnWsp'

function App() {

  return (
    <div className='App'>
        <Navbar />
        <Home />
        <Pizzas />
        <Empanadas />
        <Milanesas />
        <Promos />
        <BtnWsp />
        <Footer />
    </div>
  )
}

export default App

import './App.css'
import Home from './components/Home'
import Navbar from './components/Navbar'
import Pizzas from './components/Pizzas'
import Empanadas from './components/Empanadas'
import Milanesas from './components/Milanesas'
import Promos from './components/Promos'
import Footer from './components/Footer'
import BtnWsp from './components/BtnWsp'
import ilustracion1 from './assets/ilustracion1.png'
import ilustracion2 from './assets/ilustracion2.png'
import ilustracion3 from './assets/ilustracion3.png'
import ilustracion4 from './assets/ilustracion4.png'
import ilustracion5 from './assets/ilustracion5.png'

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

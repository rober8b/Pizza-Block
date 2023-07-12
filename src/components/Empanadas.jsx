import React from 'react'
import banner_empanadas from '../assets/banner_empanadas.png'
import "./Empanadas.css"
import Precio_empanadas from '../assets/Precio_empanadas.png'
import Linea_larga from '../assets/Linea-larga.png'

const Empanadas = () => {
  return (
    <div className='empanadas-container' id='empanadas'>
          <div className="empanadas_banner">
                <img src={banner_empanadas} alt="Banner de empanadas block" />
          </div>
          <div className="empanadas-menu">
            <div className="empandas_nombres">
              <p>
                  Jamón y Mozzarella - Cebolla y Mozzarella - <br />
                  Salchicha y Mozzarella - Carne Picante - <br />
                  Carne - Pollo - Caprese - Roquefort - Verdura - <br />
                  Humita - Calabresa 
              </p> 
            </div>
          </div>
          <div className="empanadas_precio">
               <img src={Precio_empanadas} alt="Banner de empanadas block" />
          </div>
          <div className="linea_div">
              <img className='linea_div-img' src={Linea_larga} alt="linea pizza block Sandwiches" />
          </div>
    </div>
  )
}

export default Empanadas
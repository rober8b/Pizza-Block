import React from 'react'
import BotonScroll from './botton-scroll'
import "./Home.css"
import Social from './Social'
import Linea_larga from '../assets/Linea-larga.png'

function Home() {
  return (
    <div>
        <div className="home-container">
            <div className="container_home-text">
                <p className='home-text'>Fanaticos de la Pizza</p>
            </div>
            <Social />
        </div>
        <BotonScroll />
        <div className="linea_div">
              <img className='linea_div-img' src={Linea_larga} alt="linea pizza block Sandwiches" />
        </div>
    </div>
  )
}

export default Home
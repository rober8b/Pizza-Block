import React from 'react'
import promosTitle from '../assets/Promos-title.png'
import promosPrecios from '../assets/Promos_precios.png'
import './Promos.css'

const Promos = () => {
  return (
    <div className='container-promos'>
        <img className='promos_Title' src={promosTitle} alt="Banner de pizza block" />
        <img className='promos_precios' src={promosPrecios} alt="Banner de pizza block Promos" />
    </div>
  )
}

export default Promos
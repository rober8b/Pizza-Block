import React from 'react'
import productos from '../data/Pizzas-data'
import './Pizzas.css'
import pizzas_banner from '../assets/pizzas_banner.png'

const Pizzas = () => {
  return (
    <div className='Pizzas-container' id='pizzas'>
            <div className="pizzas_banner">
                <img src={pizzas_banner} alt="Banner de pizza block" />
            </div>
      {productos.map(({id, nombre, descripcion, precio}) => (
            <div key={id} className='fila-product'>
                <div className="product-brief columna">
                        <h3 className='nombre-product'>{nombre}</h3>
                        <p className='descrip-product'>{descripcion}</p>
                </div>
                <div className="linea-punteada columna"></div>
                <div className="columna">
                        <h3 className='precio-product'>${precio}</h3>
                </div>
            </div>
      ))}
    </div>
  )
}

export default Pizzas
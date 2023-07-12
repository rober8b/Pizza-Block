import React from 'react'
import Milanesas_banner from '../assets/Milanesas_banner.png'
import milanesasData from '../data/Milanesas-data'
import './Milanesas.css'
import BannerSandwiches from '../assets/Milanesas_banner_2.png'
import sandwichesData from '../data/Sandwiches-data'
import delivery_image from '../assets/delivery.png'
import Linea_larga from '../assets/Linea_larga.png'
import fritasExtra_image from '../assets/extra_fritas-image.png'
import papasData from '../data/Papas-data'

const Milanesas = () => {
  return (
    <div className='milanesas-container' id='milanesas'>
            <div className="milanesas_banner">
                <img src={Milanesas_banner} alt="Banner de pizza block" />
            </div>
            {milanesasData.map(({id, nombre, descripcion, precio}) => (
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


            <div className="banner_sandwiches">
                    <img className='banner_sandwiches-img' src={BannerSandwiches} alt="Banner de pizza block Sandwiches" />
                    <img className='banner_delivery-img'src={delivery_image} alt="Banner de pizza block delivery" />
            </div>
            {sandwichesData.map(({id, nombre, descripcion, precio}) => (
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
        
            <div className="linea_div">
              <img className='linea_div-img' src={Linea_larga} alt="linea pizza block Sandwiches" />
            </div>

            <div className="papas_banner">
                <img className="papas_extra-img"src={fritasExtra_image} alt="Banner de pizza block papas" />
            </div>
            {papasData.map(({id, nombre, precio}) => (
                <div key={id} className='fila-product'>
                    <div className="product-brief_papas columna">
                            <h3 className='nombre-product_papas'>{nombre}</h3>
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

export default Milanesas
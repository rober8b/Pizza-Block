import React from 'react';
import './botton-scroll.css';
import ilustracion1 from '../assets/ilustracion1.png'
import ilustracion2 from '../assets/ilustracion2.png'
import ilustracion3 from '../assets/ilustracion3.png'

class BotonScroll extends React.Component {
  scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  render() {
    return (
      <div className="container">
        {/* <div className="background-images">
        <div className="background-image-left">
          <img src={ilustracion1} alt="Imagen 1" className="Imagen_1" />
        </div>
          <div className="background-image">
            <img src={ilustracion2} alt="Imagen 2" className="Imagen_2" />
          </div>
          <div className="background-image">
            <img src={ilustracion3} alt="Imagen 3" className="Imagen_3" />
          </div>
        </div> */}
        <div className="container-button">
        <a href="#pizzas">
          <button className="boton-scroll" onClick={this.scrollToBottom}>
            Ver menu
          </button>
        </a>
      </div>
    </div>
    );
  }
}

export default BotonScroll;
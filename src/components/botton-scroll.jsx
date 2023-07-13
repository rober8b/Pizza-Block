import React from 'react';
import './botton-scroll.css';

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
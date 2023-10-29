import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import axios from 'axios';
import './App.css'; // Import your custom CSS file


class ProductTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      productid: this.props.data,
      isMounted: false,
      results: null,
      renderDelayed: false
    };
  }

  componentDidMount(){
    if(!this.state.isMounted) {
        // eslint-disable-next-line
        this.state.isMounted = true;
        const input = this.props.data;
        axios.get(`../../getsingleitem?productid=${input}`)
            .then((response) => {
            this.setState({results: response.data});
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
      setTimeout(() => {
        // console.log('After 1 seconds of sleep');
        this.setState({ renderDelayed: true });
      }, 1500);
  };

  render() {
    if (!this.state.renderDelayed) {
      return (<div className='row justify-content-center mt-4'>
          <div className='col-lg-9'>
              <div className='text-center'><div className="progress" role="progressbar" aria-label="Animated striped example" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
              <div className="progress-bar progress-bar-striped progress-bar-animated" style={{width: "50%"}}></div></div></div>
          </div>
          </div>); // Render progress bar until the delay is over
    };

    return (
      <div>
        {JSON.stringify(this.state.results)}
      </div>
    );
  }
}

export default ProductTable;
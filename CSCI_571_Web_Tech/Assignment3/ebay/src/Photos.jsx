import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import './App.css'; // Import your custom CSS file
import axios from 'axios';

class Photos extends Component {
    constructor(props) {
        super(props);
        this.state = {
          renderDelayed: false,
          imageurls: null,
          isMounted: false
        };
      }

    componentDidMount(){ 
      if(!this.state.isMounted) {
        // eslint-disable-next-line
        this.state.isMounted = true;
        const input = this.props.data;
        axios.get(`../../getphotos?productname=${input}`)
            .then((response) => {
              console.log(response.data.items);
              this.setState({imageurls: response.data.items});
            })
            .catch((error) => {
                console.error('Error:', error);
            });
      }
      setTimeout(() => {
        this.setState({ renderDelayed: true });    
          }, 2000);
      };

  render() {
    if (!this.state.renderDelayed) {
      return null
    }
    return (
    <div className='row'>
        <div className='col-lg-4 p-1'>
          <img src={this.state.imageurls[0].image.thumbnailLink} alt={this.props.data} className='img-fluid mb-1' style={{width: '100%', height: '15%', border: '5px solid #000'}}/>
          <img src={this.state.imageurls[1].image.thumbnailLink} alt={this.props.data} className='img-fluid mb-1' style={{width: '100%', height: '30%', border: '5px solid #000'}}/>
        </div>
        <div className='col-lg-4 p-1'>
        <img src={this.state.imageurls[2].image.thumbnailLink} alt={this.props.data} className='img-fluid mb-1' style={{width: '100%', height: '30%', border: '5px solid #000'}}/>
        <img src={this.state.imageurls[3].image.thumbnailLink} alt={this.props.data} className='img-fluid mb-1' style={{width: '100%', height: '20%', border: '5px solid #000'}}/>
        <img src={this.state.imageurls[4].image.thumbnailLink} alt={this.props.data} className='img-fluid mb-1' style={{width: '100%', height: '30%', border: '5px solid #000'}}/>
        </div>
        <div className='col-lg-4 p-1'>
        <img src={this.state.imageurls[5].image.thumbnailLink} alt={this.props.data} className='img-fluid mb-1' style={{width: '100%', height: '15%', border: '5px solid #000'}}/>
        <img src={this.state.imageurls[6].image.thumbnailLink} alt={this.props.data} className='img-fluid mb-1' style={{width: '100%', height: '40%', border: '5px solid #000'}}/>
        <img src={this.state.imageurls[7].image.thumbnailLink} alt={this.props.data} className='img-fluid mb-1' style={{width: '100%', height: '15%', border: '5px solid #000'}}/>
        </div>
    </div>
    );
  }
}

export default Photos;
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';

class ProductSearchForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: 'currentlocation',
      keyword: '',
      category: 'All Categories',
      conditionnew: '',
      conditionused: '',
      conditionunspecified: '',
      localpickup: '',
      freeshipping: '',
      distance: '10',
      from: ''
    };
  }

  handleInputChange = (event) => {
    const { id, value } = event.target;
    this.setState({ [id]: value });
  };

  handleSelectChange = (event) => {
    console.log(event);
    this.setState({ category: event.target.value });
  };

  handleRadioChange = (event) => {
    this.setState({
      location: event.target.value,
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    console.log(this.state);
  };

  render() {
    return (
      <div style={{backgroundColor: 'rgba(33,36,41,255)', borderRadius:'8px'}} className="container col-lg-9 mt-4">
        <div className="row justify-content-center">
          <div className="col-lg-10"> {/* Background 10 columns wide on larger screens */}
            <form style={{ paddingBottom:'15px', alignContent:'center'}} className='small' onSubmit={this.handleSubmit}>
              <h3 className="text-white text-left pt-4">Product Search</h3>
              <div className="form-group row pb-4 pt-4"> {/* Use row class for label + input layout */}
                <label htmlFor="keyword" className="text-white col-lg-2">Keyword<span className="text-danger">*</span></label>
                <div className="col-lg-4">
                  <input type="text" className="form-control" id="keyword" required placeholder='Enter Product Name (eg. iPhone 8)' onChange={this.handleInputChange}/>
                </div>
              </div>
              <div className="form-group row pb-4">
                <label htmlFor="category" className="text-white col-lg-2">Category</label>
                <div className="col-lg-2">
                  <select className="form-select" id="category" onChange={this.handleSelectChange} value={this.state.category}>
                    <option>All Categories</option>
                    <option>Art</option>
                    <option>Baby</option>
                    <option>Books</option>
                    <option>Clothing, Shoes & Accessories</option>
                    <option>Computers/Tablets & Networking</option>
                    <option>Health & Beauty</option>
                    <option>Music</option>
                    <option>Video Games & Consoles</option>
                  </select>
                </div>
              </div>
              <div className="form-group row pb-4">
                <label className="text-white col-lg-2">Condition</label>
                <div className="col-lg-4">
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="conditionnew" value="new" onChange={this.handleInputChange}/>
                    <label className="text-white form-check-label" htmlFor="conditionnew">New</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="conditionused" value="used" onChange={this.handleInputChange}/>
                    <label className="text-white form-check-label" htmlFor="conditionused">Used</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="conditionunspecified" value="unspecified" onChange={this.handleInputChange}/>
                    <label className="text-white form-check-label" htmlFor="conditionunspecified">Unspecified</label>
                  </div>
                </div>
              </div>
              <div className="form-group row pb-4">
                <label className="text-white col-lg-2">Shipping Options</label>
                <div className="col-lg-4">
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="localpickup" value="localpickup" onChange={this.handleInputChange}/>
                    <label className="text-white form-check-label" htmlFor="localpickup">Local Pickup</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="freeshipping" value="freeshipping" onChange={this.handleInputChange}/>
                    <label className="text-white form-check-label" htmlFor="freeshipping">Free Shipping</label>
                  </div>
                </div>
              </div>
              <div className="form-group row pb-4">
                <label htmlFor="distance" className="text-white col-lg-2">Distance (Miles)</label>
                <div className="col-lg-2">
                  <input type="number" className="form-control" id="distance" value={this.state.distance} placeholder='10' onChange={this.handleInputChange}/>
                </div>
              </div>
              <div className="form-group row pb-4">
                <label className="text-white col-lg-2">From<span className="text-danger">*</span></label>
                <div className="col-lg-4">
                  <div className="form-check pb-1">
                    <input
                      type="radio"
                      className='form-check-input'
                      name="from"
                      value="currentlocation"
                      checked={this.state.location === 'currentlocation'}
                      onChange={this.handleRadioChange}/>
                    <label className="form-check-label text-white" htmlFor="currentlocation">'Current Locaion'</label>
                  </div>
                  <div className="form-check pb-1">
                    <input
                      type="radio"
                      className='form-check-input'
                      name="from"
                      value="otherlocation"
                      checked={this.state.location === 'otherlocation'}
                      onChange={this.handleRadioChange}/>
                    <label className="form-check-label text-white col-lg-7" htmlFor="otherlocation">Other. Please specify zip code</label>
                      <input
                        type="text"
                        className="form-control"
                        id="from"
                        onChange={this.handleInputChange}
                        disabled={this.state.location === 'currentlocation'}/>
                  </div>
                </div>
              </div>
              <div className="text-left">
                <button 
                  style={{ marginRight:'30px', backgroundColor:'rgba(249,251,253,255)', color:'rgba(136,134,133,255)', paddingLeft:'10px', paddingRight:'10px', paddingBottom:'6px', paddingTop:'6px'}}
                  type="submit"
                  disabled={((this.state.keyword === '') || (this.state.location === 'otherlocation' && this.state.from === ''))} 
                  className="btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                    </svg> <b>Search</b></button>
                <button
                 style={{ marginRight:'30px', backgroundColor:'rgba(249,251,253,255)', color:'rgba(136,134,133,255)', paddingLeft:'10px', paddingRight:'10px', paddingBottom:'6px', paddingTop:'6px'}}
                 type="button" className="btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><g transform="translate(16 0) scale(-1 1)"><path fill="currentColor" fillRule="evenodd" d="M4.5 11.5A.5.5 0 0 1 5 11h10a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm-2-4A.5.5 0 0 1 3 7h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm-2-4A.5.5 0 0 1 1 3h10a.5.5 0 0 1 0 1H1a.5.5 0 0 1-.5-.5z"/></g>
                  </svg> <b>Clear</b></button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default ProductSearchForm;
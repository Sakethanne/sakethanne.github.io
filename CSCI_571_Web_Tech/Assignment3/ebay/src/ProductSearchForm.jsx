import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import axios from 'axios';
import ResultsTable from './ResultsComponent';
import WishlistTable from './WishlistComponent';
import ProductTable from './ProductComponent';

class ProductSearchForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: 'currentlocation',
      keyword: '',
      category: 'All Categories',
      conditionnew: false,
      conditionused: false,
      conditionunspecified: false,
      localpickup: false,
      freeshipping: false,
      distance: '10',
      from: '',
      listofzips: [],
      autolocation:'',
      keywordvalid: true,
      zipcodevalid: true,
      activeButton: 'results',
      displayflag: null,
      displayresults: 'results',
      producttopass: ''
    };
  }

  handleReset = (event) => {
    console.log('clearing the form data');
    this.setState({
      location: 'currentlocation',
      keyword: '',
      category: 'All Categories',
      conditionnew: false,
      conditionused: false,
      conditionunspecified: false,
      localpickup: false,
      freeshipping: false,
      distance: '10',
      from: '',
      listofzips: [],
      autolocation:'',
      keywordvalid: true,
      zipcodevalid: true,
      activeButton: 'results',
      displayflag: null,
      displayresults: 'results',
      producttopass: ''
    })
  };

  callGeoNamesApi = (zip) => {
    axios.get(`../../geonames?zip=${zip}`)
      .then((response) => {
        console.log(response);
        let zips = [];
        for (let i = 0; i < response.data.postalCodes.length; i++) {
          zips[i] = response.data.postalCodes[i].postalCode;
        }
        this.setState({ listofzips: zips });
        console.log(zips);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
  }

  callipInfo = () => {
    const apiUrl = `https://ipinfo.io/json?token=f141f67b70d679`;
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        this.setState({ autolocation: data.postal });
      })
      .catch((error) => {
        console.error('API request error:', error);
      });
  }

  handleInputChange = (event) => {
    const { id, value } = event.target;
    this.setState({ [id]: value });
    // eslint-disable-next-line
    if(((id === 'keyword') && (value === '')) || ((id === 'keyword') && (/[!@#$%^&*()_+{}\[\]:;<>,.?~\\]/.test(value)))){
      this.setState({keywordvalid: false});
    }
    else if((id === 'keyword') && (value !== '')){
      this.setState({keywordvalid: true});
    }
    
    if((id === 'from') && (value.length >= 3)){
      this.callGeoNamesApi(value);
    }
    
    if(((id === 'from') && (value === '')) || ((id === 'from') && !(/^\d{5}?$/.test(value)))){
      this.setState({zipcodevalid: false});
    }
    else if((id === 'from') && (value !== '')){
      this.setState({zipcodevalid: true});
    }

    if(this.state.location === 'currentlocation'){
      this.callipInfo();
    }
  };

  handleNewCheckBoxChange = () => {
    this.setState((prevState) => ({ conditionnew: !prevState.conditionnew }));
  };

  handleUsedCheckBoxChange = () => {
    this.setState((prevState) => ({ conditionused: !prevState.conditionused }));
  };

  handleUnspecifiedCheckBoxChange = () => {
    this.setState((prevState) => ({ conditionunspecified: !prevState.conditionunspecified }));
  };

  handleFreeShippingCheckBoxChange = () => {
    this.setState((prevState) => ({ freeshipping: !prevState.freeshipping }));
  };

  handleLocalPickupCheckBoxChange = () => {
    this.setState((prevState) => ({ localpickup: !prevState.localpickup }));
  };

  handleSelectChange = (event) => {
    this.setState({ category: event.target.value });
  };

  handleRadioChange = (event) => {
    this.setState({
      location: event.target.value,
    });
    if(event.target.value === 'currentlocation'){
      this.setState({zipcodevalid: true});
      this.setState({from: ''});
    }
  };

  handleResults = () => {
    this.setState({activeButton: 'results'});
    this.setState({displayresults: 'results'});
  };

  handleWishlist = async () => {
    this.setState({activeButton: 'wishlist'});
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    this.setState({displayflag: false});
    this.handleResults();
    setTimeout(() => {
      // console.log('After 1 seconds of sleep');
      this.setState({displayflag: true});
    }, 1);
  };

  receiveDataFromResultsTable = (data) => {
    this.setState({ producttopass: data });
    this.setState({ displayresults: 'product'});
  };

  receiveDataFromWishlistTable = (data) => {
    this.setState({ activeButton: 'results' });
    this.setState({ producttopass: data });
    this.setState({ displayresults: 'product'});
  };

  // Function to receive data from the child component
  receiveDataFromProductTable = (data) => {
    this.setState({displayresults: 'results'})
  };

  render() {
    
    return (
    <div>
      <div style={{backgroundColor: 'rgba(33,36,41,255)', borderRadius:'8px'}} className="container col-lg-9 mt-4 align-items-center">
        <div className="row justify-content-center">
          <div className="text-left col-lg-6 fixed-element"> {/* Background 10 columns wide on larger screens */}
            <form style={{ paddingBottom:'15px', alignContent:'center'}} className='small' onSubmit={this.handleSubmit}>
              <h3 className="text-white text-left pt-4">Product Search</h3>
              <div className="form-group row pb-4 pt-4 has-validation"> {/* Use row class for label + input layout */}
                <label htmlFor="keyword" className="text-white col-lg-4">Keyword<span className="text-danger">*</span></label>
                <div className={`col-lg-8 ${this.state.keywordvalid ? '' : 'is-invalid'}`}>
                  <input type="text" className={`form-control ${this.state.keywordvalid ? '' : 'is-invalid'}`} id="keyword" required placeholder='Enter Product Name (eg. iPhone 8)' onChange={this.handleInputChange} value={this.state.keyword}/>
                  <div className="invalid-feedback">
                  Please enter a keyword.
                </div>
                </div>
              </div>
              <div className="form-group row pb-4">
                <label htmlFor="category" className="text-white col-lg-4">Category</label>
                <div className="col-lg-4">
                  <select className="form-select" id="category" onChange={this.handleSelectChange} value={this.state.category}>
                    <option value={0}>All Categories</option>
                    <option value={550}>Art</option>
                    <option value={2948}>Baby</option>
                    <option value={261186}>Books</option>
                    <option value={11450}>Clothing, Shoes & Accessories</option>
                    <option value={58058}>Computers/Tablets & Networking</option>
                    <option value={26395}>Health & Beauty</option>
                    <option value={11233}>Music</option>
                    <option value={1249}>Video Games & Consoles</option>
                  </select>
                </div>
              </div>
              <div className="form-group row pb-4">
                <label className="text-white col-lg-4">Condition</label>
                <div className="col-lg-8">
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="conditionnew" onChange={this.handleNewCheckBoxChange} checked={this.state.conditionnew}/>
                    <label className="text-white form-check-label" htmlFor="conditionnew">New</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="conditionused" onChange={this.handleUsedCheckBoxChange} checked={this.state.conditionused}/>
                    <label className="text-white form-check-label" htmlFor="conditionused">Used</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="conditionunspecified" onChange={this.handleUnspecifiedCheckBoxChange} checked={this.state.conditionunspecified}/>
                    <label className="text-white form-check-label" htmlFor="conditionunspecified">Unspecified</label>
                  </div>
                </div>
              </div>
              <div className="form-group row pb-4">
                <label className="text-white col-lg-4">Shipping Options</label>
                <div className="col-lg-8">
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="localpickup" onChange={this.handleLocalPickupCheckBoxChange} checked={this.state.localpickup}/>
                    <label className="text-white form-check-label" htmlFor="localpickup">Local Pickup</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="freeshipping" onChange={this.handleFreeShippingCheckBoxChange} checked={this.state.freeshipping}/>
                    <label className="text-white form-check-label" htmlFor="freeshipping">Free Shipping</label>
                  </div>
                </div>
              </div>
              <div className="form-group row pb-4">
                <label htmlFor="distance" className="text-white col-lg-4">Distance (Miles)</label>
                <div className="col-lg-4">
                  <input type="number" className="form-control" id="distance" value={this.state.distance} placeholder='10' onChange={this.handleInputChange}/>
                </div>
              </div>
              <div className="form-group row pb-4 has-validation">
                <label className="text-white col-lg-4">From<span className="text-danger">*</span></label>
                <div className="col-lg-8">
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
                  </div>
                  <div className={`col-lg-12 ${this.state.zipcodevalid ? '' : 'is-invalid'}`}>
                    <input
                        type="text"
                        className={`form-control ${this.state.zipcodevalid ? '' : 'is-invalid'}`}
                        id="from"
                        list="zipsuggestions"
                        value={this.state.from}
                        onChange={this.handleInputChange}
                        disabled={this.state.location === 'currentlocation'}/>
                        <datalist id="zipsuggestions"> 
                          <option value={this.state.listofzips[0]} />
                          <option value={this.state.listofzips[1]} />
                          <option value={this.state.listofzips[2]} />
                          <option value={this.state.listofzips[3]} />
                          <option value={this.state.listofzips[4]} />
                        </datalist>
                        <div className="invalid-feedback">
                          Please enter a zipcode.
                        </div>
                  </div>
                </div>
              </div>
              <div className="text-left">
                <button 
                  style={{ marginRight:'30px', backgroundColor:'rgba(249,251,253,255)', color:'rgba(136,134,133,255)', paddingLeft:'10px', paddingRight:'10px', paddingBottom:'6px', paddingTop:'6px'}}
                  type="submit"
                  disabled={((this.state.keyword === '') || (this.state.location === 'otherlocation' && !(/^\d{5}(-\d{4})?$/.test(this.state.from))))}
                  // disabled={}
                  className="btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                    </svg> <b>Search</b></button>
                <button
                 onClick={this.handleReset}
                 style={{ marginRight:'30px', backgroundColor:'rgba(249,251,253,255)', color:'rgba(136,134,133,255)', paddingLeft:'10px', paddingRight:'10px', paddingBottom:'6px', paddingTop:'6px'}}
                 type="button" className="btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><g transform="translate(16 0) scale(-1 1)"><path fill="currentColor" fillRule="evenodd" d="M4.5 11.5A.5.5 0 0 1 5 11h10a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm-2-4A.5.5 0 0 1 3 7h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm-2-4A.5.5 0 0 1 1 3h10a.5.5 0 0 1 0 1H1a.5.5 0 0 1-.5-.5z"/></g>
                  </svg> <b>Clear</b></button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className='text-center mt-5'>
      <button
        onClick={this.handleResults}
        style={{
          backgroundColor: this.state.activeButton === 'results' ? 'rgba(33,36,41,255)' : 'white',
          color: this.state.activeButton === 'results' ? 'white' : 'rgba(33,36,41,255)',
          borderRadius: '4px',
          border:'none'
        }}
        className="btn btn-sm">
        Results
      </button>
      <button
        onClick={this.handleWishlist}
        style={{
          backgroundColor: this.state.activeButton === 'wishlist' ? 'rgba(33,36,41,255)' : 'white',
          color: this.state.activeButton === 'wishlist' ? 'white' : 'rgba(33,36,41,255)',
          borderRadius: '4px',
          border:'none'
        }}
        className="btn btn-sm">
        Wishlist
      </button>
    </div>
    <div>
      {this.state.activeButton === 'results' ? this.state.displayflag === true ? this.state.displayresults === 'results' ? <ResultsTable data={this.state} sendDataToResults={this.receiveDataFromResultsTable}/> : <ProductTable data={this.state.producttopass} setToResults={this.receiveDataFromProductTable}/> : '' : <WishlistTable data={this.state.producttopass} sendDatafromWishlist={this.receiveDataFromWishlistTable}/>}
    </div>
    </div>
    );
  }
}

export default ProductSearchForm;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProductSearchForm = () => {
  const initialState = {
    location: 'currentlocation',
    keyword: '',
    category: 'All Categories',
    conditionnew: '',
    conditionused: '',
    conditionunspecified: '',
    localpickup: '',
    freeshipping: '',
    distance: '10',
    from: '',
    listofzips: [],
    autolocation: '',
    keywordvalid: true,
    zipcodevalid: true,
  };

  const [userInput, setuserInput] = useState(initialState);

  useEffect(() => {
    if (userInput.location === 'currentlocation') {
      callIpInfo();
    }
  }, [userInput.location]);

  const handleInputChange = (event) => {
    const { id, value, type } = event.target;

    if (type === 'checkbox') {
      setuserInput((prevData) => ({
        ...prevData,
        [id]: event.target.checked ? 'on' : '',
      }));
    } else {
      setuserInput({ ...userInput, [id]: value });
    }

    if(((id === 'keyword' &&(value === '')) || (/[!@#$%^&*()_+{}\[\]:;<>,.?~\\]/.test(value)))){
     setuserInput({...userInput, keywordvalid: false});
    }

    // if(id === 'from' && value.length >=3){
    //   callGeoNamesApi(value);
    // }
  };

  const handleSelectChange = (event) => {
    setuserInput({ ...userInput, category: event.target.value });
  };

  const handleRadioChange = (event) => {
    setuserInput({ ...userInput, location: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(userInput);
  };

  const callGeoNamesApi = (zip) => {
    const apiUrl = `http://api.geonames.org/postalCodeSearchJSON?postalcode_startsWith=${zip}&maxRows=5&username=sakethanne&country=US`;
    console.log(apiUrl);
    axios.get(apiUrl)
      .then((response) => {
        const zips = response.data.postalCodes.map((item) => item.postalCode);
        setuserInput({ ...userInput, listofzips: zips });
        console.log(zips);
        // return true;
        // console.log(response)
  })
  .catch((error) => {
    // Handle any errors that occurred during the request
    console.error('Error:', error);
  });
  };

  const callIpInfo = () => {
    // Replace with the actual API endpoint URL
    const apiUrl = 'https://ipinfo.io/json?token=f141f67b70d679';
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        setuserInput({ ...userInput, autolocation: data.postal });
      })
      .catch((error) => {
        console.error('API request error:', error);
      });
  };

  const handleReset = () => {
    console.log('clearing the form data');
    setuserInput(initialState);
  };

  const [activeButton, setActiveButton] = useState('results');

  const handleResults = () => {
    // Handle the search action here
    setActiveButton('results'); // Set the 'search' button as active
  };

  const handleWishlist = () => {
    // Handle the clear action here
    setActiveButton('wishlist'); // Set the 'clear' button as active
  };

  return (
  <div>
    <div style={{backgroundColor: 'rgba(33,36,41,255)', borderRadius:'8px'}} className="container col-lg-9 mt-4 align-items-center">
        <div className="row justify-content-center">
          <div className="text-left col-lg-6"> {/* Background 10 columns wide on larger screens */}
            <form style={{ paddingBottom:'15px', alignContent:'center'}} className='small' onSubmit={handleSubmit}>
              <h3 className="text-white text-left pt-4">Product Search</h3>
              <div className="form-group row pb-4 pt-4 has-validation"> {/* Use row class for label + input layout */}
                <label htmlFor="keyword" className="text-white col-lg-4">Keyword<span className="text-danger">*</span></label>
                <div className={`col-lg-8 ${userInput.keywordvalid ? '' : 'is-invalid'}`}>
                  <input type="text" className={`form-control ${userInput.keywordvalid ? '' : 'is-invalid'}`} id="keyword" required placeholder='Enter Product Name (eg. iPhone 8)' onChange={handleInputChange} value={userInput.keyword}/>
                  <div className="invalid-feedback">
                  Please enter a keyword.
                </div>
                </div>
              </div>
              <div className="form-group row pb-4">
                <label htmlFor="category" className="text-white col-lg-4">Category</label>
                <div className="col-lg-4">
                  <select className="form-select" id="category" onChange={handleSelectChange} value={userInput.category}>
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
                <label className="text-white col-lg-4">Condition</label>
                <div className="col-lg-8">
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="conditionnew" onChange={handleInputChange} checked={userInput.conditionnew === 'on'}/>
                    <label className="text-white form-check-label" htmlFor="conditionnew">New</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="conditionused" onChange={handleInputChange} checked={userInput.conditionused === 'on'}/>
                    <label className="text-white form-check-label" htmlFor="conditionused">Used</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="conditionunspecified" onChange={handleInputChange} checked={userInput.conditionunspecified === 'on'}/>
                    <label className="text-white form-check-label" htmlFor="conditionunspecified">Unspecified</label>
                  </div>
                </div>
              </div>
              <div className="form-group row pb-4">
                <label className="text-white col-lg-4">Shipping Options</label>
                <div className="col-lg-8">
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="localpickup" onChange={handleInputChange} checked={userInput.localpickup === 'on'}/>
                    <label className="text-white form-check-label" htmlFor="localpickup">Local Pickup</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="freeshipping" onChange={handleInputChange} checked={userInput.freeshipping === 'on'}/>
                    <label className="text-white form-check-label" htmlFor="freeshipping">Free Shipping</label>
                  </div>
                </div>
              </div>
              <div className="form-group row pb-4">
                <label htmlFor="distance" className="text-white col-lg-4">Distance (Miles)</label>
                <div className="col-lg-4">
                  <input type="number" className="form-control" id="distance" value={userInput.distance} placeholder='10' onChange={handleInputChange}/>
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
                      checked={userInput.location === 'currentlocation'}
                      onChange={handleRadioChange}/>
                    <label className="form-check-label text-white" htmlFor="currentlocation">'Current Locaion'</label>
                  </div>
                  <div className="form-check pb-1">
                    <input
                      type="radio"
                      className='form-check-input'
                      name="from"
                      value="otherlocation"
                      checked={userInput.location === 'otherlocation'}
                      onChange={handleRadioChange}/>
                    <label className="form-check-label text-white col-lg-7" htmlFor="otherlocation">Other. Please specify zip code</label>
                  </div>
                  <div className={`col-lg-12 ${userInput.zipcodevalid ? '' : 'is-invalid'}`}>
                    <input
                        type="text"
                        className={`form-control ${userInput.zipcodevalid ? '' : 'is-invalid'}`}
                        id="from"
                        list="zipsuggestions"
                        onChange={handleInputChange}
                        // value={userInput.from}
                        disabled={userInput.location === 'currentlocation'}/>
                        <datalist id="zipsuggestions"> 
                          <option value={userInput.listofzips[0]} />
                          <option value={userInput.listofzips[1]} />
                          <option value={userInput.listofzips[2]} />
                          <option value={userInput.listofzips[3]} />
                          <option value={userInput.listofzips[4]} />
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
                  // disabled={((userInput.keyword === '') || (userInput.location === 'otherlocation' && userInput.from===''))}
                  className="btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                    </svg> <b>Search</b></button>
                <button
                 onClick={handleReset}
                 style={{ marginRight:'30px', backgroundColor:'rgba(249,251,253,255)', color:'rgba(136,134,133,255)', paddingLeft:'10px', paddingRight:'10px', paddingBottom:'6px', paddingTop:'6px'}}
                 type="button" className="btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><g transform="translate(16 0) scale(-1 1)"><path fill="currentColor" fillRule="evenodd" d="M4.5 11.5A.5.5 0 0 1 5 11h10a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm-2-4A.5.5 0 0 1 3 7h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm-2-4A.5.5 0 0 1 1 3h10a.5.5 0 0 1 0 1H1a.5.5 0 0 1-.5-.5z"/></g>
                  </svg> <b>Clear</b></button>
              </div>
            </form>
          </div>
        </div>
      </div>
  </div>
  );
};

export default ProductSearchForm;

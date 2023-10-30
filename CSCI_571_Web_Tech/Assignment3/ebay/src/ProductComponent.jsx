import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import axios from 'axios';
import './App.css'; // Import your custom CSS file
import {
  CircularProgressbar,
  buildStyles
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Photos from './Photos';


class ProductTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      productid: this.props.data,
      isMounted: false,
      results: null,
      renderDelayed: false,
      wishlistproducts: [],
      productdisplaystate: 'product',
      showOverlay: false,
      selectedImages: [],
      currentIndex: 0
    };
  }

  openCarousel = (images) => {
    console.log(images);
    this.setState({
      showOverlay: true,
      selectedImages: images,
    });
    document.body.style.overflow = 'hidden';
  };

  closeCarousel = () => {
    this.setState({
      showOverlay: false,
      selectedImages: [],
      currentIndex: 0,
    });
    document.body.style.overflow = 'auto';
  };

  prevImage = () => {
    this.setState((prevState) => ({
      currentIndex: (prevState.currentIndex - 1 + prevState.selectedImages.length) % prevState.selectedImages.length,
    }));
  };

  nextImage = () => {
    this.setState((prevState) => ({
      currentIndex: (prevState.currentIndex + 1) % prevState.selectedImages.length,
    }));
  };

  getWishlist = async () => {
    var products = [];
    await axios.get(`../../getfavs`)
      .then(async (response) => {
        for(const product of response.data.Wishlist_Products) {
            var newprod = JSON.parse(product);
            products.push(newprod.productid);
        }
        this.setState({wishlistproducts:products});
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  componentDidMount(){
    if(!this.state.isMounted) {
        // eslint-disable-next-line
        this.state.isMounted = true;
        const input = this.props.data;
        axios.get(`../../getsingleitem?productid=${input}`)
            .then((response) => {
            this.setState({results: response.data});
            this.getWishlist();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
      setTimeout(() => {
        // console.log('After 1 seconds of sleep');
        this.setState({ renderDelayed: true });
      }, 2000);
  };

  productwishlist = async (event, id) => {
    var product_id = id;
    if(this.state.wishlistproducts.includes(product_id)){
        await axios.get(`../../deletefav?productid=${product_id}`)
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        this.setState((prevState) => ({
          wishlistproducts: prevState.wishlistproducts.filter((item) => item !== product_id), // Create a new array excluding the value to be removed
              }));
    }
    else{
        var product_name = this.state.results.Item.Title;
        var product_price = this.state.results.Item.CurrentPrice.Value;
        var product_shipping = '0.0';
        var product_img = this.state.results.Item.PictureURL[0];
        await axios.get(`../../addfav?productid=${product_id}&product_name=${product_name}&product_price=${product_price}&product_shipping=${product_shipping}&product_img_url=${product_img}`)
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        this.setState((prevState) => ({
          wishlistproducts: [...prevState.wishlistproducts, product_id], // Create a new array with the existing values and the new value
              }));
    }
  };

  handlebuttons = (event, name) => {
    this.setState({productdisplaystate: name});
  };

  setToResults = (event, value) => {
    const { setToResults } = this.props;
    setToResults(value);
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

    const { showOverlay, selectedImages, currentIndex } = this.state;

    return (
      <div className='row justify-content-center mt-4'>
        <div className='col-lg-9'>
          <div className='text-center'>
            <div className='mt-1 mb-4'>
              <b>{this.state.results.Item.Title}</b>
            </div>
          </div>
            <div className="row">
              <div className="col-lg-6 d-flex justify-content-start">
                <button className="btn btn-light" style={{color: 'black'}} type="button" onClick={(e) => this.setToResults(e, `true`)}>&lt; List</button>
              </div>
              <div className="col-lg-6 d-flex justify-content-end">
                <a href={`https://www.facebook.com/share.php?u=${this.state.results.Item.ViewItemURLForNaturalSearch}`} target='_blank' rel='noreferrer'><button className="btn"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="rgba(13,110,253,255)" className="bi bi-facebook" viewBox="0 0 16 16">
                  <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                </svg></button></a>
                {this.state.wishlistproducts.includes(this.state.results.Item.ItemID) ? (<button
                             style={{border: 'none', borderRadius:'2px'}}
                             type='button' 
                             id={this.state.results.Item.ItemID}
                            onClick={(e) => this.productwishlist(e, `${this.state.results.Item.ItemID}`)}
                             ><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="orange" className="bi bi-cart-plus-fill" viewBox="0 0 16 16">
                                <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM9 5.5V7h1.5a.5.5 0 0 1 0 1H9v1.5a.5.5 0 0 1-1 0V8H6.5a.5.5 0 0 1 0-1H8V5.5a.5.5 0 0 1 1 0z"/>
                            </svg></button>)
                            :
                            (<button
                                style={{border: 'none', borderRadius:'2px'}}
                                type='button' 
                                id={this.state.results.Item.ItemID}
  
                               onClick={(e) => this.productwishlist(e, `${this.state.results.Item.ItemID}`)}
                                ><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-cart-plus-fill" viewBox="0 0 16 16">
                                   <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM9 5.5V7h1.5a.5.5 0 0 1 0 1H9v1.5a.5.5 0 0 1-1 0V8H6.5a.5.5 0 0 1 0-1H8V5.5a.5.5 0 0 1 1 0z"/>
                               </svg></button>)
                        }  
              </div>
            </div>
            <div className="row mt-1">
              <div className="col-lg-12 d-flex justify-content-end">
                <button className="btn" onClick={(e) => this.handlebuttons(e, 'product')}
                 style={{
                  backgroundColor: this.state.productdisplaystate === 'product' ? 'rgba(33,36,41,255)' : 'white',
                  color: this.state.productdisplaystate === 'product' ? 'white' : 'rgba(33,36,41,255)',
                  borderRadius: '2px',
                  border:'none'
                  }} type="button">Product</button>
                <button className="btn" onClick={(e) => this.handlebuttons(e, 'photos')}
                style={{
                  backgroundColor: this.state.productdisplaystate === 'photos' ? 'rgba(33,36,41,255)' : 'white',
                  color: this.state.productdisplaystate === 'photos' ? 'white' : 'rgba(33,36,41,255)',
                  borderRadius: '2px',
                  border:'none'
                  }} type="button">Photos</button>
                <button className="btn" onClick={(e) => this.handlebuttons(e, 'shipping')}
                 style={{
                  backgroundColor: this.state.productdisplaystate === 'shipping' ? 'rgba(33,36,41,255)' : 'white',
                  color: this.state.productdisplaystate === 'shipping' ? 'white' : 'rgba(33,36,41,255)',
                  borderRadius: '2px',
                  border:'none'
                  }} type="button">Shipping</button>
                <button className="btn" onClick={(e) => this.handlebuttons(e, 'seller')}
                 style={{
                  backgroundColor: this.state.productdisplaystate === 'seller' ? 'rgba(33,36,41,255)' : 'white',
                  color: this.state.productdisplaystate === 'seller' ? 'white' : 'rgba(33,36,41,255)',
                  borderRadius: '4px',
                  border:'none'
                  }} type="button">Seller</button>
                <button className="btn" onClick={(e) => this.handlebuttons(e, 'similar')}
                 style={{
                  backgroundColor: this.state.productdisplaystate === 'similar' ? 'rgba(33,36,41,255)' : 'white',
                  color: this.state.productdisplaystate === 'similar' ? 'white' : 'rgba(33,36,41,255)',
                  borderRadius: '4px',
                  border:'none'
                  }} type="button">Similar Products</button>
              </div>
              <hr/>
            </div>
              {this.state.productdisplaystate === 'product' ? 
              
              <div className='row'>
                <div className='d-flex justity-content-center'>
                  <table className='table table-dark table-striped table-hover table-borderless'>
                    <tbody>
                      <tr>
                        <th>Product Images</th>
                        <td><a href="#" onClick={() => this.openCarousel(this.state.results.Item.PictureURL)} style={{textDecoration: 'none', color: 'rgba(101,151,149,255)'}}>View Product Images Here</a>
                        {showOverlay && (
                        <div className="overlay-background">
                          <div className="overlay">
                            <button className='overlaybutton' onClick={this.prevImage} type='button'>
                              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-arrow-left-circle" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5z"/>
                              </svg>
                            </button>
                              <img src={selectedImages[currentIndex]} alt={selectedImages[currentIndex]} style={{width: '400px', height: '400px', border: '7px solid black'}}/>
                            <button className="overlaybutton" onClick={this.nextImage} type='button'>
                              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-arrow-right-circle" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z"/>
                              </svg>
                            </button>
                            <button className="close-button" onClick={this.closeCarousel}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
                              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                            </svg>
                            </button>
                          </div>
                        </div>
                      )}
                        </td>
                      </tr>
                      
                      <tr>
                        <th>Price</th>
                        <td>${this.state.results.Item.CurrentPrice.Value}</td>
                      </tr>
                      <tr>
                        <th>Location</th>
                        <td>{this.state.results.Item.Location}</td>
                      </tr>
                      <tr>
                        <th>Return Policy (US)</th>
                        <td>{this.state.results.Item.ReturnPolicy.ReturnsAccepted} with in {this.state.results.Item.ReturnPolicy.ReturnsWithin}</td>
                      </tr>
                      {this.state.results.Item.ItemSpecifics.NameValueList.map((feature) => (
                  <tr key={feature.Name}>
                    <td>{feature.Name}</td>
                    <td>{feature.Value[0]}</td>
                    </tr>))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              
              : this.state.productdisplaystate === 'photos' ? <Photos data={this.state.results.Item.Title}/> : this.state.productdisplaystate === 'shipping' ? 
              
              
              <div className='row'>
                <div className='d-flex justify-content-center'>
                  <table className='table table-dark table-striped table-hover table-borderless'>
                    <tbody>
                    <tr className='col-lg-12'>
                      <th>Shipping Cost</th><td>{this.state.results.Item.CurrentPrice.__value__ === '0.0' ? `$${this.state.results.Item.CurrentPrice.__value__}` : 'Free Shipping'}</td>
                    </tr>
                    <tr className='col-lg-12'>
                      <th>Shipping Locations</th><td>{this.state.results.Item.ShipToLocations}</td>
                    </tr>
                    <tr className='col-lg-12'>
                      <th>Handling time</th><td>{this.state.results.Item.HandlingTime} Days</td>
                    </tr>
                    <tr className='col-lg-12'>
                      <th>Expedited Shipping</th><td>{this.state.results.Item.ReturnPolicy.ShippingCostPaidBy === 'Seller' ? <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="green" className="bi bi-check" viewBox="0 0 16 16">
                          <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                          </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="red" className="bi bi-x" viewBox="0 0 16 16">
                          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>}</td>
                    </tr>
                    <tr className='col-lg-12'>
                      <th>One Day Shipping</th><td>{this.state.results.Item.HandlingTime === '1' ? <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="green" className="bi bi-check" viewBox="0 0 16 16">
                          <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                          </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="red" className="bi bi-x" viewBox="0 0 16 16">
                          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                          </svg>}</td>
                    </tr>
                    <tr className='col-lg-12'>
                      <th>Return Accepted</th><td>{this.state.results.Item.ReturnPolicy.ReturnsAccepted === 'Returns Accepted' ? <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="green" className="bi bi-check" viewBox="0 0 16 16">
                          <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                          </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="red" className="bi bi-x" viewBox="0 0 16 16">
                          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                          </svg>}</td>
                    </tr>
                    </tbody>
                  </table>
                  </div>
              </div>
               
               
               : this.state.productdisplaystate === 'seller' ? 
               
               
               <div className='row'>
                <div className='col-lg-12 d-flex justify-content-center mt--4'>
                  <table className='table table-dark table-striped table-hover table-borderless'>
                    <thead>
                      <tr>
                        <th className='text-uppercase text-center fs-3' colSpan={2}>{this.state.results.Item.Seller.UserID}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th>Feedback Score</th><td>{this.state.results.Item.Seller.FeedbackScore}</td>
                      </tr>
                      <tr>
                        <th>Popularity</th><td><div style={{width: '40px', height: '40px'}}><CircularProgressbar
                              value={this.state.results.Item.Seller.PositiveFeedbackPercent}
                              text={`${this.state.results.Item.Seller.PositiveFeedbackPercent}%`}
                              styles={buildStyles({
                                textColor: "white",
                                pathColor: "green",
                                height: 10,
                                width: 10
                              })}/></div></td>
                      </tr>
                      <tr>
                        <th>Feedback Rating Star</th><td>
                          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill={this.state.results.Item.Seller.FeedbackRatingStar.replace("Shooting","")} className="bi bi-star-fill" viewBox="0 0 16 16">
                          <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                          </svg>
                          </td>
                      </tr>
                      <tr>
                        <th>Top Rated</th><td>{this.state.results.Item.Seller.TopRatedSeller === true ? <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="green" className="bi bi-check" viewBox="0 0 16 16">
                          <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                          </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="red" className="bi bi-x" viewBox="0 0 16 16">
                          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                          </svg>}</td>
                      </tr>
                      <tr>
                        <th>Store Name</th><td>{this.state.results.Item.Storefront.StoreName}</td>
                      </tr>
                      <tr>
                        <th>Buy Product At</th><td><a href={this.state.results.Item.Storefront.StoreURL} target='_blank' rel="noreferrer" style={{textDecoration: 'none', color: 'rgba(101,151,149,255)'}}>Store</a></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              
              : this.state.productdisplaystate === 'similar' ? <div>Similar</div> : ''}
          
          
          </div>
        </div>
    );
  }
}

export default ProductTable;
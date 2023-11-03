import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import axios from 'axios';
import './App.css'; // Import your custom CSS file
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

class ProductTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      productid: this.props.data,
      isMounted: false,
      results: null,
      imageurls: null,
      similarresults: null,
      renderDelayed: false,
      wishlistproducts: [],
      productdisplaystate: 'product',
      showOverlay: false,
      selectedImages: [],
      currentIndex: 0,
      itemsToShow: 5,
      showMore: true,
      sortField: 'default',
      sortDirection: 'ascending'
    };
  }

  handleSortFieldChange = (event) => {
    const sortField = event.target.value;
    this.setState({ sortField });
  };

  handleSortDirectionChange = (event) => {
    const sortDirection = event.target.value;
    this.setState({ sortDirection });
  };


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
    // if(!this.state.isMounted) {
    //     // eslint-disable-next-line
    //     this.state.isMounted = true;
        const input = this.props.data;
        axios.get(`../../getsingleitem?productid=${input}`)
            .then((response) => {
            this.setState({results: response.data});
            this.getWishlist();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
        console.log('getting the similar products');
        axios.get(`../../getsimilaritems?productid=${input}`)
            .then((response) => {
            if('item' in response.data.getSimilarItemsResponse.itemRecommendations){
              this.setState({similarresults: response.data.getSimilarItemsResponse.itemRecommendations.item});
            }
            else{
              this.setState({similarresults: null});
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
        
    // }
      setTimeout(() => {
        console.log('getting images');
        this.getphotos();
        this.setState({ renderDelayed: true });
      }, 2000);
  };

  getphotos = async () => {
    await axios.get(`../../getphotos?productname=${this.state.results.Item.Title}`)
            .then((response) => {
              console.log(response.data.items);
              this.setState({imageurls: response.data.items});
            })
            .catch((error) => {
                console.error('Error:', error);
            });
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

  toggleShowMore = () => {
    this.setState((prevState) => ({
      itemsToShow: prevState.showMore ? prevState.similarresults.length : 5, // Toggle between all items and 5 items
      showMore: !prevState.showMore,
    }), this.renderSortedProducts);
    setTimeout(() => {
      window.scrollTo(0, document.body.scrollHeight);
    }, 0);
  };

  filterAndSortItems = () => {
    const { sortField, sortDirection } = this.state;
    const items = this.state.similarresults;
    if(items === null){
      return items;
    }

    // Sort the items based on the sortField and sortDirection
    const sortedItems = items.slice().sort((a, b) => {
      if (sortField === 'price') {
        return sortDirection === 'ascending' ? a.buyItNowPrice.__value__ - b.buyItNowPrice.__value__ : b.buyItNowPrice.__value__ - a.buyItNowPrice.__value__;
      }
      if (sortField === 'shippingcost') {
        return sortDirection === 'ascending' ? a.shippingCost.__value__ - b.shippingCost.__value__ : b.shippingCost.__value__ - a.shippingCost.__value__;
      }
      if (sortField === 'daysleft') {
        return sortDirection === 'ascending' ? a.timeLeft.substring(a.timeLeft.indexOf("P") + 1, a.timeLeft.indexOf("D")) - b.timeLeft.substring(b.timeLeft.indexOf("P") + 1, b.timeLeft.indexOf("D")) : b.timeLeft.substring(b.timeLeft.indexOf("P") + 1, b.timeLeft.indexOf("D")) - a.timeLeft.substring(a.timeLeft.indexOf("P") + 1, a.timeLeft.indexOf("D")) ;
      }
      if (sortField === 'productname') {
        return sortDirection === 'ascending' ? a.title - b.title : b.title - a.title;
      }
      return 0;
    });
    return sortedItems;
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
    const { itemsToShow, showMore} = this.state;
    // const { sortField, sortDirection } = this.state;
    const items = this.filterAndSortItems();

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
                             >
                            <span className="material-symbols-outlined" style={{color: 'rgba(177,135,47,255)'}}>remove_shopping_cart</span>
                            </button>)
                            :
                            (<button
                                style={{border: 'none', borderRadius:'2px'}}
                                type='button' 
                                id={this.state.results.Item.ItemID}
  
                               onClick={(e) => this.productwishlist(e, `${this.state.results.Item.ItemID}`)}>
                                  <span className="material-symbols-outlined">add_shopping_cart</span>
                               </button>)
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
                <div className='d-flex justity-content-center table-responsive'>
                  <table className='table table-dark table-striped table-hover table-borderless custom'>
                    <tbody>
                      <tr>
                        <th className='col-lg-6'>Product Images</th>
                        <td className='col-lg-6'><a onClick={() => this.openCarousel(this.state.results.Item.PictureURL)} style={{textDecoration: 'none', color: 'rgba(101,151,149,255)', cursor: 'pointer'}}>View Product Images Here</a>
                        {showOverlay && (
                        <div className="overlay-background">
                          <div className="overlay">
                            <div className="overlay-header" style={{backgroundColor: 'white', color:'black', borderBottom: '0.7px solid black'}}>
                              <h5 style={{backgroundColor: 'white', color:'black', border: 'none', paddingTop:'10px'}}>Product Images</h5>
                              <button className="close-button" onClick={this.closeCarousel}>
                              <span className="material-symbols-outlined">close</span>
                            </button>
                          </div>
                          <div className='overlay-content mt-2'>
                            <div className="container">
                              <div className='d-flex flex-row'>
                                <div className='d-flex justify-content-center align-items-center'>
                                  <button className='overlaybutton prev-button' onClick={this.prevImage} type='button'>
                                    <span className="material-symbols-outlined">arrow_back_ios</span>
                                  </button>
                                </div>
                                <div className='d-flex justify-content-center align-items-center'>
                                  <img src={selectedImages[currentIndex]} alt={selectedImages[currentIndex]} style={{width: '320px', height: '350px', border: '5px solid black'}}/>
                                </div>
                                <div className='d-flex justify-content-center align-items-center'>
                                  <button className="overlaybutton next-button" onClick={this.nextImage} type='button'>
                                    <span className="material-symbols-outlined">arrow_forward_ios</span>
                                  </button>
                                </div>
                              </div>
                            <div>
                          </div>
                          </div>
                          <div className='overlay-footer m-2 pt-2' style={{backgroundColor: 'white', color: 'black', textAlign: 'right', borderTop: '0.7px solid black'}}>
                          <button type="button" className="btn btn-secondary" onClick={this.closeCarousel}>Close</button>
                          </div>
                        </div>
                          </div>
                      </div>
                      )}
                        </td>
                      </tr>
                      
                      <tr>
                        <th className='col-lg-6'>Price</th>
                        <td className='col-lg-6'>${this.state.results.Item.CurrentPrice.Value}</td>
                      </tr>
                      <tr>
                        <th className='col-lg-6'>Location</th>
                        <td className='col-lg-6'>{this.state.results.Item.Location}</td>
                      </tr>
                      <tr>
                        <th className='col-lg-6'>Return Policy (US)</th>
                        <td className='col-lg-6'>{this.state.results.Item.ReturnPolicy.ReturnsAccepted}{this.state.results.Item.ReturnPolicy.ReturnsAccepted === 'Returns Accepted' ? `with in ${this.state.results.Item.ReturnPolicy.ReturnsWithin}` : ''}</td>
                      </tr>
                      {this.state.results.Item.ItemSpecifics.NameValueList.map((feature) => (
                  <tr key={feature.Name}>
                    <th className='col-lg-6'>{feature.Name}</th>
                    <td className='col-lg-6'>{feature.Value[0]}</td>
                    </tr>))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              
              : this.state.productdisplaystate === 'photos' ? 
              
              (<div className='row'>
              <div className='col-lg-4 p-1'>
                <a href={this.state.imageurls[0].image.thumbnailLink} target='_blank' rel='noreferrer'><img src={this.state.imageurls[0].image.thumbnailLink} alt={this.props.data} className='img-fluid mb-1' style={{width: '100%', border: '5px solid #000'}}/></a>
                <a href={this.state.imageurls[1].image.thumbnailLink} target='_blank' rel='noreferrer'><img src={this.state.imageurls[1].image.thumbnailLink} alt={this.props.data} className='img-fluid mb-1' style={{width: '100%', border: '5px solid #000'}}/></a>
              </div>
              <div className='col-lg-4 p-1'>
                <a href={this.state.imageurls[2].image.thumbnailLink} target='_blank' rel='noreferrer'><img src={this.state.imageurls[2].image.thumbnailLink} alt={this.props.data} className='img-fluid mb-1' style={{width: '100%', border: '5px solid #000'}}/></a>
                <a href={this.state.imageurls[3].image.thumbnailLink} target='_blank' rel='noreferrer'><img src={this.state.imageurls[3].image.thumbnailLink} alt={this.props.data} className='img-fluid mb-1' style={{width: '100%', border: '5px solid #000'}}/></a>
                <a href={this.state.imageurls[4].image.thumbnailLink} target='_blank' rel='noreferrer'><img src={this.state.imageurls[4].image.thumbnailLink} alt={this.props.data} className='img-fluid mb-1' style={{width: '100%', border: '5px solid #000'}}/></a>
              </div>
              <div className='col-lg-4 p-1'>
                <a href={this.state.imageurls[5].image.thumbnailLink} target='_blank' rel='noreferrer'><img src={this.state.imageurls[5].image.thumbnailLink} alt={this.props.data} className='img-fluid mb-1' style={{width: '100%', border: '5px solid #000'}}/></a>
                <a href={this.state.imageurls[6].image.thumbnailLink} target='_blank' rel='noreferrer'><img src={this.state.imageurls[6].image.thumbnailLink} alt={this.props.data} className='img-fluid mb-1' style={{width: '100%', border: '5px solid #000'}}/></a>
                <a href={this.state.imageurls[7].image.thumbnailLink} target='_blank' rel='noreferrer'><img src={this.state.imageurls[7].image.thumbnailLink} alt={this.props.data} className='img-fluid mb-1' style={{width: '100%', border: '5px solid #000'}}/></a>
              </div>
          </div>)
              
              : this.state.productdisplaystate === 'shipping' ? 
              
              (<div className='row'>
              <div className='d-flex justify-content-center table-responsive'>
                <table className='table table-dark table-striped table-hover table-borderless custom'>
                  <tbody>
                    <tr>
                      <th className='col-lg-6'>Shipping Cost</th>
                      <td className='col-lg-6'>
                        {this.state.results.Item.CurrentPrice.__value__ === '0.0' ? `$${this.state.results.Item.CurrentPrice.__value__}` : 'Free Shipping'}
                      </td>
                    </tr>
                    <tr>
                      <th className='col-lg-6'>Shipping Locations</th>
                      <td className='col-lg-6'>{this.state.results.Item.ShipToLocations}</td>
                    </tr>
                    <tr>
                      <th className='col-lg-6'>Handling time</th>
                      <td className='col-lg-6'>{this.state.results.Item.HandlingTime} Days</td>
                    </tr>
                    <tr>
                      <th className='col-lg-6'>Expedited Shipping</th>
                      <td className='col-lg-6'>
                        {this.state.results.Item.ReturnPolicy.ShippingCostPaidBy === 'Seller' ? 
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="green" className="bi bi-check" viewBox="0 0 16 16">
                          <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                        </svg> : 
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="red" className="bi bi-x" viewBox="0 0 16 16">
                          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>}
                      </td>
                    </tr>
                    <tr>
                      <th className='col-lg-6'>One Day Shipping</th>
                      <td className='col-lg-6'>
                        {parseInt(this.state.results.Item.HandlingTime) === 1 ? 
                        <svg xmlns="http://w3.org/2000/svg" width="25" height="25" fill="green" className="bi bi-check" viewBox="0 0 16 16">
                          <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                        </svg> : 
                        <svg xmlns="http://w3.org/2000/svg" width="25" height="25" fill="red" className="bi bi-x" viewBox="0 0 16 16">
                          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>}
                      </td>
                    </tr>
                    <tr>
                      <th className='col-lg-6'>Return Accepted</th>
                      <td className='col-lg-6'>
                        {this.state.results.Item.ReturnPolicy.ReturnsAccepted === 'Returns Accepted' ? 
                        <svg xmlns="http://w3.org/2000/svg" width="25" height="25" fill="green" className="bi bi-check" viewBox="0 0 16 16">
                          <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                        </svg> : 
                        <svg xmlns="http://w3.org/2000/svg" width="25" height="25" fill="red" className="bi bi-x" viewBox="0 0 16 16">
                          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            )
               
               
               : this.state.productdisplaystate === 'seller' ? 
               
               
               <div className='row'>
                <div className='col-lg-12 d-flex justify-content-center table-responsive mt--4'>
                  <table className='table table-dark table-striped table-hover table-borderless custom'>
                    <thead>
                      <tr>
                        <th className='text-uppercase text-center fs-3' colSpan={2}>{this.state.results.Item.Seller.UserID}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th className='col-lg-6'>Feedback Score</th>
                        <td className='col-lg-6'>{this.state.results.Item.Seller.FeedbackScore}</td>
                      </tr>
                      <tr>
                        <th className='col-lg-6'>Popularity</th>
                        <td className='col-lg-6'><div style={{width: '40px', height: '40px'}}><CircularProgressbar
                              value={this.state.results.Item.Seller.PositiveFeedbackPercent}
                              text={`${this.state.results.Item.Seller.PositiveFeedbackPercent}%`}
                              styles={buildStyles({
                                textColor: "white",
                                pathColor: "green",
                                height: 10,
                                width: 10
                              })}/></div></td>
                      </tr>
                      {this.state.results.Item.Seller.FeedbackRatingStar.includes('None') ? (<tr><th className='col-lg-6'>Feedback Rating Star</th><td className='col-lg-6'>N/A</td></tr>) : <tr>
                        <th className='col-lg-6'>Feedback Rating Star</th><td className='col-lg-6'>
                          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill={this.state.results.Item.Seller.FeedbackRatingStar.replace("Shooting","")} className="bi bi-star-fill" viewBox="0 0 16 16">
                          <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                          </svg>
                          </td>
                      </tr>}
                      <tr>
                        <th className='col-lg-6'>Top Rated</th><td className='col-lg-6'>{this.state.results.Item.Seller.TopRatedSeller === true ? <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="green" className="bi bi-check" viewBox="0 0 16 16">
                          <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                          </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="red" className="bi bi-x" viewBox="0 0 16 16">
                          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                          </svg>}</td>
                      </tr>
                      { 'Storefront' in this.state.results.Item ? 'StoreName' in this.state.results.Item.Storefront ? <tr>
                        <th className='col-lg-6'>Store Name</th><td className='col-lg-6'>{this.state.results.Item.Storefront.StoreName}</td>
                      </tr> : '' : ''}
                      {'Storefront' in this.state.results.Item ? 'StoreURL' in this.state.results.Item.Storefront ? <tr>
                        <th className='col-lg-6'>Buy Product At</th><td className='col-lg-6'><a href={this.state.results.Item.Storefront.StoreURL} target='_blank' rel="noreferrer" style={{textDecoration: 'none', color: 'rgba(101,151,149,255)'}}>Store</a></td>
                      </tr> : '' : ''}
                    </tbody>
                  </table>
                </div>
              </div>
              
              
              : this.state.productdisplaystate === 'similar' ? 
              <div className='row'>
                <div className="filters">
                  <label htmlFor="category-filter"></label>
                  <select id="category-filter" className='col-11 col-lg-2 p-2 m-2' style={{backgroundColor: 'lightgray', borderRadius: '5px'}} value={this.state.sortField}  onChange={this.handleSortFieldChange}>
                    <option value="default">Default</option>
                    <option value="productname">Product Name</option>
                    <option value="daysleft">Days Left</option>
                    <option value="price">Price</option>
                    <option value="shippingcost">Shipping Cost</option>
                  </select>
                  <label htmlFor="order-filter"></label>
                  <select id="order-filter" className='col-11 col-lg-2 p-2 m-2' style={{backgroundColor: 'lightgray', borderRadius: '5px'}} value={this.state.sortDirection} onChange={this.handleSortDirectionChange}>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                  </select>
                </div>
                <div className='d-flex justify-content-center'>
                  {this.state.similarresults === null ? 
                  (<div className='text-center'>
                    <div className="alert alert-warning p-2" role="alert">
                        No Records
                    </div>
                </div>)
                   : ( 
                    <div className='col-lg-12'>
  <div className='text-left'>
    {items.slice(0, itemsToShow).map((item, index) => (
      <div key={index} className='d-flex flex-md-row flex-column' style={{ backgroundColor: 'rgba(32, 35, 40, 255)', marginBottom: '5px', padding: '3px' }}>
        <div className='d-md-flex' style={{ width: '130px', height: '130px', textAlign: 'center', alignItems: 'center' }}>
          <a href={item.imageURL} target='_blank' rel='noreferrer'>
            <img className='p-2' src={item.imageURL} alt={item.title} style={{ maxWidth: '130px', maxHeight: '130px', height: '130px', width: '130px' }} />
          </a>
        </div>
        <div className='d-md-flex flex-column'>
          <table className='table-sm'>
            <tbody>
              <tr>
                <td>
                  {'viewItemURL' in item ? (
                    <a href={item.viewItemURL} target='_blank' rel="noreferrer" style={{ textDecoration: 'none', color: 'rgba(110, 143, 146, 255)' }}>
                      {item.title}
                    </a>
                  ) : `${item.title}`}
                </td>
              </tr>
              <tr>
                <td style={{ color: 'rgba(153, 180, 145, 255)' }}>Price: ${item.buyItNowPrice.__value__}</td>
              </tr>
              <tr>
                <td style={{ color: 'rgba(201, 169, 127, 255)' }}>Shipping Cost: ${item.shippingCost.__value__}</td>
              </tr>
              <tr>
                <td style={{ color: 'white' }}>Days Left: {item.timeLeft.substring(item.timeLeft.indexOf("P") + 1, item.timeLeft.indexOf("D"))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ))}
  </div>
</div>

                   )
                  }  
                </div>
                <div className='btn text-center mt-3' style={{border: 'none'}}>
                          <button 
                          className="btn p-2" 
                          type="button" 
                          onClick={this.toggleShowMore} 
                          disabled={this.state.similarresults === null}
                          style={{backgroundColor: 'rgba(32,35,40,255)', color: 'white', borderRadius: '4px', border:'none'}}>
                              {showMore ? 'Show More' : 'Show Less'}
                          </button>
                        </div>
                </div>
                 : ''}
          </div>
        </div>
    );
  }
}

export default ProductTable;
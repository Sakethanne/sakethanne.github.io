import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import axios from 'axios';
import './App.css'; // Import your custom CSS file
import facebook from './facebook.png'; // Import the image
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Modal, Carousel, Button } from 'react-bootstrap';

class ProductTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false, // Whether the modal is open
      productid: this.props.data.itemId[0],
      isMounted: false,
      results: null,
      imageurls: [],
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
  toggleModal = () => {
    this.setState({ showModal: !this.state.showModal });
  };

  handleSortFieldChange = (event) => {
    const sortField = event.target.value;
    this.setState({ sortField });
  };

  handleSortDirectionChange = (event) => {
    const sortDirection = event.target.value;
    this.setState({ sortDirection });
  };

  getWishlist = async () => {
    var products = [];
    await axios.get(`https://ebaynodejs.wl.r.appspot.com/getfavs`)
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
        const input = this.props.data.itemId[0];
        axios.get(`https://ebaynodejs.wl.r.appspot.com/getsingleitem?productid=${input}`)
            .then((response) => {
            this.setState({results: response.data});
            this.getWishlist();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
        console.log('getting the similar products');
        axios.get(`https://ebaynodejs.wl.r.appspot.com/getsimilaritems?productid=${input}`)
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
    await axios.get(`https://ebaynodejs.wl.r.appspot.com/getphotos?productname=${this.state.results.Item.Title}`)
            .then((response) => {
              console.log(response.data.items);
              if('items' in response.data){
                this.setState({imageurls: response.data.items});
              }
              else{
                this.setState({imageurls: null});
              }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
  };

  productwishlist = async (event, id) => {
    var product_id = id;
    if(this.state.wishlistproducts.includes(product_id)){
        await axios.get(`https://ebaynodejs.wl.r.appspot.com/deletefav?productid=${product_id}`)
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
        var product_name = this.state.results.Item.Title.replace('#', '');
        var product_price = this.state.results.Item.CurrentPrice.Value;
        if('ShippingPrice' in this.state.results.Item){
          var product_shipping = this.state.results.Item.ShippingPrice.Value;
        }
        else{
          var product_shipping = this.props.data.shippingInfo[0].shippingServiceCost[0].__value__;
        }
        var product_img = this.state.results.Item.PictureURL[0];
        await axios.get(`https://ebaynodejs.wl.r.appspot.com/addfav?productid=${product_id}&product_name=${product_name}&product_price=${product_price}&product_shipping=${product_shipping}&product_img_url=${product_img}`)
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
        return sortDirection === 'ascending' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
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

    // const { showOverlay, selectedImages, currentIndex } = this.state;
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
                <a href={`https://www.facebook.com/share.php?u=${this.state.results.Item.ViewItemURLForNaturalSearch}`} target='_blank' rel='noreferrer'><button className="btn" style={{padding: 'none', border: 'none'}}>
                  {/* <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="rgba(13,110,253,255)" className="bi bi-facebook" viewBox="0 0 16 16">
                  <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                </svg> */}
                <img src={facebook} style={{width: '40px', height: '40px'}} />
                </button></a>
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
              
              <div className='row' style={{marginTop: '-10px'}}>
                <div className='d-flex justity-content-center table-responsive'>
                  <table className='table table-dark table-striped table-hover table-borderless custom'>
                    <tbody>
                      <tr>
                        <th className='col-lg-6'>Product Images</th>
                        <td className='col-lg-6'>
                          <Button onClick={this.toggleModal}
                          style={{textDecoration: 'none', color: 'rgba(101,151,149,255)', cursor: 'pointer', backgroundColor: 'rgba(45,48,53,255)', border: 'none'}}
                          >View Product Images Here</Button>
                          <Modal
                              show={this.state.showModal}
                              onHide={this.toggleModal}
                              centered // Center the modal horizontally and vertically
                              >
                              <Modal.Header closeButton>
                              <Modal.Title>Product Images</Modal.Title>
                              </Modal.Header>
                              <Modal.Body>
                              <Carousel>
                              {this.state.results.Item.PictureURL.map((image, index) => (
                              <Carousel.Item key={index}>
                                  <img
                                    className="d-block w-100"
                                    src={image}
                                    alt={`Image ${index}`}
                                    style={{width: '200px', height: '400px', border: '7px solid black'}}
                                  />
                              </Carousel.Item>
                              ))}
                              </Carousel>
                              </Modal.Body>
                              <Modal.Footer>
                              <Button variant="secondary" onClick={this.toggleModal}>
                                Close
                              </Button>
                              </Modal.Footer>
                          </Modal>
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
                        <td className='col-lg-6'>{this.state.results.Item.ReturnPolicy.ReturnsAccepted}{this.state.results.Item.ReturnPolicy.ReturnsAccepted === 'Returns Accepted' ? ` with in ${this.state.results.Item.ReturnPolicy.ReturnsWithin}` : ''}</td>
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

              this.state.imageurls !== null ?
              
              (<div className='row' style={{marginTop: '-10px'}}>
              <div className='col-lg-4 p-1'>
                {this.state.imageurls.length > 0 ? <a href={this.state.imageurls[0].link} target='_blank' rel='noreferrer'><img src={this.state.imageurls[0].link} alt={this.state.results.Item.Title} className='img-fluid mb-2' style={{width: '100%', border: '7px solid #000'}}/></a> : ''}
                {this.state.imageurls.length > 1 ? <a href={this.state.imageurls[1].link} target='_blank' rel='noreferrer'><img src={this.state.imageurls[1].link} alt={this.state.results.Item.Title} className='img-fluid mb-2' style={{width: '100%', border: '7px solid #000'}}/></a> : ''}
              </div>
              <div className='col-lg-4 p-1'>
                {this.state.imageurls.length > 2 ? <a href={this.state.imageurls[2].link} target='_blank' rel='noreferrer'><img src={this.state.imageurls[2].link} alt={this.state.results.Item.Title} className='img-fluid mb-2' style={{width: '100%', border: '7px solid #000'}}/></a> : ''}
                {this.state.imageurls.length > 3 ? <a href={this.state.imageurls[3].link} target='_blank' rel='noreferrer'><img src={this.state.imageurls[3].link} alt={this.state.results.Item.Title} className='img-fluid mb-2' style={{width: '100%', border: '7px solid #000'}}/></a> : ''}
                {this.state.imageurls.length > 4 ? <a href={this.state.imageurls[4].link} target='_blank' rel='noreferrer'><img src={this.state.imageurls[4].link} alt={this.state.results.Item.Title} className='img-fluid mb-2' style={{width: '100%', border: '7px solid #000'}}/></a> : ''}
              </div>
              <div className='col-lg-4 p-1'>
                {this.state.imageurls.length > 5 ? <a href={this.state.imageurls[5].link} target='_blank' rel='noreferrer'><img src={this.state.imageurls[5].link} alt={this.state.results.Item.Title} className='img-fluid mb-2' style={{width: '100%', border: '7px solid #000'}}/></a> : ''}
                {this.state.imageurls.length > 6 ? <a href={this.state.imageurls[6].link} target='_blank' rel='noreferrer'><img src={this.state.imageurls[6].link} alt={this.state.results.Item.Title} className='img-fluid mb-2' style={{width: '100%', border: '7px solid #000'}}/></a> : ''}
                {this.state.imageurls.length > 7 ? <a href={this.state.imageurls[7].link} target='_blank' rel='noreferrer'><img src={this.state.imageurls[7].link} alt={this.state.results.Item.Title} className='img-fluid mb-2' style={{width: '100%', border: '7px solid #000'}}/></a> : ''}
              </div>
          </div>) : (<div className='text-center'>
                    <div className="alert alert-warning p-2" role="alert">
                        No Images Found on Google Search API or the API exceeded 100 daily limit
                    </div>
                </div>) 
              
              : this.state.productdisplaystate === 'shipping' ? 
              
              (<div className='row' style={{marginTop: '-10px'}}>
              <div className='d-flex justify-content-center table-responsive'>
                <table className='table table-dark table-striped table-hover table-borderless custom'>
                  <tbody>
                    {'shippingInfo' in this.props.data ? 'shippingServiceCost' in this.props.data.shippingInfo[0] ? this.props.data.shippingInfo[0].shippingServiceCost[0].__value__ === "0.0" ? <tr><th className='col-lg-6'>Shipping Cost</th>
                      <td className='col-lg-6'>
                        Free Shipping
                      </td></tr> : <tr><th className='col-lg-6'>Shipping Cost</th>
                      <td className='col-lg-6'>
                        ${this.props.data.shippingInfo[0].shippingServiceCost[0].__value__}
                      </td></tr> : '' : ''}

                      {'shippingInfo' in this.props.data ? 'shipToLocations' in this.props.data.shippingInfo[0] ? <tr><th className='col-lg-6'>Shipping Locations</th>
                      <td className='col-lg-6'>
                        {this.props.data.shippingInfo[0].shipToLocations[0]}
                      </td></tr> :  '' : ''}

                      {'shippingInfo' in this.props.data ? 'handlingTime' in this.props.data.shippingInfo[0] ? <tr><th className='col-lg-6'>Handling time</th>
                      <td className='col-lg-6'>
                      {this.props.data.shippingInfo[0].handlingTime[0]}{parseInt(this.props.data.shippingInfo[0].handlingTime[0]) === 1 ? ' Day' : ' Days'}
                      </td></tr> :  '' : ''}

                      {'shippingInfo' in this.props.data ? 'expeditedShipping' in this.props.data.shippingInfo[0] ? <tr><th className='col-lg-6'>Expedited Shipping</th>
                      <td className='col-lg-6'>
                      {this.props.data.shippingInfo[0].expeditedShipping[0] === "true" ? (<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="green" className="bi bi-check" viewBox="0 0 16 16">
                          <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                        </svg>) : (<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="red" className="bi bi-x" viewBox="0 0 16 16">
                          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>)}
                      </td></tr> :  '' : ''}

                      {'shippingInfo' in this.props.data ? 'oneDayShippingAvailable' in this.props.data.shippingInfo[0] ? <tr><th className='col-lg-6'>One Day Shipping</th>
                      <td className='col-lg-6'>
                      {this.props.data.shippingInfo[0].oneDayShippingAvailable[0] === "true" ? (<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="green" className="bi bi-check" viewBox="0 0 16 16">
                          <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                        </svg>) : (<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="red" className="bi bi-x" viewBox="0 0 16 16">
                          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>)}
                      </td></tr> :  '' : ''}

                      {'returnsAccepted' in this.props.data ? <tr><th className='col-lg-6'>Return Accepted</th>
                      <td className='col-lg-6'>
                      {this.props.data.returnsAccepted[0] === "true" ? (<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="green" className="bi bi-check" viewBox="0 0 16 16">
                          <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                        </svg>) : (<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="red" className="bi bi-x" viewBox="0 0 16 16">
                          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>)}
                      </td></tr> :  '' }
                  </tbody>
                </table>
              </div>
            </div>
            )
               
               
               : this.state.productdisplaystate === 'seller' ? 
               
               
               <div className='row' style={{marginTop: '-10px'}}>
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
                        <th className='col-lg-6'>Feedback Rating Star</th><td className='col-lg-6'> {this.state.results.Item.Seller.FeedbackScore > 10000 ? <span className="material-symbols-outlined" style={{color: `${this.state.results.Item.Seller.FeedbackRatingStar.replace("Shooting","")}`}}>stars</span> : <span className="material-symbols-outlined" style={{color: `${this.state.results.Item.Seller.FeedbackRatingStar.replace("Shooting","")}`}}>star</span>}
                          </td>
                      </tr>}
                      
                        {'TopRatedSeller' in this.state.results.Item.Seller ? <tr><th className='col-lg-6'>Top Rated Seller</th><td className='col-lg-6'>{this.state.results.Item.Seller.TopRatedSeller === true ? <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="green" className="bi bi-check" viewBox="0 0 16 16">
                          <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                          </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="red" className="bi bi-x" viewBox="0 0 16 16">
                          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                          </svg>}</td>
                      </tr> : ''}
                        
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
              <div className='row' style={{marginTop: '-10px'}}>
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
                  <select id="order-filter" className='col-11 col-lg-2 p-2 m-2' style={{backgroundColor: 'lightgray', borderRadius: '5px'}} value={this.state.sortDirection} onChange={this.handleSortDirectionChange} disabled={this.state.sortField === 'default'}>
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
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import axios from 'axios';

const pageSize = 10;
class ResultsTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
          inputdata: this.props.data,
          isMounted: false,
          results: null,
          currentPage: 1,
          renderDelayed: false,
          wishlistproductids: []
        };
      }

    getWishlist = async () => {
        var products = [];
        await axios.get(`../../getfavs`)
          .then(async (response) => {
            for(const product of response.data.Wishlist_Products) {
                var newprod = JSON.parse(product);
                products.push(newprod.productid);
            }
            this.setState({wishlistproductids:products})
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
            const queryParams = new URLSearchParams(input).toString();
            console.log(queryParams)
            axios.get(`../../senddata?${queryParams}`)
                .then((response) => {
                console.log(response.data);
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
          }, 1500);
      };

      handlePageChange = (page) => {
        this.setState({ currentPage: page });
      };

      addtowishlist = async (event, id) => {
        var product_id = this.state.results.findItemsAdvancedResponse[0].searchResult[0].item[id].itemId[0];
        if(this.state.wishlistproductids.includes(product_id)){
            await axios.get(`../../deletefav?productid=${product_id}`)
                .then((response) => {
                    console.log(response.data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            this.setState((prevState) => ({
                wishlistproductids: prevState.wishlistproductids.filter((item) => item !== product_id), // Create a new array excluding the value to be removed
                  }));
        }
        else{
            var product_name = this.state.results.findItemsAdvancedResponse[0].searchResult[0].item[id].title[0];
            var product_price = this.state.results.findItemsAdvancedResponse[0].searchResult[0].item[id].sellingStatus[0].currentPrice[0].__value__;
            var product_shipping = this.state.results.findItemsAdvancedResponse[0].searchResult[0].item[id].shippingInfo[0].shippingServiceCost[0].__value__;
            var product_img = this.state.results.findItemsAdvancedResponse[0].searchResult[0].item[id].galleryURL[0];
            await axios.get(`../../addfav?productid=${product_id}&product_name=${product_name}&product_price=${product_price}&product_shipping=${product_shipping}&product_img_url=${product_img}`)
                .then((response) => {
                    console.log(response.data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            this.setState((prevState) => ({
                wishlistproductids: [...prevState.wishlistproductids, product_id], // Create a new array with the existing values and the new value
                  }));
        }
      };

      sendDataToResults = (event, index) => {
        const { sendDataToResults } = this.props;
        sendDataToResults(this.state.results.findItemsAdvancedResponse[0].searchResult[0].item[index].itemId[0]); // Call the callback function with the data
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
    
    if(parseInt(this.state.results.findItemsAdvancedResponse[0].searchResult[0]['@count']) === 0){
        // console.log(typeof parseInt(this.state.results.findItemsAdvancedResponse[0].searchResult[0]['@count']));
        return (
            <div className='row justify-content-center mt-4'>
                <div className='col-lg-9'>
                    <div className='text-center'>
                        <div className="alert alert-warning p-2" role="alert">
                            No Records
                        </div>
                    </div>
                </div>
            </div>)
    };
    const { currentPage } = this.state;
    // Calculate the start and end indices for the current page
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(currentPage * pageSize, this.state.results.findItemsAdvancedResponse[0].searchResult[0].item.length);
    // Slice the products array to display only the current page's data
    const currentProducts = this.state.results.findItemsAdvancedResponse[0].searchResult[0].item.slice(startIndex, endIndex);

    return (
        <div className='row justify-content-center mt-3'>
            <div className='col-lg-9'>
            <div className="d-grid gap-2 justify-content-end mb-3">
                <button className="btn btn-light" 
                style={{color: 'black'}} 
                disabled={true}
                 type="button">Details &gt;
                 </button>
            </div>
                <div className='text-left'>
                <table className="table table-dark table-striped table-hover table-borderless small">
                    <thead className='p-1 align-items-left text-left'>
                        <tr className='p-1 align-items-left'>
                            <th>#</th>
                            <th>Image</th>
                            <th>Title</th>
                            <th>Price</th>
                            <th>Shipping</th>
                            <th>Zip</th>
                            <th>Wishlist</th>
                        </tr>
                    </thead>
                    <tbody className='p-1'>
                            {currentProducts.map((product, index) => (
                        <tr key={index} style={{height:'70px'}} className='p-2'>
                            <td>{startIndex + index + 1}</td>
                            <td>
                                <a href={product.galleryURL[0]} target='_blank' rel="noreferrer"><img src={product.galleryURL[0]} alt={product.title[0]} style={{width: '70px', height: '70px', maxWidth:'70px', maxHeight:'70px'}}/></a>
                            </td>
                            {/* eslint-disable-next-line */}
                            <td><a href='#' className='text-decoration-none' title={product.title[0]} onClick={(e) => this.sendDataToResults(e, `${startIndex + index}`)}><span className='d-inline-block text-truncate' style={{maxWidth: '250px'}}>
                                    {product.title[0]}
                                </span></a></td>
                            <td>${product.sellingStatus[0].currentPrice[0].__value__}</td>
                            
                            <td>{product.shippingInfo[0].shippingServiceCost[0].__value__ === '0.0' ? 'Free Shipping' : `$${product.shippingInfo[0].shippingServiceCost[0].__value__}`}
                                </td>
                            <td>{product.postalCode[0]}</td>
                            <td>
                                {this.state.wishlistproductids.includes(product.itemId[0]) ? (<button
                             style={{border: 'none', borderRadius:'4px'}}
                             type='button' 
                             id={startIndex + index}
                            //  onClick={this.addtowishlist}
                            onClick={(e) => this.addtowishlist(e, `${startIndex + index}`)}
                             ><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="orange" className="bi bi-cart-plus-fill" viewBox="0 0 16 16">
                                <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM9 5.5V7h1.5a.5.5 0 0 1 0 1H9v1.5a.5.5 0 0 1-1 0V8H6.5a.5.5 0 0 1 0-1H8V5.5a.5.5 0 0 1 1 0z"/>
                            </svg></button>)
                            :
                            (<button
                                style={{border: 'none', borderRadius:'4px'}}
                                type='button' 
                                id={startIndex + index}
                               //  onClick={this.addtowishlist}
                               onClick={(e) => this.addtowishlist(e, `${startIndex + index}`)}
                                ><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cart-plus-fill" viewBox="0 0 16 16">
                                   <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM9 5.5V7h1.5a.5.5 0 0 1 0 1H9v1.5a.5.5 0 0 1-1 0V8H6.5a.5.5 0 0 1 0-1H8V5.5a.5.5 0 0 1 1 0z"/>
                               </svg></button>)
                        }  
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>

                <div className="pagination justify-content-center">
                    <ul className="pagination justify-content-center pagination-sm">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => this.handlePageChange(currentPage - 1)}>
                            &laquo; Previous
                            </button>
                        </li>
                        {[...Array(Math.ceil(this.state.results.findItemsAdvancedResponse[0].searchResult[0].item.length / pageSize))].map((_, i) => (
                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => this.handlePageChange(i + 1)}>
                                {i + 1}
                            </button>
                        </li>
                        ))}
                        <li className={`page-item ${currentPage === Math.ceil(this.state.results.findItemsAdvancedResponse[0].searchResult[0].item.length / pageSize) ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => this.handlePageChange(currentPage + 1)}>
                                Next &raquo;
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div> 
    </div>
    );
  }
}

export default ResultsTable;
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
          wishlistproductids: [],
        };
      }

    getWishlist = async () => {
        var products = [];
        await axios.get(`https://ebaynodejs.wl.r.appspot.com/getfavs`)
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
        if(this.state.inputdata.backtores === true){
            this.setState({ renderDelayed: true });
        }
        else{
            this.setState({ renderDelayed: false });
        }
        // if(!this.state.isMounted) {
            // eslint-disable-next-line
            // this.state.isMounted = true;
            const input = this.props.data;
            const queryParams = new URLSearchParams(input).toString();
            console.log(queryParams)
            axios.get(`https://ebaynodejs.wl.r.appspot.com/senddata?${queryParams}`)
                .then((response) => {
                console.log(response.data);
                this.setState({results: response.data});
                this.getWishlist();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        // }
          setTimeout(() => {
            // console.log('After 1 seconds of sleep');
            this.setState({ renderDelayed: true });
          }, 2200);
      };

      handlePageChange = (page) => {
        this.setState({ currentPage: page });
      };

      addtowishlist = async (event, id) => {
        var product_id = this.state.results.findItemsAdvancedResponse[0].searchResult[0].item[id].itemId[0];
        if(this.state.wishlistproductids.includes(product_id)){
            await axios.get(`https://ebaynodejs.wl.r.appspot.com/deletefav?productid=${product_id}`)
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
            var product_name = this.state.results.findItemsAdvancedResponse[0].searchResult[0].item[id].title[0].replace('#', '');
            var product_price = this.state.results.findItemsAdvancedResponse[0].searchResult[0].item[id].sellingStatus[0].currentPrice[0].__value__;
            var product_shipping = this.state.results.findItemsAdvancedResponse[0].searchResult[0].item[id].shippingInfo[0].shippingServiceCost[0].__value__;
            var product_img = this.state.results.findItemsAdvancedResponse[0].searchResult[0].item[id].galleryURL[0];
            await axios.get(`https://ebaynodejs.wl.r.appspot.com/addfav?productid=${product_id}&product_name=${product_name}&product_price=${product_price}&product_shipping=${product_shipping}&product_img_url=${product_img}`)
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
        this.setState({indexstored: index});
        sendDataToResults(this.state.results.findItemsAdvancedResponse[0].searchResult[0].item[index].itemId[0], index); // Call the callback function with the data
      };

      sendDataToResultsviaDetails = (event, index) => {
        const { sendDataToResults } = this.props;
        sendDataToResults(index); // Call the callback function with the data
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
    
    if((this.state.results === null) || (parseInt(this.state.results.findItemsAdvancedResponse[0].searchResult[0]['@count']) === 0)){
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
                onClick={(e) => this.sendDataToResultsviaDetails(e, `${this.props.data.producttopass}`)} 
                disabled={this.props.data.producttopass === ''}
                 type="button">Details &gt;
                 </button>
            </div>
                <div className='text-left'>
                <div className='overflow-auto'>
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
                        <tr key={index} style={{height:'70px'}} className={`p-2 ${parseInt(this.state.inputdata.prodindex) === (startIndex + index) ? 'table-primary' : ''}`}>
                            <td>{startIndex + index + 1}</td>
                            <td>
                                <a href={product.galleryURL[0]} target='_blank' rel="noreferrer"><img src={product.galleryURL[0]} alt={product.title[0]} style={{width: '90px', height: '100px', maxWidth:'90px', maxHeight:'100px'}}/></a>
                            </td>
                            {/* eslint-disable-next-line */}
                            <td><a href='#' className='text-decoration-none' title={product.title[0]} onClick={(e) => this.sendDataToResults(e, `${startIndex + index}`)}><span className='d-inline-block text-truncate' style={{maxWidth: '290px'}}>
                                    {product.title[0]}
                                </span></a></td>
                            <td>${product.sellingStatus[0].currentPrice[0].__value__}</td>
                            
                            <td>{product.shippingInfo[0].shippingServiceCost[0].__value__ === '0.0' ? 'Free Shipping' : `$${product.shippingInfo[0].shippingServiceCost[0].__value__}`}
                                </td>
                            <td>{product.postalCode[0]}</td>
                            <td>
                                {this.state.wishlistproductids.includes(product.itemId[0]) ? (<button
                             style={{border: 'none', borderRadius:'4px', width:'40px', height: '35px'}}
                             type='button' 
                             id={startIndex + index}
                            //  onClick={this.addtowishlist}
                            onClick={(e) => this.addtowishlist(e, `${startIndex + index}`)}>
                            <span className="material-symbols-outlined" style={{color: 'rgba(177,135,47,255)'}}>remove_shopping_cart</span>
                            </button>)
                            :
                            (<button
                                style={{border: 'none', borderRadius:'4px', width:'40px', height: '35px'}}
                                type='button' 
                                id={startIndex + index}
                               //  onClick={this.addtowishlist}
                               onClick={(e) => this.addtowishlist(e, `${startIndex + index}`)}>
                                    <span className="material-symbols-outlined">add_shopping_cart</span>
                               </button>)
                        }  
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
                <style>
                     {`
                        .highlighted-row {
                        background-color: yellow !important; /* Customize the background color as needed */
                    }
                    `}
                </style>
                </div>

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
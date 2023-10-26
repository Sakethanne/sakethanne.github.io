import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import axios from 'axios';

const pageSize = 10;
class ResultsTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
          isMounted: false,
          results: null,
          progress: 0,
          progressCompleted: false,
          currentPage: 1,
          renderDelayed: false
        };
      }
    
    componentDidMount(){
        if(!this.state.isMounted) {
            // eslint-disable-next-line
            this.state.isMounted = true;
            const input = JSON.parse(this.props.data);
            const queryParams = new URLSearchParams(input).toString();
            console.log(queryParams)
            axios.get(`../../senddata?${queryParams}`)
                .then((response) => {
                console.log(response.data);
                this.setState({results: response.data});
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
          setTimeout(() => {
            // console.log('After 1 seconds of sleep');
            this.setState({ renderDelayed: true });
            this.setState({ progressCompleted: true});
          }, 2000);
      };

      handlePageChange = (page) => {
        this.setState({ currentPage: page });
      };

  render() {

    if (!this.state.renderDelayed) {
        return null; // Render nothing until the delay is over
      };

    if(parseInt(this.state.results.findItemsAdvancedResponse[0].searchResult[0]['@count']) === 0){
        // console.log(typeof parseInt(this.state.results.findItemsAdvancedResponse[0].searchResult[0]['@count']));
        return (
            <div className='row justify-content-center mt-4 col-lg-9'>
                <div className="alert alert-warning text-center p-2 col-lg-9" role="alert">
                    No Records
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
            <div className='block'>
                {this.state.progressCompleted ? null : (
                    <div className="text-center progress mt-4 col-lg-9" role="progressbar" aria-label="Default striped example" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100">
                        <div className="text-center progress-bar progress-bar-striped" style={{width: "50%"}}></div>
                    </div>
                )}
            </div>

            {/* Starting of the table generation code */}
            <div className='col-lg-9'>
                <div className='text-right mb-2'>
                    <button type="button" className="btn btn-light">Details</button>
                </div>
                <div className='text-left'>
                <table className="table table-dark table-striped table-hover small">
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
                                <button><img src={product.galleryURL[0]} alt={product.title[0]} style={{width:'50px', height:'50pxx'}}/></button>
                            </td>
                            {/* eslint-disable-next-line */}
                            <td><a href='#' className='text-decoration-none' title={product.title[0]}><span className='d-inline-block text-truncate' style={{maxWidth: '250px'}}>
                                    {product.title[0]}
                                </span></a></td>
                            <td>${product.sellingStatus[0].currentPrice[0].__value__}</td>
                            
                            <td>{product.shippingInfo[0].shippingServiceCost[0].__value__ === '0.0' ? 'Free Shipping' : `$${product.shippingInfo[0].shippingServiceCost[0].__value__}`}
                                </td>
                            <td>{product.postalCode[0]}</td>
                            <td>
                                <button
                             style={{border: 'none', borderRadius:'4px'}}
                             type='button'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cart-plus-fill" viewBox="0 0 16 16">
                                <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM9 5.5V7h1.5a.5.5 0 0 1 0 1H9v1.5a.5.5 0 0 1-1 0V8H6.5a.5.5 0 0 1 0-1H8V5.5a.5.5 0 0 1 1 0z"/>
                            </svg></button>
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
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

    handlePageChange = (page) => {
        this.setState({ currentPage: page });
    };
    
    componentDidMount(){
        if(!this.state.isMounted) {
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
            console.log('After 1 seconds of sleep');
            this.setState({ renderDelayed: true });
            this.setState({progressCompleted: true});
          }, 2000);
      };

    getDataFromEbay = () => {

    }


  render() {

    if (!this.state.renderDelayed && !this.state.progressCompleted) {
        return null; // Render nothing until the delay is over
      }

    const { currentPage } = this.state;
    // Calculate the start and end indices for the current page
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(currentPage * pageSize, this.state.results.findItemsAdvancedResponse[0].searchResult[0].item.length);
    // Slice the products array to display only the current page's data
    const currentProducts = this.state.results.findItemsAdvancedResponse[0].searchResult[0].item.slice(startIndex, endIndex);

    return (
        <div className='row justify-content-center'>
            {this.state.progressCompleted ? null : (
                <div className="text-center progress mt-4 col-lg-9" role="progressbar" aria-label="Default striped example" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100">
                    <div className="text-center progress-bar progress-bar-striped" style={{width: "50%"}}></div>
                </div>
            )}
<div>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Image</th>
                            <th>Title</th>
                            <th>Price</th>
                            <th>Shipping</th>
                            <th>Zip</th>
                            <th>Wish list</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentProducts.map((product, index) => (
              <tr key={index}>
                <td>{startIndex + index + 1}</td>
                <td>
                  <img src={product.galleryURL[0]} alt={product.title[0]} width="50" height="50" />
                </td>
                <td>{product.title[0]}</td>
                <td>${product.sellingStatus[0].currentPrice[0].__value__}</td>
                <td>{product.shippingInfo[0].shippingServiceCost[0].__value__}</td>
                <td>{product.postalCode[0]}</td>
                <td>
                  {/* Add wish list functionality here */}
                  <button>Add to Wishlist</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination buttons */}
        <div className="pagination">
          <button onClick={() => this.handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </button>
          {[...Array(Math.ceil(this.state.results.findItemsAdvancedResponse[0].searchResult[0].item.length / pageSize))].map((_, i) => (
            <button
              key={i}
              onClick={() => this.handlePageChange(i + 1)}
              className={currentPage === i + 1 ? 'active' : ''}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => this.handlePageChange(currentPage + 1)}
            disabled={currentPage === Math.ceil(this.state.results.findItemsAdvancedResponse[0].searchResult[0].item.length / pageSize)}
          >
            Next
          </button>
        </div>
      </div>
            
      </div>
    );
  }
}

export default ResultsTable;
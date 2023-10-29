import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import axios from 'axios';


class WishlistTable extends Component {
  getWishlist = async () => {
    var products = [];
    await axios.get(`../../getfavs`)
      .then(async (response) => {
        console.log('wishlists');
        for(const product of response.data.Wishlist_Products) {
          products.push(product);
        }
        // console.log(products);
        return products;
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  render() {
    return (
      <div className='container col-lg-9 mt-4 align-items-center'>
        <div className='row justify-content-center'>
          <div className='text-center'>
            <table className="table table-dark table-striped table-hover small">
              <thead className='p-1 align-items-left text-left'>
                <tr className='p-1 align-items-left'>
                  <th>#</th>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Shipping</th>
                  <th>Wishlist</th>
                </tr>
              </thead>
              <tbody className='p-1'>
                {this.state.wishlistproducts.map((product, index) => (
                  
                <tr key={index} style={{height:'70px'}} className='p-2'>
                  <td>{index + 1}</td>
                    <td>
                      <img src={product.productimage} alt={product.productname} style={{width: '50px', height: '50px', maxWidth:'50px', maxHeight:'50px'}}/>
                    </td>
                    {/* eslint-disable-next-line */}
                    <td><a href='#' className='text-decoration-none' title={product.productname}><span className='d-inline-block text-truncate' style={{maxWidth: '250px'}}>
                      {product.productname}
                    </span></a></td>
                    <td>${product.productprice}</td>        
                    <td>{product.productshipping === '0.0' ? 'Free Shipping' : `$${product.productshipping}`}
                    </td>
                    <td>
                      <button
                        style={{border: 'none', borderRadius:'4px'}}
                        type='button'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cart-plus-fill" viewBox="0 0 16 16">
                            <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM9 5.5V7h1.5a.5.5 0 0 1 0 1H9v1.5a.5.5 0 0 1-1 0V8H6.5a.5.5 0 0 1 0-1H8V5.5a.5.5 0 0 1 1 0z"/>
                      </svg></button>
                    </td>
                </tr>))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default WishlistTable;
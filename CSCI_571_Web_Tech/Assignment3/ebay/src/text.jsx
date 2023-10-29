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
      
    );
  }
}

export default WishlistTable;
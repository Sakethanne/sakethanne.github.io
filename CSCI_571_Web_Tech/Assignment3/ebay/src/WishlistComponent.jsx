import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import axios from 'axios';


class WishlistTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMounted: false,
      renderDelayed: false,
      wishlist: [],
      total: 0.0
    };
  }

  getWishlist = async () => {
    var products = [];
    var total = 0.0;
    await axios.get(`../../getfavs`)
      .then(async (response) => {
        for(const product of response.data.Wishlist_Products) {
            var newprod = JSON.parse(product);
            products.push(newprod);
            total += parseFloat(newprod.productprice);
        }
        this.setState({wishlist: products})
        this.setState({total: total});
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  componentDidMount(){
    if(!this.state.isMounted) {
        // eslint-disable-next-line
      this.state.isMounted = true;
      this.getWishlist();
      setTimeout(() => {this.setState({ renderDelayed: true });}, 1500);
    }
  };

  togglewishlist = async (event, index) => {
    var product_id = this.state.wishlist[index].productid;
    var alreadyexistsflag = false;
    for(var i=0; i<this.state.wishlist.length; i++){
      if(this.state.wishlist[i].productid == product_id){
        alreadyexistsflag = true;
        break;
      }
    }
    if(alreadyexistsflag === true){
      var total = this.state.total;
      total = total - parseFloat(this.state.wishlist[index].productprice);
      this.setState({total: total});
        await axios.get(`../../deletefav?productid=${product_id}`)
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        this.setState((prevState) => ({
          wishlist: prevState.wishlist.filter((item) => item !== this.state.wishlist[index]), // Create a new array excluding the value to be removed
              }));
    }
    else{
        var product_name = this.state.wishlist[index].productname;
        var product_price = this.state.wishlist[index].productprice;
        var product_shipping = this.state.wishlist[index].productshipping;
        var product_img = this.state.wishlist[index].productimage;
        await axios.get(`../../addfav?productid=${product_id}&product_name=${product_name}&product_price=${product_price}&product_shipping=${product_shipping}&product_img_url=${product_img}`)
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        this.setState((prevState) => ({
          wishlist: [...prevState.wishlist, this.state.wishlist[index]], // Create a new array with the existing values and the new value
              }));
    }
  };

  render() {
    if(!this.state.renderDelayed) {
      return (<div className='row justify-content-center mt-4'>
          <div className='col-lg-9'>
              <div className='text-center'><div className="progress" role="progressbar" aria-label="Animated striped example" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
              <div className="progress-bar progress-bar-striped progress-bar-animated" style={{width: "50%"}}></div></div></div>
          </div>
          </div>); // Render progress bar until the delay is over
    };

    var total = 0.0;

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
                {this.state.wishlist.map((product, index) => (
                  
                <tr key={index} style={{height:'70px'}} className='p-2'>
                  <td>{index + 1}</td>
                    <td>
                      <a href={product.productimage} target='_blank'><img src={product.productimage} alt={product.productname} style={{width: '50px', height: '50px', maxWidth:'50px', maxHeight:'50px'}}/></a>
                    </td>
                    {/* eslint-disable-next-line */}
                    <td><a href='#' className='text-decoration-none' title={product.productname}><span className='d-inline-block text-truncate' style={{maxWidth: '250px'}}>
                      {product.productname}
                    </span></a></td>
                    <td>${product.productprice}</td>        
                    <td>{product.productshipping === '0.0' ? 'Free Shipping' : `$${product.productshipping}`}
                    </td>
                    <td>
                      {this.state.wishlist.includes(product) ? 
                      (<button
                        id={index}
                        onClick={(e) => this.togglewishlist(e, `${index}`)}
                        style={{border: 'none', borderRadius:'4px'}}
                        type='button'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="orange" className="bi bi-cart-plus-fill" viewBox="0 0 16 16">
                            <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM9 5.5V7h1.5a.5.5 0 0 1 0 1H9v1.5a.5.5 0 0 1-1 0V8H6.5a.5.5 0 0 1 0-1H8V5.5a.5.5 0 0 1 1 0z"/>
                      </svg></button>)
                    :
                    (<button
                     onClick={(e) => this.togglewishlist(e, `${index}`)}
                     id={index}
                      style={{border: 'none', borderRadius:'4px'}}
                      type='button'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cart-plus-fill" viewBox="0 0 16 16">
                          <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM9 5.5V7h1.5a.5.5 0 0 1 0 1H9v1.5a.5.5 0 0 1-1 0V8H6.5a.5.5 0 0 1 0-1H8V5.5a.5.5 0 0 1 1 0z"/>
                    </svg></button>)}
                    </td>
                </tr>))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={4}></th>
                  <th>Total Shipping:</th>
                  <th>${this.state.total.toFixed(2)}</th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default WishlistTable;
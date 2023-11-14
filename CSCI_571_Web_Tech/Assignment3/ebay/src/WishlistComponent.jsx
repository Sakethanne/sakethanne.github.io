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
    await axios.get(`https://ebaynodejs.wl.r.appspot.com/getfavs`)
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
      if(this.state.wishlist[i].productid === product_id){
        alreadyexistsflag = true;
        break;
      }
    }
    if(alreadyexistsflag === true){
      var total = this.state.total;
      total = total - parseFloat(this.state.wishlist[index].productprice);
      this.setState({total: total});
        await axios.get(`https://ebaynodejs.wl.r.appspot.com/deletefav?productid=${product_id}`)
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
        var product_name = this.state.wishlist[index].productname.replace('#', '');
        var product_price = this.state.wishlist[index].productprice;
        var product_shipping = this.state.wishlist[index].productshipping;
        var product_img = this.state.wishlist[index].productimage;
        await axios.get(`https://ebaynodejs.wl.r.appspot.com/addfav?productid=${product_id}&product_name=${product_name}&product_price=${product_price}&product_shipping=${product_shipping}&product_img_url=${product_img}`)
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

  sendDatafromWishlist = (event, index) => {
    const { sendDatafromWishlist } = this.props;
    sendDatafromWishlist(this.props.data); // Call the callback function with the data
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

    if(this.state.wishlist.length === 0) {
      return (
        <div className='row justify-content-center mt-2'>
            <div className='col-lg-9'>
                <div className='text-left'>
                    <div className="alert alert-warning p-2" role="alert">
                        No Records
                    </div>
                </div>
            </div>
        </div>); 
    };

    return (
      <div className='container col-lg-9 mt-4 align-items-center'>
        <div className='row justify-content-center'>
        <div className="d-grid gap-2 justify-content-end mb-3">
                <button className="btn btn-light" 
                style={{color: 'black'}} 
                disabled={this.props.data === null}
                onClick={(e) => this.sendDatafromWishlist(e, `${this.props.data}`)}
                 type="button">Details &gt;
                 </button>
            </div>
          <div className='text-left overflow-auto'>
            <table className="table table-dark table-striped table-hover table-borderless small">
              <thead className='p-1 align-items-left text-left'>
                <tr className='p-1 align-items-left'>
                  <th>#</th>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Shipping Option</th>
                  <th>Wishlist</th>
                </tr>
              </thead>
              <tbody className='p-1'>
                {this.state.wishlist.map((product, index) => (
                  
                <tr key={index} style={{height:'70px'}} className='p-2'>
                  <td>{index + 1}</td>
                    <td>
                      <a href={product.productimage} target='_blank' rel="noreferrer"><img src={product.productimage} alt={product.productname.replace(/%20/g, ' ')} style={{width: '90px', height: '100px', maxWidth:'90px', maxHeight:'100px'}}/></a>
                    </td>
                    {/* eslint-disable-next-line */}
                    <td><a className='text-decoration-none' title={product.productname.replace(/%20/g, ' ')}><span className='d-inline-block text-truncate' style={{maxWidth: '290px'}}>
                      {product.productname.replace(/%20/g, ' ')}
                    </span></a></td>
                    <td>${product.productprice}</td>        
                    <td>{product.productshipping === '0.0' ? 'Free Shipping' : `$${product.productshipping}`}
                    </td>
                    <td>
                      {this.state.wishlist.includes(product) ? 
                      (<button
                        id={index}
                        onClick={(e) => this.togglewishlist(e, `${index}`)}
                        style={{border: 'none', borderRadius:'4px', width:'40px', height: '40px'}}
                        type='button'>
                          <span className="material-symbols-outlined" style={{color: 'rgba(177,135,47,255)'}}>remove_shopping_cart</span>
                      </button>)
                    :
                    (<button
                     onClick={(e) => this.togglewishlist(e, `${index}`)}
                     id={index}
                      style={{border: 'none', borderRadius:'4px', width:'40px', height: '40px'}}
                      type='button'>
                    <span className="material-symbols-outlined">add_shopping_cart</span>
                    </button>)}
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


/*
“You should use JavaScript to parse the JSON object and display the results in a tabular format. A
sample output is shown in Figure 6. The displayed table includes eight columns: # (Index number),
Image, Title, Price, Shipping, Zip, and Wish list.
Below the table there is a pagination feature which is used to navigate to the next set of products.
There are a maximum of 10 products on a page. The user can navigate to a different page directly
by clicking on the page number, or by using previous and next buttons.” prompt. ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/

/*
“give the respective bootstrap classes so that the input fields are displayed in the next line when viewling on a mobile screen.” prompt. ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/


/*
“for all the classes used for the divs that give the responsive design, used bootstrap classes from the bootstrap documentation”. https://getbootstrap.com/docs/5.3/layout/containers/
*/


/*
“for all the classes used for the divs that give the responsive design, used bootstrap classes from the bootstrap documentation”. https://getbootstrap.com/docs/5.3/layout/columns/
*/

/*
“for all the classes used for the divs that give the responsive design, used bootstrap classes from the bootstrap documentation”. https://getbootstrap.com/docs/5.3/layout/z-index/
*/

/*
“for all the classes used for the divs that give the responsive design, used bootstrap classes from the bootstrap documentation”. https://getbootstrap.com/docs/5.3/content/images/
*/
/*
“for all the classes used for the divs that give the responsive design, used bootstrap classes from the bootstrap documentation”. https://getbootstrap.com/docs/5.3/content/tables/
*/
/*
“for all the classes used for the divs that give the responsive design, used bootstrap classes from the bootstrap documentation”. https://getbootstrap.com/docs/5.3/forms/form-control/
*/
/*
“for all the classes used for the divs that give the responsive design, used bootstrap classes from the bootstrap documentation”. https://getbootstrap.com/docs/5.3/forms/checks-radios/
*/

/*
“for all the classes used for the divs that give the responsive design, used bootstrap classes from the bootstrap documentation”. https://getbootstrap.com/docs/5.3/forms/validation/
*/

/*
“for all the classes used for the divs that give the responsive design, used bootstrap classes from the bootstrap documentation”. https://getbootstrap.com/docs/5.3/components/alerts/
*/

/*
“for all the classes used for the divs that give the responsive design, used bootstrap classes from the bootstrap documentation”. https://getbootstrap.com/docs/5.3/components/buttons/
*/

/*
“for all the classes used for the divs that give the responsive design, used bootstrap classes from the bootstrap documentation”. https://getbootstrap.com/docs/5.3/components/carousel/
*/

/*
“for all the classes used for the divs that give the responsive design, used bootstrap classes from the bootstrap documentation”. https://getbootstrap.com/docs/5.3/components/pagination/
*/

/*
“for all the classes used for the divs that give the responsive design, used bootstrap classes from the bootstrap documentation”. https://getbootstrap.com/docs/5.3/components/progress/
*/

/*
“for all the classes used for the divs that give the responsive design, used bootstrap classes from the bootstrap documentation”. https://getbootstrap.com/docs/5.3/utilities/text/
*/


/*
“for all the classes used for the divs that give the responsive design, used bootstrap classes from the bootstrap documentation”. https://getbootstrap.com/docs/5.3/utilities/visibility/
*/


/*
“in react js, I have a list of images stored in the state variable, whenever the user clicks on a link then a modal should be opened, and the images should be displayed as a carousel. when the modal opens up, the rest of the screen should be inactive. Use bootstrap classes as required.” prompt. ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/
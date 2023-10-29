import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ProductSearchForm from './ProductSearchForm';
// import ResultsTable from './ResultsComponent';
// import WishlistTable from './WishlistComponent';
// import IndividualProduct from './IndividualProduct';


class App extends Component {

  render() {
    return (
        <ProductSearchForm />
      // <IndividualProduct />
    );
  }
}

export default App;
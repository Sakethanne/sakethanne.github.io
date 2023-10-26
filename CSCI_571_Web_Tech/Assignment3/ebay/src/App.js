import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ProductSearchForm from './ProductSearchForm';
import ResultsTable from './ResultsComponent';
import WishlistTable from './WishlistComponent';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null // Initialize a state variable to store data from the child
    };
  }

  // Define a function to receive data from the child
  receiveDataFromChild = (data) => {
    this.setState({ data });
  }

  render() {
    return (
      <div>
        <ProductSearchForm sendDataToApp={this.receiveDataFromChild} />
        {this.state.data ? this.state.data.activeButton === 'results' ? <ResultsTable data={JSON.stringify(this.state.data)}/> : <WishlistTable/> : ''}
      </div>
    );
  }
}

export default App;
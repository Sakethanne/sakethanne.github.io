import React, { Component } from 'react';

class MyComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: '', // Initialize the input field's value in state
      checked: false, // Initialize the checkbox value in state
    };
  }

  handleInputChange = (event) => {
    this.setState({ inputValue: event.target.value });
  };

  handleCheckboxChange = () => {
    this.setState((prevState) => ({ checked: !prevState.checked }));
  };

  clearInput = () => {
    this.setState({ inputValue: '' }); // Clear the input field by updating the state
  };

  render() {
    return (
      <div>
        <input
          type="text"
          value={this.state.inputValue} // Set the input field's value from state
          onChange={this.handleInputChange}
        />
        <button onClick={this.clearInput}>Clear Input</button>
        <br />
        <label>
          <input
            type="checkbox"
            checked={this.state.checked}
            onChange={this.handleCheckboxChange}
          /> Check me
        </label>
      </div>
    );
  }
}

export default MyComponent;

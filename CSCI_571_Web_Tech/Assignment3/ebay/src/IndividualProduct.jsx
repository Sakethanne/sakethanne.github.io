import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import './App.css'; // Import your custom CSS file

const pageSize = 10;
class IndividualProduct extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
      }
    
  render() {

    return (
      <Navbar bg="light" id='NavbarSingle'>
      <Navbar.Collapse className="justify-content-end"> {/* Align content to the right */}
        <Nav>
          <Nav.Link href="#tab1" className="btn">Tab 1</Nav.Link>
          <Nav.Link href="#tab2" className="btn">Tab 2</Nav.Link>
          <Nav.Link href="#tab3" className="btn">Tab 3</Nav.Link>
          <Nav.Link href="#tab4" className="btn">Tab 4</Nav.Link>
          <Nav.Link href="#tab5" className="btn">Tab 5</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
    );}
}

export default IndividualProduct;
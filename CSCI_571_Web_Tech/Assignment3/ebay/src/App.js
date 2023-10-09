import logo from './logo.svg';
import './App.css';
import React from "react"

// class App extends React.Component {
//   state = {
//     name: ""
//   }

//   componentDidMount() {
//     fetch("http://localhost:3000")
//       .then(res => res.json())
//       .then(data => this.setState({ name: data.name }))
//       // console.log(res);
//   }

//   render() {
//     return (
//       <h1>Hello {this.state.name}!</h1>
//     )
//   }
// }
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <div>
      <h1>Saketh</h1>
    </div>
    </div>
  );
}

export default App;

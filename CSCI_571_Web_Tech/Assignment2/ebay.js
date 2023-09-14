// Function to handle form submission
function cleanform(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    document.getElementById('keywords').value = '';
    document.getElementById('pricefrom').value = '';
    document.getElementById('priceto').value = '';
    document.getElementById('new').checked = false;
    document.getElementById('used').checked = false;
    document.getElementById('verygood').checked = false;
    document.getElementById('good').checked = false;
    document.getElementById('acceptable').checked = false;
    document.getElementById('returnaccepted').checked = false;
    document.getElementById('free').checked = false;
    document.getElementById('expedicted').checked = false;
  }
  
  function submitdata(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    if (validatedata(event) === false){
        console.log('Please enter correct input values');
    }
    else{
        console.log('continue');
        callFlaskFunction();
        const keywords = document.getElementById('keywords').value;
        const pricefrom = document.getElementById('pricefrom').value;
        const priceto = document.getElementById('priceto').value;
        const newvalue = document.getElementById('new').checked;
        const usedvalue = document.getElementById('used').checked;
        const vergoodvalue = document.getElementById('verygood').checked;
        const goodvalue = document.getElementById('good').checked;
        const acceptablevalue = document.getElementById('acceptable').checked;
        const returnacceptedvalue = document.getElementById('returnaccepted').checked;
        const freevalue = document.getElementById('free').checked;
        const expedictedvalue = document.getElementById('expedicted').checked;
    }
  }

  function validatedata(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    const keywords = document.getElementById('keywords').value;
    let pricefrom = document.getElementById('pricefrom').value;
    let priceto = document.getElementById('priceto').value;
    const newvalue = document.getElementById('new').checked;
    const usedvalue = document.getElementById('used').checked;
    const vergoodvalue = document.getElementById('verygood').checked;
    const goodvalue = document.getElementById('good').checked;
    const acceptablevalue = document.getElementById('acceptable').checked;
    const returnacceptedvalue = document.getElementById('returnaccepted').checked;
    const freevalue = document.getElementById('free').checked;
    const expedictedvalue = document.getElementById('expedicted').checked;

    if(priceto < pricefrom){
        alert("Oops! Lower price limit cannot be greater than the upper price limit!");
        console.log(pricefrom);
        console.log(priceto);
        return false;
    }

    if(pricefrom < 0 || priceto < 0){
        alert("Price Range values cannot be negative! Please try a value greater than or equal to 0.0");
        return false
    }
  }

  function callFlaskFunction() {
    fetch('/my-flask-function', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
}
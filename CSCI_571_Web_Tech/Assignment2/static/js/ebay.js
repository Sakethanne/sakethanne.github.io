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
    cleanresults(event);
  }

  function cleanresults(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    document.getElementById('total-results').innerHTML = '';
    document.getElementById('items-container').innerHTML = '';
  }

  function submitdata(event) {
    cleanresults(event);
    event.preventDefault(); // Prevent the default form submission behavior
    if (validatedata(event) === false){
        console.log('Please enter correct input values');
    }
    else{
        console.log('continue');
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
        const sortby = document.getElementById('sortby').value;

        inputdatajson = {
            'keyword': keywords,
            'pricefrom': pricefrom,
            'priceto': priceto,
            'newvalue': newvalue,
            'usedvalue':usedvalue,
            'vergoodvalue': vergoodvalue,
            'goodvalue': goodvalue,
            'acceptablevalue': acceptablevalue,
            'returnacceptedvalue': returnacceptedvalue,
            'freevalue': freevalue,
            'expedictedvalue': expedictedvalue,
            'sortby': sortby
        };
        sendinputdata(inputdatajson);
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
    return true;
  }

  function sendinputdata(data) {
    keyword = data['keyword']
    fetch('/sendinputdata', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data['data']['findItemsAdvancedResponse']); // Handle the response from Flask
        const results = document.getElementById('total-results');
        const result = document.createElement('div');
        result.innerHTML = ''
        result.className = "result"; // Add a CSS class
        if((data['data']['findItemsAdvancedResponse'][0]['paginationOutput'] == undefined) || (data['data']['findItemsAdvancedResponse'][0]['paginationOutput'][0]['totalEntries'] == 0)) {
            result.innerHTML = "No Results Found";
            results.appendChild(result);
            return false;
        }
        else{
            result.innerHTML = data['data']['findItemsAdvancedResponse'][0]['paginationOutput'][0]['totalEntries'] + " Results found for " + keyword;
            results.appendChild(result);
        }
        

        const itemscontainer = document.getElementById('items-container');
        for (const itemcontent in data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item']) {
        const item = document.createElement('div');
        item.className = "item"; // Add a CSS class
        item.innerHTML = data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][itemcontent]['title'][0]; // Add content
        itemscontainer.appendChild(item);
        // console.log(data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][itemcontent]['title'][0])
    };
    })
}
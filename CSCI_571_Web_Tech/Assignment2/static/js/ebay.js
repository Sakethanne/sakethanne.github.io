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
    document.getElementById('showmorebutton').innerHTML = '';
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
    let pricefrom = Number(document.getElementById('pricefrom').value);
    let priceto = Number(document.getElementById('priceto').value);
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

  jsonresponse = '';
  function sendinputdata(data) {
    keyword = data['keyword'];
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
        jsonresponse = data;
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
            result.innerHTML = data['data']['findItemsAdvancedResponse'][0]['paginationOutput'][0]['totalEntries'] + " Results found for <i>" + keyword + "<\i><hr class = 'line'>";
            results.appendChild(result);
        }
        counter = 0;
        const itemscontainer = document.getElementById('items-container');
        for (let counter = 0; counter < 3; counter++) {
            const item = document.createElement('button');
            item.className = "item"; // Add a CSS class
            item.addEventListener("click", individualitemdetails);
            htmltext = ""
            htmltext = '<table class="individualitem"><tr class="individualitem"><td rowspan="4" class="individualitem" id="individualitem"><div class="image-container"><img src="' +data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['galleryURL'][0]
            htmltext += '" height="130px" width="130px" style="border: 3px solid grey;"></div></td><th class="individualitem">' + data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['title'][0]
            htmltext += '</th></tr><tr class="individualitem"><td class="individualitem"> Category : ' + data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['primaryCategory'][0]['categoryName'][0]
            htmltext += '<a href="' + data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['viewItemURL'][0]
            htmltext += `"><img src="/static//images/redirect.png" height="18px" width="18px"></a>`
            htmltext += '</td></tr><tr class="individualitem"><td class="individualitem"> Condition : ' + data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['condition'][0]['conditionDisplayName'][0]
            if(data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['topRatedListing'][0].toString() != "false"){
                htmltext += `<img src="/static//images/topRatedImage.png" height="25px" width="22px">`
            }
            htmltext += '</td></tr><tr class="individualitem"><th class="individualitem"> Price : $' + data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['sellingStatus'][0]['currentPrice'][0]['__value__']
            htmltext += '</th></tr></table>'
            item.innerHTML = htmltext;
            // console.log(htmltext)
            itemscontainer.appendChild(item);
    };
    document.getElementById('showmorebutton').innerHTML = '<input class="showmore" id="showmoreless" type="button" value="Show More" onclick="getadditionaldata()">';
    })
}

function getadditionaldata() {
    counter = 3;
    const itemscontainer = document.getElementById('items-container');
    for (let counter = 3; counter < 10; counter++) {
        const item = document.createElement('button');
        item.className = "item"; // Add a CSS class
        item.addEventListener("click", individualitemdetails);
        htmltext = ""
        htmltext = '<table class="individualitem"><tr class="individualitem"><td rowspan="4" class="individualitem" id="individualitem"><div class="image-container"><img src="' +jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['galleryURL'][0]
        htmltext += '" height="130px" width="130px" style="border: 3px solid grey;"></div></td><th class="individualitem">' + jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['title'][0]
        htmltext += '</th></tr><tr class="individualitem"><td class="individualitem"> Category : ' + jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['primaryCategory'][0]['categoryName'][0]
        htmltext += '<a href="' + jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['viewItemURL'][0]
        htmltext += `"><img src="/static//images/redirect.png" height="18px" width="18px"></a>`
        htmltext += '</td></tr><tr class="individualitem"><td class="individualitem"> Condition : ' + jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['condition'][0]['conditionDisplayName'][0]
        if(jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['topRatedListing'][0].toString() != "false"){
            htmltext += `<img src="/static//images/topRatedImage.png" height="25px" width="22px">`
        }
        htmltext += '</td></tr><tr class="individualitem"><th class="individualitem"> Price : $' + jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['sellingStatus'][0]['currentPrice'][0]['__value__']
        htmltext += '</th></tr></table>'
        item.innerHTML = htmltext;
        // console.log(htmltext)
        itemscontainer.appendChild(item);
    };
    document.getElementById('showmorebutton').innerHTML = '<input class="showmore" id="showmoreless" type="button" value="Show Less" onclick="getolddata()">';
}


function getolddata() {
    counter = 0;
    const itemscontainer = document.getElementById('items-container');
    itemscontainer.innerHTML = '';
    for (let counter = 0; counter < 3; counter++) {
        const item = document.createElement('button');
        item.className = "item"; // Add a CSS class
        item.addEventListener("click", individualitemdetails);
        htmltext = ""
        htmltext = '<table class="individualitem"><tr class="individualitem"><td rowspan="4" class="individualitem" id="individualitem"><div class="image-container"><img src="' +jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['galleryURL'][0]
        htmltext += '" height="130px" width="130px" style="border: 3px solid grey;"></div></td><th class="individualitem">' + jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['title'][0]
        htmltext += '</th></tr><tr class="individualitem"><td class="individualitem"> Category : ' + jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['primaryCategory'][0]['categoryName'][0]
        htmltext += '<a href="' + jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['viewItemURL'][0]
        htmltext += `"><img src="/static//images/redirect.png" height="18px" width="18px"></a>`
        htmltext += '</td></tr><tr class="individualitem"><td class="individualitem"> Condition : ' + jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['condition'][0]['conditionDisplayName'][0]
        if(jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['topRatedListing'][0].toString() != "false"){
            htmltext += `<img src="/static//images/topRatedImage.png" height="25px" width="22px">`
        }
        htmltext += '</td></tr><tr class="individualitem"><th class="individualitem"> Price : $' + jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['sellingStatus'][0]['currentPrice'][0]['__value__']
        htmltext += '</th></tr></table>'
        item.innerHTML = htmltext;
        // console.log(htmltext)
        itemscontainer.appendChild(item);
    };
    document.getElementById('showmorebutton').innerHTML = '<input class="showmore" id="showmoreless" type="button" value="Show More" onclick="getadditionaldata()">';
}

function individualitemdetails() {
    // storing previous html details
    detailshtml = ''
    heading = document.getElementById('total-results').innerHTML;
    items = document.getElementById('items-container').innerHTML;
    extrabutton = document.getElementById('showmorebutton').innerHTML;

    // clearing the html content for the selected items
    document.getElementById('total-results').innerHTML = '';
    document.getElementById('items-container').innerHTML = '';
    document.getElementById('showmorebutton').innerHTML  = '';

    // setting the new html content
    const new_heading = document.createElement('div')
    new_heading.className = "result";
    new_heading.innerHTML = 'Item Details <br> <input class="backtores" id="backtores" type="button" value="Back to Search Results" onclick="backtonormal()">'
    document.getElementById('total-results').appendChild(new_heading);

    itemid = '125654398756'
    data = {
        'itemid' : itemid
    }
    fetch('/getindividualdata', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(d => {
            console.log(d);
            detailshtml = '<div class = "details-table-container"><table><tr><th>Photo</th><td><img src="'
            detailshtml += d['data']['Item']['GalleryURL']
            detailshtml += '" height="200px" width="200px"></td></tr><tr><th>Ebay Produt Link</th><td><a href="'
            detailshtml += d['data']['Item']['ViewItemURLForNaturalSearch']
            detailshtml+= '">eBay product Link</a></td></tr><tr><th>Title</th><td>'
            detailshtml += d['data']['Item']['Title']
            detailshtml+= '</td></tr><tr><th>Price</th><td>'
            detailshtml+= d['data']['Item']['CurrentPrice']['Value'] +' '+ d['data']['Item']['CurrentPrice']['CurrencyID']
            detailshtml+= '</td></tr><tr><th>Location</th><td>'
            detailshtml += d['data']['Item']['Location'] +' '+ d['data']['Item']['PostalCode']
            detailshtml+= '</td></tr><tr><th>Seller</th><td>'
            detailshtml += d['data']['Item']['Seller']['UserID']
            detailshtml+= '</td></tr><tr><th>Return Policy (US)</th><td>'
            detailshtml += d['data']['Item']['ReturnPolicy']['ReturnsAccepted'] + 'with in ' + d['data']['Item']['ReturnPolicy']['ReturnsWithin']
            for(var key in d['data']['Item']['ItemSpecifics']['NameValueList']){
                detailshtml+= '</td></tr><tr><th>'
                detailshtml += d['data']['Item']['ItemSpecifics']['NameValueList'][key]['Name']
                detailshtml+= '</th><td>'
                detailshtml += d['data']['Item']['ItemSpecifics']['NameValueList'][key]['Value']
            }
            detailshtml+= '</td></tr></table></div>'
            document.getElementById('items-container').innerHTML = detailshtml;
        })
}

function backtonormal() {
    //event.preventDefault(); // Prevent the default form submission behavior
    // clearing the curent details
    document.getElementById('total-results').innerHTML = '';
    document.getElementById('items-container').innerHTML = '';
    document.getElementById('showmorebutton').innerHTML  = '';
    // setting the previous details
    document.getElementById("total-results").innerHTML= heading ;
    document.getElementById("items-container").innerHTML= items ;
    document.getElementById("showmorebutton").innerHTML   = extrabutton;
}
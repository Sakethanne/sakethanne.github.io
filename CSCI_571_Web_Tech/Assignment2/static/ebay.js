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
    document.getElementById('sortby').value = 'BestMatch';
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
    var pricefrom = document.getElementById('pricefrom').value;
    var priceto = document.getElementById('priceto').value;
    const newvalue = document.getElementById('new').checked;
    const usedvalue = document.getElementById('used').checked;
    const vergoodvalue = document.getElementById('verygood').checked;
    const goodvalue = document.getElementById('good').checked;
    const acceptablevalue = document.getElementById('acceptable').checked;
    const returnacceptedvalue = document.getElementById('returnaccepted').checked;
    const freevalue = document.getElementById('free').checked;
    const expedictedvalue = document.getElementById('expedicted').checked;

    if((Number(pricefrom) < 0) || (Number(priceto) < 0)){
        alert("Price Range values cannot be negative! Please try a value greater than or equal to 0.0");
        return false
    }

    if(priceto == ""){
        priceto = 9999999999;
    }
    //((Number(pricefrom) != 0) && (Number(priceto) != 0)) && (
    if(Number(priceto) < Number(pricefrom)){
        alert("Oops! Lower price limit cannot be greater than the upper price limit!\n Please try again");
        console.log(pricefrom);
        console.log(priceto);
        return false;
    }

    return true;
  }

  let skipflag = 0;
  let countflag = 0;
  jsonresponse = '';
  itemid = ''
  function sendinputdata(data) {
    keyword = data['keyword'];
    var url = '/sendinputdata?'
    for(var key in data){
        url += key+ '='+ data[key] + '&'
    }
    var newurl = url.slice(0, url.length - 1);
    url = newurl;
    fetch(url)
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
        iterator = 0;
        counter = 0;
        countflag = 0;
        const itemscontainer = document.getElementById('items-container');
        for (let counter = 0; counter < Number(data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['@count']); counter++) {
            if((iterator<3) && (countflag < 10)){
                //||(data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['galleryURL'][0] == "")
                if((('title' in data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]) && (data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['title'][0] == undefined))||(('primaryCategory' in data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter])&&(data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['primaryCategory'][0]['categoryName'][0] == undefined))||(('condition' in data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]) && (data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['condition'][0]['conditionDisplayName'][0] == undefined))||(('sellingStatus' in data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter])&&(data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['sellingStatus'][0]['currentPrice'][0]['__value__']==undefined))){
                    skipflag = skipflag + 1;
                    continue;
                };
            
            const item = document.createElement('button');
            item.className = "item";
            item.id = data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['itemId'][0]
            item.addEventListener("click", function(event){ individualitemdetails(this)});
            htmltext = ""
            htmltext = '<table class="individualitem-table"'
            imgurl = ""
            if((data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['galleryURL'][0] == undefined) ||(data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['galleryURL'][0] == '')|| (data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['galleryURL'][0] == 'https://thumbs1.ebaystatic.com/%20pict/04040_0.jpg')){
                imgurl = '/static//images/ebay_default.jpg'
            }
            else{
                imgurl = data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['galleryURL'][0]
            };
            htmltext+= '><tr class="individualitem"><td rowspan="4" class="individualitems" id="individualitem"><div class="image-container"><img class="item-image-class" src="' + imgurl
            htmltext += '" style="border: 3px solid grey;"></div></td><th class="individualitem">' + data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['title'][0]
            htmltext += '</th></tr><tr class="individualitem"><td class="individualitem"> Category : <i>' + data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['primaryCategory'][0]['categoryName'][0] + '&nbsp;</i>'
            htmltext += '<a class="hyperlink" href="' + data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['viewItemURL'][0]
            htmltext += `" target="_blank"><img src="/static//images/redirect.png" height="15px" width="15px"></a>`
            htmltext += '</td></tr><tr class="individualitem"><td class="individualitem"> Condition : '
            if('condition' in data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]){
                htmltext += data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['condition'][0]['conditionDisplayName'][0];
            }
            else{
                skipflag = skipflag + 1;
                continue;
            }
            if(data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['topRatedListing'][0].toString() != "false"){
                htmltext += `<span class="badgespan"><img class="badge" src="/static//images/topRatedImage.png" height="24px" width="21px"></span>`
            }
            shippingcsot = ''
            if((data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['shippingInfo'][0].hasOwnProperty('shippingServiceCost')) && (Number(data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['shippingInfo'][0]['shippingServiceCost'][0]['__value__']) > 0)){
                shippingcsot = ' ( + $'+data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['shippingInfo'][0]['shippingServiceCost'][0]['__value__']+' Shipping)'
                htmltext += '</td></tr><tr class="individualitem"><th class="individualitem"> Price : $' + data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['sellingStatus'][0]['currentPrice'][0]['__value__'] + shippingcsot
            }
            else{
                htmltext += '</td></tr><tr class="individualitem"><th class="individualitem"> Price : $' + data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['sellingStatus'][0]['currentPrice'][0]['__value__']
            };
            htmltext += '</th></tr></table>'
            item.innerHTML = htmltext;
            iterator = iterator + 1;
            countflag = countflag + 1;
            // console.log(htmltext)
            itemscontainer.appendChild(item);
    };
};
if(Number(data['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['@count']) > 3){
    document.getElementById('showmorebutton').innerHTML = '<input class="showmore" id="showmoreless" type="button" value="Show More" onclick="getadditionaldata()">';
}

var links = document.querySelectorAll(".hyperlink");
    links.forEach(function(link) {
        link.addEventListener("click", function(event){
            event.stopPropagation(this);
         });
    });

    })
}

function getadditionaldata() {
    counter = 3;
    const itemscontainer = document.getElementById('items-container');
    for (let counter = 3+Number(skipflag); counter < Number(jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['@count']); counter++) {
        if((('title' in jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]) && (jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['title'][0] == undefined))||(('primaryCategory' in jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]) && (jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['primaryCategory'][0]['categoryName'][0] == undefined))||(('condition' in jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]) && (jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['condition'][0]['conditionDisplayName'][0] == undefined))||(('currentPrice' in jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['sellingStatus'][0]) && (jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['sellingStatus'][0]['currentPrice'][0]['__value__']==undefined))){
            // || (jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['galleryURL'][0] == "")
            continue;
        };
        if(countflag < 10){
        const item = document.createElement('button');
        item.className = "item"; // Add a CSS class
        item.id = jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['itemId'][0]
        // item.addEventListener("click", function(){
        //     individualitemdetails(item.id);
        //  });
        item.addEventListener("click", function(event){ individualitemdetails(this)});
        htmltext = ""
        imgurl = ""
        if((jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['galleryURL'][0] == undefined) ||(jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['galleryURL'][0] == '')|| (jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['galleryURL'][0] == 'https://thumbs1.ebaystatic.com/%20pict/04040_0.jpg')){
            imgurl = '/static//images/ebay_default.jpg'
        }
        else{
            imgurl = jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['galleryURL'][0]
        };
        htmltext = '<table class="individualitem-table"'
        htmltext += '><tr class="individualitem"><td rowspan="4" class="individualitems" id="individualitem"><div class="image-container"><img class="item-image-class" src="' + imgurl
        htmltext += '" style="border: 3px solid grey;"></div></td><th class="individualitem">' 
        htmltext += jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['title'][0]
        htmltext += '</th></tr><tr class="individualitem"><td class="individualitem"> Category : <i>' 
        if('categoryName' in jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['primaryCategory'][0]){
            htmltext += jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['primaryCategory'][0]['categoryName'][0]
        }
        else{
            continue;
        }
        htmltext += '&nbsp;</i> <a class="hyperlink" href="' + jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['viewItemURL'][0]
        htmltext += `" target="_blank"><img src="/static//images/redirect.png" height="15px" width="15px"></a>`
        htmltext += '</td></tr><tr class="individualitem"><td class="individualitem"> Condition : ' 
        if('condition' in jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]){
            htmltext += jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['condition'][0]['conditionDisplayName'][0]
        }
        else{
            continue;
        }
        if(jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['topRatedListing'][0].toString() != "false"){
            htmltext += `<span class="badgespan"><img class="badge" src="/static//images/topRatedImage.png" height="24px" width="21px"></span>`
        }
        shippingcsot = ''
            if((jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['shippingInfo'][0].hasOwnProperty('shippingServiceCost')) && (Number(jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['shippingInfo'][0]['shippingServiceCost'][0]['__value__']) > 0)){
                shippingcsot = ' ( + $'+jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['shippingInfo'][0]['shippingServiceCost'][0]['__value__']+' Shipping)'
                htmltext += '</td></tr><tr class="individualitem"><th class="individualitem"> Price : $' + jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['sellingStatus'][0]['currentPrice'][0]['__value__'] + shippingcsot
            }
            else{
                htmltext += '</td></tr><tr class="individualitem"><th class="individualitem"> Price : $' + jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['sellingStatus'][0]['currentPrice'][0]['__value__']
            };
        htmltext += '</th></tr></table>'
        item.innerHTML = htmltext;
        countflag = countflag + 1;
        // console.log(htmltext)
        itemscontainer.appendChild(item);
    };
};
    if(Number(jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['@count']) > 3){
        document.getElementById('showmorebutton').innerHTML = '<input class="showmore" id="showmoreless" type="button" value="Show Less" onclick="getolddata()">';
        function scrollintoview() {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth' // Apply smooth scrolling
            });
        }

        // Call the function to scroll to the end after a delay (e.g., 1000 milliseconds)
        setTimeout(scrollintoview, 250);
    };

    var links = document.querySelectorAll(".hyperlink");
    links.forEach(function(link) {
        link.addEventListener("click", function(event){
            event.stopPropagation(this);
         });
    });
}


function getolddata() {
    counter = 0;
    const itemscontainer = document.getElementById('items-container');
    itemscontainer.innerHTML = '';
    iterator = 0;
    skipflag = 0;
    countflag = 0;
    for (let counter = 0; counter < Number(jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['@count']); counter++) {
        if((iterator<3) && (countflag < 10)){
            if((('title' in jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]) && (jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['title'][0] == undefined))||(('primaryCategory' in jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]) && (jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['primaryCategory'][0]['categoryName'][0] == undefined))||(('condition' in jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]) && (jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['condition'][0]['conditionDisplayName'][0] == undefined))||(('currentPrice' in jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['sellingStatus'][0]) && (jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['sellingStatus'][0]['currentPrice'][0]['__value__']==undefined))){
                //||(jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['galleryURL'][0] == "")
                skipflag = skipflag + 1;
                continue;
            };
            
        const item = document.createElement('button');
        item.className = "item"; // Add a CSS class
        item.id = jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['itemId'][0]
        // item.addEventListener("click", function(){
        //     individualitemdetails(jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['itemId'][0]);
        //  });
        item.addEventListener("click", function(event){ individualitemdetails(this)});
        htmltext = ""
        imgurl = ""
        if((jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['galleryURL'][0] == undefined) ||(jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['galleryURL'][0] == '')|| (jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['galleryURL'][0] == 'https://thumbs1.ebaystatic.com/%20pict/04040_0.jpg')){
            imgurl = '/static//images/ebay_default.jpg'
        }
        else{
            imgurl = jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['galleryURL'][0]
        };
        htmltext = '<table class="individualitem-table"'
        htmltext += '><tr class="individualitem"><td rowspan="4" class="individualitems" id="individualitem"><div class="image-container"><img class="item-image-class" src="' + imgurl
        htmltext += '" style="border: 3px solid grey;"></div></td><th class="individualitem">' 
        htmltext += jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['title'][0]
        htmltext += '</th></tr><tr class="individualitem"><td class="individualitem"> Category : <i>' 
        if('categoryName' in jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['primaryCategory'][0]){
            htmltext += jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['primaryCategory'][0]['categoryName'][0]
        }
        else{
            skipflag = skipflag + 1;
            continue;
        }
        htmltext += '&nbsp;</i><a class="hyperlink" href="' + jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['viewItemURL'][0]
        htmltext += `" target="_blank"><img src="/static//images/redirect.png" height="15px" width="15px"></a>`
        htmltext += '</td></tr><tr class="individualitem"><td class="individualitem"> Condition : ' 
        if('condition' in jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]){
            htmltext += jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['condition'][0]['conditionDisplayName'][0]
        }
        else{
            skipflag = skipflag + 1;
            continue;
        }
        if(jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['topRatedListing'][0].toString() != "false"){
            htmltext += `<span class="badgespan"><img class="badge" src="/static//images/topRatedImage.png" height="24px" width="21px"></span>`
        }
        shippingcsot = ''
            if((jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['shippingInfo'][0].hasOwnProperty('shippingServiceCost')) && (Number(jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['shippingInfo'][0]['shippingServiceCost'][0]['__value__']) > 0)){
                shippingcsot = ' ( + $'+jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['shippingInfo'][0]['shippingServiceCost'][0]['__value__']+' Shipping)'
                htmltext += '</td></tr><tr class="individualitem"><th class="individualitem"> Price : $' + jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['sellingStatus'][0]['currentPrice'][0]['__value__'] + shippingcsot
            }
            else{
                htmltext += '</td></tr><tr class="individualitem"><th class="individualitem"> Price : $' + jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['item'][counter]['sellingStatus'][0]['currentPrice'][0]['__value__']
            };
        htmltext += '</th></tr></table>'
        item.innerHTML = htmltext;
        countflag = countflag + 1;
        iterator = iterator + 1;
        // console.log(htmltext)
        itemscontainer.appendChild(item);
    };
};
if(Number(jsonresponse['data']['findItemsAdvancedResponse'][0]['searchResult'][0]['@count']) > 3){
    document.getElementById('showmorebutton').innerHTML = '<input class="showmore" id="showmoreless" type="button" value="Show More" onclick="getadditionaldata()">';
    function scrollintoview() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Apply smooth scrolling
        });
    }

    // Call the function to scroll to the end after a delay (e.g., 1000 milliseconds)
    setTimeout(scrollintoview, 10);
};

var links = document.querySelectorAll(".hyperlink");
    links.forEach(function(link) {
        link.addEventListener("click", function(event){
            event.stopPropagation(this);
         });
    });

}

function individualitemdetails(event) {
    console.log(event['attributes']['id']['nodeValue']);
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
    new_heading.innerHTML = '<p class = "itemdetailspara"> Item Details </p> <br> <input class="backtores" id="backtores" type="button" value="Back to Search Results" onclick="backtonormal()">'
    document.getElementById('total-results').appendChild(new_heading);

    // itemid = '125654398756'
    itemid = event['attributes']['id']['nodeValue']
    data = {
        'itemid' : itemid
    }
    var indurl = '/getindividualdata?'
    for(var key in data){
        indurl += key+ '='+ data[key] + '&'
    }
    fetch(indurl)
        .then(response => response.json())
        .then(d => {
            console.log(d);
            detailshtml = '<div class = "details-table-container"><table id = "details-table" class = "details-table">'
            if(d['data']['Item']['PictureURL'][0] != undefined){
                detailshtml += '<tr class="details-table"><th class="details-table">Photo</th><td class="details-table"><img src="'
                // console.log(d['data']['Item']['PictureURL'][0])
                detailshtml += d['data']['Item']['PictureURL'][0]
                
                detailshtml += '" height="200px"></td></tr>'
            }
            else if((d['data']['Item']['PictureURL'].length == 0) || (d['data']['Item']['PictureURL'][0] == 'https://thumbs1.ebaystatic.com/%20pict/04040_0.jpg') || ((d['data']['Item']['PictureURL'][0] == ""))){
                detailshtml += '<tr class="details-table"><th class="details-table">Photo</th><td class="details-table"><img src="'
                detailshtml += '/static//images/ebay_default.jpg'
                // console.log(d['data']['Item']['PictureURL'][0])
                detailshtml += '" height="200px" width="200px"></td></tr>'
            }
            detailshtml += '<tr class="details-table"><th class="details-table">ebay Link</th><td class="details-table"><a href="'
            detailshtml += d['data']['Item']['ViewItemURLForNaturalSearch']
            detailshtml+= '" target="_blank">eBay Product Link</a></td></tr><tr class="details-table"><th class="details-table">Title</th><td class="details-table">'
            detailshtml += d['data']['Item']['Title']
            if('Subtitle' in d['data']['Item']){
                detailshtml += '</td></tr><tr class="details-table"><th class="details-table">Subtitle</th><td class="details-table">'
                detailshtml += d['data']['Item']['Subtitle']
            }
            if(d['data']['Item']['CurrentPrice']['Value'] != undefined){
                detailshtml+= '</td></tr><tr class="details-table"><th class="details-table">Price</th><td class="details-table">'
                detailshtml+= d['data']['Item']['CurrentPrice']['Value'] 
                if(d['data']['Item']['CurrentPrice']['CurrencyID'] != undefined){
                    detailshtml += ' '+ d['data']['Item']['CurrentPrice']['CurrencyID']
                }
            }
            if(d['data']['Item']['Location'] != undefined){
                detailshtml+= '</td></tr><tr class="details-table"><th class="details-table">Location</th><td class="details-table">'
                detailshtml += d['data']['Item']['Location']
                if(d['data']['Item']['PostalCode'] != undefined){
                    detailshtml += ' '+ d['data']['Item']['PostalCode']
                }
            }
            if(d['data']['Item']['Seller']['UserID'] != undefined){
                detailshtml+= '</td></tr><tr class="details-table"><th class="details-table">Seller</th><td class="details-table">'
                detailshtml += d['data']['Item']['Seller']['UserID']
            }
            detailshtml+= '</td></tr><tr class="details-table"><th class="details-table">Return Policy (US)</th><td class="details-table">'
            if(d['data']['Item']['ReturnPolicy']['ReturnsAccepted'] != undefined){
                detailshtml += d['data']['Item']['ReturnPolicy']['ReturnsAccepted']
            }
            if(d['data']['Item']['ReturnPolicy']['ReturnsWithin'] != undefined){
                detailshtml += ' with in ' + d['data']['Item']['ReturnPolicy']['ReturnsWithin']
            }
            for(var key in d['data']['Item']['ItemSpecifics']['NameValueList']){
                detailshtml+= '</td></tr><tr class="details-table"><th class="details-table">'
                detailshtml += d['data']['Item']['ItemSpecifics']['NameValueList'][key]['Name']
                detailshtml+= '</th><td class="details-table">'
                detailshtml += d['data']['Item']['ItemSpecifics']['NameValueList'][key]['Value'][0]
            }
            detailshtml+= '</td></tr></table></div>'
            document.getElementById('items-container').innerHTML = detailshtml;
        })
}

function backtonormal() {
    // clearing the curent details
    document.getElementById('total-results').innerHTML = '';
    document.getElementById('items-container').innerHTML = '';
    document.getElementById('showmorebutton').innerHTML  = '';
    // setting the previous details
    document.getElementById("total-results").innerHTML= heading ;
    document.getElementById("items-container").innerHTML= items ;
    document.getElementById("showmorebutton").innerHTML   = extrabutton;
    //adding event listeners for buttons and links
    var buttons = document.querySelectorAll(".item");
    buttons.forEach(function(button) {
        button.addEventListener("click", function(event){
            individualitemdetails(this);
         });
    });

    var links = document.querySelectorAll(".hyperlink");
    links.forEach(function(link) {
        link.addEventListener("click", function(event){
            event.stopPropagation(this);
         });
    });
}
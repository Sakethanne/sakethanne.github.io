const express = require("express");
const axios = require('axios');
const app = express();
app.use(express.json());

// const cors = require('cors');

let results;
app.get("/senddata", (req, res) => {
    console.log(req.query);
    var ebayurl = 'https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=SaiVenka-WebAppli-PRD-672a069ab-61e3ce4f&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&paginationInput.entriesPerPage=50&keywords=';
    ebayurl += req.query.keyword;
    ebayurl += '&buyerPostalCode=';
    if(req.query.location === 'currentlocation'){
        ebayurl += req.query.autolocation;
    }
    else if(req.query.location === 'otherlocation'){
        ebayurl += req.query.from;
    }
    ebayurl += '&itemFilter(0).name=MaxDistance&itemFilter(0).value=';
    ebayurl += req.query.distance;
    ebayurl += '&itemFilter(1).name=HideDuplicateItems&itemFilter(1).value=true';
    var i = 2;
    if(req.query.freeshipping === 'true'){
        ebayurl += '&itemFilter('+i+').name=FreeShippingOnly&itemFilter('+i+').value=true';
        i = i + 1;
    };
    if(req.query.localpickup === 'true'){
        ebayurl += '&itemFilter('+i+').name=LocalPickupOnly&itemFilter('+i+').value=true';
        i = i + 1;
    }
    if(req.query.conditionnew === 'true' || req.query.conditionused === 'true' || req.query.conditionunspecified === 'true'){
        ebayurl += '&itemFilter('+i+').name=Condition';
        var j = 0;
        if(req.query.conditionnew === 'true'){
            ebayurl += '&itemFilter('+i+').value('+j+')=New';
            j = j + 1;
        }
        if(req.query.conditionused === 'true'){
            ebayurl += '&itemFilter('+i+').value('+j+')=Used';
            j = j + 1;
        }
        if(req.query.conditionunspecified === 'true'){
            ebayurl += '&itemFilter('+i+').value('+j+')=Unspecified';
            j = j + 1;
        }
    }
    i = i + 1;
    ebayurl += '&outputSelector(0)=SellerInfo&outputSelector(1)=StoreInfo'

    console.log(ebayurl);
    axios.get(ebayurl)
        .then((response) => {
            results = response.data;
            res.json(results);
        })
        .catch((error) => {
            console.error('API request error:', error);
        });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
const express = require("express");
const axios = require('axios');
const app = express();
app.use(express.json());
// import { OAuthToken } from './ebay_oauth_token.js';
const OAuthToken = require('./ebay_oauth_token.js');

// Usage example
const client_id = 'SaiVenka-WebAppli-PRD-672a069ab-61e3ce4f';
const client_secret = 'PRD-72a069abaed4-bb97-47f0-9d07-3124';

const oauthTokenobj = new OAuthToken(client_id, client_secret);

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

app.get("/geonames", (req, res) => {
    console.log('inside geo function')
    console.log(req.query);
    var geonames = 'http://api.geonames.org/postalCodeSearchJSON?postalcode_startsWith='
    geonames += req.query.zip
    geonames += '&maxRows=5&username=sakethanne&country=US';
    console.log(geonames);
    axios.get(geonames)
        .then((response) => {
            console.log('inside response')
            var geo = response.data;
            res.json(geo);
        })
        .catch((error) => {
            console.error('API request error:', error);
        });
});

app.get("/getsimilaritems", (req, res) => {
    console.log(req.query);
    var similarproductsurl = 'https://svcs.ebay.com/MerchandisingService?OPERATION-NAME=getSimilarItems&SERVICE-NAME=MerchandisingService&SERVICE-VERSION=1.1.0&CONSUMER-ID=SaiVenka-WebAppli-PRD-672a069ab-61e3ce4f&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&itemId='
    similarproductsurl+= req.query.productid
    similarproductsurl += '&maxResults=20'
    axios.get(similarproductsurl)
        .then((response) => {
            var similarproducts = response.data;
            res.json(similarproducts);
        })
        .catch((error) => {
            console.error('API request error:', error);
        });
});

app.get("/getsingleitem", (req, res) => {

    oauthTokenobj.getApplicationToken()
    .then((accessToken) => {
        console.log('Access Token:', accessToken);
        var singleproducturl = 'https://open.api.ebay.com/shopping?callname=GetSingleItem&responseencoding=JSON&appid=SaiVenka-WebAppli-PRD-672a069ab-61e3ce4f&siteid=0&version=967&ItemID='
        singleproducturl+= req.query.productid
        // singleproducturl += '132961484706'
        singleproducturl += '&IncludeSelector=Description,Details,ItemSpecifics'
        axios.get(singleproducturl, {
            headers: {
            'X-EBAY-API-IAF-TOKEN': accessToken,
            },
          })
            .then((response) => {
                console.log('inside func')
                var singleproduct = response.data;
                res.json(singleproduct);
            })
            .catch((error) => {
                console.error('API request error:', error);
            });
        })
        .catch((error) => {
            console.error('Error:', error);
    });
});


const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
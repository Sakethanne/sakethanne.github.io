const express = require("express");
const axios = require('axios');
const app = express();
var cors = require('cors');
app.use(cors());
app.use(express.json());
app.set('trust proxy', true);

const OAuthToken = require('./ebay_oauth_token.js');
const { ObjectId } = require('mongodb');

// Usage example
const client_id = 'SaiVenka-WebAppli-PRD-672a069ab-61e3ce4f';
const client_secret = 'PRD-72a069abaed4-bb97-47f0-9d07-3124';

const oauthTokenobj = new OAuthToken(client_id, client_secret);

const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://sakethanne:annesaketh@ebay.gtnoxu7.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);

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
    if(req.query.category !== 'All Categories'){
        ebayurl += '&itemFilter('+i+').name=Category&itemFilter('+i+').value='
        ebayurl += req.query.category;
        i = i + 1;
    };
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
        // console.log('Access Token:', accessToken);
        var singleproducturl = 'https://open.api.ebay.com/shopping?callname=GetSingleItem&responseencoding=JSON&appid=SaiVenka-WebAppli-PRD-672a069ab-61e3ce4f&siteid=0&version=967&ItemID='
        singleproducturl+= req.query.productid
        // singleproducturl += '132961484706'
        singleproducturl += '&IncludeSelector=Description,Details,ItemSpecifics,ShippingCosts'
        axios.get(singleproducturl, {
            headers: {
            'X-EBAY-API-IAF-TOKEN': accessToken,
            },
          })
            .then((response) => {
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

app.get("/getphotos", (req, res) => {
    var googlesearchurl = 'https://www.googleapis.com/customsearch/v1?q='
    googlesearchurl+= req.query.productname
    googlesearchurl += '&cx=24c220cea25034c3d&imgSize=huge&num=8&searchType=image&key=AIzaSyAcXUA4w1kSAwfL5T3ea1t1qdJ1itSwbtg'
    console.log(googlesearchurl)
    axios.get(googlesearchurl)
        .then((response) => {
            var googleimageres = response.data;
            res.json(googleimageres);
        })
        .catch((error) => {
            console.error('API request error:', error);
        });
});

app.get("/addfav", (req, res) => {
    try{
        const productid = req.query.productid;
        const product_name = req.query.product_name;
        const product_price = req.query.product_price;
        const product_shipping = req.query.product_shipping;
        const product_img_url = req.query.product_img_url;
        const insertid = adddata(productid,product_name,product_price,product_shipping,product_img_url);
        console.log(insertid);
        res.json({'Status': 200});
    }catch (err) {
        res.json({'Status': 404});
      };
});

app.get("/getfavs", (req, res) => {
    try{
        var wishlist_prods = [];
        getdatamongo()
        .then((resolvedValue) => {
            wishlist_prods = resolvedValue;
            res.json({'Status': 200, 'Wishlist_Products':wishlist_prods });
          })
          .catch((error) => {
            console.error('Error:', error);
          });
    }catch (err) {
        res.json({'Status': 404});
      };
});

app.get("/deletefav", (req, res) => {
    try{
        const productid = req.query.productid;
        const deleteid = deletedata(productid);
        res.json({'Status': 200});
    }catch (err) {
        res.json({'Status': 404});
      };
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
// AIzaSyDJHwvjszMvgIadBNwPGdQ0bpoVF42Mx8k
// <script async src="https://cse.google.com/cse.js?cx=24c220cea25034c3d">
// </script>
// <div class="gcse-search"></div>
// AIzaSyAcXUA4w1kSAwfL5T3ea1t1qdJ1itSwbtg
// https://www.facebook.com/share.php?u=hubspot.com

async function adddata(productid,product_name,product_price,product_shipping,product_img_url) {
  try {
    await client.connect();
    const database = client.db('ebay');
    const favorites = database.collection('favorites');

    // Query for a movie that has the title 'Back to the Future'
    const data_to_insert = { productid: productid, productname: product_name, productprice: product_price, productshipping: product_shipping, productimage: product_img_url };
    const result = await favorites.insertOne(data_to_insert);
    console.log(result.insertedId);
    return result.insertedId;
  } catch (err) {
    console.log(err);
  }finally {
    await client.close();
  }
};


async function getdatamongo() {
    try {
      await client.connect();
      const database = client.db('ebay');
      const favorites = database.collection('favorites');

      const allData = await favorites.find({}).toArray();
      wishlisted_products = [];
      allData.forEach((item) => {
        wishlisted_products.push(JSON.stringify(item));
      });
    //   console.log(wishlisted_products);
      return (wishlisted_products);
    } catch (err) {
        console.log(err);
    }finally {
      await client.close();
    }
  };

  async function deletedata(productid) {
    try {
      await client.connect();
      const database = client.db('ebay');
      const favorites = database.collection('favorites');

      const query = { productid: productid};
      const deleteresults = await favorites.deleteOne({ productid: productid});
      console.log(deleteresults);
      }catch (err) {
        console.log(err);
      }
      finally{
        await client.close();
      };
};
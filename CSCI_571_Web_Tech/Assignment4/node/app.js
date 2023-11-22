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
    var ebayurl = 'https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=SaiVenka-WebAppli-PRD-672a069ab-61e3ce4f&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&paginationInput.entriesPerPage=5&keywords=';
    ebayurl += req.query.keyword;
    ebayurl += '&buyerPostalCode=';
    if(req.query.location === 'currentlocation'){
        ebayurl += req.query.autolocation;
    }
    else if(req.query.location === 'otherlocation'){
        ebayurl += req.query.from;
    }
    if((req.query.category !== 'All Categories') && (parseInt(req.query.category) !== 0)){
        ebayurl += '&categoryId='
        ebayurl += req.query.category;
    };
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
    var items = []
    axios.get(ebayurl)
        .then((response) => {
            results = response.data;
            if(results.findItemsAdvancedResponse[0].ack[0] === "Success"){
                if(parseInt(results.findItemsAdvancedResponse[0].searchResult[0]["@count"]) !== 0){
                    // res.json(results);
                    for (let i = 0; i < results.findItemsAdvancedResponse[0].searchResult[0].item.length; i++) {
                        var item = {}
                        item['productid'] = results.findItemsAdvancedResponse[0].searchResult[0].item[i].itemId[0]
                        item['productname'] = results.findItemsAdvancedResponse[0].searchResult[0].item[i].title[0]
                        item['productimage'] = results.findItemsAdvancedResponse[0].searchResult[0].item[i].galleryURL[0]
                        item['productzipcode'] = results.findItemsAdvancedResponse[0].searchResult[0].item[i].postalCode[0]
                        if('shippingInfo' in results.findItemsAdvancedResponse[0].searchResult[0].item[i]){
                           if('shippingServiceCost' in results.findItemsAdvancedResponse[0].searchResult[0].item[i].shippingInfo[0]){
                            item['productshippingcost'] = results.findItemsAdvancedResponse[0].searchResult[0].item[i].shippingInfo[0].shippingServiceCost[0].__value__
                           }else{
                            item['productshippingcost'] = ""
                           }
                        }else{
                            item['productshippingcost'] = ""
                        }
                        if('shippingInfo' in results.findItemsAdvancedResponse[0].searchResult[0].item[i]){
                            if('shippingType' in results.findItemsAdvancedResponse[0].searchResult[0].item[i].shippingInfo[0]){
                                item['productshippingtype'] = results.findItemsAdvancedResponse[0].searchResult[0].item[i].shippingInfo[0].shippingType[0]
                            }else{
                                item['productshippingtype'] = ""
                            }
                        }else{
                            item['productshippingtype'] = ""
                        }
                        if('shippingInfo' in results.findItemsAdvancedResponse[0].searchResult[0].item[i]){
                            if('shipToLocations' in results.findItemsAdvancedResponse[0].searchResult[0].item[i].shippingInfo[0]){
                                item['productshippinglocations'] = results.findItemsAdvancedResponse[0].searchResult[0].item[i].shippingInfo[0].shipToLocations[0]
                            }else{
                                item['productshippinglocations'] = ""
                            }
                        }else{
                            item['productshippinglocations'] = ""
                        }
                        if('shippingInfo' in results.findItemsAdvancedResponse[0].searchResult[0].item[i]){
                            if('expeditedShipping' in results.findItemsAdvancedResponse[0].searchResult[0].item[i].shippingInfo[0]){
                                item['productshippingexpedited'] = results.findItemsAdvancedResponse[0].searchResult[0].item[i].shippingInfo[0].expeditedShipping[0]
                            }else{
                                item['productshippingexpedited'] = ""
                            }
                        }else{
                            item['productshippingexpedited'] = ""
                        }
                        if('shippingInfo' in results.findItemsAdvancedResponse[0].searchResult[0].item[i]){
                            if('oneDayShippingAvailable' in results.findItemsAdvancedResponse[0].searchResult[0].item[i].shippingInfo[0]){
                                item['productshippingoneday'] = results.findItemsAdvancedResponse[0].searchResult[0].item[i].shippingInfo[0].oneDayShippingAvailable[0]
                            }else{
                                item['productshippingoneday'] = ""
                            }
                        }else{
                            item['productshippingoneday'] = ""
                        }
                        if('shippingInfo' in results.findItemsAdvancedResponse[0].searchResult[0].item[i]){
                            if('handlingTime' in results.findItemsAdvancedResponse[0].searchResult[0].item[i].shippingInfo[0]){
                                item['productshippinghandling'] = results.findItemsAdvancedResponse[0].searchResult[0].item[i].shippingInfo[0].handlingTime[0]
                            }else{
                                item['productshippinghandling'] = ""
                            }
                        }else{
                            item['productshippinghandling'] = ""
                        }
                        item['productprice'] = results.findItemsAdvancedResponse[0].searchResult[0].item[i].sellingStatus[0].currentPrice[0].__value__
                        if('condition' in results.findItemsAdvancedResponse[0].searchResult[0].item[i]){
                            if('conditionDisplayName' in results.findItemsAdvancedResponse[0].searchResult[0].item[i].condition[0]){
                                item['productcondition'] = results.findItemsAdvancedResponse[0].searchResult[0].item[i].condition[0].conditionDisplayName[0]
                            }else{
                                item['productcondition'] = ""
                            }
                        }else{
                            item['productcondition'] = ""
                        }
                        if('condition' in results.findItemsAdvancedResponse[0].searchResult[0].item[i]){
                            if('conditionId' in results.findItemsAdvancedResponse[0].searchResult[0].item[i].condition[0]){
                                item['productconditionid'] = results.findItemsAdvancedResponse[0].searchResult[0].item[i].condition[0].conditionId[0]
                            }else{
                                item['productconditionid'] = ""
                            }
                        }else{
                            item['productconditionid'] = ""
                        }
                        items.push(item);
                      } 
                      res.json({Results: items})    
                }
                else{
                    res.json({Results: 0});
                }
            }
            else{
                res.json({Results: "Failure"});
            }
        })
        .catch((error) => {
            console.error('API request error:', error);
        });
});

app.get("/geonames", (req, res) => {
    console.log('inside geo function')
    console.log(req.query);
    var zips = []
    var geonames = 'http://api.geonames.org/postalCodeSearchJSON?postalcode_startsWith='
    geonames += req.query.zip
    geonames += '&maxRows=5&username=sakethanne&country=US';
    console.log(geonames);
    axios.get(geonames)
        .then((response) => {
            console.log('inside response')
            for (let i = 0; i < response.data.postalCodes.length; i++) {
                zips[i] = response.data.postalCodes[i].postalCode;
              }
            // var geo = response.data;
            res.json(zips);
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
    var similaritems = []
    axios.get(similarproductsurl)
        .then((response) => {
            var similarproducts = response.data;
            if('item' in similarproducts.getSimilarItemsResponse.itemRecommendations)
            for(let i =0; i < similarproducts.getSimilarItemsResponse.itemRecommendations.item.length; i++){
                var simitem = {};
                simitem['name'] = similarproducts.getSimilarItemsResponse.itemRecommendations.item[i].title
                simitem['picture'] = similarproducts.getSimilarItemsResponse.itemRecommendations.item[i].imageURL
                simitem['price'] = similarproducts.getSimilarItemsResponse.itemRecommendations.item[i].buyItNowPrice.__value__
                simitem['shipping'] = similarproducts.getSimilarItemsResponse.itemRecommendations.item[i].shippingCost.__value__
                simitem['remaining'] = similarproducts.getSimilarItemsResponse.itemRecommendations.item[i].timeLeft.substring(similarproducts.getSimilarItemsResponse.itemRecommendations.item[i].timeLeft.indexOf("P") + 1, similarproducts.getSimilarItemsResponse.itemRecommendations.item[i].timeLeft.indexOf("D"))
                simitem['link'] = similarproducts.getSimilarItemsResponse.itemRecommendations.item[i].viewItemURL
                simitem['id'] = similarproducts.getSimilarItemsResponse.itemRecommendations.item[i].itemId
                similaritems.push(simitem)
        }
            res.json(similaritems);
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
                var singleitemdetails = {}
                var singleproduct = response.data;
                if(singleproduct.Ack === 'Success'){
                    if('Description' in singleproduct.Item){
                        // singleitemdetails['description'] = singleproduct.Item.Description
                        singleitemdetails['description'] = ""
                    }else{
                        singleitemdetails['description'] = ""
                    }
                    if('Title' in singleproduct.Item){
                        singleitemdetails['title'] = singleproduct.Item.Title
                    }else{
                        singleitemdetails['title'] = ""
                    }
                    if('ViewItemURLForNaturalSearch' in singleproduct.Item){
                        singleitemdetails['ebayurl'] = singleproduct.Item.ViewItemURLForNaturalSearch
                    }else{
                        singleitemdetails['ebayurl'] = ""
                    }
                    if('PictureURL' in singleproduct.Item){
                        singleitemdetails['pictures'] = singleproduct.Item.PictureURL
                    }else{
                        singleitemdetails['pictures'] = ""
                    }
                    if('Seller' in singleproduct.Item){
                        if('UserID' in singleproduct.Item.Seller){
                            singleitemdetails['sellername'] = singleproduct.Item.Seller.UserID
                        }else{
                            singleitemdetails['sellername'] = ""
                        }
                    }else{
                        singleitemdetails['sellername'] = ""
                    }
                    if('Seller' in singleproduct.Item){
                        if('FeedbackScore' in singleproduct.Item.Seller){
                            singleitemdetails['sellerfeedbackscore'] = singleproduct.Item.Seller.FeedbackScore
                        }else{
                            singleitemdetails['sellerfeedbackscore'] = ""
                        }
                    }else{
                        singleitemdetails['sellerfeedbackscore'] = ""
                    }
                    if('Seller' in singleproduct.Item){
                        if('PositiveFeedbackPercent' in singleproduct.Item.Seller){
                            singleitemdetails['sellerpopularity'] = singleproduct.Item.Seller.PositiveFeedbackPercent
                        }else{
                            singleitemdetails['sellerpopularity'] = ""
                        }
                    }else{
                        singleitemdetails['sellerpopularity'] = ""
                    }
                    if('ItemSpecifics' in singleproduct.Item){
                        if('NameValueList' in singleproduct.Item.ItemSpecifics){
                            singleitemdetails['itemspecifics'] = singleproduct.Item.ItemSpecifics.NameValueList
                        }else{
                            singleitemdetails['itemspecifics'] = ""
                        }
                    }else{
                        singleitemdetails['itemspecifics'] = ""
                    }
                    if('Storefront' in singleproduct.Item){
                        if('StoreName' in singleproduct.Item.Storefront){
                            singleitemdetails['storename'] = singleproduct.Item.Storefront.StoreName
                        }else{
                            singleitemdetails['storename'] = ""
                        }
                    }else{
                        singleitemdetails['storename'] = ""
                    }
                    if('Storefront' in singleproduct.Item){
                        if('StoreURL' in singleproduct.Item.Storefront){
                            singleitemdetails['storeurl'] = singleproduct.Item.Storefront.StoreURL
                        }else{
                            singleitemdetails['storeurl'] = ""
                        }
                    }else{
                        singleitemdetails['storeurl'] = ""
                    }
                    if('GlobalShipping' in singleproduct.Item){
                        singleitemdetails['globalshipping'] = singleproduct.Item.GlobalShipping
                    }else{
                        singleitemdetails['globalshipping'] = ""
                    }
                    if('ReturnPolicy' in singleproduct.Item){
                        if('ReturnsAccepted' in singleproduct.Item.ReturnPolicy){
                            singleitemdetails['returnpolicy'] = singleproduct.Item.ReturnPolicy.ReturnsAccepted
                        }
                        else{
                            singleitemdetails['returnpolicy'] = ""
                        }
                    }else{
                        singleitemdetails['returnpolicy'] = ""
                    }
                    if('ReturnPolicy' in singleproduct.Item){
                        if('Refund' in singleproduct.Item.ReturnPolicy){
                            singleitemdetails['returnmode'] = singleproduct.Item.ReturnPolicy.Refund
                        }else{
                            singleitemdetails['returnmode'] = ""
                        }
                    }else{
                        singleitemdetails['returnmode'] = ""
                    }
                    if('ReturnPolicy' in singleproduct.Item){
                        if('ReturnsWithin' in singleproduct.Item.ReturnPolicy){
                            singleitemdetails['returnwithin'] = singleproduct.Item.ReturnPolicy.ReturnsWithin
                        }else{
                            singleitemdetails['returnwithin'] = ""
                        }
                    }else{
                        singleitemdetails['returnwithin'] = ""
                    }
                    if('ReturnPolicy' in singleproduct.Item){
                        if('ShippingCostPaidBy' in singleproduct.Item.ReturnPolicy){
                            singleitemdetails['returnshipcost'] = singleproduct.Item.ReturnPolicy.ShippingCostPaidBy
                        }else{
                            singleitemdetails['returnshipcost'] = ""
                        }
                    }else{
                        singleitemdetails['returnshipcost'] = ""
                    }
                }
                res.json(singleitemdetails);
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
    var imageslist = []
    axios.get(googlesearchurl)
        .then((response) => {
            var googleimageres = response.data;
            for(let i=0; i<googleimageres.items.length; i++){
                imageslist.push(googleimageres.items[i].link)
            }
            res.json(imageslist);
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
        const product_zip = req.query.product_zip;
        const product_condition = req.query.product_condition;
        const insertid = adddata(productid,product_name,product_price,product_shipping,product_img_url,product_condition,product_zip);
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
        console.log('Inside delete')
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

async function adddata(productid,product_name,product_price,product_shipping,product_img_url,product_condition,product_zip) {
  try {
    await client.connect();
    const database = client.db('ebay');
    const favorites = database.collection('favorites-ios');

    // Query for a movie that has the title 'Back to the Future'
    const data_to_insert = { productid: productid, productname: product_name, productprice: product_price, productshipping: product_shipping, productimage: product_img_url, productcondition: product_condition, productzip: product_zip };
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
      const favorites = database.collection('favorites-ios');

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
      const favorites = database.collection('favorites-ios');

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
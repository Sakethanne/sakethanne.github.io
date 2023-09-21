from flask import Flask, render_template,request, jsonify
import requests
import json
from ebay_oauth_token import OAuthToken


client_id = "SaiVenka-WebAppli-PRD-672a069ab-61e3ce4f"
client_secret = "PRD-72a069abaed4-bb97-47f0-9d07-3124"
oauth_utility = OAuthToken(client_id, client_secret) # Get the application token
application_token = oauth_utility.getApplicationToken()

app = Flask(__name__)

@app.route("/")
def index():
    return render_template('ebay.html')

@app.route('/sendinputdata', methods=['POST'])
def processinputdata():
    data = request.json  # Get the JSON data from the request
    i = 2
    condtapi = ''
    try:
        api = 'https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=SaiVenka-WebAppli-PRD-672a069ab-61e3ce4f&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&keywords='
        api += data['keyword']
        api += '&paginationInput.entriesPerPage=10&sortOrder='
        api += data['sortby']
        api += '&itemFilter(0).name=MinPrice&itemFilter(0).value='
        api += data['pricefrom']
        api += '&itemFilter(0).paramName=Currency&itemFilter(0).paramValue=USD'
        api += '&itemFilter(1).name=MaxPrice&itemFilter(1).value='
        api += data['priceto']
        api += '&itemFilter(1).paramName=Currency&itemFilter(1).paramValue=USD'
        
        if(data['newvalue'] == True):    
            condtapi += '&itemFilter('+str(i)+').name=Condition&itemFilter('+str(i)+').value='
            condtapi += str(1000)
        
        if(data['usedvalue'] == True):    
            condtapi += '&itemFilter('+str(i)+').name=Condition&itemFilter('+str(i)+').value='
            condtapi += str(3000)

        if(data['vergoodvalue'] == True):    
            condtapi += '&itemFilter('+str(i)+').name=Condition&itemFilter('+str(i)+').value='
            condtapi += str(4000)

        if(data['goodvalue'] == True):    
            condtapi += '&itemFilter('+str(i)+').name=Condition&itemFilter('+str(i)+').value='
            condtapi += str(5000)

        if(data['acceptablevalue'] == True):    
            condtapi += '&itemFilter('+str(i)+').name=Condition&itemFilter('+str(i)+').value='
            condtapi += str(6000)
        
        i = i + 1

        api += condtapi

        if(data['returnacceptedvalue'] == True):    
            api += '&itemFilter('+str(i)+').name=ReturnsAcceptedOnly&itemFilter('+str(i)+').value='
            api += str(data['returnacceptedvalue']).lower()
            i = i + 1

        if(data['freevalue'] == True):    
            api += '&itemFilter('+str(i)+').name=FreeShippingOnly&itemFilter('+str(i)+').value='
            api += str(data['freevalue']).lower()
            i = i + 1

        if(data['expedictedvalue'] == True):    
            api += '&itemFilter('+str(i)+').name=Expedited_Shipping_Type&itemFilter('+str(i)+').value='
            api += 'Expedited'
            i = i + 1

        print(api)

        response = requests.get(api)
        # Check if the request was successful (status code 200)
        if response.status_code == 200:
            data = response.json()  # Parse the JSON response
            print("Data received:")
        else:
            print(f"Error: Status code {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
    result = {
        'message': 'Data received successfully from api',
        'data': data,
    }
    return jsonify(result)

@app.route('/getindividualdata', methods=['POST'])
def getsingleitemdetails():
    try:
        data = request.json  # Get the JSON data from the request
        itemid = data['itemid']
        # Create an instance of the OAuthUtility class oauth_utility = OAuthToken(client_id, client_secret) # Get the application token
        get_single_item_url = 'https://open.api.ebay.com/shopping?callname=GetSingleItem&responseencoding=JSON&appid=SaiVenka-WebAppli-PRD-672a069ab-61e3ce4f&siteid=0&version=967&ItemID='
        get_single_item_url += str(itemid)
        get_single_item_url += '&IncludeSelector=Description,Details,ItemSpecifics'
        headers = {
            "X-EBAY-API-IAF-TOKEN": application_token
            }
        # print(get_single_item_url)
        # print(headers)
        response = requests.get(get_single_item_url, headers=headers)
        if response.status_code == 200:
            data = response.json()  # Parse the JSON response
            print("Individual Item Data received:")
        else:
            print(f"Error: Status code {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
    result = {
        'message': 'Data received successfully from individual data api',
        'data': data,
    }
    return jsonify(result)
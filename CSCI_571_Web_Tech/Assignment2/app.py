from flask import Flask, render_template, request, jsonify
import requests
import json
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
            api += '&itemFilter('+str(i)+').name=ExpeditedShippingType&itemFilter('+str(i)+').value='
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
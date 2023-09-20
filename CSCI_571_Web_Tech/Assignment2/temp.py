import requests, json
from ebay_oauth_token import OAuthToken
client_id = "SaiVenka-WebAppli-PRD-672a069ab-61e3ce4f"
client_secret = "PRD-72a069abaed4-bb97-47f0-9d07-3124"
oauth_utility = OAuthToken(client_id, client_secret) # Get the application token
application_token = oauth_utility.getApplicationToken()

def getsingleitemdetails():
    itemid = '125654398756'
    # Create an instance of the OAuthUtility class oauth_utility = OAuthToken(client_id, client_secret) # Get the application token
    get_single_item_url = 'https://open.api.ebay.com/shopping?callname=GetSingleItem&responseencoding=JSON&appid=SaiVenka-WebAppli-PRD-672a069ab-61e3ce4f&siteid=0&version=967&ItemID='
    get_single_item_url += str(itemid)
    get_single_item_url += '&IncludeSelector=Description,Details,ItemSpecifics'

    print('singleitemapi')
    print(get_single_item_url)
    headers = {
       "X-EBAY-API-IAF-TOKEN": application_token
       }
    print(headers)
    response = requests.get(get_single_item_url, headers=headers)

getsingleitemdetails()
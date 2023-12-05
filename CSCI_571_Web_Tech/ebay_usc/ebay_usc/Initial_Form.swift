import SwiftUI

struct SearchFormView: View {
    @State var keyword: String = ""
    @State var selectedCategory: String = "All Categories"
    @State var usedCondition: Bool = false
    @State var newCondition: Bool = false
    @State var unspecifiedCondition: Bool = false
    @State var localPickup: Bool = false
    @State var freeShipping: Bool = false
    @State var distance: String = "10"
    @State var customLocationToggle: Bool = false
    @State var customLocation: String = ""
    @State var showingFavorites: Bool = false
    @State var isShowingErrorMessage: Bool = false
    @State var displayresults: Bool = false
    @State var autopostalCode: String = ""
    @State var pinCodeSuggestions: [String] = []
    @State var isSheetPresented = false
    @State var isLoading: Bool = true
    
    @State var isAddedToWishlist: Bool = false
    @State var isRemovedFromWishlist: Bool = false
    
    func usedtoggle(){usedCondition = !usedCondition}
    func newtoggle(){newCondition = !newCondition}
    func unspecifiedtoggle(){unspecifiedCondition = !unspecifiedCondition}
    func localshipping(){localPickup = !localPickup}
    func freeshipping(){freeShipping = !freeShipping}
    
    var body: some View {
        NavigationView {
//                VStack {
                            Form{
                                HStack{
                                    Text("Keyword: ")
                                    TextField("Required", text: $keyword)
                                    
                                    
                                }
                                Picker("Category", selection: $selectedCategory) {
                                    Text("All").tag("All Categories")
                                    Text("Art").tag("550")
                                    Text("Baby").tag("2948")
                                    Text("Books").tag("261186")
                                    Text("Clothing, Shoes & Accessories").tag("11450")
                                    Text("Computers/Tablets & Networking").tag("58058")
                                    Text("Health & Beauty").tag("26395")
                                    Text("Music").tag("11233")
                                    Text("Video Games & Consoles").tag("1249")
                                }
                                .pickerStyle(MenuPickerStyle())
                                .padding(.vertical, 5)
                                VStack{
                                    HStack{
                                        Text("Condition")
                                        Spacer()
                                    }
                                    HStack{
                                        Spacer()
                                        CheckboxView(isChecked: $usedCondition, label: "Used")
                                        Spacer()
                                        CheckboxView(isChecked: $newCondition, label: "New")
                                        Spacer()
                                        CheckboxView(isChecked: $unspecifiedCondition, label: "Unspecified")
                                        Spacer()
                                    }
                                    .padding(.top)
                                }
                                
                                VStack{
                                    HStack{
                                        Text("Shipping")
                                        Spacer()
                                    }
                                    HStack{
                                        Spacer()
                                        CheckboxView(isChecked: $localPickup, label: "PickUp")
                                        Spacer()
                                        CheckboxView(isChecked: $freeShipping, label: "Free Shipping")
                                        Spacer()
                                    }
                                    .padding(.top)
                                }
                                HStack {
                                    Text("Distance:")
                                    TextField("10", text: $distance)
                                        .keyboardType(.numberPad)
                                }
                                
                                Toggle(isOn: $customLocationToggle) {
                                    Text("Custom Location")
                                }.onAppear {
                                    fetchautoloc()
                                }
                                
                                if customLocationToggle {
                                    HStack{
                                        Text("ZipCode:")
                                        TextField("Required", text: $customLocation)
                                            .onChange(of: customLocation, { oldValue, newValue in
                                                fetchPinCodes()
                                            })
//                                            .onChange(of: customLocation) { _ in
//                                                // Call API when text field content changes
//                                                fetchPinCodes()
//                                            }
                                    }.sheet(isPresented: $isSheetPresented) {
                                        // Display pin code suggestions in a sheet
                                        PinCodeSuggestionsSheet(pinCodes: pinCodeSuggestions, searchText: $customLocation)
                                }
                                }
                                
                                HStack{
                                    Spacer()
                                    Button("Submit"){
                                        printFormData()
                                    }.font(.headline)
                                        .fontWeight(.semibold)
                                        .foregroundColor(.white)
                                        .padding()
                                        .padding(.horizontal, 20)
                                        .background (
                                            Color.blue
                                                .cornerRadius(10)
                                        )
                                        .buttonStyle(BorderlessButtonStyle())
                                    Spacer()
                                    Button("Clear"){
                                        clearFormData()
                                    }.font(.headline)
                                        .fontWeight(.semibold)
                                        .foregroundColor(.white)
                                        .padding()
                                        .padding(.horizontal, 20)
                                        .background (
                                            Color.blue
                                                .cornerRadius(10)
                                        )
                                        .buttonStyle(BorderlessButtonStyle())
                                    Spacer()
                                }
                                
                                Section{
                                    if displayresults {
                                        ResultsView(keyword: $keyword,selectedCategory: $selectedCategory, usedCondition: $usedCondition,newCondition: $newCondition,unspecifiedCondition:$unspecifiedCondition, localPickup: $localPickup,freeShipping:$freeShipping,distance:$distance,customLocationToggle:$customLocationToggle,customLocation:$customLocation,autopostalCode:$autopostalCode,
                                                    isLoading: $isLoading, isAddedToWishlist: $isAddedToWishlist, isRemovedFromWishlist: $isRemovedFromWishlist)
                                    }
                                }
                            }.overlay(
                                    errorMessageView()
                                )
                            .navigationBarTitle("Product Search")
                            .navigationBarTitleDisplayMode(.automatic)
                            .navigationBarItems(trailing: HStack {
                                Spacer()
                                NavigationLink(
                                    destination: FavoritesView(),
                                    label: {
                                        Image(systemName: "heart.circle")
                                            .padding(.horizontal)
                                    }
                                )
                                })
        }.overlay(
            VStack {
                Spacer()
                HStack {
                    if isAddedToWishlist || isRemovedFromWishlist {
                        Text(isAddedToWishlist ? "Added to Wishlist" : "Removed from Wishlist")
                            .foregroundColor(.white)
                            .padding()
                            .padding(.horizontal)
                            .background(Color.black)
                            .cornerRadius(10)
                            .onAppear {
                                DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                                    // Hide the message after 2 seconds
                                    isAddedToWishlist = false
                                    isRemovedFromWishlist = false
                                }
                            }
                            .onTapGesture {
                                isAddedToWishlist = false
                                isRemovedFromWishlist = false
                            }
                    }
                }
            }
    )
        
    }
    
    func fetchPinCodes() {
            guard customLocation.count >= 2 && customLocation.count < 5 else {
                // Skip API call if the text length is less than 3
                return
            }
            guard let url = URL(string: "https://ebayios.uw.r.appspot.com/geonames?zip=\(customLocation)") else {
                return
            }

            URLSession.shared.dataTask(with: url) { data, response, error in
                if let error = error {
                    print("Error: \(error.localizedDescription)")
                    return
                }

                guard let data = data else {
                    print("Error: No data received from the API.")
                    return
                }

                do {
                    // Decode the array of strings directly
                    let decodedResponse = try JSONDecoder().decode([String].self, from: data)

                    // Update the UI on the main thread
                    DispatchQueue.main.async {
                        self.pinCodeSuggestions = decodedResponse
                        if(customLocation.count > 2){
                            self.isSheetPresented = true
                        }
                        else{
                            self.isSheetPresented = false
                        }
                    }
                } catch {
                    print("Error decoding JSON: \(error.localizedDescription)")
                }
            }.resume()
        }

    
    func fetchautoloc() {
            guard let url = URL(string: "https://ipinfo.io/json?token=f141f67b70d679") else {
                return
            }

            URLSession.shared.dataTask(with: url) { data, response, error in
                if let error = error {
                    print("Error: \(error.localizedDescription)")
                    return
                }

                if let data = data {
                    do {
                        let decoder = JSONDecoder()
                        let ipInfo = try decoder.decode(IPInfo.self, from: data)

                        // Extract the postal code
                        let postal = ipInfo.postal

                        // Update the UI on the main thread
                        DispatchQueue.main.async {
                            self.autopostalCode = postal
                        }
                    } catch {
                        print("Error decoding JSON: \(error.localizedDescription)")
                    }
                }
            }.resume()
        }
    
    private func printFormData() {
            if keyword.isEmpty || (customLocationToggle == true && customLocation.isEmpty) {
                isShowingErrorMessage = true
                hideErrorMessageAfterDelay()
            } else {
                isLoading = true
                displayresults = true
//                print("Keyword: \(keyword)")
                print("Category: \(selectedCategory)")
//                print("Used: \(usedCondition)")
//                print("New: \(newCondition)")
//                print("Unspecified: \(unspecifiedCondition)")
//                print("Local Pickup: \(localPickup)")
//                print("Free Shipping: \(freeShipping)")
//                print("Distance: \(distance)")
//                print("Custom Location: \(customLocation)")
//                print("Custom location Toggle: \(customLocationToggle)")
                print("Auto Location: \(autopostalCode)")
            }
        }
    
    
    private func clearFormData() {
        keyword = ""
        isShowingErrorMessage = false
        selectedCategory = "All Categories"
        usedCondition = false
        newCondition = false
        unspecifiedCondition = false
        localPickup = false
        freeShipping = false
        distance = "10"
        customLocationToggle = false
        customLocation = ""
        displayresults = false
        isLoading = true
    }
    
    @ViewBuilder
    private func errorMessageView() -> some View {
        if isShowingErrorMessage {
            VStack{
                Spacer()
                if(keyword.isEmpty){
                    Text("Keyword is mandatory")
                        .foregroundColor(.white)
                        .padding()
                        .padding(.horizontal)
                        .background(Color.black)
                        .cornerRadius(8)
//                        .offset(y: 300)
                        .onAppear{
                                // Hide the error message after 2 seconds
                            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                isShowingErrorMessage = false
                                }
                            }
                }else if(customLocation.isEmpty && customLocationToggle==true){
                    Text("ZipCode is mandatory")
                        .foregroundColor(.white)
                        .padding()
                        .padding(.horizontal)
                        .background(Color.black)
                        .cornerRadius(8)
//                        .offset(y: 350)
                        .onAppear{
                                // Hide the error message after 2 seconds
                            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                isShowingErrorMessage = false
                                }
                            }
                    
                }
            }
            }
        }
        
    private func hideErrorMessageAfterDelay() {
            // Hide the error message after 2 seconds
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                isShowingErrorMessage = false
            }
        }
    }


struct CheckboxView: View {
    @Binding var isChecked: Bool
    var label: String

    var body: some View {
        HStack {
            ZStack {
                RoundedRectangle(cornerRadius: 3)
                    .stroke(isChecked ? Color.blue : Color.gray, lineWidth: 1) // Border for checkbox
                    .background(isChecked ? Color.blue : Color.clear)
                    .frame(width: 15, height: 15)

                if isChecked {
                    Image(systemName: "checkmark")
                        .font(.system(size: 10))
                        .foregroundColor(.white)
                }
            }
            .frame(width: 20, height: 20)

            Text(label)
        }
        .onTapGesture {
            self.isChecked.toggle()
        }
    }
}


struct SearchFormView_Previews: PreviewProvider {
    static var previews: some View {
        SearchFormView()
    }
}

struct IPInfo: Decodable {
    let postal: String
}

struct PinCodeSuggestionsSheet: View {
    var pinCodes: [String]
    @Binding var searchText: String
    @Environment(\.presentationMode) var presentationMode

    var body: some View {
        NavigationView {
            VStack{
                Text("Pincode suggestions")
                    .font(.largeTitle)
                    .cornerRadius(10)
                    .fontWeight(.bold)
                    .padding(.all)
                    .padding(.vertical)
                List(pinCodes, id: \.self) { pinCode in
                    Text(pinCode)
                        .onTapGesture {
                            // Update the search text and dismiss the sheet
                            searchText = pinCode
                            presentationMode.wrappedValue.dismiss()
                        }
                }
                Spacer()
            }
        }
    }
}

/*
call an API when a view loads in swiftui API and show a progress view until the data is fetched, once the data is fetched for each of the product present in the response, show it as a list, when clicked on any item, it should take to a new page and the item name shall become the heading of the page. here is the example response from the API: { "Results": [ { "productid": "285426294099", "productname": "Apple iPhone 7 A1660 (Fully Unlocked) 32GB Silver (Excellent)", "productimage": "https://i.ebayimg.com/thumbs/images/g/66gAAOSw5cRk1twc/s-l140.jpg", "productzipcode": "900**", "productshippingcost": "0.0", "productshippingtype": "Free", "productshippinglocations": "Worldwide", "productshippingexpedited": "false", "productshippingoneday": "false", "productshippinghandling": "1", "productprice": "90.99", "productcondition": "Excellent - Refurbished", "productconditionid": "2010" }]}. ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/


/*
Getting the following error: Error decoding data: The data couldn’t be read because it is missing. ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/


/*
still getting the same error: http://localhost:8080/senddata?keyword=iphone&category=All Categories&distance=10&freeshipping=false&localpickup=false&conditionnew=false&conditionused=false&conditionunspecified=false&from=&autolocation=90037&location=currentlocation {"Results":[{"productid":"285426294099","productname":"Apple iPhone 7 A1660 (Fully Unlocked) 32GB Silver (Excellent)","productimage":"https://i.ebayimg.com/thumbs/images/g/66gAAOSw5cRk1twc/s-l140.jpg","productzipcode":"900**","productshippingcost":"0.0","productshippingtype":"Free","productshippinglocations":"Worldwide","productshippingexpedited":"false","productshippingoneday":"false","productshippinghandling":"1","productprice":"90.99","productcondition":"Excellent - Refurbished","productconditionid":"2010"}
 ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/



/*
this is my code to display the results: var body: some View { VStack{ Text("") .onAppear { fetchData() } NavigationView { List{ Text("Results") .font(.largeTitle) .fontWeight(.bold) if isLoading { HStack(alignment: .center, content: { Spacer() ProgressView("Loading...") Spacer() }) } else { ForEach(products) { product in NavigationLink(destination: ProductDetailView(product: product)) { ProductRow(product: product) } } } } } } } If there are no results, it should display "No results"
ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/



/*
in the product row, i am getting this error: Cannot find 'favoritesManager' in scope
ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/



/*
how to fix this: Cannot convert value of type 'Binding<[String]>.Type' to expected argument type 'Binding<[String]>'
ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/



/*
I need to call a function in ontap and pass a parameter to it
ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/



/*
how to remove an element from a list
ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/



/*
I am getting this error: Type 'WishlistProductsResponse' does not conform to protocol 'Decodable'
ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/



/*
in this function, when I print the raw json data I am getting the following output: Raw JSON Data: {"Status":200,"Wishlist_Products":["{\"_id\":\"655c1a71d4a1c830274fa84c\",\"productid\":\"285426294099\",\"productname\":\"Apple iPhone 7 A1660 (Fully Unlocked) 32GB Silver (Excellent)\",\"productprice\":\"90.99\",\"productshipping\":\"0.0\",\"productimage\":\"https://i.ebayimg.com/thumbs/images/g/66gAAOSw5cRk1twc/s-l140.jpg\",\"productcondition\":\"2010\",\"productzip\":\"900**\"}"
ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/



/*
now from the wishlistproducts exxtract the product id and print it
ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/



/*
when I hit on the heart icon/add to the wishlist a message should appear at the bottom of the screen saying "Added to Wishlist", and when removing an item from the wishlist a similar message must appear on the screen saying "Removed from wishlist" as on overlay
ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/



/*
it should appear at the bottom of the screen in black background and white text using overlay
and this message should also disappear after 2 seconds
ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/



/*
give the code without using zstack
ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/



/*
how to add tab bars at the bottom for a view
ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/



/*
when the view is loaded call the api: http://localhost:8080/getphotos?productname= and store the results in a list Here is the response of the api: [ "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-bluetitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845699311", "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6417/6417788_sd.jpg", "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-7inch-pink?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692923784895", "https://media.wired.com/photos/6332360740fe1e8870aa3bc0/master/pass/iPhone-14-Review-Gear.jpg", "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845702708", "https://media.wired.com/photos/6332360740fe1e8870aa3bc0/3:2/w_2400,h_1600,c_limit/iPhone-14-Review-Gear.jpg", "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-whitetitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845706590", "https://www.apple.com/newsroom/images/product/iphone/standard/Apple-iPhone-14-Plus-blue-hero_inline.jpg.slideshow-xlarge.jpg", "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-finish-select-202207-pink?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1693063160403", "https://upload.wikimedia.org/wikipedia/commons/8/83/IPhones_6%2C_7%2C_8%2C_SE2_black_-_back_camera_view.jpg" ]
ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/



/*
for each link in the photos, display it below each other in a scrollview, and on to of them add a title "Powered by Google" and this title should be fixed, and images should scroll under it
ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/



/*
display a constant text beside the back button in the default ios navigation bar in swiftUI
ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/



/*
how to open a link in safari from a app
ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/



/*
how to display text in two lines and then truncate it and have ellipsis at the end
ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/



/*
when the view loads call the api: http://localhost:8080/getsingleitem?productid= and store the data in to a variables, and display the image in the first half of the screen and the other details below it Here is the response of the API: { "description": "ItemDescription", "title": "Apple iPhone 7 A1660 (Fully Unlocked) 32GB Silver (Excellent)", "ebayurl": "https://www.ebay.com/itm/Apple-iPhone-7-A1660-Fully-Unlocked-32GB-Silver-Excellent-/285426294099", "pictures": [ "https://i.ebayimg.com/00/s/ODMxWDEwMDA=/z/66gAAOSw5cRk1twc/$_12.JPG?set_id=880000500F", "https://i.ebayimg.com/00/s/NjQwWDY0MA==/z/Qg0AAOSwprtk1twc/$_12.JPG?set_id=880000500F", "https://i.ebayimg.com/00/s/NjQwWDY0MA==/z/OdMAAOSw4qFk1twd/$_12.JPG?set_id=880000500F", "https://i.ebayimg.com/00/s/NjQwWDY0MA==/z/LCMAAOSwqsxk1twe/$_12.JPG?set_id=880000500F" ], "Sellername": "wireless-source", "Sellerfeedbackscore": 5237, "sellerpopularity": 97.9, "itemspecifics": [ { "Name": "Brand", "Value": [ "Apple" ] }, { "Name": "MPN", "Value": [ "A1660" ] }, { "Name": "Model", "Value": [ "Apple iPhone 7" ] }, { "Name": "Storage Capacity", "Value": [ "32 GB" ] }, { "Name": "Color", "Value": [ "Silver" ] }, { "Name": "Network", "Value": [ "Unlocked" ] }, { "Name": "Camera Resolution", "Value": [ "12.0 MP" ] }, { "Name": "Screen Size", "Value": [ "4.7 in" ] }, { "Name": "Connectivity", "Value": [ "4G" ] }, { "Name": "Lock Status", "Value": [ "Network Unlocked" ] }, { "Name": "RAM", "Value": [ "2 GB" ] }, { "Name": "Operating System", "Value": [ "iOS" ] }, { "Name": "Model Number", "Value": [ "A1660 (CDMA + GSM)" ] }, { "Name": "Country/Region of Manufacture", "Value": [ "China" ] } ], "storename": "Wireless Source", "storeurl": "https://www.ebay.com/str/wirelesssource", "globalshipping": false, "returnpolicy": "Returns Accepted", "returnmode": "Money Back", "returnwithin": "30 Days", "returnshipcost": "Seller" } The number of items in 'itemspecifics' may vary for different API calls. Please give the data models as well and the entire code
ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/



/*
how to insert a horizontal line in swift ui
ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/



/*
how to check if a boolean variable has a value or not
ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/



/*
display the list of images as a carousel in swiftui
ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/



/*
Display the images only in the first half of the screen and in the next half have a vertical scroll view and display the itemspecifics of the product
I am getting this error: Referencing initializer 'init(_:id:content:)' on 'ForEach' requires that 'ItemSpecific' conform to 'Hashable'
ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/



/*
now, I am not able to see anything on my screen, it is showing a blank screen
ChatGPT, 4 Sep. version, OpenAI, 11 Sep. 2023, chat.openai.com/chat.
*/

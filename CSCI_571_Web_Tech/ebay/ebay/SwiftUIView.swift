//
//  SearchFormView.swift
//  ebay
//
//  Created by Saketh Anne on 2023-12-02.
//

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
    @State var products: [Product] = []
    @State var errorfindingresults: Bool = false
    @State var isAddedToWishlist: Bool = false
    @State var isRemovedFromWishlist: Bool = false
    @State var favoriteproducts: [String] = []
    @State var wishlistProducts: [NewWishlistProduct] = []
    
    func usedtoggle(){usedCondition = !usedCondition}
    func newtoggle(){newCondition = !newCondition}
    func unspecifiedtoggle(){unspecifiedCondition = !unspecifiedCondition}
    func localshipping(){localPickup = !localPickup}
    func freeshipping(){freeShipping = !freeShipping}
    
    var body: some View {
        NavigationView {
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
                                .onChange(of: customLocation) { _ in
                                        fetchPinCodes()
                                }
                        }.sheet(isPresented: $isSheetPresented) {
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
                        if (displayresults){
                            Text("Results")
                                .font(.title)
                                .bold()
                            if(isLoading){
                                VStack(alignment: .center) {
                                    ProgressView()
                                        .id(UUID())
                                    Text("Please wait...")
                                        .foregroundColor(Color.secondary)
                                }
                                .frame(
                                    maxWidth: .infinity,
                                    minHeight: 50,
                                    alignment: .center
                                )
                            } else {
//                                Text("Call the Results View")
                                ResultsView(isLoading: $isLoading, errorfindingresults: $errorfindingresults, favoriteproducts: $favoriteproducts, isAddedToWishlist: $isAddedToWishlist, isRemovedFromWishlist: $isRemovedFromWishlist, products: products)
                            }
                        }
                    }
                }
                .overlay(
                    errorMessageView()
                )
                .navigationBarTitle("Product Search")
                .navigationBarTitleDisplayMode(.automatic)
                .navigationBarItems(trailing:
                    Button(action: {
                        // Your action when the heart button is tapped
                    }) {
                        NavigationLink(destination: FavoritesView().padding(.top, -180)) {
                            Image(systemName: "heart.circle")
                                .padding(.horizontal)
                        }
                    }
                )
        }
        
    }
    
    private func printFormData() {
            if keyword.isEmpty || (customLocationToggle == true && customLocation.isEmpty) {
                isShowingErrorMessage = true
                hideErrorMessageAfterDelay()
            } else {
                isLoading = true
                displayresults = true
                fetchData()
                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                    isLoading = false
                }
            }
        }
    
    func fetchData() {
        var apiurl = "https://ebayios.uw.r.appspot.com/senddata?keyword=\(keyword)&category=\(selectedCategory)&distance=\(distance)&freeshipping=\(freeShipping)&localpickup=\(localPickup)&conditionnew=\(newCondition)&conditionused=\(usedCondition)&conditionunspecified=\(unspecifiedCondition)&from=\(customLocation)&autolocation=\(autopostalCode)"
        
        if customLocationToggle == true{
            apiurl += "&location=otherlocation"
        }
        else{
            apiurl += "&location=currentlocation"
        }
        print(apiurl)
        guard let url = URL(string: apiurl) else { return }

        URLSession.shared.dataTask(with: url) { data, response, error in
            if let error = error {
                print("Error fetching data: \(error.localizedDescription)")
                return
            }

            guard let data = data else {
                print("No data received")
                return
            }

            do {
                guard let jsonObject = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any],
                      let resultsArray = jsonObject["Results"] as? [[String: Any]] else {
                    print("Failed to parse JSON")
                    self.errorfindingresults = true
                    self.isLoading = false
                    return
                }

                let products = resultsArray.compactMap { resultDict in
                    return Product(
                        productid: resultDict["productid"] as? String ?? "",
                        productname: resultDict["productname"] as? String ?? "",
                        productimage: resultDict["productimage"] as? String ?? "",
                        productzipcode: resultDict["productzipcode"] as? String ?? "",
                        productshippingcost: resultDict["productshippingcost"] as? String ?? "",
                        productshippingtype: resultDict["productshippingtype"] as? String ?? "",
                        productshippinglocations: resultDict["productshippinglocations"] as? String ?? "",
                        productshippingexpedited: resultDict["productshippingexpedited"] as? String ?? "",
                        productshippingoneday: resultDict["productshippingoneday"] as? String ?? "",
                        productshippinghandling: resultDict["productshippinghandling"] as? String ?? "",
                        productprice: resultDict["productprice"] as? String ?? "",
                        productcondition: resultDict["productcondition"] as? String ?? "",
                        productconditionid: resultDict["productconditionid"] as? String ?? ""
                    )
                }

                DispatchQueue.main.async {
                    self.products = products
                    self.isLoading = false
                }
            } catch {
                print("Error parsing JSON: \(error.localizedDescription)")
                errorfindingresults = true
                print(String(data: data, encoding: .utf8) ?? "Unable to print data")
            }
        }.resume()
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
    
    func fetchPinCodes() {
            guard customLocation.count >= 2 && customLocation.count < 5 else {
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
                        if(customLocation.count >= 3){
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
                        .onAppear{
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
                        .onAppear{
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

struct SearchFormView_Previews: PreviewProvider {
    static var previews: some View {
        SearchFormView()
    }
}

struct CheckboxView: View {
    @Binding var isChecked: Bool
    var label: String
    
    var body: some View {
        HStack {
            Image(systemName: isChecked ? "checkmark.square" : "square")
                .resizable()
                .frame(width: 20, height: 20)
            Text(label)
        }
        .onTapGesture {
            isChecked.toggle()
        }
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

struct ProductResponse: Codable {
    var results: [Product]
}

struct Product: Codable, Identifiable {
    var id: String { productid }
    var productid: String
    var productname: String
    var productimage: String
    var productzipcode: String
    var productshippingcost: String
    var productshippingtype: String
    var productshippinglocations: String
    var productshippingexpedited: String
    var productshippingoneday: String
    var productshippinghandling: String
    var productprice: String
    var productcondition: String
    var productconditionid: String
    
    enum CodingKeys: String, CodingKey {
            case productid, productname, productimage, productzipcode, productshippingcost, productshippingtype, productshippinglocations, productshippingexpedited, productshippingoneday, productshippinghandling, productprice, productcondition, productconditionid
        }
}

struct ResultsView: View {
    @Binding var isLoading: Bool
    @Binding var errorfindingresults: Bool
    @Binding var favoriteproducts: [String]
    @Binding var isAddedToWishlist: Bool
    @Binding var isRemovedFromWishlist: Bool
    
    var products: [Product]
    
    var body: some View {
        VStack{
            if errorfindingresults {
                HStack(alignment: .center, content: {
                    Spacer()
                    Text("No results found")
                        .foregroundColor(.red)
                    Spacer()
                    
                })
            } else {
                List {
                ForEach(products) { product in
                    NavigationLink(destination: ProductDetailView(productid: product.productid))
                        {
                            HStack{
                                HStack{
                                    AsyncImage(url: URL(string: product.productimage)) { image in
                                        image.resizable()
                                    } placeholder: {
                                        ProgressView()
                                    }
                                    .frame(width: 80, height: 85)
                                    .cornerRadius(8)
                                }
                                VStack(alignment: .leading) {
                                    Spacer()
                                    Text(product.productname)
                                        .lineLimit(1)
                                        .truncationMode(.tail)
                                        .foregroundColor(.primary)
                                    HStack{
                                        VStack(alignment: .leading){
                                            Spacer()
                                            Text("$\(product.productprice)")
                                                .foregroundColor(.blue)
                                                .fontWeight(/*@START_MENU_TOKEN@*/.bold/*@END_MENU_TOKEN@*/)
                                            Spacer()
                                            Text(product.productshippingcost == "0.0" ? "FREE SHIPPING" : "$\(product.productshippingcost)" )
                                                .foregroundColor(.secondary)
                                            Spacer()
                                        }
                                        Spacer()
                                        Image(systemName: favoriteproducts.contains(product.productid) ? "heart.fill" : "heart")
                                            .foregroundColor(.red)
                                            .font(.title)
                                            .onTapGesture {
                                                checkandaddwishlist(product: product)
                                                            }
                                    }
                                    HStack{
                                        Text(product.productzipcode)
                                            .foregroundColor(.secondary)
                                        Spacer()
                                        Text(product.productconditionid == "1000" ? "NEW" : product.productconditionid == "2000" ? "REFURBISHED" : product.productconditionid == "2500" ? "REFURBISHED" : product.productconditionid == "3000" ? "USED" : product.productconditionid == "4000" ? "USED" : product.productconditionid == "5000" ? "USED" :product.productconditionid == "6000" ? "USED" : "N/A")
                                            .foregroundColor(.secondary)
                                    }
                                    Spacer()
                                }
                            }
                        }
                    Divider()
                    }
                }
            }
        }
    }
    
    func checkandaddwishlist(product: Product){
        if(favoriteproducts.contains(product.productid)){
            isRemovedFromWishlist = true
            favoriteproducts.removeAll{ $0 == product.productid }
            guard let url = URL(string: "https://ebayios.uw.r.appspot.com/deletefav?productid=\(product.productid)") else {
                return
                }
            URLSession.shared.dataTask(with: url) { (data, response, error) in
            if let error = error {
                print("Error: \(error.localizedDescription)")
                    return
                }
            guard let data = data else {
                print("No data received")
                return
                }
        }.resume()
        }
        else{
            isAddedToWishlist = true
            favoriteproducts.append(product.productid)
            guard let url = URL(string: "https://ebayios.uw.r.appspot.com/addfav?productid=\(product.productid)&product_name=\(product.productname)&product_price=\(product.productprice)&product_shipping=\(product.productshippingcost)&product_img_url=\(product.productimage)&product_zip=\(product.productzipcode)&product_condition=\(product.productconditionid)") else {
                return
                }
            URLSession.shared.dataTask(with: url) { (data, response, error) in
            if let error = error {
                print("Error: \(error.localizedDescription)")
                    return
                }
            guard let data = data else {
                print("No data received")
                return
                }
        }.resume()
        }
    }

}

struct WishListAPIResponse: Decodable {
    let status: Int
    let wishlistProducts: [String]

    enum CodingKeys: String, CodingKey {
        case status = "Status"
        case wishlistProducts = "Wishlist_Products"
    }
}

struct NewWishlistProduct: Identifiable {
    let id = UUID()
    let _id: String
    let productid: String
    let productname: String
    let productprice: String
    let productshipping: String
    let productimage: String
    let productcondition: String
    let productzip: String

    // Computed property for inner product name
    var innerProductName: String {
        processInnerJSONStringNew(productname)?.productname ?? ""
    }
}
// Function to process the inner JSON strings manually
    func processInnerJSONStringNew(_ jsonString: String) -> NewWishlistProduct? {
        // Remove the escaping characters and create a valid JSON string
        let cleanedString = jsonString.replacingOccurrences(of: "\\\"", with: "\"")

        guard let jsonData = cleanedString.data(using: .utf8) else {
            return nil
        }

        do {
            let json = try JSONSerialization.jsonObject(with: jsonData, options: []) as? [String: Any]

            // Extract values manually from the JSON dictionary
            let _id = json?["_id"] as? String ?? ""
            let productid = json?["productid"] as? String ?? ""
            let productname = json?["productname"] as? String ?? ""
            let productprice = json?["productprice"] as? String ?? ""
            let productshipping = json?["productshipping"] as? String ?? ""
            let productimage = json?["productimage"] as? String ?? ""
            let productcondition = json?["productcondition"] as? String ?? ""
            let productzip = json?["productzip"] as? String ?? ""

            return NewWishlistProduct(
                _id: _id,
                productid: productid,
                productname: productname,
                productprice: productprice,
                productshipping: productshipping,
                productimage: productimage,
                productcondition: productcondition,
                productzip: productzip
            )
        } catch {
            print("Error processing inner JSON: \(error.localizedDescription)")
            return nil
        }
    }

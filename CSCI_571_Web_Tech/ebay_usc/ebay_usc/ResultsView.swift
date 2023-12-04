//
//  ResultsView.swift
//  ebay_usc
//
//  Created by Saketh Anne on 2023-11-20.
//

import SwiftUI
import Foundation

struct ResultsView: View {
    @Binding var keyword: String
    @Binding var selectedCategory: String
    @Binding var usedCondition: Bool
    @Binding var newCondition: Bool
    @Binding var unspecifiedCondition: Bool
    @Binding var localPickup: Bool
    @Binding var freeShipping: Bool
    @Binding var distance: String
    @Binding var customLocationToggle: Bool
    @Binding var customLocation: String
    @Binding var autopostalCode: String

    @State var errorfindingresults: Bool = false
    @State var isAddedToWishlist: Bool = false
    @State var isRemovedFromWishlist: Bool = false
    @State var isLoading: Bool = true
    @State var products: [Product] = []
    @State var favoriteproducts: [String] = []
    @State var wishlistProducts: [NewWishlistProduct] = []
    
    
    var body: some View {
//        NavigationView {
            List {
                Text("Results")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .onAppear {
                        fetchData()
                        getwishlistItems()
                    }

                if isLoading {
                    HStack(alignment: .center, content: {
                        Spacer()
                        ProgressView()
                        Spacer()
                    })
                } else {
                    if errorfindingresults {
                        HStack(content: {
                            Text("No results found.")
                                .foregroundColor(.red)
                            Spacer()
                        })
                    } else {
                        ForEach(products) { product in
                            NavigationLink(destination: ProductDetailView(favoriteproducts: $favoriteproducts, product: product)) {
                                ProductRow(product: product, favoriteproducts: $favoriteproducts, isAddedToWishlist: $isAddedToWishlist, isRemovedFromWishlist: $isRemovedFromWishlist)
                            }
                        }
                    }
                }
            }
        .overlay(
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
//        }
}
    
    func getwishlistItems() {
        guard let url = URL(string: "https://ebayios.uw.r.appspot.com/getfavs") else {
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
        do {
        let decoder = JSONDecoder()
        let apiResponse = try decoder.decode(WishListAPIResponse.self, from: data)
//        if let jsonString = String(data: data, encoding: .utf8) {
//                print("Raw JSON Data: \(jsonString)")
//            }
        let processedProducts = apiResponse.wishlistProducts.compactMap { product in
            processInnerJSONStringNew(product)
            }
//        print("JSON Data \(processedProducts)")
        DispatchQueue.main.async {
            self.wishlistProducts = processedProducts
//            print(self.wishlistProducts)
            }
            // Extract product ids and print them
            let productIds = processedProducts.map { $0.productid }
            favoriteproducts.append(contentsOf: productIds)
        } catch {
            print("Error decoding JSON: \(error.localizedDescription)")
        }
    }.resume()
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


#Preview {
    ResultsView(
        keyword: .constant("iphone"),
        selectedCategory: .constant("All Categories"),
        usedCondition: .constant(false),
        newCondition: .constant(false),
        unspecifiedCondition: .constant(false),
        localPickup: .constant(false),
        freeShipping: .constant(false),
        distance:.constant("10"),
        customLocationToggle: .constant(false),
        customLocation:.constant(""),
        autopostalCode:.constant("90037")
    
    )
}


struct ProductRow: View {
    let product: Product
    @Binding var favoriteproducts: [String]
    @Binding var isAddedToWishlist: Bool
    @Binding var isRemovedFromWishlist: Bool

    var body: some View {
        HStack{
            AsyncImage(url: URL(string: product.productimage)) { image in
                image.resizable()
            } placeholder: {
                ProgressView()
            }
            .frame(width: 80, height: 95)
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
        Image(systemName: favoriteproducts.contains(product.productid) ? "heart.fill" : "heart")
            .foregroundColor(.red)
            .font(.title)
            .onTapGesture {
                checkandaddwishlist(product: product)
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
//            guard let data = data else {
//                print("No data received")
//                return
//                }
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
//            guard let data = data else {
//                print("No data received")
//                return
//                }
        }.resume()
        }
    }
    
    }


struct ProductDetailView: View {
    @State var productviewisloading: Bool = true
    @State var photos: [String] = []
    @State var sortOptions: [String] = ["Default", "Name", "Price", "Shipping", "Days Left"]
    @State var selectedSortOption: String = "Default"
        
    @State var sortOrders: [String] = ["Ascending", "Descending"]
    @State var selectedSortOrder: String = "Ascending"
        
    @State var similarItems: [SimilarItem] = []
    @State var productData: ProductData?
    
    @Binding var favoriteproducts: [String]
    let product: Product
    
    var body: some View {
        TabView{
            VStack{
                if let productData = productData{Text("")
//                    ScrollView {
                        VStack(alignment: .leading){
                            TabView {
                                    ForEach(productData.pictures, id: \.self) { imageUrl in
                                                // Assuming you have a function to load images from URLs
                                                AsyncImage(url: URL(string: imageUrl)) { phase in
                                                    switch phase {
                                                    case .success(let image):
                                                        image
                                                            .resizable()
                                                            .frame(maxWidth:200, maxHeight: 250)
                                                    case .empty:
                                                        ProgressView()
                                                            .progressViewStyle(CircularProgressViewStyle())
                                                    case .failure:
                                                        // Error view
                                                        Image(systemName: "exclamationmark.icloud.fill")
                                                    @unknown default:
                                                        // Handle future cases
                                                        EmptyView()
                                                    }
                                                }
                                            }
                                        }
                            .tabViewStyle(PageTabViewStyle(indexDisplayMode: .automatic))
                            .background(Color.clear)
                                        .frame(maxWidth:.infinity, minHeight: 350)
                                        .cornerRadius(15)
                                    .indexViewStyle(PageIndexViewStyle(backgroundDisplayMode: .always))
                                .padding(.horizontal,30)
                            Text(productData.title)
                                .font(.headline)
                                .padding(.horizontal,20)
                                .padding(.vertical)
                            Text("$\(product.productprice)")
                                .font(.headline)
                                .fontWeight(.bold)
                                .foregroundColor(Color.blue)
                                .padding(.horizontal,20)
                                .padding(.bottom, 10)
                            HStack{
                                Image(systemName: "magnifyingglass")
                                    .foregroundColor(.black)
                                Text("Description")
                                Spacer()
                            }.padding(.horizontal,20)
                                .padding(.bottom,10)
                            ScrollView {
                                ForEach(productData.itemspecifics!, id: \.self) { spec in
                                    HStack(alignment: .center){
                                        Text(spec.Name)
                                            .frame(width: 150, alignment: .leading)
                                        Spacer()
                                        Text(spec.Value.first!)
                                            .font(.body)
                                            .frame(maxWidth: .infinity, alignment: .leading)
//                                    ForEach(spec.Value, id: \.self) { value in
    //                                        Text(value)
    //                                            .font(.body)
    //                                            .frame(maxWidth: .infinity, alignment: .trailing)
    //                                            .lineLimit(1)
    //                                            .truncationMode(.tail)
    //                                        }
                                    }.padding(.vertical,-4)
                                    .padding(.horizontal,20)
                                    Divider()
                                }
                            }
                        }
//                    }
                }else {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle())
                        }
                    
            }.tabItem {
                Image(systemName: "info.circle.fill")
                Text("Info")
            }
            .padding(.top, -130)
            ScrollView{
                if let productData = productData{Text("")
                    VStack{
                        Divider()
                        HStack{
                            Image(systemName: "storefront")
                                .foregroundColor(.black)
                            Text("Seller")
                            Spacer()
                        }
                        Divider()
                        HStack(alignment:.center){
                            Text(productData.storename!.count > 0 ? "Store Name" : "")
                                .frame(width: 150, alignment: .center)
                            Spacer()
                            Button(action: {
                                if let url = URL(string: productData.storeurl!) {
                                    UIApplication.shared.open(url)
                                }
                            }) {
                                Text(productData.storename!.count > 0 ? productData.storename! : "")
                                    .foregroundColor(.blue)
                            }
                            .frame(width: 150, alignment: .center)
                        }.padding(.horizontal,30)
                        HStack{
                            Text(productData.sellerfeedbackscore! > 0 ? "Feedback Score" : "")
                                .frame(width: 150, alignment: .center)
                            Spacer()
                            Text(productData.sellerfeedbackscore! > 0 ? "\(productData.sellerfeedbackscore!)" : "")
                                .frame(width: 150, alignment: .center)
                        }.padding(.horizontal,30)
                        HStack{
                            Text(productData.sellerpopularity! > 0 ? "Popularity" : "")
                                .frame(width: 150, alignment: .center)
                            Spacer()
                            Text(productData.sellerpopularity! > 0 ? "\(productData.sellerpopularity!)" : "")
                                .frame(width: 150, alignment: .center)
                        }.padding(.horizontal,30)
                            .padding(.bottom,15)
                        Divider()
                        HStack{
                            Image(systemName: "sailboat")
                                .foregroundColor(.black)
                            Text("Shipping Info")
                            Spacer()
                        }
                        Divider()
                        HStack{
                            Text(product.productshippingcost.count > 0 ? "Shipping Cost" : "")
                                .frame(width: 150, alignment: .center)
                            Spacer()
                            Text(product.productshippingcost.count > 0 ? product.productshippingcost == "0.0" ? "Free Shipping" : "\(product.productshippingcost)" : "")
                                .frame(width: 150, alignment: .center)
                        }.padding(.horizontal,30)
                        HStack{
                            Text("Global Shipping")
                                .frame(width: 150, alignment: .center)
                            Spacer()
                            Text(productData.globalshipping! ? "Yes" : "No")
                                .frame(width: 150, alignment: .center)
                        }.padding(.horizontal,30)
                        HStack{
                            Text(product.productshippinghandling.count > 0 ? "Handling Time" : "")
                                .frame(width: 150, alignment: .center)
                            Spacer()
                            Text(product.productshippinghandling.count > 0 ? product.productshippinghandling == "1" ? "\(product.productshippinghandling) Day" : "\(product.productshippinghandling) Days" : "")
                                .frame(width: 150, alignment: .center)
                        }.padding(.horizontal,30)
                            .padding(.bottom,15)
                        Divider()
                        HStack{
                            Image(systemName: "return")
                                .foregroundColor(.black)
                            Text("Return policy")
                            Spacer()
                        }
                        Divider()
                        HStack{
                            Text(productData.returnpolicy!.count > 0 ? "Policy" : "")
                                .frame(width: 150, alignment: .center)
                            Spacer()
                            Text(productData.returnpolicy!.count > 0 ? productData.returnpolicy! : "")
                                .frame(width: 150, alignment: .center)
                        }.padding(.horizontal,30)
                        HStack{
                            Text(productData.returnmode!.count > 0 ? "Refund Mode" : "")
                                .frame(width: 150, alignment: .center)
                            Spacer()
                            Text(productData.returnmode!.count > 0 ? "Money Back" : "")
                                .frame(width: 150, alignment: .center)
                                .lineLimit(1)
                                .truncationMode(.tail)
                        }.padding(.horizontal,30)
                        HStack{
                            Text(productData.returnwithin!.count > 0 ? "Refund Within" : "")
                                .frame(width: 150, alignment: .center)
                            Spacer()
                            Text(productData.returnwithin!.count > 0 ? productData.returnwithin! : "")
                                .frame(width: 150, alignment: .center)
                        }.padding(.horizontal,30)
                        HStack{
                            Text(productData.returnshipcost!.count > 0 ? "Shipping Cost Paid By" : "")
                                .frame(maxWidth:.infinity , alignment: .center)
                            Spacer()
                            Text(productData.returnshipcost!.count > 0 ? productData.returnshipcost! : "")
                                .frame(width: 150, alignment: .center)
                        }.padding(.horizontal,30)
                            .padding(.bottom,15)
                    }.offset(y: 30)
                }else {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle())
                }
            }
            .tabItem {
                Image(systemName: "shippingbox.fill")
                Text("Shipping")
            }
            VStack{
                HStack{
                    Spacer()
                    Text("Powered by ")
                        .font(.headline)
                        .onAppear {
                        }
                    Image("google")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 100, height: 100)
                    Spacer()
                }
                .padding(.all)
                ScrollView{
                    VStack{
                        ForEach(photos, id: \.self) { photoURL in
                            AsyncImage(url: URL(string: photoURL)) { image in
                                image.resizable()
                            }
                        placeholder: {
//                                ProgressView()
                            }
                            .frame( idealWidth: 220, maxWidth: 250, maxHeight: 300)
                        }
                    }
                    .padding(.horizontal,30)
                }
            }
            .padding(.top, -50)
            .tabItem {
                Image(systemName: "photo.stack.fill")
                Text("Photos")
            }
            VStack{
                HStack{
                    Text("Sort By")
                        .font(.headline)
                        .fontWeight(.bold)
                    Spacer()
                }.padding(.horizontal, 20)
                
                        Picker("Sort By", selection: $selectedSortOption) {
                            ForEach(sortOptions, id: \.self) { option in
                                Text(option)
                            }
                        }
                        .pickerStyle(SegmentedPickerStyle())
                        .padding()
                if(selectedSortOption=="Default"){
                    Text("")
                }
                else{
                    HStack{
                        Text("Order")
                            .font(.headline)
                            .fontWeight(.bold)
                        Spacer()
                    }.padding(.horizontal, 20)
                    
                    Picker("Sort Order", selection: $selectedSortOrder) {
                        ForEach(sortOrders, id: \.self) { order in
                            Text(order)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                .padding()
                }
                        
                ScrollView {
                                LazyVGrid(columns: [GridItem(), GridItem()], spacing: 16) {
                                    ForEach(sortedSimilarItems()) { item in
                                        SimilarItemView(item: item)
                                            .padding(.horizontal,10)
                                    }
                                }
                                
                            }
            }
            .tabItem {
                Image(systemName: "list.bullet.indent")
                Text("Similar")
            }
            .padding(.top, -35)
        }.onAppear{
            productphotos()
            getSimilarItems()
            loadData()
            productviewisloading = false
        }
        
        .toolbarBackground(Color.secondary)
        .toolbarTitleDisplayMode(.automatic)
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarItems(trailing:
                            HStack {
                                Spacer()
                                Button(action: {
                                    if let url = URL(string: "https://www.facebook.com/share.php?u=\(productData!.ebayurl)") {
                                                    UIApplication.shared.open(url)
                                                }
                                }) {
                                    Image("fb")
                                        .resizable()
                                        .frame(width: 25, height: 25)
                                }

                                Button(action: {
                                    // Action for the second button
                                    print("Second Button Tapped")
                                }) {
                                    Image(systemName: favoriteproducts.contains(product.productid) ? "heart.fill" : "heart")
                                        .foregroundColor(.red)
                                        .font(.headline)
                                        .onTapGesture {
                                            checkandaddwishlistProduct(product: product)
                                                        }
                                    
                                }
                            }
                        )
        
    }
    
    
    func checkandaddwishlistProduct(product: Product){
        if(favoriteproducts.contains(product.productid)){
            favoriteproducts.removeAll{ $0 == product.productid }
            guard let url = URL(string: "https://ebayios.uw.r.appspot.com/deletefav?productid=\(product.productid)") else {
                return
                }
            URLSession.shared.dataTask(with: url) { (data, response, error) in
            if let error = error {
                print("Error: \(error.localizedDescription)")
                    return
                }
//            guard let data = data else {
//                print("No data received")
//                return
//                }
        }.resume()
        }
        else{
            favoriteproducts.append(product.productid)
            guard let url = URL(string: "https://ebayios.uw.r.appspot.com/addfav?productid=\(product.productid)&product_name=\(product.productname)&product_price=\(product.productprice)&product_shipping=\(product.productshippingcost)&product_img_url=\(product.productimage)&product_zip=\(product.productzipcode)&product_condition=\(product.productconditionid)") else {
                return
                }
            URLSession.shared.dataTask(with: url) { (data, response, error) in
            if let error = error {
                print("Error: \(error.localizedDescription)")
                    return
                }
//            guard let data = data else {
//                print("No data received")
//                return
//                }
        }.resume()
        }
    }
    
    func getSimilarItems() {
        guard let url = URL(string: "https://ebayios.uw.r.appspot.com/getsimilaritems?productid=\(product.productid)") else {
                return
            }

            URLSession.shared.dataTask(with: url) { data, response, error in
                if let data = data {
                    do {
                        let decoder = JSONDecoder()
                        let items = try decoder.decode([SimilarItem].self, from: data)
                        DispatchQueue.main.async {
                            self.similarItems = items
                        }
                    } catch {
                        print("Error decoding JSON: \(error.localizedDescription)")
                    }
                }
            }.resume()
        }
    
    // Function to sort similar items based on selected options
        func sortedSimilarItems() -> [SimilarItem] {
            var sortedItems = similarItems

            switch selectedSortOption {
            case "Name":
                sortedItems.sort { $0.name < $1.name }
            case "Price":
                sortedItems.sort { Double($0.price) ?? 0 < Double($1.price) ?? 0 }
            case "Shipping":
                sortedItems.sort { Double($0.shipping) ?? 0 < Double($1.shipping) ?? 0 }
            case "Remaining":
                sortedItems.sort { Int($0.remaining) ?? 0 < Int($1.remaining) ?? 0 }
            default:
                break
            }

            if selectedSortOrder == "Descending" {
                sortedItems.reverse()
            }

            return sortedItems
        }
    
    func productphotos() {
        guard let url = URL(string: "https://ebayios.uw.r.appspot.com/getphotos?productname=\(product.productname)") else {
                return
            }

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
                    let decoder = JSONDecoder()
                    let photoURLs = try decoder.decode([String].self, from: data)
                    DispatchQueue.main.async {
                        self.photos = photoURLs
                        print(photos)
                    }
                } catch {
                    print("Error decoding JSON: \(error.localizedDescription)")
                }
            }.resume()
        }
    
    func loadData() {
        guard let url = URL(string: "https://ebayios.uw.r.appspot.com/getsingleitem?productid=\(product.productid)") else {
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
            do {
                let decoder = JSONDecoder()
                let productData = try decoder.decode(ProductData.self, from: data)
                DispatchQueue.main.async {
                    self.productData = productData
                }
            } catch {
                print("Error decoding JSON: \(error.localizedDescription)")
            }
        }.resume()
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

struct SimilarItem: Decodable, Identifiable {
    let id: String
    let name: String
    let picture: String
    let price: String
    let shipping: String
    let remaining: String
    let link: String
}

struct SimilarItemView: View {
    let item: SimilarItem
    
    var body: some View {
        VStack {
            // Image
            RemoteImage(url: item.picture)
                .aspectRatio(contentMode: .fit)
                .frame(height: 200)
                .cornerRadius(15)
            
            // Name
            Text(item.name)
                .font(.headline)
                .multilineTextAlignment(.leading)
                .lineLimit(2)
                .truncationMode(.tail)
                .padding(.horizontal, 5)
            
            HStack{
                // Shipping
                Text("$\(item.shipping)")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Spacer()
                // Remaining
                Text("\(item.remaining) Days Left")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }.padding(.horizontal, 5)
                .padding(.bottom, 5)
            HStack{
                Spacer()
                // Price
                Text("$\(item.price)")
                    .font(.headline)
                    .foregroundColor(.blue)
                    .fontWeight(.bold)
            }.padding(.horizontal, 5)
                .padding(.bottom,5)
            
        }
        .frame(width: 160, height: 310)
        .padding(.all, 5)
        .background(
                    RoundedRectangle(cornerRadius: 20)
                        .fill(Color.gray.opacity(0.1))
                )
        .padding(.horizontal, 3)
        .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(Color.gray, lineWidth: 1)
                )
    }
}

struct RemoteImage: View {
    let url: String

    var body: some View {
        if let imageUrl = URL(string: url), let imageData = try? Data(contentsOf: imageUrl), let uiImage = UIImage(data: imageData) {
            Image(uiImage: uiImage)
                .resizable()
                .cornerRadius(15)
        } else {
            Image(systemName: "photo")
                .resizable()
        }
    }
}

struct ProductData: Decodable {
    let description: String?
    let title: String
    let ebayurl: String
    let pictures: [String]
    let sellername: String?
    let sellerfeedbackscore: Int?
    let sellerpopularity: Double?
    let itemspecifics: [ItemSpecific]?
    let storename: String?
    let storeurl: String?
    let globalshipping: Bool?
    let returnpolicy: String?
    let returnmode: String?
    let returnwithin: String?
    let returnshipcost: String?

    private enum CodingKeys: String, CodingKey {
        case description
        case title
        case ebayurl
        case pictures
        case sellername
        case sellerfeedbackscore
        case sellerpopularity
        case itemspecifics
        case storename
        case storeurl
        case globalshipping
        case returnpolicy
        case returnmode
        case returnwithin
        case returnshipcost
    }
}

struct ItemSpecific: Decodable, Hashable {
    let Name: String
    let Value: [String]
}

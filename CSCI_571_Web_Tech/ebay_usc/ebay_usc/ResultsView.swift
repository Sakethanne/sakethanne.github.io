//
//  ResultsView.swift
//  ebay_usc
//
//  Created by Saketh Anne on 2023-11-20.
//

import SwiftUI

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
    @State var isLoading: Bool = true
    @State var products: [Product] = []
    
    
    var body: some View {
        VStack {
            Text("")
                .onAppear {
                    fetchData()
                }
            NavigationView {
                List {
                    Text("Results")
                        .font(.largeTitle)
                        .fontWeight(.bold)

                    if isLoading {
                        HStack(alignment: .center, content: {
                            Spacer()
                            ProgressView("Loading...")
                            Spacer()
                        })
                    } else {
                        if errorfindingresults {
                            HStack(alignment: /*@START_MENU_TOKEN@*/.center/*@END_MENU_TOKEN@*/, content: {
                                Spacer()
                                Text("No results found")
                                    .foregroundColor(.red)
                                Spacer()
                            })
                        } else {
                            ForEach(products) { product in
                                NavigationLink(destination: ProductDetailView(product: product)) {
                                    ProductRow(product: product)
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    func fetchData() {
        var apiurl = "http://localhost:8080/senddata?keyword=\(keyword)&category=\(selectedCategory)&distance=\(distance)&freeshipping=\(freeShipping)&localpickup=\(localPickup)&conditionnew=\(newCondition)&conditionused=\(usedCondition)&conditionunspecified=\(unspecifiedCondition)&from=\(customLocation)&autolocation=\(autopostalCode)"
        
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

#Preview {
    ResultsView(
        keyword: .constant("dasdassadasd"),
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

    var body: some View {
        HStack{
            AsyncImage(url: URL(string: product.productimage)) { image in
                image.resizable()
            } placeholder: {
                ProgressView()
            }
            .frame(width: 90, height: 100)
            .cornerRadius(8)
        }
        VStack(alignment: .leading) {
            Text(product.productname)
                .lineLimit(1)
                .truncationMode(.tail)
                .foregroundColor(.primary)
            Spacer()
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
                Image(systemName: "heart")
                    .foregroundColor(.red)
                    .font(.title)
                
            }
            Spacer()
            HStack{
                Text(product.productzipcode)
                .foregroundColor(.secondary)
                Spacer()
                Text(product.productconditionid == "1000" ? "NEW" : product.productconditionid == "2000" ? "REFURBISHED" : product.productconditionid == "2500" ? "REFURBISHED" : product.productconditionid == "3000" ? "USED" : product.productconditionid == "4000" ? "USED" : product.productconditionid == "5000" ? "USED" :product.productconditionid == "6000" ? "USED" : "N/A")
                    .foregroundColor(.secondary)
            }
        }
        .padding()
    }
}

struct ProductDetailView: View {
    let product: Product

    var body: some View {
        VStack {
            Text(product.productname)
                .font(.title)
                .padding()
            // Add other details as needed
        }
        .navigationTitle(product.productname)
        .navigationBarTitleDisplayMode(.inline)
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

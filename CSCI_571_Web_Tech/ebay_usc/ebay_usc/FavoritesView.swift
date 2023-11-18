//
//  FavoritesView.swift
//  ebay_usc
//
//  Created by Saketh Anne on 2023-11-17.
//

import SwiftUI

struct FavoritesView: View {
    
    @State var wishlistProducts: [WishlistProduct] = []
    @State var isFetchingData = false
    
    var body: some View {
        NavigationView {
            
                if isFetchingData {
                    ProgressView("Loading...")
                    .progressViewStyle(CircularProgressViewStyle())
                    } else {
                        
                            List {
                                HStack{
                                    Text("Wishlist total(\(wishlistProducts.count)) Items:")
                                            .font(.headline)
                                    Spacer()
                                    Text("$\(String(format: "%.2f", totalCost))")
                                            .font(.headline)
                                }
                                ForEach(wishlistProducts) { product in
                                    WishlistProductRow(product: product)
                                }
                                    .onDelete(perform: deleteItem)
                            }.listStyle(InsetGroupedListStyle())
                            .navigationBarTitle("Favorites")
                            .navigationBarTitleDisplayMode(.automatic)
                }
        }
        .onAppear {
            getwishlistItems()
        }
    }
    
    var totalCost: Double {
        wishlistProducts.reduce(0) { $0 + (Double($1.productprice) ?? 0.0) } // Assuming productprice is a String
        }
        
    func deleteItem(at offsets: IndexSet) {
        for index in offsets {
                let deletedProductId = wishlistProducts[index].productid
            guard let url = URL(string: "http://localhost:8080/deletefav?productid=\(deletedProductId)") else {
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
        wishlistProducts.remove(atOffsets: offsets)
    }
    
    func getwishlistItems() {
        isFetchingData = true
        guard let url = URL(string: "http://localhost:8080/getfavs") else {
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
        let apiResponse = try decoder.decode(APIResponse.self, from: data)
        if let jsonString = String(data: data, encoding: .utf8) {
//                print("Raw JSON Data: \(jsonString)")
            }
        let processedProducts = apiResponse.wishlistProducts.compactMap { product in
                    processInnerJSONString(product)
            }
//        print("JSON Data \(processedProducts)")
        DispatchQueue.main.async {
            self.wishlistProducts = processedProducts
            self.isFetchingData = false
        }
        } catch {
            print("Error decoding JSON: \(error.localizedDescription)")
        }
    }.resume()
    }
}

// Function to process the inner JSON strings manually
    func processInnerJSONString(_ jsonString: String) -> WishlistProduct? {
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

            return WishlistProduct(
                _id: _id,
                productid: productid,
                productname: productname,
                productprice: productprice,
                productshipping: productshipping,
                productimage: productimage
            )
        } catch {
            print("Error processing inner JSON: \(error.localizedDescription)")
            return nil
        }
    }

#Preview {
    FavoritesView()
}

struct WishlistProductRow: View {
    var product: WishlistProduct

    var body: some View {
        HStack {
            // Display product information here
            Text(product.productname)
            Spacer()
            Text("$\(product.productprice)")
        }
        .padding()
    }
}

struct FavoritesView_Previews: PreviewProvider {
    static var previews: some View {
        FavoritesView()
    }
}


struct APIResponse: Decodable {
    let status: Int
    let wishlistProducts: [String]

    enum CodingKeys: String, CodingKey {
        case status = "Status"
        case wishlistProducts = "Wishlist_Products"
    }
}

struct WishlistProduct: Identifiable {
    let id = UUID()
    let _id: String
    let productid: String
    let productname: String
    let productprice: String
    let productshipping: String
    let productimage: String

    // Computed property for inner product name
    var innerProductName: String {
        processInnerJSONString(productname)?.productname ?? ""
    }
}

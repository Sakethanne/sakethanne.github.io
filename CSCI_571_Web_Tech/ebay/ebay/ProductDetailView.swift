//
//  ProductDetailView.swift
//  ebay
//
//  Created by Saketh Anne on 2023-12-02.
//

import SwiftUI

struct ProductDetailView: View {
    var productid: String
    
    var body: some View {
        VStack{
            Text(productid)
        }.navigationBarTitle("", displayMode: .inline)
    }
}

struct ProductDetailView_Previews: PreviewProvider {
    static var previews: some View {
        return ProductDetailView(productid: "225396639541")
    }
}


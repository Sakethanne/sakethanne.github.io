//
//  FavoritesManager.swift
//  ebay_usc
//
//  Created by Saketh Anne on 2023-11-20.
//

// FavoritesManager.swift

import SwiftUI

class FavoritesManager: ObservableObject {
    @Published var favorites: Set<String> = []

    func toggleFavorite(productID: String) {
        if favorites.contains(productID) {
            favorites.remove(productID)
        } else {
            favorites.insert(productID)
        }
    }
}

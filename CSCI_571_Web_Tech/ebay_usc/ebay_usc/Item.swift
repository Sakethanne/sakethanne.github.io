//
//  Item.swift
//  ebay_usc
//
//  Created by Saketh Anne on 2023-11-17.
//

import Foundation
import SwiftData

@Model
final class Item {
    var timestamp: Date
    
    init(timestamp: Date) {
        self.timestamp = timestamp
    }
}

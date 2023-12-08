//
//  ContentView.swift
//  ebay
//
//  Created by Saketh Anne on 2023-12-02.
//

import SwiftUI
import SwiftData

struct ContentView: View {
    @Environment(\.modelContext) private var modelContext
    @State private var isLoading: Bool = true
    

    var body: some View {
        Group {
            if isLoading {
                LoadingView(isLoading: $isLoading)
            } else {
                SearchFormView()
            }
        }
        .onAppear {
            // Simulate loading time (you can replace this with your actual data loading logic)
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                withAnimation {
                    isLoading = false
                }
            }
        }
    }
}

#Preview {
    ContentView()
        .modelContainer(for: Item.self, inMemory: true)
}

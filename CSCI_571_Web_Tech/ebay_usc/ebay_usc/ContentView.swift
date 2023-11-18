import SwiftUI

struct ContentView: View {
    @State private var isLoading: Bool = true
    
    var body: some View {
        Group {
            if isLoading {
                LoadingView(isLoading: $isLoading)
            } else {
                SearchFormView()
            }
//            SearchFormView()
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

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}

import SwiftUI

struct LoadingView: View {
    @Binding var isLoading: Bool
    @State var Opacity: Double = 0.0
    
    var body: some View {
        HStack{
            Spacer()
            Text("Powered by ")
                .font(.headline)
                .onAppear {
                }
            Image("ebay")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 100, height: 100)
            Spacer()
        }
        .padding(.all)
        .onAppear {
                withAnimation(.easeIn(duration: 1.0).delay(0.5)) {
                Opacity = 1.0 // Set opacity to 1.0 to make it visible
                }
        }
    }
}

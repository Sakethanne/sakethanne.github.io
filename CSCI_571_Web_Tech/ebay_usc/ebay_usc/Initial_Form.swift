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
    
    func usedtoggle(){usedCondition = !usedCondition}
    func newtoggle(){newCondition = !newCondition}
    func unspecifiedtoggle(){unspecifiedCondition = !unspecifiedCondition}
    func localshipping(){localPickup = !localPickup}
    func freeshipping(){freeShipping = !freeShipping}
    
    var body: some View {
        NavigationView {
            VStack(alignment: .leading, spacing: 20) {
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
                    }
                    
                    if customLocationToggle {
                        HStack{
                            Text("ZipCode:")
                            TextField("Required", text: $customLocation)
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
                }
            }
            .navigationBarTitle("Product Search")
            .navigationBarTitleDisplayMode(.automatic)
            .navigationBarItems(trailing: HStack {
                Spacer()
                NavigationLink(
                    destination: FavoritesView(),
                    isActive: $showingFavorites,
                    label:
                        {
                            Image(systemName: "heart.circle")
                                .padding(.horizontal)
                        }
                )
            })
        }
        .overlay(
                    errorMessageView()
                )
    }
    
    
    
    private func printFormData() {
        if keyword.isEmpty || (customLocationToggle == true && customLocation.isEmpty) {
            isShowingErrorMessage = true
            hideErrorMessageAfterDelay()
        } else {
            displayresults = true
            print("Keyword: \(keyword)")
            print("Category: \(selectedCategory)")
            print("Used: \(usedCondition)")
            print("New: \(newCondition)")
            print("Unspecified: \(unspecifiedCondition)")
            print("Local Pickup: \(localPickup)")
            print("Free Shipping: \(freeShipping)")
            print("Distance: \(distance)")
            print("Custom Location: \(customLocation)")
        }
    }
    
    
    private func clearFormData() {
        keyword = ""
        isShowingErrorMessage = false
        selectedCategory = ""
        usedCondition = false
        newCondition = false
        unspecifiedCondition = false
        localPickup = false
        freeShipping = false
        distance = "10"
        customLocationToggle = false
        customLocation = ""
    }
    
    @ViewBuilder
    private func errorMessageView() -> some View {
        if isShowingErrorMessage {
            if(keyword.isEmpty){
                Text("Keyword is mandatory")
                    .foregroundColor(.white)
                    .padding()
                    .padding(.horizontal)
                    .background(Color.black)
                    .cornerRadius(8)
                    .offset(y: 350)
                    .onAppear{
                            // Hide the error message after 2 seconds
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
                    .offset(y: 350)
                    .onAppear{
                            // Hide the error message after 2 seconds
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                            isShowingErrorMessage = false
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

struct SearchFormView_Previews: PreviewProvider {
    static var previews: some View {
        SearchFormView()
    }
}

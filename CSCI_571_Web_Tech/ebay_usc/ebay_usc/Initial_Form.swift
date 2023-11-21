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
    @State var autopostalCode: String = ""
    @State var pinCodeSuggestions: [String] = []
    @State var isSheetPresented = false
    

    
    
    func usedtoggle(){usedCondition = !usedCondition}
    func newtoggle(){newCondition = !newCondition}
    func unspecifiedtoggle(){unspecifiedCondition = !unspecifiedCondition}
    func localshipping(){localPickup = !localPickup}
    func freeshipping(){freeShipping = !freeShipping}
    
    var body: some View {
        NavigationView {
            VStack {
                    Section {
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
                            .padding(.vertical, 5)
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
                            }.onAppear {
                                fetchautoloc()
                            }
                            
                            if customLocationToggle {
                                HStack{
                                    Text("ZipCode:")
                                    TextField("Required", text: $customLocation)
                                        .onChange(of: customLocation) { _ in
                                            // Call API when text field content changes
                                            fetchPinCodes()
                                        }
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
                            
                        }.sheet(isPresented: $isSheetPresented) {
                            // Display pin code suggestions in a sheet
                            PinCodeSuggestionsSheet(pinCodes: pinCodeSuggestions, searchText: $customLocation)
                    }
                    }
                    Section{
                        if displayresults {
                            ResultsView(keyword: $keyword,selectedCategory: $selectedCategory, usedCondition: $usedCondition,newCondition: $newCondition,unspecifiedCondition:$unspecifiedCondition, localPickup: $localPickup,freeShipping:$freeShipping,distance:$distance,customLocationToggle:$customLocationToggle,customLocation:$customLocation,autopostalCode:$autopostalCode )
                        }
                    }
                    
                .overlay(
                    errorMessageView()
                )
                
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
        
    }
    
    func fetchPinCodes() {
            guard customLocation.count >= 3 && customLocation.count < 5 else {
                // Skip API call if the text length is less than 3
                return
            }

            guard let url = URL(string: "http://localhost:8080/geonames?zip=\(customLocation)") else {
                return
            }

            URLSession.shared.dataTask(with: url) { data, response, error in
                if let error = error {
                    print("Error: \(error.localizedDescription)")
                    return
                }

                guard let data = data else {
                    print("Error: No data received from the API.")
                    return
                }

                do {
                    // Decode the array of strings directly
                    let decodedResponse = try JSONDecoder().decode([String].self, from: data)

                    // Update the UI on the main thread
                    DispatchQueue.main.async {
                        self.pinCodeSuggestions = decodedResponse
                        self.isSheetPresented = true
                    }
                } catch {
                    print("Error decoding JSON: \(error.localizedDescription)")
                }
            }.resume()
        }

    
    func fetchautoloc() {
            guard let url = URL(string: "https://ipinfo.io/json?token=f141f67b70d679") else {
                return
            }

            URLSession.shared.dataTask(with: url) { data, response, error in
                if let error = error {
                    print("Error: \(error.localizedDescription)")
                    return
                }

                if let data = data {
                    do {
                        let decoder = JSONDecoder()
                        let ipInfo = try decoder.decode(IPInfo.self, from: data)

                        // Extract the postal code
                        let postal = ipInfo.postal

                        // Update the UI on the main thread
                        DispatchQueue.main.async {
                            self.autopostalCode = postal
                        }
                    } catch {
                        print("Error decoding JSON: \(error.localizedDescription)")
                    }
                }
            }.resume()
        }
    
    private func printFormData() {
            if keyword.isEmpty || (customLocationToggle == true && customLocation.isEmpty) {
                isShowingErrorMessage = true
                hideErrorMessageAfterDelay()
            } else {
                displayresults = true
//                print("Keyword: \(keyword)")
//                print("Category: \(selectedCategory)")
//                print("Used: \(usedCondition)")
//                print("New: \(newCondition)")
//                print("Unspecified: \(unspecifiedCondition)")
//                print("Local Pickup: \(localPickup)")
//                print("Free Shipping: \(freeShipping)")
//                print("Distance: \(distance)")
//                print("Custom Location: \(customLocation)")
//                print("Custom location Toggle: \(customLocationToggle)")
//                print("Auto Location: \(autopostalCode)")
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
        autopostalCode = ""
        displayresults = false
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
                    .offset(y: 300)
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

struct IPInfo: Decodable {
    let postal: String
    // Add other properties as needed
}

struct PinCodeSuggestionsSheet: View {
    var pinCodes: [String]
    @Binding var searchText: String
    @Environment(\.presentationMode) var presentationMode

    var body: some View {
        NavigationView {
            VStack{
                Text("Pincode suggestions")
                    .font(.largeTitle)
                    .cornerRadius(10)
                    .fontWeight(.bold)
                    .padding(.all)
                    .padding(.vertical)
                List(pinCodes, id: \.self) { pinCode in
                    Text(pinCode)
                        .onTapGesture {
                            // Update the search text and dismiss the sheet
                            searchText = pinCode
                            presentationMode.wrappedValue.dismiss()
                        }
                }
                Spacer()
            }
        }
    }
}

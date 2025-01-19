//
//  HomePageView.swift
//  frontend
//
//  Created by Karen Zhao on 2025-01-18.
//

import SwiftUI

struct HomePageView: View {
    var body: some View {
        VStack {
            Image(uiImage: .appIcon)
                .resizable() // Make the image resizable
                .scaledToFit() // Maintain the aspect ratio
                .frame(width: 100, height: 100) // Set a larger size
                .foregroundStyle(.tint)
            TextField("User name", text: .constant(""))
                .textFieldStyle(MyTextFieldStyle())
            SecureField("Password", text: .constant(""))
                .textFieldStyle(MyTextFieldStyle())
            HStack {
                Text("Create Account")
                    .padding(.vertical)
                Image(uiImage: .rightArrow)
                    .imageScale(.small)
                    .foregroundStyle(.tint)
            }
            .frame(maxWidth: .infinity) // Ensure the HStack takes up the full width
        }
        .padding(.all, 50)
    }
}

struct MyTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
        .padding(25)
        .background(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(Color(white: 0.9)) // Use fill to apply color to the shape
        ).padding()
    }
}


#Preview {
    HomePageView()
}

//
//  SignUpView.swift
//  frontend
//
//  Created by Karen Zhao on 2025-01-19.
//

import SwiftUI

struct SignUpView: View {
    @Environment(\.presentationMode) var presentationMode
    var body: some View {
        VStack {
            title
            TextField("User name", text: .constant(""))
                .textFieldStyle(MyTextFieldStyle())
            TextField("First name", text: .constant(""))
                .textFieldStyle(MyTextFieldStyle())
            TextField("Last name", text: .constant(""))
                .textFieldStyle(MyTextFieldStyle())
            SecureField("Password", text: .constant(""))
                .textFieldStyle(MyTextFieldStyle())
            Button(action: {
                print("Button with Label tapped!")
            }) {
                HStack {
                    Text("Login")
                        .font(.custom("Fredoka", size: 20))
                        .foregroundColor(.white)
                    Image(systemName: "arrow.right")
                        .foregroundColor(.white)
                        .font(.title2)
                }
                .padding()
                .background(Color("accentYellow"))
                .cornerRadius(24)
            }
            Spacer()
            signUp
            .frame(maxWidth: .infinity)
        }
        .padding(.horizontal, 50)
    }
    
    var title: some View {
        VStack {
            Image(uiImage: .appIcon2)
                .resizable()
                .scaledToFit()
                .frame(width: 115, height: 115)
                .foregroundStyle(.tint)
            Text("lumo")
                .font(.custom("Fredoka-Regular", size: 36))
                .foregroundColor(Color("textPrimary"))
            Text("brighten up your day")
                .font(.custom("Fredoka", size: 20))
                .foregroundColor(Color("textPrimary"))
        }
        .padding(.bottom, 50)
        .padding(.top, 70)
    }
    
    var signUp: some View {
        HStack {
            Text("Already have an account?")
                .padding(.vertical)
    
            Button(action: {
                    presentationMode.wrappedValue.dismiss() // This pops the current view and goes back to LoginView
                }) {
                    Text("Sign in")
                        .foregroundColor(.blue)
                }
        }
    }
}



#Preview {
    SignUpView()
}

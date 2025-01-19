//
//  HomePageView.swift
//  frontend
//
//  Created by Karen Zhao on 2025-01-18.
//

import SwiftUI

struct LoginView: View {
    var body: some View {
        NavigationView {
            VStack {
                title
                TextField("User name", text: .constant(""))
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
            Text("Need an account?")
                .padding(.vertical)
            NavigationLink(destination: SignUpView()) {
                Text("Sign up")
                    .foregroundColor(.blue)
            }
        }
    }
}

struct MyTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .padding(25)
        .background(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(Color(white: 0.9))
                .frame(width: 300, height: 60)
        )
    }
}


#Preview {
    LoginView()
}

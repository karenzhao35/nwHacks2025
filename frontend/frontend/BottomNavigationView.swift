//
//  BottomNavigationView.swift
//  frontend
//
//  Created by Martin Wong on 2025-01-18.
//

import SwiftUI

struct BottomNavigationView: View {
    var body: some View {
        VStack {
            Spacer() // Pushes content upwards

            // Bottom navigation bar
            Rectangle()
                .frame(height: 100) // Height of the navigation bar
                .cornerRadius(50, corners: [.topLeft, .topRight]) // Rounded top corners
                .foregroundColor(Color(hex: "#FFEDD4")) // Color for the bar
        }
        .frame(maxHeight: .infinity) // Ensures VStack stretches to full height
        .navigationBarHidden(true)
        .ignoresSafeArea()
    }
}

#Preview {
    BottomNavigationView()
}

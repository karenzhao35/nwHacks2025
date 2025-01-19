//
//  SelectionPageView.swift
//  frontend
//
//  Created by Martin Wong on 2025-01-18.
//
 

import SwiftUI

struct SelectionPageView: View {
    var body: some View {
        VStack {
            VStack {
                Text("Hey :)")
                Spacer()
                Rectangle()
                    .cornerRadius(30, corners: [.allCorners])
                    .frame(height: 100)
                    .foregroundColor(Color(hex: "#E2F2FF")) // #FFEDD4
                Spacer()
                Rectangle()
                    .cornerRadius(30, corners: [.allCorners])
                    .frame(height: 200)
                    .foregroundColor(Color(hex: "#E2F2FF")) // #FFEDD4
                Spacer()
            }
            .frame(maxHeight: .infinity) // Ensure the HStack takes up the full width
            .padding(.all, 50)
            
        }
        BottomNavigationView()
    }
}

extension View {
    // Custom corner radius for specific corners
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

extension Color {
    init(hex: String) {
        let hexSanitized = hex.replacingOccurrences(of: "#", with: "")
        var int = UInt64()
        Scanner(string: hexSanitized).scanHexInt64(&int)
        let red = CGFloat((int >> 16) & 0xFF) / 255.0
        let green = CGFloat((int >> 8) & 0xFF) / 255.0
        let blue = CGFloat(int & 0xFF) / 255.0
        self.init(red: red, green: green, blue: blue)
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat
    var corners: UIRectCorner

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(roundedRect: rect, byRoundingCorners: corners, cornerRadii: CGSize(width: radius, height: radius))
        return Path(path.cgPath)
    }
}

#Preview {
    SelectionPageView()
}

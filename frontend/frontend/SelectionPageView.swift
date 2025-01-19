import SwiftUI

struct SelectionPageView: View {
    var body: some View {
        VStack {
            VStack {
                Text("Hey :)")
                    .font(.largeTitle) // Optional: Customize text style
                    .padding()

                Spacer()

                // First Rectangle with Text
                ZStack {
                    Rectangle()
                        .cornerRadius(30, corners: [.allCorners])
                        .frame(height: 100)
                        .foregroundColor(Color(hex: "#E2F2FF")) // #E2F2FF color

                    Text("Share treasurable moments!")
                        .foregroundColor(.black) // Text color
                        .font(.headline) // Text style
                }

                Spacer()

                ZStack {
                    Rectangle()
                        .cornerRadius(30, corners: [.allCorners])
                        .frame(height: 250)
                        .foregroundColor(Color(hex: "#E2F2FF")) // #E2F2FF color

                    VStack {
                        Spacer()

                        Text("Feeling under the weather?\nSelect one of the following:")
                            .foregroundColor(.black) // Text color
                            .font(.headline) // Text style
                            .multilineTextAlignment(.center) // Center alignment

                        Spacer()

                        HStack {
                            VStack {
                                Image(uiImage: .sad)
                                Text("Sad")
                            }
                            VStack {
                                Image(uiImage: .anxious)
                                Text("Anxious")
                            }
                            VStack {
                                Image(uiImage: .annoyed)
                                Text("Annoyed")
                            }
                        }
                        .frame(maxWidth: .infinity) // Expand HStack to full width
                    }
                    
                }

                Spacer()
            }
            .frame(maxHeight: .infinity) // Ensure the VStack takes up the full height
            .padding(.all, 40)

            BottomNavigationView()
        }
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

//
//  MessageView.swift
//  frontend
//
//  Created by Karen Zhao on 2025-01-18.
//

import SwiftUI

struct MessageView: View {
    var body: some View {
        ZStack {
            Rectangle()
                .fill(Color("mainBlue"))
                .cornerRadius(30)
                .padding()

            VStack(spacing: 10) {
                Text("Breathe deeply, and let the moment ground you \n\n Remember these?")
                    .multilineTextAlignment(.leading)
                    .foregroundColor(Color("textPrimary"))
                    .padding(.horizontal)
                Image(uiImage: .sunset)
                    .resizable()
                    .scaledToFit()
                    .frame(width: 263, height: 263)
                Text("2024-10-12")
                    .foregroundColor(Color("textPrimary"))
            }
            .padding()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

#Preview {
    MessageView()
}

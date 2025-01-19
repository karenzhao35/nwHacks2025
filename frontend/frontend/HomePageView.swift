//
//  HomePageView.swift
//  frontend
//
//  Created by Karen Zhao on 2025-01-19.
//

import SwiftUI

struct HomePageView: View {
    @State private var selection = 0 // Track the current swipe position
    
    var body: some View {
        VStack {
            // Text and description above the buttons
            Text("Choose an Option")
                .font(.custom("Fredoka", size: 30))
                .foregroundColor(Color("textPrimary"))
                .padding(.top, 50)
            
            Text("Swipe or click a button below to navigate")
                .font(.custom("Fredoka", size: 20))
                .foregroundColor(Color("textPrimary"))
                .padding(.bottom, 50)
            
            // Swipeable view with two pages
            TabView(selection: $selection) {
                VStack {
                    // Icon 1 Button
                    Button(action: {
                        // Navigate to the first path
                        print("Navigating to path 1")
                    }) {
                        VStack {
                            Image(systemName: "star.fill")
                                .font(.system(size: 50))
                                .foregroundColor(.yellow)
                            Text("Path 1")
                                .font(.custom("Fredoka", size: 20))
                        }
                        .padding()
                        .background(Color("accentColor"))
                        .cornerRadius(16)
                    }
                }
                .tag(0) // Assign a tag to this tab
                
                VStack {
                    // Icon 2 Button
                    Button(action: {
                        // Navigate to the second path
                        print("Navigating to path 2")
                    }) {
                        VStack {
                            Image(systemName: "heart.fill")
                                .font(.system(size: 50))
                                .foregroundColor(.red)
                            Text("Path 2")
                                .font(.custom("Fredoka", size: 20))
                        }
                        .padding()
                        .background(Color("accentColor"))
                        .cornerRadius(16)
                    }
                }
                .tag(1) // Assign a tag to this tab
            }
            .frame(height: 300)
            .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never)) // Disable default page indicator
            
            // Custom circle indicators
            HStack(spacing: 10) {
                Circle()
                    .fill(selection == 0 ? Color("textPrimary") : Color.gray)
                    .frame(width: 10, height: 10)
                
                Circle()
                    .fill(selection == 1 ? Color("textPrimary") : Color.gray)
                    .frame(width: 10, height: 10)
            }
            .padding(.top, 20)
            
            Spacer()
        }
        .padding(.horizontal, 30)
    }
}

#Preview {
    HomePageView()
}


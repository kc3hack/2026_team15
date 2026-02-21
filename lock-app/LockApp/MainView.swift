import SwiftUI

struct MainView: View {
    @StateObject private var lockManager = LockManager.shared
    @State private var showSettings = false

    var body: some View {
        if lockManager.isLocked {
            LockScreenView()
                .overlay(
                    Button(action: { showSettings = true }) {
                        Image(systemName: "gearshape.fill")
                            .foregroundColor(.gray.opacity(0.5))
                            .padding()
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                    .padding(.top, 60)
                    .padding(.leading, 20)
                )
                .sheet(isPresented: $showSettings) {
                    SettingsView()
                }
        } else {
            UnlockedView()
                .sheet(isPresented: $showSettings) {
                    SettingsView()
                }
        }
    }
}

struct UnlockedView: View {
    @StateObject private var lockManager = LockManager.shared
    @State private var showSettings = false

    var body: some View {
        ZStack {
            // Green gradient background for unlocked state
            LinearGradient(
                colors: [
                    Color.green.opacity(0.3),
                    Color.black
                ],
                startPoint: .top,
                endPoint: .center
            )
            .ignoresSafeArea()

            VStack(spacing: 24) {
                // Large checkmark icon
                ZStack {
                    Circle()
                        .fill(Color.green.opacity(0.2))
                        .frame(width: 120, height: 120)

                    Circle()
                        .stroke(Color.green, lineWidth: 3)
                        .frame(width: 120, height: 120)

                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 60))
                        .foregroundColor(.green)
                }
                .padding(.bottom, 8)

                // App icon (smaller, below checkmark)
                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color.purple.opacity(0.5),
                                    Color.pink.opacity(0.5),
                                    Color.orange.opacity(0.5)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 48, height: 48)

                    Image(systemName: "camera.fill")
                        .font(.system(size: 20))
                        .foregroundColor(.white)
                }

                Text("Instagram")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(.white)

                // UNLOCKED text
                Text("UNLOCKED")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(.green)
                    .padding(.top, 8)

                Text("This app is available to use")
                    .font(.system(size: 16))
                    .foregroundColor(.gray)

                // Time remaining
                VStack(spacing: 8) {
                    Text("Time Remaining Today")
                        .font(.system(size: 14))
                        .foregroundColor(.gray)

                    Text(lockManager.remainingFormatted)
                        .font(.system(size: 28, weight: .semibold))
                        .foregroundColor(.white)
                }
                .padding(.top, 16)
                .padding(.horizontal, 40)
                .padding(.vertical, 16)
                .background(Color.white.opacity(0.1))
                .cornerRadius(12)

                Spacer()

                // Settings button
                Button(action: { showSettings = true }) {
                    HStack {
                        Image(systemName: "gearshape.fill")
                        Text("Settings")
                    }
                    .font(.system(size: 16))
                    .foregroundColor(.blue)
                    .padding()
                }
            }
            .padding(.top, 60)
            .padding(.bottom, 40)
        }
        .sheet(isPresented: $showSettings) {
            SettingsView()
        }
    }
}

#Preview("Unlocked") {
    UnlockedView()
}

#Preview("Main View") {
    MainView()
}

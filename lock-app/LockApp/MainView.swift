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
            Color.black.ignoresSafeArea()

            VStack(spacing: 24) {
                // App icon
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
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
                        .frame(width: 72, height: 72)

                    Image(systemName: "camera.fill")
                        .font(.system(size: 32))
                        .foregroundColor(.white)
                }
                .padding(.bottom, 8)

                Text("Instagram")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundColor(.white)

                // Status
                VStack(spacing: 12) {
                    Text("App is Unlocked")
                        .font(.system(size: 24, weight: .semibold))
                        .foregroundColor(.green)

                    // Progress bar
                    GeometryReader { geometry in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 4)
                                .fill(Color.gray.opacity(0.3))
                                .frame(height: 8)

                            RoundedRectangle(cornerRadius: 4)
                                .fill(Color.blue)
                                .frame(width: geometry.size.width * lockManager.progress, height: 8)
                        }
                    }
                    .frame(height: 8)
                    .padding(.horizontal, 40)

                    HStack {
                        Text("Used: \(lockManager.usageFormatted)")
                            .foregroundColor(.gray)
                        Spacer()
                        Text("Limit: \(lockManager.limitFormatted)")
                            .foregroundColor(.gray)
                    }
                    .font(.system(size: 14))
                    .padding(.horizontal, 40)

                    Text("Remaining: \(lockManager.remainingFormatted)")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.blue)
                }
                .padding(.top, 16)

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
            .padding(.top, 80)
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

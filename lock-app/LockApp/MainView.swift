import SwiftUI

struct MainView: View {
    @StateObject private var lockManager = LockManager.shared
    @Environment(\.scenePhase) private var scenePhase

    var body: some View {
        Group {
            if lockManager.isLocked {
                LockScreenView()
            } else {
                UnlockedView()
            }
        }
        .onAppear {
            lockManager.refreshState()
        }
        .onChange(of: scenePhase) { _, newPhase in
            if newPhase == .active {
                lockManager.refreshState()
            }
        }
    }
}

struct UnlockedView: View {
    @StateObject private var lockManager = LockManager.shared

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

                Text("SNS")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(.white)

                Text("UNLOCKED")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(.green)
                    .padding(.top, 8)

                Text("現在は利用できます")
                    .font(.system(size: 16))
                    .foregroundColor(.gray)

                // Time remaining
                VStack(spacing: 8) {
                    Text("本日の残り時間")
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
            }
            .padding(.top, 60)
            .padding(.bottom, 40)
        }
    }
}

#Preview("Unlocked") {
    UnlockedView()
}

#Preview("Main View") {
    MainView()
}

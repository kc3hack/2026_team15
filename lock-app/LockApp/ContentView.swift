import SwiftUI

extension View {
    @ViewBuilder
    func lockAppStatusBarHidden() -> some View {
#if os(iOS)
        self.statusBar(hidden: true)
#else
        self
#endif
    }
}

struct LockScreenView: View {
    // アプリ名はここで変更できます
    let appName: String = "SNS"

    var body: some View {
        ZStack {
            // 背景
            Color.black
                .ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer()

                // 砂時計アイコンとアプリ名
                HStack(spacing: 6) {
                    Image(systemName: "hourglass")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.gray)

                    Text(appName)
                        .font(.system(size: 15, weight: .medium))
                        .foregroundColor(.gray)
                }
                .padding(.bottom, 24)

                Text("LOCKED")
                    .font(.system(size: 34, weight: .bold))
                    .foregroundColor(.red)
                    .padding(.bottom, 10)

                Text("\(appName) は本日の上限に達しました。")
                    .font(.system(size: 17))
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)
                    .padding(.bottom, 12)

                Text("少し休んで、また明日落ち着いて使いましょう。")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(.white.opacity(0.88))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 36)

                Spacer()
            }
        }
        .lockAppStatusBarHidden()
    }
}

#Preview {
    LockScreenView()
}

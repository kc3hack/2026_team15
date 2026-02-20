import SwiftUI

struct LockScreenView: View {
    // アプリ名はここで変更できます
    let appName: String = "Instagram"

    var body: some View {
        ZStack {
            // 背景
            Color.black
                .ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer()

                // 砂時計アイコン
                Image(systemName: "hourglass")
                    .font(.system(size: 56, weight: .light))
                    .foregroundColor(.gray)
                    .padding(.bottom, 24)

                // タイトル
                Text("App Limit")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(.bottom, 12)

                // メッセージ
                Text("You've reached your limit for \(appName).")
                    .font(.system(size: 17))
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)

                Spacer()

                // ボタン
                VStack(spacing: 0) {
                    Divider()
                        .background(Color.gray.opacity(0.3))

                    Button(action: {
                        // 何もしない（OKボタン）
                    }) {
                        Text("OK")
                            .font(.system(size: 20))
                            .foregroundColor(.systemBlue)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                    }

                    Divider()
                        .background(Color.gray.opacity(0.3))

                    Button(action: {
                        // 何もしない（Request More Time）
                    }) {
                        Text("Request More Time")
                            .font(.system(size: 20))
                            .foregroundColor(.systemBlue)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                    }
                }
                .background(Color.black)
            }
        }
        .statusBar(hidden: true)
    }
}

#Preview {
    LockScreenView()
}

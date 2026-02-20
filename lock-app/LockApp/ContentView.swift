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

                // アプリアイコン（薄暗い）
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color.purple.opacity(0.3),
                                    Color.pink.opacity(0.3),
                                    Color.orange.opacity(0.3)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 72, height: 72)
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                        )

                    // カメラアイコン
                    Image(systemName: "camera.fill")
                        .font(.system(size: 32))
                        .foregroundColor(.white.opacity(0.5))
                }
                .padding(.bottom, 16)

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
                            .foregroundColor(.blue)
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
                            .foregroundColor(.blue)
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

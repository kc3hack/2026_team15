import SwiftUI

struct LockScreenView: View {
    // アプリ名はここで変更できます
    let appName: String = "Instagram"

    var body: some View {
        VStack(spacing: 28) {
            Spacer()

            // アイコン（砂時計風 - iOS Screen Time風）
            ZStack {
                Circle()
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: 90, height: 90)

                Image(systemName: "hourglass")
                    .font(.system(size: 40, weight: .medium))
                    .foregroundColor(.white)
            }

            // タイトル
            Text("制限中")
                .font(.system(size: 24, weight: .semibold))
                .foregroundColor(.white)
                .multilineTextAlignment(.center)

            // アプリ名
            Text(appName)
                .font(.system(size: 18, weight: .medium))
                .foregroundColor(.white.opacity(0.8))
                .padding(.horizontal, 20)
                .padding(.vertical, 8)

            // メッセージ
            Text("このアプリは制限されています\n使用制限に達しました")
                .font(.system(size: 15))
                .foregroundColor(.white.opacity(0.6))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.black)
        .statusBar(hidden: true)
    }
}

#Preview {
    LockScreenView()
}

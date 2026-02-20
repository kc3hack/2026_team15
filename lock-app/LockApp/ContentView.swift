import SwiftUI

struct LockScreenView: View {
    // アプリ名はここで変更できます
    let appName: String = "Instagram"

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            // アイコン
            ZStack {
                Circle()
                    .fill(Color.red.opacity(0.9))
                    .frame(width: 80, height: 80)

                Text("!")
                    .font(.system(size: 40, weight: .semibold))
                    .foregroundColor(.white)
            }

            // タイトル
            Text("このアプリは制限されています")
                .font(.system(size: 22, weight: .semibold))
                .multilineTextAlignment(.center)

            // アプリ名
            Text(appName)
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(.secondary)
                .padding(.horizontal, 24)
                .padding(.vertical, 12)
                .background(Color(.systemGray6))
                .cornerRadius(10)

            // メッセージ
            Text("設定した契約に基づき、このアプリは現在ロックされています。\n\n制限を解除するには、契約条件を確認してください。")
                .font(.system(size: 14))
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground))
    }
}

#Preview {
    LockScreenView()
}

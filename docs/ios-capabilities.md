# iOS Capabilities と制約

このドキュメントは、現行MVPで何を使っているか・将来何が必要かを整理したものです。

## 1. 現行（デモ運用）

現行MVPは Screen Time capability を有効化しなくても動作します。

- 使用時間・ブロックはアプリ内モックで再現
- シールドは疑似UI
- OSレベルのアプリロックは未実装

## 2. 実行に必要な設定

`run-ios` / Xcode 実行に必要なのは署名設定です。

1. `mobile/ios/mobile.xcworkspace` を開く
2. Target `mobile` を選択
3. `Signing & Capabilities` で Team を設定
4. Bundle Identifier を一意化
5. `Automatically manage signing` を有効化

## 3. 将来ネイティブ連携する場合

将来、疑似シールドから本物の Screen Time 連携へ進める場合は以下を検討します。

- FamilyControls
- ManagedSettings
- DeviceActivity

加えて Apple Developer 側で:

- App ID の capability 追加
- Provisioning Profile の再生成

## 4. 関連コード

- モック実装: `mobile/src/lib/mock-store.ts`
- 画面フロー制御: `mobile/src/lib/app-context.tsx`
- ネイティブ連携入口（将来用）: `mobile/src/native/screenTime.ts`

## 5. 推奨方針

ハッカソン期間中は、ネイティブ capability 拡張よりも

- 状態遷移の一貫性
- 契約/違反/表示の整合性
- デモ再現性

を優先するのが現実的です。

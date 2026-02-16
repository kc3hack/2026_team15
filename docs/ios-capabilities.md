# iOS Capability Checklist（YOHAKU）

Screen Time API を使うため、Xcode で以下を有効化してください。

## 1. Signing & Capabilities

対象ターゲット: `mobile`

1. `Family Controls` を追加
2. `App Groups` を追加（必要なら Widget/Extension と共有）
3. `Background Modes` は必要なもののみ有効化

## 2. 実装時に必要な Framework

- `FamilyControls`
- `ManagedSettings`
- `DeviceActivity`

## 3. Apple Developer 側

- App ID に Screen Time 関連 capability を追加
- Provisioning Profile を再生成

## 4. このリポジトリ上の入口

- RN 側: `mobile/src/native/screenTime.ts`
- iOS 実装予定: `mobile/ios/mobile` 配下に `ScreenTimeModule.swift` を追加

> 現在は RN 側に fallback 実装があり、Swift モジュール未実装でも画面遷移の検証は可能です。

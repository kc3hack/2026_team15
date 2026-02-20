# ビルドガイド

YOHAKU をローカルで起動して確認するための手順です。

## 1. 前提環境

- macOS
- Xcode（Apple ID でサインイン済み）
- Node.js（推奨: `.nvmrc` の版）
- Ruby / Bundler
- CocoaPods
- iPhone（実機確認する場合のみ）

## 2. セットアップ

```bash
git clone <REPO_URL>
cd 2026_team15
npm install
npm run mobile:install
cd mobile
bundle install
cd ..
```

## 3. 環境変数

`mobile/.env` を作成します。

```env
SUPABASE_URL=https://kpglevcdjwjiafafzfdy.supabase.co
SUPABASE_ANON_KEY=<TEAM_PUBLISHABLE_KEY>
```

## 4. iOS Pods 反映

```bash
cd mobile/ios
bundle exec pod install
cd ../..
```

## 5. Xcode 署名設定（必須）

1. `mobile/ios/mobile.xcworkspace` を Xcode で開く
2. Target `mobile` -> `Signing & Capabilities`
3. `Team` を自分の Team に設定
4. `Bundle Identifier` を一意の値に変更
5. `Automatically manage signing` を有効化

## 6. Metro 起動

```bash
npm run mobile:start
```

## 7. ビルド実行

### 7.1 Simulator

```bash
npm run mobile:ios
```

または:

```bash
npm --prefix mobile run ios -- --simulator "iPhone 16"
```

### 7.2 iPhone 実機

- iPhone を USB 接続
- Xcode で実行対象を iPhone に変更
- `npm run mobile:ios` または Xcode の Run を実行

## 8. 補足

- Screen Time API は現時点でモック運用です
- iOS capability の制約は `docs/ios-capabilities.md` を参照

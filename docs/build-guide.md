# Build Guide

YOHAKU をローカルでビルドして試すための手順です。

## 1. Prerequisites

- macOS
- Xcode (Apple ID sign-in 済み)
- Node.js (推奨: `.nvmrc` の版)
- Ruby / Bundler
- CocoaPods
- iPhone (実機で試す場合)

## 2. Setup

```bash
git clone <REPO_URL>
cd 2026_team15
npm install
npm run mobile:install
cd mobile
bundle install
cd ..
```

## 3. Environment Variables

`mobile/.env` を作成します。

```env
SUPABASE_URL=https://kpglevcdjwjiafafzfdy.supabase.co
SUPABASE_ANON_KEY=<TEAM_PUBLISHABLE_KEY>
```

## 4. iOS Pods

```bash
cd mobile/ios
bundle exec pod install
cd ../..
```

## 5. Xcode Signing (Required for run-ios)

1. `mobile/ios/mobile.xcworkspace` を Xcode で開く
2. Target `mobile` -> `Signing & Capabilities`
3. `Team` を自分の Team に設定
4. `Bundle Identifier` を一意の値に変更
5. `Automatically manage signing` を有効化

## 6. Start Metro

```bash
npm run mobile:start
```

## 7. Build and Run

### 7.1 Simulator

```bash
npm run mobile:ios
```

または:

```bash
npm --prefix mobile run ios -- --simulator "iPhone 16"
```

### 7.2 iPhone (Real Device)

- iPhone を USB 接続
- Xcode で実行対象を iPhone に変更
- `npm run mobile:ios` か Xcode の Run を実行

## 8. If Edge Functions Were Changed

```bash
npx supabase functions deploy create-contract --project-ref kpglevcdjwjiafafzfdy
npx supabase functions deploy record-violation --project-ref kpglevcdjwjiafafzfdy
```

## 9. Notes

- Screen Time API は現時点でモック運用です
- iOS capability の制約は `docs/ios-capabilities.md` を参照

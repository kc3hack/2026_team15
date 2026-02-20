# Cloud Supabase Build Guide

YOHAKU をチーム共有の Cloud Supabase に接続して、各自の Mac + iPhone で実機起動する手順です。

## 1. Prerequisites

- macOS
- Xcode (Apple ID sign-in 済み)
- Node.js (推奨: `.nvmrc` の版)
- Ruby / Bundler
- CocoaPods
- iPhone (USB 接続できること)

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

## 3. Cloud Supabase Env

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

## 5. Xcode Signing (Required)

1. `mobile/ios/mobile.xcworkspace` を Xcode で開く
2. Target `mobile` -> `Signing & Capabilities`
3. `Team` を自分の Team に設定
4. `Bundle Identifier` を一意の値に変更
5. `Automatically manage signing` を有効化

## 6. Run on iPhone

Terminal 1:

```bash
npm run mobile:start
```

Terminal 2:

```bash
npm run mobile:ios
```

または Xcode から接続中 iPhone を選択して Run します。

## 7. If Edge Functions Were Changed

```bash
npx supabase functions deploy create-contract --project-ref kpglevcdjwjiafafzfdy
npx supabase functions deploy record-violation --project-ref kpglevcdjwjiafafzfdy
```

## 8. Notes

- Screen Time API は現時点でモック運用です
- iOS capability の制約は `docs/ios-capabilities.md` を参照

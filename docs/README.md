# YOHAKU（ヨハク）

スマホ利用を「契約 + 金銭的コミットメント（モック）」で制御し、時間と心の余白を作る iOS 向けアプリです。

## 技術スタック（MVP）

- モバイル: React Native 0.82 + TypeScript
- ネイティブ: Swift（Screen Time API 連携予定）
- BaaS: Supabase（Auth / Postgres / Edge Functions）
- 決済: モック（`ledger_entries` 台帳）

## 現在のリポジトリ構成

```text
.
├── mobile/                         # React Native アプリ
│   ├── src/
│   │   ├── navigation/             # 7画面遷移スケルトン
│   │   ├── screens/                # Login/Permission/PickApps/CreateContract/Payment/ConfirmContract/Dashboard
│   │   ├── native/                 # Screen Time Bridge 呼び出し口
│   │   ├── lib/                    # Supabase client
│   │   └── config/                 # 環境変数ローダ
│   └── .env.example
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   └── 20260216121000_init_mvp.sql
│   └── functions/
│       └── record-violation/
└── package.json                    # ルート作業用スクリプト
```

## 前提ツール

- Node.js `22.14.0`（`.nvmrc`）
- npm `10+`
- Xcode（iOS 実機/シミュレータ実行時）
- CocoaPods
- Supabase CLI（本リポジトリでは `npx supabase@latest ...` で実行）

## 0. macOS 初回設定（Xcode ライセンス）

この端末では未同意だと `git` / `pod` が失敗します。最初に実行してください。

```bash
sudo xcodebuild -license
```

## 1. モバイルアプリ環境構築

```bash
# 依存インストール
npm run mobile:install

# 環境変数
cp mobile/.env.example mobile/.env
# mobile/.env を実値に更新
```

`mobile/.env` で使う値:

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
```

iOS Pod 反映:

```bash
cd mobile/ios
bundle install
bundle exec pod install
cd ../..
```

## 2. Supabase 環境構築

```bash
# ローカルDB/Studio起動（Dockerが必要）
npm run supabase:start

# マイグレーション適用（初期化）
npm run supabase:db:reset
```

Edge Function ローカル実行:

```bash
cp supabase/.env.local.example supabase/.env.local
# .env.local のキーを設定後
# STRIPE_SECRET_KEY=sk_test_... を設定
npm run supabase:functions:serve
```

Stripe テストカード（MVP 検証用）:

- カード番号: `4242 4242 4242 4242`
- 有効期限: 任意
- CVC: 任意

## 3. 起動

Metro:

```bash
npm run mobile:start
```

iOS:

```bash
npm run mobile:ios
```

## 4. DB 設計の実装内容（MVP）

`supabase/migrations/20260216121000_init_mvp.sql` に以下を実装済みです。

- `profiles` / `contracts` / `violations` / `ledger_entries`
- 制約:
  - 1 ユーザー 1 active 契約（partial unique index）
  - 1 日 1 違反（`unique(contract_id, date)`）
- RLS（自分の行のみアクセス）
- `record_violation` 関数（冪等: 新規違反時のみ penalty 台帳を追加）
- `auth.users` 作成時の `profiles` 自動作成トリガ

## 5. Edge Function

`supabase/functions/record-violation/index.ts` を実装済みです。

- Bearer token を検証してユーザー特定
- RPC `public.record_violation(...)` を呼び出し
- 多重発火時でも DB 側制約で 1 日 1 回のみ減算

## 6. 次に実装する項目（推奨順）

1. Sign in with Apple の実装（RN + Supabase Auth）
2. 契約作成時の `contracts` / `ledger_entries(deposit)` 挿入
3. `record-violation` 呼び出しと Dashboard 再取得ロジック
4. モック状態管理の永続化（必要なら AsyncStorage）

Screen Time API は現行 MVP ではモック運用です。将来ネイティブ連携を再開する場合は `docs/ios-capabilities.md` を参照してください。

契約作成フローの金額仕様:

- 日次ペナルティは `500〜2000` 円を `100` 円刻みで選択
- デポジット総額は常に `日次ペナルティ × 7`

## 7. CI / CD

- **CI** (`.github/workflows/ci.yml`): `main` / `develop` への push/PR 時に lint, typecheck, test, format check を実行
- **CD** (`.github/workflows/cd.yml`): `main` の `supabase/*` 変更時に Supabase へデプロイ（Secrets 設定が必要）

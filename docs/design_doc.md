# YOHAKU 設計ドキュメント（現行MVP）

## 1. 目的

YOHAKU は、スマホ利用に「契約」と「金銭コミットメント（モック）」を組み合わせ、
ユーザーが時間の余白を作れるようにする iOS 向けアプリです。

現行MVPでは、安定して再現できることを最優先にしています。

## 2. 現在のスコープ

- 対応: iOS（React Native）
- 認証: Supabase 匿名セッション
- 契約: 1ユーザー1アクティブ契約
- 違反: 契約ごとに1日1回まで
- 日付基準: モック日付（再現性を優先）
- シールド: 疑似シールドUI（OSレベルロックではない）

## 3. システム構成

### 3.1 モバイルアプリ（React Native）

- 画面遷移とUI
- 使用時間シミュレーション
- モック日付の進行
- Supabase 連携（契約・違反・台帳）

### 3.2 Supabase

- Auth（匿名認証）
- DB（`profiles`, `contracts`, `violations`, `ledger_entries`）
- RPC（`record_violation(...)`）
- Edge Functions
  - `create-contract`
  - `record-violation`
  - `create-payment-intent`（テスト決済導線）

## 4. データ整合性

主な制約:

- 1ユーザー1アクティブ契約（partial unique index）
- 1契約1日1違反（`unique(contract_id, date)`）
- 残高は `ledger_entries` 集計で算出

契約ライフサイクル:

1. 契約作成（7日）
2. 日次違反記録（冪等）
3. 契約期間終了で completed
4. 次の契約を再作成

## 5. 現在の重要実装方針

### 5.1 モック日付の統一

不整合を防ぐため、契約・違反・表示はモック日付を基準に統一しています。

- `create-contract` 呼び出し時に `clientNowIso` / `clientLocalDate` を送信
- Edge Function 側でこの値を基準に契約期間と台帳日付を決定
- 期限切れ active 契約は新規作成前に completed 化

### 5.2 契約作成後の同期

契約作成後に以下を同期し、Dashboard 表示のズレを抑制します。

- active 契約
- violations
- ledger_entries

### 5.3 起動時の契約復元

アプリ起動時に Supabase の active 契約を確認し、存在する場合は Dashboard に遷移します。

### 5.4 契約フローと金額選択

- 画面遷移: `PickApps -> CreateContract -> Payment -> ConfirmContract -> Dashboard`
- 日次ペナルティは `500〜2000` 円を `100` 円刻みで選択
- デポジット総額は `penalty_per_day * 7` を利用
- 最終確認画面で決済成功後に契約を作成

## 6. 現時点で対象外

- Sign in with Apple の本番運用
- OSレベルの Screen Time ロック
- 実決済・実返金
- Android / Web 展開

## 7. 既知のトレードオフ

- 疑似シールドはUX表現であり、OS強制ロックではない
- サーバー再取得が入るため、反映に短い遅延が出る場合がある
- 再現性を優先し、実時間ベース挙動とは一部差がある

## 8. 参照

- ビルド手順: `docs/build-guide.md`
- iOS capability: `docs/ios-capabilities.md`

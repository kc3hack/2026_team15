# Yohaku 設計ドキュメント（現行MVP）

## 1. プロダクトの本質

Yohaku は「スマホ利用時間を減らすこと」自体を目的にしたアプリではありません。  
目的は、ユーザーが本当にやりたいことへ向かうための「時間と心の余白」を取り戻すことです。

そのために、以下を中核に置きます。

- 1週間単位の契約
- 金銭コミットメント
- 日次の達成/違反判定
- 行動継続を支える状態可視化

## 2. 現行MVPスコープ

- 対応: iOS（React Native）
- 認証: Supabase 匿名セッション
- 契約: 1ユーザー1アクティブ契約
- 違反: 契約ごとに1日1回まで
- 日付基準: モック日付（再現性優先）
- ロック体験: 疑似シールドUI（OSレベルの強制ロックではない）
- 通知: 閾値到達通知（重複抑止あり）

## 3. システム構成

### 3.1 モバイルアプリ（React Native）

- 画面遷移とUI
- 使用時間シミュレーション
- モック日付の進行
- 契約/違反/台帳の表示
- Shared state 同期による疑似ロック再現

### 3.2 Supabase

- Auth（匿名認証）
- DB（`profiles`, `contracts`, `violations`, `ledger_entries`）
- RPC（`record_violation(...)`）
- Edge Functions
  - `create-payment-intent`
  - `create-contract`
  - `record-violation`

### 3.3 Stripe（MVPで接続済み）

- PaymentIntent 作成
- 契約作成時に PaymentIntent 検証
- ただし最終的な課金確定/返金運用はMVPではモック（テスト運用前提）

## 4. データ整合性と運用ロジック

### 4.1 主な制約

- 1ユーザー1アクティブ契約（partial unique index）
- 1契約1日1違反（`unique(contract_id, date)`）
- 残高は `ledger_entries` 集計で算出

### 4.2 契約ライフサイクル

1. 契約作成（7日）
2. 日次違反記録（冪等）
3. 契約期間終了で `completed`
4. 次契約を新規作成

### 4.3 重要実装方針

- モック日付の統一
  - `clientNowIso` / `clientLocalDate` を送信
  - サーバー側で契約期間・台帳日付を同一基準で処理
- 契約作成後の再同期
  - active契約 / violations / ledger_entries を再取得
- 起動時復元
  - 既存 active 契約があれば Dashboard 遷移

## 5. MVP制約と本実装移行

### 5.1 MVPで制約している点

- Screen Time API（FamilyControls / ManagedSettings / DeviceActivity）の本連携未実装
- OSレベルの強制ロック未実装
- 実決済の最終精算（capture/cancel）未適用

### 5.2 本実装移行時に追加する主な要素

- iOSネイティブ連携の追加実装
  - 対象選択、監視、制限適用をOS APIへ接続
- Apple審査要件に沿った運用整理
  - Capability/Provisioning の整備
  - 利用規約・課金説明の明確化
- 決済精算の本番運用
  - 違反分の確定
  - 達成分の取消/返金

### 5.3 運用可能性について

MVPではロック適用レイヤーをモック化していますが、  
契約・違反・日次判定・台帳反映・同期ロジックは既に完成しています。  
そのため、ネイティブ接続を追加した本実装へ段階移行しやすく、既存ロジックの大部分を再利用できる構造です。

## 6. Apple審査を見据えた方針

- 金銭コミットメントの行き先は、Apple審査を考慮し、公式に認められた非営利団体への拠出を想定
- 実運用時は、審査ガイドライン・法務要件に合わせて最終定義する

## 7. UI/UX設計思想

- 彩度を落とした素朴なトーンで、刺激を抑える
- 目的は「開いて楽しいUI」ではなく「衝動を起こしにくいUI」
- 今日/今週の状態を即時理解できる情報設計
  - 使用量
  - 違反状態
  - 残高と支払額

## 8. 既知のトレードオフ

- 疑似シールドはUX再現であり、OS強制ロックではない
- サーバー再取得を伴うため短い反映遅延が発生する場合がある
- 再現性優先のため、実時間挙動とは一部差がある

## 9. 参照

- ルート概要: `README.md`
- ビルド手順: `docs/build-guide.md`
- iOS capability: `docs/ios-capabilities.md`

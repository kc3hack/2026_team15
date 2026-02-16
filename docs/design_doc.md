---

# 🟦 ヨハク（YOHAKU）

# 最終 基本設計書（MVP）

---

## 1. 概要

### 1.1 プロダクト名

**ヨハク（YOHAKU）**

### 1.2 目的

ユーザーが本当に欲しい「時間と心の余白」を得るために、
s
スマホ利用を**契約構造と金銭的コミットメント（モック）**で制御する。

### 1.3 MVPスコープ

- 対象OS：**iOSのみ**
- フロント：React Native + TypeScript
- ネイティブ機能：Swift（Screen Time API）
- Backend：Supabase
- 決済：**モック（ledger台帳）**
- 制限単位：**アプリ単位**
- 契約：**1週間固定**
- 同時契約：**1ユーザー1件のみ（DB制約）**
- 判定：**1日1違反のみ記録**

---

## 2. システム構成

### 2.1 アーキテクチャ

### モバイル（RN + TS）

- 画面UI
- Supabase通信
- Swiftブリッジ呼び出し
- 超過イベント受信
- 状態管理

### iOSネイティブ（Swift）

- Screen Time許可
- アプリ選択
- 使用時間監視
- Shield適用
- 超過イベント通知

### Supabase

- Auth（Sign in with Apple）
- DB（profiles / contracts / violations / ledger_entries）
- Edge Functions（違反冪等処理）

---

## 3. 機能一覧（MVP）

1. Appleログイン
2. Screen Time許可
3. 制限対象アプリ選択
4. 契約作成（1週間）
5. デポジット（モック）生成
6. 使用時間監視
7. 超過時ロック
8. 違反記録（1日1回）
9. 翌日リセット
10. ダッシュボード表示（契約中／終了状態切替）

---

## 4. 画面構成（最終）

1. Login
2. Permission
3. Pick Apps
4. Create Contract
5. **Dashboard（Home + Summary統合）**

※ WeeklySummaryは独立画面にしない

---

# 🟦 最終 詳細設計書（MVP）

---

# 1. 画面詳細設計

---

## 1.1 Login

- Sign in with Apple
- 成功後 → profiles作成（存在しなければ）

---

## 1.2 Permission

- Screen Time許可ボタン
- `requestAuthorization()` 呼び出し

---

## 1.3 Pick Apps

- `presentAppPicker()`
- bundle IDs取得
- ローカル保持

---

## 1.4 Create Contract

### 入力

- 日次上限時間（秒）
- 固定ペナルティ 500円/日

### 表示

- デポジット総額（500 × 7 = 3500）

### 処理

1. contracts insert
2. ledger_entries に deposit +3500
3. `startMonitoring()` 呼び出し
4. Dashboardへ遷移

---

# 2. Dashboard（統合設計）

Dashboardは状態によってUIを切替。

---

## 2.1 契約中（status = active）

表示内容：

### セクション：契約情報

- 残り日数（end_at - now）
- 日次上限時間
- 制限対象アプリ

### セクション：今日

- 今日の状態（未超過 / 違反済）
- 今日の残り時間（任意）
- 違反済なら警告表示

### セクション：今週

- 失敗日数
- 残高（ledger合計）

---

## 2.2 契約終了（status = completed）

同一画面で表示変更：

- 今週の失敗日数
- 総ペナルティ
- 最終残高
- 「契約完了」表示
- 「新しい契約を開始」ボタン

---

# 3. データベース詳細設計

---

## 3.1 profiles

| カラム | 型 | 備考 |
| --- | --- | --- |
| id | uuid | auth.users.id |
| apple_user_id | text | 任意 |
| stripe_customer_id | text | 将来用 |
| created_at | timestamptz |  |
| updated_at | timestamptz |  |

---

## 3.2 contracts

| カラム | 型 | 備考 |
| --- | --- | --- |
| id | uuid | PK |
| user_id | uuid | FK |
| start_at | timestamptz |  |
| end_at | timestamptz |  |
| daily_limit_seconds | int |  |
| penalty_per_day | int | 500 |
| deposit_total | int | 3500 |
| status | text | active/completed/canceled |
| selected_apps | jsonb | bundle ids |
| selected_categories | jsonb | nullable |

### 制約

- `status='active'` は user_id につき1件
- `end_at > start_at`

---

## 3.3 violations

| カラム | 型 |
| --- | --- |
| id | uuid |
| contract_id | uuid |
| user_id | uuid |
| date | date |
| exceeded_at | timestamptz |
| penalty_amount | int |

### 制約

- `unique(contract_id, date)`

---

## 3.4 ledger_entries

| カラム | 型 |
| --- | --- |
| id | uuid |
| user_id | uuid |
| contract_id | uuid |
| type | text |
| amount | int |
| local_date | date |
| note | text |
| created_at | timestamptz |

### type

- deposit
- penalty
- refund_mock

---

# 4. ロジック詳細

---

## 4.1 契約作成フロー

1. active契約存在チェック（DB制約あり）
2. contracts insert
3. ledger deposit追加
4. 監視開始

---

## 4.2 超過時処理

Swift：

- Shield適用
- `onLimitExceeded`送信

RN：

1. `record-violation` Edge Function呼び出し
2. violations upsert
3. ledger -500
4. Dashboard再取得

---

## 4.3 冪等性保証

- violationsに `unique(contract_id, date)`
- Edge Functionで新規作成時のみledger減算

---

## 4.4 残高計算

```
SELECT SUM(amount)
FROM ledger_entries
WHERE contract_id = ?
```

---

## 4.5 日次リセット

- localDate基準
- 日付変更でShield解除
- 監視再設定

---

# 5. 非機能設計

---

## 5.1 整合性

- 同時active契約1件
- 1日1違反保証

---

## 5.2 信頼性

- 超過多重発火でも1回のみ減算
- ネット復帰時再同期

---

## 5.3 セキュリティ

- RLSで自分の行のみアクセス
- 決済情報は扱わない（モック）

---

# 6. Definition of Done

- Appleログイン成功
- Screen Time許可取得
- 制限対象アプリ選択可能
- 契約作成成功
- 超過でShield適用
- 1日1回のみ減算
- 残高表示が正確
- 契約終了状態をDashboardで表示

---

# 最終構成まとめ

- 画面：5画面
- DB：4テーブル
- 制約：2つ（active一件 / 1日1違反）
- 決済：モック
- SummaryはDashboardに統合s
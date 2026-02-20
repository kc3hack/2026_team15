---
# 🟦 ヨハク（YOHAKU）

# 最終 基本設計書（MVP）
---

## 1. 概要

### 1.1 プロダクト名

**ヨハク（YOHAKU）**

### 1.2 目的

ユーザーが本当に欲しい「時間と心の余白」を得るために、
スマホ利用を**契約構造と金銭的コミットメント（モック）**で制御する。

### 1.3 MVP スコープ

- 対象 OS：**iOS のみ**
- フロント：React Native + TypeScript
- ネイティブ機能：Swift（Screen Time API）
- Backend：Supabase
- 決済：**モック（ledger 台帳）**
- 制限単位：**アプリ単位**
- 契約：**1 週間固定**
- 同時契約：**1 ユーザー 1 件のみ（DB 制約）**
- 判定：**1 日 1 違反のみ記録**

---

## 2. システム構成

### 2.1 アーキテクチャ

### モバイル（RN + TS）

- 画面 UI
- Supabase 通信
- Swift ブリッジ呼び出し
- 超過イベント受信
- 状態管理

### iOS ネイティブ（Swift）

- Screen Time 許可
- アプリ選択
- 使用時間監視
- Shield 適用
- 超過イベント通知

### Supabase

- Auth（Sign in with Apple）
- DB（profiles / contracts / violations / ledger_entries）
- Edge Functions（違反冪等処理）

---

## 3. 機能一覧（MVP）

1. Apple ログイン
2. Screen Time 許可
3. 制限対象アプリ選択
4. 契約作成（1 週間）
5. デポジット（モック）生成
6. 使用時間監視
7. 超過時ロック
8. 違反記録（1 日 1 回）
9. 翌日リセット
10. ダッシュボード表示（契約中／終了状態切替）

---

## 4. 画面構成（最終）

1. Login
2. Permission
3. Pick Apps
4. Create Contract
5. Payment
6. Confirm Contract
7. **Dashboard（Home + Summary 統合）**

※ WeeklySummary は独立画面にしない

---

# 🟦 最終 詳細設計書（MVP）

---

# 1. 画面詳細設計

---

## 1.1 Login

- Sign in with Apple
- 成功後 → profiles 作成（存在しなければ）

---

## 1.2 Permission

- Screen Time 許可ボタン
- `requestAuthorization()` 呼び出し

---

## 1.3 Pick Apps

- `presentAppPicker()`
- bundle IDs 取得
- ローカル保持

---

## 1.4 Create Contract

### 入力

- 日次上限時間（秒）
- 日次ペナルティ（500〜2000 円、100 円刻み）

### 表示

- デポジット総額（選択した日次ペナルティ × 7）

### 処理

1. contracts insert
2. ledger_entries に deposit +(日次ペナルティ × 7)
3. `startMonitoring()` 呼び出し
4. Dashboard へ遷移

---

# 2. Dashboard（統合設計）

Dashboard は状態によって UI を切替。

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
- 残高（ledger 合計）

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

| カラム             | 型          | 備考          |
| ------------------ | ----------- | ------------- |
| id                 | uuid        | auth.users.id |
| apple_user_id      | text        | 任意          |
| stripe_customer_id | text        | 将来用        |
| created_at         | timestamptz |               |
| updated_at         | timestamptz |               |

---

## 3.2 contracts

| カラム              | 型          | 備考                      |
| ------------------- | ----------- | ------------------------- |
| id                  | uuid        | PK                        |
| user_id             | uuid        | FK                        |
| start_at            | timestamptz |                           |
| end_at              | timestamptz |                           |
| daily_limit_seconds | int         |                           |
| penalty_per_day     | int         | 500〜2000（100刻み）      |
| deposit_total       | int         | penalty_per_day × 7       |
| status              | text        | active/completed/canceled |
| selected_apps       | jsonb       | bundle ids                |
| selected_categories | jsonb       | nullable                  |

### 制約

- `status='active'` は user_id につき 1 件
- `end_at > start_at`

---

## 3.3 violations

| カラム         | 型          |
| -------------- | ----------- |
| id             | uuid        |
| contract_id    | uuid        |
| user_id        | uuid        |
| date           | date        |
| exceeded_at    | timestamptz |
| penalty_amount | int         |

### 制約

- `unique(contract_id, date)`

---

## 3.4 ledger_entries

| カラム      | 型          |
| ----------- | ----------- |
| id          | uuid        |
| user_id     | uuid        |
| contract_id | uuid        |
| type        | text        |
| amount      | int         |
| local_date  | date        |
| note        | text        |
| created_at  | timestamptz |

### type

- deposit
- penalty
- refund_mock

---

# 4. ロジック詳細

---

## 4.1 契約作成フロー

1. active 契約存在チェック（DB 制約あり）
2. contracts insert
3. ledger deposit 追加
4. 監視開始

---

## 4.2 超過時処理

Swift：

- Shield 適用
- `onLimitExceeded`送信

RN：

1. `record-violation` Edge Function 呼び出し
2. violations upsert
3. ledger -penalty_per_day
4. Dashboard 再取得

---

## 4.3 冪等性保証

- violations に `unique(contract_id, date)`
- Edge Function で新規作成時のみ ledger 減算

---

## 4.4 残高計算

```
SELECT SUM(amount)
FROM ledger_entries
WHERE contract_id = ?
```

---

## 4.5 日次リセット

- localDate 基準
- 日付変更で Shield 解除
- 監視再設定

---

# 5. 非機能設計

---

## 5.1 整合性

- 同時 active 契約 1 件
- 1 日 1 違反保証

---

## 5.2 信頼性

- 超過多重発火でも 1 回のみ減算
- ネット復帰時再同期

---

## 5.3 セキュリティ

- RLS で自分の行のみアクセス
- 決済情報は扱わない（モック）

---

# 6. Definition of Done

- Apple ログイン成功
- Screen Time 許可取得
- 制限対象アプリ選択可能
- 契約作成成功
- 超過で Shield 適用
- 1 日 1 回のみ減算
- 残高表示が正確
- 契約終了状態を Dashboard で表示

---

# 最終構成まとめ

- 画面：5 画面
- DB：4 テーブル
- 制約：2 つ（active 一件 / 1 日 1 違反）
- 決済：モック
- Summary は Dashboard に統合 s

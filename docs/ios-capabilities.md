# iOS Capability Checklist（YOHAKU）

現行 MVP は **Screen Time API をモックで代替**しています。
このドキュメントは、将来ネイティブ連携を再開する場合のメモです。

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

- 現行モック実装: `mobile/src/lib/mock-store.ts`
- 画面フロー連携: `mobile/src/lib/app-context.tsx`
- ネイティブ連携の将来入口: `mobile/src/native/screenTime.ts`

## 5. 現行方針（develop）

- 許可取得 / アプリ選択 / 使用時間監視 / ロックはすべてモックで検証
- 実機の Screen Time capability は現時点では必須ではない
- ハッカソン期間中は UI/状態遷移/契約ロジックの完成度を優先

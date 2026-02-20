# iOS Capabilities and Limits

This document explains what is currently used and what is optional for future expansion.

## 1. Current Demo Mode

Current MVP works without enabling Screen Time capabilities.

- Usage and blocking are simulated in app logic
- Shield behavior is pseudo UI flow
- No OS-enforced app lock is applied

For current demo builds, required focus is:

- valid Xcode signing
- stable runtime/build setup

## 2. Required for Build

For `run-ios` / Xcode run:

1. Open `mobile/ios/mobile.xcworkspace`
2. Select target `mobile`
3. Set `Team` in Signing & Capabilities
4. Set unique Bundle Identifier
5. Enable `Automatically manage signing`

## 3. Optional Future Native Integration

If you move from pseudo shield to native Screen Time integration, review and enable:

- FamilyControls
- ManagedSettings
- DeviceActivity

And update Apple Developer portal setup:

- App ID capability updates
- provisioning profile regeneration

## 4. Code Entry Points

- Current mock source: `mobile/src/lib/mock-store.ts`
- Current app flow control: `mobile/src/lib/app-context.tsx`
- Native bridge entry stub: `mobile/src/native/screenTime.ts`

## 5. Recommendation

For hackathon/demo timeline:

- keep current pseudo shield mode
- avoid native capability expansion unless mandatory
- prioritize state consistency and demo reliability

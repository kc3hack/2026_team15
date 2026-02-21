import Foundation
import React

@objc(SharedLockStateModule)
class SharedLockStateModule: NSObject {
  private let groupId = "group.com.yohaku.shared"

  @objc
  func saveLockState(
    _ payload: NSDictionary,
    resolver resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    guard let sharedDefaults = UserDefaults(suiteName: groupId) else {
      reject("shared_defaults_unavailable", "Failed to access shared UserDefaults", nil)
      return
    }

    sharedDefaults.set(payload["syncEnabled"] as? Bool ?? false, forKey: "yohaku.syncEnabled")
    sharedDefaults.set(payload["dailyLimitSeconds"] as? Int ?? 0, forKey: "yohaku.dailyLimitSeconds")
    sharedDefaults.set(payload["todayUsageSeconds"] as? Int ?? 0, forKey: "yohaku.todayUsageSeconds")
    sharedDefaults.set(payload["isBlocked"] as? Bool ?? false, forKey: "yohaku.isBlocked")
    sharedDefaults.set(payload["localDate"] as? String ?? "", forKey: "yohaku.localDate")
    sharedDefaults.set(payload["updatedAt"] as? String ?? "", forKey: "yohaku.updatedAt")

    resolve(nil)
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}

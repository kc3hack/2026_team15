import Foundation
import Combine

class LockManager: ObservableObject {
    static let shared = LockManager()

    private let appGroupId = "group.com.yohaku.shared"
    private let defaults = UserDefaults.standard
    private var sharedDefaults: UserDefaults? {
        UserDefaults(suiteName: appGroupId)
    }
    private let usageKey = "lockapp.usage_seconds"
    private let limitKey = "lockapp.limit_seconds"
    private let dateKey = "lockapp.date"
    private let syncEnabledKey = "yohaku.syncEnabled"
    private let sharedUsageKey = "yohaku.todayUsageSeconds"
    private let sharedLimitKey = "yohaku.dailyLimitSeconds"
    private let sharedBlockedKey = "yohaku.isBlocked"
    private let sharedDateKey = "yohaku.localDate"

    @Published var usageSeconds: Int = 0
    @Published var limitSeconds: Int = 3600 // Default: 1 hour
    @Published var isLocked: Bool = false
    @Published var currentDate: String = ""

    private init() {
        loadState()
        checkDateChange()
    }

    private func loadState() {
        if let shared = sharedDefaults,
           shared.bool(forKey: syncEnabledKey) {
            usageSeconds = shared.integer(forKey: sharedUsageKey)
            let sharedLimit = shared.integer(forKey: sharedLimitKey)
            limitSeconds = sharedLimit > 0 ? sharedLimit : 3600
            currentDate = shared.string(forKey: sharedDateKey) ?? getTodayString()
            isLocked = shared.bool(forKey: sharedBlockedKey)
            return
        }

        usageSeconds = defaults.integer(forKey: usageKey)
        limitSeconds = defaults.integer(forKey: limitKey)
        if limitSeconds == 0 {
            limitSeconds = 3600 // Default 1 hour
        }
        currentDate = defaults.string(forKey: dateKey) ?? getTodayString()
        updateLockStatus()
    }

    private func saveState() {
        defaults.set(usageSeconds, forKey: usageKey)
        defaults.set(limitSeconds, forKey: limitKey)
        defaults.set(currentDate, forKey: dateKey)
    }

    private func getTodayString() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: Date())
    }

    private func checkDateChange() {
        if let shared = sharedDefaults,
           shared.bool(forKey: syncEnabledKey) {
            // In synced mode, source of truth is mobile app state.
            return
        }
        let today = getTodayString()
        if currentDate != today {
            // New day - reset usage
            usageSeconds = 0
            currentDate = today
            isLocked = false
            saveState()
        }
    }

    private func updateLockStatus() {
        isLocked = usageSeconds >= limitSeconds
    }

    // MARK: - Public Methods

    func refreshState() {
        loadState()
        checkDateChange()
        updateLockStatus()
    }

    func setLimit(seconds: Int) {
        limitSeconds = max(60, seconds) // Minimum 1 minute
        saveState()
        updateLockStatus()
    }

    func setLimit(minutes: Int) {
        setLimit(seconds: minutes * 60)
    }

    func addUsage(seconds: Int) {
        checkDateChange()
        usageSeconds += seconds
        saveState()
        updateLockStatus()
    }

    func simulateUsage(minutes: Int) {
        addUsage(seconds: minutes * 60)
    }

    func resetUsage() {
        usageSeconds = 0
        isLocked = false
        saveState()
    }

    func resetAll() {
        usageSeconds = 0
        limitSeconds = 3600
        currentDate = getTodayString()
        isLocked = false
        saveState()
    }

    // MARK: - Formatted Values

    var usageFormatted: String {
        let hours = usageSeconds / 3600
        let minutes = (usageSeconds % 3600) / 60
        if hours > 0 {
            return "\(hours)h \(minutes)m"
        }
        return "\(minutes)m"
    }

    var limitFormatted: String {
        let hours = limitSeconds / 3600
        let minutes = (limitSeconds % 3600) / 60
        if hours > 0 {
            return "\(hours)h \(minutes)m"
        }
        return "\(minutes)m"
    }

    var remainingSeconds: Int {
        return max(0, limitSeconds - usageSeconds)
    }

    var remainingFormatted: String {
        let remaining = remainingSeconds
        let hours = remaining / 3600
        let minutes = (remaining % 3600) / 60
        if hours > 0 {
            return "\(hours)h \(minutes)m"
        }
        return "\(minutes)m"
    }

    var progress: Double {
        guard limitSeconds > 0 else { return 0 }
        return min(1.0, Double(usageSeconds) / Double(limitSeconds))
    }
}

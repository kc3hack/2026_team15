import SwiftUI

struct SettingsView: View {
    @StateObject private var lockManager = LockManager.shared
    @Environment(\.dismiss) private var dismiss

    @State private var limitMinutes: String = ""
    @State private var simulateMinutes: String = ""

    var body: some View {
        NavigationView {
            Form {
                // Current Status
                Section(header: Text("Current Status")) {
                    HStack {
                        Text("Usage")
                        Spacer()
                        Text(lockManager.usageFormatted)
                            .foregroundColor(.gray)
                    }

                    HStack {
                        Text("Limit")
                        Spacer()
                        Text(lockManager.limitFormatted)
                            .foregroundColor(.gray)
                    }

                    HStack {
                        Text("Remaining")
                        Spacer()
                        Text(lockManager.remainingFormatted)
                            .foregroundColor(lockManager.isLocked ? .red : .green)
                    }

                    HStack {
                        Text("Status")
                        Spacer()
                        Text(lockManager.isLocked ? "LOCKED" : "Unlocked")
                            .fontWeight(.semibold)
                            .foregroundColor(lockManager.isLocked ? .red : .green)
                    }
                }

                // Set Limit
                Section(header: Text("Set Daily Limit")) {
                    HStack {
                        Text("Minutes")
                        TextField("e.g. 60", text: $limitMinutes)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                    }

                    Button("Apply Limit") {
                        if let minutes = Int(limitMinutes), minutes > 0 {
                            lockManager.setLimit(minutes: minutes)
                            limitMinutes = ""
                        }
                    }
                    .disabled(limitMinutes.isEmpty || Int(limitMinutes) == nil)
                }

                // Simulate Usage (for testing)
                Section(header: Text("Simulate Usage (Testing)")) {
                    HStack {
                        Text("Add Minutes")
                        TextField("e.g. 30", text: $simulateMinutes)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                    }

                    Button("Add Usage") {
                        if let minutes = Int(simulateMinutes), minutes > 0 {
                            lockManager.simulateUsage(minutes: minutes)
                            simulateMinutes = ""
                        }
                    }
                    .disabled(simulateMinutes.isEmpty || Int(simulateMinutes) == nil)

                    Button("Quick Add 30 min") {
                        lockManager.simulateUsage(minutes: 30)
                    }

                    Button("Quick Add 1 hour") {
                        lockManager.simulateUsage(minutes: 60)
                    }
                }

                // Reset
                Section(header: Text("Reset")) {
                    Button("Reset Today's Usage") {
                        lockManager.resetUsage()
                    }
                    .foregroundColor(.orange)

                    Button("Reset All Settings") {
                        lockManager.resetAll()
                    }
                    .foregroundColor(.red)
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

#Preview {
    SettingsView()
}

import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Smartphone } from "lucide-react";
import { useState } from "react";

// モックアプリデータ
const MOCK_APPS = [
  { id: "com.instagram.app", name: "Instagram", icon: "📷" },
  { id: "com.twitter.app", name: "Twitter", icon: "🐦" },
  { id: "com.tiktok.app", name: "TikTok", icon: "🎵" },
  { id: "com.youtube.app", name: "YouTube", icon: "📺" },
  { id: "com.facebook.app", name: "Facebook", icon: "👥" },
  { id: "com.reddit.app", name: "Reddit", icon: "🤖" },
  { id: "com.netflix.app", name: "Netflix", icon: "🎬" },
  { id: "com.games.app", name: "Game Center", icon: "🎮" },
];

export default function PickApps() {
  const navigate = useNavigate();
  const [selectedApps, setSelectedApps] = useState<string[]>([]);

  const toggleApp = (appId: string) => {
    setSelectedApps((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId]
    );
  };

  const handleContinue = () => {
    if (selectedApps.length > 0) {
      // ローカルストレージに保存（モック）
      localStorage.setItem("selectedApps", JSON.stringify(selectedApps));
      navigate("/create-contract");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="text-center space-y-3">
          <div className="inline-block p-6 bg-blue-50 rounded-full">
            <Smartphone className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            制限するアプリを選択
          </h1>
          <p className="text-base text-gray-600">
            使用時間を制限したいアプリを選んでください
          </p>
        </div>

        {/* アプリリスト */}
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
          {MOCK_APPS.map((app) => (
            <label
              key={app.id}
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <Checkbox
                checked={selectedApps.includes(app.id)}
                onCheckedChange={() => toggleApp(app.id)}
              />
              <div className="flex items-center gap-3 flex-1">
                <span className="text-3xl">{app.icon}</span>
                <span className="font-medium text-gray-900">{app.name}</span>
              </div>
            </label>
          ))}
        </div>

        {/* 選択数表示 */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {selectedApps.length > 0
              ? `${selectedApps.length}個のアプリを選択中`
              : "アプリを選択してください"}
          </p>
        </div>

        {/* 次へボタン */}
        <Button
          onClick={handleContinue}
          disabled={selectedApps.length === 0}
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-base rounded-xl"
        >
          次へ
        </Button>
      </div>
    </div>
  );
}

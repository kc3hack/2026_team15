import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Shield, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function Permission() {
  const navigate = useNavigate();
  const [granted, setGranted] = useState(false);

  const handleRequestPermission = () => {
    // モック：Screen Time許可リクエスト
    setTimeout(() => {
      setGranted(true);
    }, 500);
  };

  const handleContinue = () => {
    navigate("/pick-apps");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* アイコン */}
        <div className="text-center">
          <div className="inline-block p-8 bg-blue-50 rounded-full">
            <Shield className="w-16 h-16 text-blue-600" />
          </div>
        </div>

        {/* タイトル・説明 */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-gray-900">
            Screen Timeの許可
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            アプリの使用時間を監視し、設定した上限を超えた場合に制限をかけるため、Screen Time APIへのアクセス許可が必要です。
          </p>
        </div>

        {/* 説明リスト */}
        <div className="bg-white rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="font-semibold text-gray-900">この許可により：</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>アプリごとの使用時間を監視</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>上限超過時に自動ロック</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>契約に基づく使用制限</span>
            </li>
          </ul>
        </div>

        {/* ボタン */}
        <div className="space-y-3">
          {!granted ? (
            <Button
              onClick={handleRequestPermission}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-base rounded-xl"
            >
              許可をリクエスト
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-green-600 py-3">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">許可されました</span>
              </div>
              <Button
                onClick={handleContinue}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-base rounded-xl"
              >
                次へ
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Smartphone,
  DollarSign,
  TrendingDown,
} from "lucide-react";
import { useState, useEffect } from "react";

type ContractStatus = "active" | "completed";

export default function Dashboard() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<ContractStatus>("active");
  const [todayViolated, setTodayViolated] = useState(false);

  // モックデータ
  const contractData = {
    daysRemaining: 4,
    totalDays: 7,
    dailyLimitMinutes: 60,
    violationCount: 2,
    balance: 2500,
    depositTotal: 3500,
    penaltyPerDay: 500,
    selectedAppsCount: 5,
    todayUsedMinutes: 45,
  };

  useEffect(() => {
    // モック：ローカルストレージから契約データを読み込み
    const contract = localStorage.getItem("contract");
    if (!contract) {
      navigate("/");
    }
  }, [navigate]);

  const handleNewContract = () => {
    localStorage.removeItem("contract");
    navigate("/pick-apps");
  };

  const handleSimulateViolation = () => {
    setTodayViolated(true);
  };

  const progressPercent =
    ((contractData.totalDays - contractData.daysRemaining) /
      contractData.totalDays) *
    100;
  const usagePercent =
    (contractData.todayUsedMinutes / contractData.dailyLimitMinutes) * 100;

  if (status === "active") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* ヘッダー */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
              契約実行中
            </div>
          </div>

          {/* 契約情報 */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-indigo-600" />
              契約情報
            </h2>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">契約進捗</span>
                  <span className="text-sm font-semibold text-gray-900">
                    残り{contractData.daysRemaining}日
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">日次上限</p>
                  <p className="text-lg font-bold text-gray-900">
                    {contractData.dailyLimitMinutes}分
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">制限アプリ</p>
                  <p className="text-lg font-bold text-gray-900">
                    {contractData.selectedAppsCount}個
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 今日の状態 */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-600" />
              今日の状態
            </h2>

            {!todayViolated ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900">順調です！</p>
                    <p className="text-sm text-green-700">
                      今日はまだ上限を超過していません
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">今日の使用時間</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {contractData.todayUsedMinutes} / {contractData.dailyLimitMinutes}分
                    </span>
                  </div>
                  <Progress value={usagePercent} className="h-2" />
                  <p className="text-xs text-gray-500 mt-2">
                    残り {contractData.dailyLimitMinutes - contractData.todayUsedMinutes}分
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900">上限超過</p>
                  <p className="text-sm text-red-700">
                    今日は既に上限を超過しました（¥{contractData.penaltyPerDay}のペナルティ）
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 今週のサマリー */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-purple-600" />
              今週のサマリー
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">失敗日数</p>
                <p className="text-3xl font-bold text-red-600">
                  {contractData.violationCount}日
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">現在の残高</p>
                <p className="text-3xl font-bold text-blue-600">
                  ¥{contractData.balance.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">デポジット総額</span>
                <span className="font-semibold text-gray-900">
                  ¥{contractData.depositTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">累計ペナルティ</span>
                <span className="font-semibold text-red-600">
                  -¥{(contractData.violationCount * contractData.penaltyPerDay).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* デバッグ用ボタン */}
          <div className="flex gap-3">
            <Button
              onClick={handleSimulateViolation}
              variant="outline"
              className="flex-1"
              disabled={todayViolated}
            >
              違反をシミュレート
            </Button>
            <Button
              onClick={() => setStatus("completed")}
              variant="outline"
              className="flex-1"
            >
              契約完了を表示
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 契約完了状態
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="text-center space-y-3">
          <div className="inline-block p-8 bg-green-50 rounded-full">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">契約完了</h1>
          <p className="text-base text-gray-600">
            1週間の契約が終了しました
          </p>
        </div>

        {/* サマリーカード */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">最終結果</h2>

          <div className="space-y-4">
            {/* 成功率 */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">成功率</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-indigo-600">
                  {Math.round(
                    ((contractData.totalDays - contractData.violationCount) /
                      contractData.totalDays) *
                      100
                  )}
                  %
                </span>
              </div>
              <p className="text-sm text-gray-700 mt-2">
                {contractData.totalDays - contractData.violationCount}日/{contractData.totalDays}日 達成
              </p>
            </div>

            {/* 詳細 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">失敗日数</p>
                <p className="text-2xl font-bold text-red-600">
                  {contractData.violationCount}日
                </p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">総ペナルティ</p>
                <p className="text-2xl font-bold text-amber-600">
                  ¥{(contractData.violationCount * contractData.penaltyPerDay).toLocaleString()}
                </p>
              </div>
            </div>

            {/* 最終残高 */}
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
              <p className="text-sm text-gray-600 mb-2">最終残高</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-green-600">
                  ¥{contractData.balance.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 mt-2">
                デポジット ¥{contractData.depositTotal.toLocaleString()} から返金
              </p>
            </div>
          </div>
        </div>

        {/* メッセージ */}
        <div className="bg-blue-50 rounded-xl p-6 text-center">
          <p className="text-base text-gray-700 leading-relaxed">
            {contractData.violationCount <= 2
              ? "素晴らしい結果です！余白を保つことができました。"
              : "次回はもっと余白を作れるよう、頑張りましょう。"}
          </p>
        </div>

        {/* 新しい契約ボタン */}
        <Button
          onClick={handleNewContract}
          className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white text-base rounded-xl font-semibold"
        >
          新しい契約を開始
        </Button>
      </div>
    </div>
  );
}

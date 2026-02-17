import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Slider } from "../components/ui/slider";
import { FileText, Clock, DollarSign, Calendar, CreditCard, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// モック：実際のStripe Publishable Keyに置き換えてください
// テストモード: pk_test_... 本番モード: pk_live_...
const stripePromise = loadStripe("pk_test_MOCK_PUBLISHABLE_KEY_REPLACE_WITH_REAL_KEY");

// Stripeカードエレメントのスタイル
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#9e2146",
    },
  },
};

function PaymentForm({ 
  depositTotal, 
  onSuccess 
}: { 
  depositTotal: number; 
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    // モック：実際のStripe決済処理
    // 本来はここでcreatePaymentMethodやconfirmPaymentを呼ぶ
    setTimeout(() => {
      // モック成功
      setProcessing(false);
      onSuccess();
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-gray-600" />
          クレジットカード情報
        </h3>
        
        <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-400 transition-colors">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>💳 テストカード番号: 4242 4242 4242 4242</p>
          <p>📅 有効期限: 任意の未来の日付</p>
          <p>🔒 CVC: 任意の3桁</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-200">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">請求金額</p>
          <p className="text-4xl font-bold text-gray-900">
            ¥{depositTotal.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            デポジットとして一時的にお預かりします
          </p>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white text-base rounded-xl font-semibold"
      >
        {processing ? "処理中..." : "支払いを確定して契約開始"}
      </Button>
    </form>
  );
}

export default function CreateContract() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: 契約設定, 2: カード情報
  const [dailyLimitMinutes, setDailyLimitMinutes] = useState(60); // 分単位
  const penaltyPerDay = 500;
  const contractDays = 7;
  const depositTotal = penaltyPerDay * contractDays;

  const handleCreateContract = () => {
    // モック：契約作成処理
    const contractData = {
      dailyLimitSeconds: dailyLimitMinutes * 60,
      penaltyPerDay,
      depositTotal,
      startAt: new Date().toISOString(),
      endAt: new Date(Date.now() + contractDays * 24 * 60 * 60 * 1000).toISOString(),
    };
    localStorage.setItem("contract", JSON.stringify(contractData));
    navigate("/dashboard");
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}分`;
    if (mins === 0) return `${hours}時間`;
    return `${hours}時間${mins}分`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="text-center space-y-3">
          <div className="inline-block p-6 bg-indigo-50 rounded-full">
            <FileText className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">契約を作成</h1>
          <p className="text-base text-gray-600">
            {step === 1 ? "1週間の使用制限契約を設定します" : "支払い方法を登録"}
          </p>
          
          {/* ステップインジケーター */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step === 1 ? "bg-indigo-600 text-white" : "bg-green-500 text-white"
            }`}>
              1
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step === 2 ? "bg-indigo-600 text-white" : "bg-gray-300 text-gray-600"
            }`}>
              2
            </div>
          </div>
        </div>

        {step === 1 ? (
          <>
            {/* 設定カード */}
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              {/* 日次上限時間 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <label className="font-semibold text-gray-900">
                    1日の上限時間
                  </label>
                </div>
                <div className="space-y-3">
                  <Slider
                    value={[dailyLimitMinutes]}
                    onValueChange={(value) => setDailyLimitMinutes(value[0])}
                    min={15}
                    max={180}
                    step={15}
                    className="w-full"
                  />
                  <div className="text-center">
                    <span className="text-3xl font-bold text-indigo-600">
                      {formatTime(dailyLimitMinutes)}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      選択したアプリの合計利用時間
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-4">
                {/* 契約期間 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-5 h-5" />
                    <span>契約期間</span>
                  </div>
                  <span className="font-semibold text-gray-900">7日間</span>
                </div>

                {/* 1日あたりのペナルティ */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <DollarSign className="w-5 h-5" />
                    <span>超過時ペナルティ</span>
                  </div>
                  <span className="font-semibold text-gray-900">¥{penaltyPerDay}/日</span>
                </div>
              </div>
            </div>

            {/* デポジット情報 */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">デポジット総額</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">
                    ¥{depositTotal.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  契約開始時にデポジットを預け入れます。上限を超過した日数分のペナルティが差し引かれ、残額は契約終了時に返金されます。
                </p>
              </div>
            </div>

            {/* 注意事項 */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                ⚠️ 契約期間中は1ユーザー1件のみ。契約は途中キャンセルできません。1日1回の違反まで記録されます。
              </p>
            </div>

            {/* 次へボタン */}
            <Button
              onClick={() => setStep(2)}
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white text-base rounded-xl font-semibold"
            >
              次へ：支払い方法を登録
            </Button>
          </>
        ) : (
          <>
            {/* 戻るボタン */}
            <Button
              onClick={() => setStep(1)}
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              契約設定に戻る
            </Button>

            {/* Stripe Elements */}
            <Elements stripe={stripePromise}>
              <PaymentForm 
                depositTotal={depositTotal} 
                onSuccess={handleCreateContract} 
              />
            </Elements>

            {/* セキュリティ情報 */}
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-600 leading-relaxed">
                🔒 Stripeによる安全な決済処理<br />
                カード情報は暗号化され、当社サーバーには保存されません
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
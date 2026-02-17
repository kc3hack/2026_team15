import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Apple } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const handleAppleLogin = () => {
    // モック：実際のSign in with Apple処理
    navigate("/permission");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-12">
        {/* ロゴ・ヘッダー */}
        <div className="text-center space-y-4">
          <div className="inline-block p-6 bg-white rounded-3xl shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <span className="text-3xl font-bold text-white">余</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">ヨハク</h1>
          <p className="text-lg text-gray-600">
            時間と心の余白を取り戻す
          </p>
        </div>

        {/* ログインボタン */}
        <div className="space-y-6">
          <Button
            onClick={handleAppleLogin}
            className="w-full h-14 bg-black hover:bg-gray-800 text-white text-base flex items-center justify-center gap-3 rounded-xl"
          >
            <Apple className="w-6 h-6" />
            Sign in with Apple
          </Button>
          
          <p className="text-sm text-gray-500 text-center leading-relaxed">
            スマホ利用を契約構造と金銭的コミットメントで制御し、<br />
            本当に欲しい余白を手に入れましょう
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, RefreshCw, Monitor, Tablet, Smartphone } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d: {
    price: number[];
  };
}

export default function CryptoDashboard() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const fetchCryptoData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,ripple,solana&order=market_cap_desc&sparkline=true"
      );
      const data = await res.json();
      setCoins(data);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 60000);
    return () => clearInterval(interval);
  }, []);

  const getWidthClass = () => {
    if (viewMode === "mobile") return "max-w-[390px] border-x border-slate-800 shadow-2xl"; 
    if (viewMode === "tablet") return "max-w-[768px] border-x border-slate-800 shadow-xl";  
    return "max-w-7xl"; 
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-6 font-sans pb-32 flex flex-col items-center">
      
      {/* 📦 대시보드 본체 컨테이너 */}
      <div className={`w-full transition-all duration-300 bg-slate-950 px-1 ${getWidthClass()}`}>
        
        {/* 상단 헤더 */}
        <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-2 md:gap-3">
            <img 
              src="/logo.png" 
              alt="전업코인부자 로고" 
              className="w-8 h-8 md:w-9 md:h-9 object-contain rounded-lg" 
            />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">전업코인부자 대시보드</h1>
          </div>
          <button
            onClick={fetchCryptoData}
            disabled={loading}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "갱신 중..." : "새로고침"}
          </button>
        </header>

        {/* 메인 보드 컨텐츠 */}
        <main>
          {/* 섹터 타이틀 */}
          <div className="mb-4">
            <h2 className="text-base md:text-lg font-bold text-slate-200 flex items-center gap-2">
              📊 주요 암호화폐
            </h2>
          </div>

          {loading && coins.length === 0 ? (
            <div className="text-center text-slate-400 py-20">시세 및 차트 데이터를 불러오는 중입니다...</div>
          ) : (
            <div className={`grid gap-3 md:gap-6 ${
              viewMode === "mobile" 
                ? "grid-cols-2" 
                : viewMode === "tablet" 
                  ? "grid-cols-2" 
                  : "grid-cols-2 md:grid-cols-2 lg:grid-cols-4"
            }`}>
              {coins.map((coin) => {
                const isPositive = coin.price_change_percentage_24h >= 0;
                const chartData = coin.sparkline_in_7d?.price.map((p, index) => ({
                  id: index,
                  price: p,
                })) || [];

                return (
                  <div key={coin.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between">
                    <div>
                      {/* 💡 개편된 상단 영역: 이미지와 등락률 뱃지를 양 끝으로 완벽 격리 */}
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <img src={coin.image} alt={coin.name} className="w-7 h-7 rounded-full" />
                          <span className="text-[10px] text-slate-400 uppercase font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{coin.symbol}</span>
                        </div>
                        
                        <span className={`flex items-center gap-0.5 text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded ${
                          isPositive ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'
                        }`}>
                          {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                          {coin.price_change_percentage_24h.toFixed(1)}%
                        </span>
                      </div>

                      {/* 💡 코인 풀네임(이름)은 아래 단독 줄로 배치하여 가로폭 침범 차단 */}
                      <div className="mb-3">
                        <h2 className="font-bold text-sm sm:text-base tracking-tight text-slate-100 truncate">{coin.name}</h2>
                      </div>

                      {/* 현재 가격 */}
                      <div className="mb-2">
                        <p className="text-[10px] text-slate-400">현재 가격 (USD)</p>
                        <p className="text-base sm:text-xl font-mono font-bold text-slate-100 tracking-tight">
                          ${coin.current_price.toLocaleString(undefined, { 
                            minimumFractionDigits: coin.current_price < 10 ? 3 : 2,
                            maximumFractionDigits: coin.current_price < 10 ? 3 : 2 
                          })}
                        </p>
                      </div>

                      {/* 📊 미니 선 차트 (모바일 뷰모드일 때는 안 보임) */}
                      {viewMode !== "mobile" && (
                        <div className="hidden sm:block w-full h-20 my-3 bg-slate-950/40 rounded-lg p-2 border border-slate-800/50">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <YAxis domain={["dataMin", "dataMax"]} hide={true} />
                              <Line
                                type="monotone"
                                dataKey="price"
                                stroke={isPositive ? "#10b981" : "#f43f5e"}
                                strokeWidth={1.5}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>

                    {/* 하단 상세 지표 */}
                    <div className="grid grid-cols-2 gap-1 pt-2.5 border-t border-slate-800 text-[10px] sm:text-[11px] mt-2">
                      <div>
                        <p className="text-slate-500">시총</p>
                        <p className="font-mono text-slate-300">${(coin.market_cap / 1e9).toFixed(1)}B</p>
                      </div>
                      <div>
                        <p className="text-slate-500">거래량</p>
                        <p className="font-mono text-slate-300">${(coin.total_volume / 1e9).toFixed(1)}B</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* 🛠️ 하단 고정형 화면 테스팅 시뮬레이터 바 */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-4 py-2.5 sm:px-6 sm:py-3 rounded-2xl flex items-center gap-2 sm:gap-3 shadow-2xl z-50">
        <span className="hidden xs:inline text-xs text-slate-400 font-medium mr-1">테스트:</span>
        
        <button
          onClick={() => setViewMode("desktop")}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
            viewMode === "desktop" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
          }`}
        >
          <Monitor className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          데스크톱
        </button>

        <button
          onClick={() => setViewMode("tablet")}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
            viewMode === "tablet" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
          }`}
        >
          <Tablet className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          태블릿
        </button>

        <button
          onClick={() => setViewMode("mobile")}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
            viewMode === "mobile" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
          }`}
        >
          <Smartphone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          모바일
        </button>
      </div>

    </div>
  );
}
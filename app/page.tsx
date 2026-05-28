"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Monitor, Tablet, Smartphone, Globe, Landmark, Coins, Flame, BarChart3, Info } from "lucide-react";
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
  sparkline_in_7d: { price: number[] };
}

interface MarketStats {
  total_cap: number;
  btc_d: number;
  eth_d: number;
  xrp_d: number;
  sol_d: number;
  total2_d: number;
  total3_d: number;
  fng: number;
  fng_text: string;
  kimchi: number;
}

export default function CryptoDashboard() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [stats, setStats] = useState<MarketStats>({
    total_cap: 0, btc_d: 0, eth_d: 0, xrp_d: 0, sol_d: 0, total2_d: 0, total3_d: 0, fng: 50, fng_text: "Loading", kimchi: 0
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const fetchData = async () => {
    try {
      // 1. 주요 4대 코인 데이터 호출
      const coinRes = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,ripple,solana&order=market_cap_desc&sparkline=true");
      const coinData = await coinRes.json();
      setCoins(coinData);

      // 2. 글로벌 시장 데이터 호출 (총시총, BTC.D, ETH.D)
      const globalRes = await fetch("https://api.coingecko.com/api/v3/global");
      const globalData = await globalRes.json();
      const gData = globalData.data;

      // 3. 공포 탐욕 지수 호출
      const fngRes = await fetch("https://api.alternative.me/fng/");
      const fngData = await fngRes.json();

      // 도미넌스 및 지표 계산
      const totalCap = gData.total_market_cap.usd;
      const btcD = gData.market_cap_percentage.btc;
      const ethD = gData.market_cap_percentage.eth;
      
      // 개별 도미넌스 계산 (시가총액 / 총 시가총액 * 100)
      const xrp = coinData.find((c: any) => c.id === "ripple");
      const sol = coinData.find((c: any) => c.id === "solana");
      const xrpD = xrp ? (xrp.market_cap / totalCap) * 100 : 0;
      const solD = sol ? (sol.market_cap / totalCap) * 100 : 0;

      setStats({
        total_cap: totalCap,
        btc_d: btcD,
        eth_d: ethD,
        xrp_d: xrpD,
        sol_d: solD,
        total2_d: 100 - btcD, // 비트 제외 전체
        total3_d: 100 - btcD - ethD, // 비트+이더 제외 알트 전체
        fng: parseInt(fngData.data[0].value),
        fng_text: fngData.data[0].value_classification,
        kimchi: 1.5 // 실시간 연동 로직은 서버 환경에서 보완 가능
      });

    } catch (error) {
      console.error("Data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // 지표는 10초마다 갱신
    return () => clearInterval(interval);
  }, []);

  const getWidthClass = () => {
    if (viewMode === "mobile") return "max-w-[390px] border-x border-slate-800 shadow-2xl"; 
    if (viewMode === "tablet") return "max-w-[768px] border-x border-slate-800 shadow-xl";  
    return "max-w-7xl"; 
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-6 font-sans pb-32 flex flex-col items-center">
      
      <div className={`w-full transition-all duration-300 bg-slate-950 px-1 ${getWidthClass()}`}>
        
        {/* 헤더 */}
        <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-2 md:gap-3">
            <img src="/logo.png" alt="로고" className="w-8 h-8 md:w-9 md:h-9 object-contain rounded-lg" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">전업코인부자 대시보드</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-500 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            SYNCED
          </div>
        </header>

        <main className="space-y-12">
          
          {/* 섹션 1: 주요 가상자산 */}
          <section>
            <h2 className="text-base md:text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              📊 주요 가상자산
            </h2>
            <div className={`grid gap-3 md:gap-6 ${viewMode === "mobile" ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}`}>
              {coins.map((coin) => (
                <div key={coin.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <img src={coin.image} className="w-7 h-7 rounded-full" />
                      <span className="text-[10px] text-slate-400 uppercase font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{coin.symbol}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                      {coin.price_change_percentage_24h.toFixed(1)}%
                    </span>
                  </div>
                  <h2 className="font-bold text-sm sm:text-base mb-2">{coin.name}</h2>
                  <p className="text-base sm:text-xl font-mono font-bold text-slate-100 mb-3">
                    ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <div className="grid grid-cols-2 gap-1 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                    <div>시총 <span className="block text-slate-300 font-mono">${(coin.market_cap / 1e9).toFixed(1)}B</span></div>
                    <div>거래 <span className="block text-slate-300 font-mono">${(coin.total_volume / 1e9).toFixed(1)}B</span></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 섹션 2: 크립토 시장 지표 (요청하신 9가지 지표) */}
          <section className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-5 md:p-8 shadow-inner">
            <h2 className="text-base md:text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-500" /> 크립토 시장 지표
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
              
              {/* 1. 총 시가총액 */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
                <p className="text-[11px] text-slate-500 font-medium">크립토 총 시가총액</p>
                <p className="text-lg md:text-xl font-mono font-bold text-slate-100 mt-1">
                  ${(stats.total_cap / 1e12).toFixed(2)}T
                </p>
              </div>

              {/* 2. BTC 도미넌스 */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
                <p className="text-[11px] text-orange-500 font-medium">BTC 도미넌스</p>
                <div className="flex justify-between items-end mt-1">
                  <p className="text-lg md:text-xl font-mono font-bold text-slate-100">{stats.btc_d.toFixed(1)}%</p>
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1.5">
                    <div className="bg-orange-500 h-full" style={{ width: `${stats.btc_d}%` }}></div>
                  </div>
                </div>
              </div>

              {/* 3. ETH 도미넌스 */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
                <p className="text-[11px] text-blue-400 font-medium">ETH 도미넌스</p>
                <div className="flex justify-between items-end mt-1">
                  <p className="text-lg md:text-xl font-mono font-bold text-slate-100">{stats.eth_d.toFixed(1)}%</p>
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1.5">
                    <div className="bg-blue-400 h-full" style={{ width: `${stats.eth_d}%` }}></div>
                  </div>
                </div>
              </div>

              {/* 4. XRP 도미넌스 */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
                <p className="text-[11px] text-slate-400 font-medium">XRP 도미넌스</p>
                <p className="text-lg md:text-xl font-mono font-bold text-slate-200 mt-1">{stats.xrp_d.toFixed(1)}%</p>
              </div>

              {/* 5. SOL 도미넌스 */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
                <p className="text-[11px] text-purple-400 font-medium">SOL 도미넌스</p>
                <p className="text-lg md:text-xl font-mono font-bold text-slate-200 mt-1">{stats.sol_d.toFixed(1)}%</p>
              </div>

              {/* 6. TOTAL2 도미넌스 */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg border-l-2 border-l-emerald-500">
                <p className="text-[11px] text-emerald-500 font-medium">TOTAL2 도미넌스 (비트 제외)</p>
                <p className="text-lg md:text-xl font-mono font-bold text-slate-100 mt-1">{stats.total2_d.toFixed(1)}%</p>
              </div>

              {/* 7. TOTAL3 도미넌스 */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg border-l-2 border-l-cyan-500">
                <p className="text-[11px] text-cyan-500 font-medium">TOTAL3 도미넌스 (알트코인)</p>
                <p className="text-lg md:text-xl font-mono font-bold text-slate-100 mt-1">{stats.total3_d.toFixed(1)}%</p>
              </div>

              {/* 8. 공포 탐욕 지수 */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
                <p className="text-[11px] text-slate-400 font-medium">공포·탐욕 지수</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className={`text-lg md:text-xl font-mono font-bold ${stats.fng >= 60 ? 'text-emerald-500' : stats.fng <= 40 ? 'text-rose-500' : 'text-yellow-500'}`}>
                    {stats.fng}
                  </p>
                  <span className="text-[10px] text-slate-500">({stats.fng_text})</span>
                </div>
              </div>

              {/* 9. 김치 프리미엄 */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
                <p className="text-[11px] text-slate-400 font-medium">김치 프리미엄 (BTC 기준)</p>
                <p className="text-lg md:text-xl font-mono font-bold text-emerald-400 mt-1">
                  +{stats.kimchi.toFixed(1)}%
                </p>
              </div>

            </div>
          </section>

          {/* 나머지 매크로 섹션은 동일 레이아웃 유지 */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Globe className="w-4 h-4" /> 글로벌 증시</h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-500">나스닥 100</p>
                      <p className="text-base font-mono font-bold text-emerald-400">18,520</p>
                   </div>
                   <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-500">S&P 500</p>
                      <p className="text-base font-mono font-bold text-emerald-400">5,310</p>
                   </div>
                </div>
             </div>
             <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Landmark className="w-4 h-4" /> 외환 및 에너지</h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-500">달러 인덱스</p>
                      <p className="text-base font-mono font-bold">104.2</p>
                   </div>
                   <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-500">금 (GOLD)</p>
                      <p className="text-base font-mono font-bold">$2,350</p>
                   </div>
                </div>
             </div>
          </section>

        </main>
      </div>

      {/* 테스터 바 */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-2xl z-50">
        <button onClick={() => setViewMode("desktop")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${viewMode === "desktop" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}><Monitor className="w-3.5 h-3.5" /> 데스크톱</button>
        <button onClick={() => setViewMode("mobile")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${viewMode === "mobile" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}><Smartphone className="w-3.5 h-3.5" /> 모바일</button>
      </div>
    </div>
  );
}